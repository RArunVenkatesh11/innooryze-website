// Contact form, browser side: lead validation, transport fields, the iframe/postMessage transport,
// Turnstile token handling and first-touch attribution. Everything external is simulated here; these tests
// prove the website's logic, not that Google Sheets or Microsoft 365 accepted anything.
import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeLead, leadEnvelope, leadKeys} from '../public/lead.js';
import {outcomeFor, transportFields, isLiveHost} from '../public/forms.js';
import {createNonce, isTrustedResponseOrigin, isFromFrame, readResult, submitThroughFrame, TransportError} from '../public/contact-transport.js';
import {createTurnstile, TurnstileError} from '../public/turnstile.js';
import {deriveAttribution, captureAttribution, readAttribution, externalReferrer} from '../public/attribution.js';
import {browserContactConfig} from '../src/config/contact.mjs';

const config = {...browserContactConfig(), responseTimeoutMs: 400, afterLoadGraceMs: 60, turnstileTimeoutMs: 200};
const lead = {firstname: 'Avery', lastname: 'Example', workemail: 'avery@example.com', company: 'Example Ltd', role: '', countryregion: 'Singapore', whatcanwehelp: 'LeadRyze AI', message: 'I would like to explore LeadRyze AI.'};
const SANDBOX = 'https://n-abc123def-0lu-script.googleusercontent.com';

// ---- lead ------------------------------------------------------------------------------------------

test('a complete enquiry is valid and trimmed; role is optional', () => {
 const result = normalizeLead({...lead, firstname: '  Avery '});
 assert.equal(result.valid, true);
 assert.equal(result.lead.firstname, 'Avery');
 assert.equal(result.lead.role, '');
 assert.deepEqual(Object.keys(result.lead), leadKeys);
});

test('each missing required field has an actionable message', () => {
 const result = normalizeLead({});
 assert.equal(result.valid, false);
 assert.deepEqual(Object.keys(result.errors).sort(), ['company', 'countryregion', 'firstname', 'lastname', 'message', 'whatcanwehelp', 'workemail']);
 assert.equal(result.errors.firstname, 'Please enter your first name.');
});

test('invalid email addresses are refused', () => {
 for (const workemail of ['invalid', 'a@b', 'a b@example.com', 'avery@example', '<a@example.com>'])
  assert.match(normalizeLead({...lead, workemail}).errors.workemail || '', /valid email/, workemail);
});

test('overlong fields and a filled honeypot never proceed', () => {
 assert.equal(normalizeLead({...lead, message: 'x'.repeat(4001)}).valid, false);
 const trapped = normalizeLead({...lead, website: 'https://spam.example'});
 assert.equal(trapped.valid, false);
 assert.ok(trapped.errors.form);
});

test('the lead envelope is channel-neutral and carries attribution', () => {
 const env = leadEnvelope(lead, {source: 'website_contact', attribution: {referrer: 'https://www.google.com/', utmsource: 'linkedin'}});
 assert.equal(env.submittedfrom, 'website_contact');
 assert.equal(env.utmsource, 'linkedin');
 assert.equal(env.utmterm, '');
 assert.equal(env.workemail, lead.workemail);
});

test('transport fields: token, nonce, validated metadata, and never the visitor text', () => {
 const fields = transportFields({lead, config, attribution: {referrer: 'https://www.google.com/', utmcampaign: 'launch'}, token: 'tok', nonce: 'n'.repeat(36), origin: 'https://innooryze.com', now: 1700000000000});
 assert.deepEqual(Object.keys(fields).sort(), ['formsubmittedat', 'parentorigin', 'referrer', 'submissionnonce', 'submittedfrom', 'turnstiletoken', 'utmcampaign', 'utmcontent', 'utmmedium', 'utmsource', 'utmterm']);
 assert.equal(fields.submittedfrom, 'website_contact');
 assert.equal(fields.parentorigin, 'https://innooryze.com');
 assert.equal(fields.formsubmittedat, '1700000000000');
 assert.ok(!JSON.stringify(fields).includes(lead.workemail));
});

test('only the two production hostnames submit for real', () => {
 assert.equal(isLiveHost('innooryze.com', config), true);
 assert.equal(isLiveHost('www.innooryze.com', config), true);
 for (const host of ['localhost', '127.0.0.1', 'innooryze.vercel.app', 'innooryze.com.evil.example', 'staging.innooryze.com'])
  assert.equal(isLiveHost(host, config), false, host);
});

// ---- outcome ---------------------------------------------------------------------------------------

test('captured is success without waiting for email; the confirmation line needs a queued acknowledgement', () => {
 // The backend answers before any email is sent: captured + acknowledgementQueued, both *Sent flags false.
 assert.deepEqual(outcomeFor({captured: true, acknowledgementQueued: true, acknowledgementEmailSent: false, internalEmailSent: false}), {state: 'success', confirmation: true});
 assert.deepEqual(outcomeFor({captured: true, acknowledgementQueued: false, acknowledgementEmailSent: false}), {state: 'success', confirmation: false});
 assert.deepEqual(outcomeFor({captured: true, acknowledgementEmailSent: true}), {state: 'success', confirmation: true}, 'an older synchronous backend still works');
 assert.deepEqual(outcomeFor({captured: false, acknowledgementQueued: true, acknowledgementEmailSent: true}), {state: 'error'});
 assert.deepEqual(outcomeFor(null), {state: 'error'});
});

// ---- transport -------------------------------------------------------------------------------------

test('nonces are long, random and URL-safe', () => {
 const a = createNonce(), b = createNonce();
 assert.match(a, /^[a-f0-9]{36}$/);
 assert.notEqual(a, b);
});

test('response origins: Apps Script hosts and the sandbox pattern only', () => {
 for (const origin of ['https://script.google.com', 'https://script.googleusercontent.com', SANDBOX])
  assert.equal(isTrustedResponseOrigin(origin, config), true, origin);
 for (const origin of ['https://innooryze.com', 'https://evil.example', 'http://script.google.com', 'https://script.google.com.evil.example',
  'https://evil.example/?n-a-script.googleusercontent.com', 'https://n-abc-script.googleusercontent.com.evil.example', 'null', null])
  assert.equal(isTrustedResponseOrigin(origin, config), false, String(origin));
});

// The page's iframe, Google's wrapper page inside it, and the HtmlService sandbox frame inside that.
function frames() {
 const top = {};
 top.parent = top;
 const wrapper = {parent: top};
 const sandbox = {parent: wrapper};
 const stranger = {parent: top};
 return {top, wrapper, sandbox, stranger};
}
const message = (nonce, extra = {}) => ({type: config.resultType, version: 1, ok: true, captured: true, submissionId: 'IR-20260925-ABCD1234', acknowledgementEmailSent: false, acknowledgementQueued: true, internalEmailSent: false, code: 'captured', submissionNonce: nonce, ...extra});

test('a message is accepted only from inside our iframe, from a Google origin, with our nonce', () => {
 const {wrapper, sandbox, stranger} = frames();
 const nonce = createNonce();
 const ok = readResult({origin: SANDBOX, source: sandbox, data: message(nonce)}, {nonce, frameWindow: wrapper, config});
 assert.deepEqual(ok, {captured: true, submissionId: 'IR-20260925-ABCD1234', acknowledgementEmailSent: false, acknowledgementQueued: true, internalEmailSent: false, code: 'captured'});
 assert.equal(isFromFrame(sandbox, wrapper), true);
 assert.equal(isFromFrame(stranger, wrapper), false);
 assert.equal(readResult({origin: SANDBOX, source: sandbox, data: message('wrong-nonce-value-000000')}, {nonce, frameWindow: wrapper, config}), null, 'wrong nonce');
 assert.equal(readResult({origin: 'https://evil.example', source: sandbox, data: message(nonce)}, {nonce, frameWindow: wrapper, config}), null, 'untrusted origin');
 assert.equal(readResult({origin: SANDBOX, source: stranger, data: message(nonce)}, {nonce, frameWindow: wrapper, config}), null, 'foreign frame');
 assert.equal(readResult({origin: SANDBOX, source: sandbox, data: {...message(nonce), type: 'other'}}, {nonce, frameWindow: wrapper, config}), null, 'wrong type');
 assert.equal(readResult({origin: SANDBOX, source: sandbox, data: 'string'}, {nonce, frameWindow: wrapper, config}), null, 'not an object');
});

test('result fields are sanitised; emails are never reported for an uncaptured enquiry', () => {
 const {wrapper, sandbox} = frames();
 const nonce = createNonce();
 const failed = readResult({origin: SANDBOX, source: sandbox, data: message(nonce, {captured: false, ok: false, acknowledgementEmailSent: true, acknowledgementQueued: true, submissionId: 'IR-1', code: 'verification_failed'})}, {nonce, frameWindow: wrapper, config});
 assert.deepEqual(failed, {captured: false, submissionId: '', acknowledgementEmailSent: false, acknowledgementQueued: false, internalEmailSent: false, code: 'verification_failed'});
 const odd = readResult({origin: SANDBOX, source: sandbox, data: message(nonce, {submissionId: '<img src=x>', code: 'DROP TABLE'})}, {nonce, frameWindow: wrapper, config});
 assert.equal(odd.submissionId, '');
 assert.equal(odd.code, 'captured');
});

// A window/iframe pair that behaves like the browser for the transport.
function harness() {
 const win = new EventTarget();
 const {top, wrapper, sandbox, stranger} = frames();
 const frame = new EventTarget();
 frame.contentWindow = Object.defineProperty(wrapper, 'location', {get() { throw new Error('cross-origin'); }, configurable: true});
 let submits = 0;
 const form = {submit() { submits++; }};
 const post = (origin, source, data) => win.dispatchEvent(Object.assign(new Event('message'), {origin, source, data}));
 return {win, frame, form, sandbox, stranger, top, post, submits: () => submits};
}

test('iframe submission resolves with the verified result and ignores impostors first', async () => {
 const h = harness();
 const nonce = createNonce();
 const pending = submitThroughFrame({form: h.form, frame: h.frame, nonce, config, win: h.win});
 assert.equal(h.submits(), 1, 'the form was posted natively');
 h.post('https://evil.example', h.sandbox, message(nonce, {captured: false}));
 h.post(SANDBOX, h.stranger, message(nonce, {captured: false}));
 h.post(SANDBOX, h.sandbox, message('0'.repeat(36), {captured: false}));
 h.post(SANDBOX, h.sandbox, message(nonce, {acknowledgementEmailSent: false}));
 const result = await pending;
 assert.equal(result.captured, true);
 assert.equal(result.acknowledgementEmailSent, false);
});

test('a backend failure is reported as not captured', async () => {
 const h = harness();
 const nonce = createNonce();
 const pending = submitThroughFrame({form: h.form, frame: h.frame, nonce, config, win: h.win});
 h.post(SANDBOX, h.sandbox, message(nonce, {ok: false, captured: false, code: 'server_error', submissionId: ''}));
 assert.deepEqual(outcomeFor(await pending), {state: 'error'});
});

test('endpoint unavailable: the response page loads but never reports', async () => {
 const h = harness();
 const pending = submitThroughFrame({form: h.form, frame: h.frame, nonce: createNonce(), config, win: h.win});
 h.frame.dispatchEvent(new Event('load'));
 await assert.rejects(pending, error => error instanceof TransportError && error.code === 'unavailable');
});

test('no answer at all times out', async () => {
 const h = harness();
 await assert.rejects(submitThroughFrame({form: h.form, frame: h.frame, nonce: createNonce(), config, win: h.win}), error => error.code === 'timeout');
});

test('a late message after the outcome is ignored and listeners are removed', async () => {
 const h = harness();
 const nonce = createNonce();
 const pending = submitThroughFrame({form: h.form, frame: h.frame, nonce, config, win: h.win});
 h.post(SANDBOX, h.sandbox, message(nonce));
 await pending;
 // Nothing is listening any more, so a second (e.g. replayed) message cannot change anything.
 h.post(SANDBOX, h.sandbox, message(nonce, {captured: false}));
});

// ---- Turnstile ---------------------------------------------------------------------------------------

function fakeTurnstile(script) {
 const calls = {render: 0, execute: 0, reset: 0, remove: 0};
 let options;
 const api = {
  render(container, opts) { calls.render++; options = opts; return 'widget-1'; },
  execute() { calls.execute++; const step = script.shift(); queueMicrotask(() => step(options)); },
  reset() { calls.reset++; },
  remove() { calls.remove++; }
 };
 const container = {classes: new Set(), classList: {add(c) { container.classes.add(c); }, remove(c) { container.classes.delete(c); }}};
 return {api, calls, container, options: () => options};
}

test('Turnstile: invisible managed widget, contact_submit action, fresh token each submission', async () => {
 const t = fakeTurnstile([o => o.callback('token-1'), o => o.callback('token-2')]);
 const widget = createTurnstile({container: t.container, siteKey: config.turnstileSiteKey, action: config.turnstileAction, scriptUrl: config.turnstileScript, win: {turnstile: t.api}, doc: {}});
 assert.equal(await widget.getToken(), 'token-1');
 const o = t.options();
 assert.equal(o.sitekey, '0x4AAAAAAFDWHGP2v8v-q-xS');
 assert.equal(o.action, 'contact_submit');
 assert.equal(o.execution, 'execute');
 assert.equal(o.appearance, 'interaction-only');
 assert.equal(o['response-field'], false);
 assert.equal(t.calls.reset, 0);
 assert.equal(await widget.getToken(), 'token-2');
 assert.equal(t.calls.reset, 1, 'a consumed token is never reused: reset before the second execution');
 assert.equal(t.calls.render, 1);
});

test('Turnstile failure rejects, and a retry after reset obtains a new token', async () => {
 const t = fakeTurnstile([o => o['error-callback']('300030'), o => o.callback('token-after-retry')]);
 const widget = createTurnstile({container: t.container, siteKey: 'k', action: 'contact_submit', scriptUrl: 'x', win: {turnstile: t.api}, doc: {}, timeoutMs: 200});
 await assert.rejects(widget.getToken(), error => error instanceof TurnstileError);
 widget.reset();
 assert.equal(await widget.getToken(), 'token-after-retry');
});

test('Turnstile timeout rejects, but not while the visitor is solving a visible challenge', async () => {
 const silent = fakeTurnstile([() => {}]);
 const w1 = createTurnstile({container: silent.container, siteKey: 'k', action: 'a', scriptUrl: 'x', win: {turnstile: silent.api}, doc: {}, timeoutMs: 50});
 await assert.rejects(w1.getToken(), error => error.code === 'timeout');

 const interactive = fakeTurnstile([o => { o['before-interactive-callback'](); setTimeout(() => { o['after-interactive-callback'](); o.callback('solved'); }, 120); }]);
 const w2 = createTurnstile({container: interactive.container, siteKey: 'k', action: 'a', scriptUrl: 'x', win: {turnstile: interactive.api}, doc: {}, timeoutMs: 50});
 assert.equal(await w2.getToken(), 'solved');
 assert.equal(interactive.container.classes.has('is-interactive'), false);
});

// ---- attribution -----------------------------------------------------------------------------------

function memoryStorage() { const map = new Map(); return {getItem: k => map.get(k) ?? null, setItem: (k, v) => map.set(k, String(v)), map}; }

test('external referrers keep origin and path only; internal referrers are not attribution', () => {
 assert.equal(externalReferrer('https://www.google.com/search?q=secret#x', 'https://innooryze.com'), 'https://www.google.com/search');
 assert.equal(externalReferrer('https://innooryze.com/about', 'https://innooryze.com'), '');
 assert.equal(externalReferrer('javascript:alert(1)', 'https://innooryze.com'), '');
 assert.equal(externalReferrer('', 'https://innooryze.com'), '');
});

test('landing attribution survives internal pages in the same session', () => {
 const storage = memoryStorage();
 captureAttribution({storage, location: {search: '?utm_source=linkedin&utm_medium=social&utm_campaign=launch', origin: 'https://innooryze.com'}, document: {referrer: 'https://www.linkedin.com/feed/?token=abc'}});
 captureAttribution({storage, location: {search: '', origin: 'https://innooryze.com'}, document: {referrer: 'https://innooryze.com/'}});
 captureAttribution({storage, location: {search: '', origin: 'https://innooryze.com'}, document: {referrer: 'https://innooryze.com/about'}});
 const record = readAttribution({storage, location: {search: '', origin: 'https://innooryze.com'}, document: {referrer: 'https://innooryze.com/work'}});
 assert.deepEqual(record, {referrer: 'https://www.linkedin.com/feed/', utmsource: 'linkedin', utmmedium: 'social', utmcampaign: 'launch', utmcontent: '', utmterm: ''});
});

test('a direct landing stays direct through internal pages; a new campaign arrival replaces it', () => {
 const storage = memoryStorage();
 const here = {search: '', origin: 'https://innooryze.com'};
 captureAttribution({storage, location: here, document: {referrer: ''}});
 captureAttribution({storage, location: here, document: {referrer: 'https://innooryze.com/work'}});
 assert.equal(readAttribution({storage, location: here, document: {referrer: 'https://www.google.com/'}}).referrer, '', 'stored direct landing wins over the contact page referrer');
 captureAttribution({storage, location: {search: '?utm_source=newsletter', origin: 'https://innooryze.com'}, document: {referrer: ''}});
 captureAttribution({storage, location: here, document: {referrer: 'https://innooryze.com/'}});
 assert.equal(readAttribution({storage, location: here, document: {referrer: ''}}).utmsource, 'newsletter');
 const blocked = {getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }};
 captureAttribution({storage: blocked, location: {search: '?utm_source=x', origin: 'https://innooryze.com'}, document: {referrer: ''}});
 assert.equal(readAttribution({storage: blocked, location: {search: '?utm_term=crm', origin: 'https://innooryze.com'}, document: {referrer: ''}}).utmterm, 'crm');
});

test('UTM values are length-limited and stripped of control characters', () => {
 const record = deriveAttribution({search: '?utm_source=' + encodeURIComponent('a\nb') + '&utm_term=' + 'x'.repeat(400), referrer: '', origin: 'https://innooryze.com'});
 assert.equal(record.utmsource, 'a b');
 assert.equal(record.utmterm.length, 150);
});
