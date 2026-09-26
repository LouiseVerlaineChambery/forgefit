// Denat Life — journal nutritionnel personnel V2, sans API payante.
(function(){
  const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const profileId=()=>window.DenatProfile?.currentId?.()||"jocelyn";
  const key=()=>window.DenatProfile?.journalKey?.()||`denat_profile_${profileId()}_food_journal_v1`;
  const read=()=>{try{const x=JSON.parse(localStorage.getItem(key())||"[]");return Array.isArray(x)?x:[];}catch{return[];}};
  const write=x=>localStorage.setItem(key(),JSON.stringify(x.slice(-365)));
  const FOODS=[
    {names:["poulet","blanc de poulet"],kcal:165,p:31},{names:["dinde"],kcal:135,p:29},
    {names:["boeuf","bœuf","steak"],kcal:220,p:26},{names:["saumon"],kcal:208,p:20},
    {names:["thon"],kcal:132,p:29},{names:["cabillaud","colin"],kcal:90,p:20},
    {names:["riz"],kcal:130,p:2.7},{names:["pates","pâtes","pasta"],kcal:150,p:5.5},
    {names:["quinoa"],kcal:120,p:4.4},{names:["pomme de terre","pommes de terre","patate"],kcal:85,p:2},
    {names:["pain"],kcal:265,p:9},{names:["oeuf","œuf","oeufs","œufs"],kcal:143,p:13,unitG:55},
    {names:["skyr"],kcal:63,p:11},{names:["fromage blanc"],kcal:70,p:8},
    {names:["yaourt"],kcal:75,p:5,unitG:125},{names:["emmental","comte","comté","fromage"],kcal:390,p:27},
    {names:["jambon"],kcal:120,p:20},{names:["avocat"],kcal:160,p:2,unitG:150},
    {names:["huile"],kcal:884,p:0},{names:["beurre"],kcal:745,p:0},
    {names:["amandes","noix"],kcal:600,p:20},{names:["banane"],kcal:89,p:1.1,unitG:120},
    {names:["pomme"],kcal:52,p:.3,unitG:150},{names:["courgette","courgettes"],kcal:17,p:1.2},
    {names:["tomate","tomates"],kcal:18,p:.9},{names:["haricot vert","haricots verts"],kcal:31,p:1.8},
    {names:["brocoli"],kcal:34,p:2.8}
  ];
  const FALLBACKS=[
    {re:/burger.*frites|frites.*burger/,name:"burger + frites",kcal:[900,1300],protein:[30,50]},
    {re:/pizza/,name:"pizza",kcal:[750,1200],protein:[25,45]},
    {re:/kebab|tacos/,name:"kebab / tacos",kcal:[850,1400],protein:[30,55]},
    {re:/sushi|maki/,name:"sushis",kcal:[550,950],protein:[25,45]},
    {re:/carbonara/,name:"pâtes carbonara",kcal:[700,1150],protein:[25,45]},
    {re:/salade/,name:"salade composée",kcal:[350,800],protein:[20,40]},
    {re:/sandwich/,name:"sandwich",kcal:[400,800],protein:[20,40]}
  ];
  function foodFor(text){const n=norm(text);return FOODS.find(f=>f.names.some(x=>n.includes(norm(x))));}
  function qtyFor(text,food){
    const n=norm(text),names=food.names.map(norm).sort((a,b)=>b.length-a.length);
    for(const name of names){
      const e=name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
      let m=n.match(new RegExp("(\\d+(?:[.,]\\d+)?)\\s*(kg|g)\\s+(?:de\\s+)?"+e));
      if(!m)m=n.match(new RegExp(e+"\\s*[:=-]?\\s*(\\d+(?:[.,]\\d+)?)\\s*(kg|g)"));
      if(m){let q=Number(m[1].replace(",","."));if(m[2]==="kg")q*=1000;return q;}
      if(food.unitG){m=n.match(new RegExp("(\\d+)\\s*(?:x\\s*)?"+e));if(m)return Number(m[1])*food.unitG;}
    }
    return null;
  }
  function preciseEstimate(text){
    const n=norm(text),parts=[];
    for(const f of FOODS){
      if(!f.names.some(x=>n.includes(norm(x))))continue;
      const g=qtyFor(text,f);if(!g)continue;
      parts.push({name:f.names[0],g,kcal:g*f.kcal/100,protein:g*f.p/100});
    }
    if(!parts.length)return null;
    const kcal=Math.round(parts.reduce((a,x)=>a+x.kcal,0)),protein=Math.round(parts.reduce((a,x)=>a+x.protein,0));
    return {name:"repas détaillé",kcal:[Math.round(kcal*.9),Math.round(kcal*1.1)],protein:[Math.max(0,Math.round(protein*.9)),Math.round(protein*1.1)],parts,confidence:"high"};
  }
  function estimate(text){
    const p=preciseEstimate(text);if(p)return p;
    const n=norm(text),fb=FALLBACKS.find(x=>x.re.test(n));if(fb)return {...fb,confidence:"medium"};
    const f=foodFor(text);if(f)return {name:f.names[0],kcal:[250,700],protein:[Math.max(5,Math.round(f.p*.7)),Math.max(15,Math.round(f.p*1.8))],confidence:"low"};
    return {name:"repas déclaré",kcal:[350,900],protein:[15,45],confidence:"low"};
  }
  function mealType(text,date=new Date()){
    const n=norm(text);
    if(/petit dej|petit-dej|matin/.test(n))return "Petit-déjeuner";
    if(/midi|dejeuner|déjeuner/.test(n))return "Repas du midi";
    if(/soir|diner|dîner/.test(n))return "Dîner";
    if(/gouter|goûter|collation|snack/.test(n))return "Collation";
    const h=date.getHours();return h<10?"Petit-déjeuner":h<15?"Repas du midi":h<19?"Collation":"Dîner";
  }
  function add(text,opts={}){
    const base=estimate(text),e={...base,kcal:opts.kcalRange||base.kcal,protein:opts.proteinRange||base.protein,confidence:opts.confidence||base.confidence},now=opts.at?new Date(opts.at):new Date(),midK=Math.round((e.kcal[0]+e.kcal[1])/2);
    const item={id:crypto.randomUUID(),at:now.toISOString(),person:window.DenatProfile?.label?.()||"Jocelyn",type:opts.type||"meal",mealType:opts.mealType||mealType(text,now),text,kcalRange:e.kcal,proteinRange:e.protein,confidence:e.confidence||"low",parts:e.parts||[],rich:midK>=850};
    const x=read();x.push(item);write(x);return item;
  }
  function remove(id){const x=read().filter(v=>v.id!==id);write(x);return x;}\n  function restore(item){\n    if(!item?.id)return false;\n    const x=read();if(x.some(v=>v.id===item.id))return true;\n    x.push(item);x.sort((a,b)=>new Date(a.at)-new Date(b.at));write(x);return true;\n  }
  const mid=r=>Array.isArray(r)&&r.length>=2?(Number(r[0])+Number(r[1]))/2:0;
  function rangeSum(items,k){
    const vals=items.map(x=>x[k]).filter(Array.isArray);if(!vals.length)return [0,0];
    return [Math.round(vals.reduce((a,r)=>a+(+r[0]||0),0)),Math.round(vals.reduce((a,r)=>a+(+r[1]||0),0))];
  }
  function summary(days=1){
    const since=Date.now()-days*86400000,items=read().filter(x=>new Date(x.at).getTime()>=since);
    const kcal=rangeSum(items,"kcalRange"),protein=rangeSum(items,"proteinRange");
    return {items,kcal,protein,midKcal:Math.round(mid(kcal)),midProtein:Math.round(mid(protein)),rich:items.filter(x=>x.rich).length};
  }
  function guidance(days=1){
    const s=summary(days),jocelyn=profileId()==="jocelyn";
    if(!s.items.length)return jocelyn?"Commence par noter ce que tu manges réellement : le bilan deviendra plus utile au fil de la journée.":"Note simplement tes repas quand tu en as envie ; pas besoin de compter précisément.";
    if(!jocelyn){
      const types=new Set(s.items.map(x=>x.mealType));
      if(types.size<2)return "Journal encore partiel : je ne tire pas de conclusion sur la journée. L’objectif ici est surtout de simplifier les repas.";
      return "Journée renseignée : on privilégie variété, satiété et simplicité plutôt qu’un objectif calorique strict.";
    }
    if(days===1){
      if(s.midProtein<90)return "Protéines encore basses dans ce qui est enregistré. Si le journal est complet, privilégie une bonne source de protéines au prochain repas.";
      if(s.midProtein>=140&&s.midProtein<=175)return "Apport protéiné de la journée dans une zone cohérente avec ton objectif, sous réserve que le journal soit complet.";
      if(s.midKcal>2450)return "Journée plutôt dense en énergie. Pas de compensation brutale : reprends simplement les repas prévus demain.";
      return "Tendance correcte pour l’instant. Le coach regarde surtout plusieurs jours, pas un repas isolé.";
    }
    return s.rich>=3?"Plusieurs repas riches enregistrés cette semaine. Garde-les, mais espace-les et conserve des repas simples/protéinés autour.":"La tendance de la semaine reste plus importante que chaque repas pris séparément.";
  }
  window.DenatNutrition={read,add,remove,restore,estimate,summary,guidance,mealType};
})();