# Prompt per Codex — la scena fra gli ulivi

Servono le illustrazioni per una scena nuova, **all'aperto**, e per due personaggi nuovi:
Elisa ed Andrea. Prima di disegnare leggi `img/ART.md`: stile, palette, regole di continuità e
regole di consegna valgono tutte anche qui. Usa come riferimento di stile i file attivi in
`assets/images/`, mai quelli in `trash/`.

Non toccare codice, `copione.txt`, `assets/assets.js` né `img/ART.md`. Non lanciare
`sync-assets.py`: le consegne le aggancia Claude. Consegna solo file nuovi in `assets/images/`.

## Procedura a fasi — revisione prima di proseguire

1. Leggi le regole condivise e osserva i ritratti attivi più recenti in `assets/images/`.
   Genera soltanto `ritratto_elisa.png` e `ritratto_andrea.png`, ciascuno in un file separato.
2. Mostra i due ritratti ed elenca i file consegnati. **Fermati per la revisione dell’utente**:
   non generare ancora volti, pose, sfondo o primo piano. Eventuali correzioni producono
   versioni progressive; non sovrascrivere le proposte precedenti.
3. Dopo approvazione esplicita, usa i ritratti approvati come riferimenti visivi canonici
   per i rispettivi volti e le quattro pose. Mantieni identici lineamenti, capelli,
   incarnato, abiti e accessori; conserva il tablet e i due braccialetti in entrambe le pose di Andrea.
4. Genera lo sfondo e, se incluso nella consegna, il primo piano. Controlla ogni file
   prima di consegnarlo secondo la lista finale.

La fase iniziale consegna **2 PNG**. Il set completo comprende **9 PNG obbligatori**
(compresi i due ritratti) e **1 PNG facoltativo** per il cavalletto. Si aggiungono poi, come
fase successiva: **2 revisioni** di Elisa con il blu sulle dita (`_v2`), **3 pose** per le scene 4
e 5 e **3 indizi nuovi**: 8 PNG in più.

## La scena

L'oliveto dietro la casa degli Oliviani, al tramonto. Augusto porta fuori gli ospiti (Roberto
è rimasto dentro, in questa scena non c'è) e presenta sua moglie Elisa, pittrice, e arriva Andrea, uno studente che Giuseppe conosce già
bene. Giuseppe chiede a Elisa a che punto è il suo ritratto: lei l'ha messo da parte per altri
lavori. Si parla della luce, delle foglie d'ulivo verdi sopra e argentate sotto, degli ulivi
millenari pugliesi. Fra Giuseppe e Andrea c'è una tenerezza discreta, mai dichiarata.

Il tono resta quello di tutta la storia: accogliente, curioso, appena misterioso.

## 1. Sfondo — `scena3_back_oliveto.png`

16:9, **nessun personaggio dipinto** (è già successo una volta e si vedevano doppi).

- Un oliveto pugliese al tramonto: ulivi secolari dai tronchi contorti e cavi, almeno uno
  **monumentale** in posizione d'onore, muretti a secco, terra rossa, erba secca.
- Luce calda e radente, dorata; le chiome mostrano il **rovescio argentato** delle foglie mosse
  dal vento. Sullo sfondo, la facciata chiara della casa degli Oliviani con un paio di finestre
  illuminate e il **simbolo dell'oliva stilizzata** (continuità obbligatoria).
- Qualche dettaglio di serata all'aperto: lanterne appese ai rami, un tavolino con una
  caraffa e delle olive. Niente bicchieri in evidenza: il bicchiere è l'indizio di un'altra scena.
- **Composizione:** l'app mostra la scena in un **quadrato centrale** e ne nasconde anche il 10%
  in alto e in basso. Tutto ciò che conta sta nel quadrato centrale, nella fascia fra 10% e 90%
  dell'altezza. Per un 16:9 centrato, l’area sicura è x=21,875–78,125%,
  y=10–90% del file sorgente. Il primo piano e il terreno al centro restano **sgombri**: lì stanno le figure.
- Gamma: verde oliva, crema, oro, ocra, terra rossa. Il cielo va sul pesca e sull'oro, **non
  sul blu**: in questa app il blu è riservato al veleno.

## 2. Primo piano (facoltativo) — `scena3_foreground_oliveto_cavalletto.png`

PNG trasparente, oggetto visto da vicino, pensato per l'angolo in basso a destra. Il
**cavalletto di Elisa** con il ritratto di Giuseppe **non finito**: il volto abbozzato, lo sfondo
ancora vuoto, una cassetta di colori e pennelli ai piedi. Stessa luce di tramonto dello sfondo.
Usa `ritratto_giuseppe_v4.png` come riferimento per l’identità del volto abbozzato.
Nessuna firma o scritta leggibile.

## 3. Personaggi ritagliati — PNG con trasparenza vera

Figura intera, in piedi, di tre quarti, sguardo verso il centro, piedi sul bordo inferiore,
nessuna ombra dipinta, **nessuna riga di guida sui bordi**, nessun fondo a scacchi: canale alfa
reale. Andrea è destinato al lato destro della scena: in entrambe le pose guarda
verso sinistra, dove si trova Giuseppe. Elisa è destinata al lato sinistro e guarda
verso destra. Queste indicazioni definiscono la composizione per la successiva integrazione.
Proporzioni e altezza relativa coerenti con `attore_augusto_v3.png` e
`attore_giuseppe_v4.png`.

**Elisa Lanzillotta** — moglie di Augusto, pittrice elegante. Sui 45 anni, portamento sicuro e
un po' teatrale. **Occhi blu naturali**, corporatura leggermente più morbida e in carne,
seno un poco più pieno, proporzioni naturali e stesso abito. Capelli scuri raccolti in uno chignon morbido con una ciocca grigia, orecchini
d'oro pendenti. Abito lungo **terracotta**, scialle **crema** sulle spalle. Un dettaglio da
pittrice che è anche un **indizio della trama**: i polpastrelli di pollice, indice e medio
della mano destra sono macchiati di **blu oltremare**. Vedi la sezione *Il blu sulle dita*. Colori
da tenere identici in ogni file.

**Andrea Leuzzi** — studente universitario brillante, adulto, sui 25 anni, **molto bello**:
lineamenti regolari, **pelle scura di tono bruno profondo e caldo**, capelli **biondi
rasati ai lati con sfumatura corta e mossi
più lunghi sopra**, stile giovane e contemporaneo, viso senza barba, sorriso gentile e aperto. Camicia **bianco
avorio** con le maniche arrotolate, senza gilet, pantaloni color sabbia. Due braccialetti
discreti al polso: uno in cuoio intrecciato marrone scuro e uno in cordino verde salvia.
Un **tablet** sottile color grafite, senza marchi o testo, al posto del libro.
Elegante senza sforzo, stile giovane e contemporaneo, mai vistoso.

| File | Uso |
|---|---|
| `attore_elisa.png` | Neutra: in piedi, mani giunte davanti o una mano che indica gli ulivi. |
| `attore_elisa_ritratto.png` | Mentre si scusa per il ritratto: mano sul petto, sorriso un po' imbarazzato. |
| `attore_andrea.png` | Neutro: in piedi, tablet sotto il braccio e due braccialetti al polso. |
| `attore_andrea_complice.png` | Rivolto verso Giuseppe, leggermente chinato, sguardo affettuoso. Il gesto resta discreto: nessun contatto fisico. |

## Il blu sulle dita di Elisa — revisioni richieste

Nella storia la bocca di Giuseppe diventa blu, e i giocatori devono poter sospettare di Elisa:
quel pomeriggio ha ritoccato un quadro e ha le dita ancora sporche di **blu oltremare**. È una
falsa pista: il colore è innocente. Deve restare **subdolo**: un residuo di pittura che si
nota osservando con attenzione, senza attirare subito lo sguardo.

- **Dove:** minuscole tracce sul bordo dei polpastrelli di pollice, indice e medio della
  **mano destra**. Niente macchie sul palmo; la mano sinistra resta pulita.
- **Come:** poche tracce irregolari di pigmento opaco, steso a pennello come il resto.
  **Blu oltremare leggermente violaceo**, non azzurro e non verde-rame. Niente gocce,
  colature o effetto livido: deve sembrare un residuo di colore a olio, non veleno.
  Pelle e unghie restano in gran parte pulite: niente dita interamente colorate.
- **Dimensione:** piccolissime sbavature, da scoprire osservando le mani; almeno il
  90% della superficie di ogni dito resta del suo colore naturale.
- Sulla figura il blu è ammesso soltanto come pigmento sulle dita destre e come colore
  naturale delle iridi di Elisa; abiti e accessori mantengono i colori stabiliti.

Due consegne esistenti mostrano la mano destra e vanno rifatte. Cambia **solo** le dita: posa,
volto, abiti, luce e inquadratura restano identici al file di partenza.

| Nuovo file | Parte da | Note |
|---|---|---|
| `attore_elisa_v2.png` | `attore_elisa.png` | Le mani giunte davanti: il blu sulla destra deve restare in vista sopra la sinistra. |
| `ritratto_elisa_v2.png` | `ritratto_elisa.png` | La mano tiene i pennelli: blu sui polpastrelli che li stringono. |

`volto_elisa.png` non mostra le mani e non cambia. La posa `attore_elisa_ritratto.png`, ancora
da fare, nasce già con il blu sulle dita.

## 4. Ritratti — 1:1, mezzo busto, cornice lignea e trasparenza

Stesse regole dei cinque esistenti (`ritratto_*`): esterno della cornice trasparente, nessuna
targhetta, figura interamente dentro l'apertura, nessun effetto «fuori dal quadro». Le cornici
devono distinguersi dalle cinque già usate (argento, legno naturale, verde oliva, oro/ocra,
petrolio):

| File | Cornice |
|---|---|
| `ritratto_elisa.png` | Laccata **rosso pompeiano / terracotta**, intagli di pennelli e foglie d'ulivo. |
| `ritratto_andrea.png` | **Avorio anticato**, intagli di libri e rami d'alloro. |

## 5. Volti — `volto_elisa.png`, `volto_andrea.png`

Stesso formato, inquadratura e trattamento di `volto_rosalia_v2.png` e `volto_augusto_v2.png`,
coerenti con i rispettivi ritratti.

## 6. Pose per le scene 4 e 5

Elisa e Andrea compaiono anche dopo l'oliveto. Stesse regole dei ritagli (sezione 3), stessi
abiti e accessori.

| File | Scena | Uso |
|---|---|---|
| `attore_andrea_brindisi.png` | 4, il brindisi | Calice di vino chiaro alzato verso Giuseppe, sorriso affettuoso. |
| `attore_andrea_allarmato.png` | 4, il malore · 5 | Un passo avanti, braccio teso come a fermare qualcuno: «nessuno tocchi il bicchiere!». Allarmato, non terrorizzato. |
| `attore_elisa_mani.png` | 5, l'indagine | Appena rientrata, sulla difensiva: mostra i palmi in avanti, con **tracce discrete di blu sui polpastrelli destri**. Mani proporzionate al viso e agli avambracci, palmi contenuti e dita affusolate, coerenti con le altre pose. |

## 7. Indizi nuovi — 1:1, oggetto isolato su fondo neutro

Stesso trattamento dei quattro esistenti (`indizio_bicchiere.png`, `indizio_bottiglietta.png`,
`indizio_foglio.png`, `indizio_biglietto_v2.png`): un oggetto solo, come una prova appoggiata su
un tavolo, con la stessa luce e lo stesso fondo. Ognuno deve distinguersi a colpo d'occhio dagli
altri, e soprattutto dal **foglio della donazione** e dal **biglietto**.

| File | Oggetto |
|---|---|
| `indizio_rendiconto.png` | Il **libro dei conti** degli Oliviani, rilegato in tela verde oliva con angoli in cuoio, aperto: colonne e righe di inchiostro astratto, nessuna cifra o lettera leggibile. Fra le pagine sporge una **ricevuta** con un timbro astratto e una graffetta. È la pista contro Augusto: i quadri della sala pagati, forse, con la cassa. |
| `indizio_oltremare.png` | Un **tubetto di colore a olio** schiacciato, il tappo svitato, e uno straccio di lino macchiato dello stesso **blu oltremare** delle dita di Elisa, con un pennello piatto. È la pista contro Elisa. Qui il blu è il soggetto ed è ammesso, ma deve essere il blu violaceo del colore a olio, chiaramente diverso da un prodotto chimico. Sul tubetto nessuna etichetta leggibile, solo una fascia di colore. |
| `indizio_lascito.png` | Un **foglio personale** piegato in tre, in carta avorio pesante, legato con un **cordino verde salvia** come quello del braccialetto di Andrea. Righe di inchiostro astratto, due svolazzi di firma e un piccolo sigillo di ceralacca color vino. Niente cornice o intestazione: è più piccolo e intimo del grande foglio formale della donazione. È la pista contro Andrea. |

## Regole di consegna

- Solo **file nuovi** in `assets/images/`, con nomi esatti come sopra: solo trattini bassi,
  nessun trattino. Mai sovrascrivere un file esistente. Una revisione prende `_v2`, `_v3`, …
- **Nessun testo leggibile** in nessuna immagine.
- Nessun elemento horror e nessun blu in evidenza, tranne i casi dichiarati: le dita destre
  e gli occhi di Elisa, e `indizio_oltremare.png`.
- Alla fine, elenca i file consegnati.

## Controlli prima della consegna

- Ritratti e volti: formato 1:1; sfondo: formato 16:9. Usa le dimensioni dei rispettivi
  riferimenti attivi per ritratti, volti e attori, mantenendo il rapporto d’aspetto richiesto.
- Verifica il canale alfa reale su ritratti, volti, attori e primo piano; per i volti conserva
  anche il trattamento dei riferimenti indicati. Nessuno sfondo a scacchi dipinto né bordi guida.
- Controlla identità, abiti e accessori confrontando ogni variante con il ritratto approvato.
- Verifica figura intera e piedi non tagliati negli attori, e figura dentro la cornice nei ritratti.
- Controlla l’area sicura dello sfondo, il simbolo degli Oliviani e l’assenza di persone dipinte.
- Elenca solo i file effettivamente prodotti, con percorso e dimensioni, distinguendo
  le proposte in attesa di revisione dagli asset approvati. Non dichiarare approvato un file
  senza il riscontro esplicito dell’utente.
