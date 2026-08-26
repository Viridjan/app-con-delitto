# Il mistero dell'oliva blu

App per il narratore di una "cena con delitto": cinque scene illustrate, un tavolo di indizi da
esaminare in ordine libero, la scheda finale e la soluzione. Il narratore la guida davanti al
tavolo dei giocatori — da proiettore, da tablet o da telefono.

Tratta dal copione **_Il mistero dell'oliva blu_** di **Carlo Maria Gervasio**
(`ullgi_L-inaugurazione_COSTA_rev.pdf`), usato con la sua autorizzazione. Il testo nell'app è
quello originale, parola per parola.

## Com'è fatta

Un file solo: **`oliva-blu.html`**. Niente build, niente dipendenze, niente server — si apre col
doppio clic e funziona anche senza rete. Dentro ci sono tre blocchi:

- `<style>` — palette oliva e lume di candela, Bodoni Moda per i titoli, Alegreya Sans per le
  battute (leggibile a distanza di proiezione). Chiaro e scuro entrambi previsti.
- `const STORY` — **tutto il copione**: scene, battute con i loro incisi, box "Lo sapevi?",
  indizi, oggetti sul tavolo con le battute collegate, quiz, soluzione.
- `<script>` — uno stato, una `render()`, una lista di schermate. Nessun framework.

Le immagini viaggiano dentro l'HTML come data URI: l'app resta un file unico, condivisibile
com'è.

## Il palco a strati

Ogni scena è composta al volo, su tre livelli:

1. lo **sfondo**, disegnato con il primo piano sgombro;
2. i **personaggi ritagliati**, posizionati in percentuali — `x` orizzontale, `b` altezza da
   terra, `h` altezza della figura: è l'altezza a dare la distanza, mai la larghezza;
3. gli **oggetti in primo piano** (`scenaN-sx.png`, `scenaN-dx.png`), che stanno davanti a tutti,
   ancorati agli angoli bassi e tagliati dal bordo. Facoltativi.

Quando qualcuno parla, l'app lo porta avanti — si alza, cresce, prende un'ombra. Nessuno viene
scurito. Le posizioni stanno in `STORY.scene[i].cast` e `.primo`.

## La voce dei personaggi

Scoprendo una battuta la pagina sintetizza qualche bip con la Web Audio API — nessun file audio.
Ogni personaggio ha la sua altezza (Mauro cupo e con onda quadra, Rosalia acuta), e la battuta
più lunga fa più bip, fino a un tetto di quattordici. Si zittisce con `m` o con la pastiglia
accanto al `?`; riaccendendola si sente una prova.

Il contesto audio nasce sospeso finché non c'è un gesto dell'utente e `resume()` è asincrono:
i bip vanno programmati **dopo** che è partito, altrimenti finiscono a un istante già passato e
non si sente nulla.

## Regia delle scene

Le posizioni di personaggi e oggetti si decidono a occhio, non a numeri indovinati. Premendo `r`
su una scena si accende la **modalità regia**: si trascina per spostare, la rotella (o `+` / `-`)
cambia la taglia, le frecce fanno lo scatto fine. Il pannello in basso mostra dal vivo le righe
`cast:` e `primo:` da incollare in `STORY.scene[i]`, con un pulsante per copiarle.

Le modifiche vivono solo nella pagina aperta: per renderle definitive si incollano le righe nel
file.

## Immagini

Le illustrazioni le genera Codex e vanno in `assets/images/`, con i nomi elencati in
[`img/ART.md`](img/ART.md). I file arrivano con suffissi di versione (`-v4`, `-v5`):

```sh
python3 sync-assets.py     # tiene la versione più alta di ogni file, ne fa copie web
                           # leggere e le incorpora in oliva-blu.html
```

Codex usa nomi suoi: la mappa `SCELTE` dentro lo script dichiara quale file riempie quale
casella (`scena1.png ← scena3-sala2`), mentre la versione (`-v4`, `-v5`) la sceglie da solo
tenendo la più alta. Lo script dice anche cosa manca ancora. **Ogni casella vuota mostra il brief al posto
dell'immagine**, quindi l'app resta presentabile anche a consegna incompleta.

Premendo `d` dentro l'app compaiono sagome di prova al posto delle illustrazioni mancanti, utili
per giudicare posizioni e ritmo prima che l'arte sia pronta.

## Comandi del narratore

| Tasto | Cosa fa |
|---|---|
| `spazio` / `→` | battuta successiva, poi schermata successiva |
| `←` | indietro di una battuta |
| `s` | mostra il box "Lo sapevi?" |
| `i` | mostra gli indizi di gioco |
| `1`–`4` | apre un indizio sul tavolo |
| `p` | elenco delle illustrazioni, con quali mancano |
| `d` | sagome di prova |
| `r` | regia: sposta e ridimensiona personaggi e oggetti sulla scena |
| `m` | zittisce la voce dei personaggi |

Il sito pubblico sta su **https://viridjan.github.io/app-con-delitto/** e si aggiorna a ogni
push su `main`.
| `f` | schermo intero |
| `?` | tutti i comandi |

## Verifica

```sh
node smoke.js    # percorre ogni schermata e controlla i conti del quiz
```

Il copione è verbatim e va tenuto tale: le 53 battute fra virgolette del PDF devono comparire
identiche nell'app, refusi dell'originale compresi.

## Diritti

Il copione — il PDF e il testo dentro `STORY` — è di **Carlo Maria Gervasio**, ed è usato qui
**con la sua autorizzazione**. I diritti restano suoi: per riusare il testo altrove, chiedere a
lui.

Il codice dell'app è di chi lo ha scritto; nessuna licenza dichiarata, quindi valgono i diritti
d'autore di default.
