# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A presenter webapp for *Il mistero dell'oliva blu*, an Italian "cena con delitto" script
(`ullgi_L-inaugurazione_COSTA_rev.pdf`, by Carlo Maria Gervasio). A narrator drives it live in
front of a table of players. Published as an Artifact:
https://claude.ai/code/artifact/ae31691c-accf-409e-bf55-64800d0de882

## Files

- `oliva-blu.html` — the whole app. One self-contained file: `<style>`, `const STORY`, `<script>`.
  No build, no dependencies, no server. Open it directly.
- `smoke.js` — `node smoke.js`. Walks every screen with a hand-rolled DOM stub (no jsdom) and
  checks the quiz maths. Run it after any change to the script block.
- `img/ART.md` — the illustration brief. Codex generates the images.
- `assets/images/` — where Codex delivers. Not `img/`.

## Rules that matter

**The script is verbatim.** Every line in `STORY` is Gervasio's text, unchanged. There is a
checker for it: extract the PDF (`pdftotext`), pull the 53 quoted lines, assert each is present
in the HTML. Do not paraphrase, tidy, or "fix" dialogue — including `Adoro l'Olo` in scene 2.

**Blue is spent once.** `--blu` is Mauro's speech colour, the "Osserva bene!" box, and the
scene-4 vignette — because the victim's mouth turns blue. Never use it for anything else.

**Images must be optional.** Every image slot has a typographic fallback (art brief, monogram,
olive-leaf mark) wired via `slots()` on `error`. The app must look finished with `assets/images/`
completely empty. `ASSETS` maps expected filenames to real URLs — that is also how the published
artifact points at uploaded assets (`_blob/{id}`), which needs the `assets` capability declared.

**Publishing:** redeploy the same file path to keep the URL. The artifact CSP allows Google
Fonts and nothing else external; no inline event handlers, no page-initiated downloads.

## Deliberate omissions

No player devices, no sync, no score persistence, no framework. The presenter is one screen.
