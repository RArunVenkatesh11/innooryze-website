// Responsive pinned storytelling shared by the homepage story and the /growth-systems journey.
// pinned: a sticky stage shows one panel at a time, driven by native scroll (no capture, no snapping). When the
//         stable viewport is short, panel content is zoomed down to fit (never below minFit).
// flow:   when even minFit cannot fit, panels stay in normal flow and reveal progressively as they enter view.
// static: reduced motion or explicit pause; every panel is readable with no motion.
import {motion,stableViewport,onStableResize} from './motion.js';
const zoomSupported=globalThis.CSS?.supports?.('zoom','0.5')??false;

export function createPinnedStory(section,options){
 // top/bottom: elements bounding the panel area; controls: the last stage element that must remain on screen.
 const {stage,panel,button,progress,count,top,bottom,controls=bottom,activeClass,stackedClass,flowClass,minFit=.82,onUpdate=()=>{}}=options;
 const find=selector=>section.querySelector(selector),panels=[...section.querySelectorAll(panel)],buttons=[...section.querySelectorAll(button)];
 const stageEl=find(stage),bar=find(progress),counter=find(count),total=panels.length;
 let mode='',visible=false,index=-1;

 const revealer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('is-revealed');}),{threshold:.2});

 // Largest zoom factor at which every panel's centred content clears the top and bottom chrome by 8px.
 function measureFit(){
  section.classList.remove(stackedClass,flowClass);section.style.setProperty('--fit','1');
  const viewport=stableViewport(),stageBox=stageEl.getBoundingClientRect();
  if(stageEl.offsetHeight>viewport.height+1||find(controls).getBoundingClientRect().bottom>stageBox.bottom+1)return 0;
  const area=panels[0].parentElement.getBoundingClientRect(),centre=(area.top+area.bottom)/2,upper=find(top).getBoundingClientRect().bottom+8,lower=find(bottom).getBoundingClientRect().top-8;
  const room=Math.min(centre-upper,lower-centre);if(room<=0)return 0;
  return Math.min(1,...panels.map(item=>{const boxes=[...item.children].map(child=>child.getBoundingClientRect());const half=(Math.max(...boxes.map(box=>box.bottom))-Math.min(...boxes.map(box=>box.top)))/2;return half?room/half:1;}));
 }
 function setMode(next){
  mode=next;section.dataset.mode=next;
  section.classList.toggle(stackedClass,next!=='pinned');section.classList.toggle(flowClass,next==='flow');
  panels.forEach(item=>{if(next==='flow')revealer.observe(item);else{revealer.unobserve(item);item.classList.remove('is-revealed');}});
  index=-1;update(true);
 }
 function decide(){
  if(motion.stopped()){section.style.setProperty('--fit','1');setMode('static');return;}
  let fit=measureFit();if(fit<1&&!zoomSupported)fit=0;
  if(fit>=minFit){section.style.setProperty('--fit',fit.toFixed(3));setMode('pinned');}
  else{section.style.setProperty('--fit','1');setMode('flow');}
 }
 function travel(){return Math.max(1,section.offsetHeight-stageEl.offsetHeight);}
 function update(force=false){
  if(!visible&&!force)return;
  let value,next;
  if(mode==='pinned'){value=Math.max(0,Math.min(1,-section.getBoundingClientRect().top/travel()));next=Math.min(total-1,Math.floor(value*total));}
  else{const middle=innerHeight/2;next=panels.reduce((best,item,i)=>{const box=item.getBoundingClientRect(),distance=Math.abs((box.top+box.bottom)/2-middle);return distance<best.distance?{i,distance}:best;},{i:0,distance:Infinity}).i;value=(next+.5)/total;}
  if(next!==index||force){
   index=next;
   panels.forEach((item,i)=>{item.classList.toggle(activeClass,i===index);item.inert=mode==='pinned'&&i!==index;});
   buttons.forEach((item,i)=>{if(i===index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
   if(counter)counter.textContent=`0${index+1} / 0${total}`;
  }
  if(bar)bar.style.width=`${value*100}%`;
  onUpdate({mode,progress:value,index});
 }
 function goTo(target){
  const behavior=motion.stopped()?'instant':'smooth';
  if(mode==='pinned')scrollTo({top:scrollY+section.getBoundingClientRect().top+travel()*((target+.2)/total),behavior});
  else panels[target].scrollIntoView({behavior,block:'start'});
 }
 buttons.forEach((item,i)=>item.addEventListener('click',()=>goTo(i)));
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)update(true);},{rootMargin:'50% 0px'}).observe(section);
 onStableResize(decide);document.addEventListener('motionchange',decide);document.fonts?.ready.then(decide);
 decide();
 return {update,decide};
}
