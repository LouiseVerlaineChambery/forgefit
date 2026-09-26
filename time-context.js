// Denat Life — contexte temporel local : sport, repas et journal dans le temps.
(function(){
  const DAY=86400000,HOUR=3600000;
  const sameDay=(a,b=new Date())=>a&&new Date(a).toDateString()===new Date(b).toDateString();
  const sessions=()=>[...(typeof state!=="undefined"&&Array.isArray(state.sessions)?state.sessions:[])].filter(x=>x?.endedAt).sort((a,b)=>new Date(b.endedAt)-new Date(a.endedAt));
  const journal=()=>window.DenatNutrition?.read?.()||[];
  function relative(iso){
    if(!iso)return "jamais";
    const d=new Date(iso),ms=Date.now()-d.getTime();
    if(ms<0)return new Intl.DateTimeFormat("fr-FR",{weekday:"long",hour:"2-digit",minute:"2-digit"}).format(d);
    const min=Math.floor(ms/60000),h=Math.floor(ms/HOUR),days=Math.floor(ms/DAY);
    if(min<2)return "à l’instant";
    if(min<60)return `il y a ${min} min`;
    if(h<24)return `il y a ${h} h`;
    if(days===1)return "hier";
    if(days<7)return `il y a ${days} jours`;
    return new Intl.DateTimeFormat("fr-FR",{day:"numeric",month:"short"}).format(d);
  }
  function mealMoment(date=new Date()){
    const h=date.getHours()+date.getMinutes()/60;
    if(h<5)return {id:"night",label:"nuit",prompt:"prochain repas",mealType:"autre"};
    if(h<10.5)return {id:"breakfast",label:"matin",prompt:"petit-déjeuner",mealType:"petit-déjeuner"};
    if(h<14.5)return {id:"lunch",label:"midi",prompt:"repas du midi",mealType:"repas du midi"};
    if(h<18.5)return {id:"snack",label:"après-midi",prompt:"collation / prochain repas",mealType:"collation"};
    if(h<23.5)return {id:"dinner",label:"soir",prompt:"dîner",mealType:"dîner"};
    return {id:"night",label:"fin de soirée",prompt:"prochain repas",mealType:"autre"};
  }
  function sport(){
    const all=sessions(),last=all[0]||null,active=typeof state!=="undefined"?state.activeSession:null;
    const now=Date.now(),week=all.filter(s=>now-new Date(s.endedAt).getTime()<7*DAY),today=all.filter(s=>sameDay(s.endedAt));
    const hoursSince=last?Math.max(0,(now-new Date(last.endedAt).getTime())/HOUR):null;
    let status="Aucune séance enregistrée";
    if(active)status=`Séance en cours · ${active.workoutName}`;
    else if(last)status=`Dernière séance ${relative(last.endedAt)} · ${last.workoutName}`;
    return {active,last,week,today,hoursSince,status,lastText:last?relative(last.endedAt):"aucune séance"};
  }
  function food(){
    const all=journal().filter(x=>x?.at).sort((a,b)=>new Date(b.at)-new Date(a.at)),today=all.filter(x=>sameDay(x.at));
    return {all,today,last:all[0]||null,lastText:all[0]?relative(all[0].at):"aucun repas noté"};
  }
  function planned(){
    try{
      const m=window.DenatMealEngine?.generate?.(),i=(new Date().getDay()+6)%7,d=m?.days?.[i],moment=mealMoment();
      if(!d)return {day:null,current:null,dinner:null};
      const current=moment.id==="breakfast"?d.breakfast:moment.id==="lunch"?d.lunch:moment.id==="snack"?d.snack:d.dinner;
      return {day:d,current,dinner:d.dinner,moment};
    }catch{return {day:null,current:null,dinner:null,moment:mealMoment()};}
  }
  function snapshot(){
    return {now:new Date(),moment:mealMoment(),sport:sport(),food:food(),planned:planned()};
  }
  function sentence(){
    const x=snapshot(),bits=[];
    bits.push(`Nous sommes ${new Intl.DateTimeFormat("fr-FR",{weekday:"long",hour:"2-digit",minute:"2-digit"}).format(x.now)}`);
    bits.push(x.sport.status);
    bits.push(x.food.today.length?`${x.food.today.length} repas/ajout${x.food.today.length>1?"s":""} noté${x.food.today.length>1?"s":""} aujourd’hui`:"aucun repas noté aujourd’hui");
    return bits.join(" · ");
  }
  window.DenatTime={relative,mealMoment,sport,food,planned,snapshot,sentence,sameDay};
})();