// Denat Life V11 — navigation lifestyle
(function(){
  const baseSetRoute=setRoute;
  function active(name){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.route===name));}
  function renderMore(){
    title.textContent="Plus";
    view.innerHTML=`
      <section class="card hero">
        <div class="dl-brand-hero"><img src="brand-logo-v5.svg" alt="Denat Life"><div><div class="dl-brand-name">DENAT LIFE</div><div class="dl-brand-sub">SPORT · NUTRITION · ÉQUILIBRE</div></div></div>
      </section>
      <section class="card"><div class="eyebrow">VOTRE ESPACE</div><h2 style="margin:6px 0 14px">Plus</h2><div class="dl-more-grid">
        <div class="dl-more-item" data-more="program"><b>Programme</b><span>Voir et modifier les séances.</span></div>
        <div class="dl-more-item" data-more="history"><b>Progression</b><span>Historique, charges et statistiques.</span></div>
        <div class="dl-more-item" data-more="settings"><b>Réglages</b><span>Sauvegarde, import et paramètres.</span></div>
        <div class="dl-more-item" data-more="week"><b>Menu 7 jours</b><span>Voir toute la semaine de repas.</span></div>
      </div></section>`;
    view.querySelector('[data-more="program"]')?.addEventListener("click",()=>baseSetRoute("program"));
    view.querySelector('[data-more="history"]')?.addEventListener("click",()=>baseSetRoute("history"));
    view.querySelector('[data-more="week"]')?.addEventListener("click",()=>{localStorage.setItem("forgefit_meals_view","week");baseSetRoute("meals");active("meals");});
    view.querySelector('[data-more="settings"]')?.addEventListener("click",()=>{baseSetRoute("settings");setTimeout(()=>document.querySelector("#dash-settings")?.click(),0);});
  }
  setRoute=function(r){
    if(r==="courses"){
      localStorage.setItem("forgefit_meals_view","weekshop");
      baseSetRoute("meals");title.textContent="Courses";active("courses");return;
    }
    if(r==="meals"){
      localStorage.setItem("forgefit_meals_view","today");
      baseSetRoute("meals");active("meals");return;
    }
    if(r==="more"){
      route="more";document.body.classList.remove("meals-theme");active("more");renderMore();window.scrollTo({top:0,behavior:"smooth"});return;
    }
    baseSetRoute(r);active(r==="settings"?"settings":r);
  };
})();