# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

For the player guide and rights, see [README.md](README.md).

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
python3 sync-assets.py --file-unico   # e in piu' la copia a pagina sola, per l'artefatto

# la leggibilita' da telefono: l'app dentro una cornice da 390px, e il referto nel titolo
chromium --headless --allow-file-access-from-files --dump-dom \
  "file://$PWD/telaio-390.html?p=copia-con-audit-mobile.html"
```

`censimento.js` non si lancia: si incolla in coda allo `<script>` di una copia dell'app e stampa
quante misure e quanti stili di testo arrivano davvero sullo schermo. Cinque misure, su schermo grande e da telefono: se il conto sale, un gradino nuovo è entrato di nascosto.

Non c'e' watcher e non serve un server: `oliva-blu.html` si apre da disco insieme alla cartella
`assets/`. `sync-assets.py` è l'unico passaggio di generazione. `smoke.js` runs the complete suite in less than a second; keep the suite intact.

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
  `trash/immagini/`, superseded working texts in `trash/documenti/`. It holds the former
  `copione-v2.txt`, everything previously kept in `assets/images/bocciate/`, and — since
  4 September 2026 — everything the pipeline does not pick: twenty-two superseded deliveries plus
  the two scene-3 rooms nothing draws, 28MB, taking `assets/images/` from 99MB to 71MB with the
  generated `assets.js` byte-for-byte unchanged. See *Nothing unused stays in the source folder*.
  Nothing in this folder is read by the app or its build scripts.
  Watch one name collision when trashing: a slot's first delivery is called after the slot itself
  (`attore_mauro_guardingo.png` fills `attore_mauro_guardingo.png`), so it reads like the live
  file when it is only version one. `img/ART.md` names slots, not deliveries, so moving a v1 does
  not stale the brief.

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

**Scene titles stay off public copies.** `TITLES_ENABLED` is true only on an author surface:
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
the local file and the allow-listed Claude artifact hosts; they stay disabled on public hosts.
The help overlay lists only the keys that actually work where it is running. `smoke.js` runs the
app as a local file, on both artifact host families, on GitHub Pages and on a custom HTTPS domain,
and fails if a gate leaks.

**Images must be optional.** Every slot falls back to a typographic placeholder via `setupImageSlots()` on
`error`. The app must look finished with `assets/images/` empty.

**`d` is a veil, not a substitution.** `DEMO_LAYER` holds one silhouette per slot the demo covers —
every background, every foreground prop, every neutral cutout, every pose — and `assetSource()` reads it first while
`state.demo` is on. It is deliberately lazy: `createDemoLayer()` runs only on the first `d`, not during
normal startup, and reuses one encoded SVG per character across all that character's poses.
`ASSETS` is never touched, so turning the demo off restores
nothing because nothing was taken. It used to write into `ASSETS` and, on the way out, `delete`
the keys: pressing `d` twice **destroyed the real embedded images** until the page was reloaded.
Codex found that and fixed it with a backup map on 2 September 2026; the veil removes the whole
class instead. One consequence to know: `assetSource()` now reads `state`, so anything calling it at load
time must be lazy — `coverImage` became a function for exactly that reason. The props joined the
veil on 4 September 2026: scene 1's two painted tables stayed in front of the silhouettes, and
they are the thing that covers the most — judging positions with those on top was pointless.
`smoke.js` now walks every scene with the demo on and fails on the first `src` that is not an
SVG silhouette.

**Nothing unused stays in the source folder.** From 4 September 2026 `assets/images/` holds
exactly the files the pipeline picks — 40 of them, 71MB, one per slot — and nothing else. A
superseded delivery, a background no screen draws, a pose no `cast` selects: all of it goes to
`trash/immagini/`, which is local and gitignored. The check is one line, and it must come back
empty: `comm -23 <(ls assets/images/ | sort) <(python3 sync-assets.py | grep -oP '^\S+\.(png|webp)' | sort -u)`.
Trash it, never delete it — the version numbers have to stay spoken for, or the next delivery
gets called `_v3` after a `_v3` that was already rejected.

**Image revisions must always be versioned.** Never overwrite an existing image, including
newly generated assets that have not been committed yet. Keep the original filename unchanged
and save every revision with the next available numeric suffix (`_v2`, `_v3`, …). Version
numbers already used anywhere, including rejected files in `trash/immagini/`, must not be reused. A new
semantic pose may start with a new descriptive filename, but later changes to that pose must
still use numeric version suffixes.

## Detailed design reference

Read [docs/design-reference.md](docs/design-reference.md) before changing layout, typography,
narrative structure or investigation behaviour. It owns the house style, scene screen,
phone typography, departures from the PDF, investigation implementation and running order.

## Screens vs scenes

One scene is several screens: `n` is the number the audience reads, `parte` the sub-label,
`slot` the artwork casella. Scene 2 is four screens all labelled "Scena 2 di 4"; scene 4 is
three. **Nothing may be derived from the array index** — splitting a scene would shift every
later scene's artwork, and index-derived names have already leaked twice (the background's `alt`,
and `demo()`).

Three fields decide what a screen shows, and they are deliberately independent:

| field | what it moves | resolved by |
|---|---|---|
| `slot` | the poses, and the casella name | `sceneSlot(i)` |
| `sfondoDa` | the room: background **and** its `primo` props | `backgroundSlot(i)` |
| `sfondo:{scala,fx,fy}` | the zoom and focus of that background | inline transform |

*Il brindisi* is `slot:"scena3_brindisi"` — so the `-brindisi` cutouts apply — with `sfondoDa:"scena1"`,
so it plays in the opening scene's hall. A table belongs to a room, not to a scene number, which
is why `primo` follows `backgroundSlot()`. Both parts of scene 3 borrow that hall: it is the only way
they can share the two foreground tables, which exist solely as `scena1_sx/dx`. `sfondoDa` also
takes a plain file stem, which is how four screens show a clue plate instead of a room.

Neither `scena3_back_brindisi.png` nor `scena3_back_malore.png` is embedded: nothing draws them.
Since 4 September 2026 they are not in `assets/images/` either — they are in `trash/immagini/`.
Giving that scene a room of its own again means moving the `.png` back, dropping `sfondoDa` from
the screen, and re-syncing.

## Poses

Each actor in `STORY.scene[].cast[]` may carry `posa`; `actorImage(c, scena)` builds
`attore_<nome>_<posa>.png`. Names are semantic, never versions: `giuseppe_malore`,
`rosalia_allarmata`, `mauro_guardingo`, `roberto_accoglienza`, `giuseppe_presentazione`.
`sync-assets.py` derives its pose inventory from those same fields, so a new pose needs one edit.
A character with no pose for that scene falls back to the
neutral cutout, and a missing file falls back like any other image — so a half-delivered set
never breaks a scene.

**The parts of a scene share their poses.** `ACTOR_POSES` is built per screen but merged across
every screen with the same `n`, the screen's own `cast` last so it always wins. That matters
because four screens have `cast:[]` — the stage is a clue plate — while two characters still
speak on them, and the figure beside the bubble is `actorImage(chi parla, i)`. Scene 1's second
part asked for `attore_mauro.png` and `attore_rosalia.png`, neutral cutouts binned on the day
every scene got a pose, and the reader saw a `?` where Mauro should be. Merging gives it the
`guardingo` and `pensierosa` of the same conversation. `smoke.js` now walks the **speakers** as
well as the cast: checking `cast` alone is exactly what let this through. The malore — scene 3's second part, casella `scena3_malore` — is where they earn
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
what the per-voice volume is for. The volume control and `m` manage muting.

The investigator has no profile; `playVoice()` returns early without one. Only `advance()` speaks, so stepping
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
would be dropped. When this algorithm changes, increase `CACHE_VERSION`; the next sync then
rebuilds every derived image.

Already-converted files are reused from `assets/web/` only when the cache manifest matches the
selected source name, timestamp, size and pipeline version — without that, every run re-encoded
the cover's 21 frames. Stills are saved with `method=4`: `6`
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
20% and the brush texture starts to flatten. Increase `CACHE_VERSION` when quality or other
encoding parameters change.

## Deliberate omissions

No player devices, no sync, no score persistence and no framework. The image synchronizer is the
only generation step; there is no application bundler.

## Documentation ownership

- [README.md](README.md): audience-facing introduction, starting the app, gameplay,
  performance controls and rights. Link there instead of repeating the user guide here.
- This file: contributor commands, architecture, asset pipeline and maintenance guard rails.
- [Design reference](docs/design-reference.md): detailed layout and narrative constraints.
- Historical audits (evidence, not current instructions):
  [consistency](docs/audit-consistency-2026-09-04.md),
  [modularisation](docs/audit-modularisation-2026-09-04.md),
  [post-fix audit](docs/audit-fixes-2026-09-04.md).

## Distribution

`main` serves Pages from the repository root. Keep `assets/assets.js` tracked: it is
part of the deployed app, even though it is generated, and a fresh clone runs the app and the
smoke tests with nothing else. `assets/web/` is local, ignored and genuinely regenerable — it is
a cache of WebP encodes.

**`assets/images/` is not.** It is ignored too, from 7 September 2026, but those files are Codex's
original deliveries: nothing regenerates them, and once they are out of git the only copy is the
working disk. Everything downstream — a different width, a different quality, a re-crop, the
version numbers that may never be reused — needs them. Back them up somewhere durable before
relying on that, and treat losing them as losing the artwork.

Running the sync with an incomplete `assets/images/` used to be a one-command way to destroy the
deployed illustrations: with one source out of forty, `assets/assets.js` fell from 3753KB to 46KB
and the script exited happy — only `smoke.js` noticed, and only if someone ran it. Since
7 September the script refuses instead: it reads the slots already in the map and stops if the
new one would lose any, naming them. `--sostituisci` is the way through when a removal is meant.
An absent `assets/images/` was already handled — the script exits on `manca assets/images/`.

**The single page is a build target, not a branch.** The published artifact is one HTML page —
`<script src>` finds nothing there — so from `main` it runs the whole story with a typographic
placeholder in every slot. `python3 sync-assets.py --file-unico` writes `oliva-blu-completo.html`
beside the app: the same document with the `const ASSETS = {…}` block inlined, about 3.9MB, which
opens from an empty folder with every illustration in place. **That is the file to publish as the
artifact.** It is gitignored and disposable; regenerate it, never edit it.

The generator checks its own output where the data is in hand — no `<script src`, and exactly as
many data URIs as slots — and `smoke.js` checks the copy for staleness whenever it exists,
comparing everything but the asset block against `oliva-blu.html`. Publishing yesterday's copy is
the silent failure this guards.

A branch called `file-unico` did this job from 5 to 7 September 2026 (`b5c94fc`, never pushed).
It cost two copies of the documentation, a `cherry-pick` for every fix, and — because it kept all
40 source images reachable — it made the history cleanup pointless: `.git` stayed at 347MB. Fifty
lines of real divergence are a flag, not a branch. Do not recreate it.
The audio engines in the app and `voci.html` are deliberately duplicated. This cleanup
must not modify either engine. Do not introduce a build step, bundler or dependency.

## Continuous integration

One workflow, `.github/workflows/smoke.yml`, runs `node smoke.js` on pushes and pull requests.
There is no install or build step. Run that same command after each maintenance task.

## History maintenance

[History cleanup](docs/history-rewrite.md) owns the backup, isolated filter-repo preparation,
verification and human adoption gate. It was written while `file-unico` existed and still protects
that ref; with the branch gone there is a single history to filter, and its `--refs
refs/heads/main` clause plus the file-unico assertions have no target left. Re-read the tool
before running it. Never force-push without deciding it in the open: the images leave git with
this cleanup, and after it the only copy of Codex's originals is the working disk.
