# Phase 3B — SEO/GEO semantic refinement + internal discoverability — 25 September 2026

- **Method:** wording refined inside existing copy only; no new sections, card counts or order changes. Baseline text and layout were captured before any edit, then every change was measured against it.
- **Visible copy:** 41 changed blocks across 13 routes. Every edited paragraph within ±20% of its original rendered length (range -11% to +16%). One draft exceeded the limit (+26%, Experience chapter 01 with three case links) and was tightened to +14% before shipping. Intentional exceptions: /products/imma gains one compact paragraph (the page was genuinely thin at 101 words), /work/imma loses a chapter that only restated "IMMA", and the /contact form introduction moves from <p> to <h2> with identical text.
- **Layout, 140 route/viewport samples vs baseline:** 0 heading re-wraps, 0 new horizontal overflow. 89 of 120 non-IMMA samples pixel-identical in total height; the rest move by one body line (~25-33px) at some widths, worst +2.23% of page height. The pinned Growth Systems stage keeps fit=1.000 with no panel overflow at 1920/1440/1366/1280 with motion on.
- **Two regressions caught by measurement and fixed before shipping:** the homepage "Built by us" line wrapped to a second line at every desktop width (shortened, now identical to baseline), and the Growth Systems Data panel gained a line at 1920 inside the pinned stage (one word trimmed, now identical).
- **Contact:** the page had an H1 and no H2. The form introduction is now the H2 for the enquiry region; computed style verified identical to the previous paragraph (DM Sans 19px/400, same box). A first build rendered it in the heading face; caught and fixed.
- **Metadata:** 22 title/description fields across 11 routes, all titles <= 59 chars, all descriptions <= 155, each claim supported by visible copy on the same page. Service titles via services[].metaTitle; H1s and Service schema names keep the approved capability names.
- **Internal links:** +7 contextual links, all inside existing sentences (1431 -> 1438 validated links): Experience -> Dynalektric, Qualtura, industrial valve case; MarTech -> Qualtura, Treffer; /products/imma -> /work/imma; /platforms -> MarTech capability.
- **GEO:** all 13 answer-readiness questions now resolve to a visible sentence (previously CX/CRM consulting, CRM implementation, CDP consulting, data activation, AI agent development, AI automation consulting and custom SaaS were missing or weak).
- **Regional:** one statement on /about — US, UK, APAC and India, including Singapore, Japan and Malaysia. Service coverage, no office implied. Correction to the earlier audit: /about already carried a regional sentence ("North America, Singapore and Southeast Asia, India...") that the audit's pattern missed; it has been updated rather than added.
- **Ideas Hub:** contents rail 3.76:1 -> 4.91:1 (#52707f). No article text changed.
- **Phase 3A regression:** preview build noindex 31/31 with Disallow and no sitemap line; non-Vercel production build indexable; 3/3 adapters; vercel.json still in sync; GTM 0; asset exclusions intact; consent 43/43.
- **Build/test:** build:production 29 routes, npm test 19/19, check:production 1438 links/assets, validate --production --http all pass; 29 routes swept with 0 JS errors and 0 failed resource loads.

# Phase 3A addendum — host-agnostic confirmation, Vercel is temporary — 25 September 2026

- **Context:** Vercel is a temporary preview/testing host; the final production platform is To Be Confirmed. Audited Phase 3A for hard Vercel dependencies.
- **Verdict: no hard dependency in the build, the output or the production path.** Zero npm dependencies, zero `@vercel/*` imports, no serverless functions, no middleware, no Vercel runtime APIs. `vercel.json` lives at the repo root and is never copied into `dist`; the validator now asserts that.
- **Proved on a non-Vercel simulation:** with `VERCEL` and `VERCEL_ENV` unset entirely, `build:production` produced an indexable build with production canonicals, `Allow: /` + sitemap, all three adapters present, and `check:production` passing. `SITE_INDEXABLE=true` alone is sufficient on any host; `VERCEL_ENV` is only an extra safety signal that can force a Vercel preview to noindex.
- **One real defect found and fixed: adapter parity.** `.htaccess` was the only adapter without HSTS, because the Apache generator kept its own hardcoded header list. It now renders the same `src/config/headers.mjs` definition as `vercel.json` and `_headers`, with `env=HTTPS` on HSTS so Apache only sends it over TLS. Since Apache/cPanel is a live candidate for final production, leaving it would have shipped the chosen host without HSTS.
- **New assertion:** `check:production` now verifies all three adapters carry the same header set, and that `dist` contains no host-specific configuration. A change made for one host can no longer leave another unprotected.
- **One intentional coupling, reported not removed:** `check:production` requires `vercel.json` to exist (exit 1 if deleted). The build and the site are unaffected — only validation. Correct while Vercel is in use; if Vercel is dropped, delete that single assertion block in `scripts/validate.mjs`.
- **Documentation** now states plainly that Vercel is temporary and the final host is TBC, describes the adapter model (core build -> host-agnostic dist -> per-host adapter), and reframes the Vercel manual steps as conditional — explicitly recording that innooryze.com is not attached to Vercel, www is not managed by Vercel, DNS does not point at Vercel, and the sitemap has not been submitted.
- **Build/test:** build:production 29 routes, npm test 19/19, check:production 1431 links/assets, validate --production --http all pass.

# Phase 3A — technical launch foundation — 25 September 2026

- **Scope:** environment-aware indexing, vercel.json, real redirects, HSTS, production asset cleanup. No SEO/GEO copy, no IMMA/FAQ/schema work, no consent or content change.
- **Root cause of preview indexability:** `indexable: process.env.SITE_INDEXABLE !== 'false'` defaults to *indexable*. Vercel runs `npm run build` with no variables set, so every preview published itself as indexable with production canonicals, the production sitemap and the Search Console token. Fail-open by construction.
- **Fix — src/config/environment.mjs.** Indexable only when the build can prove it is production, and the platform signal is not overridable: `VERCEL_ENV` other than `production` forces noindex even against `SITE_INDEXABLE=true` or `npm run build:production`. Verified across six build permutations; every build prints its decision and reason.
- **Preview decisions, reported not hidden:** canonicals stay production (so anything reaching preview consolidates onto production); `sitemap.xml` is still written but preview robots.txt carries **no Sitemap line**; the Search Console meta stays, because noindex + Disallow is the actual search control.
- **vercel.json** generated by `npm run sync:vercel` from src/config/headers.mjs + src/redirects.mjs. `check:production` fails if it has drifted — proven by tampering with HSTS and watching the check fail, then pass again after re-sync. Sets buildCommand, outputDirectory, `trailingSlash:false`, redirects and headers.
- **Headers now delivered on Vercel** (previously none): HSTS, CSP, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy. One definition in src/config/headers.mjs feeds vercel.json, _headers and .htaccess so they cannot disagree.
- **HSTS deliberately conservative:** `max-age=31536000`, no includeSubDomains, no preload. includeSubDomains would bind assessment.innooryze.com and any mail/tooling host to HTTPS for a year; preload is effectively irreversible. Documented how to upgrade.
- **CSP unchanged in substance.** script-src still permits only googletagmanager.com — no unsafe-inline, no unsafe-eval; the validator now asserts both. Consent regression re-run: **43/43**, GTM still 0 occurrences in dist.
- **Redirects:** www → apex, and both aliases in both slash forms, all permanent, each one hop. The validator asserts no alias destination is itself an alias, so a chain cannot be introduced later. The meta-refresh alias documents remain as the Apache fallback and are never served on Vercel.
- **Asset cleanup — 30.80 MB → 20.06 MB media in dist, 10.74 MB removed (34.9%).** 38 files withheld: 3 source masters (4.87 MB), 1 duplicate preview, 3 superseded logo originals, 2 brand iterations, 29 historical journey/stage iterations. Nothing deleted from public/. Each was proven to have zero references across rendered output, templates, scripts, browser modules, the page-owned asset map and the runtime-assembled film paths — one basename collision was caught and resolved by exact path rather than assumed.
- **Exclusion mechanism is fail-closed:** exact paths only; the build fails if a listed file no longer exists, and fails if a withheld file is still referenced by anything the release serves. check:production additionally asserts none exists in dist.
- **Build/test:** build:production 29 routes, npm test 19/19, check:production 1431 links/assets, validate --production --http all pass. 29 routes swept in Chromium: 0 JS errors, 0 failed resource loads.
- **Requires live confirmation on Vercel** (local harness cannot emulate): actual 308 status and header delivery, www redirect, and the interaction between `trailingSlash:false` and the alias redirects — both slash forms are declared explicitly so each should resolve in one hop, but the ordering is Vercel-internal.

# Phase 2 refinement — client-logo rule, Qualtura media stage, outcomes alignment — 25 September 2026

- **Client identity now appears once per page.** Logos removed from the homepage carousel, the /work hub cards and every case hero; the single intentional brand-proof location is the CLIENT field in the project facts. Verified in the built output: homepage and /work carry **0** client logos, each of the three client cases carries exactly **1**, all inside `.case-overview`, and the anonymised industrial case carries none.
- **Accessibility:** the facts logo carries the client name as its alt text, so assistive technology still reads "Client: Dynalektric" without the name being printed twice on screen.
- **Qualtura media stage.** The dark intro hero (eyebrow, headline, summary, no logo) is followed immediately by a full-width stage carrying the approved screenshot at its own aspect ratio, with an understated QUALTURA / WEBSITE EXPERIENCE label bottom-right. No headline sits over live interface copy, no device mockup, no crop. The same file is used once — it moved out of the narrative figure rather than being duplicated. Mobile order is headline/summary, screenshot, project details.
- **Verified Outcomes alignment — root cause and structural fix.** The metric columns had right padding but **zero left padding**, so the 5% and Global values sat hard against their divider. Padding is now symmetric around every separator (`padding: clamp(26px,3vw,38px) clamp(28px,3.4vw,54px)`), with the first column's left and the last column's right zeroed so the outer values stay flush with the page container. Resolved clearance: **54px at 1920, 49px at 1440, 46px at 1366, 44px at 1280, 35px at 1024** — inside the requested 48-56px band at large desktop and scaling proportionally below it. No one-off margins, no absolute positioning. All three values share one baseline. On phones the grid stacks with rules between metrics only, no vertical dividers and no residual side padding.
- **Hero hierarchy** is consistent across all four cases: OUR WORK / name, headline, summary, primary visual, project facts. Photographic cases keep their media-led heroes; the interface-heavy case uses text then stage. No logo floats inconsistently in any hero.
- **Card rebalancing:** the removed logo carried its own margin, so no orphan spacing was left behind and no title was enlarged to fill the gap.
- **QA — 492/492 checks passed** across the ten required viewports on six routes: no duplicated client branding in cards or heroes, logo present exactly once in project facts where appropriate, Qualtura screenshot prominent (>=70% of viewport width) and never overlapping the headline, undistorted (aspect drift < 0.02), metric clearance and baselines, mobile stacking, no horizontal overflow, no broken images, and the anonymised case still anonymous.
- **Harness note:** a first pass reported 4 mobile failures on the stacked-metrics check. That assertion was wrong, not the CSS — separators sit *between* metrics, so the last one correctly carries no trailing rule. The check was corrected to expect that.
- **Build/test:** build:production 29 routes, npm test 19/19, check:production 1431 links/assets, validate --production --http all pass. No manual dist edits, no ZIPs.

# Phase 2 — Case studies, verified proof and the work visual system — 25 September 2026

- **Scope:** Qualtura case added, Dynalektric proof and testimonial, Treffer transparency and framing, Max-Seal fully anonymised, one shared client-logo system, homepage and Work hub reordered. No SEO/GEO rewrite, no consent/analytics change, no legal-content change, no Google Sheets.
- **Routes:** 28 -> 29. Added /work/qualtura and /work/industrial-valve-digital-experience; /work/maxseal and /work/max-seal are now permanent 301 aliases to the anonymous route (verified single-hop, no loops, including /, /index.html forms).
- **Treffer diagnosis:** the supplied .svg contains **no vector artwork**. It is a 349x120 wrapper whose single <rect> is filled by a <pattern> drawing an embedded 380x180 PNG, cropped by the <use> matrix to rows 27-157. Inside that crop **0%** of pixels carried alpha and **71%** were pure white: the background is baked into RGB and the anti-aliasing was flattened against it.
- **Treffer result — clean, no fallback needed.** A white key would have shredded the wordmark, so the derivative instead un-multiplies from white (a = 1 - min(c)/255). Recompositing the result over white reproduces the source **exactly: max error 0, mean error 0, 0% of samples above 4**. Interior (non-background) white is 0.66%. Edges, lettering, both brand colours and proportions are intact. Output: treffer-technologies-logo-transparent.png. The supplied .svg is untouched.
- **Shared logo system:** a single neutral plaque, used on every surface. Driven by measurement, not taste — all three marks are dark-ink artwork for white backgrounds, reaching only **1.18:1** (Dynalektric, Treffer) and **1.47:1** (Qualtura) against the site's dark ink, versus 11-20:1 on paper. Client brands are never recoloured, so the surface comes to the logo. Files are pre-trimmed to their own ink boxes and scale is normalised **by area, not height** (lockups run 2.85:1 to 5.30:1); measured rendered ink areas agree within **1.0%** (1923/1907/1926 px^2), max rendered height 34px.
- **Proof and testimonial:** Dynalektric shows exactly the three confirmed figures (20% / 5% / Global) in a panel that states who confirmed them; contrast 8.95:1. The testimonial is reproduced verbatim, including the client's own spelling of "InnoRyze", which was deliberately not corrected. Every optional block renders only when approved content exists, so no case shows an empty section.
- **Anonymisation:** the only surviving occurrences of the old slug anywhere in source or build are the two alias URLs themselves, which the brief requires. Zero client name, logo, screenshot, copy, alt text, schema, metadata or outbound URL; max-seal.vercel.app is gone entirely. Identifying images were moved out of public/ to archive/anonymised-client-assets/ (not served, with a README); provenance records were updated.
- **QA — 700/700 checks passed** across the ten required viewports on six routes: no horizontal overflow, no broken images, no anonymised identity in the DOM, no empty optional sections, logos load undistorted (aspect drift < 0.02) and inside their plaques at one optical scale, proof figures unclipped, testimonial unclipped and within the viewport, and work cards aligned to one left edge.
- **Harness note:** a first pass reported 32 image failures on the homepage. All three files served 200 with correct bytes; they are loading="lazy" inside carousel slides that sit off-screen **horizontally**, so a vertical scroll never triggered them. The probe now promotes images to eager and awaits decode, which measures the asset rather than the viewport. It was a harness gap, not a defect.
- **Build/test:** build:production 29 routes, npm test 19/19, check:production 1437 links/assets and 133 page-owned variants, validate --production --http all pass. No manual dist edits, no ZIPs.
- **Deferred to Phase 3 (reported, not actioned):** 5.09 MB of owner-supplied source files ship unreferenced to production (industrial-valve PNGs 3.6 MB, qualtura-homepage.png 1.3 MB, the three original logo files, and an unreferenced duplicate at work/previews/qualtura-homepage.webp). The brief named those paths and told me to preserve them, so I left them in place; excluding them from the build copy is a one-line change to scripts/build.mjs when approved.

# Privacy Policy + Terms & Conditions — 25 September 2026

- **Scope:** publish the two approved legal pages from the existing live InnooRyze content. No Phase 2 case studies, no SEO/GEO rewrite, no change to consent behaviour or Analytics gating, no Google Sheets.
- **Routes:** `/privacy-policy` and `/terms-and-conditions`. 26 → 28 canonical routes, 25 → 27 sitemap URLs.
- **Source:** retrieved as raw HTML from https://innooryze.com/privacy-policy/ and https://innooryze.com/terms-and-conditions/ (HTTP 200). src/content/policies.mjs was **generated** from that markup rather than retyped, so no legal sentence was re-keyed by hand.
- **Content fidelity — 0 omissions, 0 additions, 0 reorderings.** Privacy 120/120 content blocks, Terms 92/92, compared as normalised text so markup changes cannot mask a wording change. Counts match exactly: privacy 15 sections / 2 sub-sections / 64 list items / 39 paragraphs; terms 15 sections / 41 list items / 36 paragraphs. The single flagged "order change" is a false positive: "You may not:" genuinely appears twice on the live Terms page, under sections 6 and 7, and appears twice here under the same two sections.
- **Deliberate presentation changes, all reported:** (1) section headings are `<h5>` under an `<h1>` on the live theme and become `<h2>` here, with the "2.1"-style sub-headings becoming `<h3>`, because the live hierarchy is not usable for assistive technology; (2) loose `<li>` runs become real `<ul>` lists; (3) the page H1 is the document name ("Privacy Policy") per the approved design direction, while the live all-caps "INNOORYZE PRIVACY POLICY" is not repeated; (4) the Effective/Last Updated line becomes the hero metadata row; (5) the contact email is linked with `mailto:` and the decorative 📧 emoji preceding one instance is dropped. No wording, date, clause, obligation or jurisdiction was altered.
- **Dates and identity preserved:** Effective Date 28 April 2025, Last Updated 20 March 2026 on both. Registered identity "InnooRyze (INNOVATION MULTIVERSE TECHNOLOGY PRIVATE LIMITED)" and its postal address are carried through verbatim, including the "Coimbatore South / Coimbatore – 641201" form used on the legal pages.
- **Accessibility/responsive QA — 461/461 passed** across the ten required viewports on both routes: one H1, no skipped heading level, 15 sections, real lists with no stray items, no horizontal overflow, nothing protruding from the page, linked emails, safe wrapping for long strings, header-aware anchor offsets, body text ≥16px, and contrast ≥4.5:1 for body, headings, list items, links, the dates row and the footer legal links.
- **Three defects found and fixed during QA:** the shared contents-rail colour reached only 3.76:1 on paper (policy rail darkened to 4.9:1); the measure collapsed to 586–732px at 1024–1280px where the sidebar left too little room (rail now steps aside below 1280px, measure holds at ≤820px); footer legal links were 14–16px tall on touch (now ≥24px).
- **Pre-existing, not changed:** the Ideas Hub contents rail still uses the lighter 3.76:1 colour on /ideas-hub/* article pages. Out of scope here; worth fixing with the article pages.
- **Footer:** one compact legal row — Privacy · Terms · Cookie settings · Visual credits. Cookie settings was not duplicated; the existing control moved into the row.
- **Cookie banner:** the Privacy Policy link now renders automatically because `site.policies.privacy` resolves, and it navigates to /privacy-policy. Consent architecture and Analytics defaults untouched; consent regression re-run at 43/43 functional after the footer change.
- **Metadata:** "Privacy Policy | InnooRyze" and "Terms & Conditions | InnooRyze", concise factual descriptions, production canonical and og:url, index,follow, existing WebPage + BreadcrumbList schema only — no extra legal schema invented.
- **Build/test:** `build:production` 28 routes, `npm test` 19/19 (7 new policy guards), `check:production` 1379 links/assets, `validate --production --http` all pass. No manual dist edits, no ZIPs.

# Cookie consent + migrated Google Analytics — 25 September 2026

- **Scope:** migrate the existing InnooRyze Google measurement to the new site behind an explicit consent gate. No Privacy/Terms pages, no SEO/GEO work, no Google Sheets, no Phase 2.
- **Google tag:** `GT-WF4XRBSQ`, the identifier the previous site loaded directly. No `G-` measurement ID was exposed by that source. `GTM-NJPT6DRQ` is recorded in src/config/analytics.mjs with `gtmEnabled:false` and appears **0 times** in dist — it is not loaded, pending an audit of whether the container also fires GA4.
- **Search Console:** `qkNhV7wi86Q1l1yc0BqXJAr7BFhrJmIETs-S7TZteeM` present on all 26 routes, exactly once per page.
- **Gate:** analytics requires granted consent **and** hostname `innooryze.com`/`www.innooryze.com`. An allowlist, so localhost, 127.0.0.1 and every preview origin are excluded by omission. A documented per-device override (`?analytics-debug=1`) exists for deliberate off-production verification; it does not bypass consent.
- **Pre-consent network:** zero requests to googletagmanager.com, google-analytics.com or analytics.google.com, verified on a simulated production hostname. `GT-WF4XRBSQ` appears exactly once in dist, in analytics-config.js.
- **Functional QA — 43/43 passed.** Production hostname simulated for real via CDP Fetch interception serving dist as `http://innooryze.com/`, so the allowlist was exercised rather than bypassed. Every Google request was recorded and then fulfilled locally with an empty body, so no hit reached the live property. Covers fresh visitor, reject, accept (tag requested exactly once per page load), custom choice persistence, withdrawal (ga-disable set, `_ga` cookies cleared, nothing requested after reload), re-granting inside the same page, localhost, preview hostname and the debug override.
- **Defect found and fixed during QA:** withdrawing analytics set `window['ga-disable-GT-WF4XRBSQ']`, but re-granting in the same page never lifted it, so the already-loaded tag stayed silently disabled until the next reload. `activate()` now clears the flag on the granted path, and a regression check covers accept → withdraw → accept without reloading.
- **Harness note:** one intermediate run reported a false failure in the fresh-visitor scenario because a second QA script was driving the same headless Chrome tab at the same time. Run alone, the suite passes 43/43 on consecutive runs. This was a harness collision, not site behaviour.
- **Responsive/accessibility QA — 414/414 passed** across 1920×1080, 1440×900, 1366×768, 1280×720, 1024×768, 834×1112, 430×932, 390×844, 375×812, 360×800: bar height 9% of viewport on desktop and 27–31% on phones, no horizontal overflow, 44px+ targets, no clipped labels, safe-area padding, labelled region, modal focus containment, Escape closing without recording a choice, focus returning to the trigger, toggle state shown by knob position as well as colour, and Essential marked always active.
- **Contrast**, measured from the pixels actually rendered behind the translucent bar: message 9.2:1, primary label 9.0:1, outlined-button and toggle boundaries raised to meet the 3:1 UI-component floor against the lightest possible backdrop.
- **Cross-browser:** WebKit (Playwright) 54/54 and Firefox (WebDriver BiDi) 60/60 — `<dialog>.showModal`, `:modal`, `inert`, `svh`, `backdrop-filter` and `env(safe-area-inset-bottom)` all resolve; 0 JS errors in either engine. Chromium results above are Chromium; they are not described as native Safari or Firefox verification.
- **Regressions:** Phase 1 brand suites (logo ratio, header heights, CTA arrows, contact block, tap targets, footer) and the watermark suite re-run with 0 failures and 0 JS errors. `npm test` 12/12, `build:production` 26 routes, `check:production` 1221 links/assets, `validate --production --http` all pass.
- **CSP** now permits the Google origins, derived from the same config as the loader so the two cannot drift. No `'unsafe-inline'` was added to `script-src`. Note that Vercel reads neither `_headers` nor `.htaccess`; that is pre-existing.
- **Not done, by instruction:** Privacy/Terms pages, SEO/GEO, Google Sheets, Phase 2. The inline Privacy Policy link in the bar renders automatically once `site.policies.privacy` is set, so it stays absent rather than pointing at a page that does not exist.

# Launch Phase 1 hotfix 2 — OO watermark now paints the real two-colour mark — 25 September 2026

- **Root cause:** the watermark was rendered through a CSS `mask-image` with a flat `background-color`. A mask uses only the artwork's alpha channel, so both brand colours were discarded and the mark rendered as a single tinted silhouette. A second factor made the crop look arbitrary: the artwork file is square but its ink is not — it occupies the middle 84% × 69% — so percentage offsets were cropping transparent padding rather than the mark.
- **Fix:** `.brand-watermark` now paints the approved artwork as a `background-image` (no mask, no tint), so the darker teal ring, the brighter cyan ring and the lighter overlap all survive. Crops are tuned against the ink box and cut across a ring rather than through the inner hole.
- **Colour preserved — measured from rendered pixels.** On the cyan CTA the mark resolves to two distinct tones either side of the background: `rgb(0,196,212)` (teal ring, darker than the backdrop) and `rgb(0,208,220)` (cyan ring, lighter), plus blend tones. On the light Contact background: `rgb(208,232,232)` and `rgb(208,240,240)`. Under the previous mask there was exactly one tone.
- **Placement and size:** Ready to Ryze bottom-right `min(780px,60vw)` desktop, `min(600px,72vw)` tablet, `min(420px,86vw)` mobile, `translate(20%,30%)` (22%/30% mobile). Contact bottom-left `min(520px,44vw)` desktop, `min(440px,54vw)` tablet, `min(380px,80vw)` mobile; on phones it moves to the upper-left edge because the opaque form card fills the lower section.
- **Visible fraction:** 66–68% desktop and tablet, 65–66% mobile, measured geometrically from the ink box against the section's clip rect at all 10 viewports.
- **Opacity:** .10 desktop, .09 tablet, .08 mobile — inside the requested 0.08–0.12 / 0.06–0.09 bands.
- **Checks:** 20/20 watermark checks pass (visible fraction, opacity, decorative attributes, no horizontal overflow). Contact keeps the H1, address, phone and email clear at every size. Phase 1 regression suites (logo, header, CTA arrow, contact block, footer, tap targets) re-run with 0 failures and 0 JS errors. `build:production`, `npm test` 7/7, `check:production` and `validate --production --http` all pass.
- **Harness note:** an earlier measurement pass reported nonsense (100%, 267%) because `scrollIntoView` returned stale rects and screenshot diffing picked up scroll-reveal animations. The final numbers come from layout offsets plus the computed transform matrix, which is scroll-independent.

# Launch Phase 1 hotfix — watermark composition and platform arrows — 25 September 2026

Two defects from manual review. No copy, routes, case studies or SEO content changed.

- **Platform arrow interpolation:** `src/components/platforms.mjs` builds its markup by concatenating **single-quoted** strings, so the `${arrowUpRight()}` inserted during Phase 1 was emitted as literal text on the 5 homepage platform cards and all 22 `/platforms` cards. Both builders now call the helper (`'…'+arrowUpRight()+'…'`). Built output: **0** literal `${arrowUpRight()}`, **0** Unicode arrows, **333** shared SVG arrows (was 306; +27 = the previously broken cards). The only remaining `arrowUpRight` string in dist is a source comment in `forms.js`.
- **Watermark composition:** the mark was cropped to roughly a quarter of the symbol and hidden below 760px. It is now anchored to a section edge and offset with `transform: translate()`, whose percentages resolve against the element, so the visible fraction is exact and independent of section size.
  - Ready to Ryze: bottom-right, 560px desktop / 430px tablet / 270px mobile, **67–70%** of the symbol visible desktop and tablet, **58%** mobile, opacity .06 desktop and tablet, .05 mobile.
  - Contact: bottom-left, sized to the open band below the sticky intro column (300px desktop, 270px tablet, ~210–250px mobile), **59–69%** visible, opacity .06 / .05.
  - Present at every breakpoint; the `display:none` rule below 760px is gone and no `display:none` for `.brand-watermark` remains in the built CSS.
  - `clip-path:inset(0)` on the contact section crops the overhang without turning it into a scrollport; an A/B test confirmed the sticky intro behaves identically with and without it (its 174px travel is bounded by the grid row, as before).
- **Text protection:** on the Contact page the mark touches **no** text or control at any of the 10 viewports. In Ready to Ryze it passes behind the headline, the CTA and (on phones) the email line by design, as a watermark. Measured worst-case text contrast with the layer toggled: headline 10.54 → **9.61**, email on mobile 10.54 → **9.72**, body and CTA unchanged — all far above the 4.5:1 AA threshold. Maximum per-channel change from the watermark is 8–13 of 255.
- **Viewports:** 1920×1080, 1440×900, 1366×768, 1280×720, 1024×768, 834×1112, 430×932, 390×844, 375×812, 360×800 — watermark and arrow checks pass at all ten, no horizontal overflow, no JavaScript errors. Header, logo, CTA arrow, contact block and footer checks from Phase 1 re-run clean.
- **Validation:** `build:production`, `npm test` (7/7), `check:production` and `validate --production --http` all pass.

# Launch Phase 1 — brand and UI consistency QA — 25 September 2026

Scope: approved trademark artwork, the shared SVG CTA arrow, verified contact details, the OO watermark and the Organization contact schema. No page copy, route, index directive or case-study content changed. Headless Chrome 153 on Windows with viewport and touch emulation — not native iOS Safari or a physical device.

- **Build and validation:** `npm run build:production`, `npm test` (7/7), `npm run check:production` (125 image variants, 26 routes, 1,221 links/assets, 25 sitemap URLs) and `validate.mjs --production --http` all passed.
- **Trademark wordmark, 10 viewports** (1920×1080 → 360×800): rendered/natural aspect ratio 4.577 vs 4.576 at every size (no distortion), logo fully inside the header, no clipping, alt `InnooRyze`, link name "InnooRyze home". Header height unchanged at 108/96/80px; desktop nav and the 52×44 hamburger stay vertically centred. Intrinsic `width`/`height` now declare the real 3290×719 artwork, so the reserved box matches (the previous 894×207 attributes described the superseded file).
- **Favicon:** the markup pointed at `brand-symbol.svg`, which no longer exists after the artwork swap — it would have 404'd on the next clean build. Now `brand-symbol.png`, plus an `apple-touch-icon` using the same file.
- **CTA arrow:** 306 rendered instances of one shared inline SVG. Zero Unicode U+2197 remain in any built HTML or client script. Measured 16.5×16.5px on a standard CTA (16–18px target), `currentColor`, no box or background, baseline within 4px of the label centre, never wrapping to its own line, always inside an `aria-hidden` wrapper with `focusable="false"`. `↻` replay, `↑` back-to-top, `←` previous and `→` flow indicators were deliberately left alone.
- **Contact page:** OFFICE / PHONE / EMAIL in the existing editorial hierarchy with no card. Address renders 6 lines at every width, 45–49px between blocks, block left edge always equals the page gutter (24px at 360px), form layout unchanged. `tel:+918015620896` and `mailto:enquiry@innooryze.com` verified; both reach a 44px touch target at ≤1000px through an invisible hit area that keeps the underline tight to the text. Address contrast and phone contrast pass AA.
- **Footer:** compact `Coimbatore, Tamil Nadu, India` plus the clickable phone inside the existing brand column. Footer height 367px desktop — a 3px increase because that column became the tallest — and unchanged at 498px (tablet) and 686px (mobile). No overflow at any width.
- **OO watermark:** Contact page and "Ready to Ryze" only. Verified by diffing screenshots with the layer toggled: it paints 14k–56k pixels on desktop/tablet with a maximum channel delta of 10–15 of 255, and **zero painted pixels fall inside the CTA link, the headline, the email link or the eyebrow** at 1920, 1440, 1280, 1024 and 834. Hidden below 760px on both sections. `pointer-events:none`, `user-select:none`, `aria-hidden`, no text, no interactive descendants. Both sections needed `isolation:isolate`: without it the `z-index:-1` layer painted *underneath* the section background and was invisible.
- **Accessibility:** 0 links without an accessible name; every arrow `aria-hidden` with `focusable="false"` and no title text; keyboard Tab reaches the phone link with a visible 2px `:focus-visible` outline at 6px offset.
- **No JavaScript errors** on any checked page.

# Final UI/UX consistency pass QA — 19 September 2026

Scope: the owner-approved mobile hero consistency fix, homepage story breathing room, the journey step-selection scroll rule, and a low-risk whole-site mobile defect sweep. No approved wording was rewritten (apart from the homepage equation the brief specified), no image was regenerated or replaced, no route changed. All results come from headless engines on Windows with viewport and touch emulation — not native iOS Safari, Android or physical devices.

- **Build and validation:** `npm run build:production`, `npm test` (7/7), `npm run check:production` (125 page-owned image variants, 26 routes, 1,195 links/assets, 25 sitemap URLs) and `validate.mjs --production --http` passed. The hover guard reported no unguarded `:hover`.
- **Hero family (75 checks: 15 pages × 430×932, 390×844, 375×812, 360×800, 834×1112):** all passed. Every `media-hero` page renders one integrated composition — the image covers the hero box and the H1 sits over it — with no horizontal overflow, no H1 under the header and the CTA comfortably visible. `/ai-agents` previously stacked copy above a 350px image at ≤760px; it now matches the family and keeps its own desktop treatment, with its focal point pinned at `--hero-focus:65% 50%` (227×55 CTA, H1 clear of the 80px header at every size).
- **Journey step selection (130 checks: 22 stages + 4 autoplay runs × 390×844, 430×932, 375×812, 360×800, 834×1112):** all passed with no JavaScript errors. With the story parked off-screen, a tap scrolls it into view (for example 800→1348 at 390×844), the story lands below the header (`photoTop` 285–291 on phones, 100 on tablet where the image is above the selector), it is 100% visible, the active step stays on screen, no second scroll follows, and there is no caption overlap.
- **Rules that must not scroll:** autoplay advanced 01→02 with the scroll position unchanged on all four journeys at every viewport. On 1920×1080, 1440×900, 1366×768 and 1280×720 a step click produced no movement at all while the story was already fully visible.
- **Reduced motion:** the move completes within 120ms (instant, not smooth) and the state still changes.
- **Keyboard:** ArrowRight moves the step, keeps focus on the newly selected button (`preventScroll`), keeps that button on screen, and leaves the story below the header.
- **Growth Systems overview tabs:** in stacked mode the selected panel now lands at 100–102px (header + 20px) instead of under the header, 76–100% visible, at 390×844, 360×800, 834×1112 and 1440×900. Pinned-mode progression is untouched.
- **Homepage story:** still `mode=pinned` with `--fit:1.000` at 430×932, 390×844, 375×812, 360×800, 834×1112 and 1440×900. At ≤760px the connector rail and node dots are gone (`content:none`), the rail gutter is removed, only two hairlines remain between the three capability rows, row padding is 20–23.3px (was 6–16.9px) and the equation sits 30.4–32px clear. Tablet and desktop keep the full treatment.
- **Whole-site sweep (25 routes × 390×844, 360×800, 834×1112, 1280×720, 1024×768):** no horizontal overflow, no clipped headings, no image missing intrinsic dimensions, no footer overflow and no JavaScript errors on any route. Header height is identical (80px) across every page family and is exposed as `--header-h`. The mobile menu opens to exactly the viewport width, makes `main` inert, has a 52×44 toggle and 44px links, and closes cleanly.
- **Touch targets raised to 44px** (≤1000px): menu toggle, mobile-nav links, header and footer logo, journey Play/Pause, Growth tab row including the Growth link, Ideas filter buttons, product demo steps, the 27×23px demo Play button, footer link/social/credits links and the Contact email link. Text links inside prose stay at 32–35px, which clears the 24px WCAG 2.2 AA minimum; forcing them to 44px would change the approved type treatment.
- **Browsers:** Chrome 153 (full matrices above), Edge 153 (hero 15/15, journey 26/26, homepage story 6/6), Firefox 145 over WebDriver BiDi (8/8, no console errors) and WebKit 26.6 via Playwright (8/8, no page errors). WebKit and Firefox measured an 82px header where Chrome measured 80px, which is exactly why the offset is measured at runtime rather than hard-coded. Firefox has no touch emulation here, so its checks used clicks.
- **Known artifacts of the audit tooling, not defects:** the Selected Work carousel reports off-viewport slides (the document itself never scrolls horizontally), and the hamburger measures 0×0 at ≥1024px because it is correctly hidden.

# Growth Systems and AI Agents story standardization QA — 19 September 2026

Scope: the owner-approved content and UI standardization across /growth-systems, the three capability pages and /ai-agents. One image-story treatment replaces the dark `.stage-interface` card and the three different overview overlays; terminology, numbering and the Data Intelligence vocabulary were unified. No images were regenerated or replaced, no routes changed, and no unrelated section was redesigned. All results come from headless Chrome 153 on Windows with viewport and touch emulation, not native Safari/iOS, Android or physical devices.

- **Build and validation:** `npm run build:production`, `npm test` (7/7), `npm run check:production` (125 page-owned image variants, 26 routes, 1,195 links/assets, 25 sitemap URLs) and `validate.mjs --production --http` passed. The hover guard reported no unguarded `:hover`.
- **State matrix:** 225 checks — 9 viewports (1920×1080, 1440×900, 1366×768, 1280×720, 1024×768, 834×1112, 430×932, 390×844, 360×800) × 25 states (Experience 5, MarTech 6, Data Intelligence 6, AI Agents 5, overview 3). All passed, with no JavaScript errors.
  - No `.stage-interface`, `.journey-overlay`, `.growth-editorial-overlay`, `.stage-data-path` or `.image-index` element remains in any state.
  - Painted story content (label, chips, statement) covers **5.8–19.3%** of the image, against 25–65% for the cards it replaces. No state overlaps the counter/caption, leaves the image box or causes horizontal overflow.
- **Measured contrast** (worst single pixel behind each text block, text hidden and its own chip fill retained, sampled at 1440×900, 834×1112 and 390×844):
  - statement **6.74:1 minimum** (median 10.69) against the 3:1 AA threshold for large text;
  - label **9.58:1 minimum** (median 11.11) and chips **11.88:1 minimum** (median 14.21) against the 4.5:1 AA threshold.
  - Two fixes came out of this pass: the label needed its own translucent chip plus a soft top gradient band, and the mobile chip `gap` override had let the sequence arrow overlap the preceding chip.
- **Behaviour (1440×900 and 390×844, all four journeys):** autoplay advanced 01→02→03 with the next image decoded; Pause held the state for 6 seconds and Resume continued; ArrowRight moved the step, focus and counter together with exactly one `aria-current`; panels stayed in sync. Under reduced motion there was no autoplay, Play was disabled, and manual step selection still loaded its image.
- **Pinned Growth Systems overview:** panels still advance 01→02→03 by scroll at both sizes with the stage pinned, the tab row reads `Experience → MarTech → Data Intelligence`, and the third tab activates `DATA INTELLIGENCE / 003`.
- **Tap targets:** the overview tab row is now at least 44px up to 1000px wide, which also covers the reduced-motion static mode where the pinned-mode rule does not apply.
- **Known, outside scope:** the homepage still shows `Experience + Technology + Intelligence = Growth` in its story equation; the overview list rows still number `01/02/03` while the heroes and image labels use `001/002/003`; the overview counter still reads `01 — 03` where journeys read `01 / 06`.

# MarTech journey image visibility QA — 17 September 2026

Scope: the owner-approved MarTech card and focal-point changes; normalising the Experience and MarTech stage images (1600×2000 masters, 800×1000 `-800` variants, two JPG→WebP); truthful asset metadata; and alt text. No copy, SEO content, other journeys or page design changed. All results come from headless Chrome 153 on Windows with viewport and touch emulation, not native Safari/iOS, Android, Firefox or physical devices.

- **Build and validation:** `npm run build:production`, `npm test` (7/7), `npm run check:production` (125 page-owned image variants, 26 routes, 1,195 links/assets, 25 sitemap URLs) and `validate.mjs --production --http` passed.
- **Asset integrity:** all 73 siteAssets entries match their file dimensions and every `srcset` width descriptor matches its file, and all 125 manifest entries match their current dimensions and SHA-256. Each of the 20 journey files served over HTTP is byte-identical to its new source file and differs from the pre-replacement copy. No route references `experience-convert.jpg` or `martech-marketing-automation.jpg`.
- **Viewports:** 1920×1080, 1440×900, 1366×768, 1280×720, 1024×768, 834×1112 and 390×844. All six MarTech states and all five Experience states were checked.
  - Every state showed the new 4:5 file. At 1920 the page used 1600w masters; at 1440 and below, the new `-800` variants (Convert and Marketing Automation always use their `.webp` master).
  - Rendered `width`/`height` are 1600×2000.
- **MarTech, per state (42 checks, all passed):**
  - The applied `object-position` matched the stage focus.
  - The card sat inside the photo, with no clipped card content, no counter/caption overlap and no horizontal page overflow. No system badges were present.
  - Card coverage: 25% at 1920; 25–31.2% at 1440/1366/1280; 27.2–33.7% at 1024; 26.6–32.6% at 834 (sentence hidden); 30.7–36.1% at 390.
  - At 390 the counter wraps to two lines. With the originally proposed 88px bottom, the card overlapped it in five of six states, so ≤760px uses 128px.
- **Behaviour (1440×900 and 390×844):**
  - Autoplay advanced 01→02→03 with the next images loaded. Pause held the state for 6 seconds, and Resume continued.
  - Under reduced motion there was no autoplay and Play was disabled; a manual step selection loaded its image.
  - The /growth-systems pinned journey still advanced 01→03 by scroll with its stage pinned at both sizes.
- **Known, outside scope:** at 390×844 the unchanged Experience card (bottom 85px) overlaps the wrapped counter in four of five states. The overlap comes from card and caption geometry, not the images. It has not been changed here.

# Responsive interaction system QA — 16 September 2026

Scope: the owner-approved rule "Same experience. Responsive execution." Changes:
- a shared motion policy (motion.js), with space levels from width and svh
- one pinned-storytelling engine (pinned.js) for the homepage story and the /growth-systems journey, including fit-by-zoom and flow mode
- scroll-linked AI words on every device
- touch equivalents for platform cards, Ideas cards and project visuals (engage.js)
- a build-time hover guard and tap feedback
- a mobile menu transition and 44px hit areas
- responsive film encode selection and Save-Data poster motion

No copy, SEO content or approved page design changed. The audit's LeadRyze desk "tilt inconsistency" was mistaken: `.lead-desk` rules target no element, and the demo is identically flat on both pages, so no tilt was added.

All results are from headless engines on Windows with viewport and touch emulation. None is a native iOS Safari, Android or physical-device test.

- **Build and validation:** `npm run build:production`, `npm test` (7/7), `npm run check:production` (26 routes, 1,195 links/assets, 25 sitemap URLs) and `validate.mjs --production --http` passed. The hover guard left no unguarded `:hover` selector (build assertion).
- **Chrome 153:** all checks passed on 22 viewports, with no JavaScript errors.
  - Viewports: 1920×1080, 1440×900, 1366×768, 1366×657, 1280×720, 1536×730, 1440×760, 1600×789, 1180×820, 1024×768, 834×1112, 768×1024, 1366×1024, 430×932, 390×844, 390×664, 375×667, 360×640, 320×568, 844×390, 932×430 and 667×375.
  - Per section and viewport, the checks were: one active panel per scroll sample, the 01→02→03 order, counter, stage within the viewport, content clear of heading and controls, no horizontal overflow, no gap or overlap with the next section, 44px step controls, tap/click and Enter activation, the toolbar simulation (innerHeight −110px plus resize leaves mode, state and progress unchanged), and touch drags passing through.
  - Both sections pinned everywhere except 320×568, 844×390 and 667×375, which used flow mode with every panel revealed and 0px blank area. Zoom factors below 1: story 0.987 (375×667), 0.969 (360×640), 0.861 (932×430); growth 0.972 (390×664), 0.917 (375×667), 0.947 (360×640), 0.998 (932×430).
  - AI words progressed with scroll on every pinned viewport.
  - Touch devices: platform colour and Ideas summary engaged in view and reset, the Explore pill showed, and carousel swipe depth applied.
  - Desktop: colour appears only on hover. It was verified by forcing `:hover`, because headless Chrome does not derive hover from synthetic mouse moves.
- **Chrome extras (final build), all passed:**
  - Mobile menu open/close transitions, with focus containment, Escape and inert page.
  - Reduced motion (1920×1080, 834×1112, 390×844): static stacked sections, ACT static, film hidden, Sound and pause disabled, motion variables 0, Ideas summaries visible on touch.
  - Explicit pause made both sections static across navigation; resume restored pinned mode.
  - Save-Data (1920×1080, 390×844): no film request, `poster-drift`, Sound and CTAs usable.
  - Rotation 390×844 → 844×390 → 1180×820 → 390×844: modes followed, and the next film scene switched between compact and full encodes.
  - A tapped footer social kept no hover styling.
  - Hit areas of at least 44px for film pause, Sound and socials.
  - Touch engage on /platforms and /ideas-hub; touch depth on /work visuals.
  - Keyboard: Growth menu (ArrowDown), Selected Work and Experience journey (ArrowRight).
  - All 26 routes at 1366×657, 390×844 and 844×390 with no horizontal overflow, one H1 and no JS errors.
- **Edge 153:** the same matrix checks passed at 1920×1080, 1366×657, 1440×760, 1024×768, 834×1112, 390×664 and 844×390, with no JS errors.
- **Firefox 155 (WebDriver BiDi):** pinned or flow checks, sequence, overlap, overflow and AI words passed at 1920×1080, 1366×657, 1280×720, 1536×730, 1440×760, 1024×768, 834×1112, 390×844, 390×664, 375×667, 932×430 and 844×390.
  - A real pointer hover revealed platform colour, and reduced motion (preference) was static. No JS errors.
  - CSS `zoom` rendered the fitted panels identically to Chrome.
  - Touch emulation is not available in Firefox here, so touch equivalents were not exercised in Firefox.
- **WebKit 26.6 (Playwright, Windows; Safari approximation):** the same pinned/flow checks passed at 1920×1080, 1366×657, 1280×720, 1536×730, 1024×768, 834×1112, 390×844, 390×664, 375×667, 932×430 and 844×390.
  - Reduced motion was static, with no page errors; `zoom` and `svh` were supported.
  - This Windows WebKit build renders Manrope lighter and draws the outlined AI words as filled. That typography was not changed; confirm on real Safari.
- **Harness notes:** the Chrome 22-viewport matrix, Firefox and WebKit runs used the build before two final engage.js refinements. Those broadened scroll depth to all `.project-visual` elements and repaint on hover-capability change; neither touches the pinned engine. The extras and Edge runs used the final build.
- **Payload:** the new modules are motion.js 1.1 KB, pinned.js 2.0 KB and engage.js 1.0 KB gzip. app.js is now 5.4 KB raw (7.8 KB before). style.css is 189 KB raw / 34.1 KB gzip, including the generated responsive motion section and hover-guard wrappers. No new network requests or dependencies. Scroll work runs in one rAF loop and only for sections near the viewport; the fit measurement runs only on stable viewport, font or motion changes.

# Homepage story and hero refinement QA — 15 September 2026

Scope: the owner-approved homepage "Two pillars" story on tablet/mobile, AI word emphasis on touch, hero film grade/shade and opening scene, and Sound under reduced/paused motion. No other section, page, copy or SEO content changed apart from a space before three scene-heading `<br>` tags. All checks ran in headless Chromium 153 using viewport and touch emulation. This is not native Safari/iOS, Android, Firefox or physical-device testing.

- **Builds and checks:** `npm run build:production`, `npm test` (7/7), `npm run check:production` (26 routes, 1,195 links/assets, 25 sitemap URLs) and `validate.mjs --production --http` passed.
- **Story, pinned (one active state per scroll sample, counter matching, stage within the viewport, content clear of header and progress, no horizontal overflow, no section gap/overlap):** 1920×1080, 1366×768, 1180×820, 1180×735, 834×1112, 744×1050, 430×932, 390×844, plus in-browser phone heights 390×664 and 430×740. Scroll order 01→02→03 at each; tap/click on each step control landed on its state.
- **Story, stacked by the fit check (too short for safe pinning):** 320×568, 360×640, 375×553 and 1366×657. Measured section-to-content gap was 0px. The previous build showed 176–242px blank areas at 1180×735/1280×720 and a 118px overlap into Products at 1280×600, caused by the dead `.story-continuous .story-scroll` selector (fixed).
- **Toolbar simulation:** with the story pinned, `innerHeight` was reduced by 110px and `resize` dispatched, then restored. Mode, active state and progress stayed identical at every pinned size. A real mobile toolbar's timing and svh behaviour still needs device confirmation.
- **Touch:** sequences of emulated touch drags moved the page through the full section and into Products at every touch size, so there is no scroll capture.
- **AI words:** on touch/smaller viewports the current word advanced UNDERSTAND→IMPROVE with scroll through the intelligence state. Desktop keeps the 1.8-second timer.
- **Reduced motion** (1920×1080, 834×1112, 390×844): stacked, all three scenes visible and not inert, 0px gap, ACT static after scrolling, film layers hidden, transitions 0s, Sound disabled. Explicit pause stacked the story and disabled Sound; resume restored pinned mode.
- **/growth-systems regression:** mode, section height, active panel, inert state, counter and progress were identical to the previous build at 11 scroll positions in each of 8 viewports.
- **Hero:** the first loaded scene is digital-connection, matching the poster and PEOPLE / POSSIBILITY label. For every text element in the hero, background luminance was sampled at 5 frames of all 6 scenes at 1920×1080, 1366×768, 1180×820, 1180×735, 834×1112, 744×1050, 430×932, 390×844 and 320×568.
  - With the new grade/shade, every element met its WCAG ratio (4.5:1 body, 3:1 large) at both its mean and 95th-percentile-bright background, in all scenes and viewports.
  - The previous build failed on the bright business-collaboration and global-city scenes. At 390×844 the ghost-button mean was 2.8:1 and the positioning text p95 2.3:1; they are now 7.19:1 and 5.91:1. The desktop accent headline p95 rose from 2.86:1 to 4.12:1.
  - Lowest remaining: scene label 4.56:1 (p95, 1180×820). These are computed sRGB ratios over sampled frames, not a monitor or full WCAG audit.

# Final production feedback QA — 14 September 2026

The approved design was preserved. This pass completed the homepage AI contrast/sequence refinement, the approved platform taxonomy and five-brand teaser, original-logo format normalization, independent page/section media and their maintenance documentation. Interaction QA continued after the completed six-size audit; that route/layout matrix was not repeated.

## Completed layout and interaction evidence

- **156 route/viewport checks**: 26 canonical routes at 1920×1080, 1366×768, 1180×820, 834×1112, 430×932 and 390×844. One H1 per route, no horizontal document overflow, no out-of-bounds H1 and no broken loaded image. Lazy stage/related imagery was additionally checked when exposed by interactions.
- Homepage AI: the visible desktop sequence advances; global pause makes ACT the static emphasis; mobile shows all words in continuous flow. Computed sRGB contrast is 5.13:1 for active text and 6.87:1 for inactive filled text/outline strokes against #e3eef0. Monitor hardware brightness was not controlled.
- Platforms: five categories, 22 entries, LeadRyze CRM first and Built by InnooRyze; homepage order is Zoho, Salesforce, Adobe Experience Platform, Braze, Segment. Mobile cards show original colors without hover. Keyboard focus reveals original colors on desktop with a visible focus ring. CRM enquiry preselection passed. Product-specific supplied marks load from local files.
- Selected Work: desktop/mobile arrow switching, native mouse drag, horizontal scroll gesture, keyboard Home, counter/progress and boundary button states passed. Dragging did not follow the image link. A case-study link and nested refresh passed. Native horizontal scrolling remains enabled with pan-x/pan-y/pinch-zoom; physical touchscreen swipe is a separate device check.
- Navigation: pointer entry opened the Growth menu; pointer traversal into the submenu kept it accessible. Click pinning, Escape, ArrowDown focus and a capability link passed. The mobile menu opened and followed a capability link; its nested reload passed.
- **44 journey-stage checks**: all five Experience, six MarTech, six Data and five AI stages at desktop and mobile. Selected control, text panel, loaded page-owned photograph and counter stayed synchronized. AI ends with Outcome. ArrowLeft moved both keyboard focus and stage. The mobile journeys remain in normal document flow.
- LeadRyze: all five demonstration steps selected exactly one scene with the correct heading; product detail navigation passed. The homepage IMMA panel opened, its links remained available, and overview-to-IMMA navigation loaded the independent product images. The external assessment link targets the approved assessment.innooryze.com URL.
- Ideas: desktop hover revealed article summaries; mobile summaries were already visible. Filtering, article navigation, article hero loading, nested refresh and a related-article link passed. Related/listing images loaded when exposed.
- Film: current and next local scenes decoded; desktop and mobile MP4 paths worked, with muted inline playback. Sound changed to its active state only after an acknowledged play request triggered by a click, and switched off. Scrolling the hero offscreen paused both film and sound. A paused reload had no video source request and retained the local poster/background fallback. Existing autoplay rejection and save-data/reduced-motion fallbacks remain in the module.
- The final browser warning/error log was empty. The existing seven enquiry validation/delivery tests and prior Contact UI checks are retained; unchanged form logic was not needlessly retested.

## Production and media verification

One clean final production build followed interaction QA. Offline lockfile installation succeeded with zero npm dependencies. All 34 source modules passed syntax checks. Validation passed for **26 canonical routes, 1,195 internal links/assets, 25 sitemap URLs, 125 page-owned image files**, responsive variants, JS imports, headings, canonical/Open Graph/schema URLs, robots and production indexing.

The static production server passed all canonical route visits, directory/index forms, nested refresh equivalents, legacy 301s, genuine 404 and video/audio byte ranges. Production output contains no local/preview path dependency. Source scan matches are confined to the optional local server, validator guard/test origin and README local-development instructions; none ship as runtime dependencies.

An isolated source copy without Sites metadata or prebuilt dist replaced both About hero variants using the same filenames, then built successfully. Both replacements survived; all 123 other image files and the approved source files remained unchanged. The ownership validator also rejects sharing physical photographs across independent sections/pages. Original optimized media bytes were preserved during organization; duplication changes storage size, not per-page loading behavior.

A clean ZIP extraction exposed long article-image paths under a nested Windows workspace. Only the physical article folders/related-image names were shortened (choosing-a-cdp, human-centered-ai, martech-mistakes); routes, images, design and independent ownership are unchanged.

The release packager validates production output and ZIP integrity, excludes secrets/caches/hosting-account metadata, and writes SHA-256/file counts beside the packages. Clean ZIP extraction/build and extracted-live smoke results are recorded beside the final release artifacts, avoiding circular archive checksums inside the archives themselves.

## Honest coverage limits and launch checks

Interactive QA used the available in-app Chromium engine with viewport emulation, native pointer dragging and horizontal scrolling. Separate Chrome/Edge applications, Safari/WebKit, Firefox, physical touchscreen gestures, assistive technology and hardware brightness were unavailable. No native cross-browser certification, full WCAG audit, Lighthouse score or field Core Web Vitals claim is made. The current CSS/JS retains standard sticky/grid/flex layouts, viewport-height fallbacks, readable mask/filter fallbacks, muted inline video, guarded audio playback and reduced-motion controls. Test the actual target browsers/devices before public launch.

Apache was not installed locally. Exact static route files and redirects are verified; .htaccess requires a smoke test on the target Apache/cPanel host. The site does not require a blanket SPA fallback. Configure the domain/SSL/document root and confirm headers/cache behavior after upload. Direct enquiry delivery requires a real endpoint; until configured, the explicit unsent email-draft fallback remains. Approved policy content and optional analytics/consent integrations remain owner inputs.

---

# Phase 3 production verification — 14 September 2026

The existing approved Phase 3 visual work was inspected and preserved. This continuation completed production indexing, canonical routing, static hosting rules, useful confirmed-platform detail, legal-page architecture, handoff documentation and release preparation. The historical Phase 2 report follows unchanged.

## Build, SEO and routing

- Clean production build: 26 canonical rendered pages. 25 indexable sitemap URLs; credits, legacy redirect and 404 are noindex. Canonical, OG, Organization/WebSite/WebPage and nested breadcrumb URLs target https://innooryze.com. Article/Service schema remains intact.
- Validator: 1,160 internal link/asset references, unique metadata, one H1 per page, valid structured data, image alt attributes, responsive source variants, cross-page anchors, browser-module imports and all film/audio files passed. Every production text file was checked for loopback, preview, local Windows and temporary-path dependencies; none found. The unused Singapore CSS reference was removed.
- Built dist was served locally, not a framework development server. All 26 routes and their nested directory/index forms returned 200. All three old Max-Seal URL forms returned 301 to /work/maxseal. Unknown paths returned 404. MP4 and MP3 byte-range requests returned 206 with the requested 1,024 bytes.
- All 7 enquiry tests passed, including validation/encoding and rejected or unacknowledged delivery. No real message was sent.
- An independent source-only copy without dist, hosting metadata, local research or the old prototype media passed offline npm ci, a clean production build and the production validator.

## Browser inspection

- 26 routes each at 1440×900 desktop, 834×1112 tablet and 390×844 mobile: 78 route/viewport checks, one H1 and no horizontal page overflow. Seven representative pages also passed at 320×740. Loaded images showed no broken source; intentionally unrequested hidden journey images were excluded from that check. Static validation checks every deferred asset path.
- Desktop Growth menu: click opening, Escape closing, ArrowDown entry/focus and following a capability link passed. Mobile menu opened and followed Data Intelligence; nested reload retained the correct page. Delayed hover dismissal is implemented; native pointer-hover/touch device behaviour still deserves target-device QA.
- Homepage film reached readyState 4 and played muted. Sound acknowledged playback only after a click. Global motion pause paused video layers and audio; resuming/offscreen behaviour retained explicit sound state. No soundtrack/media redesign occurred.
- Selected Work advanced to 02/03 on desktop and 03/03 on mobile, with matching content; settled desktop layout was visually inspected. Mobile unit measured approximately 552px, with no page overflow.
- Data Measurement selection showed its matching image and panel. Earlier saved Phase 3 verification covered Experience Convert, MarTech Channels and AI Human control. Existing synchronized loading and motion behaviour was preserved.
- Ideas MarTech filter and article navigation/reload passed; contextual capability and contact links were present. Contact displayed 7 required-field errors with focus on firstName. Completed local input produced an explicit unsent email draft and no overflow.
- Desktop carousel, mobile capability hero and tablet platform hero/content were visually reviewed. Earlier saved Phase 3 inspection covered all eight shared hero canvases, cases and About belief progression. Browser error log was empty at inspection.

## Performance and scope limits

Current measured payload: homepage HTML 29,571 bytes (7,358 gzip), combined CSS 165,984 (31,507 gzip), main app module 6,079 (2,212 gzip). Other modules and local media load as needed. These are payload measurements, not a Lighthouse or field Core Web Vitals score.

Only the available in-app Chromium engine was exercised. Separate native Chrome, Safari, Edge, Firefox, actual touch devices and assistive-technology testing were unavailable; no full WCAG audit is claimed. Apache was unavailable locally, so .htaccess was reviewed against official Apache documentation and its exact route map, but must receive a real-host smoke test. The local static server validates generated pages/redirects and does not execute Apache directives.

DNS/SSL, production server headers/cache, approved policy text, optional analytics/consent, real endpoint/spam service and end-to-end delivery remain launch configuration. The release works with the disclosed email-draft fallback. ZIP integrity/file counts/checksums are recorded in the adjacent release manifest after packaging.

---

# Phase 2 verification report

Verified locally on 13 September 2026. The approved visual direction, original logo, brand colours and multi-page architecture are preserved.

## Scope and results

- All 26 rendered routes: HTTP 200, one H1, unique titles/descriptions, canonical and social metadata, valid structured data, image alt attributes and resolved internal links/assets. The validator checked 1,131 internal link/asset references. Unknown routes return 404.
- Desktop 1440 x 900, tablet 834 x 1112 and mobile 390 x 844: all 26 routes inspected in the Codex Chromium browser with no horizontal page overflow. Ten principal routes also passed at 320 x 740. Laptop controls and layout inspected at 1366 x 768.
- Desktop Growth dropdown opens from keyboard; Escape closes it. Mobile navigation opens and follows capability links. Source includes focus containment, Escape return and inert page content while the menu is open.
- Product accordion changes between LeadRyze AI and IMMA; illustrative demonstration steps are operable. Selected Work advances to the next project with the matching counter and progress state. Native scroll, pointer and keyboard paths are implemented; real touchscreen swipes still need device testing.
- Experience conversion, MarTech CDP/Analytics and Data activation steps inspected with their matching images and interface states. Arrow-key changes move focus and stage together. Settled image crossfades preserve the layout. Only the active and next journey images are primed for loading.
- Ideas Hub topic filter hides unrelated articles. The article route opens with the matching lead image and accurate publication/update dates. The expanded media credits page renders correctly.
- The final 128 BPM soundtrack starts after a click and the control reports acknowledged playback. Film remains muted. Global motion pause stops both video layers and switches pinned storytelling to a continuous layout. Film also pauses when its hero is offscreen.
- Audio and film support byte ranges (206) with audio/mpeg and video/mp4 MIME types. The final soundtrack decodes as a 30.02-second stereo MP3. Its first 0.5 seconds have a measured mean level of -16.8 dBFS, confirming an immediate audible opening rather than the previous slow introduction.
- Contact UI shows required-field errors and focuses the first invalid field. A complete local test produces an editable-service email draft and explicitly says nothing has been sent. No test message was sent. All seven enquiry unit tests pass, including safe encoding, validation and acknowledged/failed integration responses.
- No browser errors or warnings appeared in the inspected session. Static validation found no missing referenced local media or preview-domain leakage.

## Performance and resilience

All fonts, media and browser code are local. There are no production npm dependencies, external media requests or client-side router requirements. Homepage HTML is 29,124 bytes (7,293 gzip); combined CSS is 146,144 bytes (27,443 gzip). The main browser module is 7,260 bytes (2,547 gzip). Media uses compact mobile encodes, responsive WebP images, lazy loading and selective next-scene preloading. These are measured payload figures, not a Lighthouse score or field Core Web Vitals result.

Reduced-motion preferences, visibility changes, touch-sized controls and no-JavaScript content have code/CSS fallbacks. Optional View Transitions and visual filters do not control routing or content access. No claim of a full assistive-technology or WCAG audit is made.

## Independent production build

An isolated source copy containing src, public, scripts, tests, package.json, package-lock.json, .env.example and README was built outside the project checkout. It contained no .openai configuration or prebuilt dist directory. Offline npm ci, static generation and route validation all passed. The generated dist directory can be served by a standard static host. FFmpeg/Python are optional media-regeneration tools; neither is required to build or run the website. The optional encoder no longer contains workstation-specific paths.

## Browser and launch items still requiring external verification

Only the Codex Chromium browser was available for interactive testing. Native Chrome, Safari/iOS, Edge and Firefox application testing, real touch-device swipes, screen-reader checks, slow-network performance and field Core Web Vitals remain release QA. The implementation has been reviewed for progressive enhancement and common modern-browser APIs; this is not a substitute for testing those engines/devices.

No live enquiry endpoint, spam provider or consent/analytics provider has been supplied. Configurable adapters and explicit email fallback are complete; real delivery and provider analytics cannot be tested until configured. Approved policy text/URLs and named leadership information are outstanding. Canonicals target innooryze.com while staging indexing stays disabled; enable SITE_INDEXABLE and verify host headers/domain at the approved production launch.

## Asset status

The licensed illustrative photographs and original soundtrack are usable production assets and need no mandatory replacement. Stock people are not presented as InnooRyze employees. Treffer Technologies still uses conceptual imagery until approved brand/project media is available. Client outcomes, quotes and screenshots have not been fabricated. LeadRyze's interface is labeled an illustrative demonstration; IMMA uses a real product capture. Max-Seal remains In Progress. Historical media files retained in the source are not automatically loaded by the website.
