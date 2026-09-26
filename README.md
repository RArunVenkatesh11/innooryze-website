# InnooRyze — portable website

A standard static multi-page website with 26 rendered routes. It preserves InnooRyze’s approved brand assets, two-pillar positioning and cinematic motion system. There is no framework, external package dependency or required Sites/ChatGPT runtime.

## Build and preview

Requires Node.js 20 or later and npm. All fonts, film, music and published images are local.

```
npm ci
npm run build:production
npm run preview
npm test
npm run check:production
```

For development, run `npm run build` and then `npm run dev`. The dev command serves the generated files just like preview; it is not a hot-reload/compiler server. After each source edit, rerun the build and refresh the browser. `npm run build:production` is the final domain-pinned release command, and `npm run preview` serves that production output.

Open the extracted source folder in VS Code and start Claude Code at the project root. Read [CLAUDE.md](CLAUDE.md) before requesting or making major changes; it defines the preserved design, terminology, routes and content boundaries. Hosting instructions are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

The server prints its local URL, normally http://127.0.0.1:4173. Rebuild after edits. `node scripts/validate.mjs --http` additionally checks every served route, the 404 response and byte-range media delivery.

`npm run build` replaces only the generated `dist/` directory. Upload the contents of `dist/` to any static web host. Serve directory paths as their `index.html`, use `404.html` for missing paths and retain asset byte-range support. All routes use normal HTML links and work without a client router.

## Configuration

`.env.example` lists public build-time settings. Set environment variables in your host’s build settings or shell before `npm run build`. With Node 20.6+, a local `.env` can be loaded explicitly using `node --env-file=.env scripts/build.mjs`. `.env` and provider credentials must never be committed or exported.

- `SITE_URL`: approved canonical production origin, defaults to https://innooryze.com.
- `SITE_INDEXABLE`: the only way to make a build indexable; unset means noindex. build:production sets it to `true` for the self-hosted release. It has no effect on Vercel, which is always noindex.
- `ANALYTICS_ID`: optional public identifier passed to the separate integrations adapter. This is **not** the Google tag; that is configured in src/config/analytics.mjs.
- `SOCIAL_*_URL`: confirmed LinkedIn, X and Instagram URLs. Facebook is intentionally omitted.
- `PRIVACY_POLICY_URL`, `COOKIE_POLICY_URL`, `TERMS_URL`: optional approved policy pages; empty links are omitted.

Rebuild after changing public configuration. Provider secrets belong on the server. `_headers` contains recommended security headers; confirm your hosting platform applies them or copy them into its configuration. Add only approved provider origins if activating external integrations.

## Case studies

Client-confirmed figures and approved quotations live in src/content/case-studies.mjs as optional `proof` and `testimonial` blocks; both render only when present, and a quotation is reproduced exactly as approved. One engagement is published anonymously as "US Industrial Valve Manufacturer" — see docs/CASE_STUDY_GUIDE.md before touching it.

## Deployment targets

**Vercel is a temporary preview/testing host. The final production platform is To Be Confirmed.**

The build produces a host-agnostic `dist/`; each host reads its own adapter. Apache/cPanel uses the
generated `.htaccess`; compatible static hosts use `_headers` and `_redirects`; Vercel uses the committed
`vercel.json` (repo root, never shipped inside `dist`). All three render the same headers from
`src/config/headers.mjs`, and `check:production` asserts parity, so a change for one host cannot leave
another unprotected.

Indexing is decided by `src/config/environment.mjs` and is fail-safe: a build is indexable only with the
explicit release signal `SITE_INDEXABLE=true`, which `npm run build:production` sets for the self-hosted
production release (`index,follow`, `Allow: /` plus the sitemap). Vercel is staging only: every Vercel
deployment, including innooryze-website.vercel.app, builds as `noindex,nofollow` with `robots.txt`
`Disallow: /`, whatever `SITE_INDEXABLE` says, and every Vercel response carries
`X-Robots-Tag: noindex, nofollow` from `vercel.json`. See docs/VERCEL.md.

## Legal pages

/privacy-policy and /terms-and-conditions publish approved wording transferred verbatim from the live InnooRyze pages. src/content/policies.mjs is a transcript: change the approved source first, then re-transfer. Publishing a policy automatically enables its footer link and, for privacy, the inline link in the cookie bar. No cookie policy has been approved, so /cookie-policy stays unpublished.

## Analytics and cookie consent

Google Analytics (`GT-WF4XRBSQ`) is migrated from the previous site and gated: it loads only after a visitor grants analytics consent and only on the production hostnames. Every other origin, including local development and preview deployments, is excluded by an allowlist. A first-visit bottom bar offers Reject non-essential / Manage preferences / Accept all, and **Cookie settings** in the footer reopens the preferences panel at any time. Google Tag Manager (`GTM-NJPT6DRQ`) is recorded but not loaded. See docs/ANALYTICS.md.

## Enquiry integration

The Contact form posts to the deployed Google Apps Script web app through a hidden iframe. The script verifies Cloudflare Turnstile, records the enquiry in the enquiry Google Sheet and reports the outcome back with `postMessage` straight away. A background worker (a one-minute time-driven trigger) then sends the internal notification and the customer acknowledgement through Microsoft Graph, so the visitor never waits for email. Capture first, integrate second: the Sheet row is the durable record. On a captured enquiry, the form is replaced in the same right-hand frame by a thank-you state; the left column does not move. The website remains static; no server secret is in this repository. The backend source of truth is `integrations/apps-script/contact-form/Code.gs`.

Real submissions happen only on innooryze.com and www.innooryze.com (plus, temporarily, the innooryze-website.vercel.app staging host). Local and preview hosts show an explicit development-only state and send nothing. Public configuration lives in `src/config/contact.mjs`. Architecture, field and Sheet mapping, Turnstile, Microsoft Graph, Script Properties, deployment, the live test procedure and troubleshooting are in docs/CONTACT_INTEGRATION.md. The form is not confirmed live until that live test has passed.

`npm test` covers the browser modules and runs `Code.gs` against simulated Google services. `npm run test:contact-browser` (needs Chrome) exercises every state at ten viewports with the real Turnstile script (Cloudflare test keys) and the real CSP.

`public/integrations.js` announces a captured enquiry as the DOM event `innooryze:lead-captured` (area of interest and channel only; never names, emails, company names or messages). `public/consent.js` forwards it to GA4 as `contact_form_submit` only when the tag is already running with analytics consent. An optional `window.innooryzeIntegrations.track(event,{id})` adapter receives the same detail. Analytics failures never change the submission result.

## Content and components

- `src/site.mjs`: services, products, work, articles, platforms and public configuration.
- `src/media.mjs`: logical editorial roles; `src/config/siteAssets.mjs` maps each page/section to its independent physical images.
- `src/content/platform-catalog.mjs`: approved five-category taxonomy, local logos and five-brand homepage teaser.
- `src/pages/`: homepage and internal page templates.
- `src/components/`: global shell, shared product demos, carousel, capability journeys and company sections.
- `src/fragments/`: preserved agent workflow foundation. The Growth Systems overview is now generated by `growthJourney()` in `src/components/journeys.mjs`.
- `src/styles/`: original system plus Phase 1, Phase 2 and Phase 3 refinements.
- `public/`: original brand assets, locally licensed media/fonts and browser interactions.
- `scripts/build.mjs`: static generation, route manifest, metadata, sitemap, robots and headers.

Add approved content to the collections to extend the site. Existing case routes are reusable and omit fields that have not been substantiated. LeadRyze AI and IMMA are available; the three roadmap products stay In development. The anonymised US Industrial Valve Manufacturer case stays In Progress. Treffer Technologies has no fabricated screenshot, result or quote. Leadership names/portraits and legal policy content still require approved material.

## Replacing a visual

Find the route and role in `src/config/siteAssets.mjs`, then replace the corresponding same-name file under `public/assets/images/<page>/`. Keep its file format and expected dimensions/aspect ratio; replace both desktop and `-800` files when srcset is listed. Build again and purge media/CDN caches. Other pages own separate files even when their original photographs match. The generator never recopies shared originals over your replacement. Update alt text/provenance if the subject changes. See [asset register](docs/ASSET_REGISTER.md) for the full procedure and dimensions.

Assets are organized into `images/`, `platforms/`, `brand/`, `fonts/`, `video/`, `audio/` and `licenses/`. Original identity, typography, film and score are preserved. The homepage shows Zoho, Salesforce, Adobe Experience Platform, Braze and Segment. The platform directory contains the owner-approved CRM, Marketing Automation, CDP, CMS and Analytics/BI categories; LeadRyze CRM appears first as Built by InnooRyze, separately from LeadRyze AI.

## Media and motion

The hero film remains muted, opens on the digital-connection scene that matches its poster, preloads only the next scene, and pauses when offscreen or hidden. Sound starts only after a gesture; its preference is remembered for the session, with another gesture required on a new document. The Sound control is disabled while motion is reduced or paused. The soundtrack is owner-approved replacement audio; its source/licence record is pending (public/assets/licenses/original-score.txt). Film and demonstrations respect reduced motion; touch/keyboard controls expose the same content without hover.

Same experience, responsive execution: desktop, laptop, tablet and mobile keep the same storytelling, animations and interactions, while type, spacing, animation distance and parallax adapt to the available space.
- **Pinned sections:** the homepage "Two pillars" story and the /growth-systems journey are pinned and scroll-driven everywhere they can fit, one state at a time with counter, progress and 44px step controls. Content scales down to fit short laptop windows.
  - **Very small viewports:** panels reveal progressively in normal flow.
  - **Toolbars:** mode decisions use the stable small viewport (`svh`), so mobile toolbars never switch modes.
- **Hover and touch:** hover effects are build-guarded behind `(hover:hover)`, and touch devices get in-view equivalents plus press feedback.
- **When motion is static:** only for reduced motion or the explicit pause control.
- **Save-Data:** the hero poster drifts slowly instead of loading the film.

`public/assets/licenses/` documents film, photography, homepage audio, project captures and font licenses. Photography illustrates concepts and does not claim to portray InnooRyze staff or client teams. The IMMA and client website captures are actual interfaces approved for portfolio use by the website owner. Original full-resolution research downloads are outside the portable source; optimized usable media and source/licensing records are included.

The optional film encoder accepts a source directory: `node scripts/encode-phase2.mjs /path/to/downloads`. It uses FFmpeg from PATH or the `FFMPEG` environment variable and writes only the named homepage videos under assets/video; it does not overwrite page-owned posters or photographs. The optional Python score-generation script is not part of the build. Regeneration requires NumPy and a standard audio encoder; the finished MP3 is bundled. Film source records include the original download URLs; no remote media request is needed for the production website.

## Verification and launch

The validator checks rendered routes, internal links/assets, unique titles/descriptions, one H1, canonical and social metadata, structured data, image alt attributes and no preview-domain leakage. The enquiry tests cover validation, encoding, failed delivery and explicit success acknowledgments. See `QA_REPORT.md` for the final browser inspection scope and limitations.

Before public-domain launch: connect and verify the real enquiry endpoint and selected spam/analytics providers, supply approved policy pages, confirm domain/response headers and the included production indexing configuration. Named leadership, detailed client outcomes and client logos can be added when approved. None are fabricated in this build.

## Production handoff and packages

Start with [CLAUDE.md](CLAUDE.md) for editing without chat history. Read [handoff](docs/HANDOFF.md), [architecture](docs/SITE_ARCHITECTURE.md), [SEO](docs/SEO_STRATEGY.md), [design](docs/DESIGN_SYSTEM.md), [content](docs/CONTENT_GUIDE.md), [case studies](docs/CASE_STUDY_GUIDE.md), [assets](docs/ASSET_REGISTER.md) and [deployment](docs/DEPLOYMENT.md).

The live ZIP is already built: extract its root directly into public_html. It includes .htaccess for static multi-page Apache routing; no Node/npm or SPA fallback is needed on the server. /work/industrial-valve-digital-experience is canonical; the historical /work/maxseal and /work/max-seal URLs are 301 aliases to it. The source ZIP includes source, docs, scripts and a generated dist snapshot, excluding credentials, caches, hosting-account metadata and unused prototype media. Create a release after production validation with Python 3: `python scripts/package-release.py /path/to/output`.
