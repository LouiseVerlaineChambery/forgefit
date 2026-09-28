// Denat Life V44 — smoke tests. Run: node smoke-tests.js
const fs=require("fs"),vm=require("vm"),assert=require("assert"),read=p=>fs.readFileSync(p,"utf8");
for(const p of ["app.js","boot.js","meals.js","meal-engine.js","session-ux.js","navigation-v11.js"])new vm.Script(read(p),{filename:p});
const store=new Map(),localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const window={DenatNutritionCore:{recipePortion:()=>({macros:{kcal:500,protein:30,carbs:50,fat:15,fiber:8}}),estimateText:()=>({macros:{kcal:100,protein:10,carbs:10,fat:2,fiber:2}})}};
vm.runInNewContext(read("meal-engine.js"),{window,localStorage,console,Date,Intl,Math,Set,Map,JSON});
const E=window.DenatMealEngine,d=E.generate(),recipes=E.allRecipes();
assert.equal(d.days.length,7);assert(d.weekShop.length>0);assert.equal(d.weekShop.length,d.weekShopCategories.length);
assert(recipes.length>=300);assert(recipes.every(r=>r.ingredients.length&&r.steps.length>=6));
const q=E.replaceQuick(0,d.days[0].dinnerId);assert(q.days[0].dinnerMinutes<=25);
const af=E.replaceByMode(1,d.days[1].dinnerId,"airfryer");assert.equal(af.days[1].dinnerMethod,"airfryer");
assert(E.monthProduce(new Date("2026-09-28T12:00:00")).vegetables.includes("poireau"));
const meals=read("meals.js");assert(/let courseSub=/.test(meals));assert(meals.includes("function bindCoursesOnly"));assert(meals.includes("function catalogView"));assert(meals.includes("function pantryView"));
assert(read("session-ux.js").includes("Machine occupée"));assert(read("session-ux.js").includes("Sans machine"));assert(read("exercise-library.js").includes("function alternatives"));assert(read("exercise-library.js").includes("function hotelExercises"));assert(read("nomad-workout.js").includes("function adaptActiveSession"));assert(read("session-ux.js").includes("Adapter toute la séance sans machine"));assert(read("session-ux.js").includes("ux-tech-inline"));
console.log(JSON.stringify({ok:true,recipes:recipes.length,weekShop:d.weekShop.length,quick:q.days[0].dinnerMinutes,airFryer:af.days[1].dinnerId}));
