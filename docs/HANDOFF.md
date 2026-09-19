# Developer handoff

## Saved state

Phase 1 multi-page structure and Phase 2 media/content work were complete before Phase 3. Saved Phase 3 priorities 1–11 include Growth submenu stability, integrated internal heroes, homepage AI emphasis/Selected Work/platform balance, synchronized Experience/MarTech/Data/AI journeys, custom-agent messaging, Products, Work/cases, Ideas/articles and About refinements. The approved identity, film, soundtrack, footer and page family are preserved.

The final continuation completes production SEO/indexing/routing, the Max-Seal canonical alias, factual platform guidance, approved-only legal-page architecture, production validation, Claude Code documentation and two release ZIPs. The additional final feedback then improved AI contrast, expanded the platform directory with supplied/official logos, and assigned independent semantic images to every page/major section. src/config/siteAssets.mjs is the replacement map; the asset register explains same-name updates. See PHASE3_PROGRESS.md and QA_REPORT.md for status and exact verification scope.

## Start here

Read CLAUDE.md, README and SITE_ARCHITECTURE.md. Inspect the actual files before editing. Run npm ci, build:production, test and check:production; serve dist with preview. Edit the owning source file, inspect affected desktop/tablet/mobile pages, then rebuild. Do not fix only generated dist or repeat completed visual work.

Example future task: “Update MarTech content in src/site.mjs and src/components/journeys.mjs using these approved facts. Preserve hero, palette, journey interaction, exact capability name and route. Build and verify the page plus homepage/navigation references.”

## Key decisions

- Static rendered HTML, vanilla modules and local media; no hosted-preview runtime.
- Three exact capabilities under Growth Systems; a separate AI Agents & Automation pillar including custom workflows.
- LeadRyze AI and IMMA available; roadmap concepts and Max-Seal retain development status.
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
- Production URLs use https://innooryze.com. Review builds explicitly disable indexing. No catch-all SPA fallback.
- /work/maxseal is canonical; old /work/max-seal is a permanent alias with static HTML fallback.
- No fabricated leadership, offices, legal copy, testimonials, metrics or client stack.

## Launch inputs and QA limits

The owner/provider must configure DNS/SSL/document root and verify .htaccess on the real Apache host. Native Chrome, Safari, Edge, Firefox, actual touchscreen and assistive-technology tests are separate from completed Chromium viewport inspection. No full accessibility certification, Lighthouse score or field Core Web Vitals claim is made.

No enquiry endpoint exists. The release's explicit email-draft flow works; direct delivery needs a service, server validation/spam controls and end-to-end confirmation. Analytics/consent remain unconfigured. Approved legal text/URLs are outstanding. Leadership details/portraits, fuller Treffer proof and any future platform detail content may be supplied later; they are not fabricated placeholders in the release.

## Assets still subject to replacement

Licensed editorial/film stock is illustrative and usable in the current design; commissioned InnooRyze imagery is optional. Product demos intentionally use fictional data. Treffer's optical image remains conceptual until client-approved media is supplied. Max-Seal captures and external development URL need review when it launches. The original accepted soundtrack does not need replacement. See ASSET_REGISTER.md for provenance and restrictions.

## Release maintenance

Both ZIPs use the same validated production output. Source ZIP contains editable code plus dist snapshot; live ZIP contains document-root files only. Python packaging is independent of building/hosting. Secrets, caches, local research and hosting-account metadata are excluded. Preserve license records; do not redistribute project media as stock.

After changes update relevant docs, add aliases for moved URLs, run production checks and package a complete new pair. Keep a prior release outside the hosting root for rollback. The existing review Site can be maintained separately without becoming a production dependency.
