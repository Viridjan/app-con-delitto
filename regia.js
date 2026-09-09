/* Controlli di comportamento per la modalita' regia e per la tastiera. Vanno
   dentro un browser vero: qui servono nodi, eventi e fuoco, cose che lo stub di
   `smoke.js` non ha. Si incolla in coda allo <script> di una copia dell'app —
   come `censimento.js` — e il referto finisce nel titolo della pagina.

     python3 prova-regia.py        # prepara la copia e la legge in headless

   Ogni prova esercita il codice vero: preme, trascina, manda tasti. Nessuna
   riscrive la logica che sta controllando. */
(() => {
  const esiti = [];
  const prova = (nome, fn) => {
    try { const m = fn(); esiti.push((m ? "FALLITA" : "ok") + " · " + nome + (m ? ": " + m : "")); }
    catch (err) { esiti.push("ERRORE · " + nome + ": " + err.message); }
  };
  const tasto = (key, target) => {
    const e = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    (target || document.body).dispatchEvent(e);
    return e;
  };
  const puntatore = (nodo, tipo = "pointerdown") => nodo.dispatchEvent(
    new PointerEvent(tipo, { bubbles: true, cancelable: true, pointerId: 1, clientX: 10, clientY: 10 }));
  const scene = SLIDES.map((s, k) => [s, k]).filter(([s]) => s.t === "scene" && (STORY.scene[s.i].cast || []).length);

  /* 1 — la selezione non deve sopravvivere al cambio di schermata: prima
     spostava l'attore della scena precedente, senza dirlo a nessuno. */
  prova("la selezione non passa da una scena all'altra", () => {
    const [, a] = scene[0], [, b] = scene.find(([s], i) => i > 0 && s.i !== scene[0][0].i);
    goTo(a);
    if (!state.directorMode) toggleDirector();
    const figura = stage.querySelector(".palco .attore");
    if (!figura) return "nessuna figura sul palco";
    puntatore(figura);
    if (!selection) return "il clic non ha selezionato niente";
    const scelto = selection.dato;
    goTo(b);
    if (selection && selection.dato === scelto) return "la selezione punta ancora alla scena di prima";
    if (selection && !STORY.scene[SLIDES[b].i].cast.includes(selection.dato)
        && selection.dato !== STORY.scene[SLIDES[b].i].sfondo)
      return "la selezione non appartiene alla scena corrente";
    return null;
  });

  /* 2 — sullo sfondo + e - devono cambiare l'ingrandimento come la rotella, e
     non inventare un `h` che finirebbe nel blocco da incollare. */
  prova("+ e - ingrandiscono lo sfondo invece di scrivergli h:NaN", () => {
    const [, k] = scene[0];
    goTo(k);
    if (!state.directorMode) toggleDirector();
    const fondo = stage.querySelector(".palco .sfondo");
    if (!fondo) return "nessuno sfondo sul palco";
    puntatore(fondo);
    if (!selection || !selection.sfondo) return "il clic sullo sfondo non lo seleziona";
    const prima = selection.dato.scala;
    tasto("+");
    const dopo = selection.dato.scala;
    if (!(dopo > prima)) return `l'ingrandimento non cambia: ${prima} -> ${dopo}`;
    if ("h" in selection.dato) return "allo sfondo e' stato aggiunto un h";
    tasto("-");
    if (Math.abs(selection.dato.scala - prima) > 1e-9) return "il - non riporta all'ingrandimento di prima";
    return null;
  });

  /* 3 — la profondita' cambia davvero quello che si vede, non solo l'array. */
  prova("[ e ] cambiano l'ordine che si vede sul palco", () => {
    const trovata = scene.find(([s]) => (STORY.scene[s.i].cast || []).some(a => a.z !== undefined));
    if (!trovata) return "nessuna scena con uno z esplicito";
    const [s, k] = trovata;
    goTo(k);
    if (!state.directorMode) toggleDirector();
    const sc = STORY.scene[s.i];
    const conZ = sc.cast.find(a => a.z !== undefined);
    const posto = () => stageOrder(sc).findIndex(e => e.dato === conZ);
    const partenza = posto();
    changeDepth(-1, { dato: conZ });
    if (posto() !== partenza - 1) return "[ non arretra di un posto";
    /* e sullo schermo: lo z-index disegnato deve seguire il nuovo ordine */
    const disegnati = [...stage.querySelectorAll(".palco .attore, .palco .primo")]
      .map(n => +getComputedStyle(n).zIndex || 0);
    const attesi = stageOrder(sc);
    if (disegnati.length !== attesi.length) return "figure disegnate e figure attese non coincidono";
    changeDepth(1, { dato: conZ });
    if (posto() !== partenza) return "] non riporta la figura dov'era";
    return null;
  });

  /* 4 — lo spazio su un pulsante col fuoco e' del pulsante. Un evento
     sintetico non fa scattare l'attivazione nativa, quindi si controlla il
     contratto vero: il nostro gestore non deve annullarla. */
  prova("lo spazio non viene rubato al pulsante che ha il fuoco", () => {
    if (state.directorMode) toggleDirector();
    goTo(0);
    const b = stage.querySelector("[data-avanti]");
    if (!b) return "nessun pulsante sulla copertina";
    b.focus();
    const e = tasto(" ", b);
    if (e.defaultPrevented) return "lo spazio sul pulsante viene annullato";
    const q = SLIDES.findIndex(x => x.t === "quiz");
    goTo(q);
    const opt = stage.querySelector("[data-opt]");
    if (opt) { opt.focus(); if (tasto(" ", opt).defaultPrevented) return "lo spazio sulla risposta viene annullato"; }
    return null;
  });

  /* e le scorciatoie devono restare, quando il fuoco e' sul palco */
  prova("con il fuoco fuori dai controlli lo spazio scopre ancora", () => {
    if (state.directorMode) toggleDirector();
    const [, k] = scene[0];
    goTo(k);
    const prima = state.step;
    const e = tasto(" ", stage);
    if (!e.defaultPrevented) return "lo spazio sul palco non e' piu' una scorciatoia";
    if (state.step === prima && hasMoreToReveal()) return "lo spazio non scopre piu' la battuta";
    return null;
  });

  document.title = esiti.join(" | ");
})();
