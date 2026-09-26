// Denat Life — points d'entrée dédiés Sport / Repas
(function(){
  const q=new URLSearchParams(location.search);
  const entry=q.get("view");
  if(entry==="sport"){
    document.title="Denat Life — Sport";
    setTimeout(()=>setRoute("today"),0);
  }else if(entry==="meals"){
    document.title="Denat Life — Repas & courses";
    setTimeout(()=>setRoute("meals"),0);
  }
})();
