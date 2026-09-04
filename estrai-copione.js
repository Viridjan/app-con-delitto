const fs = require("fs");
const { openApp } = require("./stub-dom");
const { app } = openApp("{STORY,SUSPECTS}");
const S = app.STORY, SUSPECTS = app.SUSPECTS;

const R = [];
const appendLine = t => R.push(t);
appendLine("IL MISTERO DELL’OLIVA BLU");
appendLine("");
appendLine("Testo originale di Carlo Maria Gervasio, usato con la sua autorizzazione.");
appendLine("Questo file è il copione approvato: è la versione che l’app deve mostrare,");
appendLine("parola per parola. Il PDF resta l’originale da cui è tratto.");
appendLine("");
appendLine("— DISCLAIMER —");
appendLine(S.disclaimer);
appendLine("");
appendLine("— PERSONAGGI —");
S.personaggi.forEach(p => appendLine(`${p.n} - ${p.d}`));
S.scene.forEach((s, i) => {
  appendLine("");
  appendLine(`— SCENA ${s.n || i + 1}${s.parte ? `, ${s.parte}` : ""}: ${s.titolo} —`);
  appendLine("");
  s.battute.forEach(b => appendLine(`${b.c}${b.m ? `, ${b.m}` : ""}: «${b.t}»`));
});
appendLine("");
appendLine("— FRASE FINALE DELL’INVESTIGATORE —");
S.investigatoreFinale.forEach(r => appendLine(r));
appendLine("");
appendLine("— SCHEDA FINALE —");
S.quiz.forEach((q, i) => {
  appendLine(`${i + 1}. ${q.q}   [${q.punti} ${q.punti === 1 ? "punto" : "punti"}]`);
  // le opzioni sono sempre i quattro sospetti, nello stesso ordine dell'app
  SUSPECTS.forEach((o, k) => appendLine(`   ${String.fromCharCode(65 + k)}. ${o}${k === q.giusta ? "   ← giusta" : ""}`));
});
appendLine("");
appendLine("— SOLUZIONE NARRATA —");
S.soluzione.forEach(r => appendLine(r));
appendLine("");
fs.writeFileSync("copione.txt", R.join("\n"), "utf8");
console.log("copione.txt scritto:", R.join("\n").split("\n").length, "righe");
