import {site} from '../src/site.mjs';
import {redirects} from '../src/redirects.mjs';
import {securityHeaders} from '../src/config/headers.mjs';

// Builds the vercel.json object from the same sources the build uses, so the committed file can never
// drift from the release it ships with. `npm run sync:vercel` writes it; scripts/validate.mjs fails if
// the committed file differs.
//
// Vercel reads vercel.json from the repository root before the build runs, which is why this is a
// committed artifact rather than something generated into dist/.

export const CANONICAL_HOST = new URL(site.url).host;   // innooryze.com

export function vercelConfig() {
 // Legacy client URLs. Both slash forms are listed explicitly so each alias resolves in a single hop
 // rather than chaining through trailing-slash normalisation.
 const aliasRedirects = Object.entries(redirects).flatMap(([from, to]) => [
  {source: from, destination: to, permanent: true},
  {source: from + '/', destination: to, permanent: true}
 ]);

 // Canonical host. The apex is canonical; www redirects to it, preserving path and query.
 // Vercel's domain settings can do this too — this entry makes the intent explicit and testable.
 const hostRedirect = {
  source: '/:path*',
  has: [{type: 'host', value: 'www.' + CANONICAL_HOST}],
  destination: 'https://' + CANONICAL_HOST + '/:path*',
  permanent: true
 };

 return {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  framework: null,
  // Canonical URLs carry no trailing slash, so Vercel normalises to match them.
  trailingSlash: false,
  redirects: [hostRedirect, ...aliasRedirects],
  headers: [{
   source: '/(.*)',
   headers: securityHeaders().map(([key, value]) => ({key, value}))
  }]
 };
}

export const vercelJson = () => JSON.stringify(vercelConfig(), null, 2) + '\n';
