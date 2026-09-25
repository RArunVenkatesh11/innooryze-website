import {siteAssets,homeFilm} from '../src/config/siteAssets.mjs';
import {platformCategories,featuredPlatforms} from '../src/content/platform-catalog.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {redirects} from '../src/redirects.mjs';
import {policies} from '../src/content/policies.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist'), origin='https://innooryze.com';
const routes=JSON.parse(fs.readFileSync(path.join(root,'scripts/routes.json'),'utf8'));
const titles=new Set(),descriptions=new Set(),production=process.argv.includes('--production');
const pageFile=route=>path.join(dist,route==='/'?'index.html':route.slice(1)+'/index.html');
const localFile=url=>{const clean=decodeURIComponent(url.split(/[?#]/)[0]);return path.extname(clean)?path.join(dist,clean.slice(1)):pageFile(clean);};
const read=file=>fs.readFileSync(file,'utf8');
let linkCount=0;
for(const route of routes){
 const html=read(pageFile(route.path));
 const title=html.match(/<title>(.*?)<\/title>/)?.[1],description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,route.path+' must have one H1');
 assert.ok(title&&!titles.has(title),'Unique title '+route.path);titles.add(title);
 assert.ok(description&&!descriptions.has(description),'Unique description '+route.path);descriptions.add(description);
 for(const token of ['rel="canonical"','property="og:title"','property="og:description"','property="og:url"','property="og:image"','name="twitter:card"','name="viewport"'])assert.ok(html.includes(token),route.path+' missing '+token);
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
 if(production){
  const canonical=new URL(route.path,origin).href;
  assert.ok(html.includes(`rel="canonical" href="${canonical}"`),'Canonical '+route.path);
  assert.ok(html.includes(`property="og:url" content="${canonical}"`),'OG URL '+route.path);
  assert.match(html,new RegExp(`name="robots" content="${route.path==='/credits'?'noindex':'index'},follow"`),'Indexability '+route.path);
  const social=html.match(/property="og:image" content="([^"]+)"/)[1];
  assert.equal(new URL(social).origin,origin);assert.ok(fs.existsSync(localFile(new URL(social).pathname)));
  assert.equal(graph.find(x=>x['@type']==='WebPage').url,canonical);
  for(const type of ['Organization','WebSite'])assert.equal(graph.find(x=>x['@type']===type).url,origin);
  if(route.path.split('/').length>2){const crumbs=graph.find(x=>x['@type']==='BreadcrumbList').itemListElement;assert.equal(crumbs.length,3,route.path+' parent breadcrumb');assert.equal(crumbs.at(-1).item,canonical);}
 }
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate IDs '+route.path);
 for(const match of html.matchAll(/(?:href|src|data-src)="([^" ]+)"/g)){
  const href=match[1];if(href.startsWith('#')){assert.ok(ids.includes(href.slice(1)),route.path+' broken anchor '+href);continue;}
  if(!href.startsWith('/'))continue;assert.ok(fs.existsSync(localFile(href)),route.path+' missing '+href);linkCount++;
  const anchor=href.split('#')[1];if(anchor&&!path.extname(href.split('#')[0]))assert.ok(read(localFile(href)).includes(`id="${anchor}"`),route.path+' broken cross-page anchor '+href);
 }
 for(const img of html.matchAll(/<img\b[^>]*>/g))assert.match(img[0],/alt="[^"]*"/,route.path+' image without alt');
 for(const set of html.matchAll(/(?:srcset|data-srcset)="([^"]+)"/g))for(const item of set[1].split(','))assert.ok(fs.existsSync(localFile(item.trim().split(' ')[0])),'Missing responsive image');
}
const files=fs.readdirSync(dist,{recursive:true}).filter(f=>fs.statSync(path.join(dist,f)).isFile());
for(const f of files.filter(f=>/\.(html|css|js|json|xml|txt|md)$/.test(f)||['.htaccess','_headers','_redirects'].includes(f))){
 const text=read(path.join(dist,f));
 assert.ok(!/localhost|127\.0\.0\.1|chatgpt\.site|\b[A-Z]:[\\/]|file:\/\/|\.codex[\\/]|Astra preview/i.test(text),'Local/preview dependency in '+f);
 if(f.endsWith('.css'))for(const m of text.matchAll(/url\(['"]?(\/assets\/[^)'" ]+)/g))assert.ok(fs.existsSync(localFile(m[1])),'Missing CSS asset '+m[1]);
 if(f.endsWith('.js'))for(const m of text.matchAll(/(?:from\s*|import\s*)['"](\.\.?\/[^'"]+)['"]/g))assert.ok(fs.existsSync(path.resolve(dist,path.dirname(f),m[1])),'Missing JS import '+m[1]);
}
assert.equal(routes.length,27+policies.length);
const sitemap=read(path.join(dist,'sitemap.xml'));
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,routes.length-1);assert.equal(urls.length,new Set(urls).size);
if(production){assert.deepEqual(urls,routes.filter(r=>r.path!=='/credits').map(r=>new URL(r.path,origin).href));assert.equal(read(path.join(dist,'robots.txt')),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);}
assert.match(read(path.join(dist,'404.html')),/name="robots" content="noindex,follow"/);
for(const [from,to] of Object.entries(redirects)){const html=read(pageFile(from));assert.ok(html.includes('noindex,follow'));assert.ok(html.includes(`href="${new URL(to,origin).href}"`));assert.ok(fs.existsSync(pageFile(to)));}
assert.ok(read(path.join(dist,'.htaccess')).includes('ErrorDocument 404 /404.html'));
for(const scene of ['global-city','digital-connection','business-collaboration','data-intelligence','human-machine','human-craft'])for(const size of ['','-mobile'])assert.ok(fs.existsSync(localFile(`${homeFilm.base}${scene}${size}.mp4`)));
assert.ok(fs.existsSync(localFile(homeFilm.audio)));
assert.equal((read(pageFile('/')).match(/class="editorial-item/g)||[]).length,3);
const owned=new Map(),sectionOwners=new Map();for(const [route,scope] of Object.entries(siteAssets)){
 for(const slot of scope.images)for(const image of [slot.src,...(slot.srcset?slot.srcset.split(',').map(s=>s.trim().split(' ')[0]):[])]){
  assert.ok(fs.existsSync(localFile(image)),'Missing owned image '+image);
  const section=route+'#'+slot.key;
  if(sectionOwners.has(image))assert.equal(sectionOwners.get(image),section,'Image shared by separate sections '+image);else sectionOwners.set(image,section);
  if(owned.has(image))assert.equal(owned.get(image),route,'Image shared by unrelated pages '+image);else owned.set(image,route);
 }
 for(const image of [scope.social,scope.background].filter(Boolean)){
  assert.ok(fs.existsSync(localFile(image)),'Missing page-owned social/background image '+image);
  if(owned.has(image))assert.equal(owned.get(image),route,'Shared social/background image '+image);else owned.set(image,route);
 }
}
for(const route of routes)assert.ok(!read(pageFile(route.path)).includes('asset:'),'Unresolved logical asset token');
const homepage=read(pageFile('/'));
assert.deepEqual([...homepage.matchAll(/class="expertise-block" data-platform="([^"]+)"/g)].map(m=>m[1]),featuredPlatforms);
const directory=read(pageFile('/platforms'));
for(const group of platformCategories){assert.ok(directory.includes('id="'+group.id+'"'));for(const slug of group.items)assert.ok(directory.includes('data-platform="'+slug+'"'));}
assert.ok(directory.indexOf('data-platform="leadryze-crm"')<directory.indexOf('data-platform="salesforce"'));
console.log(owned.size+' page-owned image variants and five homepage platforms verified.');
console.log(`Validated ${routes.length} canonical routes, ${linkCount} internal links/assets, ${urls.length} sitemap URLs, schema, headings, media and production portability.`);
if(process.argv.includes('--http')){
 const base=process.env.QA_ORIGIN||'http://127.0.0.1:4173';
 for(const route of routes)for(const suffix of ['',...(route.path==='/'?[]:['/','/index.html'])]){const response=await fetch(base+route.path+suffix);assert.equal(response.status,200,route.path+suffix);assert.ok((await response.text()).includes(route.title));}
 for(const [from,to] of Object.entries(redirects))for(const suffix of ['','/','/index.html']){const response=await fetch(base+from+suffix,{redirect:'manual'});assert.equal(response.status,301);assert.equal(response.headers.get('location'),to);}
 assert.equal((await fetch(base+'/not-a-route')).status,404);
 for(const media of ['/assets/video/home-hero-film-global-city.mp4','/assets/audio/progress-pulse.mp3']){const response=await fetch(base+media,{headers:{Range:'bytes=0-1023'}});assert.equal(response.status,206);assert.equal((await response.arrayBuffer()).byteLength,1024);}
 console.log('HTTP: routes, directory/index refreshes, legacy 301 redirects, true 404 and video/audio byte ranges passed.');
}
