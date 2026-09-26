// ForgeLife — repas, courses quotidiennes et liste de la semaine
(function(){
  const PERSON_KEY="forgefit_meals_person";
  const VIEW_KEY="forgefit_meals_view";
  const DUO_START_KEY="forgefit_duo_start";
  const FALLBACK={weekOf:"",generatedAt:"",retailer:"Carrefour France",weeklyEstimateEUR:null,weeklyEstimateRangeEUR:null,estimateNote:"",mealPrepNote:"Le dîner est préparé en 4 portions : dîner pour deux puis déjeuner du lendemain.",days:[],weekShop:[]};
  let data=FALLBACK;
  let loading=true;
  let day=(new Date().getDay()+6)%7;

  const style=document.createElement("style");
  style.textContent=`.tabbar{grid-template-columns:repeat(5,1fr)}.ff-switch{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:#111113;border:1px solid var(--line);padding:5px;border-radius:15px;margin:12px 0}.ff-switch.ff-four{grid-template-columns:repeat(4,1fr)}.ff-switch button{border:0;background:transparent;color:var(--muted);padding:10px 5px;border-radius:11px;font-size:11px}.ff-switch button.active{background:#28282c;color:var(--text)}.ff-days{display:flex;gap:7px;overflow:auto;padding:2px 0 12px}.ff-days button{white-space:nowrap;border:1px solid var(--line);background:#111113;color:var(--muted);padding:9px 12px;border-radius:999px}.ff-days button.active{background:var(--accent);color:#15110b}.ff-meal{padding:14px 0;border-bottom:1px solid var(--line)}.ff-meal:last-child{border-bottom:0}.ff-portions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.ff-portion{padding:11px;border:1px solid var(--line);border-radius:14px;background:#101012;font-size:12px;line-height:1.45}.ff-portion b{display:block;color:var(--accent2);margin-bottom:4px}.ff-shop{display:flex;align-items:center;gap:11px;padding:12px 0;border-bottom:1px solid var(--line)}.ff-shop input{width:23px;height:23px;accent-color:var(--accent)}.ff-shop.done span{text-decoration:line-through;color:var(--muted)}.ff-week{padding:12px 0;border-bottom:1px solid var(--line)}.ff-price{font-size:30px;font-weight:850}.ff-budget{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.ff-budget>div{padding:13px;border:1px solid var(--line);border-radius:16px;background:#101012}.ff-budget b{display:block;font-size:20px}.ff-budget span{font-size:11px;color:var(--muted)}@media(max-width:420px){.ff-portions,.ff-budget{grid-template-columns:1fr}.tab small{font-size:9px}.ff-switch.ff-four{grid-template-columns:1fr 1fr}}`;
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
  function dayView(){const d=data.days[day];if(!d)return `<div class="empty">Menu indisponible.</div>`;return `<section class="card"><div class="row"><div><div class="eyebrow">MENU DU JOUR</div><h2 style="margin-top:5px">${d.name}</h2></div><span class="pill">Dîner ≈ 21 h</span></div>${budgetCard(d)}${meal("DÉJEUNER",d.lunch)}${meal("COLLATION OPTIONNELLE",d.snack)}${meal("DÎNER",d.dinner)}<div class="notice" style="margin-top:14px"><b>Gain de temps :</b> prépare le dîner en 4 portions. Deux portions ce soir, les deux autres pour le déjeuner de demain.</div></section>`;}
  function weekView(){return `<section class="card"><div class="row"><div><div class="eyebrow">MENU 7 JOURS</div><h2 style="margin:6px 0">La semaine</h2></div><span class="pill">Carrefour ${euro(data.weeklyEstimateEUR)}</span></div><p class="muted small">${data.mealPrepNote||""}</p>${data.days.map((d,i)=>`<div class="ff-week"><div class="row"><b>${d.name}</b><button class="ghost" data-open="${i}">Voir</button></div><div class="small muted" style="margin-top:5px">Midi : ${d.lunch?.[0]||"—"}<br>Soir : ${d.dinner?.[0]||"—"}<br><span style="color:var(--accent2)">Courses : ${euro(d.estimateEUR)}</span></div></div>`).join("")}<div class="notice" style="margin-top:14px">${data.estimateNote||"Prix indicatifs."}</div></section>`;}
  function shopView(){const d=data.days[day],done=readShop(day);if(!d)return"";return `<section class="card"><div class="row"><div><div class="eyebrow">COURSES DU JOUR</div><h2 style="margin-top:5px">${d.name}</h2></div><span class="pill">${done.length}/${d.shop.length}</span></div><div class="ff-price">${euro(d.estimateEUR)}</div><p class="muted small">Pour le dîner + le déjeuner du lendemain, et la collation. Estimation Carrefour.</p>${d.shop.map((x,i)=>`<label class="ff-shop ${done.includes(i)?"done":""}"><input type="checkbox" data-shop="${i}" ${done.includes(i)?"checked":""}><span>${x}</span></label>`).join("")}<button class="ghost full" id="reset-shop" style="margin-top:12px">Réinitialiser la journée</button></section>`;}
  function weekShopView(){const done=readWeekShop(),items=data.weekShop||[],r=data.weeklyEstimateRangeEUR;return `<section class="card"><div class="row"><div><div class="eyebrow">COURSES DE LA SEMAINE</div><h2 style="margin-top:5px">Tout acheter d’un coup</h2></div><span class="pill">${done.length}/${items.length}</span></div><div class="ff-price">${euro(data.weeklyEstimateEUR)}</div><p class="muted small">Estimation Carrefour${r?` · fourchette ${r[0]}–${r[1]} €`:""}. Les produits sont regroupés pour les 7 jours.</p>${items.map((x,i)=>`<label class="ff-shop ${done.includes(i)?"done":""}"><input type="checkbox" data-week-shop="${i}" ${done.includes(i)?"checked":""}><span>${x}</span></label>`).join("")}<button class="ghost full" id="reset-week-shop" style="margin-top:12px">Réinitialiser la semaine</button></section>`;}

  function renderMeals(){
    if(loading){view.innerHTML=`<section class="card hero"><div class="eyebrow">FORGELIFE DUO</div><div class="hero-title">Repas & courses</div><p class="muted">Chargement du menu de la semaine…</p></section>`;return;}
    const v=getView();
    view.innerHTML=`<section class="card hero"><div class="eyebrow">FORGELIFE DUO</div><div class="hero-title">Repas & courses</div><p class="muted">Menu simple, dîner cuisiné en double pour le déjeuner du lendemain.</p>${selectors()}</section>${days()}${v==="today"?dayView():v==="week"?weekView():v==="shop"?shopView():weekShopView()}<section class="card"><div class="eyebrow">ACCÈS DUO</div><h3 style="margin-top:6px">Partager ForgeLife à Anaïs</h3><p class="muted small">Repas et listes de courses partagées. Les courses se synchronisent entre vos deux téléphones.</p><button class="primary full" id="share-duo">Partager le lien</button></section>`;
    view.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{localStorage.setItem(PERSON_KEY,b.dataset.p);renderMeals();});
    view.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{localStorage.setItem(VIEW_KEY,b.dataset.v);renderMeals();});
    view.querySelectorAll("[data-day]").forEach(b=>b.onclick=()=>{day=+b.dataset.day;renderMeals();});
    view.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{day=+b.dataset.open;localStorage.setItem(VIEW_KEY,"today");renderMeals();});
    view.querySelectorAll("[data-shop]").forEach(c=>c.onchange=()=>{let a=readShop(day),i=+c.dataset.shop;a=c.checked?[...new Set([...a,i])]:a.filter(x=>x!==i);localStorage.setItem(shopKey(day),JSON.stringify(a));renderMeals();});
    view.querySelectorAll("[data-week-shop]").forEach(c=>c.onchange=()=>{let a=readWeekShop(),i=+c.dataset.weekShop;a=c.checked?[...new Set([...a,i])]:a.filter(x=>x!==i);localStorage.setItem(weekShopKey(),JSON.stringify(a));renderMeals();});
    view.querySelector("#reset-shop")?.addEventListener("click",()=>{localStorage.removeItem(shopKey(day));renderMeals();});
    view.querySelector("#reset-week-shop")?.addEventListener("click",()=>{localStorage.removeItem(weekShopKey());renderMeals();});
  }

  async function loadWeekly(){
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
