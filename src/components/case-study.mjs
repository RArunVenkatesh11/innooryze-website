import {caseStudies} from '../content/case-studies.mjs';
import {services} from '../site.mjs';
import {pageHero,link,esc} from './layout.mjs';
import {clientLogo} from './client-logo.mjs';
import {arrowUpRight} from './icons.mjs';

// Every optional block below renders only when the approved content exists, so a case never shows an
// empty section, a placeholder figure or a proof panel with nothing verified behind it.
const scopeList = scope => scope?.length
 ? `<div class="case-scope"><p class="eyebrow">SCOPE</p><ul>${scope.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div>`
 : '';

const deliveryNote = delivery => delivery
 ? `<div class="case-delivery"><p class="eyebrow">DELIVERY</p><p>${esc(delivery)}</p></div>`
 : '';

// Client-confirmed figures only. The heading says where they came from, so a reader never has to guess
// whether a number is measured or marketing.
const proofBlock = (proof, name) => proof?.length
 ? `<section class="case-proof section-pad"><div class="case-proof-head"><p class="eyebrow">VERIFIED OUTCOMES</p><h2>Measured, then reported.</h2><p>Figures confirmed by ${esc(name)}. Nothing is estimated or extrapolated.</p></div><dl>${proof.map(([value, label]) => `<div><dt>${esc(value)}</dt><dd>${esc(label)}</dd></div>`).join('')}</dl></section>`
 : '';

const testimonialBlock = (t, name) => t
 ? `<section class="case-testimonial section-pad"><figure><blockquote>${t.quote.map(p => `<p>${esc(p)}</p>`).join('')}</blockquote><figcaption><span class="case-testimonial-name">${esc(t.name)}</span><span>${esc(t.role)}, ${esc(name)}</span></figcaption></figure></section>`
 : '';

export function detailedCase(w){
 const data=caseStudies[w.slug];if(!data)return null;
 const capability=services[w.related];
 // A case can map to a second capability; the link appears once, beside the primary one.
 const secondary=w.relatedAlso!==undefined?services[w.relatedAlso]:null;
 // A case can opt out of a media hero where the only visual is the work itself and cropping it behind a
 // hero would cut into the thing being shown.
 const heroArt=w.heroMedia===false?undefined:{...w.campaign,label:w.name.toUpperCase()+' / '+data.status.toUpperCase()};
 // Interface-heavy work gets its screenshot on its own stage instead of cropped behind a hero, so the
 // headline never sits over live UI copy. The same file is used once, here rather than in the narrative.
 const stage=w.mediaStage&&w.image?`<section class="case-stage"><figure><img src="${w.image}" alt="${esc(w.alt)}" width="1440" height="900" loading="eager" fetchpriority="high"><figcaption>${esc(w.stageLabel||w.name.toUpperCase())}</figcaption></figure></section>`:'';
 const caption=w.status
  ? 'The digital-experience concept for this build. In Progress.'
  : `The live ${w.name} digital experience.`;
 return pageHero({
  eyebrow:`OUR WORK / ${w.name}${w.status?' / IN PROGRESS':''}`,
  title:w.title,
  description:w.description,
  className:'case-page-hero',
  media:heroArt
 })+stage+
 `<section class="case-overview section-pad"><dl><div><dt>Client</dt><dd class="case-client">${w.logo?clientLogo(w.logo,{size:'client-logo-facts',label:w.name}):esc(w.name)}</dd></div><div><dt>Sector</dt><dd>${esc(w.industry)}</dd></div><div><dt>Primary capability</dt><dd><a href="/growth-systems/${capability.slug}">${capability.name} ${arrowUpRight()}</a></dd></div><div><dt>Status</dt><dd>${esc(data.status)}</dd></div></dl><div><p class="eyebrow">PROJECT CONTEXT</p><h2>${data.lead}</h2><p>${data.context}</p>${data.visualNote?`<p class="case-visual-note">${data.visualNote}</p>`:''}${scopeList(data.scope)}${deliveryNote(data.delivery)}</div></section>`+
 `<section class="case-narrative section-pad">${data.chapters.map(([label,title,body],i)=>`<article class="case-narrative-chapter reveal"><p class="eyebrow">0${i+1} / ${label}</p><div><h2>${title}</h2><p>${body}</p></div></article>`).join('')}${w.image&&!w.mediaStage?`<figure class="case-interface"><img src="${w.image}" alt="${esc(w.alt)}" width="1440" height="900" loading="lazy"><figcaption>${caption}</figcaption></figure>`:''}</section>`+
 proofBlock(data.proof,w.name)+
 testimonialBlock(data.testimonial,w.name)+
 `<section class="case-capabilities section-pad"><div><p class="eyebrow">CAPABILITY MAPPING</p><h2>Thinking, connected<br>to delivery.</h2><a class="text-link" href="/growth-systems/${capability.slug}">${capability.name} <span aria-hidden="true">${arrowUpRight()}</span></a>${secondary?`<a class="text-link" href="/growth-systems/${secondary.slug}">${secondary.name} <span aria-hidden="true">${arrowUpRight()}</span></a>`:''}</div><div>${data.capabilities.map(([title,body],i)=>`<article><span>0${i+1}</span><div><h3>${title}</h3><p>${body}</p></div></article>`).join('')}</div></section>`+
 `<section class="case-technology section-pad"><p class="eyebrow">TECHNOLOGY &amp; CAPABILITIES</p><div><h2>A foundation with a purpose.</h2><p>${data.technology}</p></div></section>`+
 `${data.outcome?`<section class="case-outcome section-pad"><p class="eyebrow">PUBLISHED OUTCOME</p><h2>${data.outcome[0]}</h2><p>${data.outcome[1]}</p></section>`:''}<section class="case-next section-pad">${w.url?`<a class="text-link" href="${esc(w.url)}" target="_blank" rel="noopener noreferrer">Explore the live website <span aria-hidden="true">${arrowUpRight()}</span></a>`:''}${link('/work','Back to our work')}${link('/contact?interest='+encodeURIComponent(capability.name),'Discuss a related project')}</section>`;
}
