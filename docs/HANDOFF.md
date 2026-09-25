# Developer handoff

## Saved state

Phase 1 multi-page structure and Phase 2 media/content work were complete before Phase 3. Saved Phase 3 priorities 1–11 include Growth submenu stability, integrated internal heroes, homepage AI emphasis/Selected Work/platform balance, synchronized Experience/MarTech/Data/AI journeys, custom-agent messaging, Products, Work/cases, Ideas/articles and About refinements. The approved identity, film, soundtrack, footer and page family are preserved.

The final continuation completes production SEO/indexing/routing, the legacy case-study redirect aliases, factual platform guidance, approved-only legal-page architecture, production validation, Claude Code documentation and two release ZIPs. The additional final feedback then improved AI contrast, expanded the platform directory with supplied/official logos, and assigned independent semantic images to every page/major section. src/config/siteAssets.mjs is the replacement map; the asset register explains same-name updates. See PHASE3_PROGRESS.md and QA_REPORT.md for status and exact verification scope.

Launch Phase 1 added the approved trademark wordmark, the shared CTA arrow, verified contact details and the OO watermark. The following task migrated Google Analytics from the old site behind a consent gate: see docs/ANALYTICS.md for the identifiers, the production-hostname allowlist, the deferred Tag Manager container and the debug override. Privacy and Terms pages, SEO/GEO work and the Google Sheets integration are not started.

## Start here

Read CLAUDE.md, README and SITE_ARCHITECTURE.md. Inspect the actual files before editing. Run npm ci, build:production, test and check:production; serve dist with preview. Edit the owning source file, inspect affected desktop/tablet/mobile pages, then rebuild. Do not fix only generated dist or repeat completed visual work.

Example future task: “Update MarTech content in src/site.mjs and src/components/journeys.mjs using these approved facts. Preserve hero, palette, journey interaction, exact capability name and route. Build and verify the page plus homepage/navigation references.”

## Key decisions

- Static rendered HTML, vanilla modules and local media; no hosted-preview runtime.
- Three exact capabilities under Growth Systems; a separate AI Agents & Automation pillar including custom workflows.
- LeadRyze AI and IMMA available; roadmap concepts and the anonymised industrial valve case retain development status.
- The final owner-approved platform taxonomy has five categories and 22 entries. LeadRyze CRM is first and Built by InnooRyze; its availability/features are unspecified. Homepage shows exactly Zoho, Salesforce, Adobe Experience Platform, Braze, Segment. Existing detail pages describe discovery/scoping, not certifications or client results.
- Semantic content exists before animation. Motion includes pause/reduced-motion/media fallbacks.
- Homepage story/hero refinement (15 September 2026, owner-approved): the "Two pillars" story stays pinned and scroll-driven on tablet/mobile wherever an svh-based fit check passes. AI words follow scroll on touch/smaller screens. The hero film opens on digital-connection with a measured grade/shade, and Sound is disabled while motion is reduced or paused. See DESIGN_SYSTEM.md (Motion) and QA_REPORT.md.
- Responsive interaction system (16 September 2026, owner-approved): "Same experience. Responsive execution." Interactions are never disabled by device type, width or height; static presentation is only for reduced motion, explicit pause or a genuine capability limit.
  - motion.js supplies the policy and space levels.
  - pinned.js drives both the homepage story and the /growth-systems journey (fit-by-zoom, flow reveal on very small viewports).
  - engage.js adds touch equivalents for platform cards, Ideas cards and project visuals.
  - AI words are scroll-linked on every device.
  - Hover is build-guarded, the mobile menu transitions, and compact controls have 44px hit areas.
  - The film selects encodes by screen and follows rotation; Save-Data shows poster motion.
  - The LeadRyze desk was not tilted anywhere (`.lead-desk` CSS targets no element), so no tilt was added.
- Launch Phase 1, brand and UI consistency (25 September 2026, owner-approved):
  - `brand-logo.png` is the approved trademark wordmark and the only wordmark in the header and footer; `brand-symbol.png` is the approved OO symbol, used for the favicon/app icon and the watermark. Never redraw or rename either.
  - All north-east CTA arrows come from `arrowUpRight()` in `src/components/icons.mjs`; the Unicode glyph is banned because iOS renders it as a colour emoji.
  - Verified contact details live in `site.contact` (Coimbatore office, +91 80156 20896, enquiry@innooryze.com) and feed the Contact page, the footer and the Organization schema. There is no second office or phone number.
  - The OO watermark appears only on the Contact page and the Ready to Ryze CTA.
- UI/UX consistency pass (19 September 2026, owner-approved):
  - Every media-led hero shares one mobile composition through `media-hero`; the AI hero joins it at ≤760px and keeps its approved desktop treatment.
  - User-initiated journey and overview selection brings the story into view below the fixed header (`bringIntoView` in motion.js). Autoplay, scroll progression and initialisation never move the viewport. Reduced motion positions instantly.
  - `--header-h` exposes the live fixed-header height to both JS and CSS `scroll-margin-top`; never hard-code a header offset again.
  - The homepage story drops its connector rail, node dots and repeated row rules at mobile, keeping one hairline between capability rows.
- Production URLs use https://innooryze.com. Review builds explicitly disable indexing. No catch-all SPA fallback.
- /work/industrial-valve-digital-experience is canonical; the historical /work/maxseal and /work/max-seal URLs are permanent redirect aliases to it (vercel.json and .htaccess), with a noindex HTML fallback.
- No fabricated leadership, offices, legal copy, testimonials, metrics or client stack.

## Launch inputs and QA limits

The owner/provider must configure DNS/SSL/document root and verify .htaccess on the real Apache host. Native Chrome, Safari, Edge, Firefox, actual touchscreen and assistive-technology tests are separate from completed Chromium viewport inspection. No full accessibility certification, Lighthouse score or field Core Web Vitals claim is made.

The Contact form is integrated with the Apps Script backend (Google Sheet, Cloudflare Turnstile, Microsoft Graph emails); see docs/CONTACT_INTEGRATION.md. It is tested against simulated services only. It is not confirmed live until the updated Code.gs is deployed and the live end-to-end test there has passed. Analytics/consent remain unconfigured. Approved legal text/URLs are outstanding. Leadership details/portraits, fuller Treffer proof and any future platform detail content may be supplied later; they are not fabricated placeholders in the release.

## Assets still subject to replacement

Licensed editorial/film stock is illustrative and usable in the current design; commissioned InnooRyze imagery is optional. Product demos intentionally use fictional data. Treffer's optical image remains conceptual until client-approved media is supplied. The industrial valve case is published anonymously with approved anonymous visuals; never reintroduce client captures, branding or its development URL. The original accepted soundtrack does not need replacement. See ASSET_REGISTER.md for provenance and restrictions.

## Release maintenance

Both ZIPs use the same validated production output. Source ZIP contains editable code plus dist snapshot; live ZIP contains document-root files only. Python packaging is independent of building/hosting. Secrets, caches, local research and hosting-account metadata are excluded. Preserve license records; do not redistribute project media as stock.

After changes update relevant docs, add aliases for moved URLs, run production checks and package a complete new pair. Keep a prior release outside the hosting root for rollback. The existing review Site can be maintained separately without becoming a production dependency.
