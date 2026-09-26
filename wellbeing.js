// Denat Life — V20 Équilibre : poids, sommeil et énergie, séparés par profil.
(function(){
  const validType=t=>["weight","sleep","energy"].includes(t);
  const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const key=()=>`denat_profile_${window.DenatProfile?.currentId?.()||"jocelyn"}_wellbeing_v1`;
  function read(){
    try{const x=JSON.parse(localStorage.getItem(key())||"[]");return Array.isArray(x)?x.filter(v=>v&&validType(v.type)&&v.at).sort((a,b)=>new Date(a.at)-new Date(b.at)):[];}catch{return[];}
  }
  function write(items){localStorage.setItem(key(),JSON.stringify(items.slice(-730)));}
  function add(type,value,{at=new Date().toISOString(),note="",source="manual"}={}){
    if(!validType(type)||!Number.isFinite(+value))return null;
    const v=+value;
    if(type==="weight"&&(v<30||v>300))return null;
    if(type==="sleep"&&(v<0||v>24))return null;
    if(type==="energy"&&(v<0||v>10))return null;
    const item={id:crypto.randomUUID(),type,value:Math.round(v*100)/100,at,note:String(note||""),source};
    const items=read();items.push(item);write(items);return item;
  }
  function remove(id){const a=read(),b=a.filter(x=>x.id!==id);if(a.length===b.length)return false;write(b);return true;}
  function parse(text){
    const n=norm(text).replace(/,/g,".");
    let m=n.match(/(?:je\s*pese|poids(?:\s*(?:de|:|a))?)\s*(\d{2,3}(?:\.\d{1,2})?)\s*(?:kg|kilos?)?/);
    if(m)return {type:"weight",value:+m[1]};
    m=n.match(/(?:j\s*ai\s*dormi|jai\s*dormi|dormi|sommeil(?:\s*(?:de|:))?)\s*(\d{1,2})\s*h(?:\s*(\d{1,2}))?/);
    if(m)return {type:"sleep",value:(+m[1])+Math.min(59,+(m[2]||0))/60};
    m=n.match(/(?:energie|forme)\s*(?::|a)?\s*(\d{1,2})\s*(?:\/|sur)\s*10/);
    if(m)return {type:"energy",value:Math.min(10,+m[1])};
    return null;
  }
  function record(text){
    const p=parse(text);if(!p)return null;
    const when=window.DenatTimeline?.parseWhen?.(text)||{iso:new Date().toISOString(),date:new Date(),explicit:false,label:"maintenant"};
    const item=add(p.type,p.value,{at:when.iso,note:text,source:"natural-timeline"});
    return item?{kind:"wellbeing",item,when}:null;
  }
  function label(item){
    if(!item)return "Équilibre";
    if(item.type==="weight")return "Poids";
    if(item.type==="sleep")return "Sommeil";
    if(item.type==="energy")return "Énergie";
    return "Équilibre";
  }
  function valueText(item){
    if(!item)return "";
    if(item.type==="weight")return `${Number(item.value).toLocaleString("fr-FR",{maximumFractionDigits:2})} kg`;
    if(item.type==="sleep"){
      const h=Math.floor(+item.value),m=Math.round((+item.value-h)*60);return `${h} h${m?` ${String(m).padStart(2,"0")}`:""}`;
    }
    if(item.type==="energy")return `${Math.round(+item.value*10)/10}/10`;
    return String(item.value??"");
  }
  function latest(type){return [...read()].reverse().find(x=>!type||x.type===type)||null;}
  function day(date=new Date()){
    const from=new Date(date);from.setHours(0,0,0,0);const to=new Date(from);to.setDate(to.getDate()+1);
    return read().filter(x=>{const t=new Date(x.at);return t>=from&&t<to;});
  }
  function summary(){
    const weight=latest("weight"),sleep=latest("sleep"),energy=latest("energy"),today=day();
    return {weight,sleep,energy,today};
  }
  window.DenatWellbeing={key,read,add,remove,parse,record,label,valueText,latest,day,summary};
})();