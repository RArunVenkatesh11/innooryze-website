// Consent gate for the Google tag.
//
// The tag is requested from exactly one place: loadGoogleTag() below. Nothing else in the site references
// googletagmanager.com, so "no analytics before consent" is enforced by the script element simply not
// existing, rather than by a flag a third-party script could choose to ignore.
//
// Two conditions must both hold before the tag loads: the visitor has granted analytics consent, and the
// page is served from the production property. The hostname rule is an allowlist, so local development,
// the preview deployment and any branch deploy are excluded by omission.

const ALL_DENIED={ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'};

// --- pure helpers (unit tested) --------------------------------------------------------------------

export function parseConsent(raw,version){
 if(typeof raw!=='string'||!raw)return null;
 let stored;try{stored=JSON.parse(raw);}catch{return null;}
 if(!stored||typeof stored!=='object'||Array.isArray(stored))return null;
 // A choice recorded against an older set of categories is not a choice about the current one, so re-ask.
 if(stored.version!==version)return null;
 return {version,analytics:stored.analytics===true,marketing:stored.marketing===true,updated:typeof stored.updated==='string'?stored.updated:''};
}

export function analyticsPermitted({consent,hostname,measuredHosts,debug=false}){
 if(!consent||consent.analytics!==true)return false;
 return debug===true||measuredHosts.includes(hostname);
}

export function consentSignals({analytics,marketing}){
 return {...ALL_DENIED,
  analytics_storage:analytics?'granted':'denied',
  ad_storage:marketing?'granted':'denied',
  ad_user_data:marketing?'granted':'denied',
  ad_personalization:marketing?'granted':'denied'};
}

export function googleCookieNames(cookieString){
 return [...new Set(String(cookieString||'').split(';').map(part=>part.split('=')[0].trim()).filter(name=>/^_(ga|gid|gat)/.test(name)))];
}

// --- storage ----------------------------------------------------------------------------------------
// Storage can be unavailable (private browsing, blocked site data). The choice then lives in memory for
// this page only: the visitor is asked again next time and analytics stays off until they opt in again.

let memory=null;
const readStore=key=>{try{return localStorage.getItem(key);}catch{return null;}};
const writeStore=(key,value)=>{try{localStorage.setItem(key,value);return true;}catch{return false;}};

// --- the Google tag ---------------------------------------------------------------------------------

let tagRequested=false;

function ensureGtag(){
 window.dataLayer=window.dataLayer||[];
 // gtag.js reads the arguments object itself, so this cannot be rewritten with rest parameters.
 if(typeof window.gtag!=='function')window.gtag=function(){window.dataLayer.push(arguments);};
 return window.gtag;
}

function loadGoogleTag(id){
 if(tagRequested)return;
 tagRequested=true;
 const gtag=ensureGtag();
 const script=document.createElement('script');
 script.async=true;
 script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);
 document.head.append(script);
 gtag('js',new Date());
 gtag('config',id);
}

function clearGoogleCookies(){
 const names=googleCookieNames(document.cookie);
 if(!names.length)return;
 const parts=location.hostname.split('.');
 const scopes=[''];
 for(let i=0;i<parts.length-1;i++)scopes.push('; domain=.'+parts.slice(i).join('.'));
 for(const name of names)for(const scope of scopes)for(const path of ['/',location.pathname])
  document.cookie=name+'=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path='+path+scope;
}

// --- UI ---------------------------------------------------------------------------------------------

export function initConsent(config){
 const bar=document.getElementById('consent-bar');
 const dialog=document.getElementById('consent-dialog');
 if(!bar||!dialog||!config)return;

 const {googleTagId,measuredHosts,consentVersion,storageKey,debugKey}=config;

 // A device-level override for verifying the tag away from the production hostname. It is opt-in, sends
 // real traffic, and the site never sets it on its own. See docs/ANALYTICS.md.
 if(new URLSearchParams(location.search).get('analytics-debug')==='1')writeStore(debugKey,'1');
 const debug=readStore(debugKey)==='1';

 // Denied-by-default is declared before anything can read the data layer, so a tag loaded later starts
 // from "no storage" instead of inheriting a permissive default.
 const gtag=ensureGtag();
 gtag('consent','default',{...ALL_DENIED,functionality_storage:'granted',security_storage:'granted',wait_for_update:500});

 let consent=parseConsent(memory??readStore(storageKey),consentVersion);

 const analyticsToggle=dialog.querySelector('#consent-analytics');
 const marketingToggle=dialog.querySelector('#consent-marketing');
 let lastTrigger=null;

 function syncToggles(){
  if(analyticsToggle)analyticsToggle.checked=consent?.analytics===true;
  if(marketingToggle)marketingToggle.checked=consent?.marketing===true;
 }

 function activate(){
  gtag('consent','update',consentSignals(consent));
  if(analyticsPermitted({consent,hostname:location.hostname,measuredHosts,debug})){
   // Re-granting after a withdrawal in the same page has to lift the flag that withdrawal set, otherwise
   // the already-loaded tag would stay silently disabled until the next reload.
   window['ga-disable-'+googleTagId]=false;
   loadGoogleTag(googleTagId);
  }else{
   // Withdrawal: stop an already-initialised tag collecting, then remove the cookies it can still be
   // recognised through. Consent mode is the authoritative signal; ga-disable is the belt-and-braces flag.
   window['ga-disable-'+googleTagId]=true;
   clearGoogleCookies();
  }
  syncToggles();
 }

 function apply(next){
  const value={version:consentVersion,analytics:next.analytics===true,marketing:next.marketing===true,updated:new Date().toISOString()};
  memory=JSON.stringify(value);
  writeStore(storageKey,memory);
  consent=value;
  activate();
 }

 function showBar(show){
  bar.hidden=!show;
  if(show)requestAnimationFrame(()=>bar.classList.add('is-open'));
  else bar.classList.remove('is-open');
 }

 function openDialog(trigger){
  lastTrigger=trigger||document.activeElement;
  syncToggles();
  if(dialog.open)return;
  if(typeof dialog.showModal==='function')dialog.showModal();
  else dialog.setAttribute('open','');
 }
 function closeDialog(){
  if(typeof dialog.close==='function')dialog.close();
  else dialog.removeAttribute('open');
 }
 // Fires for the Escape key too, which closes a modal dialog without running any button handler.
 dialog.addEventListener('close',()=>{const target=lastTrigger;lastTrigger=null;if(target&&document.contains(target))target.focus();});

 function decide(choice,fromDialog){
  if(choice==='accept')apply({analytics:true,marketing:true});
  else if(choice==='reject')apply({analytics:false,marketing:false});
  else if(choice==='save')apply({analytics:!!analyticsToggle?.checked,marketing:!!marketingToggle?.checked});
  showBar(false);
  if(fromDialog)closeDialog();
 }

 bar.addEventListener('click',event=>{
  const button=event.target.closest('[data-consent]');
  if(!button)return;
  if(button.dataset.consent==='manage')openDialog(button);
  else decide(button.dataset.consent,false);
 });
 dialog.addEventListener('click',event=>{
  const button=event.target.closest('[data-consent]');
  if(!button)return;
  if(button.dataset.consent==='close')closeDialog();
  else decide(button.dataset.consent,true);
 });
 // The footer entry point, and any other element that opts in with data-consent-open.
 document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-consent-open]');
  if(!trigger)return;
  event.preventDefault();
  openDialog(trigger);
 });

 if(consent){
  // A recorded choice is re-applied silently, keeping its original timestamp.
  memory=JSON.stringify(consent);
  activate();
 }else showBar(true);
}
