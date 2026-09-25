import {normalizeLead,leadKeys,leadEnvelope} from './lead.js';
import {readAttribution} from './attribution.js';
import {createTurnstile} from './turnstile.js';
import {createNonce,replaceFrame,submitThroughFrame} from './contact-transport.js';
import {announceLeadCaptured} from './integrations.js';

// Contact form controller: IDLE → SUBMITTING → SUCCESS | ERROR.
// The form posts natively (urlencoded) into a hidden iframe; see contact-transport.js for why and how the
// result is verified. An enquiry counts as received when the backend reports captured:true — the enquiry
// record is the durable copy, so a failed notification or acknowledgement email never turns a captured
// enquiry into an error.

export const FAILURE_EMAIL = 'enquiry@innooryze.com';
export const FAILURE_MESSAGE = 'We couldn’t send your message right now. Please try again or email ';
export const PREVIEW_MESSAGE = 'Development preview: enquiries are sent only from innooryze.com, so nothing was sent from this copy of the site. Please email ';

// Real submissions happen only on the production hostnames (allowlist; everything else is excluded).
export function isLiveHost(hostname, config) {
 return Array.isArray(config?.liveHosts) && config.liveHosts.includes(hostname);
}

// What the interface does with a verified backend result (or with none at all).
export function outcomeFor(result) {
 if (result && result.captured === true) return {state: 'success', confirmation: result.acknowledgementEmailSent === true};
 return {state: 'error'};
}

// The hidden transport fields for one submission. Everything the backend receives besides the visible
// fields is set here, immediately before posting, except formstartedat (set once, when the form became
// usable) and the honeypot (never touched).
export function transportFields({lead, config, attribution, token, nonce, origin, now = Date.now()}) {
 const envelope = leadEnvelope(lead, {source: config.source, attribution});
 return {
  submittedfrom: envelope.submittedfrom,
  referrer: envelope.referrer,
  utmsource: envelope.utmsource,
  utmmedium: envelope.utmmedium,
  utmcampaign: envelope.utmcampaign,
  utmcontent: envelope.utmcontent,
  utmterm: envelope.utmterm,
  turnstiletoken: token,
  submissionnonce: nonce,
  parentorigin: origin,
  formsubmittedat: String(now)
 };
}

export function initContactForm({config, motionStopped = () => false, win = window, doc = document} = {}) {
 const form = doc.querySelector('.contact-form');
 if (!form || !config) return;
 const wrap = form.closest('.contact-form-wrap');
 const feedback = form.querySelector('.form-feedback');
 const submit = form.querySelector('.form-submit');
 const status = form.querySelector('[data-form-status]');
 const initialLabel = submit.innerHTML;
 const live = isLiveHost(win.location.hostname, config);
 const field = name => form.elements.namedItem(name);
 const setField = (name, value) => { const el = field(name); if (el) el.value = value; };

 form.dataset.mode = live ? 'live' : 'preview';
 const setState = state => {
  form.dataset.state = state;
  const busy = state === 'submitting';
  form.setAttribute('aria-busy', String(busy));
  submit.disabled = busy;
  // The label loses its arrow while sending; the height is held so nothing below the button moves.
  if (busy) { submit.style.minHeight = submit.getBoundingClientRect().height + 'px'; submit.textContent = 'Sending…'; }
  else { submit.innerHTML = initialLabel; submit.style.minHeight = ''; }
 };
 setState('idle');

 // The form is usable from here. The backend compares this with the submit time to refuse instant bots.
 setField('formstartedat', String(Date.now()));

 const selected = new URLSearchParams(win.location.search).get('interest');
 const interest = field('whatcanwehelp');
 if (interest && [...interest.options].some(o => o.value === selected)) interest.value = selected;

 const turnstile = live ? createTurnstile({container: form.querySelector('[data-turnstile]'), siteKey: config.turnstileSiteKey,
  action: config.turnstileAction, scriptUrl: config.turnstileScript, timeoutMs: config.turnstileTimeoutMs, win, doc}) : null;
 if (turnstile) for (const type of ['focusin', 'pointerdown']) form.addEventListener(type, () => turnstile.warm(), {once: true});

 function show(message, {error = false, email = false} = {}) {
  feedback.hidden = false;
  feedback.classList.toggle('is-error', error);
  const p = doc.createElement('p');
  p.append(message);
  if (email) {
   const link = doc.createElement('a');
   link.href = 'mailto:' + FAILURE_EMAIL;
   link.textContent = FAILURE_EMAIL;
   p.append(link, '.');
  }
  feedback.replaceChildren(p);
 }
 const announce = text => { if (status) status.textContent = text; };

 form.addEventListener('input', event => {
  if (form.dataset.state !== 'submitting') feedback.hidden = true;
  const target = event.target;
  if (target.name && leadKeys.includes(target.name)) {
   target.removeAttribute('aria-invalid');
   const error = doc.getElementById(target.getAttribute('aria-describedby'));
   if (error) error.textContent = '';
  }
 });

 function fail() {
  setState('error');
  announce('');
  show(FAILURE_MESSAGE, {error: true, email: true});
  feedback.focus();
 }

 function succeed(result) {
  const template = doc.getElementById('contact-success-template');
  const panel = template.content.firstElementChild.cloneNode(true);
  if (!outcomeFor(result).confirmation) panel.querySelector('[data-confirmation]')?.remove();
  // Side by side, the frame keeps the form's height so neither the left column nor the section moves.
  wrap.style.setProperty('--contact-frame-height', wrap.getBoundingClientRect().height + 'px');
  wrap.classList.add('is-complete');
  turnstile?.remove();
  form.replaceWith(panel);
  panel.focus({preventScroll: true});
  const box = panel.querySelector('.contact-success-inner').getBoundingClientRect();
  if (box.top < 70 || box.bottom > win.innerHeight) panel.scrollIntoView({block: 'start', behavior: motionStopped() ? 'auto' : 'smooth'});
  announceLeadCaptured({area: result.area, source: config.source});
 }

 form.addEventListener('submit', async event => {
  event.preventDefault();
  if (form.dataset.state === 'submitting') return;

  const {lead, errors, valid} = normalizeLead(Object.fromEntries(new FormData(form)));
  for (const key of leadKeys) {
   const control = field(key);
   control.setAttribute('aria-invalid', String(Boolean(errors[key])));
   const error = doc.getElementById(control.getAttribute('aria-describedby'));
   if (error) error.textContent = errors[key] || '';
  }
  if (!valid) {
   show(errors.form || 'Please check the highlighted fields.', {error: true});
   const first = leadKeys.find(key => errors[key]);
   (first ? field(first) : feedback).focus();
   return;
  }

  if (!live) {
   show(PREVIEW_MESSAGE, {email: true});
   feedback.focus();
   return;
  }

  setState('submitting');
  feedback.hidden = true;
  announce('Sending your enquiry…');

  let result = null;
  try {
   const token = await turnstile.getToken();
   const nonce = createNonce();
   const values = transportFields({lead, config, attribution: readAttribution(), token, nonce, origin: win.location.origin});
   for (const [name, value] of Object.entries(values)) setField(name, value);
   const frame = replaceFrame({doc, name: config.frameName, host: wrap});
   try { result = await submitThroughFrame({form, frame, nonce, config, win}); }
   finally { frame.remove(); }
  } catch { result = null; }
  finally {
   // A token is single-use and a nonce belongs to one attempt; neither may be posted twice.
   setField('turnstiletoken', '');
   setField('submissionnonce', '');
  }

  if (outcomeFor(result).state === 'success') succeed({...result, area: lead.whatcanwehelp});
  else { turnstile.reset(); fail(); }
 });
}
