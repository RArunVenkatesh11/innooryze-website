// Shared motion policy and stable viewport.
// Motion stops only for prefers-reduced-motion or the explicit pause control. Device type, width and height never
// switch an interaction off; they only choose a space level that scales distance, parallax and type.
// The viewport height is measured in svh, so mobile browser toolbars showing or hiding never change the level.
const root=document.documentElement;
const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
const hoverQuery=matchMedia('(hover: hover)');
export const session={get:key=>{try{return sessionStorage.getItem(key);}catch{return null;}},set:(key,value)=>{try{sessionStorage.setItem(key,value);}catch{}}};
let paused=session.get('innooryze-motion')==='paused';

export const motion={
 stopped:()=>paused||reducedQuery.matches,
 reduced:()=>reducedQuery.matches,
 canHover:()=>hoverQuery.matches,
 setPaused(value){paused=value;session.set('innooryze-motion',value?'paused':'playing');announce();}
};
function announce(){root.classList.toggle('motion-paused',motion.stopped());document.dispatchEvent(new Event('motionchange'));}
reducedQuery.addEventListener('change',announce);
root.classList.toggle('motion-paused',motion.stopped());

const probe=document.createElement('div');
probe.setAttribute('aria-hidden','true');
probe.style.cssText='position:fixed;top:0;left:0;width:0;height:100vh;visibility:hidden;pointer-events:none';
probe.style.height='100svh';
document.body.append(probe);

export function stableViewport(){return {width:innerWidth,height:probe.offsetHeight};}
// compact: phones and very short windows; regular: tablets and laptops; spacious: large desktops.
export function spaceLevel({width,height}){return width<=760||height<=560?'compact':width<=1180||height<=820?'regular':'spacious';}
export function motionValue(name){return parseFloat(getComputedStyle(root).getPropertyValue(name))||0;}

const watchers=new Set();let viewportKey='';
function checkViewport(){const viewport=stableViewport(),key=`${viewport.width}x${viewport.height}`;if(key===viewportKey)return;viewportKey=key;root.dataset.space=spaceLevel(viewport);watchers.forEach(watch=>watch(viewport));}
// Fires only when the width or svh height really changes (window resize, rotation), not on toolbar movement.
export function onStableResize(watch){watchers.add(watch);}
addEventListener('resize',checkViewport);addEventListener('orientationchange',checkViewport);checkViewport();
