# Case-study guide

## Data and rendering

src/site.mjs holds listing facts. src/content/case-studies.mjs contains the three client narratives; src/components/case-study.mjs renders their hero, context/facts, chapters, optional actual interface capture, capability mapping, technology context, optional substantiated outcome and next steps. IMMA retains the existing product case renderer in inner.mjs. Listing records also feed Work and the homepage carousel.

Work fields include slug, optional route, name, title, type/categories, industry, description, status, image/alt, campaign, related capability index and optional external URL. Max-Seal keeps slug max-seal for media/styles but route maxseal for canonical links. Generate links using route || slug.

Detailed entries support status, lead, context, visualNote, chapters [label, heading, body], capabilities [heading, body], technology and optional outcome [heading, body]. Missing proof must omit a section, not invent one. Extend the schema carefully when approved material calls for another chapter.

## Evidence matrix

| Project | Confirmed evidence | Presentation |
|---|---|---|
| Dynalektric | Website strategy, UX/IA, design/development, responsive/enquiry experience; live domain | Actual interface and brand-film frame; outcome only website live |
| Treffer Technologies | CRM/MarTech enablement | Illustrative optical image and explanatory note; no invented stack, quote, screenshot or outcome |
| Max-Seal | Industrial website design/development in progress | Actual current interface/product-film frame; In Progress; no outcome |
| IMMA | InnooRyze's available marketing maturity assessment | Actual product screen and illustrative demonstration |

## Extension workflow

1. Collect approved name, business context, scope, status, deliverables, capability and permitted media. Record what is confirmed.
2. Add listing and substantive narrative. Explain the actual work and relevance; keep technology detail within known facts.
3. Use genuine project captures with alt text/provenance. Mark conceptual images in documentation. Do not fabricate client dashboards or imply stock people are a client team.
4. Add outcomes only with evidence. Exclude unsupported metrics, testimonials, quotes, platforms and completion claims.
5. Link the real capability and a contextual enquiry. Preserve old public URLs through redirects.
6. Build and inspect the index, carousel, detail, social image, mobile captions and direct refresh. Update this matrix and ASSET_REGISTER when proof changes.

The temporary Max-Seal external build URL must be reviewed when its final domain/status is confirmed. No metric is better than an invented metric; in-progress scope must remain clearly in progress.
