/* node smoke.js — percorre l'app come farebbe l'investigatore, senza browser.
   Fallisce se una schermata non si disegna o se il conteggio del quiz sbaglia. */
const fs = require("fs"), assert = require("assert");
const { openApp } = require("./stub-dom");
const appHtml = fs.readFileSync("oliva-blu.html", "utf8");
const voiceBenchHtml = fs.readFileSync("voci.html", "utf8");

const CODA = "{state,SLIDES,STORY,stageOrder,changeDepth,goTo,advance,reveal,advanceLabel,hasMoreToReveal,advanceButton,confirmAndAdvance,closeOverlay,questionsAsked,timePenalty,QUESTIONS_PER_POINT,verdictPose,render,toggleDirector,toggleDevelopment,openClue,askForSolution,overlayElement,SUSPECTS,DIRECTOR_ENABLED,DEV_ENABLED,TITLES_ENABLED,actorImage,clueImage,setupImageSlots,sceneNumber,ASSETS,demo,sceneImage,demoLayer:()=>DEMO_LAYER,splitText,VOICE}";
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

/* La copia a pagina sola per l'artefatto, se qualcuno l'ha generata, dev'essere
   questa app e non una di ieri: pubblicarne una vecchia e' il modo silenzioso di
   mandare in giro una storia che non e' piu' quella. Si confronta tutto tranne
   il blocco delle immagini, che nei due file sta in posti diversi. */
{
  const singleFile = "oliva-blu-completo.html";
  if (fs.existsSync(singleFile)) {
    const senzaMappa = t => t
      .replace(/<script src="assets\/assets\.js[^"]*"><\/script>\n?/, "")
      .replace(/<script>\n\/\* Generato da sync-assets\.py[\s\S]*?<\/script>\n?/, "");
    /* Si confrontano le impronte, non i due testi: `strictEqual` su 4MB stampa
       l'intero file come diff, e il messaggio utile ci annega dentro. */
    const impronta = t => require("crypto").createHash("sha256").update(senzaMappa(t)).digest("hex");
    assert.strictEqual(impronta(fs.readFileSync(singleFile, "utf8")), impronta(appHtml),
      `${singleFile} non e' piu' questa app: rigenerala con python3 sync-assets.py --file-unico`);
  }
}

/* La pagina dei personaggi non deve intrappolare il pulsante. `reveal()` li'
   scorre di una scheda e restituisce true finche' ce n'e' un'altra; se
   restituisse true per sempre, `advance()` non cambierebbe mai schermata e il
   pulsante resterebbe premibile e muto — che e' esattamente il guasto visto su
   alcuni dispositivi l'8 settembre 2026, dove `scrollIntoView` dentro un
   contenitore con snap obbligatorio non spostava niente. */
{
  const castIndex = app.SLIDES.findIndex(x => x.t === "cast");
  app.goTo(castIndex);
  let passi = 0;
  while (app.state.n === castIndex && passi < 20) { app.advance(); passi++; }
  assert.notStrictEqual(app.state.n, castIndex,
    "dalla pagina dei personaggi il pulsante non porta mai fuori");
}

/* `[` e `]` devono muovere di un posto nell'ordine che si vede, non nell'elenco,
   e di un posto solo anche quando piu' figure condividono lo stesso piano.
   Le prove girano su una copia dell'app con un cast finto, cosi' la scena vera
   non viene toccata: e' l'ordine che si controlla, non la regia approvata. */
{
  const conFixture = (cast, primo, fn) => {
    const { app: a } = openApp("{STORY,SLIDES,state,goTo,stageOrder,changeDepth}");
    const k = a.SLIDES.findIndex(x => x.t === "scene");
    a.goTo(k);
    const sc = a.STORY.scene[a.SLIDES[k].i];
    sc.cast = cast; sc.primo = primo;
    /* join, non l'array: fra due realm di `vm` `deepStrictEqual` non e' mai
       soddisfatto nemmeno a contenuto identico. */
    const ordine = () => a.stageOrder(sc).map(e => e.dato.c || e.dato.lato).join(" ");
    return fn(a, sc, ordine);
  };
  const attore = (c, z) => z === undefined ? { c, x: 0, b: 0, h: 1 } : { c, z, x: 0, b: 0, h: 1 };

  // pari merito: era il caso che rompeva lo scambio di piani fra vicini
  conFixture([attore("Giuseppe", 2), attore("Rosalia", 1), attore("Roberto", 1)], [], (a, sc, ordine) => {
    assert.strictEqual(ordine(), "Rosalia Roberto Giuseppe", "ordine di partenza inatteso");
    a.changeDepth(-1, { dato: sc.cast[0] });
    assert.strictEqual(ordine(), "Rosalia Giuseppe Roberto",
      "[ con dei pari merito salta piu' di un posto");
  });

  // avanti, e il ritorno deve rimettere l'ordine di partenza
  conFixture([attore("Giuseppe", 2), attore("Rosalia", 1), attore("Roberto", 1)], [], (a, sc, ordine) => {
    const prima = ordine();
    a.changeDepth(1, { dato: sc.cast[1] });
    assert.strictEqual(ordine(), "Roberto Rosalia Giuseppe", "] non avanza di un posto");
    a.changeDepth(-1, { dato: sc.cast[1] });
    assert.strictEqual(ordine(), prima, "andata e ritorno non riportano l'ordine di partenza");
  });

  // pari merito fra un attore e un oggetto: a parita' di z decide il markup
  conFixture([attore("A", 5)], [{ lato: "sx", x: 0, b: 0, h: 1 }], (a, sc, ordine) => {
    assert.strictEqual(ordine(), "A sx", "ordine di partenza inatteso (attore/oggetto)");
    a.changeDepth(1, { dato: sc.cast[0] });
    assert.strictEqual(ordine(), "sx A", "] non scavalca l'oggetto in pari merito");
    a.changeDepth(-1, { dato: sc.cast[0] });
    assert.strictEqual(ordine(), "A sx", "[ non torna dietro l'oggetto");
  });

  conFixture([attore("A", 5)], [{ lato: "sx", x: 0, b: 0, h: 1 }], (a, sc, ordine) => {
    for (let i = 0; i < 12; i++) {
      a.changeDepth(1, { dato: sc.cast[0] });
      assert.strictEqual(ordine(), "sx A");
      assert.strictEqual(sc.cast[0].z, 6, "profondita' cresce a ogni giro");
      assert.strictEqual(sc.primo[0].z, undefined, "oggetto non mosso rinumerato");
      a.changeDepth(-1, { dato: sc.cast[0] });
      assert.strictEqual(ordine(), "A sx");
      assert.strictEqual(sc.cast[0].z, undefined, "ritorno non normalizzato");
    }
  });

  // agli estremi non c'e' dove andare
  conFixture([attore("A"), attore("B")], [], (a, sc, ordine) => {
    a.changeDepth(-1, { dato: sc.cast[0] });
    a.changeDepth(1, { dato: sc.cast[1] });
    assert.strictEqual(ordine(), "A B", "ai due estremi qualcosa si e' mosso");
  });
}

/* Sulla scena vera: l'ordine torna quello di partenza, e nessuno `z` esplicito
   e' di troppo — toglierne uno qualsiasi deve cambiare quello che si vede.
   Non si pretende che i numeri tornino identici: fra i piani validi si sceglie
   sempre il piu' basso, quindi un giro puo' semplificarli. */
{
  const scenaConZ = app.SLIDES.findIndex(x => x.t === "scene"
    && (app.STORY.scene[x.i].cast || []).some(a => a.z !== undefined));
  assert.notStrictEqual(scenaConZ, -1, "nessuna scena con uno z esplicito da provare");
  app.goTo(scenaConZ);
  const sc = app.STORY.scene[app.SLIDES[scenaConZ].i];
  const conZ = sc.cast.find(a => a.z !== undefined);
  const nomi = () => app.stageOrder(sc).map(e => e.dato.c || e.dato.lato).join(" ");
  const prima = nomi();
  const posto = () => app.stageOrder(sc).findIndex(e => e.dato === conZ);
  const partenza = posto();

  app.changeDepth(-1, { dato: conZ });
  assert.strictEqual(posto(), partenza - 1,
    `[ non arretra di un posto nell'ordine visivo: ${prima} -> ${nomi()}`);
  app.changeDepth(1, { dato: conZ });
  assert.strictEqual(nomi(), prima, "andata e ritorno cambiano l'ordine visivo");

  [...sc.cast, ...(sc.primo || [])].filter(e => e.z !== undefined).forEach(e => {
    const z = e.z; delete e.z;
    const senza = nomi(); e.z = z;
    assert.notStrictEqual(senza, prima,
      `z:${z} su ${e.c || e.lato} non serve a niente: toglierlo non cambia l'ordine`);
  });

  // sullo sfondo i due comandi non fanno niente: sta sotto a tutti per definizione
  app.changeDepth(1, { sfondo: true, dato: {} });
  assert.strictEqual(nomi(), prima, "[ o ] hanno mosso qualcosa partendo dallo sfondo");
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
  [answersOnly(0, 1, 2, 3, 4, 5, 6, 7, 8), 10, "Caso risolto perfettamente"],
  [answersOnly(0, 1, 3, 7, 8),              8, "Caso risolto, ma qualcosa non torna"],
  [answersOnly(1, 8),                       4, "Caso risolto?"],
  [answersOnly(0, 1, 2, 3, 4, 5, 6, 7),     7, "I dettagli sono chiari"],
  [answersOnly(0, 7),                       3, "Qualcosa non torna"],
];
/* la scheda come e' stata decisa il 23 ottobre 2026: nove domande, due false
   piste che non valgono niente, cinque circostanze da uno, il bicchiere da due
   e il colpevole da tre, ultimo */
assert.deepStrictEqual(Array.from(app.STORY.quiz, q => q.punti).sort(), [0, 0, 1, 1, 1, 1, 1, 2, 3],
  "la scheda non e' piu' 2x0 + 5x1 + 2 + 3");
assert.strictEqual(app.STORY.quiz.at(-1).punti, 3, "l'ultima domanda non e' quella del colpevole");
assert.strictEqual(score(answersOnly(2, 5)), 0, "le false piste valgono dei punti");
assert.strictEqual(score(app.STORY.quiz.map((q, i) => ([2, 5].includes(i) ? wrongAnswer(q) : q.giusta))), 10,
  "sbagliare le false piste toglie punti");
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
// deve offrire tutti e sei i sospetti: si sceglie una persona, non una frase
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

// l'indagine non ha tetto: tutti gli oggetti si aprono, e si chiede a chiunque
app.goTo(app.SLIDES.findIndex(s => s.t === "tavolo"));
app.state.indagine = { scelti: [], chiesto: {} };
app.STORY.oggetti.forEach((_, i) => app.openClue(i));
assert.strictEqual(app.state.indagine.scelti.length, app.STORY.oggetti.length,
  `il tavolo ha aperto ${app.state.indagine.scelti.length} indizi su ${app.STORY.oggetti.length}`);
// ogni oggetto ha una risposta per ognuno dei sei sospetti, e la vittima non e' fra loro
assert.strictEqual(app.SUSPECTS.length, 6, `sospetti: ${app.SUSPECTS.join(", ")}`);
assert.ok(!app.SUSPECTS.includes("Giuseppe"), "la vittima non puo' essere interrogata");
app.STORY.oggetti.forEach(o => app.SUSPECTS.forEach(c =>
  assert.ok(o.risposte?.[c], `manca la risposta di ${c} su "${o.nome}"`)));

// su un oggetto si interroga chiunque, e la stessa persona conta una volta sola
const glassClue = app.STORY.oggetti[0];
app.state.clue = 0; app.state.indagine.chiesto = {};
const clickAsk = c => {
  const gia = app.state.indagine.chiesto[0] || [];
  if (!gia.includes(c)) app.state.indagine.chiesto[0] = [...gia, c];
};
["Mauro", "Augusto", "Rosalia", "Mauro"].forEach(clickAsk);
assert.strictEqual(app.questionsAsked(), 3, "una persona interrogata due volte conta due domande");
app.render();
["Mauro", "Augusto", "Rosalia"].forEach(c =>
  assert.ok(stage.innerHTML.includes(glassClue.risposte[c]), `${c} e' stato interrogato ma non risponde`));
assert.ok(!stage.innerHTML.includes(glassClue.risposte.Roberto), "risponde anche chi non e' stato interrogato");
app.state.clue = null; app.state.indagine = { scelti: [], chiesto: {} };

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

/* Il tempo dell'indagine: un punto ogni tre domande, per difetto, e il
   punteggio non va sotto zero. Si guarda il numero stampato nel verdetto. */
assert.strictEqual(app.QUESTIONS_PER_POINT, 3, "il prezzo dell'indagine non e' piu' un punto ogni tre domande");
const askN = n => {
  app.state.indagine = { scelti: [], chiesto: {} };
  for (let k = 0; k < n; k++) {
    const o = k % app.STORY.oggetti.length, chi = app.SUSPECTS[Math.floor(k / app.STORY.oggetti.length)];
    app.state.indagine.chiesto[o] = [...(app.state.indagine.chiesto[o] || []), chi];
  }
};
for (const [n, meno] of [[0, 0], [2, 0], [3, 1], [5, 1], [6, 2], [8, 2], [9, 3]]) {
  askN(n);
  assert.strictEqual(app.questionsAsked(), n, `contate ${app.questionsAsked()} domande invece di ${n}`);
  assert.strictEqual(app.timePenalty(), meno, `${n} domande tolgono ${app.timePenalty()} punti, non ${meno}`);
  assert.ok(renderAnswers(app.STORY.quiz.map(q => q.giusta)).includes(`class="score">${totalPoints - meno} `),
    `pieno con ${n} domande: atteso ${totalPoints - meno}`);
}
// 3 punti dalla scheda, 12 domande = 4 punti in meno: si resta a zero, non a -1
askN(12);
assert.strictEqual(score(answersOnly(0, 7)), 3, "la prova del pavimento non vale 3 punti");
assert.ok(renderAnswers(answersOnly(0, 7)).includes('class="score">0 '), "il punteggio e' sceso sotto zero");
assert.ok(stage.innerHTML.includes("12 domande all’indagine: 4 punti in meno."), "il verdetto non dice quanto e' costata l'indagine");
app.state.indagine = { scelti: [], chiesto: {} };
assert.ok(!renderAnswers(app.STORY.quiz.map(q => q.giusta)).includes("domande all’indagine"), "senza penalita' il verdetto parla di domande");
app.state.risposte = [];

// chiudere l'indagine chiede sempre conferma: un tocco non deve bastare
{
  const tavoloN = app.SLIDES.findIndex(s => s.t === "tavolo");
  app.goTo(tavoloN);
  app.confirmAndAdvance();
  assert.strictEqual(app.state.n, tavoloN, "dal tavolo si passa oltre senza conferma");
  assert.ok(app.overlayElement.innerHTML.includes("Chiudo qui"), "chiudendo l'indagine non si chiede conferma");
  app.closeOverlay();
}

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
const voiceProfiles = t => Object.fromEntries([...t.matchAll(/^ *(Giuseppe|Rosalia|Roberto|Augusto|Mauro|Elisa|Andrea): *(\{[^}]*\})/gm)]
  .map(m => [m[1], m[2].replace(/\s+/g, "")]));
const benchProfiles = voiceProfiles(voiceBenchHtml);
const appProfiles = voiceProfiles(appHtml);
assert.strictEqual(Object.keys(appProfiles).length, 7, `nell'app trovo ${Object.keys(appProfiles).length} profili di voce, non 7`);
assert.deepStrictEqual(benchProfiles, appProfiles, "i profili di voce di voci.html e oliva-blu.html sono diversi");

// Nelle conferme con un'azione alternativa ("Ritenta") non esiste data-close:
// deve prendere il focus proprio quel pulsante, non l'azione distruttiva.
app.askForSolution();
assert.strictEqual(app.overlayElement.focusedSelector, "[data-close],#ov-no",
  "la conferma della soluzione non mette il focus su Ritenta");

// Web Audio comportamentale: la seconda battuta scollega l'uscita della prima,
// e a liberare il filtro condiviso e' l'ultimo oscillatore della frase — solo
// lui installa la richiamata, perche' e' l'unico che sa di essere l'ultimo.
const audioEvents = [];
/* La rampa esponenziale si comporta come nel browser: verso zero solleva. Il
   finto parametro di prima la ingoiava, ed e' il motivo per cui la corsa fra
   `resume()` e il muto non era mai stata vista da nessun controllo. */
const parameter = () => ({ value: 0, cancelScheduledValues() {}, setValueAtTime() {},
  exponentialRampToValueAtTime(target) {
    if (Math.abs(target) < 1e-6) throw new RangeError(`rampa esponenziale verso ${target}`);
  } });
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
/* Il contesto vero nasce sospeso e `resume()` risolve quando gli pare: qui
   l'attesa si tiene in mano e si scioglie a comando, che e' l'unico modo di
   guardare dentro il buco fra la richiesta e i bip.
   Non e' una `Promise` ma un thenable: cosi' il seguito parte quando lo diciamo
   noi invece che al prossimo giro di microtask, e in un controllo sincrono come
   questo si puo' guardare il risultato subito dopo. L'app fa
   `audio.resume().then(f, g)` e non guarda cosa torna, quindi il codice
   esercitato e' lo stesso. */
class DeferredAudioContext extends FakeAudioContext {
  constructor() { super(); this.state = "suspended"; this.pending = []; }
  resume() { const io = this; return { then(ok, ko) { io.pending.push({ ok, ko }); return this; } }; }
  release() { const q = this.pending; this.pending = []; this.state = "running"; q.forEach(p => p.ok()); }
  fail(err) { const q = this.pending; this.pending = []; q.forEach(p => p.ko?.(err)); }
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

/* Il buco fra `resume()` e i bip. Ogni prova apre un'app sua, cosi' lo stato
   audio non passa da una all'altra. */
{
  const conRitardo = () => {
    let ctx = null;
    const Ctx = class extends DeferredAudioContext { constructor() { super(); ctx = this; } };
    const { app: a } = openApp("{speak,setVolume,state,goTo,SLIDES}", undefined, { AudioContext: Ctx });
    a.setVolume(.7, false);
    return { a, ctx: () => ctx };
  };
  const bipProgrammati = () => audioEvents.filter(e => e.join(":") === "connect:oscillator:gain").length;

  // 1. muto mentre il contesto sta ancora partendo: la battuta non deve suonare
  {
    const { a, ctx } = conRitardo();
    a.speak("Giuseppe", "prova");
    const prima = bipProgrammati();
    a.setVolume(0, false);
    assert.doesNotThrow(() => ctx().release(),
      "sciogliere il resume dopo il muto solleva: la rampa punta a zero");
    assert.strictEqual(bipProgrammati(), prima,
      "la battuta in volo suona lo stesso dopo il muto");
  }

  // 2. due battute di fila: quando il contesto parte deve parlare solo l'ultima
  {
    const { a, ctx } = conRitardo();
    a.speak("Giuseppe", "prima");
    a.speak("Rosalia", "seconda");
    const prima = bipProgrammati();
    ctx().release();
    const nuovi = bipProgrammati() - prima;
    assert.ok(nuovi > 0, "dopo il resume non parla nessuno");
    // la stessa battuta da sola fa esattamente questi bip: se ne parlassero due
    // insieme sarebbero il doppio abbondante
    const { a: b, ctx: c2 } = conRitardo();
    b.speak("Rosalia", "seconda");
    const soloUna = bipProgrammati();
    c2().release();
    assert.strictEqual(bipProgrammati() - soloUna, nuovi,
      "due richieste in volo fanno parlare piu' di una battuta");
  }

  // 3. cambiare schermata mentre il contesto parte: la battuta di prima resta muta
  {
    const { a, ctx } = conRitardo();
    a.speak("Giuseppe", "prova");
    const prima = bipProgrammati();
    a.goTo(a.SLIDES.findIndex(x => x.t === "cast"));   // una schermata che non parla
    ctx().release();
    assert.strictEqual(bipProgrammati(), prima, "la battuta della schermata lasciata suona lo stesso");
  }

  // 4. un resume che fallisce non deve lasciare rifiuti non gestiti
  {
    let ctx = null;
    const Rotto = class extends DeferredAudioContext { constructor() { super(); ctx = this; } };
    const { app: a } = openApp("{speak,setVolume}", undefined, { AudioContext: Rotto });
    a.setVolume(.7, false);
    a.speak("Giuseppe", "prova");
    const prima = bipProgrammati();
    assert.doesNotThrow(() => ctx.fail(new Error("niente audio")),
      "un resume fallito propaga l'errore invece di restare zitto");
    assert.strictEqual(bipProgrammati(), prima, "un resume fallito programma bip lo stesso");
  }

  // 5. rialzando il volume si torna a parlare
  {
    const { a, ctx } = conRitardo();
    a.setVolume(0, false);
    a.setVolume(.7, false);
    a.speak("Giuseppe", "prova");
    const prima = bipProgrammati();
    ctx().release();
    assert.ok(bipProgrammati() > prima, "dopo aver rialzato il volume non parla piu' nessuno");
  }
}

// Hardening: stato pubblico fuori intervallo, senza cambiare i percorsi normali.
{
  const { app: a } = openApp("{renderScene,state,STORY}");
  for (const step of [-1, 10000]) {
    a.state.step = step;
    a.renderScene(0);
    assert.ok(a.state.step >= 0 && a.state.step <= a.STORY.scene[0].battute.length);
  }
}
{
  const { app: a } = openApp("{renderHelp,overlayElement}");
  a.renderHelp();
  const help = a.overlayElement.innerHTML;
  assert.ok(!help.includes("pulsante in basso"), "aiuto colloca male il pulsante");
  assert.ok(!help.includes("immagini mancanti"), "aiuto descrive una riga rimossa");
  assert.ok(help.includes("schede dei personaggi"), "aiuto ignora lo scorrimento del cast");
}

console.log(`copione: ${scriptLines.length} battute verificate`);
console.log(`ok — ${app.SLIDES.length} schermate, ${dialogueCount} battute, quiz verificato`);
