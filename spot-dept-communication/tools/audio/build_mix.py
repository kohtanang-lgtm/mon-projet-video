"""Musique provisoire (120 BPM, ré majeur), effets sonores et mix final.

Entrées : assets/audio/vo_temp.wav, config/timeline.json, config/sfx.json
Sorties : assets/audio/music_temp.wav, sfx.wav, mix_master.wav (−14 LUFS, true peak ≤ −1 dBTP)

Usage : python tools/audio/build_mix.py
Pour utiliser une musique sous licence : déposez-la dans assets/audio/music_licensed.wav
(elle remplace la musique synthétisée ; le ducking sous la voix reste automatique).
"""
import json
import math
import re
import sys
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy import signal

sys.path.insert(0, str(Path(__file__).parent))
import synth as S  # noqa: E402
from dsp import SR, compressor, db, envelope, eq, fade, limiter, pan, place  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
TL = json.loads((ROOT / "config/timeline.json").read_text())
CFG = json.loads((ROOT / "config/sfx.json").read_text())
CUES = TL["cues"]
TOTAL = TL["duration"]
N = int(TOTAL * SR)


def letters(s):
    return sum(ch.isalnum() for ch in s)


def word_time(cue_id, word):
    """Instant estimé d'un mot dans une phrase (même règle que src/utils/time.js)."""
    cue = CUES[cue_id]
    i = cue["text"].lower().find(word.lower())
    if i < 0:
        raise ValueError(f"mot « {word} » absent de « {cue['text']} »")
    before, total = letters(cue["text"][:i]) + 1.5, letters(cue["text"]) + 3
    return cue["start"] + before / total * (cue["end"] - cue["start"])


def at(expr):
    """Nombre, "repère.start|end±x" ou "repère@mot±x" → secondes."""
    if isinstance(expr, (int, float)):
        return float(expr)
    w = re.fullmatch(r"(\w+)@(.+?)([+-][\d.]+)?", expr.strip())
    if w:
        return word_time(w.group(1), w.group(2)) + float(w.group(3) or 0)
    m = re.fullmatch(r"(\w+)\.(start|end)([+-][\d.]+)?", expr.replace(" ", ""))
    if not m:
        raise ValueError(expr)
    return CUES[m.group(1)][m.group(2)] + float(m.group(3) or 0)


def reverb_ir(rt=1.9, seed=1):
    t = np.arange(int(SR * rt * 1.2)) / SR
    out = []
    for ch in range(2):
        n = np.random.default_rng(seed + ch).standard_normal(len(t)) * np.exp(-6.9 * t / rt)
        n = eq(eq(n, "lowpass", 6000, q=0.6), "highpass", 200, q=0.6)
        n[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        out.append(n / np.sqrt((n ** 2).sum()))
    return np.stack(out, 1)


def add_reverb(x, amount, ir):
    wet = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)
    return x + wet * amount


# ------------------------------------------------------------------ musique
def build_music():
    lic = ROOT / "assets/audio/music_licensed.wav"
    if lic.exists():
        x, sr = sf.read(lic, always_2d=True)
        if sr != SR:
            x = signal.resample_poly(x, SR, sr, axis=0)
        x = np.pad(x, ((0, max(0, N - len(x))), (0, 0)))[:N]
        return fade(x[:, :2] if x.shape[1] > 1 else np.repeat(x, 2, 1), SR, 0.05, 1.2)

    bpm = CFG["music"]["bpm"]
    beat = 60 / bpm
    bar = 4 * beat
    drop = at(CFG["music"]["drop_at"])
    brk = at(CFG["music"]["break_from"])
    resolve = at(CFG["music"]["resolve_at"])
    off = drop % bar
    bars = [off + k * bar for k in range(-1, int(TOTAL / bar) + 2)]
    drop_idx = round((drop - off) / bar) + 1

    prog = {"D": (38, [62, 66, 69, 74]), "A": (33, [61, 64, 69, 73]), "Bm": (35, [62, 66, 71, 74]),
            "G": (31, [62, 67, 71, 74])}
    order = ["D", "A", "Bm", "G"]

    pad = np.zeros((N, 2))
    drums = np.zeros((N, 2))
    bass = np.zeros(N)
    keys = np.zeros((N, 2))
    perc = np.zeros((N, 2))
    kick_times = []

    groove_at = at(CFG["music"].get("groove_at", "prat_a.start-0.3"))
    intro_end = off + math.ceil((groove_at - off) / bar) * bar   # première mesure après ce repère
    build_from = intro_end + 2 * bar                            # les mallets entrent
    outro = at("sig_a.start") - 0.15

    def section(t):
        if t < intro_end:
            return "intro"
        if brk <= t < drop:
            return "break"
        if t >= outro:
            return "outro"
        if t >= drop:
            return "B" if t < at("join_a.start") - 0.2 else "C"
        return "A"

    for k, b0 in enumerate(bars):
        if b0 >= TOTAL:
            break
        name = order[(k - drop_idx) % 4]
        if b0 >= outro - bar and b0 < resolve:
            name = "G"
        root, chord = prog[name]
        sec = section(max(b0, 0))
        b_end = min(b0 + bar, resolve) if b0 < resolve <= b0 + bar else b0 + bar
        # ---- nappe
        cutoff = {"intro": 900, "break": 600, "A": 1500, "B": 2300, "C": 2000, "outro": 1400}[sec]
        lvl = {"intro": 0.55, "break": 0.5, "A": 0.6, "B": 0.75, "C": 0.7, "outro": 0.7}[sec]
        p = S.pad_chord(chord, b_end - b0 + 0.9, attack=0.35, release=0.9, cutoff=cutoff, seed=k)
        place(pad, p * lvl, b0)
        # ---- grille rythmique (16e)
        for s16 in range(16):
            t = b0 + s16 * beat / 4
            if t < 0 or t >= TOTAL:
                continue
            sec = section(t)
            beat_pos = s16 % 4 == 0
            if sec in ("A", "B", "C") and beat_pos:
                v = 1.0 if sec == "B" else 0.85
                place(drums, pan(S.kick(v), 0), t)
                kick_times.append(t)
            if sec in ("A", "B", "C") and s16 in (4, 12) and t >= intro_end + 2 * bar:
                place(drums, pan(S.clap(0.8 if sec != "B" else 1.0), 0.05), t)
            if sec in ("A", "B", "C") and s16 % 4 == 2:
                place(drums, pan(S.hat(0.7, open_=(s16 == 14 and sec == "B")), 0.25), t)
            if sec in ("intro", "A", "B", "C") and t >= off + bar:
                accent = [1.0, 0.45, 0.7, 0.45][s16 % 4]
                if sec == "intro":
                    accent *= 0.6
                place(perc, pan(S.shaker(accent), -0.35), t + 0.004 * (s16 % 2))
            if sec in ("B", "C") and s16 in (3, 6, 10, 11, 14):
                pitch = {3: 240, 6: 180, 10: 240, 11: 300, 14: 180}[s16]
                place(perc, pan(S.conga(pitch, 0.7), 0.4 if pitch > 200 else -0.15), t)
            # basse
            if sec in ("A", "B", "C"):
                pattern = {0: (0, 1.0), 6: (0, 0.7), 8: (12, 0.85), 12: (0, 0.8), 14: (7, 0.6)}
                if s16 in pattern:
                    iv, v = pattern[s16]
                    place(bass, S.bass_note(root + iv, beat * 0.45, v), t)
            if sec == "intro" and s16 % 8 == 0 and t >= off:
                place(bass, S.bass_note(root, beat * 0.9, 0.45), t)
            # mallets (arpège en croches)
            if (sec == "A" and t >= build_from) or sec in ("B", "C"):
                if s16 % 2 == 0:
                    seq = chord + [n + 12 for n in chord]
                    note = seq[(s16 // 2) % len(seq)] + 12
                    place(keys, pan(S.mallet(note, 0.55 if sec != "B" else 0.7, 0.7), -0.3 + 0.6 * ((s16 // 2) % 2)), t)

    # résolution plagale (IV → I) sur « ici »
    root, chord = prog["D"]
    place(pad, S.pad_chord(chord + [50], TOTAL - resolve + 1.5, attack=0.08, release=1.4, cutoff=2200, seed=77) * 0.9, resolve)
    place(bass, S.bass_note(root, 1.6, 0.9), resolve)

    # sidechain basse/nappe sur la grosse caisse
    sc = np.zeros(N)
    for t in kick_times:
        i = int(t * SR)
        L = min(int(0.22 * SR), N - i)
        sc[i:i + L] = np.maximum(sc[i:i + L], np.exp(-np.arange(L) / (0.07 * SR)))
    duck = 1 - 0.55 * sc
    bass *= duck
    pad *= (1 - 0.35 * sc)[:, None]

    # coupure filtrée pour « Notre secret ? » (passe-bas descendant puis silence)
    t = np.arange(N) / SR
    gate = np.ones(N)
    m = (t >= brk) & (t < drop)
    gate[m] = np.clip(1 - (t[m] - brk) / (drop - 0.45 - brk), 0.06, 1)
    for arr in (pad, drums, keys, perc):
        arr *= gate[:, None]
    bass *= gate

    ir = reverb_ir()
    pad = add_reverb(pad, 0.45, ir)
    keys = add_reverb(keys, 0.3, ir)
    drums = add_reverb(drums, 0.08, ir)
    perc = add_reverb(perc, 0.12, ir)

    music = pad * 0.55 + drums * 0.62 + pan(bass, 0) * 0.62 + keys * 0.42 + perc * 0.38
    music = eq(music, "highshelf", 9000, gain_db=1.5)
    music = fade(music, SR, 1.2, 0.9)
    return music


# ------------------------------------------------------------------ effets
def build_sfx():
    out = np.zeros((N, 2))
    gens = {
        "subdrop": lambda e: S.subdrop(), "rec": lambda e: S.rec_blip(), "ping": lambda e: S.ping(e.get("pitch", 1)),
        "whoosh": lambda e: S.whoosh(e.get("dur", 0.5), e.get("bright", 1.0)), "ticks": lambda e: S.ticks(e.get("dur", 0.8)),
        "impact": lambda e: S.impact(), "riser": lambda e: S.riser(e.get("dur", 0.5)), "thud": lambda e: S.thud(),
        "clap_sfx": lambda e: S.clap_sfx(), "click": lambda e: S.click(), "drum": lambda e: S.talking_drum(e.get("glide", "up")),
        "scratch": lambda e: S.scratch(e.get("dur", 0.35)), "tick_seq": lambda e: S.tick_seq(e.get("n", 6), e.get("step", 0.05)),
        "sweep": lambda e: S.sweep(e.get("dur", 1.0)), "reverse": lambda e: S.reverse_swell(e.get("dur", 0.45)),
        "swipe": lambda e: S.swipe(e.get("pitch", 1.0)), "drop": lambda e: S.drop_pin(), "notif": lambda e: S.notif(),
        "shimmer": lambda e: S.shimmer(), "mallet": lambda e: S.mallet(e.get("note", 74), 1.0, 2.2),
    }
    ir = reverb_ir(1.4, 9)
    for e in CFG["events"]:
        x = gens[e["type"]](e)
        place(out, pan(x, e.get("pan", 0.0)) * db(e.get("gain", -12)), at(e["at"]))
    return add_reverb(out, 0.18, ir)


# ------------------------------------------------------------------ mix
def main():
    vo, sr = sf.read(ROOT / TL.get("voice_file", "assets/audio/vo_temp.wav"))
    assert sr == SR
    vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
    music = build_music()
    sfx = build_sfx()
    sf.write(ROOT / "assets/audio/music_temp.wav", (music / (np.max(np.abs(music)) + 1e-9) * 0.89).astype(np.float32), SR, subtype="PCM_24")
    sf.write(ROOT / "assets/audio/sfx.wav", (sfx / (np.max(np.abs(sfx)) + 1e-9) * 0.89).astype(np.float32), SR, subtype="PCM_24")

    meter = pyln.Meter(SR)
    music *= db(-21.0 - meter.integrated_loudness(music))
    # ducking : la musique s'efface sous la voix (−7 dB), remonte dans les silences
    venv = envelope(np.abs(vo), SR, 0.03, 0.35)
    duck = 1 - (1 - db(-7)) * np.clip(venv / (np.percentile(venv[venv > 1e-4], 50) + 1e-9), 0, 1)
    music *= duck[:, None]

    mix = pan(vo, 0) * db(0) + music + sfx * db(-1.5)
    mix = eq(mix, "highpass", 28, q=0.7)
    mix = compressor(mix, threshold_db=-14, ratio=1.8, attack=0.02, release=0.2, knee_db=8)
    for _ in range(3):
        g = -14.0 - meter.integrated_loudness(limiter(mix, ceiling_db=-1.2))
        mix *= db(g)
    mix = limiter(mix, ceiling_db=-1.2)
    mix = fade(mix, SR, 0.0, 0.25)
    sf.write(ROOT / "assets/audio/mix_master.wav", mix.astype(np.float32), SR, subtype="PCM_24")
    print(f"mix_master.wav : {meter.integrated_loudness(mix):.1f} LUFS · crête {20*np.log10(np.max(np.abs(mix))):.1f} dBFS")


if __name__ == "__main__":
    main()
