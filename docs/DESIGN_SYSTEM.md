# Design system

The approved direction is premium, modern, cinematic, editorial and clean, with animation that remains controlled. Avoid a generic AI aesthetic, excessive decorative gradients, arbitrary robots, glowing AI brains, cheap-looking stock imagery, repetitive generic cards and repeated clipped image corners. Preserve the approved real-world media and existing compositional decisions.

## Identity and composition

Preserve public/assets/brand/brand-logo.png and brand-symbol.png unchanged. brand-logo.png is the approved trademark wordmark (3290x719, TM included) and is the only wordmark used in the header, the footer and any primary corporate placement; brand-symbol.png is the approved standalone OO symbol, used for the favicon/app icon and for the OO watermark. For performance the site serves pixel-resized derivatives of these same masters (brand-logo-247/494/741.png, brand-symbol-192.png, brand-symbol-1200.webp); regenerate them from the masters if the artwork is ever replaced. Never redraw, recolour, re-proportion or rebuild either mark in SVG or text. Core colours: cyan #00d4df, charcoal #11191b, deep teal #142326/#102a31 and pale #edf4f4/#f7f7f3. Manrope is the display face; DM Sans supports body/UI. WOFF2 and SIL licenses are local. Inspect actual tokens/computed styles: the build maps historical base values into the approved palette.

Generous section spacing, purposeful large headings, strong image crops, thin rules and small tracked eyebrow labels define the system. --pad supplies responsive horizontal spacing. Preserve the homepage sequence, two-pillar story, product panels, Selected Work, Platform Expertise, Ideas teaser, closing CTA and shared footer.

Internal canvas heroes integrate image, charcoal gradient and copy. Desktop height clamps to 720–820px; headline type to 52–88px. Responsive rules change copy width, image focus and height.

Every media-led hero carries `media-hero`, and that class owns one mobile composition (≤760px): the photograph is the canvas at `inset:0` behind the copy, a directional gradient carries contrast, and the eyebrow, H1, body and CTA sit over it at shared spacing. `canvas-hero` additionally carries that composition on desktop. The approved AI hero keeps its own desktop treatment and joins the family only at mobile, where it previously stacked copy above a 350px image; its focal point is pinned with `--hero-focus`. The functional Contact composition has no media hero and stays out of the family. Article, case-study and listing pages inherit whichever hero their page family already used — do not force a new one. Keep meaningful imagery and legible copy at 320px. Avoid repeating clipped corners, isolated floating image blocks or a generic dashboard style.

Selected Work is one unit: visual, context, case link, counter/progress and controls. Desktop splits 60/40; mobile stacks. Do not permanently expose a partial next slide. Platform logos use supplied/official local originals with per-brand container dimensions and object-fit:contain; do not crop or distort them. The five-brand homepage teaser and spacious category grid share their logo treatment.

## Final AI and platform treatment

Keep UNDERSTAND → REASON → ACT → CONNECT → IMPROVE, including the layered outline/italic typography. The panel is #e3eef0; inactive filled text and outline strokes are #38545a (6.87:1 against the panel); active text is the deeper cyan #006d79 (5.13:1). Body text is #36545c (6.88:1). These are computed sRGB contrast ratios, not a physical monitor brightness test or a complete accessibility certification. All words remain at full opacity.

On every device the emphasis follows scroll with one mechanism (public/kinetic.js, driven by the story engine). It moves across the pinned intelligence state, or as the panel rises through the viewport in flow mode. There is no timer. When motion is stopped/reduced, ACT is a static accent. The complete sequence stays readable in every mode.

Platform grids have four desktop columns, three at <=1200px, two at <=1000px and one at <=760px. The homepage uses five columns, then three, then two with the final item spanning the mobile row. Cards default to monochrome marks on deep teal. Hover/focus reveals original brand colors on a pale panel with small elevation, scaled by `--motion-distance`. On hoverless (touch) devices the card crossing the middle band of the viewport receives the same revealed state (`.is-engaged`) and resets as it leaves. All names, context and links are always available. LeadRyze CRM is the first CRM card with Built by InnooRyze and a text wordmark; it subtly differs from external brands.

Page photos live under `public/assets/images/<page>/`, mapped in `src/config/siteAssets.mjs`. Each major section owns a file, including related cards and journey stages. Same-name replacements preserve the existing crop/aspect ratio and update both responsive variants; see ASSET_REGISTER.md.

## Motion and interaction

Film uses six local scenes and a muted poster fallback, opening on digital-connection (matching the poster and PEOPLE / POSSIBILITY label) and looping through business, data, human + machine, craft and culture. Only the active/next scene loads. Progress Pulse is the approved original 128 BPM soundtrack, with immediate rhythm; it needs no replacement. Sound starts after a gesture and pauses with motion/visibility controls; the Sound button is disabled while motion is reduced or paused.

The film and poster share one grade on `.film-media`: `saturate(1.2) contrast(1.08)`, with no brightness lift. The hero shade keeps darkness behind the copy and opens the rest of the frame. On desktop (>1000px) it runs 82% at the left edge to 0% at the right, with a short bottom band protecting the footer controls. At <=1000px the copy spans most of the width, so darkness sits in the copy band and the area above it stays open. Exact stops are in phase1.css. Any retune must be re-measured against the brightest frames of all six scenes at desktop, tablet and mobile; body text needs 4.5:1 and large headline text 3:1.

### Same experience. Responsive execution.

Desktop, laptop, tablet and mobile keep the same storytelling, animation and interaction. Layout, type, spacing, animation distance, parallax and duration adapt to the available space. Interactions are never disabled because a device is touch-based, narrow or short. Static presentation is reserved for `prefers-reduced-motion`, the explicit pause control, or a genuine browser capability limit with a graceful fallback.

- **Motion policy (public/motion.js).** `motion.stopped()` is true only for reduced motion or pause. A stable viewport (width plus `svh`, so mobile toolbars never change it) sets `data-space` on `<html>` to compact, regular or spacious. CSS maps the level to `--motion-distance` (1 / .75 / .5) and `--motion-parallax` (.08 / .06 / .04); both are 0 for reduced motion or pause. Use these variables for new movement instead of width checks.
- **Pinned storytelling (public/pinned.js).** The homepage "Two pillars" story and the /growth-systems capability journey share one engine: a sticky stage, one active panel, native scroll (no capture or snapping), counter, progress, 44px step controls and keyboard buttons.
  - Stage spacing and type are height-aware (`svh` clamps).
  - When a short viewport still cannot fit a panel, its content is zoomed down (`--fit`, never below 0.82) instead of switching to static.
  - Only if that minimum cannot fit (for example 320×568 or a 844×390 landscape phone) does the section use flow mode: normal document flow where each panel reveals as it enters view.
  - Reduced motion or pause uses the static stacked layout.
  - Mode decisions run only when the stable viewport, fonts or motion setting change.
- **Bring-into-view on selection (public/motion.js `bringIntoView`).** A *user-initiated* state change brings its content into view; an automatic one never moves the viewport.
  - Applies to the four journey step selectors (journeys.js) and the Growth Systems / homepage story tabs in their stacked mode (pinned.js). Autoplay, scroll-linked progression, page initialisation and the pinned scroll progression never scroll.
  - The target lands below the fixed header: `--header-h` (measured from `#header`, kept current by a ResizeObserver and on `orientationchange`) plus a 20px gap. CSS anchors use the same value through `scroll-margin-top:calc(var(--header-h,104px) + 20px)`.
  - The step list rides along as a companion: when the control and the story both fit under the header, the pair is aligned as a group, so the control the visitor just used stays on screen. Otherwise the story itself is aligned.
  - Content that is already fully visible is left alone, so wide layouts never produce a pointless jump.
  - Reduced motion or pause positions instantly; otherwise the move is smooth. Keyboard activation keeps focus on the selected button (`focus({preventScroll:true})`) and no URL or history entry is created.
- **Touch equivalents (public/engage.js).** Hover-only effects have a touch equivalent. On hoverless devices, platform cards, Ideas cards (image, summary and bottom line) and project visuals ("Explore" pill) take their hover state while crossing the middle band of the viewport. Case and Selected Work visuals get a restrained scroll-linked depth, and the Selected Work carousel adds swipe depth for every input.
- **Hover guard (scripts/hover-guard.mjs).** At build time every `:hover` selector moves into `@media (hover:hover)`, so a tap never leaves a hover state stuck. `:focus-visible` and `.is-engaged` alternatives stay unconditional. The build fails if a bare `:hover` remains. Touch screens get `:active` press feedback instead.
- **Performance.** Scroll work runs in one rAF loop and only for sections near the viewport. Compact space shortens travel and parallax rather than removing them.

Growth navigation has full-height triggers, generous links, delayed hover dismissal, click pinning, ArrowDown entry and Escape closing. Mobile navigation opens and closes with a short fade/slide (about 0.2s), contains focus and makes background content inert. Compact controls (film pause, Sound, footer socials) keep their look but have invisible 44px hit areas. The hero film uses the compact encodes on phone-sized screens and switches from the next scene after a rotation. With Save-Data the poster drifts slowly instead of loading the film; hero content, CTAs and Sound stay usable. The carousel supports arrows, keyboard and native scroll/pointer interaction. Product demos and filters expose content without requiring hover.

Experience, MarTech, Data Intelligence and AI Agents journeys decode the selected photo before updating photo, text and counter together. Stale image loads cannot override a newer selection. Keep manual controls, pause, offscreen suspension and reduced-motion support. About's belief is normal readable HTML; scroll adds emphasis only.

### The image-story treatment

One treatment carries every journey image and every Growth Systems overview panel: `stageStory()` in components/stage-visuals.mjs, styled as `.stage-story` in phase3.css. The photograph stays dominant and there is no content card.

- **Structure:** a small label chip top-left (`LABEL / 0n`), then a lower block of at most two micro-flow chips and one statement. The overview uses the same block with `sequence` chips, which draw a connecting arrow between them.
- **Contrast:** a two-part gradient on the image (`.stage-visual:after` / `.capability-visual:after`) carries readability — a soft top band for the label and a stronger bottom band for the statement. The label and chips add their own translucent fill. If a new photograph is too bright, strengthen the gradient; never add an opaque card.
- **Clearance:** `--story-foot` keeps the copy above the counter/caption (84px, 128px at ≤760px; 22px on the overview, which has no caption).
- **Budget:** painted text and chips cover 6–20% of the image across the supported viewports. Treat 25% as the ceiling.
- **Split of duties:** the image carries the label, flow and statement; the right-hand panel carries the eyebrow, headline and body. Do not repeat a sentence on both sides.

Each stage sets its own focal point with `focus` in stage-visuals.mjs, emitted as `--focus` and read by `object-position`. Do not reintroduce nth-child `object-position` rules.

## Buttons, forms and interaction principles

Reuse the existing filled primary CTA, outlined secondary CTA, underlined text link and circular control treatments. Preserve label/arrow spacing, contrast, visible keyboard focus and clear disabled states. Use anchors for navigation and buttons for state changes. Controls should remain comfortable on touch screens; do not shrink them to fit an overcrowded row or make meaning depend on hovering.

Contact uses visible labels, native inputs/selects, required-field guidance, useful validation messages and a form-level status. Preserve focus on actionable errors, loading/disabled submission controls (the moment Send is pressed the button reads "Sending your enquiry…" with a small ring spinner in place of the arrow, keeps its height and colour, and is disabled; the spinner stays still under reduced motion or the pause control), retry feedback and clear acknowledgement states. A captured enquiry replaces the form, inside the same right-hand frame, with the thank-you state: check mark, THANK YOU. eyebrow, and an H2 in the page's heading style with a teal emphasis. Side by side, the frame keeps the form's height and the message stays in view, so the left column, the section and the watermark never move. Focus moves to the thank-you panel, which announces its heading and message. Errors keep the form filled and focus the concise error message. Cloudflare's checkbox appears in the form only when Cloudflare requires a challenge. Do not replace labels with placeholders. Form rows stack on small screens; long choices and errors must wrap without overflow. Provider integration details belong in README/DEPLOYMENT rather than in decorative UI copy.

Navigation, filters, product demos, journey steps and the carousel must give the same information through keyboard and touch. Keep selected states visible, make controls reachable, retain normal vertical scrolling and provide static/reduced-motion fallbacks. Preserve existing behavior for a content update; do not add a new interaction concept as incidental polish.

## Legal pages

/privacy-policy and /terms-and-conditions reuse the Ideas Hub reading layout rather than adding a second one: the same sticky contents rail, the same measure, the same header-aware anchor offset and the same touch targets. The hero is the standard text-only `.page-hero` with a LEGAL eyebrow, the document name as H1, a short description and a dates row (Effective Date / Last Updated) opposite it, stacking beneath on phones. No hero imagery, illustration, gradient or per-section card.

Section headings keep the source's own numbering and capitals, so they are set at 17–19px with positive tracking rather than at editorial display size, where set caps would shout. Sections are separated by a hairline rule; list items use a short teal dash instead of a bullet. The contents rail shows above 1280px; below that it steps aside so the document keeps a comfortable measure instead of being squeezed beside a sidebar, and every section keeps its id for deep links. The rail's link colour is darkened to 4.9:1 for legal reading — the Ideas Hub rail still uses the lighter shared value.

## Cookie consent surfaces

Built from the existing system, not a parallel one. The bar uses the dark surface and hairline border of the inner header and mega-menu, `.button-cyan` cyan for the primary action, the eyebrow letterspacing for "Always active" and the site's 44px touch floor. No cookie iconography, illustration, rounded card or heavy shadow.

- **Bar:** fixed to the viewport bottom, full width, aligned to `--pad`. Desktop puts the message left and the three actions right; from 760px down the actions become a two-column grid — Reject and Accept side by side at equal width, Manage preferences beneath. Grid placement, not flex `order`, so the pairing is deliberate. Bottom padding adds `env(safe-area-inset-bottom)`. `z-index:28` keeps it under the mobile navigation overlay (29), and navigation.js marks it `inert` while that menu is open.
- **Panel:** a native `<dialog>` opened with `showModal`, which supplies the focus trap, Escape and backdrop. Centred and 520px on desktop, a bottom sheet below 760px. Only the category list scrolls, so the three decision buttons are always in view.
- **Hierarchy:** Accept all is the only filled button; Reject non-essential carries the same outline treatment and equal width, so neither is visually weighted against the other.
- **Motion:** a short fade and 14px rise, removed under `prefers-reduced-motion`.
- **Contrast:** measured against the pixels rendered behind the translucent bar, not a computed colour. Message 9.2:1, primary label 9.0:1, outlined-button boundaries at or above the 3:1 UI-component floor.

## Accessibility and responsive checks

Preserve skip link, landmarks, one H1, visible focus, real buttons, labelled fields and actionable errors. Status cannot depend only on colour. Keep meaningful alt text and readable semantic copy; use normal links for navigation. Respect prefers-reduced-motion and global pause. No-JavaScript content must remain readable.

Check large desktop 1920×1080, laptop 1366×768, tablet landscape 1180×820, tablet portrait 834×1112, large mobile 430×932 and standard mobile 390×844; spot-check 320px. Review long labels, form errors, carousel slides and journey steps. Viewport inspection is not a native touch/screen-reader/WCAG certification. The actual scope is in QA_REPORT.md.

## Stylesheet ownership

Cascade: base.css → phase1.css → phase2.css → refinements.css → phase3.css. Final Phase 3 rules cover navigation, canvas heroes, carousel, journeys, cases, Ideas and About. Reuse existing components and inspect computed styles before adding overrides. Keep changes scoped; do not undo another page through a broad selector. A material design change requires deliberate review across page families.

### CTA arrow and the OO watermark

North-east action arrows are one shared inline SVG, `arrowUpRight()` in src/components/icons.mjs, rendered through `.cta-arrow`. Never use the Unicode glyph U+2197: iOS Safari substitutes a boxed colour emoji for it. The icon draws in `currentColor`, sizes itself from the container font-size (`.72em`, about 16.5px on a standard CTA) and is always `aria-hidden`. Keep it for primary and secondary CTAs, "Explore" links, case links and other north-east action or external indicators. Do not use it for menu chevrons, carousel or previous/next controls, the back-to-top arrow, the scroll-down cue or the agent replay control, whose meanings differ.

The OO symbol doubles as a watermark in exactly two places: the Contact page and the "Ready to Ryze" closing CTA. `.brand-watermark` **paints the approved artwork as a background image**, so the two-colour mark survives: darker teal ring, brighter cyan ring and the lighter blend where they overlap. Never mask-and-tint it — a CSS mask keeps only the alpha channel and flattens the mark to one colour. Opacity alone holds it back: .10 desktop, .09 tablet, .08 mobile. It is `pointer-events:none`, unselectable, `aria-hidden`, on a `z-index:-1` layer (both sections set `isolation:isolate` so that layer paints above the section background and below content). The artwork file carries transparent padding — its ink spans 7.7-92.0% horizontally and 15.7-84.3% vertically — so crops are tuned against the ink, not the box, and cut across a ring rather than through the inner hole. About 65-68% of the mark stays visible at every breakpoint, anchored bottom-right in the CTA and bottom-left on Contact (upper-left on phones, where the opaque form card fills the lower section). It is present on every screen size. Do not scatter it elsewhere.
