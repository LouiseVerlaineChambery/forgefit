// Denat Life — V19 Timeline : saisie naturelle antidatée + navigation quotidienne.
(function(){
  const DAY=86400000;
  const DAYS=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
  const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const start=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x;};
  function parseWhen(text,now=new Date()){
    const n=norm(text),d=new Date(now);let explicit=false;
    const explicitDate=n.match(/\b(?:le|du)\s+(\d{1,2})[\/. -](\d{1,2})(?:[\/. -](\d{2,4}))?\b/);
    const ago=n.match(/\bil y a\s+(\d{1,3})\s+jours?\b/);
    if(explicitDate){
      const day=+explicitDate[1],month=+explicitDate[2]-1,rawYear=explicitDate[3],year=rawYear?(+rawYear<100?2000+(+rawYear):+rawYear):d.getFullYear();
      const candidate=new Date(year,month,day,d.getHours(),d.getMinutes(),0,0);
      if(candidate.getFullYear()===year&&candidate.getMonth()===month&&candidate.getDate()===day){d.setTime(candidate.getTime());explicit=true;}
    }
    else if(ago){d.setDate(d.getDate()-Math.min(365,+ago[1]));explicit=true;}
    else if(/avant[- ]hier/.test(n)){d.setDate(d.getDate()-2);explicit=true;}
    else if(/hier/.test(n)){d.setDate(d.getDate()-1);explicit=true;}
    else{
      for(let i=1;i<DAYS.length;i++){
        if(new RegExp(`\\b${DAYS[i]}\\b`).test(n)){
          let diff=(d.getDay()-i+7)%7;
          if(diff===0&&/dernier|derniere/.test(n))diff=7;
          d.setDate(d.getDate()-diff);explicit=true;break;
        }
      }
      if(/dimanche/.test(n)){
        let diff=d.getDay()%7;if(diff===0&&/dernier|derniere/.test(n))diff=7;
        d.setDate(d.getDate()-diff);explicit=true;
      }
    }
    let h=null,m=0;
    const hm=n.match(/(?:a|vers)?\s*(\d{1,2})\s*h\s*(\d{1,2})?/);
    if(hm){h=Math.min(23,+hm[1]);m=Math.min(59,+(hm[2]||0));explicit=true;}
    else if(/ce matin|matin/.test(n)){h=8;m=30;explicit=true;}
    else if(/ce midi|midi/.test(n)){h=12;m=30;explicit=true;}
    else if(/apres[- ]?midi/.test(n)){h=16;m=0;explicit=true;}
    else if(/ce soir|soir/.test(n)){h=20;m=30;explicit=true;}
    if(h!=null)d.setHours(h,m,0,0);
    else if(explicit)d.setHours(now.getHours(),now.getMinutes(),0,0);
    return {date:d,iso:d.toISOString(),explicit,label:new Intl.DateTimeFormat("fr-FR",{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"}).format(d)};
  }
  function mealStatement(text){
    const n=norm(text);
    if(/j ai mange|jai mange|j ai pris|jai pris|j ai bu|jai bu|repas|petit.?dej|dejeuner|diner|collation|gouter/.test(n))return true;
    const foods=["oeuf","skyr","yaourt","poulet","dinde","boeuf","saumon","thon","cabillaud","riz","pates","quinoa","pain","fromage","jambon","avocat","banane","pomme","burger","pizza","sushi","kebab","tacos","salade","sandwich"];
    return /ce matin|ce midi|ce soir|hier|avant-hier/.test(n)&&foods.some(x=>n.includes(x));
  }
  function sportStatement(text){
    const n=norm(text);
    return /(j ai fait|jai fait|j ai eu|jai eu).*(sport|seance|entrain|muscu)|(?:sport|seance|entrainement|muscu).*(hier|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|matin|midi|soir|\d{1,2}\s*h)/.test(n);
  }
  function workoutName(text){
    const n=norm(text),program=typeof state!=="undefined"&&Array.isArray(state.program)?state.program:[];
    const exact=program.find(w=>n.includes(norm(w.name)));
    if(exact)return exact.name;
    if(/push/.test(n))return program.find(w=>/push/i.test(w.name))?.name||"Push";
    if(/pull/.test(n))return program.find(w=>/pull/i.test(w.name))?.name||"Pull";
    if(/jambe|legs/.test(n))return program.find(w=>/jambe|legs/i.test(w.name))?.name||"Jambes";
    const reprise=n.match(/reprise\s*([abc])/);if(reprise)return `Reprise ${reprise[1].toUpperCase()}`;
    return "Séance (saisie manuelle)";
  }
  function recordSport(text){
    if(typeof state==="undefined"||!Array.isArray(state.sessions))return null;
    const when=parseWhen(text),ended=new Date(when.iso),started=new Date(ended.getTime()-60*60000),name=workoutName(text);
    const s={id:crypto.randomUUID(),workoutId:"manual",workoutName:name,startedAt:started.toISOString(),endedAt:ended.toISOString(),exercises:[],source:"manual-timeline",note:text};
    state.sessions.push(s);if(typeof saveState==="function")saveState();
    return {kind:"sport",item:s,when};
  }
  function recordMeal(text){
    const when=parseWhen(text),e=window.DenatNutrition?.estimate?.(text),item=window.DenatNutrition?.add?.(text,{at:when.iso,kcalRange:e?.kcal,proteinRange:e?.protein,confidence:e?.confidence});
    return item?{kind:"meal",item,when}:null;
  }
  function recordWellbeing(text){return window.DenatWellbeing?.record?.(text)||null;}
  function record(text){
    if(sportStatement(text))return recordSport(text);
    if(window.DenatWellbeing?.parse?.(text))return recordWellbeing(text);
    if(mealStatement(text))return recordMeal(text);
    return null;
  }
  function removeEvent(kind,id){
    if(kind==="meal"){
      const item=(window.DenatNutrition?.read?.()||[]).find(x=>x.id===id);if(!item)return null;
      window.DenatNutrition?.remove?.(id);return {kind,item};
    }
    if(kind==="wellbeing"){
      const item=(window.DenatWellbeing?.read?.()||[]).find(x=>x.id===id);if(!item)return null;
      return window.DenatWellbeing?.remove?.(id)?{kind,item}:null;
    }
    if(kind==="sport"&&typeof state!=="undefined"){
      const item=state.sessions.find(x=>x.id===id);if(!item)return null;
      state.sessions=state.sessions.filter(x=>x.id!==id);if(typeof saveState==="function")saveState();return {kind,item};
    }
    return null;
  }
  function restoreEvent(removed){
    if(!removed?.item)return false;
    if(removed.kind==="meal")return window.DenatNutrition?.restore?.(removed.item)||false;
    if(removed.kind==="wellbeing")return window.DenatWellbeing?.restore?.(removed.item)||false;
    if(removed.kind==="sport"&&typeof state!=="undefined"){
      if(!state.sessions.some(x=>x.id===removed.item.id))state.sessions.push(removed.item);
      state.sessions.sort((a,b)=>new Date(a.endedAt||a.startedAt||0)-new Date(b.endedAt||b.startedAt||0));
      if(typeof saveState==="function")saveState();return true;
    }
    return false;
  }
  function dayData(offset=0){
    const d=new Date();d.setDate(d.getDate()+offset);const from=start(d),to=new Date(from.getTime()+DAY);
    const memory=window.DenatMemory;
    const meals=(window.DenatNutrition?.read?.()||[]).filter(x=>{const t=new Date(x.at);return t>=from&&t<to;});
    const sessions=(typeof state!=="undefined"?state.sessions:[]).filter(x=>x?.endedAt&&new Date(x.endedAt)>=from&&new Date(x.endedAt)<to);
    const wellbeing=(window.DenatWellbeing?.read?.()||[]).filter(x=>{const t=new Date(x.at);return t>=from&&t<to;});
    const events=[
      ...meals.map(x=>({kind:"meal",id:x.id,at:x.at,title:x.mealType||"Repas",text:x.text,meta:Array.isArray(x.kcalRange)?`≈ ${x.kcalRange[0]}–${x.kcalRange[1]} kcal`:""})),
      ...sessions.map(x=>({kind:"sport",id:x.id,at:x.endedAt,title:"Sport",text:x.workoutName||"Séance",meta:x.source==="manual-timeline"?"Saisie manuelle":"Séance terminée"})),
      ...wellbeing.map(x=>({kind:"wellbeing",id:x.id,at:x.at,title:window.DenatWellbeing?.label?.(x)||"Équilibre",text:window.DenatWellbeing?.valueText?.(x)||String(x.value??""),meta:x.note&&x.note!==String(x.value)?"Saisie personnelle":""}))
    ].sort((a,b)=>new Date(a.at)-new Date(b.at));
    return {date:d,from,to,events,label:memory?.dayLabel?.(d)||new Intl.DateTimeFormat("fr-FR",{weekday:"long",day:"numeric",month:"long"}).format(d)};
  }
  function render(offset=0){
    const d=dayData(offset),today=offset===0;
    return `<div class="dlt-head"><button class="ghost" data-dlt-nav="-1">‹</button><div><div class="eyebrow">TIMELINE</div><h2>${esc(d.label)}</h2></div><button class="ghost" data-dlt-nav="1" ${today?"disabled":""}>›</button></div>
      <div class="dlt-quick"><button data-dlt-fill="Ce matin ">Ce matin</button><button data-dlt-fill="Ce midi ">Ce midi</button><button data-dlt-fill="Hier soir ">Hier soir</button><button data-dlt-fill="J’ai fait ma séance hier à 18h">Sport passé</button><button data-dlt-fill="Poids  kg">Poids</button><button data-dlt-fill="J’ai dormi  h ">Sommeil</button><button data-dlt-fill="Énergie  /10">Énergie</button></div>
      <div class="dlt-capture"><textarea id="dlt-input" rows="3" placeholder="Ex. Hier soir j’ai mangé une pizza · Poids 82,4 kg · J’ai dormi 7h30 · Énergie 8/10"></textarea><button class="primary full" id="dlt-add">Ajouter à ma mémoire</button><div id="dlt-feedback"></div></div>
      <div class="dlt-events">${d.events.length?d.events.map(e=>`<div class="dlt-event ${e.kind}"><div class="dlt-time">${new Intl.DateTimeFormat("fr-FR",{hour:"2-digit",minute:"2-digit"}).format(new Date(e.at))}</div><div><span>${esc(e.title)}</span><b>${esc(e.text)}</b><small>${esc(e.meta)}</small></div><button class="ghost" data-dlt-delete="${esc(e.id)}" data-kind="${e.kind}">×</button></div>`).join(""):`<div class="empty">Aucun événement enregistré ce jour-là.</div>`}</div>
      <p class="muted small">La timeline affiche uniquement les faits enregistrés. Une saisie antidatée est rangée au jour et à l’heure compris dans ta phrase.</p>`;
  }
  let currentOffset=0;
  function open(offset=0){
    currentOffset=Math.min(0,offset);
    let sheet=document.querySelector("#dlt-sheet");
    if(!sheet){sheet=document.createElement("div");sheet.id="dlt-sheet";sheet.className="dlt-sheet";sheet.innerHTML='<div class="dlt-backdrop" data-dlt-close></div><section class="dlt-panel"><button class="dlt-close" data-dlt-close>×</button><div id="dlt-body"></div><div id="dlt-undo" class="dlt-undo" hidden></div></section>';document.body.appendChild(sheet);}
    sheet.classList.add("open");paint();
  }
  let undoTimer=null;
  function showUndo(removed){
    const box=document.querySelector("#dlt-undo");if(!box||!removed)return;
    clearTimeout(undoTimer);box.hidden=false;box.innerHTML='<span>Élément supprimé</span><button class="ghost" id="dlt-undo-btn">Annuler</button>';
    box.querySelector("#dlt-undo-btn")?.addEventListener("click",()=>{if(restoreEvent(removed)){window.DenatCloud?.pushNow?.().catch?.(()=>{});paint();}box.hidden=true;clearTimeout(undoTimer);});
    undoTimer=setTimeout(()=>{box.hidden=true;},6000);
  }
  function paint(){
    const sheet=document.querySelector("#dlt-sheet"),body=sheet?.querySelector("#dlt-body");if(!body)return;
    body.innerHTML=render(currentOffset);
    body.querySelectorAll("[data-dlt-nav]").forEach(b=>b.addEventListener("click",()=>{currentOffset=Math.min(0,currentOffset+(+b.dataset.dltNav));paint();}));
    const input=body.querySelector("#dlt-input"),feedback=body.querySelector("#dlt-feedback");
    body.querySelectorAll("[data-dlt-fill]").forEach(b=>b.addEventListener("click",()=>{input.value=b.dataset.dltFill;input.focus();}));
    body.querySelector("#dlt-add")?.addEventListener("click",()=>{
      const q=input.value.trim();if(!q)return;const r=record(q);
      if(!r){feedback.innerHTML='<div class="notice small">Je n’ai pas reconnu la saisie. Essaie « Hier soir j’ai mangé… », « J’ai fait ma séance lundi à 18h », « Poids 82,4 kg », « J’ai dormi 7h30 » ou « Énergie 8/10 ».</div>';return;}
      window.DenatCloud?.pushNow?.().catch?.(()=>{});
      const target=start(new Date(r.when.iso)),today=start(new Date());currentOffset=Math.min(0,Math.round((target-today)/DAY));paint();
    });
    body.querySelectorAll("[data-dlt-delete]").forEach(b=>b.addEventListener("click",()=>{const removed=removeEvent(b.dataset.kind,b.dataset.dltDelete);if(!removed)return;window.DenatCloud?.pushNow?.().catch?.(()=>{});paint();showUndo(removed);}));
  }
  function close(){document.querySelector("#dlt-sheet")?.classList.remove("open");}
  document.addEventListener("click",e=>{if(e.target?.matches?.("[data-dlt-close]"))close();});
  const style=document.createElement("style");
  style.textContent=`.dlt-sheet{position:fixed;inset:0;z-index:999;display:none}.dlt-sheet.open{display:block}.dlt-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(6px)}.dlt-panel{position:absolute;left:0;right:0;bottom:0;max-height:92vh;overflow:auto;background:#111113;border-radius:24px 24px 0 0;padding:22px 16px 34px;border-top:1px solid var(--line)}.dlt-close{position:absolute;right:14px;top:12px;border:0;background:transparent;color:var(--muted);font-size:28px}.dlt-head{display:grid;grid-template-columns:44px 1fr 44px;align-items:center;text-align:center;gap:8px}.dlt-head h2{margin:4px 0 12px}.dlt-quick{display:flex;gap:7px;overflow:auto;margin:8px 0 12px}.dlt-quick button{white-space:nowrap;border:1px solid var(--line);background:transparent;color:var(--text);border-radius:999px;padding:8px 10px;font-size:11px}.dlt-capture textarea{width:100%;box-sizing:border-box;background:#0d0d0f;color:var(--text);border:1px solid var(--line);border-radius:14px;padding:12px;font:inherit;resize:vertical;margin-bottom:8px}.dlt-events{margin-top:14px}.dlt-event{display:grid;grid-template-columns:48px 1fr 34px;gap:10px;align-items:start;padding:12px 0;border-bottom:1px solid var(--line)}.dlt-event>div:nth-child(2) span,.dlt-event>div:nth-child(2) b,.dlt-event>div:nth-child(2) small{display:block}.dlt-event span{font-size:9px;letter-spacing:.08em;color:var(--accent2);text-transform:uppercase}.dlt-event b{font-size:12px;line-height:1.4;margin-top:3px}.dlt-event small{color:var(--muted);font-size:10px;margin-top:4px}.dlt-time{font-size:11px;font-weight:750}.dlt-event.sport{border-left:2px solid var(--accent);padding-left:10px}.dlt-event.wellbeing{border-left:2px solid var(--accent2);padding-left:10px}.dlt-undo{position:sticky;bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:10px;margin:14px 0 0;padding:10px 12px;border:1px solid var(--line);border-radius:14px;background:#1a1a1d;box-shadow:0 10px 30px rgba(0,0,0,.35);font-size:12px}.dlt-undo[hidden]{display:none}`;
  document.head.appendChild(style);
  window.DenatTimeline={parseWhen,mealStatement,sportStatement,record,recordMeal,recordSport,recordWellbeing,removeEvent,restoreEvent,dayData,open,close};
})();