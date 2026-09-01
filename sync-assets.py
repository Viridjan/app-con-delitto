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
LARGH = {"ritratto": 900, "attore": 700, "scena": 1600, "indizio": 512, "copertina": 560,
         "volto": 420, "detective": 520}
# Il Narratore e' uscito dall'elenco dei personaggi il 29 agosto 2026: nessuna
# schermata disegna piu' il suo ritratto, quindi non lo si incorpora (erano 200KB).
ALIAS = {}
# Codex consegna varianti con nomi suoi: qui si dice quale riempie quale casella.
# La versione (-vN) la sceglie comunque lo script, tenendo la piu' alta.
SCELTE = {"copertina.png": "quadro-oliva-animato",
          "scena1.png": "sala2",
          "scena1-sx.png": "sala2-oggettoSX",
          "scena1-dx.png": "sala2-oggettoDX",
          "scena2.png": "sala1-scena2",
          "scena3.png": "brindisi",
          "scena4.png": "malore",
          "scena5.png": "indagine"}
PERSONE = ["giuseppe", "rosalia", "roberto", "augusto", "mauro"]
POSE = ["giuseppe-malore", "giuseppe-presentazione", "giuseppe-brindisi",
        "rosalia-allarmata", "rosalia-pensierosa", "rosalia-brindisi",
        "roberto-preoccupato", "roberto-accoglienza", "roberto-brindisi",
        "augusto-sorpreso", "augusto-brindisi", "mauro-nervoso", "mauro-guardingo",
        "mauro-brindisi"]
OGGETTI = ["bicchiere", "bottiglietta", "foglio", "biglietto"]
# solo le caselle che l'app sa mostrare: le varianti e le prove restano fuori dal file
ATTESI = ({"copertina.png", "detective-riflessione.png", "detective-osservazione.png",
           "detective-presentazione.png", "detective-scoperta.png",
           "detective-soluzione.png"}
          | {f"scena{i}.png" for i in range(1, 6)}
          | {f"scena{i}-{lato}.png" for i in range(1, 6) for lato in ("sx", "dx")}
          | {f"attore-{n}.png" for n in PERSONE}
          | {f"attore-{n}.png" for n in POSE}
          | {f"ritratto-{n}.png" for n in PERSONE}
          | {f"volto-{n}.png" for n in PERSONE if n != "giuseppe"}   # i quattro sospetti
          | {f"indizio-{n}.png" for n in OGGETTI})

def _blocco(medie, minimo=2):
    """Estremi del gruppo di righe (o colonne) piu' pieno, saltando il resto."""
    blocchi, dentro = [], None
    for i, v in enumerate(medie + b"\x00"):
        if v >= minimo and dentro is None: dentro = i
        elif v < minimo and dentro is not None:
            blocchi.append((sum(medie[dentro:i]), dentro, i)); dentro = None
    if not blocchi: return None
    _, a, b = max(blocchi)
    return a, b

def bbox_pulito(im):
    """Bordo della figura, ignorando quello che le sta staccato attorno.

    getbbox() si ferma al primo pixel non trasparente: basta una riga di guida
    lasciata sul bordo della tela - i ritagli "brindisi" ne avevano una, spessa
    due pixel e ben opaca - perche' il ritaglio prenda tutta la tela e la figura
    resti piccola e storta. Qui si tiene solo la fascia di colonne (e di righe)
    piu' piena, quella dove sta il disegno. Un elemento davvero staccato dalla
    figura andrebbe perso: finora non ne esistono.
    """
    a = im.getchannel("A")
    w, h = a.size
    x = _blocco(a.resize((w, 1), Image.BOX).tobytes())
    y = _blocco(a.resize((1, h), Image.BOX).tobytes())
    if not x or not y: return a.getbbox()
    return (x[0], y[0], x[1], y[1])

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
    scelto = {}
    for casella, sorgente in SCELTE.items():          # un file puo' servire piu' caselle
        scelto.setdefault(sorgente + ".png", []).append(casella)
    migliori = {}                                # nome logico -> (versione, file)
    for f in sorted(SRC.iterdir()):
        if not f.is_file(): continue             # salta bocciate/
        key, ver = logico(f.name)
        if not key: continue
        for casella in scelto.get(key, [key]):   # variante promossa a una o piu' caselle
            if ver >= migliori.get(casella, (-1, None))[0]:
                migliori[casella] = (ver, f)

    WEB.mkdir(parents=True, exist_ok=True)
    scartati = sorted(k for k in migliori if k not in ATTESI)
    mappa = {}
    for key, (_, f) in sorted(migliori.items()):
        if key not in ATTESI: continue
        out = WEB / (Path(key).stem + ".webp")
        # Non ricodificare asset invariati. Oltre a velocizzare il sync, evita
        # di tenere in memoria i 21 fotogrammi della copertina a ogni consegna.
        if out.is_file() and out.stat().st_size and out.stat().st_mtime >= f.stat().st_mtime:
            b64 = base64.b64encode(out.read_bytes()).decode()
            mappa[key] = f"data:image/webp;base64,{b64}"
            print(f"{f.name:32} -> {out.name:28} {out.stat().st_size // 1024:4}KB  cache")
            continue
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
            bbox = bbox_pulito(im)
            if bbox: im = im.crop(bbox)
            alt = 900
            if im.height > alt:
                im = im.resize((round(im.width * alt / im.height), alt), Image.LANCZOS)
        else:
            largh = LARGH.get(famiglia(key), 800)
            if im.width > largh:
                im = im.resize((largh, round(im.height * largh / im.width)), Image.LANCZOS)
        # method=6 arrivava a saturare la memoria con le tavole quadrate RGBA
        # degli indizi; 4 mantiene una resa indistinguibile alle dimensioni web.
        im.save(out, "WEBP", quality=86, method=4)
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
