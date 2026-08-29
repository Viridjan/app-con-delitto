/* node smoke.js — percorre l'app come farebbe il narratore, senza browser.
   Fallisce se una schermata non si disegna o se il conteggio del quiz sbaglia. */
const fs = require("fs"), vm = require("vm"), assert = require("assert");

// ponytail: stub DOM minimo, non jsdom — servono solo i metodi che l'app usa davvero
const node = () => ({
  _html: "", set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
  textContent: "", disabled: false, hidden: false, dataset: {}, style: {}, value: "",
  classList: { toggle() {}, add() {}, remove() {}, contains: () => false },
  addEventListener() {}, focus() {}, scrollIntoView() {}, scrollTo() {}, remove() {},
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
  get firstElementChild() { return node(); },
  querySelector: () => node(), querySelectorAll: () => [],
});
const stage = node();
const doc = {
  createElement: node, addEventListener() {},
  querySelector: () => null, body: { appendChild: n => n },
  getElementById: id => (id === "stage" ? stage : node()),
  documentElement: { requestFullscreen: () => Promise.resolve() },
};
const contesto = loc => ({ document: doc, Image: class { set src(_) {} }, matchMedia: () => ({ matches: false }),
  addEventListener() {}, requestAnimationFrame: fn => fn(), console, location: loc });
const js = [...fs.readFileSync("oliva-blu.html", "utf8").matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join("\n");
const coda = ";({state,SLIDES,STORY,vai,avanti,indietro,render,regia,sviluppo,REGIA_OK,DEV_OK,attesi})";
const app = vm.runInNewContext(js + coda, contesto({ protocol: "file:", hostname: "" }));

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

// il blu si accende sulla scena del malore, ovunque stia nell'elenco:
// dividere una scena non deve far fallire il controllo
const scenaBlu = app.STORY.scene.find(s => s.blu);
assert.ok(scenaBlu, "nessuna scena col flag blu");
assert.strictEqual(scenaBlu.slot || "", "scena4", "il blu non e' sulla scena del malore");
assert.ok(quizN > 0 && app.SLIDES[quizN - 1].t === "narr", "la frase del narratore deve precedere il quiz");

// il copione approvato e' copione.txt: ogni battuta fra virgolette basse deve
// comparire identica nell'app. E' il controllo che protegge il testo dalle
// riscritture involontarie.
const html = fs.readFileSync("oliva-blu.html", "utf8").replace(/\s+/g, " ");
const copione = fs.readFileSync("copione.txt", "utf8").replace(/\r/g, "");
const dette = [...copione.matchAll(/«([^»]+)»/g)].map(m => m[1]);
assert.ok(dette.length >= 35, `copione.txt: solo ${dette.length} battute trovate`);
const perse = dette.filter(t => !html.includes(t.replace(/\s+/g, " ")));
assert.deepStrictEqual(perse, [], `battute del copione assenti dall'app: ${perse.join(" | ")}`);

// il tavolo degli indizi cita battute a mano: devono esistere davvero, e il numero
// di scena dev'essere quello giusto - rinumerare una scena le lasciava indietro
const scenaDi = new Map();
app.STORY.scene.forEach((s, i) => s.battute.forEach(b => scenaDi.set(b.t, s.n || i + 1)));
// Array.from: gli array del contesto vm hanno un altro prototipo, deepStrictEqual li rifiuta
const storte = Array.from(app.STORY.oggetti.flatMap(o => o.refs))
  .filter(r => scenaDi.get(r.t) !== r.s)
  .map(r => `${r.t} → dice scena ${r.s}, è la ${scenaDi.get(r.t) ?? "nessuna"}`);
assert.deepStrictEqual(storte, [], `citazioni del tavolo sbagliate: ${storte.join(" | ")}`);

// gli strumenti d'autore: aperti da disco ci sono, sul sito pubblico no
assert.ok(app.REGIA_OK && app.DEV_OK, "da file locale regia e sviluppo devono esserci");
const scenaN = app.SLIDES.findIndex(s => s.t === "scene");
app.vai(scenaN); app.regia();
assert.strictEqual(app.state.regia, true, "la regia non si accende in locale");
app.regia(); app.sviluppo();
assert.strictEqual(app.state.sviluppo, true, "lo sviluppo non si accende in locale");

const pub = vm.runInNewContext(js + coda, contesto({ protocol: "https:", hostname: "viridjan.github.io" }));
assert.ok(!pub.REGIA_OK && !pub.DEV_OK, "sul sito pubblico non devono esserci regia ne' sviluppo");
pub.vai(scenaN); pub.regia(); pub.sviluppo();
assert.strictEqual(pub.state.regia, false, "la regia si accende sul sito pubblico");
assert.strictEqual(pub.state.sviluppo, false, "lo sviluppo si accende sul sito pubblico");

console.log(`copione: ${dette.length} battute verificate`);
console.log(`ok — ${app.SLIDES.length} schermate, ${battute} battute, quiz verificato`);
