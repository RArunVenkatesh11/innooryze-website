// Landing attribution for the current browser session: the external referrer and UTM parameters of the
// page a visitor arrived on from outside the site, remembered in sessionStorage so an enquiry made several
// pages later still carries them. First-party, per-tab, cleared when the tab closes, never sent anywhere except with an
// enquiry the visitor chooses to submit — so it needs no marketing consent and never loads analytics.

const KEY = 'innooryze.attribution';
export const UTM_PARAMS = [['utm_source','utmsource'],['utm_medium','utmmedium'],['utm_campaign','utmcampaign'],['utm_content','utmcontent'],['utm_term','utmterm']];

const clean = (value, max) => String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

// Only an external referrer is attribution; moving between our own pages is not. The query string and
// fragment are dropped because other sites put session tokens and personal data there.
export function externalReferrer(referrer, ownOrigin) {
 try {
  const url = new URL(referrer);
  if (!/^https?:$/.test(url.protocol) || url.origin === ownOrigin) return '';
  return (url.origin + url.pathname).slice(0, 500);
 } catch { return ''; }
}

export function deriveAttribution({search = '', referrer = '', origin = ''} = {}) {
 const params = new URLSearchParams(search);
 const record = {referrer: externalReferrer(referrer, origin)};
 for (const [param, key] of UTM_PARAMS) record[key] = clean(params.get(param), 150);
 return record;
}

const hasSignal = record => Object.values(record).some(Boolean);

function read(storage) {
 try {
  const value = JSON.parse(storage?.getItem(KEY) || 'null');
  return value && typeof value === 'object' ? value : null;
 } catch { return null; }
}

// Called on every page load. Moving between our own pages never changes the record, so the Contact page
// sees the attribution of the page the visitor landed on. An arrival from outside that carries its own
// signal (UTM parameters or an external referrer) is a new landing and replaces it, the same rule
// analytics tools use for a new campaign visit; a session that arrived directly is stored as
// captured:'none' so a later internal page is never mistaken for the landing page.
export function captureAttribution({storage = globalThis.sessionStorage, location = globalThis.location, document = globalThis.document} = {}) {
 const record = deriveAttribution({search: location?.search, referrer: document?.referrer, origin: location?.origin});
 if (!hasSignal(record) && read(storage)) return;
 try { storage?.setItem(KEY, JSON.stringify({...record, captured: hasSignal(record) ? 'landing' : 'none'})); } catch { /* storage blocked: fall back below */ }
}

// The attribution to send with an enquiry. Without session storage, the Contact page's own URL and
// referrer are the best remaining evidence.
export function readAttribution({storage = globalThis.sessionStorage, location = globalThis.location, document = globalThis.document} = {}) {
 const stored = read(storage);
 const record = stored || deriveAttribution({search: location?.search, referrer: document?.referrer, origin: location?.origin});
 const out = {referrer: clean(record.referrer, 500)};
 for (const [, key] of UTM_PARAMS) out[key] = clean(record[key], 150);
 return out;
}
