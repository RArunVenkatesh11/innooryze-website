// Build step: hover effects apply only to hover-capable pointers, so a tap never leaves a hover state stuck on touch screens.
// Every selector that uses :hover is moved into @media (hover:hover) at the same cascade position. Where :hover is one
// alternative inside :is()/:where() (for example :is(:hover,:focus-visible,.is-engaged)), the non-hover alternatives stay
// unconditional so keyboard focus and touch "engaged" states keep working. Authors keep writing normal :hover rules.
const HOVER_MEDIA='@media (hover:hover)';

function splitTopLevel(text,separator){
 const parts=[];let depth=0,quote='',start=0;
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(quote){if(ch==='\\')i++;else if(ch===quote)quote='';continue;}
  if(ch==='"'||ch==="'")quote=ch;else if(ch==='('||ch==='[')depth++;else if(ch===')'||ch===']')depth--;
  else if(ch===separator&&depth===0){parts.push(text.slice(start,i));start=i+1;}
 }
 parts.push(text.slice(start));return parts;
}
// Removes :hover alternatives from :is()/:where() lists; returns null if the selector still needs :hover.
function withoutHover(selector){
 let valid=true;
 const result=selector.replace(/:(is|where)\(([^()]*)\)/g,(match,name,list)=>{
  const kept=splitTopLevel(list,',').map(item=>item.trim()).filter(item=>item!==':hover');
  if(!kept.length){valid=false;return match;}
  return `:${name}(${kept.join(',')})`;
 });
 return valid&&!result.includes(':hover')?result:null;
}
// Index of the brace that closes the block opened at `open`, skipping strings.
function closing(css,open){
 let depth=0,quote='';
 for(let i=open;i<css.length;i++){
  const ch=css[i];
  if(quote){if(ch==='\\')i++;else if(ch===quote)quote='';continue;}
  if(ch==='"'||ch==="'")quote=ch;else if(ch==='{')depth++;else if(ch==='}'&&--depth===0)return i;
 }
 throw new Error('Unbalanced CSS braces');
}
function transform(css,insideHoverMedia){
 let out='',i=0;
 while(i<css.length){
  const open=css.indexOf('{',i);
  if(open<0){out+=css.slice(i);break;}
  const end=closing(css,open),raw=css.slice(i,open),cut=raw.lastIndexOf(';'),prelude=raw.slice(cut+1).trim(),body=css.slice(open+1,end);
  out+=raw.slice(0,cut+1);
  if(prelude.startsWith('@media')||prelude.startsWith('@supports')||prelude.startsWith('@layer')){
   out+=`${prelude}{${transform(body,insideHoverMedia||/\(\s*hover\s*:\s*hover\s*\)/.test(prelude))}}`;
  }else if(prelude.startsWith('@')||insideHoverMedia||!prelude.includes(':hover')){
   out+=`${prelude}{${body}}`;
  }else{
   const plain=[],hovered=[];
   for(const selector of splitTopLevel(prelude,',').map(item=>item.trim())){
    if(!selector.includes(':hover')){plain.push(selector);continue;}
    hovered.push(selector);const alternative=withoutHover(selector);if(alternative)plain.push(alternative);
   }
   if(plain.length)out+=`${plain.join(',')}{${body}}`;
   out+=`${HOVER_MEDIA}{${hovered.join(',')}{${body}}}`;
  }
  i=end+1;
 }
 return out;
}
// Fails the build if a :hover selector remains outside a (hover:hover) media block.
function assertGuarded(css,insideHoverMedia=false){
 let i=0;
 while(i<css.length){
  const open=css.indexOf('{',i);if(open<0)return;
  const end=closing(css,open),raw=css.slice(i,open),prelude=raw.slice(raw.lastIndexOf(';')+1).trim();
  if(prelude.startsWith('@media')||prelude.startsWith('@supports')||prelude.startsWith('@layer'))assertGuarded(css.slice(open+1,end),insideHoverMedia||/\(\s*hover\s*:\s*hover\s*\)/.test(prelude));
  else if(!prelude.startsWith('@')&&!insideHoverMedia&&prelude.includes(':hover'))throw new Error(`Unguarded :hover selector: ${prelude.slice(0,120)}`);
  i=end+1;
 }
}
export function guardHover(css){
 const result=transform(css.replace(/\/\*[\s\S]*?\*\//g,''),false);
 assertGuarded(result);
 return result;
}
