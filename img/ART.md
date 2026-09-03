# Illustrazioni — *Il mistero dell'oliva blu*

I sorgenti vanno in `assets/images/`: i fondali seguono `scenaX_back_nome`, i livelli davanti
alla scena `scenaX_foreground_nome` e la copertina `copertina_nome`. `assets/web/` contiene le copie ottimizzate prodotte da
`sync-assets.py` e non va modificata a mano. Se un'immagine non è disponibile, l'app mostra il
brief testuale al suo posto.

## Stato attuale — 26 agosto 2026

Tutte le caselle narrative obbligatorie sono complete: copertina animata, sfondi e tavole,
cinque attori canonici con pose narrative, sei ritratti e quattro indizi trasparenti. Sono
presenti anche i due oggetti in primo piano della scena 1.

Due inciampi da evitare, capitati davvero: uno sfondo consegnato **con i personaggi già
dipinti dentro** (li mostra due volte, perché i ritagli si sovrappongono), e un ritaglio con una
**riga di guida sul bordo della tela** — anche sottile, fa sballare il ritaglio automatico e si
vede in pagina. La tela attorno alla figura dev'essere trasparente e basta.

I numeri `scenaN.png` identificano soltanto gli sfondi effettivamente usati. Le pose hanno chiavi
semantiche separate: `scena3_brindisi`, `scena3_malore` e `indagine`. La scena 4 usa le tavole isolate degli
indizi e lo sfondo di `scena2`, quindi non richiede un `scena5.png`.

Non risultano immagini obbligatorie mancanti. Gli eventuali oggetti `scena2_sx/dx` sono
espansioni facoltative: il codice non li mostra finché non vengono inseriti
in `STORY.scene[i].primo`.

| Casella dell'app | Sorgente attuale |
|---|---|
| `copertina.png` | `copertina_quadro_oliva_animato.webp` |
| `scena1.png` | `scena1_back_sala2_v5.png` |
| `scena1_sx.png` | `scena1_foreground_sala2_oggettoSX_v2.png` |
| `scena1_dx.png` | `scena1_foreground_sala2_oggettoDX_v3.png` |
| `scena2.png` | `scena2_back_sala1_scena2.png` |

`scena3_back_brindisi.png` e `scena3_back_malore.png` sono sorgenti conservati ma non incorporati: entrambe le parti
riutilizzano la sala di `scena1` e vi sovrappongono le pose specifiche.

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
2. `attore_*.png` — un ritaglio a figura intera per personaggio, su fondo trasparente, riusato
   in tutte e cinque le scene.
3. `scenaN_foreground_nome.png` — **oggetti in primo piano**, su fondo trasparente,
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
| `scena1.png` | L'ambiente **sgombro in primo piano**: gli oggetti davanti arrivano da `scena1_sx/dx`. L'interno della nuova sede degli Oliviani. Sala decorata con rami d'ulivo, stoffe verdi e bianche, candele e ciotole di olive. Al centro un palco o altare con il simbolo. Roberto e Augusto accolgono gli ospiti, solenni ma sorridenti. Giuseppe entra elegante e sicuro di sé, accanto a lui Rosalia più preoccupata che felice. In fondo Mauro, in disparte, osserva Giuseppe. |
| `scena2.png` | Giuseppe vicino a un tavolo con un grande foglio di donazione riempito soltanto da finte righe d'inchiostro illeggibili, sigillo e svolazzo astratto. Penna, olive, una piccola bottiglia d'olio, un cartellino illustrato senza parole con le fasi della produzione. Roberto e Augusto soddisfatti, Rosalia preoccupata, Mauro cupo e silenzioso. Si deve capire che la donazione crea tensione. |
| `scena3_back_brindisi.png` *(archivio, non incorporato)* | Il rinfresco: olive, pane, taralli, bicchieri, bottiglie. **Mauro porge un bicchiere a Giuseppe** — gesto chiarissimo, la mano che offre e la mano che prende. Sullo sfondo Roberto parla con gli ospiti, Augusto mostra una bottiglia d'olio, Rosalia in disparte, turbata. Scena tranquilla, ma **il bicchiere è il fuoco visivo**: primo piano, illuminato. |
| `scena3_back_malore.png` *(archivio, non incorporato)* | Giuseppe ha appena bevuto e si sente male: una mano alla gola o al petto, il bicchiere che scivola o è caduto vicino a lui. Tutti si girano spaventati, Rosalia corre verso lo zio, Roberto e Augusto agitati, Mauro più rigido degli altri, come se sapesse già. Dettaglio decisivo: **la bocca (o la lingua) di Giuseppe è diventata blu — evidente, ma non horror**. Malessere, non terrore. |

## Indizi — 1:1, oggetto isolato su fondo neutro, come una prova su un tavolo

| File | Oggetto |
|---|---|
| `indizio_bicchiere.png` | Il bicchiere di Giuseppe, rovesciato. |
| `indizio_bottiglietta.png` | La bottiglietta con un chiaro simbolo visivo di pericolo, senza etichetta testuale. |
| `indizio_foglio.png` | Il foglio di donazione completamente privo di testo, con la penna. |
| `indizio_biglietto.png` | Un piccolo biglietto privato in carta azzurro-grigia riciclata, strappato e piegato due volte; soltanto brevi segni illeggibili, perché il contenuto viene mostrato dall'HTML. Deve distinguersi dal grande foglio formale della donazione: niente cornice, sigillo o decorazioni ufficiali. Versione sorgente corrente: `indizio_biglietto_v2.png`. |

## Personaggi ritagliati — PNG con trasparenza

Figura intera, in piedi, di tre quarti, sguardo verso il centro della scena. Stessa altezza
relativa e stessa luce per tutti e cinque, piedi appoggiati al bordo inferiore dell'immagine
(l'app li appoggia sul pavimento della scena). Niente ombra dipinta: l'ombra la mette l'app.

| File | Personaggio |
|---|---|
| `attore_giuseppe.png` | Giuseppe, elegante, sicuro di sé. |
| `attore_rosalia.png` | Rosalia, preoccupata. |
| `attore_roberto.png` | Roberto, solenne ma sorridente. |
| `attore_augusto.png` | Augusto, solenne ma sorridente. |
| `attore_mauro.png` | Mauro, rigido, teso. |

### Pose narrative aggiuntive

Le pose aggiuntive hanno nomi semantici e convivono con gli attori canonici:

| File | Uso |
|---|---|
| `attore_giuseppe_malore.png` | Giuseppe dopo aver bevuto, scena 3. |
| `attore_rosalia_pensierosa.png` | Rosalia turbata, scene 1–2. |
| `attore_rosalia_allarmata.png` | Rosalia durante il malore e l'indagine. |
| `attore_roberto_preoccupato.png` | Roberto durante il malore e l'indagine. |
| `attore_augusto_sorpreso.png` | Augusto durante il malore e l'indagine. |
| `attore_mauro_guardingo.png` | Mauro in disparte, scene 1–2. |
| `attore_mauro_nervoso.png` | Mauro durante il malore e l'indagine. |

Restano disponibili anche `attore_giuseppe_presentazione.png` e
`attore_roberto_accoglienza.png`; `attore_augusto_spiegazione.png` è archiviato in `trash/`.

### Set coerente generato il 3 settembre 2026

I cinque `ritratto_*` restano la fonte canonica per identità, capelli e incarnato. Le varianti
qui sotto sono state rigenerate nello stesso stile pittorico, con abiti, colori e proporzioni
bloccati per personaggio. Sono file sorgente versionati: `sync-assets.py` li collega alle caselle
logiche senza sovrascrivere le generazioni precedenti.

- Giuseppe: `attore_giuseppe_v4.png`, `attore_giuseppe_presentazione_v2.png`,
  `attore_giuseppe_brindisi_v3.png`, `attore_giuseppe_malore_v2.png`.
- Rosalia: `volto_rosalia_v2.png`, `attore_rosalia_pensierosa_v2.png`,
  `attore_rosalia_brindisi_v2.png`, `attore_rosalia_allarmata_v2.png`.
- Roberto: `volto_roberto_v2.png`, `attore_roberto_v3.png`,
  `attore_roberto_accoglienza_v2.png`, `attore_roberto_brindisi_v2.png`,
  `attore_roberto_preoccupato_v2.png`.
- Augusto: `volto_augusto_v2.png`, `attore_augusto_v3.png`,
  `attore_augusto_brindisi_v2.png`, `attore_augusto_sorpreso_v2.png`.
- Mauro: `volto_mauro_v2.png`, `attore_mauro_guardingo_v2.png`,
  `attore_mauro_brindisi_v3.png`, `attore_mauro_nervoso_v2.png`.

Tutte le nuove figure sono PNG RGBA. Il motivo a scacchi prodotto dal generatore è stato
convertito in un vero canale alfa prima della sincronizzazione web.

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
| `ritratto_giuseppe.png` | Giuseppe Maria De Robertis — ricco benefattore, elegante, sicuro di sé. |
| `ritratto_rosalia.png` | Rosalia De Robertis — nipote di Giuseppe; gli vuole bene, ma è preoccupata. |
| `ritratto_roberto.png` | Roberto Vispero — fondatore degli Oliviani, conosce ulivi e prodotti agricoli. |
| `ritratto_augusto.png` | Augusto De Virgilis — fondatore degli Oliviani, parla della produzione dell'olio. |
| `ritratto_mauro.png` | Mauro Damiani — nuovo adepto, molto serio, rigido, sospettoso. |

Consegna: PNG dentro `assets/images/`. **È obbligatorio versionare ogni revisione: non
sovrascrivere mai un'immagine esistente, anche se non è ancora stata committata**. Per una
revisione dello stesso disegno usare il suffisso progressivo (`_v2`, `_v3`, ecc.); per una posa
o funzione realmente diversa usare un nome semantico (`-malore`, `-nervoso`, `-accoglienza`).
Aprire l'app e premere `p` per controllare le caselle collegate.

## Regola di selezione delle versioni

La cartella `trash/immagini/` contiene immagini scartate e va sempre esclusa dalla selezione dei
file di partenza. Per ogni nuova revisione, lavorare sull'ultima versione numerica presente in
`assets/images/` (per esempio, tra `_v2` e `_v4` usare `_v4`). Un numero di versione più alto
dentro `trash/immagini/` non rende quell'immagine attiva e non
deve mai essere usato come riferimento. Una revisione dello stesso soggetto va versionata senza
sovrascrivere file esistenti; il suffisso deve restare progressivo e non riutilizzare numeri già
presenti, compresi quelli delle immagini bocciate. Una nuova posa può invece ricevere un nome
semantico univoco. In entrambi i casi, non usare mai come riferimento un file in
`trash/immagini/`.
