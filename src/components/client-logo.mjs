import {esc} from './layout.mjs';

// The one client-logo treatment, used on the homepage carousel, the /work hub and the case pages.
//
// Why a plaque rather than direct placement: all three supplied marks are dark-ink artwork built for white
// backgrounds. Measured against the site's dark surface (#11191b) their dominant ink reaches only 1.18:1
// (Dynalektric, Treffer) and 1.47:1 (Qualtura) — effectively invisible — while on paper they reach
// 11–20:1. Since client brands must never be recoloured, the surface has to come to the logo. A single
// restrained plaque does that everywhere, instead of a different background per company.
//
// Scale is normalised by area, not height: the lockups run from 2.85:1 to 5.30:1, so equal heights alone
// would let the widest mark dominate. Each logo file is pre-trimmed to its own ink box, so object-fit
// inside a shared box lands them at genuinely equal optical weight.
export function clientLogo(logo, {size = '', label = ''} = {}) {
 if (!logo) return '';
 return `<span class="client-logo ${size}"${logo.scale && logo.scale !== 1 ? ` style="--logo-scale:${logo.scale}"` : ''}>` +
  `<img src="${esc(logo.src)}" alt="${esc(label || logo.alt)}" width="${logo.width}" height="${logo.height}" loading="lazy" decoding="async">` +
  `</span>`;
}
