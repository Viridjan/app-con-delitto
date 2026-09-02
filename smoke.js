/* node smoke.js — percorre l'app come farebbe l'investigatore, senza browser.
   Fallisce se una schermata non si disegna o se il conteggio del quiz sbaglia. */
const fs = require("fs"), assert = require("assert");
const { apri } = require("./stub-dom");

const CODA = "{state,SLIDES,STORY,vai,avanti,scopri,etichettaAvanti,restaDaScoprire,pulsanteAvanti,indagineCompleta,POSA_VERDETTO,render,regia,sviluppo,apriIndizio,SCELTE_MAX,PERSONE_MAX,SOSPETTI,REGIA_OK,DEV_OK,TITOLI_OK,attesi,ATTORE,ASSETS,demo,SCENE_IMG,velo:()=>VELO}";
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
/* una scena si apre con la prima battuta gia' scoperta: quel passo non si fa */
const gratis = app.STORY.scene.filter(s => s.battute.length).length;
assert.strictEqual(passi, app.SLIDES.length - 1 + battute - gratis, "passi della passata completa");

/* scopri() e' il verbo del clic e della tastiera: scopre le battute e passa
   fra le parti della stessa scena, ma non esce mai dalla scena. Uscire tocca
   al pulsante. */
const scenaN2 = app.SLIDES.findIndex(s => s.t === "scene");
const numeroDi = k => app.STORY.scene[app.SLIDES[k].i].n || app.SLIDES[k].i + 1;
app.vai(scenaN2);
const dentro = numeroDi(scenaN2);
let giri = 0;
while (app.scopri()) {
  assert.strictEqual(numeroDi(app.state.n), dentro, "scopri() e' uscito dalla scena");
  assert.ok(++giri < 200, "scopri() non si ferma mai");
}
assert.ok(giri > 0, "scopri() non ha scoperto nulla");
assert.ok(app.state.n > scenaN2, "scopri() non e' passato alla parte seguente della scena");
assert.ok(app.SLIDES[app.state.n + 1].t !== "scene" || numeroDi(app.state.n + 1) !== dentro,
  "ci si e' fermati con un'altra parte della stessa scena ancora davanti");
/* Il pulsante resta in vista per tutta la schermata e si accende solo alla
   fine: spento a scena aperta, acceso quando le battute sono finite. */
assert.strictEqual(app.restaDaScoprire(), false, "a fine scena resta ancora qualcosa da scoprire");
/* Il pulsante e' markup dentro lo stage, e nella scena non si spegne mai:
   premerlo scopre la battuta seguente e cambia schermata solo alla fine. */
assert.ok(!/disabled/.test(app.pulsanteAvanti()), "a fine scena il pulsante e' ancora spento");
// dove finisce nel DOM non lo dice lo stub (querySelector rende sempre un nodo
// nuovo): quello si guarda nel browser, con una foto
app.vai(scenaN2);
assert.ok(app.etichettaAvanti(), "il pulsante sparisce a scena appena aperta");
assert.ok(!/disabled/.test(app.pulsanteAvanti()), "a scena appena aperta il pulsante e' spento");
const primaBattuta = app.state.step;
app.avanti();
assert.strictEqual(app.state.n, scenaN2, "il pulsante a meta' scena ha cambiato schermata");
assert.strictEqual(app.state.step, primaBattuta + 1, "il pulsante a meta' scena non ha scoperto la battuta");
/* dove invece si sceglie, il pulsante resta spento: saltare costerebbe una
   domanda o una risposta */
app.vai(app.SLIDES.findIndex(s => s.t === "quiz"));
assert.ok(/disabled/.test(app.pulsanteAvanti()), "col quiz aperto il pulsante e' gia' acceso");
app.vai(scenaN2);

// non si torna indietro: nessuna delle strade deve riportare a una schermata precedente
assert.strictEqual(typeof app.indietro, "undefined", "esiste ancora una funzione indietro()");
const dopoFine = app.state.n;
app.avanti();
assert.strictEqual(app.state.n, dopoFine, "dall'ultima schermata si va ancora avanti");

// il punteggio pesa le domande: dieci in tutto, tre solo per il colpevole
const quizN = app.SLIDES.findIndex(s => s.t === "quiz");
const solN = app.SLIDES.findIndex(s => s.t === "sol");
const totali = app.STORY.quiz.reduce((n, q) => n + q.punti, 0);
assert.strictEqual(totali, 10, `i punti in palio sono ${totali}, non 10`);

const sbagliata = q => (q.giusta + 1) % app.SOSPETTI.length;
// risponde bene solo alle domande indicate, male a tutte le altre
const solo = (...giuste) => app.STORY.quiz.map((q, i) => (giuste.includes(i) ? q.giusta : sbagliata(q)));
const mostra = risposte => { app.state.risposte = risposte; app.vai(solN); return stage.innerHTML; };
const punteggio = risposte => app.STORY.quiz.reduce((n, q, i) => n + (risposte[i] === q.giusta ? q.punti : 0), 0);

assert.ok(mostra(app.STORY.quiz.map(q => q.giusta)).includes(`class="score">${totali} `), "il pieno non fa 10");
assert.ok(mostra(app.STORY.quiz.map(sbagliata)).includes('class="score">0 '), "sbagliando tutto non fa 0");

/* Nessuna figura senza immagine. I ritagli neutri di Rosalia e Mauro non sono
   piu' incorporati, perche' ogni scena da' loro una posa: se una scena futura
   li lasciasse scoperti, la figura sparirebbe dal palco senza un rumore. */
const senzaImmagine = [];
app.STORY.scene.forEach((sc, i) => (sc.cast || []).forEach(x => {
  if (!/^data:/.test(app.ATTORE(x.c, i)))
    senzaImmagine.push(`scena ${sc.n}${sc.parte ? " " + sc.parte : ""} · ${x.c}`);
}));
assert.deepStrictEqual(senzaImmagine, [],
  `figure senza ritaglio incorporato: ${senzaImmagine.join(", ")}`);

/* La demo copre sfondi e pose, e non tocca `ASSETS`: e' un velo davanti, non
   una sostituzione. Spegnerla non deve rimettere a posto niente, perche' non
   c'e' niente da rimettere — e questo controllo se ne accerta. */
const scenaConPosa = 0; // scena 1: Mauro usa la posa `guardingo`
const posaPrima = app.ATTORE("Mauro", scenaConPosa);
const assetPrima = JSON.stringify(app.ASSETS);
assert.strictEqual(app.velo(), null, "le sagome demo vengono costruite gia' all'avvio");
app.demo();
assert.ok(app.velo(), "il primo avvio della demo non costruisce le sagome");
assert.notStrictEqual(app.ATTORE("Mauro", scenaConPosa), posaPrima, "la demo non copre una posa di Mauro");
assert.ok(app.ATTORE("Mauro", scenaConPosa).startsWith("data:image/svg+xml"), "la posa demo non e' una sagoma");
assert.ok(app.SCENE_IMG(scenaConPosa).startsWith("data:image/svg+xml"), "la demo non copre lo sfondo");
assert.strictEqual(JSON.stringify(app.ASSETS), assetPrima, "la demo ha modificato ASSETS invece di velarlo");
app.demo();
assert.strictEqual(app.ATTORE("Mauro", scenaConPosa), posaPrima, "spegnendo la demo la posa non torna originale");
assert.strictEqual(JSON.stringify(app.ASSETS), assetPrima, "spegnendo la demo ASSETS non e' quello di prima");

const inventarioPrima = app.attesi();
assert.strictEqual(app.attesi(), inventarioPrima, "l'inventario statico degli asset viene ricostruito");

/* i cinque esiti, e nessun punteggio senza verdetto: senza i tre punti del
   colpevole non si supera il sette, quindi le fasce coprono tutto */
const casi = [
  [solo(0, 1, 2, 3, 4, 5), 10, "Caso risolto perfettamente"],
  [solo(0, 3, 4, 5),        8, "Caso risolto, ma qualcosa non torna"],
  [solo(1, 5),              4, "Caso risolto?"],
  [solo(0, 1, 2, 3, 4),     7, "I dettagli sono chiari"],
  [solo(0, 1),              3, "Qualcosa non torna"],
];
for (const [r, punti, atteso] of casi) {
  assert.strictEqual(punteggio(r), punti, `la prova per "${atteso}" non vale ${punti} punti`);
  assert.ok(mostra(r).includes(atteso), `con ${punti} punti manca il verdetto "${atteso}"`);
}

/* la posa dice l'esito prima delle parole: il pieno, il nome giusto con la
   ricostruzione in piedi, e tutto il resto */
const pose = [
  [casi[0][0], "detective-soluzione.png"],
  [casi[1][0], "detective-osservazione.png"],
  [casi[2][0], "detective-riflessione.png"],
  [casi[3][0], "detective-riflessione.png"],
  [casi[4][0], "detective-riflessione.png"],
];
for (const [r, atteso] of pose) {
  app.state.risposte = r;
  const p = app.POSA_VERDETTO(punteggio(r), r.filter(x => x !== undefined).length);
  assert.strictEqual(p, atteso, `con ${punteggio(r)} punti la posa e' ${p}`);
}
app.state.risposte = [];
assert.strictEqual(app.POSA_VERDETTO(0, 0), "detective-riflessione.png", "scheda in bianco, posa sbagliata");

// la risposta giusta non deve stare sempre nella stessa posizione, e ogni domanda
// deve offrire tutti e quattro i sospetti: si sceglie una persona, non una frase
const posizioni = new Set(app.STORY.quiz.map(q => q.giusta));
assert.ok(posizioni.size >= 3, "le risposte giuste sono tutte nella stessa colonna o quasi");
app.STORY.quiz.forEach((q, i) => {
  assert.ok(!q.opzioni, `la domanda ${i + 1} porta opzioni sue: devono essere i sospetti`);
  assert.ok(q.giusta >= 0 && q.giusta < app.SOSPETTI.length, `domanda ${i + 1}: giusta fuori dai sospetti`);
});
app.state.risposte = [];            // senza risposte la scheda mostra la prima domanda
app.vai(quizN); app.render();
app.SOSPETTI.forEach(c => assert.ok(stage.innerHTML.includes(`>${c}<`), `${c} non e' fra le risposte`));

/* la scheda e' una pagina sola: si vede una domanda alla volta, e quelle chiuse
   restano sopra. Con tre risposte devono esserci tre righe chiuse e una aperta. */
app.state.risposte = [app.STORY.quiz[0].giusta, app.STORY.quiz[1].giusta, app.STORY.quiz[2].giusta];
app.vai(quizN); app.render();
assert.strictEqual((stage.innerHTML.match(/class="fatta"/g) || []).length, 3, "domande chiuse sbagliate");
assert.strictEqual((stage.innerHTML.match(/class="corrente"/g) || []).length, 1, "dev'esserci una domanda aperta sola");
assert.ok(stage.innerHTML.includes(app.STORY.quiz[3].q), "la quarta domanda non compare");
assert.ok(!stage.innerHTML.includes(app.STORY.quiz[4].q), "la quinta domanda compare in anticipo");
app.state.risposte = [];

// il blu si accende sulla scena del malore, ovunque stia nell'elenco:
// dividere una scena non deve far fallire il controllo
const scenaBlu = app.STORY.scene.find(s => s.blu);
assert.ok(scenaBlu, "nessuna scena col flag blu");
assert.strictEqual(scenaBlu.slot || "", "scena4", "il blu non e' sulla scena del malore");
assert.ok(quizN > 0 && app.SLIDES[quizN - 1].t === "narr", "la frase dell'investigatore deve precedere il quiz");

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
// il pulsante per proseguire viene innestato dopo il render: lo stub non lo
// vede finire nello stage, ma il suo markup lo produce comunque l'app
app.vai(0);
[...app.pulsanteAvanti().matchAll(/data-([a-z]+)=/g)].forEach(m => inPagina.add(m[1]));
const decorativi = new Set(["c", "theme", "close"]);   // colore, tema, chiusura dell'overlay
const sordi = [...inPagina].filter(a => !ascoltati.has(a) && !decorativi.has(a));
assert.deepStrictEqual(sordi, [], `data-${sordi.join(", data-")}: in pagina ma non nel gestore del clic`);
// e il contrario: un attributo ascoltato che nessuno disegna piu' e' codice morto
const mai = [...ascoltati].filter(a => !inPagina.has(a));
assert.deepStrictEqual(mai, [], `data-${mai.join(", data-")}: nel gestore del clic ma in nessuna pagina`);

/* Chiudere l'indagine a meta' costa: il pulsante deve chiedere conferma finche'
   restano domande da fare, e passare dritto quando non ne restano. */
const tavoloN = app.SLIDES.findIndex(s => s.t === "tavolo");
app.state.indagine = { scelti: [], chiesto: {} };
app.vai(tavoloN);
assert.strictEqual(app.indagineCompleta(), false, "un'indagine appena aperta risulta gia' completa");
app.apriIndizio(0); app.state.indagine.chiesto[0] = [app.SOSPETTI[0], app.SOSPETTI[1]];
app.state.clue = null;
assert.strictEqual(app.indagineCompleta(), false, "con un oggetto solo l'indagine risulta completa");
app.apriIndizio(1); app.state.indagine.chiesto[1] = [app.SOSPETTI[0]];
app.state.clue = null;
assert.strictEqual(app.indagineCompleta(), false, "con una persona sola sul secondo oggetto risulta completa");
app.state.indagine.chiesto[1] = [app.SOSPETTI[0], app.SOSPETTI[2]];
assert.strictEqual(app.indagineCompleta(), true, "indagine finita ma non riconosciuta come tale");
app.state.indagine = { scelti: [], chiesto: {} };

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
