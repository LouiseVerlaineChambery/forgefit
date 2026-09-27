// Denat Life boot — hydrate le cache depuis le Cloud avant de lancer l'application.
(async function(){
  try{await window.DenatCloud?.init?.();}catch(e){}
  const files=["profiles.js","app.js","mybodynote.js","training-plan.js","metrics.js","exercise-guide.js","exercise-library.js","forgefit-v3.js","health-connector.js","health-coach.js","sport-coach.js","nomad-workout.js","muscle-analytics.js","session-ux.js","nutrition-core.js","meal-engine.js","nutrition-journal.js","nutrition-adaptive.js","time-context.js","daily-memory.js","timeline.js","wellbeing.js","meal-coach.js","meals.js","entry-links.js","split-theme.js","dashboard.js","navigation-v11.js"];
  for(const src of files){
    await new Promise(resolve=>{
      const s=document.createElement("script");s.src=src+"?v=27";s.onload=resolve;s.onerror=resolve;document.body.appendChild(s);
    });
  }
})();