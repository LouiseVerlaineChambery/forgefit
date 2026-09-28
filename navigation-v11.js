// Denat Life V11 — navigation lifestyle
(function(){
  const baseSetRoute=setRoute;
  function active(name){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.route===name));}
  function cloudLabel(){const s=window.DenatCloud?.status;return s==="cloud"?"Enregistré sur Denat Life Cloud":s==="enregistrement"?"Enregistrement…":s==="hors-ligne"?"Hors ligne · cache local actif":"Connexion…";}
  function renderMore(){
    title.textContent="Plus";
    const isAnais=window.DenatProfile?.is?.("anais");
    view.innerHTML=`
      <section class="card hero">
        <div class="dl-brand-hero"><img src="brand-logo-v5.svg?v=12.5" alt="Denat Life"><div><div class="dl-brand-name">DENAT LIFE</div><div class="dl-brand-sub">SPORT · NUTRITION · ÉQUILIBRE</div></div></div>
      </section>
      <section class="card"><div class="eyebrow">VOTRE ESPACE</div><h2 style="margin:6px 0 14px">Plus</h2><div class="dl-more-grid">
        ${isAnais?`
        <div class="dl-more-item" data-more="coach"><b>Coach repas</b><span>Noter ce que tu as mangé et garder ton journal.</span></div>
        <div class="dl-more-item" data-more="week"><b>Menu 7 jours</b><span>Voir les repas communs de la semaine.</span></div>
        <div class="dl-more-item" data-more="recipes"><b>Catalogue de recettes</b><span>Parcourir toutes les recettes, rechercher et filtrer les plats rapides.</span></div>
        <div class="dl-more-item" data-more="courses"><b>Courses</b><span>Ouvrir la liste commune du foyer.</span></div>
        <div class="dl-more-item" data-more="settings"><b>Réglages</b><span>Profil, sauvegarde et paramètres.</span></div>
        `:`
        <div class="dl-more-item" data-more="program"><b>Programme</b><span>Voir et modifier les séances.</span></div>
        <div class="dl-more-item" data-more="history"><b>Progression</b><span>Historique, charges et statistiques.</span></div>
        <div class="dl-more-item" data-more="settings"><b>Réglages</b><span>Sauvegarde, import et paramètres.</span></div>
        <div class="dl-more-item" data-more="week"><b>Menu 7 jours</b><span>Voir toute la semaine de repas.</span></div>
        `}
      </div></section>
      <section class="card"><div class="row"><div><div class="eyebrow">DONNÉES DENAT LIFE</div><h3 style="margin:6px 0">Votre espace privé</h3></div><span class="pill" id="cloud-pill">${cloudLabel()}</span></div><p class="muted small">Séances, progression, préférences repas et listes de courses sont enregistrées dans votre espace Denat Life. Le téléphone conserve seulement un cache de secours hors connexion.</p><button class="secondary full" id="cloud-share">Connecter un autre appareil</button></section>`;
    view.querySelector('[data-more="program"]')?.addEventListener("click",()=>baseSetRoute("program"));
    view.querySelector('[data-more="coach"]')?.addEventListener("click",()=>{localStorage.setItem("forgefit_meals_view","coach");baseSetRoute("meals");active("meals");});
    view.querySelector('[data-more="courses"]')?.addEventListener("click",()=>{localStorage.setItem("forgefit_meals_view","courses");localStorage.setItem("denat_courses_view","week");baseSetRoute("meals");active("courses");});
    view.querySelector('[data-more="history"]')?.addEventListener("click",()=>baseSetRoute("history"));
    view.querySelector('[data-more="week"]')?.addEventListener("click",()=>{localStorage.setItem("forgefit_meals_view","week");baseSetRoute("meals");active("meals");});
    view.querySelector('[data-more="recipes"]')?.addEventListener("click",()=>{localStorage.setItem("forgefit_meals_view","catalog");baseSetRoute("meals");active("meals");});
    view.querySelector('[data-more="settings"]')?.addEventListener("click",()=>{baseSetRoute("settings");setTimeout(()=>document.querySelector("#dash-settings")?.click(),0);});
    view.querySelector("#cloud-share")?.addEventListener("click",()=>window.DenatCloud?.shareAccess?.());
  }
  window.addEventListener("denat-cloud-status",e=>{const p=document.querySelector("#cloud-pill");if(p)p.textContent=cloudLabel();});
  setRoute=function(r){
    if(r==="courses"){
      localStorage.setItem("forgefit_meals_view","courses");
      if(!localStorage.getItem("denat_courses_view"))localStorage.setItem("denat_courses_view","week");
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
  function personalizeTabs(){
    const isAnais=window.DenatProfile?.is?.("anais")===true;
    const sport=document.querySelector('.tab[data-route="today"]'),meals=document.querySelector('.tab[data-route="meals"]');
    if(sport){sport.querySelector("span").textContent="◇";sport.querySelector("small").textContent=isAnais?"Activité":"Sport";}
    if(meals){meals.querySelector("span").textContent="◫";meals.querySelector("small").textContent="Repas";}
  }
  personalizeTabs();
  // Anaïs arrive d'abord sur les repas ; l'activité reste disponible sans objectif imposé.
  if(window.DenatProfile?.is?.("anais"))setTimeout(()=>setRoute("meals"),0);
})();