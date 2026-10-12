#!/usr/bin/env python3
"""
Détourage de Léo (public/brand/leo-source.jpg → public/brand/leo-cutout.png).

  1. La bulle rouge « Hi, I'm Leo » (anglais) est retirée : masque rouge saturé dans la
     moitié haute + remplissage des trous (le texte blanc), puis peinte en blanc.
  2. Le fond blanc relié aux bords est rendu transparent.
  3. Bande de transition (≈ 3 px) : alpha « couleur → transparence » par rapport au blanc,
     puis décontamination des couleurs (aucun liseré blanc sur fond sombre).
  4. Seule la plus grande composante est conservée (aucun résidu de la bulle).
  5. Recadrage serré sur le buste, export PNG RGBA.

Dépendances : pip install pillow scipy
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/brand/leo-source.jpg"
OUT = ROOT / "public/brand/leo-cutout.png"

rgb = np.asarray(Image.open(SRC).convert("RGB")).astype(float)
h, w, _ = rgb.shape
r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]

# 1. Bulle : rouge saturé, limitée au-dessus du menton (le t-shirt rouge reste intact)
yy = np.arange(h)[:, None]
bubble = (r > 150) & (g < 110) & (b < 110) & (r - g > 90) & (yy < 0.62 * h)
bubble = ndi.binary_fill_holes(ndi.binary_closing(bubble, iterations=3))
bubble = ndi.binary_dilation(bubble, iterations=3)
rgb[bubble] = 255

# 2. Fond : quasi-blanc relié aux bords de l'image
near_white = rgb.min(axis=2) > 232
labels, _ = ndi.label(near_white)
border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
background = np.isin(labels, border[border > 0])

# 3. Matte progressif sur une bande de 3 px autour du sujet
band = ndi.binary_dilation(background, iterations=3) & ~background
alpha = np.where(background, 0.0, 1.0)
lightness = rgb.min(axis=2)
soft = np.clip((255 - lightness) / (255 - 150), 0, 1)
alpha[band] = soft[band]
alpha = ndi.gaussian_filter(alpha, 0.6) * (~background | band)
a = np.clip(alpha, 1e-3, 1)[..., None]
clean = np.clip((rgb - (1 - a) * 255) / a, 0, 255)  # retire la contamination du blanc

# 4. Ne garder que le sujet (plus grande composante) : supprime les résidus isolés de la bulle
labels, n = ndi.label(alpha > 0.02)
sizes = ndi.sum(np.ones_like(alpha), labels, range(1, n + 1))
subject = ndi.binary_dilation(labels == (1 + int(np.argmax(sizes))), iterations=2)
alpha = alpha * subject

# 5. Recadrage
ys, xs = np.where(alpha > 0.02)
x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
rgba = np.dstack([clean, alpha[..., None] * 255]).astype(np.uint8)[y0:y1, x0:x1]
Image.fromarray(rgba, "RGBA").save(OUT, optimize=True)
print(f"→ {OUT.relative_to(ROOT)} · {x1 - x0}×{y1 - y0} px (source {w}×{h}, recadrage x={x0} y={y0})")
