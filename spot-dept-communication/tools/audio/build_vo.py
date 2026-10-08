"""Voix témoin : synthèse Kokoro (ff_siwis), traitement « voix pub », montage des pauses
stratégiques et génération des repères de synchronisation (config/timeline.js + .json).

Usage :
  KOKORO_DIR=/chemin/vers/modeles python tools/audio/build_vo.py

Pour remplacer la voix témoin par l'enregistrement d'un comédien, déposez un WAV par groupe
dans assets/audio/vo_takes/G01.wav … G11.wav (mêmes découpages que ci-dessous) : ils sont
utilisés à la place de la synthèse, et tout le film se recale automatiquement.
"""
import json
import os
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal

sys.path.insert(0, str(Path(__file__).parent))
from dsp import SR, compressor, db, eq, envelope, limiter  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
TAKES = ROOT / "assets/audio/vo_takes"
CACHE = ROOT / "assets/audio/.tts_cache"
TOTAL = 45.0          # durée du spot (s)
FPS = 60
INTRO = 0.55          # silence avant la première syllabe (le point REC s'allume)
END_HOLD_MIN = 1.5    # plan fixe minimal sur le logo après le dernier mot

# Chaque groupe est synthétisé d'un seul tenant (prosodie naturelle), puis découpé en phrases
# sur ses pauses de ponctuation. `gap_after` = pause ajoutée après la phrase (pause stratégique).
GROUPS = [
    ("G01", [("hook_a", "À l'Université de Ngaoundéré,", 0.0),
             ("hook_b", "un département fait parler de lui.", 0.0)], 0.45),
    ("G02", [("prat_a", "Cent pour cent d'immersion pratique :", 0.14),
             ("prat_b", "pas de théorie dans le vide.", 0.0)], 0.30),
    ("G03", [("studios", "Des amphis aux studios,", 0.18),
             ("welcome", "bienvenue au Département de Communication.", 0.0)], 0.55),
    ("G04", [("pros_a", "Ici, les professionnels de demain ne naissent pas :", 0.28),
             ("pros_b", "ils se forment.", 0.0)], 0.45),
    ("G05", [("aud_a", "Des étudiants aguerris,", 0.06),
             ("aud_b", "et des partenaires rassurés,", 0.04),
             ("aud_c", "qui savent leur communication entre de bonnes mains.", 0.0)], 0.55),
    ("G06", [("secret", "Notre secret ?", 0.0)], 0.62),
    ("G07", [("p1", "Des enseignants-chercheurs qualifiés,", 0.08),
             ("p2", "un matériel de pointe,", 0.08),
             ("p3", "et un suivi personnalisé,", 0.10),
             ("lic", "de la Licence Pro Journalisme et Culture numérique,", 0.04),
             ("master", "jusqu'au Master.", 0.0)], 0.40),
    ("G08", [("reuni", "Tout est réuni pour faire la différence.", 0.0)], 0.50),
    ("G09", [("join_a", "Rejoignez-nous à Dang,", 0.04),
             ("join_b", "à Ngaoundéré.", 0.0)], 1.05),   # le compteur d'abonnés vit dans ce silence
    ("G10", [("avenir", "Votre avenir mérite l'excellence.", 0.0)], 0.45),
    ("G11", [("sig_a", "Département de Communication :", 0.32),
             ("sig_b", "votre histoire commence ici.", 0.0)], 0.0),
]


def synth(key, text):
    take = TAKES / f"{key}.wav"
    if take.exists():
        x, sr = sf.read(take, always_2d=False)
        return (x.mean(1) if x.ndim > 1 else x), sr, "take"
    CACHE.mkdir(parents=True, exist_ok=True)
    cached = CACHE / f"{key}.wav"
    if cached.exists():
        x, sr = sf.read(cached)
        return x, sr, "cache"
    from kokoro_onnx import Kokoro
    kdir = Path(os.environ.get("KOKORO_DIR", "models"))
    k = Kokoro(str(kdir / "kokoro-v1.0.onnx"), str(kdir / "voices-v1.0.bin"))
    x, sr = k.create(text, voice="ff_siwis", speed=1.0, lang="fr-fr")
    sf.write(cached, x, sr)
    return x, sr, "kokoro"


def to48k(x, sr):
    if sr == SR:
        return x
    g = np.gcd(SR, sr)
    return signal.resample_poly(x, SR // g, sr // g)


def activity_db(x, win):
    n = len(x) // win
    e = np.sqrt((x[: n * win].reshape(n, win) ** 2).mean(1) + 1e-12)
    return 20 * np.log10(e)


def split_phrases(x, phrases):
    """Découpe un groupe sur ses pauses : pour chaque frontière attendue (estimée au prorata
    du nombre de caractères), on prend la pause détectée la plus proche."""
    win = int(0.01 * SR)
    d = activity_db(x, win)
    thr = d.max() - 38
    act = d > thr
    on = np.where(act)[0]
    a, b = on[0], on[-1] + 1
    x = x[a * win: b * win]
    act = act[a:b]
    if len(phrases) == 1:
        return [x]
    gaps = []
    i = 0
    while i < len(act):
        if not act[i]:
            j = i
            while j < len(act) and not act[j]:
                j += 1
            if j - i >= 5:   # ≥ 50 ms
                gaps.append(((i + j) / 2 * win / SR, (j - i) * win / SR))
            i = j
        else:
            i += 1
    dur = len(x) / SR
    lens = np.array([len(p[1]) for p in phrases], float)
    expected = np.cumsum(lens)[:-1] / lens.sum() * dur
    cuts, used = [], set()
    for e in expected:
        cands = [(abs(g[0] - e) - 0.15 * g[1], k) for k, g in enumerate(gaps) if k not in used]
        if not cands:
            raise RuntimeError("pause introuvable")
        _, k = min(cands)
        used.add(k)
        cuts.append(gaps[k][0])
    cuts = sorted(cuts)
    idx = [0] + [int(c * SR) for c in cuts] + [len(x)]
    parts = [x[idx[k]: idx[k + 1]] for k in range(len(idx) - 1)]
    # rogne les silences de bord de chaque phrase (garde 25 ms d'air)
    out = []
    for p in parts:
        dd = activity_db(p, win)
        on = np.where(dd > thr)[0]
        s = max(0, on[0] * win - int(0.025 * SR))
        e = min(len(p), (on[-1] + 1) * win + int(0.025 * SR))
        out.append(p[s:e])
    return out


def ir_room(sr=SR, rt=0.32):
    """Petite réponse impulsionnelle synthétique (cabine/studio) : premières réflexions + queue."""
    rng = np.random.default_rng(7)
    n = int(sr * rt * 1.4)
    t = np.arange(n) / sr
    tail = rng.standard_normal(n) * np.exp(-6.9 * t / rt)
    tail = eq(tail, "lowpass", 5500, q=0.6)
    tail = eq(tail, "highpass", 250, q=0.6)
    ir = tail * 0.35
    for dt, g in [(0.0071, 0.5), (0.0113, 0.38), (0.0167, 0.3), (0.0229, 0.22), (0.031, 0.16)]:
        ir[int(dt * sr)] += g
    return ir / np.sqrt((ir ** 2).sum())


def voice_chain(x):
    """Chaîne « voix pub » : nettoyage, chaleur, présence, de-esser, compression, air."""
    x = eq(x, "highpass", 72, q=0.75)
    x = eq(x, "lowshelf", 140, q=0.7, gain_db=3.0)      # coffre / proximité
    x = eq(x, "peak", 320, q=1.1, gain_db=-2.2)         # boue
    x = eq(x, "peak", 1800, q=1.4, gain_db=-0.8)        # nasalité
    x = eq(x, "peak", 3600, q=0.9, gain_db=2.4)         # présence / articulation
    x = eq(x, "highshelf", 8500, q=0.7, gain_db=1.5)    # air
    # de-esser : compression de la bande 5,5–10 kHz pilotée par sa propre enveloppe
    band = eq(eq(x, "highpass", 5500, q=0.7), "lowpass", 10000, q=0.7)
    benv = envelope(band, SR, 0.001, 0.04)
    lvl = 20 * np.log10(benv + 1e-9)
    thr = np.percentile(lvl[lvl > -80], 92)
    red = np.clip(lvl - thr, 0, None) * 0.6
    x = x - band + band * db(-red)
    # compression en deux étages (lente puis rapide), comme en studio
    x = x / (np.max(np.abs(x)) + 1e-9) * db(-6)
    x = compressor(x, threshold_db=-24, ratio=2.2, attack=0.012, release=0.18, knee_db=8)
    x = compressor(x, threshold_db=-16, ratio=4.0, attack=0.002, release=0.05, knee_db=4)
    # légère saturation (harmoniques paires/impaires discrètes)
    x = np.tanh(x * 1.6) / np.tanh(1.6)
    # ambiance studio très discrète
    wet = signal.fftconvolve(x, ir_room())[: len(x)]
    x = x + wet * db(-23)
    return x


def lufs(x):
    import pyloudnorm as pyln
    return pyln.Meter(SR).integrated_loudness(x)


def main():
    phrases_audio = []   # (gid, [(pid, text, gap_after, audio)], group_gap)
    for gid, phrases, ggap in GROUPS:
        text = " ".join(p[1] for p in phrases)
        x, sr, src = synth(gid, text)
        x = to48k(x.astype(np.float64), sr)
        parts = split_phrases(x, phrases)
        print(f"{gid} [{src}] " + " | ".join(f"{p[0]}={len(a)/SR:.2f}s" for p, a in zip(phrases, parts)))
        phrases_audio.append((gid, [(p[0], p[1], p[2], a) for p, a in zip(phrases, parts)], ggap))

    speech = sum(len(a) for _, ph, _ in phrases_audio for *_, a in ph) / SR
    gaps_inner = sum(p[2] for _, ph, _ in phrases_audio for p in ph)
    gaps_group = sum(g for _, _, g in phrases_audio)
    budget = TOTAL - INTRO - END_HOLD_MIN - speech
    k = budget / (gaps_inner + gaps_group)
    k = float(np.clip(k, 0.6, 1.6))
    print(f"parole {speech:.2f}s · pauses {gaps_inner + gaps_group:.2f}s → facteur {k:.2f}")

    t = INTRO
    cues, track = {}, []
    for gid, ph, ggap in phrases_audio:
        for pid, text, gap, a in ph:
            cues[pid] = {"start": round(t, 3), "end": round(t + len(a) / SR, 3), "text": text, "group": gid}
            track.append((t, a))
            t += len(a) / SR + gap * k
        t += ggap * k
    last_end = max(c["end"] for c in cues.values())
    print(f"dernier mot à {last_end:.2f}s · plan fixe {TOTAL - last_end:.2f}s")

    vo = np.zeros(int(TOTAL * SR))
    for st, a in track:
        i = int(round(st * SR))
        vo[i: i + len(a)] += a[: len(vo) - i]
    vo = voice_chain(vo)
    vo = vo * db(-18.0 - lufs(vo))
    vo = limiter(vo, ceiling_db=-1.5)
    out = ROOT / "assets/audio/vo_temp.wav"
    sf.write(out, vo.astype(np.float32), SR, subtype="PCM_24")
    print("→", out.relative_to(ROOT), f"{lufs(vo):.1f} LUFS")

    timeline = {"fps": FPS, "duration": TOTAL, "cues": cues,
                "voice": "temp-kokoro-ff_siwis" if not TAKES.exists() else "takes"}
    (ROOT / "config/timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=2))
    (ROOT / "config/timeline.js").write_text(
        "/* Généré par tools/audio/build_vo.py — ne pas éditer à la main. */\n"
        "window.DC = window.DC || {};\nDC.timeline = " + json.dumps(timeline, ensure_ascii=False, indent=2) + ";\n")
    print("→ config/timeline.js")


if __name__ == "__main__":
    main()
