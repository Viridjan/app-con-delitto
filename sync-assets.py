#!/usr/bin/env python3
"""Aggancia le immagini consegnate da Codex all'app.

Codex consegna in assets/images/ con suffissi di versione (_v2, _v5, ...).
Questo script tiene la versione piu' alta di ogni personaggio, ne fa una copia
web leggera in assets/web/, e riscrive la mappa ASSETS dentro oliva-blu.html.
Da rilanciare a ogni consegna: python3 sync-assets.py
"""
import base64, re, sys
from pathlib import Path
from PIL import Image

SRC, WEB, HTML = Path("assets/images"), Path("assets/web"), Path("oliva-blu.html")
# `scena` a 1600 era quattro volte quello che serve: a 1920x1080 il palco e' un
# quadrato da ~390px, e 1200 tiene 3x di margine e resta 1:1 su uno schermo 4K.
LARGH = {"ritratto": 900, "attore": 700, "scena": 1200, "indizio": 512, "copertina": 560,
         "volto": 420, "detective": 520}
# Il vecchio Narratore non e' un personaggio della storia: non e' in `personaggi`, non ha
# un ritratto, e la mascotte che lo sostituiva ora sono le pose dell'investigatore.
ALIAS = {}
# Codex consegna varianti con nomi suoi: qui si dice quale riempie quale casella.
# La versione (_vN) la sceglie comunque lo script, tenendo la piu' alta.
SCELTE = {"copertina.png": "copertina_quadro_oliva_animato",
          "scena1.png": "scena1_back_sala2",
          "scena1_sx.png": "scena1_foreground_sala2_oggettoSX",
          "scena1_dx.png": "scena1_foreground_sala2_oggettoDX",
          "scena2.png": "scena2_back_sala1_scena2"}
PERSONE = ["giuseppe", "rosalia", "roberto", "augusto", "mauro"]
POSE = ["giuseppe_malore", "giuseppe_presentazione", "giuseppe_brindisi",
        "rosalia_allarmata", "rosalia_pensierosa", "rosalia_brindisi",
        "roberto_preoccupato", "roberto_accoglienza", "roberto_brindisi",
        "augusto_sorpreso", "augusto_brindisi", "mauro_nervoso", "mauro_guardingo",
        "mauro_brindisi"]
OGGETTI = ["bicchiere", "bottiglietta", "foglio", "biglietto"]
# Le scene 3 e 4 giocano nella sala della scena 1 (`sfondoDa:"scena1"`), quindi
# i loro sfondi non li disegna nessuno: incorporarli costava 772KB di file.
# Se una di quelle scene torna ad avere una sala sua, togli il nome da qui e
# rilancia: i .png sono sempre in assets/images/.
# Rosalia e Mauro hanno una posa in ogni scena, quindi il loro ritaglio neutro
# non lo chiede nessuno: i .png sono in trash/immagini/. Se una scena futura li lascia
# senza posa, `smoke.js` fallisce prima che la figura sparisca dal palco.
MAI_DISEGNATI = {"scena3_back_brindisi.png", "scena3_back_malore.png",
                 "attore_rosalia.png", "attore_mauro.png"}
# solo le caselle che l'app sa mostrare: le varianti e le prove restano fuori dal file
ATTESI = (set(SCELTE)
          | {"detective_riflessione.png", "detective_osservazione.png",
           "detective_presentazione.png", "detective_scoperta.png",
           "detective_soluzione.png"}
          | {f"attore_{n}.png" for n in PERSONE}
          | {f"attore_{n}.png" for n in POSE}
          | {f"ritratto_{n}.png" for n in PERSONE}
          | {f"volto_{n}.png" for n in PERSONE if n != "giuseppe"}   # i quattro sospetti
          | {f"indizio_{n}.png" for n in OGGETTI}) - MAI_DISEGNATI

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
    """copertina.png -> copertina · scena1_sx.png -> scena · attore_mauro.png -> attore"""
    return re.match(r"[a-z]+", Path(key).stem).group(0)

def logico(nome):
    """ritratto_roberto_v5.png -> ('ritratto_roberto.png', 5)."""
    m = re.fullmatch(r"(.+?)(?:_v(\d+))?\.(png|jpg|jpeg|webp)", nome, re.I)
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
        if not f.is_file(): continue             # salta le sottocartelle e gli scarti
        if "-" in f.name:
            sys.exit(f"nome immagine non valido (usa _): {f.name}")
        key, ver = logico(f.name)
        if not key: continue
        for casella in scelto.get(key, [key]):
            if ver >= migliori.get(casella, (-1, None))[0]:
                migliori[casella] = (ver, f)

    WEB.mkdir(parents=True, exist_ok=True)
    # Gli asset esclusi consapevolmente non sono anomalie: restano nei sorgenti
    # per un eventuale riuso, ma non devono sporcare il report a ogni sync.
    scartati = sorted(k for k in migliori if k not in ATTESI and k not in MAI_DISEGNATI)
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
        ritaglia = key.startswith("attore_") or key[:-4].endswith(("_sx", "_dx"))
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
        im.save(out, "WEBP", quality=80, method=4)
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
    mancanti = sorted(k for k in ATTESI - set(mappa) if not k[:-4].endswith(("_sx", "_dx")))
    if mancanti:
        print("ancora da consegnare: " + ", ".join(mancanti))
    print(f"\n{len(mappa)} immagini agganciate · oliva-blu.html ora pesa "
          f"{HTML.stat().st_size // 1024}KB")

main()
