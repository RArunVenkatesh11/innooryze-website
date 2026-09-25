# Vercel adapter

> **Status: Vercel is staging only, and permanently non-indexable.**
> Every Vercel deployment, including Vercel's own "production" deployment at innooryze-website.vercel.app,
> builds as `noindex,nofollow` with `robots.txt` `Disallow: /`, and every Vercel response carries
> `X-Robots-Tag: noindex, nofollow`. innooryze.com is not planned to run on Vercel; production is
> self-hosted from `npm run build:production`. This document describes the Vercel *adapter* only.
>
> Nothing here is required to ship the site elsewhere. `dist/` is host-agnostic, `npm run build:production`
> works with no Vercel signal present, and the Apache and static-host adapters are generated alongside it.
> See docs/DEPLOYMENT.md for the adapter model. Do not add Vercel APIs, serverless functions, middleware
> or runtime dependencies without approval.


## Why this adapter exists

Vercel reads **none** of `_headers` (Netlify/Cloudflare Pages), `.htaccess` (Apache) or `_redirects`
(Netlify). Those files are still generated, because the self-hosted Apache/cPanel release depends on them,
but on Vercel every header and redirect comes from **`vercel.json`**. Treat that file as the source of
truth for Vercel and the other three as the source of truth for the cPanel upload.

## Indexing: Vercel is staging, always

`src/config/environment.mjs` decides indexability with two rules:

```
if (building on Vercel: VERCEL or VERCEL_ENV set) -> NOT indexable   (any environment, cannot be overridden)
else if (SITE_INDEXABLE === 'true')               -> indexable       (the explicit release signal)
else                                              -> NOT indexable   (fail safe)
```

* **Vercel is never indexable.** That includes Vercel's own "production" deployment
  (innooryze-website.vercel.app) as well as previews and branch deploys. Neither `SITE_INDEXABLE=true` in
  the Vercel dashboard nor running `npm run build:production` on Vercel changes this.
* **Indexing needs an explicit signal.** No platform variable makes a build indexable. The self-hosted
  production release uses `npm run build:production`, which sets `SITE_INDEXABLE=true`.
* **Fail safe.** A local `npm run build`, a CI build or an unrecognised host without the signal produces a
  noindex artifact.

A non-indexable build is `noindex,nofollow` on every page, including the 404 and the legacy-alias
redirect pages, and its `robots.txt` is exactly `User-agent: *` / `Disallow: /` with no `Sitemap:` line.
An indexable build keeps `index,follow` on its 28 canonical pages and `noindex,follow` on the utility pages
(credits, 404, alias redirects).

**Second safety net.** `vercel.json` adds `X-Robots-Tag: noindex, nofollow` to every response Vercel
serves, as its own header rule. Only Vercel reads `vercel.json`, so the header never reaches a self-hosted
production server; `_headers` and `.htaccess` never carry it, and `npm run check:production` fails if
either ever does.

Verified build matrix:

| Build | Summary line | robots.txt | meta robots |
|---|---|---|---|
| `VERCEL=1 VERCEL_ENV=production npm run build` (the staging deployment) | `NOINDEX (Vercel staging, VERCEL_ENV=production (forced noindex))` | `Disallow: /`, no sitemap line | `noindex,nofollow` on all 32 |
| `VERCEL=1 VERCEL_ENV=production SITE_INDEXABLE=true npm run build` | `NOINDEX (Vercel staging … forced noindex)` | `Disallow: /` | `noindex,nofollow` |
| `VERCEL=1 VERCEL_ENV=production npm run build:production` | `NOINDEX (Vercel staging … forced noindex)` | `Disallow: /` | `noindex,nofollow` |
| `VERCEL=1 VERCEL_ENV=preview npm run build` | `NOINDEX (Vercel staging, VERCEL_ENV=preview (forced noindex))` | `Disallow: /` | `noindex,nofollow` |
| `npm run build` (local, no signals) | `NOINDEX (no production signal)` | `Disallow: /` | `noindex,nofollow` |
| `npm run build:production` (self-hosted release) | `INDEXABLE (SITE_INDEXABLE=true)` | `Allow: /` + sitemap | `index,follow` |

Every build prints its decision and the reason, so a wrong environment is visible in the deploy log.

### Staging: canonicals, sitemap and Search Console

Three deliberate decisions, all reported rather than hidden:

* **Canonicals stay production** on staging. A staging page declares `https://innooryze.com/...` as
  canonical, so anything that does reach it consolidates onto production rather than competing with it.
  `noindex` is the actual control; the canonical is the second line of defence.
* **`sitemap.xml` is still written** on staging, so the artifact has the same shape and the validator can
  run against either build — but staging `robots.txt` contains **no `Sitemap:` line**, so nothing
  advertises it. A crawler that fetched it directly would only find the production URLs it already knows.
* **The Search Console meta tag stays on staging pages.** Removing it per-environment would add
  complexity for no benefit: `noindex` (page and header) plus `Disallow: /` is the search control, and the token only ever
  verifies ownership of the property it is registered against.

## vercel.json

Generated by `npm run sync:vercel` from `src/config/headers.mjs`, `src/redirects.mjs` and `src/site.mjs`.
**Do not hand-edit it** — `npm run check:production` fails if the committed file has drifted from what the
sources would generate, so a stale `vercel.json` cannot ship.

It sets:

* `buildCommand: npm run build` and `outputDirectory: dist` — the environment-aware build.
* `trailingSlash: false` — canonical URLs carry no trailing slash, so Vercel normalises to match.
* **Redirects** — the www canonical host, and the two legacy aliases in both slash forms.
* **Headers** — the security set below, on `/(.*)`.

## Redirects

| From | To | Status |
|---|---|---|
| `https://www.innooryze.com/*` | `https://innooryze.com/*` | 308 permanent, path and query preserved |
| `/work/maxseal` and `/work/maxseal/` | `/work/industrial-valve-digital-experience` | 308 permanent |
| `/work/max-seal` and `/work/max-seal/` | `/work/industrial-valve-digital-experience` | 308 permanent |

Both slash forms are listed explicitly so each alias resolves in **one hop** instead of chaining through
trailing-slash normalisation. The validator asserts no alias destination is itself an alias, so a chain
cannot be introduced later.

The build still emits `dist/work/maxseal/index.html` and `dist/work/max-seal/index.html` as `noindex`
meta-refresh documents. On Vercel the redirect fires first and those files are never served; they remain
as the portability fallback for the Apache/cPanel release. The alias routes stay out of the sitemap,
canonical to the target, and non-indexable on every host.

## Security headers

Defined once in `src/config/headers.mjs` and emitted to `vercel.json`, `_headers` and `.htaccess`, so all
three agree.

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000` |
| `Content-Security-Policy` | see below |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

**HSTS is deliberately conservative: one year, no `includeSubDomains`, no `preload`.**
`includeSubDomains` would bind every current and future subdomain — `assessment.innooryze.com` and any
mail or tooling host — to HTTPS-only for a year, and `preload` is effectively irreversible. Both are worth
enabling once every subdomain is confirmed HTTPS-only; neither is worth the risk at launch. To upgrade
later, change `HSTS` in `src/config/headers.mjs` and run `npm run sync:vercel`.

### CSP

Unchanged in substance from the consent work. `script-src` permits `https://www.googletagmanager.com` and
nothing else — **no `unsafe-inline`, no `unsafe-eval`**; the validator asserts both. Google's regional
collection hosts are allowed in `connect-src` and `img-src`. `'unsafe-inline'` remains in `style-src`
only, for the handful of computed custom properties the build inlines.

The policy permits those origins at all times; **consent decides whether anything is ever requested from
them**. Analytics gating is unchanged: `GT-WF4XRBSQ` loads only after analytics consent *and* only on
`innooryze.com` / `www.innooryze.com`. `GTM-NJPT6DRQ` remains disabled and appears nowhere in the build.

## Assets withheld from the release

`src/config/distExclusions.mjs` lists exact paths — never globs — that stay in `public/` but are not
copied into `dist`: owner-supplied source masters, superseded logo originals and historical image
iterations. Nothing is deleted; `public/` remains the archive of record.

The build enforces two rules, so the list cannot rot:

1. If a listed file no longer exists, the build fails ("remove the entry").
2. After rendering, the build scans everything the release actually serves — pages, stylesheet, browser
   modules, licence records, routing files — and fails if any of them still names a withheld file.

`npm run check:production` additionally asserts none of the listed paths exists in `dist`.

To withhold another file: prove it has zero references (the build will refuse otherwise), then add it with
a reason.

## Testing before launch

**Staging**, on https://innooryze-website.vercel.app (or any other `*.vercel.app` deployment):

1. `curl -sI https://<deployment>.vercel.app/` — expect the six security headers **and**
   `X-Robots-Tag: noindex, nofollow`.
2. `curl -s https://<deployment>.vercel.app/robots.txt` — expect exactly `User-agent: *` / `Disallow: /`
   and **no** `Sitemap:` line.
3. View source on any page — expect `<meta name="robots" content="noindex,nofollow">`.
4. `curl -sI https://<deployment>.vercel.app/work/maxseal` — expect `308` straight to the target.
5. Open DevTools → Network, filter `google`, load a page: **empty before consent, and still empty after
   Accept all**, because the hostname is not on the allowlist.

**Production** (self-hosted, from `npm run build:production`), on `https://innooryze.com`:

1. `curl -sI https://innooryze.com/` — six headers, including HSTS.
2. `curl -s https://innooryze.com/robots.txt` — `Allow: /` plus the sitemap line; pages are `index,follow` and
   there is **no** `X-Robots-Tag` header.
3. `curl -sI https://www.innooryze.com/work` — `308` to `https://innooryze.com/work`.
4. `curl -sI https://innooryze.com/work/max-seal` — `308`, one hop, to the anonymous route.
5. `curl -s https://innooryze.com/sitemap.xml` — 28 URLs, no `/credits`, no aliases.
6. DevTools → Network, filter `google`: nothing before consent; after Accept all, exactly one
   `gtag/js?id=GT-WF4XRBSQ`.
7. Submit the sitemap in Search Console.

## Vercel is not a production host

InnooRyze production is not planned to run on Vercel, and the adapter is built so it cannot: every Vercel
build is noindex and every Vercel response carries `X-Robots-Tag: noindex, nofollow`. Do not attach
innooryze.com or www.innooryze.com to the Vercel project and do not point DNS at Vercel; the site would be
served but excluded from search. `SITE_INDEXABLE` in the Vercel dashboard has no effect.

Keep the Vercel project settings as they are: build command `npm run build`, output directory `dist`
(both declared in `vercel.json`). Moving production to Vercel would be a deliberate architecture change:
the environment rule, the `X-Robots-Tag` rule and this document would all have to change together.
