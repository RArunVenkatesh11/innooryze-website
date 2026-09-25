// Which deployment is this, and may it be indexed?
//
// The previous rule was `process.env.SITE_INDEXABLE !== 'false'`, which defaults to INDEXABLE. That is
// fail-open: Vercel runs `npm run build` with no variables set, so every preview deployment published
// itself as indexable, with production canonicals and the production sitemap. This module inverts that.
//
// Two principles:
//   1. Fail safe. If we cannot prove this is production, the build is not indexable.
//   2. The platform's own signal wins. Vercel sets VERCEL_ENV on every build ('production' | 'preview' |
//      'development'). A preview deployment is never indexable, even if a script or a stray environment
//      variable asks for it — that is the failure mode we are removing, so it must not be overridable.
//
// SITE_INDEXABLE remains as an explicit override for the self-hosted release path (build:production) and
// for staging an Apache/cPanel upload, but it can only ever *restrict* on a non-production Vercel build.

export const vercelEnv = process.env.VERCEL_ENV || '';           // '' when not building on Vercel
export const isVercel = Boolean(process.env.VERCEL || vercelEnv);

export function resolveIndexable() {
 // On Vercel, anything that is not the production deployment is decisively noindex.
 if (vercelEnv && vercelEnv !== 'production') return false;
 const explicit = process.env.SITE_INDEXABLE;
 if (explicit === 'true') return true;
 if (explicit === 'false') return false;
 if (vercelEnv === 'production') return true;
 // Local `npm run build`, CI, or an unknown host: not provably production, so not indexable.
 return false;
}

export function describeEnvironment() {
 const indexable = resolveIndexable();
 const source = vercelEnv && vercelEnv !== 'production' ? `VERCEL_ENV=${vercelEnv} (forced noindex)`
  : process.env.SITE_INDEXABLE === 'true' ? 'SITE_INDEXABLE=true'
  : process.env.SITE_INDEXABLE === 'false' ? 'SITE_INDEXABLE=false'
  : vercelEnv === 'production' ? 'VERCEL_ENV=production'
  : 'no production signal (default noindex)';
 return {vercelEnv: vercelEnv || 'none', isVercel, indexable, source};
}
