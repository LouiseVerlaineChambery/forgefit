// Denat Life Duo — synchronisation des courses entre deux appareils
(function(){
  const API="https://lv-social-publisher.jocelyn-denat.workers.dev/forge-sync";
  const HID_KEY="forgelife_household_id";
  const SECRET_KEY="forgelife_household_secret";
  const QUEUE_KEY="forgelife_sync_queue_v2";\n  const OFFSET=200;\n  const LIMIT=500;
  let syncing=false;
  let lastOk=0;

  function b64u(bytes){
    let s=""; bytes.forEach(b=>s+=String.fromCharCode(b));
    return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
  }
  function randomToken(n){const a=new Uint8Array(n);crypto.getRandomValues(a);return b64u(a);}
  function getIdentity(){
    let h=localStorage.getItem(HID_KEY),k=localStorage.getItem(SECRET_KEY);
    if(!h||!k){h=randomToken(18);k=randomToken(24);localStorage.setItem(HID_KEY,h);localStorage.setItem(SECRET_KEY,k);}
    return {h,k};
  }
  function acceptSharedIdentity(){
    const q=new URLSearchParams(location.search),h=q.get("hid"),k=q.get("key");
    if(h&&k&&/^[A-Za-z0-9_-]{16,80}$/.test(h)&&/^[A-Za-z0-9_-]{16,80}$/.test(k)){
      localStorage.setItem(HID_KEY,h);localStorage.setItem(SECRET_KEY,k);
      q.delete("hid");q.delete("key");
      history.replaceState(null,"",location.pathname+(q.toString()?`?${q}`:"")+location.hash);
    }
  }
  acceptSharedIdentity();
  getIdentity();

  function currentDay(){const b=document.querySelector(".ff-days button.active[data-day]");return b?+b.dataset.day:(new Date().getDay()+6)%7;}
  function weekDate(day,padded){
    const n=new Date(),cur=(n.getDay()+6)%7,m=new Date(n.getFullYear(),n.getMonth(),n.getDate()-cur+day);
    const mo=padded?String(m.getMonth()+1).padStart(2,"0"):String(m.getMonth()+1),d=padded?String(m.getDate()).padStart(2,"0"):String(m.getDate());
    return `${m.getFullYear()}-${mo}-${d}`;
  }
  function localKey(day){return `forgefit_shop_${weekDate(day,false)}`;}
  function headers(){const {h,k}=getIdentity();return {"x-forge-household":h,"authorization":`Bearer ${k}`,"content-type":"application/json"};}
  function same(a,b){return JSON.stringify([...(a||[])].sort((x,y)=>x-y))===JSON.stringify([...(b||[])].sort((x,y)=>x-y));}
  function readLocal(day){try{const a=JSON.parse(localStorage.getItem(localKey(day))||"[]");return Array.isArray(a)?a.map(Number).filter(Number.isInteger):[];}catch(e){return[];}}
  function writeLocal(day,a){localStorage.setItem(localKey(day),JSON.stringify([...new Set(a)].sort((x,y)=>x-y)));}
  function queue(){try{const a=JSON.parse(localStorage.getItem(QUEUE_KEY)||"[]");return Array.isArray(a)?a:[];}catch(e){return[];}}
  function saveQueue(a){localStorage.setItem(QUEUE_KEY,JSON.stringify(a.slice(-50)));}
  function addQueue(item){const a=queue().filter(x=>!(x.date===item.date&&x.index===item.index));a.push(item);saveQueue(a);}

  function setStatus(ok,text){
    const card=[...document.querySelectorAll("section.card")].find(c=>c.querySelector(".eyebrow")?.textContent?.includes("COURSES DU JOUR"));
    if(!card)return;
    let s=card.querySelector(".ff-sync-status");
    if(!s){s=document.createElement("div");s.className="ff-sync-status small";s.style.cssText="margin:8px 0 2px;display:flex;align-items:center;gap:7px;color:var(--muted)";const p=card.querySelector("p.muted");(p||card.firstElementChild)?.insertAdjacentElement("afterend",s);}
    s.innerHTML=`<span style="width:8px;height:8px;border-radius:50%;background:${ok?"var(--ok)":"var(--danger)"};display:inline-block"></span>${text|| (ok?"Courses synchronisées":"Hors ligne — synchronisation en attente")}`;
  }
  function applyDom(day,checked){
    if(route!=="meals"||currentDay()!==day)return;
    const boxes=[...document.querySelectorAll("[data-shop]")];
    if(!boxes.length)return;
    boxes.forEach(c=>{const i=+c.dataset.shop;c.checked=checked.includes(i);c.closest(".ff-shop")?.classList.toggle("done",checked.includes(i));});
    const card=boxes[0].closest("section.card"),pill=card?.querySelector(".row .pill");if(pill)pill.textContent=`${checked.length}/${boxes.length}`;
  }

  async function postToggle(day,index,checked,fromQueue=false){
    const date=weekDate(day,true);
    try{
      const r=await fetch(API,{method:"POST",headers:headers(),body:JSON.stringify({date,index:OFFSET+index,checked})});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      const d=await r.json();
      writeLocal(day,d.checked||[]);applyDom(day,d.checked||[]);lastOk=Date.now();setStatus(true,"Synchronisé entre vos deux téléphones");return true;
    }catch(e){if(!fromQueue)addQueue({day,date,index,checked,at:Date.now()});setStatus(false);return false;}
  }
  async function flushQueue(){
    const a=queue();if(!a.length)return true;
    const left=[];
    for(const item of a){const ok=await postToggle(+item.day,+item.index,item.checked,true);if(!ok)left.push(item);}
    saveQueue(left);return !left.length;
  }
  async function pull(day){
    if(syncing||document.hidden)return;syncing=true;
    try{
      await flushQueue();
      if(queue().length)return;
      const r=await fetch(`${API}?date=${encodeURIComponent(weekDate(day,true))}`,{headers:headers(),cache:"no-store"});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      const d=await r.json(),remote=(d.checked||[]).filter(i=>i>=OFFSET&&i<LIMIT).map(i=>i-OFFSET),local=readLocal(day);
      if(!same(remote,local)){writeLocal(day,remote);applyDom(day,remote);}
      lastOk=Date.now();setStatus(true,"Synchronisé entre vos deux téléphones");
    }catch(e){setStatus(false);}finally{syncing=false;}
  }

  async function shareDuo(){
    const {h,k}=getIdentity();
    const url=`${location.origin}${location.pathname}?view=meals&duo=1&hid=${encodeURIComponent(h)}&key=${encodeURIComponent(k)}`;
    if(navigator.share){try{await navigator.share({title:"Denat Life Duo",text:"Nos repas et notre liste de courses partagée",url});return;}catch(e){if(e?.name==="AbortError")return;}}
    try{await navigator.clipboard.writeText(url);alert("Lien Denat Life Duo copié.");}catch(e){prompt("Copie ce lien",url);}
  }

  document.addEventListener("change",e=>{
    const c=e.target.closest?.("[data-shop]");if(!c)return;
    const day=currentDay(),index=+c.dataset.shop,checked=c.checked;
    let a=readLocal(day);a=checked?[...new Set([...a,index])]:a.filter(x=>x!==index);writeLocal(day,a);
    postToggle(day,index,checked);
  },true);

  document.addEventListener("click",e=>{
    const share=e.target.closest?.("#share-duo");
    if(share){e.preventDefault();e.stopImmediatePropagation();shareDuo();return;}
    if(e.target.closest?.("[data-day], [data-v='shop']"))setTimeout(()=>pull(currentDay()),50);
  },true);

  const observer=new MutationObserver(()=>{
    if(route==="meals"&&document.querySelector("[data-shop]")){setStatus(Date.now()-lastOk<10000,lastOk?"Synchronisé entre vos deux téléphones":"Connexion à la liste partagée…");}
  });
  observer.observe(document.body,{childList:true,subtree:true});

  window.addEventListener("online",()=>pull(currentDay()));
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&route==="meals")pull(currentDay());});
  setInterval(()=>{if(route==="meals"&&document.querySelector("[data-shop]"))pull(currentDay());},2500);
  setTimeout(()=>{if(route==="meals")pull(currentDay());},500);
})();
