# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A presenter webapp for *Il mistero dell'oliva blu*, an Italian "cena con delitto" script by
Carlo Maria Gervasio (`ullgi_L-inaugurazione_COSTA_rev.pdf`), used with the author's permission.
The investigator drives it live in front of a table of players: the meeple on screen and the
person holding the remote are one character, so there is one word for both. The rights to the text stay his: the
permission covers this app, not reuse anywhere else, so never publish the copione or lift lines
out of it into another place.

- Public site: https://viridjan.github.io/app-con-delitto/ (Pages builds from `main`, root)
- Artifact (private preview): https://claude.ai/code/artifact/ae31691c-accf-409e-bf55-64800d0de882
- Repo: https://github.com/Viridjan/app-con-delitto

## Commands

```sh
node smoke.js              # il controllo: schermate, quiz, copione, indagine, cancelli, voci
node dom.js prima.txt      # fotografia del markup di ogni schermata (per i riordini)
node estrai-copione.js     # riscrive copione.txt da STORY — dopo ogni modifica al testo
python3 sync-assets.py     # aggancia le consegne di Codex e ricostruisce la mappa ASSETS

# la leggibilita' da telefono: l'app dentro una cornice da 390px, e il referto nel titolo
chromium --headless --allow-file-access-from-files --dump-dom \
  "file://$PWD/telaio-390.html?p=copia-con-audit-mobile.html"
```

`censimento.js` non si lancia: si incolla in coda allo `<script>` di una copia dell'app e stampa
quante misure e quanti stili di testo arrivano davvero sullo schermo. Sei misure su schermo
grande, quattro da telefono: se il conto sale, un gradino nuovo e' entrato di nascosto.

Non c'e' build, non c'e' watcher, non c'e' server: `oliva-blu.html` si apre da disco. Non esiste
un modo di lanciare un solo controllo — `smoke.js` e' un file solo e dura meno di un secondo; per
isolare un caso si commenta il resto.

## Files

- `oliva-blu.html` — the whole app. One self-contained, standards-mode HTML document: explicit
  doctype, `lang="it"`, UTF-8 charset and device-width viewport, then `<style>`, `const STORY`
  and `<script>`. No build, no dependencies, no server. Images are embedded as data URIs.
- `index.html` — redirect for Pages, which serves `index.html` at the root.
- `sync-assets.py` — hooks Codex's deliveries into the app. Run after every delivery.
- `smoke.js` — walks every screen, checks the quiz maths, and guards what nothing else can:
  the copione, the investigation's budget, the clue table's hand-written quotes, the public
  build's gates, the voice profiles shared with `voci.html`, both directions of the stage's
  `data-*` contract, that every figure of every scene resolves to an embedded image, and that
  `d` leaves `ASSETS` untouched. Run it after touching the script block.
- `stub-dom.js` — the fake DOM the three node scripts share. Not run on its own.
- `dom.js` — writes the markup of every screen to a file. Run it before and after a refactor:
  with `class` and `style` stripped, the diff must be empty.
- `voci.html` — the voice bench: sliders per character, plays them, prints the `VOCE` block to
  paste into the app. Its synth engine is a **deliberate copy** — change it in both files.
- `copione.txt` — the approved script. The verbatim reference; `smoke.js` checks the app against
  it. Regenerate with `node estrai-copione.js` after any agreed change to the text.
- `estrai-copione.js` — writes `copione.txt` out of `STORY`, so the two can never drift.
- `censimento.js` — inject it into the page and it reports how many text sizes and how many
  distinct text styles actually reach the screen, and which texts carry no rule of their own.
  The count is a contract: six sizes on a big screen, four on a phone.
- `audit-mobile.js` + `telaio-390.html` — the phone readability audit. The frame exists because
  headless Chromium will not give a script a window under 500px, so the app runs inside a 390px
  iframe and the result is read out of it.
- `img/ART.md` — the illustration brief Codex works from.
- `assets/images/` — Codex's deliveries, named by subject (`sala2`, `sala1-scena2`, `brindisi`,
  `malore`, the `indizio-*` plates), mapped to slots in `SCELTE`.
- `trash/` — local, gitignored archive, divided by file type: rejected PNG files go in
  `trash/immagini/`, superseded working texts in `trash/documenti/`. It currently contains the
  former `copione-v2.txt` and everything previously kept in `assets/images/bocciate/`. Nothing
  in this folder is read by the app or its build scripts.

## Rules that matter

**`copione.txt` is the approved text.** It is the reference from now on — the PDF stays as the
original it was drawn from, but the txt is what the app must show, word for word. `node smoke.js`
asserts every line between `«` `»` appears in the HTML and fails naming the changed line. Do not
paraphrase or "fix" dialogue. Spelling is the one exception the user has granted: on 28 August
2026 they asked for wrong accents, straight apostrophes and missing full stops to be corrected —
`c'é` became `c’è`, `l'olio` became `l’olio`, and two lines got their final period. Words never
change. And the correction goes into `STORY` **and** `copione.txt` in the same pass: what plays
must never differ from the txt, so never fix one alone. Cutting or adding whole blocks
is a product decision that needs the user, and when one is agreed, `copione.txt` is updated in
the same commit — never left behind.

**Ask before pushing aesthetic changes.** The repo is public with Pages on `main`, so every push
goes live in a minute. Show the result (screenshot, or republish the artifact) and wait for a yes.
Bug fixes, scripts and docs follow normal behaviour.

**Blue is tightly reserved.** `--blu` is Mauro's speech colour and the vignette over the malore
screen — because the victim's mouth turns blue. There are exactly two deliberate interface
exceptions: the words *oliva blu* in the cover title, and the border and heading of an open clue
detail (`.detail`). Do not use blue anywhere else. The vignette is driven by `blu:true` on the
scene and now opens on its **first** line (`state.step >= 1`), not after the last: the colour has
to arrive with the collapse, not once it is over.

**Nothing but the dialogue on a scene screen.** The “Lo sapevi?” boxes went on 26 August 2026;
on 29 August 2026 the user cut the rest from `copione.txt` — every `descrizione` (art brief),
every `indizi` block, the malore's “Osserva bene!” box, and the closing educational message. The
`s` and `i` keys are gone with them, `state` no longer carries `box`/`indizi`/`qa`, and the story
ends on the verdict and the narrated solution — see *The running order*. Do not restore any of it from the PDF. The art briefs live on
for Codex in `img/ART.md`; the four clue objects and their table survive because they were never
part of the txt.

**The story only goes forward.** The `← Indietro / Avanti →` footer went on 28 August 2026 — the
screen itself is the remote — and on 31 August 2026 going back went with it: no `indietro()`, no
left-edge click, no `←`, no stepping back through a scene's lines. A line revealed stays
revealed, and nobody watching ever sees the story rewind. `vai(n)` therefore always starts a
screen at its beginning — `step 0` everywhere, and `step 1` on a scene, because from
1 September 2026 a scene opens with its **first line already revealed** and its voice already
spoken: opening on an empty column cost the investigator a gesture to make someone already on stage
say the first word. `#app` is a single-row grid — do not put the bar or the backwards path
back. The cost is real and deliberate: an investigator who overshoots cannot step back, and on the
public site the only remedy is reloading. Where the author works, the developer panel's `↑`
still pages freely — that is not the performance. A click that lands on `[data-clue]`, `[data-chiedi]`, `[data-avanti]` or `[data-opt]` — the list
in the stage's handler — or anywhere inside an open `.detail`, does its own job and never advances; staging mode (`r`) suppresses the advance too, so
a drag is not a click. Any new interactive element needs its `data-` attribute in that list, or
touching it will also turn the page.

**Nobody gets dimmed on stage.** The speaker stands out by coming forward (lift, scale, shadow),
not by darkening the others — heavy dimming was tried and rejected, and so was a darker version
of what replaced it: the cast read too dim on a projector. `brightness(.88)` at rest, `1.06` for
whoever is speaking. Keep both ends bright; the gap
between them is what does the work, not the depth of the shadow.

**Scene titles stay off the public site.** `TITOLI_OK` is `!PUBBLICO` like the other gates:
`vScene` emits the `.scene-head` — number, "Scena N di M · parte", title — only where the author
works. A title tells the story before it happens; *Il malore dell'oliva blu* announces the murder
to a table that is still toasting. On Pages the scene opens on the picture alone, which also
gives the stage the height the header was using.

**Author tools stay off the public site.** `PUBBLICO` near `const state` is true on
`*.github.io`, and `REGIA_OK`, `DEV_OK` and `TITOLI_OK` are all its negation. `r` opens staging;
`v` opens the developer panel — current screen and line, expected images that are not embedded,
and the screens listed one per row to jump anywhere in one click. It is
**semi-transparent** (`opacity:.6`) so it can stay open while you work — the scene reads through
it — and while it is open the four arrows split the work: `↑` `↓` walk the list of screens, `→`
walks the story — a line at a time, and on to the next screen when the scene runs out — and `←`
steps back a screen, which only an author may do. The image line stays **empty when nothing is
missing**, instead of spending a row to say so. It had a
`Tutte le battute` button too, gone on 1 September 2026 with `battuteTutte()`: a scene now opens
with its first line already revealed, and the rest is one keypress each. Both panels work from
the local file and from the artifact, and do nothing on Pages. Gating the developer panel to `file:` alone was wrong — the artifact is where the user
actually works.
The help overlay lists only the keys that actually work where it is running. `smoke.js` runs the
app twice, once with `location.hostname` empty and once with `viridjan.github.io`, and fails if a
gate leaks.

**Images must be optional.** Every slot falls back to a typographic placeholder via `slots()` on
`error`. The app must look finished with `assets/images/` empty.

**`d` is a veil, not a substitution.** `VELO` holds one silhouette per slot the demo covers —
every background, every neutral cutout, every pose — and `src()` reads it first while
`state.demo` is on. It is deliberately lazy: `creaVelo()` runs only on the first `d`, not during
normal startup, and reuses one encoded SVG per character across all that character's poses.
`ASSETS` is never touched, so turning the demo off restores
nothing because nothing was taken. It used to write into `ASSETS` and, on the way out, `delete`
the keys: pressing `d` twice **destroyed the real embedded images** until the page was reloaded.
Codex found that and fixed it with a backup map on 2 September 2026; the veil removes the whole
class instead. One consequence to know: `src()` now reads `state`, so anything calling it at load
time must be lazy — `COVER_IMG` became a function for exactly that reason.

**Static inventories are cached.** `attesi()` derives its list only from immutable `STORY`,
`POSE_SCENA`, `SOSPETTI` and `OGGETTO_ID`; it stores the deduplicated result in `ATTESI` on first
use. Do not invalidate or rebuild it during `render()`. If any of those sources ever becomes
editable at runtime, remove the cache or give that editor an explicit invalidation step.

**Image revisions must always be versioned.** Never overwrite an existing image, including
newly generated assets that have not been committed yet. Keep the original filename unchanged
and save every revision with the next available numeric suffix (`-v2`, `-v3`, …). Version
numbers already used anywhere, including rejected files in `trash/immagini/`, must not be reused. A new
semantic pose may start with a new descriptive filename, but later changes to that pose must
still use numeric version suffixes.

## House style in `oliva-blu.html`

Normalised on 29 August 2026; keep it this way rather than adding a fourth way to do each thing.

- **The document shell is not optional.** Since 2 September 2026 `oliva-blu.html` is a complete
  standards-mode document with `<!doctype html>`, `<html lang="it">`, an explicit `<head>` and
  `<body>`, `<meta charset="utf-8">`, and `<meta name="viewport"
  content="width=device-width, initial-scale=1">`. The viewport declaration is what makes the
  640/700px phone rules run on a real device instead of a browser's roughly 980px virtual
  layout viewport. Do not turn the file back into an HTML fragment; `index.html`'s metadata is
  not inherited after its redirect.
- **Type is tokenised** like colour: `--serif`, `--sans`, `--mono` on `:root`. Nine literal font
  stacks in three different spellings were collapsed into these. Never write a family list again.
- **Size is tokenised too**, from 2 September 2026, and there are **six steps**, no more:
  `--t-titolo` (cover, *Fine*), `--t-cifra` (score, scene numeral), `--t-nome` (character names,
  the sheet's questions), `--t-voce` (the investigator's four screens, scene titles),
  `--t-corpo` (dialogue, the clue section, buttons, the speaker's name) and `--t-etichetta`
  (eyebrows). Thirteen sizes reached the screen before, and four of them sat within 2.2px of each
  other — 22, 21.8, 20, 19.8 — four independent decisions nobody could tell apart. A new rule
  takes a step; it does not invent a seventh. `node`-less check: inject `censimento.js`, walk all
  twenty screens, group every text-bearing element by computed size. Two crossings were found
  that way and fixed by raising a floor, never by adding a step: `--t-voce`'s fluid term dropped
  below `--t-corpo` under 1240px (the investigator spoke smaller than the dialogue), and
  `--t-cifra` dropped below `--t-nome` under 800px. Both now clamp at the step above. As the
  window narrows the steps **merge** — 6 at 1280, 5 at 900, 4 at 750 — which is fine; they must
  never swap. The phone query overrides the tokens, not the selectors, but still carries its own
  per-selector exceptions from the days it was tuned by hand, and at 390px, after five merges asked for
  one by one on 2 September 2026, the count is **four**: 57 (cover, *Fine*, score, scene
  numeral), 49.7 (buttons, the investigator's four screens, character descriptions), 39.6 (scene
  titles, character names, the whole clue section) and 28.4 (dialogue, the speaker's name,
  eyebrows, the sheet's closed rows). Each merge took one of the two existing values, never a new
  one — the lower where a display size would have grown, the higher where reading text would have
  shrunk. One inversion survives and is known: a character's description (49.7) is larger than
  the name above it (39.6). Raising `--t-nome` in the query is the fix if it is ever wanted.
- **Four reusable classes** carry the shapes that repeat, declared under `/* ---- ricette ---- */`
  right after the chrome: `.carta` (surface, hairline, radius, shadow), `.sollevabile` (the
  hover lift, `:not([disabled])`), `.centrata` (full-height centred column), `.ph-cifra` (the
  typographic stand-in shown when an image fails, revealed by `.slot.empty`). A new panel or card
  takes the classes; it does not restate the declarations. `.plate`, `.detail` and `.regia-pan`
  keep only their differences — a dashed border, a blue border, fixed positioning.
- **Section banners are `/* ---- nome ---- */`**, in Italian, in both the stylesheet and the
  script. The stylesheet opens with its own table of contents.
- **Views are a table, not a ternary chain**: `VISTE` maps a slide's `t` to its function. A new
  kind of screen is a function plus one line there.
- **Three markup helpers carry what repeats across views**, added 2 September 2026: `guida(posa,
  alt)` is the investigator with his fallback, drawn by five screens; `cartaSospetto(nome,
  {dati, classi, lettera, spento})` is the face-under-name card, which the sheet's questions and
  the people you can ask on a clue now share — they differ by a letter, a `data-*` and a state,
  not by a card; and `vDetto(classe, posa, alt, righe)` is the whole avviso and the whole recap,
  which differ by a class, a pose and how many lines there are. Those two views are now one line
  each — and being arrows rather than declarations, they must stay above `VISTE`, which holds
  their value, not their name. `punteggio()` and `preso()` sit next to them for the same reason: the score and
  "was the culprit named" were each computed in two places.
- **Nothing embedded that nobody draws.** The app carries its images as data URIs, so a slot the
  pipeline fills but no screen requests is pure weight: `scena3.png` and `scena4.png` were 772KB
  of it, because both scenes borrow scene 1's hall through `sfondoDa`. `sync-assets.py` keeps a
  `MAI_DISEGNATI` set for exactly this. `attore-rosalia.png` and `attore-mauro.png` followed,
  another 144KB: those two have a pose in every scene, so their neutral cutout was never asked
  for — and unlike the two rooms, the files went to `trash/immagini/`. That is a bet on `POSE_SCENA`,
  so `smoke.js` now resolves every figure of every scene through `ATTORE()` and fails unless it
  lands on an embedded image; proven by taking Mauro's pose out of scene 1 and watching it name
  both parts. Giuseppe, Roberto and Augusto keep their neutral cutouts, because those three do
  fall back. Six megabytes became five.
- **`document.querySelector` is not used anywhere.** Inside the stage nothing needs it — the
  markup is rewritten every render; outside it, the two panels are held by reference. If a new
  one appears, ask what it is standing in for.
- **Nothing is derived from the array index.** `NUM(sc, k)` gives the number the audience reads,
  `CASELLA(i)` the artwork slot, `SFONDO(i)` the room. Index-derived names had leaked into the
  background's `alt` (it announced "Scena 12" on the screen titled *Scena 4 · terza parte*) and
  into `demo()`, which filled slots named `scena7.png` that nothing draws.

- **Four things live outside `#stage`**, and they are the ones that need care: `.volume` and
  `#overlay` from the static markup, and `.regia-pan`, `.dev-pan` appended to `document.body` at
  runtime. The advance button was a fifth until 1 September 2026, and that is exactly why it drew
  itself and did nothing for one publish: the stage's delegated handler cannot see outside. `render()` wipes the stage with `stage.innerHTML = …`, so anything
  inside it is born and dies for free; anything outside survives, must be removed by hand, and is
  invisible to `slots()` — which walks `stage.querySelectorAll(".slot img")` — so an image put
  there would never get its typographic fallback.
- **The two author panels are held by reference**, `panRegia` and `panDev`, and never looked up
  by class. They used to share one class and `render()`'s `querySelector(".regia-pan")?.remove()`
  deleted the *developer* panel on every render; `pannelloDev()` rebuilt it immediately, so
  nothing looked wrong while an eighteen-row list was thrown away and redrawn each line. Splitting
  the classes fixed the symptom; holding the node fixed the cause, on 2 September 2026, and the
  classes went back to being nothing but style. `chiudiPannello(q)` removes one and returns
  `null`, so a caller cannot forget to clear its variable.
- **Two shapes for a button, and only two.** Drawn inside `#stage`: carry a `data-*` and let the
  stage's delegated handler act, because the stage's markup is rewritten on every render and a
  listener bolted to the element would die with it. Living outside `#stage` — the advance pill,
  the staging and developer panels, `?` and mute: carry your own `onclick`, because you survive
  the render and the stage's handler cannot see you. Container-level delegation stays for the two
  containers whose content is replaced (`#stage`, `#overlay`). `addEventListener("click", …)` on
  a single element is no longer used anywhere; `smoke.js` checks both directions of the stage
  contract — a `data-*` drawn but unlistened, and one listened but never drawn.
- **One DOM stub, not three.** `stub-dom.js` exports `apri(coda, loc)`: it reads the `<script>`
  blocks out of the HTML, runs them in a fake context and hands back what `coda` names plus the
  stage. `smoke.js`, `dom.js` and `estrai-copione.js` all use it. There were three hand-copied
  stubs and they had already drifted — the oldest lacked `style`, `value` and
  `getBoundingClientRect` and worked only because it never rendered anything.
- **`smoke.js` guards the deliberate duplicates**: the `VOCE` profiles must match between
  `voci.html` and the app (tuning voices on one page and performing with the other's was possible
  before), the clue table's hand-written quotes must exist and name the right scene, and the
  public build must show neither the author tools nor the scene titles.

**Refactor with a snapshot, not by eye.** `dom.js` (`node dom.js prima.txt`) walks all 20 screens with the smoke
stub, reveals every line, and dumps `stage.innerHTML`. Run it before and after: strip `class` and
`style` attributes from both and the diff must be empty. That is how this pass was proved to
change styling hooks only.

## The scene screen

Two declared regions: the top holds scene number, title and the stage, and never moves; the
bottom scrolls on its own. The bottom is split `32% 1fr` — the speaker's **actor cutout**
(`attore-*.png`, not the portrait) in a 3:4 frame cropped from the top, head to waist, faded out
at the bottom — and the dialogue column. Use `1fr`, not a second percentage: two fixed
percentages plus a gap overflow and produce a horizontal scrollbar.

The dialogue column carries across the parts of one scene. Screens that share the same `n` are
one conversation: `vScene` walks backwards while `NUM()` matches and appends each earlier part's
lines in full, joined by `<hr class="atto">`. Entering a new part opens with the rule at the top
and the part's **first line already lit**, the backlog dimmed below it — the same everywhere,
since `vai()` reveals it. Only a scene with no lines at all opens with nothing lit, and there
`.bubble:first-child` matches no bubble because the current group is empty.

The inciso under a speaker's name — *piano*, *tra sé* — is the same size as the name, from
2 September 2026. `.who small` styled it italic and grey but never sized it, so it fell to the
browser's own `small`: 0.75em of 0.9em, the only measure in the app nobody had chosen, and on a
phone the smallest text anywhere. Italic, weight and colour separate it now; the size does not.
A census across all twenty screens counts the sizes that reach the screen — six on a big screen,
four on a phone — and every one of them is a decision; see *Type and the phone*.

Consecutive lines by the same speaker share one bubble — `raggruppa()` collapses the run and
`bolla()` renders one `<p>` per line inside a single `.said`. A different `m` breaks the run: a
line said out loud and one said "tra sé" are two moments, not one speech.

Newest line on **top**, older ones below and dimmed to 40%; the column scrolls back to the top
on each new line. Keep the entrance animation on `:first-child` only — its final frame sets
opacity to 1 and would cancel the dimming of the rest.

Highlighting the speaker must **not** change the stacking order: no `z-index` on `.attivo`. The
depth is what the staging decided — including any explicit `z` in `cast` / `primo`.

## Type and the phone

**The four detective screens share one body size.** Avviso, recap, verdict, ending: from
1 September 2026 one rule sets the text on all four — on the verdict that includes its heading,
`.giudizio h2`, which kept only its weight; it matched the description at 1280 but not on a
phone, where it was not in the ×1.8 list and came out 29px against 50. The score itself is left
out: it is a numeral, not text — `clamp(1.15rem,2.2vw,1.7rem)`, centred on a
big screen, and in the phone query `clamp(2.07rem,4vw,3.06rem)` with `text-align:justify`. Each
had had its own before, from the avviso's small service body to the recap's large spoken lines,
and stepping from one to the next the text jumped. The justified column at that size holds about five
words, so the gaps between them open wide: that is the user's choice, taken against
`hyphens:auto`, and **hyphenation is off everywhere** — `*{hyphens:none}`, so no later rule can
turn it back on by accident. `document.documentElement.lang` is still set from the script, for
screen readers, since the file has no `<html>` tag of its own.

On a phone the cast card grows instead of clipping: `height:auto; min-height:100dvh`, with the
portrait given `40dvh` of its own. With the phone's big text and a button inside the card, the
portrait had been squeezed to 98px.

**Read the app on a phone before shipping.** Audited 31 August 2026 at 390px, both themes, with
an in-page script that reads computed size, colour and box for every element carrying text. What
it found and what was done:

- **The light palette failed AA and the dark one passed.** `--muted` sat at 4.29:1 and `--gold`
  at 3.49:1 on the cream ground — and light is what anyone with a light OS sees by default. Only
  those two moved, and only in the light block: `#6B7359 → #676F55`, `#A9741A → #966107`. Olive
  (4.61), teal (4.60), plum (5.22) and blue (7.06) already passed and were left alone.
- **The phone tier is one knob**: `:root{font-size:112%}` inside that query, and the whole scale
  follows, because on a narrow screen it is nearly always the rem minimum inside a `clamp()` that
  wins. It was 150% with fourteen literal sizes rewritten on top of it, grown over four requests
  — and all of it measured inside the 390px iframe while the document had **no `<meta viewport>`**,
  so on a real phone those rules never applied at all. Once the viewport landed the text came out
  enormous, the user said so, and the pile of literals went. At 390px the six steps read
  46.6 / 42.6 / 28.7 / 24.6 / 20 / 15.7, against 88 / 54 / 38 / 27.2 / 22 / 14 on a big screen.
  Measure on the device, not only in the frame: the frame cannot tell you the meta is missing.
- **Every button was 33px tall and the mute pill 35px**, under the 44px touch minimum. Fixed
  under `@media (pointer:coarse),(max-width:700px)` — the width clause is there because
  `pointer:coarse` cannot be exercised in headless while a narrow window can.
- **Then every button grew 30%**, 1 September 2026, and this one is **not** phone-only: `.btn`
  and the volume control are bigger everywhere, projector included — type, padding and the touch floor,
  and on a phone the touch floor went with them. The floor came back to 44px on 2 September when
  the whole phone tier was rescaled. Growing them had broken something that held until then:
  `Chiudi l'indagine →` and `Scopri la soluzione →` came out wider than a 390px phone and were
  clipped on the left, because the narrow query pinned `.btn` to `white-space:nowrap`. That clause
  is gone for good; a long label wraps inside the pill instead.
- No horizontal overflow on any of the twenty screens, in either theme.

A caveat about the measuring: headless Chromium clamps its window to 500px wide for scripts, so
the audit runs the app inside a 390px `<iframe>` and reads the result out of the frame. Do not
trust an `innerWidth` below 500 from `--dump-dom`. And the contrast figures ignore `opacity`, so
dimmed or disabled elements read worse than they are — WCAG exempts them.

## Where the app departs from the PDF

Audited against `pdftotext` on 27 August 2026 — 43 spoken lines in the original. The user then
rewrote part of scene 2 in `copione.txt` on 28 August 2026, so the count below is the state after
that edit:

- **Most lines identical.**
- **3 reworded** the same way: Rosalia says "zio Giuseppe" where the PDF has bare "zio", and the
  malore's art brief follows. She names the victim.
- **"signor De Robertis" became "signor Giuseppe"**, 29 August 2026, in Mauro's toast and in
  Roberto's added line. The surname survives only in the cast list.
- **31 lines added.** They used to carry `nuova:true` in `STORY` and print
  `[aggiunta, non di Gervasio]` beside themselves in the txt; both went on 2 September 2026, at
  the user's word, when the added lines had grown to half the script and the marker had stopped
  telling anyone anything. `copione.txt` is now the text and nothing else. What follows is the
  record, and it is the only one left — do not try to read provenance out of the files.
  Two lines in *La donazione* (28 August); then on 29 August a whole revision the user drafted
  as `trash/documenti/copione-v2.txt`: Mauro's judgement of Giuseppe, the note found and read aloud and handed
  back, Augusto telling Mauro to put the bottle away — which is how the culprit gets the poison
  on stage — Giuseppe closing the door on Rosalia at the toast, and a third part for scene 1 that
  ends the evening. On 2 September seven more lines comparing organic, integrated and conventional
  crop protection entered scene 1, and four lines on Ogliarola, Cellina di Nardò and Coratina
  entered the toast immediately before the accident, and on the same day the user rewrote that
  first exchange himself: Mauro argues for organic, Roberto answers that it is a good road and not
  the only one, and Giuseppe asks what the others are. Of 67 spoken lines, 31 are not Gervasio's
  — nearly half.
- ***Il racconto dell'olio* is the user's rewrite**, first rewritten on 28 August 2026 and
  fact-checked again on 2 September: nine lines instead of six, with the real sequence — prompt
  processing after harvest, cleaning, crushing, malaxation, centrifugal separation, optional
  filtration — followed by chemical and sensory quality and protection from light, air and heat.
  Augusto and Roberto hand the explanation back and forth. Its "Indizi di gioco" block was
  dropped with it, and the `indizi`
  field no longer exists on any scene.
- **The agricultural lines have institutional anchors.** Production and sensory claims follow
  CREA Oleario and EU Regulation 2022/2104; organic prevention and authorised inputs follow EU
  Regulation 2018/848; monitoring, thresholds and preference for non-chemical methods follow
  Directive 2009/128/EC and Puglia's integrated-production rules. The cultivar profiles follow
  Regione Puglia/CREA material for *Collina di Brindisi*: Ogliarola is delicate with leaf, grass
  and artichoke notes; Cellina di Nardò contributes tomato and berry notes; Coratina is the more
  intense, bitter and pungent comparison. Keep these as accessible dialogue, not application
  instructions, doses or a claim that "organic" means untreated.
- **The quiz is ours from 30 August 2026.** Gervasio's four questions had every right answer in
  slot A and distractors nobody would pick (*I Marinai*, *I Musicisti*). Six now, and every one
  offers **the four suspects** — `SOSPETTI`, in that order — so a question has no `opzioni` of
  its own, only `giusta`. You pick a person, not a phrase, and no option can be ruled out on
  sight. Half of them need two moments joined rather than one line recalled: who asked for the
  bottle to be put away, who read the note without telling Giuseppe. `smoke.js` scores from
  `giusta` rather than letters, fails if a question grows its own `opzioni`, and fails if the
  right answer sits in fewer than three distinct columns.
- **One page, six questions**, 31 August 2026. The quiz was six slides; now it is one, and
  `domandaCorrente()` — the first unanswered index — is the whole state machine. A closed
  question collapses to a line with the name chosen and nothing else — **no points, no right or
  wrong**: the verdict lands once, at the end, and until then the sheet only records who was
  accused. The next question opens beneath it. Only the open question renders options, which is why the
  click handler can write `state.risposte[domandaCorrente()]` without the buttons carrying an
  index. `Scopri la soluzione →` appears only when nothing is left open. Each option carries the
  suspect's face (`volto-<nome>.png`, four of them, delivered 31 August 2026) under the name, so
  the sheet reads as a line-up; the card is a `.slot`, so a missing face falls back to the
  monogram like every other image.
- **Ten points, five verdicts**, 31 August 2026. `punti` weights the questions — 2, 1, 1, 2, 1
  and **3 for the culprit** — and `verdetto(punti, preso)` reads two things: whether the name is
  right, and how much of the reconstruction stands. The bands leave no gap, because without the
  culprit's three points nothing above seven is reachable: 10 / 6-9 / ≤5 with the name right,
  6-7 / ≤5 without it. `smoke.js` builds one answer set per band, checks it really scores what it
  claims, and then that its verdict appears.
- **The audience is one person**, 30 August 2026: the app addresses a single player, not a
  table. Three of Gervasio's lines moved from plural to singular — «Gli indizi sono tutti davanti
  a **te**», «Ora tocca a **te** risolvere il caso!», «**Hai** risolto il mistero!» (that last one
  cut altogether on 1 September 2026: the verdict screen before it has already said how it went,
  so congratulating on the way into the solution said it twice) — along with
  every string of the app's own. Giuseppe's «Alla vostra comunità» stays plural: he is speaking
  to Roberto and Augusto, not to whoever is playing. That is the test for any future line — who
  is being addressed, a character or the room.
- **The investigator's recap is ours now**, 31 August 2026. Gervasio's five lines listed the clues —
  «Mauro ha portato il bicchiere», «Nel bicchiere c'era un prodotto pericoloso» — which handed
  over the culprit and the poison one screen before the sheet asks for them. Three lines replace
  them: the evening summed up, no clue named, no name accused. His «Ora tocca a te risolvere il
  caso!» became «**Aiutami** a risolvere il caso!» — the investigator asks for help rather than
  handing over the job, which is also why he stands there looking stuck. Same rule as the confirmation dialog — **the investigator recaps,
  he never lists**.
- **1 more PDF line cut**, 29 August 2026: Mauro's «La pace non basta, se dietro si nasconde il
  peccato…» — scene 1's second part now opens on him picking the note off the floor.
- **2 PDF lines cut** from *La tensione*, 28 August 2026: Rosalia's "Ma zio Giuseppe… e la tua
  famiglia?" and Giuseppe's "Rosalia, questa è la mia scelta." Only Mauro and Roberto speak now.
- **Mauro married Rosalia**, 29 August 2026, and Augusto became a *membro* rather than a founder
  — both in `personaggi`, neither in the PDF. Note that Mauro's surname is still Damiani while
  hers is De Robertis; the user has been told and has not changed it.
- **2 art briefs dropped**, scene 1 and *La tensione*: no `descrizione`, so their typographic
  fallback shows the label alone.
- ***La tensione* now plays on the same stage as *Il racconto dell'olio***, 28 August 2026: same
  `slot:"scena2"`, the same three positions, plus Mauro apart on the left. The `scena2c` slot and
  its copy of `sala2` are gone from `SCELTE`, `ATTESI`, `POSE_SCENA` and `ASSETS` — that alone
  took the file from 5.9MB to 5.5MB, since it was a second copy of scene 1's room.
- **Every box, brief and clue list removed**, 29 August 2026 (see the rule above), "Osserva
  bene!" included. `STORY.oggetti` and the clue table are untouched: they never lived in the txt.
  `smoke.js` fails if a clue card quotes a line nobody says any more: those `refs` are written by
  hand and drift on their own.
- Nothing else is missing. Labels, the clue captions, the investigator's recap, the solution and the
  closing message are all still there — they live outside `battute`, so a dialogue-only check
  will not see them.

Re-run that audit before claiming the text is faithful: comparing whole lines, never fragments.
Splitting on sentence ends lets a short line like "Zio…" pass by accident.

**The malore is scene 3's second part.** On 29 August 2026 the *Il malore dell'oliva blu* screen
was folded into scene 3 (`n:3, parte:"seconda parte"`) with the brindisi's staging, and *Gli
indizi sul tavolo* moved up to `n:4` — the story now runs 1, 2 (three parts), 3 (two parts), 4.
Its `slot` is still `scena4`, and so is its `POSE_SCENA` key: slots are named for the artwork,
not for the number on screen, which is exactly why renumbering a scene costs nothing here. What
it does cost: `STORY.oggetti[].refs` carry a hand-written `s:` number, and renumbering left them
pointing at the wrong scene. `smoke.js` now checks each ref against the scene that actually holds
that line.

**The investigation section has one text size**, from 1 September 2026, and the names carry
faces. Both clue screens are marked `.sheet.indagine`, and one rule sets everything inside them —
`h3`, every `p`, every `li`, `.tag`, `.stato`, `.src`, the name on an ask card — to `--indizi`, a token so the
phone query can raise it once instead of listing selectors again. Seven sizes had collected
there. Two things to know: the rule has to sit **after** the section's own rules, and `.src` and
`.tag` must be named explicitly, because `.risposta .src` (0,2,0) outranks `.indagine p` (0,1,1)
and quietly won. The page's `h2` stays larger — it opens the screen, it is not part of the list;
so does the plain `.btn`, which keeps the button size everyone else has. The faces are `volto-<nome>.png`: on each answer's header
in a round `1.8em` frame — sized in `em`, so it follows the text — and on the people you can ask,
which from the same day are **the sheet's own cards**, `.opt.carta.slot` in an `.opts` grid, so
choosing whom to question looks like naming a suspect. They carry a state the sheet's do not:
`.opt.voce.fatto` keeps whoever answered lit in their own colour, and the two you can no longer
question go to `opacity:.35`. No letter before the name — `1`–`4` open clues, not people. Each is a `.slot`, so a missing face
falls back to the monogram.

## The investigation has a price

Added 30 August 2026, and it is the game, not decoration. On *Gli indizi sul tavolo* the table
may ask about **two** of the four objects, and for each one may question **one** person. Opening
a card is the choice — from that moment a question is spent — so the screen says how many are
left before they commit. `state.indagine = { scelti, chiesto }` holds it; `SCELTE_MAX` is 2.

All four suspects are always offered — `SOSPETTI` is every character except `VITTIMA`, since
Giuseppe is dead and does not answer — and **two of them** can be questioned per object
(`PERSONE_MAX`). Two objects times two people is four answers out of sixteen in a game, which is
where the replay value lives.

`o.risposte[personaggio]` holds those sixteen, written on 30 August 2026 and **not in the
copione**: each is information the scene did not give. They are the culprit's problem — Mauro's
«non me lo ricordo» about the bottle and «andava fermata» about the note only convict him
together, so only the right pair of objects gets both. Under each answer the detail also lists
what that person had already said in the scenes (`o.refs`), which is what keeps `refs` alive and
gives the investigator the link. What was not asked stays unread — that is the point, so never add a
way to peek.

**A click reveals; a button turns the page.** From 31 August 2026 the two are separate verbs:
`scopri()` does what can be done inside the current **scene** — the next line, the next character
card, and the step from one part of a scene to the next, because parts are a cut of staging and
not a new chapter. It returns false only when the next move leaves the scene; that is the
button's job, and nothing else calls `avanti()`. The button sits in the flow, right-aligned: **above the newest line** on a
scene, at the head of the dialogue column, because that is where the investigator is already looking
and the column scrolls back there on every line; and at the foot of the sheet everywhere else.
On a scene the button is **outside the scrolling**: `.dialoghi` is a plain flex column, and it is
`.bubbles` that scrolls, so the scrollbar starts under the button instead of running past it —
`render()` therefore scrolls `.bubbles` back to the top on each line, not `.dialoghi`.
The cast page carries **one button per card**, under the description, always live: pressing it
before the last portrait scrolls to the next character, and on the last it changes screen —
`avanti()` tries `scopri()` first, and `scopri()` on that page is `scorriScheda(1)`. It was a
single strip after the last card until 2 September 2026, disabled until you had scrolled there.
`render()` places the button with one line, choosing `.azioni-scena` if the view offered one and
the `.sheet` otherwise — **unless the view already drew a `[data-avanti]` itself**, which is how
the cast page keeps its five. It was a fixed
corner pill until 1 September 2026; living outside `#stage` meant the stage's click handler could
not see it, and for one publish it drew itself and did nothing. Now it is ordinary stage markup
with a `data-avanti`, like every other button in there. On a scene it is **never disabled**, from
1 September 2026: pressing it reveals the next line exactly as a click does, and changes screen
only when nothing is left — `avanti()` tries `scopri()` first, so the two verbs still hold and
the button simply gained the weaker one. It stays **live but harmless** where a screen asks for a
decision: with a question still open or a clue card open it is disabled, because there a press
would cost a question or an answer. Its label names the move only where the move is special — `Chiudi
l'indagine`, `Alla scheda finale`, `Scopri la soluzione` — and is plain `Prosegui` everywhere
else, including on into the clue table. The opening screens had two labels of their own,
`Comincia` on the cover and `Inizia` under the cast; both went on 1 September 2026, because
nothing special happens there either — you turn a page. There is none on the last
screen.

**Two gestures, two keys each.** Forward is `spazio`, `→` or `↓`; back is `←` or `↑`, and in the
story back does nothing at all — every one of them goes through `scopri()`, never `avanti()`, so
the button stays the only way to change screen. Two author modes come first. In staging the arrows nudge the
selected figure, and with nothing selected they do nothing, because while you are placing figures
the story must hold still — the same reason a drag is not a click. With the developer panel open
the verticals belong to its list and the horizontals to the story, `→` changing screen at the end
of a scene and `←` stepping back one: the whole app can be walked without leaving the arrows.

The cast page is the one place where back does something: `←` / `↑` call `scorriScheda(-1)` and
page back through the portraits. Leafing through a cast list is not rewinding the story — nothing
is revealed there, so nothing is taken back.

`scorriScheda()` finds the current card as **the one whose top is nearest the stage's**, and that
wording is load-bearing. Dividing `scrollTop` by `clientHeight` broke first: on a phone a card is
taller than a screen. Taking "the last card starting above the edge" broke next: the last card
sits a few pixels below it, because there is no scroll left to bring it up, so the page never
declared itself finished and the button stopped working. Nearest survives both.

**A screen that asks for a choice cannot be left by clicking.** Everywhere else the stage is the
remote, but on the clue table a stray tap would end the investigation with a question unspent,
and on a quiz card it would skip the question. `SENZA_CLIC` names those two screen types and the
click handler returns early for them, so not even a line-reveal fires there. Add a screen that
asks for a decision and its type belongs in that set.

With the developer panel open the verticals page through the screens, and the lit row scrolls
itself into view.

**Every confirmation opens with the investigator.** `conferma(domanda, spiega, avanza, poi,
indietro)` puts `detective-riflessione` above the question — he is the one asking, and the pose
says so before the words do — then calls `slots(overlayEl)`, because the overlay lives outside
`#stage` and `render()`'s own `slots()` never reaches it. `spiega` is optional now: two of the
three confirmations are one line and a choice. The figure is the avviso's size — `72vh`, capped
at `44rem` — because it should not shrink just for being in a window; on a phone that pushes the
second button 46px under the fold and the overlay scrolls to it, which is the trade. The way out is named per question, since it is
not the same one twice.

**The solution is asked for twice**, from 2 September 2026. From the verdict, `Vedi la soluzione`
opens *Sei sicuro di voler vedere la soluzione?* and, if you say yes, *Sei veramente sicuro…* —
the same two buttons each time, `Ritenta` and `Vedi la soluzione`, and only the second yes turns
the page. After a score the temptation is strong and reading it ends the game. `Ritenta` is **not** a
change of mind, it is a new game: it opens a third question, *Vuoi ricominciare da capo?*, and
its yes empties `state.risposte`, rebuilds `state.indagine` and goes to slide 0 — the reset that
used to need a page reload. That is what `conferma()`'s sixth argument is for: give the way out a
callback and it stops being a plain `data-close`. `chiediEAvanza()` is where both this and the
clue table's confirmation hang, so a screen that must ask before leaving belongs there and
nowhere else.

**Closing the investigation early asks first.** While `indagineCompleta()` is false — both
objects chosen and every one of them questioned to the limit — `Chiudi l'indagine` opens a
confirmation instead of moving on. The wording is the investigator's, not the rulebook's: it
recaps the evening and asks whether you have enough, and it **never mentions the clues** or how
many questions are left, because that would be coaching. `Torna indietro` takes the focus; going
on has to be wanted. `mostraOverlay()` now fills the one overlay for both the commands window and
the confirmation.

`apriIndizio(i)` is the single door: the click handler and the `1`–`4` keys both go through it,
or the keys would spend nothing and open everything. `smoke.js` opens all four and asserts only
two took, and that a questioned character's lines appear while the others' do not.

## The running order, 29 August 2026

Four scenes, twelve scene screens, twenty in all:

```
copertina · avviso · personaggi
1  L'inaugurazione degli Oliviani   sala + il biglietto + sala
2  La donazione                     il foglio + sala + Il racconto dell'olio + La tensione
3  Il brindisi                      sala + Il malore dell'oliva blu
4  Gli indizi sul tavolo            la bottiglietta + il bicchiere + sala
tavolo degli indizi · investigatore · scheda finale · verdetto · soluzione e congedo
```

Twenty screens, twelve of them scenes. Codex delivered five meeple-detective poses on
31 August 2026; `detective-riflessione` stands **above** the recap, the pose where he
holds his chin while the case is handed over. He was beside it past 62rem until 1 September 2026,
which fitted six large lines but left the button hanging at mid height, far from the text it
follows; the column puts figure, text and button in that order at every width. On the four
screens he carries alone — avviso, recap, verdict, ending — he was **doubled** on request the
same day: 76vh on the recap, 72 on the avviso, 64 on the other two, each with the width cap
doubled to match. At 1280×800 that costs the fold — the stage scrolls by 30 to 78px and the
button sits just under it. The trade was asked for with the figures on the table; the smaller
caps are one number each if it is ever wanted back. The `v` panel's row for the recap reads
**Il detective**, the same name the audience sees. `detective-osservazione`, lens in hand, opens the clue table beside its title. `detective-presentazione` carries the **avviso**, the screen added on
1 September 2026 between the cover and the cast: the disclaimer used to sit under the cover
image, where nobody read it, and now it has a page of its own with the investigator above it —
the same `.narr-fine` column as the recap, plus an `.avviso` class carrying its two differences:
a service body instead of a narrated one, and text ranged left, because a paragraph of six lines
centred reads as a poem. The text itself is untouched, so `copione.txt` does not move: it comes
from `STORY.disclaimer` either way. `detective-scoperta`, finger raised, carries the **last
screen**; all five are hooked, and `sync-assets.py` reports nothing unused. Two files that were
left over went to `trash/immagini/`: `attore-augusto-spiegazione`, a good pose nobody ever put in
`POSE_SCENA`, and `quadro-oliva`, the still the animated cover replaced. They are on disk, out of
git — bring the pose back if scene 2 ever wants it.

The ending is two screens again from 1 September 2026: **`sol` is the verdict alone** — the score
out of ten and the band it falls in — and **`fine`** is the investigator, `STORY.soluzione` read
out, and the word *Fine*. Both are columns: figure, then text, then button. Verdict and ending read like the avviso from
2 September 2026: same family, same `--t-voce`, same weight 400, same `--muted`, for the score,
its «su 10», the band's name, its explanation and the narrated solution. The verdict had three
sizes and two families for four lines. The score keeps only the gold — it is the screen's one
number and has to stay findable. All four are `--ink`, not `--muted`, from 2 September 2026: the
investigator is telling the story, not annotating it in the margin. Two rules had to give up
their own `color` for that — `.giudizio p` and `.vuoto` — because they tie on specificity with
the shared rule and sit below it. The rule must be repeated inside the phone query, or the
four-screens override there gives the score a size of its own again; and `.giudizio h2` may not
carry a weight, or it beats the shared rule on specificity and the band's name comes out bold
among four regular lines. On the verdict the
**pose is half the verdict**, and `POSA_VERDETTO()` picks it before a word is read —
`detective-soluzione` for the full ten, `detective-osservazione` when the name is right and the
reconstruction stands (6-9), `detective-riflessione` for everything else, the blank sheet
included. `smoke.js` checks all five bands map to the pose they claim. The eyebrow reading *Il
verdetto* went with the redesign: the screen says ten out of ten, which needs no label. They had been merged on 31 August, but reading how it went beside your
own mark made the story look like a marked exercise; the button between them says `Vedi la
soluzione`, so finding out is a choice. Landing on the verdict without having answered is only
reachable by jumping with the developer panel, and the page says so rather than coming up blank.
*Ricomincia* came back on 2 September 2026, but only as `Ritenta` on the way to the solution:
it is the one path that resets the investigation and the answers without a page reload. Scene 1's third part exists for one reason: without it
the biglietto plate and the foglio plate sat back to back, and two clue plates in a row read as
one screen that changed picture.

Four screens show a clue plate instead of a room: `sfondoDa` takes any file stem, so
`sfondoDa:"indizio-foglio"` puts the 1:1 plate on the square stage with `cast:[]`. That is also
how *Gli indizi sul tavolo* has any artwork at all: its own plate was rejected and never
redelivered, so `scena5.png` is still on the pipeline's missing list.

## Screens vs scenes

One scene is several screens: `n` is the number the audience reads, `parte` the sub-label,
`slot` the artwork casella. Scene 2 is four screens all labelled "Scena 2 di 4"; scene 4 is
three. **Nothing may be derived from the array index** — splitting a scene would shift every
later scene's artwork, and index-derived names have already leaked twice (the background's `alt`,
and `demo()`).

Three fields decide what a screen shows, and they are deliberately independent:

| field | what it moves | resolved by |
|---|---|---|
| `slot` | the poses, and the casella name | `CASELLA(i)` |
| `sfondoDa` | the room: background **and** its `primo` props | `SFONDO(i)` |
| `sfondo:{scala,fx,fy}` | the zoom and focus of that background | inline transform |

*Il brindisi* is `slot:"scena3"` — so the `-brindisi` cutouts apply — with `sfondoDa:"scena1"`,
so it plays in the opening scene's hall. A table belongs to a room, not to a scene number, which
is why `primo` follows `SFONDO()`. Both parts of scene 3 borrow that hall: it is the only way
they can share the two foreground tables, which exist solely as `scena1-sx/dx`. `sfondoDa` also
takes a plain file stem, which is how four screens show a clue plate instead of a room.

Neither `scena3.png` nor `scena4.png` is embedded any more: nothing draws them, so
`sync-assets.py` skips them — see `MAI_DISEGNATI`. The `.png` stay in `assets/images/`, so
giving a scene its own room again costs one line and a re-sync.

## Poses

`POSE_SCENA` maps slot → character → pose, and `ATTORE(c, scena)` builds
`attore-<nome>-<posa>.png`. Names are semantic, never versions: `giuseppe-malore`,
`rosalia-allarmata`, `mauro-guardingo`, `roberto-accoglienza`, `giuseppe-presentazione`. A new
pose needs two edits: the entry in `POSE_SCENA` **and** the name in `sync-assets.py`'s `POSE`
list, or the file Codex delivered is skipped and the scene quietly falls back to the neutral
cutout. A character with no pose for that scene falls back to the
neutral cutout, and a missing file falls back like any other image — so a half-delivered set
never breaks a scene. The malore — scene 3's second part, casella `scena4` — is where they earn
their keep: the whole cast reacts at once.

## How a scene is composed

Three layers inside `.palco`, all positioned in percentages of the frame:

1. `scenaN.png` — background, foreground deliberately left clear. `brindisi-v2` once arrived
   with all five characters painted in, which showed everyone twice; the fix was a clean
   redelivery, not code. If a background comes back populated, say so and ask for the empty
   room.
2. `attore-*.png` — one transparent cutout per character, from `STORY.scene[i].cast`:
   `x` (centre), `b` (height above the floor), `h` (figure height). **Height carries the depth** —
   never width. Array order is the stacking order: farthest first.
3. `scenaN-sx.png` / `scenaN-dx.png` — foreground props, from `STORY.scene[i].primo`. Optional.

Actors and props sit on **one** stacking scale, not two: actors default to `z-index:1` and props
to `5`, and an optional `z` on either entry overrides that. Scene 1 uses all three levels: the
left table stays at `5`, Roberto is `z:6` so his arm passes in front of it, and the right table
is `z:7` because it stands nearer the camera than he does. In staging mode `[` / `]` swap places inside the
element's own list, and at the end of that list they cross the other plane instead of stopping.
This is the only `z-index` anyone may set on the stage; `.attivo` still must not have one.

**Positions are decided by eye, not by guessing numbers.** Press `r` on a scene for staging mode:
drag to move, wheel or `+`/`-` to resize, arrows for fine steps. The panel prints the `cast:` and
`primo:` lines to paste back into `STORY`. Changes live only in the open page.

**The stage is clipped 10% top and bottom**, from 1 September 2026: ceiling above the figures,
empty floor below. Do not cut it by moving the *background*: drawing it taller and pushing it up
zooms the picture and eats the sides, and was rejected on sight. It is the **frame** that
shrinks, not the image. `.palco` keeps `aspect-ratio:1` and every coordinate keeps its meaning; `clip-path:inset(10% 0
10% 0)` simply hides the two bands. No zoom, no lost sides, and the staging that was already
decided stays valid to the millimetre. What the bottom band costs is real: a figure standing at
`b:0` loses its feet, and so do the foreground tables, which are anchored to the bottom corners.
The staging badge moved down 10%, or the clip would have swallowed it.

**Every stage is square.** Scene 2's three parts carried `formato:"16 / 9"` and read as a strip
next to the others; the field and the `--formato` variable were removed on 28 August 2026 and
`.palco` is `aspect-ratio:1` outright. A 16:9 background is cropped left and right by
`object-fit:cover`, so a wide plate loses its edges — that is the trade, and the answer is to
re-stage the figures with `r`, never to give one screen its own shape.

**Never size the stage in `vh`.** The rows are declared (`54% / 46%`) and the stage takes the
height left under the title, so it is the largest square that fits. Sized in `vh` it grew past
its own half on phones, got clipped, and read as if the picture were zoomed in — that bug came
back once already.

A percentage `max-height` needs a definite height on the container, or it is ignored and the
figure spills out of its half.

## Voices

Each character is a synth profile in `VOCE` — waveform, pitch, blip rate, note length, pitch
drift across the line, lowpass cutoff and its own `vol` — so they are told apart by timbre, not
only pitch. Square and sawtooth carry far more energy than sine at the same number, which is
what the per-voice volume is for. Muted with `m` or the pill next to `?`.

The investigator has no profile at all, and `suona()` returns early without one — that early return
is the whole implementation of "l'investigatore non ha voce". Only `avanti()` speaks, so stepping
back through a scene is silent on purpose.

The audio context starts suspended and `resume()` is async: schedule the blips **after** it has
started, or they land in the past and nothing plays.

## Images pipeline

`python3 sync-assets.py` then `node smoke.js`, in that order, after every delivery: the sync
keeps the newest `-vN` per slot, makes a web-sized WebP of it and rewrites the `ASSETS` map.

Codex names files its own way **and renames them between deliveries** — `scena3-sala2-*` became
`sala2-*` mid-project. `SCELTE` declares which file fills which slot (`copertina.png ←
quadro-oliva-animato`); when a scene silently falls back to its text brief, that map is the first
thing to check. Anything outside the expected slots is skipped, and the script prints what is
still missing.

Animated files (the cover is a 21-frame WebP) are resized frame by frame and re-saved with
`save_all`; a plain re-encode keeps one frame and silently kills the animation.

Actor and prop cutouts are cropped with `bbox_pulito()`, not `getbbox()`: it keeps only the
densest band of rows and columns. The `-brindisi` set arrived with a two-pixel guide line down
the right edge of the canvas — opaque enough that no alpha threshold could tell it from the
drawing — and `getbbox()` dutifully kept the whole canvas, so the figures came out small and
off-centre with a visible dashed edge. The trade: an element genuinely detached from the figure
would be dropped. Delete the stale `assets/web/*.webp` before re-syncing when the crop changes,
or the cache hands back the old cut.

Already-converted files are reused from `assets/web/` when the copy is newer than the source —
without that, every run re-encoded the cover's 21 frames. Stills are saved with `method=4`: `6`
exhausted memory on the square RGBA clue plates and buys nothing at these sizes.

`LARGH["scena"]` is **1200**, down from 1600 the same day: at 1920×1080 the stage is a square of
about 390 CSS px, so 1600 was four times what any screen asks for. 1200 keeps 3× of headroom
there and is still 1:1 on a 4K panel; measured across the whole stage the difference is 3.75 of
765. The other widths are already right — the card portrait can reach ~600px on a 1080 screen,
which at 2× is more than the 900 it is generated at.

Their quality is **80**, lowered from 86 on 2 September 2026: on a portrait crop at 1:1 the mean
difference is 9 of 765 and the largest 64 — invisible on this kind of painted art — and it took
the app from 4.98MB to 4.10MB. Do not go lower without looking: at 74 the saving is another
20% and the brush texture starts to flatten. The cache in `assets/web/` is keyed by mtime, so
**delete it before re-syncing** when the quality changes, or the old encodes come straight back.

## Deliberate omissions

No player devices, no sync, no score persistence, no framework, no build step.
