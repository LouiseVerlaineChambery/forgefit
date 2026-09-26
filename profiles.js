// Denat Life — profils personnels Jocelyn / Anaïs, foyer partagé.
(function(){
  const DEVICE_KEY="denat_device_profile_v1";
  const PROFILES={
    jocelyn:{id:"jocelyn",name:"Jocelyn",meal:"p1"},
    anais:{id:"anais",name:"Anaïs",meal:"p2"}
  };
  const valid=x=>x==="jocelyn"||x==="anais";
  function currentId(){const x=localStorage.getItem(DEVICE_KEY);return valid(x)?x:"jocelyn";}
  function current(){return PROFILES[currentId()];}
  function sportKey(id=currentId()){return `denat_profile_${id}_sport_v1`;}
  function journalKey(id=currentId()){return `denat_profile_${id}_food_journal_v1`;}
  function migrate(){
    const old=localStorage.getItem("forgefit_v2_state");
    if(old&&!localStorage.getItem(sportKey("jocelyn")))localStorage.setItem(sportKey("jocelyn"),old);
    const oldCoach=localStorage.getItem("denat_meal_coach_v1");
    if(oldCoach&&!localStorage.getItem("denat_profile_jocelyn_meal_coach_v1"))localStorage.setItem("denat_profile_jocelyn_meal_coach_v1",oldCoach);
    const oldHealth=localStorage.getItem("denat_health_cache_v1");
    if(oldHealth&&!localStorage.getItem("denat_health_cache_jocelyn_v1"))localStorage.setItem("denat_health_cache_jocelyn_v1",oldHealth);
    if(!localStorage.getItem(DEVICE_KEY))localStorage.setItem(DEVICE_KEY,"jocelyn");
    localStorage.setItem("forgefit_meals_person",current().meal);
  }
  function set(id){
    if(!valid(id))return false;
    localStorage.setItem(DEVICE_KEY,id);
    localStorage.setItem("forgefit_meals_person",PROFILES[id].meal);
    location.reload();
    return true;
  }
  function label(){return current().name;}
  function is(id){return currentId()===id;}
  function applyShell(){
    const first=document.querySelector('.tab[data-route="settings"] small');
    if(first)first.textContent=label();
    document.documentElement.dataset.denatProfile=currentId();
    const bar=document.querySelector(".tabbar");
    const sport=document.querySelector('.tab[data-route="today"]');
    const meals=document.querySelector('.tab[data-route="meals"]');
    const courses=document.querySelector('.tab[data-route="courses"]');
    if(bar&&sport&&meals&&courses){
      if(is("anais")){
        bar.insertBefore(meals,sport);
        bar.insertBefore(courses,sport);
      }else{
        bar.insertBefore(sport,meals);
        bar.insertBefore(meals,courses);
      }
    }
  }
  migrate();
  window.DenatProfile={profiles:PROFILES,currentId,current,label,is,set,sportKey,journalKey,applyShell};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",applyShell);else applyShell();
})();