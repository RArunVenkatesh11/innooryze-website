// AI words follow the AI Agents story state on every device: progress through the pinned intelligence state
// (or the panel rising through the viewport in flow mode) selects UNDERSTAND → REASON → ACT → CONNECT → IMPROVE.
// Reduced motion or pause keeps ACT as a static, readable accent.
export function initKineticWords({motionStopped}){
 const panel=document.querySelector('.kinetic-ai');if(!panel)return ()=>{};
 const words=[...panel.querySelectorAll('.kinetic-words>span')];
 const show=i=>words.forEach((word,n)=>word.classList.toggle('is-current',n===i));
 const clamp=value=>Math.max(0,Math.min(.999,value));
 return function update({mode,progress}){
  if(mode==='static'||motionStopped()){show(2);return;}
  let value;
  if(mode==='pinned')value=clamp((progress-1/3)*3);
  else{const box=panel.getBoundingClientRect();value=clamp((innerHeight*.8-box.top)/(innerHeight*.5));}
  show(Math.floor(value*words.length));
 };
}
