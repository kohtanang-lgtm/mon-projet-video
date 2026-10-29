"""Génère des tuiles de grain (bruit gaussien) pour la texture « film »."""
import sys
import numpy as np
from PIL import Image

out_dir = sys.argv[1] if len(sys.argv) > 1 else 'public/grain'
rng = np.random.default_rng(7)
for i in range(6):
    n = rng.normal(128, 38, (400, 400)).clip(0, 255).astype(np.uint8)
    Image.fromarray(n, 'L').save(f'{out_dir}/grain{i}.png', optimize=True)
