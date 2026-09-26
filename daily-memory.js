// Denat Life — mémoire quotidienne dérivée des faits enregistrés.
// Pas de doublon de stockage : la mémoire est reconstruite depuis les séances et le journal repas.
(function(){
  const DAY=86400000;
  const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const sessions=()=>[...(typeof state!=="undefined"&&Array.isArray(state.sessions)?state.sessions:[])]
    .filter(x=>x?.endedAt).sort((a,b)=>new Date(a.endedAt)-new Date(b.endedAt));
  const meals=()=>[...(window.DenatNutrition?.read?.()||[])]
    .filter(x=>x?.at).sort((a,b)=>new Date(a.at)-new Date(b.at));
  const start=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x;};
  const at=(d,h,m=0)=>{const x=start(d);x.setHours(h,m,0,0);return x;};
  const shift=(d,n)=>new Date(start(d).getTime()+n*DAY);
  const inRange=(iso,from,to)=>{const t=new Date(iso).getTime();return t>=from.getTime()&&t<to.getTime();};
  const sumRange=(items,key)=>{
    const a=items.map(x=>x[key]).filter(x=>Array.isArray(x)&&x.length>=2);
    return a.length?[Math.round(a.reduce((s,x)=>s+(+x[0]||0),0)),Math.round(a.reduce((s,x)=>s+(+x[1]||0),0))]:[0,0];
  };
  function range(kind,now=new Date()){
    const today=start(now),tomorrow=shift(now,1);
    if(kind==="morning")return {id:kind,label:"ce matin",from:at(now,5),to:at(now,11)};
    if(kind==="lunch")return {id:kind,label:"ce midi",from:at(now,11),to:at(now,15)};
    if(kind==="afternoon")return {id:kind,label:"cet après-midi",from:at(now,15),to:at(now,19)};
    if(kind==="evening")return {id:kind,label:"ce soir",from:at(now,19),to:tomorrow};
    if(kind==="yesterday")return {id:kind,label:"hier",from:shift(now,-1),to:today};
    if(kind==="seven")return {id:kind,label:"sur les 7 derniers jours",from:new Date(now.getTime()-7*DAY),to:new Date(now.getTime()+1000)};
    if(kind==="sinceSport"){
      const last=[...sessions()].reverse()[0];
      return {id:kind,label:"depuis ta dernière séance",from:last?new Date(last.endedAt):today,to:new Date(now.getTime()+1000),anchor:last||null};
    }
    return {id:"today",label:"aujourd’hui",from:today,to:new Date(now.getTime()+1000)};
  }
  function detect(text){
    const n=norm(text);
    if(/depuis.*(derniere|dernier).*(seance|sport)|depuis.*sport/.test(n))return "sinceSport";
    if(/7 jours|sept jours|cette semaine|sur la semaine|semaine/.test(n))return "seven";
    if(/hier/.test(n))return "yesterday";
    if(/ce matin|matin/.test(n))return "morning";
    if(/ce midi|midi/.test(n))return "lunch";
    if(/cet apres midi|apres midi/.test(n))return "afternoon";
    if(/ce soir|soir/.test(n))return "evening";
    return "today";
  }
  function snapshot(kind="today",now=new Date()){
    const r=range(kind,now);
    const food=meals().filter(x=>inRange(x.at,r.from,r.to));
    const sport=sessions().filter(x=>inRange(x.endedAt,r.from,r.to));
    const kcal=sumRange(food,"kcalRange"),protein=sumRange(food,"proteinRange");
    return {...r,meals:food,sessions:sport,kcal,protein,events:[
      ...food.map(x=>({kind:"meal",at:x.at,label:x.mealType||"Repas",text:x.text||"Repas",raw:x})),
      ...sport.map(x=>({kind:"sport",at:x.endedAt,label:"Sport",text:x.workoutName||"Séance",raw:x}))
    ].sort((a,b)=>new Date(a.at)-new Date(b.at))};
  }
  function clock(iso){return new Intl.DateTimeFormat("fr-FR",{hour:"2-digit",minute:"2-digit"}).format(new Date(iso));}
  function dayLabel(date){
    const d=new Date(date),today=start(new Date()).getTime(),x=start(d).getTime();
    if(x===today)return "Aujourd’hui";
    if(x===today-DAY)return "Hier";
    return new Intl.DateTimeFormat("fr-FR",{weekday:"short",day:"numeric",month:"short"}).format(d).replace(/^./,m=>m.toUpperCase());
  }
  function describe(s){
    const lines=s.events.map(e=>e.kind==="sport"
      ?`${clock(e.at)} · Sport · ${e.text}`
      :`${clock(e.at)} · ${e.label} · ${e.text}`);
    return lines;
  }
  function query(text){
    const kind=detect(text),s=snapshot(kind),n=norm(text);
    const wantsFood=/mange|manger|repas|nutrition|proteine|calorie|midi|matin|soir/.test(n);
    const wantsSport=/sport|seance|entrain|muscu/.test(n);
    let events=s.events;
    if(wantsFood&&!wantsSport)events=events.filter(x=>x.kind==="meal");
    if(wantsSport&&!wantsFood)events=events.filter(x=>x.kind==="sport");
    const lines=events.map(e=>e.kind==="sport"
      ?`${clock(e.at)} · séance ${e.text}`
      :`${clock(e.at)} · ${e.label} : ${e.text}`);
    let note="";
    if(kind==="sinceSport"&&!s.anchor)note="Aucune séance précédente n’est enregistrée : je ne peux pas calculer « depuis la dernière séance ».";
    else if(!events.length)note=`Rien n’est enregistré ${s.label} pour cette demande.`;
    else if(wantsFood&&s.meals.length)note=`${s.meals.length} repas/ajout${s.meals.length>1?"s":""} retrouvé${s.meals.length>1?"s":""}.`;
    else if(wantsSport&&s.sessions.length)note=`${s.sessions.length} séance${s.sessions.length>1?"s":""} retrouvée${s.sessions.length>1?"s":""}.`;
    else note=`${events.length} événement${events.length>1?"s":""} retrouvé${events.length>1?"s":""}.`;
    return {...s,lines,note,wantsFood,wantsSport};
  }
  function context(){
    const today=snapshot("today"),yesterday=snapshot("yesterday"),seven=snapshot("seven"),sinceSport=snapshot("sinceSport");
    const lastSport=[...sessions()].reverse()[0]||null,lastMeal=[...meals()].reverse()[0]||null;
    return {today,yesterday,seven,sinceSport,lastSport,lastMeal};
  }
  function coachHint(){
    const c=context(),jocelyn=window.DenatProfile?.is?.("jocelyn")===true;
    if(!jocelyn){
      if(!c.today.meals.length)return "Aucun repas noté aujourd’hui : le coach évite de tirer des conclusions sur une journée incomplète.";
      return `${c.today.meals.length} repas/ajout${c.today.meals.length>1?"s":""} noté${c.today.meals.length>1?"s":""} aujourd’hui. Le coach privilégie simplicité, variété et organisation.`;
    }
    if(c.lastSport){
      const after=c.sinceSport.meals.length;
      if(after===0)return `Dernière séance : ${window.DenatTime?.relative?.(c.lastSport.endedAt)||dayLabel(c.lastSport.endedAt)}. Aucun repas n’est encore noté depuis.`;
      return `Depuis la dernière séance : ${after} repas/ajout${after>1?"s":""} noté${after>1?"s":""}. Le bilan reste basé uniquement sur ce qui a été saisi.`;
    }
    return "La mémoire se construira automatiquement avec les séances terminées et les repas enregistrés.";
  }
  function days(count=7){
    const now=new Date(),out=[];
    for(let i=count-1;i>=0;i--){
      const d=shift(now,-i),from=start(d),to=shift(d,1);
      const food=meals().filter(x=>inRange(x.at,from,to)),sport=sessions().filter(x=>inRange(x.endedAt,from,to));
      out.push({date:d,label:dayLabel(d),meals:food,sessions:sport,events:[
        ...food.map(x=>({kind:"meal",at:x.at,text:x.text,label:x.mealType||"Repas"})),
        ...sport.map(x=>({kind:"sport",at:x.endedAt,text:x.workoutName||"Séance",label:"Sport"}))
      ].sort((a,b)=>new Date(a.at)-new Date(b.at))});
    }
    return out;
  }
  window.DenatMemory={range,detect,snapshot,query,context,coachHint,days,describe,dayLabel};
})();