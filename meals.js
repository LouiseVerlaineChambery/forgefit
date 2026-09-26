// Denat Life — repas, courses quotidiennes et liste de la semaine
(function(){
  const PERSON_KEY="forgefit_meals_person";
  const VIEW_KEY="forgefit_meals_view";
  const DUO_START_KEY="forgefit_duo_start";
  const FALLBACK={weekOf:"",generatedAt:"",retailer:"Carrefour France",weeklyEstimateEUR:null,weeklyEstimateRangeEUR:null,estimateNote:"",mealPrepNote:"Le dîner est préparé en 4 portions : dîner pour deux puis le même repas au repas du midi du lendemain.",days:[],weekShop:[]};
  let data=FALLBACK;
  let loading=true;
  let day=(new Date().getDay()+6)%7;

  const style=document.createElement("style");
  style.textContent=`.tabbar{grid-template-columns:repeat(5,1fr)}.ff-switch{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:#111113;border:1px solid var(--line);padding:5px;border-radius:15px;margin:12px 0}.ff-switch.ff-four{grid-template-columns:repeat(4,1fr)}.ff-switch button{border:0;background:transparent;color:var(--muted);padding:10px 5px;border-radius:11px;font-size:11px}.ff-switch button.active{background:#28282c;color:var(--text)}.ff-days{display:flex;gap:7px;overflow:auto;padding:2px 0 12px}.ff-days button{white-space:nowrap;border:1px solid var(--line);background:#111113;color:var(--muted);padding:9px 12px;border-radius:999px}.ff-days button.active{background:var(--accent);color:#15110b}.ff-meal{padding:14px 0;border-bottom:1px solid var(--line)}.ff-meal:last-child{border-bottom:0}.ff-portions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.ff-portion{padding:11px;border:1px solid var(--line);border-radius:14px;background:#101012;font-size:12px;line-height:1.45}.ff-portion b{display:block;color:var(--accent2);margin-bottom:4px}.ff-shop{display:flex;align-items:center;gap:11px;padding:12px 0;border-bottom:1px solid var(--line)}.ff-shop input{width:23px;height:23px;accent-color:var(--accent)}.ff-shop.done span{text-decoration:line-through;color:var(--muted)}.ff-week{padding:12px 0;border-bottom:1px solid var(--line)}.ff-price{font-size:30px;font-weight:850}.ff-budget{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.ff-budget>div{padding:13px;border:1px solid var(--line);border-radius:16px;background:#101012}.ff-budget b{display:block;font-size:20px}.ff-budget span{font-size:11px;color:var(--muted)}.ff-meal-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0 4px}.ff-meal-actions button{padding:11px 8px;font-size:12px}.ff-recipe-open{margin-top:12px}.ff-shop-cat{font-size:11px;letter-spacing:.13em;font-weight:850;color:var(--accent);padding:18px 0 5px;border-bottom:1px solid var(--line)}.ff-recipe-modal{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.68);display:flex;align-items:flex-end;justify-content:center;padding:18px}.ff-recipe-card{width:min(620px,100%);max-height:88vh;overflow:auto;background:#171719;border:1px solid #303035;border-radius:24px 24px 18px 18px;padding:20px;box-shadow:0 24px 70px rgba(0,0,0,.4)}.ff-recipe-meta{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0 16px}.ff-recipe-list{margin:8px 0 0;padding-left:20px}.ff-recipe-list li{margin:8px 0;line-height:1.45}.ff-recipe-steps{counter-reset:recipe}.ff-recipe-step{display:grid;grid-template-columns:30px 1fr;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);line-height:1.45}.ff-recipe-step:before{counter-increment:recipe;content:counter(recipe);width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:#17120b;font-weight:850}.ff-dinner-meta{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 2px}.ff-pref-list{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.ff-pref-chip{border:1px solid var(--line);background:transparent;color:var(--text);padding:8px 10px;border-radius:999px;font-size:11px}.ff-pref-empty{font-size:12px;color:var(--muted);margin-top:8px}@media(max-width:420px){.ff-portions,.ff-budget{grid-template-columns:1fr}.tab small{font-size:9px}.ff-switch.ff-four{grid-template-columns:1fr 1fr}}`;
  document.head.appendChild(style);

  const getPerson=()=>localStorage.getItem(PERSON_KEY)||"both";
  const getView=()=>localStorage.getItem(VIEW_KEY)||"today";
  function weekMonday(){const n=new Date(),cur=(n.getDay()+6)%7,m=new Date(n.getFullYear(),n.getMonth(),n.getDate()-cur);return `${m.getFullYear()}-${m.getMonth()+1}-${m.getDate()}`;}
  function dateKey(i){const n=new Date(),cur=(n.getDay()+6)%7,m=new Date(n.getFullYear(),n.getMonth(),n.getDate()-cur+i);return `${m.getFullYear()}-${m.getMonth()+1}-${m.getDate()}`;}
  const shopKey=i=>`forgefit_shop_${dateKey(i)}`;
  const weekShopKey=()=>`forgelife_week_shop_${weekMonday()}`;
  function readShop(i){try{return JSON.parse(localStorage.getItem(shopKey(i))||"[]");}catch(e){return[];}}
  function readWeekShop(){try{return JSON.parse(localStorage.getItem(weekShopKey())||"[]");}catch(e){return[];}}
  function euro(v){return Number.isFinite(+v)?`≈ ${Math.round(+v)} €`:"—";}
  function portion(x){const p=getPerson();if(p==="p1")return `<div class="ff-portion"><b>Jocelyn</b>${x[1]}</div>`;if(p==="p2")return `<div class="ff-portion"><b>Anaïs</b>${x[2]}</div>`;return `<div class="ff-portions"><div class="ff-portion"><b>Jocelyn</b>${x[1]}</div><div class="ff-portion"><b>Anaïs</b>${x[2]}</div></div>`;}
  function meal(label,x){if(!x)return"";return `<div class="ff-meal"><div class="eyebrow">${label}</div><h3 style="margin-top:6px">${x[0]}</h3>${portion(x)}</div>`;}
  function selectors(){const p=getPerson(),v=getView();return `<div class="ff-switch"><button data-p="both" class="${p==="both"?"active":""}">Nous deux</button><button data-p="p1" class="${p==="p1"?"active":""}">Jocelyn</button><button data-p="p2" class="${p==="p2"?"active":""}">Anaïs</button></div><div class="ff-switch ff-four"><button data-v="today" class="${v==="today"?"active":""}">Repas</button><button data-v="week" class="${v==="week"?"active":""}">Semaine</button><button data-v="shop" class="${v==="shop"?"active":""}">Courses jour</button><button data-v="weekshop" class="${v==="weekshop"?"active":""}">Courses semaine</button></div>`;}
  function days(){return `<div class="ff-days">${data.days.map((d,i)=>`<button data-day="${i}" class="${i===day?"active":""}">${d.name}</button>`).join("")}</div>`;}
  function budgetCard(d){const r=data.weeklyEstimateRangeEUR;return `<div class="ff-budget"><div><b>${euro(d?.estimateEUR)}</b><span>courses estimées du jour</span></div><div><b>${euro(data.weeklyEstimateEUR)}</b><span>semaine Carrefour${r?` · env. ${r[0]}–${r[1]} €`:""}</span></div></div>`;}
  function dayView(){const d=data.days[day];if(!d)return `<div class="empty">Menu indisponible.</div>`;return `<section class="card"><div class="row"><div><div class="eyebrow">MENU DU JOUR</div><h2 style="margin-top:5px">${d.name}</h2></div><span class="pill">Dîner ≈ 21 h</span></div>${budgetCard(d)}${meal("PETIT-DÉJEUNER EXPRESS · OPTIONNEL",d.breakfast)}${meal("REPAS DU MIDI",d.lunch)}${meal("COLLATION OPTIONNELLE",d.snack)}${meal("DÎNER",d.dinner)}<div class="ff-dinner-meta"><span class="pill">${d.dinnerCategory||"Cuisine du quotidien"}</span><span class="pill">≈ ${d.dinnerMinutes||"—"} min</span>${d.dinnerFavorite?`<span class="pill">♥ Favori</span>`:""}</div><button class="primary full ff-recipe-open" data-recipe="${d.dinnerId}">Voir la recette</button><div class="ff-meal-actions"><button class="secondary" data-replace-meal="${day}">↻ Remplacer</button><button class="secondary" data-quick-meal="${day}">⚡ Rapide ce soir</button><button class="ghost" data-favorite-meal="${day}">${d.dinnerFavorite?"♥ Retirer favori":"♡ Favori"}</button><button class="ghost" data-dislike-meal="${day}">⊘ On n’aime pas</button></div><div class="notice" style="margin-top:14px"><b>Gain de temps :</b> prépare le dîner en 4 portions. Deux portions ce soir, les deux autres pour le repas du midi de demain.</div><p class="muted small" style="margin-bottom:0">Le petit-déjeuner reste optionnel : il est surtout là pour répartir facilement l’énergie et les protéines, sans cuisine le matin.</p></section>`;}
  function weekView(){return `<section class="card"><div class="row"><div><div class="eyebrow">MENU 7 JOURS</div><h2 style="margin:6px 0">La semaine</h2></div><span class="pill">Carrefour ${euro(data.weeklyEstimateEUR)}</span></div><p class="muted small">${data.mealPrepNote||""}</p>${data.days.map((d,i)=>`<div class="ff-week"><div class="row"><b>${d.name}</b><button class="ghost" data-open="${i}">Voir</button></div><div class="small muted" style="margin-top:5px">Petit-déj express : ${d.breakfast?.[0]||"—"}<br>Repas du midi : ${d.lunch?.[0]||"—"}<br>Soir : ${d.dinner?.[0]||"—"}<br><span style="color:var(--accent2)">Courses : ${euro(d.estimateEUR)}</span></div></div>`).join("")}<div class="notice" style="margin-top:14px">${data.estimateNote||"Prix indicatifs."}</div></section>`;}
  function shopView(){const d=data.days[day],done=readShop(day);if(!d)return"";return `<section class="card"><div class="row"><div><div class="eyebrow">COURSES DU JOUR</div><h2 style="margin-top:5px">${d.name}</h2></div><span class="pill">${done.length}/${d.shop.length}</span></div><div class="ff-price">${euro(d.estimateEUR)}</div><p class="muted small">Pour le petit-déjeuner express, le dîner, le repas du midi du lendemain et la collation. Estimation Carrefour.</p>${d.shop.map((x,i)=>`<label class="ff-shop ${done.includes(i)?"done":""}"><input type="checkbox" data-shop="${i}" ${done.includes(i)?"checked":""}><span>${x}</span></label>`).join("")}<button class="ghost full" id="reset-shop" style="margin-top:12px">Réinitialiser la journée</button></section>`;}
  function weekShopView(){const done=readWeekShop(),items=data.weekShop||[],cats=data.weekShopCategories||[],r=data.weeklyEstimateRangeEUR;let lastCat="";const rows=items.map((x,i)=>{const cat=cats[i]||"Courses";const head=cat!==lastCat?`<div class="ff-shop-cat">${cat}</div>`:"";lastCat=cat;return `${head}<label class="ff-shop ${done.includes(i)?"done":""}"><input type="checkbox" data-week-shop="${i}" ${done.includes(i)?"checked":""}><span>${x}</span></label>`;}).join("");return `<section class="card"><div class="row"><div><div class="eyebrow">COURSES DE LA SEMAINE</div><h2 style="margin-top:5px">Tout acheter d’un coup</h2></div><span class="pill">${done.length}/${items.length}</span></div><div class="ff-price">${euro(data.weeklyEstimateEUR)}</div><p class="muted small">Estimation Carrefour${r?` · fourchette ${r[0]}–${r[1]} €`:""}. Les quantités identiques sont additionnées et les produits regroupés par rayon.</p>${rows}<button class="ghost full" id="reset-week-shop" style="margin-top:12px">Réinitialiser la semaine</button></section>`;}

  function showRecipe(id){
    const r=window.DenatMealEngine?.getRecipe?.(id);if(!r)return;
    document.querySelector(".ff-recipe-modal")?.remove();
    const modal=document.createElement("div");modal.className="ff-recipe-modal";
    modal.innerHTML=`<div class="ff-recipe-card"><div class="row"><div><div class="eyebrow">RECETTE · 4 PORTIONS</div><h2 style="margin:6px 0">${r.title}</h2></div><button class="ghost" data-close-recipe>Fermer</button></div><div class="ff-recipe-meta"><span class="pill">${r.category}</span><span class="pill">Prépa ${r.prep} min</span><span class="pill">Cuisson ${r.cook} min</span><span class="pill">Total ≈ ${r.total} min</span></div><div class="notice"><b>Organisation :</b> 2 portions ce soir + 2 portions pour le repas du midi suivant.</div><h3 style="margin:18px 0 6px">Ingrédients</h3><ul class="ff-recipe-list">${r.ingredients.map(x=>`<li>${x}</li>`).join("")}</ul><h3 style="margin:20px 0 6px">Préparation</h3><div class="ff-recipe-steps">${r.steps.map(x=>`<div class="ff-recipe-step"><div>${x}</div></div>`).join("")}</div><div class="ff-portions" style="margin-top:16px"><div class="ff-portion"><b>Jocelyn</b>${r.p1}</div><div class="ff-portion"><b>Anaïs</b>${r.p2}</div></div><button class="ghost full" data-recipe-favorite="${r.id}" style="margin-top:14px">${r.favorite?"♥ Retirer des favoris":"♡ Ajouter aux favoris"}</button><p class="muted small" style="margin-bottom:0;margin-top:14px">Pour les restes : refroidir rapidement, conserver au réfrigérateur et réchauffer complètement avant de servir.</p></div>`;
    document.body.appendChild(modal);
    const close=()=>modal.remove();
    modal.querySelector("[data-close-recipe]")?.addEventListener("click",close);
    modal.querySelector("[data-recipe-favorite]")?.addEventListener("click",e=>{window.DenatMealEngine?.toggleFavorite?.(e.currentTarget.dataset.recipeFavorite);data=DenatMealEngine.generate();close();renderMeals();});
    modal.addEventListener("click",e=>{if(e.target===modal)close();});
  }

  function preferencesCard(){
    const p=window.DenatMealEngine?.preferences?.()||{favorites:[],dislikes:[]};
    const fav=p.favorites.length?p.favorites.map(x=>`<button class="ff-pref-chip" data-unfav="${x.id}">♥ ${x.title}</button>`).join(""):`<div class="ff-pref-empty">Aucun favori pour le moment.</div>`;
    const bad=p.dislikes.length?p.dislikes.map(x=>`<button class="ff-pref-chip" data-restore="${x.id}">↺ ${x.title}</button>`).join(""):`<div class="ff-pref-empty">Aucun plat refusé.</div>`;
    return `<section class="card"><div class="eyebrow">NOS PRÉFÉRENCES</div><h3 style="margin:6px 0">Favoris & plats refusés</h3><p class="muted small">Les favoris reviennent un peu plus souvent. Un plat refusé disparaît des prochaines semaines.</p><div class="small"><b>Favoris</b></div><div class="ff-pref-list">${fav}</div><div class="small" style="margin-top:16px"><b>Plats refusés · toucher pour réautoriser</b></div><div class="ff-pref-list">${bad}</div></section>`;
  }

  function renderMeals(){
    if(loading){view.innerHTML=`<section class="card hero"><div class="eyebrow">DENAT LIFE</div><div class="hero-title">Repas & courses</div><p class="muted">Chargement du menu de la semaine…</p></section>`;return;}
    const v=getView();
    view.innerHTML=`<section class="card hero"><div class="eyebrow">DENAT LIFE</div><div class="hero-title">Repas & courses</div><p class="muted">Menu de la semaine · recettes détaillées · dîner cuisiné en double pour le repas du midi du lendemain.</p>${selectors()}</section>${days()}${v==="today"?dayView():v==="week"?weekView():v==="shop"?shopView():weekShopView()}${v==="week"?preferencesCard():""}`;
    view.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{localStorage.setItem(PERSON_KEY,b.dataset.p);renderMeals();});
    view.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{localStorage.setItem(VIEW_KEY,b.dataset.v);renderMeals();});
    view.querySelectorAll("[data-day]").forEach(b=>b.onclick=()=>{day=+b.dataset.day;renderMeals();});
    view.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{day=+b.dataset.open;localStorage.setItem(VIEW_KEY,"today");renderMeals();});
    view.querySelectorAll("[data-recipe]").forEach(b=>b.onclick=()=>showRecipe(b.dataset.recipe));
    view.querySelectorAll("[data-replace-meal]").forEach(b=>b.onclick=()=>{const i=+b.dataset.replaceMeal;if(window.DenatMealEngine){data=DenatMealEngine.replace(i,data.days[i]?.dinnerId);renderMeals();}});
    view.querySelectorAll("[data-quick-meal]").forEach(b=>b.onclick=()=>{const i=+b.dataset.quickMeal;if(window.DenatMealEngine){data=DenatMealEngine.replaceQuick(i,data.days[i]?.dinnerId);renderMeals();}});
    view.querySelectorAll("[data-favorite-meal]").forEach(b=>b.onclick=()=>{const i=+b.dataset.favoriteMeal;if(window.DenatMealEngine){DenatMealEngine.toggleFavorite(data.days[i]?.dinnerId);data=DenatMealEngine.generate();renderMeals();}});
    view.querySelectorAll("[data-unfav]").forEach(b=>b.onclick=()=>{DenatMealEngine.toggleFavorite(b.dataset.unfav);data=DenatMealEngine.generate();renderMeals();});
    view.querySelectorAll("[data-restore]").forEach(b=>b.onclick=()=>{data=DenatMealEngine.restoreDislike(b.dataset.restore);renderMeals();});
    view.querySelectorAll("[data-dislike-meal]").forEach(b=>b.onclick=()=>{const i=+b.dataset.dislikeMeal;if(window.DenatMealEngine){data=DenatMealEngine.dislike(i,data.days[i]?.dinnerId);renderMeals();}});
    view.querySelectorAll("[data-shop]").forEach(c=>c.onchange=()=>{let a=readShop(day),i=+c.dataset.shop;a=c.checked?[...new Set([...a,i])]:a.filter(x=>x!==i);localStorage.setItem(shopKey(day),JSON.stringify(a));renderMeals();});
    view.querySelectorAll("[data-week-shop]").forEach(c=>c.onchange=()=>{let a=readWeekShop(),i=+c.dataset.weekShop;a=c.checked?[...new Set([...a,i])]:a.filter(x=>x!==i);localStorage.setItem(weekShopKey(),JSON.stringify(a));renderMeals();});
    view.querySelector("#reset-shop")?.addEventListener("click",()=>{localStorage.removeItem(shopKey(day));renderMeals();});
    view.querySelector("#reset-week-shop")?.addEventListener("click",()=>{localStorage.removeItem(weekShopKey());renderMeals();});
  }

  async function loadWeekly(){
    if(window.DenatMealEngine){
      data=DenatMealEngine.generate();
      loading=false;
      if(route==="meals")renderMeals();
      return;
    }
    try{
      const r=await fetch(`weekly-menu.json?v=${Date.now()}`,{cache:"no-store"});
      if(!r.ok)throw new Error("menu");
      const d=await r.json();
      if(Array.isArray(d.days)&&d.days.length===7)data=d;
    }catch(e){}
    loading=false;
    if(route==="meals")renderMeals();
  }

  const baseRender=render;
  render=function(){if(route==="meals"){title.textContent="Repas & courses";renderMeals();return;}baseRender();};
  const q=new URLSearchParams(location.search);
  if(q.get("duo")==="1"){localStorage.setItem(PERSON_KEY,"p2");localStorage.setItem(DUO_START_KEY,"1");}
  loadWeekly();
  if(q.get("view")==="meals"||localStorage.getItem(DUO_START_KEY)==="1")setRoute("meals");
})();
