export function initJourneys({motionStopped}){
 document.querySelectorAll('[data-signature]').forEach(root=>{
  const buttons=[...root.querySelectorAll('[data-signature-step]')],panels=[...root.querySelectorAll('.signature-panel')],nodes=[...root.querySelectorAll('.connected-tools>span')],visuals=[...root.querySelectorAll('[data-stage-visual]')],play=root.querySelector('.signature-play');
  let index=0,timer,visible=false,paused=false;
  function loadVisual(i){const img=visuals[i]?.querySelector('img');if(!img)return Promise.resolve();img.loading='eager';if(img.dataset.src){if(img.dataset.srcset){img.srcset=img.dataset.srcset;delete img.dataset.srcset;}img.src=img.dataset.src;delete img.dataset.src;}return img.decode?.().catch(()=>{})||Promise.resolve();}
  function show(i){
   index=i;root.setAttribute('aria-busy','true');
   buttons.forEach((b,n)=>{if(n===i)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
   loadVisual(i).then(()=>{
    if(index!==i)return;
    panels.forEach((p,n)=>p.hidden=n!==i);nodes.forEach((n,j)=>n.classList.toggle('is-connected',j<=i));
    root.querySelector('.signature-counter').textContent=`${String(i+1).padStart(2,'0')} / ${String(buttons.length).padStart(2,'0')}`;
    visuals.forEach((v,n)=>{v.classList.toggle('is-active',n===i);v.setAttribute('aria-hidden',String(n!==i));});
    root.setAttribute('aria-busy','false');if(visible)loadVisual((i+1)%buttons.length);
   });
  }
  function sync(){clearInterval(timer);const stopped=paused||motionStopped();play.textContent=stopped?'Play journey':'Pause journey';play.setAttribute('aria-label',play.textContent);play.disabled=motionStopped();if(visible){loadVisual(index);loadVisual((index+1)%buttons.length);}if(visible&&!stopped&&!document.hidden)timer=setInterval(()=>show((index+1)%buttons.length),5000);}
  buttons.forEach((b,i)=>{b.addEventListener('click',()=>{show(i);paused=true;sync();});b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;show(next);paused=true;sync();buttons[next].focus();}});});
  play.addEventListener('click',()=>{paused=!paused;sync();});root.addEventListener('focusin',()=>clearInterval(timer));root.addEventListener('focusout',e=>{if(!root.contains(e.relatedTarget))sync();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.2}).observe(root);
  ['motionchange','visibilitychange'].forEach(e=>document.addEventListener(e,sync));sync();
 });
}
