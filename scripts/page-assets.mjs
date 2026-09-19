import {siteAssets} from '../src/config/siteAssets.mjs';
// Shared content uses logical image tokens. Each occurrence resolves to an independent page/section file.
export function scopePageAssets(page,origin){
 const config=siteAssets[page.path],counts=new Map(),used=new Set();
 const body=page.body.replace(/<(?:img|video)\b[^>]*>/g,tag=>{
  const source=tag.match(/(?:\s(?:src|data-src|poster))="(asset:[^"]+)"/)?.[1];if(!source)return tag;
  const count=(counts.get(source)||0)+1;counts.set(source,count);
  const slot=config?.images.find(x=>x.source===source&&x.occurrence===count);
  if(!slot)throw Error('Add a page-owned image mapping for '+page.path+' '+source+' occurrence '+count);
  used.add(slot.key);
  tag=tag.replace(/(\s(?:src|data-src|poster))="asset:[^"]+"/,(_,attr)=>attr+'="'+slot.src+'"');
  tag=tag.replace(/(\s(?:srcset|data-srcset))="[^"]+"/,(_,attr)=>slot.srcset?attr+'="'+slot.srcset+'"':'');
  // Intrinsic size comes from the page-owned file, so every placement declares its real aspect ratio.
  if(slot.dimensions){tag=tag.replace(/\swidth="\d+"/,' width="'+slot.dimensions[0]+'"').replace(/\sheight="\d+"/,' height="'+slot.dimensions[1]+'"');}
  return tag.replace(/>$/,' data-asset="'+slot.key+'">');
 });
 if(body.includes('asset:'))throw Error('Unresolved image token on '+page.path);
 if(config)for(const slot of config.images)if(!used.has(slot.key))throw Error('Unused image mapping; update '+page.path+' '+slot.key);
 const schema=JSON.parse(JSON.stringify(page.schema||[]),(key,value)=>{
  if(typeof value!=='string'||!value.startsWith('asset:'))return value;
  const slot=config?.images.find(x=>x.source===value);if(!slot)throw Error('Unmapped schema image on '+page.path);
  return new URL(slot.src,origin).href;
 });
 return {...page,body,schema,socialImage:config?.social||'/assets/brand/brand-logo.png'};
}
