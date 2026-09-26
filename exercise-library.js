// Denat Life V24 — bibliothèque d'exercices structurée.
(function(){
  const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  const D=(name,group,muscles,equipment,sets,reps,rest,category="upper",aliases=[])=>({id:norm(name).replace(/ /g,"-"),name,group,muscles,equipment,sets,reps,rest,category,aliases});
  const exercises=[
    D("Développé couché barre","Pectoraux",["Pectoraux","Triceps","Deltoïdes antérieurs"],["Barre","Banc"],4,8,120),
    D("Développé couché haltères","Pectoraux",["Pectoraux","Triceps","Deltoïdes antérieurs"],["Haltères","Banc"],3,10,105),
    D("Développé incliné haltères","Pectoraux",["Haut des pectoraux","Triceps","Deltoïdes antérieurs"],["Haltères","Banc"],4,8,120),
    D("Développé incliné barre","Pectoraux",["Haut des pectoraux","Triceps","Deltoïdes antérieurs"],["Barre","Banc"],4,8,120),
    D("Chest press machine","Pectoraux",["Pectoraux","Triceps","Deltoïdes antérieurs"],["Machine"],3,10,90),
    D("Chest press inclinée","Pectoraux",["Haut des pectoraux","Triceps","Deltoïdes antérieurs"],["Machine"],3,10,90),
    D("Écarté poulie","Pectoraux",["Pectoraux"],["Poulie"],3,12,75),
    D("Pec deck","Pectoraux",["Pectoraux"],["Machine"],3,12,75),
    D("Pompes","Pectoraux",["Pectoraux","Triceps","Gainage"],["Poids du corps"],3,15,60),
    D("Pompes pieds surélevés","Pectoraux",["Haut des pectoraux","Triceps","Gainage"],["Poids du corps","Banc"],3,12,60),
    D("Dips","Pectoraux",["Pectoraux","Triceps"],["Poids du corps"],3,10,90),

    D("Tirage vertical","Dos",["Grand dorsal","Biceps","Haut du dos"],["Poulie"],4,10,90),
    D("Tirage vertical prise neutre","Dos",["Grand dorsal","Biceps"],["Poulie"],4,10,90),
    D("Tractions pronation","Dos",["Grand dorsal","Biceps","Haut du dos"],["Barre de traction","Poids du corps"],4,8,120),
    D("Tractions supination","Dos",["Grand dorsal","Biceps"],["Barre de traction","Poids du corps"],4,8,120),
    D("Tractions assistées","Dos",["Grand dorsal","Biceps"],["Machine"],4,8,120),
    D("Rowing poulie basse","Dos",["Milieu du dos","Grand dorsal","Biceps"],["Poulie"],4,10,90),
    D("Rowing machine convergente","Dos",["Milieu du dos","Grand dorsal","Biceps"],["Machine"],4,10,90),
    D("Rowing haltère","Dos",["Grand dorsal","Milieu du dos","Biceps"],["Haltères","Banc"],3,10,90),
    D("Rowing barre","Dos",["Milieu du dos","Grand dorsal","Biceps"],["Barre"],4,8,105),
    D("Pullover poulie","Dos",["Grand dorsal"],["Poulie"],3,12,75),
    D("Rowing élastique","Dos",["Milieu du dos","Grand dorsal","Biceps"],["Élastique"],3,15,60),
    D("Reverse snow angel","Dos",["Haut du dos","Deltoïde postérieur","Grand dorsal"],["Poids du corps"],3,15,45),

    D("Développé épaules haltères","Épaules",["Deltoïdes","Triceps"],["Haltères"],3,10,90),
    D("Développé épaules machine","Épaules",["Deltoïdes","Triceps"],["Machine"],3,10,90),
    D("Élévations latérales haltères","Épaules",["Deltoïde moyen"],["Haltères"],4,12,60),
    D("Élévation latérale poulie","Épaules",["Deltoïde moyen"],["Poulie"],4,12,60),
    D("Oiseau poulie","Épaules",["Deltoïde postérieur","Haut du dos"],["Poulie"],3,15,60),
    D("Oiseau haltères","Épaules",["Deltoïde postérieur","Haut du dos"],["Haltères"],3,15,60),
    D("Reverse pec deck","Épaules",["Deltoïde postérieur","Haut du dos"],["Machine"],3,15,60),
    D("Face pull","Épaules",["Deltoïde postérieur","Haut du dos"],["Poulie"],3,15,60),

    D("Curl haltères","Biceps",["Biceps","Brachial"],["Haltères"],3,10,75),
    D("Curl incliné haltères","Biceps",["Biceps"],["Haltères","Banc"],3,10,75),
    D("Curl marteau","Biceps",["Brachial","Biceps","Avant-bras"],["Haltères"],3,12,75),
    D("Curl poulie","Biceps",["Biceps"],["Poulie"],3,12,75),
    D("Curl élastique","Biceps",["Biceps"],["Élastique"],3,15,60),

    D("Extension triceps corde","Triceps",["Triceps"],["Poulie"],3,12,75),
    D("Extension triceps unilatérale","Triceps",["Triceps"],["Poulie"],3,12,75),
    D("Barre au front haltères","Triceps",["Triceps"],["Haltères","Banc"],3,10,75),
    D("Extension triceps au-dessus de la tête","Triceps",["Triceps"],["Haltères"],3,12,75),
    D("Pompes serrées","Triceps",["Triceps","Pectoraux"],["Poids du corps"],3,12,60),

    D("Squat","Jambes",["Quadriceps","Fessiers","Gainage"],["Barre"],4,8,150,"lower"),
    D("Goblet squat","Jambes",["Quadriceps","Fessiers","Gainage"],["Haltères"],4,10,105,"lower"),
    D("Squat au poids du corps","Jambes",["Quadriceps","Fessiers"],["Poids du corps"],4,15,60,"lower"),
    D("Hack squat","Jambes",["Quadriceps","Fessiers"],["Machine"],4,8,150,"lower"),
    D("Presse à cuisses","Jambes",["Quadriceps","Fessiers","Ischio-jambiers"],["Machine"],4,10,120,"lower"),
    D("Fentes marchées","Jambes",["Quadriceps","Fessiers"],["Haltères"],3,12,90,"lower"),
    D("Fentes arrière","Jambes",["Quadriceps","Fessiers"],["Poids du corps"],3,12,75,"lower"),
    D("Fentes bulgares","Jambes",["Quadriceps","Fessiers"],["Poids du corps","Banc"],3,10,90,"lower"),
    D("Soulevé de terre roumain","Jambes",["Ischio-jambiers","Fessiers","Lombaires"],["Barre"],3,8,120,"lower"),
    D("Soulevé de terre roumain haltères","Jambes",["Ischio-jambiers","Fessiers","Lombaires"],["Haltères"],3,10,105,"lower"),
    D("Leg curl assis","Jambes",["Ischio-jambiers"],["Machine"],3,12,75,"lower",["Leg curl"]),
    D("Leg curl allongé","Jambes",["Ischio-jambiers"],["Machine"],3,12,75,"lower"),
    D("Leg extension","Jambes",["Quadriceps"],["Machine"],3,12,75,"lower"),
    D("Hip thrust","Jambes",["Fessiers","Ischio-jambiers"],["Barre","Banc"],4,10,105,"lower"),
    D("Pont fessier au sol","Jambes",["Fessiers","Ischio-jambiers"],["Poids du corps"],4,15,60,"lower"),
    D("Abduction élastique debout","Jambes",["Moyen fessier","Fessiers"],["Élastique"],3,15,45,"lower"),
    D("Mollets debout","Jambes",["Mollets"],["Poids du corps"],4,15,60,"lower"),

    D("Crunch","Abdos",["Abdominaux"],["Poids du corps"],3,15,60),
    D("Reverse crunch","Abdos",["Abdominaux"],["Poids du corps"],3,12,60),
    D("Relevés de jambes","Abdos",["Abdominaux","Fléchisseurs de hanche"],["Poids du corps"],3,10,60),
    D("Planche","Abdos",["Gainage","Abdominaux"],["Poids du corps"],3,45,45),
    D("Planche latérale","Abdos",["Obliques","Gainage"],["Poids du corps"],3,35,45),
    D("Dead bug","Abdos",["Gainage","Abdominaux"],["Poids du corps"],3,12,45),
    D("Mountain climbers","Abdos",["Gainage","Abdominaux","Fléchisseurs de hanche"],["Poids du corps"],3,20,45)
  ];

  const byName=new Map();
  exercises.forEach(e=>{byName.set(norm(e.name),e);(e.aliases||[]).forEach(a=>byName.set(norm(a),e));});
  function find(name){
    const n=norm(name);
    if(byName.has(n))return byName.get(n);
    return exercises.find(e=>n.includes(norm(e.name))||norm(e.name).includes(n))||null;
  }
  function toExercise(def,keepId){
    return {id:keepId||crypto.randomUUID(),name:def.name,targetSets:def.sets,targetReps:def.reps,rest:def.rest,category:def.category,libraryId:def.id,muscles:[...def.muscles],equipment:[...def.equipment]};
  }
  function groups(){return [...new Set(exercises.map(e=>e.group))];}
  function equipments(){return [...new Set(exercises.flatMap(e=>e.equipment))];}
  function filtered(query="",group="",equipment=""){
    const q=norm(query);
    return exercises.filter(e=>(!group||e.group===group)&&(!equipment||e.equipment.includes(equipment))&&(!q||norm([e.name,e.group,...e.muscles,...e.equipment].join(" ")).includes(q)));
  }
  function close(){document.querySelector(".dl-library-modal")?.remove();}
  function open(options={}){
    close();
    const modal=document.createElement("div");modal.className="ff-modal dl-library-modal";
    modal.innerHTML=`<div class="ff-modal-card"><div class="row"><div><div class="eyebrow">BIBLIOTHÈQUE MUSCULATION</div><h2 style="margin-top:5px">${exercises.length} exercices</h2></div><button class="ghost" data-lib-close>Fermer</button></div>
      <div class="field" style="margin-top:14px"><label>Rechercher</label><input data-lib-search placeholder="Ex. rowing, pectoraux, haltères…"></div>
      <div class="form-grid" style="margin-top:10px"><div class="field"><label>Zone</label><select data-lib-group><option value="">Toutes</option>${groups().map(x=>`<option>${x}</option>`).join("")}</select></div><div class="field"><label>Matériel</label><select data-lib-equipment><option value="">Tout</option>${equipments().map(x=>`<option>${x}</option>`).join("")}</select></div></div>
      <div data-lib-list style="margin-top:12px"></div></div>`;
    document.body.appendChild(modal);
    const search=modal.querySelector("[data-lib-search]"),group=modal.querySelector("[data-lib-group]"),equipment=modal.querySelector("[data-lib-equipment]"),list=modal.querySelector("[data-lib-list]");
    const render=()=>{
      const items=filtered(search.value,group.value,equipment.value);
      list.innerHTML=items.length?items.map(e=>`<button class="secondary full dl-lib-item" data-lib-id="${e.id}" type="button"><span class="dl-lib-visual">${window.FFGuide?.motion?.(e.name,true)||window.FFGuide?.svg?.(window.FFGuide?.info?.(e.name)?.type||"generic")||""}</span><span class="dl-lib-copy"><b>${e.name}</b><small>${e.group} · ${e.equipment.join(" + ")}</small><small>${e.sets} × ${e.reps} · repos ${e.rest}s</small></span></button>`).join(""):`<div class="empty">Aucun exercice avec ces filtres.</div>`;
      list.querySelectorAll("[data-lib-id]").forEach(b=>b.addEventListener("click",()=>{const d=exercises.find(x=>x.id===b.dataset.libId);if(!d)return;options.onChoose?.(d);close();}));
    };
    [search,group,equipment].forEach(x=>x.addEventListener(x===search?"input":"change",render));
    modal.querySelector("[data-lib-close]").onclick=close;modal.onclick=e=>{if(e.target===modal)close();};render();search.focus();
  }

  const baseExerciseEditor=window.exerciseEditor||exerciseEditor;
  exerciseEditor=function(e,i){
    const html=baseExerciseEditor(e,i);
    return html.replace(`<div class="field" style="margin-top:12px"><label>Nom</label>`,`<button type="button" class="secondary full dl-choose-exercise" data-library-index="${i}" style="margin-top:12px">Choisir dans la bibliothèque</button><div class="field" style="margin-top:10px"><label>Nom</label>`);
  };
  const baseBindEditor=window.bindEditor||bindEditor;
  bindEditor=function(obj,index){
    baseBindEditor(obj,index);
    document.querySelectorAll("[data-library-index]").forEach(btn=>btn.addEventListener("click",()=>{
      syncEditor(obj);const i=+btn.dataset.libraryIndex;
      open({onChoose:def=>{const old=obj.exercises[i]||{};obj.exercises[i]={...old,...toExercise(def,old.id)};editWorkoutWithObject(index,obj);}});
    }));
  };

  const baseRenderProgram=renderProgram;
  renderProgram=function(){
    baseRenderProgram();
    const first=view.querySelector(".card");if(!first)return;
    const box=document.createElement("section");box.className="card dl-library-card";
    box.innerHTML=`<div class="row"><div><div class="eyebrow">BIBLIOTHÈQUE</div><h3 style="margin-top:6px">${exercises.length} exercices structurés</h3></div><span class="pill">${groups().length} zones</span></div><p class="muted small">Recherche par muscle ou matériel. Les exercices conservent leurs séries, répétitions, repos et muscles cibles.</p><button class="secondary full" data-open-library>Parcourir les exercices</button>`;
    first.insertAdjacentElement("afterend",box);box.querySelector("[data-open-library]").onclick=()=>open();
  };

  const style=document.createElement("style");style.textContent=`
    .dl-lib-item{display:flex!important;align-items:center!important;gap:10px!important;text-align:left!important;margin-bottom:8px;padding:9px 11px!important}
    .dl-lib-visual{width:62px;min-width:62px;height:50px;display:grid;place-items:center;color:var(--accent2);overflow:hidden}.dl-lib-visual svg{width:58px!important;height:50px!important}
    .dl-lib-copy{display:flex;flex-direction:column;gap:3px;min-width:0}.dl-lib-copy b{color:var(--text);font-size:13px}.dl-lib-copy small{color:var(--muted);font-size:10px;font-weight:500}
  `;document.head.appendChild(style);

  window.DenatExerciseLibrary={exercises,find,filtered,toExercise,groups,equipments,open,norm};
})();