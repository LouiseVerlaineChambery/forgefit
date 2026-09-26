// ForgeFit — métriques utiles : durée de séance + volume par exercice
(function(){
  let liveTimer=null;

  function exerciseVolume(ex){
    return (ex?.sets||[]).filter(s=>s.done).reduce((sum,s)=>sum+(+s.weight||0)*(+s.reps||0),0);
  }

  function sessionMinutes(s){
    if(!s || s.source==="mybodynote") return null;
    const start=new Date(s.startedAt).getTime(), end=new Date(s.endedAt).getTime();
    if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start) return null;
    return Math.max(1,Math.round((end-start)/60000));
  }

  function fmtDuration(min){
    if(min==null) return "—";
    if(min<60) return `${min} min`;
    const h=Math.floor(min/60), m=min%60;
    return m?`${h} h ${m} min`:`${h} h`;
  }

  const baseRenderToday=renderToday;
  renderToday=function(){
    baseRenderToday();
    if(state.activeSession) return;
    const week=state.sessions.filter(s=>Date.now()-new Date(s.endedAt).getTime()<7*86400000);
    const minutes=week.map(sessionMinutes).filter(v=>v!=null).reduce((a,b)=>a+b,0);
    view.querySelectorAll(".stat").forEach(stat=>{
      const label=stat.querySelector("span")?.textContent?.trim();
      if(label==="kg déplacés"){
        stat.querySelector("b").textContent=minutes?fmtDuration(minutes):"—";
        stat.querySelector("span").textContent="Temps d’entraînement";
      }
    });
  };

  const baseRenderActiveSession=renderActiveSession;
  renderActiveSession=function(){
    clearInterval(liveTimer);
    baseRenderActiveSession();
    const s=state.activeSession;
    if(!s) return;
    const hero=view.querySelector(".hero");
    if(!hero) return;
    let pill=hero.querySelector(".ff-live-duration");
    if(!pill){
      pill=document.createElement("span");
      pill.className="pill ff-live-duration";
      const row=hero.querySelector(".row");
      if(row) row.insertBefore(pill,row.firstChild);
    }
    const update=()=>{
      const sec=Math.max(0,Math.floor((Date.now()-new Date(s.startedAt).getTime())/1000));
      const m=Math.floor(sec/60), ss=String(sec%60).padStart(2,"0");
      pill.textContent=`⏱ ${m}:${ss}`;
    };
    update(); liveTimer=setInterval(update,1000);
  };

  const baseRenderHistory=renderHistory;
  renderHistory=function(){
    baseRenderHistory();
    const volumeBtn=view.querySelector('[data-hf="volume"]');
    if(volumeBtn) volumeBtn.textContent="Durée";

    if(histFilter==="volume"){
      const sessions=[...state.sessions].sort((a,b)=>new Date(b.endedAt)-new Date(a.endedAt));
      const timed=sessions.filter(s=>sessionMinutes(s)!=null);
      const total=timed.reduce((sum,s)=>sum+sessionMinutes(s),0);
      const last=timed.slice(0,10).reverse();
      const out=document.querySelector("#history-content");
      if(out){
        out.innerHTML=`<section class="card"><div class="row"><div><div class="eyebrow">TEMPS D’ENTRAÎNEMENT</div><div class="kpi">${fmtDuration(total)}</div></div><span class="pill">${timed.length} séances chronométrées</span></div><div class="progress-wrap"><canvas id="progress-chart"></canvas></div><p class="muted small">Les séances importées de MyBodyNote n’ont pas de durée fiable et ne sont pas comptées ici.</p></section>`;
        drawChart(document.querySelector("#progress-chart"),last.map(s=>({label:new Date(s.endedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"}),value:sessionMinutes(s)})));
      }
    }

    if(histFilter==="history"){
      const sessions=[...state.sessions].sort((a,b)=>new Date(b.endedAt)-new Date(a.endedAt));
      const cards=[...document.querySelectorAll("#history-content > section.card")];
      cards.forEach((card,i)=>{
        const s=sessions[i]; if(!s) return;
        const stats=card.querySelectorAll(".stat");
        if(stats[0]){stats[0].querySelector("b").textContent=completedSets(s);stats[0].querySelector("span").textContent="séries";}
        if(stats[2]){const min=sessionMinutes(s);stats[2].querySelector("b").textContent=min==null?"—":min;stats[2].querySelector("span").textContent=min==null?"durée non dispo":"minutes";}
        const rows=card.querySelectorAll("details .list-item");
        rows.forEach((row,ei)=>{
          const ex=s.exercises[ei]; if(!ex) return;
          const vol=Math.round(exerciseVolume(ex));
          const meta=row.querySelector(".small.muted");
          if(meta && vol>0) meta.insertAdjacentHTML("beforeend",`<br><span style="color:var(--accent2)">Volume exercice : ${vol.toLocaleString("fr-FR")} kg</span>`);
        });
      });
    }
  };

  const baseRenderExerciseStats=renderExerciseStats;
  renderExerciseStats=function(name){
    baseRenderExerciseStats(name);
    const matches=[];
    state.sessions.forEach(s=>{
      const ex=s.exercises.find(e=>e.name===name);
      if(ex) matches.push({s,ex});
    });
    const last=matches.at(-1);
    const vol=last?Math.round(exerciseVolume(last.ex)):0;
    const box=document.querySelector("#exercise-stats");
    if(box && vol>0){
      const row=box.querySelector(".row");
      if(row) row.insertAdjacentHTML("beforeend",`<div><div class="eyebrow">VOLUME DERNIÈRE SÉANCE</div><div class="kpi">${vol.toLocaleString("fr-FR")} kg</div></div>`);
    }
  };
})();
