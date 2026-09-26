import test from 'node:test';import assert from 'node:assert/strict';
import {policies,policyPaths} from '../src/content/policies.mjs';
import {policyPage,policySlug} from '../src/components/policy.mjs';

// These pages carry approved legal wording transferred from the live InnooRyze site. The tests are a
// tripwire: they cannot judge legal meaning, but they will fail loudly if a future edit drops sections,
// empties a clause, changes a published date or breaks the contents anchors.

const byKey = key => policies.find(p => p.key === key);

test('both approved policies are published at their approved routes',()=>{
 assert.deepEqual(policies.map(p=>p.key),['privacy','terms']);
 assert.equal(policyPaths.privacy,'/privacy-policy');
 assert.equal(policyPaths.terms,'/terms-and-conditions');
 // No cookie policy has been approved, so nothing may publish at that path.
 assert.equal(policies.some(p=>p.key==='cookies'),false);
});

test('the dates shown are the ones on the approved source',()=>{
 // Both keep their original effective date. The Privacy Policy was revised on 26 September 2026 (A-2);
 // the Terms & Conditions were not.
 const expected={privacy:['26 September 2026','2026-09-26'],terms:['20 March 2026','2026-03-20']};
 for(const p of policies){
  assert.equal(p.effective,'28 April 2025',p.key);
  assert.equal(p.effectiveIso,'2025-04-28',p.key);
  assert.equal(p.updated,expected[p.key][0],p.key);
  assert.equal(p.approvedOn,expected[p.key][1],p.key);
 }
});

test('the Privacy Policy describes the live website enquiry stack',()=>{
 const flat=JSON.stringify(byKey('privacy').sections);
 for(const required of ['Google Sheets','Google Apps Script','Cloudflare Turnstile','Microsoft 365','Microsoft Graph','Google Analytics','UTM','referrer','Local storage','Session storage'])
  assert.ok(flat.includes(required),'missing disclosure: '+required);
 assert.ok(!/24 months/.test(flat),'no unenforced fixed retention period');
 assert.match(flat,/not currently sent to Supabase, Zoho CRM or LeadRyze CRM/);
 assert.ok(!/vercel/i.test(flat),'hosting stays provider-neutral');
});

test('the Privacy Policy describes the live IMMA processing',()=>{
 const flat=JSON.stringify(byKey('privacy').sections);
 for(const required of ['one-time verification code','infrastructure controlled by InnooRyze','Zoho Bookings','session storage','local storage','overall score, maturity level, category-wise results, recommendations and roadmap','not automatically send your assessment answers or results to Zoho Bookings'])
  assert.ok(flat.includes(required),'missing IMMA disclosure: '+required);
 // Neither is part of the current IMMA architecture, so neither may be named as an IMMA provider.
 assert.ok(!/replit/i.test(flat),'Replit is not an IMMA provider');
 assert.ok(!/Supabase(?!, Zoho CRM or LeadRyze CRM)/.test(flat),'Supabase appears only in the contact-form statement');
});

test('every section survives with a heading and content',()=>{
 assert.equal(byKey('privacy').sections.length,15);
 assert.equal(byKey('terms').sections.length,15);
 for(const p of policies){
  p.sections.forEach((s,i)=>{
   assert.ok(s.heading?.trim(),`${p.key} section ${i} heading`);
   assert.ok(s.blocks?.length,`${p.key} "${s.heading}" has no content`);
   // numbering is part of the legal structure, so it must stay and stay in order
   assert.equal(s.heading.split('.')[0],String(i+1),`${p.key} section ${i+1} numbering`);
   for(const [type,value] of s.blocks){
    assert.ok(['p','h3','ul','lines'].includes(type),`${p.key} unknown block ${type}`);
    if(type==='ul'||type==='lines'){assert.ok(Array.isArray(value)&&value.length,`${p.key} empty ${type}`);
     value.forEach(v=>assert.ok(String(v).trim(),`${p.key} empty item in ${type}`));}
    else assert.ok(String(value).trim(),`${p.key} empty ${type}`);
   }
  });
 }
});

test('the registered legal identity and contact address are carried through',()=>{
 for(const p of policies){
  const flat=JSON.stringify(p.sections);
  assert.match(flat,/INNOVATION MULTIVERSE TECHNOLOGY PRIVATE LIMITED/,p.key);
  assert.match(flat,/Coimbatore/,p.key);
  assert.match(flat,/enquiry@innooryze\.com/,p.key);
 }
});

test('contents anchors are unique and match the rendered section ids',()=>{
 for(const p of policies){
  const slugs=p.sections.map(s=>policySlug(s.heading));
  assert.equal(new Set(slugs).size,slugs.length,`${p.key} duplicate anchors`);
  const html=policyPage(p);
  for(const slug of slugs){
   assert.ok(html.includes(`<section id="${slug}">`),`${p.key} missing section ${slug}`);
   assert.ok(html.includes(`href="#${slug}"`),`${p.key} missing contents link ${slug}`);
  }
 }
});

test('rendered markup is a usable heading hierarchy with real lists',()=>{
 const html=policyPage(byKey('privacy'));
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.equal((html.match(/<h2\b/g)||[]).length,15);
 // the live page marks section headings up as h5; nothing below h3 should survive the transfer
 assert.equal((html.match(/<h[456]\b/g)||[]).length,0);
 assert.equal((html.match(/<li\b/g)||[]).length,91);
 // every list item sits inside a list
 assert.equal((html.match(/<\/ul>/g)||[]).length,(html.match(/<ul>/g)||[]).length);
 assert.ok(!/<li\b(?![\s\S]*?<\/ul>)/.test(html),'list item outside a list');
 assert.match(html,/<a href="mailto:enquiry@innooryze\.com">/);
});

test('approved text is escaped, never injected as markup',()=>{
 const html=policyPage(byKey('privacy'));
 assert.match(html,/IMMA ASSESSMENT &amp; AUTOMATED ANALYSIS/);
 const hostile={...byKey('terms'),sections:[{heading:'1. <img src=x onerror=alert(1)>',blocks:[['p','</p><script>alert(2)</script>']]}]};
 const out=policyPage(hostile);
 assert.ok(!out.includes('<script>'),'script tag survived escaping');
 assert.ok(!out.includes('<img src=x'),'img tag survived escaping');
});
