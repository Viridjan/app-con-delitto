#!/usr/bin/env python3
"""Runner browser condiviso, senza server o dipendenze dell'app.

python3 prova-regia.py
python3 prova-regia.py --script censimento.js --viewport 1280x900
python3 prova-regia.py --script censimento.js --viewport 390x844
python3 prova-regia.py --script audit-mobile.js --viewport 390x844

Gli eventi di regia sono sintetici: verificano gestori, focus e inert, non
l'attivazione fisica dei tasti. Gli audit conservano le misure dei loro script;
il runner li ripete sulle schermate e applica i contratti al referto.
"""
import argparse
import json
import os
import pathlib
import shutil
import signal
import subprocess
import tempfile
import time

ROOT = pathlib.Path(__file__).resolve().parent


def injection(script):
    source = (ROOT / script).read_text(encoding="utf-8")
    if script == "regia.js":
        return source
    result = "window.__cens" if script == "censimento.js" else "JSON.parse(document.title)"
    return """(() => {
      const reports = [];
      const measure = label => {
        const result = (() => { SOURCE; return RESULT; })();
        reports.push({label, ...result});
      };
      for (let n = 0; n < SLIDES.length; n++) {
        goTo(n);
        if (SLIDES[n].t === 'scene') {
          state.step = STORY.scene[SLIDES[n].i].battute.length; render();
        }
        measure(String(n));
        if (SLIDES[n].t === 'quiz') {
          for (let q = 0; q < STORY.quiz.length; q++) {
            state.risposte[q] = 0; render(); measure(n + '/risposta-' + q);
          }
        }
      }
      document.title = JSON.stringify(reports);
    })();""".replace("SOURCE", source).replace("RESULT", result)


def verdict(script, title, width):
    if script == "regia.js":
        rows = [r.strip() for r in title.split("|")]
        return rows, [r for r in rows if not r.startswith("ok ·")]
    reports = json.loads(title)
    if not isinstance(reports, list) or not reports:
        raise ValueError("referto vuoto o non valido")
    failures = []
    if script == "censimento.js":
        sizes = sorted({size for report in reports for size, count in report["fontSizes"] if count})
        if len(sizes) != 5:
            failures.append(f"FALLITA · attesi 5 corpi, trovati {len(sizes)}: {sizes}")
        rows = [f"{'FALLITA' if failures else 'ok'} · censimento {width}px: {len(sizes)} corpi {sizes}, {len(reports)} viste"]
    else:
        for report in reports:
            label = report["label"]
            if report["width"] != width or report["overflow"] > 1:
                failures.append(f"FALLITA · vista {label}: larghezza {report['width']}, overflow {report['overflow']}")
            for item in report["textItems"]:
                if item["px"] < 14 or item["c"] < (3 if item["px"] >= 24 else 4.5):
                    failures.append(f"FALLITA · vista {label}: testo {item}")
            for item in report["touchTargets"]:
                if min(item["w"], item["h"]) < 44:
                    failures.append(f"FALLITA · vista {label}: bersaglio {item}")
        rows = [f"{'FALLITA' if failures else 'ok'} · audit mobile {width}px: {len(reports)} viste, dimensioni/contrasto/tocco"]
    return rows + failures, failures


def run(script, viewport, browser):
    width, height = viewport
    source = (ROOT / "oliva-blu.html").read_text(encoding="utf-8")
    i = source.rindex("</script>")
    fd, name = tempfile.mkstemp(prefix="_prova-", suffix=".html", dir=ROOT)
    os.close(fd)
    copy = pathlib.Path(name)
    try:
        copy.write_text(source[:i] + "\n" + injection(script) + "\n" + source[i:], encoding="utf-8")
        url = copy.as_uri()
        if width == 390:
            if height != 844:
                raise ValueError("telaio-390.html misura 390x844")
            url = (ROOT / "telaio-390.html").as_uri() + "?p=" + copy.name
        elif width < 500:
            raise ValueError("sotto 500px usare il telaio 390x844")
        with tempfile.TemporaryDirectory(prefix="oliva-chromium-") as profile:
            command = [browser, "--headless", "--disable-gpu", "--allow-file-access-from-files",
                       f"--user-data-dir={profile}", f"--window-size={max(500, width)},{height}",
                       "--remote-debugging-port=0", url]
            if os.geteuid() == 0:
                command.insert(1, "--no-sandbox")
            # Un log su disco evita che il pipe stderr del browser si riempia.
            with tempfile.TemporaryFile(mode="w+") as log:
                process = subprocess.Popen(command, stdout=log, stderr=log, start_new_session=True)
                try:
                    port_file = pathlib.Path(profile) / "DevToolsActivePort"
                    deadline = time.monotonic() + 15
                    while not port_file.exists():
                        if process.poll() is not None or time.monotonic() >= deadline:
                            log.seek(0)
                            raise RuntimeError("Chromium non si avvia: " + log.read()[-2000:])
                        time.sleep(.05)
                    port = port_file.read_text().splitlines()[0]
                    result = subprocess.run(["node", str(ROOT / "browser-title.js"), port],
                                            capture_output=True, text=True, timeout=40)
                    if result.returncode:
                        raise RuntimeError(result.stderr.strip())
                    title = result.stdout.strip()
                finally:
                    # Anche i figli devono smettere di scrivere prima di togliere il profilo.
                    try:
                        os.killpg(process.pid, signal.SIGTERM)
                        process.wait(timeout=5)
                    except (ProcessLookupError, subprocess.TimeoutExpired):
                        pass
                    finally:
                        try:
                            os.killpg(process.pid, signal.SIGKILL)
                        except ProcessLookupError:
                            pass
                        process.wait()
        rows, failures = verdict(script, title, width)
        print("\n".join(rows))
        print(f"\n{len(failures)} prove fallite" if failures else f"\n{len(rows)} prove passate")
        return bool(failures)
    finally:
        copy.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--script", choices=["regia.js", "censimento.js", "audit-mobile.js"], default="regia.js")
    parser.add_argument("--viewport", default="1280x900", help="larghezza x altezza; telefono: 390x844")
    parser.add_argument("--browser", default=shutil.which("chromium") or "chromium")
    args = parser.parse_args()
    try:
        width, height = map(int, args.viewport.split("x"))
        if min(width, height) <= 0:
            raise ValueError("viewport deve essere positivo")
        return run(args.script, (width, height), args.browser)
    except (OSError, ValueError, RuntimeError, subprocess.TimeoutExpired) as error:
        print(f"ERRORE · {error}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
