// Denat Life — moteur de menus hebdomadaires automatiques
(function(){
  const DISLIKES="denat_meal_dislikes_v1";
  const OVERRIDES="denat_meal_overrides_v1";
  const NAMES=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

  const dinners=[
    {id:"curry_poulet",t:"Poulet curry doux, riz & brocoli",p1:"180 g poulet · 90 g riz sec · 250 g brocoli",p2:"120 g poulet · 60 g riz sec · 250 g brocoli",cost:19,shop:["600 g poulet","300 g riz basmati sec","1 kg brocoli","280 ml lait de coco léger","Curry doux"]},
    {id:"saumon_pdt",t:"Saumon, pommes de terre & haricots verts",p1:"180 g saumon · 300 g pommes de terre · 250 g haricots verts",p2:"130 g saumon · 220 g pommes de terre · 250 g haricots verts",cost:25,shop:["620 g saumon","1,05 kg pommes de terre","1 kg haricots verts","1 citron"]},
    {id:"chili_boeuf",t:"Chili maison bœuf & haricots rouges",p1:"160 g bœuf 5% · 150 g haricots · 80 g riz sec",p2:"100 g bœuf 5% · 120 g haricots · 50 g riz sec",cost:18,shop:["520 g bœuf haché 5%","540 g haricots rouges cuits","260 g riz sec","2 bocaux sauce tomate","2 poivrons","2 oignons"]},
    {id:"dinde_pates",t:"Dinde, pâtes complètes, épinards & tomate",p1:"180 g dinde · 90 g pâtes sèches · 200 g épinards",p2:"120 g dinde · 60 g pâtes sèches · 200 g épinards",cost:17,shop:["600 g dinde","300 g pâtes complètes sèches","800 g épinards","500 g tomates"]},
    {id:"cabillaud_quinoa",t:"Cabillaud, quinoa & courgettes",p1:"200 g cabillaud · 90 g quinoa sec · 300 g courgettes",p2:"140 g cabillaud · 60 g quinoa sec · 250 g courgettes",cost:22,shop:["680 g cabillaud","300 g quinoa sec","1,1 kg courgettes","1 citron"]},
    {id:"pizza_poulet",t:"Pizza maison poulet, mozzarella & légumes",p1:"1/2 pizza · poulet · légumes",p2:"1/3 à 1/2 pizza selon faim",cost:18,shop:["500 g poulet","2 pâtes à pizza","300 g mozzarella pasteurisée","2 bocaux sauce tomate","400 g champignons","2 poivrons"]},
    {id:"poulet_roti",t:"Poulet rôti, pommes de terre & légumes",p1:"200 g poulet · 320 g pommes de terre · 300 g légumes",p2:"130 g poulet · 220 g pommes de terre · 250 g légumes",cost:16,shop:["700 g poulet","1,1 kg pommes de terre","1,1 kg légumes de saison"]},
    {id:"boulettes_tomate",t:"Boulettes de bœuf, semoule & légumes rôtis",p1:"170 g bœuf · 90 g semoule sèche · 300 g légumes",p2:"110 g bœuf · 60 g semoule sèche · 250 g légumes",cost:19,shop:["560 g bœuf haché 5%","300 g semoule","1,1 kg légumes à rôtir","1 bocal sauce tomate"]},
    {id:"poulet_fajitas",t:"Fajitas de poulet, poivrons & avocat",p1:"180 g poulet · 3 tortillas · légumes",p2:"120 g poulet · 2 tortillas · légumes",cost:21,shop:["600 g poulet","10 tortillas","4 poivrons","2 oignons","2 avocats","1 pot yaourt nature"]},
    {id:"pates_thon",t:"Pâtes au thon, tomate & courgette",p1:"100 g pâtes sèches · 160 g thon · légumes",p2:"65 g pâtes sèches · 100 g thon · légumes",cost:16,shop:["520 g thon au naturel égoutté","330 g pâtes sèches","800 g courgettes","2 bocaux sauce tomate"]},
    {id:"poulet_citron",t:"Poulet citron, boulgour & courgettes",p1:"180 g poulet · 90 g boulgour sec · 300 g courgettes",p2:"120 g poulet · 60 g boulgour sec · 250 g courgettes",cost:17,shop:["600 g poulet","300 g boulgour sec","1,1 kg courgettes","2 citrons"]},
    {id:"parmentier",t:"Parmentier de bœuf & légumes",p1:"170 g bœuf · 320 g pommes de terre · légumes",p2:"110 g bœuf · 220 g pommes de terre · légumes",cost:18,shop:["560 g bœuf haché 5%","1,1 kg pommes de terre","800 g carottes","500 g petits pois"]},
    {id:"omelette_pdt",t:"Frittata pommes de terre, épinards & salade",p1:"4 œufs · 300 g pommes de terre · salade",p2:"3 œufs · 200 g pommes de terre · salade",cost:15,shop:["14 œufs","1 kg pommes de terre","500 g épinards","2 salades","200 g fromage râpé pasteurisé"]},
    {id:"dinde_riz",t:"Dinde paprika doux, riz & ratatouille",p1:"180 g dinde · 90 g riz sec · 300 g ratatouille",p2:"120 g dinde · 60 g riz sec · 250 g ratatouille",cost:18,shop:["600 g dinde","300 g riz sec","1,1 kg ratatouille","Paprika doux"]}
  ];

  const breakfasts=[
    ["Skyr + banane — 20 secondes","250 g skyr · 1 banane","150 g skyr · 1 banane",["400 g skyr","2 bananes"]],
    ["Pain complet + beurre de cacahuète + fruit — 40 secondes","80 g pain complet · 20 g beurre de cacahuète · 1 fruit","50 g pain complet · 15 g beurre de cacahuète · 1 fruit",["130 g pain complet","35 g beurre de cacahuète","2 fruits"]],
    ["Skyr + pomme — 20 secondes","250 g skyr · 1 pomme","150 g skyr · 1 pomme",["400 g skyr","2 pommes"]],
    ["Fromage blanc + banane — 20 secondes","250 g fromage blanc · 1 banane","150 g fromage blanc · 1 banane",["400 g fromage blanc","2 bananes"]],
    ["Skyr + kiwi — 20 secondes","250 g skyr · 1 kiwi","150 g skyr · 1 kiwi",["400 g skyr","2 kiwis"]],
    ["Yaourt à boire + banane — 10 secondes","250 ml yaourt à boire nature · 1 banane","180 ml yaourt à boire nature · 1 fruit",["500 ml yaourt à boire nature","1 banane","1 fruit"]],
    ["Skyr + fruit — 20 secondes","250 g skyr · 1 fruit","150 g skyr · 1 fruit",["400 g skyr","2 fruits"]]
  ];
  const snacks=[
    ["Skyr, pomme & noix","250 g skyr · 1 pomme · 20 g noix","150 g skyr · 1 pomme · 15 g noix",["400 g skyr","2 pommes","35 g noix"]],
    ["Skyr & fruits rouges","250 g skyr · 150 g fruits rouges","150 g skyr · 100 g fruits rouges",["400 g skyr","250 g fruits rouges"]],
    ["Banane & fromage blanc","1 banane · 250 g fromage blanc","1 banane · 150 g fromage blanc",["2 bananes","400 g fromage blanc"]],
    ["Poire & skyr","1 poire · 250 g skyr","1 poire · 150 g skyr",["2 poires","400 g skyr"]],
    ["Fromage blanc, kiwi & amandes","250 g fromage blanc · 1 kiwi · 20 g amandes","150 g fromage blanc · 1 kiwi · 15 g amandes",["400 g fromage blanc","2 kiwis","35 g amandes"]],
    ["Fruit & skyr","1 fruit · 250 g skyr","1 fruit · 150 g skyr",["2 fruits","400 g skyr"]],
    ["Yaourt & fruit","200 g yaourt · 1 fruit","150 g yaourt · 1 fruit",["400 g yaourt nature","2 fruits"]]
  ];

  function read(k,f){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f));}catch(e){return f;}}
  function monday(d=new Date()){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x;}
  function iso(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),x=String(d.getDate()).padStart(2,"0");return `${y}-${m}-${x}`;}
  function seed(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  function allowed(){const bad=new Set(read(DISLIKES,[]));const a=dinners.filter(x=>!bad.has(x.id));return a.length>=7?a:dinners;}
  function mealArray(m,suffix=""){return [m.t+suffix,m.p1,m.p2];}
  function unique(a){return [...new Set(a)];}

  function chooseForWeek(weekKey){
    const pool=allowed(),start=seed(weekKey)%pool.length,out=[];
    for(let i=0;i<7;i++)out.push(pool[(start+i*3)%pool.length]);
    return out;
  }
  function overridesFor(weekKey){const all=read(OVERRIDES,{});return all[weekKey]||{};}
  function saveOverride(weekKey,day,id){const all=read(OVERRIDES,{});all[weekKey]=all[weekKey]||{};all[weekKey][day]=id;localStorage.setItem(OVERRIDES,JSON.stringify(all));}

  function generate(){
    const m=monday(),weekKey=iso(m),chosen=chooseForWeek(weekKey),ov=overridesFor(weekKey),pool=allowed();
    Object.keys(ov).forEach(k=>{const hit=pool.find(x=>x.id===ov[k]);if(hit)chosen[+k]=hit;});
    const prevKey=iso(new Date(m.getFullYear(),m.getMonth(),m.getDate()-7));
    const prevSunday=chooseForWeek(prevKey)[6];
    const days=chosen.map((d,i)=>{
      const prev=i===0?prevSunday:chosen[i-1],b=breakfast[(seed(weekKey)+i)%breakfasts.length],s=snacks[(seed(weekKey)+i*2)%snacks.length];
      return {name:NAMES[i],estimateEUR:d.cost+5,breakfast:b.slice(0,3),lunch:mealArray(prev," — restes de la veille"),dinner:mealArray(d),dinnerId:d.id,snack:s.slice(0,3),shop:unique([...b[3],...d.shop,...s[3]])};
    });
    const total=days.reduce((n,d)=>n+d.estimateEUR,0);
    return {weekOf:weekKey,generatedAt:new Date().toISOString().slice(0,10),source:"Denat Life automatic weekly engine",retailer:"Carrefour France",weeklyEstimateEUR:total,weeklyEstimateRangeEUR:[Math.round(total*.88),Math.round(total*1.12)],estimateNote:"Estimation indicative. Les prix réels varient selon le magasin, les promotions, les marques et les formats.",mealPrepNote:"Le dîner est préparé en 4 portions : dîner pour deux puis le même repas au repas du midi du lendemain.",days,weekShop:unique(days.flatMap(d=>d.shop))};
  }

  function replace(day,currentId){
    const weekKey=iso(monday()),pool=allowed(),idx=Math.max(0,pool.findIndex(x=>x.id===currentId));
    let next=pool[(idx+1)%pool.length];
    const used=new Set(generate().days.map(x=>x.dinnerId));
    for(let i=1;i<=pool.length;i++){const c=pool[(idx+i)%pool.length];if(!used.has(c.id)){next=c;break;}}
    saveOverride(weekKey,day,next.id);
    return generate();
  }
  function dislike(day,currentId){
    const bad=new Set(read(DISLIKES,[]));bad.add(currentId);localStorage.setItem(DISLIKES,JSON.stringify([...bad]));
    return replace(day,currentId);
  }
  function resetPreferences(){localStorage.removeItem(DISLIKES);localStorage.removeItem(OVERRIDES);return generate();}
  window.DenatMealEngine={generate,replace,dislike,resetPreferences};
})();