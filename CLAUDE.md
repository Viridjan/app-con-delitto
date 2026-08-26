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
- `img/ART.md` — the illustration brief Codex works from.
- `assets/images/` — Codex's deliveries. `assets/web/` and `assets/images/bocciate/` are gitignored.

## Rules that matter

**The script is verbatim.** Every line in `STORY` is Gervasio's text, unchanged. Check with:
extract the PDF (`pdftotext`), pull the 53 quoted lines, assert each is present in the HTML. Do
not paraphrase or "fix" dialogue — including `Adoro l'Olo` in scene 2.

**Ask before pushing aesthetic changes.** The repo is public with Pages on `main`, so every push
goes live in a minute. Show the result (screenshot, or republish the artifact) and wait for a yes.
Bug fixes, scripts and docs follow normal behaviour.

**Blue is spent once.** `--blu` is Mauro's speech colour, the "Osserva bene!" box and the scene-4
vignette — because the victim's mouth turns blue. Never use it for anything else.

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

## Deliberate omissions

No player devices, no sync, no score persistence, no framework, no build step.
