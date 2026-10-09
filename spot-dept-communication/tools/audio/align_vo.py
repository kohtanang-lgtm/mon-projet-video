"""Voix off enregistrée → repères de synchronisation (config/timeline.js + .json).

L'enregistrement n'est ni coupé ni retimé : le film suit le rythme du comédien.
L'outil découpe la voix en phrases sur ses pauses réelles (programmation dynamique : chaque
frontière tombe sur une pause détectée, la durée de chaque phrase reste proportionnelle à son
texte), applique un traitement léger (passe-haut, compression douce, −18 LUFS) et écrit
assets/audio/vo_master.wav.

Usage : python tools/audio/align_vo.py [assets/audio/source/voix_off.mp3]
Option : VERIFY_ASR=/chemin/sherpa-onnx-whisper-small → retranscrit chaque phrase pour contrôle.
"""
import json
import math
import os
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).parent))
from dsp import SR, compressor, db, eq, limiter  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
FPS = 60
END_HOLD = 1.55   # plan fixe sur le logo après le dernier mot (s)

# Texte effectivement prononcé, phrase par phrase (identifiants = repères utilisés par les scènes).
PHRASES = [
    ("hook_a", "À l'Université de Ngaoundéré,"),
    ("hook_b", "un département fait parler de lui."),
    ("prat_a", "Cent pour cent d'immersion pratique."),
    ("prat_b", "Pas une théorie dans le vide."),
    ("annee", "Chaque année."),
    ("studios", "Des amphis au Média Lab,"),
    ("welcome", "bienvenue au Département de Communication."),
    ("pros_a", "Ici, les professionnels de demain ne naissent pas,"),
    ("pros_b", "ils se forment."),
    ("aud_a", "Des étudiants aguerris,"),
    ("aud_b", "des partenaires rassurés"),
    ("aud_c", "qui savent leur communication entre de bonnes mains."),
    ("secret", "Notre secret ?"),
    ("p1", "Des enseignants-chercheurs qualifiés,"),
    ("p2", "un matériel de pointe"),
    ("p3", "et un suivi personnalisé,"),
    ("lic", "de la Licence Pro en Journalisme et Culture numérique"),
    ("master", "jusqu'au Master."),
    ("reuni", "Tout est réuni pour faire la différence."),
    ("join_a", "Rejoignez-nous à Dang,"),
    ("join_b", "à Ngaoundéré."),
    ("avenir", "Votre avenir mérite l'excellence."),
    ("sig_a", "Département de Communication."),
    ("sig_b", "Votre histoire commence ici."),
]


def load(path):
    out = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.float32).astype(np.float64)


def weight(text):
    """Poids « durée » d'une phrase : lettres + petite constante d'attaque/chute."""
    return sum(ch.isalnum() for ch in text) + 3


def detect(x, win_s=0.01):
    win = int(win_s * SR)
    n = len(x) // win
    e = 20 * np.log10(np.sqrt((x[: n * win].reshape(n, win) ** 2).mean(1)) + 1e-9)
    speech = np.percentile(e[e > -70], 90)
    act = e > speech - 30
    on = np.where(act)[0]
    a, b = on[0], on[-1] + 1
    gaps = []
    i = a
    while i < b:
        if not act[i]:
            j = i
            while j < b and not act[j]:
                j += 1
            if j - i >= 4:  # ≥ 40 ms
                gaps.append((i * win_s, j * win_s))
            i = j
        else:
            i += 1
    return a * win_s, b * win_s, gaps


def align(t0, t1, gaps, phrases):
    """Choisit len(phrases)-1 pauses (dans l'ordre) qui minimisent l'écart aux durées attendues."""
    n, m = len(phrases), len(gaps)
    w = np.array([weight(t) for _, t in phrases], float)
    span = t1 - t0 - sum(min(g[1] - g[0], 0.35) for g in gaps) * 0.6
    rate = span / w.sum()
    LAMBDA = 1.6

    def cost(start, end, i, gap_len):
        d = max(end - start, 0.05)
        return math.log(d / (rate * w[i])) ** 2 - LAMBDA * min(gap_len, 0.4)

    INF = float("inf")
    # dp[i][j] : phrases 0..i placées, la frontière après la phrase i est la pause j
    dp = np.full((n - 1, m), INF)
    back = np.zeros((n - 1, m), int)
    for j in range(m):
        dp[0][j] = cost(t0, gaps[j][0], 0, gaps[j][1] - gaps[j][0])
    for i in range(1, n - 1):
        for j in range(i, m):
            best, arg = INF, -1
            for k in range(i - 1, j):
                if dp[i - 1][k] == INF:
                    continue
                c = dp[i - 1][k] + cost(gaps[k][1], gaps[j][0], i, gaps[j][1] - gaps[j][0])
                if c < best:
                    best, arg = c, k
            dp[i][j], back[i][j] = best, arg
    last = [(dp[n - 2][j] + math.log(max(t1 - gaps[j][1], 0.05) / (rate * w[n - 1])) ** 2, j) for j in range(n - 2, m)]
    _, j = min(last)
    picks = [j]
    for i in range(n - 2, 0, -1):
        j = back[i][j]
        picks.append(j)
    picks = picks[::-1]
    bounds = [(t0, None)] + [gaps[p] for p in picks] + [(None, t1)]
    cues = {}
    for i, (cid, text) in enumerate(phrases):
        s = bounds[i][1] if i else t0
        e = bounds[i + 1][0] if i < n - 1 else t1
        cues[cid] = {"start": round(s, 3), "end": round(e, 3), "text": text}
    return cues


def verify(x, cues, model_dir):
    import sherpa_onnx
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=f"{model_dir}/small-encoder.int8.onnx", decoder=f"{model_dir}/small-decoder.int8.onnx",
        tokens=f"{model_dir}/small-tokens.txt", language="fr", task="transcribe", num_threads=4)
    from scipy import signal
    y = signal.resample_poly(x, 1, 3).astype(np.float32)   # 48 k → 16 k
    for cid, c in cues.items():
        seg = y[int(c["start"] * 16000): int(c["end"] * 16000) + 800]
        s = rec.create_stream()
        s.accept_waveform(16000, seg)
        rec.decode_stream(s)
        print(f"  {cid:8s} {c['start']:6.2f}–{c['end']:6.2f}  ASR: {s.result.text.strip()}")


def process(x):
    x = eq(x, "highpass", 70, q=0.75)
    x = eq(x, "peak", 3200, q=0.9, gain_db=1.2)            # un soupçon de présence
    x = compressor(x, threshold_db=-30, ratio=2.0, attack=0.01, release=0.15, knee_db=8)
    import pyloudnorm as pyln
    x = x * db(-18.0 - pyln.Meter(SR).integrated_loudness(x))
    return limiter(x, ceiling_db=-1.5)


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "assets/audio/source/voix_off.mp3"
    x = load(src)
    t0, t1, gaps = detect(x)
    cues = align(t0, t1, gaps, PHRASES)
    vo_len = len(x) / SR
    duration = math.ceil((max(cues["sig_b"]["end"], 0) + END_HOLD) * 10) / 10
    print(f"voix : {vo_len:.3f} s · parole {t0:.2f} → {t1:.2f} s · {len(gaps)} pauses · spot : {duration:.1f} s")
    for cid, c in cues.items():
        print(f"  {cid:8s} {c['start']:6.2f} → {c['end']:6.2f}  {c['text']}")
    if os.environ.get("VERIFY_ASR"):
        print("contrôle par transcription :")
        verify(x, cues, os.environ["VERIFY_ASR"])

    y = process(x)
    y = np.pad(y, (0, max(0, int(duration * SR) - len(y))))[: int(duration * SR)]
    sf.write(ROOT / "assets/audio/vo_master.wav", y.astype(np.float32), SR, subtype="PCM_24")
    timeline = {"fps": FPS, "duration": duration, "voice": "recording", "voice_file": "assets/audio/vo_master.wav",
                "voice_source": str(src.relative_to(ROOT)) if src.is_relative_to(ROOT) else src.name, "cues": cues}
    (ROOT / "config/timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=2))
    (ROOT / "config/timeline.js").write_text(
        "/* Généré par tools/audio/align_vo.py — ne pas éditer à la main. */\n"
        "window.DC = window.DC || {};\nDC.timeline = " + json.dumps(timeline, ensure_ascii=False, indent=2) + ";\n")
    print("→ assets/audio/vo_master.wav, config/timeline.js")


if __name__ == "__main__":
    main()
