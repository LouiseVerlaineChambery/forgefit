// Denat Life V23 — adaptation nutritionnelle quotidienne, locale et non punitive.
(function(){
  const KEYS=["kcal","protein","carbs","fat","fiber"];
  const zero=()=>({kcal:0,protein:0,carbs:0,fat:0,fiber:0});
  const round=(n,d=0)=>{const p=10**d;return Math.round((Number(n)||0)*p)/p;};
  const clean=m=>({kcal:round(m?.kcal||0),protein:round(m?.protein||0,1),carbs:round(m?.carbs||0,1),fat:round(m?.fat||0,1),fiber:round(m?.fiber||0,1)});
  const add=(a,b)=>{const o=zero();KEYS.forEach(k=>o[k]=(Number(a?.[k])||0)+(Number(b?.[k])||0));return clean(o);};
  const sub=(a,b)=>{const o=zero();KEYS.forEach(k=>o[k]=(Number(a?.[k])||0)-(Number(b?.[k])||0));return clean(o);};
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
  const profilePerson=()=>window.DenatProfile?.is?.("anais")?"p2":"p1";
  const slotOf=s=>{
    const n=String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    if(/petit/.test(n))return "breakfast";
    if(/midi|dejeuner/.test(n))return "lunch";
    if(/collation|gouter|snack/.test(n))return "snack";
    if(/diner|soir/.test(n))return "dinner";
    return null;
  };
  const label={kcal:"kcal",protein:"protéines",carbs:"glucides",fat:"lipides",fiber:"fibres"};
  const foodLabel={chicken:"poulet",turkey:"dinde",beef5:"bœuf 5 %",beef:"bœuf",salmon:"saumon",cod:"poisson",tuna:"thon",shrimp:"crevettes",riceDry:"riz sec",riceCooked:"riz cuit",pastaDry:"pâtes sèches",pastaCooked:"pâtes",quinoaDry:"quinoa sec",quinoaCooked:"quinoa",bulgurDry:"boulgour sec",semolinaDry:"semoule",lentilsDry:"lentilles sèches",lentils:"lentilles",chickpeas:"pois chiches",redBeans:"haricots rouges",gnocchi:"gnocchis",potato:"pommes de terre",bread:"pain complet",tortilla:"tortilla",egg:"œufs",broccoli:"brocoli",greenBeans:"haricots verts",zucchini:"courgettes",spinach:"épinards",carrot:"carottes",mushroom:"champignons",tomato:"tomates",mixedVeg:"légumes",edamame:"edamame",corn:"maïs",peas:"petits pois",pepper:"poivron",onion:"oignon",avocado:"avocat",mozzarella:"mozzarella",cheese:"fromage",cream:"crème",coconutMilk:"lait de coco",pesto:"pesto",tomatoSauce:"sauce tomate",oil:"huile"};
  const proteinIds=new Set(["chicken","turkey","beef5","beef","salmon","cod","tuna","shrimp","egg"]);
  const carbIds=new Set(["riceDry","riceCooked","pastaDry","pastaCooked","quinoaDry","quinoaCooked","bulgurDry","semolinaDry","lentilsDry","lentils","chickpeas","redBeans","gnocchi","potato","bread","tortilla","pizzaDough","lasagnaSheet"]);
  const fatIds=new Set(["oil","pesto","cheese","mozzarella","cream","coconutMilk","peanutButter","almond","walnut","avocado"]);

  function today(){
    const data=window.DenatMealEngine?.generate?.();
    const i=(new Date().getDay()+6)%7;
    return data?.days?.[i]||null;
  }
  function reference(planned,targets){
    const out=zero(),active=[];
    KEYS.forEach(k=>{
      const t=Number(targets?.[k])||0;
      out[k]=t>0?t:Number(planned?.[k])||0;
      if(t>0)active.push(k);
    });
    return {macros:clean(out),active,source:active.length?"objectifs personnels + menu prévu":"menu prévu"};
  }
  function sumPlannedSlots(plan,slots){
    let out=zero();
    for(const s of slots)out=add(out,plan?.[s]);
    return out;
  }
  function factors(dinner,deviation){
    const ratio=(base,delta,min,max)=>base>0?clamp((base-delta)/base,min,max):1;
    const energy=ratio(dinner?.kcal||0,deviation?.kcal||0,.75,1.25);
    const protein=ratio(dinner?.protein||0,deviation?.protein||0,.9,1.2);
    const carbs=ratio(dinner?.carbs||0,deviation?.carbs||0,.7,1.3);
    const fat=ratio(dinner?.fat||0,deviation?.fat||0,.8,1.15);
    return {energy:round(energy,2),protein:round(protein,2),carbs:round(clamp((carbs+energy)/2,.7,1.3),2),fat:round(fat,2)};
  }
  function adjustedDinner(recipe,person,f){
    const base=window.DenatNutritionCore?.recipePortion?.(recipe,person);
    if(!base?.parts?.length)return {parts:[],text:"Garde la portion prévue et ajuste surtout selon ta faim."};
    const parts=base.parts.filter(x=>!x.shared).map(x=>{
      let factor=1;
      if(proteinIds.has(x.id))factor=f.protein;
      else if(carbIds.has(x.id))factor=f.carbs;
      else if(fatIds.has(x.id))factor=f.fat;
      const g=Math.max(1,Math.round((Number(x.g)||0)*factor/5)*5);
      return {...x,g,factor};
    });
    const text=parts.map(x=>`${foodLabel[x.id]||x.name} ${x.g} g`).join(" · ");
    return {parts,text:text||"Garde la portion prévue et ajuste surtout selon ta faim."};
  }
  function adviceFor(s){
    if(!s.day||!s.dinner)return ["Menu du soir indisponible pour aujourd’hui."];
    if(s.dinnerLogged)return ["Le dîner est déjà enregistré : je garde le bilan réel sans proposer de nouvelle correction."];
    if(!s.items.length)return ["Note d’abord ce que tu as réellement mangé aujourd’hui ; sans journal, je conserve la portion prévue."];
    const a=[];
    const d=s.deviation,f=s.factors;
    if(d.protein<-12)a.push("Tu es en dessous du prévu en protéines : garde ou augmente légèrement la portion protéinée du dîner.");
    else if(d.protein>15)a.push("Les protéines sont déjà au-dessus du prévu : inutile d’augmenter la portion protéinée ce soir.");
    else a.push("La portion protéinée prévue reste cohérente.");
    if(d.kcal>180||d.carbs>35)a.push("Tu as mangé plus que prévu plus tôt : réduis surtout le féculent du dîner, sans supprimer le repas.");
    else if(d.kcal<-180||d.carbs<-35)a.push("Tu as mangé moins que prévu plus tôt : tu peux augmenter modérément le féculent du dîner.");
    else a.push("L’énergie et les glucides sont proches du plan : peu d’ajustement nécessaire.");
    if(d.fat>15)a.push("Les lipides sont déjà hauts par rapport au plan : reste léger sur huile, fromage et sauces ajoutées.");
    if(s.confidence==="partial")a.push("Journal partiel : cette adaptation reste provisoire et se recalcule à chaque nouvel aliment enregistré.");
    return a.slice(0,4);
  }
  function snapshot(){
    const day=today(),person=profilePerson(),plan=day?.nutrition?.[person]||null;
    const nutrition=window.DenatNutrition?.summary?.(1)||{items:[],macros:zero(),targets:{}};
    const actual=clean(nutrition.macros||zero()),items=nutrition.items||[],targets=nutrition.targets||window.DenatNutritionCore?.targets?.()||{};
    const ref=reference(plan?.total||zero(),targets);
    const slots=[...new Set(items.map(x=>slotOf(x.mealType)).filter(Boolean))];
    const expected=sumPlannedSlots(plan||{},slots);
    const deviation=sub(actual,expected);
    const remaining=sub(ref.macros,actual);
    const dinner=clean(plan?.dinner||zero());
    const dinnerLogged=slots.includes("dinner");
    const f=factors(dinner,deviation);
    const recipe=day?.dinnerId&&window.DenatMealEngine?.getRecipe?.(day.dinnerId);
    const adjusted=recipe?adjustedDinner(recipe,person,f):{parts:[],text:"Portion prévue"};
    const lowConfidence=items.some(x=>x.confidence==="low");
    const confidence=!items.length?"empty":items.length<2||lowConfidence?"partial":"ready";
    const projected=add(actual,dinner);
    const afterDinner=sub(ref.macros,projected);
    const out={person,day,plan,items,actual,targets,reference:ref.macros,referenceSource:ref.source,targetKeys:ref.active,slots,expected,deviation,remaining,dinner,dinnerLogged,factors:f,recipe,adjusted,confidence,projected,afterDinner};
    out.advice=adviceFor(out);
    return out;
  }
  function percent(n){return Math.round((Number(n)||1)*100);}
  function shortText(s=snapshot()){
    if(!s.day)return "Adaptation indisponible aujourd’hui.";
    if(!s.items.length)return "Journal vide : portion du dîner inchangée.";
    if(s.dinnerLogged)return "Dîner déjà enregistré : bilan réel à jour.";
    const p=percent(s.factors.protein),c=percent(s.factors.carbs);
    if(Math.abs(p-100)<6&&Math.abs(c-100)<8)return "Dîner prévu presque inchangé.";
    return `Dîner adapté : protéines ${p}% · féculents ${c}% de la portion prévue.`;
  }
  window.DenatAdaptiveNutrition={snapshot,shortText,slotOf,add,sub,clean};
})();