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
paraphrase or "fix" dialogue, including `Adoro l'Olo` in scene 2. Cutting or adding whole blocks
is a product decision that needs the user, and when one is agreed, `copione.txt` is updated in
the same commit — never left behind.

**Ask before pushing aesthetic changes.** The repo is public with Pages on `main`, so every push
goes live in a minute. Show the result (screenshot, or republish the artifact) and wait for a yes.
Bug fixes, scripts and docs follow normal behaviour.

**Blue is spent once.** `--blu` is Mauro's speech colour, the "Osserva bene!" box and the scene-4
vignette — because the victim's mouth turns blue. Never use it for anything else.

**No “Lo sapevi?” boxes.** They and their educational text were deliberately removed from scenes
1, 2, 3 and 5 on 26 August 2026. Do not restore them from the source PDF. Scene 4 keeps the
distinct “Osserva bene!” clue box, opened with `s`; it is part of the mystery, not an educational
aside — so `s` does nothing on the other four scenes, by design.

**Nobody gets dimmed on stage.** The speaker stands out by coming forward (lift, scale, shadow),
never by darkening the others. That was tried and rejected.

**Images must be optional.** Every slot falls back to a typographic placeholder via `slots()` on
`error`. The app must look finished with `assets/images/` empty.

## The scene screen

Two declared regions: the top holds scene number, title and the stage, and never moves; the
bottom scrolls on its own. The bottom is split `32% 1fr` — the speaker's **actor cutout**
(`attore-*.png`, not the portrait) in a 3:4 frame cropped from the top, head to waist, faded out
at the bottom — and the dialogue column. Use `1fr`, not a second percentage: two fixed
percentages plus a gap overflow and produce a horizontal scrollbar.

Newest line on **top**, older ones below and dimmed to 40%; the column scrolls back to the top
on each new line. Keep the entrance animation on `:first-child` only — its final frame sets
opacity to 1 and would cancel the dimming of the rest.

Highlighting the speaker must **not** change the stacking order: no `z-index` on `.attivo`. The
depth is what the staging decided.

**Never size the stage in `vh`.** The rows are declared (`54% / 46%`) and the stage takes the
height left under the title, so it is the largest square that fits. Sized in `vh` it grew past
its own half on phones, got clipped, and read as if the picture were zoomed in — that bug came
back once already.

A percentage `max-height` needs a definite height on the container, or it is ignored and the
figure spills out of its half.

## Where the app departs from the PDF

Audited against `pdftotext` on 27 August 2026 — 43 spoken lines in the original:

- **31 identical.**
- **4 reworded**, all the same way: Rosalia says "zio Giuseppe" where the PDF has bare "zio"
  (scenes 1, 2-third-part, 4, 5), and scene 4's art brief follows. She names the victim, and in
  the crowded third part it disambiguates who she is addressing.
- **2 added**, flagged `nuova:true`: Giuseppe's "Gli ulivi durano secoli…" and Roberto's reply,
  in *La donazione*.
- **4 "Lo sapevi?" boxes removed** (see the rule above); "Osserva bene!" stays.
- Nothing else is missing. Labels, the clue captions, the narrator's recap, the solution and the
  closing message are all still there — they live outside `battute`, so a dialogue-only check
  will not see them.

Re-run that audit before claiming the text is faithful: comparing whole lines, never fragments.
Splitting on sentence ends lets a short line like "Zio…" pass by accident.

## Screens vs scenes

A scene in the script can be split across two screens: `slot` says which image slot it draws
from, `n` the number shown to the audience, `parte` the sub-label. So *La donazione* and *Il
racconto dell'olio* are two screens both labelled "Scena 2 di 5" and both drawing `scena2.png`.
Never derive the image or the pose from the array index — splitting a scene would silently shift
every later scene's artwork.

`sfondo:{scala, fuoco}` zooms that screen's background (scene 2's first half is at 200% on the
left) without touching the actor coordinates.

Two lines in *La donazione* are **not Gervasio's** — added on the user's instruction, flagged
`nuova:true` in `STORY` and marked in `copione.txt`.

## Poses

`POSE_SCENA` maps scene index → character → pose, and `ATTORE(c, scena)` builds
`attore-<nome>-<posa>.png`. Names are semantic, never versions: `giuseppe-malore`,
`rosalia-allarmata`, `mauro-guardingo`. A character with no pose for that scene falls back to the
neutral cutout, and a missing file falls back like any other image — so a half-delivered set
never breaks a scene. Scene 4 is where they earn their keep: the whole cast reacts.

## How a scene is composed

Three layers inside `.palco`, all positioned in percentages of the frame:

1. `scenaN.png` — background, foreground deliberately left clear.
2. `attore-*.png` — one transparent cutout per character, from `STORY.scene[i].cast`:
   `x` (centre), `b` (height above the floor), `h` (figure height). **Height carries the depth** —
   never width. Array order is the stacking order: farthest first.
3. `scenaN-sx.png` / `scenaN-dx.png` — foreground props, in front of everyone, from
   `STORY.scene[i].primo`. Optional.

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

Already-converted files are reused from `assets/web/` when the copy is newer than the source —
without that, every run re-encoded the cover's 21 frames. Stills are saved with `method=4`: `6`
exhausted memory on the square RGBA clue plates and buys nothing at these sizes.

## Deliberate omissions

No player devices, no sync, no score persistence, no framework, no build step.
