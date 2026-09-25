// Cloudflare Turnstile for the contact form: Managed mode, rendered invisibly (appearance: interaction-only)
// and executed only when the visitor submits. Most visitors never see it; Cloudflare shows a checkbox in
// the form only when it decides a challenge is necessary. Every submission gets a fresh token: a token is
// single-use once the server has verified it, so the widget is reset before each new execution.
//
// The official script is loaded on the visitor's first interaction with the form (not on page load), so
// people who only read the Contact page make no request to Cloudflare.

export class TurnstileError extends Error {
 constructor(code) { super('Verification unavailable (' + code + ')'); this.name = 'TurnstileError'; this.code = code; }
}

export function createTurnstile({container, siteKey, action, scriptUrl, timeoutMs = 25000, win = window, doc = document}) {
 let loading = null, widgetId = null, executed = false, pending = null, timer = null;

 function load() {
  if (win.turnstile) return Promise.resolve(win.turnstile);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
   const script = doc.createElement('script');
   script.src = scriptUrl;
   script.async = true;
   script.onload = () => win.turnstile ? resolve(win.turnstile) : reject(new TurnstileError('script'));
   script.onerror = () => { loading = null; script.remove(); reject(new TurnstileError('script')); };
   doc.head.append(script);
  });
  return loading;
 }

 const settle = (fn, value) => { clearTimeout(timer); timer = null; const p = pending; pending = null; if (p) p[fn](value); };
 const armTimeout = () => { clearTimeout(timer); timer = setTimeout(() => settle('reject', new TurnstileError('timeout')), timeoutMs); };

 async function render() {
  const turnstile = await load();
  if (widgetId !== null) return turnstile;
  widgetId = turnstile.render(container, {
   sitekey: siteKey,
   action,
   execution: 'execute',
   appearance: 'interaction-only',
   'response-field': false,
   'refresh-expired': 'manual',
   size: 'flexible',
   theme: 'light',
   callback: token => settle('resolve', token),
   'error-callback': code => { settle('reject', new TurnstileError(String(code || 'error'))); return true; },
   'expired-callback': () => { executed = true; },
   'timeout-callback': () => settle('reject', new TurnstileError('challenge-timeout')),
   // A visible challenge is waiting on the visitor, so stop the clock and give the widget its space.
   'before-interactive-callback': () => { clearTimeout(timer); container.classList.add('is-interactive'); },
   'after-interactive-callback': () => { container.classList.remove('is-interactive'); if (pending) armTimeout(); }
  });
  return turnstile;
 }

 return {
  // Start loading early, on the first interaction with the form. Failures surface on submit instead.
  warm() { render().catch(() => {}); },

  // A fresh token for this submission.
  async getToken() {
   const turnstile = await render();
   if (pending) settle('reject', new TurnstileError('superseded'));
   if (executed) turnstile.reset(widgetId);
   executed = true;
   const token = new Promise((resolve, reject) => { pending = {resolve, reject}; });
   armTimeout();
   turnstile.execute(widgetId);
   return token;
  },

  // After a failed submission: discard the consumed token so the next attempt starts clean.
  reset() {
   settle('reject', new TurnstileError('reset'));
   container.classList.remove('is-interactive');
   if (widgetId !== null && win.turnstile) {
    try { win.turnstile.reset(widgetId); executed = false; } catch { /* reset again before the next execution */ }
   }
  },

  remove() {
   settle('reject', new TurnstileError('removed'));
   if (widgetId !== null && win.turnstile) try { win.turnstile.remove(widgetId); } catch { /* already gone */ }
   widgetId = null; executed = false;
  }
 };
}
