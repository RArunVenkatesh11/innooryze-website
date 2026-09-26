// /platforms → /contact: each platform card preselects the Contact enquiry area of the SECTION it sits in.
import test from 'node:test';
import assert from 'node:assert/strict';
import {platformCategories, platformCatalog} from '../src/content/platform-catalog.mjs';
import {platformDirectory, platformCardHref} from '../src/components/platforms.mjs';
import {interestFromQuery} from '../public/forms.js';
import {contactPage} from '../src/pages/inner.mjs';
import {interests} from '../src/site.mjs';

const html = platformDirectory();
// Card hrefs per rendered section, keyed by data-platform.
function section(id) {
 const start = html.indexOf('<section class="platform-category" id="' + id + '"');
 const block = html.slice(start, html.indexOf('</section>', start));
 return Object.fromEntries([...block.matchAll(/data-platform="([^"]+)" href="([^"]+)"/g)].map(m => [m[1], m[2]]));
}
const areaOf = href => href.startsWith('/contact') ? new URL(href, 'https://innooryze.com').searchParams.get('interest') : null;
const options = [...contactPage().matchAll(/<option>([^<]*)<\/option>/g)].map(m => m[1].replace(/&amp;/g, '&'));

test('every category maps to an enquiry area that exists in the Contact form', () => {
 assert.deepEqual(options, interests);
 for (const g of platformCategories) assert.ok(interests.includes(g.interest), g.id + ' → ' + g.interest);
});

test('CRM cards preselect Growth Systems (LeadRyze CRM keeps its product enquiry)', () => {
 const crm = section('crm');
 assert.equal(areaOf(crm.hubspot), 'Growth Systems');
 assert.equal(areaOf(crm.zoho), 'Growth Systems');
 assert.equal(areaOf(crm['leadryze-crm']), 'LeadRyze CRM');
 assert.equal(crm.salesforce, '/platforms/salesforce', 'detail routes stay detail routes');
});

test('Marketing Automation cards preselect MarTech Consulting & Enablement', () => {
 const ma = section('marketing-automation');
 for (const key of ['salesforce-marketing-cloud', 'mailchimp', 'hubspot', 'zoho', 'oracle-eloqua', 'adobe-marketo-engage', 'adobe-campaign'])
  assert.equal(areaOf(ma[key]), 'MarTech Consulting & Enablement', key);
 assert.equal(ma.braze, '/platforms/braze');
});

test('the same platform follows its section: HubSpot and Zoho under CRM vs Marketing Automation', () => {
 assert.equal(areaOf(section('crm').hubspot), 'Growth Systems');
 assert.equal(areaOf(section('marketing-automation').hubspot), 'MarTech Consulting & Enablement');
 assert.equal(areaOf(section('crm').zoho), 'Growth Systems');
 assert.equal(areaOf(section('marketing-automation').zoho), 'MarTech Consulting & Enablement');
});

test('CDP, Digital Experience / CMS and Analytics cards preselect their areas', () => {
 const cdp = section('customer-data');
 for (const key of ['tealium', 'adobe-experience-platform']) assert.equal(areaOf(cdp[key]), 'Data Intelligence & Activation', key);
 assert.equal(cdp.segment, '/platforms/segment');
 for (const key of ['adobe-experience-manager', 'drupal', 'wordpress']) assert.equal(areaOf(section('digital-experience')[key]), 'Experience Design & Enablement', key);
 for (const key of ['google-analytics', 'adobe-analytics', 'power-bi', 'tableau']) assert.equal(areaOf(section('analytics')[key]), 'Data Intelligence & Activation', key);
});

test('every card in every section is covered and no card falls back to a hardcoded area', () => {
 for (const g of platformCategories) {
  const cards = section(g.id);
  assert.deepEqual(Object.keys(cards), g.items, g.id);
  for (const key of g.items) {
   const href = platformCardHref(g, key);
   assert.equal(cards[key], href, key);
   const p = platformCatalog[key];
   if (!p.owned && !p.href.startsWith('/platforms/')) assert.equal(areaOf(href), g.interest, g.id + '/' + key);
  }
 }
});

test('the generated URL round-trips into the Contact form selection', () => {
 for (const g of platformCategories) for (const key of g.items) {
  const href = platformCardHref(g, key);
  if (!href.startsWith('/contact')) continue;
  const expected = platformCatalog[key].owned ? 'LeadRyze CRM' : g.interest;
  assert.equal(interestFromQuery(new URL(href, 'https://innooryze.com').search, options), expected, key);
 }
});

test('direct /contact and invalid values keep "Select an area"', () => {
 assert.equal(interestFromQuery('', options), '');
 for (const search of ['?interest=', '?interest=martech', '?interest=Growth%20systems', '?interest=%3Cscript%3E', '?interest=Other%20thing', '?foo=Growth%20Systems'])
  assert.equal(interestFromQuery(search, options), '', search);
 assert.match(contactPage(), /<select id="interest" name="whatcanwehelp" required aria-describedby="interest-error"><option value="">Select an area<\/option>/);
});

test('LeadRyze product navigation is unchanged', () => {
 assert.equal(platformCardHref(platformCategories[0], 'leadryze-crm'), '/contact?interest=LeadRyze%20CRM');
 assert.equal(interestFromQuery('?interest=LeadRyze%20AI', options), 'LeadRyze AI');
 assert.equal(interestFromQuery('?interest=LeadRyze%20CRM', options), 'LeadRyze CRM');
});

// Dedicated platform pages: the "Discuss your platform needs" CTA preselects each platform's own enquiry area.
test('dedicated platform page CTAs preselect their approved Contact area', async () => {
 const {platformsPage} = await import('../src/pages/inner.mjs');
 const {platforms} = await import('../src/site.mjs');
 const expected = {
  salesforce: '/contact?interest=MarTech%20Consulting%20%26%20Enablement',
  braze: '/contact?interest=MarTech%20Consulting%20%26%20Enablement',
  segment: '/contact?interest=Data%20Intelligence%20%26%20Activation',
  adobe: '/contact?interest=Growth%20Systems'
 };
 for (const p of platforms) {
  const html = platformsPage(p);
  const href = html.match(/href="([^"]+)"[^>]*>Discuss your platform needs/)[1];
  assert.equal(href, expected[p.slug], p.slug);
  assert.ok(interests.includes(p.interest), p.slug + ' interest must be a Contact option label');
  assert.equal(interestFromQuery(new URL(href, 'https://innooryze.com').search, options), p.interest, p.slug);
 }
});
