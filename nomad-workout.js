// Denat Life V24 — séances Hôtel / Nomade selon temps et matériel.
(function(){
  const lib=()=>window.DenatExerciseLibrary;
  const cfg={duration:30,equipment:new Set()};
  const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const slots=[
    {role:"jambes",choices:["Goblet squat","Fentes bulgares","Fentes arrière","Squat au poids du corps"]},
    {role:"poussée",choices:["Développé couché haltères","Pompes pieds surélevés","Pompes","Pompes serrées"]},
    {role:"tirage",choices:["Tractions pronation","Rowing haltère","Rowing élastique","Reverse snow angel"]},
    {role:"chaîne postérieure",choices:["Soulevé de terre roumain haltères","Pont fessier au sol"]},
    {role:"épaules",choices:["Développé épaules haltères","Élévations latérales haltères","Oiseau haltères"]},
    {role:"jambes 2",choices:["Fentes marchées","Fentes arrière","Mollets debout"]},
    {role:"abdos",choices:["Planche","Reverse crunch","Dead bug"]},
    {role:"finisher",choices:["Mountain climbers","Curl haltères","Curl élastique","Pompes serrées"]}
  ];
  const counts={15:4,30:6,45:8};
  function available(def){
    if(!def||def.equipment.includes("Machine")||def.equipment.includes("Poulie")||def.equipment.includes("Barre"))return false;
    return def.equipment.every(e=>e==="Poids du corps"||cfg.equipment.has(e));
  }
  function pick(){
    const L=lib();if(!L)return [];
    const chosen=[],used=new Set();
    for(const slot of slots){
      const def=slot.choices.map(n=>L.find(n)).find(d=>d&&!used.has(d.id)&&available(d));
      if(def){chosen.push(def);used.add(def.id);}
      if(chosen.length>=counts[cfg.duration])break;
    }
    const fallback=L.exercises.filter(d=>available(d)&&!used.has(d.id));
    for(const d of fallback){if(chosen.length>=counts[cfg.duration])break;chosen.push(d);used.add(d.id);}
    return chosen.slice(0,counts[cfg.duration]);
  }
  function plan(){
    const defs=pick(),sets=cfg.duration===15?2:cfg.duration===45?4:3;
    return defs.map((d,i)=>{
      const ex=lib().toExercise(d);
      ex.targetSets=(d.group==="Abdos"||d.name.includes("Mollets"))?Math.min(sets,3):sets;
      ex.targetReps=d.name.includes("Planche")?35:d.name.includes("Mountain")?20:Math.max(d.reps,10);
      ex.rest=cfg.duration===15?45:Math.min(d.rest,75);
      ex.nomad=true;ex.nomadRole=slots[i]?.role||d.group;
      return ex;
    });
  }
  function start(){
    const exercises=plan();if(!exercises.length)return;
    state.activeSession={
      id:crypto.randomUUID(),workoutId:null,workoutName:`Nomade · ${cfg.duration} min`,
      source:"nomad",nomad:{duration:cfg.duration,equipment:[...cfg.equipment],generatedAt:new Date().toISOString()},
      startedAt:new Date().toISOString(),
      exercises:exercises.map(ex=>({...ex,suggestedWeight:0,sets:Array.from({length:+ex.targetSets},(_,i)=>({id:crypto.randomUUID(),index:i+1,weight:"",reps:ex.targetReps,rpe:"",done:false}))}))
    };
    saveState();document.querySelector(".dl-nomad-modal")?.remove();render();
  }
  function modal(){
    document.querySelector(".dl-nomad-modal")?.remove();
    const m=document.createElement("div");m.className="ff-modal dl-nomad-modal";
    const equipment=["Haltères","Élastique","Banc","Barre de traction"];
    m.innerHTML=`<div class="ff-modal-card"><div class="row"><div><div class="eyebrow">MODE HÔTEL / NOMADE</div><h2 style="margin-top:5px">Construire ma séance</h2></div><button class="ghost" data-nomad-close>Fermer</button></div>
      <p class="muted small">Aucune machine nécessaire. Choisis simplement ce que tu as sous la main.</p>
      <div class="eyebrow" style="margin:14px 0 8px">TEMPS DISPONIBLE</div>
      <div class="segment dl-nomad-time">${[15,30,45].map(x=>`<button type="button" data-min="${x}" class="${cfg.duration===x?"active":""}">${x} min</button>`).join("")}</div>
      <div class="eyebrow" style="margin:16px 0 8px">MATÉRIEL DISPONIBLE</div>
      <div class="dl-nomad-equipment"><button type="button" class="secondary active" data-bodyweight>Poids du corps ✓</button>${equipment.map(x=>`<button type="button" class="secondary ${cfg.equipment.has(x)?"active":""}" data-equip="${x}">${x}</button>`).join("")}</div>
      <div data-nomad-preview style="margin-top:16px"></div>
      <button class="primary full" data-nomad-start>Démarrer cette séance</button></div>`;
    document.body.appendChild(m);
    const preview=()=>{
      const p=plan();
      m.querySelector("[data-nomad-preview]").innerHTML=`<div class="notice small"><b>${p.length} exercices · Full Body</b><br>${p.map(x=>x.name).join(" · ")}</div>`;
    };
    m.querySelectorAll("[data-min]").forEach(b=>b.onclick=()=>{cfg.duration=+b.dataset.min;m.querySelectorAll("[data-min]").forEach(x=>x.classList.toggle("active",x===b));preview();});
    m.querySelectorAll("[data-equip]").forEach(b=>b.onclick=()=>{const e=b.dataset.equip;cfg.equipment.has(e)?cfg.equipment.delete(e):cfg.equipment.add(e);b.classList.toggle("active",cfg.equipment.has(e));preview();});
    m.querySelector("[data-bodyweight]").onclick=()=>{};
    m.querySelector("[data-nomad-close]").onclick=()=>m.remove();m.onclick=e=>{if(e.target===m)m.remove();};
    m.querySelector("[data-nomad-start]").onclick=start;preview();
  }
  function muscleSets(days=7){
    const since=Date.now()-days*86400000,out={};
    (state.sessions||[]).filter(s=>new Date(s.endedAt||0).getTime()>=since).forEach(s=>(s.exercises||[]).forEach(ex=>{
      const done=(ex.sets||[]).filter(x=>x.done).length;if(!done)return;
      const muscles=ex.muscles?.length?ex.muscles:(lib()?.find(ex.name)?.muscles||[]);
      muscles.slice(0,2).forEach((m,i)=>out[m]=(out[m]||0)+done*(i===0?1:.5));
    }));
    return Object.entries(out).sort((a,b)=>b[1]-a[1]);
  }
  function injectToday(){
    if(state.activeSession)return;
    const hero=view.querySelector(".hero");if(!hero||view.querySelector(".dl-nomad-card"))return;
    const top=muscleSets(7).slice(0,4);
    const card=document.createElement("section");card.className="card dl-nomad-card";
    card.innerHTML=`<div class="row"><div><div class="eyebrow">HÔTEL / DÉPLACEMENT</div><h3 style="margin-top:6px">Séance sans machine</h3></div><span class="pill">15 · 30 · 45 min</span></div><p class="muted small">Poids du corps seul ou ajoute haltères, élastique, banc ou barre de traction. Cette séance compte dans ton travail musculaire mais ne change pas ta rotation ni tes charges de référence.</p><button class="secondary full" data-nomad-open>Créer une séance nomade</button>${top.length?`<div class="small muted" style="margin-top:10px">7 derniers jours · ${top.map(([m,v])=>`${m} ${Math.round(v)} séries eq.`).join(" · ")}</div>`:""}`;
    hero.insertAdjacentElement("afterend",card);card.querySelector("[data-nomad-open]").onclick=modal;
  }
  function injectActive(){
    if(state.activeSession?.source!=="nomad")return;
    const hero=view.querySelector(".hero");if(!hero||view.querySelector(".dl-nomad-active"))return;
    const note=document.createElement("div");note.className="notice dl-nomad-active";note.style.marginBottom="12px";
    const eq=state.activeSession.nomad?.equipment||[];
    note.innerHTML=`<b>Séance nomade</b><br><span class="small">Matériel : ${eq.length?eq.join(" + "):"poids du corps uniquement"} · Cette séance reste séparée de la progression de charge de ton programme principal.</span>`;
    hero.insertAdjacentElement("afterend",note);
  }
  const baseToday=renderToday;renderToday=function(){baseToday();injectToday();};
  const baseActive=renderActiveSession;renderActiveSession=function(){baseActive();injectActive();};

  const style=document.createElement("style");style.textContent=`
    .dl-nomad-equipment{display:grid;grid-template-columns:1fr 1fr;gap:8px}.dl-nomad-equipment button.active{border-color:var(--accent);color:var(--accent2);background:rgba(59,130,246,.16)}
    .dl-nomad-time{grid-template-columns:repeat(3,1fr)!important}@media(max-width:420px){.dl-nomad-equipment{grid-template-columns:1fr}}
  `;document.head.appendChild(style);
  window.DenatNomad={plan,start,modal,muscleSets,config:cfg};
  render();
})();