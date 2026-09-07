# Historical audit — 4 September 2026

Archived from CLAUDE.md. This records the state at the time; current maintenance
instructions live in [CLAUDE.md](../CLAUDE.md).

## Audit after the Claude fixes — 4 September 2026

The image fallback now assigns the replacement URL to the real `img.src`; the accidental
`img.assetSource` property never started a second load. `smoke.js` exercises that failure path so
the cover-to-scene fallback cannot silently regress.

`ACTOR_POSES` is assembled in one pass by scene number and then overlaid with the current screen,
preserving the rule that the current part wins while removing the previous repeated full scan of
`STORY.scene`. It uses the canonical `sceneNumber()` resolver, so screens without an explicit `n`
do not collapse into one shared `undefined` pose group.

The derived-image cache no longer trusts output timestamps. `sync-assets.py` stores the selected
source name, modification time, size and `CACHE_VERSION` in ignored
`assets/web/.sources.json`; changing or removing the highest `_vN` therefore rebuilds the correct
WebP. Missing, malformed or structurally invalid cache metadata is treated as an empty cache and
rebuilt. Increase `CACHE_VERSION` whenever encoding or cropping rules change. Generated JS, HTML
and cache metadata are written only when their content changes, avoiding needless watcher reloads.
