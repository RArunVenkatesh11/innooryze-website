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
