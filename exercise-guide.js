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
    {keys:["pompe"],type:"pushup",muscles:["Pectoraux","Triceps","Gainage"],cues:["Corps gainé de la tête aux talons.","Descends la poitrine entre les mains avec contrôle.","Pousse le sol sans laisser le bassin s’affaisser."],avoid:"Ne raccourcis pas l’amplitude en avançant seulement la tête."},
    {keys:["developpe epaules"],type:"overheadpress",muscles:["Deltoïdes","Triceps"],cues:["Garde le buste stable et les côtes contrôlées.","Pousse au-dessus de la tête sans cogner les charges.","Redescends jusqu’à une amplitude confortable."],avoid:"Évite de cambrer fortement le bas du dos pour finir la répétition."},
    {keys:["oiseau","reverse pec deck","face pull"],type:"rearraise",muscles:["Deltoïde postérieur","Haut du dos"],cues:["Épaules basses et poitrine stable.","Écarte en initiant le mouvement par les coudes.","Contrôle le retour sans relâcher brutalement."],avoid:"Évite l’élan du buste et les trapèzes qui montent vers les oreilles."},
    {keys:["planche"],type:"plank",muscles:["Gainage","Abdominaux"],cues:["Aligne tête, bassin et chevilles.","Serre abdominaux et fessiers.","Respire sans perdre la position."],avoid:"Ne laisse pas le bassin tomber ni monter exagérément."},
    {keys:["dead bug"],type:"core",muscles:["Gainage","Abdominaux"],cues:["Garde le bas du dos contrôlé.","Allonge bras et jambe opposée lentement.","Reviens sans perdre la tension abdominale."],avoid:"Réduis l’amplitude si le bas du dos se creuse."},
    {keys:["mountain climber"],type:"plank",muscles:["Gainage","Abdominaux","Fléchisseurs de hanche"],cues:["Garde les épaules au-dessus des mains.","Ramène les genoux sans rebond du bassin.","Maintiens un rythme contrôlé."],avoid:"Ne transforme pas le mouvement en balancement du bassin."},
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
  function motionType(name){
    const n=norm(name);
    if(n.includes("presse a cuisses")||n.includes("presse horizontale"))return "legpress";
    if(n.includes("hack squat"))return "hacksquat";
    if(n.includes("fente")||n.includes("step-up"))return "lunge";
    if(n.includes("goblet squat")||n.includes("squat"))return "squat";
    if(n.includes("pompe"))return "pushup";
    if(n.includes("dips"))return "dip";
    if(n.includes("developpe epaules"))return "overheadpress";
    if(n.includes("developpe incline")||n.includes("chest press inclinee"))return "inclinepress";
    if(n.includes("developpe couche")||n.includes("chest press"))return "press";
    if(n.includes("tirage vertical"))return "latpulldown";
    if(n.includes("traction"))return "pull";
    if(n.includes("rowing")||n.includes("tirage horizontal"))return "row";
    if(n.includes("pullover"))return "pull";
    if(n.includes("souleve de terre roumain")||n.includes("hip hinge"))return "hinge";
    if(n.includes("pont fessier")||n.includes("hip thrust"))return "hipthrust";
    if(n.includes("abduction"))return "abduction";
    if(n.includes("leg curl"))return "legcurl";
    if(n.includes("leg extension"))return "legextension";
    if(n.includes("oiseau")||n.includes("reverse pec deck")||n.includes("face pull"))return "rearraise";
    if(n.includes("elevation"))return "raise";
    if(n.includes("curl"))return "curl";
    if(n.includes("extension triceps")||n.includes("barre au front"))return "triceps";
    if(n.includes("ecarte")||n.includes("pec deck"))return "fly";
    if(n.includes("mollet"))return "calf";
    if(n.includes("planche")||n.includes("mountain climber"))return "plank";
    if(n.includes("crunch")||n.includes("releve")||n.includes("dead bug"))return "core";
    return null;
  }

  function motionSvg(name,compact=false){
    const type=motionType(name);
    if(!type)return "";
    const s='stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"';
    const poses={
      pushup:[
        `<path d="M16 88h92" ${s}/><circle cx="82" cy="48" r="7" ${s}/><path d="M75 53L48 65 27 78M49 65l25 18M27 78l-8 10M74 83l18 5" ${s}/>`,
        `<path d="M16 88h92" ${s}/><circle cx="82" cy="61" r="7" ${s}/><path d="M75 65L49 72 28 80M49 72l24 11M28 80l-9 8M73 83l19 5" ${s}/>`,
        `<path d="M16 88h92" ${s}/><circle cx="82" cy="48" r="7" ${s}/><path d="M75 53L48 65 27 78M49 65l25 18M27 78l-8 10M74 83l18 5" ${s}/>`
      ],
      dip:[
        `<path d="M24 54h25M72 54h25M32 54v42M89 54v42" ${s}/><circle cx="60" cy="28" r="7" ${s}/><path d="M60 35v33M60 45L43 55M60 45l17 10M60 68L50 94M60 68l10 26" ${s}/>`,
        `<path d="M24 54h25M72 54h25M32 54v42M89 54v42" ${s}/><circle cx="60" cy="39" r="7" ${s}/><path d="M60 46v28M60 52L43 55M60 52l17 3M60 74L50 96M60 74l10 22" ${s}/>`,
        `<path d="M24 54h25M72 54h25M32 54v42M89 54v42" ${s}/><circle cx="60" cy="28" r="7" ${s}/><path d="M60 35v33M60 45L43 55M60 45l17 10M60 68L50 94M60 68l10 26" ${s}/>`
      ],
      overheadpress:[
        `<circle cx="60" cy="30" r="7" ${s}/><path d="M60 37v36M60 48L44 60l-2-18M60 48l16 12 2-18M60 73L49 98M60 73l11 25M38 42h8M74 42h8" ${s}/>`,
        `<circle cx="60" cy="30" r="7" ${s}/><path d="M60 37v36M60 48L48 39l-2-20M60 48l12-9 2-20M60 73L49 98M60 73l11 25M42 19h8M70 19h8" ${s}/>`,
        `<circle cx="60" cy="30" r="7" ${s}/><path d="M60 37v36M60 48L52 26V9M60 48l8-22V9M60 73L49 98M60 73l11 25M48 9h8M64 9h8" ${s}/>`
      ],
      rearraise:[
        `<circle cx="48" cy="34" r="7" ${s}/><path d="M52 40L67 66M60 53L39 66M60 53l28 5M67 66L51 96M67 66l20 30" ${s}/>`,
        `<circle cx="48" cy="34" r="7" ${s}/><path d="M52 40L67 66M60 53L31 53M60 53l36-3M67 66L51 96M67 66l20 30" ${s}/>`,
        `<circle cx="48" cy="34" r="7" ${s}/><path d="M52 40L67 66M60 53L25 43M60 53l40-12M67 66L51 96M67 66l20 30" ${s}/>`
      ],
      lunge:[
        `<circle cx="58" cy="22" r="7" ${s}/><path d="M58 29v38M58 67L43 96M58 67l24 29M58 44L43 58M58 44l15 14" ${s}/><path d="M25 98h76" ${s}/>`,
        `<circle cx="61" cy="31" r="7" ${s}/><path d="M61 38v33M61 71L42 78l-15 18M61 71l25 8 11 17M61 49L45 60M61 49l16 11" ${s}/><path d="M22 98h82" ${s}/>`,
        `<circle cx="64" cy="37" r="7" ${s}/><path d="M64 44v29M64 73L43 76l-17 20M64 73l27 4 12 19M64 53L47 62M64 53l17 9" ${s}/><path d="M20 98h88" ${s}/>`
      ],
      plank:[
        `<path d="M14 90h96" ${s}/><circle cx="87" cy="56" r="7" ${s}/><path d="M80 61L55 69 29 80M55 69l27 16M29 80l-9 10M82 85l16 5" ${s}/>`,
        `<path d="M14 90h96" ${s}/><circle cx="87" cy="56" r="7" ${s}/><path d="M80 61L55 69 29 80M55 69l17 13-8 8M29 80l-9 10M72 82l17 8" ${s}/>`,
        `<path d="M14 90h96" ${s}/><circle cx="87" cy="56" r="7" ${s}/><path d="M80 61L55 69 29 80M55 69l27 16M29 80l-9 10M82 85l16 5" ${s}/>`
      ],
      legpress:[
        `<path d="M14 18l26 76M88 12l18 72M84 14h24M91 84h18" ${s}/><circle cx="45" cy="38" r="7" ${s}/><path d="M41 45l-10 24M31 69l24 10 25-8M55 79l20 17M80 71l17 17" ${s}/>`,
        `<path d="M14 18l26 76M88 12l18 72M84 14h24M91 84h18" ${s}/><circle cx="45" cy="38" r="7" ${s}/><path d="M41 45l-10 24M31 69l31 1 22-16M62 70l24 19M84 54l13 34" ${s}/>`,
        `<path d="M14 18l26 76M88 12l18 72M84 14h24M91 84h18" ${s}/><circle cx="45" cy="38" r="7" ${s}/><path d="M41 45l-10 24M31 69l38-8 20-27M69 61l23 27M89 34l8 54" ${s}/>`
      ],
      hacksquat:[
        `<path d="M24 10l22 90M82 10l22 90M20 98h88" ${s}/><circle cx="58" cy="27" r="7" ${s}/><path d="M58 34l6 34M62 47l20-8M64 68L50 96M64 68l20 28" ${s}/>`,
        `<path d="M24 10l22 90M82 10l22 90M20 98h88" ${s}/><circle cx="62" cy="39" r="7" ${s}/><path d="M62 46l5 27M65 55l19-7M67 73L49 84l-5 12M67 73l22 10 7 13" ${s}/>`,
        `<path d="M24 10l22 90M82 10l22 90M20 98h88" ${s}/><circle cx="66" cy="51" r="7" ${s}/><path d="M66 58l4 21M68 64l18-7M70 79L48 82l-8 14M70 79l23 3 9 14" ${s}/>`
      ],
      inclinepress:[
        `<path d="M22 88l42-28M64 60h38M28 88v10M98 60v38" ${s}/><circle cx="50" cy="55" r="7" ${s}/><path d="M55 60l20 14M62 65l8-22M74 73l13-20M67 43h8M84 53h8" ${s}/>`,
        `<path d="M22 88l42-28M64 60h38M28 88v10M98 60v38" ${s}/><circle cx="50" cy="55" r="7" ${s}/><path d="M55 60l20 14M62 65l13-31M74 73l18-31M72 34h8M89 42h8" ${s}/>`,
        `<path d="M22 88l42-28M64 60h38M28 88v10M98 60v38" ${s}/><circle cx="50" cy="55" r="7" ${s}/><path d="M55 60l20 14M62 65l19-39M74 73l24-39M78 26h8M95 34h8" ${s}/>`
      ],
      latpulldown:[
        `<path d="M20 14h80M60 14v12M30 92h60" ${s}/><circle cx="60" cy="45" r="7" ${s}/><path d="M60 52v27M60 57L35 18M60 57l25-39M60 79L50 94M60 79l10 15" ${s}/>`,
        `<path d="M20 14h80M60 14v12M30 92h60" ${s}/><circle cx="60" cy="45" r="7" ${s}/><path d="M60 52v27M60 57L40 31l-5-13M60 57l20-26 5-13M60 79L50 94M60 79l10 15" ${s}/>`,
        `<path d="M20 14h80M60 14v12M30 92h60" ${s}/><circle cx="60" cy="45" r="7" ${s}/><path d="M60 52v27M60 57L44 47l-9-29M60 57l16-10 9-29M60 79L50 94M60 79l10 15" ${s}/>`
      ],
      hipthrust:[
        `<path d="M12 66h38M12 66v28M50 66v28M18 94h88" ${s}/><circle cx="48" cy="58" r="7" ${s}/><path d="M54 61l28 19M82 80L67 94M82 80l22 14" ${s}/>`,
        `<path d="M12 66h38M12 66v28M50 66v28M18 94h88" ${s}/><circle cx="48" cy="58" r="7" ${s}/><path d="M54 61l31 10M85 71L68 94M85 71l19 23" ${s}/>`,
        `<path d="M12 66h38M12 66v28M50 66v28M18 94h88" ${s}/><circle cx="48" cy="58" r="7" ${s}/><path d="M54 61h34M88 61L69 94M88 61l16 33" ${s}/>`
      ],
      abduction:[
        `<circle cx="60" cy="22" r="7" ${s}/><path d="M60 29v38M60 67L52 96M60 67l8 29" ${s}/>`,
        `<circle cx="60" cy="22" r="7" ${s}/><path d="M60 29v38M60 67L48 96M60 67l18 25" ${s}/>`,
        `<circle cx="60" cy="22" r="7" ${s}/><path d="M60 29v38M60 67L44 96M60 67l29 19" ${s}/>`
      ],
      legcurl:[
        `<path d="M15 55h76M22 55v39M84 55v39" ${s}/><circle cx="30" cy="45" r="7" ${s}/><path d="M37 48l35 8M72 56l26 26" ${s}/>`,
        `<path d="M15 55h76M22 55v39M84 55v39" ${s}/><circle cx="30" cy="45" r="7" ${s}/><path d="M37 48l35 8M72 56l18 12 8-20" ${s}/>`,
        `<path d="M15 55h76M22 55v39M84 55v39" ${s}/><circle cx="30" cy="45" r="7" ${s}/><path d="M37 48l35 8M72 56l12 2 4-28" ${s}/>`
      ],
      legextension:[
        `<path d="M20 38v55M20 60h45M65 60v33" ${s}/><circle cx="48" cy="43" r="7" ${s}/><path d="M48 50l10 27M58 77l23 17" ${s}/>`,
        `<path d="M20 38v55M20 60h45M65 60v33" ${s}/><circle cx="48" cy="43" r="7" ${s}/><path d="M48 50l10 27M58 77l31 7" ${s}/>`,
        `<path d="M20 38v55M20 60h45M65 60v33" ${s}/><circle cx="48" cy="43" r="7" ${s}/><path d="M48 50l10 27M58 77h36" ${s}/>`
      ],
      curl:[
        `<circle cx="60" cy="22" r="7" ${s}/><path d="M60 29v39M60 42L46 61l-2 24M60 42l14 19 2 24M60 68L50 97M60 68l10 29" ${s}/>`,
        `<circle cx="60" cy="22" r="7" ${s}/><path d="M60 29v39M60 42L46 60l8 14M60 42l14 18-8 14M60 68L50 97M60 68l10 29" ${s}/>`,
        `<circle cx="60" cy="22" r="7" ${s}/><path d="M60 29v39M60 42L46 58l13 2M60 42l14 16-13 2M60 68L50 97M60 68l10 29" ${s}/>`
      ],
      triceps:[
        `<circle cx="60" cy="22" r="7" ${s}/><path d="M60 29v39M60 42L47 58l5 8M60 42l13 16-5 8M60 68L50 97M60 68l10 29" ${s}/>`,
        `<circle cx="60" cy="22" r="7" ${s}/><path d="M60 29v39M60 42L47 58l-1 18M60 42l13 16 1 18M60 68L50 97M60 68l10 29" ${s}/>`,
        `<circle cx="60" cy="22" r="7" ${s}/><path d="M60 29v39M60 42L47 58l-5 28M60 42l13 16 5 28M60 68L50 97M60 68l10 29" ${s}/>`
      ],
      squat:[
        `<circle cx="60" cy="22" r="8" ${s}/><path d="M60 31v34M60 43L40 58M60 43l20 15M60 65L46 92M60 65l18 27M28 96h68" ${s}/>`,
        `<circle cx="60" cy="31" r="8" ${s}/><path d="M60 40l-4 28M58 49L40 61M58 49l19 12M56 68L39 78l-9 18M56 68l22 9 8 19M28 96h68" ${s}/>`,
        `<circle cx="60" cy="40" r="8" ${s}/><path d="M60 49l-8 25M56 57L38 66M56 57l20 9M52 74L34 78l-8 18M52 74l26 4 10 18M24 96h70" ${s}/>`
      ],
      press:[
        `<path d="M18 84h88M31 84V72M91 84V72" ${s}/><circle cx="38" cy="62" r="7" ${s}/><path d="M45 64h32M53 64l-3-21M69 64l4-21M47 43h8M69 43h8" ${s}/>`,
        `<path d="M18 84h88M31 84V72M91 84V72" ${s}/><circle cx="38" cy="62" r="7" ${s}/><path d="M45 64h32M53 64l-1-30M69 64l2-30M48 34h8M67 34h8" ${s}/>`,
        `<path d="M18 84h88M31 84V72M91 84V72" ${s}/><circle cx="38" cy="62" r="7" ${s}/><path d="M45 64h32M53 64V22M69 64V22M49 22h8M65 22h8" ${s}/>`
      ],
      pull:[
        `<path d="M20 14h80" ${s}/><circle cx="60" cy="42" r="8" ${s}/><path d="M60 51v28M60 56L35 18M60 56l25-38M60 79L48 98M60 79l12 19" ${s}/>`,
        `<path d="M20 14h80" ${s}/><circle cx="60" cy="36" r="8" ${s}/><path d="M60 45v29M60 50L38 27l-3-13M60 50l22-23 3-13M60 74L48 96M60 74l12 22" ${s}/>`,
        `<path d="M20 14h80" ${s}/><circle cx="60" cy="28" r="8" ${s}/><path d="M60 37v29M60 42L42 30l-7-16M60 42l18-12 7-16M60 66L48 94M60 66l12 28" ${s}/>`
      ],
      row:[
        `<circle cx="45" cy="35" r="8" ${s}/><path d="M45 44l8 30M49 54L84 58M53 74L35 95M53 74l23 21M84 58h20" ${s}/>`,
        `<circle cx="45" cy="35" r="8" ${s}/><path d="M45 44l8 30M49 54L72 57l15-4M53 74L35 95M53 74l23 21M87 53h17" ${s}/>`,
        `<circle cx="45" cy="35" r="8" ${s}/><path d="M45 44l8 30M49 54L65 57l10-10M53 74L35 95M53 74l23 21M75 47h12" ${s}/>`
      ],
      hinge:[
        `<circle cx="58" cy="22" r="8" ${s}/><path d="M58 31v37M58 44L42 61M58 44l16 17M58 68L48 96M58 68l16 28" ${s}/>`,
        `<circle cx="73" cy="35" r="8" ${s}/><path d="M68 42L50 65M59 53L43 72M59 53l20 18M50 65L45 96M50 65l25 31" ${s}/>`,
        `<circle cx="84" cy="49" r="8" ${s}/><path d="M77 53L49 68M65 60L44 76M65 60l22 20M49 68L45 96M49 68l27 28" ${s}/>`
      ],
      raise:[
        `<circle cx="60" cy="24" r="8" ${s}/><path d="M60 33v38M60 44L48 70M60 44l12 26M60 71L48 98M60 71l12 27" ${s}/>`,
        `<circle cx="60" cy="24" r="8" ${s}/><path d="M60 33v38M60 44L36 58M60 44l24 14M60 71L48 98M60 71l12 27" ${s}/>`,
        `<circle cx="60" cy="24" r="8" ${s}/><path d="M60 33v38M60 44L25 44M60 44h35M60 71L48 98M60 71l12 27" ${s}/>`
      ],
      arms:[
        `<circle cx="60" cy="24" r="8" ${s}/><path d="M60 33v38M60 44L45 60l-2 22M60 44l15 16 2 22M60 71L48 98M60 71l12 27" ${s}/>`,
        `<circle cx="60" cy="24" r="8" ${s}/><path d="M60 33v38M60 44L45 58l8 15M60 44l15 14-8 15M60 71L48 98M60 71l12 27" ${s}/>`,
        `<circle cx="60" cy="24" r="8" ${s}/><path d="M60 33v38M60 44L45 57l12 2M60 44l15 13-12 2M60 71L48 98M60 71l12 27" ${s}/>`
      ],
      fly:[
        `<circle cx="60" cy="24" r="8" ${s}/><path d="M60 33v38M60 44L25 48M60 44l35 4M60 71L48 98M60 71l12 27" ${s}/>`,
        `<circle cx="60" cy="24" r="8" ${s}/><path d="M60 33v38M60 44L38 50l8 7M60 44l22 6-8 7M60 71L48 98M60 71l12 27" ${s}/>`,
        `<circle cx="60" cy="24" r="8" ${s}/><path d="M60 33v38M60 44L53 55h7M60 44l7 11h-7M60 71L48 98M60 71l12 27" ${s}/>`
      ],
      calf:[
        `<circle cx="60" cy="22" r="8" ${s}/><path d="M60 31v38M60 69L48 95h-8M60 69l12 26h8M28 98h64" ${s}/>`,
        `<circle cx="60" cy="18" r="8" ${s}/><path d="M60 27v38M60 65L48 91h-5M60 65l12 26h5M28 98h64" ${s}/>`,
        `<circle cx="60" cy="14" r="8" ${s}/><path d="M60 23v38M60 61L48 87M60 61l12 26M28 98h64" ${s}/>`
      ],
      core:[
        `<path d="M20 88h88" ${s}/><circle cx="38" cy="65" r="7" ${s}/><path d="M45 68l30 12M56 73L42 88M75 80l22 8" ${s}/>`,
        `<path d="M20 88h88" ${s}/><circle cx="43" cy="56" r="7" ${s}/><path d="M49 61l25 19M58 68L44 84M74 80l23 8" ${s}/>`,
        `<path d="M20 88h88" ${s}/><circle cx="50" cy="48" r="7" ${s}/><path d="M55 54l19 26M61 64L48 79M74 80l23 8" ${s}/>`
      ],
      legs:[
        `<circle cx="60" cy="22" r="8" ${s}/><path d="M60 31v38M60 69L50 97M60 69l10 28M30 99h60" ${s}/>`,
        `<circle cx="60" cy="22" r="8" ${s}/><path d="M60 31v38M60 69L42 92M60 69l20 23M30 99h60" ${s}/>`,
        `<circle cx="60" cy="22" r="8" ${s}/><path d="M60 31v38M60 69L34 85M60 69l28 16M30 99h60" ${s}/>`
      ],
      machine:[
        `<path d="M20 30v68M20 65h32M52 65v33" ${s}/><circle cx="45" cy="44" r="7" ${s}/><path d="M45 51l7 28M52 79l18 15" ${s}/>`,
        `<path d="M20 30v68M20 65h32M52 65v33" ${s}/><circle cx="45" cy="44" r="7" ${s}/><path d="M45 51l7 28M52 79l27 6" ${s}/>`,
        `<path d="M20 30v68M20 65h32M52 65v33" ${s}/><circle cx="45" cy="44" r="7" ${s}/><path d="M45 51l7 28M52 79h34" ${s}/>`
      ]
    };
    const frames=poses[type];
    if(!frames)return "";
    const cls=compact?"ff-motion ff-motion-mini":"ff-motion";
    return `<div class="${cls}" aria-label="Animation en trois positions du mouvement"><svg viewBox="0 0 120 108" aria-hidden="true"><g class="ff-motion-frame ff-motion-f1">${frames[0]}</g><g class="ff-motion-frame ff-motion-f2">${frames[1]}</g><g class="ff-motion-frame ff-motion-f3">${frames[2]}</g></svg></div>`;
  }

  const motionStyle=document.createElement("style");
  motionStyle.textContent=`
    .ff-motion{width:100%;max-width:260px;margin:4px auto 14px;color:var(--accent2)}
    .ff-motion svg{display:block;width:100%;height:auto}
    .ff-motion-frame{opacity:0;animation:ffMotion3 2.1s steps(1,end) infinite}
    .ff-motion-f1{animation-delay:0s}.ff-motion-f2{animation-delay:.7s}.ff-motion-f3{animation-delay:1.4s}
    @keyframes ffMotion3{0%,32%{opacity:1}33%,100%{opacity:0}}
    .ff-motion-mini{width:54px;min-width:54px;margin:0;color:var(--accent2)}
    .ff-motion-mini svg{width:54px;height:48px}
    @media (prefers-reduced-motion:reduce){.ff-motion-frame{animation:none;opacity:0}.ff-motion-f2{opacity:1}}
  `;
  document.head.appendChild(motionStyle);

  function open(name){
    document.querySelector(".ff-modal")?.remove();
    const d=info(name),modal=document.createElement("div");
    modal.className="ff-modal";
    modal.innerHTML=`<div class="ff-modal-card"><div class="row"><div><div class="eyebrow">MOUVEMENT</div><h2 style="margin-top:5px">${esc(name)}</h2></div><button class="ghost" data-close>Fermer</button></div><div class="notice small" style="margin:12px 0 16px"><b>Guide technique</b> · suis les repères ci-dessous plutôt qu’un dessin approximatif.</div><div class="eyebrow">MUSCLES PRINCIPAUX</div><div class="ff-muscles">${d.muscles.map(m=>`<span class="pill">${esc(m)}</span>`).join("")}</div><div class="eyebrow">REPÈRES TECHNIQUES</div>${d.cues.map((c,i)=>`<div class="ff-cue"><b>${i+1}.</b> ${esc(c)}</div>`).join("")}<div class="notice" style="margin-top:14px"><b>À éviter :</b> ${esc(d.avoid)}</div></div>`;
    document.body.appendChild(modal);modal.querySelector("[data-close]").onclick=()=>modal.remove();modal.onclick=e=>{if(e.target===modal)modal.remove();};
  }
  window.FFGuide={info,svg,motion:motionSvg,open};
})();
