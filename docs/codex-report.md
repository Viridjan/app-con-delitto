# Verifica e correzioni del prompt Codex — 9 settembre 2026

## Perimetro e baseline

Letti `CLAUDE.md`, `docs/design-reference.md` e `docs/codex-prompt.md`.
La baseline aveva modifiche non committate in `oliva-blu.html`, `prova-regia.py`,
`regia.js`, `smoke.js`, `sync-assets.py`, più i due prompt non tracciati.
Le modifiche di questa sessione si aggiungono a quel lavoro; il confronto è stato
fatto anche contro una copia iniziale del working tree, non soltanto contro HEAD.
Nessun commit, push o pubblicazione. Nessuna dipendenza dell'app aggiunta.
Nessuna modifica a illustrazioni, STORY, punteggi, budget, cancelli d'autore,
flusso del giocatore o motori audio. Nessuna ottimizzazione tentata.

Output iniziale di `node smoke.js`:

```text
copione: 76 battute verificate
ok — 20 schermate, 76 battute, quiz verificato
```

La suite browser iniziale passava tutte le **8 prove**. Il primo avvio nel sandbox
non produceva il referto; ripetuto fuori sandbox, Chromium ha eseguito i controlli.

## Riscontri, ordinati per gravità

| Priorità | Punto e posizione | Innesco, atteso e osservato | Intervento ed evidenza raccolta |
|---|---|---|---|
| Alta, robustezza | **7**, `sync-assets.py`, `write_if_changed()` | Interrompere la scrittura dopo tre caratteri. Atteso: destinazione vecchia o nuova intera. Osservato nella fixture iniziale: `new` invece di `old`. | Temporaneo nella stessa directory, `os.replace()`, pulizia in `finally`, permessi preservati per file esistenti. Test `prova-sync.py`: interruzione durante una vera scrittura parziale, successo completo, identità di inode e mtime sul no-op. Mai interrotto un asset reale. |
| Media, dati d'autore | **2**, `oliva-blu.html`, `activateDirector()` | Selezionare lo sfondo di una scena senza `sfondo`. Atteso: selezione e pannello, nessuna esportazione. Osservato nel browser: il solo clic aggiungeva `sfondo`. | Valori provvisori nella selezione; `saveBackgroundSelection()` li collega alla scena solo se diversi dall'identità. Browser: clic, freccia, `+`, rotella, trascinamento; `-` al minimo non scrive. La selezione provvisoria conserva il riferimento alla scena per riagganciarsi dopo un render. |
| Media, copertura CI | **8**, `.github/workflows/smoke.yml`, job `browser` | La pipeline eseguiva soltanto Node; nessun controllo di layout, focus o puntatori. Atteso: fallimento della build anche per regressioni browser. | Job separato con Chromium e Python installati in un container Debian/Node; esegue regia, entrambi i censimenti, audit mobile e prova atomica. Job smoke preesistente invariato. Nessun `continue-on-error`. La pipeline remota non è stata eseguita perché non si è fatto push. |
| Media, strumenti | **9**, `prova-regia.py`, `injection()`, `run()`, `verdict()` | I due audit erano script manuali, privi di runner e di exit status utilizzabile. | Stesso runner parametrico per tutti e tre gli script, copie temporanee e profilo browser isolato, lettura del titolo tramite `browser-title.js` e il protocollo di debug locale, uso di `telaio-390.html` a 390x844. I due script di misura non cambiano. Gli audit attraversano 20 schermate e 6 ulteriori stati del quiz. Una modifica CSS nella fixture introduce un sesto corpo/testo da 13px: entrambi i comandi terminano con exit 1; ripristinando, exit 0. |
| Bassa, interfaccia | **3**, `oliva-blu.html`, `renderHelp()` | Aprire i comandi: il markup generato dichiarava pulsante in basso e immagini mancanti nel pannello sviluppo. Atteso: descrizione dei controlli realmente presenti. | Corrette entrambe le righe. Verificati anche scorrimento avanti/indietro del cast, Pag↑/Pag↓, profondità di un posto, sfondo, frecce e scala in regia, differenza fra ← e → nello sviluppo, accesso con `?`. Test sul markup prodotto dalla funzione reale, non ricerca nel sorgente. Copione estratto identico. |
| Bassa, isolamento dello stile | **1**, `oliva-blu.html`, `render()` | Render di una schermata diversa dal cast: `dissolve` restava anche sulla copertina, senza attendere venti schermate. Atteso: classe presente solo nel cast con observer disponibile. | `classList.toggle()` vincolato al tipo `cast`; osservazione delle sole schede. Test browser su tutte le schermate, opacità iniziale .25 e observer che illumina le schede dopo lo scorrimento. |

## Irrobustimento, non bug raggiungibili

- **5 — `renderScene()`**: clamp di `state.step` fra zero e numero di battute,
  prima dell'accesso. Sul codice iniziale, attraverso la funzione reale nello stub:
  `baseline step=10000: TypeError: Cannot read properties of undefined (reading 'c')`.
  Il test verifica entrambi gli estremi fuori intervallo. Il normale percorso
  di `reveal()`/`goTo()` non poteva produrre questo stato.
- **6 — gestore click delle opzioni quiz**: se `currentQuestion()` è negativo,
  ritorna prima di scrivere. Nel browser una risposta completata artificialmente,
  seguita dal clic sull'opzione ancora in DOM, produceva la proprietà `-1`.
  Dopo la guardia non la produce. L'interfaccia normale non presenta quell'opzione.

## Affermazione non riprodotta

**4 — `changeDepth()` / `applyOrder()`**: la riproduzione descritta nel prompt passa
sul working tree iniziale, prima delle correzioni. Fixture nello stub DOM: un attore
con `z:5`, un oggetto `primo` senza `z`, dodici alternanze avanti/indietro.
A ogni avanzamento l'ordine è `sx A`, l'attore ha `z:6` e l'oggetto resta senza `z`;
a ogni ritorno l'ordine è `A sx` e l'attore perde lo `z` esplicito. Nessuna crescita.
Questo deriva dalla preferenza già presente per il piano predefinito quando torna
ammissibile. Aggiunto il controllo permanente in `smoke.js`; **algoritmo invariato**.
Restano verdi il controllo degli `z` non superflui e la prova browser preesistente
che confronta l'ordine con gli `z-index` calcolati. Non si estende questo esito a
ogni possibile composizione d'autore: è la riproduzione indicata a non fallire.

## Prova che i controlli intercettano il difetto

`python3 prova-mutazioni.py` copia app, dati necessari e controlli in una directory
temporanea. Per ogni mutazione richiede exit non zero **e il messaggio specifico**;
ripristina il codice, riesegue lo stesso comando e richiede exit zero. Le mutazioni
non toccano i file di lavoro. `prova-sync.py` interrompe esclusivamente una fixture.

Le regressioni di dissolve, selezione sfondo, guardia quiz e scrittura atomica sono
state osservate anche prima delle rispettive correzioni. Le righe dell'aiuto sono
state verificate nel markup reale, e poi reintrodotte separatamente nella fixture.
Il controllo sulla profondità passa già nella baseline: non viene dichiarata una
correzione né inventata una prova negativa per un difetto non confermato.

Output di `python3 prova-mutazioni.py`:

```text
ok · dissolve: exit 1, dissolve errato
ok · dissolve: ripristino exit 0
ok · observer cast: exit 1, FALLITA · observer
ok · observer cast: ripristino exit 0
ok · selezione sfondo: exit 1, la sola selezione esporta sfondo
ok · selezione sfondo: ripristino exit 0
ok · aiuto: exit 1, aiuto colloca male il pulsante
ok · aiuto: ripristino exit 0
ok · aiuto sviluppo: exit 1, aiuto descrive una riga rimossa
ok · aiuto sviluppo: ripristino exit 0
ok · hardening step: exit 1, AssertionError
ok · hardening step: ripristino exit 0
ok · hardening quiz: exit 1, risposta scritta a -1
ok · hardening quiz: ripristino exit 0
ok · scrittura atomica: exit 1, 'new' != 'old'
ok · scrittura atomica: ripristino exit 0
ok · contratto censimento: exit 1, attesi 5 corpi
ok · contratto censimento: ripristino exit 0
ok · contratto mobile: exit 1, FALLITA
ok · contratto mobile: ripristino exit 0

10 mutazioni intercettate; copie ripristinate e fixture rimossa
```

## Verifica finale

`node smoke.js`:

```text
copione: 76 battute verificate
ok — 20 schermate, 76 battute, quiz verificato
```

`python3 prova-regia.py`:

```text
ok · la selezione non passa da una scena all'altra
ok · + e - ingrandiscono lo sfondo invece di scrivergli h:NaN
ok · trascinare sposta la figura, e mollare la lascia stare
ok · un render d'autore non fa ripartire il ritmo della battuta
ok · [ e ] cambiano l'ordine che si vede sul palco
ok · lo spazio non viene rubato al pulsante che ha il fuoco
ok · la conferma isola quello che sta sotto
ok · con il fuoco fuori dai controlli lo spazio scopre ancora
ok · dissolve appartiene solo al cast e le schede partono attenuate
ok · selezionare lo sfondo non scrive STORY; i gesti lo modificano
ok · hardening: opzione tardiva non scrive indice -1
ok · observer illumina le schede durante lo scorrimento

12 prove passate
```

Comandi audit:

```text
$ python3 prova-regia.py --script censimento.js --viewport 1280x900
ok · censimento 1280px: 5 corpi [14, 22, 27.2, 38, 88], 26 viste

1 prove passate
$ python3 prova-regia.py --script censimento.js --viewport 390x844
ok · censimento 390px: 5 corpi [15.7, 20, 24.6, 28.7, 46.6], 26 viste

1 prove passate
$ python3 prova-regia.py --script audit-mobile.js --viewport 390x844
ok · audit mobile 390px: 26 viste, dimensioni/contrasto/tocco

1 prove passate
```

`python3 prova-sync.py`: un test, `OK`. Il test controlla anche che il temporaneo
venga eliminato dopo l'eccezione e che il no-op conservi inode e mtime.

`node dom.js` prima/dopo: `cmp` termina con exit 0. `node estrai-copione.js`:
`copione.txt scritto: 168 righe`; confronto con il file iniziale, exit 0.
`git diff --check`: nessun output, exit 0.
Confronto di STORY contro la copia iniziale: `STORY: identico alla baseline`.
Una sincronizzazione aggiuntiva senza modifiche: `no-op sync: inode e mtime
invariati su 4 file` (HTML, copia singola, mappa asset, cache immagini).

Ultime righe di `python3 sync-assets.py --file-unico`:

```text
oliva-blu-completo.html · 3877KB · 40 immagini dentro, niente accanto

40 immagini agganciate · oliva-blu.html ora pesa 125KB
```

Il primo smoke dopo una modifica HTML segnalava correttamente la copia singola
ancora vecchia; dopo la sincronizzazione anche quel controllo passa.

## Limiti delle evidenze

- Browser Chromium reale a 1280x900 e iframe reale 390x844. Eventi di regia
  sintetici: nessuna pretesa di aver simulato la pressione fisica di Space o Tab.
  Focus, inert, stili e geometria sono reali.
- Il test observer attende la classe prodotta dall'observer nativo e verifica
  l'opacità finale dopo la transizione reale. `--dump-dom` con tempo virtuale
  produceva risultati intermittenti: il runner usa ora il protocollo di debug
  locale di Chromium, con `WebSocket` nativo di Node >=22, senza librerie aggiunte.
  Non servono un server dell'app o un servizio esterno.
- Le verifiche di logica, profondità ripetuta, clamp e markup aiuto usano il DOM
  stub. Il confronto DOM non fotografa gli stili né apre l'overlay di aiuto.
- I due audit mantengono le misure originali: il contrasto non considera opacity,
  non classificano i testi in base al peso e non misurano overlay/pannelli.
  Non è una certificazione di accessibilità né una prova su telefono fisico.
- La scrittura atomica verifica interruzioni durante la scrittura, non durabilità
  dopo perdita di alimentazione. La CI è configurata e i comandi sono provati
  localmente; il job remoto non è stato avviato.
