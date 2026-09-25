import {motion,session,motionValue,onStableResize} from './motion.js';
import {createPinnedStory} from './pinned.js';
import {initEngage} from './engage.js';
import {initKineticWords} from './kinetic.js';
import {initNavigation} from './navigation.js';
import {initJourneys} from './journeys.js';
import {initFilm} from './film.js';
import {initShowcases} from './showcases.js';
import {initAgents} from './agents.js';
import {initContactForm} from './forms.js';
import {initConsent} from './consent.js';
import {analyticsConfig} from './analytics-config.js';
initConsent(analyticsConfig);
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],root=document.documentElement;
const motionStopped=motion.stopped;
function reflectMotionControl(){const button=$('.motion-toggle');if(!button)return;const reduced=motion.reduced();button.disabled=reduced;button.setAttribute('aria-pressed',String(motionStopped()));button.setAttribute('aria-label',reduced?'Reduced motion enabled':motionStopped()?'Play motion':'Pause motion');$('.pause-icon',button).textContent=reduced?'—':motionStopped()?'▶':'Ⅱ';}
$('.motion-toggle')?.addEventListener('click',()=>motion.setPaused(!motionStopped()));
initNavigation({motionStopped});
$$('.back-top').forEach(button=>button.addEventListener('click',()=>scrollTo({top:0,behavior:motionStopped()?'instant':'smooth'})));
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible','visible');revealObserver.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -20px'});
$$('.reveal').forEach(el=>revealObserver.observe(el));
$$('.word-reveal').forEach(el=>{const words=el.textContent.trim().split(/\s+/);el.setAttribute('aria-label',el.textContent);el.replaceChildren();words.forEach((word,i)=>{const span=document.createElement('span');span.textContent=word;span.setAttribute('aria-hidden','true');span.style.transitionDelay=`${i*35}ms`;el.append(span,document.createTextNode(' '));});revealObserver.observe(el);});
root.classList.add('enhanced');

// Scroll work runs only for sections currently near the viewport.
const nearViewport=new Map();
function trackVisibility(element){if(!element)return;nearViewport.set(element,false);new IntersectionObserver(entries=>{nearViewport.set(element,entries[0].isIntersecting);},{rootMargin:'25% 0px'}).observe(element);}

const belief=$('[data-belief] h2');trackVisibility(belief);
function updateBelief(){if(!belief||!nearViewport.get(belief))return;const words=[...belief.querySelectorAll('.belief-word')],top=belief.getBoundingClientRect().top;const progress=motionStopped()?1:Math.max(0,Math.min(1,(innerHeight*.78-top)/(innerHeight*.58)));words.forEach((word,i)=>word.classList.toggle('is-read',i<Math.ceil(progress*words.length)));}

const stories=[];
const updateWords=initKineticWords({motionStopped});
const story=$('.story-scroll');
if(story){
 const lines=$$('.connected-line',story);
 stories.push(createPinnedStory(story,{stage:'.story-stage',panel:'.story-scene',button:'[data-story]',progress:'.story-progress>span',count:'.story-index',top:'.story-heading',bottom:'.story-progress',controls:'.story-switches',activeClass:'active',stackedClass:'story-continuous',flowClass:'story-flow',onUpdate:({mode,progress})=>{
  const pinned=mode==='pinned';
  story.style.setProperty('--intelligence',pinned?Math.max(0,Math.min(1,(progress-1/3)*3)):1);
  lines.forEach((line,i)=>{const emphasis=pinned?Math.max(.45,Math.min(1,(progress*3-.05-i*.15)*3)):1;line.style.opacity=emphasis;line.style.transform=pinned?`translateX(calc(${((1-emphasis)*25).toFixed(1)}px * var(--motion-distance,1)))`:'none';});
  updateWords({mode,progress});
 }}));
}
const growth=$('.growth-journey');
if(growth)stories.push(createPinnedStory(growth,{stage:'.growth-stage',panel:'.capability-panel',button:'[data-capability]',progress:'.journey-progress>span',count:'.journey-count',top:'.journey-top',bottom:'.journey-bottom',activeClass:'is-active',stackedClass:'growth-continuous',flowClass:'growth-flow'}));

const media=$('.film-media');trackVisibility(media);
let parallax=motionValue('--motion-parallax');
function refreshParallax(){parallax=motionValue('--motion-parallax');}
let scrollQueued=false;
function onScroll(){if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{scrollQueued=false;$('#header').classList.toggle('is-scrolled',scrollY>25);stories.forEach(item=>item.update());updateBelief();if(media&&nearViewport.get(media))media.style.transform=motionStopped()?'none':`translateY(${(Math.min(scrollY,innerHeight)*parallax).toFixed(1)}px) scale(1.08)`;});}
addEventListener('scroll',onScroll,{passive:true});
onStableResize(()=>{refreshParallax();onScroll();});
document.addEventListener('motionchange',()=>{reflectMotionControl();refreshParallax();onScroll();});
reflectMotionControl();onScroll();

$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{$$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let visible=0;$$('[data-category]').forEach(item=>{item.hidden=button.dataset.filter!=='All'&&button.dataset.filter!==item.dataset.category;if(!item.hidden){visible++;$$('.reveal',item).forEach(el=>el.classList.add('is-visible','visible'));}});$('.filter-empty').hidden=visible!==0;}));
$('.filter-empty')?.setAttribute('role','status');
initAgents();initContactForm();
initFilm({motionStopped,session});
initShowcases({motionStopped});
initJourneys({motionStopped});
initEngage();
