// ForgeFit — reprise, abdos automatiques et variantes d'exercices
(function(){
  const REPRISE_PREFIX="Reprise ";
  const REPRISE_TOTAL=6;

  function ex(name,targetSets,targetReps,rest,category="upper",extra={}){
    return {id:crypto.randomUUID(),name,targetSets,targetReps,rest,category,...extra};
  }

  function makeRepriseProgram(){
    return [
      {
        id:crypto.randomUUID(),
        name:"Reprise A — Full Body",
        exercises:[
          ex("Pont fessier au poids du corps",4,15,45,"lower",{lightLower:true}),
          ex("Développé couché haltères",2,8,120,"upper"),
          ex("Tirage vertical",2,10,90,"upper"),
          ex("Abduction de hanches légère",4,15,45,"lower",{lightLower:true}),
          ex("Élévations latérales",2,12,60,"upper"),
          ex("Crunch",3,12,60,"upper",{core:true})
        ]
      },
      {
        id:crypto.randomUUID(),
        name:"Reprise B — Full Body",
        exercises:[
          ex("Hip hinge au poids du corps",4,15,45,"lower",{lightLower:true}),
          ex("Rowing poulie basse",2,10,90,"upper"),
          ex("Développé incliné haltères",2,8,120,"upper"),
          ex("Mollets au poids du corps",4,15,45,"lower",{lightLower:true}),
          ex("Curl biceps",2,10,75,"upper"),
          ex("Extension triceps poulie",2,10,75,"upper")
        ]
      },
      {
        id:crypto.randomUUID(),
        name:"Reprise C — Full Body",
        exercises:[
          ex("Hip thrust au poids du corps",4,15,45,"lower",{lightLower:true}),
          ex("Tractions assistées",2,8,120,"upper"),
          ex("Développé machine",2,10,90,"upper"),
          ex("Rowing machine",2,10,90,"upper"),
          ex("Abduction de hanches légère",4,15,45,"lower",{lightLower:true}),
          ex("Relevés de jambes",3,10,60,"upper",{core:true})
        ]
      }
    ];
  }

  function makeAestheticProgram(){
    return [
      {
        id:crypto.randomUUID(),
        name:"Push — Esthétique",
        exercises:[
          ex("Développé incliné haltères",4,8,120,"upper"),
          ex("Développé couché haltères",3,8,120,"upper"),
          ex("Élévations latérales",4,12,60,"upper"),
          ex("Écarté poulie",3,12,75,"upper"),
          ex("Extension triceps poulie",3,10,75,"upper"),
          ex("Crunch poulie",3,12,60,"upper",{core:true})
        ]
      },
      {
        id:crypto.randomUUID(),
        name:"Pull — Esthétique",
        exercises:[
          ex("Tirage vertical",4,8,120,"upper"),
          ex("Rowing poulie basse",4,10,90,"upper"),
          ex("Rowing haltère",3,10,90,"upper"),
          ex("Oiseau poulie",3,15,60,"upper"),
          ex("Curl incliné haltères",3,10,75,"upper"),
          ex("Curl marteau",3,12,75,"upper")
        ]
      },
      {
        id:crypto.randomUUID(),
        name:"Jambes — Esthétique",
        exercises:[
          ex("Hack squat",4,8,150,"lower"),
          ex("Soulevé de terre roumain",3,8,120,"lower"),
          ex("Leg curl",3,10,90,"lower"),
          ex("Leg extension",3,12,75,"lower"),
          ex("Mollets",4,12,60,"lower"),
          ex("Relevés de jambes",3,10,60,"upper",{core:true})
        ]
      }
    ];
  }

  function repriseSessions(){
    return state.sessions.filter(s=>String(s.workoutName||"").startsWith(REPRISE_PREFIX));
  }

  function activateReprise(auto=false){
    if(!state.reprise) state.reprise={};
    if(!state.reprise.previousProgram) state.reprise.previousProgram=structuredClone(state.program);
    state.reprise.enabled=true;
    state.reprise.completed=false;
    state.reprise.startedAt=state.reprise.startedAt||new Date().toISOString();
    state.reprise.totalSessions=REPRISE_TOTAL;
    state.reprise.autoActivated=auto;
    state.program=makeRepriseProgram();
    saveState();
  }

  function applyLightLowerReprise(){
    if(!state.reprise?.enabled||state.reprise.lowerBodyLightV1)return;
    const fresh=makeRepriseProgram();
    state.program=(state.program||[]).map((workout,wi)=>{
      const template=fresh[wi];
      if(!template)return workout;
      let li=0;
      const lowers=template.exercises.filter(x=>x.category==="lower");
      workout.exercises=(workout.exercises||[]).map(old=>{
        if(old.category!=="lower")return old;
        const next=lowers[li++]||old;
        return {...next,id:old.id||next.id};
      });
      return workout;
    });
    state.reprise.lowerBodyLightV1=true;
    saveState();
  }

  function completeRepriseIfNeeded(){
    if(!state.reprise?.enabled) return false;
    if(repriseSessions().length<REPRISE_TOTAL) return false;
    if(state.reprise.kneeSensitive!==false){
      state.reprise.awaitingKneeReady=true;
      saveState();
      return false;
    }
    state.reprise.awaitingKneeReady=false;
    state.reprise.enabled=false;
    state.reprise.completed=true;
    state.reprise.completedAt=new Date().toISOString();
    state.program=makeAestheticProgram();
    saveState();
    return true;
  }

  // Première installation de cette fonction : la demande de l'utilisateur active la reprise.
  if(!state.reprise){
    activateReprise(true);
  }else{
    completeRepriseIfNeeded();
  }

  applyLightLowerReprise();

  // Pendant la reprise, ne jamais proposer automatiquement les anciennes charges.
  const baseSuggestWeight=suggestWeight;
  suggestWeight=function(exercise){
    if(state.reprise?.enabled) return 0;
    return baseSuggestWeight(exercise);
  };

  function norm(s){
    return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  }

  const VARIANTS=[
    {keys:["presse a cuisses","presse horizontale"], options:["Hack squat","Goblet squat","Squat guidé Smith","Fentes marchées"]},
    {keys:["hack squat","hacksquat"], options:["Presse à cuisses","Goblet squat","Squat guidé Smith","Fentes bulgares"]},
    {keys:["goblet squat"], options:["Hack squat","Presse à cuisses","Squat guidé Smith","Fentes bulgares"]},
    {keys:["developpe couche halteres","developpe couche avec halteres","developpe machine"], options:["Chest press machine","Développé couché barre","Pompes","Développé couché haltères"]},
    {keys:["developpe incline halteres","developpe incline avec halteres"], options:["Chest press inclinée","Développé incliné barre","Pompes pieds surélevés","Développé incliné haltères"]},
    {keys:["tirage vertical","tractions assistees","tractions pronation","tractions supination"], options:["Tractions assistées","Tirage vertical prise neutre","Tirage vertical prise large","Tirage élastique"]},
    {keys:["rowing poulie basse","rowing machine","tirage horizontal serre"], options:["Rowing machine convergente","Rowing haltère","Rowing barre","Rowing poulie basse"]},
    {keys:["rowing haltere"], options:["Rowing poulie basse","Rowing machine convergente","Rowing barre"]},
    {keys:["leg curl"], options:["Leg curl assis","Leg curl allongé","Soulevé de terre roumain","Leg curl ballon"]},
    {keys:["leg extension"], options:["Leg extension","Fentes bulgares","Sissy squat assisté","Step-up"]},
    {keys:["elevations laterales","elevation laterale"], options:["Élévations latérales haltères","Élévation latérale poulie","Machine élévations latérales"]},
    {keys:["extension triceps poulie","extensions triceps poulie"], options:["Extension triceps corde","Dips assistés","Barre au front haltères","Extension triceps unilatérale"]},
    {keys:["curl biceps","curl incline halteres","curl marteau","biceps poulie corde"], options:["Curl haltères","Curl poulie","Curl machine","Curl marteau"]},
    {keys:["ecarte poulie","cable crossover"], options:["Pec deck","Écarté haltères","Pompes lentes"]},
    {keys:["mollets","presse mollet","extension mollet debout"], options:["Mollets debout machine","Mollets à la presse","Mollets unilatéraux haltère"]},
    {keys:["crunch poulie","crunch"], options:["Crunch poulie","Machine abdos","Crunch au sol"]},
    {keys:["releves de jambes","releve de jambes"], options:["Relevés de genoux chaise romaine","Relevés de jambes suspendu","Reverse crunch"]},
    {keys:["souleve de terre roumain"], options:["Soulevé de terre roumain haltères","Hip hinge poulie","Leg curl"]},
    {keys:["pont fessier","hip thrust"], options:["Pont fessier au sol","Hip thrust au poids du corps","Hip thrust machine très léger"]},
    {keys:["abduction de hanches","abduction"], options:["Abduction élastique debout","Abduction machine très légère","Abduction allongé sur le côté"]},
    {keys:["hip hinge au poids du corps"], options:["Hip hinge avec bâton","Soulevé de terre roumain haltères très légers","Hip hinge poulie très léger"]}
  ];

  function variantMeta(name){
    const n=norm(name);
    let icon="AUTRE",equipment="Alternative";
    if(n.includes("machine")||n.includes("pec deck")||n.includes("assiste")){icon="MACHINE";equipment="Machine";}
    else if(n.includes("poulie")||n.includes("cable")){icon="POULIE";equipment="Poulie";}
    else if(n.includes("haltere")){icon="HALTÈRES";equipment="Haltères";}
    else if(n.includes("barre")){icon="BARRE";equipment="Barre";}
    else if(n.includes("elastique")){icon="ÉLASTIQUE";equipment="Élastique";}
    else if(n.includes("pompe")||n.includes("poids du corps")||n.includes("au sol")||n.includes("traction")){icon="PDC";equipment="Poids du corps";}
    const info=window.FFGuide?.info?.(name);
    const muscle=info?.muscles?.[0]||"Même zone";
    return {icon,equipment,muscle};
  }

  function alternativesFor(name,category){
    const n=norm(name);
    const group=VARIANTS.find(g=>g.keys.some(k=>n.includes(k)));
    const choices=group?group.options:(category==="lower"?["Presse à cuisses","Goblet squat","Fentes bulgares"]:["Machine convergente","Haltères","Poulie"]);
    return [...new Set(choices.filter(x=>norm(x)!==n))].slice(0,4);
  }

  const baseRenderActiveSession=renderActiveSession;
  renderActiveSession=function(){
    baseRenderActiveSession();
    const session=state.activeSession;
    if(!session) return;

    view.querySelectorAll(".exercise-card").forEach(card=>{
      const ei=+card.dataset.ei;
      const exercise=session.exercises[ei];
      if(!exercise) return;
      const choices=alternativesFor(exercise.name,exercise.category);
      if(!choices.length) return;

      const box=document.createElement("div");
      box.style.marginTop="10px";
      box.innerHTML=`
        <button type="button" class="ghost full ff-variant-toggle">↔ Variante / machine prise</button>
        <div class="ff-variant-list hidden" style="margin-top:8px;display:grid;gap:8px">
          ${choices.map((v,i)=>{const m=variantMeta(v);return `<button type="button" class="secondary full ff-variant-choice" data-ff-variant="${i}"><span class="ff-variant-icon">${m.icon}</span><span class="ff-variant-copy"><b>${esc(v)}</b><small>${esc(m.equipment)} · ${esc(m.muscle)}</small></span></button>`;}).join("")}
          <div class="small muted">La charge est remise à zéro lors d'un changement : les machines ne sont pas directement comparables.</div>
        </div>`;
      card.appendChild(box);
      const list=box.querySelector(".ff-variant-list");
      box.querySelector(".ff-variant-toggle").addEventListener("click",()=>{
        const hidden=list.classList.toggle("hidden");
        list.style.display=hidden?"none":"grid";
      });
      box.querySelectorAll("[data-ff-variant]").forEach(btn=>btn.addEventListener("click",()=>{
        const selected=choices[+btn.dataset.ffVariant];
        if(!selected) return;
        exercise.variantOf=exercise.variantOf||exercise.name;
        exercise.name=selected;
        exercise.suggestedWeight=0;
        exercise.sets.forEach(s=>{s.weight="";s.done=false;});
        saveState();
        renderActiveSession();
      }));
    });

    if(state.reprise?.enabled){
      const first=view.querySelector(".exercise-card");
      if(first){
        const note=document.createElement("div");
        note.className="notice";
        note.style.margin="0 0 12px";
        note.innerHTML="<b>Reprise : RPE 6–7</b><br><span class='small'>Arrête chaque série en gardant environ 3 à 4 répétitions propres en réserve.</span>";
        first.parentNode.insertBefore(note,first);
      }
    }
  };

  const baseRenderToday=renderToday;
  renderToday=function(){
    completeRepriseIfNeeded();
    baseRenderToday();
    if(state.activeSession) return;

    const card=document.createElement("section");
    card.className="card";
    if(state.reprise?.enabled){
      const done=repriseSessions().length;
      const week=done<3?1:2;
      card.innerHTML=`
        <div class="row"><div><div class="eyebrow">MODE REPRISE</div><h3 style="margin-top:6px">Semaine ${week} sur 2</h3></div><span class="pill">${done}/${REPRISE_TOTAL}</span></div>
        <p class="muted small">3 séances par semaine · haut du corps inchangé. Bas du corps : poids du corps / très léger, 4 séries et 45 s de repos. Les abdos restent intégrés.</p>
        <div class="notice">Objectif : retrouver les mouvements et la tolérance à l'effort, pas battre tes anciennes charges.</div>`;
    }else if(state.reprise?.completed){
      card.innerHTML=`
        <div class="eyebrow">PHASE SUIVANTE</div>
        <h3 style="margin-top:6px">Programme esthétique activé</h3>
        <p class="muted small">ForgeFit est passé automatiquement sur Push / Pull / Jambes avec priorité épaules, haut des pectoraux, dos, bras et abdos.</p>`;
    }else return;

    const hero=view.querySelector(".hero");
    if(hero) hero.insertAdjacentElement("afterend",card); else view.prepend(card);
  };

  const baseFinishSession=finishSession;
  finishSession=function(){
    baseFinishSession();
    if(completeRepriseIfNeeded()){
      alert("Reprise terminée ✓ ForgeFit passe maintenant au programme esthétique.");
      render();
    }
  };

  const baseRenderSettings=renderSettings;
  renderSettings=function(){
    baseRenderSettings();
    const section=document.createElement("section");
    section.className="card";
    const done=repriseSessions().length;

    if(state.reprise?.enabled){
      section.innerHTML=`
        <div class="eyebrow">MODE REPRISE</div>
        <div class="row"><h3 style="margin-top:6px">2 semaines / 6 séances</h3><span class="pill">${done}/${REPRISE_TOTAL}</span></div>
        <p class="muted small">Haut du corps inchangé. Bas du corps temporairement en poids du corps / très léger, volume augmenté et 45 s de repos.</p>
        <div class="notice small" style="margin-bottom:10px"><b>Protection genou : ${state.reprise.kneeSensitive!==false?"active":"désactivée"}</b><br>Après les 6 séances, Denat Life ne réactive pas automatiquement le Hack squat / Leg extension tant que cette protection reste active.</div>
        <button class="secondary full" id="ff-knee-ready">${state.reprise.kneeSensitive!==false?"Mon genou est OK · autoriser la progression jambes":"Réactiver la protection genou"}</button>
        <button class="danger full" id="ff-cancel-reprise" style="margin-top:8px">Quitter le mode reprise</button>`;
    }else{
      section.innerHTML=`
        <div class="eyebrow">MODE REPRISE</div>
        <h3 style="margin-top:6px">Reprendre après une coupure</h3>
        <p class="muted small">Active 6 séances Full Body progressives avant de revenir au programme esthétique.</p>
        <button class="secondary full" id="ff-enable-reprise">Activer une nouvelle reprise</button>`;
    }

    const first=view.querySelector(".card");
    if(first) first.insertAdjacentElement("afterend",section); else view.prepend(section);

    section.querySelector("#ff-knee-ready")?.addEventListener("click",()=>{
      state.reprise.kneeSensitive=state.reprise.kneeSensitive===false?true:false;
      saveState();
      if(state.reprise.kneeSensitive===false&&repriseSessions().length>=REPRISE_TOTAL)completeRepriseIfNeeded();
      render();
    });
        section.querySelector("#ff-enable-reprise")?.addEventListener("click",()=>{
      if(confirm("Remplacer temporairement ton programme par les 6 séances de reprise ?")){
        activateReprise(false); render();
      }
    });
    section.querySelector("#ff-cancel-reprise")?.addEventListener("click",()=>{
      if(confirm("Quitter la reprise ?")){
        state.reprise.enabled=false;
        state.program=state.reprise.previousProgram?structuredClone(state.reprise.previousProgram):makeAestheticProgram();
        saveState(); render();
      }
    });
  };

  const style=document.createElement("style");
  style.textContent=`
    .ff-variant-list.hidden{display:none!important}
    .ff-variant-toggle{font-size:13px}.ff-variant-choice{display:flex!important;align-items:center!important;gap:11px!important;text-align:left!important}.ff-variant-icon{min-width:58px;height:28px;flex:0 0 auto;padding:0 8px;border:1px solid rgba(214,164,91,.35);border-radius:999px;display:grid;place-items:center;color:var(--accent2);font-size:9px;font-weight:850;letter-spacing:.04em}.ff-variant-copy{display:flex;flex-direction:column;gap:3px;min-width:0}.ff-variant-copy b{font-size:13px;color:var(--text)}.ff-variant-copy small{font-size:10px;color:var(--muted);font-weight:500}
  `;
  document.head.appendChild(style);

  saveState();
  render();
})();
