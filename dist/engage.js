// Touch equivalents for hover interactions.
// Without a hover-capable pointer, an item crossing the middle band of the viewport is "engaged" and receives the
// same visual state as hover (platform colour, Ideas reveal, Explore pill); it resets as it leaves.
// Work and case project visuals also get a restrained scroll-linked depth in place of the desktop cursor depth.
import {motion,onStableResize} from './motion.js';

export function initEngage(){
 const items=[...document.querySelectorAll('.platform-card,.featured-five>.expertise-block,.editorial-item>a,.project-visual')];
 if(items.length){
  const band=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('is-engaged',!motion.canHover()&&entry.isIntersecting)),{rootMargin:'-36% 0px -36% 0px'});
  const observe=()=>items.forEach(item=>{band.unobserve(item);item.classList.remove('is-engaged');band.observe(item);});
  observe();matchMedia('(hover: hover)').addEventListener('change',observe);
 }

 const visuals=[...document.querySelectorAll('.project-visual')];
 if(!visuals.length)return;
 const onScreen=new Set();let queued=false,height=innerHeight;
 function paint(){
  queued=false;
  onScreen.forEach(visual=>{
   const idle=motion.canHover()||motion.stopped(),box=visual.getBoundingClientRect(),offset=((box.top+box.height/2)/height-.5);
   visual.style.setProperty('--depth-y',idle?'0px':`${(Math.max(-1,Math.min(1,offset))*-12).toFixed(1)}px`);
  });
 }
 const request=()=>{if(!queued&&onScreen.size){queued=true;requestAnimationFrame(paint);}};
 const watch=new IntersectionObserver(entries=>{entries.forEach(entry=>entry.isIntersecting?onScreen.add(entry.target):onScreen.delete(entry.target));request();});
 visuals.forEach(visual=>watch.observe(visual));
 addEventListener('scroll',request,{passive:true});
 onStableResize(()=>{height=innerHeight;request();});document.addEventListener('motionchange',request);matchMedia('(hover: hover)').addEventListener('change',request);
}
