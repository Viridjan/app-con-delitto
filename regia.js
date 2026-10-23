/* Controlli di comportamento per la modalita' regia e per la tastiera. Vanno
   dentro un browser vero: qui servono nodi, eventi e fuoco, cose che lo stub di
   `smoke.js` non ha. Si incolla in coda allo <script> di una copia dell'app —
   come `censimento.js` — e il referto finisce nel titolo della pagina.

     python3 prova-regia.py        # prepara la copia e la legge in headless

   Ogni prova esercita il codice vero: preme, trascina, manda tasti. Nessuna
   riscrive la logica che sta controllando. */
(async () => {
  /* Un errore dentro un gestore non ferma niente e non si vede: la prova
     continua su un mezzo effetto e passa. Qui si raccolgono e diventano una
     prova fallita per conto loro. */
  const errori = [];
  addEventListener("error", e => errori.push("errore: " + (e.message || e.error)));
  addEventListener("unhandledrejection", e => errori.push("promessa non gestita: " + e.reason));
  const esiti = [];
  const breve = t => String(t).length > 160 ? String(t).slice(0, 160) + "…" : String(t);
  const prova = (nome, fn) => {
    try { const m = fn(); esiti.push((m ? "FALLITA" : "ok") + " · " + nome + (m ? ": " + breve(m) : "")); }
    catch (err) { esiti.push("ERRORE · " + nome + ": " + breve(err.message)); }
  };
  const tasto = (key, target) => {
    const e = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    (target || document.body).dispatchEvent(e);
    return e;
  };
  const puntatore = (nodo, tipo, x = 10, y = 10) => nodo.dispatchEvent(
    new PointerEvent(tipo, { bubbles: true, cancelable: true, pointerId: 1, clientX: x, clientY: y }));
  /* Un trascinamento intero: preme, muove, molla. Gli eventi sono sintetici —
     il puntatore non e' davvero attivo, quindi `setPointerCapture` fallisce e
     l'app deve cavarsela lo stesso — ma il giro dei gestori e' quello vero. */
  const trascina = (nodo, dx, dy) => {
    puntatore(nodo, "pointerdown", 10, 10);
    puntatore(nodo, "pointermove", 10 + dx, 10 + dy);
    puntatore(nodo, "pointerup", 10 + dx, 10 + dy);
  };
  const scene = SLIDES.map((s, k) => [s, k]).filter(([s]) => s.t === "scene" && (STORY.scene[s.i].cast || []).length);

  /* 1 — la selezione non deve sopravvivere al cambio di schermata: prima
     spostava l'attore della scena precedente, senza dirlo a nessuno. */
  prova("la selezione non passa da una scena all'altra", () => {
    const [, a] = scene[0], [, b] = scene.find(([s], i) => i > 0 && s.i !== scene[0][0].i);
    goTo(a);
    if (!state.directorMode) toggleDirector();
    const figura = stage.querySelector(".palco .attore");
    if (!figura) return "nessuna figura sul palco";
    puntatore(figura, "pointerdown");
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
    puntatore(fondo, "pointerdown");
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

  /* 2b — trascinare sposta la figura, e mollare stacca i gestori: se restassero
     attaccati, il puntatore continuerebbe a spostarla a mano alzata. */
  prova("trascinare sposta la figura, e mollare la lascia stare", () => {
    const [, k] = scene[0];
    goTo(k);
    if (!state.directorMode) toggleDirector();
    const figura = stage.querySelector(".palco .attore");
    if (!figura) return "nessuna figura sul palco";
    puntatore(figura, "pointerdown", 10, 10);
    if (!selection) return "il clic non ha selezionato niente";
    const x0 = selection.dato.x, b0 = selection.dato.b;
    puntatore(figura, "pointermove", 60, 10);
    if (selection.dato.x === x0) return "il trascinamento non sposta la figura";
    const spostato = selection.dato.x;
    puntatore(figura, "pointerup", 60, 10);
    puntatore(figura, "pointermove", 200, 10);
    if (selection.dato.x !== spostato) return "dopo il rilascio la figura si muove ancora";
    if (selection.dato.b !== b0) return "un movimento orizzontale ha cambiato anche l'altezza";
    selection.dato.x = x0;
    return null;
  });

  /* 2c — accendere la regia non deve far ricomparire la battuta da capo: il
     testo si riscriveva lettera per lettera, in silenzio, mentre si sistemavano
     le figure. */
  prova("un render d'autore non fa ripartire il ritmo della battuta", () => {
    if (state.directorMode) toggleDirector();
    const [, k] = scene[0];
    goTo(k);
    const riga = () => stage.querySelector(".bubbles .bubble .said p:last-child");
    if (!reveal()) return "la scena non ha una seconda battuta da scoprire";
    if (!riga()) return "nessuna battuta scoperta";
    const testo = riga().textContent;
    if (!riga().querySelector(".sillaba")) return "la battuta non compare a ritmo";
    toggleDirector();               // render d'autore
    const dopo = riga();
    if (!dopo) return "dopo il render la battuta e' sparita";
    if (dopo.querySelector(".sillaba")) return "la battuta e' ripartita a ritmo dopo il render";
    if (dopo.textContent !== testo) return "il testo della battuta e' cambiato";
    toggleDirector();
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
    /* e sullo schermo: l'ordine disegnato — z-index calcolato, e a parita' di z
       la posizione nel markup — deve essere quello che `stageOrder` dichiara.
       Prima qui si confrontavano solo le lunghezze delle due liste, che e' come
       non guardare. */
    const nodi = [...stage.querySelectorAll(".palco .attore, .palco .primo")];
    /* Le figure non hanno un nome addosso — `alt` e' vuoto e `src` e' una data
       URI — ma il markup le emette nell'ordine di `cast` e poi `primo`, che e'
       esattamente il `dom` di `stageOrder`. Si confrontano quelle posizioni.
       Prima qui si guardavano solo le lunghezze delle due liste, che e' come
       non guardare. */
    const disegnato = nodi
      .map((n, dom) => ({ dom, z: +getComputedStyle(n).zIndex || 0 }))
      .sort((a, b) => a.z - b.z || a.dom - b.dom)
      .map(e => e.dom).join(",");
    const atteso = stageOrder(sc).map(e => e.dom).join(",");
    if (nodi.length !== stageOrder(sc).length)
      return `figure disegnate ${nodi.length}, attese ${stageOrder(sc).length}`;
    if (disegnato !== atteso)
      return `sullo schermo l'ordine e' ${disegnato}, stageOrder dice ${atteso}`;
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

  /* 5 — con una conferma aperta, dietro non si deve poter toccare niente. */
  prova("la conferma isola quello che sta sotto", () => {
    if (state.directorMode) toggleDirector();
    goTo(0);
    const sotto = stage.querySelector("[data-avanti]");
    if (!sotto) return "nessun pulsante da provare sotto la finestra";
    askForSolution();
    /* la finestra si chiude comunque: se una prova si ferma a meta' lasciandola
       aperta, tutte quelle dopo falliscono per colpa sua */
    const esito = (() => {
      if (!state.overlay) return "la conferma non si e' aperta";
      if (!overlayElement.contains(document.activeElement)) return "il fuoco iniziale non e' dentro la finestra";
      sotto.focus();
      if (document.activeElement === sotto) return "un pulsante sotto la finestra prende il fuoco";
      if (!tasto(" ", sotto).defaultPrevented) return "lo spazio su un pulsante sotto la finestra non viene fermato";
      if (!appElement.inert) return "l'app sotto la finestra non e' inerte";
      return null;
    })();
    closeOverlay();
    if (esito) return esito;
    if (appElement.inert) return "chiusa la finestra, l'app resta inerte";
    if (document.activeElement !== stage) return "chiusa la finestra il fuoco non torna al palco";
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

  prova("dissolve appartiene solo al cast e le schede partono attenuate", () => {
    if (state.directorMode) toggleDirector();
    for (let i = 0; i < SLIDES.length; i++) {
      goTo(i);
      if (stage.classList.contains("dissolve") !== (SLIDES[i].t === "cast"))
        return `dissolve errato sulla schermata ${i}`;
      if (SLIDES[i].t === "cast" && getComputedStyle(cards()[0]).opacity !== "0.25")
        return "schede non attenuate prima dell'observer";
    }
  });
  prova("selezionare lo sfondo non scrive STORY; i gesti lo modificano", () => {
    const k = SLIDES.findIndex(s => s.t === "scene" && !STORY.scene[s.i].sfondo);
    if (k < 0) return "fixture senza sfondo assente";
    const sc = STORY.scene[SLIDES[k].i];
    try {
      for (const gesture of ["ArrowRight", "+", "wheel", "drag"]) {
        delete sc.sfondo;
        goTo(k);
        if (!state.directorMode) toggleDirector();
        const bg = stage.querySelector(".sfondo");
        puntatore(bg, "pointerdown"); puntatore(bg, "pointerup");
        if (sc.sfondo || backgroundSource(sc)) return "la sola selezione esporta sfondo";
        if (!selection?.sfondo || !directorPanel.textContent.includes("ingrandimento 1×")) return "selezione/pannello assenti";
        tasto("-");
        if (sc.sfondo) return "il limite minimo scrive uno zoom identico";
        if (gesture === "wheel") stage.querySelector(".palco").dispatchEvent(new WheelEvent("wheel", {deltaY:-1, bubbles:true, cancelable:true}));
        else if (gesture === "drag") trascina(bg, 1, 0);
        else tasto(gesture);
        if (!sc.sfondo || !backgroundSource(sc)) return `nessuna modifica con ${gesture}`;
      }
    } finally { delete sc.sfondo; if (state.directorMode) toggleDirector(); }
  });
  prova("hardening: opzione tardiva non scrive indice -1", () => {
    const saved = state.risposte;
    try {
      goTo(SLIDES.findIndex(s => s.t === "quiz"));
      const opt = stage.querySelector("[data-opt]");
      state.risposte = STORY.quiz.map(() => 0);
      opt.click();
      if (Object.hasOwn(state.risposte, "-1")) return "risposta scritta a -1";
    } finally { state.risposte = saved; }
  });

  // L'observer deve illuminare anche una scheda raggiunta dopo lo scorrimento.
  try {
    goTo(SLIDES.findIndex(s => s.t === "cast"));
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!cards()[0].classList.contains("in")) throw new Error("prima scheda non illuminata");
    const box = castScroller();
    box.scrollTo({top: box.scrollHeight, behavior: "instant"});
    const last = [...cards()].at(-1);
    await new Promise(resolve => {
      let remaining = 1800;
      const check = () => {
        if (last.classList.contains("in") || !--remaining) resolve();
        else setTimeout(check, 1);
      };
      check();
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!last.classList.contains("in") || getComputedStyle(last).opacity !== "1")
      throw new Error(`ultima scheda: class=${last.className}, opacity=${getComputedStyle(last).opacity}, scroll=${box.scrollTop}/${box.scrollHeight}, top=${last.getBoundingClientRect().top}`);
    esiti.push("ok · observer illumina le schede durante lo scorrimento");
  } catch (error) { esiti.push("FALLITA · observer: " + error.message); }

  /* Passando al personaggio seguente lo scorrimento non deve andare oltre la
     scheda e poi tornare indietro. La destinazione veniva misurata con
     `getBoundingClientRect()` sulla scheda ancora attenuata, che porta
     `translateY(2.5vh) scale(.97)`: lo scorrimento finiva troppo in basso e lo
     snap lo riportava su con uno scatto. Si campiona la posizione a ogni
     fotogramma e si confronta il punto piu' basso con quello d'arrivo. */
  try {
    goTo(SLIDES.findIndex(s => s.t === "cast"));
    await new Promise(resolve => setTimeout(resolve, 700));
    const box = castScroller();
    for (const k of [1, 2]) {
      const posizioni = [];
      let corre = true;
      const campiona = () => { posizioni.push(box.scrollTop); if (corre) requestAnimationFrame(campiona); };
      requestAnimationFrame(campiona);
      advance();
      await new Promise(resolve => setTimeout(resolve, 1600));
      corre = false;
      const arrivo = box.scrollTop, massimo = Math.max(...posizioni);
      const atteso = cards()[k].offsetTop - cards()[0].offsetTop;
      if (massimo - arrivo > 2)
        throw new Error(`scheda ${k}: arriva a ${massimo.toFixed(0)}px e torna a ${arrivo.toFixed(0)}`);
      if (Math.abs(arrivo - atteso) > 2)
        throw new Error(`scheda ${k}: si ferma a ${arrivo.toFixed(0)}px invece di ${atteso}`);
    }
    esiti.push("ok · il passaggio al personaggio seguente non torna indietro");
  } catch (error) { esiti.push("FALLITA · scatto fra le schede: " + error.message); }

  if (errori.length) esiti.push("FALLITA · nessun errore nei gestori: " + errori.join("; "));
  document.title = esiti.join(" | ");
})();
