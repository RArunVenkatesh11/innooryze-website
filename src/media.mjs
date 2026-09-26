export const editorial = {
 growth:{name:'immersive-projection',alt:'Visitors exploring cascading light and flower projections at an immersive digital installation',label:'EXPERIENCE + TECHNOLOGY + DATA INTELLIGENCE'},
 experience:{name:'digital-mobile',alt:'A person using a mobile phone on a vivid city street',label:'REAL PEOPLE. CONNECTED EXPERIENCES.'},
 martech:{name:'human-screen-portrait',alt:'A person concentrating on a screen through glass with warm and cyan reflections',label:'MANY MOVING PARTS. ONE EXPERIENCE.'},
 data:{name:'optical-patterns',alt:'Colourful optical patterns across a transparent measuring instrument against black',label:'CUSTOMER SIGNALS. BUSINESS CONTEXT.'},
 // The Data Intelligence hero slot now holds a different photograph from the shared optical-patterns token.
 dataHero:{name:'optical-patterns',alt:'Three colleagues studying customer data on an interactive world-map table at night',label:'CUSTOMER SIGNALS. BUSINESS CONTEXT.'},
 agents:{src:'asset:film-human-machine-poster.webp',alt:'Researchers controlling a collaborative robotic arm together',label:'HUMAN INTELLIGENCE. EXTENDED.'},
 products:{name:'product-in-use',alt:'A person using a virtual reality product in an immersive LED installation',label:'IDEAS, ENGINEERED TO WORK.'},
 work:{name:'article-craft',alt:'A designer working with a cutting mat, tools and materials on a workbench',label:'STRATEGY / DESIGN / BUILD'},
 ideas:{src:'asset:experience.jpg',alt:'A person exploring a vivid projected art installation',label:'THINKING THAT TAKES SHAPE.'},
 about:{name:'design-prototype-collaboration',alt:'Three designers reviewing a product beside physical models in a workshop',label:'LOCAL UNDERSTANDING. INTERNATIONAL PERSPECTIVE.'},
 lead:{src:'asset:film-business-collaboration-poster.webp',alt:'A team discussing work together on a laptop',label:'BETTER CONVERSATIONS. USEFUL NEXT STEPS.'},
 imma:{src:'asset:imma-screen.png',alt:'The live IMMA marketing maturity assessment',label:'YOUR STARTING POINT FOR WHAT COMES NEXT.'},
 platforms:{name:'article-craft',alt:'A craftsperson working carefully with tools and materials',label:'THE RIGHT TOOLS. CONNECTED WITH PURPOSE.'}
};
export const heroKeys={'growth-page-hero':'growth','service-0':'experience','service-1':'martech','service-2':'dataHero','agents-page-hero':'agents','products-page-hero':'products','work-page-hero':'work','ideas-page-hero':'ideas','about-page-hero':'about','lead-page-hero':'lead','imma-page-hero':'imma','platforms-page-hero':'platforms'};
export const heroMedia=className=>editorial[heroKeys[className.split(' ').find(x=>heroKeys[x])]];
// width/height are placeholders: scripts/page-assets.mjs rewrites them from the page-owned file's real dimensions.
// `focus` sets the per-image focal point used by object-position.
export function editorialImage(m,{eager=false,classes='',sizes='(max-width:760px) 100vw, 50vw'}={}){const src=m.src||`asset:editorial/${m.name}-1600.webp`;return `<img class="${classes}"${m.focus?` style="--focus:${m.focus}"`:''} src="${src}" ${m.name?`srcset="asset:editorial/${m.name}-800.webp 800w, ${src} 1600w" sizes="${sizes}"`:''} alt="${m.alt}" width="${m.width||(m.name?1600:1440)}" height="${m.height||(m.name?1067:900)}" loading="${eager?'eager':'lazy'}" ${eager?'fetchpriority="high"':''}>`;}
