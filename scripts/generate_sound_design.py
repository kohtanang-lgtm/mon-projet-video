#!/usr/bin/env python3
"""
Habillage sonore procédural du spot UBA Tchad (aucun échantillon externe, libre de droits).

Couches, toutes calées sur les mêmes repères que l'image (voiceover.json + cues.ts) :
  • nappe harmonique chaleureuse, une couleur d'accord par séquence, avec ducking
    automatique sous la voix-off (side-chain sur l'enveloppe de la VO) ;
  • pulsation grave discrète à partir de la séquence digitale (énergie montante) ;
  • whooshes de transition (bruit filtré, panoramique gauche → droite) ;
  • « ticks » d'interface sur les apparitions d'éléments UI ;
  • impact + carillon sur la révélation du logo, résolution sur l'accord final.

Usage : python3 scripts/generate_sound_design.py  →  public/audio/sound-design.mp3
Remplaçable à tout moment par une musique sous licence (même chemin de fichier).
"""
from __future__ import annotations

import json
import re
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 48_000
ROOT = Path(__file__).resolve().parent.parent
CUES_TS = (ROOT / "src/timeline/cues.ts").read_text(encoding="utf-8")
VO_OFFSET = float(re.search(r"VO_OFFSET = ([\d.]+)", CUES_TS).group(1))
TOTAL = float(re.search(r"TOTAL_DURATION = ([\d.]+)", CUES_TS).group(1))
VO = json.loads((ROOT / "src/timeline/voiceover.json").read_text(encoding="utf-8"))
N = int(TOTAL * SR)
rng = np.random.default_rng(2026)


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9/'.-]", "", s.lower().translate(str.maketrans("éèêàâîôûç", "eeeaaiouc"))).rstrip(".,:;?!")


def at(word: str, occurrence: int = 1) -> float:
    hits = [w for w in VO["words"] if norm(w["text"]) == norm(word)]
    return hits[occurrence - 1]["start"] + VO_OFFSET


def end(word: str, occurrence: int = 1) -> float:
    hits = [w for w in VO["words"] if norm(w["text"]) == norm(word)]
    return hits[occurrence - 1]["end"] + VO_OFFSET


def midi(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


def place(buf: np.ndarray, sig: np.ndarray, t0: float, pan: float = 0.0) -> None:
    """Mixe un signal mono dans le bus stéréo à l'instant t0 (pan -1 → 1, loi à puissance constante)."""
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    a = (pan + 1) * np.pi / 4
    buf[0, i : i + len(sig)] += sig * np.cos(a)
    buf[1, i : i + len(sig)] += sig * np.sin(a)


def lowpass(x: np.ndarray, cutoff: np.ndarray | float) -> np.ndarray:
    """Passe-bas 1 pôle à fréquence de coupure éventuellement variable."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    k = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += k[i] * (x[i] - acc)
        y[i] = acc
    return y


def reverb(x: np.ndarray, seconds: float = 2.2, mix: float = 0.35) -> np.ndarray:
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir = lowpass(ir, 5000.0)
    ir /= np.sqrt(np.sum(ir**2))
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    wet = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return (1 - mix) * x + mix * wet


# ——————————————————————————————————————————————————————————— Nappe harmonique

SCENES = [
    (0.0, [50, 57, 62, 64, 69]),  # S1 · ré (add9) — suspension, attente
    (at("Particuliers") - 0.3, [47, 54, 59, 62, 66]),  # S2 · si mineur 7 — chaleur, proximité
    (at("Plus", 2) - 0.3, [43, 50, 55, 59, 62, 66]),  # S3 · sol maj7 — modernité, lumière
    (at("Entrepreneurs") - 0.3, [45, 52, 57, 61, 64, 69]),  # S4 · la (sus) — montée
    (at("UBA", 2) - 0.1, [38, 50, 57, 62, 66, 69, 74]),  # S5 · ré majeur — résolution
]

t = np.arange(N) / SR
pad = np.zeros((2, N))
for idx, (start, notes) in enumerate(SCENES):
    stop = SCENES[idx + 1][0] if idx + 1 < len(SCENES) else TOTAL
    s, e = int(max(0, start - 0.8) * SR), min(N, int((stop + 1.2) * SR))
    tt = t[s:e] - start
    env = np.clip((tt + 0.8) / 1.6, 0, 1) * np.clip((stop + 1.2 - (tt + start)) / 2.0, 0, 1)
    env = env * env * (3 - 2 * env)  # lissage S
    for j, n in enumerate(notes):
        f = midi(n)
        voice = np.zeros_like(tt)
        for det, ph in ((-0.07, 0.0), (0.0, 1.3), (0.07, 2.1)):  # 3 voix désaccordées (± 7 cents)
            ff = f * 2 ** (det / 12)
            for h in range(1, 7):
                voice += np.sin(2 * np.pi * ff * h * tt + ph * h) / h**1.7
        voice *= 0.5 + 0.5 * np.sin(2 * np.pi * (0.07 + 0.013 * j) * tt + j)  # respiration lente
        pan = -0.6 + 1.2 * j / max(1, len(notes) - 1)
        gain = 0.045 if n >= 48 else 0.06
        place(pad, voice * env * gain, s / SR, pan)
for ch in range(2):
    pad[ch] = lowpass(pad[ch], 1800.0 + 900.0 * np.sin(2 * np.pi * t / 23) ** 2)

# Ducking : la nappe s'efface de ~6 dB quand la voix parle
vo_pcm = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", str(ROOT / "public/audio/voix-off-uba-tchad.mp3"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
    check=True,
    capture_output=True,
).stdout
vo = np.zeros(N)
raw = np.frombuffer(vo_pcm, dtype=np.float32)
o = int(VO_OFFSET * SR)
vo[o : o + len(raw)] = raw[: N - o]
hop = 480
rms = np.sqrt(np.convolve(vo**2, np.ones(hop * 4) / (hop * 4), mode="same"))
rms = rms / (rms.max() + 1e-9)
duck = np.empty(N)
level = 0.0
for i in range(0, N, hop):
    target = min(1.0, rms[i] * 3.0)
    level += (target - level) * (0.5 if target > level else 0.06)  # attaque rapide, relâchement lent
    duck[i : i + hop] = level
duck = 1 - 0.5 * duck
pad *= duck

# ——————————————————————————————————————————————————————————— Pulsation grave (S3 → S4)

bus = np.zeros((2, N))
beat = 60 / 100
pulse_from, pulse_to = at("Plus", 2), at("UBA", 2) - 0.4
k = 0
while pulse_from + k * beat < pulse_to:
    t0 = pulse_from + k * beat
    dur = 0.35
    tt = np.arange(int(dur * SR)) / SR
    f = 48 + 40 * np.exp(-tt * 30)
    kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 11)
    ramp = 0.35 + 0.65 * (t0 - pulse_from) / (pulse_to - pulse_from)
    place(bus, kick * 0.11 * ramp, t0)
    k += 1

# ——————————————————————————————————————————————————————————— Whooshes de transition


def whoosh(dur: float = 1.1, peak: float = 0.7, gain: float = 0.12) -> np.ndarray:
    n = int(dur * SR)
    x = rng.standard_normal(n)
    u = np.linspace(0, 1, n)
    env = np.where(u < peak, (u / peak) ** 2.2, np.exp(-(u - peak) / (1 - peak) * 5))
    cutoff = 300 + 5200 * env
    return lowpass(x, cutoff) * env * gain


for t0, pan in [
    (at("ambitions") + 0.15, -0.3),
    (end("instant") - 0.35, 0.4),
    (at("d'attendre") + 0.1, -0.2),
    (at("Ouvrez") - 0.45, 0.5),
    (at("consultez") - 0.45, 0.5),
    (at("Léo") - 0.85, 0.5),
    (end("24h/24") - 0.5, -0.4),
    (at("expertise") - 0.6, 0.6),
]:
    w = whoosh()
    place(bus, w * 0.7, t0, pan - 0.3)
    place(bus, w * 0.7, t0 + 0.02, pan + 0.3)

# Montée avant le logo
swell_d = (at("UBA", 2) - 0.02) - (end("sur-mesure") - 0.6)
place(bus, whoosh(swell_d + 0.25, peak=0.92, gain=0.16), end("sur-mesure") - 0.6, 0.0)

# ——————————————————————————————————————————————————————————— Ticks d'interface


def tick(freq: float = 1900.0, gain: float = 0.05) -> np.ndarray:
    tt = np.arange(int(0.09 * SR)) / SR
    return (np.sin(2 * np.pi * freq * tt) + 0.4 * np.sin(2 * np.pi * freq * 2.01 * tt)) * np.exp(-tt * 70) * gain


ui = np.zeros((2, N))
for word, occ, f, pan in [
    ("Particuliers", 1, 1500, -0.4), ("familles", 1, 1700, 0.0), ("bâtisseurs", 1, 1900, 0.4),
    ("UBA", 1, 1200, 0.2), ("proximité", 1, 2100, -0.2), ("comptes", 1, 1800, 0.3), ("style", 1, 2200, 0.3),
    ("sécurisées", 1, 2000, 0.4), ("chaque", 1, 2300, 0.5),
    ("bout", 1, 2400, 0.4), ("quelques", 1, 2100, 0.5), ("temps", 1, 2300, 0.5),
    ("banquier", 1, 1700, 0.3), ("simplifier", 1, 1900, 0.4), ("transferts", 1, 2200, 0.3), ("24h/24", 1, 2500, 0.5),
    ("Entrepreneurs", 1, 1300, -0.3), ("PME", 1, 1500, 0.0), ("grandes", 1, 1700, 0.3),
    ("sommets", 1, 2600, 0.6), ("Corporate", 1, 1600, 0.4), ("sur-mesure", 1, 2400, 0.4),
    ("ubachad.com", 1, 2000, 0.0),
]:
    place(ui, tick(f), at(word, occ) - 0.02, pan)
# confirmation « compte ouvert » : deux notes montantes
for i, f in enumerate((1568.0, 2093.0)):
    place(ui, tick(f, 0.06), at("consultez") - 0.45 + i * 0.09, 0.4)
ui = np.stack([reverb(ui[0], 1.2, 0.3), reverb(ui[1], 1.2, 0.3)])

# ——————————————————————————————————————————————————————————— Sting du logo

sting = np.zeros((2, N))
t_logo = at("UBA", 2) - 0.02
tt = np.arange(int(2.5 * SR)) / SR
boom = np.sin(2 * np.pi * np.cumsum(42 + 60 * np.exp(-tt * 18)) / SR) * np.exp(-tt * 3.2) * 0.32
place(sting, boom, t_logo)
bell = np.zeros(int(4.5 * SR))
tb = np.arange(len(bell)) / SR
for n, g in ((74, 0.05), (81, 0.04), (86, 0.03), (90, 0.02)):
    f = midi(n)
    bell += (np.sin(2 * np.pi * f * tb) + 0.3 * np.sin(2 * np.pi * f * 2.76 * tb) * np.exp(-tb * 4)) * np.exp(-tb * 1.3) * g
bell = reverb(bell, 2.6, 0.45)
place(sting, bell, t_logo + 0.05, -0.25)
place(sting, bell, t_logo + 0.08, 0.25)

# ——————————————————————————————————————————————————————————— Mixage final

mix = pad + bus + ui + sting
fade = np.clip((TOTAL - t) / 1.4, 0, 1) * np.clip(t / 0.3, 0, 1)
mix *= fade
mix *= 10 ** (-6 / 20) / (np.abs(mix).max() + 1e-9)  # crête à -6 dBFS : la voix-off reste devant

out = ROOT / "public/audio/sound-design.mp3"
tmp = out.with_suffix(".wav")
with wave.open(str(tmp), "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes((np.clip(mix.T, -1, 1) * 32767).astype("<i2").tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-codec:a", "libmp3lame", "-q:a", "0", str(out)], check=True)
tmp.unlink()

rms_db = 20 * np.log10(np.sqrt(np.mean(mix**2)) + 1e-12)
print(f"→ {out.relative_to(ROOT)} · {TOTAL:.1f} s · RMS {rms_db:.1f} dBFS · crête -6 dBFS")
