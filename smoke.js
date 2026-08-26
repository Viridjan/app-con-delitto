/* node smoke.js — percorre l'app come farebbe il narratore, senza browser.
   Fallisce se una schermata non si disegna o se il conteggio del quiz sbaglia. */
const fs = require("fs"), vm = require("vm"), assert = require("assert");

// ponytail: stub DOM minimo, non jsdom — servono solo i metodi che l'app usa davvero
const node = () => ({
  _html: "", set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
  textContent: "", disabled: false, hidden: false, dataset: {},
  classList: { toggle() {}, add() {}, remove() {} },
  addEventListener() {}, focus() {}, scrollIntoView() {},
  querySelector: () => node(), querySelectorAll: () => [],
});
const stage = node();
const doc = {
  createElement: node, addEventListener() {},
  getElementById: id => (id === "stage" ? stage : node()),
  documentElement: { requestFullscreen: () => Promise.resolve() },
};
const ctx = { document: doc, Image: class { set src(_) {} }, matchMedia: () => ({ matches: false }), console };
const js = [...fs.readFileSync("oliva-blu.html", "utf8").matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join("\n");
const app = vm.runInNewContext(js + ";({state,SLIDES,STORY,vai,avanti,indietro,render})", ctx);

// ogni schermata si disegna e produce contenuto
for (let i = 0; i < app.SLIDES.length; i++) {
  app.vai(i);
  assert.ok(stage.innerHTML.length > 100, `schermata ${i} (${app.SLIDES[i].t}) vuota`);
}

// una passata completa in avanti tocca ogni battuta e finisce sull'ultima schermata
app.vai(0);
let passi = 0;
while (app.state.n < app.SLIDES.length - 1 && passi < 500) { app.avanti(); passi++; }
const battute = app.STORY.scene.reduce((n, s) => n + s.battute.length, 0);
assert.strictEqual(passi, app.SLIDES.length - 1 + battute, "passi della passata completa");

// e indietro si torna esattamente al punto di partenza
while (passi-- > 0) app.indietro();
assert.strictEqual(app.state.n, 0, "indietro non torna alla copertina");

// quiz: tutte A = 4 su 4, tutte B = 0 su 4
const quizN = app.SLIDES.findIndex(s => s.t === "quiz");
for (const [scelta, atteso] of [[0, "4 "], [1, "0 "]]) {
  app.state.risposte = app.STORY.quiz.map(() => scelta);
  app.vai(app.SLIDES.findIndex(s => s.t === "sol"));
  assert.ok(stage.innerHTML.includes(`class="score">${atteso}`), `punteggio errato per la risposta ${"AB"[scelta]}`);
}

// la scena 4 accende il blu solo a battute finite
assert.ok(app.STORY.scene[3].blu, "scena 4 senza flag blu");
assert.ok(quizN > 0 && app.SLIDES[quizN - 1].t === "narr", "la frase del narratore deve precedere il quiz");

console.log(`ok — ${app.SLIDES.length} schermate, ${battute} battute, quiz verificato`);
