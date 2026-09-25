import test from 'node:test';import assert from 'node:assert/strict';
import {parseConsent,analyticsPermitted,consentSignals,googleCookieNames} from '../public/consent.js';
import {analytics,analyticsCsp} from '../src/config/analytics.mjs';

const stored=value=>JSON.stringify({version:1,updated:'2026-09-25T00:00:00.000Z',...value});

test('only a complete, current record counts as a recorded choice',()=>{
 assert.equal(parseConsent(null,1),null);
 assert.equal(parseConsent('',1),null);
 assert.equal(parseConsent('not json',1),null);
 assert.equal(parseConsent('[]',1),null);
 // a choice made against an older set of categories is not a choice about the current one
 assert.equal(parseConsent(stored({analytics:true}),2),null);
 assert.deepEqual(parseConsent(stored({analytics:true,marketing:false}),1),{version:1,analytics:true,marketing:false,updated:'2026-09-25T00:00:00.000Z'});
 // anything that is not exactly true is a refusal
 assert.equal(parseConsent(stored({analytics:'yes'}),1).analytics,false);
});

test('analytics needs consent and the production hostname together',()=>{
 const hosts=analytics.measuredHosts;
 const granted=parseConsent(stored({analytics:true}),1),refused=parseConsent(stored({analytics:false}),1);
 for(const hostname of hosts)assert.equal(analyticsPermitted({consent:granted,hostname,measuredHosts:hosts}),true,hostname);
 for(const hostname of hosts)assert.equal(analyticsPermitted({consent:refused,hostname,measuredHosts:hosts}),false,hostname);
 assert.equal(analyticsPermitted({consent:null,hostname:'innooryze.com',measuredHosts:hosts}),false);
 // local development and every preview origin are excluded because they are not on the allowlist
 for(const hostname of ['localhost','127.0.0.1','innooryze-website.vercel.app','innooryze.com.example.net','staging.innooryze.com'])
  assert.equal(analyticsPermitted({consent:granted,hostname,measuredHosts:hosts}),false,hostname);
 // the documented override is the only way past that, and it still requires consent
 assert.equal(analyticsPermitted({consent:granted,hostname:'localhost',measuredHosts:hosts,debug:true}),true);
 assert.equal(analyticsPermitted({consent:refused,hostname:'localhost',measuredHosts:hosts,debug:true}),false);
});

test('consent mode signals stay denied unless the matching category is granted',()=>{
 assert.deepEqual(consentSignals({analytics:false,marketing:false}),
  {ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
 assert.deepEqual(consentSignals({analytics:true,marketing:false}),
  {ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
 assert.deepEqual(consentSignals({analytics:false,marketing:true}),
  {ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'denied'});
});

test('withdrawal targets the Google cookies and nothing else',()=>{
 assert.deepEqual(googleCookieNames('_ga=1; _ga_ABC=2; _gid=3; _gat_gtag=4; session=keep; _gasp=5'),
  ['_ga','_ga_ABC','_gid','_gat_gtag','_gasp']);
 assert.deepEqual(googleCookieNames('session=keep; theme=dark'),[]);
 assert.deepEqual(googleCookieNames(''),[]);
});

test('the measurement configuration is the migrated one, with Tag Manager still deferred',()=>{
 assert.equal(analytics.googleTagId,'GT-WF4XRBSQ');
 assert.equal(analytics.gtmContainerId,'GTM-NJPT6DRQ');
 assert.equal(analytics.gtmEnabled,false,'Tag Manager must stay off until its container has been audited');
 assert.equal(analytics.searchConsoleVerification,'qkNhV7wi86Q1l1yc0BqXJAr7BFhrJmIETs-S7TZteeM');
 assert.deepEqual(analytics.measuredHosts,['innooryze.com','www.innooryze.com']);
 for(const list of Object.values(analyticsCsp))for(const origin of list)assert.match(origin,/^https:\/\//);
});
