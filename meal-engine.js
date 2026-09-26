// Denat Life — moteur de menus, recettes et courses intelligentes
(function(){
  const DISLIKES="denat_meal_dislikes_v1";
  const OVERRIDES="denat_meal_overrides_v1";
  const NAMES=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

  const dinners=[
    {id:"curry_poulet",t:"Poulet curry doux, riz & brocoli",p1:"180 g poulet · 90 g riz sec · 250 g brocoli",p2:"120 g poulet · 60 g riz sec · 250 g brocoli",cost:19,shop:["600 g poulet","300 g riz basmati sec","1 kg brocoli","280 ml lait de coco léger","Curry doux"],prep:10,cook:20,steps:["Lancer le riz selon le temps indiqué sur le paquet.","Couper le poulet en morceaux puis le saisir dans une grande poêle avec un filet d’huile.","Ajouter le curry doux puis le lait de coco. Laisser mijoter à feu doux jusqu’à cuisson complète du poulet.","Cuire le brocoli vapeur ou à l’eau en le gardant légèrement ferme.","Servir 2 portions et mettre les 2 autres rapidement au frais pour le repas du midi suivant."]},
    {id:"saumon_pdt",t:"Saumon, pommes de terre & haricots verts",p1:"180 g saumon · 300 g pommes de terre · 250 g haricots verts",p2:"130 g saumon · 220 g pommes de terre · 250 g haricots verts",cost:25,shop:["620 g saumon","1,05 kg pommes de terre","1 kg haricots verts","1 citron"],prep:10,cook:30,steps:["Préchauffer le four à 200 °C.","Couper les pommes de terre en morceaux, assaisonner légèrement et enfourner environ 25 à 30 min.","Cuire les haricots verts à la vapeur ou dans l’eau bouillante.","Ajouter le saumon au four pour la fin de cuisson, jusqu’à ce qu’il soit cuit à cœur.","Ajouter le citron au service, puis réserver 2 portions au frais pour le lendemain."]},
    {id:"chili_boeuf",t:"Chili maison bœuf & haricots rouges",p1:"160 g bœuf 5% · 150 g haricots · 80 g riz sec",p2:"100 g bœuf 5% · 120 g haricots · 50 g riz sec",cost:18,shop:["520 g bœuf haché 5%","540 g haricots rouges cuits","260 g riz sec","2 bocaux sauce tomate","2 poivrons","2 oignons"],prep:12,cook:25,steps:["Lancer le riz.","Émincer les oignons et les poivrons puis les faire revenir dans une grande sauteuse.","Ajouter le bœuf haché et le cuire complètement en l’émiettant.","Ajouter les haricots rouges rincés et la sauce tomate. Assaisonner puis laisser mijoter 15 min.","Servir avec le riz et réserver 2 portions au frais pour le repas du midi suivant."]},
    {id:"dinde_pates",t:"Dinde, pâtes complètes, épinards & tomate",p1:"180 g dinde · 90 g pâtes sèches · 200 g épinards",p2:"120 g dinde · 60 g pâtes sèches · 200 g épinards",cost:17,shop:["600 g dinde","300 g pâtes complètes sèches","800 g épinards","500 g tomates"],prep:10,cook:18,steps:["Cuire les pâtes complètes.","Couper la dinde en morceaux et la saisir dans une grande poêle jusqu’à cuisson complète.","Ajouter les tomates coupées puis les épinards et laisser tomber quelques minutes.","Égoutter les pâtes et les mélanger à la poêlée.","Servir 2 portions et refroidir rapidement les 2 portions destinées au lendemain."]},
    {id:"cabillaud_quinoa",t:"Cabillaud, quinoa & courgettes",p1:"200 g cabillaud · 90 g quinoa sec · 300 g courgettes",p2:"140 g cabillaud · 60 g quinoa sec · 250 g courgettes",cost:22,shop:["680 g cabillaud","300 g quinoa sec","1,1 kg courgettes","1 citron"],prep:10,cook:20,steps:["Rincer puis cuire le quinoa.","Couper les courgettes et les faire revenir à la poêle avec un filet d’huile.","Cuire le cabillaud à la poêle ou au four jusqu’à ce qu’il soit opaque et cuit à cœur.","Assaisonner avec le citron et des herbes.","Répartir en 4 portions et placer les 2 portions du lendemain au frais."]},
    {id:"pizza_poulet",t:"Pizza maison poulet, mozzarella & légumes",p1:"1/2 pizza · poulet · légumes",p2:"1/3 à 1/2 pizza selon faim",cost:18,shop:["500 g poulet","2 pâtes à pizza","300 g mozzarella pasteurisée","2 bocaux sauce tomate","400 g champignons","2 poivrons"],prep:15,cook:18,steps:["Préchauffer le four à 220 °C.","Couper le poulet en petits morceaux et le précuire complètement à la poêle.","Étaler la sauce tomate sur les pâtes puis ajouter poulet, champignons et poivrons émincés.","Ajouter la mozzarella puis cuire jusqu’à pâte dorée et fromage bien fondu.","Conserver la part prévue pour le lendemain au réfrigérateur une fois refroidie."]},
    {id:"poulet_roti",t:"Poulet rôti, pommes de terre & légumes",p1:"200 g poulet · 320 g pommes de terre · 300 g légumes",p2:"130 g poulet · 220 g pommes de terre · 250 g légumes",cost:16,shop:["700 g poulet","1,1 kg pommes de terre","1,1 kg légumes de saison"],prep:12,cook:35,steps:["Préchauffer le four à 200 °C.","Couper pommes de terre et légumes en morceaux et les répartir sur une plaque.","Ajouter le poulet, un filet d’huile et les herbes de votre choix.","Cuire jusqu’à ce que les légumes soient tendres et le poulet complètement cuit.","Répartir en 4 portions et réserver les 2 portions du lendemain au frais."]},
    {id:"boulettes_tomate",t:"Boulettes de bœuf, semoule & légumes rôtis",p1:"170 g bœuf · 90 g semoule sèche · 300 g légumes",p2:"110 g bœuf · 60 g semoule sèche · 250 g légumes",cost:19,shop:["560 g bœuf haché 5%","300 g semoule","1,1 kg légumes à rôtir","1 bocal sauce tomate"],prep:15,cook:25,steps:["Préchauffer le four à 200 °C et mettre les légumes coupés à rôtir.","Former de petites boulettes avec le bœuf puis les cuire complètement à la poêle.","Ajouter la sauce tomate aux boulettes et laisser mijoter quelques minutes.","Préparer la semoule avec de l’eau chaude selon le paquet.","Servir 2 portions et réserver 2 portions au frais pour le lendemain."]},
    {id:"poulet_fajitas",t:"Fajitas de poulet, poivrons & avocat",p1:"180 g poulet · 3 tortillas · légumes",p2:"120 g poulet · 2 tortillas · légumes",cost:21,shop:["600 g poulet","10 tortillas","4 poivrons","2 oignons","2 avocats","1 pot yaourt nature"],prep:15,cook:15,steps:["Émincer le poulet, les poivrons et les oignons.","Faire revenir les légumes puis ajouter le poulet et le cuire complètement.","Réchauffer les tortillas.","Écraser ou couper l’avocat et utiliser le yaourt nature comme sauce fraîche.","Garder séparément garniture et tortillas des portions du lendemain pour une meilleure texture."]},
    {id:"pates_thon",t:"Pâtes au thon, tomate & courgette",p1:"100 g pâtes sèches · 160 g thon · légumes",p2:"65 g pâtes sèches · 100 g thon · légumes",cost:16,shop:["520 g thon au naturel égoutté","330 g pâtes sèches","800 g courgettes","2 bocaux sauce tomate"],prep:8,cook:18,steps:["Cuire les pâtes.","Couper les courgettes en petits dés et les faire revenir à la poêle.","Ajouter la sauce tomate puis le thon égoutté et réchauffer l’ensemble.","Mélanger avec les pâtes égouttées.","Répartir en 4 portions et mettre rapidement les 2 portions du lendemain au frais."]},
    {id:"poulet_citron",t:"Poulet citron, boulgour & courgettes",p1:"180 g poulet · 90 g boulgour sec · 300 g courgettes",p2:"120 g poulet · 60 g boulgour sec · 250 g courgettes",cost:17,shop:["600 g poulet","300 g boulgour sec","1,1 kg courgettes","2 citrons"],prep:10,cook:20,steps:["Cuire le boulgour selon le paquet.","Couper le poulet et les courgettes.","Saisir le poulet jusqu’à cuisson complète puis ajouter les courgettes.","Ajouter le jus de citron en fin de cuisson et assaisonner.","Servir avec le boulgour puis réserver 2 portions au frais pour le lendemain."]},
    {id:"parmentier",t:"Parmentier de bœuf & légumes",p1:"170 g bœuf · 320 g pommes de terre · légumes",p2:"110 g bœuf · 220 g pommes de terre · légumes",cost:18,shop:["560 g bœuf haché 5%","1,1 kg pommes de terre","800 g carottes","500 g petits pois"],prep:15,cook:35,steps:["Cuire les pommes de terre puis les écraser en purée avec un peu d’eau de cuisson ou de lait.","Cuire les carottes en petits dés et les petits pois.","Faire revenir le bœuf jusqu’à cuisson complète puis ajouter les légumes.","Mettre la viande et les légumes dans un plat, couvrir de purée et gratiner au four.","Servir 2 portions et conserver les 2 autres au réfrigérateur pour le lendemain."]},
    {id:"omelette_pdt",t:"Frittata pommes de terre, épinards & salade",p1:"4 œufs · 300 g pommes de terre · salade",p2:"3 œufs · 200 g pommes de terre · salade",cost:15,shop:["14 œufs","1 kg pommes de terre","500 g épinards","2 salades","200 g fromage râpé pasteurisé"],prep:12,cook:25,steps:["Préchauffer le four à 190 °C.","Cuire les pommes de terre en petits dés à la poêle jusqu’à ce qu’elles soient tendres.","Ajouter les épinards puis verser les œufs battus et parsemer de fromage.","Terminer la cuisson au four jusqu’à ce que les œufs soient complètement pris.","Servir avec la salade et conserver les portions du lendemain au frais."]},
    {id:"dinde_riz",t:"Dinde paprika doux, riz & ratatouille",p1:"180 g dinde · 90 g riz sec · 300 g ratatouille",p2:"120 g dinde · 60 g riz sec · 250 g ratatouille",cost:18,shop:["600 g dinde","300 g riz sec","1,1 kg ratatouille","Paprika doux"],prep:8,cook:22,steps:["Lancer le riz.","Couper la dinde en morceaux, ajouter le paprika doux puis la saisir à la poêle jusqu’à cuisson complète.","Réchauffer ou cuire la ratatouille à feu doux.","Assembler riz, dinde et ratatouille.","Répartir en 4 portions et placer les 2 portions du lendemain au frais."]}
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

  function normName(s){return String(s||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
  function singular(s){
    const map={"bananes":"banane","pommes":"pomme","poires":"poire","kiwis":"kiwi","citrons":"citron","fruits":"fruit","poivrons":"poivron","oignons":"oignon","avocats":"avocat","salades":"salade","oeufs":"œuf","œufs":"œuf","bocaux sauce tomate":"bocal sauce tomate","pates a pizza":"pâte à pizza","tortillas":"tortilla"};
    return map[normName(s)]||String(s).trim();
  }
  function parseItem(raw){
    const s=String(raw).trim();
    let m=s.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l)\s+(.+)$/i);
    if(m){
      let qty=parseFloat(m[1].replace(",",".")),unit=m[2].toLowerCase(),name=m[3].trim();
      if(unit==="kg"){qty*=1000;unit="g";} if(unit==="l"){qty*=1000;unit="ml";}
      return {key:`${unit}|${normName(name)}`,qty,unit,name};
    }
    m=s.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/i);
    if(m){
      const qty=parseFloat(m[1].replace(",",".")),name=singular(m[2]);
      return {key:`u|${normName(name)}`,qty,unit:"u",name};
    }
    return {key:`x|${normName(s)}`,qty:1,unit:"x",name:s};
  }
  function formatQty(q){return Math.abs(q-Math.round(q))<.001?String(Math.round(q)):String(Math.round(q*100)/100).replace(".",",");}\n  function plural(name,qty){if(qty<=1)return name;const n=normName(name),special={"banane":"bananes","pomme":"pommes","poire":"poires","kiwi":"kiwis","citron":"citrons","fruit":"fruits","poivron":"poivrons","oignon":"oignons","avocat":"avocats","salade":"salades","œuf":"œufs","bocal sauce tomate":"bocaux sauce tomate","pate a pizza":"pâtes à pizza","tortilla":"tortillas"};return special[n]||name;}\n  function formatItem(x){if(x.unit==="x")return x.name;if(x.unit==="u")return `${formatQty(x.qty)} ${plural(x.name,x.qty)}`;if(x.unit==="g"&&x.qty>=1000)return `${formatQty(x.qty/1000)} kg ${x.name}`;if(x.unit==="ml"&&x.qty>=1000)return `${formatQty(x.qty/1000)} L ${x.name}`;return `${formatQty(x.qty)} ${x.unit} ${x.name}`;}
  function category(name){
    const n=normName(name);
    if(/poulet|dinde|boeuf|saumon|cabillaud|thon/.test(n))return "Viandes & poissons";
    if(/skyr|yaourt|fromage|mozzarella|oeuf|œuf/.test(n))return "Frais";
    if(/brocoli|haricot|pomme$|banane|poire|kiwi|fruit|citron|poivron|oignon|avocat|salade|courgette|epinard|tomate|champignon|carotte|petits pois|legume|ratatouille|pommes de terre/.test(n))return "Fruits & légumes";
    if(/riz|pate|quinoa|semoule|boulgour|pain|tortilla/.test(n))return "Féculents & boulangerie";
    return "Épicerie";
  }
  function consolidate(items){
    const map=new Map();
    items.map(parseItem).forEach(x=>{
      const old=map.get(x.key);
      if(old)old.qty+=x.qty;else map.set(x.key,{...x});
    });
    const order=["Fruits & légumes","Viandes & poissons","Frais","Féculents & boulangerie","Épicerie"];
    return [...map.values()].map(x=>{
      const text=formatItem(x);
      return {text,category:category(x.name)};
    }).sort((a,b)=>order.indexOf(a.category)-order.indexOf(b.category)||a.text.localeCompare(b.text,"fr"));
  }

  function chooseForWeek(weekKey){
    const pool=allowed().slice().sort((a,b)=>seed(weekKey+a.id)-seed(weekKey+b.id));
    return pool.slice(0,7);
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
      const daily=consolidate([...b[3],...d.shop,...s[3]]);
      return {name:NAMES[i],estimateEUR:d.cost+5,breakfast:b.slice(0,3),lunch:mealArray(prev," — restes de la veille"),dinner:mealArray(d),dinnerId:d.id,snack:s.slice(0,3),shop:daily.map(x=>x.text)};
    });
    const total=days.reduce((n,d)=>n+d.estimateEUR,0);
    const consolidated=consolidate(days.flatMap(d=>d.shop));
    return {weekOf:weekKey,generatedAt:iso(new Date()),source:"Denat Life automatic weekly engine",retailer:"Carrefour France",weeklyEstimateEUR:total,weeklyEstimateRangeEUR:[Math.round(total*.88),Math.round(total*1.12)],estimateNote:"Estimation indicative. Les prix réels varient selon le magasin, les promotions, les marques et les formats.",mealPrepNote:"Le dîner est préparé en 4 portions : dîner pour deux puis le même repas au repas du midi du lendemain.",days,weekShop:consolidated.map(x=>x.text),weekShopCategories:consolidated.map(x=>x.category)};
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
  function getRecipe(id){
    const d=dinners.find(x=>x.id===id);if(!d)return null;
    return {id:d.id,title:d.t,prep:d.prep,cook:d.cook,total:d.prep+d.cook,portions:4,ingredients:d.shop.slice(),steps:d.steps.slice(),p1:d.p1,p2:d.p2};
  }
  function resetPreferences(){localStorage.removeItem(DISLIKES);localStorage.removeItem(OVERRIDES);return generate();}
  window.DenatMealEngine={generate,replace,dislike,getRecipe,resetPreferences};
})();