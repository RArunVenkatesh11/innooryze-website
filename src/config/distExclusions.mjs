// Files that live in public/ but must not ship in the production build.
//
// These are owner-supplied masters and superseded iterations: the repository keeps them, the release does
// not carry them. Nothing here is deleted — public/ remains the archive of record.
//
// Safety, because a stale list is worse than no list:
//   * Entries are exact paths, never globs, so nothing can be excluded by accident.
//   * scripts/build.mjs fails the build if an excluded path is still referenced by the rendered output,
//     the stylesheet, any browser module or the page-owned asset map. A file cannot be silently dropped
//     while something still needs it.
//   * scripts/build.mjs also fails if a listed file no longer exists, so the list cannot rot unnoticed.
//
// To add one: prove zero references first (build will refuse otherwise), then add it with a reason.

export const distExclusions = [
 // --- owner-supplied source masters; production serves the generated WebP derivatives --------------
 {path: '/assets/images/home/home-hero-video-poster.jpg', reason: 'source master (2520x1418 JPEG); ships as home-hero-video-poster.webp (1920x1080)'},
 {path: '/assets/brand/brand-symbol.png', reason: 'approved 4500x4500 master; ships as brand-symbol-192.png (icons) and brand-symbol-1200.webp (watermark)'},
 {path: '/assets/images/work/industrial-valve/industrial-valve-hero.png', reason: 'source master; ships as industrial-valve-hero.webp + -800'},
 {path: '/assets/images/work/industrial-valve/industrial-valve-interface.png', reason: 'source master; ships as industrial-valve-interface.webp + -800'},
 {path: '/assets/images/work/qualtura/qualtura-homepage.png', reason: 'source master; ships as qualtura-homepage.webp + -800'},
 {path: '/assets/images/work/previews/qualtura-homepage.webp', reason: 'duplicate of the qualtura derivative at a second path; never referenced'},

 // --- original client logo files; production serves the trimmed/transparent derivatives -------------
 {path: '/assets/images/work/logos/dynalektric-logo.png', reason: 'supplied original; ships as dynalektric-logo-trimmed.png'},
 {path: '/assets/images/work/logos/qualtura-logo.png', reason: 'supplied original; ships as qualtura-logo-trimmed.png'},
 {path: '/assets/images/work/logos/treffer-technologies-logo.svg', reason: 'supplied original (opaque raster wrapper); ships as treffer-technologies-logo-transparent.png'},

 // --- superseded brand iterations ------------------------------------------------------------------
 {path: '/assets/brand/brand-logo1.png', reason: 'superseded wordmark iteration'},
 {path: '/assets/brand/brand-symbol1.svg', reason: 'superseded symbol iteration'},

 // --- historical journey/stage image iterations left from earlier replacement rounds ----------------
 {path: '/assets/images/experience/experience-discover1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/experience/experience-explore1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/experience/experience-explore3.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/experience/experience-engage1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/experience/experience-return1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/experience/experience-return2.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/experience/experience-convert.jpg', reason: 'superseded stage iteration'},
 {path: '/assets/images/experience/experience-convert (2).webp', reason: 'duplicate download of a superseded iteration'},
 {path: '/assets/images/martech/martech-crm1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/martech/martech-cms1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/martech/martech-cdp1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/martech/martech-analytics1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/martech/martech-channels1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/martech/martech-marketing-automation.jpg', reason: 'superseded stage iteration; ships as WebP'},
 {path: '/assets/images/data/data-intelligence-signals1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/data/data-intelligence-unified-customer1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/data/data-intelligence-understanding1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/data/data-intelligence-audience1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/data/data-intelligence-measurement1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/data/data-intelligence-action1.jpg', reason: 'superseded stage iteration; ships as WebP'},
 {path: '/assets/images/ai-agents/ai-agents-understand1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/ai-agents/ai-agents-understand2.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/ai-agents/ai-agents-reason1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/ai-agents/ai-agents-act1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/ai-agents/ai-agents-improve1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/ai-agents/ai-agents-human-control1.webp', reason: 'superseded stage iteration'},
 {path: '/assets/images/growth-systems/growth-systems-capability-experience1.webp', reason: 'superseded capability iteration'},
 {path: '/assets/images/growth-systems/growth-systems-capability-martech1.webp', reason: 'superseded capability iteration'},
 {path: '/assets/images/growth-systems/growth-systems-capability-data1.webp', reason: 'superseded capability iteration'}
];

export const excludedPaths = new Set(distExclusions.map(x => x.path));
