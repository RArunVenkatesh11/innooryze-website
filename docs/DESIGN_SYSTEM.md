# Design system

The approved direction is premium, modern, cinematic, editorial and clean, with animation that remains controlled. Avoid a generic AI aesthetic, excessive decorative gradients, arbitrary robots, glowing AI brains, cheap-looking stock imagery, repetitive generic cards and repeated clipped image corners. Preserve the approved real-world media and existing compositional decisions.

## Identity and composition

Preserve public/assets/brand/brand-logo.png and brand-symbol.svg unchanged. Core colours: cyan #00d4df, charcoal #11191b, deep teal #142326/#102a31 and pale #edf4f4/#f7f7f3. Manrope is the display face; DM Sans supports body/UI. WOFF2 and SIL licenses are local. Inspect actual tokens/computed styles: the build maps historical base values into the approved palette.

Generous section spacing, purposeful large headings, strong image crops, thin rules and small tracked eyebrow labels define the system. --pad supplies responsive horizontal spacing. Preserve the homepage sequence, two-pillar story, product panels, Selected Work, Platform Expertise, Ideas teaser, closing CTA and shared footer.

Internal canvas heroes integrate image, charcoal gradient and copy. Desktop height clamps to 720–820px; headline type to 52–88px. Responsive rules change copy width, image focus and height. The approved AI hero and functional Contact composition are intentional exceptions. Keep meaningful imagery and legible copy at 320px. Avoid repeating clipped corners, isolated floating image blocks or a generic dashboard style.

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
- **Touch equivalents (public/engage.js).** Hover-only effects have a touch equivalent. On hoverless devices, platform cards, Ideas cards (image, summary and bottom line) and project visuals ("Explore" pill) take their hover state while crossing the middle band of the viewport. Case and Selected Work visuals get a restrained scroll-linked depth, and the Selected Work carousel adds swipe depth for every input.
- **Hover guard (scripts/hover-guard.mjs).** At build time every `:hover` selector moves into `@media (hover:hover)`, so a tap never leaves a hover state stuck. `:focus-visible` and `.is-engaged` alternatives stay unconditional. The build fails if a bare `:hover` remains. Touch screens get `:active` press feedback instead.
- **Performance.** Scroll work runs in one rAF loop and only for sections near the viewport. Compact space shortens travel and parallax rather than removing them.

Growth navigation has full-height triggers, generous links, delayed hover dismissal, click pinning, ArrowDown entry and Escape closing. Mobile navigation opens and closes with a short fade/slide (about 0.2s), contains focus and makes background content inert. Compact controls (film pause, Sound, footer socials) keep their look but have invisible 44px hit areas. The hero film uses the compact encodes on phone-sized screens and switches from the next scene after a rotation. With Save-Data the poster drifts slowly instead of loading the film; hero content, CTAs and Sound stay usable. The carousel supports arrows, keyboard and native scroll/pointer interaction. Product demos and filters expose content without requiring hover.

Experience, MarTech, Data and AI journeys decode the selected photo before updating photo, text, nodes and counter together. Stale image loads cannot override a newer selection. Keep manual controls, pause, offscreen suspension and reduced-motion support. About's belief is normal readable HTML; scroll adds emphasis only.

The MarTech journey card stays compact so the 4:5 photography remains visible (phase3.css):
- **Desktop:** lower-left at 30px, `width:min(62%,520px)`, bottom 76px, 22px padding, a 84% dark fill with an 8px blur, and a lighter image gradient. It carries no system badges; the connected-tools row below the journey already shows that progression.
- **≤1000px:** 20px insets, bottom 88px, and the supporting sentence is hidden.
- **≤760px:** 16px insets, bottom 128px so the card clears the wrapped counter and caption, and a 520px-tall photo.

Each stage sets its own focal point with `focus` in stage-visuals.mjs; do not reintroduce nth-child `object-position` rules for MarTech.

## Buttons, forms and interaction principles

Reuse the existing filled primary CTA, outlined secondary CTA, underlined text link and circular control treatments. Preserve label/arrow spacing, contrast, visible keyboard focus and clear disabled states. Use anchors for navigation and buttons for state changes. Controls should remain comfortable on touch screens; do not shrink them to fit an overcrowded row or make meaning depend on hovering.

Contact uses visible labels, native inputs/selects, required-field guidance, useful validation messages and a form-level status. Preserve focus on actionable errors, loading/disabled submission controls, retry feedback and clear acknowledgement states. The unconfigured form explicitly prepares an unsent email draft. Do not style a draft as a completed submission or replace labels with placeholders. Form rows stack on small screens; long choices and errors must wrap without overflow. Provider integration details belong in README/DEPLOYMENT rather than in decorative UI copy.

Navigation, filters, product demos, journey steps and the carousel must give the same information through keyboard and touch. Keep selected states visible, make controls reachable, retain normal vertical scrolling and provide static/reduced-motion fallbacks. Preserve existing behavior for a content update; do not add a new interaction concept as incidental polish.

## Accessibility and responsive checks

Preserve skip link, landmarks, one H1, visible focus, real buttons, labelled fields and actionable errors. Status cannot depend only on colour. Keep meaningful alt text and readable semantic copy; use normal links for navigation. Respect prefers-reduced-motion and global pause. No-JavaScript content must remain readable.

Check large desktop 1920×1080, laptop 1366×768, tablet landscape 1180×820, tablet portrait 834×1112, large mobile 430×932 and standard mobile 390×844; spot-check 320px. Review long labels, form errors, carousel slides and journey steps. Viewport inspection is not a native touch/screen-reader/WCAG certification. The actual scope is in QA_REPORT.md.

## Stylesheet ownership

Cascade: base.css → phase1.css → phase2.css → refinements.css → phase3.css. Final Phase 3 rules cover navigation, canvas heroes, carousel, journeys, cases, Ideas and About. Reuse existing components and inspect computed styles before adding overrides. Keep changes scoped; do not undo another page through a broad selector. A material design change requires deliberate review across page families.
