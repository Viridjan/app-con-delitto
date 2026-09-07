# Il mistero dell'oliva blu

App per l'investigatore di una "cena con delitto": quattro scene illustrate divise in dodici
schermate (venti in tutto), un tavolo di indizi da
esaminare in ordine libero, la scheda finale e la soluzione. L'investigatore la guida davanti al
tavolo dei giocatori — da proiettore, da tablet o da telefono.

Tratta dal copione **_Il mistero dell'oliva blu_** di **Carlo Maria Gervasio**
(`ullgi_L-inaugurazione_COSTA_rev.pdf`), usato con la sua autorizzazione. Il testo di Gervasio
nell'app è quello originale, parola per parola; accanto ad esso il copione è cresciuto di battute
scritte dall'autore dell'app — oggi sono circa la metà delle settanta.

## Aprire l'app

Apri il [sito pubblico](https://viridjan.github.io/app-con-delitto/) oppure scarica il
repository e apri `oliva-blu.html` con un doppio clic. Mantieni accanto all'HTML
`assets/assets.js`: contiene le illustrazioni e permette di giocare anche senza rete.
Se manca, l'app mostra ripieghi tipografici al posto delle immagini.

Non occorrono installazioni, build o server. Si può usare un proiettore, un tablet o un telefono.

## La voce dei personaggi

Ogni personaggio accompagna il testo con una voce di bip sintetizzati. Le battute compaiono
al ritmo della voce, anche col volume a zero. La barra in alto a destra regola il volume;
lasciandola si sente una prova. `m` azzera il volume e, ripremuto, ripristina l'ultimo livello.

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
| pulsante «Prosegui» | cambia schermata quando le battute sono finite |
| `1`–`4` | apre un indizio sul tavolo, entro il limite di due oggetti |
| `d` | attiva o disattiva le sagome colorate al posto delle illustrazioni |
| `m` | azzera il volume delle voci, o ripristina l'ultimo livello |
| `f` | schermo intero |
| `?` | mostra i comandi disponibili |

## Per chi modifica l'app

[CLAUDE.md](CLAUDE.md) raccoglie comandi di verifica, architettura, immagini,
strumenti di regia e sviluppo, distribuzione e regole per contribuire.
I dettagli di impaginazione e narrazione sono nel
[riferimento di design](docs/design-reference.md).

## Diritti

Il copione — il PDF e il testo dentro `STORY` — è di **Carlo Maria Gervasio**, ed è usato qui
**con la sua autorizzazione**. I diritti restano suoi: per riusare il testo altrove, chiedere a
lui.

Il codice dell'app è di chi lo ha scritto; nessuna licenza dichiarata, quindi valgono i diritti
d'autore di default.
