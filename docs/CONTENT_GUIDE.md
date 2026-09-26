# Content guide

## Legal pages

/privacy-policy and /terms-and-conditions carry approved legal wording transferred verbatim from the live InnooRyze pages. Treat src/content/policies.mjs as a transcript, not copy to edit: never reword, condense, reorder or "tidy" a clause, and never add a compliance statement, jurisdiction, retention period or liability term that is not on the approved source. Change the approved source first, then re-transfer. Only structure is ours — the live pages mark section headings up as `<h5>`, which becomes `<h2>` here, and loose list items become real lists. tests/policies.test.mjs fails if sections, numbering, dates, the registered entity or the contents anchors are lost.

## Search wording (Phase 3B)

Search terms are introduced by refining existing sentences, never by adding keyword lists, hidden text or new
sections. Keep a replacement within about ±20% of the original length so the approved layout does not move,
and check display headings (H1/H2) for new wrapping before changing them — the three capability H2s were left
alone for that reason, and the discipline name went into the eyebrow instead.

Regional positioning: one authoritative statement on /about — "We work with businesses across the US, UK,
APAC and India, including Singapore, Japan and Malaysia." It describes coverage, not offices. Do not repeat
geographies across every page.

## Voice

Write with clear thinking and useful specifics. Explain what InnooRyze designs, builds, connects and improves, for whom and with what next step. Keep headlines direct. Avoid inflated claims, generic transformation language, endless lists and keyword stuffing. Exact pillar/capability names and approved expressions are in CLAUDE.md.

Growth Systems connects Experience Design & Enablement, MarTech Consulting & Enablement and Data Intelligence & Activation. AI Agents & Automation includes custom workflows; people stay in control. Product-building and hands-on delivery are part of the company story. Do not reduce the business to a digital marketing agency. Use approved expressions selectively, not as repeated boilerplate.

## Confirmed facts

| Subject | Safe statement | Do not infer |
|---|---|---|
| LeadRyze AI | Available AI lead desk; qualification, capture, CRM and sales handoff | Metrics, guarantees, prices or unconfirmed vendor integrations |
| IMMA | Live Intelligent Marketing Maturity Assessment; assessment.innooryze.com. Owner-confirmed: B2B or B2C starting point, business details, one-time email verification (Microsoft 365 / Graph) before the assessment, selected areas and structured questions; results show an overall score, maturity level, category-wise results, recommendations and a roadmap, with an optional Zoho Bookings consultation. Hosted on InnooRyze-controlled infrastructure with an InnooRyze-controlled PostgreSQL database | Adoption results, invented customer quotes, a downloadable report, AI scoring claims, benchmarks, certifications or integrations |
| Roadmap | Campaign automation, brand/social content and performance intelligence are In development | Commercial availability or thin detail pages |
| Dynalektric | Live website; strategy, UX/IA, design, development, responsive/enquiry experience | Revenue/conversion uplift or invented stack |
| Treffer Technologies | Real CRM/MarTech enablement client | Specific stack, deliverables, outcomes, quotes or approved client logo |
| US Industrial Valve Manufacturer (anonymised) | Website experience build In Progress | Completion, results, or any identifying detail |
| LeadRyze CRM | Built by InnooRyze; first CRM platform entry; text wordmark approved; one-sentence description on /products and llms.txt (src/site.mjs leadryzeCrm), stated as separate from LeadRyze AI | Availability, pricing, features or equivalence with LeadRyze AI |
| Platforms | Five-category owner-approved taxonomy in CLAUDE.md and platform-catalog.mjs | Certification, partnership, client stacks or additional expertise beyond this approval |
| About | Two pillars, strategy through delivery, product mindset and international relevance | Staff names, headcount, founding dates or offices not supplied |

CampAIgn Genie, BrandGenie and InsightGenie are concept names in the brief. The current interface uses functional roadmap labels; preserve them unless naming changes are approved.

Contact: enquiry@innooryze.com. Confirmed socials: https://in.linkedin.com/company/innooryze, https://x.com/innooryze and https://www.instagram.com/innooryze. Facebook is omitted by instruction. The Contact form sends enquiries through the Apps Script backend (docs/CONTACT_INTEGRATION.md). Its thank-you copy is "THANK YOU. / Your message is with us. / We’ll review your enquiry and get back to you shortly." The line "A confirmation will be sent to your email shortly." appears only when the backend has queued the acknowledgement (emails are sent in the background after capture, so the site never says an email has already been sent). Never claim receipt without `captured: true` from the backend.

## Articles and conversion

Articles in src/site.mjs have slug, title, category, type, summary, image, real publish/update dates and sections. Sections use [H2, paragraph, optional H3 subsection tuples]. Reading time is calculated. Preserve primary listing/detail imagery, organizational attribution and contextual capability/contact links. Do not invent authors or freshness. Research specific technical claims with primary sources where needed. Prioritize useful original articles over volume.

CTAs may invite a conversation, discuss a relevant capability or explore a product. Use the approved Ready to Ryze? / Let's Talk language where appropriate. The email fallback button must describe email preparation, not automatic submission.

## Accuracy and approvals

Preserve the actual status of work/products. Separate fictional demonstration data from genuine proof. Document conceptual photography; it does not depict staff or clients. Add policy entries only after approved text is supplied. Keep licensing provenance with media. Read CASE_STUDY_GUIDE.md and ASSET_REGISTER.md before changing proof points.
