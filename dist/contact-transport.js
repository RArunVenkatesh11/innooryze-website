// Transport for the Apps Script contact endpoint: a normal HTML form POST into a hidden iframe, answered by
// a postMessage from the response page.
//
// Why not fetch(): Apps Script web apps answer through Google's own redirect and content hosts and do not
// return CORS headers a browser will accept for a JSON POST, so a cross-origin fetch either fails or (with
// mode:'no-cors') succeeds blindly without saying whether the enquiry was recorded. A form post needs no
// CORS at all, and the response page reports the real outcome back to this window.
//
// A message is accepted only when all of these hold:
//  1. its origin is an expected Google Apps Script response origin (config.responseOrigins / pattern);
//  2. it comes from inside the iframe this submission created (the iframe's window or a frame nested in it,
//     which is where HtmlService runs the response script);
//  3. its type is the InnooRyze contact result and its nonce equals this submission's random nonce.
// Anything else is ignored, so no other window, frame or script can fake an outcome.

export class TransportError extends Error {
 constructor(code) { super('Contact endpoint ' + code); this.name = 'TransportError'; this.code = code; }
}

export function createNonce(cryptoImpl = globalThis.crypto) {
 const bytes = new Uint8Array(18);
 cryptoImpl.getRandomValues(bytes);
 return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function isTrustedResponseOrigin(origin, {responseOrigins = [], responseOriginPattern = ''} = {}) {
 if (typeof origin !== 'string') return false;
 if (responseOrigins.includes(origin)) return true;
 return Boolean(responseOriginPattern) && new RegExp(responseOriginPattern).test(origin);
}

// Reading .parent is permitted across origins, so this works for the cross-origin response frames.
export function isFromFrame(source, frameWindow, depth = 3) {
 if (!source || !frameWindow) return false;
 let current = source;
 for (let i = 0; i <= depth && current; i++) {
  if (current === frameWindow) return true;
  let parent;
  try { parent = current.parent; } catch { return false; }
  if (!parent || parent === current) return false;
  current = parent;
 }
 return false;
}

// Returns the normalised result, or null when the message is not ours.
export function readResult(event, {nonce, frameWindow, config}) {
 if (!event || !isTrustedResponseOrigin(event.origin, config)) return null;
 if (!isFromFrame(event.source, frameWindow)) return null;
 const data = event.data;
 if (!data || typeof data !== 'object' || data.type !== config.resultType) return null;
 if (typeof data.submissionNonce !== 'string' || !nonce || data.submissionNonce !== nonce) return null;
 const captured = data.captured === true;
 return {
  captured,
  submissionId: captured && typeof data.submissionId === 'string' && /^[A-Za-z0-9-]{1,40}$/.test(data.submissionId) ? data.submissionId : '',
  acknowledgementEmailSent: captured && data.acknowledgementEmailSent === true,
  internalEmailSent: captured && data.internalEmailSent === true,
  code: typeof data.code === 'string' && /^[a-z_]{1,40}$/.test(data.code) ? data.code : (captured ? 'captured' : 'server_error')
 };
}

// A fresh iframe per submission: posting into an iframe adds a session-history entry, and removing the
// frame afterwards discards it, so the Back button keeps leaving the Contact page as expected.
export function replaceFrame({doc, name, host}) {
 doc.querySelectorAll('iframe[name="' + name + '"]').forEach(frame => frame.remove());
 const frame = doc.createElement('iframe');
 frame.name = name;
 frame.className = 'contact-submit-target';
 frame.title = 'Contact form submission channel';
 frame.tabIndex = -1;
 frame.setAttribute('aria-hidden', 'true');
 host.append(frame);
 return frame;
}

// Posts the form (which already carries every field, including the nonce) and resolves with the verified
// result. Rejects with TransportError('timeout' | 'unavailable') when no trusted answer arrives.
export function submitThroughFrame({form, frame, nonce, config, win = window}) {
 return new Promise((resolve, reject) => {
  let done = false, grace = null;
  const overall = setTimeout(() => finish(null, new TransportError('timeout')), config.responseTimeoutMs);
  function finish(result, error) {
   if (done) return;
   done = true;
   clearTimeout(overall); clearTimeout(grace);
   win.removeEventListener('message', onMessage);
   frame.removeEventListener('load', onLoad);
   if (error) reject(error); else resolve(result);
  }
  function onMessage(event) {
   const result = readResult(event, {nonce, frameWindow: frame.contentWindow, config});
   if (result) finish(result);
  }
  // The response page has loaded. HtmlService posts its message while loading, so silence from here on
  // means the endpoint answered with something else: an error page, a quota page, or nothing at all.
  function onLoad() {
   let blank = false;
   try { blank = frame.contentWindow.location.href === 'about:blank'; } catch { /* cross-origin: navigated */ }
   if (blank || grace) return;
   grace = setTimeout(() => finish(null, new TransportError('unavailable')), config.afterLoadGraceMs);
  }
  win.addEventListener('message', onMessage);
  frame.addEventListener('load', onLoad);
  try {
   // The prototype method, so a control named "submit" can never shadow it.
   const submit = win.HTMLFormElement?.prototype.submit || form.submit;
   submit.call(form);
  } catch { finish(null, new TransportError('unavailable')); }
 });
}
