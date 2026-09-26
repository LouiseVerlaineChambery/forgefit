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
          ex("Presse à cuisses",2,10,120,"lower"),
          ex("Développé couché haltères",2,8,120,"upper"),
          ex("Tirage vertical",2,10,90,"upper"),
          ex("Leg curl",2,10,90,"lower"),
          ex("Élévations latérales",2,12,60,"upper"),
          ex("Crunch",3,12,60,"upper",{core:true})
        ]
      },
      {
        id:crypto.randomUUID(),
        name:"Reprise B — Full Body",
        exercises:[
          ex("Goblet squat",2,10,120,"lower"),
          ex("Rowing poulie basse",2,10,90,"upper"),
          ex("Développé incliné haltères",2,8,120,"upper"),
          ex("Leg extension",2,12,75,"lower"),
          ex("Curl biceps",2,10,75,"upper"),
          ex("Extension triceps poulie",2,10,75,"upper")
        ]
      },
      {
        id:crypto.randomUUID(),
        name:"Reprise C — Full Body",
        exercises:[
          ex("Presse à cuisses",2,10,120,"lower"),
          ex("Tractions assistées",2,8,120,"upper"),
          ex("Développé machine",2,10,90,"upper"),
          ex("Rowing machine",2,10,90,"upper"),
          ex("Mollets",2,12,60,"lower"),
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

  function completeRepriseIfNeeded(){
    if(!state.reprise?.enabled) return false;
    if(repriseSessions().length<REPRISE_TOTAL) return false;
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
    {keys:["souleve de terre roumain"], options:["Soulevé de terre roumain haltères","Hip hinge poulie","Leg curl"]}
  ];

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
          ${choices.map((v,i)=>`<button type="button" class="secondary full" data-ff-variant="${i}">${esc(v)}</button>`).join("")}
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
        <p class="muted small">3 séances par semaine · 45–55 min · RPE 6–7. Les abdos sont déjà placés automatiquement 2 fois par rotation.</p>
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
        <p class="muted small">Programme Full Body volontairement léger. RPE cible 6–7. Abdos intégrés aux séances A et C.</p>
        <button class="danger full" id="ff-cancel-reprise">Quitter le mode reprise</button>`;
    }else{
      section.innerHTML=`
        <div class="eyebrow">MODE REPRISE</div>
        <h3 style="margin-top:6px">Reprendre après une coupure</h3>
        <p class="muted small">Active 6 séances Full Body progressives avant de revenir au programme esthétique.</p>
        <button class="secondary full" id="ff-enable-reprise">Activer une nouvelle reprise</button>`;
    }

    const first=view.querySelector(".card");
    if(first) first.insertAdjacentElement("afterend",section); else view.prepend(section);

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
    .ff-variant-toggle{font-size:13px}
  `;
  document.head.appendChild(style);

  saveState();
  render();
})();
