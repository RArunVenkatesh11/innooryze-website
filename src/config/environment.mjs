// Which deployment is this, and may it be indexed?
//
// The previous rule was `process.env.SITE_INDEXABLE !== 'false'`, which defaults to INDEXABLE. That is
// fail-open: Vercel runs `npm run build` with no variables set, so every preview deployment published
// itself as indexable, with production canonicals and the production sitemap. This module inverts that.
//
// Two principles:
//   1. Fail safe. A build is indexable only on an explicit release signal: SITE_INDEXABLE=true, which
//      npm run build:production sets. No platform variable can make a build indexable on its own.
//   2. Vercel is staging only. Anything built on Vercel (VERCEL / VERCEL_ENV set) is never indexable, for
//      every environment including Vercel's own "production" deployment (innooryze-website.vercel.app), and
//      even if SITE_INDEXABLE=true is set there. vercel.json adds X-Robots-Tag: noindex as a second net.

export const vercelEnv = process.env.VERCEL_ENV || '';           // '' when not building on Vercel
export const isVercel = Boolean(process.env.VERCEL || vercelEnv);

export function resolveIndexable() {
 // Vercel is staging, always.
 if (isVercel) return false;
 // Only the explicit release signal makes a build indexable. Local `npm run build`, CI or an unknown host
 // without it is not provably production, so not indexable.
 return process.env.SITE_INDEXABLE === 'true';
}

export function describeEnvironment() {
 const indexable = resolveIndexable();
 const source = isVercel ? `Vercel staging, VERCEL_ENV=${vercelEnv || 'unset'} (forced noindex)`
  : process.env.SITE_INDEXABLE === 'true' ? 'SITE_INDEXABLE=true'
  : process.env.SITE_INDEXABLE === 'false' ? 'SITE_INDEXABLE=false'
  : 'no production signal (default noindex)';
 return {vercelEnv: vercelEnv || 'none', isVercel, indexable, source};
}
