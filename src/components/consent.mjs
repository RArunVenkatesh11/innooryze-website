import {site} from '../site.mjs';
import {esc} from './layout.mjs';

// The consent bar and the preferences dialog are rendered into the static HTML, hidden. public/consent.js
// reveals the bar only when no choice is stored, so people who have already decided never see it flash,
// and the markup costs no layout shift while the module boots. With scripting off neither is shown, which
// is correct: with scripting off nothing optional is loaded either.
//
// No Privacy Policy route is published yet, so the inline link renders only once site.policies.privacy is
// set. That keeps the site free of a link to a page that does not exist, and the link appears on its own
// as soon as the approved policy lands.

const policyLink = () => site.policies.privacy
 ? ` <a class="consent-policy" href="${esc(site.policies.privacy)}">Privacy&nbsp;Policy</a>`
 : '';

const CONSENT_MESSAGE = 'We use essential technologies to keep this site working. With your permission, we also use analytics to understand performance and improve the experience.';

// Order follows the desktop bar: the least committing choice first, the primary action last.
const barActions = [
 ['reject','Reject non-essential','consent-action-quiet'],
 ['manage','Manage preferences','consent-action-quiet'],
 ['accept','Accept all','consent-action-primary']
];

const option = (id,name,description) => `<div class="consent-option"><div class="consent-option-copy"><h3>${name}</h3><p id="${id}-note">${description}</p></div><label class="consent-switch"><input type="checkbox" id="${id}" aria-describedby="${id}-note"><span class="consent-switch-track" aria-hidden="true"></span><span class="sr-only">Allow ${name.toLowerCase()}</span></label></div>`;

export function consentUi(){
 return `<aside class="consent-bar" id="consent-bar" role="region" aria-label="Cookie consent" hidden>
<div class="consent-bar-inner">
<p class="consent-message">${CONSENT_MESSAGE}${policyLink()}</p>
<div class="consent-actions">${barActions.map(([action,label,className])=>`<button type="button" class="consent-action ${className}" data-consent="${action}">${label}</button>`).join('')}</div>
</div>
</aside>
<dialog class="consent-dialog" id="consent-dialog" aria-labelledby="consent-dialog-title">
<div class="consent-dialog-inner">
<div class="consent-dialog-head">
<h2 id="consent-dialog-title">Cookie preferences</h2>
<button type="button" class="consent-dismiss" data-consent="close" aria-label="Close cookie preferences"><span aria-hidden="true">&times;</span></button>
</div>
<p class="consent-dialog-intro">Choose which optional technologies InnooRyze may use on this device.</p>
<div class="consent-options">
<div class="consent-option">
<div class="consent-option-copy"><h3>Essential</h3><p>Needed for the site to load, navigate and remember this choice. These cannot be switched off.</p></div>
<span class="consent-always">Always active</span>
</div>
${option('consent-analytics','Analytics','Google Analytics, so we can see how pages perform and where the experience can improve.')}
${option('consent-marketing','Marketing','Reserved for advertising and campaign measurement. No marketing technologies are active on this site today.')}
</div>
<div class="consent-dialog-actions">
<button type="button" class="consent-action consent-action-quiet" data-consent="reject">Reject non-essential</button>
<button type="button" class="consent-action consent-action-quiet" data-consent="accept">Accept all</button>
<button type="button" class="consent-action consent-action-primary" data-consent="save">Save preferences</button>
</div>
</div>
</dialog>`;
}
