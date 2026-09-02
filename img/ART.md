# Illustrazioni — *Il mistero dell'oliva blu*

I sorgenti vanno in `assets/images/`; `assets/web/` contiene le copie ottimizzate prodotte da
`sync-assets.py` e non va modificata a mano. Se un'immagine non è disponibile, l'app mostra il
brief testuale al suo posto.

## Stato attuale — 26 agosto 2026

Tutte le caselle narrative obbligatorie sono complete: copertina animata, cinque ambienti,
cinque attori canonici con pose narrative, sei ritratti e quattro indizi trasparenti. Sono
presenti anche i due oggetti in primo piano della scena 1.

Due inciampi da evitare, capitati davvero: uno sfondo consegnato **con i personaggi già
dipinti dentro** (li mostra due volte, perché i ritagli si sovrappongono), e un ritaglio con una
**riga di guida sul bordo della tela** — anche sottile, fa sballare il ritaglio automatico e si
vede in pagina. La tela attorno alla figura dev'essere trasparente e basta.

I nomi `scenaN.png` sono **caselle**, non i numeri che il pubblico legge: `scena4.png` è il
malore, che sullo schermo è la seconda parte della scena 3, e `scena5.png` è il tavolo, che è la
scena 4. Le caselle non cambiano quando le scene vengono rinumerate.

Non risultano immagini obbligatorie mancanti. Gli eventuali oggetti `scena2-sx/dx` fino a
`scena5-sx/dx` sono espansioni facoltative: il codice non li mostra finché non vengono inseriti
in `STORY.scene[i].primo`.

| Casella dell'app | Sorgente attuale |
|---|---|
| `copertina.png` | `quadro-oliva-animato.webp` |
| `scena1.png` | `sala2-v5.png` |
| `scena1-sx.png` | `sala2-oggettoSX-v2.png` |
| `scena1-dx.png` | `sala2-oggettoDX-v3.png` |
| `scena2.png` | `donazione.png` |
| `scena3.png` | `brindisi.png` |
| `scena4.png` | `malore.png` |
| `scena5.png` | `indagine.png` |

## Stile condiviso (vale per tutte)

> Illustrazione piatta, stile libro illustrato per ragazzi. Palette verde oliva, crema e oro,
> luce calda di candele. **Gouache materica con pennellate ampie e ben visibili**: tracce di
> setola direzionali, pigmento opaco sovrapposto, bordi a pennello asciutto e masse di colore
> costruite col gesto. Evitare tratteggio da matita, microtexture ripetitiva, grana digitale,
> effetto tela uniforme e filtri globali. Contorni morbidi e dipinti, nessun realismo fotografico.
> **Nessun elemento horror, nessun sangue, nessuna espressione di terrore**: il tono è
> accogliente, curioso e un po' misterioso.
> **Nessun testo leggibile dentro le immagini**: niente titoli, etichette, lettere, numeri o
> parole reali. Sui documenti sono ammessi tratti d'inchiostro astratti, righe ondulate,
> sigilli e svolazzi simili a firme, purché non formino caratteri o parole riconoscibili.
> Tutte le parole effettive vengono sovrapposte dall'HTML dell'app.

Regole di continuità:

- Il simbolo degli Oliviani — una **grande oliva stilizzata** — ricorre in ogni scena.
- Gli stessi cinque personaggi, stessi vestiti e stessi colori, dalla scena 1 alla scena 5.

## Come è fatta una scena

L'app compone ogni scena a strati: **lo sfondo sotto, i cinque personaggi ritagliati sopra**.
Quando un personaggio parla, l'app lo porta avanti e schiarisce lui solo, lasciando gli altri
indietro e in penombra. Perciò servono due cose diverse:

1. `scenaN.png` — **l'ambiente senza personaggi**. La descrizione qui sotto racconta cosa
   succede nella scena: serve a capire il luogo, la luce e gli oggetti sul tavolo. I personaggi
   descritti **non vanno disegnati**: lascia lo spazio dove staranno.
2. `attore-*.png` — un ritaglio a figura intera per personaggio, su fondo trasparente, riusato
   in tutte e cinque le scene.
3. `scenaN-sx.png` e `scenaN-dx.png` — **oggetti in primo piano**, su fondo trasparente, uno per
   angolo basso. Stanno davanti a tutti, anche ai personaggi, e servono a dare profondità: un
   tavolo imbandito, una poltrona, un candelabro. Vanno disegnati **visti da vicino**, con la
   stessa luce della scena; l'app li appoggia agli angoli e li lascia tagliare dal bordo.
   Sono facoltativi: senza di loro la scena resta valida.

Se preferite scene piatte già complete di personaggi, basta non consegnare i ritagli: l'app
mostra l'illustrazione così com'è e salta i livelli.

## Scene — 16:9, ambiente senza personaggi

| File | Brief |
|---|---|
| `copertina.png` | Il simbolo degli Oliviani fra rami d'ulivo, candele e ciotole di olive. Nessun testo: il titolo lo mette l'app. |
| `scena1.png` | L'ambiente **sgombro in primo piano**: gli oggetti davanti arrivano da `scena1-sx/dx`. L'interno della nuova sede degli Oliviani. Sala decorata con rami d'ulivo, stoffe verdi e bianche, candele e ciotole di olive. Al centro un palco o altare con il simbolo. Roberto e Augusto accolgono gli ospiti, solenni ma sorridenti. Giuseppe entra elegante e sicuro di sé, accanto a lui Rosalia più preoccupata che felice. In fondo Mauro, in disparte, osserva Giuseppe. |
| `scena2.png` | Giuseppe vicino a un tavolo con un grande foglio di donazione riempito soltanto da finte righe d'inchiostro illeggibili, sigillo e svolazzo astratto. Penna, olive, una piccola bottiglia d'olio, un cartellino illustrato senza parole con le fasi della produzione. Roberto e Augusto soddisfatti, Rosalia preoccupata, Mauro cupo e silenzioso. Si deve capire che la donazione crea tensione. |
| `scena3.png` | Il rinfresco: olive, pane, taralli, bicchieri, bottiglie. **Mauro porge un bicchiere a Giuseppe** — gesto chiarissimo, la mano che offre e la mano che prende. Sullo sfondo Roberto parla con gli ospiti, Augusto mostra una bottiglia d'olio, Rosalia in disparte, turbata. Scena tranquilla, ma **il bicchiere è il fuoco visivo**: primo piano, illuminato. |
| `scena4.png` | Giuseppe ha appena bevuto e si sente male: una mano alla gola o al petto, il bicchiere che scivola o è caduto vicino a lui. Tutti si girano spaventati, Rosalia corre verso lo zio, Roberto e Augusto agitati, Mauro più rigido degli altri, come se sapesse già. Dettaglio decisivo: **la bocca (o la lingua) di Giuseppe è diventata blu — evidente, ma non horror**. Malessere, non terrore. |
| `scena5.png` | Un tavolo ordinato come in una piccola indagine, con i quattro indizi ben riconoscibili uno per uno ma senza testo: il bicchiere, la bottiglietta con simbolo visivo di pericolo, il foglio di donazione, il biglietto manoscritto mostrato come foglio piegato ma completamente privo di segni. Attorno: Roberto e Augusto preoccupati, Rosalia triste e sorpresa, Mauro nervoso con le mani strette. **Gli oggetti contano più dello sfondo.** |

## Indizi — 1:1, oggetto isolato su fondo neutro, come una prova su un tavolo

| File | Oggetto |
|---|---|
| `indizio-bicchiere.png` | Il bicchiere di Giuseppe, rovesciato. |
| `indizio-bottiglietta.png` | La bottiglietta con un chiaro simbolo visivo di pericolo, senza etichetta testuale. |
| `indizio-foglio.png` | Il foglio di donazione completamente privo di testo, con la penna. |
| `indizio-biglietto.png` | Un biglietto piegato completamente privo di scrittura; il contenuto viene mostrato dall'HTML. |

## Personaggi ritagliati — PNG con trasparenza

Figura intera, in piedi, di tre quarti, sguardo verso il centro della scena. Stessa altezza
relativa e stessa luce per tutti e cinque, piedi appoggiati al bordo inferiore dell'immagine
(l'app li appoggia sul pavimento della scena). Niente ombra dipinta: l'ombra la mette l'app.

| File | Personaggio |
|---|---|
| `attore-giuseppe.png` | Giuseppe, elegante, sicuro di sé. |
| `attore-rosalia.png` | Rosalia, preoccupata. |
| `attore-roberto.png` | Roberto, solenne ma sorridente. |
| `attore-augusto.png` | Augusto, solenne ma sorridente. |
| `attore-mauro.png` | Mauro, rigido, teso. |

### Pose narrative aggiuntive

Le pose aggiuntive hanno nomi semantici e convivono con gli attori canonici:

| File | Uso |
|---|---|
| `attore-giuseppe-malore.png` | Giuseppe dopo aver bevuto, scena 4. |
| `attore-rosalia-pensierosa.png` | Rosalia turbata, scene 1–3. |
| `attore-rosalia-allarmata.png` | Rosalia durante il malore e l'indagine. |
| `attore-roberto-preoccupato.png` | Roberto nelle scene 4–5. |
| `attore-augusto-sorpreso.png` | Augusto nelle scene 4–5. |
| `attore-mauro-guardingo.png` | Mauro in disparte, scene 1–3. |
| `attore-mauro-nervoso.png` | Mauro teso, scene 4–5. |

Restano disponibili, ma non collegate, anche `attore-giuseppe-presentazione.png`,
`attore-roberto-accoglienza.png` e `attore-augusto-spiegazione.png`.

## Ritratti — 1:1, mezzo busto, cornice lignea e trasparenza

Ogni ritratto usa una cornice di legno diversa, intagliata con motivi legati al personaggio.
L'esterno della cornice deve essere trasparente; nessun testo o targhetta con nome.
Il personaggio appartiene al dipinto: testa, busto, braccia, mani e ogni altro elemento devono
rimanere completamente dentro l'apertura interna, dietro il piano della cornice, senza toccarla
o sovrapporsi agli intagli. Nessun effetto «fuori dal quadro».
Le cornici devono essere anche cromaticamente distinguibili: Giuseppe argento anticato,
Rosalia legno naturale caldo, Roberto verde oliva, Augusto oro/ocra, Mauro petrolio quasi nero.

| File | Personaggio |
|---|---|
| `ritratto-giuseppe.png` | Giuseppe Maria De Robertis — ricco benefattore, elegante, sicuro di sé. |
| `ritratto-rosalia.png` | Rosalia De Robertis — nipote di Giuseppe; gli vuole bene, ma è preoccupata. |
| `ritratto-roberto.png` | Roberto Vispero — fondatore degli Oliviani, conosce ulivi e prodotti agricoli. |
| `ritratto-augusto.png` | Augusto De Virgilis — fondatore degli Oliviani, parla della produzione dell'olio. |
| `ritratto-mauro.png` | Mauro Damiani — nuovo adepto, molto serio, rigido, sospettoso. |

Consegna: PNG dentro `assets/images/`. **È obbligatorio versionare ogni revisione: non
sovrascrivere mai un'immagine esistente, anche se non è ancora stata committata**. Per una
revisione dello stesso disegno usare il suffisso progressivo (`-v2`, `-v3`, ecc.); per una posa
o funzione realmente diversa usare un nome semantico (`-malore`, `-nervoso`, `-accoglienza`).
Aprire l'app e premere `p` per controllare le caselle collegate.

## Regola di selezione delle versioni

La cartella `trash/immagini/` contiene immagini scartate e va sempre esclusa dalla selezione dei
file di partenza. Per ogni nuova revisione, lavorare sull'ultima versione numerica presente in
`assets/images/` (per esempio, tra `-v2` e `-v4` usare `-v4`). Un numero di versione più alto
dentro `trash/immagini/` non rende quell'immagine attiva e non
deve mai essere usato come riferimento. Una revisione dello stesso soggetto va versionata senza
sovrascrivere file esistenti; il suffisso deve restare progressivo e non riutilizzare numeri già
presenti, compresi quelli delle immagini bocciate. Una nuova posa può invece ricevere un nome
semantico univoco. In entrambi i casi, non usare mai come riferimento un file in
`trash/immagini/`.
