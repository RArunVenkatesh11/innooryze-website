// Public configuration for the live contact form. Everything here is safe to ship to browsers: the Apps
// Script /exec URL and the Turnstile SITE key are public by design. The Turnstile secret and the Microsoft
// 365 credentials live only in the Apps Script project's Script Properties and never enter this repository.
// The build emits the browser-facing subset to dist/contact-config.js. See docs/CONTACT_INTEGRATION.md.

export const contact = {
 // Deployed Google Apps Script web app (integrations/apps-script/contact-form/Code.gs).
 endpoint: 'https://script.google.com/macros/s/AKfycbz6U22rjQfdcOciH0LW73VvW1kVSDlB7yLyuPICbbaI_p--6GAWpLUHoELayjltW_VN8A/exec',

 // Cloudflare Turnstile, Managed mode. The widget is registered for the two production hostnames only.
 turnstileSiteKey: '0x4AAAAAAFDWHGP2v8v-q-xS',
 turnstileAction: 'contact_submit',
 turnstileScript: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',

 // Real submissions happen only here. Every other host (localhost, 127.0.0.1, Vercel previews, branch
 // deploys) is excluded by omission and gets an explicit development-only state instead: the production
 // Turnstile widget does not work there, and a preview must never write to the live Sheet or send email.
 liveHosts: ['innooryze.com', 'www.innooryze.com', 'innooryze-website.vercel.app'],

 // Recorded in the Sheet's submittedfrom column. The backend accepts only values on its own allowlist.
 source: 'website_contact',

 // The hidden iframe the form posts into. The visitor never leaves the Contact page.
 frameName: 'contact-submit-target',

 // The postMessage envelope the Apps Script response sends back.
 resultType: 'innooryze:contact-result',

 // Where that message can legitimately come from. HtmlService output runs in Google's sandbox frame on a
 // per-script subdomain of googleusercontent.com (n-<id>-script.googleusercontent.com), nested inside the
 // script.google.com page loaded in our iframe. The exact hosts are listed for completeness; the pattern
 // covers the sandbox host. Origin alone is not trusted: the message must also come from inside our own
 // iframe and carry the unguessable nonce of the submission in flight. Once the first live submission has
 // shown the exact sandbox origin, it can be pinned here and the pattern removed.
 responseOrigins: ['https://script.google.com', 'https://script.googleusercontent.com'],
 responseOriginPattern: '^https://n-[a-z0-9]+(?:-[a-z0-9]+)*-script\\.googleusercontent\\.com$',

 // Apps Script cold starts plus two Microsoft Graph calls normally finish in a few seconds. After the
 // response page has loaded, a missing message means the endpoint failed or is unavailable.
 responseTimeoutMs: 45000,
 afterLoadGraceMs: 12000,
 turnstileTimeoutMs: 25000
};

// The minimum Content-Security-Policy additions the integration needs, all exact hosts, no wildcards.
//  - script-src:  the official Turnstile loader (Cloudflare requires it to be loaded from this origin).
//  - frame-src:   the Turnstile challenge frame, and the Apps Script response frame. Google may redirect
//                 web-app output to script.googleusercontent.com, and CSP checks redirect targets too.
//  - form-action: the form posts to script.google.com (plus the same possible redirect target).
// No connect-src entry: nothing is fetched from the Apps Script endpoint.
export const contactCsp = {
 script: ['https://challenges.cloudflare.com'],
 frame: ['https://challenges.cloudflare.com', 'https://script.google.com', 'https://script.googleusercontent.com'],
 formAction: ['https://script.google.com', 'https://script.googleusercontent.com']
};

// The subset the browser needs.
export function browserContactConfig() {
 const {endpoint, turnstileSiteKey, turnstileAction, turnstileScript, liveHosts, source, frameName, resultType,
  responseOrigins, responseOriginPattern, responseTimeoutMs, afterLoadGraceMs, turnstileTimeoutMs} = contact;
 return {endpoint, turnstileSiteKey, turnstileAction, turnstileScript, liveHosts, source, frameName, resultType,
  responseOrigins, responseOriginPattern, responseTimeoutMs, afterLoadGraceMs, turnstileTimeoutMs};
}
