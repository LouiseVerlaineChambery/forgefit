// Denat Life — récupération du jour depuis Apple Santé (optionnelle) + cache hors ligne.
(function(){
  const KEY="denat_health_cache_v1";
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
  const pick=(o,keys)=>{for(const k of keys){if(o&&o[k]!=null){const n=num(o[k]);if(n!=null)return n;}}return null;};
  function cached(){try{return JSON.parse(localStorage.getItem(KEY)||"null");}catch{return null;}}
  function normalize(raw){
    const root=raw?.payload||raw||{},s=root.summary||root.metrics||root;
    return {
      receivedAt:num(raw?.lastSync)||num(root.receivedAt)||Date.now(),
      sleepHours:pick(s,["sleepHours","sleep_hours","sleep","sleepDurationHours"]),
      steps:pick(s,["steps","stepCount","step_count"]),
      restingHeartRate:pick(s,["restingHeartRate","resting_hr","rhr"]),
      hrvMs:pick(s,["hrvMs","hrv","hrv_ms","heartRateVariability"]),
      activeEnergyKcal:pick(s,["activeEnergyKcal","activeEnergy","active_energy","activeCalories"]),
      exerciseMinutes:pick(s,["exerciseMinutes","exercise_minutes","appleExerciseTime"]),
      weightKg:pick(s,["weightKg","weight","bodyMassKg"]),
      baselineRestingHeartRate:pick(s,["baselineRestingHeartRate","baseline_rhr"]),
      baselineHrvMs:pick(s,["baselineHrvMs","baseline_hrv"])
    };
  }
  function recovery(){
    const d=cached();if(!d)return {connected:false,fresh:false,score:null,band:"unknown",label:"Apple Santé non connecté",reasons:[]};
    const age=Date.now()-(+d.receivedAt||0),fresh=age<48*3600000;
    if(!fresh)return {connected:true,fresh:false,score:null,band:"unknown",label:"Données Santé à actualiser",reasons:[]};
    let score=80,reasons=[];
    if(d.sleepHours!=null){
      if(d.sleepHours<5.5){score-=25;reasons.push("sommeil très court");}
      else if(d.sleepHours<6.5){score-=15;reasons.push("sommeil court");}
      else if(d.sleepHours<7){score-=6;reasons.push("sommeil un peu court");}
      else if(d.sleepHours>=7.5){score+=5;reasons.push("sommeil correct");}
    }
    if(d.hrvMs!=null&&d.baselineHrvMs){
      const q=d.hrvMs/d.baselineHrvMs;
      if(q<.80){score-=12;reasons.push("VFC sous ta référence");}
      else if(q>1.10){score+=4;reasons.push("VFC au-dessus de ta référence");}
    }
    if(d.restingHeartRate!=null&&d.baselineRestingHeartRate){
      const delta=d.restingHeartRate-d.baselineRestingHeartRate;
      if(delta>=8){score-=10;reasons.push("FC repos au-dessus de ta référence");}
      else if(delta>=5){score-=5;reasons.push("FC repos légèrement haute");}
    }
    if(d.exerciseMinutes!=null&&d.exerciseMinutes>120){score-=5;reasons.push("activité élevée récemment");}
    score=Math.max(40,Math.min(100,Math.round(score)));
    const band=score<60?"low":score<75?"medium":"good";
    const label=band==="low"?"Récupération basse":band==="medium"?"Récupération moyenne":"Bonne récupération";
    return {connected:true,fresh:true,score,band,label,reasons,data:d};
  }
  async function refresh(){
    if(!window.DenatCloud?.healthStatus)return recovery();
    try{
      const raw=await window.DenatCloud.healthStatus();
      if(raw?.connected){
        const d=normalize(raw);localStorage.setItem(KEY,JSON.stringify(d));
        window.dispatchEvent(new CustomEvent("denat-health-updated",{detail:d}));
      }
    }catch{}
    return recovery();
  }
  window.DenatHealth={recovery,refresh,cached};
  setTimeout(()=>refresh().then(()=>{try{render();}catch{}}),250);
})();