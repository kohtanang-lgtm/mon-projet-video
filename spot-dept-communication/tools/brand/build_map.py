"""Contour du Cameroun (Natural Earth 1:50m, domaine public) → tracé SVG + position de Ngaoundéré.

Usage : python tools/brand/build_map.py chemin/vers/ne_50m_admin_0_countries.geojson
"""
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
NGAOUNDERE = (13.5833, 7.3167)   # lon, lat (ville) — le campus de Dang est à ~15 km au nord
VIEW_H = 1000.0


def main(src):
    data = json.loads(Path(src).read_text())
    feat = next(f for f in data["features"] if f["properties"].get("ADM0_A3") == "CMR")
    geom = feat["geometry"]
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    ring = max((p[0] for p in polys), key=len)
    lat0 = math.radians(6.0)

    def proj(lon, lat):
        return lon * math.cos(lat0), -lat

    pts = [proj(*c) for c in ring]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)
    s = VIEW_H / (y1 - y0)
    w = (x1 - x0) * s
    norm = [((x - x0) * s, (y - y0) * s) for x, y in pts]
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in norm) + " Z"
    px, py = proj(*NGAOUNDERE)
    pin = ((px - x0) * s, (py - y0) * s)
    # longueur du tracé (pour l'animation de dessin)
    length = sum(math.dist(norm[i], norm[i + 1]) for i in range(len(norm) - 1))
    out = {"viewBox": [0, 0, round(w, 1), VIEW_H], "d": d, "pin": [round(pin[0], 1), round(pin[1], 1)],
           "length": round(length, 1), "source": "Natural Earth 1:50m (domaine public)"}
    (ROOT / "config/map-cameroon.js").write_text(
        "/* Généré par tools/brand/build_map.py */\nwindow.DC = window.DC || {};\nDC.mapCameroon = "
        + json.dumps(out) + ";\n")
    print(f"{len(norm)} points · viewBox {out['viewBox']} · pin {out['pin']} · longueur {out['length']}")


if __name__ == "__main__":
    main(sys.argv[1])
