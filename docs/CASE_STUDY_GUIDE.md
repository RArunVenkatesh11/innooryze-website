# Case-study guide

## Proof, quotations and anonymity

A case shows a figure only when the client has confirmed it. `proof` carries those figures and nothing derived from them; the panel states who confirmed them, so a reader never has to guess whether a number is measured or marketing. `testimonial` is reproduced exactly as approved — never corrected for spelling, grammar or house style. `scope`, `delivery`, `proof`, `testimonial` and `outcome` are all optional and render only when present, so no case ever shows an empty section or a placeholder statistic.

One engagement is published anonymously as "US Industrial Valve Manufacturer" at /work/industrial-valve-digital-experience. It carries no client name, logo, screenshot, outbound link or development URL, and the two legacy alias URLs are the only place the former slug survives anywhere in the source or the build. Do not reintroduce any identifying detail.

## Client logos

All three supplied client marks are dark-ink artwork built for white backgrounds: against the site's dark surface their dominant ink measures 1.18:1 (Dynalektric, Treffer) and 1.47:1 (Qualtura), versus 11–20:1 on paper. Client brands are never recoloured, so a single neutral plaque carries them on every surface. Each file is pre-trimmed to its own ink box and `scale` normalises by area, not height, so lockups from 2.85:1 to 5.30:1 land at equal optical weight. See src/components/client-logo.mjs.

The supplied Treffer .svg is a wrapper around a flattened raster with a baked-in white background; the production derivative recovers true alpha by un-multiplying from white and reproduces the original exactly when recomposited. Keep the supplied file; never edit it in place.

## Data and rendering

src/site.mjs holds listing facts. src/content/case-studies.mjs contains the three client narratives; src/components/case-study.mjs renders their hero, context/facts, chapters, optional actual interface capture, capability mapping, technology context, optional substantiated outcome and next steps. IMMA retains the existing product case renderer in inner.mjs. Listing records also feed Work and the homepage carousel.

Work fields include slug, optional route, name, title, type/categories, industry, description, status, image/alt, campaign, related capability index and optional external URL. The anonymised industrial valve case uses slug industrial-valve and route industrial-valve-digital-experience; its historical /work/maxseal and /work/max-seal URLs exist only as redirect aliases. Generate links using route || slug.

Detailed entries support status, lead, context, visualNote, chapters [label, heading, body], capabilities [heading, body], technology and optional outcome [heading, body]. Missing proof must omit a section, not invent one. Extend the schema carefully when approved material calls for another chapter.

## Evidence matrix

| Project | Confirmed evidence | Presentation |
|---|---|---|
| Dynalektric | Website strategy, UX/IA, design/development, responsive/enquiry experience; live domain | Actual interface and brand-film frame; outcome only website live |
| Treffer Technologies | CRM/MarTech enablement | Illustrative optical image and explanatory note; no invented stack, quote, screenshot or outcome |
| US Industrial Valve Manufacturer (anonymised) | Industrial website design/development in progress | Approved anonymous hero and interface concept; In Progress; no outcome; no client identity |
| IMMA | InnooRyze's available marketing maturity assessment | Actual product screen and illustrative demonstration |

## Extension workflow

1. Collect approved name, business context, scope, status, deliverables, capability and permitted media. Record what is confirmed.
2. Add listing and substantive narrative. Explain the actual work and relevance; keep technology detail within known facts.
3. Use genuine project captures with alt text/provenance. Mark conceptual images in documentation. Do not fabricate client dashboards or imply stock people are a client team.
4. Add outcomes only with evidence. Exclude unsupported metrics, testimonials, quotes, platforms and completion claims.
5. Link the real capability and a contextual enquiry. Preserve old public URLs through redirects.
6. Build and inspect the index, carousel, detail, social image, mobile captions and direct refresh. Update this matrix and ASSET_REGISTER when proof changes.

The anonymised case carries no outbound or development URL, and none may be added. No metric is better than an invented metric; in-progress scope must remain clearly in progress.
