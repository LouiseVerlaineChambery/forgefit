// Denat Life Cloud — le serveur est la source de vérité, localStorage sert de cache hors ligne.
(function(){
  const API="https://lv-social-publisher.jocelyn-denat.workers.dev/denat-life/state";
  const HEALTH_API="https://lv-social-publisher.jocelyn-denat.workers.dev/denat-life/apple-health";
  const AUTH="denat_life_cloud_auth_v1";
  const MIGRATED_PREFIX="denat_life_cloud_migrated_";
  const TIMEOUT=3000;
  let revision=0,status="initialisation",suppress=false,timer=null;
  const dirty=new Set();
  const rawSet=Storage.prototype.setItem,rawRemove=Storage.prototype.removeItem;

  const tracked=k=>k==="forgefit_v2_state"||k.startsWith("denat_meal_")||k.startsWith("forgefit_shop_")||k.startsWith("forgelife_week_shop_");
  const b64u=a=>{let s="";a.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");};
  const random=n=>{const a=new Uint8Array(n);crypto.getRandomValues(a);return b64u(a);};
  function identity(){
    try{const x=JSON.parse(localStorage.getItem(AUTH)||"null");if(x?.h&&x?.k)return x;}catch{}
    const x={h:random(18),k:random(32)};rawSet.call(localStorage,AUTH,JSON.stringify(x));return x;
  }
  function acceptAccess(){
    const m=location.hash.match(/(?:^#|&)denat-access=([^&]+)/);if(!m)return;
    try{
      let b=decodeURIComponent(m[1]).replace(/-/g,"+").replace(/_/g,"/");while(b.length%4)b+="=";const s=atob(b);
      const x=JSON.parse(s);
      if(/^[A-Za-z0-9_-]{16,100}$/.test(x.h)&&/^[A-Za-z0-9_-]{16,100}$/.test(x.k))rawSet.call(localStorage,AUTH,JSON.stringify(x));
    }catch{}
    history.replaceState(null,"",location.pathname+location.search);
  }
  acceptAccess();

  function headers(){const x=identity();return {"x-denat-household":x.h,"authorization":`Bearer ${x.k}`,"content-type":"application/json"};}
  function snapshot(){const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&tracked(k))o[k]=localStorage.getItem(k)||"";}return o;}
  function parse(s,f){try{return JSON.parse(s);}catch{return f;}}
  function unionArray(a,b){return [...new Set([...(Array.isArray(a)?a:[]),...(Array.isArray(b)?b:[])])];}
  function sessionKey(s){return String(s?.id||s?.endedAt||s?.startedAt||"")+"|"+String(s?.name||"");}
  function mergeForge(remote,local){
    const r=parse(remote,{}),l=parse(local,{});
    const rs=Array.isArray(r.sessions)?r.sessions:[],ls=Array.isArray(l.sessions)?l.sessions:[];
    const richer=(ls.length+(l.activeSession?2:0))>(rs.length+(r.activeSession?2:0))?l:r;
    const other=richer===l?r:l,out={...other,...richer};
    const map=new Map();[...rs,...ls].forEach(s=>map.set(sessionKey(s),s));
    out.sessions=[...map.values()].sort((a,b)=>new Date(a.endedAt||a.startedAt||0)-new Date(b.endedAt||b.startedAt||0));
    if(!out.activeSession)out.activeSession=l.activeSession||r.activeSession||null;
    return JSON.stringify(out);
  }
  function mergeValue(k,r,l){
    if(r==null)return l;if(l==null)return r;if(r===l)return r;
    if(k==="forgefit_v2_state")return mergeForge(r,l);
    if(k==="denat_meal_favorites_v1"||k==="denat_meal_dislikes_v1")return JSON.stringify(unionArray(parse(r,[]),parse(l,[])));
    if(k==="denat_meal_overrides_v1")return JSON.stringify({...parse(r,{}),...parse(l,{})});
    if(k==="denat_meal_coach_v1"){
      const a=parse(r,{history:[],restaurants:[]}),b=parse(l,{history:[],restaurants:[]});
      const mergeRows=(x,y,limit)=>{const m=new Map();[...(Array.isArray(x)?x:[]),...(Array.isArray(y)?y:[])].forEach(v=>m.set(String(v?.at||"")+"|"+String(v?.person||"")+"|"+String(v?.q||v?.text||""),v));return [...m.values()].sort((x,y)=>new Date(x?.at||0)-new Date(y?.at||0)).slice(-limit);};
      return JSON.stringify({history:mergeRows(a.history,b.history,60),restaurants:mergeRows(a.restaurants,b.restaurants,90)});
    }
    if(k.startsWith("forgefit_shop_")||k.startsWith("forgelife_week_shop_"))return JSON.stringify(unionArray(parse(r,[]),parse(l,[])).map(Number).filter(Number.isInteger).sort((a,b)=>a-b));
    return r;
  }
  function mergeMaps(remote,local){
    const out={...remote};for(const [k,v] of Object.entries(local))out[k]=mergeValue(k,remote[k],v);return out;
  }
  function hydrate(map){
    suppress=true;
    try{
      const existing=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&tracked(k))existing.push(k);}
      existing.forEach(k=>{if(!(k in map))rawRemove.call(localStorage,k);});
      Object.entries(map).forEach(([k,v])=>rawSet.call(localStorage,k,String(v)));
    }finally{suppress=false;}
  }
  function setStatus(s){status=s;window.dispatchEvent(new CustomEvent("denat-cloud-status",{detail:{status:s}}));}
  async function req(method,body){
    const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),TIMEOUT);
    try{return await fetch(API,{method,headers:headers(),body:body?JSON.stringify(body):undefined,cache:"no-store",signal:ctl.signal});}
    finally{clearTimeout(to);}
  }
  async function pull(){
    const r=await req("GET");if(!r.ok)throw new Error("HTTP "+r.status);return r.json();
  }
  async function put(map,base){
    const r=await req("PUT",{state:map,baseRevision:base});
    if(r.status===409)return {conflict:true,...await r.json()};
    if(!r.ok)throw new Error("HTTP "+r.status);return r.json();
  }
  async function pushNow(){
    clearTimeout(timer);timer=null;
    try{
      setStatus("enregistrement");
      let local=snapshot(),res=await put(local,revision);
      if(res.conflict){
        const latest=await pull(),current=snapshot(),merged={...(latest.state||{})};
        for(const k of dirty)if(k in current)merged[k]=current[k];else delete merged[k];
        revision=Number(latest.revision||0);hydrate(merged);res=await put(merged,revision);
      }
      if(res.conflict)throw new Error("conflit");
      revision=Number(res.revision||revision);dirty.clear();setStatus("cloud");return true;
    }catch(e){setStatus("hors-ligne");return false;}
  }
  function schedule(){if(suppress)return;clearTimeout(timer);timer=setTimeout(pushNow,650);}
  Storage.prototype.setItem=function(k,v){rawSet.call(this,k,v);if(this===localStorage&&tracked(String(k))&&!suppress){dirty.add(String(k));schedule();}};
  Storage.prototype.removeItem=function(k){rawRemove.call(this,k);if(this===localStorage&&tracked(String(k))&&!suppress){dirty.add(String(k));schedule();}};

  async function init(){
    try{
      const remote=await pull(),local=snapshot(),id=identity(),migratedKey=MIGRATED_PREFIX+id.h;
      revision=Number(remote.revision||0);
      const already=localStorage.getItem(migratedKey)==="1";
      if(already&&remote.exists){
        hydrate(remote.state||{});setStatus("cloud");
      }else{
        const merged=mergeMaps(remote.state||{},local);
        hydrate(merged);
        let saved=true;
        if(!remote.exists||JSON.stringify(merged)!==JSON.stringify(remote.state||{})){Object.keys(merged).forEach(k=>dirty.add(k));saved=await pushNow();}
        else setStatus("cloud");
        if(saved)rawSet.call(localStorage,migratedKey,"1");
      }
    }catch(e){setStatus("hors-ligne");}
    return status;
  }
  function accessLink(){
    const x=identity(),raw=btoa(JSON.stringify(x)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
    return location.origin+location.pathname+"#denat-access="+encodeURIComponent(raw);
  }
  async function shareAccess(){
    const url=accessLink();
    if(navigator.share){try{await navigator.share({title:"Denat Life",text:"Accès à mon Denat Life",url});return true;}catch(e){if(e?.name==="AbortError")return false;}}
    try{await navigator.clipboard.writeText(url);alert("Lien d’accès Denat Life copié.");return true;}catch{prompt("Copie ce lien d’accès Denat Life",url);return false;}
  }
  function healthConfig(){const x=identity();return {url:HEALTH_API,household:x.h,authorization:`Bearer ${x.k}`};}
  async function healthStatus(){
    const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),TIMEOUT);
    try{
      const r=await fetch(HEALTH_API,{method:"GET",headers:headers(),cache:"no-store",signal:ctl.signal});
      if(!r.ok)throw new Error("HTTP "+r.status);
      return await r.json();
    }finally{clearTimeout(to);}
  }
  async function copyHealthConfig(){
    const x=healthConfig(),value=`URL : ${x.url}\nX-Denat-Household : ${x.household}\nAuthorization : ${x.authorization}`;
    try{await navigator.clipboard.writeText(value);return true;}catch{prompt("Configuration Apple Santé",value);return false;}
  }
  window.addEventListener("online",()=>{init().catch(()=>{});});
  window.DenatCloud={init,pushNow,pull,shareAccess,accessLink,healthConfig,healthStatus,copyHealthConfig,get status(){return status;}};
})();