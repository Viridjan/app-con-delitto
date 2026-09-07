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
  A copy of the 7 September run is kept at `trash/documenti/prima-della-riscrittura-087bf25.bundle`
  with its report beside it — local and gitignored, and on the same disk as everything else, which
  is not a backup.
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

## Scope: the whole repository

`main` is the only branch since 7 September 2026, so filtering it filters everything. The tool
verifies that before starting and refuses if another branch appears — while `file-unico` existed,
filtering `main` alone removed nothing from the object store, because that branch kept all 40
source images reachable and `.git` stayed at 347MB. If a second branch is ever wanted, decide
whether to filter it too or to give up the storage goal; there is no third option.

The tool performs no reflog expiry and no garbage collection, so the candidate's own `.git` still
holds the pre-filter objects. Do not judge it by that directory's size. Measure by cloning the
candidate with `--no-hardlinks` and running `git reflog expire --expire=now --all && git gc
--prune=now`: on 7 September that gave **161.02 MiB → 8.19 MiB**, with `assets/images/` absent
from every commit and every object.

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
