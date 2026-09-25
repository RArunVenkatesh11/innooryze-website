# Phase 4 progress: Contact form live integration

Scope: connect the existing Contact form to the deployed Google Apps Script backend (Google Sheet, Cloudflare Turnstile, Microsoft Graph transactional email) without redesigning the page or adding a backend to this repository. Full reference: docs/CONTACT_INTEGRATION.md.

- [x] Source-controlled Apps Script backend: integrations/apps-script/contact-form/Code.gs (urlencoded iframe flow, JSON retained, no secrets)
- [x] Hidden-iframe form POST with a nonce-bound postMessage result to the validated exact parent origin
- [x] Turnstile Managed mode: invisible execution, action contact_submit, fresh token per attempt, reset after failure; server Siteverify with action and hostname checks
- [x] Honeypot, skew-proof timing, replay, duplicate and per-email throttle protection; Sheet formula-injection defence
- [x] Field name mapping with unchanged labels; channel-neutral normalised lead (public/lead.js)
- [x] IDLE / SUBMITTING / SUCCESS / ERROR states; in-frame thank-you replacement; the left column and section never move
- [x] Session landing attribution (referrer and UTM) without consent dependency or analytics loading
- [x] Consent-gated GA4 contact_form_submit (area and form id only)
- [x] Minimal exact-host CSP additions on every adapter; validator assertions
- [x] Unit tests (browser modules; Code.gs against simulated services) and a Chrome integration test at ten viewports
- [ ] Deploy the updated Code.gs as a new version of the existing web-app deployment (owner)
- [ ] Live end-to-end test on innooryze.com (owner); the form is not confirmed live until it passes
- [ ] Owner/legal review of the Privacy Policy provider list against the processing now in use (no legal text changed)
