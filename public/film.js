import {homeFilm} from './media-config.js';
export function initFilm({motionStopped,session}){
 const layers=[...document.querySelectorAll('.film-layer')];if(!layers.length)return;
 const hero=document.querySelector('.film-hero'),sound=document.querySelector('.sound-toggle'),label=document.querySelector('.sound-label'),sceneLabel=document.querySelector('.scene-label');
 // Opens on the scene matching the poster and initial label; the loop keeps the same order and returns through CULTURE / CONNECTION.
 const scenes=[['digital-connection','PEOPLE / POSSIBILITY'],['business-collaboration','BUSINESS / AMBITION'],['data-intelligence','DATA / INTELLIGENCE'],['human-machine','HUMAN + MACHINE / PROGRESS'],['human-craft','CRAFT / PROGRESS'],['global-city','CULTURE / CONNECTION']];
 // Phone-sized screens (portrait width or landscape height) use the compact encodes. A rotation changes the source
 // from the next scene onwards, so the playing scene never flashes.
 const phoneScreen=matchMedia('(max-width:760px), (max-height:540px)');
 // Save-Data is an explicit bandwidth preference: the poster moves slowly instead of loading the film.
 const saveData=!!(navigator.connection?.saveData||matchMedia('(prefers-reduced-data: reduce)').matches);
 let mobile=phoneScreen.matches,active=0,scene=0,visible=true,switching=false,loaded=false,failed=false,audio,unlocked=false,unavailable=false,wantsSound=session.get('innooryze-sound')==='on';
 const canPlay=()=>visible&&!document.hidden&&!motionStopped()&&!saveData&&!failed;
 const soundCanPlay=()=>visible&&!document.hidden&&!motionStopped();
 const source=i=>`${homeFilm.base}${scenes[i][0]}${mobile?'-mobile':''}.mp4`;
 hero.classList.toggle('is-lite',saveData);
 phoneScreen.addEventListener('change',()=>{if(mobile===phoneScreen.matches)return;mobile=phoneScreen.matches;const refresh=()=>{if(switching){setTimeout(refresh,300);return;}layers[1-active].dataset.scene='';if(canPlay())loadNext();};refresh();});
 // Sound follows the motion controls: unavailable while motion is reduced or paused.
 function reflectSound(){const playing=audio&&!audio.paused;sound.disabled=unavailable||motionStopped();sound.setAttribute('aria-pressed',String(!!playing));label.textContent=unavailable?'Sound unavailable':playing?'Sound off':wantsSound?'Resume sound':'Sound on';}
 function syncAudio(){if(audio){if(soundCanPlay()&&unlocked&&wantsSound)audio.play().then(reflectSound).catch(()=>{unlocked=false;reflectSound();});else{audio.pause();reflectSound();}}else reflectSound();}
 sound.addEventListener('click',async()=>{if(audio&&!audio.paused){wantsSound=false;session.set('innooryze-sound','off');audio.pause();reflectSound();return;}if(motionStopped()){reflectSound();return;}if(!audio){audio=new Audio(homeFilm.audio);audio.loop=true;audio.preload='none';audio.volume=.6;audio.addEventListener('error',()=>{unavailable=true;reflectSound();});}try{await audio.play();unlocked=true;wantsSound=true;session.set('innooryze-sound','on');reflectSound();}catch{label.textContent='Try sound again';}});
 function loadNext(){const next=layers[1-active],index=(scene+1)%scenes.length;if(next.dataset.scene!==String(index)){next.src=source(index);next.dataset.scene=String(index);next.preload='auto';next.load();}}
 async function advance(){if(switching||!canPlay())return;const next=layers[1-active],old=layers[active];if(next.readyState<2){loadNext();if(old.ended){old.currentTime=0;old.play().catch(()=>{});}return;}switching=true;next.currentTime=0;try{await next.play();next.classList.add('active');old.classList.remove('active');scene=(scene+1)%scenes.length;active=1-active;sceneLabel.textContent=scenes[scene][1];setTimeout(()=>{old.pause();switching=false;if(canPlay())loadNext();},800);}catch{switching=false;}}
 layers.forEach(video=>{video.muted=true;video.addEventListener('timeupdate',()=>{if(video===layers[active]&&video.duration-video.currentTime<.75)advance();});video.addEventListener('ended',advance);video.addEventListener('loadeddata',()=>{if(video===layers[active]&&canPlay())loadNext();});video.addEventListener('error',()=>{if(video===layers[active]){failed=true;video.classList.remove('active');syncAudio();}else{video.dataset.scene='';}});});
 function sync(){if(canPlay()){if(!loaded){layers[0].src=source(0);layers[0].dataset.scene='0';layers[0].load();loaded=true;sceneLabel.textContent=scenes[0][1];}layers[active].play().catch(()=>{});loadNext();}else layers.forEach(video=>video.pause());syncAudio();}
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.05}).observe(hero);document.addEventListener('visibilitychange',sync);document.addEventListener('motionchange',sync);reflectSound();sync();
}
