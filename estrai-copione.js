const fs = require("fs");
const { apri } = require("./stub-dom");
const { app } = apri("{STORY,SOSPETTI}");
const S = app.STORY, SOSPETTI = app.SOSPETTI;

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
S.personaggi.forEach(p => riga(`${p.n} - ${p.d}`));
S.scene.forEach((s, i) => {
  riga("");
  riga(`— SCENA ${s.n || i + 1}${s.parte ? `, ${s.parte}` : ""}: ${s.titolo} —`);
  riga("");
  s.battute.forEach(b => riga(`${b.c}${b.m ? `, ${b.m}` : ""}: «${b.t}»`));
});
riga("");
riga("— FRASE FINALE DELL’INVESTIGATORE —");
S.investigatoreFinale.forEach(r => riga(r));
riga("");
riga("— SCHEDA FINALE —");
S.quiz.forEach((q, i) => {
  riga(`${i + 1}. ${q.q}   [${q.punti} ${q.punti === 1 ? "punto" : "punti"}]`);
  // le opzioni sono sempre i quattro sospetti, nello stesso ordine dell'app
  SOSPETTI.forEach((o, k) => riga(`   ${String.fromCharCode(65 + k)}. ${o}${k === q.giusta ? "   ← giusta" : ""}`));
});
riga("");
riga("— SOLUZIONE NARRATA —");
S.soluzione.forEach(r => riga(r));
riga("");
fs.writeFileSync("copione.txt", R.join("\n"), "utf8");
console.log("copione.txt scritto:", R.join("\n").split("\n").length, "righe");
