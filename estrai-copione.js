const fs = require("fs"), vm = require("vm");
const js = [...fs.readFileSync("oliva-blu.html", "utf8").matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join("\n");
const node = () => ({ _html:"", set innerHTML(v){this._html=v}, get innerHTML(){return this._html},
  textContent:"", disabled:false, hidden:false, dataset:{}, classList:{toggle(){},add(){},remove(){}},
  addEventListener(){}, focus(){}, scrollIntoView(){}, scrollTo(){},
  querySelector:()=>node(), querySelectorAll:()=>[] });
const doc = { createElement:node, addEventListener(){}, querySelector:()=>null, body:{appendChild:n=>n},
  getElementById:()=>node(), documentElement:{requestFullscreen:()=>Promise.resolve()} };
const S = vm.runInNewContext(js + ";STORY", { document:doc, Image:class{set src(_){}},
  matchMedia:()=>({matches:false}), addEventListener(){}, requestAnimationFrame:f=>f(), console,
  location:{protocol:"file:", hostname:""} });

const R = [];
const riga = t => R.push(t);
riga("IL MISTERO DELL’OLIVA BLU");
riga("");
riga("Testo originale di Carlo Maria Gervasio, usato con la sua autorizzazione.");
riga("Questo file è il copione approvato: è la versione che l’app deve mostrare,");
riga("parola per parola. Il PDF resta l’originale da cui è tratto.");
riga("");
riga("— DISCLAIMER —");
riga(S.disclaimer);
riga("");
riga("— PERSONAGGI —");
S.personaggi.forEach(p => riga(`${p.n}\n    ${p.d}`));
S.scene.forEach((s, i) => {
  riga("");
  riga(`— SCENA ${s.n || i + 1}${s.parte ? `, ${s.parte}` : ""}: ${s.titolo} —`);
  riga("");
  s.battute.forEach(b => riga(`${b.c}${b.m ? `, ${b.m}` : ""}: «${b.t}»${b.nuova ? "   [aggiunta, non di Gervasio]" : ""}`));
});
riga("");
riga("— FRASE FINALE DEL NARRATORE —");
S.narratoreFinale.forEach(r => riga(r));
riga("");
riga("— SCHEDA FINALE —");
S.quiz.forEach((q, i) => {
  riga(`${i + 1}. ${q.q}`);
  q.opzioni.forEach((o, k) => riga(`   ${"ABC"[k]}. ${o}${k === q.giusta ? "   ← giusta" : ""}`));
});
riga("");
riga("— SOLUZIONE NARRATA —");
S.soluzione.forEach(r => riga(r));
riga("");
fs.writeFileSync("copione.txt", R.join("\n"), "utf8");
console.log("copione.txt scritto:", R.join("\n").split("\n").length, "righe");
