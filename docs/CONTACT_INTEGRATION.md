# Contact form integration

The Contact page (`/contact`) sends enquiries to a Google Apps Script web app. The script checks Cloudflare Turnstile, records each enquiry in the enquiry Google Sheet and answers the website at once. A background worker then sends the two transactional emails through Microsoft Graph. The website stays static and host-independent: there is no Vercel/Netlify function, PHP, database client or server secret anywhere in this repository.

**Status:** the first (synchronous) version passed a real end-to-end test on the Vercel staging host. The Sheet row, internal email, acknowledgement and thank-you state were all verified. The current capture-first version, with the queued email worker, must be deployed together with its trigger and pass one more staging test. After that, the temporary staging host is removed.

**Rule: capture first, integrate second.** The Sheet row is the durable record. Nothing that happens after the row is written can undo a capture: not email, not a future CRM sync.

## Architecture

```
Contact form (visible fields + hidden transport fields)
   │  1. validate in the browser; show "Sending your enquiry…"; get a fresh Turnstile token
   │  2. set nonce, parent origin, attribution, submit time
   ▼
normal HTML POST (application/x-www-form-urlencoded) into a hidden iframe
   ▼
Apps Script doPost(e)                    ── synchronous: the visitor waits for exactly this ──
   │  origin allowlist → nonce/replay → honeypot → timing → lead normalisation
   │  → Turnstile Siteverify → duplicate/throttle (script lock) → Sheet row, both email statuses "pending"
   ▼
small HTML page → postMessage({captured:true, acknowledgementQueued:true, …}, exact parent origin)
   ▼
website verifies origin + source frame + nonce → thank-you state

                                         ── asynchronous, every minute ──
time-driven trigger → processPendingContactEmails()
   │  lease (no overlapping runs) → oldest rows with a "pending" status, up to 10 per run
   ├── internal notification  → internalemailstatus: sent | failed
   ├── acknowledgement        → ackemailstatus:      sent | failed
   └── (future) syncLeadToLeadRyze → leadryzeid
```

### Why a hidden iframe and postMessage, not fetch()

Apps Script web apps answer through Google's own redirect and content hosts, and they do not send CORS headers a browser accepts for a cross-origin JSON POST. A `fetch()` either fails, or with `mode:'no-cors'` "succeeds" without letting the page read the response, so it cannot tell a recorded enquiry from a failed one. A plain form post needs no CORS. The response page reports the real outcome with `window.postMessage`, sent only to the validated exact origin.

### Synchronous path: before and after

| Step | Before (first version) | Now |
|---|---|---|
| Origin, nonce, honeypot, timing, validation | ✓ | ✓ |
| Turnstile Siteverify | ✓ | ✓ |
| Duplicate / throttle, Sheet write | ✓ | ✓ (one flush, needed so the next submission sees the new row) |
| Microsoft token request | ✓ | — (worker) |
| Internal `sendMail` | ✓ | — (worker) |
| Acknowledgement `sendMail` | ✓ | — (worker) |
| Email-status writes and two extra flushes | ✓ | — (worker) |
| Response to the browser | after all of the above | right after the Sheet write |

## Normalised lead model

Every channel speaks one shape, independent of storage. Browser side (`public/lead.js`) and server side (`normalizeLead_` in `Code.gs`):

```
lead:        firstname, lastname, workemail, company, role, countryregion,
             whatcanwehelp (the enquiry type), message
source:      submittedfrom          currently website_contact
attribution: referrer, utmsource, utmmedium, utmcampaign, utmcontent, utmterm
system:      submissionid, createddate, status        assigned when the lead is saved
```

In `Code.gs`:
- **Sheet repository** (`saveLead_`, `rowToLead_`, `setEmailStatus_`): the only code that knows spreadsheet columns.
- **Email notification processor** (`sendInternalEmail_`, `sendAcknowledgementEmail_`): consumes the normalised lead read back from the row.
- **LeadRyze CRM adapter** (future): consumes the same normalised lead.

The browser UI has no Sheet logic. It builds the lead, and the transport posts it.

Possible future sources: `website_chatbot`, `campaign_landing_page` and `event_lead`. None is implemented. A new source must be added to `CONFIG.SOURCES` deliberately. See *Future channels* below.

## Files

| File | Role |
|---|---|
| `src/config/contact.mjs` | Public configuration (endpoint, Turnstile site key, live hosts, accepted response origins, timeouts) and the CSP additions |
| `src/pages/inner.mjs` (`contactPage`) | Form markup: `action`/`method`/`target`, field `name`s, hidden fields, honeypot, Turnstile container, response iframe, thank-you `<template>` |
| `public/forms.js` | Form controller: IDLE → SUBMITTING → SUCCESS / ERROR |
| `public/lead.js` | Channel-neutral normalised lead and validation |
| `public/contact-transport.js` | Hidden-iframe transport and postMessage verification |
| `public/turnstile.js` | Turnstile loader, invisible execution, reset per attempt |
| `public/attribution.js` | Session landing attribution (referrer and UTM) |
| `public/integrations.js`, `public/consent.js` | `innooryze:lead-captured` event; the GA4 `contact_form_submit` forwarder |
| `integrations/apps-script/contact-form/Code.gs` | **Source of truth** for the Apps Script backend and email worker (no secrets) |
| `integrations/apps-script/contact-form/appsscript.json` | Reference manifest (V8, web-app access, scopes) |
| `tests/contact.test.mjs`, `tests/apps-script.test.mjs` | Unit tests (part of `npm test`) |
| `tests/browser/contact-form.browser.mjs` | Browser integration test (`npm run test:contact-browser`, needs Chrome) |

The build writes the browser subset of the configuration to `dist/contact-config.js`.

## Public configuration

Everything below is public by design and may appear in browser code. Change it only in `src/config/contact.mjs`.

| Setting | Value |
|---|---|
| Endpoint | `https://script.google.com/macros/s/AKfycbz6U22rjQfdcOciH0LW73VvW1kVSDlB7yLyuPICbbaI_p--6GAWpLUHoELayjltW_VN8A/exec` |
| Turnstile site key | `0x4AAAAAAFDWHGP2v8v-q-xS` (Managed mode) |
| Turnstile action | `contact_submit` |
| Live hosts | `innooryze.com`, `www.innooryze.com`, **temporarily** `innooryze-website.vercel.app` |
| submittedfrom | `website_contact` |

Never put these in the repository, `.env.example`, documentation or browser code: `TURNSTILE_SECRET_KEY`, `MS365_TENANT_ID`, `MS365_CLIENT_ID`, `MS365_CLIENT_SECRET`. They exist only in the Apps Script project's Script Properties. `npm run check:production` fails if those names, or anything that looks like a Turnstile secret, appear in `dist/`.

### Production, staging and preview hosts

Real submissions happen only on the live hosts. This is an allowlist, so every other host is excluded without being named: `localhost`, `127.0.0.1`, other Vercel previews, branch deploys. On those hosts the form still validates, but a valid submission shows *"Development preview: enquiries are sent only from innooryze.com, so nothing was sent from this copy of the site."* Turnstile is not loaded and nothing is posted.

**Temporary staging allowance.** `innooryze-website.vercel.app` is currently allowed in three places so the queued flow can be verified end to end:
- `liveHosts` in `src/config/contact.mjs`;
- `ALLOWED_PARENT_ORIGINS` and `TURNSTILE_HOSTNAMES` in `Code.gs`;
- the Turnstile widget's hostnames in Cloudflare.

Remove it from all three after the final staging test passes.

Local QA uses `npm run test:contact-browser`. That harness serves `dist/` as https://innooryze.com in a private headless Chrome, swaps in Cloudflare's public **test** site keys, and answers the POST by running the real `Code.gs` against simulated Google services. Nothing reaches the live backend.

## Field mapping

Visible labels are unchanged. The HTML `name` attributes are the lead keys, which are also the Sheet column names.

| Visible label | Control id | `name` / Sheet column | Required | Max |
|---|---|---|---|---|
| First Name | firstName | `firstname` | yes | 120 |
| Last Name | lastName | `lastname` | yes | 120 |
| Work Email | email | `workemail` | yes (email) | 254 |
| Company | company | `company` | yes | 120 |
| Role | role | `role` | no | 120 |
| Country / Region | country | `countryregion` | yes | 120 |
| What can we help with? | interest | `whatcanwehelp` | yes | 120 |
| Message | message | `message` | yes | 4000 |

`/contact?interest=<option>` still preselects the area of interest.

Hidden fields, set by `public/forms.js`:

| Field | Set when | Trusted by the backend? |
|---|---|---|
| `submittedfrom` | rendered as `website_contact` | Only if on the backend allowlist; otherwise forced to `website_contact` |
| `referrer`, `utmsource`, `utmmedium`, `utmcampaign`, `utmcontent`, `utmterm` | at submit, from session attribution | Sanitised: http(s) URLs only for referrer, 500/150 characters, control characters stripped |
| `formstartedat` | once, when the form becomes usable (page load), never at submit | Timing only |
| `formsubmittedat` | at submit | Timing only |
| `turnstiletoken` | at submit, a fresh token | Verified with Cloudflare Siteverify |
| `submissionnonce` | at submit, 144 random bits | Format-checked, echoed back, used for replay protection |
| `parentorigin` | at submit, `location.origin` | Must exactly equal an allowed origin |
| `website` | never (honeypot) | Any value means rejection |

The token and nonce fields are cleared as soon as each attempt ends, so neither can be posted twice.

## Result message

```json
{"type":"innooryze:contact-result","version":1,"ok":true,"captured":true,"submissionId":"IR-20260925-7F3C9D2E",
 "acknowledgementQueued":true,"acknowledgementEmailSent":false,"internalEmailSent":false,
 "code":"captured","submissionNonce":"<echo>"}
```

- `captured`: the row exists. This is the only condition for the thank-you state.
- `acknowledgementQueued`: the acknowledgement email is queued for the worker. It is the only condition for the line *"A confirmation will be sent to your email shortly."*
- `acknowledgementEmailSent` / `internalEmailSent` are always `false` in the response now, because nothing has been sent yet. The website never claims an email was delivered.
- `code` is one of `captured`, `duplicate`, `invalid`, `rejected` (honeypot/timing), `verification_failed` (Turnstile), `rate_limited`, `origin_rejected`, `invalid_request` or `server_error`.

The message never contains the visitor's name, email, company or message, the Turnstile token or result, Microsoft errors, or any secret. If the parent origin or nonce is invalid, the page posts nothing at all.

### Accepted response origins (website side)

The script runs inside Google's HtmlService sandbox. That is a frame on a per-script subdomain such as `https://n-<id>-0lu-script.googleusercontent.com`, nested inside the `script.google.com` page loaded in our iframe. The website accepts `https://script.google.com` and `https://script.googleusercontent.com` exactly, plus origins matching `^https://n-[a-z0-9]+(?:-[a-z0-9]+)*-script\.googleusercontent\.com$`.

Origin alone is not trusted. A message is processed only when **all three** conditions hold:
1. The origin matches the rules above.
2. `event.source` is our submission iframe or a frame nested inside it.
3. `type` and `submissionNonce` match the submission in flight.

Because the sandbox frame is nested, the website is `window.top` of the response script. `Code.gs` posts to `window.parent` and `window.top`, always with the exact validated origin. `Code.gs` must keep `setXFrameOptionsMode(ALLOWALL)`; without it Google refuses to render the response inside the website's iframe.

## Turnstile

**Frontend** (`public/turnstile.js`):
- The official script loads on the visitor's first interaction with the form, not on page view.
- The widget renders with the production site key, `action: 'contact_submit'`, `execution: 'execute'` and `appearance: 'interaction-only'`. Most visitors see nothing; Cloudflare shows its checkbox inside the form only when it decides a challenge is needed.
- Every submission gets a fresh token, and the widget resets after any failed attempt.

**Backend** (`verifyTurnstile_`) POSTs the token with `TURNSTILE_SECRET_KEY` to Siteverify. It requires `success: true`, `action === 'contact_submit'`, and a hostname that is both on `TURNSTILE_HOSTNAMES` and equal to the validated parent origin's host. Failure returns `verification_failed`; the form stays filled and the visitor can retry at once.

## Anti-spam and integrity

| Control | Where | Behaviour |
|---|---|---|
| Honeypot `website` | markup + both sides | Off-screen and clipped (not `display:none`), `aria-hidden`, `tabindex=-1`. Any value is refused before Turnstile is called |
| Timing | backend | `formsubmittedat − formstartedat` between 3 s and 24 h (visitor-clock difference, immune to skew); submit time within 24 h of server time |
| Replay | backend | A nonce seen in the last 6 h returns its original result; no second row |
| Duplicate | backend | Same work email + same message within 30 min returns `captured` / `duplicate` with the original submission ID; no second row |
| Throttle | backend | At most 3 new enquiries per work email per hour (`rate_limited`) |
| Double click | frontend | The SUBMITTING state disables the button and ignores further submits |
| Formula injection | backend | Values starting with `= + - @` (or a tab/CR) are stored with a leading apostrophe and cells are plain text; the worker strips the apostrophe again for the emails |

## Google Sheet

Only Apps Script writes to the Sheet. Columns are located by header name, so their order may change, but all 21 must exist or the submission fails safely with `server_error`:

`submissionid, firstname, lastname, workemail, company, role, countryregion, whatcanwehelp, message, createddate, submittedfrom, referrer, utmsource, utmmedium, utmcampaign, utmcontent, utmterm, status, internalemailstatus, ackemailstatus, leadryzeid`

Values set by the server, not the browser:
- `submissionid`: `IR-yyyyMMdd-XXXXXXXX`
- `createddate`: server `new Date()`
- `status`: `New`
- `internalemailstatus` and `ackemailstatus`: `pending` at capture
- `leadryzeid`: always blank; reserved for the LeadRyze adapter

The Sheet is found through Script Property `SHEET_ID`, or the bound spreadsheet if that property is unset. The tab is `SHEET_NAME`, or else the first tab whose header row contains `submissionid`.

### Email status transitions

```
capture ──► pending ──(worker, sendMail 202)──► sent       (never sent again)
                    └─(worker, any error)─────► failed     (not retried automatically)
failed / sent ──(an operator types "pending")──► pending   (the next run sends that one email again)
```

`internalemailstatus` and `ackemailstatus` move independently. One failing never blocks or repeats the other. A lead is never unCaptured, and the worker never creates or deletes rows.

## Background email worker

`processPendingContactEmails()` runs from one time-driven trigger, every minute.

1. **No overlap.** A lease (`CONTACT_EMAIL_WORKER_LEASE` in Script Properties) is taken under the script lock, which is held only for that moment, so the worker never delays a submission waiting for the lock. A second run while the lease is live exits at once. The lease lasts 7 minutes, longer than any Apps Script execution (6-minute limit). The worker releases it when done, and a crashed run's lease expires on its own.
2. **Queue scan.** It reads the two status columns, then takes the oldest rows with a `pending` status, up to 10 per run, and stops starting new rows after 3.5 minutes.
3. **Per row.** It re-reads the row and trusts that row's own statuses, so a Sheet that was sorted or edited mid-run can never cause a second send. It rebuilds the normalised lead, sends each pending email independently, and writes `sent` or `failed`. It re-locates the row by `submissionid` before each write, so a status can never land on someone else's row. It flushes before moving on, so a run that is cut short never re-sends what it already sent.
4. **Logs.** Only counts, submission IDs and error codes are logged, for example `contact-worker: rows=1 sent=2 failed=0` or `acknowledgement email for IR-… failed sendMail returned 403 ErrorAccessDenied`. Names, addresses and message text are never logged.

A queued email is sent within about one minute of capture, plus the run itself (a few seconds per row). A burst of more than 10 enquiries drains at 10 rows per minute.

### Trigger setup (once)

In the Apps Script project:
1. Open **Triggers** (the alarm-clock icon in the left bar) → **Add Trigger**.
2. Function to run: **`processPendingContactEmails`**. Deployment: **Head**. Event source: **Time-driven**. Type: **Minutes timer**. Interval: **Every minute**. Failure notification: **Notify me daily** (or immediately).
3. **Save**, and authorise if prompted. The trigger runs as the account that created it, so create it with the account that owns the deployment and the Script Properties.
4. Make sure there is exactly **one** such trigger. Do not create one per submission. The code never creates triggers itself.

Every minute is the shortest interval Apps Script offers for time-driven triggers. Each run is short, and a run with nothing pending finishes after reading two columns.

## Microsoft Graph

The client-credentials flow runs in the worker only, using the Entra app with the **Mail.Send application permission**. The sender mailbox is scoped through Exchange (*InnooRyze Website Sender Scope*). The token is cached in the script cache until 5 minutes before it expires.

| Email | From | To | Reply-To | Content |
|---|---|---|---|---|
| Internal notification | `MS365_SENDER_EMAIL` | `CONTACT_NOTIFICATION_TO` | the visitor's work email | Every field, submission ID, IST timestamp, source and attribution |
| Acknowledgement | `MS365_SENDER_EMAIL` | the submitted work email | `MS365_SENDER_EMAIL` | Thank-you, "We’ll review your enquiry and get back to you shortly", reference ID. **Does not repeat the visitor's message**, so the form cannot be used to send arbitrary text to arbitrary addresses |

`sendMail` must return HTTP 202. Anything else is recorded as `failed` and logged with its status and error code only.

## Apps Script deployment and Script Properties

| Property | Required | Purpose |
|---|---|---|
| `TURNSTILE_SECRET_KEY` | yes | Turnstile Siteverify |
| `MS365_TENANT_ID` | yes | Entra tenant |
| `MS365_CLIENT_ID` | yes | App registration |
| `MS365_CLIENT_SECRET` | yes | App registration secret |
| `MS365_SENDER_EMAIL` | yes | Sending mailbox and acknowledgement Reply-To |
| `CONTACT_NOTIFICATION_TO` | yes | Internal notification recipient |
| `SHEET_ID` | only if the script is not bound to the Sheet | Enquiry spreadsheet |
| `SHEET_NAME` | optional | Enquiry tab name |
| `CONTACT_EMAIL_WORKER_LEASE` | written by the worker | Overlap guard; do not edit (deleting it is harmless when no run is active) |

Web-app deployment settings: **Execute as: Me**. **Who has access: Anyone** (anonymous).

### Updating the backend (keeps the same /exec URL)

1. Keep a copy of the current `Code.gs` as a rollback.
2. Replace the whole file with `integrations/apps-script/contact-form/Code.gs`. This also removes any temporary diagnostic functions left in the live file.
3. Save.
4. **Deploy → Manage deployments → the existing web-app deployment → Edit → Version: New version → Deploy.** This keeps the `/exec` URL.
5. Create the worker trigger (above) if it does not exist yet.
6. Check that `GET <endpoint>` still returns `{"ok":true,"service":"innooryze-contact-form","status":"available"}`.

To roll back: Manage deployments → Edit → the previous version → Deploy. The worker trigger calls whatever `processPendingContactEmails` exists in the saved script (Head). If you roll back to the synchronous version, delete the trigger too. Any rows still `pending` would then need their emails sent by hand or through a later deployment.

## Content-Security-Policy

| Directive | Added | Why |
|---|---|---|
| `script-src` | `https://challenges.cloudflare.com` | Official Turnstile loader |
| `frame-src` (new) | `'self' https://challenges.cloudflare.com https://script.google.com https://script.googleusercontent.com` | Turnstile challenge frame; the Apps Script response frame and Google's possible redirect target |
| `form-action` | `https://script.google.com https://script.googleusercontent.com` | The form posts to Apps Script |

There is no `connect-src` addition, no wildcard and no `unsafe-eval`. `npm run check:production` asserts parity across `vercel.json`, `_headers` and `.htaccess`, and checks the exact host lists.

## Analytics

The form never loads Google Analytics. A captured submission dispatches `innooryze:lead-captured` with `{event, area, source}` only. `public/consent.js` forwards it as GA4 `contact_form_submit` `{form_id, enquiry_area}` only when the tag is already loaded with analytics consent.

## Attribution

`public/attribution.js` stores the landing page's external referrer (origin + path) and `utm_*` parameters in `sessionStorage` (`innooryze.attribution`). Internal navigation never overwrites the record; a new arrival from outside that carries its own UTM or external referrer replaces it. The record is first-party, lasts for the tab session, is sent only with an enquiry and needs no marketing consent.

## Latency

Measured on 26 September 2026, `GET` on the live endpoint (an Apps Script execution that does nothing): 1.1 to 2.0 s warm, and 6.1 s once (cold start). That is the floor for any Apps Script request.

What the visitor still waits for after pressing Send:

| Contributor | Typical |
|---|---|
| Turnstile invisible execution (browser → Cloudflare) | 0.3–1.5 s |
| Apps Script request routing + execution start | 1–2 s warm, up to about 6 s cold |
| Siteverify (Apps Script → Cloudflare) | 0.2–0.5 s |
| Cache and lock operations | < 0.2 s |
| Sheet open, header read, write, one flush | 0.5–1.5 s |
| HtmlService response page load + postMessage | 0.3–0.8 s |

No longer waited for: the Microsoft token request and two `sendMail` calls (typically 1.5–4 s together), plus the two status writes and flushes (0.5–1 s).

The local harness, which has no real Google or Microsoft latency, measures about 1.7 s from click to thank-you. Real-world expectations are about 2.5–5 s warm and up to about 8 s on a cold start, against the 6–11 s observed before. Only the live staging test gives the real figure.

## Live end-to-end test (after deploying this Code.gs and creating the trigger)

1. Open https://innooryze-website.vercel.app/contact (staging), later https://innooryze.com/contact.
2. Submit a `LIVE TEST` enquiry to an inbox you control.
3. The button immediately reads **Sending your enquiry…** with a small spinner.
4. The form is replaced by **THANK YOU. / Your message is with us.** and *"A confirmation will be sent to your email shortly."* Note how long this took. The left column does not move.
5. The Sheet row appears at once with `status` `New`, both email statuses `pending`, and `leadryzeid` empty.
6. Within about a minute, both statuses change to `sent`.
7. The notification recipient receives the internal email, with Reply-To set to the tester.
8. The test inbox receives the acknowledgement with the same reference.
9. Submit the identical enquiry again: the thank-you appears, but no second row is created and no further email is sent.
10. In Executions, `doPost` shows `contact: captured IR-… (emails queued)`, and a trigger run shows `contact-worker: rows=1 sent=2 failed=0`.

## Troubleshooting

| Symptom | Likely cause | Check |
|---|---|---|
| Error message after about 12 s; no row | The response page posted nothing: old deployment, `ALLOWALL` missing, or the script threw | Executions log; confirm the deployment is the new version |
| Error message; row **was** written | Message not accepted: sandbox origin outside the pattern, or site not on the parent-origin allowlist | Compare `event.origin` in DevTools with `responseOriginPattern` |
| `verification_failed` every time | Wrong secret, hostname not on the widget, or action not `contact_submit` | Cloudflare Turnstile analytics; Executions log `turnstile failed (<reason>)` |
| Statuses stay `pending` | Worker trigger missing or failing | Triggers page; Executions filtered to `processPendingContactEmails` |
| `contact-worker: previous run still active` every minute for more than 7 minutes | Should not happen; the lease expires on its own | Delete Script Property `CONTACT_EMAIL_WORKER_LEASE` |
| Both statuses `failed` | Graph token or permission problem | Worker log `token request returned 401` or `sendMail returned 403 …` |
| Only `ackemailstatus` `failed` | Recipient domain or Graph error | Worker log; type `pending` in the cell to retry once fixed |
| `server_error` with no row | Missing column, wrong `SHEET_ID`/`SHEET_NAME`, or a required Script Property missing | Executions log |
| Form shows "Development preview" | Not on a live host | Expected on local and preview hosts |

## Future channels

### LeadRyze CRM (not implemented)

The adapter plugs into the worker, in the marked spot after the email steps, as `syncLeadToLeadRyze(normalized)`. It must:
- act only on rows whose `leadryzeid` is blank;
- create or update the lead in LeadRyze CRM from the normalised shape;
- write the returned ID to `leadryzeid`;
- on any failure, leave the row as it is so the next run retries.

It runs after capture, in the background, so a LeadRyze outage can never block or undo website lead capture or the emails. If LeadRyze later needs a visible status, add a column such as `leadryzestatus` with the same pending/sent/failed transitions. No LeadRyze availability, pricing or feature claim is made on the website.

### Website chatbot (not implemented)

A chatbot would collect the same lead fields in conversation and produce the same normalised lead with `submittedfrom: 'website_chatbot'`. It should **not** reuse the Contact form's public iframe endpoint by widening its rules. It should have its own ingestion path, authenticated to the chatbot service with a secret held server-side and never in browser code. That path would still call the same internal services: `normalizeLead_` → duplicate/throttle → `saveLead_` → the same email worker and the future LeadRyze step.

`doPost` already accepts JSON, but only with the same origin, nonce and Turnstile requirements as the form, so today it is not a chatbot API. Campaign landing pages (`campaign_landing_page`) and event leads (`event_lead`) follow the same pattern: their own validated entry point, then the same lead contract, repository and processors.

## Tests

- `npm test` includes `tests/contact.test.mjs` (browser modules) and `tests/apps-script.test.mjs`. The latter runs the real `Code.gs` in a Node `vm` against simulated Sheets, Cache, Lock, Properties, UrlFetch (Cloudflare and Microsoft Graph), HtmlService and ContentService. It covers the capture-before-email response, the pending statuses, both worker emails, independent failures, no resending, the lease, batching, a Sheet sorted mid-run, duplicate protection and the untouched `leadryzeid`.
- `npm run test:contact-browser` runs the form in headless Chrome at ten viewports and through every state: immediate loading indicator, thank-you before any email, worker afterwards. It uses the real Turnstile script (Cloudflare test keys), the real CSP from `dist/_headers`, and the real `Code.gs` behind a simulated HtmlService nesting.
- These prove the website and the script logic. Only the live staging test proves that the deployment, trigger, Sheet, Turnstile secret and Microsoft 365 tenant behave the same.
