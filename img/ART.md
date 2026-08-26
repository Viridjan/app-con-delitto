# Illustrazioni — *Il mistero dell'oliva blu*

21 immagini. I file vanno in `assets/images/` (dove sta già scrivendo Codex). I nomi sono **esatti**: l'app li cerca così e, finché non li trova,
mostra al loro posto il brief testuale (quindi si può consegnare a lotti).

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
- Il **Narratore** non compare nelle scene: esiste solo come ritratto, una mascotte, per
  esempio un meeple investigatore.

## Come è fatta una scena

L'app compone ogni scena a strati: **lo sfondo sotto, i cinque personaggi ritagliati sopra**.
Quando un personaggio parla, l'app lo porta avanti e schiarisce lui solo, lasciando gli altri
indietro e in penombra. Perciò servono due cose diverse:

1. `scenaN.png` — **l'ambiente senza personaggi**. La descrizione qui sotto racconta cosa
   succede nella scena: serve a capire il luogo, la luce e gli oggetti sul tavolo. I personaggi
   descritti **non vanno disegnati**: lascia lo spazio dove staranno.
2. `attore-*.png` — un ritaglio a figura intera per personaggio, su fondo trasparente, riusato
   in tutte e cinque le scene.

Se preferite scene piatte già complete di personaggi, basta non consegnare i ritagli: l'app
mostra l'illustrazione così com'è e salta i livelli.

## Scene — 16:9, ambiente senza personaggi

| File | Brief |
|---|---|
| `copertina.png` | Il simbolo degli Oliviani fra rami d'ulivo, candele e ciotole di olive. Nessun testo: il titolo lo mette l'app. |
| `scena1.png` | L'interno della nuova sede degli Oliviani. Sala decorata con rami d'ulivo, stoffe verdi e bianche, candele e ciotole di olive. Al centro un palco o altare con il simbolo. Roberto e Augusto accolgono gli ospiti, solenni ma sorridenti. Giuseppe entra elegante e sicuro di sé, accanto a lui Rosalia più preoccupata che felice. In fondo Mauro, in disparte, osserva Giuseppe. |
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

## Ritratti — 1:1, mezzo busto, cornice lignea e trasparenza

Ogni ritratto usa una cornice di legno diversa, intagliata con motivi legati al personaggio.
L'esterno della cornice deve essere trasparente; nessun testo o targhetta con nome.
Il personaggio appartiene al dipinto: testa, busto, braccia, mani e ogni altro elemento devono
rimanere completamente dentro l'apertura interna, dietro il piano della cornice, senza toccarla
o sovrapporsi agli intagli. Nessun effetto «fuori dal quadro».
Le cornici devono essere anche cromaticamente distinguibili: Giuseppe argento anticato,
Rosalia legno naturale caldo, Roberto verde oliva, Augusto oro/ocra, Mauro petrolio quasi nero,
Narratore salvia con dettagli dorati.

| File | Personaggio |
|---|---|
| `ritratto-giuseppe.png` | Giuseppe Maria De Robertis — ricco benefattore, elegante, sicuro di sé. |
| `ritratto-rosalia.png` | Rosalia De Robertis — nipote di Giuseppe; gli vuole bene, ma è preoccupata. |
| `ritratto-roberto.png` | Roberto Vispero — fondatore degli Oliviani, conosce ulivi e prodotti agricoli. |
| `ritratto-augusto.png` | Augusto De Virgilis — fondatore degli Oliviani, parla della produzione dell'olio. |
| `ritratto-mauro.png` | Mauro Damiani — nuovo adepto, molto serio, rigido, sospettoso. |
| `ritratto-narratore.png` | Il Narratore — mascotte guida, un meeple investigatore. |

Consegna: PNG dentro `assets/images/`. **Non sovrascrivere mai un'immagine esistente**:
salvare ogni revisione con suffisso progressivo (`-v2`, `-v3`, ecc.). Aprire l'app e premere
`p` per vedere quali file risultano consegnati e quali mancano ancora.

## Regola di selezione delle versioni

La cartella `assets/images/bocciate/` contiene immagini scartate e va sempre esclusa dalla
selezione dei file di partenza. Per ogni nuova revisione, lavorare sull'ultima versione numerica
presente in `assets/images/` **al di fuori di `bocciate/`** (per esempio, tra `-v2` e `-v4` usare
`-v4`). Un numero di versione più alto dentro `bocciate/` non rende quell'immagine attiva e non
deve mai essere usato come riferimento. Anche il nuovo output va versionato senza sovrascrivere
file esistenti; il suffisso deve restare progressivo e non riutilizzare numeri già presenti,
compresi quelli delle immagini bocciate.
