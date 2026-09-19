# Site architecture

## Rendering model

A static multi-page website: Node templates render complete HTML into dist/<route>/index.html. Navigation uses normal links and document loads. Browser modules enhance film, scrolling, menus, demonstrations, filters, carousels and forms; they do not supply the route content. Output has no preview-environment dependency.

scripts/build.mjs assembles the pages, shared layout and SEO. Five CSS layers concatenate into style.css; browser modules and media copy from public. scripts/routes.json is generated. src/config/siteAssets.mjs owns physical images by route and section; scripts/page-assets.mjs resolves logical tokens before layout, including schema and social images. dist/media-config.js contains only public film paths. Missing mappings fail the build. There are 26 canonical pages, one legacy redirect document and 404.html. The source ZIP includes a generated dist release snapshot as well as editable sources.

## Canonical routes

| Route | Purpose / template |
|---|---|
| / | Brand, two pillars, products, work, platforms, Ideas, conversion; home |
| /growth-systems | Connected Experience + Technology + Intelligence; growthPage |
| /growth-systems/experience-design-enablement | Websites, applications, UX/UI, journeys; servicePage(0) |
| /growth-systems/martech-consulting-enablement | Assessment, architecture, implementation and adoption; servicePage(1) |
| /growth-systems/data-intelligence-activation | Customer data, CDP, analytics and activation; servicePage(2) |
| /ai-agents | Practical/custom agents and human control; agentsPage |
| /products | Available products and development roadmap; productsPage |
| /products/leadryze-ai | AI lead engagement, capture and CRM/sales handoff; leadPage |
| /products/imma | Marketing maturity assessment and dimensions; immaPage |
| /work | Portfolio index/filters; workPage |
| /work/dynalektric | Live website story; detailedCase |
| /work/treffer-technologies | Confirmed CRM/MarTech context; detailedCase |
| /work/maxseal | Website experience In Progress; detailedCase |
| /work/imma | InnooRyze product case; casePage fallback |
| /ideas-hub | Image-led article index and topic filters; ideasPage |
| /ideas-hub/choosing-the-right-cdp-for-your-growth-stage | CDP guide; articlePage |
| /ideas-hub/why-ai-needs-human-centered-strategy | Practical AI perspective; articlePage |
| /ideas-hub/3-common-mistakes-in-martech-implementation | Implementation/adoption article; articlePage |
| /about | Belief, business, delivery model and product mindset; aboutPage |
| /contact | Enquiry UI and configurable delivery; contactPage |
| /platforms | Five approved categories, 22 entries and LeadRyze CRM first; platformDirectory |
| /platforms/salesforce | CRM handoffs, connections and operation; platformContent |
| /platforms/adobe | Experience, content delivery and scope; platformContent |
| /platforms/braze | Lifecycle scenarios, signals and operation; platformContent |
| /platforms/segment | Collection definitions, identity and activation; platformContent |
| /credits | Media attribution; noindex, outside sitemap |

/work/max-seal redirects permanently to /work/maxseal. Internally the original slug max-seal remains for CSS/media/case keys; the route field determines the canonical URL. 404.html must be served with status 404 for unknown paths.

## Components and interactions

layout.mjs owns global navigation, footer, CTA, heroes and SEO. navigation.js owns desktop submenu and mobile panel. journeys.js decodes the selected image before committing its matching panel, nodes and counter. app.js wires the page modules and runs one scroll loop for sections near the viewport. motion.js is the shared motion policy: reduced motion or pause, plus a stable width/svh viewport and space level. pinned.js is the responsive pinned-storytelling engine used by the homepage story and the /growth-systems journey (pinned, flow or static mode, with fit-by-zoom). engage.js provides touch equivalents for hover effects and scroll-linked depth. kinetic.js links the AI words to story progress. film.js handles muted video (responsive encode selection and Save-Data poster motion) and gesture-gated audio. The build passes style.css through scripts/hover-guard.mjs. showcases.js handles product panels and portfolio movement. forms.js separates validation from acknowledged delivery; integrations.js is the optional spam/analytics seam.

## Extension rules

Add approved substantive content to the owning collection and build registration. Rebuild; never hand-edit routes.json, sitemap or dist HTML. Preserve parent/child links and schema. New work uses the factual case renderer; new articles need image, category, real dates, sections, related articles and capability links.

Reserved legal routes are /privacy-policy, /cookie-policy and /terms. src/content/policies.mjs accepts approved entries with key, title, description, approvedOn and sections of heading/paragraphs. The build checks key/date/content, escapes plain text and enables matching footer links. Empty data publishes nothing. Approved external policy URLs may be supplied through environment settings instead.

The final owner feedback approves the expanded taxonomy documented in CLAUDE.md and src/content/platform-catalog.mjs. Existing four platform detail routes remain; additional entries have contextual enquiry links, not thin new SEO pages. LeadRyze CRM is an owned product without an inferred availability or feature list. These approvals do not establish any client-specific stack or certification. Development products remain on /products until sufficient approved detail justifies new routes.
