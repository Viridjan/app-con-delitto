# Prompt for Claude Code

Audit this repository for logic errors, bugs, misleading comments, and performance problems. Then implement focused fixes and produce a measured optimization strategy. Work from the current working tree, including uncommitted files.

Read `CLAUDE.md`, `README.md`, and `docs/design-reference.md` first. Treat historical audits as evidence, not proof of current correctness. Inspect `git status` and preserve existing work. Do not commit, push, publish, rewrite history, remove original artwork, or add dependencies. Preserve the approved story, Italian copy, scoring, investigation budgets, forward-only player flow, local author-tool gates, offline operation, and visual design. Keep the intentionally duplicated audio engines consistent if a confirmed audio fix requires editing them; avoid unrelated engine refactoring.

## Starting evidence

A preliminary review ran `node smoke.js` successfully: 20 screens and 76 dialogue lines. This is a passing baseline, not a clean bill of health. No production code was changed. The following findings need your independent verification; line numbers may shift.

1. **Director depth changes can jump more than one position** (`oliva-blu.html`, `changeDepth`, around 1954). Swapping the depths of neighboring entries is insufficient when other entries share a depth. Reproduction using the real functions through `stub-dom.js`: in a scene, replace the cast in memory with DOM order Giuseppe z=2, Rosalia z=1, Roberto z=1, and an empty foreground array. The sorted order is Rosalia, Roberto, Giuseppe. Calling `changeDepth(-1, {dato: sc.cast[0]})` produces Giuseppe, Rosalia, Roberto; the expected order is Rosalia, Giuseppe, Roberto. Do not modify the actual story to create this fixture. Cover both directions, repeated depths, actor/foreground ties, boundaries, and round trips. Preserve all nonselected relative ordering and avoid unnecessary exported `z` changes.

2. **Pending audio callbacks survive mute** (`withAudioContext`, `speak`, `setVolume`, around 1650–1710). With an AudioContext whose `resume()` promise is delayed, call `speak('Giuseppe', 'test')`, mute with `setVolume(0, false)`, then resolve the promise. `playVoice` still executes and passes a zero target to `exponentialRampToValueAtTime`. A deferred-resume fake reproduced this call and an unhandled rejection when configured to reject the invalid target. Verify browser behavior and fix cancellation/state checking across asynchronous resume. Also test rapid speech requests, navigation, restart, failed resume, and unmute; distinguish confirmed failures from related hypotheses. The existing fake always starts in `running` state and cannot catch this race.

3. **Modal interaction isolation appears incomplete** (`showOverlay`, `closeOverlay`, delegated stage click handler, around 2044–2155). The dialog declares `aria-modal` and moves initial focus but has no visible focus trap or background `inert` handling. The keyboard shortcut guard does not block native activation of a background button, and the stage click handler has no overlay guard. Verify with real Tab/Shift+Tab and native Space/Enter events whether a user can focus and activate the underlying page during confirmation. Cover nested solution/restart confirmations and focus restoration. Do not report this as browser-reproduced until tested.

4. **Browser tests overstate their coverage** (`regia.js`). The depth test calculates rendered z-index values and expected entries but only compares their lengths; it never verifies their ordering. Pointer probes dispatch a synthetic pointerdown with pointerId 1 without a real active pointer, then application code calls `setPointerCapture`; check for uncaught event-handler errors and ensure the runner fails on them. The file claims to test dragging but does not exercise pointermove/pointerup sequences. Use actual browser input where available and explicitly report any remaining simulation limitations. Keep the existing smoke suite intact.

5. **Comments and documentation contradict implementation**:
   - Around `hasMoreToReveal` (1467), a comment says the advance button remains disabled while anything remains to reveal; scenes explicitly keep it enabled.
   - Around `advanceButton` (1490), a comment places the scene button at the bottom of dialogue; `render` inserts it in `.azioni-scena`, and nearby documentation describes its fixed position above dialogue.
   - Around the delegated interaction handler (2021), the comment lists the advance button among controls outside `#stage`; it is rendered inside and delegated.
   - The audio smoke comment says every oscillator releases the shared filter, while only the final oscillator installs the cleanup callback.
   - `prova-regia.py` claims meaningful browser coverage; check the actual behavior before preserving those claims.
   Inspect other current comments and contributor documentation for obsolete function names, stale historical claims, and unsupported performance assertions. Fix current guidance; keep clearly labeled historical evidence intact.

## Audit and implementation method

- Trace navigation, dialogue reveal, cast scrolling, investigation spending, quiz completion/scoring, confirmations, restart, and local/public gates. Test reachable user actions first; label hardening for invalid programmatic inputs separately.
- Inspect image fallback and asset generation, cache invalidation, incomplete-source protection, single-file freshness, and failure paths. Do not run a mutating image sync merely to audit it. Use temporary fixtures for destructive or partial-source scenarios.
- For each finding, provide severity, file/function, trigger, expected versus actual behavior, impact, and evidence. Separate confirmed bugs, hypotheses, misleading comments, and optional optimizations.
- Add meaningful regression coverage for confirmed bugs before fixing them. Avoid tests that copy the implementation or merely search for source strings when behavior can be exercised.
- Run `node smoke.js`. Run the browser suite if Chromium is available, capture process status and browser errors, and distinguish blocked checks from passes. Use real browser tests for focus, native keyboard activation, pointer capture, dragging, scrolling, and layout. Do not silently treat DOM-stub results as browser verification.
- Make small, reviewable fixes. Do not redesign the app or introduce a framework, bundler, server requirement, or new persistence behavior.

## Optimization strategy

Measure before changing architecture. Establish a baseline for cold startup, asset payload, per-dialogue advance/render duration, DOM/image recreation, and repeated navigation or author-tool interactions. Record browser, viewport, sample count, and whether assets are warm or cold. Include a phone-sized viewport and desktop/projector sizing.

Prioritize these candidates only if measurements justify them:

1. Avoid rebuilding the entire stage and image markup for each revealed line. Consider retaining the scene illustration DOM while updating dialogue and speaker state. Preserve text reveal rhythm, layout, scroll behavior, image fallbacks, and director selection. Measure the improvement against implementation complexity.
2. Consolidate lifecycle cleanup for speech timers, pending resume callbacks, and detached nodes. Check whether leaving a scene or rerendering for author controls restarts text animation without corresponding speech. Prevent stale work before pursuing micro-optimizations.
3. During director dragging, update the figure immediately but coalesce panel regeneration to at most once per animation frame. Inspect pointer listener cleanup after pointerup, pointercancel, and lost capture; the current handlers leave the unused opposite one-shot listener attached after a drag.
4. Profile asset parsing/loading and the warm-cache image sync separately. Preserve the tracked embedded asset map and offline/single-file distribution contract. Do not lower image quality or change image delivery architecture without evidence and visual review.
5. Move cheap pipeline validation ahead of expensive conversion where practical, and consider atomic output writes if failure-path tests establish a risk of inconsistent generated files. Avoid speculative infrastructure.

For each proposed optimization give expected benefit, measurement needed, complexity, regression risk, and acceptance criteria. Implement only low-risk improvements with demonstrated value; document larger proposals without expanding scope.

## Deliverables

Return a severity-ranked findings report, focused fixes with regression tests, exact verification results and limitations, and a prioritized optimization plan with measurements where available. Summarize changed files. State explicitly if a reported issue could not be reproduced or a proposed optimization was rejected by measurements. Preserve all unrelated working-tree changes.
