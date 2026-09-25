// One definition of the security headers, shared by every deployment target.
//
// Vercel reads none of _headers (Netlify/Cloudflare Pages), .htaccess (Apache) or _redirects (Netlify).
// Those files remain for the self-hosted Apache/cPanel release, but on Vercel the headers and redirects
// come from vercel.json, which scripts/sync-vercel.mjs generates from this module. scripts/validate.mjs
// fails if the committed vercel.json has drifted from it, so the two cannot disagree.

import {analyticsCsp} from './analytics.mjs';
import {contactCsp} from './contact.mjs';

// The Google tag is only ever fetched after consent, but the policy has to permit it in advance.
// The contact form adds exact hosts only (src/config/contact.mjs): the Turnstile loader and challenge frame,
// and the Apps Script endpoint the form posts into a hidden iframe. Nothing else is opened up: no
// 'unsafe-inline' in script-src, no wildcards beyond Google's own regional analytics collection hosts.
export function contentSecurityPolicy() {
 return [
  "default-src 'self'",
  "script-src 'self' " + [...analyticsCsp.script, ...contactCsp.script].join(' '),
  // 'unsafe-inline' remains only for styles: the build inlines a handful of computed custom properties.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: " + analyticsCsp.img.join(' '),
  "media-src 'self' blob:",
  'connect-src ' + ["'self'", ...analyticsCsp.connect].join(' '),
  "frame-src 'self' " + contactCsp.frame.join(' '),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' mailto: " + contactCsp.formAction.join(' '),
  "frame-ancestors 'self'"
 ].join('; ');
}

// One year, no includeSubDomains, no preload — deliberately conservative.
// includeSubDomains would bind every current and future subdomain (assessment.innooryze.com and any mail
// or tooling host) to HTTPS for a year, and preload is effectively irreversible. Both are worth enabling
// later, once every subdomain is confirmed HTTPS-only; neither is worth risking at launch.
export const HSTS = 'max-age=31536000';

export function securityHeaders() {
 return [
  ['X-Content-Type-Options', 'nosniff'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  // X-Frame-Options for older agents; frame-ancestors in the CSP is the modern control.
  ['X-Frame-Options', 'SAMEORIGIN'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
  ['Strict-Transport-Security', HSTS],
  ['Content-Security-Policy', contentSecurityPolicy()]
 ];
}
