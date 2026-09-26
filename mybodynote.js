// ForgeFit — import MyBodyNote CSV
(function(){
  const baseRenderSettings = renderSettings;

  function normalizeExerciseName(name){
    const raw=String(name||"").trim().replace(/\s+/g," ");
    const canonical=window.DenatExerciseLibrary?.canonicalName?.(raw);
    if(canonical&&canonical!==raw)return canonical;
    const aliases={"squat saute":"Squat sauté","squat sauté":"Squat sauté","squat 1 jambe":"Squat 1 jambe","traction table":"Traction table","pompe genoux":"Pompes genoux","pompes genoux":"Pompes genoux","pompe chaise basse":"Pompes chaise basse","crunch":"Crunch","dips":"Dips","pompes":"Pompes"};
    const key=raw.toLocaleLowerCase("fr-FR");
    return aliases[key] || raw.charAt(0).toLocaleUpperCase("fr-FR")+raw.slice(1);
  }

  function parseCSVLine(line, delimiter){
    const out=[]; let cur="", quoted=false;
    for(let i=0;i<line.length;i++){
      const ch=line[i];
      if(ch==='"'){
        if(quoted && line[i+1]==='"'){cur+='"';i++;}
        else quoted=!quoted;
      }else if(ch===delimiter && !quoted){out.push(cur);cur="";}
      else cur+=ch;
    }
    out.push(cur);
    return out;
  }

  function parseMyBodyNoteCSV(text){
    text=String(text||"").replace(/^\uFEFF/,"").replace(/\r\n/g,"\n").replace(/\r/g,"\n");
    const lines=text.split("\n").filter(x=>x.trim().length);
    if(lines.length<2) throw new Error("Le fichier CSV est vide.");
    const delimiter=(lines[0].split(";").length>lines[0].split(",").length)?";":",";
    const headers=parseCSVLine(lines[0],delimiter).map(h=>h.trim().toUpperCase());
    const required=["DATE","EXERCISE","NB_REPS","WEIGHT"];
    if(!required.every(k=>headers.includes(k))) throw new Error("Ce fichier ne ressemble pas à un export MyBodyNote.");
    const rows=[];
    for(const line of lines.slice(1)){
      const vals=parseCSVLine(line,delimiter); const row={};
      headers.forEach((h,i)=>row[h]=(vals[i]??"").trim());
      if(row.DATE && row.EXERCISE) rows.push(row);
    }
    return rows;
  }

  function dateToISO(dateStr){
    const m=String(dateStr).trim().match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if(!m) return null;
    return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}T12:00:00.000Z`;
  }

  function importRows(rows){
    const byDate=new Map();
    for(const r of rows){
      const iso=dateToISO(r.DATE); if(!iso) continue;
      const name=normalizeExerciseName(r.EXERCISE);
      if(!byDate.has(r.DATE)) byDate.set(r.DATE,{iso,exercises:new Map()});
      const day=byDate.get(r.DATE);
      if(!day.exercises.has(name)) day.exercises.set(name,[]);
      day.exercises.get(name).push({
        id:crypto.randomUUID(),
        index:day.exercises.get(name).length+1,
        reps:parseInt(String(r.NB_REPS).replace(",","."),10)||0,
        weight:parseFloat(String(r.WEIGHT).replace(",","."))||0,
        rpe:"",
        done:true,
        duration:r.DURATION||"00:00:00"
      });
    }

    let imported=0, updated=0, series=0;
    for(const [dateKey,day] of byDate){
      const exercises=[...day.exercises.entries()].map(([name,sets])=>{
        series+=sets.length;
        return {
          id:crypto.randomUUID(), name,
          targetSets:sets.length,
          targetReps:Math.max(...sets.map(x=>x.reps),0),
          rest:state.settings.defaultRest||90,
          category:"upper", suggestedWeight:0, sets
        };
      });
      const end=new Date(day.iso);
      const start=new Date(end.getTime()-Math.max(30,exercises.length*8)*60000);
      const existing=state.sessions.find(s=>s.source==="mybodynote" && (s.importDate===dateKey || String(s.importKey||"").startsWith(`mybodynote:${dateKey}:`)));
      if(existing){
        existing.workoutName="MyBodyNote";
        existing.startedAt=start.toISOString();
        existing.endedAt=end.toISOString();
        existing.importDate=dateKey;
        existing.importKey=`mybodynote:${dateKey}`;
        existing.exercises=exercises;
        updated++;
      }else{
        state.sessions.push({
          id:crypto.randomUUID(), workoutId:null, workoutName:"MyBodyNote",
          startedAt:start.toISOString(), endedAt:end.toISOString(),
          source:"mybodynote", importDate:dateKey, importKey:`mybodynote:${dateKey}`,
          exercises
        });
        imported++;
      }
    }
    state.sessions.sort((a,b)=>new Date(a.endedAt)-new Date(b.endedAt));
    saveState();
    return {imported,updated,series};
  }

  renderSettings=function(){
    baseRenderSettings();
    const section=document.createElement("section");
    section.className="card";
    section.innerHTML=`
      <div class="eyebrow">IMPORT MYBODYNOTE</div>
      <h3 style="margin-top:6px">Récupérer mon ancien historique</h3>
      <p class="muted small">Sélectionne ton export CSV MyBodyNote. ForgeFit recrée automatiquement les séances, exercices, séries, répétitions, charges et durées. Si tu réimportes un export plus récent, les journées déjà importées sont mises à jour sans doublon.</p>
      <label class="primary full" style="text-align:center;display:block">Importer un CSV MyBodyNote<input id="import-mybodynote" type="file" accept=".csv,text/csv" hidden></label>
      <div id="mbn-result" class="small" style="margin-top:10px"></div>`;
    const dataCard=[...view.querySelectorAll(".card")].find(c=>c.querySelector(".eyebrow")?.textContent.trim()==="DONNÉES");
    if(dataCard) view.insertBefore(section,dataCard); else view.appendChild(section);

    section.querySelector("#import-mybodynote").addEventListener("change",async e=>{
      const f=e.target.files[0]; if(!f) return;
      const result=section.querySelector("#mbn-result");
      try{
        const rows=parseMyBodyNoteCSV(await f.text());
        const stats=importRows(rows);
        const details=[
          stats.imported?`${stats.imported} nouvelle${stats.imported>1?"s":""} séance${stats.imported>1?"s":""}`:"",
          stats.updated?`${stats.updated} séance${stats.updated>1?"s":""} mise${stats.updated>1?"s":""} à jour`:"",
          `${stats.series} séries traitées`
        ].filter(Boolean).join(" · ");
        result.innerHTML=`<span class="badge-ok">✓ ${esc(details)}</span>`;
      }catch(err){
        result.innerHTML=`<span style="color:#ffaaaa">${esc(err.message||"Import impossible.")}</span>`;
      }
      e.target.value="";
    });
  };
})();
