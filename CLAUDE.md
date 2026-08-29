# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A presenter webapp for *Il mistero dell'oliva blu*, an Italian "cena con delitto" script by
Carlo Maria Gervasio (`ullgi_L-inaugurazione_COSTA_rev.pdf`), used with the author's permission.
A narrator drives it live in front of a table of players.

- Public site: https://viridjan.github.io/app-con-delitto/ (Pages builds from `main`, root)
- Artifact (private preview): https://claude.ai/code/artifact/ae31691c-accf-409e-bf55-64800d0de882
- Repo: https://github.com/Viridjan/app-con-delitto

## Files

- `oliva-blu.html` — the whole app. One self-contained file: `<style>`, `const STORY`, `<script>`.
  No build, no dependencies, no server. Images are embedded as data URIs.
- `index.html` — redirect for Pages, which serves `index.html` at the root.
- `sync-assets.py` — hooks Codex's deliveries into the app. Run after every delivery.
- `smoke.js` — `node smoke.js`. Walks every screen with a hand-rolled DOM stub and checks the
  quiz maths. Run it after touching the script block.
- `voci.html` — the voice bench: sliders per character, plays them, prints the `VOCE` block to
  paste into the app. Its synth engine is a **deliberate copy** — change it in both files.
- `copione.txt` — the approved script. The verbatim reference; `smoke.js` checks the app against
  it. Regenerate with `node estrai-copione.js` after any agreed change to the text.
- `estrai-copione.js` — writes `copione.txt` out of `STORY`, so the two can never drift.
- `img/ART.md` — the illustration brief Codex works from.
- `assets/images/` — Codex's deliveries, named by subject (`donazione`, `brindisi`, `malore`,
  `indagine`, `sala2`), mapped to slots in `SCELTE`. `assets/web/` and `assets/images/bocciate/`
  are gitignored.

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

**Blue is spent once.** `--blu` is Mauro's speech colour and the vignette over the malore screen
— because the victim's mouth turns blue. Never use it for anything else. The vignette is driven
by `blu:true` on the scene and now opens on its **first** line (`state.step >= 1`), not after the
last: the colour has to arrive with the collapse, not once it is over.

**Nothing but the dialogue on a scene screen.** The “Lo sapevi?” boxes went on 26 August 2026;
on 29 August 2026 the user cut the rest from `copione.txt` — every `descrizione` (art brief),
every `indizi` block, scene 4's “Osserva bene!” box, and the closing educational message. The
`s` and `i` keys are gone with them, `state` no longer carries `box`/`indizi`/`qa`, and the last
screen is just *Fine · Ricomincia*. Do not restore any of it from the PDF. The art briefs live on
for Codex in `img/ART.md`; the four clue objects and their table survive because they were never
part of the txt.

**No bottom bar.** The `← Indietro / Avanti →` footer was removed on 28 August 2026: the screen
itself is the remote. A click on the stage advances, a click inside its leftmost 10% goes back,
and the keyboard keeps `spazio` / `→` / `←`. `#app` is a single-row grid now — do not put the
bar back. Clicks on `[data-qa|clue|opt|go]` and inside an open `.detail` still do their own job
and never advance, and staging mode (`r`) suppresses the advance so a drag is not a click.

**Nobody gets dimmed on stage.** The speaker stands out by coming forward (lift, scale, shadow),
not by darkening the others — heavy dimming was tried and rejected. What is left is a light
touch, raised again on 29 August 2026 because the cast read too dark on a projector:
`brightness(.88)` at rest, `1.06` for whoever is speaking. Keep both ends bright; the gap
between them is what does the work, not the depth of the shadow.

**Author tools stay off the public site.** `PUBBLICO` near `const state` is true on
`*.github.io`, and both `REGIA_OK` and `DEV_OK` are its negation: `r` (staging) and `v` (the
developer panel — current screen and line, expected images that are not embedded, one button per
the screens listed one per row to jump anywhere in one click, and `tutte le battute` to reveal the open scene at once)
work from the local file and from the artifact, and do nothing on Pages. Gating the developer
panel to `file:` alone was wrong — the artifact is where the user actually works.
The help overlay lists only the keys that actually work where it is running. `smoke.js` runs the
app twice, once with `location.hostname` empty and once with `viridjan.github.io`, and fails if a
gate leaks.

**Images must be optional.** Every slot falls back to a typographic placeholder via `slots()` on
`error`. The app must look finished with `assets/images/` empty.

**Image revisions must always be versioned.** Never overwrite an existing image, including
newly generated assets that have not been committed yet. Keep the original filename unchanged
and save every revision with the next available numeric suffix (`-v2`, `-v3`, …). Version
numbers already used anywhere, including `assets/images/bocciate/`, must not be reused. A new
semantic pose may start with a new descriptive filename, but later changes to that pose must
still use numeric version suffixes.

## House style in `oliva-blu.html`

Normalised on 29 August 2026; keep it this way rather than adding a fourth way to do each thing.

- **Type is tokenised** like colour: `--serif`, `--sans`, `--mono` on `:root`. Nine literal font
  stacks in three different spellings were collapsed into these. Never write a family list again.
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
- **Nothing is derived from the array index.** `NUM(sc, k)` gives the number the audience reads,
  `CASELLA(i)` the artwork slot, `SFONDO(i)` the room. Index-derived names had leaked into the
  background's `alt` (it announced "Scena 12" on the screen titled *Scena 4 · terza parte*) and
  into `demo()`, which filled slots named `scena7.png` that nothing draws.

**Refactor with a snapshot, not by eye.** `dom.js` (`node dom.js prima.txt`) walks all 22 screens with the smoke
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
lines in full, joined by `<hr class="atto">`. Entering a new part therefore opens with the rule
at the top and nothing lit — `.bubble:first-child` matches no bubble while the current group is
empty, which is what leaves the whole backlog dimmed until someone speaks.

Consecutive lines by the same speaker share one bubble — `raggruppa()` collapses the run and
`bolla()` renders one `<p>` per line inside a single `.said`. A different `m` breaks the run: a
line said out loud and one said "tra sé" are two moments, not one speech.

Newest line on **top**, older ones below and dimmed to 40%; the column scrolls back to the top
on each new line. Keep the entrance animation on `:first-child` only — its final frame sets
opacity to 1 and would cancel the dimming of the rest.

Highlighting the speaker must **not** change the stacking order: no `z-index` on `.attivo`. The
depth is what the staging decided — including any explicit `z` in `cast` / `primo`.

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

## Where the app departs from the PDF

Audited against `pdftotext` on 27 August 2026 — 43 spoken lines in the original. The user then
rewrote part of scene 2 in `copione.txt` on 28 August 2026, so the count below is the state after
that edit:

- **Most lines identical.**
- **3 reworded** the same way: Rosalia says "zio Giuseppe" where the PDF has bare "zio", and the
  malore's art brief follows. She names the victim.
- **"signor De Robertis" became "signor Giuseppe"**, 29 August 2026, in Mauro's toast and in
  Roberto's added line. The surname survives only in the cast list.
- **17 lines added**, every one flagged `nuova:true` and marked `[aggiunta, non di Gervasio]` in
  the txt. Two in *La donazione* (28 August); then on 29 August a whole revision the user drafted
  as `copione-v2.txt`: Mauro's judgement of Giuseppe, the note found and read aloud and handed
  back, Augusto telling Mauro to put the bottle away — which is how the culprit gets the poison
  on stage — Giuseppe closing the door on Rosalia at the toast, and a third part for scene 1 that
  ends the evening. Of 53 spoken lines, 17 are not Gervasio's.
- ***Il racconto dell'olio* is the user's rewrite**, 28 August 2026: nine lines instead of six,
  Augusto and Roberto hand the explanation back and forth, and "Adoro l'Olo" became "Adoro
  l'Olio". Its "Indizi di gioco" block was dropped with it — that scene now has `indizi:{}` and
  `i` does nothing there.
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
  `smoke.js` now also fails if a clue card quotes a line nobody says any more — those `refs` are
  hand-copied and had already drifted twice.
- Nothing else is missing. Labels, the clue captions, the narrator's recap, the solution and the
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

## The running order, 29 August 2026

Four scenes, twelve scene screens, twenty-two in all:

```
copertina · personaggi
1  L'inaugurazione degli Oliviani   sala + il biglietto + sala
2  La donazione                     il foglio + sala + Il racconto dell'olio + La tensione
3  Il brindisi                      sala + Il malore dell'oliva blu
4  Gli indizi sul tavolo            la bottiglietta + il bicchiere + sala
tavolo degli indizi · narratore · quiz 1-4 · soluzione · fine
```

Twenty-two screens, twelve of them scenes. Scene 1's third part exists for one reason: without it
the biglietto plate and the foglio plate sat back to back, and two clue plates in a row read as
one screen that changed picture.

Four screens show a clue plate instead of a room: `sfondoDa` takes any file stem, so
`sfondoDa:"indizio-foglio"` puts the 1:1 plate on the square stage with `cast:[]`. That is also
how *Gli indizi sul tavolo* has any artwork at all — `indagine.png` was rejected and `scena5.png`
is missing, so the pipeline still reports it as undelivered.

## Screens vs scenes

A scene in the script can be split across two screens: `slot` says which image slot it draws
from, `n` the number shown to the audience, `parte` the sub-label. So *La donazione* and *Il
racconto dell'olio* are two screens both labelled "Scena 2 di 5" and both drawing `scena2.png`.
Never derive the image or the pose from the array index — splitting a scene would silently shift
every later scene's artwork.

`sfondoDa` lets a screen borrow another slot's room without giving up its own poses or props —
*Il brindisi* is `slot:"scena3"` (so the `-brindisi` cutouts apply) with `sfondoDa:"scena1"`, so
it plays in the hall of the opening scene. The room moves as a whole: the background **and** its `primo` props
resolve through `SFONDO()`, since a table belongs to the hall, not to the scene number. Poses
stay on `CASELLA()`. Both parts of scene 3 now borrow scene 1's hall — the toast and the collapse happen in the same
room, which is also the only way they can share the two foreground tables, since those exist
only as `scena1-sx/dx`. `scena3.png` and `scena4.png` are consequently embedded while nothing
draws them: about 580KB of dead weight, kept because the art is still moving.

`sfondo:{scala, fuoco}` zooms that screen's background (scene 2's first half is at 200% on the
left) without touching the actor coordinates.

Two lines in *La donazione* are **not Gervasio's** — added on the user's instruction, flagged
`nuova:true` in `STORY` and marked in `copione.txt`.

## Poses

`POSE_SCENA` maps slot → character → pose, and `ATTORE(c, scena)` builds
`attore-<nome>-<posa>.png`. Names are semantic, never versions: `giuseppe-malore`,
`rosalia-allarmata`, `mauro-guardingo`, `roberto-accoglienza`, `giuseppe-presentazione`. A new
pose needs two edits: the entry in `POSE_SCENA` **and** the name in `sync-assets.py`'s `POSE`
list, or the file Codex delivered is skipped and the scene quietly falls back to the neutral
cutout. A character with no pose for that scene falls back to the
neutral cutout, and a missing file falls back like any other image — so a half-delivered set
never breaks a scene. Scene 4 is where they earn their keep: the whole cast reacts.

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

## Voices

Each character is a synth profile in `VOCE` — waveform, pitch, blip rate, note length, pitch
drift across the line, lowpass cutoff and its own `vol` — so they are told apart by timbre, not
only pitch. Square and sawtooth carry far more energy than sine at the same number, which is
what the per-voice volume is for. Muted with `m` or the pill next to `?`.

The narrator has no bubbles: his two screens (recap and narrated solution) get their voice in
`vai()`, not in `avanti()`.

The audio context starts suspended and `resume()` is async: schedule the blips **after** it has
started, or they land in the past and nothing plays.

## Images pipeline

```sh
python3 sync-assets.py   # newest -vN per slot, web-sized WebP, embedded as data URIs
node smoke.js
```

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

## Deliberate omissions

No player devices, no sync, no score persistence, no framework, no build step.
