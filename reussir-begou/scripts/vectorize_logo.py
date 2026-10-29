"""
Vectorise le logo REUSS!R BÉ-GOU (image JPEG) en tracés SVG séparés lettre par lettre,
pour pouvoir animer chaque lettre et garder un rendu net à toutes les tailles.

Étapes : agrandissement x4, redressement (le logo est incliné de 7°), seuillage,
découpage en composantes connexes, puis tracé de chaque groupe avec potrace.

Prérequis : potrace (apt install potrace), numpy, scipy, Pillow.
usage : python3 scripts/vectorize_logo.py assets-source/logo-reussir-begou.jpg src/logo/logoPaths.ts
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

SCALE = 4
ANGLE = -7.05  # redressement
BG = (59, 66, 147)  # bleu du fond du logo
CROP = (420, 700, 3840, 2560)  # x0, y0, x1, y1 après redressement

# Groupes de composantes (numérotées par ndi.label, dans l'ordre de balayage de l'image).
GROUPS = {
    'R1': [4], 'E': [5], 'U': [6], 'S1': [3], 'S2': [2], 'R2': [7],
    'excl_bar': [1], 'excl_dot': [8],
    'B': [14, 16, 18], 'E2': [13, 9], 'dash': [17], 'G': [11], 'O': [10, 15], 'U2': [12],
}


def main(src: str, out: str) -> None:
    im = Image.open(src).convert('RGB')
    im = im.resize((im.width * SCALE, im.height * SCALE), Image.LANCZOS)
    im = im.rotate(ANGLE, resample=Image.BICUBIC, expand=True, fillcolor=BG)
    im = im.filter(ImageFilter.GaussianBlur(1.6))
    a = np.array(im).astype(float)
    fg = a[..., 0] > 150  # blanc ou rouge (le fond bleu a peu de rouge)
    lab, _ = ndi.label(fg)
    x0, y0, x1, y1 = CROP
    lab = lab[y0:y1, x0:x1]

    result = {'viewBox': [0, 0, x1 - x0, y1 - y0], 'paths': {}}
    with tempfile.TemporaryDirectory() as tmp:
        for name, ids in GROUPS.items():
            m = np.isin(lab, ids)
            if not m.any():
                raise SystemExit(f'groupe vide : {name} (le découpage ne correspond plus à cette image)')
            pbm = Path(tmp) / f'{name}.pbm'
            svg = Path(tmp) / f'{name}.svg'
            Image.fromarray(np.where(m, 0, 255).astype(np.uint8)).convert('1').save(pbm)
            subprocess.run(['potrace', str(pbm), '-b', 'svg', '--flat', '-t', '20', '-a', '1.1', '-O', '0.5', '-u', '10', '-o', str(svg)], check=True)
            txt = svg.read_text()
            result['transform'] = re.search(r'<g transform="([^"]+)"', txt).group(1)
            d = re.search(r'<path d="([^"]+)"', txt, re.S).group(1).replace('\n', ' ')
            ys, xs = np.nonzero(m)
            result['paths'][name] = {'d': d, 'bbox': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]}

    lines = [
        '// Généré par scripts/vectorize_logo.py à partir de assets-source/logo-reussir-begou.jpg',
        '// (logo redressé de 7°, agrandi x4 puis vectorisé avec potrace).',
        f"export const LOGO_VIEWBOX = {json.dumps(result['viewBox'])} as const;",
        f"export const LOGO_TRANSFORM = {json.dumps(result['transform'])};",
        'export type LogoPart = {d: string; bbox: [number, number, number, number]};',
        'export const LOGO_PATHS: Record<string, LogoPart> = {',
    ]
    for k, v in result['paths'].items():
        lines.append(f"  {k}: {{d: {json.dumps(v['d'])}, bbox: {json.dumps(v['bbox'])}}},")
    lines.append('};')
    Path(out).write_text('\n'.join(lines) + '\n')
    print('écrit :', out)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
