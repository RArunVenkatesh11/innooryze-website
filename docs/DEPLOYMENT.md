# Production deployment

> **Hosting status.** Vercel is currently a **temporary preview/testing environment only**. The final
> production hosting platform for innooryze.com is **To Be Confirmed**. Nothing in this repository assumes
> Vercel is permanent, and `dist/` is host-agnostic.
>
> **Deployment adapter model:**
>
> ```
> core site + build  ->  host-independent dist/  ->  hosting adapter
>
>   Vercel                   -> vercel.json          (repo root, not in dist)
>   Apache / cPanel          -> .htaccess            (generated into dist)
>   compatible static hosts  -> _headers, _redirects (generated into dist)
> ```
>
> All three adapters render the same security headers from `src/config/headers.mjs`, and
> `check:production` asserts they stay in parity. Keep all of them: each is the adapter for a host that is
> still a candidate. The canonical production origin is `https://innooryze.com` regardless of provider.
> See docs/VERCEL.md for the Vercel adapter specifics.

## Packages

Target: **https://innooryze.com**, at the domain document root. Extract innooryze-live-deploy.zip directly into public_html (or the configured root). index.html, .htaccess, style.css, JS modules, assets/, route directories, sitemap.xml, robots.txt, _headers and _redirects are at the ZIP root. **No Node/npm is needed on the production server.**

innooryze-production-source.zip contains source, package/lockfile, build settings, .env.example, CLAUDE.md, README, docs, scripts/tests, public assets/licenses and a generated dist snapshot. It excludes .git, hosting-account metadata, node_modules, caches, secrets, local research/temp files and unused legacy Singapore prototype media. The build does not depend on omitted files.

## Build from source

Install Node 20+ and npm, then run from the extracted project root:

```sh
npm ci
npm run build:production
npm test
npm run check:production
npm run preview
```

In another terminal run `node scripts/validate.mjs --production --http`. Preview serves **built dist files**, not a framework development server. The loopback address printed by this local tool is never embedded in the shipped website. Stop it after testing.

The build cleans only dist. Rebuild after source or public-setting changes. build:production pins SITE_URL=https://innooryze.com and SITE_INDEXABLE=true. Node 20.6+ can explicitly load settings with `node --env-file=.env scripts/build-production.mjs`; .env is not loaded implicitly. Public variables are embedded in output, so provider secrets do not belong there.

For an unindexed review build, set SITE_INDEXABLE=false before `npm run build`. Keep this separate from production ZIP creation. Optional existing Sites metadata belongs to its review account; the portable packages omit it and have no Sites runtime requirement.

## Apache / cPanel

1. Back up the current host files/configuration. Confirm the domain document root and SSL certificate.
2. Upload/extract the live ZIP at that root. Avoid an extra dist/ or project folder. Show hidden files and confirm .htaccess exists. Remove the uploaded ZIP from the public directory after extraction.
3. Use Apache 2.4.16+ with mod_rewrite and .htaccess overrides. The generated file disables directory listing/MultiViews, sets DirectoryIndex, exact known-route rewrites and a genuine 404. AllowNoSlash enables clean directory paths before trailing-slash redirects. Old /work/max-seal redirects to /work/maxseal. Known index.html and trailing-slash forms normalize to canonical paths.
4. Configure HTTPS and preferred non-www host through hosting settings. The package does not force a domain redirect that would break local verification. Confirm HTTP and www resolve to the canonical HTTPS origin.
5. If the host returns 500 because it disallows Options, RewriteOptions or header overrides, ask the provider to enable them or move equivalent directives into its virtual host. Do not blindly remove routing. Apache was not available in the development environment; smoke-test these rules on the actual host.
6. Test major routes, nested refreshes, the old alias, a missing URL with status 404, media ranges, navigation and form. Inspect live SEO before submitting the sitemap.

This is a static multi-page site: **do not add a blanket SPA fallback to /index.html**. Every route has complete HTML. Configuration follows Apache's [rewrite documentation](https://httpd.apache.org/docs/2.4/mod/mod_rewrite.html) and [directory handling documentation](https://httpd.apache.org/docs/2.4/mod/mod_dir.html).

## Other hosts

Use directory index resolution and a custom 404 with status 404. _redirects preserves Max-Seal aliases on compatible static hosts; _headers sets baseline headers on hosts supporting that format. Translate where ignored. Nginx can use `try_files $uri $uri/index.html =404` and `error_page 404 /404.html`, plus explicit legacy redirects. Root-relative assets require deployment at the domain root.

## Enquiries, policies and analytics

.env.example lists public settings. ENQUIRY_ENDPOINT is empty: the form validates and creates an **unsent email draft**, which visitors explicitly send through their email service. It never reports server delivery.

Direct delivery requires an HTTPS/same-origin JSON endpoint with server validation, spam/rate controls, appropriate data handling and CRM/email delivery. Return HTTP 2xx plus {"ok":true} only after acceptance. Cross-origin endpoints need CORS for the production origin. Payload/adapter details are in README and forms.js. Test rejected, timed-out and acknowledged delivery with the real provider. No real service delivery has been tested because no endpoint exists.

Google Analytics is live behind consent: the Google tag `GT-WF4XRBSQ` loads only after a visitor grants analytics consent **and** only on `innooryze.com` / `www.innooryze.com`. The Tag Manager container `GTM-NJPT6DRQ` from the old site is recorded but deliberately not loaded until its contents are audited. The Search Console token is on every page. All identifiers live in src/config/analytics.mjs; the build emits the browser subset to dist/analytics-config.js and derives the CSP allowlist from the same file. **docs/ANALYTICS.md is the full reference, including the debug override and the release verification table.**

integrations.js is a separate spam/analytics seam. ANALYTICS_ID alone installs nothing. Add a consent-aware adapter, public identifiers and approved policy text as required; keep credentials server-side. Update CSP allowlists deliberately when adding external scripts/requests. Local policy entries in src/content/policies.mjs publish only after approved content is supplied; external approved policy URLs are also supported.

## Media updates

The public asset tree is organized as images/<page>/, platforms/, brand/, fonts/, video/, audio/ and licenses/. `src/config/siteAssets.mjs` records image roles, dimensions and responsive variants. Replace only the intended page-owned file(s); do not deduplicate identical photos across unrelated pages. Replace both main and -800 versions where listed, keep formats/aspect ratios, rebuild, inspect and upload. No code edit is needed for a same-name substitution. The generator preserves replacement bytes and emits public film configuration as media-config.js. It never needs a remote asset service.

See ASSET_REGISTER.md for provenance and the replacement workflow. Keep licensing/permission records current; update alt text when an image's meaning changes. The optional video encoder requires source masters and FFmpeg but changes videos only, not page-owned posters. Regeneration is not required for deployment.

## Cache, release and rollback

.htaccess revalidates HTML/XML/text, caches JS/CSS for one hour and media/fonts for seven days, compresses text and sets baseline security headers. Filenames are not content-hashed: preserve the semantic filenames for same-name image replacement and purge caches when replacing assets, and purge CDN caches on release. Verify MIME types and video/audio byte ranges. _headers does not configure Apache.

Use Python 3 to package: `python scripts/package-release.py /path/to/output`. It checks production output first, writes both named ZIPs, verifies ZIP integrity and records SHA-256/file counts. Keep previous verified packages outside the web root. Roll back the complete prior package and purge caches; do not mix releases.

After upload confirm DNS/SSL, real Apache routing/headers, native Chrome/Safari/Edge/Firefox and touch devices, and real enquiry delivery when configured. Confirm on the live domain that the Network panel shows nothing from google before consent, and exactly one gtag/js request after Accept all. Approved policies, analytics/consent choices and server integrations remain owner inputs. Submit the sitemap and monitor actual field performance. No production DNS or hosting account configuration was changed by the export work.
