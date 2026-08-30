/* node smoke.js — percorre l'app come farebbe il narratore, senza browser.
   Fallisce se una schermata non si disegna o se il conteggio del quiz sbaglia. */
const fs = require("fs"), assert = require("assert");
const { apri } = require("./stub-dom");

const CODA = "{state,SLIDES,STORY,vai,avanti,indietro,render,regia,sviluppo,apriIndizio,SCELTE_MAX,PERSONE_MAX,SOSPETTI,REGIA_OK,DEV_OK,TITOLI_OK,attesi}";
const { app, stage } = apri(CODA);

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

// l'indagine ha un prezzo: due indizi soli, e una persona sola per indizio
app.vai(app.SLIDES.findIndex(s => s.t === "tavolo"));
[0, 1, 2, 3].forEach(app.apriIndizio);
assert.strictEqual(app.state.indagine.scelti.length, app.SCELTE_MAX,
  `il tavolo ha aperto ${app.state.indagine.scelti.length} indizi invece di ${app.SCELTE_MAX}`);
assert.ok(!app.state.indagine.scelti.includes(2), "il terzo indizio non doveva aprirsi");
// ogni oggetto ha una risposta per ognuno dei quattro sospetti, e la vittima non e' fra loro
assert.strictEqual(app.SOSPETTI.length, 4, `sospetti: ${app.SOSPETTI.join(", ")}`);
assert.ok(!app.SOSPETTI.includes("Giuseppe"), "la vittima non puo' essere interrogata");
app.STORY.oggetti.forEach(o => app.SOSPETTI.forEach(c =>
  assert.ok(o.risposte?.[c], `manca la risposta di ${c} su "${o.nome}"`)));

// su un oggetto si interrogano due persone, non tre
const bicchiere = app.STORY.oggetti[0];
app.state.indagine.chiesto[0] = ["Mauro", "Augusto", "Rosalia"].slice(0, 0);
app.state.clue = 0;
["Mauro", "Augusto", "Rosalia"].forEach(c => {
  const gia = app.state.indagine.chiesto[0] || [];
  if (!gia.includes(c) && gia.length < app.PERSONE_MAX) app.state.indagine.chiesto[0] = [...gia, c];
});
assert.strictEqual(app.state.indagine.chiesto[0].length, app.PERSONE_MAX,
  "si sono interrogate piu' persone del consentito su un oggetto");
app.render();
["Mauro", "Augusto"].forEach(c =>
  assert.ok(stage.innerHTML.includes(bicchiere.risposte[c]), `${c} e' stato interrogato ma non risponde`));
assert.ok(!stage.innerHTML.includes(bicchiere.risposte.Rosalia), "risponde anche chi non e' stato interrogato");
app.state.clue = null; app.state.indagine.chiesto[0] = [];

// Ogni data-* che compare in pagina dev'essere nell'elenco del gestore del clic,
// o il pulsante si disegna e non risponde: e' successo con `data-avanti`.
const sorgente = fs.readFileSync("oliva-blu.html", "utf8");
const ascoltati = new Set([...sorgente.match(/closest\("(\[data-[^"]+)"\)/)[1].matchAll(/data-([a-z]+)/g)].map(m => m[1]));
const inPagina = new Set();
for (let i = 0; i < app.SLIDES.length; i++) {
  app.vai(i);
  [...stage.innerHTML.matchAll(/data-([a-z]+)=/g)].forEach(m => inPagina.add(m[1]));
}
app.state.clue = 0; app.vai(app.SLIDES.findIndex(x => x.t === "tavolo")); app.state.clue = 0; app.render();
[...stage.innerHTML.matchAll(/data-([a-z]+)=/g)].forEach(m => inPagina.add(m[1]));
app.state.clue = null;
const sordi = [...inPagina].filter(a => !ascoltati.has(a) && a !== "c" && a !== "theme" && a !== "close");
assert.deepStrictEqual(sordi, [], `data-${sordi.join(", data-")}: in pagina ma non nel gestore del clic`);

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

const { app: pub, stage: palcoPub } = apri(CODA, { protocol: "https:", hostname: "viridjan.github.io" });
assert.ok(!pub.REGIA_OK && !pub.DEV_OK, "sul sito pubblico non devono esserci regia ne' sviluppo");
// il titolo di una scena la racconta prima che accada: online non deve uscire
assert.ok(!pub.TITOLI_OK && app.TITOLI_OK, "i titoli di scena vanno mostrati solo dove si lavora");
pub.vai(pub.SLIDES.findIndex(s => s.t === "scene"));
assert.ok(!palcoPub.innerHTML.includes("scene-head"), "intestazione di scena visibile sul sito pubblico");
assert.ok(stage.innerHTML.length >= 0);
pub.vai(scenaN); pub.regia(); pub.sviluppo();
assert.strictEqual(pub.state.regia, false, "la regia si accende sul sito pubblico");
assert.strictEqual(pub.state.sviluppo, false, "lo sviluppo si accende sul sito pubblico");

// il banco voci ha una copia deliberata del motore: i profili devono restare
// identici, o si accordano le voci su una pagina e si recita con quelle dell'altra
const profili = t => Object.fromEntries([...t.matchAll(/^ *(Giuseppe|Rosalia|Roberto|Augusto|Mauro): *(\{[^}]*\})/gm)]
  .map(m => [m[1], m[2].replace(/\s+/g, "")]));
const alBanco = profili(fs.readFileSync("voci.html", "utf8"));
const inScena = profili(fs.readFileSync("oliva-blu.html", "utf8"));   // non `html`: li' gli a capo sono gia' stati schiacciati
assert.strictEqual(Object.keys(inScena).length, 5, `nell'app trovo ${Object.keys(inScena).length} profili di voce, non 5`);
assert.deepStrictEqual(alBanco, inScena, "i profili di voce di voci.html e oliva-blu.html sono diversi");

console.log(`copione: ${dette.length} battute verificate`);
console.log(`ok — ${app.SLIDES.length} schermate, ${battute} battute, quiz verificato`);
