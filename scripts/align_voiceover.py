#!/usr/bin/env python3
"""
Alignement temporel mot à mot de la voix-off UBA Tchad.

Aucun modèle de reconnaissance vocale n'est nécessaire : le texte est connu,
on l'aligne sur des indices acoustiques mesurés dans le signal.

  1. Décodage PCM mono 16 kHz (ffmpeg) puis enveloppe RMS (fenêtre 20 ms, pas 5 ms).
  2. Groupes de souffle : pauses >= 110 ms. Le seuil est choisi automatiquement
     pour obtenir exactement le nombre de groupes du script (frontières à ±10 ms).
  3. Micro-pauses de ponctuation (virgules, deux-points) : recherche du creux
     d'énergie le plus profond autour de la position attendue (± 450 ms).
  4. Ancres sibilantes : les mots qui commencent par /s z ʃ ʒ/ (« solutions »,
     « sécurisées », « soldes », « simplifier », « sommets », « Tchad »…) sont
     calés sur le début mesuré de la friction (énergie > 3,5 kHz).
  5. Les autres mots sont répartis au prorata syllabique entre ancres, puis
     aimantés sur le creux d'énergie le plus proche (± 90 ms), avec une durée
     minimale de 60 ms par mot (ordre strictement croissant).

Chaque mot porte un champ « anchor » qui indique la provenance de son début :
  pause / ponctuation (mesuré, ±10-20 ms), sibilante (mesuré, ±30 ms),
  estimé (prorata syllabique aimanté, ±80-150 ms).
La mise en scène ne cale ses temps forts que sur des débuts mesurés.

Sortie : src/timeline/voiceover.json (consommé par la timeline Remotion).
Usage  : python3 scripts/align_voiceover.py [audio.mp3] [sortie.json]
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 16_000
HOP = 0.005
WIN = 0.020
PAUSE_MIN = 0.11  # durée minimale d'une pause entre deux groupes de souffle
SNAP = 0.09  # rayon d'aimantation d'une frontière ordinaire
PUNCT_SNAP = 0.45  # rayon de recherche d'une micro-pause de ponctuation
SIB_SNAP = 0.22  # rayon de recherche d'une attaque sibilante
MIN_WORD = 0.06  # durée minimale d'un mot

# Script découpé en groupes de souffle (« | »), dans l'ordre de l'audio.
# Le texte entre crochets donne la prononciation pour le poids syllabique.
# Le découpage a été vérifié par le débit (syllabes/s) et le nombre de
# sibilantes mesurées par groupe : la voix marque une pause expressive
# après « osent » (« …avec ceux qui osent | voir plus grand »).
SCRIPT = """
L'avenir se construit avec ceux qui osent |
voir plus grand. |
Et si la banque devenait enfin le reflet de vos ambitions ? |
Particuliers, familles, bâtisseurs du quotidien... |
UBA[u-bé-a] Tchad vous accompagne avec des solutions bancaires de proximité, |
des comptes adaptés à votre style de vie |
et des cartes sécurisées pour chaque instant. |
Plus besoin d'attendre. |
Prenez le contrôle de votre argent du bout des doigts. |
Ouvrez votre compte en ligne en quelques minutes, |
consultez vos soldes en temps réel et laissez Léo, votre banquier virtuel, simplifier vos paiements et transferts 24h/24[vin-quatre-heures-sur-vin-quatre]. |
Entrepreneurs, |
PME[pé-em-eu], grandes organisations : |
propulsez votre activité vers de nouveaux sommets grâce à notre expertise en Corporate[cor-po-reït] Banking[ban-king] et nos solutions de financement sur-mesure. |
UBA[u-bé-a] Tchad, |
la banque globale de l'Afrique. |
Rejoignez-nous dès aujourd'hui sur ubachad.com[u-ba-tchad-point-com].
"""

VOWELS = "aeiouyàâäéèêëîïôöùûüœ"
PUNCT_END = re.compile(r"[,;:.…?!]$")
# Attaque sibilante : s (sauf « s' » muet improbable), c+e/i/y, ç, z, ch, j, g+e/i, tch
SIBILANT_ONSET = re.compile(r"^(tch|ch|s|ç|z|j|c[eiyéèê]|g[eiéèê])", re.IGNORECASE)


def syllables(word: str) -> float:
    """Poids syllabique approximatif d'un mot français (+ groupes consonantiques)."""
    w = re.sub(r"[^a-zàâäéèêëîïôöùûüœç'-]", "", word.lower())
    if not w:
        return 0.5
    n = len(re.findall(f"[{VOWELS}]+", w))
    if n > 1 and re.search(f"[^{VOWELS}]es?$", w):
        n -= 1  # e muet final : « grande », « cartes »
    if n > 1 and w.endswith("ent") and not w.endswith(("ment", "ient")):
        n -= 1  # 3e personne du pluriel : « osent »
    return max(1, n) + 0.15 * len(re.findall(r"[bcdfgjklmnpqrstvwxz]{2,}", w))


def parse_script() -> list[list[dict]]:
    groups = []
    for raw in SCRIPT.strip().split("|"):
        words: list[dict] = []
        for tok in raw.split():
            if re.fullmatch(r"[,;:.…?!]+", tok) and words:
                words[-1]["text"] += f" {tok}"  # « ambitions ? » → ponctuation collée
                continue
            m = re.match(r"^(.*?)\[(.+)\]([.,:;?!…]*)$", tok)
            if m:
                text, weight = m.group(1) + m.group(3), float(len(m.group(2).split("-")))
            else:
                text, weight = tok, syllables(tok)
            words.append({"text": text, "weight": weight})
        groups.append(words)
    return groups


def load(path: str) -> np.ndarray:
    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(pcm, dtype=np.float32)


def frames(x: np.ndarray) -> np.ndarray:
    hop, win = int(SR * HOP), int(SR * WIN)
    n = 1 + (len(x) - win) // hop
    idx = np.arange(win)[None, :] + hop * np.arange(n)[:, None]
    return x[idx]


def t_of(i: int) -> float:
    return i * HOP + WIN / 2


def i_of(t: float) -> int:
    return int(round((t - WIN / 2) / HOP))


def speech_segments(db: np.ndarray, threshold: float) -> list[tuple[float, float]]:
    voiced = db > threshold
    segs, start = [], None
    for i, v in enumerate(voiced):
        if v and start is None:
            start = i
        elif not v and start is not None:
            segs.append([start, i])
            start = None
    if start is not None:
        segs.append([start, len(voiced)])
    merged = [segs[0]]
    for s, e in segs[1:]:
        if (s - merged[-1][1]) * HOP < PAUSE_MIN:
            merged[-1][1] = e
        else:
            merged.append([s, e])
    merged = [m for m in merged if (m[1] - m[0]) * HOP >= 0.06]  # clics isolés
    return [(t_of(s), t_of(e)) for s, e in merged]


def sibilant_onsets(fr: np.ndarray, db: np.ndarray) -> list[float]:
    spec = np.abs(np.fft.rfft(fr * np.hanning(fr.shape[1]), axis=1)) ** 2
    freqs = np.fft.rfftfreq(fr.shape[1], 1 / SR)
    ratio = spec[:, freqs >= 3500].sum(1) / (spec.sum(1) + 1e-12)
    sib = (ratio > 0.55) & (db > db.max() - 45)
    onsets, run = [], 0
    for i, v in enumerate(sib):
        run = run + 1 if v else 0
        if run == 4:  # 20 ms de friction continue
            onsets.append(t_of(i - 3))
    return onsets


class Aligner:
    def __init__(self, db: np.ndarray, sib: list[float]):
        self.db = np.convolve(db, np.ones(5) / 5, mode="same")
        self.sib = np.array(sib)

    def snap_min(self, t: float, lo: float, hi: float, radius: float) -> float:
        a, b = max(i_of(t - radius), i_of(lo)), min(i_of(t + radius), i_of(hi))
        if b <= a:
            return min(max(t, lo), hi)
        return t_of(a + int(np.argmin(self.db[a:b])))

    def gap(self, t: float, lo: float, hi: float) -> tuple[float, float]:
        """Micro-pause autour de t : (fin du mot précédent, début du suivant)."""
        a, b = max(i_of(t - PUNCT_SNAP), i_of(lo)), min(i_of(t + PUNCT_SNAP), i_of(hi))
        if b <= a:
            return t, t
        i = a + int(np.argmin(self.db[a:b]))
        floor = self.db[i] + 6.0
        left, right = i, i
        while left > a and self.db[left - 1] < floor:
            left -= 1
        while right < b and self.db[right + 1] < floor:
            right += 1
        return t_of(left), t_of(right)

    def sibilant(self, t: float, lo: float, hi: float) -> float | None:
        c = self.sib[(self.sib >= max(lo, t - SIB_SNAP)) & (self.sib <= min(hi, t + SIB_SNAP))]
        if not len(c):
            return None
        return float(c[np.argmin(np.abs(c - t))])

    def align_group(self, words: list[dict], g_s: float, g_e: float) -> list[tuple[float, float, str]]:
        n = len(words)
        starts: list[float | None] = [g_s] + [None] * (n - 1)
        how = ["pause"] + ["estimé"] * (n - 1)  # provenance du début de chaque mot
        ends: list[float | None] = [None] * (n - 1) + [g_e]
        total = sum(w["weight"] for w in words)
        cum = np.cumsum([0.0] + [w["weight"] for w in words])
        expect = [g_s + (g_e - g_s) * c / total for c in cum]  # début attendu de chaque mot

        # 1) micro-pauses de ponctuation
        anchors = [0]
        for k in range(n - 1):
            if PUNCT_END.search(words[k]["text"]):
                lo = (starts[anchors[-1]] or g_s) + MIN_WORD
                ends[k], starts[k + 1] = self.gap(expect[k + 1], lo, g_e - MIN_WORD)
                how[k + 1] = "ponctuation"
                anchors.append(k + 1)
        anchors.append(n)

        # 2) répartition entre ancres + attaques sibilantes + aimantation
        for a, b in zip(anchors[:-1], anchors[1:]):
            seg_s, seg_e = starts[a], ends[b - 1]
            chunk = words[a:b]
            sub_total = sum(w["weight"] for w in chunk)
            acc, prev = 0.0, seg_s
            for k in range(a, b - 1):
                acc += words[k]["weight"]
                est = seg_s + (seg_e - seg_s) * acc / sub_total
                lo = prev + MIN_WORD
                hi = seg_e - MIN_WORD * (b - 1 - k)
                t = None
                if SIBILANT_ONSET.match(words[k + 1]["text"]):
                    t = self.sibilant(est, lo, hi)
                    if t is not None and lo <= t <= hi:
                        how[k + 1] = "sibilante"
                if t is None:
                    t = self.snap_min(est, lo, hi, SNAP)
                t = min(max(t, lo), hi)
                ends[k], starts[k + 1] = t, t
                prev = t
        return [(float(s), float(e), h) for s, e, h in zip(starts, ends, how)]


def main() -> None:
    src = sys.argv[1] if len(sys.argv) > 1 else "public/audio/voix-off-uba-tchad.mp3"
    dst = Path(sys.argv[2] if len(sys.argv) > 2 else "src/timeline/voiceover.json")
    x = load(src)
    fr = frames(x)
    db = 20 * np.log10(np.sqrt(np.mean(fr**2, axis=1) + 1e-12))
    groups = parse_script()

    segs = None
    for thr in np.arange(-45.0, -24.0, 0.5):
        cand = speech_segments(db, thr)
        if len(cand) == len(groups):
            segs = cand
            break
    if segs is None:
        sys.exit(f"Impossible d'apparier {len(groups)} groupes de souffle : ajuster SCRIPT ou PAUSE_MIN.")

    aligner = Aligner(db, sibilant_onsets(fr, db))
    words_out, groups_out = [], []
    for g_i, (words, (g_s, g_e)) in enumerate(zip(groups, segs)):
        for w, (s, e, how) in zip(words, aligner.align_group(words, g_s, g_e)):
            words_out.append(
                {"text": w["text"], "start": round(s, 3), "end": round(e, 3), "group": g_i, "anchor": how}
            )
        syl = sum(w["weight"] for w in words)
        groups_out.append(
            {
                "index": g_i,
                "text": " ".join(w["text"] for w in words),
                "start": round(g_s, 3),
                "end": round(g_e, 3),
                "syllablesPerSecond": round(syl / (g_e - g_s), 2),
            }
        )

    payload = {
        "source": Path(src).name,
        "duration": round(len(x) / SR, 3),
        "method": "breath groups + punctuation micro-pauses + sibilant onsets + syllabic distribution",
        "groups": groups_out,
        "words": words_out,
    }
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Durée audio : {payload['duration']} s — {len(groups_out)} groupes, {len(words_out)} mots")
    for g in groups_out:
        print(f"[{g['start']:6.2f} → {g['end']:6.2f}] ({g['syllablesPerSecond']:.1f} syl/s) {g['text']}")
    print(f"→ {dst}")


if __name__ == "__main__":
    main()
