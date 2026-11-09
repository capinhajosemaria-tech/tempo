// Tempo offline cache. Bump VERSION on every update so phones fetch the new files.
const VERSION='tempo-4.1.0';
const FILES=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);
  // only the app's own files; GitHub and Strava requests always go to the network
  if(url.origin!==self.location.origin)return;
  // the page itself: network first so updates arrive, cache when offline
  if(req.mode==='navigate'){e.respondWith(fetch(req).then(res=>{const c=res.clone();caches.open(VERSION).then(x=>x.put('./index.html',c));return res}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(res=>{const c=res.clone();caches.open(VERSION).then(x=>x.put(req,c));return res})))});
