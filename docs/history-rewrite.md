# History cleanup: review gate

The preparation tool creates a backup and a rewritten **candidate** outside this repository.
It never rewrites the working repository, configures a publishing remote, or pushes anything.
Adopting or publishing the candidate is a separate human decision.

From `main`, after removing `assets/images/` from the index and reviewing the working tree:

```sh
python3 scripts/prepare-history-rewrite.py /tmp/oliva-history-review
```

The destination must not exist. Git, Node, Python, `tar` and an already installed
`git-filter-repo` are required for this maintenance operation. The app and CI gain no
dependency or build step. The tool captures tracked and non-ignored untracked files into a
candidate commit, including pending cleanup changes; inspect `git status` first.
For long-term recovery, choose durable storage outside the repository instead of `/tmp`.

The destination contains:

- `before.bundle`: all original refs and their reachable objects, verified before filtering.
- `prepared.bundle`: the candidate before filtering, also including pending cleanup changes.
- `candidate/`: an isolated clone with no remote configured.
- `report.json`: original and candidate commit IDs, protected file hashes, bundle hashes and checks.

The exact filter applied inside the candidate is:

```sh
git filter-repo --force --path assets/images/ --invert-paths \
  --strip-blobs-bigger-than 4M --refs refs/heads/main
```

Here `--force` permits filtering the disposable clone after its preparation commit; it is
not a force-push. `4M` is 4,194,304 bytes. Current `assets/assets.js` is 3,842,102 bytes and
survives; historical HTML blobs around 5.8 MB exceed the limit. Removing a large blob can
remove the corresponding file from historical commits: old revisions need not remain runnable.
The tool verifies current HTML, asset map and voice bench are byte-identical after filtering.

## Why only main is filtered

**Written while the `file-unico` branch existed; that branch was dropped on 7 September 2026**, so
the reasoning below now describes a constraint that no longer applies — and the tool still
enforces it. Re-read it before running: `--refs refs/heads/main` and every `file-unico`
verification have no target left, and with one history to filter the operation can finally reach
its storage goal.

The original reasoning: `file-unico` had to stay intact, commit ID and tree included, so filtering
every ref would have violated that. Its history therefore kept the old source images and large
blobs, and the cleanup removed nothing from the object store — 40 source images stayed reachable
and `.git` stayed at 347MB. That is precisely why the branch was dropped in favour of a build
flag. Partial filtering also leaves old objects available locally. No reflog expiry or garbage
collection is performed. Do not judge the candidate solely by its `.git` directory size.

Checks include the path's absence and the blob-size ceiling throughout rewritten `main`,
`node smoke.js` on the candidate, on an exported `file-unico`, and on the unchanged source,
plus `git fsck --full`. The original repository's branch IDs and runtime hashes are rechecked.
An exception or missing report means preparation did not complete; do not adopt that candidate.

## Human decision

Review the report, candidate diff and commit map in `.git/filter-repo/commit-map`.
Keep the verified bundles on durable storage before any future adoption. A bundle can be
recovered independently with `git clone --branch main /path/to/before.bundle recovered`;
its `file-unico` ref is available as a remote branch in that clone.

No adoption, remote update or force-push is automated here. Decide separately whether the
main-only cleanup and its retained `file-unico` history meet the intended storage goal.
