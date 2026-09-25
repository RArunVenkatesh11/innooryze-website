// Writes vercel.json from src/config + src/redirects. Run after changing headers, CSP or redirects.
// scripts/validate.mjs fails if the committed file has drifted from this output.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {vercelJson} from './vercel-config.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'vercel.json');
const next = vercelJson();
const changed = !fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== next;
fs.writeFileSync(target, next);
console.log(changed ? 'vercel.json updated' : 'vercel.json already in sync');
