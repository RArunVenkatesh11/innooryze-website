import {redirects} from '../src/redirects.mjs';
const regex = s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

export function apacheConfig(routes, csp) {
 const routeRules = routes.filter(p=>p!=='/').map(p=>{
  const pattern=regex(p.slice(1));
  return `  RewriteCond %{THE_REQUEST} "\\s/+${pattern}(?:/index\\.html|/)(?:[?\\s])" [NC]\n  RewriteRule ^ ${p} [R=301,END]\n  RewriteRule ^${pattern}/?$ ${p.slice(1)}/index.html [END]`;
 }).join('\n');
 return `# Generated static multi-page deployment for Apache 2.4.16+ at document root.
# Every route has its own HTML. Do not add a blanket SPA index.html fallback.
Options -Indexes -MultiViews
DirectoryIndex index.html
ErrorDocument 404 /404.html
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteOptions AllowNoSlash
${Object.entries(redirects).map(([from,to])=>`  RewriteRule ^${regex(from.slice(1))}(?:/index\\.html|/)?$ ${to} [R=301,END]`).join('\n')}
  RewriteCond %{THE_REQUEST} "\\s/+index\\.html(?:[?\\s])" [NC]
  RewriteRule ^index\\.html$ / [R=301,END]
${routeRules}
</IfModule>
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header always set Content-Security-Policy "${csp}"
  <FilesMatch "\\.(html|xml|txt)$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
  <FilesMatch "\\.(js|css)$">
    Header set Cache-Control "public, max-age=3600, must-revalidate"
  </FilesMatch>
  <FilesMatch "\\.(woff2|jpg|jpeg|png|svg|webp|avif|mp4|webm|mp3)$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript application/javascript application/json application/xml image/svg+xml
</IfModule>
`;
}

export function redirectPage(from,to,origin) {
 const canonical=new URL(to,origin).href;
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page moved | InnooRyze</title><meta name="robots" content="noindex,follow"><link rel="canonical" href="${canonical}"><meta http-equiv="refresh" content="0;url=${to}"></head><body><main><h1>This project has moved</h1><p><a href="${to}">Explore the Max-Seal project</a></p></main></body></html>`;
}
