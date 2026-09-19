export function initNavigation({motionStopped}) {
 const header=document.querySelector('.site-header'),root=header.querySelector('.mega-root'),panel=root.querySelector('.mega-menu'),toggle=root.querySelector('.mega-toggle');
 const mobile=document.querySelector('.mobile-nav'),mobileToggle=header.querySelector('.menu-toggle');
 let closeTimer,hideTimer,pinned=false,hovered=false;
 const open=()=>toggle.getAttribute('aria-expanded')==='true';
 function setMega(show,{pin=false}={}) {
  clearTimeout(closeTimer);clearTimeout(hideTimer);pinned=show&&pin;
  toggle.setAttribute('aria-expanded',String(show));panel.inert=!show;
  if(show){panel.hidden=false;requestAnimationFrame(()=>panel.classList.add('is-open'));}
  else{panel.classList.remove('is-open');hideTimer=setTimeout(()=>{if(!open())panel.hidden=true;},motionStopped()?0:180);}
 }
 function closeSoon(){clearTimeout(closeTimer);if(!pinned)closeTimer=setTimeout(()=>{if(!hovered&&!root.contains(document.activeElement))setMega(false);},450);}
 root.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=true;clearTimeout(closeTimer);if(!open())setMega(true);}});
 root.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){hovered=false;closeSoon();}});
 // A click on a hover-opened menu pins it instead of immediately dismissing it.
 toggle.addEventListener('click',()=>setMega(!open()||!pinned,{pin:true}));
 root.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&open()){e.preventDefault();setMega(false);toggle.focus();}
  if(e.key==='ArrowDown'&&(e.target===toggle||e.target===root.firstElementChild)){e.preventDefault();setMega(true,{pin:true});panel.querySelector('a').focus();}
 });
 root.addEventListener('focusout',e=>{if(!root.contains(e.relatedTarget)){pinned=false;closeSoon();}});
 document.addEventListener('pointerdown',e=>{if(!root.contains(e.target))setMega(false);});
 // The mobile menu fades/slides briefly; it stays in the DOM until the closing transition ends.
 let mobileTimer;const mobileOpen=()=>mobileToggle.getAttribute('aria-expanded')==='true';
 function setMobile(show){clearTimeout(mobileTimer);mobileToggle.setAttribute('aria-expanded',String(show));mobileToggle.setAttribute('aria-label',show?'Close menu':'Open menu');document.body.classList.toggle('menu-open',show);document.querySelector('main').inert=show;document.querySelector('footer').inert=show;if(show){mobile.hidden=false;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(mobileOpen())mobile.classList.add('is-open');}));setMega(false);mobile.querySelector('a').focus();}else{mobile.classList.remove('is-open');mobileTimer=setTimeout(()=>{if(!mobileOpen())mobile.hidden=true;},motionStopped()?0:240);}}
 mobileToggle.addEventListener('click',()=>setMobile(!mobileOpen()));
 document.addEventListener('keydown',e=>{if(!mobileOpen())return;if(e.key==='Escape'){setMobile(false);mobileToggle.focus();}if(e.key==='Tab'){const choices=[mobileToggle,...mobile.querySelectorAll('a')];if(e.shiftKey&&document.activeElement===choices[0]){e.preventDefault();choices.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===choices.at(-1)){e.preventDefault();choices[0].focus();}}});
 addEventListener('resize',()=>{if(innerWidth>1000&&mobileOpen())setMobile(false);if(innerWidth<=1000)setMega(false);});
}
