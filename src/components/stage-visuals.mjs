import {editorial,editorialImage} from '../media.mjs';
const cafe={src:'asset:film-digital-connection-poster.jpg',alt:'A visitor using a phone in a café'};
const immersive={name:'immersive-projection',alt:'Visitors discovering a vivid interactive digital installation'};
const product={name:'product-in-use',alt:'A person exploring an immersive digital product'};
const portrait={name:'human-screen-portrait',alt:'A person concentrating on a digital interaction through glass'};
const craft={name:'design-prototype-collaboration',alt:'A team reviewing ideas and physical prototypes together'};
const optical={name:'optical-patterns',alt:'Visible patterns across an illuminated measuring instrument'};
// MarTech and Experience stages own their photography (1600x2000, 4:5). The asset tokens stay unchanged, so each
// placement still resolves to its own page-owned file; alt text and focal point describe the actual picture.
const stage45={width:1600,height:2000};
const martechPhotos=[
 {name:'human-screen-portrait',alt:'An adviser and a client talking beside a laptop showing a customer record',focus:'50% 65%',...stage45},
 {src:'asset:film-digital-connection-poster.jpg',alt:'A follow-up message arriving on a phone beside a laptop showing a campaign draft',focus:'55% 65%',...stage45},
 {name:'digital-mobile',alt:'A visitor comparing a store display screen with the same campaign on her phone',focus:'50% 70%',...stage45},
 {name:'immersive-projection',alt:'People crossing a lit city plaza at dusk, seen from above',focus:'50% 60%',...stage45},
 {name:'design-prototype-collaboration',alt:'A team reviewing a shared performance dashboard on a large screen',focus:'45% 65%',...stage45},
 {name:'optical-patterns',alt:'A customer collecting an order at a store counter, showing a confirmation on her phone',focus:'50% 75%',...stage45}
];
const experiencePhotos=[
 {name:'immersive-projection',alt:'A visitor looking up inside a suspended light installation',...stage45},
 {name:'product-in-use',alt:'Visitors exploring a large illuminated digital sphere, one wearing a headset',...stage45},
 {name:'human-screen-portrait',alt:'A visitor touching an interactive wall screen to follow a story',...stage45},
 {src:'asset:film-digital-connection-poster.jpg',alt:'A guest completing a booking at a reception desk using her phone',...stage45},
 {name:'digital-mobile',alt:'A returning guest greeted by name at a hotel reception desk',...stage45}
];
const photos={agents:[portrait,craft,{name:'automation-laboratory',alt:'Precision automation equipment in a laboratory'},editorial.agents,optical],experience:experiencePhotos,martech:martechPhotos,data:[immersive,portrait,optical,craft,cafe,product]};
const screens={
 agents:[
  ['UNDERSTAND / COMPANY KNOWLEDGE','Start with the right context.','A business request is matched with approved knowledge.',['Request → Relevant sources','Permissions → Available context']],
  ['REASON / WORKFLOW','A plan before an action.','Identify the useful next step and the limits around it.',['Evidence → Proposed action','Uncertainty → Human handoff']],
  ['ACT / CONNECTED TOOLS','Move useful work forward.','An approved connection turns the plan into a task.',['CRM · APIs · Internal systems','Action boundaries stay in place']],
  ['HUMAN CONTROL / REVIEW','The decision stays with people.','Show the context, proposed action and exceptions clearly.',['Review → Approve or revise','Human checkpoints stay visible']],
  ['IMPROVE / FEEDBACK','Learn from the work.','Review usefulness, exceptions and the next improvement.',['Outcome → Evaluation','Feedback → Refined workflow']]
 ],
 experience:[
  ['DISCOVER / CAMPAIGN','A relevant idea.','Find the experience that fits your ambition.',['Search → Relevant result','Campaign → Landing page']],
  ['EXPLORE / DIGITAL PRODUCT','Find your fit.','A clear product story, on the device in your hand.',['Explore the experience','Compare useful options']],
  ['ENGAGE / CONVERSATION','A conversation with context.','“Can you help me understand the right option?”',['Understand the need','Continue from this moment']],
  ['CONVERT / ENQUIRY','Your next step is ready.','Discovery conversation · Meeting request prepared.',['Contact details captured','Context sent to your team']],
  ['RETURN / CUSTOMER PORTAL','Welcome back.','Pick up where you left off, with the right support.',['Your saved preferences','A relevant follow-up']]
 ],
 martech:[
  ['CRM / CUSTOMER CONTEXT','A shared starting point.','One customer record, with clear ownership.',['Profile & relationship','Sales team context']],
  ['MARKETING AUTOMATION','A relevant follow-up.','The relationship informs the next lifecycle moment.',['Interest captured → Journey','Draft message → Review']],
  ['CMS / DIGITAL EXPERIENCE','The right content.','A coherent experience across your site and campaigns.',['Customer need → Content','Content → Digital touchpoint']],
  ['CDP / CUSTOMER CONTEXT','One connected customer.','Identifiers and consent connect the signals.',['Profile + Behavior + Permission','Audience ready for activation']],
  ['ANALYTICS / SHARED VIEW','A common measure of progress.','Campaigns, journeys and teams share the same definitions.',['Experience → Response','Response → Understanding']],
  ['CHANNELS / ORCHESTRATION','One connected journey.','Each system plays its part in a useful customer experience.',['CRM → Campaign → Experience','Customer data → Measurement']]
 ],
 data:[
  ['SIGNALS / TOUCHPOINTS','Many moments.','Website visits, product interest and service interactions.',['Web · Mobile · CRM','Consent and context attached']],
  ['UNIFIED CUSTOMER','One person. Connected context.','A reliable profile brings the right signals together.',['Identity + Permissions','Interactions + Relationship']],
  ['UNDERSTANDING','A pattern becomes visible.','Customer behavior gains meaning in its business context.',['Interest → Intent','Friction → Opportunity']],
  ['AUDIENCE / SEGMENTATION','A relevant group.','Translate understanding into an audience with a purpose.',['Lifecycle stage · Product interest','Eligibility and consent checked']],
  ['ACTION / ACTIVATION','Context becomes an experience.','A relevant message or action reaches the right system.',['Audience → CRM / Campaign','Personalization → Touchpoint']],
  ['MEASUREMENT / LEARNING','Close the learning loop.','Connect the response back to the question you started with.',['Action → Response → Insight','Insight → Improved next action']]
 ]
};
export function stageVisuals(kind){if(!photos[kind])return null;return photos[kind].map((photo,i)=>{const [label,title,body,lines]=screens[kind][i];let img=editorialImage(photo,{classes:'stage-photography'});if(i>0)img=img.replace(' src=',' data-src=').replace(' srcset=',' data-srcset=');return `<div class="stage-visual${i===0?' is-active':''}" data-stage-visual="${i}" aria-hidden="${i!==0}">${img}<div class="stage-interface stage-interface-${kind}"><span class="stage-interface-label">${label}</span><strong>${title}</strong><p>${body}</p><div class="stage-interface-lines">${lines.map(line=>`<span>${line}</span>`).join('')}</div>${/* The connected-systems progression lives once in the journey's connected-tools row. */''}${kind==='data'?`<div class="stage-data-path" aria-hidden="true">${['Signal','Profile','Insight','Audience','Action','Learn'].map((n,j)=>`<span class="${j===i?'current':j<i?'complete':''}">${n}</span>`).join('')}</div>`:''}</div></div>`;}).join('');}
