// ForgeFit V3 — guide visuel des mouvements
(function(){
  function norm(s){return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
  const defs=[
    {keys:["presse a cuisses"],type:"legs",muscles:["Quadriceps","Fessiers","Ischios"],cues:["Pieds stables et genoux dans l’axe.","Descends sans décoller le bassin.","Pousse avec tout le pied sans verrouiller brutalement."],avoid:"Ne raccourcis pas l’amplitude uniquement pour charger plus lourd."},
    {keys:["hack squat","goblet squat","squat","fentes"],type:"squat",muscles:["Quadriceps","Fessiers","Gainage"],cues:["Buste gainé et genoux alignés.","Descends avec contrôle.","Remonte en poussant le sol sans rebond."],avoid:"Ne laisse pas les genoux s’effondrer vers l’intérieur."},
    {keys:["developpe incline"],type:"press",muscles:["Haut des pectoraux","Triceps","Épaules"],cues:["Omoplates serrées et poitrine sortie.","Descends les haltères avec contrôle.","Pousse sans cogner les haltères en haut."],avoid:"Évite un dossier trop vertical qui transfère l’effort vers les épaules."},
    {keys:["developpe couche","developpe machine","chest press"],type:"press",muscles:["Pectoraux","Triceps","Épaules"],cues:["Épaules basses et omoplates stables.","Avant-bras proches de la verticale.","Contrôle la descente et garde les pieds ancrés."],avoid:"Ne décolle pas les épaules du support pour finir la répétition."},
    {keys:["tirage vertical","tractions"],type:"pull",muscles:["Grand dorsal","Biceps","Haut du dos"],cues:["Abaisse les épaules avant de tirer.","Amène les coudes vers les côtes.","Remonte avec contrôle jusqu’à l’étirement."],avoid:"Évite de te balancer ou de tirer uniquement avec les bras."},
    {keys:["rowing","tirage horizontal"],type:"row",muscles:["Milieu du dos","Grand dorsal","Biceps"],cues:["Poitrine stable et épaules basses.","Tire les coudes en arrière.","Marque la contraction puis reviens lentement."],avoid:"Ne transforme pas chaque répétition en mouvement du buste."},
    {keys:["souleve de terre roumain","hip hinge"],type:"hinge",muscles:["Ischios","Fessiers","Lombaires"],cues:["Recule les hanches avec le dos neutre.","Garde la charge proche des jambes.","Arrête avant d’arrondir le dos."],avoid:"Ce n’est pas un squat : les hanches reculent davantage que les genoux."},
    {keys:["pont fessier","hip thrust"],type:"hinge",muscles:["Fessiers","Ischios"],cues:["Pousse avec les talons.","Contracte les fessiers en haut.","Garde le bassin contrôlé."],avoid:"N’hyper-étends pas le bas du dos en haut du mouvement."},
    {keys:["abduction"],type:"legs",muscles:["Moyen fessier","Fessiers"],cues:["Garde le bassin stable.","Écarte la jambe sans élan.","Reviens lentement."],avoid:"Ne compense pas en inclinant fortement le buste."},
    {keys:["leg curl"],type:"machine",muscles:["Ischio-jambiers"],cues:["Bassin plaqué au support.","Fléchis sans donner d’élan.","Contrôle particulièrement le retour."],avoid:"Évite de décoller le bassin quand la série devient difficile."},
    {keys:["leg extension"],type:"machine",muscles:["Quadriceps"],cues:["Aligne l’axe du genou avec la machine.","Monte sans lancer la charge.","Redescends lentement."],avoid:"N’utilise pas un réglage qui force le genou dans une position inconfortable."},
    {keys:["elevation"],type:"raise",muscles:["Deltoïde moyen"],cues:["Coudes légèrement fléchis.","Monte sans hausser les épaules.","Contrôle la descente."],avoid:"Évite l’élan du buste et les charges trop lourdes."},
    {keys:["extension triceps","dips"],type:"arms",muscles:["Triceps"],cues:["Garde les coudes stables.","Étends sans donner d’élan.","Contrôle le retour."],avoid:"Évite de laisser les coudes partir largement vers l’extérieur."},
    {keys:["curl"],type:"arms",muscles:["Biceps","Brachial"],cues:["Coudes fixes et épaules basses.","Monte sans balancer le dos.","Redescends presque bras tendu sous contrôle."],avoid:"Si le buste se balance, réduis la charge."},
    {keys:["ecarte","pec deck"],type:"fly",muscles:["Pectoraux"],cues:["Garde une légère flexion du coude.","Rapproche les bras en serrant les pectoraux.","Épaules en arrière pendant le mouvement."],avoid:"Ne cherche pas un étirement extrême derrière le buste."},
    {keys:["mollet"],type:"calf",muscles:["Mollets"],cues:["Descends le talon pour t’étirer.","Monte haut sur la pointe du pied.","Marque une pause en haut."],avoid:"Évite les petites répétitions rebondies."},
    {keys:["crunch"],type:"core",muscles:["Abdominaux"],cues:["Enroule le sternum vers le bassin.","Expire pendant la contraction.","Garde le mouvement court et contrôlé."],avoid:"Ne tire pas sur la nuque."},
    {keys:["releve","reverse crunch"],type:"core",muscles:["Abdominaux","Fléchisseurs de hanche"],cues:["Rétroverse légèrement le bassin.","Monte sans élan.","Redescends sans creuser exagérément le dos."],avoid:"Si tu te balances, réduis l’amplitude."}
  ];
  function info(name){const n=norm(name);return defs.find(d=>d.keys.some(k=>n.includes(k)))||{type:"generic",muscles:["Muscles ciblés"],cues:["Choisis une charge permettant une exécution propre.","Contrôle la phase de retour.","Arrête si la technique se dégrade nettement."],avoid:"Ne sacrifie pas l’amplitude et le contrôle pour la charge."};}
  function svg(type){
    const s='stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"';
    const head=`<circle cx="70" cy="34" r="11" ${s}/>`;
    const body=`${head}<path d="M70 46v42M70 58L43 76M70 58l27 18M70 88l-20 34M70 88l22 34" ${s}/>`;
    const extra={
      legs:`<path d="M20 118h130M100 88l30-30M130 58h24" ${s}/>`,
      squat:`<path d="M27 64h88M50 122h55" ${s}/>`,
      press:`<path d="M28 112h115M30 62h90" ${s}/>`,
      pull:`<path d="M22 20h120M40 20l25 40M124 20L95 60" ${s}/>`,
      row:`<path d="M20 112h135M98 74l38-8" ${s}/>`,
      hinge:`<path d="M25 110h110M46 102h54" ${s}/>`,
      machine:`<path d="M25 55v65M25 78h70M95 78v42" ${s}/>`,
      raise:`<path d="M20 70h28M94 70h30" ${s}/>`,
      arms:`<circle cx="37" cy="78" r="7" ${s}/><circle cx="104" cy="78" r="7" ${s}/>`,
      fly:`<path d="M18 48h32M90 48h32" ${s}/>`,
      calf:`<path d="M25 126h115M47 122l15-4M91 122l15-4" ${s}/>`,
      core:`<path d="M20 112h135M55 94l-25 17" ${s}/>`
    };
    return `<svg viewBox="0 0 170 140" aria-hidden="true">${body}${extra[type]||""}</svg>`;
  }
  function open(name){
    document.querySelector(".ff-modal")?.remove();
    const d=info(name),modal=document.createElement("div");
    modal.className="ff-modal";
    modal.innerHTML=`<div class="ff-modal-card"><div class="row"><div><div class="eyebrow">MOUVEMENT</div><h2 style="margin-top:5px">${esc(name)}</h2></div><button class="ghost" data-close>Fermer</button></div><div class="ff-modal-visual">${svg(d.type)}</div><div class="eyebrow">MUSCLES PRINCIPAUX</div><div class="ff-muscles">${d.muscles.map(m=>`<span class="pill">${esc(m)}</span>`).join("")}</div><div class="eyebrow">REPÈRES TECHNIQUES</div>${d.cues.map((c,i)=>`<div class="ff-cue"><b>${i+1}.</b> ${esc(c)}</div>`).join("")}<div class="notice" style="margin-top:14px"><b>À éviter :</b> ${esc(d.avoid)}</div></div>`;
    document.body.appendChild(modal);modal.querySelector("[data-close]").onclick=()=>modal.remove();modal.onclick=e=>{if(e.target===modal)modal.remove();};
  }
  window.FFGuide={info,svg,open};
})();
