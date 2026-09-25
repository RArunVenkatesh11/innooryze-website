# Contact form integration

The Contact page (`/contact`) sends enquiries to a Google Apps Script web app, which records each one in the enquiry Google Sheet, checks Cloudflare Turnstile and sends two transactional emails through Microsoft Graph. The website stays static and host-independent: there is no Vercel/Netlify function, PHP, database client or server secret anywhere in this repository.

**Status:** implemented and tested against simulated Google and Microsoft services (see *Tests*). The form is **not confirmed live** until the live end-to-end test below has passed on innooryze.com, with the updated `Code.gs` deployed.

## Architecture

```
Contact form (visible fields + hidden transport fields)
   │  1. validate in the browser; get a fresh Turnstile token (action contact_submit)
   │  2. set nonce, parent origin, attribution, submit time
   ▼
normal HTML POST (application/x-www-form-urlencoded)
   │  target="contact-submit-target"  (hidden iframe; the visitor never leaves the page)
   ▼
Apps Script doPost(e)                       integrations/apps-script/contact-form/Code.gs
   │  origin allowlist → nonce → honeypot → timing → field validation
   │  → Turnstile Siteverify (secret in Script Properties) → duplicate/throttle
   │  → Sheet row (status New)  ── the enquiry is now CAPTURED
   │  → Graph: internal notification, then customer acknowledgement → email status columns
   ▼
small HTML page (HtmlService, X-Frame-Options ALLOWALL)
   │  postMessage(result, "<validated exact parent origin>")   never "*"
   ▼
website verifies origin + source frame + nonce → thank-you state or error
```

### Why a hidden iframe and postMessage, not fetch()

Apps Script web apps answer through Google's own redirect and content hosts and do not send CORS headers a browser accepts for a cross-origin JSON POST. A `fetch()` either fails, or with `mode:'no-cors'` "succeeds" without letting the page read the response, so it cannot tell a recorded enquiry from a failed one. A plain form post needs no CORS at all. The response page then reports the real outcome to the website with `window.postMessage`, sent only to the validated exact origin. The website accepts it only when the origin, the source frame and the per-submission nonce all check out.

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
| `integrations/apps-script/contact-form/Code.gs` | **Source of truth** for the Apps Script backend (no secrets) |
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
| Live hosts | `innooryze.com`, `www.innooryze.com` |
| submittedfrom | `website_contact` |

**Never** put these in the repository, `.env.example`, documentation or browser code: `TURNSTILE_SECRET_KEY`, `MS365_TENANT_ID`, `MS365_CLIENT_ID`, `MS365_CLIENT_SECRET`. They exist only in the Apps Script project's Script Properties. `npm run check:production` fails if those names, or anything that looks like a Turnstile secret, appear in `dist/`.

### Production, local and preview hosts

Real submissions happen only on `innooryze.com` and `www.innooryze.com`. This is an allowlist, so every other host is excluded without being named: `localhost`, `127.0.0.1`, Vercel previews and branch deploys. On those hosts the form still validates, but a valid submission shows *"Development preview: enquiries are sent only from innooryze.com, so nothing was sent from this copy of the site."*. Turnstile is not loaded and nothing is posted.

This is deliberate, and is option B of the brief. The production widget is registered only for the production hostnames. A preview must never write to the live Sheet or send real emails. Cloudflare's test keys would only pass verification if the backend used a test secret, which would weaken production. Local and preview QA therefore uses `npm run test:contact-browser`. That harness serves `dist/` as https://innooryze.com in a private headless Chrome, swaps in Cloudflare's public **test** site keys, and answers the POST by running the real `Code.gs` against simulated Google services. Nothing reaches the live backend.

`www.innooryze.com` redirects to the apex on every adapter, so in practice the parent origin is `https://innooryze.com`. Both remain allowed.

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
| `formstartedat` | once, when the form becomes usable (page load), never at submit | Used for timing only |
| `formsubmittedat` | at submit | Used for timing only (see below) |
| `turnstiletoken` | at submit, a fresh token | Verified with Cloudflare Siteverify |
| `submissionnonce` | at submit, 144 random bits | Format-checked, echoed back, used for replay protection |
| `parentorigin` | at submit, `location.origin` | Must exactly equal an allowed origin |
| `website` | never (honeypot) | Any value means rejection |

The token and nonce fields are cleared as soon as each attempt ends, so neither can be posted twice.

## Result message

The response page posts exactly these keys:

```json
{"type":"innooryze:contact-result","version":1,"ok":true,"captured":true,"submissionId":"IR-20260925-7F3C9D2E",
 "acknowledgementEmailSent":true,"internalEmailSent":true,"code":"captured","submissionNonce":"<echo>"}
```

The message never contains the visitor's name, email, company, message, the Turnstile token or result, Microsoft errors or any secret. `code` is one of `captured`, `duplicate`, `invalid`, `rejected` (honeypot/timing), `verification_failed` (Turnstile), `rate_limited`, `origin_rejected`, `invalid_request` or `server_error`. If the parent origin or nonce is invalid, the page posts nothing at all.

### Accepted response origins (website side)

The script runs inside Google's HtmlService sandbox. That is a frame on a per-script subdomain such as `https://n-<id>-0lu-script.googleusercontent.com`, nested inside the `script.google.com` page that our iframe loaded. The website therefore accepts:

- `https://script.google.com` and `https://script.googleusercontent.com` (exact), and
- origins matching `^https://n-[a-z0-9]+(?:-[a-z0-9]+)*-script\.googleusercontent\.com$` (the sandbox host).

Origin alone is not trusted, because any Apps Script project shares that sandbox domain. A message is processed only when **all three** conditions hold:
1. The origin is on the list above.
2. `event.source` is our submission iframe or a frame nested inside it.
3. `type` is `innooryze:contact-result` and `submissionNonce` equals the nonce of the submission in flight.

Every other message is ignored. After the first live submission you can pin the exact sandbox origin (visible as `event.origin`) in `responseOrigins` and drop the pattern.

Because the sandbox frame is nested, the website is `window.top` of the response script, not `window.parent`. `Code.gs` posts to both, always with the exact validated origin, and the browser delivers only to the window whose origin matches. `Code.gs` must keep `setXFrameOptionsMode(ALLOWALL)`; without it Google refuses to render the response inside the website's iframe.

## Turnstile

**Frontend** (`public/turnstile.js`):
- The official script `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` loads on the visitor's first interaction with the form, not on page view.
- The widget is rendered with the production site key, `action: 'contact_submit'`, `execution: 'execute'` and `appearance: 'interaction-only'`. Most visitors see nothing. Cloudflare shows its checkbox inside the form only when it decides a challenge is needed. The timeout pauses while a visible challenge is waiting.
- Every submission gets a fresh token: the widget is reset before each execution after the first, and reset again after any failed attempt, so a consumed token is never reused.

**Backend** (`verifyTurnstile_` in `Code.gs`) POSTs the token with `TURNSTILE_SECRET_KEY` to Siteverify. It requires `success: true`, `action === 'contact_submit'`, a hostname that is one of the production hostnames, and that the hostname equals the validated parent origin's host. Failure returns `verification_failed`. The form stays filled and the visitor can retry at once with a new token.

## Anti-spam and integrity

| Control | Where | Behaviour |
|---|---|---|
| Honeypot `website` | markup + both sides | Off-screen and clipped (not `display:none`), `aria-hidden`, `tabindex=-1`, `autocomplete=off`. Any value is refused before Turnstile is called |
| Timing | backend | `formsubmittedat − formstartedat` must be at least 3 s and at most 24 h. Both come from the visitor's clock, so clock skew cannot reject a real person. The submit time must be within 24 h of server time |
| Replay | backend | A nonce seen in the last 6 h returns its original result; no second row |
| Duplicate | backend | Same work email + same message within 30 min returns `captured` / `duplicate` with the original submission ID; no second row |
| Throttle | backend | At most 3 new enquiries per work email per hour (`rate_limited`) |
| Double click | frontend | The SUBMITTING state disables the button and ignores further submits |
| Formula injection | backend | Values starting with `= + - @` (or a tab/CR) are stored with a leading apostrophe; cells are formatted as plain text |

## Google Sheet

Only Apps Script writes to the Sheet. Columns are located by header name, so their order may change, but all 21 must exist or the submission fails safely with `server_error`:

`submissionid, firstname, lastname, workemail, company, role, countryregion, whatcanwehelp, message, createddate, submittedfrom, referrer, utmsource, utmmedium, utmcampaign, utmcontent, utmterm, status, internalemailstatus, ackemailstatus, leadryzeid`

Values set by the server, not the browser:
- `submissionid`: `IR-yyyyMMdd-XXXXXXXX`
- `createddate`: server `new Date()`
- `status`: `New`
- `internalemailstatus` and `ackemailstatus`: `pending` while sending, then `sent` or `failed`
- `leadryzeid`: always blank

The Sheet is found through Script Property `SHEET_ID`, or the bound spreadsheet if that property is unset. The tab is `SHEET_NAME`, or else the first tab whose header row contains `submissionid`.

An enquiry is **captured** once its row is written. Email failures never undo capture. The website shows the thank-you state for `captured: true`, and mentions the confirmation email only when `acknowledgementEmailSent` is true.

## Microsoft Graph

The client-credentials flow runs server-side only, using an Entra app registration with the **Mail.Send application permission** on the `enquiry@innooryze.com` mailbox. The token is cached in the script cache until 5 minutes before expiry.

| Email | From | To | Reply-To | Content |
|---|---|---|---|---|
| Internal notification | enquiry@innooryze.com | kavyasri@innooryze.com | the visitor's work email | Every field, submission ID, IST timestamp, source and attribution |
| Acknowledgement | enquiry@innooryze.com | the submitted work email | enquiry@innooryze.com | Thank-you, "We’ll review your enquiry and get back to you shortly", reference ID. **Does not repeat the visitor's message**, so the form cannot be used to send arbitrary text to arbitrary addresses |

`sendMail` must return HTTP 202. Anything else is logged as `sendMail returned <status> <error code>`, without the provider's message text, and recorded as `failed`. If the live project already has approved email wording, keep that wording in `sendInternalEmail_` / `sendAcknowledgementEmail_`. The rest of the file does not depend on it.

## Apps Script deployment and Script Properties

Script Properties (Project Settings → Script Properties). Names only, never values in the repository:

| Property | Required | Purpose |
|---|---|---|
| `TURNSTILE_SECRET_KEY` | yes | Turnstile Siteverify |
| `MS365_TENANT_ID` | yes | Entra tenant |
| `MS365_CLIENT_ID` | yes | App registration |
| `MS365_CLIENT_SECRET` | yes | App registration secret |
| `SHEET_ID` | only if the script is not bound to the Sheet | Enquiry spreadsheet |
| `SHEET_NAME` | optional | Enquiry tab name |

Web-app deployment settings: **Execute as: Me** (the owner of the Sheet and properties). **Who has access: Anyone** (anonymous; the website posts without a Google login).

### Updating the backend (keeps the same /exec URL)

1. Open the Apps Script project → `Code.gs`. Keep a copy of the current contents (File → Make a copy, or paste them into a local file) as a rollback.
2. Replace the whole file with `integrations/apps-script/contact-form/Code.gs` from this repository.
3. Compare the manifest (Project Settings → *Show "appsscript.json"*) with `integrations/apps-script/contact-form/appsscript.json`. Only `runtimeVersion: V8` and the web-app access settings matter. If the live manifest already lists scopes and works, keep it.
4. Confirm the four required Script Properties exist. Add `SHEET_ID` / `SHEET_NAME` only if needed.
5. Save. Run `doGet` once from the editor and authorise any new scope prompt.
6. **Deploy → Manage deployments → the existing web-app deployment → Edit (pencil) → Version: New version → Deploy.** Editing the existing deployment keeps the `/exec` URL. Creating a *new deployment* would issue a new URL, which would then have to be set in `src/config/contact.mjs`, rebuilt and released.
7. Check `GET <endpoint>` still returns `{"ok":true,"service":"innooryze-contact-form","status":"available"}`.
8. Run the live test below.

To roll back: Manage deployments → Edit → select the previous version → Deploy.

## Content-Security-Policy

These are the only additions, all exact hosts, from `contactCsp` in `src/config/contact.mjs`:

| Directive | Added | Why |
|---|---|---|
| `script-src` | `https://challenges.cloudflare.com` | Official Turnstile loader |
| `frame-src` (new; previously fell back to `default-src 'self'`) | `'self' https://challenges.cloudflare.com https://script.google.com https://script.googleusercontent.com` | Turnstile challenge frame; the Apps Script response frame and Google's possible redirect target (CSP also checks redirects) |
| `form-action` | `https://script.google.com https://script.googleusercontent.com` | The form posts to Apps Script (plus the same possible redirect) |

The policy has no `connect-src` addition, no wildcard, no `unsafe-eval` and no `unsafe-inline` in `script-src`. GA's origins are unchanged. The policy is generated once into `vercel.json`, `_headers` and `.htaccess`. `npm run check:production` asserts parity and the exact host lists.

## Analytics

The form never loads Google Analytics. After a captured submission it dispatches the DOM event `innooryze:lead-captured` with `{event, area, source}` only. `public/consent.js` turns this into `gtag('event','contact_form_submit',{form_id:'contact', enquiry_area:<area of interest>})` only when the Google tag has already been loaded with analytics consent on a measured host. The event never carries a name, email, company or message.

## Attribution

`public/attribution.js` runs on every page. It stores the landing page's external referrer (origin + path only; query and fragment dropped) and its `utm_*` parameters in `sessionStorage` under `innooryze.attribution`. Internal navigation never overwrites that record, so an enquiry made several pages later still carries the landing attribution. A new arrival from outside that brings its own UTM or external referrer replaces it, the same rule analytics tools use for a new campaign visit. The record is first-party, lasts for the tab session, is sent only with an enquiry and needs no marketing consent. Without storage, the Contact page's own URL and referrer are used.

## Live end-to-end test (after deploying the new Code.gs)

1. Open https://innooryze.com/contact in a normal browser window (not a preview URL). Accept or reject cookies; either works.
2. Fill in the form with a test identity you control. Use a real inbox for Work Email, company "InnooRyze QA", and a message beginning `LIVE TEST`. Choose any area. Wait a few seconds, then press **Send enquiry**.
3. Turnstile normally passes invisibly. If a Cloudflare checkbox appears inside the form, tick it.
4. The form is replaced in the right-hand frame by **THANK YOU. / Your message is with us.** The left column does not move. If the acknowledgement was sent, *"A confirmation has been sent to your email."* also appears.
5. In the enquiry Sheet, a new row exists: `submissionid` `IR-…`, `createddate` set, `submittedfrom` `website_contact`, `status` `New`, `leadryzeid` empty, and the fields exactly as typed.
6. **kavyasri@innooryze.com** received *"New website enquiry: <area> | InnooRyze QA"* from enquiry@innooryze.com. Replying addresses the test inbox (Reply-To).
7. The test inbox received *"We’ve received your enquiry | InnooRyze"* from enquiry@innooryze.com with the same reference.
8. The row's `internalemailstatus` and `ackemailstatus` both read `sent`.
9. Reload the page and submit the identical enquiry again. The thank-you state appears, but **no second row** is created (duplicate protection).
10. In Apps Script → Executions, the `doPost` runs show `contact: captured IR-…` and then `contact: duplicate of IR-…`, with no errors.

Afterwards, delete or mark the test row as you prefer. Only after this passes is the form live.

## Troubleshooting

| Symptom | Likely cause | Check |
|---|---|---|
| Error message after about 12 s; no row | The response page loaded but posted nothing: old `Code.gs` still deployed, `ALLOWALL` missing, or the script threw before responding | Executions log; confirm the deployment uses the new version |
| Error message; row **was** written | The message was not accepted: sandbox origin outside the accepted pattern, or the site not on the parent-origin allowlist | In DevTools, listen for `message` events and compare `event.origin` with `responseOriginPattern` |
| `verification_failed` every time | Wrong `TURNSTILE_SECRET_KEY`, widget not registered for the hostname, or the action is not `contact_submit` | Cloudflare dashboard → Turnstile analytics; Executions log `turnstile failed (<reason>)` |
| Row written, both email statuses `failed` | Graph token or permission problem | Executions log `token request returned 401` or `sendMail returned 403 ErrorAccessDenied`; check the app secret expiry and the Mail.Send application permission / mailbox access policy |
| Only `ackemailstatus` `failed` | The visitor's domain rejected the mail, or a Graph error | Executions log |
| `server_error` with no row | Sheet missing a column, `SHEET_ID`/`SHEET_NAME` wrong, or a required Script Property missing | Executions log `Sheet is missing columns: …` or `Script Property … is not set` |
| Form shows "Development preview" | Not on innooryze.com / www.innooryze.com | Expected on local and preview hosts |
| CSP error in the console | Headers not redeployed with the release | Compare the live `Content-Security-Policy` with `dist/_headers` |

## Future LeadRyze CRM and chatbot

The browser side is channel-neutral. `public/lead.js` defines the normalised lead (the eight lead fields plus the `leadEnvelope` attribution keys), and nothing in the UI knows about Sheets. A website chatbot can build the same lead, validate it with `normalizeLead`, and submit it with a new `submittedfrom` value (for example `website_chatbot`), after that value is added to `CONFIG.SOURCES` in `Code.gs`. `doPost` already accepts JSON for API-style clients. A LeadRyze CRM sync can read the Sheet or listen for `innooryze:lead-captured`, and write its record ID back to the reserved `leadryzeid` column. Neither is implemented. No availability or feature claim should be made for them.

## Tests

- `npm test` includes `tests/contact.test.mjs` (browser modules) and `tests/apps-script.test.mjs`, which runs the real `Code.gs` in a Node `vm` against simulated Sheets, Cache, Lock, Properties, UrlFetch (Cloudflare and Microsoft Graph), HtmlService and ContentService.
- `npm run test:contact-browser` runs the form in headless Chrome at ten viewports and through every state. It uses the real Turnstile script with Cloudflare test keys, the real CSP from `dist/_headers`, and the real `Code.gs` behind a simulated HtmlService nesting.
- These prove the website and the script logic. They do **not** prove that the live deployment, Sheet, Turnstile secret or Microsoft 365 tenant behave the same. Only the live test does.
