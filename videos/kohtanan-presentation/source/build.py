"""Assemble index.html from the template + edit data.

Inputs (all in source/):
  index.template.html  composition markup, styles, timeline code
  captions.json        caption groups / words / keyword flags (edit words here)
  cutmap.json          silence-cut segment map (output timeline)

usage: python3 source/build.py   (run from the project root)
"""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "source"

DURATION = 54.9

# Moments on the edited (output) timeline, in seconds.
TIMES = {
    "idcOut": 3.95,  # ID card gone
    "locStart": 8.25,  # "Mes racines sont au Sud…"
    "locEnd": 12.2,
    "chipsStart": 24.5,  # "…en visuels percutants, en vidéos d'impact, en campagnes…"
    "chip1": 24.69,
    "chip2": 25.97,
    "chip3": 27.01,
    "splitIn": 28.2,  # "Du design graphique…"
    "splitOut": 35.0,  # "…je donne une forte identité"
    "panels": [28.37, 29.49, 30.77, 32.11, 33.23],
    "flashes": [13.567, 28.2, 40.933, 46.5],  # section transitions
    "glitches": [40.933],
}

# (file, start, duration, media_start, volume)
SFX = [
    ("whoosh-cinematic", 0.0, 2.0, 1.9, 0.5),  # ID card flies in
    ("impact-bass-1", 0.3, 1.8, 0.0, 0.55),  # card lands
    ("sparkle", 1.05, 1.2, 0.0, 0.3),  # holographic sweep
    ("whoosh-short", 3.45, 0.5, 0.0, 0.5),  # card flips out
    ("pop", TIMES["locStart"], 0.5, 0.0, 0.5),  # location card opens
    ("ping", TIMES["locStart"] - 0.02, 1.0, 0.0, 0.7),  # pin lands
    ("whoosh-short", 13.41, 0.5, 0.0, 0.45),  # "Aujourd'hui" section
    ("pop", TIMES["chip1"] - 0.11, 0.5, 0.0, 0.45),
    ("pop", TIMES["chip2"] - 0.11, 0.5, 0.0, 0.45),
    ("pop", TIMES["chip3"] - 0.11, 0.5, 0.0, 0.45),
    ("whoosh", TIMES["splitIn"] - 0.16, 0.5, 0.0, 0.55),  # split-screen opens
    ("click-soft", TIMES["panels"][1] - 0.07, 0.35, 0.0, 0.8),
    ("click-soft", TIMES["panels"][2] - 0.07, 0.35, 0.0, 0.8),
    ("click-soft", TIMES["panels"][3] - 0.07, 0.35, 0.0, 0.8),
    ("click-soft", TIMES["panels"][4] - 0.07, 0.35, 0.0, 0.8),
    ("whoosh-short", TIMES["splitOut"] - 0.46, 0.5, 0.0, 0.45),  # split closes
    ("glitch-1", 40.62, 1.5, 0.5, 0.4),  # "Cette 22e édition…"
    ("impact-bass-2", 45.84, 1.1, 1.4, 0.5),  # call-to-action drop
    ("sparkle", 50.0, 1.2, 0.0, 0.3),  # "aimez, commentez, partagez"
]


def sfx_tags():
    out = []
    for i, (name, start, dur, mstart, vol) in enumerate(SFX, 1):
        attrs = [
            f'id="sfx-{i:02d}"',
            f'src="assets/sfx/{name}.mp3"',
            f'data-start="{start:.3f}"',
            f'data-duration="{dur:.3f}"',
        ]
        if mstart:
            attrs.append(f'data-media-start="{mstart:.3f}"')
        attrs += [f'data-track-index="{12 + (i % 3)}"', f'data-volume="{vol}"']
        out.append("      <audio " + " ".join(attrs) + "></audio>")
    return "\n".join(out)


def wave_bars(n=110):
    bars = []
    for i in range(n):
        h = 8 + 30 * abs(math.sin(i * 0.37) * math.cos(i * 0.11 + 1.3))
        bars.append(f'<i style="height: {h:.0f}px"></i>')
    return "".join(bars)


def main():
    caps = json.loads((SRC / "captions.json").read_text())
    cut = json.loads((SRC / "cutmap.json").read_text())
    segs = [[round(s["out_start"], 4), round(s["out_end"], 4)] for s in cut]
    times = dict(TIMES)
    html = (SRC / "index.template.html").read_text()
    rep = {
        "__DURATION__": f"{DURATION}",
        "__LOC_START__": f"{times['locStart']}",
        "__LOC_DUR__": f"{times['locEnd'] - times['locStart']:.3f}",
        "__CHIPS_START__": f"{times['chipsStart']}",
        "__CHIPS_DUR__": f"{times['splitIn'] + 0.15 - times['chipsStart']:.3f}",
        "__CAPTIONS__": json.dumps(caps, ensure_ascii=False, separators=(",", ":")),
        "__SEGS__": json.dumps(segs),
        "__TIMES__": json.dumps(times),
        "__SFX__": sfx_tags(),
        "__WAVE__": wave_bars(),
    }
    for k, v in rep.items():
        html = html.replace(k, v)
    assert "__" not in html.replace("__timelines", "").replace("__hyperframes", ""), "unreplaced placeholder"
    (ROOT / "index.html").write_text(html)
    print("index.html written:", len(caps), "caption groups,", len(segs), "segments,", len(SFX), "sfx")


if __name__ == "__main__":
    main()
