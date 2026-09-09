#!/usr/bin/env python3
"""Incolla regia.js in coda allo <script> dell'app e legge il referto dal titolo.

   python3 prova-regia.py

Serve un browser vero: le prove premono, trascinano e mandano tasti su nodi
veri, cose che lo stub di smoke.js non ha. La copia di lavoro nasce accanto
all'app perche' `assets/assets.js` si carica per percorso relativo, e viene
tolta alla fine."""
import pathlib, re, subprocess, sys, shutil

APP, CHECK, COPIA = pathlib.Path("oliva-blu.html"), pathlib.Path("regia.js"), pathlib.Path("_prova-regia.html")

def main():
    s = APP.read_text(encoding="utf-8")
    i = s.rindex("</script>")
    COPIA.write_text(s[:i] + "\n" + CHECK.read_text(encoding="utf-8") + "\n" + s[i:], encoding="utf-8")
    try:
        out = subprocess.run(
            ["chromium", "--headless", "--disable-gpu", "--allow-file-access-from-files",
             "--window-size=1280,900", "--virtual-time-budget=12000", "--dump-dom",
             f"file://{COPIA.resolve()}"],
            capture_output=True, text=True, timeout=120).stdout
    finally:
        COPIA.unlink(missing_ok=True)
        shutil.rmtree("__pycache__", ignore_errors=True)
    m = re.search(r"<title>(.*?)</title>", out, re.S)
    if not m:
        sys.exit("la pagina non ha scritto nessun referto: controlla che chromium sia installato")
    righe = [r.strip() for r in m.group(1).split("|")]
    print("\n".join(righe))
    falliti = [r for r in righe if not r.startswith("ok")]
    if falliti:
        sys.exit(f"\n{len(falliti)} prove fallite")
    print(f"\n{len(righe)} prove passate")

if __name__ == "__main__":
    main()
