// Denat Life V22 — noyau nutritionnel local.
// Valeurs génériques par 100 g/ml : estimations de composition, à remplacer par l'étiquette produit quand elle est connue.
(function(){
  const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/œ/g,"oe");
  const round=(n,d=0)=>{const p=10**d;return Math.round((Number(n)||0)*p)/p;};
  const zero=()=>({kcal:0,protein:0,carbs:0,fat:0,fiber:0});
  const add=(a,b)=>({kcal:a.kcal+b.kcal,protein:a.protein+b.protein,carbs:a.carbs+b.carbs,fat:a.fat+b.fat,fiber:a.fiber+b.fiber});
  const scale=(a,f)=>({kcal:a.kcal*f,protein:a.protein*f,carbs:a.carbs*f,fat:a.fat*f,fiber:a.fiber*f});
  const finish=a=>({kcal:Math.round(a.kcal),protein:round(a.protein,1),carbs:round(a.carbs,1),fat:round(a.fat,1),fiber:round(a.fiber,1)});

  const FOODS=[
    {id:"chicken",a:["poulet","blanc de poulet"],v:[165,31,0,3.6,0]},
    {id:"turkey",a:["dinde"],v:[135,29,0,1.7,0]},
    {id:"beef5",a:["boeuf 5%","boeuf hache 5%","steak hache 5%"],v:[137,21.4,0,5,0]},
    {id:"beef",a:["boeuf","steak"],v:[190,26,0,9,0]},
    {id:"salmon",a:["saumon"],v:[208,20,0,13,0]},
    {id:"cod",a:["cabillaud","colin"],v:[82,18,0,0.7,0]},
    {id:"tuna",a:["thon"],v:[116,26,0,1,0]},
    {id:"shrimp",a:["crevettes","crevette"],v:[99,24,0.2,0.3,0]},
    {id:"riceDry",a:["riz sec","riz basmati sec"],v:[356,7.5,78,0.8,1.3]},
    {id:"riceCooked",a:["riz cuit","riz"],v:[130,2.7,28,0.3,0.4]},
    {id:"pastaDry",a:["pates seches","pates completes seches","tagliatelles seches","orzo sec","nouilles seches"],v:[350,12.5,70,1.8,3.5]},
    {id:"pastaCooked",a:["pates cuites","pates","orzo","nouilles"],v:[150,5.5,30,1,1.8]},
    {id:"quinoaDry",a:["quinoa sec"],v:[368,14,64,6.1,7]},
    {id:"quinoaCooked",a:["quinoa"],v:[120,4.4,21.3,1.9,2.8]},
    {id:"bulgurDry",a:["boulgour sec"],v:[342,12.3,76,1.3,12.5]},
    {id:"semolinaDry",a:["semoule seche","semoule"],v:[360,12.7,73,1.1,3.9]},
    {id:"lentilsDry",a:["lentilles seches"],v:[350,25,60,1.5,11]},
    {id:"lentils",a:["lentilles"],v:[116,9,20,0.4,7.9]},
    {id:"chickpeas",a:["pois chiches"],v:[164,8.9,27.4,2.6,7.6]},
    {id:"redBeans",a:["haricots rouges","haricots"],v:[127,8.7,22.8,0.5,6.4]},
    {id:"gnocchi",a:["gnocchis","gnocchi"],v:[150,4,31,1,2]},
    {id:"potato",a:["pommes de terre","pomme de terre","patate"],v:[77,2,17,0.1,2.2]},
    {id:"bread",a:["pain complet","pain"],v:[247,9.5,41,3.4,6]},
    {id:"tortilla",a:["tortillas","tortilla"],v:[310,8,52,8,4],unitG:45},
    {id:"egg",a:["oeufs","oeuf"],v:[143,13,0.7,9.5,0],unitG:55},
    {id:"broccoli",a:["brocoli"],v:[34,2.8,7,0.4,2.6]},
    {id:"greenBeans",a:["haricots verts"],v:[31,1.8,7,0.2,3.4]},
    {id:"zucchini",a:["courgettes","courgette"],v:[17,1.2,3.1,0.3,1]},
    {id:"spinach",a:["epinards","epinard"],v:[23,2.9,3.6,0.4,2.2]},
    {id:"carrot",a:["carottes","carotte"],v:[41,0.9,9.6,0.2,2.8]},
    {id:"mushroom",a:["champignons","champignon"],v:[22,3.1,3.3,0.3,1]},
    {id:"tomato",a:["tomates","tomate"],v:[18,0.9,3.9,0.2,1.2]},
    {id:"ratatouille",a:["ratatouille"],v:[55,1.5,7,2.5,2.5]},
    {id:"mixedVeg",a:["legumes couscous","legumes wok","legumes a rotir","legumes de saison","legumes"],v:[40,2,7,0.5,2.8]},
    {id:"edamame",a:["edamame"],v:[121,11.9,8.9,5.2,5.2]},
    {id:"corn",a:["mais"],v:[96,3.4,21,1.5,2.4]},
    {id:"avocado",a:["avocats","avocat"],v:[160,2,8.5,14.7,6.7],unitG:150},
    {id:"skyr",a:["skyr"],v:[63,11,4,0.2,0]},
    {id:"fromageBlanc",a:["fromage blanc"],v:[70,8,5,2,0]},
    {id:"yogurt",a:["yaourt nature","yaourt"],v:[63,4.5,5,2.5,0],unitG:125},
    {id:"mozzarella",a:["mozzarella"],v:[250,18,2,19,0]},
    {id:"cheese",a:["fromage rape","fromage"],v:[380,27,1,30,0]},
    {id:"cream",a:["creme legere","creme"],v:[165,3,4,15,0]},
    {id:"coconutMilk",a:["lait de coco leger","lait de coco"],v:[120,1.2,3,11,0]},
    {id:"pesto",a:["pesto"],v:[430,5,7,42,2]},
    {id:"teriyaki",a:["sauce teriyaki"],v:[90,4,17,0.5,0]},
    {id:"tomatoSauce",a:["sauce tomate"],v:[45,1.5,7,1,1.5]},
    {id:"peanutButter",a:["beurre de cacahuete"],v:[590,25,20,50,6]},
    {id:"almond",a:["amandes","amande"],v:[579,21,22,50,12.5]},
    {id:"walnut",a:["noix"],v:[654,15,14,65,6.7]},
    {id:"banana",a:["bananes","banane"],v:[89,1.1,23,0.3,2.6],unitG:120},
    {id:"apple",a:["pommes","pomme"],v:[52,0.3,14,0.2,2.4],unitG:150},
    {id:"fruit",a:["fruit"],v:[60,0.7,15,0.3,2.5],unitG:150},
    {id:"oil",a:["huile"],v:[884,0,0,100,0]}
  ].map(f=>({...f,a:f.a.map(norm),m:{kcal:f.v[0],protein:f.v[1],carbs:f.v[2],fat:f.v[3],fiber:f.v[4]}}));

  const aliases=FOODS.flatMap(f=>f.a.map(a=>({a,f}))).sort((x,y)=>y.a.length-x.a.length);
  const escRe=s=>String(s).replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&");
  function foodFor(name){const n=norm(name);return aliases.find(x=>n.includes(x.a))?.f||null;}
  function gramsFrom(text,food){
    const n=norm(text),names=food.a.slice().sort((a,b)=>b.length-a.length);
    if(food.id==="riceCooked"&&/riz\s+(?:basmati\s+)?sec/.test(n))return null;
    if(food.id==="pastaCooked"&&/(?:pates|tagliatelles|orzo|nouilles)\s+(?:completes\s+)?sech/.test(n))return null;
    if(food.id==="quinoaCooked"&&/quinoa\s+sec/.test(n))return null;
    if(food.id==="beef"&&/boeuf(?:\s+hache)?\s+5%/.test(n))return null;
    if(food.id==="apple"&&/pommes?\s+de\s+terre/.test(n))return null;
    if(food.id==="redBeans"&&/haricots?\s+verts?/.test(n))return null;
    if(food.id==="cheese"&&/fromage\s+blanc/.test(n))return null;
    for(const name of names){
      const e=escRe(name);
      let m=n.match(new RegExp("(\\d+(?:[.,]\\d+)?)\\s*(kg|g|ml|cl|l)\\s+(?:de\\s+)?"+e));
      if(!m)m=n.match(new RegExp(e+"\\s*[:=-]?\\s*(\\d+(?:[.,]\\d+)?)\\s*(kg|g|ml|cl|l)"));
      if(m){
        let q=Number(m[1].replace(",",".")),u=m[2];
        if(u==="kg"||u==="l")q*=1000;if(u==="cl")q*=10;
        return q;
      }
      if(food.unitG){
        m=n.match(new RegExp("(\\d+(?:[.,]\\d+)?)\\s*(?:x\\s*)?"+e));
        if(m)return Number(m[1].replace(",","."))*food.unitG;
      }
    }
    return null;
  }
  function parseExplicit(text){
    const parts=[],seen=new Set();
    for(const {f} of aliases){
      if(seen.has(f.id))continue;seen.add(f.id);
      const g=gramsFrom(text,f);if(g==null||g<=0)continue;
      parts.push({id:f.id,name:f.a[0],g,macros:finish(scale(f.m,g/100))});
    }
    return parts;
  }
  function sumParts(parts){return finish(parts.reduce((a,x)=>add(a,x.macros||zero()),zero()));}
  function estimateText(text){
    const parts=parseExplicit(text),macros=sumParts(parts);
    if(parts.length)return {macros,parts,confidence:parts.length>=2?"high":"medium",source:"generic"};
    const f=foodFor(text);
    if(f&&f.unitG){
      const macros=finish(scale(f.m,f.unitG/100));
      return {macros,parts:[{id:f.id,name:f.a[0],g:f.unitG,macros}],confidence:"low",source:"generic"};
    }
    return {macros:zero(),parts:[],confidence:"low",source:"unknown"};
  }
  function parseShopItem(text){
    const f=foodFor(text);if(!f)return null;
    let g=gramsFrom(text,f);
    if(g==null){
      const n=norm(text),m=n.match(/^(\d+(?:[.,]\d+)?)\s+/);
      if(m&&f.unitG)g=Number(m[1].replace(",","."))*f.unitG;
    }
    return g>0?{food:f,g}:null;
  }
  function recipePortion(recipe,person="p1"){
    const portion=String(recipe?.[person]||""),explicit=parseExplicit(portion),ids=new Set(explicit.map(x=>x.id));
    let parts=explicit.slice(),shared=0;
    for(const raw of recipe?.shop||recipe?.ingredients||[]){
      const x=parseShopItem(raw);if(!x||ids.has(x.food.id))continue;
      const g=x.g/4;if(g<=0)continue;
      parts.push({id:x.food.id,name:x.food.a[0],g,shared:true,macros:finish(scale(x.food.m,g/100))});shared++;
    }
    if(!parts.length&&recipe?.shop?.length){
      for(const raw of recipe.shop){
        const x=parseShopItem(raw);if(!x)continue;
        const g=x.g/4;parts.push({id:x.food.id,name:x.food.a[0],g,shared:true,macros:finish(scale(x.food.m,g/100))});
      }
    }
    return {macros:sumParts(parts),parts,confidence:explicit.length>=2?"high":parts.length>=2?"medium":"low",sharedExtras:shared};
  }
  function targetKey(){const id=window.DenatProfile?.currentId?.()||"jocelyn";return "denat_profile_"+id+"_nutrition_targets_v1";}
  function targets(){
    try{
      const x=JSON.parse(localStorage.getItem(targetKey())||"{}");
      return {kcal:+x.kcal||0,protein:+x.protein||0,carbs:+x.carbs||0,fat:+x.fat||0,fiber:+x.fiber||0};
    }catch{return {kcal:0,protein:0,carbs:0,fat:0,fiber:0};}
  }
  function setTargets(x={}){
    const clean={};for(const k of ["kcal","protein","carbs","fat","fiber"]){const v=Number(x[k]);clean[k]=Number.isFinite(v)&&v>0?round(v,1):0;}
    localStorage.setItem(targetKey(),JSON.stringify(clean));return clean;
  }
  function pct(value,target){return target>0?Math.max(0,Math.round(value/target*100)):null;}
  function progress(macros,t=targets()){const out={};for(const k of ["kcal","protein","carbs","fat","fiber"])out[k]={value:round(macros?.[k]||0,1),target:t[k]||0,pct:pct(macros?.[k]||0,t[k]||0)};return out;}
  window.DenatNutritionCore={foods:FOODS,foodFor,parseExplicit,estimateText,recipePortion,sumParts,targets,setTargets,progress,zero,finish};
})();