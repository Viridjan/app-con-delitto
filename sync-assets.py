#!/usr/bin/env python3
"""Aggancia le immagini consegnate da Codex all'app.

Codex consegna in assets/images/ con suffissi di versione (-v2, -v5, ...).
Questo script tiene la versione piu' alta di ogni personaggio, ne fa una copia
web leggera in assets/web/, e riscrive la mappa ASSETS dentro oliva-blu.html.
Da rilanciare a ogni consegna: python3 sync-assets.py
"""
import base64, re, sys
from pathlib import Path
from PIL import Image

SRC, WEB, HTML = Path("assets/images"), Path("assets/web"), Path("oliva-blu.html")
LARGH = {"ritratto": 900, "attore": 700, "scena": 1600, "indizio": 512, "copertina": 560}
ALIAS = {"investigatore": "narratore"}          # il meeple investigatore e' il Narratore
# Codex consegna varianti con nomi suoi: qui si dice quale riempie quale casella.
# La versione (-vN) la sceglie comunque lo script, tenendo la piu' alta.
SCELTE = {"copertina.png": "quadro-oliva-animato",
          "scena1.png": "sala2",
          "scena1-sx.png": "sala2-oggettoSX",
          "scena1-dx.png": "sala2-oggettoDX"}
PERSONE = ["giuseppe", "rosalia", "roberto", "augusto", "mauro"]
OGGETTI = ["bicchiere", "bottiglietta", "foglio", "biglietto"]
# solo le caselle che l'app sa mostrare: le varianti e le prove restano fuori dal file
ATTESI = ({"copertina.png"}
          | {f"scena{i}.png" for i in range(1, 6)}
          | {f"scena{i}-{lato}.png" for i in range(1, 6) for lato in ("sx", "dx")}
          | {f"attore-{n}.png" for n in PERSONE}
          | {f"ritratto-{n}.png" for n in PERSONE + ["narratore"]}
          | {f"indizio-{n}.png" for n in OGGETTI})

def famiglia(key):
    """copertina.png -> copertina · scena1-sx.png -> scena · attore-mauro.png -> attore"""
    return re.match(r"[a-z]+", Path(key).stem).group(0)

def logico(nome):
    """ritratto-roberto-v5.png -> ('ritratto-roberto.png', 5)"""
    m = re.fullmatch(r"(.+?)(?:-v(\d+))?\.(png|jpg|jpeg|webp)", nome, re.I)
    if not m: return None, 0
    base, ver = m.group(1), int(m.group(2) or 0)
    for a, b in ALIAS.items():
        base = base.replace(a, b)
    return base + ".png", ver

def main():
    if not SRC.is_dir(): sys.exit(f"manca {SRC}/")
    scelto = {v + ".png": k for k, v in SCELTE.items()}
    migliori = {}                                # nome logico -> (versione, file)
    for f in sorted(SRC.iterdir()):
        if not f.is_file(): continue             # salta bocciate/
        key, ver = logico(f.name)
        key = scelto.get(key, key)               # variante promossa a casella
        if key and ver >= migliori.get(key, (-1, None))[0]:
            migliori[key] = (ver, f)

    WEB.mkdir(parents=True, exist_ok=True)
    scartati = sorted(k for k in migliori if k not in ATTESI)
    mappa = {}
    for key, (_, f) in sorted(migliori.items()):
        if key not in ATTESI: continue
        im = Image.open(f)
        if getattr(im, "n_frames", 1) > 1:
            # animata: si ridimensiona fotogramma per fotogramma, se no ne resta uno solo
            largh = LARGH.get(famiglia(key), 800)
            fotogrammi, durate = [], []
            for i in range(im.n_frames):
                im.seek(i)
                d = im.convert("RGBA")
                if d.width > largh:
                    d = d.resize((largh, round(d.height * largh / d.width)), Image.LANCZOS)
                fotogrammi.append(d)
                durate.append(im.info.get("duration") or 80)
            out = WEB / (Path(key).stem + ".webp")
            fotogrammi[0].save(out, "WEBP", save_all=True, append_images=fotogrammi[1:],
                               duration=durate, loop=0, quality=68, method=6)
            b64 = base64.b64encode(out.read_bytes()).decode()
            mappa[key] = f"data:image/webp;base64,{b64}"
            print(f"{f.name:32} -> {out.name:28} {out.stat().st_size // 1024:4}KB  {im.n_frames} fotogrammi")
            continue
        ritaglia = key.startswith("attore-") or key[:-4].endswith(("-sx", "-dx"))
        if ritaglia and im.mode in ("RGBA", "LA"):
            # i ritagli arrivano dentro un quadrato con molto vuoto attorno:
            # senza togliere il vuoto la figura sul palco resta minuscola
            bbox = im.getchannel("A").getbbox()
            if bbox: im = im.crop(bbox)
            alt = 900
            if im.height > alt:
                im = im.resize((round(im.width * alt / im.height), alt), Image.LANCZOS)
        else:
            largh = LARGH.get(famiglia(key), 800)
            if im.width > largh:
                im = im.resize((largh, round(im.height * largh / im.width)), Image.LANCZOS)
        out = WEB / (Path(key).stem + ".webp")
        im.save(out, "WEBP", quality=86, method=6)
        # L'artifact pubblicato non puo' leggere file locali (niente capability assets),
        # quindi le immagini viaggiano dentro l'HTML come data URI.
        b64 = base64.b64encode(out.read_bytes()).decode()
        mappa[key] = f"data:image/webp;base64,{b64}"
        print(f"{f.name:32} -> {out.name:28} {out.stat().st_size // 1024:4}KB")

    righe = "\n".join(f'  "{k}": "{v}",' for k, v in mappa.items())
    blocco = "const ASSETS = {\n" + righe + "\n};"
    html = HTML.read_text(encoding="utf-8")
    nuovo, n = re.subn(r"const ASSETS = \{.*?\};", blocco, html, count=1, flags=re.S)
    if not n: sys.exit("blocco ASSETS non trovato in oliva-blu.html")
    HTML.write_text(nuovo, encoding="utf-8")
    if scartati:
        print("\nfuori dalle caselle previste, non agganciate: " + ", ".join(scartati))
    mancanti = sorted(k for k in ATTESI - set(mappa) if not k[:-4].endswith(("-sx", "-dx")))
    if mancanti:
        print("ancora da consegnare: " + ", ".join(mancanti))
    print(f"\n{len(mappa)} immagini agganciate · oliva-blu.html ora pesa "
          f"{HTML.stat().st_size // 1024}KB")

main()
