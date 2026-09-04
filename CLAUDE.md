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
python3 sync-assets.py     # converte le immagini e rigenera assets/assets.js

# la leggibilita' da telefono: l'app dentro una cornice da 390px, e il referto nel titolo
chromium --headless --allow-file-access-from-files --dump-dom \
  "file://$PWD/telaio-390.html?p=copia-con-audit-mobile.html"
```

`censimento.js` non si lancia: si incolla in coda allo `<script>` di una copia dell'app e stampa
quante misure e quanti stili di testo arrivano davvero sullo schermo. Sei misure su schermo
grande, quattro da telefono: se il conto sale, un gradino nuovo e' entrato di nascosto.

Non c'e' watcher e non serve un server: `oliva-blu.html` si apre da disco insieme alla cartella
`assets/`. `sync-assets.py` è l'unico passaggio di generazione. Non esiste
un modo di lanciare un solo controllo — `smoke.js` e' un file solo e dura meno di un secondo; per
isolare un caso si commenta il resto.

## Files

- `oliva-blu.html` — the application shell, styles, story and runtime. It is no longer a
  self-contained file: it loads the generated image map from `assets/assets.js`. It still needs
  no server or third-party dependency and opens directly from disk — **with that file beside it**.
- `assets/assets.js` — generated `ASSETS` map containing the image data URIs. It is **tracked and
  committed**: Pages serves it next to the HTML, and without it the site has no pictures. The
  `<script src>` carries a `?v=` fingerprint of the file's contents, stamped by `sync-assets.py`
  on every run: the filename never changes, so without it a browser that has already fetched
  `assets.js` keeps serving the old images — or, if it once saw them missing, keeps serving their
  absence. That is what happened on Pages on 4 September 2026. Never edit the file by hand.
- `asset-inventory.js` — evaluates `STORY` through the shared DOM stub and emits the characters,
  poses and clue IDs consumed by the image pipeline. This avoids parsing JavaScript with regexes.
- `index.html` — redirect for Pages, which serves `index.html` at the root.
- `sync-assets.py` — hooks Codex's deliveries into the app and rewrites `assets/assets.js`. It is
  guarded by `if __name__ == "__main__"`, so importing it for tests cannot rewrite project files.
- `smoke.js` — walks every screen, checks the quiz maths, and guards what nothing else can:
  the copione, the investigation's budget, the clue table's hand-written quotes, the public
  build's gates, the voice profiles shared with `voci.html`, both directions of the stage's
  `data-*` contract, that every figure of every scene resolves to an embedded image, and that
  `d` leaves `ASSETS` untouched. The stub loads local `<script src>` dependencies in document
  order. Run the smoke test after touching either the runtime or generated asset map.
- `stub-dom.js` — the fake DOM the three node scripts share. Not run on its own.
- `dom.js` — writes the markup of every screen to a file. Run it before and after a refactor:
  with `class` and `style` stripped, the diff must be empty.
- `voci.html` — the voice bench: sliders per character, plays them, prints the `VOICE` block to
  paste into the app. Its synth engine is a **deliberate copy** — change it in both files.
- `copione.txt` — the approved script. The verbatim reference; `smoke.js` checks the app against
  it. Regenerate with `node estrai-copione.js` after any agreed change to the text.
- `estrai-copione.js` — writes `copione.txt` out of `STORY`, so the two can never drift.
- `censimento.js` — inject it into the page and it reports how many text sizes and how many
  distinct text styles actually reach the screen, and which texts carry no rule of their own.
  The count is a contract: five sizes, on a big screen and on a phone alike.
- `audit-mobile.js` + `telaio-390.html` — the phone readability audit. The frame exists because
  headless Chromium will not give a script a window under 500px, so the app runs inside a 390px
  iframe and the result is read out of it.
- `img/ART.md` — the illustration brief Codex works from.
- `assets/images/` — Codex's deliveries, named by subject; backgrounds follow
  `scenaX_back_nome` (`scena1_back_sala2`, `scena2_back_sala1_scena2`,
  `scena3_back_brindisi`, `scena3_back_malore`). Scene-bound foreground layers follow
  `scenaX_foreground_nome`, and the cover follows `copertina_nome`; actors and the
  `indizio_*` plates keep their own family prefixes. Source filenames use underscores only and
  are mapped to the app's stable underscore-only logical slots in `SLOT_SOURCES`. Physical files in both
  `assets/images/` and generated `assets/web/` use underscores only.
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

**Scene titles stay off every served copy.** `TITLES_ENABLED` is true only with the `file:` protocol:
`renderScene` emits the `.scene-head` — the title, and nothing else since 3 September 2026 — only
where the author works. The big gold numeral and the «Scena N di M · parte» eyebrow above it went
that day: they cost 64px of header on a 1280×900 screen, and the stage took every one of them —
301px square before, 365 after. A title tells the story before it happens; *Il malore dell'oliva blu* announces the murder
to a table that is still toasting. On Pages the scene opens on the picture alone, which also
gives the stage the height the header was using.

**Author tools live where the author works: the local file and the artifact.** `AUTHOR_SURFACE` is
`file:` **or** a host matching `AUTHOR_HOSTS` (`claude.ai`, `claudeusercontent.com`), and
`DIRECTOR_ENABLED`, `DEV_ENABLED` and `TITLES_ENABLED` follow it. It is an allow-list on purpose:
a deny-list on `github.io` handed the tools to any custom domain or preview host that simply was
not Pages, and gating on `file:` alone — tried on 31 August 2026, tried again on 4 September —
takes `r` and `v` away from the artifact, which is where the work happens. `smoke.js` checks all
five surfaces. `r` opens staging;
`v` opens the developer panel — where you are, and the screens listed one per row to jump
anywhere in one click. It used to carry a third row naming every expected image that was not
embedded; in the artifact, where `assets/assets.js` never loads, that row listed all forty and
filled the panel, so it went on 4 September 2026 along with `expectedAssets()`, which nothing
else called — `sync-assets.py` derives the same inventory from `STORY` through
`asset-inventory.js`, and two derivations of one truth is one too many. It is
**semi-transparent** (`opacity:.6`) so it can stay open while you work — the scene reads through
it — and while it is open the four arrows split the work: `↑` `↓` walk the list of screens, `→`
walks the story — a line at a time, and on to the next screen when the scene runs out — and `←`
steps back a screen, which only an author may do. The panel does **not** print that legend: it
lived in its header until 4 September 2026 and it is what `?` is for. Two rows earn their place —
where you are, and the list — and the image line stays **empty when nothing is missing**. It had a
`Tutte le battute` button too, gone on 1 September 2026 with `battuteTutte()`: a scene now opens
with its first line already revealed, and the rest is one keypress each. Both panels work from
the local file and stay disabled on every HTTP or HTTPS deployment.
The help overlay lists only the keys that actually work where it is running. `smoke.js` runs the
app as a local file, on GitHub Pages and on a custom HTTPS domain, and fails if a gate leaks.

**Images must be optional.** Every slot falls back to a typographic placeholder via `setupImageSlots()` on
`error`. The app must look finished with `assets/images/` empty.

**`d` is a veil, not a substitution.** `DEMO_LAYER` holds one silhouette per slot the demo covers —
every background, every neutral cutout, every pose — and `src()` reads it first while
`state.demo` is on. It is deliberately lazy: `createDemoLayer()` runs only on the first `d`, not during
normal startup, and reuses one encoded SVG per character across all that character's poses.
`ASSETS` is never touched, so turning the demo off restores
nothing because nothing was taken. It used to write into `ASSETS` and, on the way out, `delete`
the keys: pressing `d` twice **destroyed the real embedded images** until the page was reloaded.
Codex found that and fixed it with a backup map on 2 September 2026; the veil removes the whole
class instead. One consequence to know: `src()` now reads `state`, so anything calling it at load
time must be lazy — `coverImage` became a function for exactly that reason.

**Static inventories are cached.** `expectedAssets()` derives its list only from immutable `STORY` and
`SUSPECTS`; poses live on `scene[].cast[]` and clue IDs on `oggetti[]`. It stores the result in `EXPECTED_ASSETS` on first
use. Do not invalidate or rebuild it during `render()`. If any of those sources ever becomes
editable at runtime, remove the cache or give that editor an explicit invalidation step.

**Image revisions must always be versioned.** Never overwrite an existing image, including
newly generated assets that have not been committed yet. Keep the original filename unchanged
and save every revision with the next available numeric suffix (`_v2`, `_v3`, …). Version
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
- **Size is tokenised too**, from 2 September 2026, and there are **five steps**, no more:
  `--t-titolo` (cover, *Fine*), `--t-nome` (character names,
  the sheet's questions), `--t-voce` (the investigator's four screens, scene titles),
  `--t-corpo` (dialogue, the clue section, buttons, the speaker's name) and `--t-etichetta`
  (eyebrows). Thirteen sizes reached the screen before, and four of them sat within 2.2px of each
  other — 22, 21.8, 20, 19.8 — four independent decisions nobody could tell apart. A new rule
  takes a step; it does not invent a seventh. `node`-less check: inject `censimento.js`, walk all
  twenty screens, group every text-bearing element by computed size. Two crossings were found
  that way and fixed by raising a floor, never by adding a step: `--t-voce`'s fluid term dropped
  below `--t-corpo` under 1240px (the investigator spoke smaller than the dialogue), and
  `--t-cifra` dropped below `--t-nome` under 800px — that token is gone now, but the floor it
  taught stays. As the window narrows the steps **merge**, which is fine; they must never swap. The phone query overrides the tokens, not the selectors, but still carries its own
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
- **Views are a table, not a ternary chain**: `VIEWS` maps a slide's `t` to its function. A new
  kind of screen is a function plus one line there.
- **Every view is built the same way**, and only its classes differ. The root is `.sheet` plus
  modifiers; every `<img>` sits in a `.slot` with a `.ph` beside it, or it would never get its
  typographic fallback; every `<button>` inside the stage carries a `data-*`, or the delegated
  handler cannot see it. Audited across all screens on 4 September 2026 — zero exceptions on all
  three counts — and it is the kind of thing to re-run after adding a view: walk the slides,
  count `img:not(.slot img)`, `.slot:not(:has(.ph))` and buttons without a `data-*`.
- **A class says what a thing is, never where it lives.** `.titolo` is a screen's title at the
  voice size, whether the screen is a scene, the clue table or the commands window; it was called
  `.scene-title` while serving all three. `.titolo-carta` is the name on a card — a character, a
  clue — and carries its own size.
- **Headings do not start at `h3`.** The cover has the only `h1`; a screen's own title is `h2`,
  and `h3` is for cards *inside* a screen that already has one, which is why the clue cards on
  the table are `h3` and the same card opened on its own page is `h2`.
- **Three markup helpers carry what repeats across views**, added 2 September 2026: `guida(posa,
  alt)` is the investigator with his fallback, drawn by five screens; `cartaSospetto(nome,
  {dati, classi, lettera, spento})` is the face-under-name card, which the sheet's questions and
  the people you can ask on a clue now share — they differ by a letter, a `data-*` and a state,
  not by a card; and `vDetto(classe, posa, alt, righe)` is the whole avviso and the whole recap,
  which differ by a class, a pose and how many lines there are. Those two views are now one line
  each — and being arrows rather than declarations, they must stay above `VIEWS`, which holds
  their value, not their name. `score()` and `culpritFound()` sit next to them for the same reason: the score and
  "was the culprit named" were each computed in two places.
- **Nothing embedded that nobody draws.** The app carries its images as data URIs, so a slot the
  pipeline fills but no screen requests is pure weight: the two rooms drawn for scene 3 were
  772KB of it, because both its parts borrow scene 1's hall through `sfondoDa`. They keep their
  source names, `scena3_back_brindisi.png` and `scena3_back_malore.png`, and no longer correspond
  to any slot. `sync-assets.py` keeps a
  `EXCLUDED_ASSETS` set for exactly this. `attore_rosalia.png` and `attore_mauro.png` followed,
  another 144KB: those two have a pose in every scene, so their neutral cutout was never asked
  for — and unlike the two rooms, the files went to `trash/immagini/`. That is a bet on the poses in `scene[].cast[]`,
  so `smoke.js` now resolves every figure of every scene through `actorImage()` and fails unless it
  lands on an embedded image; proven by taking Mauro's pose out of scene 1 and watching it name
  both parts. Giuseppe, Roberto and Augusto keep their neutral cutouts, because those three do
  fall back. Six megabytes became five.
- **One name, one shape: underscores, everywhere.** Source files, `ASSETS` keys, `SLOT_SOURCES`,
  pose fields, `expectedAssets()` and the `assets/web/` cache all use `nome_con_underscore`; hyphens are
  gone from the whole chain. `smoke.js` fails on the first `ASSETS` key that contains one, which
  is what keeps the two halves of the pipeline from drifting apart again.
- **Slots are named for what they show**, not for a number: `scena3_brindisi`, `scena3_malore`,
  `indagine`. They used to be `scena3`, `scena4`, `scena5`, which meant a semantic slot looked
  exactly like a background filename that nobody delivered — `scena5.png` sat on the pipeline's
  missing list for days because of it. `smoke.js` asserts the three semantic slots exist.
- **`expectedAssets()` is built once** and kept: it is derived from `STORY`, which does not change while
  the page is open, and the developer panel asks for it on every render.
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
  invisible to `setupImageSlots()` — which walks `stage.querySelectorAll(".slot img")` — so an image put
  there would never get its typographic fallback.
- **The two author panels are held by reference**, `directorPanel` and `developerPanel`, and never looked up
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
- **`smoke.js` guards the deliberate duplicates**: the `VOICE` profiles must match between
  `voci.html` and the app (tuning voices on one page and performing with the other's was possible
  before), the clue table's hand-written quotes must exist and name the right scene, and the
  public build must show neither the author tools nor the scene titles.

**Refactor with a snapshot, not by eye.** `dom.js` (`node dom.js prima.txt`) walks all 20 screens with the smoke
stub, reveals every line, and dumps `stage.innerHTML`. Run it before and after: strip `class` and
`style` attributes from both and the diff must be empty. That is how this pass was proved to
change styling hooks only.

## The scene screen

Two declared regions: the top holds the title and the stage, and never moves; the
bottom scrolls on its own. Nothing draws the line between them — a hairline ran along it until
3 September 2026 and the gap does the job on its own. The bottom is split `32% 1fr` — the speaker's **actor cutout**
(`attore_*.png`, not the portrait) in a 3:4 frame cropped from the top, head to waist, faded out
at the bottom — and the dialogue column. Use `1fr`, not a second percentage: two fixed
percentages plus a gap overflow and produce a horizontal scrollbar.

The dialogue column carries across the parts of one scene. Screens that share the same `n` are
one conversation: `renderScene` walks backwards while `sceneNumber()` matches and appends each earlier part's
lines in full, joined by `<hr class="atto">`. Entering a new part opens with the rule at the top
and the part's **first line already lit**, the backlog dimmed below it — the same everywhere,
since `goTo()` reveals it. Only a scene with no lines at all opens with nothing lit, and there
`.bubble:first-child` matches no bubble because the current group is empty.

The inciso under a speaker's name — *piano*, *tra sé* — is the same size as the name, from
2 September 2026. `.who small` styled it italic and grey but never sized it, so it fell to the
browser's own `small`: 0.75em of 0.9em, the only measure in the app nobody had chosen, and on a
phone the smallest text anywhere. Italic, weight and colour separate it now; the size does not.
A census across all twenty screens counts the sizes that reach the screen — five either way — and
every one of them is a decision; see *Type and the phone*. `--t-cifra` was a sixth until
4 September 2026, when the census found it never reached the screen: the scene numeral that used
it had been removed, and the verdict overrides the score with `--t-voce`. A step nobody can see
is not a step.

Consecutive lines by the same speaker share one bubble — `groupLines()` collapses the run and
`renderBubble()` renders one `<p>` per line inside a single `.said`. A different `m` breaks the run: a
line said out loud and one said "tra sé" are two moments, not one speech.

**A line arrives at the speed of the voice.** `playVoice()` schedules its blips every `passo`
seconds; `animateSpeech()` wraps each piece in a `.sillaba` and reveals them on the same beats, one per blip,
cutting between words —
as close to a syllable as you get without a dictionary. The pieces are all in the paragraph from
the first instant, invisible rather than absent, so the bubble does not grow under the reader's
eye and `smoke.js` still finds the whole line in the markup. **The rhythm does not depend on the volume**: at zero the character still speaks, you only see
it. It is the line's timing, not an ornament of the sound — and it is what keeps a silent
performance from turning into a wall of text that lands all at once. `smoke.js` also reassembles every line through `splitText()`
and fails if a single space is lost — what is read must stay the copione. The stub needed
`setTimeout`/`clearTimeout` to exist for this, doing nothing.

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
  enormous, the user said so, and the pile of literals went. At 390px the steps read
  46.6 / 28.7 / 24.6 / 20 / 15.7, against 88 / 38 / 27.2 / 22 / 14 on a big screen: the same five,
  a little closer together.
  Measure on the device, not only in the frame: the frame cannot tell you the meta is missing.
- **Where you choose, two columns.** `.clues` and `.opts` are `repeat(2, minmax(0,1fr))` inside
  that query: four clue cards and four suspects sit under the thumb instead of stretching over
  four screenfuls of scrolling. On a big screen both keep `auto-fit`, which puts all four in a
  row.
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
- **34 lines added.** They used to carry `nuova:true` in `STORY` and print
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
  the only one, and Giuseppe asks what the others are. On 3 September three lines in scene 4
  made the hand-off inferable without stating it: Rosalia places Mauro by the glasses, Mauro
  admits helping distribute them, and Roberto says he had already served everyone. Of 70 spoken lines, 34 are not Gervasio's
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
  offers **the four suspects** — `SUSPECTS`, in that order — so a question has no `opzioni` of
  its own, only `giusta`. You pick a person, not a phrase, and no option can be ruled out on
  sight. Half of them need two moments joined rather than one line recalled: who asked for the
  bottle to be put away, who read the note without telling Giuseppe. `smoke.js` scores from
  `giusta` rather than letters, fails if a question grows its own `opzioni`, and fails if the
  right answer sits in fewer than three distinct columns.
- **One page, six questions**, 31 August 2026. The quiz was six slides; now it is one, and
  `currentQuestion()` — the first unanswered index — is the whole state machine. A closed
  question collapses to a line with the name chosen and nothing else — **no points, no right or
  wrong**: the verdict lands once, at the end, and until then the sheet only records who was
  accused. The next question opens beneath it. Only the open question renders options, which is why the
  click handler can write `state.risposte[domandaCorrente()]` without the buttons carrying an
  index. `Scopri la soluzione →` appears only when nothing is left open. Each option carries the
  suspect's face (`volto_<nome>.png`, four of them, delivered 31 August 2026) under the name, so
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
  its copy of `sala2` are gone from `SLOT_SOURCES`, `EXPECTED_ASSETS` and `ASSETS` — that alone
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
Its `slot` is `scena3_malore`, not a second scene number;
that is exactly why renumbering a scene costs nothing here. What
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
so does the plain `.btn`, which keeps the button size everyone else has. The faces are `volto_<nome>.png`: on each answer's header
in a round `1.8em` frame — sized in `em`, so it follows the text — and on the people you can ask,
which from the same day are **the sheet's own cards**, `.opt.carta.slot` in an `.opts` grid, so
choosing whom to question looks like naming a suspect. They carry a state the sheet's do not:
`.opt.voce.fatto` keeps whoever answered lit in their own colour, and the two you can no longer
question go to `opacity:.35`. No letter before the name — `1`–`4` open clues, not people. Each is a `.slot`, so a missing face
falls back to the monogram.

**The clue cards are named for the thing, not for a phrase**, from 3 September 2026: *Bicchiere*,
*Bottiglietta*, *Donazione*, *Biglietto*. They were «Il bicchiere di Giuseppe», «Il foglio della
donazione» and so on, which wrapped to two lines in the two-column grid on a phone and read as
sentences where the card wanted a label. The `tag` under each still carries the phrase.

**Open text questions, for the user, not for me.** Three inconsistencies survive a reading of
`copione.txt` and are *not* to be fixed on my own — cutting or rewording is a product decision:

1. **The note has two texts.** Mauro reads «Zio, ti prego: non fare la donazione. Quei beni fanno
   parte della nostra eredità» in scene 1, but the clue card's `tag` quotes «Fermate Giuseppe
   prima che doni tutto» — plural, addressed to a room, and it makes Rosalia sound like she is
   organising something.
2. **Quiz 5 asks about the glass, the scene answers about the bottle.** «Chi ha riconosciuto che
   nel bicchiere non c'era una bevanda?» expects Roberto, whose line — «Questa non è una bevanda.
   È un prodotto per le piante» — is said over the *bottiglietta* plate.
3. **Scene 1's exchange concludes before it explains.** Giuseppe says «Quindi nessun metodo
   significa trattare alla cieca» and only then do Roberto and Augusto describe the three methods,
   after which he adds «Interessante!». The conclusion and the explanations are inverted.

Two spelling slips were fixed under the standing exception, in both files at once: `possibilitá`
→ `possibilità` and `é` → `è`.

## The investigation has a price

Added 30 August 2026, and it is the game, not decoration. On *Gli indizi sul tavolo* the table
may ask about **two** of the four objects, and for each one may question **one** person. Opening
a card is the choice — from that moment a question is spent — so the screen says how many are
left before they commit. `state.indagine = { scelti, chiesto }` holds it; `MAX_CLUES` is 2.

All four suspects are always offered — `SUSPECTS` is every character except `VICTIM`, since
Giuseppe is dead and does not answer — and **two of them** can be questioned per object
(`MAX_PEOPLE`). Two objects times two people is four answers out of sixteen in a game, which is
where the replay value lives.

`o.risposte[personaggio]` holds those sixteen, written on 30 August 2026 and **not in the
copione**: each is information the scene did not give. They are the culprit's problem — Mauro's
«non me lo ricordo» about the bottle and «andava fermata» about the note only convict him
together, so only the right pair of objects gets both. Under each answer the detail also lists
what that person had already said in the scenes (`o.refs`), which is what keeps `refs` alive and
gives the investigator the link. What was not asked stays unread — that is the point, so never add a
way to peek.

**A click reveals; a button turns the page.** From 31 August 2026 the two are separate verbs:
`reveal()` does what can be done inside the current **scene** — the next line, the next character
card, and the step from one part of a scene to the next, because parts are a cut of staging and
not a new chapter. It returns false only when the next move leaves the scene; that is the
button's job, and nothing else calls `advance()`. The button sits in the flow, right-aligned: **above the newest line** on a
scene, at the head of the dialogue column, because that is where the investigator is already looking
and the column scrolls back there on every line; and at the foot of the sheet everywhere else.
On a scene the button is **outside the scrolling**: `.dialoghi` is a plain flex column, and it is
`.bubbles` that scrolls, so the scrollbar starts under the button instead of running past it —
`render()` therefore scrolls `.bubbles` back to the top on each line, not `.dialoghi`.
The cast page carries **one button per card**, under the description, always live: pressing it
before the last portrait scrolls to the next character, and on the last it changes screen —
`advance()` tries `reveal()` first, and `reveal()` on that page is `scorriScheda(1)`. It was a
single strip after the last card until 2 September 2026, disabled until you had scrolled there.
`render()` places the button with one line, choosing `.azioni-scena` if the view offered one and
the `.sheet` otherwise — **unless the view already drew a `[data-avanti]` itself**, which is how
the cast page keeps its five. It was a fixed
corner pill until 1 September 2026; living outside `#stage` meant the stage's click handler could
not see it, and for one publish it drew itself and did nothing. Now it is ordinary stage markup
with a `data-avanti`, like every other button in there. On a scene it is **never disabled**, from
1 September 2026: pressing it reveals the next line exactly as a click does, and changes screen
only when nothing is left — `advance()` tries `reveal()` first, so the two verbs still hold and
the button simply gained the weaker one. It stays **live but harmless** where a screen asks for a
decision: with a question still open or a clue card open it is disabled, because there a press
would cost a question or an answer. Its label names the move only where the move is special — `Chiudi
l'indagine`, `Alla scheda finale`, `Scopri la soluzione` — and is plain `Prosegui` everywhere
else, including on into the clue table. The opening screens had two labels of their own,
`Comincia` on the cover and `Inizia` under the cast; both went on 1 September 2026, because
nothing special happens there either — you turn a page. There is none on the last
screen.

**Two gestures, two keys each.** Forward is `spazio`, `→` or `↓`; back is `←` or `↑`, and in the
story back does nothing at all — every one of them goes through `reveal()`, never `advance()`, so
the button stays the only way to change screen. Two author modes come first. In staging the arrows nudge the
selected figure, and with nothing selected they do nothing, because while you are placing figures
the story must hold still — the same reason a drag is not a click. With the developer panel open
the verticals belong to its list and the horizontals to the story, `→` changing screen at the end
of a scene and `←` stepping back one: the whole app can be walked without leaving the arrows.

The cast page is the one place where back does something: `←` / `↑` call `scorriScheda(-1)` and
page back through the portraits. Leafing through a cast list is not rewinding the story — nothing
is revealed there, so nothing is taken back.

`scrollCard()` finds the current card as **the one whose top is nearest the stage's**, and that
wording is load-bearing. Dividing `scrollTop` by `clientHeight` broke first: on a phone a card is
taller than a screen. Taking "the last card starting above the edge" broke next: the last card
sits a few pixels below it, because there is no scroll left to bring it up, so the page never
declared itself finished and the button stopped working. Nearest survives both.

**A new screen starts at the top.** `goTo()` sets `stage.scrollTop = 0` and scrolls the document
too. Replacing the markup usually resets it by itself, which is why this went unnoticed for
weeks — but not always: the cast page's scroll-snap re-anchors on its own, and on a phone the
whole document can sit below the address bar. The overlay gets the same treatment when it opens.

**A screen that asks for a choice cannot be left by clicking.** Everywhere else the stage is the
remote, but on the clue table a stray tap would end the investigation with a question unspent,
and on a quiz card it would skip the question. `NO_STAGE_CLICK` names those two screen types and the
click handler returns early for them, so not even a line-reveal fires there. Add a screen that
asks for a decision and its type belongs in that set.

With the developer panel open the verticals page through the screens, and the lit row scrolls
itself into view.

**The focus never lands on the destructive button.** `showOverlay()` focuses
`[data-close],#ov-no` — the way out, whichever it is. The solution's confirmations have no
`data-close` at all, because `Ritenta` does something rather than just closing; without `#ov-no`
in that selector the focus fell through to *Vedi la soluzione*, and a stray Enter ended the game.
The stub had to learn `focus()` to let `smoke.js` see which button got it.

**Every confirmation opens with the investigator.** `conferma(domanda, spiega, avanza, poi,
indietro)` puts `detective_riflessione` above the question — he is the one asking, and the pose
says so before the words do — then calls `slots(overlayEl)`, because the overlay lives outside
`#stage` and `render()`'s own `setupImageSlots()` never reaches it. `spiega` is optional now: two of the
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
used to need a page reload. That is what `confirmAction()`'s sixth argument is for: give the way out a
callback and it stops being a plain `data-close`. `confirmAndAdvance()` is where both this and the
clue table's confirmation hang, so a screen that must ask before leaving belongs there and
nowhere else. Because that callback removes `data-close`, `showOverlay()` focuses
`[data-close],#ov-no`: selecting only the former left both solution confirmations without an
initial keyboard focus. `smoke.js` exercises this exception through `askForSolution()`.

**Closing the investigation early asks first.** While `investigationComplete()` is false — both
objects chosen and every one of them questioned to the limit — `Chiudi l'indagine` opens a
confirmation instead of moving on. The wording is the investigator's, not the rulebook's: it
recaps the evening and asks whether you have enough, and it **never mentions the clues** or how
many questions are left, because that would be coaching. `Torna indietro` takes the focus; going
on has to be wanted. `showOverlay()` now fills the one overlay for both the commands window and
the confirmation.

`openClue(i)` is the single door: the click handler and the `1`–`4` keys both go through it,
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
31 August 2026; `detective_riflessione` stands **above** the recap, the pose where he
holds his chin while the case is handed over. He was beside it past 62rem until 1 September 2026,
which fitted six large lines but left the button hanging at mid height, far from the text it
follows; the column puts figure, text and button in that order at every width. On the four
screens he carries alone — avviso, recap, verdict, ending — he was **doubled** on request the
same day: 76vh on the recap, 72 on the avviso, 64 on the other two, each with the width cap
doubled to match. At 1280×800 that costs the fold — the stage scrolls by 30 to 78px and the
button sits just under it. The trade was asked for with the figures on the table; the smaller
caps are one number each if it is ever wanted back. The `v` panel's row for the recap reads
**Il detective**, the same name the audience sees. `detective_osservazione`, lens in hand, opens the clue table beside its title. `detective_presentazione` carries the **avviso**, the screen added on
1 September 2026 between the cover and the cast: the disclaimer used to sit under the cover
image, where nobody read it, and now it has a page of its own with the investigator above it —
the same `.narr-fine` column as the recap, plus an `.avviso` class carrying its two differences:
a service body instead of a narrated one, and text ranged left, because a paragraph of six lines
centred reads as a poem. The text itself is untouched, so `copione.txt` does not move: it comes
from `STORY.disclaimer` either way. `detective_scoperta`, finger raised, carries the **last
screen**; all five are hooked, and `sync-assets.py` reports nothing unused. Two files that were
left over went to `trash/immagini/`: `attore_augusto_spiegazione.png`, a good pose no scene ever
selected in its `cast`, and `quadro_oliva.png`, the still the animated cover replaced. They are on disk, out of
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
**pose is half the verdict**, and `verdictPose()` picks it before a word is read —
`detective_soluzione` for the full ten, `detective_osservazione` when the name is right and the
reconstruction stands (6-9), `detective_riflessione` for everything else, the blank sheet
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
`sfondoDa:"indizio_foglio"` puts the 1:1 plate on the square stage with `cast:[]`. That is also
how *Gli indizi sul tavolo* gets its artwork: its first two parts use the isolated bottiglietta
and bicchiere plates, and its last part deliberately returns to `scena2`. The rejected aggregate
`scena5.png` is not an asset slot any more and must not appear in `SLOT_SOURCES` or `EXPECTED_ASSETS`. The pose
key is the semantic `slot:"indagine"`; the preceding parts use `scena3_brindisi` and
`scena3_malore`,
so no pose key masquerades as an unused background filename.

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

*Il brindisi* is `slot:"scena3_brindisi"` — so the `-brindisi` cutouts apply — with `sfondoDa:"scena1"`,
so it plays in the opening scene's hall. A table belongs to a room, not to a scene number, which
is why `primo` follows `backgroundSlot()`. Both parts of scene 3 borrow that hall: it is the only way
they can share the two foreground tables, which exist solely as `scena1_sx/dx`. `sfondoDa` also
takes a plain file stem, which is how four screens show a clue plate instead of a room.

Neither `scena3_back_brindisi.png` nor `scena3_back_malore.png` is embedded: nothing draws them, so
`sync-assets.py` skips them — see `EXCLUDED_ASSETS`. The `.png` stay in `assets/images/`, so
giving a scene its own room again costs one line and a re-sync.

## Poses

Each actor in `STORY.scene[].cast[]` may carry `posa`; `actorImage(c, scena)` builds
`attore_<nome>_<posa>.png`. Names are semantic, never versions: `giuseppe_malore`,
`rosalia_allarmata`, `mauro_guardingo`, `roberto_accoglienza`, `giuseppe_presentazione`.
`sync-assets.py` derives its pose inventory from those same fields, so a new pose needs one edit.
A character with no pose for that scene falls back to the
neutral cutout, and a missing file falls back like any other image — so a half-delivered set
never breaks a scene. The malore — scene 3's second part, casella `scena3_malore` — is where they earn
their keep: the whole cast reacts at once.

## How a scene is composed

Three layers inside `.palco`, all positioned in percentages of the frame:

1. `scenaN.png` — background, foreground deliberately left clear. `brindisi_v2` once arrived
   with all five characters painted in, which showed everyone twice; the fix was a clean
   redelivery, not code. If a background comes back populated, say so and ask for the empty
   room.
2. `attore_*.png` — one transparent cutout per character, from `STORY.scene[i].cast`:
   `x` (centre), `b` (height above the floor), `h` (figure height). **Height carries the depth** —
   never width. Array order is the stacking order: farthest first.
3. `scenaN_sx.png` / `scenaN_dx.png` — foreground props, from `STORY.scene[i].primo`. Optional.

Actors and props sit on **one** stacking scale, not two: actors default to `z-index:1` and props
to `5`, and an optional `z` on either entry overrides that. Scene 1 uses all three levels: the
left table stays at `5`, Roberto is `z:6` so his arm passes in front of it, and the right table
is `z:7` because it stands nearer the camera than he does. In staging mode `[` / `]` swap places inside the
element's own list, and at the end of that list they cross the other plane instead of stopping.
This is the only `z-index` anyone may set on the stage; `.attivo` still must not have one.

**Positions are decided by eye, not by guessing numbers.** Press `r` on a scene for staging mode:
drag to move, wheel or `+`/`-` to resize, arrows for fine steps. The panel prints the `cast:` and
`primo:` lines to paste back into `STORY`. Changes live only in the open page.

**The stage is clipped 10% top and bottom, on every screen**: ceiling above the figures, empty
floor below. It was made phone-only for one afternoon on 3 September 2026 and put back the same
day — the scene is framed the way it is framed, and it must not change shot with the device. Do not cut it by moving the *background*: drawing it taller and pushing it up
zooms the picture and eats the sides, and was rejected on sight. It is the **frame** that
shrinks, not the image. `.palco` keeps `aspect-ratio:1` and every coordinate keeps its meaning; `clip-path:inset(10% 0
10% 0)` simply hides the two bands. No zoom, no lost sides, and the staging that was already
decided stays valid to the millimetre. What the bottom band costs is real: a figure standing at
`b:0` loses its feet, and so do the foreground tables, which are anchored to the bottom corners.
The staging badge moves down by the same 10%, or the clip would swallow it.

**Every stage is square.** Scene 2's three parts carried `formato:"16 / 9"` and read as a strip
next to the others; the field and the `--formato` variable were removed on 28 August 2026 and
`.palco` is `aspect-ratio:1` outright. A 16:9 background is cropped left and right by
`object-fit:cover`, so a wide plate loses its edges — that is the trade, and the answer is to
re-stage the figures with `r`, never to give one screen its own shape.

**Never size the stage in `vh`.** The rows are declared — `54% / 46%`, and `64% / 36%` past
701px, because a big screen can spare it and a phone cannot — and the stage takes the height left
under the title, so it is the largest square that fits. That is why the header losing 64px gave
the stage 64px, and why raising the row is the only way to enlarge the picture. Sized in `vh` it grew past
its own half on phones, got clipped, and read as if the picture were zoomed in — that bug came
back once already.

A percentage `max-height` needs a definite height on the container, or it is ignored and the
figure spills out of its half.

## Voices

Each character is a synth profile in `VOICE` — waveform, pitch, blip rate, note length, pitch
drift across the line, lowpass cutoff and its own `vol` — so they are told apart by timbre, not
only pitch. Square and sawtooth carry far more energy than sine at the same number, which is
what the per-voice volume is for. Muted with `m` or the pill next to `?`.

The investigator has no profile at all, and `playVoice()` returns early without one — that early return
is the whole implementation of "l'investigatore non ha voce". Only `advance()` speaks, so stepping
back through a scene is silent on purpose.

**Whoever speaks now silences whoever spoke before.** A line's blips are all scheduled up front,
so stopping is not a matter of not making more: each line goes through a gain node of its own —
`bocca` — and `playVoice()` closes the previous one before opening its. The oscillators keep running
to their scheduled end, but disconnected they are silent. Stopping them instead would mean
calling `stop()` on nodes that may not have started, which throws. Setting the volume to zero
closes it too, otherwise a line already in flight kept talking after the silence.

The audio context starts suspended and `resume()` is async: schedule the blips **after** it has
started, or they land in the past and nothing plays. The two unlock listeners are `{once: true}`
— one gesture is all they are for — and every line builds its own lowpass filter, so the last
oscillator disconnects it on `ended` or the graph grows a node per line for the whole evening.
`smoke.js` checks that `filtro.disconnect()` is present in **both** copies of the engine, this
file and `voci.html`. The pointer and keyboard unlock listeners
are one-shot: after the first gesture, checking the context on every interaction is dead work.
Each line shares one low-pass filter, and the last oscillator disconnects it on `ended`; leaving
that filter connected to `audio.destination` retained an audio node for every spoken line. Keep
the same cleanup in the deliberately duplicated engine in `voci.html`.

## Images pipeline

`python3 sync-assets.py` then `node smoke.js`, in that order, after every delivery: the sync
keeps the newest `_vN` per slot, makes a web-sized WebP and rewrites `assets/assets.js`.
The map was moved out of `oliva-blu.html` on 4 September 2026 after the single-file requirement
was removed. The HTML fell from about 3.8MB to about 110KB; the generated asset file carries the
image payload and must be deployed with it.

`asset-inventory.js` is the bridge from the app to Python. It loads the real `STORY` with
`stub-dom.js` and prints JSON; `sync-assets.py` invokes it with Node. Do not replace this with
regular expressions over the HTML: whitespace or property-order changes must not alter the
inventory. The Python entry point is guarded, so importing it is read-only.

All source filenames use underscores, including the `_vN` version suffix. Backgrounds follow `scenaX_back_nome`; scene-bound foregrounds use
`scenaX_foreground_nome`, and the cover uses `copertina_nome`. Actors and clue plates keep their
reusable family prefix. `SLOT_SOURCES` declares which source fills which slot (`scena1.png ←
scena1_back_sala2`, `copertina.png ← copertina_quadro_oliva_animato`); when a scene silently falls back to its text brief, that map is the first
thing to check. Anything outside the expected slots is skipped, and the script prints what is
still missing.

`EXPECTED_ASSETS` starts from `set(SLOT_SOURCES)`, not from a numeric range of hypothetical scene layers: only
slots the app maps can be embedded. `sync-assets.py` exits immediately if a source filename
contains `-`, so the underscore-only contract cannot regress silently.

Animated files (the cover is a 21-frame WebP) are resized frame by frame and re-saved with
`save_all`; a plain re-encode keeps one frame and silently kills the animation.

Actor and prop cutouts are cropped with `clean_bbox()`, not `getbbox()`: it keeps only the
densest band of rows and columns. The `-brindisi` set arrived with a two-pixel guide line down
the right edge of the canvas — opaque enough that no alpha threshold could tell it from the
drawing — and `getbbox()` dutifully kept the whole canvas, so the figures came out small and
off-centre with a visible dashed edge. The trade: an element genuinely detached from the figure
would be dropped. Delete the stale `assets/web/*.webp` before re-syncing when the crop changes,
or the cache hands back the old cut.

Already-converted files are reused from `assets/web/` when the copy is newer than the source —
without that, every run re-encoded the cover's 21 frames. Stills are saved with `method=4`: `6`
exhausted memory on the square RGBA clue plates and buys nothing at these sizes.

`IMAGE_WIDTHS["scena"]` is **1200**, down from 1600 the same day: at 1920×1080 the stage is a square of
about 390 CSS px, so 1600 was four times what any screen asks for. 1200 keeps 3× of headroom
there and is still 1:1 on a 4K panel; measured across the whole stage the difference is 3.75 of
765. The other widths are already right — the card portrait can reach ~600px on a 1080 screen,
which at 2× is more than the 900 it is generated at.

Their quality is **80**, lowered from 86 on 2 September 2026: on a portrait crop at 1:1 the mean
difference is 9 of 765 and the largest 64 — invisible on this kind of painted art. The combined
HTML plus generated asset payload remains just under 4MB, while the HTML shell itself is about
110KB. Do not go lower without looking: at 74 the saving is another
20% and the brush texture starts to flatten. The cache in `assets/web/` is keyed by mtime, so
**delete it before re-syncing** when the quality changes, or the old encodes come straight back.

## Deliberate omissions

No player devices, no sync, no score persistence and no framework. The image synchronizer is the
only generation step; there is no application bundler.

## Consistency audit — 4 September 2026

The cross-file audit removed eight drift points:

- author gates now use the `file:` protocol, so every HTTP/HTTPS host is public;
- `voci.html` now interrupts the previous utterance and routes each line through the same
  per-utterance gain and filter cleanup used by the app;
- `smoke.js` compares the ordered dialogue arrays from `STORY` and `copione.txt` in both
  directions, rather than searching for fragments anywhere in the HTML;
- each clue owns its stable `id`, and `clueImage()` no longer depends on array position;
- each staged actor owns its optional `posa`; the old parallel `ACTOR_POSES` table is gone;
- `sync-assets.py` derives people, poses and clue IDs from `STORY`, eliminating two manually
  duplicated inventories;
- with the developer panel open, up/down now move by the grouped rows shown in the panel,
  while left/right traverse individual screens and lines as the help says;
- the cover uses the normal local/embedded lookup and explicitly falls back to scene 1 only
  after a real load failure. The stale investigation comment now says two people per clue.

The smoke suite also guards a custom HTTPS domain and the shared audio routing primitives, so
the two highest-risk inconsistencies cannot silently return.

**What the split costs, and the net under it.** The app now needs two files, and one place
cannot have two: **the published artifact is a single HTML page**, so `<script src>` finds
nothing there. `assetSource()` therefore reads
`const IMAGES = typeof ASSETS === "undefined" ? {} : ASSETS` — `typeof` is the only way to ask
after a name that may never have been declared — and every slot falls back to its typographic
placeholder. Without that line the first image threw `ReferenceError` and the render stopped: the
screen stayed black, 99.7% background, story and all. `smoke.js` now opens the app with the
external scripts left out and asserts both halves of the promise: `IMAGES` is empty, and the
stage still draws. This is not hypothetical: the artifact published on 4 September 2026 runs the
whole story with **no illustrations at all** — placeholders in every slot — and that is the
standing cost of the split. Whoever publishes it should know, and if the preview is meant to look
like the finished thing, the images have to come back inside the file.

## Modularisation and English naming — current status

The single-file constraint was explicitly removed on 4 September 2026. The first modularisation
step is complete: image data now lives in `assets/assets.js`, while `oliva-blu.html` retains the
story, CSS and application runtime. `stub-dom.js`, `smoke.js`, `dom.js` and
`estrai-copione.js` continue to evaluate the same application and now follow external scripts.
The before/after output from `dom.js` was identical, and `smoke.js` still reports 20 screens and
76 dialogue lines.

The executable API and maintained helper names are now English across the application, voice
bench, Node tools, mobile audits and Python image pipeline. Italian UI copy, character names and
domain fields inside `STORY` remain Italian content by design. The refactor also renamed the
author-mode state to `directorMode` and `developmentMode`, avoiding the earlier collision between
state fields and toggle functions.

`smoke.js` caches the HTML sources once and tests Web Audio behavior with a fake audio graph:
speaking twice must disconnect the first line's gain, the filter must feed that gain, and the
filter must disconnect when its final oscillator ends. Source-fragment checks are no longer the
audio contract. `ACTOR_POSES` caches scene pose lookup, while `createDemoLayer()` deduplicates
posed silhouettes before filling the layer.

The accepted baseline is `/tmp/oliva_blu_before_refactor.txt` during the refactor session. A fresh
`node dom.js` output compared byte-for-byte equal after modularisation and renaming; future work
must create its own baseline because files under `/tmp` are not persistent.
