/**
 * InnooRyze website contact form: Google Apps Script web app (V8 runtime).
 *
 * The source of truth is integrations/apps-script/contact-form/Code.gs in the website repository. Paste the
 * whole file into the Apps Script project and deploy a NEW VERSION of the existing web-app deployment, so the
 * public /exec URL stays the same. See docs/CONTACT_INTEGRATION.md.
 *
 * NO SECRETS IN THIS FILE. They are read from Project Settings > Script Properties:
 *   TURNSTILE_SECRET_KEY   Cloudflare Turnstile secret for the production widget
 *   MS365_TENANT_ID        Microsoft Entra tenant ID
 *   MS365_CLIENT_ID        App registration (client) ID with Mail.Send application permission
 *   MS365_CLIENT_SECRET    App registration client secret
 *   MS365_SENDER_EMAIL     Mailbox the emails are sent from (and the acknowledgement Reply-To)
 *   CONTACT_NOTIFICATION_TO  Recipient of the internal enquiry notification
 * Optional:
 *   SHEET_ID               Spreadsheet ID. Omit when the script is bound to the enquiry spreadsheet.
 *   SHEET_NAME             Tab name. Omit to use the first tab whose header row contains "submissionid".
 * Written by the script itself (do not edit):
 *   CONTACT_EMAIL_WORKER_LEASE  Expiry time of the running email worker, so two runs never overlap.
 *
 * CAPTURE FIRST, INTEGRATE SECOND.
 *   doPost()  validate → Turnstile → duplicate/rate checks → Sheet row (emails "pending") → respond.
 *             The visitor's wait ends here. Nothing in this path talks to Microsoft.
 *   processPendingContactEmails()  runs from a time-driven trigger (every minute), picks up "pending"
 *             email statuses and sends them through Microsoft Graph, marking each "sent" or "failed".
 * The Sheet row is the durable record: an enquiry is captured once its row is written, whatever happens to
 * the emails or to any later integration.
 */

var CONFIG = {
  // Exact parent origins allowed to receive results. Never "*", never taken from the request unchecked.
  ALLOWED_PARENT_ORIGINS: [
    'https://innooryze.com',
    'https://www.innooryze.com',
    'https://innooryze-website.vercel.app'
  ],
  TURNSTILE_ACTION: 'contact_submit',
  TURNSTILE_HOSTNAMES: [
    'innooryze.com',
    'www.innooryze.com',
    'innooryze-website.vercel.app'
  ],
  // submittedfrom values this endpoint accepts. Future channels (website_chatbot, campaign_landing_page,
  // event_lead) get their own ingestion path; see docs/CONTACT_INTEGRATION.md.
  SOURCES: ['website_contact'],
  DEFAULT_SOURCE: 'website_contact',
  INITIAL_STATUS: 'New',
  // Anti-automation.
  MIN_FILL_MS: 3000,                 // faster than this is not a person typing an enquiry
  MAX_FORM_AGE_MS: 24 * 60 * 60 * 1000,
  CLOCK_TOLERANCE_MS: 24 * 60 * 60 * 1000,
  DUPLICATE_WINDOW_S: 1800,          // same email + same message within 30 minutes = one enquiry
  NONCE_TTL_S: 21600,                // a replayed submission nonce returns the original result
  THROTTLE_PER_EMAIL: 3,             // new enquiries per work email per window
  THROTTLE_WINDOW_S: 3600,
  RESULT_TYPE: 'innooryze:contact-result'
};

// Background email worker.
var WORKER = {
  BATCH_SIZE: 10,                    // rows per run; the trigger runs every minute
  MAX_RUNTIME_MS: 3.5 * 60 * 1000,   // stop starting new rows after this; Apps Script's own limit is 6 minutes
  LEASE_MS: 7 * 60 * 1000,           // longer than any possible run, so a live run's lease never expires under it
  LEASE_PROPERTY: 'CONTACT_EMAIL_WORKER_LEASE'
};

var STATUS = {PENDING: 'pending', SENT: 'sent', FAILED: 'failed'};

var FIELDS = {
  firstname:     {required: true,  max: 120},
  lastname:      {required: true,  max: 120},
  workemail:     {required: true,  max: 254},
  company:       {required: true,  max: 120},
  role:          {required: false, max: 120},
  countryregion: {required: true,  max: 120},
  whatcanwehelp: {required: true,  max: 120},
  message:       {required: true,  max: 4000}
};

var COLUMNS = ['submissionid', 'firstname', 'lastname', 'workemail', 'company', 'role', 'countryregion',
  'whatcanwehelp', 'message', 'createddate', 'submittedfrom', 'referrer', 'utmsource', 'utmmedium',
  'utmcampaign', 'utmcontent', 'utmterm', 'status', 'internalemailstatus', 'ackemailstatus', 'leadryzeid'];

var EMAIL_PATTERN = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/;
var NONCE_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

// ---------------------------------------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------------------------------------

function doGet() {
  return jsonOutput_({ok: true, service: 'innooryze-contact-form', status: 'available'});
}

function doPost(e) {
  var postData = (e && e.postData) || {};
  var isJson = /application\/json/i.test(String(postData.type || ''));
  var params = isJson ? parseJsonBody_(postData.contents) : ((e && e.parameter) || {});
  var origin = allowedOrigin_(params.parentorigin);
  var nonce = validNonce_(params.submissionnonce);
  var result;
  try {
    result = handleSubmission_(params, origin, nonce);
  } catch (err) {
    console.error('contact: unhandled error ' + describeError_(err));
    result = failure_('server_error');
  }
  var message = resultMessage_(result, nonce);
  return isJson ? jsonOutput_(message) : frameOutput_(message, origin);
}

// ---------------------------------------------------------------------------------------------------------
// Submission pipeline (synchronous: the visitor waits for exactly this, and nothing else)
// ---------------------------------------------------------------------------------------------------------

function handleSubmission_(params, origin, nonce) {
  if (!origin) { console.warn('contact: rejected parent origin'); return failure_('origin_rejected'); }
  if (!nonce) return failure_('invalid_request');

  var cache = CacheService.getScriptCache();
  var replay = cache.get('nonce:' + nonce);
  if (replay) return JSON.parse(replay);

  var remember = function (result) {
    cache.put('nonce:' + nonce, JSON.stringify(result), CONFIG.NONCE_TTL_S);
    return result;
  };

  // Honeypot: a real visitor never sees or fills "website".
  if (clean_(params.website, 500)) { console.warn('contact: honeypot filled'); return remember(failure_('rejected')); }

  // Timing. Both timestamps come from the visitor's clock, so their difference is immune to clock skew; the
  // submit time is still checked loosely against the server clock so a stale or forged pair is refused.
  var started = Number(params.formstartedat);
  var submitted = Number(params.formsubmittedat) || Date.now();
  var elapsed = submitted - started;
  if (!isFinite(started) || !isFinite(elapsed) || elapsed < CONFIG.MIN_FILL_MS || elapsed > CONFIG.MAX_FORM_AGE_MS ||
      Math.abs(Date.now() - submitted) > CONFIG.CLOCK_TOLERANCE_MS) {
    console.warn('contact: timing rejected');
    return remember(failure_('rejected'));
  }

  var normalized = normalizeLead_(params);
  if (!normalized) return remember(failure_('invalid'));

  var verification = verifyTurnstile_(params.turnstiletoken, hostOf_(origin));
  if (!verification.ok) {
    console.warn('contact: turnstile failed (' + verification.reason + ')');
    // Not remembered against the nonce: the visitor retries with a new token and a new nonce anyway.
    return failure_('verification_failed');
  }

  var lead = normalized.lead;
  var fingerprint = digest_(lead.workemail.toLowerCase() + '|' + lead.message.replace(/\s+/g, ' ').toLowerCase());
  var throttleKey = 'rate:' + digest_(lead.workemail.toLowerCase());
  var result;

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var duplicate = cache.get('dup:' + fingerprint);
    if (duplicate) {
      var original = JSON.parse(duplicate);
      original.code = 'duplicate';
      console.log('contact: duplicate of ' + original.submissionId);
      return remember(original);
    }
    var count = Number(cache.get(throttleKey) || 0);
    if (count >= CONFIG.THROTTLE_PER_EMAIL) { console.warn('contact: throttled'); return remember(failure_('rate_limited')); }

    var saved = saveLead_(normalized);
    result = capturedResult_(saved.submissionId);
    cache.put(throttleKey, String(count + 1), CONFIG.THROTTLE_WINDOW_S);
    cache.put('dup:' + fingerprint, JSON.stringify(result), CONFIG.DUPLICATE_WINDOW_S);
  } finally {
    lock.releaseLock();
  }

  console.log('contact: captured ' + result.submissionId + ' (emails queued)');
  return remember(result);
}

// Captured means the row exists. Both emails are queued ("pending") for the background worker; nothing has
// been sent yet, so the *Sent flags are false and the website must not claim that an email was delivered.
function capturedResult_(submissionId) {
  return {ok: true, captured: true, submissionId: submissionId, internalEmailSent: false,
    acknowledgementEmailSent: false, acknowledgementQueued: true, code: 'captured'};
}

function failure_(code) {
  return {ok: false, captured: false, submissionId: '', internalEmailSent: false, acknowledgementEmailSent: false,
    acknowledgementQueued: false, code: code};
}

// Only these keys ever leave the server. No names, emails, message text, tokens or provider errors.
function resultMessage_(result, nonce) {
  return {
    type: CONFIG.RESULT_TYPE,
    version: 1,
    ok: result.ok === true,
    captured: result.captured === true,
    submissionId: result.captured ? String(result.submissionId || '') : '',
    acknowledgementEmailSent: result.acknowledgementEmailSent === true,
    acknowledgementQueued: result.captured === true && result.acknowledgementQueued === true,
    internalEmailSent: result.internalEmailSent === true,
    code: String(result.code || 'server_error'),
    submissionNonce: nonce || ''
  };
}

// ---------------------------------------------------------------------------------------------------------
// Normalised lead
//
// Every channel produces the same shape, independent of where it is stored:
//   {lead: {firstname, lastname, workemail, company, role, countryregion, whatcanwehelp, message},
//    source: {submittedfrom},
//    attribution: {referrer, utmsource, utmmedium, utmcampaign, utmcontent, utmterm}}
// The system fields (submissionid, createddate, status) are assigned when the lead is saved. The Sheet
// repository below is the only code that knows about columns; the email processor and any future LeadRyze
// adapter consume the normalised shape.
// ---------------------------------------------------------------------------------------------------------

function normalizeLead_(params) {
  var lead = {};
  for (var key in FIELDS) {
    var rule = FIELDS[key];
    var raw = params[key] == null ? '' : String(params[key]);
    var value = key === 'message' ? raw.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
      : raw.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
    if (rule.required && !value) return null;
    if (value.length > rule.max) return null;
    lead[key] = value;
  }
  if (!EMAIL_PATTERN.test(lead.workemail)) return null;
  var submittedfrom = clean_(params.submittedfrom, 60);
  return {
    lead: lead,
    source: {submittedfrom: CONFIG.SOURCES.indexOf(submittedfrom) > -1 ? submittedfrom : CONFIG.DEFAULT_SOURCE},
    attribution: {
      referrer: safeUrl_(params.referrer),
      utmsource: clean_(params.utmsource, 150),
      utmmedium: clean_(params.utmmedium, 150),
      utmcampaign: clean_(params.utmcampaign, 150),
      utmcontent: clean_(params.utmcontent, 150),
      utmterm: clean_(params.utmterm, 150)
    }
  };
}

function clean_(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function safeUrl_(value) {
  var url = clean_(value, 500);
  return /^https?:\/\/[^\s]+$/i.test(url) ? url : '';
}

function allowedOrigin_(value) {
  var origin = String(value || '');
  return CONFIG.ALLOWED_PARENT_ORIGINS.indexOf(origin) > -1 ? origin : '';
}

function validNonce_(value) {
  var nonce = String(value || '');
  return NONCE_PATTERN.test(nonce) ? nonce : '';
}

function hostOf_(origin) {
  return origin.replace(/^https:\/\//, '');
}

// ---------------------------------------------------------------------------------------------------------
// Cloudflare Turnstile
// ---------------------------------------------------------------------------------------------------------

function verifyTurnstile_(token, expectedHost) {
  var response = String(token || '');
  if (!response || response.length > 2048) return {ok: false, reason: 'missing-token'};
  var secret = property_('TURNSTILE_SECRET_KEY');
  var reply = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'post',
    payload: {secret: secret, response: response},
    muteHttpExceptions: true
  });
  if (reply.getResponseCode() !== 200) return {ok: false, reason: 'http-' + reply.getResponseCode()};
  var body = JSON.parse(reply.getContentText());
  if (body.success !== true) return {ok: false, reason: (body['error-codes'] || []).join(',') || 'unsuccessful'};
  if (body.action !== CONFIG.TURNSTILE_ACTION) return {ok: false, reason: 'action-mismatch'};
  if (CONFIG.TURNSTILE_HOSTNAMES.indexOf(body.hostname) < 0 || body.hostname !== expectedHost) return {ok: false, reason: 'hostname-mismatch'};
  return {ok: true};
}

// ---------------------------------------------------------------------------------------------------------
// Sheet repository: the only code that knows about spreadsheet columns
// ---------------------------------------------------------------------------------------------------------

function enquirySheet_() {
  var id = optionalProperty_('SHEET_ID');
  var book = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw new Error('No spreadsheet: set SHEET_ID or bind the script to the enquiry spreadsheet');
  var name = optionalProperty_('SHEET_NAME');
  if (name) {
    var named = book.getSheetByName(name);
    if (!named) throw new Error('SHEET_NAME tab not found');
    return named;
  }
  var sheets = book.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getLastColumn() && headerIndex_(sheets[i]).submissionid !== undefined) return sheets[i];
  }
  return sheets[0];
}

// Columns are located by header name, so the Sheet's column order can change without breaking anything.
function headerIndex_(sheet) {
  var width = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, width).getValues()[0];
  var index = {};
  for (var i = 0; i < headers.length; i++) index[String(headers[i]).trim().toLowerCase()] = i;
  return index;
}

function requireColumns_(index) {
  var missing = COLUMNS.filter(function (c) { return index[c] === undefined; });
  if (missing.length) throw new Error('Sheet is missing columns: ' + missing.join(', '));
}

// Sheets would evaluate a cell that starts with one of these as a formula. A leading apostrophe forces text.
function sheetSafe_(value) {
  var text = String(value == null ? '' : value);
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

// The inverse, for values read back from the Sheet.
function sheetText_(value) {
  var text = value instanceof Date ? value.toISOString() : String(value == null ? '' : value);
  return /^'[=+\-@\t\r]/.test(text) ? text.slice(1) : text;
}

// Called under the script lock. One flush, so the next submission's getLastRow() sees this row; the email
// statuses start as pending and are the worker's queue.
function saveLead_(normalized) {
  var sheet = enquirySheet_();
  var index = headerIndex_(sheet);
  requireColumns_(index);

  var width = sheet.getLastColumn();
  var created = new Date();
  var submissionId = 'IR-' + Utilities.formatDate(created, 'Etc/UTC', 'yyyyMMdd') + '-' +
    Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  var lead = normalized.lead, attribution = normalized.attribution;
  var record = {
    submissionid: submissionId,
    firstname: lead.firstname, lastname: lead.lastname, workemail: lead.workemail, company: lead.company,
    role: lead.role, countryregion: lead.countryregion, whatcanwehelp: lead.whatcanwehelp, message: lead.message,
    createddate: created,
    submittedfrom: normalized.source.submittedfrom,
    referrer: attribution.referrer, utmsource: attribution.utmsource, utmmedium: attribution.utmmedium,
    utmcampaign: attribution.utmcampaign, utmcontent: attribution.utmcontent, utmterm: attribution.utmterm,
    status: CONFIG.INITIAL_STATUS,
    internalemailstatus: STATUS.PENDING,
    ackemailstatus: STATUS.PENDING,
    leadryzeid: ''                    // reserved for the future LeadRyze CRM adapter; never set here
  };
  var row = [];
  for (var i = 0; i < width; i++) row.push('');
  COLUMNS.forEach(function (column) {
    row[index[column]] = column === 'createddate' ? record[column] : sheetSafe_(record[column]);
  });

  var rowNumber = sheet.getLastRow() + 1;
  var range = sheet.getRange(rowNumber, 1, 1, width);
  // Plain-text format stops Sheets turning visitor text into numbers or dates; the timestamp keeps a date format.
  range.setNumberFormat('@');
  sheet.getRange(rowNumber, index.createddate + 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  range.setValues([row]);
  SpreadsheetApp.flush();
  return {submissionId: submissionId, created: created};
}

// Rebuilds the normalised lead (plus system fields) from a stored row.
function rowToLead_(values, index) {
  var get = function (column) { return sheetText_(values[index[column]]); };
  var lead = {};
  for (var key in FIELDS) lead[key] = get(key);
  return {
    lead: lead,
    source: {submittedfrom: get('submittedfrom')},
    attribution: {referrer: get('referrer'), utmsource: get('utmsource'), utmmedium: get('utmmedium'),
      utmcampaign: get('utmcampaign'), utmcontent: get('utmcontent'), utmterm: get('utmterm')},
    system: {submissionid: get('submissionid'),
      createddate: values[index.createddate] instanceof Date ? values[index.createddate] : new Date(get('createddate')),
      status: get('status'), leadryzeid: get('leadryzeid')}
  };
}

// Writes one email status, re-locating the row by submission ID if someone sorted or edited the Sheet since
// it was read, so a status can never land on another person's enquiry.
function setEmailStatus_(sheet, index, rowNumber, submissionId, column, value) {
  var idCell = String(sheet.getRange(rowNumber, index.submissionid + 1).getValues()[0][0]);
  if (idCell !== submissionId) {
    var ids = sheet.getRange(2, index.submissionid + 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
    rowNumber = 0;
    for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === submissionId) { rowNumber = i + 2; break; }
    if (!rowNumber) { console.warn('contact-worker: ' + submissionId + ' no longer in the Sheet'); return; }
  }
  sheet.getRange(rowNumber, index[column] + 1).setValue(value);
}

// ---------------------------------------------------------------------------------------------------------
// Background email worker (time-driven trigger, every minute)
// ---------------------------------------------------------------------------------------------------------

function processPendingContactEmails() {
  var started = Date.now();
  if (!acquireWorkerLease_()) { console.log('contact-worker: previous run still active, skipping'); return {skipped: true}; }
  var summary = {skipped: false, rows: 0, sent: 0, failed: 0};
  try {
    var sheet = enquirySheet_();
    var index = headerIndex_(sheet);
    requireColumns_(index);
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return summary;
    var count = lastRow - 1;
    var internal = sheet.getRange(2, index.internalemailstatus + 1, count, 1).getValues();
    var ack = sheet.getRange(2, index.ackemailstatus + 1, count, 1).getValues();
    var width = sheet.getLastColumn();
    var isPending = function (value) { return String(value).trim().toLowerCase() === STATUS.PENDING; };
    var seen = {};

    for (var i = 0; i < count && summary.rows < WORKER.BATCH_SIZE; i++) {
      // A cheap first pass over the two status columns, then the row itself is re-read and its own statuses
      // decide, so a Sheet sorted or edited during the run can never cause an email to be sent twice.
      if (!isPending(internal[i][0]) && !isPending(ack[i][0])) continue;
      if (Date.now() - started > WORKER.MAX_RUNTIME_MS) break;

      var rowNumber = i + 2;
      var values = sheet.getRange(rowNumber, 1, 1, width).getValues()[0];
      var normalized = rowToLead_(values, index);
      var id = normalized.system.submissionid;
      var internalPending = isPending(values[index.internalemailstatus]);
      var ackPending = isPending(values[index.ackemailstatus]);
      if (!id || seen[id] || (!internalPending && !ackPending)) continue;
      seen[id] = true;
      summary.rows++;

      // Each email is attempted and recorded on its own: one failing never blocks or repeats the other.
      if (internalPending) {
        var internalOk = sendSafely_('internal', id, function () { sendInternalEmail_(normalized); });
        setEmailStatus_(sheet, index, rowNumber, id, 'internalemailstatus', internalOk ? STATUS.SENT : STATUS.FAILED);
        summary[internalOk ? 'sent' : 'failed']++;
      }
      if (ackPending) {
        var ackOk = sendSafely_('acknowledgement', id, function () { sendAcknowledgementEmail_(normalized); });
        setEmailStatus_(sheet, index, rowNumber, id, 'ackemailstatus', ackOk ? STATUS.SENT : STATUS.FAILED);
        summary[ackOk ? 'sent' : 'failed']++;
      }
      // Recorded before the next row, so a run cut short never re-sends what it already sent.
      SpreadsheetApp.flush();

      // FUTURE: syncLeadToLeadRyze(normalized) plugs in here, as its own step with its own status: only for
      // rows whose leadryzeid is blank, writing the returned ID to leadryzeid, and leaving the row untouched on
      // failure so the next run retries. A LeadRyze outage must never affect capture or these emails.
    }
    console.log('contact-worker: rows=' + summary.rows + ' sent=' + summary.sent + ' failed=' + summary.failed);
    return summary;
  } finally {
    releaseWorkerLease_();
  }
}

// A lease in Script Properties rather than holding the script lock for the whole run: the script lock is
// held only for a moment here, so a submission waiting for it is never delayed by email sending.
function acquireWorkerLease_() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return false;
  try {
    var properties = PropertiesService.getScriptProperties();
    var until = Number(properties.getProperty(WORKER.LEASE_PROPERTY) || 0);
    if (until > Date.now()) return false;
    properties.setProperty(WORKER.LEASE_PROPERTY, String(Date.now() + WORKER.LEASE_MS));
    return true;
  } finally {
    lock.releaseLock();
  }
}

function releaseWorkerLease_() {
  PropertiesService.getScriptProperties().deleteProperty(WORKER.LEASE_PROPERTY);
}

// ---------------------------------------------------------------------------------------------------------
// Email notification processor (Microsoft Graph, application permission Mail.Send, client credentials)
// ---------------------------------------------------------------------------------------------------------

function sendSafely_(label, submissionId, send) {
  try {
    send();
    return true;
  } catch (err) {
    console.error('contact-worker: ' + label + ' email for ' + submissionId + ' failed ' + describeError_(err));
    return false;
  }
}

function graphToken_() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('graph:token');
  if (cached) return cached;
  var tenant = property_('MS365_TENANT_ID');
  var reply = UrlFetchApp.fetch('https://login.microsoftonline.com/' + encodeURIComponent(tenant) + '/oauth2/v2.0/token', {
    method: 'post',
    payload: {
      client_id: property_('MS365_CLIENT_ID'),
      client_secret: property_('MS365_CLIENT_SECRET'),
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials'
    },
    muteHttpExceptions: true
  });
  if (reply.getResponseCode() !== 200) throw new Error('token request returned ' + reply.getResponseCode());
  var body = JSON.parse(reply.getContentText());
  if (!body.access_token) throw new Error('token response had no access_token');
  cache.put('graph:token', body.access_token, Math.max(60, Math.min(21600, Number(body.expires_in || 3600) - 300)));
  return body.access_token;
}

function sendMail_(message) {
  var reply = UrlFetchApp.fetch('https://graph.microsoft.com/v1.0/users/' + encodeURIComponent(property_('MS365_SENDER_EMAIL')) + '/sendMail', {
    method: 'post',
    contentType: 'application/json',
    headers: {Authorization: 'Bearer ' + graphToken_()},
    payload: JSON.stringify({message: message, saveToSentItems: true}),
    muteHttpExceptions: true
  });
  if (reply.getResponseCode() !== 202) {
    var code = '';
    try { code = (JSON.parse(reply.getContentText()).error || {}).code || ''; } catch (ignored) {}
    throw new Error('sendMail returned ' + reply.getResponseCode() + (code ? ' ' + code : ''));
  }
}

function sendInternalEmail_(normalized) {
  var lead = normalized.lead, attribution = normalized.attribution, system = normalized.system;
  var rows = [
    ['Reference', system.submissionid],
    ['Received', Utilities.formatDate(system.createddate, 'Asia/Kolkata', "d MMM yyyy, HH:mm 'IST'")],
    ['Name', lead.firstname + ' ' + lead.lastname],
    ['Work email', lead.workemail],
    ['Company', lead.company],
    ['Role', lead.role || 'Not provided'],
    ['Country / Region', lead.countryregion],
    ['What can we help with?', lead.whatcanwehelp],
    ['Source', normalized.source.submittedfrom],
    ['Referrer', attribution.referrer || 'None'],
    ['UTM', [attribution.utmsource, attribution.utmmedium, attribution.utmcampaign, attribution.utmcontent, attribution.utmterm].filter(String).join(' / ') || 'None']
  ];
  var table = rows.map(function (r) {
    return '<tr><th align="left" style="padding:6px 16px 6px 0;color:#4e7f8d;font-weight:600;vertical-align:top">' + html_(r[0]) +
      '</th><td style="padding:6px 0;color:#11191b">' + html_(r[1]) + '</td></tr>';
  }).join('');
  var body = '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#11191b">' +
    '<p style="margin:0 0 16px">A new enquiry arrived through the innooryze.com contact form.</p>' +
    '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">' + table + '</table>' +
    '<p style="margin:20px 0 6px;color:#4e7f8d;font-weight:600">Message</p>' +
    '<div style="white-space:pre-wrap;border-left:3px solid #00d4df;padding:4px 0 4px 14px">' + html_(lead.message) + '</div>' +
    '<p style="margin:20px 0 0;color:#6e8996;font-size:12px">Reply to this email to answer ' + html_(lead.firstname) +
    ' directly. The enquiry is recorded in the enquiry Sheet under ' + html_(system.submissionid) + '.</p></div>';
  sendMail_({
    subject: oneLine_('New website enquiry: ' + lead.whatcanwehelp + ' | ' + lead.company, 200),
    body: {contentType: 'HTML', content: body},
    toRecipients: [{emailAddress: {address: property_('CONTACT_NOTIFICATION_TO')}}],
    replyTo: [{emailAddress: {address: lead.workemail, name: oneLine_(lead.firstname + ' ' + lead.lastname, 120)}}]
  });
}

// Deliberately does not repeat the visitor's message: an acknowledgement must not become a way to send
// arbitrary text to an arbitrary address from the enquiry mailbox.
function sendAcknowledgementEmail_(normalized) {
  var lead = normalized.lead;
  var name = oneLine_(lead.firstname, 60);
  var body = '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#11191b;max-width:560px">' +
    '<p style="margin:0 0 16px">Hi ' + html_(name) + ',</p>' +
    '<p style="margin:0 0 16px">Thank you for contacting InnooRyze. Your message is with us.</p>' +
    '<p style="margin:0 0 16px">We’ll review your enquiry and get back to you shortly.</p>' +
    '<p style="margin:0 0 16px;color:#4e7f8d">Your reference: ' + html_(normalized.system.submissionid) + '</p>' +
    '<p style="margin:0 0 24px">If you would like to add anything, simply reply to this email.</p>' +
    '<p style="margin:0">InnooRyze<br><a href="https://innooryze.com" style="color:#008699">innooryze.com</a></p></div>';
  sendMail_({
    subject: 'We’ve received your enquiry | InnooRyze',
    body: {contentType: 'HTML', content: body},
    toRecipients: [{emailAddress: {address: lead.workemail}}],
    replyTo: [{emailAddress: {address: property_('MS365_SENDER_EMAIL'), name: 'InnooRyze'}}]
  });
}

// ---------------------------------------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------------------------------------

// The iframe response. HtmlService runs this script in Google's sandbox frame, which sits inside the
// script.google.com page our hidden iframe loaded, so the website is window.top rather than window.parent.
// Both are addressed; the browser delivers only to the window whose origin equals the validated target,
// and nothing is ever posted to "*". Without a validated origin and nonce the page posts nothing at all.
function frameOutput_(message, origin) {
  var script = '';
  if (origin && message.submissionNonce) {
    script = '<script>(function(){var m=' + scriptJson_(message) + ',o=' + scriptJson_(origin) + ',seen=[];' +
      '[window.parent,window.top].forEach(function(w){if(!w||w===window||seen.indexOf(w)>-1)return;seen.push(w);' +
      'try{w.postMessage(m,o);}catch(e){}});})();</script>';
  }
  return HtmlService.createHtmlOutput('<!doctype html><html><head><meta charset="utf-8"><title>InnooRyze</title></head><body>' + script + '</body></html>')
    .setTitle('InnooRyze')
    // Required: without ALLOWALL, Google refuses to render web-app output inside another site's iframe.
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function jsonOutput_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function parseJsonBody_(text) {
  try {
    var value = JSON.parse(text || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch (err) {
    return {};
  }
}

// ---------------------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------------------

function property_(name) {
  var value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) throw new Error('Script Property ' + name + ' is not set');
  return value;
}

function optionalProperty_(name) {
  return PropertiesService.getScriptProperties().getProperty(name) || '';
}

function digest_(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ((b + 256) % 256).toString(16).padStart(2, '0'); }).join('');
}

function html_(value) {
  return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function oneLine_(value, max) {
  return String(value == null ? '' : value).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}

function scriptJson_(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

// Error text for the execution log: the message only, never request data or provider response bodies.
function describeError_(err) {
  return String((err && err.message) || err).slice(0, 300);
}
