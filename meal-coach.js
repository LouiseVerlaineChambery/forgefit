// Denat Life — coach repas partagé, sans API payante.
(function(){
  const KEY=()=>`denat_profile_${window.DenatProfile?.currentId?.()||"jocelyn"}_meal_coach_v1`;
  const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY())||'{"history":[],"restaurants":[]}');}catch{return {history:[],restaurants:[]};}};
  const save=x=>localStorage.setItem(KEY(),JSON.stringify(x));
  const person=()=>window.DenatProfile?.current?.().meal||localStorage.getItem("forgefit_meals_person")||"p1";
  const personName=()=>window.DenatProfile?.label?.()||(person()==="p1"?"Jocelyn":"Anaïs");
  const journalKey=()=>window.DenatProfile?.journalKey?.()||`denat_profile_${person()==="p2"?"anais":"jocelyn"}_food_journal_v1`;
  const readJournal=()=>{try{const x=JSON.parse(localStorage.getItem(journalKey())||"[]");return Array.isArray(x)?x:[];}catch{return[];}};
  const saveJournal=x=>localStorage.setItem(journalKey(),JSON.stringify(x.slice(-365)));
  function addJournal(entry){
    if(entry?.text&&window.DenatNutrition?.add)return window.DenatNutrition.add(entry.text,{type:entry.type||"meal",kcalRange:entry.kcalRange,proteinRange:entry.proteinRange,confidence:entry.confidence});
    const x=readJournal();x.push({id:crypto.randomUUID(),at:new Date().toISOString(),person:personName(),...entry});saveJournal(x);return x[x.length-1];
  }

  const STOP=new Set("j ai jai de du des le la les un une et avec dans mon ma mes au aux a pour ce cette ca ça il me reste frigo placard maison fais fait moi repas recette stp s il te plait quoi manger peux peut on".split(" "));
  const SYN={patate:"pomme de terre",patates:"pomme de terre",pdt:"pomme de terre",poulets:"poulet",courgette:"courgettes",tomate:"tomates",oeuf:"oeufs",œuf:"oeufs",riz:"riz",pates:"pates",pâte:"pates",thon:"thon",saumon:"saumon",boeuf:"boeuf",bœuf:"boeuf"};
  function tokens(text){
    return [...new Set(norm(text).replace(/[^a-z0-9àâçéèêëîïôûùüÿñæœ -]/g," ").split(/\s+/).filter(x=>x.length>2&&!STOP.has(x)).map(x=>SYN[x]||x))];
  }
  function cleanIngredient(x){return norm(x).replace(/^\s*[\d,.]+\s*(g|kg|ml|cl|l)?\s*/,"").trim();}
  function recipes(){return window.DenatMealEngine?.allRecipes?.()||[];}
  function richness(r){
    const s=norm([r.title,...r.ingredients].join(" "));
    let n=0;
    ["pizza","pesto","creme","fromage","mozzarella","coco","gnocchi"].forEach(k=>{if(s.includes(k))n++;});
    return n>=2?"rich":n===1?"medium":"balanced";
  }
  function pantryMatch(text){
    const ts=tokens(text),rs=recipes();
    const ranked=rs.map(r=>{
      const hay=norm([r.title,...r.ingredients].join(" "));
      let score=0;ts.forEach(t=>{if(hay.includes(t))score+=r.title&&norm(r.title).includes(t)?4:2;});
      return {r,score};
    }).sort((a,b)=>b.score-a.score||a.r.total-b.r.total);
    return {tokens:ts,best:ranked[0]?.score?ranked[0]:null};
  }
  function missingFor(r,ts){
    return r.ingredients.filter(x=>!ts.some(t=>cleanIngredient(x).includes(t))).slice(0,4);
  }
  function restaurantEstimate(text){
    const n=norm(text);
    const rules=[
      {k:["burger","frites"],name:"burger + frites",kcal:[900,1300],protein:[30,50]},
      {k:["pizza"],name:"pizza",kcal:[750,1200],protein:[25,45]},
      {k:["kebab","tacos"],name:"kebab / tacos",kcal:[850,1400],protein:[30,55]},
      {k:["sushi","maki"],name:"sushis",kcal:[550,950],protein:[25,45]},
      {k:["steak","entrecote","viande"],name:"viande + accompagnement",kcal:[650,1100],protein:[35,60]},
      {k:["pates","pasta","carbonara"],name:"plat de pâtes",kcal:[650,1100],protein:[20,40]},
      {k:["salade"],name:"salade composée",kcal:[350,800],protein:[20,40]},
      {k:["poisson","saumon","cabillaud"],name:"poisson + accompagnement",kcal:[500,900],protein:[30,50]}
    ];
    return rules.find(r=>r.k.some(k=>n.includes(k)))||{name:"repas au restaurant",kcal:[600,1100],protein:[20,45]};
  }
  function absNote(level){
    if(level==="rich")return "😄 Pas idéal pour les abdos de Jocelyn si ça devient fréquent : c’est un repas assez riche. Aucun souci ponctuellement ; on garde simplement les autres repas normaux et protéinés.";
    return "✓ Compatible avec l’objectif de Jocelyn : portion raisonnable, protéines et légumes restent prioritaires.";
  }
  function recipeAnswer(r,ts=[]){
    const miss=missingFor(r,ts),rich=richness(r);
    return `<div class="dlmc-answer"><b>${esc(r.title)}</b><div class="small muted" style="margin-top:5px">≈ ${r.total} min · 4 portions</div><div class="dlmc-portions"><div><b>Jocelyn</b><br>${esc(r.p1)}</div><div><b>Anaïs</b><br>${esc(r.p2)}</div></div>${miss.length?`<p class="small"><b>À vérifier / compléter :</b> ${miss.map(esc).join(" · ")}</p>`:""}<p class="small"><b>Recette :</b></p><ol class="dlmc-steps">${r.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol><div class="notice small">${absNote(rich)}</div></div>`;
  }
  function restaurantAnswer(text){
    const e=restaurantEstimate(text),midK=Math.round((e.kcal[0]+e.kcal[1])/2),midP=Math.round((e.protein[0]+e.protein[1])/2);
    const db=read();db.restaurants=db.restaurants||[];db.restaurants.push({at:new Date().toISOString(),person:personName(),text,kcalRange:e.kcal,proteinRange:e.protein});db.restaurants=db.restaurants.slice(-90);save(db);
    addJournal({type:"restaurant",text,kcalRange:e.kcal,proteinRange:e.protein,rich:midK>=900});
    const rich=midK>=900?"rich":"balanced";
    return `<div class="dlmc-answer"><b>Restaurant enregistré · ${esc(personName())}</b><p class="small">Pour ${esc(e.name)}, je garde une estimation large : <b>≈ ${e.kcal[0]}–${e.kcal[1]} kcal</b> et <b>≈ ${e.protein[0]}–${e.protein[1]} g de protéines</b>. Sans poids ni fiche nutritionnelle du restaurant, ce n’est pas une mesure exacte.</p><div class="notice small">${absNote(rich)}</div><p class="small muted">Pas de compensation punitive demain : on reprend simplement le menu prévu, avec protéines, légumes et faim normale.</p></div>`;
  }
  function foodEstimate(text){
    if(window.DenatNutrition?.estimate)return window.DenatNutrition.estimate(text);
    const e=restaurantEstimate(text),n=norm(text);
    if(e.name!=="repas au restaurant")return e;
    if(/yaourt|skyr|fromage blanc/.test(n))return {name:"collation lactée",kcal:[100,300],protein:[8,25]};
    if(/sandwich/.test(n))return {name:"sandwich",kcal:[400,800],protein:[20,40]};
    if(/poulet|dinde|oeuf|oeufs|thon/.test(n))return {name:"repas protéiné",kcal:[400,850],protein:[30,60]};
    return {name:"repas déclaré",kcal:[350,900],protein:[15,45]};
  }
  function eatenAnswer(text){
    const e=foodEstimate(text),mid=Math.round((e.kcal[0]+e.kcal[1])/2),rich=mid>=850;
    const logged=addJournal({type:"meal",text,kcalRange:e.kcal,proteinRange:e.protein,rich});
    return `<div class="dlmc-answer"><b>Ajouté au journal de ${esc(personName())}</b><p class="small">${esc(text)}</p><p class="small">Estimation prudente : <b>≈ ${e.kcal[0]}–${e.kcal[1]} kcal</b> · <b>≈ ${e.protein[0]}–${e.protein[1]} g protéines</b>. ${e.confidence==="high"?"Les quantités indiquées permettent une estimation plus resserrée.":"Si tu précises les quantités (ex. 180 g poulet + 150 g riz), je pourrai resserrer la fourchette."}</p><div class="notice small">${rich?"Repas plutôt riche. Pour Jocelyn : pas idéal pour les abdos si ça devient fréquent 😄. Pas besoin de compenser brutalement : le prochain repas reste normal, avec une bonne source de protéines et des légumes.":"Repas enregistré. On juge surtout la tendance de la semaine, pas un repas isolé."}</div></div>`;
  }
  function journalSummary(){
    const now=Date.now(),week=readJournal().filter(x=>now-new Date(x.at).getTime()<7*86400000),today=week.filter(x=>new Date(x.at).toDateString()===new Date().toDateString());
    const rich=week.filter(x=>x.rich).length;
    return {week,today,rich};
  }
  function nutritionSummary(days=1){
    return window.DenatNutrition?.summary?.(days)||{items:[],kcal:[0,0],protein:[0,0],midKcal:0,midProtein:0,rich:0};
  }
  function nutritionGuidance(days=1){
    return window.DenatNutrition?.guidance?.(days)||"Le journal se construit au fil des repas.";
  }
  function summaryAnswer(days=1){
    const s=nutritionSummary(days),label=days===1?"aujourd’hui":"sur 7 jours";
    if(!s.items.length)return `<div class="dlmc-answer"><b>Bilan ${label}</b><p class="small">Aucun repas n’est encore enregistré.</p></div>`;
    const numbers=window.DenatProfile?.is?.("jocelyn")?`<div class="dlmc-portions"><div><b>Énergie enregistrée</b><br>≈ ${s.kcal[0]}–${s.kcal[1]} kcal</div><div><b>Protéines</b><br>≈ ${s.protein[0]}–${s.protein[1]} g</div></div>`:`<div class="dlmc-portions"><div><b>Repas notés</b><br>${s.items.length}</div><div><b>Repas riches</b><br>${s.rich}</div></div>`;
    return `<div class="dlmc-answer"><b>Bilan ${label} · ${esc(personName())}</b>${numbers}<div class="notice small">${esc(nutritionGuidance(days))}</div><p class="small muted">Le bilan dépend de ce qui a réellement été noté ; un journal incomplet n’est pas interprété comme une journée complète.</p></div>`;
  }
  function quickRecipe(text){
    const rs=recipes().filter(r=>r.total<=25).sort((a,b)=>a.total-b.total);
    return rs[0]?recipeAnswer(rs[0],tokens(text)):"Je n’ai pas encore de recette rapide disponible.";
  }
  function answer(text){
    const n=norm(text);
    let html="";
    if(/bilan|aujourd hui|aujourdhui|ma journee|ma journée|cette semaine/.test(n)&&!/j ai|jai/.test(n)) html=summaryAnswer(/semaine/.test(n)?7:1);
    else if(/j ai mange|jai mange|j ai pris|jai pris|j ai bu|jai bu|ce midi j ai|ce soir j ai/.test(n)) html=eatenAnswer(text);
    else if(/resto|restaurant|brasserie|mange dehors|burger|pizza|sushi|kebab|tacos/.test(n)) html=restaurantAnswer(text);
    else if(/j ai|jai|il me reste|frigo|placard|a la maison|avec/.test(n)){
      const m=pantryMatch(text);
      html=m.best?recipeAnswer(m.best.r,m.tokens):`<div class="dlmc-answer">Je n’ai pas trouvé de recette suffisamment proche dans la bibliothèque. Essaie de me donner 2 ou 3 ingrédients principaux, par exemple : <b>« J’ai poulet, riz et courgettes »</b>.</div>`;
    }else if(/rapide|vite|20 min|25 min/.test(n)) html=quickRecipe(text);
    else {
      const today=window.DenatMealEngine?.generate?.()?.days?.[(new Date().getDay()+6)%7],r=today&&window.DenatMealEngine?.getRecipe?.(today.dinnerId);
      html=r?recipeAnswer(r,[]):`<div class="dlmc-answer">Dis-moi ce que tu as à la maison, ce que tu vas manger au restaurant, ou demande-moi un repas rapide.</div>`;
    }
    const db=read();db.history=db.history||[];db.history.push({at:new Date().toISOString(),person:personName(),q:text});db.history=db.history.slice(-60);save(db);
    return html;
  }
  function weekRestaurants(){
    const db=read(),start=Date.now()-7*86400000;
    return (db.restaurants||[]).filter(x=>new Date(x.at).getTime()>=start);
  }
  function view(){
    const outs=weekRestaurants(),js=journalSummary(),ns=nutritionSummary(1),ng=nutritionGuidance(1),isJocelyn=window.DenatProfile?.is?.("jocelyn")===true;
    return `<section class="card dlmc-card"><div class="row"><div><div class="eyebrow">COACH REPAS · ${esc(personName())}</div><h2 style="margin:5px 0">Qu’est-ce qu’on mange ?</h2></div><span class="pill">${esc(personName())}</span></div><p class="muted small">Écris naturellement : ingrédients disponibles, ce que tu as réellement mangé, restaurant, envie rapide… Le menu et les courses restent communs au foyer ; ton journal reste personnel.</p><div class="dlmc-chips"><button data-dlmc-fill="J’ai poulet, riz et courgettes à la maison. Fais-moi un repas avec la recette.">J’ai des ingrédients</button><button data-dlmc-fill="J’ai mangé ce midi : 180 g poulet, 150 g riz, 200 g courgettes.">J’ai mangé…</button><button data-dlmc-fill="Fais-moi le bilan d’aujourd’hui.">Bilan du jour</button><button data-dlmc-fill="Je mange au restaurant ce soir : ">Je mange au resto</button><button data-dlmc-fill="Fais-moi un repas rapide en moins de 25 minutes.">Repas rapide</button></div><textarea id="dlmc-input" rows="4" placeholder="Ex. J’ai mangé ce midi 180 g de poulet, 150 g de riz et 200 g de courgettes."></textarea><button class="primary full" id="dlmc-send">Demander au coach</button><div id="dlmc-result"></div></section><section class="card"><div class="row"><div><div class="eyebrow">JOURNAL · ${esc(personName())}</div><h3 style="margin:6px 0">Ce que tu as réellement mangé</h3></div><span class="pill">${js.week.length} entrée${js.week.length>1?"s":""}</span></div><div class="dlmc-portions"><div><b>Aujourd’hui</b><br>${js.today.length} repas / ajout${js.today.length>1?"s":""}</div><div><b>7 jours</b><br>${js.rich} repas riche${js.rich>1?"s":""}</div></div><p class="muted small">Le menu reste commun au foyer. Ce journal, les restos et le suivi nutritionnel sont personnels à ${esc(personName())}.</p>
    <div class="notice small" style="margin:10px 0"><b>Bilan du jour</b><br>${isJocelyn&&ns.items.length?`≈ ${ns.kcal[0]}–${ns.kcal[1]} kcal · ≈ ${ns.protein[0]}–${ns.protein[1]} g protéines<br>`:""}${esc(ng)}</div>${js.week.length?`<div class="small" style="margin:12px 0"><b>Derniers ajouts</b>${js.week.slice(-6).reverse().map(x=>`<div class="dlmc-journal-row"><div><b>${esc(x.mealType||x.type||"Repas")}</b><br><span>${new Intl.DateTimeFormat("fr-FR",{weekday:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(x.at))} · ${esc(x.text||"Repas")}</span></div>${x.id?`<button class="ghost dlmc-delete" data-dlmc-delete="${esc(x.id)}">Supprimer</button>`:""}</div>`).join("")}</div>`:""}<button class="ghost full" id="dlmc-share">Partager / connecter un autre téléphone</button></section>`;
  }
  function bind(root=document){
    const input=root.querySelector("#dlmc-input"),result=root.querySelector("#dlmc-result");
    root.querySelectorAll("[data-dlmc-fill]").forEach(b=>b.addEventListener("click",()=>{if(input){input.value=b.dataset.dlmcFill;input.focus();}}));
    root.querySelector("#dlmc-send")?.addEventListener("click",()=>{const q=input?.value.trim();if(!q)return;result.innerHTML=answer(q);window.DenatCloud?.pushNow?.().catch?.(()=>{});});
    root.querySelectorAll("[data-dlmc-delete]").forEach(b=>b.addEventListener("click",()=>{
      window.DenatNutrition?.remove?.(b.dataset.dlmcDelete);
      window.DenatCloud?.pushNow?.().catch?.(()=>{});
      window.renderMeals?.();
    }));
    root.querySelector("#dlmc-share")?.addEventListener("click",()=>window.DenatCloud?.shareAccess?.());
  }
  const style=document.createElement("style");
  style.textContent=`.dlmc-card textarea{width:100%;box-sizing:border-box;margin:10px 0;padding:13px;border-radius:14px;border:1px solid var(--line);background:#101012;color:var(--text);font:inherit;resize:vertical}.dlmc-chips{display:flex;gap:7px;overflow:auto;margin:10px 0}.dlmc-chips button{white-space:nowrap;border:1px solid var(--line);background:transparent;color:var(--text);border-radius:999px;padding:8px 10px;font-size:11px}.dlmc-answer{margin-top:14px;padding:14px;border-radius:16px;background:#101012;border:1px solid var(--line);line-height:1.45}.dlmc-portions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}.dlmc-portions>div{padding:10px;border:1px solid var(--line);border-radius:12px;font-size:11px}.dlmc-steps{padding-left:20px}.dlmc-steps li{margin:7px 0;font-size:12px}.dlmc-journal-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line);font-size:11px}.dlmc-journal-row span{color:var(--muted);line-height:1.4}.dlmc-delete{padding:7px 9px;font-size:10px}@media(max-width:420px){.dlmc-portions{grid-template-columns:1fr}}`;
  document.head.appendChild(style);
  window.DenatMealCoach={view,bind,answer,weekRestaurants};
})();