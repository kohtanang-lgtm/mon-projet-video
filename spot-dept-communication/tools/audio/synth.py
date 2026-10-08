"""Instruments et effets sonores synthétisés (déterministes) pour la musique provisoire."""
import numpy as np
from scipy import signal

from dsp import SR, eq

RNG = np.random.default_rng(2026)


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def noise(dur, seed=None):
    rng = RNG if seed is None else np.random.default_rng(seed)
    return rng.standard_normal(int(dur * SR))


def midi_hz(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a * sr), int(d * sr), int(r * sr)
    sus = max(0, n - a - d - r)
    env = np.concatenate([np.linspace(0, 1, a, endpoint=False) if a else [],
                          np.linspace(1, s, d, endpoint=False) if d else [],
                          np.full(sus, s), np.linspace(s, 0, r) if r else []])
    return np.pad(env, (0, max(0, n - len(env))))[:n]


# ---------------------------------------------------------------- batterie / percussions
def kick(vel=1.0):
    t = t_axis(0.45)
    f = 46 + 95 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.22)
    click = eq(noise(0.45, 11), "highpass", 2500) * np.exp(-t / 0.004) * 0.35
    x = np.tanh((body + click) * 1.8) * 0.9
    return x * vel


def clap(vel=1.0):
    t = t_axis(0.35)
    n = eq(eq(noise(0.35, 12), "bandpass", 1300, q=0.9), "highpass", 600)
    env = np.zeros_like(t)
    for k, dt in enumerate([0.0, 0.011, 0.022]):
        env += np.where(t >= dt, np.exp(-(t - dt) / 0.006), 0) * (0.8 if k < 2 else 1.0)
    env += np.where(t >= 0.022, np.exp(-(t - 0.022) / 0.09), 0) * 0.55
    return n * env * 1.4 * vel


def hat(vel=1.0, open_=False):
    dur = 0.25 if open_ else 0.06
    t = t_axis(dur)
    n = eq(eq(noise(dur), "highpass", 7500, q=0.7), "peak", 10500, q=1.2, gain_db=4)
    return n * np.exp(-t / (0.07 if open_ else 0.014)) * 0.5 * vel


def shaker(vel=1.0):
    t = t_axis(0.09)
    n = eq(eq(noise(0.09), "bandpass", 6500, q=0.8), "highpass", 4000)
    env = np.minimum(1, t / 0.012) * np.exp(-t / 0.03)
    return n * env * 0.45 * vel


def conga(pitch_hz=210, vel=1.0):
    t = t_axis(0.35)
    f = pitch_hz * (1 + 0.12 * np.exp(-t / 0.02))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / 0.12) + 0.35 * np.sin(1.48 * ph) * np.exp(-t / 0.05)
    slap = eq(noise(0.35), "bandpass", 2200, q=1.0) * np.exp(-t / 0.006) * 0.4
    return np.tanh((x + slap) * 1.3) * 0.6 * vel


def talking_drum(glide="up", vel=1.0):
    """Tambour d'appel : membrane dont la hauteur glisse (pression du bras sur les cordes)."""
    t = t_axis(0.9)
    if glide == "up":
        f = 118 + 70 * (1 - np.exp(-t / 0.09))
    else:
        f = 196 - 72 * (1 - np.exp(-t / 0.11))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) * np.exp(-t / 0.32) + 0.45 * np.sin(1.59 * ph) * np.exp(-t / 0.12)
         + 0.2 * np.sin(2.14 * ph) * np.exp(-t / 0.07))
    strike = eq(noise(0.9, 21), "bandpass", 900, q=0.8) * np.exp(-t / 0.01) * 0.5
    return np.tanh((x + strike) * 1.4) * 0.8 * vel


# ---------------------------------------------------------------- mélodique
def mallet(note, vel=1.0, dur=1.6):
    """Marimba / kalimba : partiels inharmoniques à décroissance rapide."""
    t = t_axis(dur)
    f = midi_hz(note)
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.55)
         + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.09)
         + 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.03))
    x *= np.minimum(1, t / 0.002)
    return x * 0.5 * vel


def pluck(note, vel=1.0, dur=0.5):
    t = t_axis(dur)
    f = midi_hz(note)
    saw = signal.sawtooth(2 * np.pi * f * t) * 0.6 + np.sin(2 * np.pi * f * t) * 0.6
    x = eq(saw, "lowpass", 2400, q=0.8) * np.exp(-t / 0.16) * np.minimum(1, t / 0.003)
    return x * 0.35 * vel


def supersaw(freqs, dur, detune=0.12, seed=0):
    t = t_axis(dur)
    rng = np.random.default_rng(seed)
    out = np.zeros_like(t)
    for f in freqs:
        for k in range(5):
            d = (k - 2) / 2 * detune
            fk = f * 2 ** (d / 12)
            out += signal.sawtooth(2 * np.pi * fk * t + rng.uniform(0, 2 * np.pi))
    return out / (5 * len(freqs))


def pad_chord(notes, dur, attack=0.6, release=0.8, cutoff=1600, seed=0):
    freqs = [midi_hz(n) for n in notes]
    left = supersaw(freqs, dur, 0.14, seed)
    right = supersaw(freqs, dur, 0.17, seed + 99)
    env = adsr(len(left), attack, 0.3, 0.85, release)
    out = np.stack([left, right], 1) * env[:, None]
    out = eq(out, "lowpass", cutoff, q=0.6)
    out = eq(out, "highpass", 140, q=0.6)
    return out * 0.5


def bass_note(note, dur, vel=1.0):
    t = t_axis(dur)
    f = midi_hz(note)
    sub = np.sin(2 * np.pi * f * t)
    grit = eq(signal.sawtooth(2 * np.pi * f * t), "lowpass", 380, q=0.9) * 0.45
    env = adsr(len(t), 0.004, 0.08, 0.75, 0.06)
    return np.tanh((sub + grit) * 1.4) * env * 0.55 * vel


# ---------------------------------------------------------------- effets sonores
def whoosh(dur=0.5, bright=1.0, seed=None):
    t = t_axis(dur)
    n = noise(dur, seed)
    # filtre passe-bande glissant (traité par blocs)
    out = np.zeros_like(n)
    blk = 256
    zi = None
    for i in range(0, len(n), blk):
        x = i / len(n)
        fc = (250 + 3200 * np.sin(np.pi * x) ** 1.5) * bright
        b, a = signal.butter(2, [max(60, fc * 0.6), min(SR / 2 - 100, fc * 1.6)], "band", fs=SR)
        if zi is None or len(zi) != max(len(a), len(b)) - 1:
            zi = signal.lfilter_zi(b, a) * 0
        out[i:i + blk], zi = signal.lfilter(b, a, n[i:i + blk], zi=zi)
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return out * env * 0.9


def impact(seed=None):
    t = t_axis(1.6)
    boom = np.sin(2 * np.pi * (42 + 30 * np.exp(-t / 0.06)) * t) * np.exp(-t / 0.45)
    crack = eq(noise(1.6, seed), "highpass", 1200) * np.exp(-t / 0.02) * 0.5
    body = eq(noise(1.6, seed), "lowpass", 900) * np.exp(-t / 0.18) * 0.35
    return np.tanh((boom * 1.2 + crack + body) * 1.5) * 0.85


def thud():
    t = t_axis(0.4)
    x = np.sin(2 * np.pi * (70 + 60 * np.exp(-t / 0.03)) * t) * np.exp(-t / 0.09)
    x += eq(noise(0.4), "bandpass", 500, q=1) * np.exp(-t / 0.012) * 0.4
    return np.tanh(x * 1.5) * 0.7


def subdrop():
    t = t_axis(1.8)
    f = 30 + 55 * np.exp(-t / 0.35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.7) * np.minimum(1, t / 0.01) * 0.9


def rec_blip():
    t = t_axis(0.08)
    return np.sin(2 * np.pi * 1000 * t) * np.minimum(1, t / 0.003) * np.exp(-t / 0.03) * 0.5


def ping(pitch=1.0):
    t = t_axis(0.9)
    f = 1568 * pitch
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.22) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.06)
    return x * np.minimum(1, t / 0.002) * 0.4


def click():
    t = t_axis(0.03)
    x = np.sin(2 * np.pi * 3200 * t) * np.exp(-t / 0.004) + eq(noise(0.03), "highpass", 3000) * np.exp(-t / 0.002) * 0.4
    return x * 0.6


def ticks(dur=0.8):
    """Compteur : tics qui accélèrent et montent."""
    out = np.zeros(int((dur + 0.05) * SR))
    tt, k = 0.0, 0
    while tt < dur:
        p = tt / dur
        c = click() * (0.5 + 0.5 * p)
        i = int(tt * SR)
        n = min(len(c), len(out) - i)
        out[i:i + n] += c[:n]
        tt += 0.075 * (1 - 0.7 * p)
        k += 1
    return out * 0.8


def tick_seq(n=6, step=0.05):
    out = np.zeros(int((n * step + 0.05) * SR))
    for k in range(n):
        c = click() * (0.6 + 0.08 * k)
        i = int(k * step * SR)
        out[i:i + len(c)] += c[:len(out) - i]
    return out


def scratch(dur=0.35, seed=5):
    t = t_axis(dur)
    rng = np.random.default_rng(seed)
    n = eq(eq(noise(dur, seed), "bandpass", 3500, q=0.7), "highpass", 1500)
    jitter = np.repeat(rng.uniform(0.4, 1.0, int(dur * 120) + 1), SR // 120)[: len(t)]
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.6
    return n * jitter * env * 0.55


def riser(dur=0.5):
    t = t_axis(dur)
    f = 300 * 2 ** (3 * t / dur)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    n = eq(noise(dur), "highpass", 2000) * 0.3
    env = (t / dur) ** 2
    return (tone + n) * env


def reverse_swell(dur=0.45):
    x = impact(seed=3)[: int(dur * SR) * 2]
    x = eq(x, "highpass", 300)
    x = x[::-1][-int(dur * SR):]
    t = t_axis(dur)
    return x * (t / dur) ** 1.5 * 0.8


def swipe(pitch=1.0):
    t = t_axis(0.32)
    w = whoosh(0.32, bright=1.6 * pitch)
    tone = np.sin(2 * np.pi * 880 * pitch * t) * np.exp(-t / 0.08) * 0.12
    return w + tone


def sweep(dur=1.0):
    return whoosh(dur, bright=0.9) * 0.6


def clap_sfx():
    return clap(1.2)


def drop_pin():
    t = t_axis(0.35)
    f = 900 * np.exp(-t / 0.05) + 180
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.08) * 0.6


def notif():
    t = t_axis(0.5)
    a = np.sin(2 * np.pi * 988 * t) * np.exp(-t / 0.08) * (t < 0.09)
    b = np.where(t >= 0.09, np.sin(2 * np.pi * 1480 * (t - 0.09)) * np.exp(-(t - 0.09) / 0.15), 0)
    return (a + b) * 0.5


def shimmer():
    t = t_axis(1.4)
    x = sum(np.sin(2 * np.pi * f * t + k) for k, f in enumerate([2349, 2960, 3520, 4699]))
    x *= np.minimum(1, t / 0.25) * np.exp(-t / 0.5) * 0.12
    return x + eq(noise(1.4), "highpass", 6000) * np.minimum(1, t / 0.3) * np.exp(-t / 0.35) * 0.15
