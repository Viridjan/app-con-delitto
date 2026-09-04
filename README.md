# Il mistero dell'oliva blu

App per l'investigatore di una "cena con delitto": quattro scene illustrate divise in dodici
schermate (venti in tutto), un tavolo di indizi da
esaminare in ordine libero, la scheda finale e la soluzione. L'investigatore la guida davanti al
tavolo dei giocatori — da proiettore, da tablet o da telefono.

Tratta dal copione **_Il mistero dell'oliva blu_** di **Carlo Maria Gervasio**
(`ullgi_L-inaugurazione_COSTA_rev.pdf`), usato con la sua autorizzazione. Il testo di Gervasio
nell'app è quello originale, parola per parola; accanto ad esso il copione è cresciuto di battute
scritte dall'autore dell'app — oggi sono circa la metà delle settanta.

## Com'è fatta

Due file: **`oliva-blu.html`** con la storia, gli stili e il codice, e **`assets/assets.js`** con
le immagini — richiamato con l'impronta del suo contenuto nell'URL, così un browser non serve mai
una versione vecchia. Vanno tenuti insieme — l'app aperta senza il secondo funziona lo stesso, ma al posto
delle illustrazioni mostra i ripieghi tipografici. Niente build, niente dipendenze, niente server — si apre col
doppio clic e funziona anche senza rete. Dentro ci sono tre blocchi:

- `<style>` — palette oliva e lume di candela, Bodoni Moda per i titoli, Alegreya Sans per le
  battute (leggibile a distanza di proiezione). Chiaro e scuro entrambi previsti.
- `const STORY` — **tutto il copione**: scene, battute con i loro incisi, oggetti sul tavolo
  con le battute collegate, quiz e soluzione.
- `<script>` — uno stato, una `render()`, una lista di schermate. Nessun framework.

Sulla schermata di una scena non c'è altro che il dialogo: i box educativi “Lo sapevi?”, il box
“Osserva bene!” della scena 4, gli indizi di gioco, i brief delle illustrazioni e il messaggio
educativo finale sono stati tolti dal copione. I brief restano in `img/ART.md`, per Codex.

Le immagini viaggiano come data URI dentro `assets/assets.js`: pesano quanto pesano, ma l'app
non chiede niente alla rete mentre è in scena. Dove ci può stare **un file solo** — l'artefatto
privato — quel secondo file non viene caricato e al posto di ogni illustrazione compare il suo
ripiego tipografico.

## Il palco a strati

Ogni scena è composta al volo, su tre livelli:

1. lo **sfondo**, disegnato con il primo piano sgombro;
2. i **personaggi ritagliati**, posizionati in percentuali — `x` orizzontale, `b` altezza da
   terra, `h` altezza della figura: è l'altezza a dare la distanza, mai la larghezza;
3. gli **oggetti in primo piano** (`scenaN_sx.png`, `scenaN_dx.png`), che stanno davanti a tutti,
   ancorati agli angoli bassi e tagliati dal bordo. Facoltativi.

Quando qualcuno parla, l'app lo porta avanti — si alza, cresce, prende un'ombra. Nessuno viene
scurito. Le posizioni stanno in `STORY.scene[i].cast` e `.primo`.

Accanto alla battuta compare lo stesso ritaglio, tagliato dalla testa alla vita. La misura la dà
l'**altezza** della figura, non la larghezza: prendendola dalla larghezza, quanto un personaggio
venisse ingrandito finiva per dipendere da quanto apre le braccia, e Roberto che dà il benvenuto
restava una figurina intera dove gli altri erano mezzi busti.

## La voce dei personaggi

Scoprendo una battuta la pagina sintetizza qualche bip con la Web Audio API — nessun file audio —
e **il testo compare al ritmo di quei bip**, un pezzo alla volta, come se il personaggio stesse
parlando davvero. Il ritmo resta anche col volume a zero: il personaggio parla lo stesso, si vede
soltanto.
Ogni personaggio ha la sua altezza (Mauro cupo e con onda quadra, Rosalia acuta), e la battuta
più lunga fa più bip, da tre a sedici. Il volume si regola con la **barra in alto a destra** — l'altoparlante accanto dice il livello —
e lasciandola si sente una prova. `m` azzera, e ripremuto rimette l'ultimo livello scelto.

Il contesto audio nasce sospeso finché non c'è un gesto dell'utente e `resume()` è asincrono:
i bip vanno programmati **dopo** che è partito, altrimenti finiscono a un istante già passato e
non si sente nulla.

Ogni battuta si costruisce il suo filtro audio, e l'ultimo bip lo libera quando finisce: senza,
il grafo audio accumulerebbe un nodo per battuta per tutta la serata. E chi parla adesso zittisce
chi parlava prima: proseguendo a metà di una battuta, la voce si interrompe e parte quella nuova.

Le voci si regolano a orecchio in **[`voci.html`](voci.html)** — il banco: una scheda per
personaggio, sette manopole (altezza, ritmo, durata, andamento, timbro, lettere per bip,
volume), un pulsante per ascoltare e, in fondo, il blocco `const VOCE = {…}` già formattato da
incollare qui. Il motore audio è duplicato apposta — il banco deve suonare esattamente come
l'app, senza un terzo file fra i due — quindi cambiandolo va cambiato in tutti e due. `smoke.js`
confronta i profili delle voci fra le due copie.

## Regia delle scene

Ogni scena ha anche le sue **pose**: ogni attore in `cast` può portare una `posa`
(`giuseppe_malore` nel malore, `mauro_guardingo` nelle prime scene), e chi non ne ha una torna al
ritaglio neutro. I nomi sono semantici, non versioni.

Le parti di una scena **condividono le pose**, perché sono una conversazione sola. Serve per le
quattro schermate in cui il palco è il piatto di un indizio e non una stanza: lì il `cast` è
vuoto, ma i personaggi parlano lo stesso, e la figura accanto alla battuta prende la posa che
indossano negli altri momenti della stessa scena.

Le posizioni di personaggi e oggetti si decidono a occhio, non a numeri indovinati. Premendo `r`
su una scena si accende la **modalità regia**: si trascina per spostare, la rotella (o `+` / `-`)
cambia la taglia, le frecce fanno lo scatto fine. Il pannello in basso mostra dal vivo le righe
`cast:` e `primo:` da incollare in `STORY.scene[i]`, con un pulsante per copiarle.

Le modifiche vivono solo nella pagina aperta: per renderle definitive si incollano le righe nel
file.

Sul sito pubblico le scene non mostrano il **titolo**: «Il malore dell'oliva blu» racconterebbe
il delitto al tavolo che sta ancora brindando. L'intestazione resta dove si lavora — file locale
e artefatto — e online la scena si apre sull'immagine, che guadagna lo spazio del titolo.

Regia e sviluppo **non esistono sul sito pubblico**: `r` e `v` rispondono solo aprendo il file
da disco o nell'artefatto privato. La **modalità sviluppo** (`v`) mostra a che schermata e a che
battuta siamo, ed elenca le schermate — una per riga, dalla copertina al messaggio finale, con
accesa quella in cui ci si trova — per andare dove serve in un clic invece che un passo alla
volta. È semitrasparente, così si tiene aperto mentre si prova: sotto si vede la scena. Con
il pannello aperto le frecce si dividono il lavoro — su e giù sfogliano l'elenco, destra e
sinistra percorrono la storia — e si prova tutto senza staccare la mano.

## Immagini

Le illustrazioni le genera Codex e vanno in `assets/images/`, con i nomi elencati in
[`img/ART.md`](img/ART.md). I file arrivano con suffissi di versione (`_v4`, `_v5`):

```sh
python3 sync-assets.py     # tiene la versione più alta di ogni file, ne fa copie web
                           # leggere e le incorpora in oliva-blu.html
```

I fondali sorgente seguono `scenaX_back_nome`, gli elementi davanti al fondale
`scenaX_foreground_nome`, e la copertina `copertina_nome`. La mappa `SLOT_SOURCES` dichiara quale file
riempie quale casella (`scena1.png ← scena1_back_sala2`), mentre la versione (`_v4`, `_v5`) la sceglie da solo
tenendo la più alta. **Tutta la catena usa gli underscore** — file sorgente, chiavi interne,
copie web — e `smoke.js` fallisce alla prima chiave che contenga un trattino: è quello che
impedisce alle due metà della pipeline di divergere. Lo script dice anche cosa manca ancora. **Ogni casella vuota mostra il brief al posto
dell'immagine**, quindi l'app resta presentabile anche a consegna incompleta.

Premendo `d` dentro l'app tutte le illustrazioni diventano sagome colorate — sfondi, ritagli e
pose — utili per giudicare posizioni e ritmo senza farsi distrarre dal disegno. È un velo: le
immagini vere restano dove sono, e ripremendo `d` tornano.

## L'indagine

Sul tavolo degli indizi si può chiedere di **due oggetti su quattro**, e per ognuno si possono
interrogare **due dei quattro sospetti**: gli altri, su quell'oggetto, non parleranno. Le loro
risposte non stanno nel copione — sono informazioni nuove, sedici in tutto, e in una partita se
ne sentono quattro. Ogni nome porta il suo volto, dove si chiede e dove si risponde, e in tutta
la sezione il testo ha una misura sola. Aprire una scheda è
già la scelta, e la schermata dice quante domande restano prima di spenderle. Quello che non si è
chiesto resta non letto: è il punto della cosa, ed è da lì che viene la voglia di rigiocare.

Un **clic scopre**, un **pulsante cambia pagina**. Toccando lo schermo esce la battuta seguente;
per passare alla schermata dopo c'è un pulsante: sopra l'ultima battuta nelle scene — fermo,
mentre le battute gli scorrono sotto — sotto la descrizione di ogni personaggio nella loro
pagina, dove porta al successivo, e in fondo alla pagina altrove. Nelle scene si può premere
anche a metà: scopre la battuta seguente come il clic, e cambia schermata solo quando non resta
altro. Dove invece c'è una scelta aperta — una domanda della scheda, un indizio aperto — resta
spento, perché premerlo costerebbe una domanda o una risposta.

Da telefono le due schermate in cui si sceglie — gli indizi e le domande della scheda — mettono
le quattro carte su **due colonne**, e ogni cambio di schermata riparte dall'alto.

**La storia va in una direzione sola**: non si torna indietro né di una battuta né di una
schermata. Quello che è stato scoperto resta scoperto, e chi guarda non vede mai riavvolgere. Per
ricominciare c'è `Ritenta`, sulla strada della soluzione — o si ricarica la pagina.

Chiudendo l'indagine con delle domande ancora da fare, l'investigatore chiede conferma: riassume
la serata e domanda se ne hai abbastanza, **senza nominare gli indizi** né dire quante domande
restano.

Anche la soluzione si chiede due volte — «Sei sicuro?», poi «Sei veramente sicuro?», con
`Ritenta` e `Vedi la soluzione` — perché dopo il punteggio la tentazione è forte e leggerla
chiude la partita. `Ritenta` non è un ripensamento ma una partita nuova: chiede conferma a sua
volta, e poi riporta alla copertina azzerando le risposte e l'indagine. Ogni finestra di conferma
si apre con l'investigatore che riflette.

Da questa schermata **non si esce toccando lo sfondo**: si passa oltre solo con `Chiudi
l'indagine →`. Vale anche per le domande della scheda finale, dove il pulsante dice a che punto
sei. Altrove il clic fa avanzare; dove si sceglie, costerebbe una domanda o una risposta.

La **scheda finale** è una pagina sola con sei domande: si risponde, la domanda si chiude in una
riga e la successiva compare sotto. Ognuna offre **i quattro sospetti**, col volto sotto il nome:
si sceglie una persona, non una frase. Tre chiedono di ricordare, tre di mettere insieme due momenti diversi.

Le domande non pesano uguale — 2, 1, 1, 2, 1 punti, e **3 per il colpevole**, dieci in tutto — e
il finale dà uno di cinque verdetti, a seconda che il nome sia giusto e di quanto regga il resto:
dal *caso risolto perfettamente* al *qualcosa non torna*. Il verdetto sta da solo: `Vedi la
soluzione` porta all'ultima schermata, dove l'investigatore racconta com'è andata e la storia
si chiude con la parola *Fine*.

L'app dà del **tu a una persona sola**, non a un gruppo: le battute dei personaggi fra loro
restano al plurale dove lo erano.

## Comandi dell'investigatore

| Tasto | Cosa fa |
|---|---|
| clic sullo schermo | scopre la battuta successiva |
| `spazio` / `→` / `↓` | scopre la battuta successiva |
| `←` / `↑` | niente: la storia non torna indietro (sui personaggi risfoglia le schede) |
| pulsante «Prosegui» | l'unico modo di cambiare schermata |
| `1`–`4` | apre un indizio sul tavolo (ne restano due, poi si chiudono) |
| `d` | sagome colorate al posto delle illustrazioni |
| `r` | regia: sposta e ridimensiona personaggi e oggetti sulla scena (non sul sito pubblico) |
| `[` `]` | in regia: porta il selezionato in secondo o in primo piano, oggetti compresi |
| `v` | sviluppo: dove sei, e l'elenco delle schermate per saltarci (non sul sito pubblico) |
| `↑` `↓` | col pannello sviluppo aperto: sfoglia l'elenco delle schermate |
| `←` `→` | col pannello sviluppo aperto: percorre la storia, cambiando pagina a fine scena |
| `m` | azzera il volume delle voci, o rimette l'ultimo |
| `f` | schermo intero |
| `?` | tutti i comandi (non c'è più un pulsante: solo il tasto) |

Il sito pubblico sta su **https://viridjan.github.io/app-con-delitto/** e si aggiorna a ogni
push su `main`.

## Verifica

```sh
node smoke.js         # percorre ogni schermata e controlla i conti del quiz
node dom.js prima.txt # scrive il markup di tutte le schermate, battute scoperte
```

### Leggibilità da telefono

`audit-mobile.js` si inietta nella pagina e misura, per ogni elemento con del testo, dimensione
reale, contrasto e ingombro; `telaio-390.html` lo ospita dentro un iframe da 390px, perché
Chromium headless non scende sotto i 500 per gli script. La cornice però non sostituisce il
telefono: per mesi ha misurato regole che sul dispositivo non entravano nemmeno in funzione,
perché mancava il `<meta viewport>`. Insieme dicono se qualcosa è troppo
piccolo, troppo poco contrastato o troppo stretto per un dito.

```sh
chromium --headless --allow-file-access-from-files --dump-dom \
  "file://$PWD/telaio-390.html?p=pagina-da-provare.html"
```

`dom.js` serve prima e dopo un riordino del codice: tolti gli attributi `class` e `style`, il
`diff` fra i due file dev'essere vuoto. Se non lo è, il riordino ha cambiato anche la sostanza.

I due script — e `estrai-copione.js` — leggono l'app attraverso **`stub-dom.js`**, un finto DOM
di una dozzina di metodi. Non si lancia da solo. Prima ne esistevano tre copie scritte a mano, e
avevano già cominciato a divergere.

Il copione approvato è **[`copione.txt`](copione.txt)**: è quello che l'app deve mostrare, parola
per parola. L'unica correzione ammessa è ortografica — accenti sbagliati, apostrofi dritti, punti
mancanti — e va fatta nel txt **e** nell'app nello stesso passaggio, o i due divergono in
silenzio. Il controllo verifica che ogni battuta fra «virgolette
basse» compaia identica nell'HTML, e se cambia dice quale. Il PDF resta l'originale da cui il
copione è tratto.

## Diritti

Il copione — il PDF e il testo dentro `STORY` — è di **Carlo Maria Gervasio**, ed è usato qui
**con la sua autorizzazione**. I diritti restano suoi: per riusare il testo altrove, chiedere a
lui.

Il codice dell'app è di chi lo ha scritto; nessuna licenza dichiarata, quindi valgono i diritti
d'autore di default.
