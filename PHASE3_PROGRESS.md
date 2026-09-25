# Phase 3 refinement progress

Baseline: b7d9a554fb385e2baf35b60ace9dcfceda172ea9. Phase 2 pages, assets and interactions are complete. Preserve the approved homepage, AI hero, soundtrack, identity and route family.

- [x] 1. Growth Systems navigation: delayed hover dismissal, full-height trigger, generous submenu hit areas, click pinning, keyboard entry/Escape and existing mobile navigation. Click and keyboard route transition verified.
- [x] 2. Consistent integrated internal hero canvas (approved AI hero preserved)
- [x] 3. Homepage AI emphasis, usable Selected Work unit and platform balance
- [x] 4. Experience journey clarity
- [x] 5. MarTech journey clarity
- [x] 6. Data journey clarity
- [x] 7. AI journey and custom agent emphasis
- [x] 8. Products hero refinement
- [x] 9. Work hero and factual case-study depth
- [x] 10. Ideas hero/listing and article relationships
- [x] 11. About hero, belief reveal and distinctive content
- [x] 12. Production SEO/routing, responsive and interaction QA (26 routes at desktop/tablet/mobile; native browser and Apache host smoke tests remain launch checks)
- [x] 13. CLAUDE.md, developer documentation and two verified production ZIPs (checksums and file counts accompany the release packages)

No enquiry endpoint or approved legal/leadership details have been supplied. The initial four-platform scope was expanded by the final owner feedback on 14 September 2026; the approved taxonomy is in src/content/platform-catalog.mjs and CLAUDE.md. Native browser/device QA is distinct from Chromium viewport testing.



## Final production feedback — 14 September 2026

The initial production packages were completed and verified before this additional feedback. Preserve them as the prior release.

- [x] Readable homepage AI typography and active desktop sequence; static emphasis on smaller/touch/reduced-motion contexts
- [x] Expanded platform taxonomy, supplied logos and five-item homepage teaser; 22 categorized entries, local original assets and distinct LeadRyze CRM
- [x] Independent page/section assets and replacement mapping; 125 physical image files, preserved original bytes and strict build-time ownership resolution
- [x] Final responsive/interaction verification and documentation updates; 156 route/viewport checks and 44 journey-stage checks, with native-engine/device limits documented
- [x] Updated clean production build and release packaging; final ZIP integrity/extraction results and SHA-256 records accompany the final-production artifacts

## Homepage story and hero refinement — 15 September 2026

Owner-approved targeted change; see QA_REPORT.md for evidence and scope. Release ZIPs were not regenerated for this change.

- [x] "Two pillars" story pinned and scroll-driven on tablet/mobile via an svh-based fit check; stacked only for reduced motion, pause or too-short viewports. Fixed the dead `.story-continuous .story-scroll` selector (blank gaps/overlap). /growth-systems unchanged.
- [x] AI words follow scroll on touch/smaller screens; desktop timer and reduced-motion static ACT retained
- [x] Hero film grade `saturate(1.2) contrast(1.08)` and rebalanced breakpoint shade, verified for text contrast across all six scenes; film opens on digital-connection
- [x] Sound disabled while motion is reduced or paused
- [x] Build, tests, production/HTTP validation and README/DESIGN_SYSTEM/HANDOFF/QA updates

## Responsive interaction system — 16 September 2026

Owner-approved "Same experience. Responsive execution." See QA_REPORT.md. Supersedes the 15 September notes that the AI words use a desktop timer and that /growth-systems keeps its old stacking rules. Release ZIPs were not regenerated.

- [x] Shared motion policy and space levels (public/motion.js); `--motion-distance` / `--motion-parallax`
- [x] One pinned engine (public/pinned.js) for the homepage story and /growth-systems. Height-aware sizing and fit-by-zoom keep laptops (1366×657, 1280×720, 1440×760, 1536×730, 1600×789) and phones pinned. Flow reveal on very small viewports. Fixed the dead `.growth-continuous .growth-journey` selector.
- [x] AI words scroll-linked on every device (timer removed)
- [x] Touch equivalents: platform colour/lift, Ideas reveal, Explore pill, carousel swipe depth, work visual depth (public/engage.js)
- [x] Build-time hover guard (scripts/hover-guard.mjs), tap feedback, mobile menu transition, 44px hit areas
- [x] Film encode selection follows rotation; Save-Data poster motion
- [x] Chrome, Edge, Firefox and WebKit verification; CLAUDE/README/DESIGN_SYSTEM/SITE_ARCHITECTURE/HANDOFF/QA updates

## Launch Phase 1 — brand and UI consistency — 25 September 2026

Owner-approved. Brand artwork, CTA icon, verified contact details and contact schema only. No copy, routes, indexing, case studies or SEO content changed; no release ZIPs.

- [x] Approved trademark wordmark used for header and footer with truthful intrinsic dimensions; favicon and apple-touch-icon moved to the approved OO symbol (the old `brand-symbol.svg` reference would have 404'd)
- [x] One shared inline SVG north-east arrow (`arrowUpRight()` / `.cta-arrow`) replacing all 41 Unicode arrows across components, fragments and client-built markup; other arrow meanings untouched
- [x] Verified office address, phone and email on the Contact page; compact location and phone in the footer
- [x] OO watermark limited to the Contact page and the Ready to Ryze CTA, subtle, decorative and clear of text and controls
- [x] Organization schema gains PostalAddress, telephone and a customer-enquiries ContactPoint; no invented offices and no LocalBusiness
- [x] 10-viewport QA, accessibility checks, build/test/production validation and documentation

## Final UI/UX consistency pass — 19 September 2026

Owner-approved: three targeted fixes plus a controlled whole-site responsive QA sweep. No images regenerated or replaced, no routes changed, no release ZIPs.

- [x] One mobile hero language for the media-led family (`media-hero`): `/ai-agents` no longer renders copy-then-image at ≤760px, and its approved desktop hero is untouched
- [x] Homepage story mobile breathing room: connector rail, node dots, the rail gutter and the repeated row rules removed; one hairline between capability rows; row padding 20–23px and a 32px equation gap; still pinned at `--fit:1.000`
- [x] User-initiated journey step selection brings the story into view below the fixed header (`bringIntoView` in motion.js, shared by journeys.js and pinned.js); autoplay, scroll progression and initialisation never move the viewport; reduced motion positions instantly
- [x] Growth Systems overview tabs use the same rule in stacked mode; pinned progression untouched
- [x] `--header-h` exposes the live header height to JS and to every `scroll-margin-top`, replacing nine hard-coded offsets
- [x] Touch targets raised to 44px across navigation, journey/demo controls and footer links; homepage equation now reads `Experience + Technology + Data Intelligence`
- [x] 75 hero checks, 130 journey-tap checks, 25 routes × 5 viewports swept, Chrome/Edge/Firefox/WebKit, build/test/validation, docs updated

## Growth Systems and AI Agents story standardization — 19 September 2026

Owner-approved after a full content and UI hierarchy audit. See QA_REPORT.md and DESIGN_SYSTEM.md. No images were regenerated, no routes changed, and release ZIPs were not regenerated.

- [x] One shared image-story treatment (`stageStory()` + `.stage-story`) for Experience, MarTech, Data Intelligence, AI Agents and the three overview panels; the dark `.stage-interface` card, both overview overlay systems and 92 retired CSS rules are gone
- [x] Growth Systems overview moved from the static `src/fragments/growth.html` into `growthJourney()`, so all four journeys and the overview share one visual language
- [x] Terminology: `Data Intelligence` replaces standalone `Intelligence` in the journey tab, capability tag, overview eyebrow, hero equation, hero figcaption and mega menu; capability chapter heading is now `Data intelligence.`
- [x] Numbering: service heroes use `GROWTH SYSTEMS / 001–003`; image labels use `EXPERIENCE / 001`, `MARTECH / 002`, `DATA INTELLIGENCE / 003`; AI Agents stays the second pillar (`02 / AI AGENTS & AUTOMATION`)
- [x] New Growth Systems hero, per-stage image stories for all 22 journey states, MarTech connected-tools row removed, Data Intelligence reduced to one stage vocabulary, AI Agents stage 05 relabelled `OUTCOME / 05` with a matching journey intro
- [x] Focal points moved from nth-child CSS to semantic `focus` configuration, with the same values
- [x] 225 state checks across 9 viewports, measured AA contrast, behaviour and pinned-mode regression, build/test/validation, docs updated

## MarTech journey image visibility — 17 September 2026

Owner-approved. The work was resumed after an interrupted session; unfinished parts were audited, then completed without repeating finished edits. See QA_REPORT.md and ASSET_REGISTER.md. Release ZIPs were not regenerated.

- [x] Compact lower-left MarTech card: badges removed, softer gradient, sentence hidden at ≤1000px, mobile clearance for the counter/caption
- [x] Per-stage focal points (R09–R14) via `focus`; the stale CRM `50% 25%` rule was removed
- [x] Experience and MarTech masters normalised to 1600×2000 WebP; the nine `-800` variants rebuilt at 800×1000; convert/marketing-automation JPG → WebP
- [x] Intrinsic `width`/`height` emitted from siteAssets dimensions; siteAssets and image-ownership.json corrected (including the three growth capability files at 1448×1086)
- [x] Alt text for R09–R14 and the Experience stages describes the new images without presenting on-screen figures as results
- [x] Build, tests, production/HTTP validation and Chrome verification; ASSET_REGISTER/DESIGN_SYSTEM/QA updates


## Launch: cookie consent + migrated Google Analytics

- [x] Google tag `GT-WF4XRBSQ` migrated from the previous site and centralised in `src/config/analytics.mjs`; the build emits the browser subset to `dist/analytics-config.js` and derives the CSP allowlist from the same file
- [x] `GTM-NJPT6DRQ` recorded with `gtmEnabled:false` and **not loaded**, pending an audit of whether the container also fires GA4 (0 occurrences in dist)
- [x] Search Console token on all 26 routes, exactly once per page
- [x] Consent gate: analytics needs granted consent **and** the `innooryze.com` / `www.innooryze.com` allowlist, so localhost and every preview origin are excluded by omission; `?analytics-debug=1` is the documented per-device override
- [x] Consent bar and `<dialog>` preferences panel built from the existing dark surface, cyan primary and 44px touch floor; footer "Cookie settings" reopens the panel
- [x] Google Consent Mode v2 denied-by-default; withdrawal disables the tag and clears `_ga*` cookies; re-granting in the same page re-enables it
- [x] 43 functional + 414 responsive/accessibility checks in Chromium, 60 in Firefox, 54 in WebKit; brand and watermark regressions re-run clean
- [ ] Privacy and Terms pages — next task; the inline Privacy Policy link appears automatically once `site.policies.privacy` is set
- [ ] Audit `GTM-NJPT6DRQ` and decide between the container and the direct tag

## Launch: Privacy Policy + Terms & Conditions

- [x] `/privacy-policy` and `/terms-and-conditions` published from the approved live pages; 28 canonical routes, 27 sitemap URLs
- [x] src/content/policies.mjs generated from the retrieved markup rather than retyped — 0 omissions, 0 additions, 0 reorderings against the live source
- [x] Structure corrected only: `<h5>` section headings → `<h2>`, `2.1`-style → `<h3>`, loose `<li>` → real lists, email linked; dates and registered identity preserved verbatim
- [x] src/components/policy.mjs renders on the Ideas Hub reading layout: LEGAL eyebrow, document H1, Effective/Last Updated row, contents rail above 1280px, ~770–820px measure
- [x] Footer legal row: Privacy · Terms · Cookie settings · Visual credits, with the existing consent control reused rather than duplicated
- [x] Cookie bar Privacy Policy link now resolves and navigates; consent architecture and Analytics gating untouched
- [x] 461 accessibility/responsive checks across ten viewports; 7 new offline policy guards in npm test
- [ ] Ideas Hub contents rail still uses the 3.76:1 link colour on article pages — pre-existing, worth fixing with those pages
- [ ] No cookie policy approved, so /cookie-policy stays unpublished

## Phase 2: case studies, verified proof and the work visual system

- [x] /work/qualtura published; /work/industrial-valve-digital-experience replaces the named client case, with both legacy URLs redirecting permanently
- [x] Treffer transparent derivative produced losslessly (round-trip error 0); neutral-plaque fallback NOT required
- [x] One shared client-logo plaque, area-normalised; measured rendered ink areas within 1.0%
- [x] Dynalektric proof block (20% / 5% / Global) and verbatim testimonial; optional blocks render only when approved
- [x] Homepage trio Dynalektric / Qualtura / Treffer; Work hub ordered with the anonymous case fourth and IMMA last
- [x] Anonymisation complete: only the two mandated alias URLs remain; identifying assets archived outside public/
- [x] 700 responsive/integrity checks across ten viewports; build, tests and production validation pass
- [ ] 5.09 MB of unreferenced owner-supplied sources still ship to production — excluding them needs approval
- [ ] Ideas Hub contents rail still uses the 3.76:1 link colour (carried over from the legal-pages task)

## Phase 2 refinement pass

- [x] Client logo appears once per page, in the project facts CLIENT field; removed from homepage cards, work cards and all case heroes
- [x] Qualtura opens with the dark intro hero then a full-width screenshot stage; no headline over live UI
- [x] Verified Outcomes divider clearance fixed structurally (54px at 1920, 49px at 1440), outer values flush with the container
- [x] 492 checks across ten viewports pass; build, tests and production validation clean

## Phase 3A: technical launch foundation

- [x] Fail-safe environment-aware indexing; Vercel preview can no longer be made indexable
- [x] vercel.json generated from source and drift-checked by check:production
- [x] Security headers now actually delivered on Vercel, including HSTS (1 year, no includeSubDomains/preload)
- [x] Real permanent redirects: www -> apex, both aliases in both slash forms, one hop each
- [x] 10.74 MB of unreferenced masters/iterations withheld from dist (30.80 -> 20.06 MB media)
- [x] Consent 43/43, GTM still disabled, CSP unchanged in substance
- [ ] Live Vercel confirmation of 308 statuses, header delivery, www redirect and trailingSlash interaction
- [ ] Vercel dashboard: set innooryze.com primary, www redirecting; do not set SITE_INDEXABLE

## Phase 3A addendum: host-agnostic confirmation

- [x] Confirmed no hard Vercel dependency: zero deps/APIs/middleware, vercel.json never enters dist, build:production works with no Vercel signal
- [x] Fixed adapter parity — .htaccess was missing HSTS; all three adapters now render one shared definition
- [x] check:production asserts adapter parity and that dist carries no host-specific config
- [x] Docs state Vercel = temporary preview, final production host = To Be Confirmed
- [ ] Final hosting platform selection (owner)

## Phase 3B: SEO/GEO semantic refinement

- [x] 41 visible-copy refinements within ±20%, measured against a captured baseline
- [x] 0 heading re-wraps, 0 new overflow across 140 route/viewport samples
- [x] 22 metadata fields; titles <= 59, descriptions <= 155, all supported by visible copy
- [x] +7 contextual internal links inside existing sentences
- [x] Regional statement on /about (US, UK, APAC, India); no offices implied
- [x] Contact H2, /work/imma consolidation, /products/imma compact strengthening, Ideas Hub contrast
- [ ] Phase 3C (not started)
