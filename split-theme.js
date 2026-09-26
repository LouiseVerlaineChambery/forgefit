// Denat Life — deux univers visuels : Sport noir/or, Repas ivoire/or
(function(){
  function applyTheme(r){
    document.body.classList.toggle("meals-theme",r==="meals");
  }
  const originalSetRoute=setRoute;
  setRoute=function(r){
    applyTheme(r);
    return originalSetRoute(r);
  };
  applyTheme(typeof route!=="undefined"?route:"today");
  const q=new URLSearchParams(location.search);
  if(q.get("view")==="meals"||q.get("duo")==="1") applyTheme("meals");
})();
