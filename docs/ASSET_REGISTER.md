# Asset register

All paths below are relative to the source root. Production mirrors public/ into the hosting root. Optimized files are bundled; no visitor request to a stock-media CDN is required. Original research/download masters are outside the export. Preserve attribution and license records during handoff. Do not redistribute project imagery as a standalone stock library or imply endorsement by depicted people/brands.

## Page and section ownership

`src/config/siteAssets.mjs` is the central replacement map. It contains each route, semantic image role, physical `src`, dimensions, optional responsive `srcset`, and its social image. There are **125 mapped, page-owned image files** under `public/assets/images/`. `public/assets/licenses/image-ownership.json` inventories every mapped file with route, role, real dimensions, provenance key and current SHA-256. Unmapped owner-supplied candidates and superseded copies also sit in those folders (17 on 17 September 2026: `experience-*1.webp`, `experience-explore2.webp`, `experience-return2.webp`, `experience-convert (2).webp`, `martech-*1.webp`, `growth-systems-capability-*1.webp`, and the superseded `experience-convert.jpg` and `martech-marketing-automation.jpg`). No route references them. The build copies them, but they are not part of the mapping. Remove them only with owner approval. Initially identical photographs are separate files; unrelated pages never point to one physical photograph. Global brand/platform marks and fonts remain shared identities.

| Folder under public/assets | Responsibility |
|---|---|
| images/home | Film poster, Selected Work and Ideas teasers, homepage social/background image |
| images/growth-systems | Growth hero and three capability visuals |
| images/experience; images/martech; images/data; images/ai-agents | Independent heroes and every changing journey-stage image |
| images/products | Product overview and separate LeadRyze AI/IMMA detail imagery |
| images/work | Work listing and separate client/project case folders |
| images/ideas-hub | Listing hero/cards and separate article folders/related-card imagery |
| images/about | About hero and human-connection visual |
| images/platforms | Directory and existing platform detail heroes |
| images/contact; images/credits; images/system | Independently owned social fallback images |
| platforms; brand; fonts | Local platform identities, original InnooRyze identity, named font subsets |
| video; audio | Six homepage scenes with desktop/mobile MP4s; approved Progress Pulse MP3 |
| licenses | Attribution, permissions, font licenses, ownership and logo provenance |

### Replace an image without editing application code

To replace a visual, replace the relevant page-specific asset while preserving the filename and expected format/aspect ratio whenever possible.

1. Find the route in `src/config/siteAssets.mjs`. For example `/about` owns `public/assets/images/about/about-hero.webp` (and `about-hero-800.webp`); Experience owns `public/assets/images/experience/experience-discover.webp` and its `-800` variant. The exact dimensions are listed in the map and ownership manifest.
2. Replace the relevant file with your approved image, preserving its **filename, encoding/extension, pixel dimensions and aspect ratio**. A `.webp` must remain an actual WebP. Keep the subject within the existing crop/focus area. For a `srcset`, replace **both** the full-size and `-800` files so mobile and desktop see the same new subject. Poster/video/social roles are explicitly mapped too.
3. Rebuild with `npm run build:production` and validate. The build copies your files; it does not regenerate them from originals. Inspect the affected page at mobile and desktop and its shared preview image. Other pages retain their own independent files.
4. Upload the rebuilt release and purge hosting/CDN media caches because the names are unchanged. Retain the previous release for rollback.
5. Record the new source, permission/license, dimensions and hash in the ownership/provenance records. If the subject or meaning changes, update its descriptive alt text in the page/media content. That accessibility edit is separate from replacing the file.

Templates contain `asset:` logical selectors. They are deliberately independent of filenames. `scripts/page-assets.mjs` resolves each route/occurrence to the central mapping before rendering and rejects missing, unused or unresolved slots. Do not create files named after those logical selectors or reintroduce shared editorial image files. Article asset folders use short semantic names (choosing-a-cdp, human-centered-ai, martech-mistakes) independently of the full public route slug, to support ZIP extraction inside nested Windows project folders. To add a new visual/section, add its own mapping and physical files. Merely replacing an existing image needs no mapping/code edit.

Homepage film paths live in the same configuration and become `dist/media-config.js`. Replacing a scene preserves `home-hero-film-KEY.mp4` and its `-mobile.mp4` counterpart. The optional encoder writes videos only, so it cannot overwrite independently replaced posters.

## Identity, typography and product proof

| Asset | Source / use | Status and rule |
|---|---|---|
| public/assets/brand/brand-logo.png; public/assets/brand/brand-symbol.png | Approved InnooRyze trademark artwork supplied by the owner (20 September 2026 replacement) | brand-logo.png is the trademark wordmark including the TM (3290x719); brand-symbol.png is the standalone OO symbol (4500x4500), used for the favicon/app icon and the masked OO watermark. Retain without redesign, renaming or recolouring. The site serves display-size derivatives of the same artwork (B-2, 26 September 2026): brand-logo-247/494/741.png via srcset for the header and footer wordmark, brand-symbol-192.png for the favicon/app icon and brand-symbol-1200.webp for the watermark. The masters stay unchanged in public/; brand-logo.png remains the Organization/social logo, and brand-symbol.png is withheld from dist because nothing serves it directly. Superseded copies brand-logo1.png and brand-symbol1.svg remain on disk, unreferenced. |
| public/assets/fonts/dm-sans-*.woff2; manrope-*.woff2 | Manrope / DM Sans, SIL Open Font License | Bundled local typography; licenses in assets/licenses |
| public/assets/platforms/* | Respective platform marks, used to identify confirmed experience | Trademarks belong to owners; no partnership/certification implied |
| Page-owned *imma*.png files under assets/images/products and assets/images/work | Actual InnooRyze assessment interface at assessment.innooryze.com | Real product capture; review when product changes |
| Page-owned Dynalektric visuals under assets/images/home and assets/images/work | Actual website and selected frame from Dynalektric_Hero.mp4 | Owner-supplied portfolio context; actual project material, no invented result |
| Page-owned anonymous industrial visuals under assets/images/work/industrial-valve | Approved anonymous industrial valve photography and digital-experience concept | In Progress; replace/update after approved final launch |
| Treffer project visual | Page-owned Treffer photographs; optical-patterns provenance | Conceptual licensed image; no approved client screenshot/logo supplied |
| public/assets/images/ideas-hub/ideas-hub-hero.jpg | Maximus Beaumont, Unsplash photo 6lGG-GCm1Z4 | Illustrative light installation; used for Ideas hero |
| public/assets/audio/progress-pulse.mp3 | Original code-composed Progress Pulse, 128 BPM / 30-second loop | Accepted energetic score; no commercial samples; retain |
| Earlier progress-score.mp3 | Original 96 BPM score | Historical only; excluded from this release |

Project sources and capture dates are in public/assets/licenses/project-captures.md. The owner authorized portfolio use; client-provided material is project-specific, not a general stock license. Confirm rights for any use beyond this website. Real project links: https://dynalektric.com/ and https://qualtura.com/. The anonymised industrial valve case publishes no client link.

## Film collection

Each film key has public/assets/video/home-hero-film-KEY.mp4 and home-hero-film-KEY-mobile.mp4. Posters used by pages have separate semantic names under assets/images; the homepage poster is home/home-hero-video-poster.webp (1920x1080, derived 26 September 2026 from the unchanged 2520x1418 home-hero-video-poster.jpg master, which is withheld from dist). All are edited, compact, muted website encodes under the Pexels License. Stock footage illustrates people, culture, technology and craft; it is not InnooRyze staff/client documentary footage.

| Key | Creator / source |
|---|---|
| global-city | Cheng — https://www.pexels.com/video/a-group-of-people-walking-at-shibuya-crossing-at-night-14952031/ |
| digital-connection | fauxels — https://www.pexels.com/video/a-woman-using-her-cellphone-inside-a-coffee-shop-3044093/ |
| human-craft | cottonbro studio — https://www.pexels.com/video/hands-working-with-clay-6694787/ |
| human-machine | Pavel Danilyuk — https://www.pexels.com/video/a-man-and-a-woman-looking-at-a-robotic-arm-8328048/ |
| business-collaboration | Mikhail Nilov — https://www.pexels.com/video/team-working-while-using-tablet-and-laptop-7989458/ |
| data-intelligence | Mikhail Nilov — https://www.pexels.com/video/people-discussing-while-using-laptop-and-tablet-6930347/ |

License: https://www.pexels.com/license/. The phase2-film.json record contains verified source URLs, creators, source dimensions, hashes and usage restrictions for the three newer clips. Source downloads are not production dependencies. Optional encode-phase2.mjs takes an explicit source directory and FFmpeg; finished media is already included.

## Editorial photography

The keys below are provenance identifiers for the original optimized selections, not current physical paths. Consult image-ownership.json for each currently used page-owned copy and its dimensions. Responsive photographs retain their original 800/1600px variants where used. These are licensed, illustrative photographs, not InnooRyze staff, client teams or proof of project outcomes. src/media.mjs maps hero roles; components/stage-visuals.mjs maps changing journey stages. Unused earlier selections are preserved in working history, outside the current source/live packages.

| Key | Photographer | Source / license | Bundled variants |
|---|---|---|---|
| automation-laboratory | Testalize.me | [Source](https://unsplash.com/photos/industrial-robotic-arm-in-blue-lit-factory-9xHsWmh3m_4); [license](https://unsplash.com/license) | 800, 1600px |
| growth-connection | Kevin Grieve | [Source](https://unsplash.com/photos/people-walk-across-a-metal-bridge-in-sunlight-BvCjKEtzdkk); [license](https://unsplash.com/license) | 800, 1600px |
| digital-mobile | Georgi Kalaydzhiev | [Source](https://unsplash.com/photos/woman-on-city-street-at-night-looking-at-phone-qQ0nknwjXic); [license](https://unsplash.com/license) | 800, 1600px |
| signals-research | Jaron Nix | [Source](https://unsplash.com/photos/person-holding-black-and-white-microscope-7wWRXewYCH4); [license](https://unsplash.com/license) | 800, 1600px |
| creative-craft | Alex Jones | [Source](https://unsplash.com/photos/a-clay-stained-hand-of-a-potter-engaging-in-a-craft-work-of-pottery-or-molding-Tq4YjCa2BSc); [license](https://unsplash.com/license) | 800, 1600px |
| connected-experience | ANGIE BAONGOC | [Source](https://unsplash.com/photos/people-working-at-a-control-desk-with-screens-aA_l42E8To0); [license](https://unsplash.com/license) | 800, 1600px |
| article-craft | Darien Attridge | [Source](https://unsplash.com/photos/hands-working-on-a-craft-project-with-art-supplies-pTKhYoQhJD4); [license](https://unsplash.com/license) | 800, 1600px |
| article-experiment | Louis Reed | [Source](https://unsplash.com/photos/refill-of-liquid-on-tubes-pwcKF7L4-no); [license](https://unsplash.com/license) | 800, 1600px |
| about-global | Grahame Jenkins | [Source](https://unsplash.com/photos/silhouette-of-man-holding-bag-in-inside-of-airport-station-during-daytime-PuW_TjHZwdY); [license](https://unsplash.com/license) | 800, 1600px |
| immersive-projection | Karsten Gohm | [Source](https://unsplash.com/photos/group-of-people-inside-room-0_sMYmRHpro); [license](https://unsplash.com/license) | 800, 1600px |
| optical-patterns | Rohit Choudhari | [Source](https://unsplash.com/photos/triangular-ruler-with-colorful-light-patterns-Dq0ngkOhtko); [license](https://unsplash.com/license) | 800, 1600px |
| product-in-use | Sara Kurig | [Source](https://unsplash.com/photos/a-woman-in-a-red-dress-wearing-a-virtual-reality-headset-A2BIY-TUjuA); [license](https://unsplash.com/license) | 800, 1600px |
| human-screen-portrait | Mustafa Enes Ardıç | [Source](https://www.pexels.com/photo/woman-working-with-computer-10975134/); [license](https://www.pexels.com/license/) | 800, 1600px |
| design-prototype-collaboration | Thirdman | [Source](https://www.pexels.com/photo/men-standing-at-the-table-in-a-workshop-and-looking-at-a-laptop-screen-7181109/); [license](https://www.pexels.com/license/) | 800, 1600px |

Detailed provenance, source metadata, verification dates and hashes are in phase2-photography.json and refined-photography.json under public/assets/licenses/. These stock records no longer describe the Experience and MarTech journey stages; see the next section. Product illustrations and demo workflows are native code with deliberately fictional example data.

## Generated journey-stage imagery (Experience and MarTech)

On 17 September 2026 the owner approved replacement images for the Experience journey (Discover, Explore, Engage, Convert, Return) and the MarTech journey (CRM, Marketing Automation, CMS, CDP, Analytics, Channels). They are **generated, illustrative images**, not stock photographs. They do not show InnooRyze staff, clients, client teams, real products or real results. The generator, prompts and usage terms are not recorded in this repository and remain an owner input. In image-ownership.json these masters use the provenance key `generated-illustrative/<file>`, and each `-800` variant points to its master.

- **Masters:** 1600×2000 WebP (4:5) at quality 0.82. `experience-convert` and `martech-marketing-automation` changed from `.jpg` to `.webp` under the same base name, and their map entries have no `srcset`.
- **`data-intelligence-action`** followed the same `.jpg` → `.webp` correction on 20 September 2026, under the same base name and with no `srcset`. All three of these stages are configured in stage-visuals.mjs with an `asset:` token rather than a `name`, so `editorialImage()` emits no `srcset` for them and an `-800` derivative would never be requested. This master is 1122×1402 as supplied, not 1600×2000; see QA_REPORT.md for the open item covering the other five Data Intelligence masters.
- **Derivatives:** 800×1000 WebP at quality 0.80 for experience-discover/explore/engage/return and martech-crm/cms/cdp/analytics/channels.
- **Method:** a centred cover crop to exactly 4:5 with high-quality resampling, using the local Chrome canvas encoder. There is no stretching, no retouching and no project dependency. Derivatives were rendered from the supplied images, not from re-encoded masters.
- **On-screen text:** some images contain incidental screen text and figures, for example the Analytics dashboard. Those values are part of the illustration. They are not InnooRyze or client performance data, so do not quote them or describe them in alt text as results.
- **Focal points:** every journey stage sets its own focal point in src/components/stage-visuals.mjs (`focus`, applied as `--focus` → `object-position`), and the Growth Systems overview panels set theirs in `growthJourney()`. Intrinsic `width`/`height` come from the dimensions in siteAssets, via scripts/page-assets.mjs.

## Platform identities

`public/assets/licenses/platform-logos.json` records the supplied filenames and current local paths. The owner supplied 17 logo files for the expanded taxonomy. Several files called `.svg` were actually PNG or WebP; their bytes were preserved and only their extensions corrected to match the format. Product-specific Adobe Campaign, Experience Manager, Experience Platform and Analytics marks use those supplied files, not a generic Adobe substitute. The existing generic Adobe identity remains only for its ecosystem detail page.

The Salesforce cloud SVG comes from the [official Salesforce header](https://www.salesforce.com/) and the purple Braze SVG comes from the [official Braze newsroom media kit](https://www.braze.com/company/news); exact URLs are in the provenance record. Original colors/aspect ratios remain intact. LeadRyze CRM has no supplied logo and deliberately uses styled text, as approved. Desktop CSS presents monochrome marks by default and reveals actual brand colors on hover/keyboard focus; touch/tablet styling exposes brand colors without hovering. The catalog sets individual visual sizing to balance marks. Never redraw or distort third-party logos, infer certification, or apply this platform approval to a client's stack.

## Temporary media and release exclusions

Treffer remains conceptual until approved client media is supplied. The anonymised industrial valve case uses approved anonymous visuals only; its former client captures are archived outside public/ and must not be republished. Stock imagery may later be replaced with commissioned brand imagery; this is optional rather than a broken placeholder. Leadership names/portraits and fuller client proof remain owner inputs and are not fabricated. The accepted original soundtrack needs no replacement.

Legacy root/editorial photos, numbered fonts, old logo copies, unused Singapore prototype media and the earlier score were preserved in working history outside the project export. Current files use the organized directories above; no route depends on the old physical paths. Caches, research contact sheets, original downloads, local tools and hosting-account metadata are outside the release.

Before introducing a replacement: record origin, creator, license/owner permission, intended use and descriptive alt text; optimize desktop/mobile variants; preserve subjects respectfully; verify actual crops and loading; update this register and the relevant source mapping.
