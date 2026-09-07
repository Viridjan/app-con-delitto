#!/usr/bin/env python3
"""Prepare and verify a history rewrite in an isolated clone; never publish it."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile


def run(*args, cwd, capture=False):
    result = subprocess.run(args, cwd=cwd, check=True, text=True,
                            stdout=subprocess.PIPE if capture else None)
    return result.stdout.strip() if capture else None


def git(repo, *args):
    return run('git', *args, cwd=repo, capture=True)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify(condition, message):
    """The checks are the point of this tool, so they must not be `assert`:
    `python3 -O` strips those, and the candidate would be adopted unverified."""
    if not condition:
        raise SystemExit(f'verification failed: {message}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination', type=Path, help='New directory outside the source repository')
    args = parser.parse_args()
    source = Path(git(Path.cwd(), 'rev-parse', '--show-toplevel')).resolve()
    dest = args.destination.resolve()
    if dest == source or source in dest.parents or dest.exists():
        parser.error('Destination must not exist and must be outside the source repository')
    if git(source, 'branch', '--show-current') != 'main':
        parser.error('Run from main')
    if not shutil.which('git-filter-repo'):
        parser.error('git-filter-repo must already be installed')
    original_main = git(source, 'rev-parse', 'refs/heads/main')
    # Un solo ramo, dal 7 settembre 2026: `file-unico` era una variante di
    # distribuzione ed e' diventata una flag di `sync-assets.py`. Finche'
    # esisteva, filtrare il solo `main` non liberava niente — quel ramo teneva
    # raggiungibili tutte e 40 le sorgenti. Se ne ricompare uno, va deciso se
    # filtrarlo insieme o se rinunciare allo scopo: non c'e' una terza strada.
    branches = git(source, 'for-each-ref', '--format=%(refname:short)', 'refs/heads').split()
    verify(branches == ['main'],
           f'this tool filters main only; the repository also has {branches}')
    protected = ['oliva-blu.html', 'voci.html', 'assets/assets.js']
    hashes = {name: digest(source / name) for name in protected}
    if int(git(source, 'cat-file', '-s', 'HEAD:assets/assets.js')) >= 4 * 1024 * 1024:
        parser.error('Current assets.js would not survive the chosen threshold')
    run('node', 'smoke.js', cwd=source)
    dest.mkdir(parents=True)
    bundle = dest / 'before.bundle'
    run('git', 'bundle', 'create', str(bundle), '--all', cwd=source)
    run('git', 'bundle', 'verify', str(bundle), cwd=source)
    candidate = dest / 'candidate'
    run('git', 'clone', '--branch', 'main', str(bundle), str(candidate), cwd=dest)
    run('git', 'remote', 'remove', 'origin', cwd=candidate)

    # Include the reviewable working-tree cleanup without committing in the source repo.
    names = git(source, 'ls-files', '-z', '--cached', '--others', '--exclude-standard')
    selected = set(names.split('\0')) - {''}
    if any(name.startswith('assets/images/') for name in selected):
        raise RuntimeError('Untrack assets/images/ before preparing the rewrite')
    tracked = set(git(candidate, 'ls-files', '-z').split('\0')) - {''}
    for name in tracked - selected:
        (candidate / name).unlink()
    for name in selected:
        src = source / name
        target = candidate / name
        if src.is_file():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, target)
        elif target.exists():
            target.unlink()
    run('git', 'add', '-A', cwd=candidate)
    if git(candidate, 'status', '--porcelain'):
        run('git', '-c', 'user.name=History rewrite preview', '-c',
            'user.email=preview@localhost', 'commit', '-m',
            'chore: repository cleanup and smoke CI', cwd=candidate)
    run('node', 'smoke.js', cwd=candidate)
    # This second bundle also preserves the uncommitted cleanup captured above.
    run('git', 'bundle', 'create', str(dest / 'prepared.bundle'), '--all', cwd=candidate)
    run('git', 'bundle', 'verify', str(dest / 'prepared.bundle'), cwd=candidate)
    run('git', 'filter-repo', '--force', '--path', 'assets/images/', '--invert-paths',
        '--strip-blobs-bigger-than', '4M', '--refs', 'refs/heads/main', cwd=candidate)
    verify({name: digest(candidate / name) for name in protected} == hashes,
           'a protected file changed inside the candidate')
    verify(not git(candidate, 'log', 'main', '--format=%H', '--', 'assets/images/'),
           'assets/images/ still appears somewhere in the rewritten main')
    objects = git(candidate, 'rev-list', '--objects', 'main')
    sizes = subprocess.run(['git', 'cat-file', '--batch-check=%(objecttype) %(objectsize)'],
                           input='\n'.join(line.split()[0] for line in objects.splitlines()),
                           cwd=candidate, text=True, check=True, stdout=subprocess.PIPE).stdout
    verify(all(int(line.split()[1]) <= 4 * 1024 * 1024
               for line in sizes.splitlines() if line.startswith('blob ')),
           'a blob over the 4M ceiling survived in the rewritten main')
    run('node', 'smoke.js', cwd=candidate)
    # La stessa app estratta dal ramo riscritto, fuori dal clone candidato: se
    # il filtro avesse toccato qualcosa che serve a farla girare, si vede qui.
    with tempfile.TemporaryDirectory(prefix='main-check-') as directory:
        archive = dest / 'main.tar'
        run('git', 'archive', '--output', str(archive), 'main', cwd=candidate)
        run('tar', '-xf', str(archive), '-C', directory, cwd=dest)
        run('node', 'smoke.js', cwd=Path(directory))
        archive.unlink()
    run('git', 'fsck', '--full', cwd=candidate)
    verify(git(source, 'rev-parse', 'main') == original_main,
           'main moved in the source repository')
    verify({name: digest(source / name) for name in protected} == hashes,
           'a protected file changed in the source repository')
    run('node', 'smoke.js', cwd=source)
    report = dict(source=str(source), candidate=str(candidate),
                  main_before=original_main, main_candidate=git(candidate, 'rev-parse', 'main'),
                  protected_sha256=hashes, bundle_sha256=digest(bundle),
                  prepared_bundle_sha256=digest(dest / 'prepared.bundle'),
                  size_before=git(source, 'count-objects', '-vH').replace('\n', ' · '),
                  size_after=git(candidate, 'count-objects', '-vH').replace('\n', ' · '),
                  checks='main smoke, exported-main smoke, source smoke, hashes, path drop, blob limit, fsck passed',
                  scope='the whole repository: main is the only branch',
                  publication='Not performed. Human review required; no remote configured in candidate.')
    (dest / 'report.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
