// The Apps Script backend (integrations/apps-script/contact-form/Code.gs), executed in Node against
// simulated Google services: Sheets, Cache, Lock, Properties, UrlFetch (Cloudflare and Microsoft Graph),
// HtmlService and ContentService. This proves the script's own logic. It does not prove that the live
// deployment, the real Sheet, Turnstile or Microsoft 365 behave the same way; the live test does that.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const source = fs.readFileSync(new URL('../integrations/apps-script/contact-form/Code.gs', import.meta.url), 'utf8');
const COLUMNS = ['submissionid', 'firstname', 'lastname', 'workemail', 'company', 'role', 'countryregion', 'whatcanwehelp', 'message', 'createddate', 'submittedfrom', 'referrer', 'utmsource', 'utmmedium', 'utmcampaign', 'utmcontent', 'utmterm', 'status', 'internalemailstatus', 'ackemailstatus', 'leadryzeid'];
const SECRETS = {TURNSTILE_SECRET_KEY: 'test-turnstile-secret', MS365_TENANT_ID: 'tenant-id', MS365_CLIENT_ID: 'client-id', MS365_CLIENT_SECRET: 'test-graph-secret', MS365_SENDER_EMAIL: 'enquiry@innooryze.com', CONTACT_NOTIFICATION_TO: 'kavyasri@innooryze.com'};

function backend({headers = COLUMNS, turnstile = {success: true, action: 'contact_submit', hostname: 'innooryze.com'}, graphToken = 200, mail = () => 202} = {}) {
 const grid = [headers.slice()];
 const formats = [];
 const cache = new Map();
 const fetches = [];
 const logs = [];
 const sheet = {
  getLastColumn: () => grid[0].length,
  getLastRow: () => grid.length,
  getRange(row, col, rows = 1, cols = 1) {
   return {
    getValues: () => Array.from({length: rows}, (_, r) => Array.from({length: cols}, (_, c) => grid[row - 1 + r]?.[col - 1 + c] ?? '')),
    setValues(values) { values.forEach((line, r) => { grid[row - 1 + r] ??= []; line.forEach((v, c) => { grid[row - 1 + r][col - 1 + c] = v; }); }); return this; },
    setValue(value) { grid[row - 1] ??= []; grid[row - 1][col - 1] = value; return this; },
    setNumberFormat(format) { formats.push({row, col, cols, format}); return this; }
   };
  }
 };
 const response = (code, body) => ({getResponseCode: () => code, getContentText: () => typeof body === 'string' ? body : JSON.stringify(body)});
 const context = {
  console: {log: m => logs.push(m), warn: m => logs.push(m), error: m => logs.push(m)},
  JSON, Math, Date, Number, String, Array, Object, RegExp, Error, isFinite, encodeURIComponent,
  PropertiesService: {getScriptProperties: () => ({getProperty: name => SECRETS[name] || null})},
  CacheService: {getScriptCache: () => ({get: k => cache.get(k) ?? null, put: (k, v) => cache.set(k, v)})},
  LockService: {getScriptLock: () => ({waitLock() {}, releaseLock() {}})},
  SpreadsheetApp: {getActiveSpreadsheet: () => ({getSheets: () => [sheet], getSheetByName: () => sheet}), openById: () => null, flush() {}},
  Utilities: {
   formatDate: (d, tz, fmt) => fmt === 'yyyyMMdd' ? d.toISOString().slice(0, 10).replace(/-/g, '') : d.toISOString(),
   getUuid: () => crypto.randomUUID(),
   computeDigest: (alg, text) => [...crypto.createHash('sha256').update(text, 'utf8').digest()].map(b => (b > 127 ? b - 256 : b)),
   DigestAlgorithm: {SHA_256: 'SHA_256'}, Charset: {UTF_8: 'UTF_8'}
  },
  UrlFetchApp: {
   fetch(url, options) {
    fetches.push({url, options});
    if (url.includes('turnstile/v0/siteverify')) return response(200, typeof turnstile === 'function' ? turnstile(options) : turnstile);
    if (url.includes('login.microsoftonline.com')) return graphToken === 200 ? response(200, {access_token: 'graph-access-token', expires_in: 3599}) : response(graphToken, {error: 'invalid_client'});
    if (url.includes('graph.microsoft.com')) {
     const code = mail(JSON.parse(options.payload).message);
     return response(code, code === 202 ? '' : {error: {code: 'ErrorSendAsDenied', message: 'visitor@example.com something'}});
    }
    throw new Error('unexpected fetch ' + url);
   }
  },
  HtmlService: {
   XFrameOptionsMode: {ALLOWALL: 'ALLOWALL', DEFAULT: 'DEFAULT'},
   createHtmlOutput: html => ({html, xfo: 'DEFAULT', setTitle() { return this; }, setXFrameOptionsMode(mode) { this.xfo = mode; return this; }})
  },
  ContentService: {MimeType: {JSON: 'JSON'}, createTextOutput: text => ({text, setMimeType(m) { this.mime = m; return this; }})}
 };
 vm.createContext(context);
 vm.runInContext(source, context);
 const rows = () => grid.slice(1).map(line => Object.fromEntries(headers.map((h, i) => [h, line[i]])));
 const mails = () => fetches.filter(f => f.url.includes('graph.microsoft.com')).map(f => ({url: f.url, ...JSON.parse(f.options.payload).message}));
 return {context, rows, mails, fetches, logs, formats, cache};
}

let counter = 0;
function params(overrides = {}) {
 const now = Date.now();
 return {
  firstname: 'Avery', lastname: 'Example', workemail: 'avery' + (++counter) + '@example.com', company: 'Example Ltd', role: 'Director',
  countryregion: 'Singapore', whatcanwehelp: 'LeadRyze AI', message: 'We would like to explore LeadRyze AI. ' + counter,
  submittedfrom: 'website_contact', referrer: 'https://www.google.com/', utmsource: 'linkedin', utmmedium: 'social', utmcampaign: 'launch', utmcontent: '', utmterm: '',
  website: '', formstartedat: String(now - 45000), formsubmittedat: String(now), turnstiletoken: 'turnstile-token',
  submissionnonce: crypto.randomBytes(18).toString('hex'), parentorigin: 'https://innooryze.com',
  ...overrides
 };
}
const post = (b, p) => b.context.doPost({parameter: p, postData: {type: 'application/x-www-form-urlencoded', contents: ''}});
function posted(output) {
 const m = output.html.match(/var m=(\{.*?\}),o=("[^"]*")/);
 return m ? {message: JSON.parse(m[1]), target: JSON.parse(m[2])} : null;
}

test('doGet keeps the live health response', () => {
 const out = backend().context.doGet();
 assert.deepEqual(JSON.parse(out.text), {ok: true, service: 'innooryze-contact-form', status: 'available'});
});

test('captured enquiry: one row, server-side fields, both emails, safe postMessage to the exact origin', () => {
 const b = backend();
 const p = params();
 const out = post(b, p);
 assert.equal(out.xfo, 'ALLOWALL', 'the response must be frameable by the website');
 const {message, target} = posted(out);
 assert.equal(target, 'https://innooryze.com');
 assert.ok(!out.html.includes("'*'") && !out.html.includes('"*"'), 'never posts to *');
 assert.deepEqual(Object.keys(message).sort(), ['acknowledgementEmailSent', 'captured', 'code', 'internalEmailSent', 'ok', 'submissionId', 'submissionNonce', 'type', 'version']);
 assert.equal(message.type, 'innooryze:contact-result');
 assert.equal(message.captured, true);
 assert.equal(message.acknowledgementEmailSent, true);
 assert.equal(message.internalEmailSent, true);
 assert.equal(message.submissionNonce, p.submissionnonce);
 assert.match(message.submissionId, /^IR-\d{8}-[A-F0-9]{8}$/);
 for (const secretOrPersonal of [p.workemail, p.firstname, p.company, p.message, p.turnstiletoken, ...Object.values(SECRETS), 'graph-access-token'])
  assert.ok(!out.html.includes(secretOrPersonal), 'response leaks ' + secretOrPersonal);

 const rows = b.rows();
 assert.equal(rows.length, 1);
 const row = rows[0];
 assert.equal(row.submissionid, message.submissionId);
 assert.ok(row.createddate instanceof Date && Math.abs(row.createddate - Date.now()) < 5000, 'createddate is set by the server');
 assert.equal(row.submittedfrom, 'website_contact');
 assert.equal(row.status, 'New');
 assert.equal(row.internalemailstatus, 'sent');
 assert.equal(row.ackemailstatus, 'sent');
 assert.equal(row.leadryzeid, '');
 assert.equal(row.workemail, p.workemail);
 assert.equal(row.whatcanwehelp, 'LeadRyze AI');
 assert.equal(row.referrer, 'https://www.google.com/');
 assert.equal(row.utmcampaign, 'launch');

 const [internal, ack] = b.mails();
 assert.match(internal.url, /users\/enquiry%40innooryze\.com\/sendMail$/, 'sent from enquiry@innooryze.com');
 assert.deepEqual(internal.toRecipients, [{emailAddress: {address: 'kavyasri@innooryze.com'}}]);
 assert.equal(internal.replyTo[0].emailAddress.address, p.workemail, 'internal Reply-To is the visitor');
 assert.ok(internal.body.content.includes(message.submissionId));
 assert.match(ack.url, /users\/enquiry%40innooryze\.com\/sendMail$/);
 assert.deepEqual(ack.toRecipients, [{emailAddress: {address: p.workemail}}]);
 assert.ok(!ack.body.content.includes(p.message), 'the acknowledgement never repeats the visitor message');
 const verify = b.fetches.find(f => f.url.includes('siteverify'));
 assert.equal(verify.options.payload.secret, SECRETS.TURNSTILE_SECRET_KEY);
 assert.equal(verify.options.payload.response, 'turnstile-token');
});

test('acknowledgement failure still captures, and says no confirmation was sent', () => {
 const b = backend({mail: m => m.toRecipients[0].emailAddress.address === 'kavyasri@innooryze.com' ? 202 : 403});
 const {message} = posted(post(b, params()));
 assert.equal(message.captured, true);
 assert.equal(message.internalEmailSent, true);
 assert.equal(message.acknowledgementEmailSent, false);
 assert.equal(b.rows()[0].ackemailstatus, 'failed');
 assert.equal(b.rows()[0].internalemailstatus, 'sent');
 assert.ok(!b.logs.join(' ').includes('visitor@example.com'), 'provider error text is not logged');
});

test('Microsoft Graph unavailable: the enquiry is still captured with both email statuses failed', () => {
 const b = backend({graphToken: 401});
 const {message} = posted(post(b, params()));
 assert.equal(message.captured, true);
 assert.equal(message.internalEmailSent, false);
 assert.equal(message.acknowledgementEmailSent, false);
 assert.deepEqual([b.rows()[0].internalemailstatus, b.rows()[0].ackemailstatus], ['failed', 'failed']);
});

test('honeypot: rejected before Turnstile, nothing written', () => {
 const b = backend();
 const {message} = posted(post(b, params({website: 'https://spam.example'})));
 assert.deepEqual([message.captured, message.code], [false, 'rejected']);
 assert.equal(b.rows().length, 0);
 assert.equal(b.fetches.length, 0);
});

test('timing: instant submissions are refused; a skewed visitor clock is not', () => {
 const b = backend();
 const now = Date.now();
 assert.equal(posted(post(b, params({formstartedat: String(now - 800), formsubmittedat: String(now)}))).message.code, 'rejected');
 assert.equal(posted(post(b, params({formstartedat: 'abc'}))).message.code, 'rejected');
 // Visitor clock 10 minutes fast: elapsed time is still measured on one clock, so this is accepted.
 const fast = now + 600000;
 assert.equal(posted(post(b, params({formstartedat: String(fast - 30000), formsubmittedat: String(fast)}))).message.captured, true);
 assert.equal(b.rows().length, 1);
});

test('missing fields and invalid email are refused server-side', () => {
 const b = backend();
 for (const bad of [{firstname: ''}, {message: '   '}, {workemail: 'not-an-email'}, {message: 'x'.repeat(4001)}, {company: 'x'.repeat(121)}])
  assert.equal(posted(post(b, params(bad))).message.code, 'invalid', JSON.stringify(bad).slice(0, 40));
 assert.equal(b.rows().length, 0);
});

test('Turnstile: failure, wrong action and wrong hostname are all refused', () => {
 for (const turnstile of [{success: false, 'error-codes': ['invalid-input-response']}, {success: true, action: 'other', hostname: 'innooryze.com'}, {success: true, action: 'contact_submit', hostname: 'evil.example'}]) {
  const b = backend({turnstile});
  const {message} = posted(post(b, params()));
  assert.deepEqual([message.captured, message.code], [false, 'verification_failed']);
  assert.equal(b.rows().length, 0);
 }
 const noToken = backend();
 assert.equal(posted(post(noToken, params({turnstiletoken: ''}))).message.code, 'verification_failed');
 // The token hostname must match the page that asked, not merely be on the list.
 const www = backend({turnstile: {success: true, action: 'contact_submit', hostname: 'www.innooryze.com'}});
 assert.equal(posted(post(www, params())).message.code, 'verification_failed');
 assert.equal(posted(post(www, params({parentorigin: 'https://www.innooryze.com'}))).message.captured, true);
});

test('an unlisted parent origin gets no message at all and nothing is written', () => {
 for (const parentorigin of ['https://evil.example', '*', 'https://innooryze.com.evil.example', 'http://innooryze.com', '']) {
  const b = backend();
  const out = post(b, params({parentorigin}));
  assert.equal(posted(out), null, parentorigin);
  assert.ok(!out.html.includes('postMessage'));
  if (parentorigin) assert.ok(!out.html.includes(parentorigin));
  assert.equal(b.rows().length, 0);
 }
});

test('a missing or malformed nonce gets no message; the nonce cannot inject script', () => {
 const b = backend();
 for (const submissionnonce of ['', 'short', '</script><script>alert(1)</script>xxxxxxxx']) {
  const out = post(b, params({submissionnonce}));
  assert.equal(posted(out), null);
  assert.ok(!out.html.includes('alert(1)'));
 }
 assert.equal(b.rows().length, 0);
});

test('replaying the same submission returns the original result without a second row', () => {
 const b = backend();
 const p = params();
 const first = posted(post(b, p)).message;
 const second = posted(post(b, p)).message;
 assert.equal(second.submissionId, first.submissionId);
 assert.equal(b.rows().length, 1);
 assert.equal(b.mails().length, 2);
});

test('the same enquiry resubmitted with a new nonce is a duplicate, not a second row', () => {
 const b = backend();
 const p = params();
 const first = posted(post(b, p)).message;
 const again = posted(post(b, {...p, submissionnonce: crypto.randomBytes(18).toString('hex')})).message;
 assert.equal(again.captured, true);
 assert.equal(again.code, 'duplicate');
 assert.equal(again.submissionId, first.submissionId);
 assert.equal(b.rows().length, 1);
});

test('email throttling: three enquiries per work email per hour', () => {
 const b = backend();
 const workemail = 'busy@example.com';
 const codes = [1, 2, 3, 4].map(i => posted(post(b, params({workemail, message: 'Distinct message ' + i}))).message.code);
 assert.deepEqual(codes, ['captured', 'captured', 'captured', 'rate_limited']);
 assert.equal(b.rows().length, 3);
});

test('formula injection is neutralised and cells are written as text', () => {
 const b = backend();
 post(b, params({firstname: '=HYPERLINK("https://evil.example","x")', company: '+cmd', role: '@SUM(A1)', message: '-2+3 is a formula'}));
 const row = b.rows()[0];
 assert.equal(row.firstname, '\'=HYPERLINK("https://evil.example","x")');
 assert.equal(row.company, "'+cmd");
 assert.equal(row.role, "'@SUM(A1)");
 assert.equal(row.message, "'-2+3 is a formula");
 assert.ok(b.formats.some(f => f.format === '@'), 'row formatted as plain text');
});

test('browser metadata is not trusted blindly', () => {
 const b = backend();
 post(b, params({submittedfrom: 'admin_import', referrer: 'javascript:alert(1)', utmsource: 'x'.repeat(400), leadryzeid: 'LR-999', status: 'Won', createddate: '2001-01-01'}));
 const row = b.rows()[0];
 assert.equal(row.submittedfrom, 'website_contact');
 assert.equal(row.referrer, '');
 assert.equal(row.utmsource.length, 150);
 assert.equal(row.leadryzeid, '');
 assert.equal(row.status, 'New');
 assert.ok(row.createddate instanceof Date && row.createddate.getFullYear() > 2020);
});

test('columns are mapped by header name, and a missing column fails safely', () => {
 const reordered = backend({headers: [...COLUMNS].reverse()});
 const p = params();
 post(reordered, p);
 assert.equal(reordered.rows()[0].workemail, p.workemail);
 assert.equal(reordered.rows()[0].status, 'New');

 const broken = backend({headers: COLUMNS.filter(c => c !== 'utmterm')});
 const {message} = posted(post(broken, params()));
 assert.deepEqual([message.captured, message.code], [false, 'server_error']);
 assert.equal(broken.mails().length, 0);
});

test('JSON requests remain supported for future API use', () => {
 const b = backend();
 const p = params();
 const out = b.context.doPost({parameter: {}, postData: {type: 'application/json', contents: JSON.stringify(p)}});
 const body = JSON.parse(out.text);
 assert.equal(body.captured, true);
 assert.equal(body.submissionNonce, p.submissionnonce);
 assert.equal(b.rows().length, 1);
});

test('no secret value appears anywhere in the script source', () => {
 assert.ok(!/0x4AAAAAA[A-Za-z0-9_-]{10,}/.test(source.replace('0x4AAAAAAFDWHGP2v8v-q-xS', '')), 'no Turnstile keys');
 assert.ok(!/client_secret\s*[:=]\s*['"][^'"]+['"]/.test(source), 'no literal client secret');
 for (const name of Object.keys(SECRETS)) assert.ok(source.includes("property_('" + name + "')"), name + ' is read from Script Properties');
});
