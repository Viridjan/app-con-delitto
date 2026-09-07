# Historical audit — 4 September 2026

Archived from CLAUDE.md. This records the state at the time; current maintenance
instructions live in [CLAUDE.md](../CLAUDE.md).

## Consistency audit — 4 September 2026

The cross-file audit removed eight drift points:

- author gates use an explicit allow-list for local files and Claude artifact hosts, so an
  unknown HTTP/HTTPS host remains public;
- `voci.html` now interrupts the previous utterance and routes each line through the same
  per-utterance gain and filter cleanup used by the app;
- `smoke.js` compares the ordered dialogue arrays from `STORY` and `copione.txt` in both
  directions, rather than searching for fragments anywhere in the HTML;
- each clue owns its stable `id`, and `clueImage()` no longer depends on array position;
- each staged actor owns its optional `posa`, and the hand-maintained pose table is gone —
  today's `ACTOR_POSES` is derived from `STORY` and cached, not a second source of truth;
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
standing cost of the split. Whoever publishes it should know.

That cost is what the `file-unico` branch was created for on 5 September 2026, and what
`sync-assets.py --file-unico` does instead since 7 September, when the branch was dropped. This
file is history; the standing instructions live under *Distribution* in `CLAUDE.md`.

