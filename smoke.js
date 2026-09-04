/* node smoke.js — percorre l'app come farebbe l'investigatore, senza browser.
   Fallisce se una schermata non si disegna o se il conteggio del quiz sbaglia. */
const fs = require("fs"), assert = require("assert");
const { openApp } = require("./stub-dom");
const appHtml = fs.readFileSync("oliva-blu.html", "utf8");
const voiceBenchHtml = fs.readFileSync("voci.html", "utf8");

const CODA = "{state,SLIDES,STORY,goTo,advance,reveal,advanceLabel,hasMoreToReveal,advanceButton,investigationComplete,verdictPose,render,toggleDirector,toggleDevelopment,openClue,askForSolution,overlayElement,MAX_CLUES,MAX_PEOPLE,SUSPECTS,DIRECTOR_ENABLED,DEV_ENABLED,TITLES_ENABLED,actorImage,clueImage,setupImageSlots,sceneNumber,ASSETS,demo,sceneImage,demoLayer:()=>DEMO_LAYER,splitText,VOICE}";
const { app, stage } = openApp(CODA);
assert.deepStrictEqual(Array.from(app.STORY.scene, app.sceneNumber),
  Array.from(app.STORY.scene, (scene, index) => scene.n || index + 1),
  "la numerazione di ripiego delle scene non e' coerente");

// Se la copertina manca deve provare lo sfondo alternativo. Un refactor aveva
// scritto una proprieta' JS arbitraria invece del vero attributo `src`.
{
  let onError;
  let removed = false, empty = false;
  const image = {
    dataset: { fallback: "scena1.png" },
    classList: { contains: () => false },
    addEventListener: (event, callback) => { if (event === "error") onError = callback; },
    closest: () => ({ classList: { add: () => { empty = true; } } }),
    remove: () => { removed = true; },
    complete: false
  };
  app.setupImageSlots({ querySelectorAll: () => [image] });
  onError();
  assert.strictEqual(image.src, "scena1.png", "il ripiego dell'immagine non viene caricato");
  assert.strictEqual(image.dataset.fallback, undefined, "il ripiego puo' entrare in ciclo");
  onError();
  assert.ok(removed && empty, "un ripiego mancante non viene rimosso correttamente");
}

/* Senza `assets/assets.js` l'app deve partire lo stesso: le immagini mancano e
   ogni casella cade sul suo ripiego tipografico, ma la storia si vede. Prima
   del ripiego la prima immagine sollevava ReferenceError e lo schermo restava
   nero — ed e' esattamente cio' che succede a chi apre il file da solo o lo
   pubblica come pagina singola. */
{
  const { app: senzaImmagini, stage: stageNudo } =
    openApp("{goTo,SLIDES,IMAGES}", undefined, undefined, true);
  // niente deepStrictEqual: fra due realm di `vm` non e' mai uguale a niente
  assert.strictEqual(Object.keys(senzaImmagini.IMAGES).length, 0, "senza assets.js IMAGES non e' vuota");
  senzaImmagini.goTo(3);
  assert.ok(stageNudo.innerHTML.length > 500, "senza assets.js l'app non disegna piu' niente");
}

// File fisici e chiavi ASSETS condividono la convenzione underscore-only.
// La pipeline blocca i sorgenti sbagliati; questo protegge anche il contratto HTML.
const hyphenatedAssets = Object.keys(app.ASSETS).filter(k => k.includes("-"));
assert.deepStrictEqual(hyphenatedAssets, [],
  `chiavi ASSETS con trattini: ${hyphenatedAssets.join(", ")}`);
const clueIds = Array.from(app.STORY.oggetti, o => o.id);
assert.strictEqual(new Set(clueIds).size, app.STORY.oggetti.length, "ID degli indizi duplicati");
clueIds.forEach((id, i) => {
  assert.match(id, /^[a-z0-9_]+$/, `ID indizio non valido: ${id}`);
  assert.strictEqual(app.clueImage(i), app.ASSETS[`indizio_${id}.png`],
    `l'immagine dell'indizio ${id} non deriva dal suo ID`);
});

// ogni schermata si disegna e produce contenuto
for (let i = 0; i < app.SLIDES.length; i++) {
  app.goTo(i);
  assert.ok(stage.innerHTML.length > 100, `schermata ${i} (${app.SLIDES[i].t}) vuota`);
}

// una passata completa in avanti tocca ogni battuta e finisce sull'ultima schermata
app.goTo(0);
let steps = 0;
while (app.state.n < app.SLIDES.length - 1 && steps < 500) { app.advance(); steps++; }
const dialogueCount = app.STORY.scene.reduce((n, s) => n + s.battute.length, 0);
/* una scena si apre con la prima battuta gia' scoperta: quel passo non si fa */
const freeReveals = app.STORY.scene.filter(s => s.battute.length).length;
assert.strictEqual(steps, app.SLIDES.length - 1 + dialogueCount - freeReveals, "passi della passata completa");

/* scopri() e' il verbo del clic e della tastiera: scopre le battute e passa
   fra le parti della stessa scena, ma non esce mai dalla scena. Uscire tocca
   al pulsante. */
const firstSceneIndex = app.SLIDES.findIndex(s => s.t === "scene");
const storySceneNumber = k => app.STORY.scene[app.SLIDES[k].i].n || app.SLIDES[k].i + 1;
app.goTo(firstSceneIndex);
const startingScene = storySceneNumber(firstSceneIndex);
let revealCount = 0;
while (app.reveal()) {
  assert.strictEqual(storySceneNumber(app.state.n), startingScene, "scopri() e' uscito dalla scena");
  assert.ok(++revealCount < 200, "scopri() non si ferma mai");
}
assert.ok(revealCount > 0, "scopri() non ha scoperto nulla");
assert.ok(app.state.n > firstSceneIndex, "scopri() non e' passato alla parte seguente della scena");
assert.ok(app.SLIDES[app.state.n + 1].t !== "scene" || storySceneNumber(app.state.n + 1) !== startingScene,
  "ci si e' fermati con un'altra parte della stessa scena ancora davanti");
/* Il pulsante resta in vista per tutta la schermata e si accende solo alla
   fine: spento a scena aperta, acceso quando le battute sono finite. */
assert.strictEqual(app.hasMoreToReveal(), false, "a fine scena resta ancora qualcosa da scoprire");
/* Il pulsante e' markup dentro lo stage, e nella scena non si spegne mai:
   premerlo scopre la battuta seguente e cambia schermata solo alla fine. */
assert.ok(!/disabled/.test(app.advanceButton()), "a fine scena il pulsante e' ancora spento");
// dove finisce nel DOM non lo dice lo stub (querySelector rende sempre un nodo
// nuovo): quello si guarda nel browser, con una foto
app.goTo(firstSceneIndex);
assert.ok(app.advanceLabel(), "il pulsante sparisce a scena appena aperta");
assert.ok(!/disabled/.test(app.advanceButton()), "a scena appena aperta il pulsante e' spento");
const initialLine = app.state.step;
app.advance();
assert.strictEqual(app.state.n, firstSceneIndex, "il pulsante a meta' scena ha cambiato schermata");
assert.strictEqual(app.state.step, initialLine + 1, "il pulsante a meta' scena non ha scoperto la battuta");
/* dove invece si sceglie, il pulsante resta spento: saltare costerebbe una
   domanda o una risposta */
app.goTo(app.SLIDES.findIndex(s => s.t === "quiz"));
assert.ok(/disabled/.test(app.advanceButton()), "col quiz aperto il pulsante e' gia' acceso");
app.goTo(firstSceneIndex);

// non si torna indietro: nessuna delle strade deve riportare a una schermata precedente
assert.strictEqual(typeof app.indietro, "undefined", "esiste ancora una funzione indietro()");
const indexAfterEnding = app.state.n;
app.advance();
assert.strictEqual(app.state.n, indexAfterEnding, "dall'ultima schermata si va ancora avanti");

// il punteggio pesa le domande: dieci in tutto, tre solo per il colpevole
const quizIndex = app.SLIDES.findIndex(s => s.t === "quiz");
const resultIndex = app.SLIDES.findIndex(s => s.t === "sol");
const totalPoints = app.STORY.quiz.reduce((n, q) => n + q.punti, 0);
assert.strictEqual(totalPoints, 10, `i punti in palio sono ${totalPoints}, non 10`);

const wrongAnswer = q => (q.giusta + 1) % app.SUSPECTS.length;
// risponde bene solo alle domande indicate, male a tutte le altre
const answersOnly = (...giuste) => app.STORY.quiz.map((q, i) => (giuste.includes(i) ? q.giusta : wrongAnswer(q)));
const renderAnswers = risposte => { app.state.risposte = risposte; app.goTo(resultIndex); return stage.innerHTML; };
const score = risposte => app.STORY.quiz.reduce((n, q, i) => n + (risposte[i] === q.giusta ? q.punti : 0), 0);

assert.ok(renderAnswers(app.STORY.quiz.map(q => q.giusta)).includes(`class="score">${totalPoints} `), "il pieno non fa 10");
assert.ok(renderAnswers(app.STORY.quiz.map(wrongAnswer)).includes('class="score">0 '), "sbagliando tutto non fa 0");

/* Nessuna figura senza immagine. I ritagli neutri di Rosalia e Mauro non sono
   piu' incorporati, perche' ogni scena da' loro una posa: se una scena futura
   li lasciasse scoperti, la figura sparirebbe dal palco senza un rumore.
   Si controlla chi sta in scena **e chi parla**: guardare solo il `cast` ha
   lasciato passare la seconda parte della scena 1, dove il palco e' il piatto
   del biglietto e i due parlano fuori campo — la figura accanto alla battuta
   chiedeva `attore_mauro.png`, che non esiste piu'. */
const missingActorImages = [];
app.STORY.scene.forEach((sc, i) => {
  const inGioco = new Set([...(sc.cast || []).map(x => x.c), ...sc.battute.map(b => b.c)]);
  inGioco.forEach(c => {
    if (!/^data:/.test(app.actorImage(c, i)))
      missingActorImages.push(`scena ${sc.n}${sc.parte ? " " + sc.parte : ""} · ${c}`);
  });
});
assert.deepStrictEqual(missingActorImages, [],
  `figure senza ritaglio incorporato: ${missingActorImages.join(", ")}`);

/* La demo copre sfondi e pose, e non tocca `ASSETS`: e' un velo davanti, non
   una sostituzione. Spegnerla non deve rimettere a posto niente, perche' non
   c'e' niente da rimettere — e questo controllo se ne accerta. */
const sceneWithPose = 0; // scena 1: Mauro usa la posa `guardingo`
const originalPoseImage = app.actorImage("Mauro", sceneWithPose);
const originalAssets = JSON.stringify(app.ASSETS);
assert.strictEqual(app.demoLayer(), null, "le sagome demo vengono costruite gia' all'avvio");
app.demo();
assert.ok(app.demoLayer(), "il primo avvio della demo non costruisce le sagome");
assert.notStrictEqual(app.actorImage("Mauro", sceneWithPose), originalPoseImage, "la demo non copre una posa di Mauro");
assert.ok(app.actorImage("Mauro", sceneWithPose).startsWith("data:image/svg+xml"), "la posa demo non e' una sagoma");
assert.ok(app.sceneImage(sceneWithPose).startsWith("data:image/svg+xml"), "la demo non copre lo sfondo");
/* Il velo deve coprire tutto quello che una scena disegna. I due tavoli in
   primo piano restavano dipinti davanti alle sagome, ed e' quello che copre
   di piu': provare le posizioni con quelli addosso non serviva a niente. */
{
  const scoperte = new Set();
  app.SLIDES.forEach((slide, index) => {
    if (slide.t !== "scene") return;
    app.goTo(index);
    app.state.step = app.STORY.scene[slide.i].battute.length;
    app.render();
    for (const m of stage.innerHTML.matchAll(/src="([^"]+)"/g))
      if (!/^data:image\/svg\+xml/.test(m[1])) scoperte.add(m[1].slice(0, 40));
  });
  assert.deepStrictEqual([...scoperte], [], "con la demo accesa una scena mostra ancora un disegno vero");
}
assert.strictEqual(JSON.stringify(app.ASSETS), originalAssets, "la demo ha modificato ASSETS invece di velarlo");
app.demo();
assert.strictEqual(app.actorImage("Mauro", sceneWithPose), originalPoseImage, "spegnendo la demo la posa non torna originale");
assert.strictEqual(JSON.stringify(app.ASSETS), originalAssets, "spegnendo la demo ASSETS non e' quello di prima");


/* Il ritmo delle sillabe taglia la battuta in pezzi: rimessi insieme devono
   ridare la battuta esatta, spazi compresi, o quello che si legge in pagina
   non sarebbe piu' il copione. */
app.STORY.scene.forEach(sc => sc.battute.forEach(b => {
  const v = app.VOICE[b.c];
  if (!v) return;
  const n = Math.max(3, Math.min(16, Math.round(b.t.length / v.den)));
  assert.strictEqual(app.splitText(b.t, n).join(""), b.t,
    `il ritmo perde qualcosa della battuta: «${b.t}»`);
}));

/* i cinque esiti, e nessun punteggio senza verdetto: senza i tre punti del
   colpevole non si supera il sette, quindi le fasce coprono tutto */
const scoreCases = [
  [answersOnly(0, 1, 2, 3, 4, 5), 10, "Caso risolto perfettamente"],
  [answersOnly(0, 3, 4, 5),        8, "Caso risolto, ma qualcosa non torna"],
  [answersOnly(1, 5),              4, "Caso risolto?"],
  [answersOnly(0, 1, 2, 3, 4),     7, "I dettagli sono chiari"],
  [answersOnly(0, 1),              3, "Qualcosa non torna"],
];
for (const [r, punti, atteso] of scoreCases) {
  assert.strictEqual(score(r), punti, `la prova per "${atteso}" non vale ${punti} punti`);
  assert.ok(renderAnswers(r).includes(atteso), `con ${punti} punti manca il verdetto "${atteso}"`);
}

/* la posa dice l'esito prima delle parole: il pieno, il nome giusto con la
   ricostruzione in piedi, e tutto il resto */
const pose = [
  [scoreCases[0][0], "detective_soluzione.png"],
  [scoreCases[1][0], "detective_osservazione.png"],
  [scoreCases[2][0], "detective_riflessione.png"],
  [scoreCases[3][0], "detective_riflessione.png"],
  [scoreCases[4][0], "detective_riflessione.png"],
];
for (const [r, atteso] of pose) {
  app.state.risposte = r;
  const p = app.verdictPose(score(r), r.filter(x => x !== undefined).length);
  assert.strictEqual(p, atteso, `con ${score(r)} punti la posa e' ${p}`);
}
app.state.risposte = [];
assert.strictEqual(app.verdictPose(0, 0), "detective_riflessione.png", "scheda in bianco, posa sbagliata");

// la risposta giusta non deve stare sempre nella stessa posizione, e ogni domanda
// deve offrire tutti e quattro i sospetti: si sceglie una persona, non una frase
const correctPositions = new Set(app.STORY.quiz.map(q => q.giusta));
assert.ok(correctPositions.size >= 3, "le risposte giuste sono tutte nella stessa colonna o quasi");
app.STORY.quiz.forEach((q, i) => {
  assert.ok(!q.opzioni, `la domanda ${i + 1} porta opzioni sue: devono essere i sospetti`);
  assert.ok(q.giusta >= 0 && q.giusta < app.SUSPECTS.length, `domanda ${i + 1}: giusta fuori dai sospetti`);
});
app.state.risposte = [];            // senza risposte la scheda mostra la prima domanda
app.goTo(quizIndex); app.render();
app.SUSPECTS.forEach(c => assert.ok(stage.innerHTML.includes(`>${c}<`), `${c} non e' fra le risposte`));

/* la scheda e' una pagina sola: si vede una domanda alla volta, e quelle chiuse
   restano sopra. Con tre risposte devono esserci tre righe chiuse e una aperta. */
app.state.risposte = [app.STORY.quiz[0].giusta, app.STORY.quiz[1].giusta, app.STORY.quiz[2].giusta];
app.goTo(quizIndex); app.render();
assert.strictEqual((stage.innerHTML.match(/class="fatta"/g) || []).length, 3, "domande chiuse sbagliate");
assert.strictEqual((stage.innerHTML.match(/class="corrente"/g) || []).length, 1, "dev'esserci una domanda aperta sola");
assert.ok(stage.innerHTML.includes(app.STORY.quiz[3].q), "la quarta domanda non compare");
assert.ok(!stage.innerHTML.includes(app.STORY.quiz[4].q), "la quinta domanda compare in anticipo");
app.state.risposte = [];

// il blu si accende sulla scena del malore, ovunque stia nell'elenco:
// dividere una scena non deve far fallire il controllo
const blueScene = app.STORY.scene.find(s => s.blu);
assert.ok(blueScene, "nessuna scena col flag blu");
assert.strictEqual(blueScene.slot || "", "scena3_malore", "il blu non e' sulla scena del malore");
for (const slot of ["scena3_brindisi", "scena3_malore", "indagine"])
  assert.ok(app.STORY.scene.some(s => s.slot === slot), `manca lo slot semantico ${slot}`);
assert.ok(quizIndex > 0 && app.SLIDES[quizIndex - 1].t === "narr", "la frase dell'investigatore deve precedere il quiz");

// Il confronto e' ordinato e bidirezionale: non bastava cercare ogni frase
// nell'HTML, dove una copia vecchia fuori da STORY poteva nascondere un errore.
const scriptText = fs.readFileSync("copione.txt", "utf8").replace(/\r/g, "");
const scriptLines = [...scriptText.matchAll(/«([^»]+)»/g)].map(m => m[1]);
assert.ok(scriptLines.length >= 35, `copione.txt: solo ${scriptLines.length} battute trovate`);
const applicationLines = [];
app.STORY.scene.forEach(s => s.battute.forEach(b => applicationLines.push(b.t)));
assert.deepStrictEqual(applicationLines, scriptLines, "STORY e copione.txt hanno battute diverse o in ordine diverso");

// l'indagine ha un prezzo: due indizi soli, e due persone per indizio
app.goTo(app.SLIDES.findIndex(s => s.t === "tavolo"));
[0, 1, 2, 3].forEach(app.openClue);
assert.strictEqual(app.state.indagine.scelti.length, app.MAX_CLUES,
  `il tavolo ha aperto ${app.state.indagine.scelti.length} indizi invece di ${app.MAX_CLUES}`);
assert.ok(!app.state.indagine.scelti.includes(2), "il terzo indizio non doveva aprirsi");
// ogni oggetto ha una risposta per ognuno dei quattro sospetti, e la vittima non e' fra loro
assert.strictEqual(app.SUSPECTS.length, 4, `sospetti: ${app.SUSPECTS.join(", ")}`);
assert.ok(!app.SUSPECTS.includes("Giuseppe"), "la vittima non puo' essere interrogata");
app.STORY.oggetti.forEach(o => app.SUSPECTS.forEach(c =>
  assert.ok(o.risposte?.[c], `manca la risposta di ${c} su "${o.nome}"`)));

// su un oggetto si interrogano due persone, non tre
const glassClue = app.STORY.oggetti[0];
app.state.indagine.chiesto[0] = ["Mauro", "Augusto", "Rosalia"].slice(0, 0);
app.state.clue = 0;
["Mauro", "Augusto", "Rosalia"].forEach(c => {
  const gia = app.state.indagine.chiesto[0] || [];
  if (!gia.includes(c) && gia.length < app.MAX_PEOPLE) app.state.indagine.chiesto[0] = [...gia, c];
});
assert.strictEqual(app.state.indagine.chiesto[0].length, app.MAX_PEOPLE,
  "si sono interrogate piu' persone del consentito su un oggetto");
app.render();
["Mauro", "Augusto"].forEach(c =>
  assert.ok(stage.innerHTML.includes(glassClue.risposte[c]), `${c} e' stato interrogato ma non risponde`));
assert.ok(!stage.innerHTML.includes(glassClue.risposte.Rosalia), "risponde anche chi non e' stato interrogato");
app.state.clue = null; app.state.indagine.chiesto[0] = [];

/* Un `data-nome` scritto nel markup si legge `dataset.nome`, e i due possono
   divergere in silenzio: rinominando le funzioni in inglese `dataset.avanti`
   e' diventato `dataset.advance` e `dataset.opt` e' diventato
   `dataset.optionalImage`, cosi' il pulsante «Prosegui» e le risposte della
   scheda hanno smesso di funzionare senza che nessun controllo se ne
   accorgesse — la sonda finta non recapita clic veri. */
{
  const sorgente = fs.readFileSync("oliva-blu.html", "utf8");
  const scritti = [...new Set([...sorgente.matchAll(/\sdata-([a-z][a-z0-9-]*)=/g)].map(m => m[1]))]
    .filter(k => !["theme", "c", "close", "prof", "salta"].includes(k));
  const senzaLettore = scritti.filter(k => !sorgente.includes(`dataset.${k}`));
  assert.deepStrictEqual(senzaLettore, [],
    `data-* scritti ma mai letti come dataset.<nome>: ${senzaLettore.join(", ")}`);
}

// Ogni data-* che compare in pagina dev'essere nell'elenco del gestore del clic,
// o il pulsante si disegna e non risponde: e' successo con `data-avanti`.
const appSource = appHtml;
const handledAttributes = new Set([...appSource.match(/closest\("(\[data-[^"]+)"\)/)[1].matchAll(/data-([a-z]+)/g)].map(m => m[1]));
const renderedAttributes = new Set();
for (let i = 0; i < app.SLIDES.length; i++) {
  app.goTo(i);
  [...stage.innerHTML.matchAll(/data-([a-z]+)=/g)].forEach(m => renderedAttributes.add(m[1]));
}
app.state.clue = 0; app.goTo(app.SLIDES.findIndex(x => x.t === "tavolo")); app.state.clue = 0; app.render();
[...stage.innerHTML.matchAll(/data-([a-z]+)=/g)].forEach(m => renderedAttributes.add(m[1]));
app.state.clue = null;
// il pulsante per proseguire viene innestato dopo il render: lo stub non lo
// vede finire nello stage, ma il suo markup lo produce comunque l'app
app.goTo(0);
[...app.advanceButton().matchAll(/data-([a-z]+)=/g)].forEach(m => renderedAttributes.add(m[1]));
const decorativeAttributes = new Set(["c", "theme", "close", "fallback"]); // presentazione, non azioni
const unhandledAttributes = [...renderedAttributes].filter(a => !handledAttributes.has(a) && !decorativeAttributes.has(a));
assert.deepStrictEqual(unhandledAttributes, [], `data-${unhandledAttributes.join(", data-")}: in pagina ma non nel gestore del clic`);
// e il contrario: un attributo ascoltato che nessuno disegna piu' e' codice morto
const unusedAttributes = [...handledAttributes].filter(a => !renderedAttributes.has(a));
assert.deepStrictEqual(unusedAttributes, [], `data-${unusedAttributes.join(", data-")}: nel gestore del clic ma in nessuna pagina`);

/* Chiudere l'indagine a meta' costa: il pulsante deve chiedere conferma finche'
   restano domande da fare, e passare dritto quando non ne restano. */
const tavoloN = app.SLIDES.findIndex(s => s.t === "tavolo");
app.state.indagine = { scelti: [], chiesto: {} };
app.goTo(tavoloN);
assert.strictEqual(app.investigationComplete(), false, "un'indagine appena aperta risulta gia' completa");
app.openClue(0); app.state.indagine.chiesto[0] = [app.SUSPECTS[0], app.SUSPECTS[1]];
app.state.clue = null;
assert.strictEqual(app.investigationComplete(), false, "con un oggetto answersOnly l'indagine risulta completa");
app.openClue(1); app.state.indagine.chiesto[1] = [app.SUSPECTS[0]];
app.state.clue = null;
assert.strictEqual(app.investigationComplete(), false, "con una persona sola sul secondo oggetto risulta completa");
app.state.indagine.chiesto[1] = [app.SUSPECTS[0], app.SUSPECTS[2]];
assert.strictEqual(app.investigationComplete(), true, "indagine finita ma non riconosciuta come tale");
app.state.indagine = { scelti: [], chiesto: {} };

// il tavolo degli indizi cita battute a mano: devono esistere davvero, e il numero
// di scena dev'essere quello giusto - rinumerare una scena le lasciava indietro
const sceneByLine = new Map();
app.STORY.scene.forEach((s, i) => s.battute.forEach(b => sceneByLine.set(b.t, s.n || i + 1)));
// Array.from: gli array del contesto vm hanno un altro prototipo, deepStrictEqual li rifiuta
const invalidReferences = Array.from(app.STORY.oggetti.flatMap(o => o.refs))
  .filter(r => sceneByLine.get(r.t) !== r.s)
  .map(r => `${r.t} → dice scena ${r.s}, è la ${sceneByLine.get(r.t) ?? "nessuna"}`);
assert.deepStrictEqual(invalidReferences, [], `citazioni del tavolo sbagliate: ${invalidReferences.join(" | ")}`);

// gli strumenti d'autore: aperti da disco ci sono, sul sito pubblico no
assert.ok(app.DIRECTOR_ENABLED && app.DEV_ENABLED, "da file locale regia e sviluppo devono esserci");

/* L'artefatto e' l'altra superficie d'autore: legare gli strumenti al solo
   `file:` li faceva sparire proprio dove si lavora. */
for (const host of ["claude.ai", "anteprima.claudeusercontent.com"]) {
  const { app: artefatto } = openApp(CODA, { protocol: "https:", hostname: host });
  assert.ok(artefatto.DIRECTOR_ENABLED && artefatto.DEV_ENABLED && artefatto.TITLES_ENABLED,
    `su ${host} gli strumenti d'autore devono esserci`);
}
const sceneIndex = app.SLIDES.findIndex(s => s.t === "scene");
app.goTo(sceneIndex); app.toggleDirector();
assert.strictEqual(app.state.directorMode, true, "la regia non si accende in locale");
app.toggleDirector(); app.toggleDevelopment();
assert.strictEqual(app.state.developmentMode, true, "lo sviluppo non si accende in locale");

const { app: pub, stage: palcoPub } = openApp(CODA, { protocol: "https:", hostname: "viridjan.github.io" });
assert.ok(!pub.DIRECTOR_ENABLED && !pub.DEV_ENABLED, "sul sito pubblico non devono esserci regia ne' sviluppo");
// il titolo di una scena la racconta prima che accada: online non deve uscire
assert.ok(!pub.TITLES_ENABLED && app.TITLES_ENABLED, "i titoli di scena vanno mostrati solo dove si lavora");
pub.goTo(pub.SLIDES.findIndex(s => s.t === "scene"));
assert.ok(!palcoPub.innerHTML.includes("scene-head"), "intestazione di scena visibile sul sito pubblico");
pub.goTo(sceneIndex); pub.toggleDirector(); pub.toggleDevelopment();
assert.strictEqual(pub.state.directorMode, false, "la regia si accende sul sito pubblico");
assert.strictEqual(pub.state.developmentMode, false, "lo sviluppo si accende sul sito pubblico");
const { app: dominio } = openApp(CODA, { protocol: "https:", hostname: "oliviani.example" });
assert.ok(!dominio.DIRECTOR_ENABLED && !dominio.DEV_ENABLED && !dominio.TITLES_ENABLED,
  "gli strumenti d'autore si accendono su un dominio pubblico non GitHub");

// il banco voci ha una copia deliberata del motore: i profili devono restare
// identici, o si accordano le voci su una pagina e si recita con quelle dell'altra
const voiceProfiles = t => Object.fromEntries([...t.matchAll(/^ *(Giuseppe|Rosalia|Roberto|Augusto|Mauro): *(\{[^}]*\})/gm)]
  .map(m => [m[1], m[2].replace(/\s+/g, "")]));
const benchProfiles = voiceProfiles(voiceBenchHtml);
const appProfiles = voiceProfiles(appHtml);
assert.strictEqual(Object.keys(appProfiles).length, 5, `nell'app trovo ${Object.keys(appProfiles).length} profili di voce, non 5`);
assert.deepStrictEqual(benchProfiles, appProfiles, "i profili di voce di voci.html e oliva-blu.html sono diversi");

// Nelle conferme con un'azione alternativa ("Ritenta") non esiste data-close:
// deve prendere il focus proprio quel pulsante, non l'azione distruttiva.
app.askForSolution();
assert.strictEqual(app.overlayElement.focusedSelector, "[data-close],#ov-no",
  "la conferma della soluzione non mette il focus su Ritenta");

// Web Audio comportamentale: la seconda battuta scollega l'uscita della prima
// e ogni oscillatore termina liberando il filtro condiviso della propria frase.
const audioEvents = [];
const parameter = () => ({ value: 0, cancelScheduledValues() {}, setValueAtTime() {},
  exponentialRampToValueAtTime() {} });
const node = type => ({ type, gain: parameter(), frequency: parameter(), Q: parameter(),
  connect(target) { audioEvents.push(["connect", type, target.type]); return target; },
  disconnect() { audioEvents.push(["disconnect", type]); },
  addEventListener(event, callback) { if (event === "ended") this.onended = callback; },
  start() {}, stop() { this.onended?.(); } });
class FakeAudioContext {
  constructor() { this.currentTime = 0; this.state = "running"; this.destination = { type: "destination" }; }
  createBiquadFilter() { return node("filter"); }
  createGain() { return node("gain"); }
  createOscillator() { return node("oscillator"); }
  resume() { return Promise.resolve(); }
}
const { app: audioApp } = openApp("{speak,setVolume}", undefined, { AudioContext: FakeAudioContext });
audioApp.setVolume(.7, false);
audioApp.speak("Giuseppe", "prima battuta");
const disconnectedBefore = audioEvents.filter(e => e[0] === "disconnect" && e[1] === "gain").length;
audioApp.speak("Rosalia", "seconda battuta");
assert.strictEqual(audioEvents.filter(e => e[0] === "disconnect" && e[1] === "gain").length,
  disconnectedBefore + 1, "la nuova voce non interrompe la precedente");
assert.ok(audioEvents.some(e => e.join(":") === "connect:filter:gain"),
  "il filtro audio non passa dal gain della battuta");
assert.ok(audioEvents.some(e => e[0] === "disconnect" && e[1] === "filter"),
  "il filtro audio non viene liberato alla fine della battuta");

console.log(`copione: ${scriptLines.length} battute verificate`);
console.log(`ok — ${app.SLIDES.length} schermate, ${dialogueCount} battute, quiz verificato`);
