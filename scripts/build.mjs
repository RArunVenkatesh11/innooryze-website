import {siteAssets,homeFilm} from '../src/config/siteAssets.mjs';
import {scopePageAssets} from './page-assets.mjs';
import {guardHover} from './hover-guard.mjs';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {site,services,articles,work,platforms} from '../src/site.mjs';
import {analytics,analyticsCsp} from '../src/config/analytics.mjs';
import {redirects} from '../src/redirects.mjs';
import {distExclusions,excludedPaths} from '../src/config/distExclusions.mjs';
import {securityHeaders,contentSecurityPolicy} from '../src/config/headers.mjs';
import {describeEnvironment} from '../src/config/environment.mjs';
import {policies,policyPaths} from '../src/content/policies.mjs';
import {apacheConfig,redirectPage} from './deployment.mjs';
import {layout,esc,pageHero} from '../src/components/layout.mjs';
import {policyPage} from '../src/components/policy.mjs';import {home} from '../src/pages/home.mjs';import * as inner from '../src/pages/inner.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.resolve(root,'dist');
if(path.relative(root,out)!=='dist'||fs.realpathSync(root)!==root)throw Error('Unexpected build directory');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
// Source masters and superseded iterations stay in public/ but never reach the release. Every entry is
// verified below, after rendering, so nothing can be dropped while something still references it.
const publicRoot=path.join(root,'public');
for(const {path:p} of distExclusions)if(!fs.existsSync(path.join(publicRoot,p.slice(1))))throw Error('distExclusions lists a file that no longer exists: '+p+' — remove the entry');
const excludedFromDist=[];
fs.cpSync(publicRoot,out,{recursive:true,filter:src=>{
 if(['singapore.mp4','singapore.jpg'].includes(path.basename(src)))return false;
 const web='/'+path.relative(publicRoot,src).split(path.sep).join('/');
 if(excludedPaths.has(web)){excludedFromDist.push(web);return false;}
 return true;
}});
fs.writeFileSync(path.join(out,'media-config.js'),'export const homeFilm = '+JSON.stringify(homeFilm)+';\n');
fs.writeFileSync(path.join(out,'analytics-config.js'),'export const analyticsConfig = '+JSON.stringify({googleTagId:analytics.googleTagId,measuredHosts:analytics.measuredHosts,consentVersion:analytics.consentVersion,storageKey:analytics.storageKey,debugKey:analytics.debugKey})+';\n');
let base=fs.readFileSync(path.join(root,'src/styles/base.css'),'utf8');
for(const [from,to] of Object.entries({'#e1fa42':'#00d4df','#eef1e8':'#edf4f4','#f8f9f4':'#f7f7f3','#151714':'#11191b','#1e211b':'#142326','#2c3126':'#213438','#525b45':'#3f6267','#c9d2c1':'#c4dcdf','#d9ded2':'#d4e2e3','#b8beb2':'#b7c9cb','#434a3b':'#2e494e','#a2ae97':'#91b3b7','#4a4d46':'#415a5d','#464a40':'#38545a','#f9fbf6':'#f7fbfb','#e8eddf':'#e3eef0','#dce1d4':'#d2e2e4','#d2ddc4':'#c0dade','#f5f6eff5':'#f3f8f8f5'}))base=base.split(from).join(to);
fs.writeFileSync(path.join(out,'style.css'),guardHover(`:root{--home-hero-backdrop:url("${siteAssets['/'].background}");--home-film-poster:url("${siteAssets['/'].images[0].src}")}\n`+base+'\n'+fs.readFileSync(path.join(root,'src/styles/phase1.css'),'utf8')+'\n'+fs.readFileSync(path.join(root,'src/styles/phase2.css'),'utf8')+'\n'+fs.readFileSync(path.join(root,'src/styles/refinements.css'),'utf8')+'\n'+fs.readFileSync(path.join(root,'src/styles/phase3.css'),'utf8')));
const pages=[];
const add=(route,title,description,body,options={})=>pages.push({path:route,title:`${title} | InnooRyze`,description,body,...options});
add('/','Growth Systems, MarTech & AI Consulting','InnooRyze connects customer experience, MarTech, CRM and customer data with practical AI agents to build growth systems that perform.',home(),{theme:'homepage'});
add('/growth-systems','Growth Systems: CX, MarTech & Data Consulting','Customer experience design, CRM and MarTech implementation, and customer data activation, connected in one growth system.',inner.growthPage());
for(const s of services)add('/growth-systems/'+s.slug,s.metaTitle||s.name,s.description,inner.servicePage(s),{schema:[{'@type':'Service',name:s.name,description:s.description,provider:{'@id':`${site.url}/#organization`}}]});
add('/ai-agents','AI Agent Development & Automation Consulting','Custom AI agent development and AI automation consulting: agents for business that connect to your knowledge, CRM, APIs and workflows.',inner.agentsPage());
add('/products','AI Products & Custom SaaS Development','LeadRyze AI, IMMA and the custom SaaS, business applications and AI-enabled products InnooRyze designs and builds for clients.',inner.productsPage());
add('/products/leadryze-ai','LeadRyze AI — Intelligent AI Lead Desk','LeadRyze AI answers buyers, qualifies enquiries, captures leads, helps book meetings and connects with CRM.',inner.leadPage());
add('/products/imma','IMMA — Marketing Maturity Assessment','IMMA, the Intelligent Marketing Maturity Assessment, helps decision-makers find gaps across marketing technology, data, customer journeys and capabilities.',inner.immaPage());
add('/work','Client Work & Case Studies','Client work and case studies from InnooRyze across customer experience, CRM and MarTech, with clear context and outcomes we can substantiate.',inner.workPage());
for(const w of work)add('/work/'+(w.route||w.slug),w.metaTitle||w.name+' — '+w.title,w.description,inner.casePage(w));
add('/ideas-hub','Ideas Hub — Experience, MarTech, Data & AI','Perspectives, articles and guides on customer experience, marketing technology, data intelligence and practical AI.',inner.ideasPage());
for(const a of articles)add('/ideas-hub/'+a.slug,a.title,a.summary,inner.articlePage(a),{type:'article',schema:[{'@type':'Article',headline:a.title,description:a.summary,datePublished:a.published,dateModified:a.updated,image:new URL(a.image.src||'asset:editorial/'+a.image.name+'-1600.webp',site.url).href,author:{'@type':'Organization',name:site.name},publisher:{'@id':`${site.url}/#organization`},articleSection:a.category,mainEntityOfPage:new URL('/ideas-hub/'+a.slug,site.url).href}]});
add('/about','About InnooRyze — Growth Systems, MarTech & AI','InnooRyze is a Growth Systems, MarTech and AI consulting and product company working with businesses across the US, UK, APAC and India.',inner.aboutPage());
add('/contact','Contact InnooRyze — Start a Conversation','Talk with InnooRyze about customer experience, MarTech and CRM, customer data, AI agents and automation, LeadRyze AI or IMMA.',inner.contactPage(),{closingCta:false});
add('/platforms','Platform Expertise','Platform-agnostic consulting and implementation across customer experience, MarTech and data ecosystems.',inner.platformsPage());
for(const p of platforms)add('/platforms/'+p.slug,p.name+' — Platform Expertise',`Connect ${p.name} with the experience, technology and intelligence behind your growth system.`,inner.platformsPage(p));
add('/credits','Visual Credits','Sources for the original imagery, film, sound and brand assets used by InnooRyze.',inner.creditsPage(),{closingCta:false,indexable:false});
for(const policy of policies){
 if(!policyPaths[policy.key]||!new RegExp('^[0-9]{4}-[0-9]{2}-[0-9]{2}$').test(policy.approvedOn)||!new RegExp('^[0-9]{4}-[0-9]{2}-[0-9]{2}$').test(policy.effectiveIso)||!policy.sections?.length)throw Error('Policy requires a valid key, both dates and approved sections');
 if(policy.sections.some(s=>!s.heading||!s.blocks?.length))throw Error('Every policy section needs a heading and approved content');
 add(policyPaths[policy.key],policy.title,policy.description,policyPage(policy),{closingCta:false});
}
for(const page of pages){const filename=path.join(out,page.path==='/'?'index.html':page.path.slice(1)+'/index.html');fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,layout(scopePageAssets(page,site.url)));}
fs.writeFileSync(path.join(out,'404.html'),layout(scopePageAssets({path:'/404',title:'Page not found | InnooRyze',description:'Explore the InnooRyze website.',body:inner.notFound(),closingCta:false,indexable:false},site.url)));
// A preview build disallows everything and deliberately advertises no sitemap; sitemap.xml is still
// written so the artifact keeps the same shape, but nothing points a crawler at it.
fs.writeFileSync(path.join(out,'robots.txt'),site.indexable?`User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
fs.writeFileSync(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(p=>p.indexable!==false).map(p=>`<url><loc>${new URL(p.path,site.url).href}</loc></url>`).join('')}</urlset>`);
for(const [from,to] of Object.entries(redirects)){const file=path.join(out,from.slice(1),'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,redirectPage(from,to,site.url));}
fs.writeFileSync(path.join(out,'_redirects'),Object.entries(redirects).map(([from,to])=>from+' '+to+' 301!\n'+from+'/ '+to+' 301!').join('\n')+'\n');
const endpointOrigin=site.enquiryEndpoint?new URL(site.enquiryEndpoint,site.url).origin:'';
const csp=contentSecurityPolicy(endpointOrigin);
fs.writeFileSync(path.join(out,'_headers'),'/*'+String.fromCharCode(10)+securityHeaders(endpointOrigin).map(([k,v])=>'  '+k+': '+v).join(String.fromCharCode(10))+String.fromCharCode(10));
fs.writeFileSync(path.join(out,'.htaccess'),apacheConfig(pages.map(p=>p.path),securityHeaders(endpointOrigin)));
fs.writeFileSync(path.join(root,'scripts/routes.json'),JSON.stringify(pages.map(({path,title})=>({path,title})),null,2));
// An excluded asset must be genuinely unused. Scan everything the release actually serves — rendered
// pages, the stylesheet, browser modules, licence records and the routing files — and fail loudly if any
// of them still names a file we just withheld. This is what stops the exclusion list going stale and
// silently breaking a page later.
{
 const served=[];
 const collect=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())collect(full);
  else if(/\.(html|css|js|json|xml|txt)$/i.test(entry.name)||['_headers','_redirects','.htaccess'].includes(entry.name))served.push(full);
 }};
 collect(out);
 let haystack='';for(const file of served)haystack+=fs.readFileSync(file,'utf8')+'\n';
 const leaked=[...new Set(excludedFromDist)].filter(web=>haystack.includes(web));
 if(leaked.length)throw Error('Excluded asset is still referenced by the build: '+leaked.join(', ')+' — remove it from src/config/distExclusions.mjs');
 const missing=distExclusions.filter(x=>!excludedFromDist.includes(x.path));
 if(missing.length)throw Error('distExclusions entries never matched a file: '+missing.map(x=>x.path).join(', '));
}
const env=describeEnvironment();
console.log(`${env.indexable?'INDEXABLE':'NOINDEX'} (${env.source}) · withheld ${excludedFromDist.length} unreferenced source/iteration files · Built ${pages.length} complete, statically rendered routes.`);
