# Historical audit — 4 September 2026

Archived from CLAUDE.md. This records the state at the time; current maintenance
instructions live in [CLAUDE.md](../CLAUDE.md).

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

