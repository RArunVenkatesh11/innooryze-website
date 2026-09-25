# InnooRyze developer instructions

This is the editable production website for **https://innooryze.com**. Read this file, README.md and docs/HANDOFF.md before editing. Inspect the actual files, recent changes and PHASE3_PROGRESS.md first. Preserve completed work; do not restart, replace the stack or reinterpret the approved design. No chat history is required.

## Business and language

InnooRyze is a Growth Systems, MarTech and AI consulting/product company that designs, builds, integrates and improves customer technology and intelligent systems. Do not position it simply as a digital marketing agency.

The two pillars are:
1. **Growth Systems**: **Experience Design & Enablement** (websites, apps, portals, UX/UI, connected journeys); **MarTech Consulting & Enablement** (assessment, architecture, selection, implementation, CRM, integrations and adoption); **Data Intelligence & Activation** (customer data, CDP, identity, segmentation, analytics, measurement and activation). Never rename these formal Growth Systems capabilities without an explicit instruction; in particular, never rename the third capability “Data & AI”.
2. **AI Agents & Automation**: practical agents and intelligent applications, including custom agents built around a client's workflows, knowledge, platforms, APIs and human checkpoints. A fixed catalogue is not the limit.

Approved expressions:
- Built for growth. Made intelligent.
- Two pillars. One growth engine.
- Experience + Technology + Intelligence = Growth
- Innovate. Integrate. Elevate.
- AI that understands. AI that acts. AI that gets work done.
- Your workflow can become the next agent.
- People stay in control.
- Ready to Ryze?
- Clear thinking. Connected systems. Work that moves you.
- Start with the business. Stay with the work.

## Facts and boundaries

LeadRyze AI and IMMA are available. Other product concepts remain in development and have no thin standalone SEO routes. Dynalektric has a live website, with client-confirmed figures (20% increase in website visits, 5% net-new RFQs, improved global traffic) and one approved testimonial reproduced verbatim — including the client’s own spelling of "InnoRyze". Qualtura is a live website engagement: experience, design, responsive development across approximately six pages, a Zoho enquiry integration, delivered in approximately one month; no traffic, lead or conversion figures exist. The former Max-Seal engagement is published anonymously as **US Industrial Valve Manufacturer** at /work/industrial-valve-digital-experience and remains **In Progress**; never reintroduce that client’s name, logo, screenshots or development URL. Treffer Technologies is a confirmed CRM/MarTech client; specific platforms, deliverables, results, screenshots and quotes are not approved. The final owner-approved platform taxonomy is recorded below. LeadRyze CRM is a distinct InnooRyze product; no availability, pricing or feature claims have been supplied for it. Do not confuse it with LeadRyze AI. Do not invent metrics, testimonials, staff, offices, certifications, partnerships, client stacks or legal policies. Approved regional positioning: InnooRyze works with businesses across the US, UK, APAC and India (APAC examples: Singapore, Japan, Malaysia). This is service coverage, not office locations; the registered address in Coimbatore is the only address. Concept photos do not depict actual staff or client teams.

## Stack and commands

Vanilla JavaScript ES modules, HTML templates, CSS and a Node static generator; zero npm dependencies. Node 20+ builds. No Node/npm, framework service, Sites runtime or client router is needed on the hosting server.

- npm ci — install the lockfile state.
- npm run build:production — clean dist build pinned to the production domain and indexing.
- npm run preview — serve built dist locally; rebuild after source changes.
- npm test — consent, legal, contact form and Apps Script backend tests (simulated services).
- npm run test:contact-browser — Contact form in headless Chrome, all states, ten viewports (needs Chrome).
- npm run check:production — HTML, SEO, links/assets and portability checks.
- node scripts/validate.mjs --production --http — also exercise the running static server.
- python scripts/package-release.py /path/to/output — create ZIPs; Python 3 standard library is needed only for packaging.

There is no separate linter. Check changed JS with node --check, run build/test/validation and inspect affected behaviour in a browser. Do not describe Chromium viewport emulation as native Safari/Firefox/touch verification.

## Source ownership

| Files | Responsibility |
|---|---|
| src/site.mjs | Public settings, services, products, work, articles, platforms |
| src/pages/home.mjs, inner.mjs | Page composition |
| src/components/layout.mjs | Shell, navigation, heroes, metadata, breadcrumbs |
| src/components/journeys.mjs, stage-visuals.mjs | Capability stages and matching media |
| src/components/showcase.mjs | Product demos, accordion, work carousel |
| src/components/company.mjs | Custom agents and About narrative/reveal |
| src/content/case-studies.mjs, components/case-study.mjs | Factual case chapters |
| src/content/platforms.mjs | Existing Salesforce, Adobe, Braze and Segment detail-page guidance |
| src/content/platform-catalog.mjs; components/platforms.mjs | Full approved taxonomy, logos, category grid and five-brand homepage teaser |
| src/config/siteAssets.mjs; scripts/page-assets.mjs | Independent page/section images, responsive variants, social images and film paths |
| scripts/validate-schema.mjs | Structured-data rules: schema must be supported by visible content; no offers/ratings/reviews/offices |
| src/content/policies.mjs; components/policy.mjs | Approved legal content transferred verbatim from the live pages, and the legal page layout |
| src/config/analytics.mjs | Google tag, deferred GTM container, Search Console token, measured-host allowlist and CSP origins |
| src/components/consent.mjs; public/consent.js | Consent bar and preferences dialog markup; the consent gate and the only Google tag loader |
| src/config/contact.mjs; public/forms.js, lead.js, contact-transport.js, turnstile.js, attribution.js | Contact form: public config and CSP hosts, form states, normalised lead, iframe/postMessage transport, Turnstile, session attribution |
| integrations/apps-script/contact-form/Code.gs | Source-controlled Apps Script backend: capture (Turnstile Siteverify, Sheet) and the queued Microsoft Graph email worker; paste into the live project, deploy a new version, keep one every-minute trigger on processPendingContactEmails |
| src/media.mjs | Logical hero/editorial tokens and image helper; physical paths resolve through siteAssets |
| src/styles/ | base → phase1 → phase2 → refinements → phase3 cascade |
| public/ | Browser modules, original identity, local fonts and media |
| public/motion.js, pinned.js, engage.js | Shared motion policy and space levels, pinned storytelling engine (homepage story, /growth-systems journey), touch equivalents of hover |
| scripts/build.mjs, deployment.mjs | Static generation, sitemap, robots, headers and Apache rules |
| scripts/hover-guard.mjs | Build step that moves every `:hover` rule behind `@media (hover:hover)` and fails on unguarded hover |
| src/redirects.mjs | Permanent aliases |
| dist/ | Generated release snapshot; never edit as the only fix |

## Page-specific visual ownership

When replacing a visual, prefer replacing the page-specific asset file while preserving its filename and dimensions/aspect-ratio expectations. Do not reuse one image file across unrelated pages merely to reduce duplication.

Find the route and image role in `src/config/siteAssets.mjs`. Replace that file under `public/assets/images/`, preserving its format, name and crop expectations. Replace both the main and `-800` variants when the mapping includes a srcset. Rebuild and purge hosting/CDN caches. The build copies those files; it does not regenerate them or overwrite them from shared originals. No application code change is needed for a same-name replacement. Update provenance and alt text if their meaning changes. See docs/ASSET_REGISTER.md for dimensions, examples and the complete ownership manifest.

The `asset:` values in templates are logical selectors, not physical file paths or network requests. `scripts/page-assets.mjs` resolves each page/occurrence through the central mapping, failing on missing/unused slots. These tokens must never reach dist. Brand marks, platform identities and fonts are intentionally shared; page photographs are independent. Film paths are centralized in the same config and emitted as dist/media-config.js by the build.

## Approved platform taxonomy

- CRM: **LeadRyze CRM first**, marked **Built by InnooRyze**, then Salesforce, HubSpot, Zoho.
- Marketing Automation: Salesforce Marketing Cloud, Mailchimp, HubSpot, Zoho, Oracle Eloqua, Adobe Marketo Engage, Adobe Campaign, plus the existing Braze expertise.
- Customer Data / CDP: Segment, Tealium, Adobe Experience Platform.
- Digital Experience / CMS: Adobe Experience Manager, Drupal, WordPress.
- Analytics & Business Intelligence: Google Analytics, Adobe Analytics, Microsoft Power BI, Tableau.

Homepage shows exactly **Zoho, Salesforce, Adobe Experience Platform, Braze, Segment**, in that order. LeadRyze CRM uses text, with the approved color treatment; no invented logo. Third-party logos use local supplied/official files, preserve aspect ratios and actual colors, and carry no partnership/certification implication. Marks default to monochrome and reveal brand colors on hover/focus; on touch/hoverless devices the card crossing the middle of the viewport reveals the same colour state and resets as it leaves. Four existing platform detail routes remain; new taxonomy entries use contextual enquiry links until substantial approved detail warrants a new route. Platform approval is not evidence of a specific client's technology stack.

## Preserve the design and behaviour

Keep the original logo, cyan/teal/charcoal colours, Manrope/DM Sans typography, cinematic direction, six-scene film and energetic original score. Image heroes share the integrated canvas; the approved AI hero and functional Contact layout are intentional exceptions. Do not return to repetitive clipped corners or disconnected image blocks. Keep journey images/text synchronized, keyboard/touch controls, reduced-motion/pause fallbacks and readable semantic content. Do not redesign approved sections for a content or SEO edit.

**Same experience. Responsive execution.** Desktop, laptop, tablet and mobile keep the same storytelling, animations and interactions; only layout, type, spacing, animation distance, parallax and duration adapt. Never disable an interaction because a device is touch-based, narrow or short. Static presentation is only for `prefers-reduced-motion`, the explicit pause control, or a genuine capability limit with a graceful fallback. Use the shared system instead of new `innerWidth`/`innerHeight` checks:
- **Motion policy:** `public/motion.js` (`motion.stopped()`, `data-space`, `--motion-distance`, `--motion-parallax`).
- **Pinned sections:** `public/pinned.js`.
- **Touch equivalents:** `public/engage.js`.

See DESIGN_SYSTEM.md (Motion).

## SEO and deployment rules

All canonical routes are listed in SITE_ARCHITECTURE.md. Each has rendered index.html. Missing URLs return a true 404; never add a blanket homepage SPA fallback. /work/industrial-valve-digital-experience is canonical; /work/maxseal and /work/max-seal are historical permanent redirect aliases to it and must never be restored as pages. Preserve public URLs when extending the site.

Each indexable page needs one H1, useful H2/H3 content, unique metadata, production canonical/OG URLs, appropriate schema, internal links and descriptive alt text. No fake local pages, thin vendor pages, stuffing or invented schema claims. Main copy must exist in HTML. Credits, 404 and aliases are noindex and outside the sitemap. Staging uses SITE_INDEXABLE=false explicitly; releases use build:production.

Google Analytics (GT-WF4XRBSQ) loads only after analytics consent and only on innooryze.com / www.innooryze.com. GTM-NJPT6DRQ is recorded but not loaded until audited. Keep every identifier in src/config/analytics.mjs; see docs/ANALYTICS.md.

Vercel is a temporary preview/testing host; the final production platform is To Be Confirmed. Keep dist/ host-agnostic and keep every adapter: .htaccess (Apache/cPanel), _headers and _redirects (compatible static hosts) and vercel.json (Vercel, repo root only). All three render the same headers from src/config/headers.mjs, and check:production asserts parity. Do not add Vercel APIs, serverless functions, middleware or runtime dependencies. Indexability is decided by src/config/environment.mjs and is fail-safe: only SITE_INDEXABLE=true (set by npm run build:production for the self-hosted release) makes a build indexable. Vercel is staging only and permanently non-indexable: every Vercel deployment builds noindex,nofollow with robots.txt Disallow: /, SITE_INDEXABLE cannot override that on Vercel, and vercel.json adds X-Robots-Tag: noindex, nofollow to every Vercel response (never to _headers or .htaccess). src/config/distExclusions.mjs withholds unreferenced source masters and historical iterations from dist; the build fails if a withheld file is still referenced. See docs/VERCEL.md.

Secrets never belong in frontend code, .env.example or exports. The Contact form posts to the deployed Google Apps Script web app through a hidden iframe and receives a postMessage result. The script verifies Cloudflare Turnstile, records the enquiry in the Google Sheet and answers at once; a time-driven worker sends the Microsoft Graph emails afterwards (capture first, integrate second; future LeadRyze sync belongs in that worker, never in the submission path). Its source of truth is integrations/apps-script/contact-form/Code.gs. Its secrets (TURNSTILE_SECRET_KEY, MS365_*) exist only in Script Properties. Public endpoint and Turnstile site key: src/config/contact.mjs. Only innooryze.com/www submit for real; other hosts show a development-only state. Do not add Cloud Run, serverless functions, PHP or another backend. The form is not confirmed live until the live test in docs/CONTACT_INTEGRATION.md passes. Privacy Policy and Terms & Conditions are published at /privacy-policy and /terms-and-conditions from approved wording; no cookie policy has been approved, so /cookie-policy stays unpublished and its link stays omitted. Never reword approved legal text: change the approved source, then re-transfer. Follow DEPLOYMENT.md for upload, DNS/SSL, routing, headers, integration and rollback.

## Documentation

Read docs/SITE_ARCHITECTURE.md, SEO_STRATEGY.md, DESIGN_SYSTEM.md, CONTENT_GUIDE.md, CASE_STUDY_GUIDE.md, ASSET_REGISTER.md, DEPLOYMENT.md and HANDOFF.md. Update relevant docs after material changes, preserving accurate historical QA scope. Keep licensing records in public/assets/licenses/. Document provenance before adding media replacements.
