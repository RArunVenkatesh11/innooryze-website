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

