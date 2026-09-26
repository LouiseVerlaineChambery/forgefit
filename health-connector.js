// Denat Life — assistant de connexion Apple Santé via Raccourcis.
(function(){
  const METRICS=[
    {key:"sleepHours",label:"Sommeil",unit:"h",mode:"durée totale",when:"au réveil",tip:"Sommeil de la nuit précédente → durée totale en heures."},
    {key:"steps",label:"Pas",unit:"pas",mode:"somme",when:"soir",tip:"Échantillons Pas d’aujourd’hui → somme."},
    {key:"restingHeartRate",label:"FC au repos",unit:"bpm",mode:"dernière / moyenne",when:"au réveil",tip:"Fréquence cardiaque au repos récente → valeur la plus récente."},
    {key:"hrvMs",label:"VFC",unit:"ms",mode:"moyenne",when:"au réveil",tip:"Variabilité de fréquence cardiaque récente → moyenne en ms."},
    {key:"activeEnergyKcal",label:"Énergie active",unit:"kcal",mode:"somme",when:"soir",tip:"Énergie active d’aujourd’hui → somme."},
    {key:"exerciseMinutes",label:"Exercice",unit:"min",mode:"somme",when:"soir",tip:"Minutes d’exercice d’aujourd’hui → somme."},
    {key:"weightKg",label:"Poids",unit:"kg",mode:"dernière",when:"si disponible",tip:"Poids → dernier échantillon disponible."}
  ];
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const fmt=x=>new Intl.DateTimeFormat("fr-FR",{dateStyle:"short",timeStyle:"short"}).format(new Date(x));
  function view(){
    return `<section class="card dl-health-connect">
      <div class="row"><div><div class="eyebrow">APPLE SANTÉ · CONNECTEUR</div><h3 style="margin:6px 0">Denat Life Santé</h3></div><span class="pill" id="dlhc-status">Vérification…</span></div>
      <p class="muted small">Le connecteur est volontairement complet : 7 mesures, historique et références personnelles. Une fois le raccourci et ses automatisations créés, l’envoi se fait sans ouvrir Denat Life.</p>
      <div class="dlhc-actions">
        <button class="primary" id="dlhc-copy">1 · Copier la connexion</button>
        <button class="secondary" id="dlhc-create">2 · Créer le raccourci</button>
      </div>
      <div class="notice small" style="margin-top:12px"><b>Connexion simplifiée</b><br>Dans « Obtenir le contenu de l’URL », il n’y a plus qu’un seul en-tête à ajouter : <b>Authorization</b>. L’URL et sa valeur sont copiées par le bouton ci-dessus.</div>
    </section>
    <section class="card">
      <div class="eyebrow">RACCOURCI MAÎTRE</div><h3 style="margin:6px 0 10px">7 blocs indépendants</h3>
      <p class="muted small">Pour chaque mesure : <b>Rechercher les échantillons Santé</b> → calculer la valeur indiquée → <b>Obtenir le contenu de l’URL</b> en POST. Corps de la requête : <b>Formulaire</b> avec <b>metric</b> et <b>value</b>. Si une mesure échoue, les autres continuent d’être exploitables.</p>
      <div class="dlhc-metrics">${METRICS.map(m=>`<div class="dlhc-metric" data-metric="${m.key}"><div><b>${m.label}</b><span>${m.mode} · ${m.when}</span><small>${m.tip}</small></div><button class="ghost" data-copy-metric="${m.key}">Copier le bloc</button></div>`).join("")}</div>
    </section>
    <section class="card">
      <div class="eyebrow">AUTOMATISATION</div><h3 style="margin:6px 0 10px">Deux passages automatiques</h3>
      <div class="dlhc-step"><b>Au réveil</b><span>Sommeil · FC repos · VFC · poids</span></div>
      <div class="dlhc-step"><b>Le soir</b><span>Pas · énergie active · exercice</span></div>
      <p class="muted small">Dans Raccourcis → Automatisation, fais exécuter « Denat Life Santé » au réveil et le soir, puis autorise l’exécution automatique/verrouillée. Le déclencheur « Sommeil → Réveil » peut servir pour le passage du matin.</p>
      <button class="secondary full" id="dlhc-test">Tester ce que Denat Life reçoit</button>
      <div id="dlhc-result" class="small muted" style="margin-top:10px"></div>
    </section>`;
  }
  function copy(text,msg){
    return navigator.clipboard.writeText(text).then(()=>{alert(msg);return true;}).catch(()=>{prompt(msg,text);return false;});
  }
  async function refresh(root=document){
    const pill=root.querySelector("#dlhc-status"),out=root.querySelector("#dlhc-result");
    try{
      const x=await window.DenatCloud?.healthStatus?.();
      if(!x?.connected){if(pill)pill.textContent="À connecter";if(out)out.textContent="Aucune donnée Apple Santé reçue pour le moment.";return;}
      if(pill)pill.textContent="Connecté ✓";
      const s=x.payload?.summary||{},present=METRICS.filter(m=>Number.isFinite(Number(s[m.key])));
      if(out)out.innerHTML=`Dernier envoi : <b>${fmt(x.lastSync)}</b><br>${present.length}/${METRICS.length} mesures reçues : ${present.map(m=>`${esc(m.label)} ${Math.round(Number(s[m.key])*10)/10} ${m.unit}`).join(" · ")||"aucune valeur reconnue"}${x.payload?.daysAvailable? `<br>Historique disponible : ${x.payload.daysAvailable} jour(s).`:""}`;
    }catch{if(pill)pill.textContent="Hors ligne";if(out)out.textContent="Impossible de joindre Denat Life Cloud pour le moment.";}
  }
  function bind(root=document){
    root.querySelector("#dlhc-copy")?.addEventListener("click",()=>{
      const x=window.DenatCloud?.healthConfig?.();if(!x)return;
      copy(`URL : ${x.url}\nAuthorization : ${x.shortcutAuthorization||x.authorization}`,"Connexion Denat Life Santé copiée");
    });
    root.querySelector("#dlhc-create")?.addEventListener("click",()=>{location.href="shortcuts://create-shortcut";});
    root.querySelectorAll("[data-copy-metric]").forEach(b=>b.addEventListener("click",()=>{
      const m=METRICS.find(x=>x.key===b.dataset.copyMetric);if(!m)return;
      copy(`POST · Corps = Formulaire\nmetric = ${m.key}\nvalue = [variable calculée]\nsource = denat-life-shortcut\n\n${m.tip}`,`Bloc ${m.label} copié`);
    }));
    root.querySelector("#dlhc-test")?.addEventListener("click",()=>refresh(root));
    refresh(root);
  }
  const style=document.createElement("style");
  style.textContent=`.dlhc-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.dlhc-metrics{display:grid;gap:8px}.dlhc-metric{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:11px;border:1px solid var(--line);border-radius:14px}.dlhc-metric b,.dlhc-metric span,.dlhc-metric small{display:block}.dlhc-metric span{font-size:11px;color:var(--accent2);margin-top:3px}.dlhc-metric small{font-size:10px;color:var(--muted);margin-top:4px;line-height:1.35}.dlhc-step{padding:10px 0;border-bottom:1px solid var(--line)}.dlhc-step b,.dlhc-step span{display:block}.dlhc-step span{font-size:11px;color:var(--muted);margin-top:3px}@media(max-width:420px){.dlhc-actions{grid-template-columns:1fr}.dlhc-metric{grid-template-columns:1fr}.dlhc-metric button{width:100%}}`;
  document.head.appendChild(style);
  window.DenatHealthConnector={view,bind,refresh,metrics:METRICS};
})();