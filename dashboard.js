// Denat Life — tableau de bord "Nous"
(function(){
  const baseRenderSettings=renderSettings;

  const style=document.createElement("style");
  style.textContent=`
    .dl-dash-hero{padding:20px!important}
    .dl-date{font-size:12px;color:var(--muted);margin-top:4px}
    .dl-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .dl-tile{padding:15px;border:1px solid var(--line);border-radius:18px;background:#111113}
    .dl-tile .dl-big{font-size:22px;font-weight:850;color:var(--accent2);margin-top:5px}
    .dl-tile .dl-label{font-size:10px;letter-spacing:.12em;color:var(--muted);font-weight:800}
    .dl-meal-title{font-size:21px;line-height:1.18;font-weight:820;margin:7px 0 5px}
    .dl-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
    .dl-progress{height:8px;border-radius:999px;background:#29292d;overflow:hidden;margin-top:10px}
    .dl-progress>span{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:999px}
    .dl-duo{display:flex;align-items:center;gap:9px}
    .dl-dot{width:9px;height:9px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px rgba(214,164,91,.10)}
    .dl-link{cursor:pointer}
    @media(max-width:420px){.dl-grid,.dl-actions{grid-template-columns:1fr 1fr}.dl-meal-title{font-size:19px}}
  `;
  document.head.appendChild(style);

  function monday(){
    const n=new Date(),cur=(n.getDay()+6)%7;
    return new Date(n.getFullYear(),n.getMonth(),n.getDate()-cur);
  }
  function weekKey(){
    const m=monday();
    return `${m.getFullYear()}-${m.getMonth()+1}-${m.getDate()}`;
  }
  function readArray(key){try{const x=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(x)?x:[];}catch(e){return[];}}
  function weekSessions(){
    const start=monday().getTime(),end=start+7*86400000;
    return state.sessions.filter(s=>{const t=new Date(s.endedAt).getTime();return t>=start&&t<end;});
  }
  function lastSession(){
    return [...state.sessions].filter(s=>s.endedAt).sort((a,b)=>new Date(b.endedAt)-new Date(a.endedAt))[0]||null;
  }
  function fmtDay(){
    return new Intl.DateTimeFormat("fr-FR",{weekday:"long",day:"numeric",month:"long"}).format(new Date()).replace(/^./,x=>x.toUpperCase());
  }
  function escDash(s=""){return typeof esc==="function"?esc(s):String(s);}
  function mealData(){try{return window.DenatMealEngine?.generate?.()||null;}catch(e){return null;}}

  renderSettings=function(){
    title.textContent="Nous";
    const meals=mealData();
    const di=(new Date().getDay()+6)%7;
    const today=meals?.days?.[di];
    const tonight=today?.dinner?.[0]||"Menu du soir à préparer";
    const tomorrowLunch=tonight ? `${tonight} — restes` : "Restes du dîner";
    const done=readArray(`forgelife_week_shop_${weekKey()}`).length;
    const total=meals?.weekShop?.length||0;
    const remaining=Math.max(0,total-done);
    const weekly=weekSessions();
    const goal=3;
    const pct=Math.min(100,Math.round(weekly.length/goal*100));
    const next=state.program?.[typeof nextWorkoutIndex==="function"?nextWorkoutIndex():0];
    const last=lastSession();
    const repriseDone=state.sessions.filter(s=>String(s.workoutName||"").startsWith("Reprise ")).length;
    const sportPhase=state.reprise?.enabled?`Reprise · ${Math.min(repriseDone,6)}/6`:state.reprise?.completed?"Programme esthétique":"Programme actif";

    view.innerHTML=`
      <section class="card hero dl-dash-hero">
        <div class="dl-brand-hero"><img src="brand-logo-v5.svg?v=12.4" alt="Denat Life"><div><div class="dl-brand-name">DENAT LIFE</div><div class="dl-brand-sub">SPORT · NUTRITION · ÉQUILIBRE</div></div></div>
        <div class="hero-title" style="margin-top:18px">Bonjour 👋</div>
        <div class="dl-date">${fmtDay()}</div>
        <p class="muted" style="margin-bottom:0">Votre journée, en un coup d’œil.</p>
      </section>

      <section class="card">
        <div class="row"><div><div class="eyebrow">CE SOIR</div><div class="dl-meal-title">${escDash(tonight)}</div></div><span class="pill">≈ 21 h</span></div>
        <p class="muted small">Préparé en double pour simplifier le repas du midi suivant.</p>
        <div class="dl-actions"><button class="primary" id="dash-meal">Voir le repas</button><button class="ghost" id="dash-week">Voir la semaine</button></div>
      </section>

      <section class="card">
        <div class="eyebrow">DEMAIN MIDI</div>
        <h3 style="margin:7px 0 4px">${escDash(tomorrowLunch)}</h3>
        <p class="muted small" style="margin-bottom:0">Déjà prévu grâce au dîner de ce soir.</p>
      </section>

      <div class="dl-grid">
        <section class="dl-tile dl-link" id="dash-sport">
          <div class="dl-label">SPORT</div>
          <div class="dl-big">${weekly.length}/${goal}</div>
          <div class="small muted">séances cette semaine</div>
          <div class="dl-progress"><span style="width:${pct}%"></span></div>
        </section>
        <section class="dl-tile dl-link" id="dash-shop">
          <div class="dl-label">COURSES</div>
          <div class="dl-big">${remaining}</div>
          <div class="small muted">article${remaining>1?"s":""} restant${remaining>1?"s":""}</div>
        </section>
      </div>

      <section class="card">
        <div class="row"><div><div class="eyebrow">PROCHAINE SÉANCE</div><h3 style="margin:6px 0">${escDash(next?.name||"À définir")}</h3></div><span class="pill">${escDash(sportPhase)}</span></div>
        <p class="muted small">${last?`Dernière séance : ${escDash(last.workoutName)} · ${fmtDate(last.endedAt)}`:"Première séance à venir."}</p>
        <div class="dl-actions"><button class="primary" id="dash-start">Aller au Sport</button><button class="ghost" id="dash-progress">Progression</button></div>
      </section>

      <section class="card">
        <div class="row"><div><div class="eyebrow">COURSES DE LA SEMAINE</div><h3 style="margin:6px 0">${remaining} / ${total} à acheter</h3></div><span class="pill">${meals?.weeklyEstimateEUR?`≈ ${Math.round(meals.weeklyEstimateEUR)} €`:"Budget —"}</span></div>
        <p class="muted small">Liste consolidée à partir des repas de la semaine.</p>
        <button class="secondary full" id="dash-shop-list">Ouvrir la liste de courses</button>
      </section>

      <section class="card">
        <div class="eyebrow">DENAT LIFE</div>
        <h3 style="margin:6px 0">Réglages & sauvegarde</h3>
        <p class="muted small">Progression, export des séances et paramètres techniques restent accessibles ici.</p>
        <button class="ghost full" id="dash-settings">Ouvrir les réglages</button>
      </section>`;

    const goMeals=(v)=>{localStorage.setItem("forgefit_meals_view",v);setRoute("meals");};
    view.querySelector("#dash-meal")?.addEventListener("click",()=>goMeals("today"));
    view.querySelector("#dash-week")?.addEventListener("click",()=>goMeals("week"));
    view.querySelector("#dash-shop")?.addEventListener("click",()=>goMeals("weekshop"));
    view.querySelector("#dash-shop-list")?.addEventListener("click",()=>goMeals("weekshop"));
    view.querySelector("#dash-duo")?.addEventListener("click",()=>goMeals("today"));
    view.querySelector("#dash-sport")?.addEventListener("click",()=>setRoute("today"));
    view.querySelector("#dash-start")?.addEventListener("click",()=>setRoute("today"));
    view.querySelector("#dash-progress")?.addEventListener("click",()=>setRoute("history"));
    view.querySelector("#dash-settings")?.addEventListener("click",()=>{
      title.textContent="Réglages";
      baseRenderSettings();
      window.scrollTo({top:0,behavior:"smooth"});
    });
  };
})();