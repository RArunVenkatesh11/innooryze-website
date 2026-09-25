import assert from 'node:assert/strict';

// Structured-data rules, checked on the parsed JSON-LD objects rather than by string matching.
//
// The principle behind every rule: schema may only describe what a visitor can see on the same page.
// No ratings, reviews, prices or offers were ever supplied, so none may appear. Regional coverage is
// service coverage, so the only postal address is the Indian one. Product schema belongs to product pages;
// service schema to service pages.

const SERVICE_ROUTES = new Set(['/growth-systems', '/growth-systems/experience-design-enablement', '/growth-systems/martech-consulting-enablement', '/growth-systems/data-intelligence-activation', '/ai-agents']);
const SOFTWARE_ROUTES = new Set(['/products/leadryze-ai', '/products/imma']);
const SOFTWARE_TYPES = new Set(['SoftwareApplication', 'WebApplication', 'MobileApplication']);
// Fields that would assert commercial or quantitative facts nobody has supplied.
const FORBIDDEN_KEYS = new Set(['offers', 'aggregateRating', 'review', 'reviewRating', 'ratingValue', 'reviewCount', 'price', 'priceCurrency', 'priceRange', 'softwareVersion', 'operatingSystem', 'downloadUrl', 'installUrl', 'numberOfEmployees', 'award']);
// Types that would imply a physical branch or storefront.
const FORBIDDEN_TYPES = new Set(['LocalBusiness', 'ProfessionalService', 'Store', 'FAQPage', 'Review', 'AggregateRating', 'Offer']);

const typesOf = n => [].concat(n['@type'] || []);
function walk(node, visit, path = '') {
 if (Array.isArray(node)) return node.forEach((x, i) => walk(x, visit, path + '[' + i + ']'));
 if (node && typeof node === 'object') { visit(node, path); for (const [k, v] of Object.entries(node)) walk(v, visit, path + '.' + k); }
}
const visibleText = html => html.slice(html.indexOf('<main'), html.indexOf('</main>'))
 .replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')
 .replace(/&amp;/g, '&').replace(/&#39;|&#8217;/g, "'").replace(/\s+/g, ' ');

export function validateStructuredData({routes, read, pageFile, origin, production, site}) {
 const graphs = new Map();
 const defined = new Set();
 let orgJson = null;

 for (const route of routes) {
  const html = read(pageFile(route.path));
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  assert.equal(blocks.length, 1, route.path + ' must carry exactly one JSON-LD block');
  const graph = JSON.parse(blocks[0][1])['@graph'];
  assert.ok(Array.isArray(graph) && graph.length, route.path + ' has an empty @graph');
  graphs.set(route.path, {graph, html});
  const ids = graph.map(n => n['@id']).filter(Boolean);
  assert.equal(ids.length, new Set(ids).size, route.path + ' has duplicate @id values');
  ids.forEach(id => defined.add(id));
 }

 for (const [path, {graph, html}] of graphs) {
  const canonical = new URL(path, origin).href;
  const text = visibleText(html);
  const raw = JSON.stringify(graph);

  // leakage: preview hosts, local hosts, or the anonymised client
  assert.ok(!/vercel\.app|localhost|127\.0\.0\.1/i.test(raw), path + ' JSON-LD names a non-production host');
  assert.ok(!/max-?seal/i.test(raw), path + ' JSON-LD names the anonymised client');
  if (production) walk(graph, node => {
   for (const key of ['@id', 'url', 'item']) if (typeof node[key] === 'string' && /^https?:/.test(node[key])) assert.ok(node[key].startsWith(origin), `${path} ${key} is off the canonical origin: ${node[key]}`);
  });

  // forbidden claims and types, anywhere in the graph
  walk(graph, (node, at) => {
   for (const key of Object.keys(node)) assert.ok(!FORBIDDEN_KEYS.has(key), `${path} ${at} carries unsupported "${key}"`);
   for (const t of typesOf(node)) assert.ok(!FORBIDDEN_TYPES.has(t), `${path} ${at} uses ${t}`);
  });

  // every bare {"@id": ...} reference resolves to a node defined somewhere on the site
  walk(graph, node => {
   const keys = Object.keys(node);
   if (keys.length === 1 && keys[0] === '@id') assert.ok(defined.has(node['@id']), `${path} references undefined ${node['@id']}`);
  });

  // one Organization, identical everywhere, with the verified facts and India as the only address
  const orgs = graph.filter(n => typesOf(n).includes('Organization'));
  assert.equal(orgs.length, 1, path + ' must define exactly one Organization');
  const org = orgs[0];
  if (orgJson === null) orgJson = JSON.stringify(org); else assert.equal(JSON.stringify(org), orgJson, path + ' Organization differs from other pages');
  assert.equal(org['@id'], origin + '/#organization');
  assert.equal(org.legalName, site.legalName);
  assert.equal(org.address.addressCountry, 'IN', 'the only postal address is the Indian office');
  let addresses = 0; walk(graph, n => { if (typesOf(n).includes('PostalAddress')) addresses++; });
  assert.equal(addresses, 1, path + ' must carry exactly one PostalAddress');
  assert.deepEqual(org.areaServed.map(a => a.name), site.serviceRegions.map(r => r.name), path + ' areaServed differs from site.serviceRegions');
  assert.ok(!/North America|EMEA/.test(JSON.stringify(org.areaServed)), 'areaServed must not use regions the site does not state');

  // WebSite + WebPage
  const website = graph.find(n => typesOf(n).includes('WebSite'));
  assert.equal(website['@id'], origin + '/#website');
  assert.equal(website.publisher['@id'], org['@id']);
  const page = graph.find(n => typesOf(n).includes('WebPage'));
  assert.equal(page['@id'], canonical, path + ' WebPage @id must be the canonical URL');
  assert.equal(page.url, canonical);
  assert.equal(page.isPartOf['@id'], website['@id']);

  // Service only on service routes, describing what the page visibly says
  const services = graph.filter(n => typesOf(n).includes('Service'));
  if (SERVICE_ROUTES.has(path)) {
   assert.equal(services.length, 1, path + ' must carry exactly one Service');
   const s = services[0];
   assert.equal(s.url, canonical, path + ' Service url must be canonical');
   assert.equal(s['@id'], canonical + '#service');
   assert.equal(s.provider['@id'], org['@id']);
   assert.ok(text.includes(s.description), path + ' Service description is not visible on the page');
   for (const st of [].concat(s.serviceType || [])) assert.ok(text.toLowerCase().includes(st.toLowerCase()), `${path} serviceType "${st}" is not visible on the page`);
  } else assert.equal(services.length, 0, path + ' must not carry Service schema');

  // Software only on the two product pages; name and features must be visible
  const software = graph.filter(n => typesOf(n).some(t => SOFTWARE_TYPES.has(t)));
  if (SOFTWARE_ROUTES.has(path)) {
   assert.equal(software.length, 1, path + ' must carry exactly one application node');
   const app = software[0];
   assert.equal(app.url, canonical);
   assert.equal(app.publisher['@id'], org['@id']);
   assert.ok(text.includes(app.name), path + ' application name is not visible');
   for (const f of app.featureList || []) assert.ok(text.includes(f), `${path} feature "${f}" is not visible on the page`);
  } else assert.equal(software.length, 0, path + ' must not carry application schema');

  // Breadcrumbs: none on home; elsewhere they start at home and end at this canonical URL
  const crumbs = graph.filter(n => typesOf(n).includes('BreadcrumbList'));
  if (path === '/') assert.equal(crumbs.length, 0, 'homepage must not carry a BreadcrumbList');
  else {
   assert.equal(crumbs.length, 1, path + ' needs one BreadcrumbList');
   const items = crumbs[0].itemListElement;
   assert.equal(items[0].item, origin);
   assert.equal(items.at(-1).item, canonical, path + ' breadcrumb must end at the canonical URL');
   items.forEach((it, i) => assert.equal(it.position, i + 1, path + ' breadcrumb positions must be sequential'));
   assert.ok(!/\| InnooRyze/.test(items.at(-1).name), path + ' breadcrumb name must be the page name, not the SEO title');
  }

  // Articles: organisation authorship, dated, canonical
  for (const a of graph.filter(n => typesOf(n).includes('Article'))) {
   assert.ok(path.startsWith('/ideas-hub/'), 'Article schema outside the Ideas Hub: ' + path);
   assert.deepEqual(typesOf(a.author), ['Organization']);
   assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(a.datePublished) && /^\d{4}-\d{2}-\d{2}$/.test(a.dateModified));
   assert.equal(a.mainEntityOfPage, canonical);
  }
 }

 // Regional schema must match the visible statement on /about.
 const about = visibleText(graphs.get('/about').html);
 for (const r of site.serviceRegions) assert.ok(about.includes(r.label), `areaServed "${r.label}" is not stated on /about`);
 return {pages: graphs.size, ids: defined.size};
}
