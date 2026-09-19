// Optional film regeneration; the finished media is bundled, so this is not a build dependency.
// Usage: node scripts/encode-phase2.mjs /path/to/original-film-downloads
// Install FFmpeg on PATH, or set FFMPEG to its executable path.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const sourceDirectory=process.argv[2];
if(!sourceDirectory)throw new Error('Usage: node scripts/encode-phase2.mjs SOURCE_DIRECTORY. See public/assets/licenses/phase2-film.json for source filenames and URLs.');
const ff=process.env.FFMPEG||'ffmpeg';
const output=fileURLToPath(new URL('../public/assets/video/',import.meta.url));
const clips=[['business-collaboration','creative-team-7989458-1080p.mp4'],['data-intelligence','data-interaction-6930347-1080p.mp4'],['human-machine','collaborative-robotics-8328048-720p.mp4']];
const grade='eq=contrast=1.08:saturation=1.12:brightness=-0.01';
for(const [,file] of clips)if(!fs.existsSync(path.resolve(sourceDirectory,file)))throw new Error(`Missing source film: ${file}`);
function encode(args){const result=spawnSync(ff,args,{encoding:'utf8'});if(result.error)throw result.error;if(result.status!==0)throw new Error(result.stderr||'FFmpeg failed.');}
for(const [name,file] of clips){
 const input=path.resolve(sourceDirectory,file);
 for(const mobile of [false,true])encode(['-y','-ss','1','-i',input,'-t','6.4','-an','-vf',`scale=${mobile?720:1280}:-2,${grade},fps=24`,'-c:v','libx264','-preset','fast','-crf',mobile?'28':'25','-movflags','+faststart',path.join(output,`home-hero-film-${name}${mobile?'-mobile':''}.mp4`)]);
 console.log(name,'encoded');
}
