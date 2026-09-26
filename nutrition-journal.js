// Denat Life V22 — journal nutritionnel personnel : kcal + protéines + glucides + lipides + fibres.
(function(){
  const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const profileId=()=>window.DenatProfile?.currentId?.()||"jocelyn";
  const key=()=>window.DenatProfile?.journalKey?.()||`denat_profile_${profileId()}_food_journal_v1`;
  const read=()=>{try{const x=JSON.parse(localStorage.getItem(key())||"[]");return Array.isArray(x)?x:[];}catch{return[];}};
  const write=x=>localStorage.setItem(key(),JSON.stringify(x.slice(-365)));
  const FALLBACKS=[
    {re:/burger.*frites|frites.*burger/,name:"burger + frites",kcal:[900,1300],protein:[30,50]},
    {re:/pizza/,name:"pizza",kcal:[750,1200],protein:[25,45]},
    {re:/kebab|tacos/,name:"kebab / tacos",kcal:[850,1400],protein:[30,55]},
    {re:/sushi|maki/,name:"sushis",kcal:[550,950],protein:[25,45]},
    {re:/carbonara/,name:"pâtes carbonara",kcal:[700,1150],protein:[25,45]},
    {re:/salade/,name:"salade composée",kcal:[350,800],protein:[20,40]},
    {re:/sandwich/,name:"sandwich",kcal:[400,800],protein:[20,40]}
  ];
  const range=(v,p=.05)=>[Math.max(0,Math.round(v*(1-p))),Math.round(v*(1+p))];
  const mid=r=>Array.isArray(r)&&r.length>=2?(Number(r[0])+Number(r[1]))/2:0;
  function estimate(text){
    const core=window.DenatNutritionCore?.estimateText?.(text);
    if(core?.parts?.length){
      const m=core.macros,p=core.confidence==="high"?.05:.1;
      return {name:"repas détaillé",macros:m,kcal:range(m.kcal,p),protein:range(m.protein,p),carbs:range(m.carbs,p),fat:range(m.fat,p),fiber:range(m.fiber,p),parts:core.parts,confidence:core.confidence};
    }
    const n=norm(text),fb=FALLBACKS.find(x=>x.re.test(n));
    if(fb)return {...fb,carbs:[0,0],fat:[0,0],fiber:[0,0],confidence:"medium"};
    return {name:"repas déclaré",kcal:[350,900],protein:[15,45],carbs:[0,0],fat:[0,0],fiber:[0,0],confidence:"low"};
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
    const base=estimate(text),now=opts.at?new Date(opts.at):new Date();
    const macros=opts.macros||base.macros||null;
    const kcal=opts.kcalRange||base.kcal,protein=opts.proteinRange||base.protein;
    const carbs=opts.carbsRange||base.carbs||[0,0],fat=opts.fatRange||base.fat||[0,0],fiber=opts.fiberRange||base.fiber||[0,0];
    const item={id:crypto.randomUUID(),at:now.toISOString(),person:window.DenatProfile?.label?.()||"Jocelyn",type:opts.type||"meal",mealType:opts.mealType||mealType(text,now),text,kcalRange:kcal,proteinRange:protein,carbsRange:carbs,fatRange:fat,fiberRange:fiber,macros,confidence:opts.confidence||base.confidence||"low",parts:base.parts||[],rich:mid(kcal)>=850};
    const x=read();x.push(item);write(x);return item;
  }
  function remove(id){const x=read().filter(v=>v.id!==id);write(x);return x;}
  function restore(item){
    if(!item?.id)return false;
    const x=read();if(x.some(v=>v.id===item.id))return true;
    x.push(item);x.sort((a,b)=>new Date(a.at)-new Date(b.at));write(x);return true;
  }
  function rangeSum(items,k){
    const vals=items.map(x=>x[k]).filter(Array.isArray);if(!vals.length)return [0,0];
    return [Math.round(vals.reduce((a,r)=>a+(+r[0]||0),0)),Math.round(vals.reduce((a,r)=>a+(+r[1]||0),0))];
  }
  function itemMacros(x){
    if(x.macros)return x.macros;
    return {kcal:mid(x.kcalRange),protein:mid(x.proteinRange),carbs:mid(x.carbsRange),fat:mid(x.fatRange),fiber:mid(x.fiberRange)};
  }
  function summary(days=1){
    const since=Date.now()-days*86400000,items=read().filter(x=>new Date(x.at).getTime()>=since);
    const kcal=rangeSum(items,"kcalRange"),protein=rangeSum(items,"proteinRange"),carbs=rangeSum(items,"carbsRange"),fat=rangeSum(items,"fatRange"),fiber=rangeSum(items,"fiberRange");
    const macros=items.reduce((a,x)=>{const m=itemMacros(x);for(const k of Object.keys(a))a[k]+=Number(m[k])||0;return a;},{kcal:0,protein:0,carbs:0,fat:0,fiber:0});
    for(const k of Object.keys(macros))macros[k]=Math.round(macros[k]*10)/10;
    return {items,kcal,protein,carbs,fat,fiber,macros,midKcal:Math.round(mid(kcal)),midProtein:Math.round(mid(protein)),rich:items.filter(x=>x.rich).length,progress:window.DenatNutritionCore?.progress?.(macros)||null,targets:window.DenatNutritionCore?.targets?.()||{}};
  }
  function guidance(days=1){
    const s=summary(days),t=s.targets||{};
    if(!s.items.length)return "Commence par noter ce que tu manges réellement. Les macros se construiront au fil de la journée.";
    const configured=Object.values(t).some(v=>Number(v)>0);
    if(!configured)return "Macros calculées. Tu peux définir tes objectifs personnels dans le coach repas pour afficher la progression.";
    if(days===1&&s.items.length<2)return "Journal encore partiel : la progression est affichée, sans conclusion sur la journée.";
    const p=s.progress||{};
    if(t.protein&&p.protein?.pct<70)return "L’objectif protéines est encore loin d’être atteint dans les repas enregistrés aujourd’hui.";
    if(t.kcal&&p.kcal?.pct>110)return "L’apport enregistré dépasse l’objectif calorique configuré ; vérifie surtout que le journal et les quantités sont complets.";
    return "Progression calculée sur les repas enregistrés. Les valeurs restent des estimations tant que les marques et poids exacts ne sont pas connus.";
  }
  window.DenatNutrition={read,add,remove,restore,estimate,summary,guidance,mealType};
})();