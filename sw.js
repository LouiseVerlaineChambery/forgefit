const CACHE="denat-life-v14-3-personal-profiles";
const ASSETS=["./","./index.html","./styles.css","./denat-life-theme.css","./meals-warm-v1.css","./brand-v11.css","./cloud-state.js","./boot.js","./profiles.js","./app.js","./mybodynote.js","./training-plan.js","./metrics.js","./exercise-guide.js","./forgefit-v3.js","./health-coach.js","./sport-coach.js","./meal-engine.js","./meal-coach.js","./meals.js","./entry-links.js","./split-theme.js","./dashboard.js","./navigation-v11.js","./weekly-menu.json","./manifest.json","./brand-logo-v5.svg","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(u.origin!==self.location.origin)return;
  const fallback=()=>caches.match(e.request,{ignoreSearch:true}).then(x=>x||caches.match("./index.html"));
  e.respondWith(
    fetch(e.request,{cache:"no-store"}).then(r=>{
      if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
      return r;
    }).catch(fallback)
  );
});