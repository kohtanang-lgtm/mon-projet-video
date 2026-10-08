"""Deterministic background beat for the video (no samples, no network).

100 BPM afro-pop / amapiano-flavoured groove: kick, clap, shaker, hats,
log-drum bass and a soft chord pad. Arrangement follows the edit's sections
(passed as seconds on the command line) so energy rises with the story.

usage: python3 make_beat.py out.wav total_s intro_end demo_start demo_end break_end
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

out, total, s_talk, s_demo, s_demo_end, s_drop = sys.argv[1], *map(float, sys.argv[2:7])
SR = 48000
BPM = 100.0
BEAT = 60.0 / BPM
STEP = BEAT / 4  # 16th note
N = int(total * SR)
rng = np.random.default_rng(7)  # seeded: identical output every run

L = np.zeros(N)
R = np.zeros(N)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    seg = sig[: N - i] * gain
    L[i : i + len(seg)] += seg * (1 - max(0, pan))
    R[i : i + len(seg)] += seg * (1 + min(0, pan))


def env(n, a, d):
    t = np.arange(n) / SR
    e = np.exp(-t / d)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e


def kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t / 0.045)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env(n, 0.002, 0.18)
    click = hp(rng.standard_normal(n), 2000) * env(n, 0.0005, 0.004) * 0.3
    return np.tanh((s + click) * 1.6)


def clap():
    n = int(0.3 * SR)
    noise = bp(rng.standard_normal(n), 900, 5000)
    e = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        i = int(off * SR)
        e[i:] += env(n - i, 0.0008, 0.012 if k < 2 else 0.11)
    return noise * e * 0.8


def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR)
    s = hp(rng.standard_normal(n), 7500, 4)
    return s * env(n, 0.0005, 0.08 if open_ else 0.018) * 0.5


def shaker():
    n = int(0.09 * SR)
    s = bp(rng.standard_normal(n), 4000, 11000)
    return s * env(n, 0.012, 0.025) * 0.35


def logdrum(freq):
    n = int(0.55 * SR)
    t = np.arange(n) / SR
    f = freq * (1 + 0.35 * np.exp(-t / 0.03))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sin(ph) + 0.3 * np.sin(2 * ph)) * env(n, 0.003, 0.22)
    return lp(np.tanh(s * 2.2), 900) * 0.9


def pad(freqs, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.12):
            ph = 2 * np.pi * f * (1 + det / 100) * t
            s += 2 * ((ph / (2 * np.pi)) % 1) - 1  # saw
    s = lp(s / (len(freqs) * 3), 1400, 2)
    a = np.minimum(1, t / 0.35)
    r = np.minimum(1, (dur - t) / 0.4)
    return s * a * np.clip(r, 0, 1) * 0.5


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    # sweep the band upward in chunks
    chunks = 24
    for c in range(chunks):
        i0, i1 = c * n // chunks, (c + 1) * n // chunks
        lo = 400 + 5000 * (c / chunks) ** 2
        out[i0:i1] = bp(noise[i0:i1], lo, min(lo * 2.2, 20000))
    return out * (t / dur) ** 2 * 0.5


# A minor -> F -> C -> G (one chord per bar) — warm, hopeful
CHORDS = [
    [220.00, 261.63, 329.63],
    [174.61, 220.00, 261.63],
    [261.63, 329.63, 392.00],
    [196.00, 246.94, 293.66],
]
ROOTS = [55.0, 43.65, 65.41, 49.0]

bar = BEAT * 4
nbars = int(np.ceil(total / bar)) + 1

for b in range(nbars):
    t0 = b * bar
    if t0 >= total:
        break
    ci = b % 4
    in_break = s_demo_end <= t0 < s_drop
    pad_gain = 0.55 if t0 < s_talk else 0.42
    add(pad(CHORDS[ci], bar + 0.3), t0, pad_gain, 0.0)

    for s in range(16):
        t = t0 + s * STEP
        if t >= total:
            break
        sw = 0.012 if s % 2 else 0.0  # light swing on off-16ths
        t += sw
        full = t >= s_talk and not in_break
        # kick: 1 and 3 (+ pickup in the demo / drop sections)
        if full and s in (0, 8):
            add(kick(), t, 0.95)
        if full and t >= s_demo and s == 14 and b % 2 == 1:
            add(kick(), t, 0.55)
        # clap on 2 and 4 once the story starts
        if full and s in (4, 12):
            add(clap(), t, 0.55, 0.05)
        # hats on 8ths, open hat on the "and" of 4
        if t >= 2.0 and s % 2 == 0:
            add(hat(open_=(s == 14)), t, 0.32 if s % 4 else 0.22, -0.25)
        # shaker 16ths
        if t >= s_talk and s % 2 == 1:
            add(shaker(), t, 0.22 + 0.06 * ((s // 2) % 2), 0.3)
        # log drum bass pattern (amapiano feel)
        if full and s in (0, 3, 6, 10, 11):
            mult = 2.0 if s in (10, 11) else 1.0
            add(logdrum(ROOTS[ci] * mult), t, 0.62)

# riser into the demo and into the final drop
add(riser(2.2), max(0, s_demo - 2.2), 0.55)
add(riser(2.0), max(0, s_drop - 2.0), 0.6)

mix = np.stack([L, R], axis=1)
# gentle master: low-cut, soft clip, normalise, fade in/out
mix = np.stack([hp(mix[:, 0], 30), hp(mix[:, 1], 30)], axis=1)
mix = np.tanh(mix * 1.2)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.9
fi = int(0.25 * SR)
fo = int(1.6 * SR)
mix[:fi] *= np.linspace(0, 1, fi)[:, None]
mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print("beat written", out, round(total, 2), "s")
