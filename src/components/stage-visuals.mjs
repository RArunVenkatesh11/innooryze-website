import {editorialImage} from '../media.mjs';
// One image-story treatment for every journey: the photograph stays dominant and carries a small label,
// up to two micro-flow chips and one statement. The detailed explanation lives in the right-hand panel,
// so a stage never states the same sentence twice. Focal points are semantic per stage (no nth-child CSS).
const stage45={width:1600,height:2000};
const stages={
 experience:[
  {label:'DISCOVER / 01',statement:'A relevant moment starts here.',flow:['Search → Relevant result','Campaign → Landing page'],
   photo:{name:'immersive-projection',alt:'A visitor looking up inside a suspended light installation',...stage45}},
  {label:'EXPLORE / 02',statement:'See what fits.',flow:['Explore the experience','Compare useful options'],
   photo:{name:'product-in-use',alt:'Visitors exploring a large illuminated digital sphere, one wearing a headset',...stage45}},
  {label:'ENGAGE / 03',statement:'Context carries forward.',flow:['Understand the need','Continue from this moment'],
   photo:{name:'human-screen-portrait',alt:'A visitor touching an interactive wall screen to follow a story',focus:'50% 25%',...stage45}},
  {label:'CONVERT / 04',statement:'Ready when they are.',flow:['Contact captured','Context sent to your team'],
   photo:{src:'asset:film-digital-connection-poster.jpg',alt:'A guest completing a booking at a reception desk using her phone',focus:'65% center',...stage45}},
  {label:'RETURN / 05',statement:'Pick up where you left off.',flow:['Saved preferences','Relevant follow-up'],
   photo:{name:'digital-mobile',alt:'A returning guest greeted by name at a hotel reception desk',...stage45}}
 ],
 martech:[
  {label:'CRM / 01',statement:'One customer. Shared context.',flow:['Profile + relationship','Clear ownership'],
   photo:{name:'human-screen-portrait',alt:'An adviser and a client talking beside a laptop showing a customer record',focus:'50% 65%',...stage45}},
  {label:'MARKETING AUTOMATION / 02',statement:'Interest becomes a next step.',flow:['Interest → Journey','Draft → Review'],
   photo:{src:'asset:film-digital-connection-poster.jpg',alt:'A follow-up message arriving on a phone beside a laptop showing a campaign draft',focus:'55% 65%',...stage45}},
  {label:'CMS / 03',statement:'Context shapes content.',flow:['Need → Content','Content → Touchpoint'],
   photo:{name:'digital-mobile',alt:'A visitor comparing a store display screen with the same campaign on her phone',focus:'50% 70%',...stage45}},
  {label:'CDP / 04',statement:'Signals connect around the customer.',flow:['Identity + Permission','Behavior + Relationship'],
   photo:{name:'immersive-projection',alt:'People crossing a lit city plaza at dusk, seen from above',focus:'50% 60%',...stage45}},
  {label:'ANALYTICS / 05',statement:'One definition of progress.',flow:['Experience → Response','Response → Understanding'],
   photo:{name:'design-prototype-collaboration',alt:'A team reviewing a shared performance dashboard on a large screen',focus:'45% 65%',...stage45}},
  {label:'CHANNELS / 06',statement:'Systems coordinate the journey.',flow:['CRM → Campaign → Experience','Data → Measurement'],
   photo:{name:'optical-patterns',alt:'A customer collecting an order at a store counter, showing a confirmation on her phone',focus:'50% 75%',...stage45}}
 ],
 data:[
  {label:'SIGNALS / 01',statement:'Start with what happened.',flow:['Web · Mobile · CRM','Consent + Context'],
   photo:{name:'immersive-projection',alt:'Visitors discovering a vivid interactive digital installation'}},
  {label:'UNIFIED CUSTOMER / 02',statement:'Bring the right signals together.',flow:['Identity + Permissions','Interactions + Relationship'],
   photo:{name:'human-screen-portrait',alt:'A person concentrating on a digital interaction through glass',focus:'50% 25%'}},
  {label:'UNDERSTANDING / 03',statement:'Turn behavior into meaning.',flow:['Interest → Intent','Friction → Opportunity'],
   photo:{name:'optical-patterns',alt:'Visible patterns across an illuminated measuring instrument',focus:'65% center'}},
  {label:'AUDIENCE / 04',statement:'Make the insight usable.',flow:['Lifecycle + Interest','Eligibility + Consent'],
   photo:{name:'design-prototype-collaboration',alt:'A team reviewing ideas and physical prototypes together'}},
  {label:'ACTION / 05',statement:'Put context into the experience.',flow:['Audience → CRM / Campaign','Personalization → Touchpoint'],
   photo:{src:'asset:film-digital-connection-poster.jpg',alt:'A visitor using a phone in a café'}},
  {label:'MEASUREMENT / 06',statement:'Learn from what happened next.',flow:['Action → Response → Insight','Insight → Better next action'],
   photo:{name:'product-in-use',alt:'A person exploring an immersive digital product'}}
 ],
 agents:[
  {label:'UNDERSTAND / 01',statement:'Start with the right context.',flow:['Request → Relevant sources','Permissions → Available context'],
   photo:{name:'human-screen-portrait',alt:'A person concentrating on a digital interaction through glass'}},
  {label:'REASON / 02',statement:'Plan before acting.',flow:['Evidence → Proposed action','Uncertainty → Human handoff'],
   photo:{name:'design-prototype-collaboration',alt:'A team reviewing ideas and physical prototypes together'}},
  {label:'ACT / 03',statement:'Move useful work forward.',flow:['CRM · APIs · Internal systems','Boundaries stay in place'],
   photo:{name:'automation-laboratory',alt:'Precision automation equipment in a laboratory',focus:'60% center'}},
  {label:'HUMAN CONTROL / 04',statement:'People stay at critical decisions.',flow:['Review → Approve or revise','Human checkpoints visible'],
   photo:{src:'asset:film-human-machine-poster.webp',alt:'Researchers controlling a collaborative robotic arm together'}},
  {label:'OUTCOME / 05',statement:'Learn from what happened.',flow:['Outcome → Evaluation','Feedback → Refined workflow'],
   photo:{name:'optical-patterns',alt:'Visible patterns across an illuminated measuring instrument'}}
 ]
};
// Shared markup for every journey image and for the Growth Systems overview panels.
export function stageStory(label,statement,flow,{sequence=false}={}){
 return `<div class="stage-story"><span class="stage-story-label">${label}</span><div class="stage-story-body"><ul class="stage-story-flow${sequence?' stage-story-sequence':''}">${flow.map(item=>`<li>${item}</li>`).join('')}</ul><p class="stage-story-statement">${statement}</p></div></div>`;
}
export function stageVisuals(kind){if(!stages[kind])return null;return stages[kind].map(({label,statement,flow,photo},i)=>{
 let img=editorialImage(photo,{classes:'stage-photography'});
 if(i>0)img=img.replace(' src=',' data-src=').replace(' srcset=',' data-srcset=');
 return `<div class="stage-visual${i===0?' is-active':''}" data-stage-visual="${i}" aria-hidden="${i!==0}">${img}${stageStory(label,statement,flow)}</div>`;
}).join('');}
