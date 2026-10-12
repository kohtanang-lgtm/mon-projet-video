#!/usr/bin/env python3
"""
Vectorisation du logo officiel UBA à partir de l'icône fournie (public/brand/uba-logo-icon.jpg).

  • Marque : reconstruite géométriquement. Les deux formes sont symétriques par rotation de
    180° ; chacune est faite de segments droits et d'une courbe de Bézier dont les paramètres
    sont ajustés (Nelder-Mead) sur l'icône sur-échantillonnée → contours parfaitement nets.
  • Mot « UBA » : vectorisé par potrace après sur-échantillonnage ×12 (contours sous-pixel).

Sortie : src/brand/ubaLogo.ts (repère : l'icône carrée occupe 0 → 100).
Dépendances : pip install pillow scipy potracer
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import potrace
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter
from scipy.optimize import minimize

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/brand/uba-logo-icon.jpg"
OUT = ROOT / "src/brand/ubaLogo.ts"

img = np.asarray(Image.open(SRC).convert("RGB")).astype(float) / 255
# Le canal vert sépare le blanc (≈ 1) du rouge UBA (≈ 0,1)
WHITE = np.clip((img[..., 1] - 0.11) / (0.95 - 0.11), 0, 1)

# Carré rouge de l'icône (mesuré) et rayon de ses coins
red = (img[..., 0] > 0.6) & (img[..., 1] < 0.35) & (img[..., 2] < 0.35)
ys, xs = np.where(red)
IX, IY, ISIZE = xs.min(), ys.min(), max(xs.max() - xs.min(), ys.max() - ys.min()) + 1
RED_HEX = "#{:02X}{:02X}{:02X}".format(*np.median(img[red] * 255, axis=0).astype(int))
RADIUS = 91 / 425  # rayon relatif des coins (ajusté sur le contour de l'icône)


def to_unit(x: float, y: float) -> str:
    return f"{(x - IX) / ISIZE * 100:.3f} {(y - IY) / ISIZE * 100:.3f}"


# ————————————————————————————————————————————————————————— Marque (ajustement géométrique)

X0, Y0, W, H, S = 480, 150, 240, 235, 4
target = np.asarray(
    Image.fromarray((WHITE[Y0 : Y0 + H, X0 : X0 + W] * 255).astype(np.uint8)).resize((W * S, H * S), Image.BICUBIC)
).astype(float) / 255


def bezier(p0, p1, p2, p3, n=48):
    t = np.linspace(0, 1, n)[:, None]
    return (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t**2 * p2 + t**3 * p3


def control_points(q):
    ax, ay, bx, by, cx, ang, length, k1, k2, mx, my, k3 = q
    A, B, C = np.array([ax, ay]), np.array([bx, by]), np.array([cx, by])
    u = np.array([np.cos(ang), np.sin(ang)])
    D = A + u * length
    return [A, D, D + u * k1, C + np.array([k2, k3]), C, B], np.array([mx, my])


def shapes(q):
    pts, centre = control_points(q)
    A, D, P1, P2, C, B = pts
    left = np.vstack([A, bezier(D, P1, P2, C), B])
    return left, 2 * centre - left  # seconde forme : rotation de 180°


def render(q):
    canvas = Image.new("L", (W * S, H * S), 0)
    draw = ImageDraw.Draw(canvas)
    for poly in shapes(q):
        draw.polygon([((x - X0) * S, (y - Y0) * S) for x, y in poly], fill=255)
    return np.asarray(canvas).astype(float) / 255


q0 = np.array([543.5, 196.7, 505.0, 371.9, 577.3, 1.08, 106.6, 38.8, 46.2, 599.5, 266.2, 0.0])
fit = minimize(
    lambda q: np.mean((gaussian_filter(render(q), 1.0) - target) ** 2),
    q0,
    method="Nelder-Mead",
    options={"maxiter": 4000, "xatol": 1e-3, "fatol": 1e-8, "adaptive": True},
)
r = render(fit.x)
iou = ((r > 0.5) & (target > 0.5)).sum() / ((r > 0.5) | (target > 0.5)).sum()
pts, centre = control_points(fit.x)


def mark_path(points) -> str:
    A, D, P1, P2, C, B = points
    return f"M{to_unit(*A)}L{to_unit(*D)}C{to_unit(*P1)} {to_unit(*P2)} {to_unit(*C)}L{to_unit(*B)}Z"


mark_left = mark_path(pts)
mark_right = mark_path([2 * centre - p for p in pts])
mark_box = np.vstack([np.vstack(shapes(fit.x))])

# ————————————————————————————————————————————————————————— Mot « UBA » (potrace)

WX0, WY0, WX1, WY1, K = 476, 398, 698, 486, 12
crop = WHITE[WY0:WY1, WX0:WX1]
big = np.asarray(
    Image.fromarray((crop * 255).astype(np.uint8)).resize(((WX1 - WX0) * K, (WY1 - WY0) * K), Image.BICUBIC)
).astype(float) / 255
mask = gaussian_filter(big, 0.25 * K) > 0.5
traced = potrace.Bitmap(~mask).trace(
    turdsize=500, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=0.7, opticurve=True, opttolerance=3.0
)
word_parts = []
for curve in traced:
    p = lambda pt: to_unit(pt.x / K + WX0, pt.y / K + WY0)
    word_parts.append(f"M{p(curve.start_point)}")
    for seg in curve.segments:
        word_parts.append(f"L{p(seg.c)}L{p(seg.end_point)}" if seg.is_corner else f"C{p(seg.c1)} {p(seg.c2)} {p(seg.end_point)}")
    word_parts.append("Z")
wy, wx = np.where(mask)


def bbox_unit(x0, y0, x1, y1):
    return [round(float(v), 3) for v in ((x0 - IX) / ISIZE * 100, (y0 - IY) / ISIZE * 100, (x1 - IX) / ISIZE * 100, (y1 - IY) / ISIZE * 100)]


mark_bbox = bbox_unit(mark_box[:, 0].min(), mark_box[:, 1].min(), mark_box[:, 0].max(), mark_box[:, 1].max())
word_bbox = bbox_unit(wx.min() / K + WX0, wy.min() / K + WY0, wx.max() / K + WX0, wy.max() / K + WY0)

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(
    f"""// Généré par scripts/vectorize_logo.py à partir de public/brand/uba-logo-icon.jpg — ne pas éditer.
// Repère : l'icône carrée officielle occupe 0 → 100 sur chaque axe.

/** Rouge de l'icône officielle (médiane mesurée). */
export const UBA_RED = "{RED_HEX}";

/** Icône d'application : carré rouge aux coins arrondis. */
export const UBA_ICON = {{ size: 100, radius: {RADIUS * 100:.2f} }} as const;

/** Marque : deux formes symétriques (rotation de 180°). IoU avec l'original : {iou:.3f}. */
export const UBA_MARK = {{
  left: "{mark_left}",
  right: "{mark_right}",
  bbox: {mark_bbox},
}} as const;

/** Mot « UBA » (italique gras) vectorisé. */
export const UBA_WORD = {{
  d: "{''.join(word_parts)}",
  bbox: {word_bbox},
}} as const;
""",
    encoding="utf-8",
)
print(f"→ {OUT.relative_to(ROOT)} · rouge {RED_HEX} · IoU marque {iou:.3f} · mot {len(traced)} contours")
