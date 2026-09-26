// ForgeLife Duo — synchronisation de la liste de courses hebdomadaire
(function(){
  const API="https://lv-social-publisher.jocelyn-denat.workers.dev/forge-sync";
  const HID_KEY="forgelife_household_id";
  const SECRET_KEY="forgelife_household_secret";
  const OFFSET=500;
  let busy=false;

  function mondayDate(padded=true){
    const n=new Date(),cur=(n.getDay()+6)%7,m=new Date(n.getFullYear(),n.getMonth(),n.getDate()-cur);
    const mo=padded?String(m.getMonth()+1).padStart(2,"0"):String(m.getMonth()+1),d=padded?String(m.getDate()).padStart(2,"0"):String(m.getDate());
    return `${m.getFullYear()}-${mo}-${d}`;
  }
  const localKey=()=>`forgelife_week_shop_${mondayDate(false)}`;
  function readLocal(){try{const a=JSON.parse(localStorage.getItem(localKey())||"[]");return Array.isArray(a)?a.map(Number).filter(Number.isInteger):[];}catch(e){return[];}}
  function writeLocal(a){localStorage.setItem(localKey(),JSON.stringify([...new Set(a)].sort((x,y)=>x-y)));}
  function headers(){return {"x-forge-household":localStorage.getItem(HID_KEY)||"","authorization":`Bearer ${localStorage.getItem(SECRET_KEY)||""}`,"content-type":"application/json"};}
  function visible(){return route==="meals"&&document.querySelector("[data-week-shop]");}
  function apply(checkedRaw){
    const checked=(checkedRaw||[]).filter(i=>i>=OFFSET).map(i=>i-OFFSET);
    writeLocal(checked);
    if(!visible())return;
    const boxes=[...document.querySelectorAll("[data-week-shop]")];
    boxes.forEach(c=>{const i=+c.dataset.weekShop;c.checked=checked.includes(i);c.closest(".ff-shop")?.classList.toggle("done",checked.includes(i));});
    const card=boxes[0]?.closest("section.card"),pill=card?.querySelector(".row .pill");if(pill)pill.textContent=`${checked.length}/${boxes.length}`;
  }
  async function pull(){
    if(busy||document.hidden||!visible())return;busy=true;
    try{
      const r=await fetch(`${API}?date=${mondayDate(true)}`,{headers:headers(),cache:"no-store"});
      if(!r.ok)throw new Error();const d=await r.json();apply(d.checked||[]);
    }catch(e){}finally{busy=false;}
  }
  async function push(index,checked){
    const r=await fetch(API,{method:"POST",headers:headers(),body:JSON.stringify({date:mondayDate(true),index:OFFSET+index,checked})});
    if(!r.ok)throw new Error();const d=await r.json();apply(d.checked||[]);
  }
  document.addEventListener("change",e=>{
    const c=e.target.closest?.("[data-week-shop]");if(!c)return;
    const i=+c.dataset.weekShop,checked=c.checked;
    let a=readLocal();a=checked?[...new Set([...a,i])]:a.filter(x=>x!==i);writeLocal(a);
    push(i,checked).catch(()=>{});
  },true);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)setTimeout(pull,100);});
  document.addEventListener("click",e=>{if(e.target.closest?.("[data-v='weekshop']"))setTimeout(pull,150);},true);
  setInterval(pull,2500);
  setTimeout(pull,800);
})();
