#!/usr/bin/env python3
"""
Sous-titres SRT du spot (réseaux sociaux : la plupart des vidéos sont vues sans le son).
Les sous-titres reprennent le minutage mot à mot de la voix-off (src/timeline/voiceover.json),
décalé du pré-roll vidéo. Lignes ≤ 40 caractères, 2 lignes max par carton.

Usage : python3 scripts/make_subtitles.py [sortie.srt]
Facebook reconnaît la langue via le nom de fichier : « nom.fr_FR.srt ».
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VO = json.loads((ROOT / "src/timeline/voiceover.json").read_text(encoding="utf-8"))
OFFSET = float(re.search(r"VO_OFFSET = ([\d.]+)", (ROOT / "src/timeline/cues.ts").read_text()).group(1))
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "out/uba-tchad-spot.fr_FR.srt"
MAX_LINE, MAX_CUE = 40, 4.2


def ts(t: float) -> str:
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def lines_of(words):
    """Une ligne si possible, sinon deux lignes équilibrées (coupure de préférence après une virgule)."""
    texts = [w["text"] for w in words]
    one = " ".join(texts)
    if len(one) <= MAX_LINE:
        return [one]
    best = None
    for k in range(1, len(texts)):
        a, b = " ".join(texts[:k]), " ".join(texts[k:])
        if len(a) > MAX_LINE or len(b) > MAX_LINE:
            continue
        score = abs(len(a) - len(b)) - (12 if texts[k - 1][-1] in ",:;" else 0)
        if best is None or score < best[0]:
            best = (score, [a, b])
    return best[1] if best else [one, ""] + [""]  # > 2 lignes : signalé comme trop long


cues = []
for g in VO["groups"]:
    words = [w for w in VO["words"] if w["group"] == g["index"]]
    chunk = []
    for w in words:
        trial = chunk + [w]
        too_long = len(lines_of(trial)) > 2 or (trial[-1]["end"] - trial[0]["start"]) > MAX_CUE
        if chunk and too_long:
            cues.append(chunk)
            chunk = [w]
        else:
            chunk = trial
    if chunk:
        cues.append(chunk)

blocks = []
for i, c in enumerate(cues):
    start = c[0]["start"] + OFFSET
    end = c[-1]["end"] + OFFSET + 0.25
    if i + 1 < len(cues):
        end = min(end, cues[i + 1][0]["start"] + OFFSET - 0.04)
    text = "\n".join(lines_of(c)).replace("...", "…")
    blocks.append(f"{i + 1}\n{ts(start)} --> {ts(end)}\n{text}\n")

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text("\n".join(blocks), encoding="utf-8")
print(f"→ {OUT} · {len(blocks)} cartons")
