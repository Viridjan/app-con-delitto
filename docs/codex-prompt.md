# Prompt for Codex

Fix the defects listed below in this repository. Each one was reproduced before being written
down; where a reproduction is given, run it first and confirm it still fails, because the working
tree moves. Do not trust this document over the code.

Read `CLAUDE.md` and `docs/design-reference.md` first, and inspect `git status`: there is
uncommitted work, and it must survive. Do not commit, push, publish, rewrite history, or delete
artwork. Do not add a dependency, a framework, a bundler, a build step or a server requirement.
Do not touch `copione.txt`, the story text inside `STORY`, the scoring, the investigation budgets,
the forward-only player flow, the author-tool gates or the two deliberately duplicated audio
engines.

After every change: `node smoke.js`, then `python3 prova-regia.py` if Chromium is available, then
`python3 sync-assets.py --file-unico` to keep the single-page copy current — `smoke.js` fails if
that copy drifts. `node dom.js` before and after must produce identical output for anything that
is not meant to change the rendered markup.

Add a behavioural regression check for each confirmed defect **before** fixing it, and prove the
check bites: reintroduce the defect, watch the check fail, restore. Checks must drive the real
functions. A check that restates the implementation, or that greps the source for a string when
the behaviour can be exercised, is worse than no check. `smoke.js` is for logic that needs no
layout; `regia.js` + `prova-regia.py` is for anything needing focus, computed styles, pointers or
`inert`.

---

## Confirmed defects

### 1. `.dissolve` is added to `#stage` on every render and never removed

`render()` does `stage.classList.add("dissolve")` whenever `visibilityObserver` exists, on every
screen. Nothing ever removes it. Measured: after walking all twenty screens, `stage.className` is
still `dissolve`.

Harmless today because the only rule that reads it is `.dissolve .card`, and `.card` exists only
on the cast page. It is a trap: the day a `.card` appears on another screen, that screen starts at
`opacity:.25` and nobody will connect the two.

Make the class belong to the screen that uses it — added where the cast page is rendered, removed
otherwise — or drop the class and scope the rule to the cast page. Either way the fade-in of the
cast cards must keep working: cards start dimmed and light up as they scroll into view.

### 2. Selecting the background in staging mode writes a no-op zoom into `STORY`

`activateDirector`, background `pointerdown`: `sc2.sfondo = sc2.sfondo || { scala: 1, fx: 50, fy: 50 }`.
A single click, with no drag, permanently gives a scene an identity `sfondo` it did not have, and
`backgroundSource(sc)` then exports a line that says nothing. Six of the twelve scene screens have
no `sfondo` today, so the author can quietly add six useless lines by clicking around.

Create the object only when a value actually changes — the first `pointermove`, the wheel, an
arrow, `+`/`-` — and leave the scene untouched for a bare selection. Selecting the background must
still work: the panel has to show its zoom and focus, and the arrows and `+`/`-` must still act on
it.

### 3. The help overlay describes things that are no longer true

Two lines in `renderHelp`:

- «pulsante in basso — l'unico modo di cambiare schermata». On a scene the button is at the **top**
  of the dialogue column, in `.azioni-scena`, above the newest line; it is at the foot of the sheet
  everywhere else. Say what is true on both.
- «v — sviluppo: stato, immagini mancanti, salto a una schermata». The missing-images row was
  removed on 4 September 2026 along with `expectedAssets()`. The panel has two rows: where you are,
  and the list of screens.

This is user-visible Italian copy, but it is app chrome, not the approved script: `copione.txt`
must not change, and `node estrai-copione.js` must leave it byte-identical.

While you are there, check the rest of that overlay against the code rather than against this list.

### 4. `changeDepth` can inflate `z` across lists

`applyOrder()` gives each entry the lowest depth that keeps it in place, preferring the plane
default so an entry that lands back on its default loses its explicit `z`. That works within one
list. Between lists it cannot: at equal `z` the markup order decides, and the markup always emits
actors before props, so moving an actor in front of a prop at the same depth needs a real step.
Repeated moves across the two lists therefore push the numbers up and never bring them back.

Reproduction: one actor at `z:5` and one `primo` entry at its default 5; alternate `]` and `[` on
the actor a dozen times and watch the exported `z` climb.

The visual order is correct throughout — this is about the numbers the panel asks you to paste
back. Find a normalisation that keeps the order and pulls the values back down to the smallest set
that expresses it. Do not renumber entries the author did not move if their relative order is
unaffected. `smoke.js` already asserts that no explicit `z` is superfluous — removing any one of
them must change the visible order — so keep that check passing.

---

## Hardening: not reachable through the interface today

Label these as hardening in your report; do not present them as fixed bugs. Both are one guard
each. Neither may change behaviour on any reachable path.

### 5. `renderScene` does not clamp `state.step`

`s.battute[state.step - 1].c` throws when `state.step` exceeds the line count. `reveal()` guards
the increment and `goTo()` resets to 0 or 1, so nothing reaches it today — but the developer panel
jumps by index and the field is public.

### 6. The quiz option handler does not guard `currentQuestion() === -1`

`state.risposte[currentQuestion()] = +t.dataset.opt` writes to index `-1` when every question is
answered. Options are only rendered for the open question, so it is unreachable — until a future
screen renders an option somewhere else.

---

## Robustness

### 7. The image pipeline writes non-atomically

`write_if_changed()` in `sync-assets.py` calls `path.write_text()` directly. `assets/assets.js` is
**tracked and deployed** — it is the published app's illustrations, 3.7 MB. An interrupted write
leaves it truncated, and the next `git add -u` commits the truncation. The same applies to
`oliva-blu.html` and to `oliva-blu-completo.html`.

Write to a temporary file in the same directory and `os.replace()` onto the target, so a
half-written file never has the real name. Keep the current behaviour of not touching a file whose
content is identical — that is what keeps a no-op sync from dirtying the working tree.

Verify with a fixture, not on the real files: build a temporary directory, interrupt a write, and
show the target is either the old content or the new one, never a fragment.

---

## Tooling

### 8. CI runs only `node smoke.js`

`.github/workflows/smoke.yml` has one step. `prova-regia.py` — eight behavioural checks on focus,
pointers, staging depth and modal isolation — never runs there. Add a job that installs Chromium
and runs it, and make it fail the build. Keep the existing smoke job as it is, and add no
dependency to the app itself: the browser belongs to CI, not to the project.

### 9. Two audit scripts have no runner

`regia.js` is driven by `prova-regia.py`, which pastes it into a copy of the app, reads the verdict
out of the page title and exits non-zero on failure. `censimento.js` (how many text sizes reach the
screen — the contract is five, on a big screen and on a phone alike) and `audit-mobile.js` (size,
contrast and touch targets at 390px) are still "paste this in by hand" and are documented as
commands nobody runs.

Give them the same shape, reusing `prova-regia.py`'s machinery rather than copying it: one runner,
told which script to inject and at which viewport, that exits non-zero when the contract breaks.
`audit-mobile.js` needs `telaio-390.html`, because headless Chromium will not give a script a
window under 500px. Do not change what either script measures.

---

## Optimisation: measured, and mostly rejected

Baseline taken on this working tree, headless Chromium, 1280×900 and 390×844, warm assets, 40–120
samples per figure:

| | |
|---|---|
| `render()` per revealed line | **3.6 ms**, 9 images, 39 nodes in the stage |
| `render()` on the cast page | 3.9 ms |
| staging drag, one step (includes the panel) | 0.03 ms |
| first render | ~475 ms, of which the Google Fonts stylesheet is 445–624 ms |
| warm image sync | 0.19 s |
| renders per revealed line | 1 |
| nodes after walking all 20 screens five times | no growth |

**Do not** rebuild `render()` to keep the illustration DOM between lines. 3.6 ms arrives once per
click, not once per frame; the cost of preserving the text rhythm, the scroll behaviour, the image
fallbacks and the staging selection is not repaid.

**Do not** coalesce the staging panel to one regeneration per frame. 0.03 ms per step.

**Do not** attack the asset map for startup. It is not the cost: the web-font stylesheet is. If
startup ever matters, that is the lever, and it is a design decision, not a refactor.

If you find an optimisation worth doing, measure it first on this tree and report the before and
after with the viewport, the sample count and whether assets were warm. An optimisation without a
measurement will be rejected.

---

## What to hand back

Findings ranked by severity, each with file, function, trigger, expected versus actual, and the
evidence you gathered — not the evidence in this document. The fixes, small and reviewable. The
regression checks, and for each one the proof that it bites. Exact verification output, and a clear
line between what you confirmed in a browser and what you confirmed through the DOM stub. Say
plainly if something here could not be reproduced: this list is a set of claims, and a claim that
does not survive contact with the code is a finding of its own.
