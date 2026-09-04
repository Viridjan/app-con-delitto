#!/usr/bin/env python3
"""Aggancia le immagini consegnate da Codex all'app.

Codex consegna in assets/images/ con suffissi di versione (_v2, _v5, ...).
Questo script tiene la versione piu' alta di ogni personaggio, ne fa una copia
web leggera in assets/web/ e riscrive la mappa ASSETS usata da oliva-blu.html.
Da rilanciare a ogni consegna: python3 sync-assets.py
"""
import base64, hashlib, json, re, subprocess, sys
from pathlib import Path
from PIL import Image

SRC, WEB, HTML = Path("assets/images"), Path("assets/web"), Path("oliva-blu.html")
ASSET_JS = Path("assets/assets.js")
CACHE_FILE = WEB / ".sources.json"
CACHE_VERSION = 1  # aumentare quando cambiano ritaglio o parametri di codifica
# `scena` a 1600 era quattro volte quello che serve: a 1920x1080 il palco e' un
# quadrato da ~390px, e 1200 tiene 3x di margine e resta 1:1 su uno schermo 4K.
IMAGE_WIDTHS = {"ritratto": 900, "attore": 700, "scena": 1200, "indizio": 512, "copertina": 560,
         "volto": 420, "detective": 520}
# Il vecchio Narratore non e' un personaggio della storia: non e' in `personaggi`, non ha
# un ritratto, e la mascotte che lo sostituiva ora sono le pose dell'investigatore.
ALIAS = {}
# Codex consegna varianti con nomi suoi: qui si dice quale riempie quale slot.
# La versione (_vN) la sceglie comunque lo script, tenendo la piu' alta.
SLOT_SOURCES = {"copertina.png": "copertina_quadro_oliva_animato",
          "scena1.png": "scena1_back_sala2",
          "scena1_sx.png": "scena1_foreground_sala2_oggettoSX",
          "scena1_dx.png": "scena1_foreground_sala2_oggettoDX",
          "scena2.png": "scena2_back_sala1_scena2"}
try:
    INVENTORY = json.loads(subprocess.run(
        ["node", "asset-inventory.js"], check=True, capture_output=True, text=True
    ).stdout)
except (OSError, subprocess.CalledProcessError, json.JSONDecodeError) as error:
    sys.exit(f"impossibile leggere l'inventario degli asset: {error}")
CHARACTERS = INVENTORY["characters"]
POSES = INVENTORY["poses"]
CLUES = INVENTORY["clues"]
# Le scene 3 e 4 giocano nella sala della scena 1 (`sfondoDa:"scena1"`), quindi
# i loro sfondi non li disegna nessuno: incorporarli costava 772KB di file.
# Se una di quelle scene torna ad avere una sala sua, togli il nome da qui e
# rilancia: i .png sono sempre in assets/images/.
# Rosalia e Mauro hanno una posa in ogni scena, quindi il loro ritaglio neutro
# non lo chiede nessuno: i .png sono in trash/immagini/. Se una scena futura li lascia
# senza posa, `smoke.js` fallisce prima che la figura sparisca dal palco.
EXCLUDED_ASSETS = {"scena3_back_brindisi.png", "scena3_back_malore.png",
                 "attore_rosalia.png", "attore_mauro.png"}
# solo le caselle che l'app sa mostrare: le varianti e le prove restano fuori dal file
EXPECTED_ASSETS = (set(SLOT_SOURCES)
          | {"detective_riflessione.png", "detective_osservazione.png",
           "detective_presentazione.png", "detective_scoperta.png",
           "detective_soluzione.png"}
          | {f"attore_{n}.png" for n in CHARACTERS}
          | {f"attore_{n}.png" for n in POSES}
          | {f"ritratto_{n}.png" for n in CHARACTERS}
          | {f"volto_{n}.png" for n in CHARACTERS if n != "giuseppe"}   # i quattro sospetti
          | {f"indizio_{n}.png" for n in CLUES}) - EXCLUDED_ASSETS

def densest_span(averages, minimum=2):
    """Estremi del gruppo di lines (o colonne) piu' pieno, saltando il resto."""
    spans, start = [], None
    for i, v in enumerate(averages + b"\x00"):
        if v >= minimum and start is None: start = i
        elif v < minimum and start is not None:
            spans.append((sum(averages[start:i]), start, i)); start = None
    if not spans: return None
    _, a, b = max(spans)
    return a, b

def clean_bbox(im):
    """Bordo della figura, ignorando quello che le sta staccato attorno.

    getbbox() si ferma al primo pixel non trasparente: basta una riga di guida
    lasciata sul bordo della tela - i ritagli "brindisi" ne avevano una, spessa
    due pixel e ben opaca - perche' il ritaglio prenda tutta la tela e la figura
    resti piccola e storta. Qui si tiene solo la fascia di colonne (e di lines)
    piu' piena, quella dove sta il disegno. Un elemento davvero staccato dalla
    figura andrebbe perso: finora non ne esistono.
    """
    a = im.getchannel("A")
    w, h = a.size
    x = densest_span(a.resize((w, 1), Image.BOX).tobytes())
    y = densest_span(a.resize((1, h), Image.BOX).tobytes())
    if not x or not y: return a.getbbox()
    return (x[0], y[0], x[1], y[1])

def asset_family(key):
    """copertina.png -> copertina · scena1_sx.png -> scena · attore_mauro.png -> attore"""
    return re.match(r"[a-z]+", Path(key).stem).group(0)

def logical_name(name):
    """ritratto_roberto_v5.png -> ('ritratto_roberto.png', 5)."""
    m = re.fullmatch(r"(.+?)(?:_v(\d+))?\.(png|jpg|jpeg|webp)", name, re.I)
    if not m: return None, 0
    base_name, version = m.group(1), int(m.group(2) or 0)
    for a, b in ALIAS.items():
        base_name = base_name.replace(a, b)
    return base_name + ".png", version

def write_if_changed(path, content):
    """Evita di toccare timestamp e watcher quando il contenuto e' identico."""
    if path.is_file() and path.read_text(encoding="utf-8") == content:
        return False
    path.write_text(content, encoding="utf-8")
    return True

def main():
    if not SRC.is_dir(): sys.exit(f"manca {SRC}/")
    selected_sources = {}
    for slot, source_name in SLOT_SOURCES.items():          # un file puo' servire piu' caselle
        selected_sources.setdefault(source_name + ".png", []).append(slot)
    best_sources = {}                                # nome logico -> (versione, file)
    for f in sorted(SRC.iterdir()):
        if not f.is_file(): continue             # salta le sottocartelle e gli scarti
        if "-" in f.name:
            sys.exit(f"name immagine non valido (usa _): {f.name}")
        key, version = logical_name(f.name)
        if not key: continue
        for slot in selected_sources.get(key, [key]):
            if version >= best_sources.get(slot, (-1, None))[0]:
                best_sources[slot] = (version, f)

    WEB.mkdir(parents=True, exist_ok=True)
    try:
        source_cache = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        source_cache = {}
    if not isinstance(source_cache, dict):
        source_cache = {}
    next_cache = {}
    # Gli asset esclusi consapevolmente non sono anomalie: restano nei sorgenti
    # per un eventuale riuso, ma non devono sporcare il report a ogni sync.
    skipped_assets = sorted(k for k in best_sources if k not in EXPECTED_ASSETS and k not in EXCLUDED_ASSETS)
    asset_map = {}
    for key, (_, f) in sorted(best_sources.items()):
        if key not in EXPECTED_ASSETS: continue
        out = WEB / (Path(key).stem + ".webp")
        stat = f.stat()
        signature = [CACHE_VERSION, f.name, stat.st_mtime_ns, stat.st_size]
        next_cache[key] = signature
        # Non ricodificare asset invariati. Oltre a velocizzare il sync, evita
        # di tenere in memoria i 21 frame della copertina a ogni consegna. Il
        # nome sorgente e' parte della firma: tornando da _v3 a _v2 non si puo'
        # riusare per errore il WebP della revisione rimossa.
        if out.is_file() and out.stat().st_size and source_cache.get(key) == signature:
            b64 = base64.b64encode(out.read_bytes()).decode()
            asset_map[key] = f"data:image/webp;base64,{b64}"
            print(f"{f.name:32} -> {out.name:28} {out.stat().st_size // 1024:4}KB  cache")
            continue
        im = Image.open(f)
        if getattr(im, "n_frames", 1) > 1:
            # animata: si ridimensiona fotogramma per fotogramma, se no ne resta uno solo
            target_width = IMAGE_WIDTHS.get(asset_family(key), 800)
            frames, durations = [], []
            for i in range(im.n_frames):
                im.seek(i)
                d = im.convert("RGBA")
                if d.width > target_width:
                    d = d.resize((target_width, round(d.height * target_width / d.width)), Image.LANCZOS)
                frames.append(d)
                durations.append(im.info.get("duration") or 80)
            frames[0].save(out, "WEBP", save_all=True, append_images=frames[1:],
                               duration=durations, loop=0, quality=68, method=6)
            b64 = base64.b64encode(out.read_bytes()).decode()
            asset_map[key] = f"data:image/webp;base64,{b64}"
            print(f"{f.name:32} -> {out.name:28} {out.stat().st_size // 1024:4}KB  {im.n_frames} frames")
            continue
        should_crop = key.startswith("attore_") or key[:-4].endswith(("_sx", "_dx"))
        if should_crop and im.mode in ("RGBA", "LA"):
            # i ritagli arrivano dentro un quadrato con molto vuoto attorno:
            # senza togliere il vuoto la figura sul palco resta minuscola
            bbox = clean_bbox(im)
            if bbox: im = im.crop(bbox)
            alt = 900
            if im.height > alt:
                im = im.resize((round(im.width * alt / im.height), alt), Image.LANCZOS)
        else:
            target_width = IMAGE_WIDTHS.get(asset_family(key), 800)
            if im.width > target_width:
                im = im.resize((target_width, round(im.height * target_width / im.width)), Image.LANCZOS)
        # method=6 arrivava a saturare la memoria con le tavole quadrate RGBA
        # degli indizi; 4 mantiene una resa indistinguibile alle dimensioni web.
        im.save(out, "WEBP", quality=80, method=4)
        # L'artifact pubblicato non puo' leggere file locali (niente capability assets),
        # quindi le immagini viaggiano in assets.js come data URI.
        b64 = base64.b64encode(out.read_bytes()).decode()
        asset_map[key] = f"data:image/webp;base64,{b64}"
        print(f"{f.name:32} -> {out.name:28} {out.stat().st_size // 1024:4}KB")

    lines = "\n".join(f'  "{k}": "{v}",' for k, v in asset_map.items())
    asset_block = "const ASSETS = {\n" + lines + "\n};\n"
    write_if_changed(ASSET_JS, "/* Generato da sync-assets.py: non modificare a mano. */\n" + asset_block)
    # L'impronta del contenuto entra nell'URL. Il nome del file non cambia mai,
    # quindi senza di essa un browser che ha gia' visto `assets.js` continua a
    # servire le immagini vecchie — o, se le ha viste mancare, la loro assenza:
    # e' quello che e' successo su Pages il 4 settembre 2026.
    fingerprint = hashlib.sha1(asset_block.encode("utf-8")).hexdigest()[:8]
    script_tag = f'<script src="assets/assets.js?v={fingerprint}"></script>'
    html = HTML.read_text(encoding="utf-8")
    updated_html, n = re.subn(r"const ASSETS = \{.*?\};\n?", "", html, count=1, flags=re.S)
    if n:
        updated_html = updated_html.replace("<script>\n/* ------------------------------------------------",
                              script_tag + '\n<script>\n/* ------------------------------------------------', 1)
    elif 'src="assets/assets.js' not in updated_html:
        sys.exit("asset_block ASSETS o riferimento assets/assets.js non trovato")
    updated_html = re.sub(r'<script src="assets/assets\.js[^"]*"></script>', script_tag, updated_html, count=1)
    write_if_changed(HTML, updated_html)
    write_if_changed(CACHE_FILE, json.dumps(next_cache, ensure_ascii=False, indent=2) + "\n")
    if skipped_assets:
        print("\nfuori dalle caselle previste, non agganciate: " + ", ".join(skipped_assets))
    missing_assets = sorted(k for k in EXPECTED_ASSETS - set(asset_map) if not k[:-4].endswith(("_sx", "_dx")))
    if missing_assets:
        print("ancora da consegnare: " + ", ".join(missing_assets))
    print(f"\n{len(asset_map)} immagini agganciate · oliva-blu.html ora pesa "
          f"{HTML.stat().st_size // 1024}KB")

if __name__ == "__main__":
    main()
