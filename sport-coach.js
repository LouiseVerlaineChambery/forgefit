// Denat Life — coach sport intelligent local, basé sur historique + RPE
(function(){
  const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const fmt=n=>{n=+n||0;return Number.isInteger(n)?String(n):n.toFixed(1).replace(".",",");};
  const completed=e=>(e?.sets||[]).filter(s=>s.done);
  const stepFor=ex=>ex.category==="lower"?(+state.settings.lowerIncrement||5):(+state.settings.upperIncrement||2.5);
  const round=(n,step)=>Math.max(0,Math.round(n/step)*step);
  const recovery=()=>window.DenatHealth?.recovery?.()||{fresh:false,band:"unknown",score:null,label:""};
  function recoveryNote(p,last){
    const r=recovery();if(!r.fresh)return p;
    p.recovery=r;
    if(r.band==="low"){
      if(p.level==="up"&&last?.weight){p.weight=last.weight;p.level="hold";}
      p.rpe=p.level==="knee-light"?"5–6":"6–7";
      p.reason=`${r.label} (${r.score}/100) : pas d’augmentation aujourd’hui. ${p.reason}`;
    }else if(r.band==="medium"){
      p.reason=`${r.label} (${r.score}/100) : progression prudente. ${p.reason}`;
    }
    return p;
  }

  function history(name,limit=4){
    return [...state.sessions]
      .filter(s=>s?.endedAt&&s.source!=="nomad")
      .sort((a,b)=>new Date(b.endedAt)-new Date(a.endedAt))
      .map(s=>({session:s,ex:(s.exercises||[]).find(e=>norm(e.name)===norm(name))}))
      .filter(x=>x.ex&&completed(x.ex).length)
      .slice(0,limit);
  }
  function stats(ex){
    const sets=completed(ex);if(!sets.length)return null;
    const weights=sets.map(s=>+s.weight||0).filter(w=>w>0),reps=sets.map(s=>+s.reps||0),rpes=sets.map(s=>+s.rpe).filter(r=>r>0);
    return {sets,weight:weights.length?Math.max(...weights):0,avgWeight:weights.length?weights.reduce((a,b)=>a+b,0)/weights.length:0,avgReps:reps.reduce((a,b)=>a+b,0)/reps.length,minReps:Math.min(...reps),avgRpe:rpes.length?rpes.reduce((a,b)=>a+b,0)/rpes.length:null,rpeCount:rpes.length};
  }
  function sessionPlan(ex){
    const target=+ex.targetReps||10,step=stepFor(ex),h=history(ex.name,4);
    if(state.reprise?.enabled&&ex.lightLower){return recoveryNote({weight:0,reps:target,rpe:"5–6",level:"knee-light",reason:"Bas du corps protégé : poids du corps ou charge symbolique. Pas de progression de charge tant que le genou est sensible.",confidence:"Priorité tolérance du genou"},null);}
    if(state.reprise?.enabled){return recoveryNote({weight:0,reps:target,rpe:"6–7",level:"reprise",reason:"Reprise : choisis une première charge facile. Le coach ajuste les séries suivantes selon ton RPE.",confidence:h.length?"Historique disponible mais volontairement ignoré en reprise":"Nouvelle référence"},h[0]?stats(h[0].ex):null);}
    if(!h.length)return recoveryNote({weight:0,reps:target,rpe:"7–8",level:"new",reason:"Pas encore de référence fiable : démarre avec une charge propre et renseigne ton RPE.",confidence:"À calibrer"},null);
    const last=stats(h[0].ex),prev=h[1]?stats(h[1].ex):null;
    if(!last)return recoveryNote({weight:0,reps:target,rpe:"7–8",level:"new",reason:"Référence insuffisante.",confidence:"À calibrer"},null);
    let weight=last.weight||last.avgWeight||0,reason="Charge maintenue pour consolider la progression.",level="hold";
    const hit=last.minReps>=target,good=last.avgRpe!=null&&last.avgRpe<=8.25,hard=last.avgRpe!=null&&last.avgRpe>=9.25,bigMiss=last.avgReps<target-2;
    if(weight&&hit&&good){weight=round(weight+step,step);level="up";reason=`Dernière séance validée à ${last.avgRpe!=null?`RPE moyen ${last.avgRpe.toFixed(1).replace(".",",")}`:"la cible"} : +${fmt(step)} kg.`;}
    else if(weight&&(hard||bigMiss)){weight=Math.max(step,round(weight-step,step));level="down";reason=hard?"Dernière séance trop proche de l’échec : un cran plus léger pour retrouver de la marge.":"Répétitions nettement sous la cible : un cran plus léger pour valider toutes les séries.";}
    else if(weight&&last.avgRpe==null&&hit){reason="Cible atteinte, mais sans RPE fiable : charge conservée jusqu’à obtenir une meilleure référence.";}
    else if(weight){reason="Garde cette charge et cherche à valider toutes les répétitions avec une technique propre.";}
    if(prev&&weight&&level==="hold"){
      const plateau=Math.abs((prev.weight||0)-(last.weight||0))<.01&&Math.abs(prev.avgReps-last.avgReps)<.6;
      if(plateau&&last.avgRpe!=null&&last.avgRpe<=8.5)reason="Progression stable : garde la charge et essaie d’ajouter 1 répétition sur une série avant d’augmenter.";
    }
    const confidence=h.length>=3&&last.rpeCount?"Confiance élevée":h.length>=2?"Confiance moyenne":"Première référence";
    return recoveryNote({weight,reps:target,rpe:"7–8,5",level,reason,confidence},last);
  }

  function livePlan(ex){
    const target=+ex.targetReps||10,step=stepFor(ex),done=completed(ex),nextIndex=(ex.sets||[]).findIndex(s=>!s.done);
    if(nextIndex<0)return {finished:true,text:"Exercice terminé",reason:"Toutes les séries sont validées."};
    if(state.reprise?.enabled&&ex.lightLower){
      if(!done.length)return {weight:0,reps:target,rpe:"5–6",nextIndex,level:"knee-light",text:`${target} reps · poids du corps / très léger`,reason:"Mouvement contrôlé, amplitude confortable. Le but est de bouger sans chercher la charge."};
      const last=done.at(-1),r=+last.reps||0,rpe=+last.rpe||0;
      const reason=(rpe>=7||r<target-2)?"Réduis l’amplitude, les répétitions ou augmente le repos. Ne compense pas en forçant.":"Tolérance correcte : garde exactement la même charge et la même amplitude.";
      return {weight:0,reps:target,rpe:"5–6",nextIndex,level:rpe>=7?"down":"hold",text:`${target} reps · même charge légère`,reason};
    }
    if(!done.length){const p=sessionPlan(ex);return {...p,nextIndex,text:p.weight?`${fmt(p.weight)} kg × ${p.reps}`:`${p.reps} reps · choisis une charge facile`};}
    const last=done.at(-1),w=+last.weight||0,r=+last.reps||0,rpe=+last.rpe||0;
    let nw=w,reps=target,level="hold",reason="Série dans la cible : conserve la charge.";
    if(!w){return {weight:0,reps:target,rpe:state.reprise?.enabled?"6–7":"7–8,5",nextIndex,level:"new",text:`${target} reps`,reason:"Renseigne une charge pour permettre au coach d’ajuster la suite."};}
    if(rpe>0&&rpe<=6.5&&r>=target){nw=round(w+step,step);level="up";reason=`${r} reps à RPE ${fmt(rpe)} : beaucoup de marge, +${fmt(step)} kg proposé.`;}
    else if(rpe>0&&rpe<=7.5&&r>=target+2){nw=round(w+step,step);level="up";reason=`${r} reps à RPE ${fmt(rpe)} : cible dépassée avec de la marge, +${fmt(step)} kg.`;}
    else if(rpe>=9.5||r<target-2){nw=Math.max(step,round(w-step,step));level="down";reason=rpe>=9.5?`RPE ${fmt(rpe)} : trop proche de l’échec, -${fmt(step)} kg.`:`${r} reps pour ${target} visées : -${fmt(step)} kg pour garder une exécution propre.`;}
    else if(rpe>=9){reason=`RPE ${fmt(rpe)} : garde ${fmt(w)} kg mais n’ajoute pas de charge sur cette série.`;}
    else if(!rpe){reason="RPE manquant : charge conservée. Renseigne le RPE pour un ajustement plus précis.";}
    if(state.reprise?.enabled&&level==="up"&&rpe>6.5){nw=w;level="hold";reason="Mode reprise : charge conservée pour rester autour de RPE 6–7.";}
    const rec=recovery();
    if(rec.fresh&&rec.band==="low"&&level==="up"){nw=w;level="hold";reason=`${rec.label} (${rec.score}/100) : charge conservée malgré la marge sur la série.`;}
    return {weight:nw,reps,rpe:state.reprise?.enabled?"6–7":"7–8,5",nextIndex,level,text:`${fmt(nw)} kg × ${reps}`,reason};
  }

  const baseSuggest=suggestWeight;
  suggestWeight=function(ex){
    if(state.reprise?.enabled)return baseSuggest(ex);
    const p=sessionPlan(ex);return p.weight||baseSuggest(ex);
  };

  const css=document.createElement("style");
  css.textContent=`.dl-coach-card{border:1px solid rgba(214,164,91,.28);background:linear-gradient(145deg,#151413,#101012)}.dl-coach-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.dl-coach-target{font-size:22px;font-weight:850;color:var(--accent2);margin:5px 0}.dl-coach-reason{font-size:12px;line-height:1.45;color:var(--muted)}.dl-coach-badge{font-size:10px;letter-spacing:.08em;border:1px solid var(--line);border-radius:999px;padding:6px 8px;white-space:nowrap}.dl-coach-up{color:var(--ok)}.dl-coach-down{color:#e3a3a3}.dl-coach-live{margin:10px 0;padding:12px;border-radius:14px;background:#0e0e10;border:1px solid rgba(214,164,91,.3)}.dl-coach-live .dl-coach-target{font-size:18px}.dl-coach-apply{margin-top:9px}.dl-coach-plan-row{padding:11px 0;border-bottom:1px solid var(--line)}.dl-coach-plan-row:last-child{border-bottom:0}.dl-coach-plan-row b{color:var(--accent2)}.dl-coach-rpe{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.dl-coach-rpe span{font-size:10px;border:1px solid var(--line);padding:5px 7px;border-radius:999px;color:var(--muted)}`;
  document.head.appendChild(css);

  function injectToday(){
    if(state.activeSession)return;
    const w=state.program?.[nextWorkoutIndex()];if(!w)return;
    const hero=view.querySelector(".hero");if(!hero||view.querySelector(".dl-coach-card"))return;
    const plans=w.exercises.map(ex=>({ex,p:sessionPlan(ex)}));
    const card=document.createElement("section");card.className="card dl-coach-card";
    const memory=window.DenatMemory?.context?.(),lastSport=memory?.lastSport,foodToday=memory?.today?.meals?.length||0,since=memory?.sinceSport?.meals?.length||0;
    const memoryLine=lastSport?`Dernière séance ${window.DenatTime?.relative?.(lastSport.endedAt)||""} · ${since} repas/ajout${since>1?"s":""} noté${since>1?"s":""} depuis · ${foodToday} aujourd’hui.`:`${foodToday} repas/ajout${foodToday>1?"s":""} noté${foodToday>1?"s":""} aujourd’hui · aucune séance précédente enregistrée.`;
    card.innerHTML=`<div class="row"><div><div class="eyebrow">COACH SPORT INTELLIGENT</div><h3 style="margin:6px 0">Plan de la prochaine séance</h3></div><span class="pill">${recovery().fresh?`${recovery().score}/100 · récupération`:"RPE adaptatif"}</span></div><p class="muted small">${state.reprise?.enabled?"Le coach combine historique, RPE et récupération. Le bas du corps reste temporairement protégé pendant la reprise.":"Le coach combine historique, RPE et récupération du jour lorsqu’Apple Santé est disponible."}</p><div class="notice small" style="margin:10px 0"><b>Mémoire du quotidien</b><br>${esc(memoryLine)}<br><span class="muted">Le journal repas apporte du contexte mais ne modifie pas une charge à lui seul s’il est incomplet.</span></div>${plans.map(({ex,p})=>`<div class="dl-coach-plan-row"><div class="row"><span>${esc(ex.name)}</span><b>${ex.lightLower?`${p.reps} reps · très léger`:p.weight?`${fmt(p.weight)} kg × ${p.reps}`:`${p.reps} reps · calibration`}</b></div><div class="small muted" style="margin-top:4px">RPE cible ${p.rpe} · ${esc(p.confidence)}</div></div>`).join("")}`;
    hero.insertAdjacentElement("afterend",card);
  }

  function injectActive(){
    const s=state.activeSession;if(!s||s.source==="nomad")return;
    view.querySelectorAll(".exercise-card").forEach(card=>{
      const ex=s.exercises[+card.dataset.ei];if(!ex||card.querySelector(".dl-coach-live"))return;
      const p=livePlan(ex),box=document.createElement("div");box.className="dl-coach-live";
      if(p.finished){box.innerHTML=`<div class="eyebrow">COACH LIVE</div><b>✓ Exercice terminé</b>`;}
      else{
        const label=p.level==="up"?"PROGRESSION":p.level==="down"?"AJUSTEMENT":"PROCHAINE SÉRIE";
        box.innerHTML=`<div class="dl-coach-head"><div><div class="eyebrow">COACH LIVE · ${label}</div><div class="dl-coach-target">${esc(p.text)}</div></div><span class="dl-coach-badge ${p.level==="up"?"dl-coach-up":p.level==="down"?"dl-coach-down":""}">RPE ${p.rpe}</span></div><div class="dl-coach-reason">${esc(p.reason)}</div>${p.weight?`<button class="secondary full dl-coach-apply">Appliquer à la série ${p.nextIndex+1}</button>`:""}<div class="dl-coach-rpe"><span>RPE 6–7 : facile</span><span>RPE 8 : ~2 reps en réserve</span><span>RPE 9 : ~1 rep</span><span>RPE 10 : échec / max</span></div>`;
        box.querySelector(".dl-coach-apply")?.addEventListener("click",()=>{
          const set=ex.sets[p.nextIndex];if(!set)return;set.weight=p.weight;set.reps=p.reps;saveState();renderActiveSession();
        });
      }
      const insights=card.querySelector(".ff-insights");
      if(insights)insights.insertAdjacentElement("afterend",box);else card.querySelector(":scope > .row")?.insertAdjacentElement("afterend",box);
    });
  }

  const baseToday=renderToday;renderToday=function(){baseToday();injectToday();};
  const baseActive=renderActiveSession;renderActiveSession=function(){baseActive();injectActive();};

  const baseFinish=finishSession;finishSession=function(){
    if(state.activeSession){
      state.activeSession.coachReview=state.activeSession.exercises.map(ex=>{
        const st=stats(ex);return {exercise:ex.name,avgRpe:st?.avgRpe??null,avgReps:st?.avgReps??null,workingWeight:st?.weight??0};
      });
    }
    baseFinish();
  };

  window.DenatSportCoach={sessionPlan,livePlan,history};
  render();
})();