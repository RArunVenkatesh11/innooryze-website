import {esc, pageHero} from './layout.mjs';

// Legal pages reuse the Ideas Hub article layout rather than introducing a second reading system: the same
// sticky contents rail, the same ~770px measure, the same header-aware scroll-margin and the same 44px
// contents targets on touch. Only the hero metadata row and the list styling are new.

// Anchors come from the section heading itself, so the contents rail can never drift from the document.
export const policySlug = heading => heading.toLowerCase()
 .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// The live pages print the contact email as plain text (once with a decorative emoji in front of it).
// Linking it is a presentation change; the address itself is untouched.
const EMAIL = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i;
const linkEmail = value => {
 const clean = value.replace(/^\s*📧\s*/, '').trim();
 const match = clean.match(EMAIL);
 if (!match) return esc(clean);
 const [before, after] = clean.split(match[1]);
 return esc(before) + `<a href="mailto:${esc(match[1])}">${esc(match[1])}</a>` + esc(after);
};

const renderBlock = ([type, value]) => {
 if (type === 'h3') return `<h3>${esc(value)}</h3>`;
 if (type === 'ul') return `<ul>${value.map(item => `<li>${linkEmail(item)}</li>`).join('')}</ul>`;
 // A paragraph the source broke across lines, such as the registered address.
 if (type === 'lines') return `<p class="policy-lines">${value.map(linkEmail).join('<br>')}</p>`;
 return `<p>${linkEmail(value)}</p>`;
};

export function policyPage(policy) {
 const contents = policy.sections.map(s => `<a href="#${policySlug(s.heading)}">${esc(s.heading)}</a>`).join('');
 const dates = `<dl class="policy-dates">
<div><dt>Effective Date</dt><dd><time datetime="${esc(policy.effectiveIso)}">${esc(policy.effective)}</time></dd></div>
<div><dt>Last Updated</dt><dd><time datetime="${esc(policy.approvedOn)}">${esc(policy.updated)}</time></dd></div>
</dl>`;
 const body = policy.sections.map(s =>
  `<section id="${policySlug(s.heading)}"><h2>${esc(s.heading)}</h2>${s.blocks.map(renderBlock).join('')}</section>`
 ).join('');
 return pageHero({
  eyebrow: 'LEGAL',
  title: esc(policy.title),
  description: esc(policy.description),
  extra: dates,
  className: 'policy-page-hero'
 }) + `<div class="article-body-wrap policy-body-wrap section-pad">
<nav aria-label="Sections of this document" class="article-toc policy-toc"><span class="eyebrow">ON THIS PAGE</span>${contents}</nav>
<div class="article-body policy-body">${body}</div>
</div>`;
}
