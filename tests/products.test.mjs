// /products and llms.txt describe LeadRyze CRM as a separate, owned product, without an invented status or route.
import test from 'node:test';
import assert from 'node:assert/strict';
import {productsPage} from '../src/pages/inner.mjs';
import {leadryzeCrm, products} from '../src/site.mjs';

const html = productsPage();
const row = html.slice(html.indexOf('id="leadryze-crm"'), html.indexOf('<section class="roadmap'));

test('LeadRyze CRM has its own product row, Built by InnooRyze, before the roadmap', () => {
 assert.ok(html.indexOf('product-row-imma') < html.indexOf('id="leadryze-crm"'));
 assert.match(row, /<h2>LeadRyze CRM<\/h2>/);
 assert.match(row, /CRM \/ BUILT BY INNOORYZE/);
 assert.match(row, /separate product from LeadRyze AI/);
});

test('LeadRyze CRM links to its Contact enquiry, not a product route', () => {
 assert.match(row, /href="\/contact\?interest=LeadRyze%20CRM"/);
 assert.doesNotMatch(row, /href="\/products\/leadryze-crm/);
 assert.ok(!products.some(p => p.slug === 'leadryze-crm'));
});

test('no status, pricing or availability is claimed for LeadRyze CRM', () => {
 for (const claim of [/available/i, /beta/i, /coming soon/i, /in development/i, /pric/i, /free/i, /launch/i]) {
  assert.doesNotMatch(row, claim);
  assert.doesNotMatch(leadryzeCrm.description + leadryzeCrm.distinction, claim);
 }
});
