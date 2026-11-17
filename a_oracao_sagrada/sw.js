const CACHE='oracao-sagrada-v1';
const ASSETS=[
  './','./index.html','./oferta.html','./site.css','./app.js','./oferta.js','./config.js','./conteudo.js',
  './assets/favicon.svg','./assets/icon-192.png','./assets/icon-512.png',
  './assets/hero-oracao.png','./assets/pilar-oracao.png','./assets/pilar-manuscrito.png','./assets/pilar-colecao.png',
  './assets/bonus-biblia.png','./assets/bonus-vitalidade.png','./assets/bonus-cantico.png'
];
self.addEventListener('install', event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  if(new URL(event.request.url).pathname.includes('/audios/'))return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}
    return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});
