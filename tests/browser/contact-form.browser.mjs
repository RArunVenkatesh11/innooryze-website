// Contact form browser integration test (not part of npm test: it needs Google Chrome and network access
// to Cloudflare's Turnstile script). Run after a build:  npm run build:production && npm run test:contact-browser
// Optional: start `npm run preview` first to include the preview-host check; set CHROME_PATH if Chrome is
// not in its default Windows location. Screenshots and a JSON summary go to <tmp>/innooryze-contact-qa/.
//
// Contact form browser QA. A dedicated headless Chrome serves dist/ AS https://innooryze.com (with the real
// _headers CSP), loads the REAL Cloudflare Turnstile script using Cloudflare's public test site keys, and
// answers the Apps Script POST by running the REAL Code.gs in a vm against simulated Google services,
// nested like HtmlService output (script.google.com page > n-…-script.googleusercontent.com sandbox frame).
// Nothing reaches the live Apps Script, Sheet or Microsoft 365.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import os from 'node:os';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIST = ROOT + '/dist';
const HERE = path.join(os.tmpdir(), 'innooryze-contact-qa');
fs.mkdirSync(HERE, {recursive: true});
const PORT = 9334;
const ENDPOINT = JSON.parse(fs.readFileSync(DIST + '/contact-config.js', 'utf8').replace(/^export const contactConfig = /, '').replace(/;\s*$/, '')).endpoint;
const SANDBOX = 'https://n-qa7f3c9d2e41-0lu-script.googleusercontent.com';
const ONLY = process.argv.slice(2);

// ---------- simulated backend: the real Code.gs ----------
const COLUMNS = ['submissionid','firstname','lastname','workemail','company','role','countryregion','whatcanwehelp','message','createddate','submittedfrom','referrer','utmsource','utmmedium','utmcampaign','utmcontent','utmterm','status','internalemailstatus','ackemailstatus','leadryzeid'];
const grid = [COLUMNS.slice()];
const cache = new Map();
let scenario = {};
const received = [];
const mails = [];
const verifications = [];
const props = new Map();
function backend() {
 const sheet = {getLastColumn: () => grid[0].length, getLastRow: () => grid.length,
  getRange(row, col, rows = 1, cols = 1) { return {getValues: () => Array.from({length: rows}, (_, r) => Array.from({length: cols}, (_, c) => grid[row - 1 + r]?.[col - 1 + c] ?? '')),
   setValues(v) { if (scenario.sheetBroken) throw new Error('Sheet unavailable'); grid[row - 1] ??= []; v[0].forEach((x, c) => grid[row - 1][col - 1 + c] = x); return this; },
   setValue(x) { grid[row - 1][col - 1] = x; return this; }, setNumberFormat() { return this; }}; }};
 const res = (code, body) => ({getResponseCode: () => code, getContentText: () => typeof body === 'string' ? body : JSON.stringify(body)});
 const ctx = {console: {log() {}, warn: m => process.env.GASLOG && console.log('GAS', m), error: m => process.env.GASLOG && console.log('GAS', m)}, JSON, Math, Date, Number, String, Array, Object, RegExp, Error, isFinite, encodeURIComponent,
  PropertiesService: {getScriptProperties: () => ({setProperty: (k, v) => props.set(k, String(v)), deleteProperty: k => props.delete(k), getProperty: n => props.has(n) ? props.get(n) : n === 'MS365_SENDER_EMAIL' ? 'enquiry@innooryze.com' : n === 'CONTACT_NOTIFICATION_TO' ? 'kavyasri@innooryze.com' : /^(TURNSTILE_SECRET_KEY|MS365_)/.test(n) ? 'qa-' + n : null})},
  CacheService: {getScriptCache: () => ({get: k => cache.get(k) ?? null, put: (k, v) => cache.set(k, v)})},
  LockService: {getScriptLock: () => ({waitLock() {}, tryLock() { return true; }, releaseLock() {}})},
  SpreadsheetApp: {getActiveSpreadsheet: () => ({getSheets: () => [sheet]}), flush() {}},
  Utilities: {formatDate: (d, tz, f) => f === 'yyyyMMdd' ? d.toISOString().slice(0, 10).replace(/-/g, '') : d.toISOString(), getUuid: () => crypto.randomUUID(),
   computeDigest: (a, t) => [...crypto.createHash('sha256').update(t, 'utf8').digest()].map(b => b > 127 ? b - 256 : b), DigestAlgorithm: {SHA_256: 1}, Charset: {UTF_8: 1}},
  UrlFetchApp: {fetch(url, o) {
   if (url.includes('siteverify')) { verifications.push(o.payload.response); return res(200, scenario.turnstile === 'fail' ? {success: false, 'error-codes': ['invalid-input-response']} : {success: true, action: 'contact_submit', hostname: 'innooryze.com'}); }
   if (url.includes('login.microsoftonline.com')) return res(200, {access_token: 't', expires_in: 3600});
   const m = JSON.parse(o.payload).message; mails.push(m);
   return res(scenario.ackFails && m.toRecipients[0].emailAddress.address !== 'kavyasri@innooryze.com' ? 403 : 202, '');
  }},
  HtmlService: {XFrameOptionsMode: {ALLOWALL: 'ALLOWALL'}, createHtmlOutput: html => ({html, setTitle() { return this; }, setXFrameOptionsMode() { return this; }})},
  ContentService: {MimeType: {JSON: 1}, createTextOutput: text => ({text, setMimeType() { return this; }})}};
 vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(ROOT + '/integrations/apps-script/contact-form/Code.gs', 'utf8'), ctx);
 return ctx;
}
const gas = backend();
const outputs = new Map();
const rows = () => grid.slice(1).map(r => Object.fromEntries(COLUMNS.map((c, i) => [c, r[i]])));

// ---------- static dist as https://innooryze.com ----------
const headerLines = fs.readFileSync(DIST + '/_headers', 'utf8').split('\n').slice(1).filter(Boolean).map(l => { const i = l.indexOf(':'); return {name: l.slice(0, i).trim(), value: l.slice(i + 1).trim()}; });
const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.mp4': 'video/mp4', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.webm': 'video/webm'};
function serve(url) {
 let p = decodeURIComponent(new URL(url).pathname);
 let file = path.join(DIST, p);
 if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
 else if (!path.extname(file)) file = path.join(DIST, p.slice(1), 'index.html');
 let status = 200;
 if (!fs.existsSync(file)) { file = path.join(DIST, '404.html'); status = 404; }
 let body = fs.readFileSync(file);
 if (p === '/contact-config.js') {
  const cfg = JSON.parse(body.toString().replace(/^export const contactConfig = /, '').replace(/;\s*$/, ''));
  cfg.turnstileSiteKey = scenario.sitekey || '1x00000000000000000000BB';
  if (scenario.grace) cfg.afterLoadGraceMs = scenario.grace;
  body = Buffer.from('export const contactConfig = ' + JSON.stringify(cfg) + ';\n');
 }
 return {status, headers: [{name: 'Content-Type', value: TYPES[path.extname(file)] || 'application/octet-stream'}, ...headerLines], body};
}

// ---------- CDP ----------
const chromePath = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].filter(Boolean).find(fs.existsSync);
if (!chromePath) { console.error('Google Chrome not found; set CHROME_PATH.'); process.exit(2); }
const profile = HERE + '/chrome-contact-qa';
fs.rmSync(profile, {recursive: true, force: true});
const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + profile, '--no-first-run', '--hide-scrollbars', '--disable-features=Translate,IsolateOrigins,site-per-process', '--disable-site-isolation-trials', 'about:blank'], {stdio: 'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) { try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); } catch {} if (!target) await sleep(250); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let seq = 0; const pending = new Map(); const events = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) onEvent(m); };
const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; const t = setTimeout(() => reject(new Error('timeout ' + method)), 30000); pending.set(id, m => { clearTimeout(t); m.error ? reject(new Error(method + ': ' + m.error.message)) : resolve(m.result); }); ws.send(JSON.stringify({id, method, params})); });
const ev = async expr => { const r = await send('Runtime.evaluate', {expression: expr, awaitPromise: true, returnByValue: true}); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };

const network = [];
const consoleErrors = [];
async function onEvent(m) {
 if (m.method === 'Runtime.exceptionThrown') consoleErrors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
 if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') consoleErrors.push(m.params.entry.text + ' ' + (m.params.entry.url || ''));
 if (m.method === 'Network.requestWillBeSent') network.push({url: m.params.request.url, method: m.params.request.method});
 if (m.method !== 'Fetch.requestPaused') return;
 const {requestId, request} = m.params;
 const url = request.url;
 try {
  if (url.startsWith('https://innooryze.com/')) {
   const r = serve(url);
   return send('Fetch.fulfillRequest', {requestId, responseCode: r.status, responseHeaders: r.headers, body: r.body.toString('base64')});
  }
  if (url.startsWith(ENDPOINT) && request.method === 'POST') {
   const raw = request.postData ?? (request.postDataEntries || []).map(e => Buffer.from(e.bytes, 'base64').toString()).join('');
   const params = Object.fromEntries(new URLSearchParams(raw));
   received.push({params, contentType: request.headers['Content-Type'] || request.headers['content-type'], at: Date.now()});
   if (scenario.delay) await sleep(scenario.delay);
   if (scenario.unavailable) return send('Fetch.fulfillRequest', {requestId, responseCode: 500, responseHeaders: [{name: 'Content-Type', value: 'text/html'}], body: Buffer.from('<!doctype html><title>Error</title><p>We\'re sorry, a server error occurred. Please wait a bit and try again.</p>').toString('base64')});
   const out = gas.doPost({parameter: params, postData: {type: 'application/x-www-form-urlencoded', contents: raw}});
   const key = crypto.randomUUID();
   outputs.set(key, out.html);
   const wrapper = `<!doctype html><html><head><title>InnooRyze</title></head><body style="margin:0"><iframe src="${SANDBOX}/userCodeAppPanel?key=${key}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" style="border:0;width:100%;height:100%"></iframe></body></html>`;
   if (scenario.redirect) {
    outputs.set('wrap-' + key, wrapper);
    return send('Fetch.fulfillRequest', {requestId, responseCode: 302, responseHeaders: [{name: 'Location', value: 'https://script.googleusercontent.com/macros/echo?user_content_key=wrap-' + key}]});
   }
   return send('Fetch.fulfillRequest', {requestId, responseCode: 200, responseHeaders: [{name: 'Content-Type', value: 'text/html; charset=utf-8'}], body: Buffer.from(wrapper).toString('base64')});
  }
  if (url.startsWith('https://script.googleusercontent.com/macros/echo')) {
   const html = outputs.get(new URL(url).searchParams.get('user_content_key'));
   return send('Fetch.fulfillRequest', {requestId, responseCode: 200, responseHeaders: [{name: 'Content-Type', value: 'text/html; charset=utf-8'}], body: Buffer.from(html).toString('base64')});
  }
  if (url.startsWith(SANDBOX)) {
   const html = outputs.get(new URL(url).searchParams.get('key')) || '';
   return send('Fetch.fulfillRequest', {requestId, responseCode: 200, responseHeaders: [{name: 'Content-Type', value: 'text/html; charset=utf-8'}], body: Buffer.from(html).toString('base64')});
  }
  if (/googletagmanager\.com\/gtag\/js/.test(url)) {
   // Stub the Google tag: record that it loaded; never send a hit from QA.
   return send('Fetch.fulfillRequest', {requestId, responseCode: 200, responseHeaders: [{name: 'Content-Type', value: 'text/javascript'}], body: Buffer.from('window.__gtagLoaded=true;').toString('base64')});
  }
  if (/google-analytics\.com|analytics\.google\.com/.test(url)) return send('Fetch.failRequest', {requestId, errorReason: 'BlockedByClient'});
  return send('Fetch.continueRequest', {requestId});
 } catch (e) { console.error('intercept', url, e.message); try { await send('Fetch.continueRequest', {requestId}); } catch {} }
}
await send('Page.enable'); await send('Runtime.enable'); await send('Emulation.setFocusEmulationEnabled', {enabled: true}); await send('Log.enable'); await send('Network.enable');
await send('Fetch.enable', {patterns: [{urlPattern: 'https://innooryze.com/*'}, {urlPattern: 'https://script.google.com/*'}, {urlPattern: 'https://script.googleusercontent.com/*'}, {urlPattern: SANDBOX + '/*'}, {urlPattern: '*googletagmanager.com*'}, {urlPattern: '*google-analytics.com*'}, {urlPattern: '*analytics.google.com*'}]});
await send('Page.addScriptToEvaluateOnNewDocument', {source: `window.__csp=[];document.addEventListener('securitypolicyviolation',e=>window.__csp.push(e.violatedDirective+' '+e.blockedURI));
 window.__messages=[];addEventListener('message',e=>{if(e.data&&e.data.type)window.__messages.push({origin:e.origin,type:e.data.type})});
 // spy on Turnstile once it appears
 (function spy(){const t=window.turnstile;if(t&&!t.__spied){t.__spied=true;window.__ts={execute:0,reset:0,render:0,remove:0};for(const k of ['execute','reset','render','remove']){const f=t[k].bind(t);t[k]=(...a)=>{window.__ts[k]++;return f(...a);};}}setTimeout(spy,20);})();`});

async function viewport(w, h, mobile) {
 await send('Emulation.setDeviceMetricsOverride', {width: w, height: h, deviceScaleFactor: 1, mobile});
 await send('Emulation.setTouchEmulationEnabled', mobile ? {enabled: true, maxTouchPoints: 5} : {enabled: false});
}
async function open(url, {consent = 'reject'} = {}) {
 await send('Page.navigate', {url: 'about:blank'}); await sleep(150);
 await send('Storage.clearDataForOrigin', {origin: 'https://innooryze.com', storageTypes: 'all'}).catch(() => {});
 await send('Page.navigate', {url});
 for (let i = 0; i < 60; i++) { await sleep(150); if (await ev('document.readyState==="complete"&&!!document.querySelector(".site-header")').catch(() => false)) break; }
 if (consent) await ev(`(()=>{const b=document.querySelector('[data-consent="${consent}"]');if(b&&!document.getElementById('consent-bar').hidden)b.click();return 1})()`);
 await sleep(400);
}
const metrics = () => ev(`(async()=>{const keep=scrollY;const settle=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));document.documentElement.style.scrollBehavior='auto';document.body.style.scrollBehavior='auto';for(let i=0;i<30&&scrollY!==0;i++){scrollTo({top:0,behavior:'instant'});await settle();}await settle();const r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:Math.round(b.left),y:Math.round(b.top+scrollY),w:Math.round(b.width),h:Math.round(b.height)}};
 const intro=document.querySelector('.contact-page-intro');
 const out = {intro:r(intro),introHtml:intro.innerHTML.length+':'+[...intro.innerHTML].reduce((a,c)=>(a*31+c.charCodeAt(0))|0,0),
  watermark:r(document.querySelector('.contact-page .brand-watermark')),section:r(document.querySelector('.contact-page')),wrap:r(document.querySelector('.contact-form-wrap')),
  button:r(document.querySelector('.form-submit')),overflow:document.documentElement.scrollWidth>innerWidth,footer:r(document.querySelector('footer'))};out.scrollY=scrollY;scrollTo({top:keep,behavior:'instant'});document.documentElement.style.scrollBehavior='';document.body.style.scrollBehavior='';return out})()`);
const fill = tag => ev(`(()=>{const f=document.querySelector('.contact-form');const v={firstname:'Avery',lastname:'Tester',workemail:'qa-${tag}@example.com',company:'QA Example Ltd',role:'Director',countryregion:'Singapore',message:'QA enquiry ${tag} '+Date.now()};
 for(const[k,x]of Object.entries(v)){const e=f.elements.namedItem(k);e.focus();e.value=x;e.dispatchEvent(new Event('input',{bubbles:true}));}
 const s=f.elements.namedItem('whatcanwehelp');s.value=s.options[2].value;s.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
const clickSubmit = () => ev(`document.querySelector('.form-submit').click(),1`);
const state = () => ev(`(()=>{const f=document.querySelector('.contact-form');const fb=f&&f.querySelector('.form-feedback');const s=document.querySelector('.contact-success');
 return {form:!!f,state:f?.dataset.state,busy:f?.getAttribute('aria-busy'),disabled:f?.querySelector('.form-submit').disabled,label:f?.querySelector('.form-submit').textContent.trim(),spinner:!!f?.querySelector('.form-submit .form-spinner')&&f.querySelector('.form-spinner').getBoundingClientRect().width>0,
  status:f?.querySelector('[data-form-status]').textContent,feedback:fb&&!fb.hidden?fb.textContent:'',feedbackError:fb?.classList.contains('is-error'),
  active:document.activeElement?.className||document.activeElement?.id||document.activeElement?.tagName,success:!!s,note:!!s?.querySelector('[data-confirmation]'),
  successText:s?.innerText.replace(/\\s+/g,' ').trim(),successBox:s?(()=>{const b=s.querySelector('.contact-success-inner').getBoundingClientRect();return {top:Math.round(b.top),bottom:Math.round(b.bottom),vh:innerHeight}})():null,
  frames:document.querySelectorAll('iframe[name="contact-submit-target"]').length,history:history.length,csp:window.__csp,ts:window.__ts,
  invalid:f?[...f.querySelectorAll('[aria-invalid=true]')].map(e=>e.name):[],token:f?.elements.namedItem('turnstiletoken').value,url:location.href}})()`);
async function waitFor(pred, ms = 20000) { const end = Date.now() + ms; let s; while (Date.now() < end) { s = await state(); if (pred(s)) return s; await sleep(100); } return s; }
async function shot(name) { const {data} = await send('Page.captureScreenshot', {format: 'png'}); fs.writeFileSync(HERE + '/contact-qa-' + name + '.png', Buffer.from(data, 'base64')); }
async function scrollToForm(where = 'top') { await ev(`(()=>{const w=document.querySelector('.contact-form-wrap');const b=w.getBoundingClientRect();scrollTo(0,${where === 'bottom' ? "scrollY+b.bottom-innerHeight+40" : "scrollY+b.top-100"});return 1})()`); await sleep(300); }

const results = {};
const fails = [];
const check = (name, ok, detail) => { if (!ok) console.log('FAIL', name, JSON.stringify(detail).slice(0, 700)); else console.log('ok  ', name); if (!ok) fails.push(name + (detail ? ' :: ' + JSON.stringify(detail).slice(0, 400) : '')); return ok; };

// ---------- 1. Responsive state sweep ----------
const VIEWPORTS = [[1920, 1080, false], [1440, 900, false], [1366, 768, false], [1280, 720, false], [1024, 768, false], [834, 1112, true], [430, 932, true], [390, 844, true], [375, 812, true], [360, 800, true]];
if (!ONLY.length || ONLY.includes('sweep')) for (const [w, h, mobile] of VIEWPORTS) {
 const tag = w + 'x' + h;
 await viewport(w, h, mobile);
 scenario = {};
 await open('https://innooryze.com/contact');
 const idle = await metrics();
 const s0 = await state();
 await scrollToForm('bottom');
 await shot(tag + '-1-idle');
 // validation error
 await clickSubmit(); await sleep(300);
 const sv = await state();
 check(tag + ' validation: errors shown and focus on first field', sv.invalid.length === 7 && sv.feedback.includes('check the highlighted') && sv.active !== 'form-feedback', sv);
 await shot(tag + '-2-validation');
 const vm1 = await metrics();
 // backend error, captured while submitting
 await fill(tag); await sleep(3300);
 scenario = {sheetBroken: true, delay: 1800};
 await scrollToForm('bottom');
 const before = await metrics();
 await clickSubmit(); await sleep(150);
 await clickSubmit(); await sleep(150); // double click during submission
 const ss = await waitFor(s => s.state === 'submitting', 5000);
 const submittingMetrics = await metrics();
 await shot(tag + '-3-submitting');
 check(tag + ' submitting: disabled, busy, announced, layout kept', ss.disabled && ss.busy === 'true' && ss.label === 'Sending your enquiry…' && ss.spinner && ss.status.includes('Sending') && submittingMetrics.button.h === before.button.h && submittingMetrics.button.w === before.button.w && submittingMetrics.wrap.h === before.wrap.h , {ss, b: before.button, a: submittingMetrics.button});
 const se = await waitFor(s => s.state === 'error', 20000);
 check(tag + ' backend error: form kept, concise message, focus moved', se.form && se.feedbackError && se.feedback === 'We couldn’t send your message right now. Please try again or email enquiry@innooryze.com.' && se.active.includes('form-feedback') && !se.token, se);
 await shot(tag + '-4-error');
 // success on retry
 scenario = {};
 const beforeSuccess = await metrics();
 await clickSubmit();
 const sok = await waitFor(s => s.success, 20000);
 await sleep(900);
 const after = await metrics();
 const sfinal = await state();
 await shot(tag + '-5-success');
 const twoCol = w > 760;
 check(tag + ' success: form replaced by thank-you with confirmation', !sfinal.form && sfinal.success && sfinal.note && /THANK YOU\. Your message is with us\. We’ll review your enquiry and get back to you shortly\. A confirmation will be sent to your email shortly\./.test(sfinal.successText), sfinal);
 check(tag + ' success: left side identical', JSON.stringify(after.intro) === JSON.stringify(idle.intro) && after.introHtml === idle.introHtml, {idle: idle.intro, after: after.intro, sy: [idle.scrollY, after.scrollY]});
 if (twoCol) check(tag + ' success: section, frame and watermark do not move', JSON.stringify(after.watermark) === JSON.stringify(idle.watermark) && after.section.h === idle.section.h && after.wrap.y === idle.wrap.y && after.wrap.h === idle.wrap.h, {idleWrap: idle.wrap, afterWrap: after.wrap, beforeWrap: beforeSuccess.wrap, wm: [idle.watermark, after.watermark], sec: [idle.section.h, after.section.h]});
 check(tag + ' success: focus on the thank-you panel and panel in view', sfinal.active.includes('contact-success') && sfinal.successBox.top >= 0 && sfinal.successBox.bottom <= sfinal.successBox.vh, sfinal);
 check(tag + ' no horizontal overflow in any state', !idle.overflow && !vm1.overflow && !after.overflow && !submittingMetrics.overflow);
 check(tag + ' response iframes cleaned up, no history entries added', sfinal.frames === 0 && sfinal.history === s0.history, {frames: sfinal.frames, h0: s0.history, h1: sfinal.history});
 check(tag + ' no CSP violations', !sfinal.csp.length, sfinal.csp);
 results[tag] = {idle, after, ts: sfinal.ts};
 console.log(tag, 'done', fails.length ? fails.length + ' failures so far' : 'ok');
}

// ---------- 2. Focused scenarios at one desktop and one phone viewport ----------
async function submitted(sc, tag, {vp = [1440, 900, false]} = {}) {
 await viewport(...vp);
 scenario = {...sc};
 await open('https://innooryze.com/contact');
 await fill(tag); await sleep(3300);
 const n = received.length;
 await clickSubmit();
 const s = await waitFor(x => x.success || x.state === 'error', 30000);
 return {s, posts: received.slice(n)};
}
if (!ONLY.length || ONLY.includes('scenarios')) {
 // Loading appears immediately; the thank-you arrives from captured=true with no email sent yet.
 await viewport(1440, 900, false); scenario = {ackFails: true};
 await open('https://innooryze.com/contact'); await fill('async'); await sleep(3300);
 const mailsBefore = mails.length, nAsync = received.length;
 const clickedAt = Date.now();
 await clickSubmit();
 const immediate = await state();
 check('loading state appears immediately on click', immediate.state === 'submitting' && immediate.label === 'Sending your enquiry…' && immediate.spinner && immediate.disabled && immediate.status === 'Sending your enquiry…', immediate);
 const done = await waitFor(x => x.success || x.state === 'error', 30000);
 const elapsedMs = Date.now() - clickedAt;
 check('thank-you from captured=true, before any email is sent', done.success && done.note && mails.length === mailsBefore, {done, mailsBefore, mails: mails.length});
 const row = rows().at(-1);
 check('sheet row: server fields, both emails pending, LeadRyze blank', /^IR-\d{8}-[A-F0-9]{8}$/.test(row.submissionid) && row.createddate instanceof Date && row.submittedfrom === 'website_contact' && row.status === 'New' && row.internalemailstatus === 'pending' && row.ackemailstatus === 'pending' && row.leadryzeid === '', row);
 const rowsBefore = rows().length;
 // Drain the queue the way the one-minute trigger would: repeated runs, oldest rows first.
 let summary = {rows: 0}, runs = 0;
 for (let last; runs < 20 && (last = gas.processPendingContactEmails()).rows; runs++) summary.rows += last.rows;
 const after = rows().at(-1);
 check('worker afterwards: internal sent, failed acknowledgement isolated, no new row', after.internalemailstatus === 'sent' && after.ackemailstatus === 'failed' && after.leadryzeid === '' && rows().length === rowsBefore && summary.rows >= 1, {after, summary});
 results.asyncTiming = {clickToThankYouMs: elapsedMs};
 console.log('click → thank-you (local, simulated backend, Turnstile test key):', elapsedMs + 'ms');
 let r = {posts: received.slice(nAsync)};
 // the actual POST the browser sent
 const p = r.posts[0];
 check('POST is urlencoded with every mapped field', p && /application\/x-www-form-urlencoded/.test(p.contentType) && ['firstname','lastname','workemail','company','role','countryregion','whatcanwehelp','message','submittedfrom','referrer','utmsource','utmmedium','utmcampaign','utmcontent','utmterm','website','formstartedat','formsubmittedat','turnstiletoken','submissionnonce','parentorigin'].every(k => k in p.params), p);
 check('POST metadata: origin, nonce, token, start time from page availability', p.params.parentorigin === 'https://innooryze.com' && /^[a-f0-9]{36}$/.test(p.params.submissionnonce) && p.params.turnstiletoken === 'XXXX.DUMMY.TOKEN.XXXX' && Number(p.params.formsubmittedat) - Number(p.params.formstartedat) > 3000 && p.params.website === '', p.params);

 // endpoint unavailable (Google error page, no message)
 r = await submitted({unavailable: true, grace: 2500}, 'unavailable');
 check('endpoint unavailable: error shown, form kept', r.s.state === 'error' && r.s.form && r.s.feedback.startsWith('We couldn’t send your message'), r.s);

 // Turnstile verification refused by the server, then a clean retry with a new token
 r = await submitted({turnstile: 'fail'}, 'tsfail');
 check('server-side Turnstile failure: error, retry allowed', r.s.state === 'error' && !r.s.disabled, r.s);
 scenario = {};
 await clickSubmit();
 const retry = await waitFor(x => x.success, 20000);
 check('retry after Turnstile failure: reset + fresh execution, then captured', retry.success && retry.ts && retry.ts.reset >= 1 && retry.ts.execute >= 1, retry.ts);

 // Turnstile unavailable in the browser (test key that always fails)
 r = await submitted({sitekey: '2x00000000000000000000BB'}, 'tsblock');
 check('client-side Turnstile failure: error, no POST', r.s.state === 'error' && r.posts.length === 0, {s: r.s, posts: r.posts.length});

 // Double click: exactly one POST
 await viewport(1440, 900, false); scenario = {delay: 1200};
 await open('https://innooryze.com/contact'); await fill('double'); await sleep(3300);
 const n0 = received.length;
 await ev(`(()=>{const b=document.querySelector('.form-submit');b.click();b.click();b.click();document.querySelector('.contact-form').requestSubmit();return 1})()`);
 await waitFor(x => x.success, 20000);
 check('double click / repeated submit: one POST', received.length - n0 === 1, received.length - n0);

 // Apps Script redirect variant (POST 302 -> script.googleusercontent.com), CSP must allow it
 r = await submitted({redirect: true}, 'redirect');
 check('Apps Script redirect response: captured, no CSP violation', r.s.success && !r.s.csp.length, r.s);

 // A forged message from the page itself or a foreign frame never completes a submission
 await viewport(1440, 900, false); scenario = {delay: 2500};
 await open('https://innooryze.com/contact'); await fill('forged'); await sleep(3300);
 await clickSubmit(); await sleep(300);
 await ev(`(()=>{const f=document.querySelector('.contact-form');postMessage({type:'innooryze:contact-result',captured:true,submissionNonce:f.elements.namedItem('submissionnonce').value,acknowledgementEmailSent:true},'*');return 1})()`);
 await sleep(400);
 const forged = await state();
 check('forged same-window message with the right nonce is ignored', forged.state === 'submitting' && !forged.success, forged);
 const real = await waitFor(x => x.success, 20000);
 check('the genuine response still completes', real.success, real);

 // Visible Cloudflare challenge (test key forcing interaction): the widget appears in the form, can be solved
 await viewport(1440, 900, false); scenario = {sitekey: '3x00000000000000000000FF'};
 await open('https://innooryze.com/contact'); await fill('interactive'); await sleep(3300);
 await clickSubmit();
 let box = null;
 for (let i = 0; i < 60 && !box; i++) { await sleep(250); box = await ev(`(()=>{const c=document.querySelector('.form-turnstile');if(!c||!c.classList.contains('is-interactive'))return null;const b=c.getBoundingClientRect();return b.width>0&&b.height>40?{x:b.left,y:b.top,w:b.width,h:b.height}:null})()`); }
 if (box) { await ev(`document.querySelector('.form-turnstile').scrollIntoView({block:'center'}),1`); await sleep(500); box = await ev(`(()=>{const b=document.querySelector('.form-turnstile').getBoundingClientRect();return {x:b.left,y:b.top,w:b.width,h:b.height}})()`); await shot('interactive-challenge'); }
 check('interactive challenge is shown inside the form when Cloudflare requires it', !!box, box);
 if (box) {
  for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', {type, x: box.x + 30, y: box.y + box.h / 2, button: 'left', clickCount: 1});
  const solved = await waitFor(x => x.success || x.state === 'error', 25000);
  check('solving the challenge completes the submission', solved.success, solved);
 }

 // Analytics: with consent and the (stubbed) tag loaded, one contact_form_submit with no personal data
 await viewport(1440, 900, false); scenario = {};
 await open('https://innooryze.com/contact', {consent: 'accept'});
 await fill('ga'); await sleep(3300);
 await clickSubmit(); await waitFor(x => x.success, 20000); await sleep(300);
 const ga = await ev(`(()=>({loaded:!!window.__gtagLoaded,events:(window.dataLayer||[]).map(a=>Array.from(a)).filter(a=>a[0]==='event')}))()`);
 check('GA: consented tag receives contact_form_submit with only area and form id', ga.loaded && ga.events.length === 1 && ga.events[0][1] === 'contact_form_submit' && JSON.stringify(Object.keys(ga.events[0][2]).sort()) === '["enquiry_area","form_id"]' && !JSON.stringify(ga.events).includes('@'), ga);
 await open('https://innooryze.com/contact', {consent: 'reject'});
 await fill('noga'); await sleep(3300);
 const gaCalls = network.length;
 await clickSubmit(); await waitFor(x => x.success, 20000); await sleep(300);
 const noga = await ev(`(()=>({loaded:!!window.__gtagLoaded,events:(window.dataLayer||[]).filter(a=>a[0]==='event').length}))()`);
 check('GA: without consent nothing loads and no event is queued', !noga.loaded && noga.events === 0 && !network.slice(gaCalls).some(n => /googletagmanager|google-analytics/.test(n.url)), noga);

 // Turnstile is not requested until the visitor interacts with the form
 await viewport(1440, 900, false); scenario = {};
 const n1 = network.length;
 await open('https://innooryze.com/contact'); await sleep(800);
 const early = network.slice(n1).filter(n => n.url.includes('challenges.cloudflare.com')).length;
 await ev(`document.getElementById('firstName').focus(),1`); await sleep(1500);
 const later = network.slice(n1).filter(n => n.url.includes('challenges.cloudflare.com')).length;
 check('Turnstile loads on first interaction, not on page view', early === 0 && later > 0, {early, later});
 const hiddenWidget = await ev(`(()=>{const c=document.querySelector('.form-turnstile');return {h:c.getBoundingClientRect().height,interactive:c.classList.contains('is-interactive')}})()`);
 check('idle Turnstile widget takes no space', hiddenWidget.h === 0 && !hiddenWidget.interactive, hiddenWidget);

 // Keyboard order and honeypot
 const order = await ev(`(async()=>{const seen=[];document.getElementById('firstName').focus();for(let i=0;i<11;i++){seen.push(document.activeElement.id||document.activeElement.className||document.activeElement.tagName);const all=[...document.querySelectorAll('a[href],button:not([disabled]),input:not([type=hidden]),select,textarea,[tabindex]')].filter(e=>e.tabIndex>=0&&e.offsetParent!==null&&!e.closest('[inert]'));const i2=all.indexOf(document.activeElement);all[i2+1]?.focus();}return seen})()`);
 check('keyboard order follows the form; honeypot and iframe are skipped', order.slice(0, 9).join(',') === 'firstName,lastName,email,company,role,country,interest,message,button button-cyan form-submit' && !order.includes('website') && !order.some(x => /contact-submit-target/.test(x)), order);
 const ax = await ev(`(()=>{const w=document.getElementById('website');const trap=w.closest('.form-trap');const r=trap.getBoundingClientRect();const fr=document.querySelector('iframe[name=contact-submit-target]');const fb=fr.getBoundingClientRect();return {trapHidden:trap.getAttribute('aria-hidden'),tab:w.tabIndex,visible:r.width>1||r.height>1,display:getComputedStyle(trap).display,frameHidden:fr.getAttribute('aria-hidden'),frameTab:fr.tabIndex,frameBox:[fb.width,fb.height],required:[...document.querySelectorAll('.contact-form [required]')].length}})()`);
 check('honeypot hidden from AT, unfocusable, off-screen (not display:none); iframe hidden', ax.trapHidden === 'true' && ax.tab === -1 && !ax.visible && ax.display !== 'none' && ax.frameHidden === 'true' && ax.frameTab === -1 && ax.frameBox[0] <= 1 && ax.required === 7, ax);

 // Accessible name/description of the success panel (Chrome's accessibility tree)
 await viewport(1440, 900, false); scenario = {};
 await open('https://innooryze.com/contact'); await fill('ax'); await sleep(3300); await clickSubmit(); const axs = await waitFor(x => x.success, 20000);
 check('ax scenario reached success', axs.success, axs);
 await send('Accessibility.enable');
 const doc = await send('DOM.getDocument', {depth: -1});
 const {nodeId} = await send('DOM.querySelector', {nodeId: doc.root.nodeId, selector: '.contact-success'});
 const tree = nodeId ? await send('Accessibility.getPartialAXTree', {nodeId, fetchRelatives: false}) : {nodes: [{}]};
 const node = tree.nodes[0];
 const name = node.name?.value, desc = node.description?.value;
 check('success panel announces its heading and message on focus', name === 'THANK YOU. Your message is with us.' && /We’ll review your enquiry/.test(desc) && /confirmation will be sent to your email shortly/.test(desc), {name, desc});

 // Reduced motion: no entrance animation
 await send('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: 'reduce'}]});
 await open('https://innooryze.com/contact'); await fill('rm'); await sleep(3300); await clickSubmit(); await waitFor(x => x.success, 20000);
 const anim = await ev(`(()=>{const e=document.querySelector('.contact-success-inner');return e?getComputedStyle(e).animationName:'no-success'})()`);
 check('reduced motion: thank-you appears without animation', anim === 'none', anim);
 await send('Emulation.setEmulatedMedia', {features: []});

 // Attribution: land on another page with UTM, then visit Contact
 await viewport(1440, 900, false); scenario = {};
 await send('Page.navigate', {url: 'about:blank'}); await sleep(100);
 await send('Storage.clearDataForOrigin', {origin: 'https://innooryze.com', storageTypes: 'all'});
 await send('Page.navigate', {url: 'https://innooryze.com/ai-agents?utm_source=linkedin&utm_medium=social&utm_campaign=phase4qa&utm_content=post&utm_term=agents', referrer: 'https://www.linkedin.com/feed/?trk=abc'});
 await sleep(1800);
 await ev(`location.href='/contact',1`); await sleep(2500);
 await ev(`(()=>{const b=document.querySelector('[data-consent="reject"]');if(b)b.click();return 1})()`);
 await fill('attribution'); await sleep(3300);
 const na = received.length; await clickSubmit(); await waitFor(x => x.success, 20000);
 const ap = received[na]?.params || {};
 const arow = rows().at(-1);
 check('first-touch attribution travels from the landing page to the Sheet row', ap.utmsource === 'linkedin' && ap.utmterm === 'agents' && ap.referrer === 'https://www.linkedin.com/' && arow.utmcampaign === 'phase4qa' && arow.referrer === 'https://www.linkedin.com/', {ap, arow});
}

// ---------- 3. Preview host: real server on 127.0.0.1, no real submission ----------
const previewUp = await fetch('http://127.0.0.1:4173/contact').then(r => r.ok, () => false);
if (!previewUp) console.log('skip preview-host check: start npm run preview to include it');
if (previewUp && (!ONLY.length || ONLY.includes('preview'))) {
 await viewport(1440, 900, false);
 const n = network.length;
 await send('Page.navigate', {url: 'http://127.0.0.1:4173/contact'}); await sleep(2500);
 await ev(`(()=>{const b=document.querySelector('[data-consent="reject"]');if(b)b.click();return 1})()`);
 await fill('preview'); await sleep(500); await clickSubmit(); await sleep(600);
 const pv = await state();
 const external = network.slice(n).filter(x => /script\.google|challenges\.cloudflare/.test(x.url));
 check('preview host: development-only message, nothing sent, Turnstile not loaded', pv.form && pv.state === 'idle' && pv.feedback.startsWith('Development preview') && external.length === 0, {pv, external});
 await shot('preview');
}

console.log(JSON.stringify({rows: rows().length, mails: mails.length, verifications: verifications.length, consoleErrors: [...new Set(consoleErrors)].slice(0, 20)}, null, 1));
console.log(fails.length ? 'FAILURES:\n' + fails.join('\n') : 'ALL CHECKS PASSED');
fs.writeFileSync(HERE + '/contact-qa.json', JSON.stringify({results, fails, consoleErrors}, null, 1));
ws.close(); chrome.kill();
process.exit(fails.length ? 1 : 0);
