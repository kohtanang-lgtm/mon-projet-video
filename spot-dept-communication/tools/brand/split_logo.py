"""Découpe le logo officiel du Département en calques alignés au pixel près (même cadre que
l'original). Chaque pixel appartient à un seul calque : superposés, ils redonnent exactement
le logo fourni. Le film anime ces calques pour « construire » la marque.

Usage : python tools/brand/split_logo.py
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets/brand/logo_dc.png"
OUT = ROOT / "assets/brand/layers"
SCALE = 2  # calques suréchantillonnés ×2 (Lanczos) pour rester nets pendant les mises à l'échelle


def main():
    im = Image.open(SRC).convert("RGBA")
    a = np.array(im).astype(int)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    h, w = r.shape
    yy, xx = np.mgrid[0:h, 0:w]
    op = al > 8

    grey = op & (abs(r - g) < 18) & (abs(g - b) < 18) & (r > 110) & (r < 200)
    black = op & (r < 70) & (g < 70) & (b < 70)
    green = op & (g > r + 25) & (g > b + 15) & ~black
    red = op & (r > 170) & (g < 110) & (b < 100)
    yellow = op & (r > 180) & (g > 180) & (b < 110)

    def box(x0, y0, x1, y1):
        return (xx >= x0) & (xx <= x1) & (yy >= y0) & (yy <= y1)

    ribbon = op & (yy >= 393)
    book = op & (yy >= 338) & (yy < 393) & ~ribbon
    quote_l = (black | green) & box(88, 95, 160, 152)
    quote_r = black & box(366, 266, 440, 318)
    tassel = (green | black) & box(322, 88, 358, 202)
    board = (green | black) & (yy <= 148) & ~quote_l & ~tassel & box(90, 50, 400, 148) & ~(black & box(352, 92, 402, 150))
    caption = black & box(195, 252, 325, 292)          # « FALSH / Université de Ngaoundéré »
    d_letter = green & box(165, 145, 250, 265) & ~board
    c_arcs = red & (yy < 330)
    dots = yellow & box(295, 192, 352, 212)
    waves = yellow & ~dots & (xx > 340)
    # l'ellipse = grand aplat gris ; les liserés gris d'anticrénelage des autres formes en sont exclus
    body = ndimage.binary_opening(grey & ~ribbon & ~book, iterations=3)
    lab, n = ndimage.label(body)
    biggest = np.argmax(np.bincount(lab.ravel())[1:]) + 1
    ellipse = grey & ndimage.binary_dilation(lab == biggest, iterations=3)
    bubble = black & ~(ribbon | book | quote_l | quote_r | tassel | board | caption)

    layers = {
        "ellipse": ellipse, "d": d_letter, "c": c_arcs, "dots": dots, "waves": waves,
        "caption": caption, "board": board, "tassel": tassel, "quote_l": quote_l,
        "quote_r": quote_r, "bubble": bubble, "book": book, "ribbon": ribbon,
    }
    # exclusivité : un pixel n'appartient qu'au premier calque qui le réclame
    order = ["ribbon", "book", "quote_l", "quote_r", "tassel", "board", "caption", "d", "c", "dots",
             "waves", "ellipse", "bubble"]
    label = np.zeros((h, w), int)
    for i, k in enumerate(order, start=1):
        label[(label == 0) & layers[k]] = i
    # pixels d'anticrénelage non classés → calque du pixel classé le plus proche
    unl = op & (label == 0)
    _, (iy, ix) = ndimage.distance_transform_edt(label == 0, return_indices=True)
    label[unl] = label[iy[unl], ix[unl]]

    OUT.mkdir(parents=True, exist_ok=True)
    meta = {"width": w * SCALE, "height": h * SCALE, "layers": {}}
    big = im.resize((w * SCALE, h * SCALE), Image.LANCZOS)
    big_a = np.array(big)
    lab_big = np.array(Image.fromarray(label.astype(np.uint8)).resize((w * SCALE, h * SCALE), Image.NEAREST))
    for i, k in enumerate(order, start=1):
        # débord d'1 px sous les calques voisins : supprime les liserés de filtrage aux jonctions
        bleed = ndimage.binary_dilation(label == i, iterations=1) & op
        m = np.array(Image.fromarray(bleed.astype(np.uint8) * 255).resize((w * SCALE, h * SCALE), Image.NEAREST)) > 0
        if not m.any():
            print("calque vide :", k)
            continue
        px = big_a.copy()
        px[..., 3] = np.where(m, px[..., 3], 0)
        Image.fromarray(px).save(OUT / f"dc_{k}.png", optimize=True)
        ys, xs = np.where(m & (px[..., 3] > 0))
        meta["layers"][k] = {"x0": int(xs.min()), "y0": int(ys.min()), "x1": int(xs.max()), "y1": int(ys.max()),
                             "cx": round(float(xs.mean()), 1), "cy": round(float(ys.mean()), 1)}
        print(f"{k:8s} {m.sum():7d} px  bbox {meta['layers'][k]}")
    big.save(OUT / "dc_full.png", optimize=True)
    (ROOT / "config/logo-layers.js").write_text(
        "/* Généré par tools/brand/split_logo.py */\nwindow.DC = window.DC || {};\nDC.logoLayers = "
        + json.dumps(meta, indent=2) + ";\n")


if __name__ == "__main__":
    main()
