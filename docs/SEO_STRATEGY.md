# SEO strategy

## Audience and page intent

Write for owners, founders, CMOs and marketing, CX, CRM, MarTech and digital leaders seeking useful systems and practical delivery. North America, Singapore/Southeast Asia, India and international businesses are relevant markets; this does not establish offices or justify fake city pages.

This is the real production SEO foundation for **https://innooryze.com**, not a disposable preview or a separate marketing concept. Preserve useful page intent and readable content as the site grows.

| Route | Page intent | Primary topic / natural supporting topics |
|---|---|---|
| / | Understand InnooRyze and choose the appropriate pillar | Growth Systems + AI Agents & Automation; connected experience, technology and intelligence |
| /growth-systems | Understand the connected foundation and choose a capability | Customer experience, MarTech and data working together |
| /growth-systems/experience-design-enablement | Evaluate experience strategy, design and delivery | Experience Design & Enablement; websites, apps, UX/UI, portals, journeys, personalization and conversion |
| /growth-systems/martech-consulting-enablement | Evaluate technology consulting and implementation | MarTech Consulting & Enablement; assessment, CRM, architecture, migration, integration and adoption |
| /growth-systems/data-intelligence-activation | Evaluate data foundations and practical activation | Data Intelligence & Activation; CDP, identity, segmentation, analytics and measurement |
| /ai-agents | Understand practical and custom agent development | AI Agents & Automation; knowledge, workflows, systems, human review and useful outcomes |
| /products | Discover available products and clearly distinguished development concepts | InnooRyze products; LeadRyze AI, IMMA and the approved roadmap |
| /products/leadryze-ai | Evaluate the available AI lead desk | Enquiry answers, qualification, capture and CRM/sales handoff |
| /products/imma | Understand the available assessment and enter its live experience | Intelligent Marketing Maturity Assessment; technology, data, journey and capability gaps |
| /platforms | Review the approved categorized ecosystem | CRM, Marketing Automation, CDP, CMS and Analytics/BI; LeadRyze CRM first |
| /platforms/salesforce, /platforms/adobe, /platforms/braze, /platforms/segment | Explore the existing platform-specific discovery approach | Actual business use cases, scope, connections and operating considerations; no certification claims |
| /work | Find relevant delivery evidence | Approved client/project context and capability links |
| /work/dynalektric | Review the live website project | Industrial digital experience; actual scope and approved material |
| /work/treffer-technologies | Understand the confirmed engagement without unsupported detail | CRM/MarTech enablement; no invented client stack or outcomes |
| /work/maxseal | Review the current in-progress build | Website experience; explicit In Progress status |
| /work/imma | Understand the owned product example | Marketing maturity assessment and actual product interface |
| /ideas-hub | Discover relevant original perspectives | Experience, MarTech, data and practical AI; visible filters and descriptive article links |
| /ideas-hub/choosing-the-right-cdp-for-your-growth-stage | Answer how to approach a CDP choice | Business decisions, use cases and the appropriate customer-data foundation |
| /ideas-hub/why-ai-needs-human-centered-strategy | Explain a useful starting point for AI | People, context, workflows and human oversight |
| /ideas-hub/3-common-mistakes-in-martech-implementation | Help readers avoid implementation mistakes | Journey alignment, data/integration and adoption |
| /about | Understand the company approach | Strategy through delivery, two pillars and product-building mindset |
| /contact | Begin a relevant enquiry | Growth Systems, AI agents, products and partnerships; honest delivery state |

These topics guide useful prose, not repetitive keyword insertion. The full route inventory and canonical aliases remain in SITE_ARCHITECTURE.md and scripts/routes.json.

## Phase 3B semantic refinement

Search concepts are carried by small wording changes inside existing copy, never by new keyword blocks or
hidden text. Every visible edit stayed within ±20% of its original length (measured on rendered text), and a
before/after layout capture across ten viewports showed no heading re-wraps and no new overflow.

Concept → where it lives:

| Concept | Primary route | Carrier |
|---|---|---|
| Customer experience / CX consulting | /growth-systems/experience-design-enablement | hero, "CX STRATEGY TO IMPLEMENTATION", chapter 04 |
| Custom SaaS, business applications, digital products | experience page chapters 02–03; /products hero; /about | existing sentences |
| CRM consulting / CRM implementation / platform integration | /growth-systems/martech-consulting-enablement | hero, chapters 02–03 |
| Marketing automation, campaign operations | martech page | hero, chapter 05 |
| Customer data platform / CDP consulting | /growth-systems/data-intelligence-activation | chapter 01 |
| Customer data activation, audience activation | data page; /growth-systems panel 003 | hero, chapters 02 and 05 |
| AI agent development, AI automation consulting, business process automation | /ai-agents | custom-agents section, use-case list |
| Regions served | /about (single authoritative statement) + /about meta description | "We work with businesses across the US, UK, APAC and India, including Singapore, Japan and Malaysia." |

Regional wording describes **service coverage, never office locations**. The registered address is
unchanged. Do not add "office" language for any region unless verified.

Titles now carry search specificity the visible headings deliberately do not, e.g. "MarTech, CRM & Marketing
Automation Consulting". Every title/description claim is supported by visible copy on the same page. Service
titles live on `services[].metaTitle`; the visible H1 and Service schema name keep the approved capability
names. "Data Intelligence & Activation" is never renamed.

## Implemented technical foundation

All meaningful content is static semantic HTML. layout.mjs produces unique metadata, canonical URLs, OG/Twitter cards and Organization, WebSite and WebPage schema. Service pages add Service; articles add Article with actual content dates and organization editorial attribution. Nested BreadcrumbList entries include the parent route. Do not add ratings, reviews, pricing, addresses, certifications or outcomes without evidence.

Production origin: https://innooryze.com. Clean paths have no trailing slash except /. build:production pins that origin and indexing. The release sitemap contains 25 indexable canonical URLs. Credits, 404 and legacy redirects are noindex and excluded. Production robots.txt allows crawling and references the same-origin sitemap. Review builds must explicitly set SITE_INDEXABLE=false.

/work/maxseal is canonical, with /work/max-seal preserved by 301 rules and an HTML redirect fallback. Apache normalizes known index.html/trailing-slash forms. Every nested page has its own HTML, so direct visits and refreshes do not require a client router. Unknown paths return 404, never a successful homepage. See DEPLOYMENT.md.

## Content and internal linking

Use one H1 and a logical H2/H3 hierarchy. Write titles/descriptions for the actual intent, not a keyword list. Use descriptive anchors and image alt text describing the image. The article listing and detail normally use the same visual subject but must retain independent physical page-owned files; do not deduplicate their asset paths. Change dateModified only for substantive content updates, not every build.

Homepage links introduce both pillars. Capabilities link to neighbouring capabilities, work and contact. Work links to its actual capability. Articles link to relevant services, related articles and contextual enquiries. Every new indexable route must provide useful original content. Avoid duplicate service copy, thin platform pages, shallow article batches, fake local pages and hidden SEO text. Do not hide important copy entirely inside animation.

## Article and case-study SEO

Articles use one topic-specific H1, informative H2 sections and H3s only when they add hierarchy. Keep the summary, reading time, organizational authorship and real publication/modification dates consistent with the visible article. Use Article schema only for actual articles; its image, headline, dates and canonical URL must match the page. Link to the relevant capability, a useful related article and a contextual enquiry. Avoid invented authors, artificial freshness and bulk thin articles.

Case studies use a unique client/project title and description, a clear status, factual context and substantial approved chapters. Link from Work to each case and from the case to its relevant service/product and next step. The base WebPage/BreadcrumbList schema is sufficient; do not manufacture review ratings, quantified results, testimonials, client stacks or additional structured-data claims. Max-Seal remains In Progress. An absent proof point should be omitted rather than filled with a placeholder or keyword text. CASE_STUDY_GUIDE.md defines the factual content model.

## Performance and launch measurement

Local WOFF2 fonts, responsive WebP, mobile MP4 encodes, lazy images and selective next-scene loading reduce requests. No framework hydration or third-party runtime is required. Preserve reduced-motion and media-failure fallbacks. Actual Core Web Vitals depend on host/device conditions; no Lighthouse/field score or rankings are claimed.

After upload verify live canonical, OG, schema, redirects, robots, sitemap and true 404 responses. Submit the sitemap through the owner's search-console account. Add analytics only through an approved consent-aware adapter. Monitor landing-page intent, indexing, enquiry quality and field performance before expanding the route inventory. Run check:production on every release.
