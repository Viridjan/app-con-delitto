# Design and narrative reference

Detailed maintenance constraints and the reasons behind them. For contributor commands
and repository rules, see [CLAUDE.md](../CLAUDE.md); for playing, see [README.md](../README.md).
Historical function names in the rationale may predate the English naming refactor.

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
  taught stays. As the window narrows the steps **merge**, which is fine; they must never swap.
  The phone query no longer overrides a selector's size at all — `:root{font-size:112%}`, and the
  speaker glyph on the volume control, which is an icon and not text; see *Type and the phone*. It used to carry fourteen hand-tuned literals, and five
  of the merges they produced were asked for one by one on 2 September 2026; the whole pile went
  the same day the `<meta viewport>` landed and the text came out enormous on a real device.
  Re-measured on 4 September 2026 with `censimento.js` across all twenty screens, at 390px the
  count is **five**, the same five: 46.6 / 28.7 / 24.6 / 20 / 15.7. The inversion recorded here —
  a character's description larger than the name above it — went with the literals: the name now
  reads 28.7 against the description's 20.
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
  772KB of it, because both its parts borrow scene 1's hall through `sfondoDa`. `attore_rosalia.png`
  and `attore_mauro.png` followed, another 144KB: those two have a pose in every scene, so their
  neutral cutout was never asked for. `EXCLUDED_ASSETS` now holds only those two names, because
  they are generated from `CHARACTERS` and never had a file of their own; everything with a file
  behind it that fills no slot has left `assets/images/` — see *Nothing unused stays in the source
  folder*. That is a bet on the poses in `scene[].cast[]`,
  so `smoke.js` now resolves every figure of every scene through `actorImage()` and fails unless it
  lands on an embedded image; proven by taking Mauro's pose out of scene 1 and watching it name
  both parts. Giuseppe, Roberto and Augusto keep their neutral cutouts, because those three do
  fall back. Six megabytes became five.
- **One name, one shape: underscores, everywhere.** Source files, `ASSETS` keys, `SLOT_SOURCES`,
  pose fields, the generated asset inventory and the `assets/web/` cache all use `nome_con_underscore`; hyphens are
  gone from the whole chain. `smoke.js` fails on the first `ASSETS` key that contains one, which
  is what keeps the two halves of the pipeline from drifting apart again.
- **Slots are named for what they show**, not for a number: `scena3_brindisi`, `scena3_malore`,
  `indagine`. They used to be `scena3`, `scena4`, `scena5`, which meant a semantic slot looked
  exactly like a background filename that nobody delivered — `scena5.png` sat on the pipeline's
  missing list for days because of it. `smoke.js` asserts the three semantic slots exist.
- **`document.querySelector` is not used anywhere.** Inside the stage nothing needs it — the
  markup is rewritten every render; outside it, the two panels are held by reference. If a new
  one appears, ask what it is standing in for.
- **A rename is not a search and replace.** The English-naming pass turned `src` into
  `assetSource` everywhere it appeared — including `im.src = ripiego`, the line that actually
  loads a fallback image, which became a JS property nothing reads: the cover's fall back to
  scene 1's hall silently stopped working. Codex found it on 4 September 2026 and `smoke.js` now
  drives `setupImageSlots()` with a fake image through both failures, the fallback and the give-up.
  The same pass also left English words inside Italian comments (`viaggiano start l'HTML`).
  After a rename, read the diff — the compiler cannot tell a property from a prose word.
- **Nothing semantic is derived from the array index.** `sceneNumber(sc, k)` gives the number the audience reads,
  `sceneSlot(i)` the artwork slot, `backgroundSlot(i)` the room. Index-derived names had leaked into the
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
(`attore_*.png`, not the portrait) cropped head to waist, faded out at the bottom — and the
dialogue column. The figure is sized **on its height**, `height:265%` of the frame, anchored at
the top, whatever leaves the sides clipped by the container's `overflow:hidden`; the fade lives
on `.parlante`, not on the image, or it would fall outside the visible band. It was a 3:4 box
with `object-fit:cover` until 4 September 2026, which took the scale from the *width* — and
since every cutout is narrower than 3:4, how much a figure was enlarged depended on how wide the
pose is. `clean_bbox()` crops tight to the drawing, so `roberto_accoglienza` (642×900, arms
open) came out a whole tiny figure where `mauro_guardingo` (229×900) was already a bust. Same
rule, different silhouette. Sizing on the height gives every character the same body scale, and
costs Roberto his hands at the edges. Use `1fr`, not a second percentage: two fixed
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
  enormous, the user said so, and the pile of literals went — the only `font-size` left inside the
  query is the volume control's speaker glyph. At 390px the steps read
  46.6 / 28.7 / 24.6 / 20 / 15.7, against 88 / 38 / 27.2 / 22 / 14 on a big screen: the same five,
  a little closer together. Re-measured 4 September 2026, both widths.
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

**The three inconsistencies are resolved**, 4 September 2026, on the user's «risolvi tutto».
They had stood as open questions because cutting or rewording is a product decision; the decision
was given, and none of the three touched a line of Gervasio's — the quiz is ours from 30 August,
the agronomy exchange ours from 2 September, and a clue card's `tag` was never in the txt at all.

1. **The note had two texts.** Mauro reads «Zio, ti prego: non fare la donazione. Quei beni fanno
   parte della nostra eredità», while the biglietto card quoted «Fermate Giuseppe prima che doni
   tutto» — plural, addressed to a room, and it made Rosalia sound like she was organising
   something. The card now quotes the note Mauro actually reads: «Zio, ti prego: non fare la
   donazione». One text, one note.
2. **Quiz 5 asked about the glass and the scene answered about the bottle.** Roberto's «Questa non
   è una bevanda. È un prodotto per le piante» is said over the *bottiglietta* plate, so the
   question now asks «Chi ha riconosciuto che nella **bottiglietta** non c'era una bevanda?». The
   answer, the weight and the column are unchanged. The quiz lives in `copione.txt`, so this one
   moved in both files — `estrai-copione.js` after the edit, not before.
3. **Scene 1 concluded before it explained.** Giuseppe's «Quindi nessun metodo significa trattare
   alla cieca» sat above the three descriptions instead of below them. It moved after Roberto's
   line on conventional growing, so the exchange now runs: the three methods named, each one
   described, then Giuseppe drawing the conclusion and «Interessante!». Those three Giuseppe lines
   are consecutive and collapse into one bubble, which is what `groupLines()` is for.

Two spelling slips were fixed under the standing exception, in both files at once: `possibilitá`
→ `possibilità` and `é` → `è`.

**Rosalia's «…» opening scene 4's third part is deliberate** — asked on 4 September 2026, answered
«la scena 4 é ok». That screen opens on a bubble holding three dots, because a scene opens with
its first line already revealed, and it costs a click to reach her real line. That is the beat.
Do not raise it again, and do not cut it.

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

