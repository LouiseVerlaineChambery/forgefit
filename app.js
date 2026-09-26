const STORAGE_KEY = "forgefit_v2_state";
const DEFAULT_STATE = {
  version: 2,
  settings: {
    name: "",
    unit: "kg",
    upperIncrement: 2.5,
    lowerIncrement: 5,
    defaultRest: 90
  },
  program: [
    {
      id: crypto.randomUUID(),
      name: "Push",
      exercises: [
        {id:crypto.randomUUID(), name:"Développé couché", targetSets:4, targetReps:8, rest:120, category:"upper"},
        {id:crypto.randomUUID(), name:"Développé incliné haltères", targetSets:3, targetReps:10, rest:90, category:"upper"},
        {id:crypto.randomUUID(), name:"Élévations latérales", targetSets:3, targetReps:15, rest:60, category:"upper"},
        {id:crypto.randomUUID(), name:"Extension triceps poulie", targetSets:3, targetReps:12, rest:60, category:"upper"}
      ]
    },
    {
      id: crypto.randomUUID(),
      name: "Pull",
      exercises: [
        {id:crypto.randomUUID(), name:"Tirage vertical", targetSets:4, targetReps:10, rest:90, category:"upper"},
        {id:crypto.randomUUID(), name:"Rowing poulie basse", targetSets:4, targetReps:10, rest:90, category:"upper"},
        {id:crypto.randomUUID(), name:"Oiseau poulie", targetSets:3, targetReps:15, rest:60, category:"upper"},
        {id:crypto.randomUUID(), name:"Curl incliné", targetSets:3, targetReps:12, rest:60, category:"upper"}
      ]
    },
    {
      id: crypto.randomUUID(),
      name: "Jambes",
      exercises: [
        {id:crypto.randomUUID(), name:"Squat", targetSets:4, targetReps:8, rest:150, category:"lower"},
        {id:crypto.randomUUID(), name:"Presse à cuisses", targetSets:4, targetReps:10, rest:120, category:"lower"},
        {id:crypto.randomUUID(), name:"Leg curl", targetSets:3, targetReps:12, rest:75, category:"lower"},
        {id:crypto.randomUUID(), name:"Mollets", targetSets:4, targetReps:15, rest:60, category:"lower"}
      ]
    }
  ],
  sessions: [],
  activeSession: null
};

let state = loadState();
let route = "today";
let deferredPrompt = null;
let timerEnd = null;
let timerInterval = null;

const view = document.querySelector("#view");
const title = document.querySelector("#screen-title");

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return structuredClone(DEFAULT_STATE);
    return Object.assign(structuredClone(DEFAULT_STATE), JSON.parse(raw));
  }catch(e){
    return structuredClone(DEFAULT_STATE);
  }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function fmtDate(iso){return new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(iso));}
function roundTo(x,step){return Math.round(x/step)*step;}
function sessionVolume(s){return s.exercises.reduce((a,e)=>a+e.sets.filter(x=>x.done).reduce((b,x)=>b+(+x.weight||0)*(+x.reps||0),0),0);}
function completedSets(s){return s.exercises.reduce((a,e)=>a+e.sets.filter(x=>x.done).length,0);}
function lastExercisePerformance(name){
  const sessions=[...state.sessions].sort((a,b)=>new Date(b.endedAt)-new Date(a.endedAt));
  for(const s of sessions){
    const ex=s.exercises.find(e=>e.name===name);
    if(ex && ex.sets.some(x=>x.done)) return ex;
  }
  return null;
}
function suggestWeight(ex){
  const last=lastExercisePerformance(ex.name);
  if(!last) return 0;
  const done=last.sets.filter(s=>s.done);
  if(!done.length) return 0;
  const base=Math.max(...done.map(s=>+s.weight||0));
  const avgRpe=done.reduce((a,s)=>a+(+s.rpe||8),0)/done.length;
  const hitReps=done.every(s=>(+s.reps||0) >= (+ex.targetReps||0));
  const step=ex.category==="lower"?+state.settings.lowerIncrement:+state.settings.upperIncrement;
  if(hitReps && avgRpe<=8) return roundTo(base+step,step);
  if(avgRpe>=9.5) return Math.max(0,roundTo(base-step,step));
  return base;
}
function estimated1RM(weight,reps){
  if(!weight||!reps) return 0;
  return weight*(1+reps/30);
}
function allExerciseNames(){
  const set=new Set();
  state.program.forEach(d=>d.exercises.forEach(e=>set.add(e.name)));
  state.sessions.forEach(s=>s.exercises.forEach(e=>set.add(e.name)));
  return [...set].sort((a,b)=>a.localeCompare(b,"fr"));
}
function setRoute(r){
  route=r;
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.route===r));
  render();
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>setRoute(b.dataset.route)));

function render(){
  if(route==="today"){title.textContent="Aujourd’hui"; renderToday();}
  if(route==="program"){title.textContent="Programme"; renderProgram();}
  if(route==="history"){title.textContent="Progression"; renderHistory();}
  if(route==="settings"){title.textContent="Réglages"; renderSettings();}
}

function nextWorkoutIndex(){
  if(!state.sessions.length) return 0;
  const lastName=state.sessions[state.sessions.length-1]?.workoutName;
  const idx=state.program.findIndex(x=>x.name===lastName);
  return idx<0?0:(idx+1)%state.program.length;
}

function renderToday(){
  if(state.activeSession){renderActiveSession();return;}
  const idx=nextWorkoutIndex();
  const w=state.program[idx];
  const last7=state.sessions.filter(s=>Date.now()-new Date(s.endedAt).getTime()<7*86400000);
  const vol=Math.round(last7.reduce((a,s)=>a+sessionVolume(s),0));
  const sets=last7.reduce((a,s)=>a+completedSets(s),0);
  const coach=coachMessage();
  view.innerHTML=`
    <section class="card hero">
      <div class="eyebrow">PROCHAINE SÉANCE</div>
      <div class="hero-title">${esc(w?.name||"Aucun programme")}</div>
      <p class="muted">${w ? `${w.exercises.length} exercices · progression automatique selon tes dernières performances` : "Crée d’abord un programme."}</p>
      ${w?`<button class="primary full" id="start-workout">Démarrer la séance</button>`:""}
    </section>
    <section class="card">
      <div class="row"><h3>Cette semaine</h3><span class="pill">${last7.length} séance${last7.length>1?"s":""}</span></div>
      <div class="stat-grid">
        <div class="stat"><b>${last7.length}</b><span>Séances</span></div>
        <div class="stat"><b>${sets}</b><span>Séries</span></div>
        <div class="stat"><b>${vol.toLocaleString("fr-FR")}</b><span>kg déplacés</span></div>
      </div>
    </section>
    <section class="card">
      <div class="eyebrow">COACH LOCAL</div>
      <h3 style="margin-top:6px">Conseil du jour</h3>
      <p>${esc(coach)}</p>
      <div class="notice">La V2 utilise pour l’instant des règles locales. Le futur coach IA pourra reprendre cet emplacement sans modifier tes données.</div>
    </section>`;
  document.querySelector("#start-workout")?.addEventListener("click",()=>startWorkout(w));
}

function coachMessage(){
  if(!state.sessions.length) return "Commence par quelques séances. L’application utilisera ensuite tes charges, répétitions et RPE pour ajuster les recommandations.";
  const last=state.sessions[state.sessions.length-1];
  const avgRpe=(()=>{const a=last.exercises.flatMap(e=>e.sets).filter(s=>s.done&&s.rpe);return a.length?a.reduce((x,s)=>x+(+s.rpe),0)/a.length:0})();
  if(avgRpe>=9) return "Ta dernière séance était très exigeante. Garde les charges stables aujourd’hui et privilégie une exécution propre.";
  if(avgRpe>0 && avgRpe<=7.5) return "Tu sembles avoir de la marge. Les exercices réussis à la cible pourront progresser légèrement en charge.";
  return "Progression régulière : vise les répétitions prévues et note ton RPE sur les séries importantes pour affiner les prochaines charges.";
}

function startWorkout(workout){
  state.activeSession={
    id:crypto.randomUUID(), workoutId:workout.id, workoutName:workout.name,
    startedAt:new Date().toISOString(),
    exercises:workout.exercises.map(ex=>{
      const suggested=suggestWeight(ex);
      return {...ex, suggestedWeight:suggested, sets:Array.from({length:+ex.targetSets},(_,i)=>({id:crypto.randomUUID(),index:i+1,weight:suggested||"",reps:ex.targetReps,rpe:"",done:false}))}
    })
  };
  saveState();render();
}

function renderActiveSession(){
  const s=state.activeSession;
  view.innerHTML=`
    <section class="card hero">
      <div class="eyebrow">SÉANCE EN COURS</div>
      <div class="hero-title">${esc(s.workoutName)}</div>
      <div class="row"><span class="pill">${s.exercises.length} exercices</span><button class="danger" id="cancel-session">Annuler</button></div>
    </section>
    <div id="exercise-list">
      ${s.exercises.map((ex,ei)=>`
        <section class="exercise-card" data-ei="${ei}">
          <div class="row">
            <div>
              <div class="exercise-title">${esc(ex.name)}</div>
              <div class="exercise-meta">Objectif ${ex.targetSets} × ${ex.targetReps} · repos ${ex.rest}s ${ex.suggestedWeight?`· suggestion ${ex.suggestedWeight} kg`:""}</div>
            </div>
          </div>
          <div class="set-row small muted"><span>#</span><span style="text-align:center">kg</span><span style="text-align:center">reps</span><span style="text-align:center">RPE</span><span></span></div>
          ${ex.sets.map((set,si)=>`
            <div class="set-row" data-si="${si}">
              <div class="num">${set.index}</div>
              <input inputmode="decimal" aria-label="Charge" data-field="weight" value="${esc(set.weight)}">
              <input inputmode="numeric" aria-label="Répétitions" data-field="reps" value="${esc(set.reps)}">
              <input inputmode="decimal" aria-label="RPE" data-field="rpe" placeholder="8" value="${esc(set.rpe)}">
              <button class="check ${set.done?"done":""}" data-action="done" type="button">${set.done?"✓":"○"}</button>
            </div>`).join("")}
        </section>`).join("")}
    </div>
    <button class="primary full" id="finish-session">Terminer la séance</button>`;

  view.querySelectorAll(".set-row input").forEach(inp=>inp.addEventListener("change",e=>{
    const card=e.target.closest(".exercise-card"); const row=e.target.closest(".set-row");
    const ei=+card.dataset.ei, si=+row.dataset.si;
    state.activeSession.exercises[ei].sets[si][e.target.dataset.field]=e.target.value.replace(",",".");
    saveState();
  }));
  view.querySelectorAll('[data-action="done"]').forEach(btn=>btn.addEventListener("click",e=>{
    const card=e.target.closest(".exercise-card"); const row=e.target.closest(".set-row");
    const ei=+card.dataset.ei, si=+row.dataset.si;
    const set=state.activeSession.exercises[ei].sets[si];
    set.done=!set.done;
    saveState();
    if(set.done) startRestTimer(+state.activeSession.exercises[ei].rest||+state.settings.defaultRest);
    renderActiveSession();
  }));
  document.querySelector("#finish-session").addEventListener("click",finishSession);
  document.querySelector("#cancel-session").addEventListener("click",()=>{
    if(confirm("Annuler cette séance ? Les données saisies seront perdues.")){state.activeSession=null;saveState();render();}
  });
}

function finishSession(){
  const s=state.activeSession;
  if(!s) return;
  const finished={...s,endedAt:new Date().toISOString()};
  state.sessions.push(finished);
  state.activeSession=null;
  saveState(); route="history";
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.route===route));
  render();
}

function startRestTimer(seconds){
  timerEnd=Date.now()+seconds*1000;
  document.querySelector("#timer-sheet").classList.remove("hidden");
  clearInterval(timerInterval);
  timerInterval=setInterval(updateTimer,250);updateTimer();
}
function updateTimer(){
  let remain=Math.max(0,Math.ceil((timerEnd-Date.now())/1000));
  const m=String(Math.floor(remain/60)).padStart(2,"0"), sec=String(remain%60).padStart(2,"0");
  document.querySelector("#timer-value").textContent=`${m}:${sec}`;
  if(remain<=0){stopTimer(); if(navigator.vibrate) navigator.vibrate([120,80,120]);}
}
function stopTimer(){clearInterval(timerInterval);document.querySelector("#timer-sheet").classList.add("hidden");}
document.querySelector("#timer-skip").addEventListener("click",stopTimer);
document.querySelector("#timer-minus").addEventListener("click",()=>{timerEnd-=15000;updateTimer();});
document.querySelector("#timer-plus").addEventListener("click",()=>{timerEnd+=15000;updateTimer();});

function renderProgram(){
  view.innerHTML=`
    <section class="card">
      <div class="row"><div><div class="eyebrow">PROGRAMMES</div><h3 style="margin-top:6px">Ta rotation</h3></div><button class="primary" id="add-workout">+ Séance</button></div>
      <p class="muted small">La rotation proposée est Push → Pull → Jambes. Tu peux tout modifier.</p>
    </section>
    ${state.program.map((w,wi)=>`
      <section class="card">
        <div class="row"><h3>${esc(w.name)}</h3><button class="ghost" data-edit-workout="${wi}">Modifier</button></div>
        ${w.exercises.map(ex=>`<div class="list-item"><div><div class="exercise-title">${esc(ex.name)}</div><div class="exercise-meta">${ex.targetSets} × ${ex.targetReps} · ${ex.rest}s</div></div><span class="pill">${ex.category==="lower"?"Jambes":"Haut"}</span></div>`).join("")}
      </section>`).join("")}`;
  document.querySelector("#add-workout").addEventListener("click",()=>editWorkout(null));
  document.querySelectorAll("[data-edit-workout]").forEach(b=>b.addEventListener("click",()=>editWorkout(+b.dataset.editWorkout)));
}

function editWorkout(index){
  const existing=index===null?{name:"Nouvelle séance",exercises:[]}:structuredClone(state.program[index]);
  view.innerHTML=`
    <section class="card">
      <div class="field"><label>Nom de la séance</label><input id="workout-name" value="${esc(existing.name)}"></div>
    </section>
    <div id="edit-exercises">
      ${existing.exercises.map((e,i)=>exerciseEditor(e,i)).join("")}
    </div>
    <button class="secondary full" id="add-exercise">+ Ajouter un exercice</button>
    <div style="height:10px"></div>
    <button class="primary full" id="save-workout">Enregistrer</button>
    ${index!==null?`<div style="height:10px"></div><button class="danger full" id="delete-workout">Supprimer cette séance</button>`:""}`;
  document.querySelector("#add-exercise").addEventListener("click",()=>{
    existing.exercises.push({id:crypto.randomUUID(),name:"Nouvel exercice",targetSets:3,targetReps:10,rest:90,category:"upper"});
    editWorkoutWithObject(index,existing);
  });
  bindEditor(existing,index);
}
function editWorkoutWithObject(index,obj){
  // persist temporarily only in editor memory by rebuilding directly
  view.innerHTML=`
    <section class="card"><div class="field"><label>Nom de la séance</label><input id="workout-name" value="${esc(obj.name)}"></div></section>
    <div id="edit-exercises">${obj.exercises.map((e,i)=>exerciseEditor(e,i)).join("")}</div>
    <button class="secondary full" id="add-exercise">+ Ajouter un exercice</button><div style="height:10px"></div>
    <button class="primary full" id="save-workout">Enregistrer</button>
    ${index!==null?`<div style="height:10px"></div><button class="danger full" id="delete-workout">Supprimer cette séance</button>`:""}`;
  document.querySelector("#add-exercise").addEventListener("click",()=>{syncEditor(obj);obj.exercises.push({id:crypto.randomUUID(),name:"Nouvel exercice",targetSets:3,targetReps:10,rest:90,category:"upper"});editWorkoutWithObject(index,obj);});
  bindEditor(obj,index);
}
function exerciseEditor(e,i){
  return `<section class="card edit-ex" data-i="${i}">
    <div class="row"><h3>Exercice ${i+1}</h3><button class="danger" data-remove="${i}">Retirer</button></div>
    <div class="field" style="margin-top:12px"><label>Nom</label><input data-k="name" value="${esc(e.name)}"></div>
    <div class="form-grid" style="margin-top:10px">
      <div class="field"><label>Séries</label><input inputmode="numeric" data-k="targetSets" value="${e.targetSets}"></div>
      <div class="field"><label>Répétitions cibles</label><input inputmode="numeric" data-k="targetReps" value="${e.targetReps}"></div>
      <div class="field"><label>Repos (secondes)</label><input inputmode="numeric" data-k="rest" value="${e.rest}"></div>
      <div class="field"><label>Progression</label><select data-k="category"><option value="upper" ${e.category==="upper"?"selected":""}>Haut du corps</option><option value="lower" ${e.category==="lower"?"selected":""}>Bas du corps</option></select></div>
    </div>
  </section>`;
}
function syncEditor(obj){
  obj.name=document.querySelector("#workout-name")?.value||obj.name;
  document.querySelectorAll(".edit-ex").forEach(card=>{
    const i=+card.dataset.i;
    card.querySelectorAll("[data-k]").forEach(el=>obj.exercises[i][el.dataset.k]=["targetSets","targetReps","rest"].includes(el.dataset.k)?+el.value:el.value);
  });
}
function bindEditor(obj,index){
  document.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>{syncEditor(obj);obj.exercises.splice(+b.dataset.remove,1);editWorkoutWithObject(index,obj);}));
  document.querySelector("#save-workout").addEventListener("click",()=>{
    syncEditor(obj);
    const cleaned={id:index===null?crypto.randomUUID():state.program[index].id,name:obj.name.trim()||"Séance",exercises:obj.exercises.map(e=>({...e,id:e.id||crypto.randomUUID()}))};
    if(index===null) state.program.push(cleaned); else state.program[index]=cleaned;
    saveState();renderProgram();
  });
  document.querySelector("#delete-workout")?.addEventListener("click",()=>{if(confirm("Supprimer cette séance du programme ?")){state.program.splice(index,1);saveState();renderProgram();}});
}

let histFilter = "volume";
function renderHistory(){
  const sessions=[...state.sessions].sort((a,b)=>new Date(b.endedAt)-new Date(a.endedAt));
  const names=allExerciseNames();
  view.innerHTML=`
    <section class="card">
      <div class="segment">
        <button class="${histFilter==="volume"?"active":""}" data-hf="volume">Volume</button>
        <button class="${histFilter==="exercise"?"active":""}" data-hf="exercise">Exercice</button>
        <button class="${histFilter==="history"?"active":""}" data-hf="history">Historique</button>
      </div>
    </section>
    <div id="history-content"></div>`;
  document.querySelectorAll("[data-hf]").forEach(b=>b.addEventListener("click",()=>{histFilter=b.dataset.hf;renderHistory();}));
  const out=document.querySelector("#history-content");
  if(histFilter==="volume"){
    const last=sessions.slice(0,10).reverse();
    out.innerHTML=`<section class="card"><div class="row"><div><div class="eyebrow">VOLUME</div><div class="kpi">${Math.round(sessions.reduce((a,s)=>a+sessionVolume(s),0)).toLocaleString("fr-FR")} kg</div></div><span class="pill">${sessions.length} séances</span></div><div class="progress-wrap"><canvas id="progress-chart"></canvas></div></section>`;
    drawChart(document.querySelector("#progress-chart"), last.map(s=>({label:new Date(s.endedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"}),value:sessionVolume(s)})));
  }else if(histFilter==="exercise"){
    out.innerHTML=`<section class="card"><div class="field"><label>Exercice</label><select id="exercise-filter">${names.map(n=>`<option>${esc(n)}</option>`).join("")}</select></div><div id="exercise-stats"></div></section>`;
    const sel=document.querySelector("#exercise-filter"); sel.addEventListener("change",()=>renderExerciseStats(sel.value)); if(names[0]) renderExerciseStats(names[0]);
  }else{
    out.innerHTML=sessions.length?sessions.map(s=>`
      <section class="card">
        <div class="row"><div><h3>${esc(s.workoutName)}</h3><div class="exercise-meta">${fmtDate(s.endedAt)}</div></div><span class="pill">${completedSets(s)} séries</span></div>
        <div class="stat-grid"><div class="stat"><b>${Math.round(sessionVolume(s)).toLocaleString("fr-FR")}</b><span>kg volume</span></div><div class="stat"><b>${s.exercises.length}</b><span>exercices</span></div><div class="stat"><b>${Math.round((new Date(s.endedAt)-new Date(s.startedAt))/60000)}</b><span>minutes</span></div></div>
        <details style="margin-top:12px"><summary class="muted">Voir les détails</summary>${s.exercises.map(e=>`<div class="list-item"><div><b>${esc(e.name)}</b><div class="small muted">${e.sets.filter(x=>x.done).map(x=>`${x.weight}kg × ${x.reps}${x.rpe?` @RPE ${x.rpe}`:""}`).join(" · ")}</div></div></div>`).join("")}</details>
      </section>`).join(""):`<div class="empty">Aucune séance terminée pour le moment.</div>`;
  }
}
function renderExerciseStats(name){
  const points=[];
  state.sessions.forEach(s=>{
    const e=s.exercises.find(x=>x.name===name);
    if(!e) return;
    const done=e.sets.filter(x=>x.done);
    if(!done.length) return;
    const best=Math.max(...done.map(x=>estimated1RM(+x.weight||0,+x.reps||0)));
    points.push({label:new Date(s.endedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"}),value:best});
  });
  const last=points.at(-1)?.value||0;
  document.querySelector("#exercise-stats").innerHTML=`<div class="row" style="margin-top:16px"><div><div class="eyebrow">1RM ESTIMÉ</div><div class="kpi">${last?last.toFixed(1):"—"} kg</div></div></div><div class="progress-wrap"><canvas id="exercise-chart"></canvas></div>`;
  drawChart(document.querySelector("#exercise-chart"),points.slice(-12));
}
function drawChart(canvas,points){
  if(!canvas) return;
  const dpr=window.devicePixelRatio||1, rect=canvas.getBoundingClientRect();
  canvas.width=rect.width*dpr; canvas.height=rect.height*dpr;
  const ctx=canvas.getContext("2d"); ctx.scale(dpr,dpr);
  const w=rect.width,h=rect.height,pad=28;
  ctx.clearRect(0,0,w,h);
  ctx.strokeStyle="#2b2b2f";ctx.lineWidth=1;
  for(let i=0;i<4;i++){const y=pad+(h-pad*2)*i/3;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke();}
  if(!points.length){ctx.fillStyle="#9a9893";ctx.font="13px -apple-system";ctx.fillText("Pas encore assez de données",pad,h/2);return;}
  const vals=points.map(p=>p.value), min=Math.min(...vals),max=Math.max(...vals),range=(max-min)||1;
  ctx.strokeStyle="#d6a45b";ctx.lineWidth=3;ctx.beginPath();
  points.forEach((p,i)=>{const x=pad+(w-pad*2)*(points.length===1?.5:i/(points.length-1));const y=h-pad-(h-pad*2)*(p.value-min)/range;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
  ctx.stroke();
  ctx.fillStyle="#f3d39b";
  points.forEach((p,i)=>{const x=pad+(w-pad*2)*(points.length===1?.5:i/(points.length-1));const y=h-pad-(h-pad*2)*(p.value-min)/range;ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle="#8f8d88";ctx.font="10px -apple-system";
  points.forEach((p,i)=>{if(points.length<=6||i%2===0){const x=pad+(w-pad*2)*(points.length===1?.5:i/(points.length-1));ctx.fillText(p.label,x-12,h-7);}});
}

function renderSettings(){
  view.innerHTML=`
    <section class="card">
      <div class="eyebrow">PROGRESSION</div>
      <div class="form-grid" style="margin-top:12px">
        <div class="field"><label>Incrément haut du corps (kg)</label><input id="upper-inc" inputmode="decimal" value="${state.settings.upperIncrement}"></div>
        <div class="field"><label>Incrément bas du corps (kg)</label><input id="lower-inc" inputmode="decimal" value="${state.settings.lowerIncrement}"></div>
        <div class="field"><label>Repos par défaut (s)</label><input id="default-rest" inputmode="numeric" value="${state.settings.defaultRest}"></div>
      </div>
      <button class="primary full" id="save-settings" style="margin-top:12px">Enregistrer</button>
    </section>
    <section class="card">
      <div class="eyebrow">DONNÉES</div>
      <h3 style="margin-top:6px">Sauvegarde locale</h3>
      <p class="muted small">Tes séances sont stockées sur cet iPhone dans Safari. Exporte régulièrement une sauvegarde JSON.</p>
      <div class="stack">
        <button class="secondary full" id="export-data">Exporter mes données</button>
        <label class="secondary full" style="text-align:center;display:block">Importer une sauvegarde<input id="import-data" type="file" accept="application/json" hidden></label>
      </div>
    </section>
    <section class="card">
      <div class="eyebrow">APPLE SANTÉ</div>
      <h3 style="margin-top:6px">Connexion future</h3>
      <p class="muted">Apple Santé nécessite une application iPhone native pour accéder directement aux données HealthKit. Denat Life Web reste utilisable normalement sans cette connexion.</p>
      <div class="notice"><b>Coach intelligent actif</b><br><span class="small">Le coach adapte déjà tes séances à partir de ton historique, de tes répétitions et de ton RPE. Une connexion Apple Santé pourra ensuite enrichir ces données.</span></div>
    </section>`;
  document.querySelector("#save-settings").addEventListener("click",()=>{
    state.settings.upperIncrement=+document.querySelector("#upper-inc").value.replace(",",".")||2.5;
    state.settings.lowerIncrement=+document.querySelector("#lower-inc").value.replace(",",".")||5;
    state.settings.defaultRest=+document.querySelector("#default-rest").value||90;
    saveState();alert("Réglages enregistrés.");
  });
  document.querySelector("#export-data").addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`forgefit-sauvegarde-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
  });
  document.querySelector("#import-data").addEventListener("change",async e=>{
    const f=e.target.files[0];if(!f)return;
    try{const data=JSON.parse(await f.text());state=data;saveState();render();alert("Sauvegarde importée.");}catch(err){alert("Fichier invalide.");}
  });
}

// PWA install
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;document.querySelector("#install-btn").classList.remove("hidden");});
document.querySelector("#install-btn").addEventListener("click",async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;document.querySelector("#install-btn").classList.add("hidden");});

// Service Worker
if("serviceWorker" in navigator){const reg=()=>navigator.serviceWorker.register("sw.js?v=13.6").catch(()=>{});if(document.readyState==="complete")reg();else window.addEventListener("load",reg,{once:true});}

render();
