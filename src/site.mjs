import {policies,policyPaths} from './content/policies.mjs';
import {editorial} from './media.mjs';
import {resolveIndexable} from './config/environment.mjs';
export const site = {
  name: 'InnooRyze',
  // Registered entity, as published on the approved Privacy Policy and Terms & Conditions.
  legalName: 'INNOVATION MULTIVERSE TECHNOLOGY PRIVATE LIMITED',
  // Mirrors visible positioning (/about, Growth Systems, Experience, AI Agents). Keep in step with that copy.
  description: 'InnooRyze is a Growth Systems, MarTech and AI consulting and product company that designs and builds customer experiences, connected customer technology, AI agents and digital products.',
  // Service coverage, NOT office locations. Must match the visible statement on /about; validate.mjs checks.
  serviceRegions: [
   {type: 'Country', name: 'United States', label: 'US'},
   {type: 'Country', name: 'United Kingdom', label: 'UK'},
   {type: 'Place', name: 'Asia-Pacific (APAC)', label: 'APAC'},
   {type: 'Country', name: 'Singapore', label: 'Singapore'},
   {type: 'Country', name: 'Japan', label: 'Japan'},
   {type: 'Country', name: 'Malaysia', label: 'Malaysia'},
   {type: 'Country', name: 'India', label: 'India'}
  ],
  url: process.env.SITE_URL || 'https://innooryze.com',
  // Fail-safe: indexable only when the build can prove it is production. See src/config/environment.mjs.
  indexable: resolveIndexable(),
  email: 'enquiry@innooryze.com',
  // brand-logo.png is the approved trademark wordmark; brand-symbol.png is the approved standalone OO symbol.
  logo: '/assets/brand/brand-logo.png',
  logoSize: [3290,719],
  symbol: '/assets/brand/brand-symbol.png',
  // Rendered derivatives of the same approved artwork, sized for display (the masters above stay unchanged
  // and remain the Organization/social logo). The wordmark is shown at most 215px wide.
  logoDisplay: {src:'/assets/brand/brand-logo-494.png', srcset:'/assets/brand/brand-logo-247.png 1x, /assets/brand/brand-logo-494.png 2x, /assets/brand/brand-logo-741.png 3x', size:[494,108]},
  icon: '/assets/brand/brand-symbol-192.png',
  // Verified public contact details. Nothing here is inferred; there is no second office or phone number.
  contact: {
    street: '11/1, Krishnarayapuram, Thoatta Saalaigal, Chettipalayam',
    streetLines: ['11/1, Krishnarayapuram,','Thoatta Saalaigal,','Chettipalayam,'],
    locality: 'Coimbatore',
    region: 'Tamil Nadu',
    postalCode: '641201',
    country: 'India',
    countryCode: 'IN',
    phone: '+91 80156 20896',
    phoneUri: 'tel:+918015620896',
    shortLocation: 'Coimbatore, Tamil Nadu, India'
  },
  assessmentUrl: 'https://assessment.innooryze.com/',
  tagline: 'Innovate. Integrate. Elevate.',
  socials: {linkedin:process.env.SOCIAL_LINKEDIN_URL || 'https://in.linkedin.com/company/innooryze',x:process.env.SOCIAL_X_URL || 'https://x.com/innooryze',instagram:process.env.SOCIAL_INSTAGRAM_URL || 'https://www.instagram.com/innooryze'},
  policies: {privacy:process.env.PRIVACY_POLICY_URL || (policies.some(p=>p.key==='privacy')?policyPaths.privacy:''),cookies:process.env.COOKIE_POLICY_URL || (policies.some(p=>p.key==='cookies')?policyPaths.cookies:''),terms:process.env.TERMS_URL || (policies.some(p=>p.key==='terms')?policyPaths.terms:'')},
  analyticsId: process.env.ANALYTICS_ID || ''
};
export const services = [
  {slug:'experience-design-enablement', metaTitle:'Customer Experience Design & Enablement', name:'Experience Design & Enablement', short:'Experience', number:'001', phrase:'Experiences that bring people closer.', description:'Design and build connected customer experiences, websites, portals, business applications and custom SaaS around the people who use them.', eyebrow:'START WITH PEOPLE', areas:['Customer journey strategy','Websites & digital applications','UX, UI & content experiences','Personalization & optimization'], output:'A clearer journey, a purposeful experience and the design and engineering to bring it to life.', link:'Technology makes the experience possible. Intelligence makes it more relevant.', adjacent:1},
  {slug:'martech-consulting-enablement', metaTitle:'MarTech, CRM & Marketing Automation Consulting', name:'MarTech Consulting & Enablement', short:'Technology', number:'002', phrase:'Make your technology work together.', description:'Assess, architect, implement and integrate the CRM, marketing automation and MarTech platforms behind customer engagement.', eyebrow:'CONNECT THE SYSTEM', areas:['MarTech assessment & architecture','Platform implementation & integration','CRM & marketing automation','Campaigns, journeys & optimization'], output:'A connected marketing ecosystem with clear ownership, useful workflows and platforms your teams can put to work.', link:'Experience gives technology its purpose. Intelligence guides what happens next.', adjacent:2},
  {slug:'data-intelligence-activation', metaTitle:'Customer Data, CDP & Data Activation Consulting', name:'Data Intelligence & Activation', short:'Intelligence', number:'003', phrase:'From customer data to a useful next step.', description:'Unify, understand and activate customer data through CDP strategy, segmentation, audience activation, analytics and measurement.', eyebrow:'TURN SIGNALS INTO ACTION', areas:['Customer data & CDP consulting','Data quality & identity','Analytics, measurement & segmentation','Personalization & activation'], output:'Trusted customer context, a shared way to measure progress and intelligence that informs real decisions.', link:'Technology connects the data. Experience is where its value becomes visible.', adjacent:0}
];
export const products = [
  {slug:'leadryze-ai',name:'LeadRyze AI',category:'FLAGSHIP AI LEAD DESK',status:'Available',description:'From the first buyer question to a qualified conversation. An AI lead desk that understands your business and helps opportunities move forward.',href:'/products/leadryze-ai'},
  {slug:'imma',name:'IMMA',category:'INTELLIGENT MARKETING MATURITY ASSESSMENT',status:'Available',description:'Find the gaps across your marketing stack, customer journeys, data and capabilities. Get a clearer starting point for what comes next.',href:'/products/imma'},
  {slug:'campaign-automation',name:'Campaign automation',category:'PRODUCT ROADMAP',status:'In development',description:'End-to-end campaign workflows, from planning and preparation to coordinated execution.'},
  {slug:'brand-social-content',name:'Brand & social content',category:'PRODUCT ROADMAP',status:'In development',description:'AI-supported content workflows that connect brand knowledge, creative development and publishing.'},
  {slug:'performance-intelligence',name:'Performance intelligence',category:'PRODUCT ROADMAP',status:'In development',description:'Performance signals and next-best-action insights that help teams decide where to focus.'}
];
// LeadRyze CRM: an owned product with no dedicated route and no approved status, pricing or feature list.
export const leadryzeCrm = {name:'LeadRyze CRM',label:'Built by InnooRyze',description:'LeadRyze CRM is an InnooRyze-built CRM designed to help growing businesses organise customer and lead information and support structured sales follow-up.',distinction:'It is a separate product from LeadRyze AI, our AI lead desk.',anchor:'/products#leadryze-crm',enquiry:'/contact?interest=LeadRyze%20CRM'};
export const articles = [
  {slug:'choosing-the-right-cdp-for-your-growth-stage',title:'Choosing the right CDP for your growth stage.',category:'Data & Intelligence',type:'Guide',readTime:'3 min read',summary:'Start with the decisions and customer experiences you need to improve. Then choose the data foundation to support them.',sections:[
    ['What is a customer data platform?','A customer data platform (CDP) brings customer data from different sources into unified, persistent customer profiles that other systems can use. The <a href="https://www.cdpinstitute.org/what-is-a-cdp/" target="_blank" rel="noopener noreferrer">CDP Institute</a> describes a CDP as packaged software that builds a persistent, unified customer database that is accessible to other systems. Platforms such as <a href="/platforms/segment">Segment</a> are one route to that foundation; the right choice depends on the first use case the data must support.'],
    ['Start with a use case, not a platform.','A customer data platform should solve a specific problem. That might be fragmented customer profiles, inconsistent audiences or the difficulty of making a relevant next interaction possible. Write down the first use case before building a requirements list.'],
    ['Understand what your data can support.','Map your sources, identifiers, consent and ownership. Establish where data is collected, how it stays accurate and which teams can use it. A platform cannot replace those decisions.'],
    ['Connect the selection to your growth stage.','Look at the channels you operate, the scale of your data and the people who will maintain the system. Match the implementation to what the business can adopt. Leave room to grow without making the first use case unnecessarily complex.'],
    ['Design for activation.','Decide where an audience or insight must go next: a website, a CRM, a campaign or an analytics workflow. Assess integration and operating requirements alongside the platform features.'],
    ['Give the first use case a clear owner.','Agree how you will judge usefulness, who maintains the data and who acts on the result. The goal is a working customer experience with a sustainable operating model.']
  ]},
  {slug:'why-ai-needs-human-centered-strategy',title:'Why AI needs human-centered strategy.',category:'AI & Agents',type:'Perspective',readTime:'3 min read',summary:'Useful AI starts with an understanding of people, their context and the work that needs to get done.',sections:[
    ['Why does AI strategy still need human judgment?','AI can interpret a request, find relevant information and prepare an action, but it does not own the outcome. People decide what a good result looks like, which decisions carry risk and when an action needs approval. A human-centered strategy builds those judgments into the system from the start. Guidance such as the <a href="https://www.nist.gov/itl/ai-risk-management-framework" target="_blank" rel="noopener noreferrer">NIST AI Risk Management Framework</a>, a voluntary framework for building trustworthiness into the design, development, use and evaluation of AI systems, points in the same direction.'],
    ['Define the work before choosing the AI.','Begin with a customer need or a business process. Describe what a good outcome looks like, what information is necessary and which decisions should remain with a person. That gives the technology a useful purpose.'],
    ['Make context part of the experience.','An answer is only helpful when it fits the situation. Product knowledge, customer preferences and process rules should inform how an agent responds. Missing or uncertain information should lead to a clear question or a human handoff.'],
    ['Give people control.','Decide which actions an agent can prepare, which it may execute and which require approval. Make those boundaries understandable to the people using and operating the system.'],
    ['Evaluate more than speed.','Review whether the agent understood the request, used the right context and prepared an appropriate next step. A faster answer is not necessarily a better experience.'],
    ['Learn from real interactions.','Start with a bounded workflow. Observe where customers or teams need help, improve the knowledge and refine the handoffs. Human understanding remains an ongoing part of the system.']
  ]},
  {slug:'3-common-mistakes-in-martech-implementation',title:'3 common mistakes in MarTech implementation.',category:'MarTech',type:'Article',readTime:'3 min read',summary:'The platform is only part of the work. Alignment, data and adoption determine whether the system becomes useful.',sections:[
    ['What commonly causes MarTech implementations to fail?','MarTech implementations usually struggle for organizational reasons rather than technical ones. The business has not agreed what the platform should achieve, data and integration decisions are left too late, or the team is not prepared to operate the system after launch. The three mistakes below are common examples, and each has a practical fix.'],
    ['1. Starting with features instead of the journey.','A long feature list can hide a lack of agreement about what the business needs. Define the customer journey, the team workflow and the first measurable use case before configuring the platform.'],
    ['2. Leaving data and integration until later.','Identify the systems of record, the customer identifiers, the consent requirements and the owners of each connection early. Integration decisions affect the experience your teams can actually deliver.'],
    ['3. Treating launch as the finish line.','People need a clear way to operate the system. Plan training, ownership, documentation and a rhythm for improvement. Make it easy to understand what is working and where a workflow needs attention.'],
    ['Build the operating model alongside the technology.','Connect customer experience, platform delivery and data from the start. Give the first use case a clear owner, validate the full journey and use what you learn to guide the next release.']
  ]}
];
articles.forEach((a,i)=>{a.published='2026-09-12';a.updated='2026-09-26';a.readTime=Math.max(1,Math.ceil(a.sections.map(x=>x.join(' ')).join(' ').split(/\s+/).length/200))+' min read';a.image=[editorial.data,editorial.martech,editorial.about][i];});
// Client logos are trimmed to their own ink box, so one display box gives all three equal optical scale.
// `scale` normalises by area rather than height: these lockups run from 2.85:1 to 5.30:1, and matching
// heights alone would let the widest mark dominate the row. See docs/ASSET_REGISTER.md.
const clientLogo = (file, width, scale, name) => ({src:'/assets/images/work/logos/' + file, width, height:120, scale, alt:name + ' logo'});

export const work = [
 {slug:'dynalektric',name:'Dynalektric',title:'Engineering expertise. A clearer digital experience.',
  metaTitle:'Dynalektric — Industrial Website & RFQ Journey',
  type:'Experience Design & Enablement',categories:['Website Experience'],featured:true,
  logo:clientLogo('dynalektric-logo-trimmed.png',441,.88,'Dynalektric'),
  image:'asset:dynalektric-screen.webp',alt:'The live Dynalektric website with its industrial engineering and manufacturing homepage',
  industry:'Industrial electrical manufacturing',
  description:'Website strategy, UX, design, development and SEO improvement for an industrial electrical manufacturer, with a product architecture and RFQ enquiry journey.',
  url:'https://dynalektric.com/',related:0},

 {slug:'qualtura',name:'Qualtura',title:'A clearer presence. Connected to the enquiry.',
  metaTitle:'Qualtura — Website Experience & Zoho Integration',
  type:'Experience Design & Enablement',categories:['Website Experience','MarTech'],featured:true,
  logo:clientLogo('qualtura-logo-trimmed.png',636,.73,'Qualtura'),
  // The homepage capture is the work itself, so it is shown complete in the case body rather than
  // cropped behind a hero. This case intentionally uses a text hero.
  heroMedia:false,mediaStage:true,stageLabel:'QUALTURA / WEBSITE EXPERIENCE',
  image:'asset:qualtura-screen.webp',alt:'The live Qualtura website homepage, introducing the business and its services',
  industry:'Digital marketing and growth',
  description:'Website experience, design and responsive development across approximately six pages, with the enquiry journey connected to Zoho.',
  url:'https://qualtura.com/',related:0,relatedAlso:1},

 {slug:'treffer-technologies',name:'Treffer Technologies',title:'Connecting the platforms behind customer engagement.',
  metaTitle:'Treffer Technologies — CRM & MarTech Enablement',
  type:'MarTech / CRM Enablement',categories:['MarTech','CRM'],featured:true,
  logo:clientLogo('treffer-technologies-logo-transparent.png',342,1,'Treffer Technologies'),
  industry:'Technology',
  description:'CRM strategy, MarTech strategy and enablement, shaping a connected operating direction for customer engagement.',
  related:1},

 // Published anonymously at the owner's instruction. No client name, logo, screenshot or outbound URL.
 {slug:'industrial-valve',route:'industrial-valve-digital-experience',name:'US Industrial Valve Manufacturer',
  title:'A digital experience for industrial flow control.',
  metaTitle:'US Industrial Valve Digital Experience',
  type:'Industrial Digital Experience',categories:['Website Experience'],status:'In Progress',
  image:'asset:industrial-valve-screen.webp',alt:'A digital-experience concept for an industrial valve portfolio, with industry pathways beside a product-led homepage',
  industry:'Industrial valves and flow control',
  description:'A clearer, more credible digital experience for a specialist industrial valve portfolio, built around technical buyers and the applications the products serve.',
  related:0},

 {slug:'imma',metaTitle:'Building IMMA — Marketing Maturity Assessment',title:'A clearer starting point for marketing growth.',name:'IMMA',type:'InnooRyze product',categories:['Website Experience','Data','AI'],image:'asset:imma-screen.png',alt:'The live IMMA assessment showing business-model selection for B2B and B2C organizations',description:'How InnooRyze designed and built IMMA, a live marketing maturity assessment, from verified sign-in and structured questions to scores, recommendations and a roadmap.',challenge:'Decision-makers often sense that their marketing foundations need attention without knowing where to start. The opportunity was a structured, self-service assessment that respects business context and turns answers into a practical starting point, rather than another generic questionnaire.',approach:'We designed IMMA as a guided journey. It begins with business context: a B2B or B2C starting point and a few details about the business. The user then selects the areas to assess and works through one structured set of questions at a time, scoring current practice and adding notes where useful. Questions, scoring and results were designed together, so the answers lead directly to the outcome the user sees.',built:'A live web application with a verified entry point. Before the assessment begins, users confirm their email address with a one-time code. The flow then moves from business context to area selection, structured questions and results, with progress kept in the browser so a reload does not lose the work.',extraChapters:[['Results and Next Steps','The results experience brings together an overall score, a maturity level, category-wise results, recommendations and a roadmap, so the user leaves with a view of where they stand and what to prioritize. From there, users can choose to book a consultation with InnooRyze through Zoho Bookings, where they enter their booking details directly.']],technology:'IMMA runs as an InnooRyze-hosted web application with an InnooRyze-controlled PostgreSQL data layer for assessment records. Microsoft 365, through Microsoft Graph, handles email verification and transactional email. The consultation step hands off to Zoho Bookings; assessment answers and results are not transferred to it.',outcome:'IMMA is live and publicly available. Quantified business outcomes have not been published.'}];

work.forEach(w=>{w.campaign={
 'dynalektric':{src:'asset:dynalektric-project.webp',alt:'A technician assembling electrical components in the Dynalektric film'},
 'qualtura':{src:'asset:qualtura-project.webp',alt:'The Qualtura website homepage as delivered'},
 'treffer-technologies':{name:'optical-patterns',alt:'Illustrative optical patterns across a measuring instrument, representing connected intelligence'},
 'industrial-valve':{src:'asset:industrial-valve-project.webp',alt:'A precision-machined flanged industrial valve assembly, lit in a studio'}
}[w.slug]||null;});

// interest: the Contact enquiry area the detail page's CTA preselects (/contact?interest=<exact option label>).
export const platforms = [
  {name:'Salesforce',slug:'salesforce',image:'/assets/platforms/salesforce-logo.svg',group:'CRM & customer engagement',interest:'MarTech Consulting & Enablement'},
  {name:'Adobe',slug:'adobe',image:'/assets/platforms/adobe-logo.png',group:'Digital experience & marketing',interest:'Growth Systems'},
  {name:'Braze',slug:'braze',image:'/assets/platforms/braze-logo.svg',group:'Customer engagement',interest:'MarTech Consulting & Enablement'},
  {name:'Segment',slug:'segment',image:'/assets/platforms/segment-logo.svg',group:'Customer data',interest:'Data Intelligence & Activation'}
];
export const interests = ['Growth Systems','Experience Design & Enablement','MarTech Consulting & Enablement','Data Intelligence & Activation','AI Agents & Automation','LeadRyze AI','LeadRyze CRM','IMMA','Partnership','Other'];
