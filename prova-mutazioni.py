#!/usr/bin/env python3
"""Reintroduce i difetti in una copia temporanea e pretende che i test falliscano.
Non modifica l'app o la copia singola nella directory di lavoro.
"""
import pathlib
import shutil
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent


def main():
    with tempfile.TemporaryDirectory(prefix="oliva-mutazioni-") as folder:
        fixture = pathlib.Path(folder)
        files = ["oliva-blu.html", "voci.html", "copione.txt", "smoke.js", "stub-dom.js",
                 "regia.js", "censimento.js", "audit-mobile.js", "telaio-390.html",
                 "prova-regia.py", "browser-title.js", "sync-assets.py", "prova-sync.py", "asset-inventory.js"]
        for name in files:
            shutil.copy2(ROOT / name, fixture / name)
        (fixture / "assets").mkdir()
        shutil.copy2(ROOT / "assets/assets.js", fixture / "assets/assets.js")
        app = (fixture / "oliva-blu.html").read_text()
        sync = (fixture / "sync-assets.py").read_text()
        browser = ["python3", "prova-regia.py"]
        cases = [
            ("dissolve", "oliva-blu.html", 'stage.classList.toggle("dissolve", !!visibilityObserver && s.t === "cast");',
             'stage.classList.add("dissolve");', browser, "dissolve errato"),
            ("observer cast", "oliva-blu.html", 'cards().forEach(c => visibilityObserver.observe(c));',
             'cards().forEach(() => {});', browser, "FALLITA · observer"),
            ("selezione sfondo", "oliva-blu.html", 'const sc2 = STORY.scene[i];',
             'const sc2 = STORY.scene[i]; sc2.sfondo ||= {scala:1,fx:50,fy:50};', browser, "la sola selezione esporta sfondo"),
            ("aiuto", "oliva-blu.html", '"pulsante per proseguire"', '"pulsante in basso"',
             ["node", "smoke.js"], "aiuto colloca male il pulsante"),
            ("aiuto sviluppo", "oliva-blu.html", 'sviluppo: stato e elenco delle schermate per saltare a una di esse',
             'sviluppo: stato, immagini mancanti, salto a una schermata', ["node", "smoke.js"], "aiuto descrive una riga rimossa"),
            ("hardening step", "oliva-blu.html", '  state.step = Math.max(0, Math.min(s.battute.length, state.step));',
             '', ["node", "smoke.js"], "AssertionError"),
            ("hardening quiz", "oliva-blu.html", '      if (q < 0) return;', '', browser, "risposta scritta a -1"),
            ("scrittura atomica", "sync-assets.py", '    fd, name = tempfile.mkstemp',
             '    path.write_text(content, encoding="utf-8")\n    return True\n    fd, name = tempfile.mkstemp',
             ["python3", "prova-sync.py"], "'new' != 'old'"),
            ("contratto censimento", "oliva-blu.html", '</style>', '#stage .cover h1 {font-size:13px!important}</style>',
             browser + ["--script", "censimento.js", "--viewport", "1280x900"], "attesi 5 corpi"),
            ("contratto mobile", "oliva-blu.html", '</style>', '#stage .cover h1 {font-size:13px!important}</style>',
             browser + ["--script", "audit-mobile.js", "--viewport", "390x844"], "FALLITA"),
        ]
        for label, file, old, new, command, expected in cases:
            path = fixture / file
            original = app if file == "oliva-blu.html" else sync
            assert old in original, label
            try:
                path.write_text(original.replace(old, new, 1))
                result = subprocess.run(command, cwd=fixture, capture_output=True, text=True, timeout=150)
                output = result.stdout + result.stderr
                if result.returncode == 0 or expected not in output:
                    raise AssertionError(f"{label}: mutazione non intercettata\n{output}")
                print(f"ok · {label}: exit {result.returncode}, {expected}", flush=True)
            finally:
                path.write_text(original)
            restored = subprocess.run(command, cwd=fixture, capture_output=True, text=True, timeout=150)
            if restored.returncode:
                raise AssertionError(f"{label}: ripristino fallito\n{restored.stdout}{restored.stderr}")
            print(f"ok · {label}: ripristino exit 0", flush=True)
        print(f"\n{len(cases)} mutazioni intercettate; copie ripristinate e fixture rimossa")


if __name__ == "__main__":
    main()
