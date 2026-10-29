"""
Bande son PROVISOIRE de la vidéo REUSS!R BÉ-GOU (synthèse 100 % maison, libre de droits).

Groove d'inspiration afro-house à 120 BPM, calé sur la grille de la vidéo :
1 temps = 0,5 s = 15 images ; le premier temps fort (impact du « ! ») tombe à 0,5 s.
Les impacts, whooshs et « tics » sont placés sur les mêmes images que les animations.

usage : python3 scripts/make_audio.py public/audio/bande-son.wav
"""
import sys
import wave

import numpy as np
from scipy import signal

SR = 48000
FPS = 30
DURATION = 1545 / FPS  # = durée de la vidéo
N = int(DURATION * SR)
rng = np.random.default_rng(2026)

BEAT = 0.5
OFFSET = 0.5  # premier temps fort


def bar_t(k: float) -> float:
    return OFFSET + 4 * BEAT * k


def fr(f: int) -> float:
    """Image -> secondes."""
    return f / FPS


# ---------------------------------------------------------------- bus
dry = np.zeros((N, 2))
verb_send = np.zeros((N, 2))
pad_bus = np.zeros((N, 2))  # bus « mélodique », ducké par le kick


def place(buf, sig, t, gain=1.0, pan=0.0, send=0.0):
    """Ajoute un signal mono au temps t (s), panoramique -1..1, envoi réverbe."""
    i = int(round(t * SR))
    if i >= N or len(sig) == 0:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    sig = sig[: N - i]
    l_gain = np.cos((pan + 1) * np.pi / 4) * gain
    r_gain = np.sin((pan + 1) * np.pi / 4) * gain
    buf[i : i + len(sig), 0] += sig * l_gain
    buf[i : i + len(sig), 1] += sig * r_gain
    if send:
        verb_send[i : i + len(sig), 0] += sig * l_gain * send
        verb_send[i : i + len(sig), 1] += sig * r_gain * send


def env_exp(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def bandpass(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype='band', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def highpass(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype='high', fs=SR, output='sos'), x)


def lowpass(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype='low', fs=SR, output='sos'), x)


# ---------------------------------------------------------------- instruments
def kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env_exp(n, 0.16)
    click = highpass(rng.standard_normal(n), 2500) * env_exp(n, 0.004) * 0.35
    return np.tanh(1.6 * (body + click)) * 0.9


def clap():
    n = int(0.35 * SR)
    noise = bandpass(rng.standard_normal(n), 900, 3200)
    e = np.zeros(n)
    for d in (0.0, 0.011, 0.022):
        i = int(d * SR)
        e[i:] += env_exp(n - i, 0.008 if d < 0.02 else 0.09)
    return noise * e * 0.5


def shaker(acc=1.0):
    n = int(0.07 * SR)
    noise = lowpass(highpass(rng.standard_normal(n), 6000, 4), 12500, 2)
    a = np.minimum(1, np.arange(n) / (0.006 * SR))
    return noise * a * env_exp(n, 0.018) * 0.2 * acc


def conga(freq):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    f = freq * (1 + 0.5 * np.exp(-t / 0.012))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) * env_exp(n, 0.07)
    slap = bandpass(rng.standard_normal(n), 1500, 5000) * env_exp(n, 0.006) * 0.3
    return (tone + slap) * 0.45


def bass(freq, dur=0.22):
    n = int((dur + 0.08) * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2 * t)
    a = np.minimum(1, t / 0.005) * np.where(t < dur, 1.0, np.exp(-(t - dur) / 0.03))
    return np.tanh(1.8 * s * a) * 0.5


_pluck_cache = {}


def pluck(freq, dur=0.9, bright=0.5):
    """Karplus-Strong : corde pincée (évoque une kora / guitare). Mis en cache par note."""
    key = (freq, dur, bright)
    if key not in _pluck_cache:
        _pluck_cache[key] = _pluck(freq, dur, bright)
    return _pluck_cache[key]


def _pluck(freq, dur, bright):
    n = int(dur * SR)
    period = int(SR / freq)
    buf = rng.uniform(-1, 1, period)
    buf = lowpass(buf, 2000 + 6000 * bright, 1) if period > 20 else buf
    out = np.zeros(n)
    idx = 0
    damp = 0.996
    for i in range(n):
        out[i] = buf[idx]
        nxt = (idx + 1) % period
        buf[idx] = damp * 0.5 * (buf[idx] + buf[nxt])
        idx = nxt
    return out * env_exp(n, dur * 0.45) * 0.35


def saw_pad(freqs, dur, cutoff=1400):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.12):
            ff = f * 2 ** (det / 12)
            s += signal.sawtooth(2 * np.pi * ff * t + rng.uniform(0, 6.28))
    s /= len(freqs) * 3
    s = lowpass(s, cutoff, 2)
    a = np.minimum(1, t / 0.35) * np.minimum(1, (dur - t) / 0.4).clip(0, 1)
    return s * a * 0.55


def impact(size=1.0):
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    f = 38 + 70 * np.exp(-t / 0.06)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.5 * size)
    crack = lowpass(rng.standard_normal(n), 5000) * env_exp(n, 0.05)
    body = lowpass(rng.standard_normal(n), 900) * env_exp(n, 0.25)
    return np.tanh(1.4 * (boom * 1.0 + crack * 0.45 + body * 0.35)) * 0.9 * size


def whoosh(dur=0.7, up=True):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    # balayage de filtre par blocs
    blocks = 40
    for b in range(blocks):
        i0, i1 = b * n // blocks, (b + 1) * n // blocks
        p = b / (blocks - 1)
        fc = 300 + (4000 if up else 2500) * (p if up else 1 - p)
        out[i0:i1] = bandpass(noise[max(0, i0 - 2000) : i1], fc * 0.6, fc * 1.6)[-(i1 - i0) :]
    bell = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return out * bell * 0.6


def riser(dur=1.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    p = t / dur
    noise = highpass(rng.standard_normal(n), 1500) * p**2 * 0.25
    f = 200 * 2 ** (p * 3)
    tone = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * 0.06 * p
    return lowpass(noise + tone, 9000)


def tick(freq=2600, amp=0.25):
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * freq * t) * env_exp(n, 0.012) * amp


# ---------------------------------------------------------------- harmonie
A2, C3, E3, G3, F2, B2, D3 = 110.0, 130.81, 164.81, 196.0, 87.31, 123.47, 146.83
CHORDS = [  # (basse, pad, notes de l'arpège)
    (55.0, [A2, C3, E3, G3], [440.0, 523.25, 659.25, 783.99, 880.0]),  # Am7
    (43.65, [F2, A2, C3, E3], [349.23, 440.0, 523.25, 659.25, 698.46]),  # Fmaj7
    (65.41, [C3, E3, G3, 220.0], [392.0, 523.25, 659.25, 783.99, 880.0]),  # C6
    (49.0, [98.0, B2, D3, E3], [392.0, 493.88, 587.33, 659.25, 783.99]),  # G6
]

# Intensité par mesure (0 = intro … 24 = fin)
SECTIONS = {}
for k in range(0, 25):
    SECTIONS[k] = dict(kick=True, clap=True, shaker=True, conga=True, bass=True, pad=True, pluck=True)
SECTIONS[0] = dict(pad=True)
SECTIONS[1] = dict(kick=True, shaker=True, bass=True, pad=True)
SECTIONS[2] = dict(kick=True, shaker=True, bass=True, pad=True, clap=True)
SECTIONS[3] = dict(kick=True, shaker=True, bass=True, pad=True, clap=True, conga=True)
SECTIONS[7] = dict(shaker=True, pad=True, pluck=True)  # respiration : « VÉRITÉS & RÉCONCILIATION »
SECTIONS[16] = dict(kick=True, shaker=True, bass=True, pad=True)  # programme : montée
SECTIONS[17] = dict(pad=True)  # « DU LOURD ARRIVE ! » : coupure avant la reprise
SECTIONS[24] = dict(pad=True)  # fin

kick_times = []
STEP = BEAT / 4
SWING = 0.018

for k in range(0, 25):
    t0 = bar_t(k)
    if t0 >= DURATION:
        break
    sec = SECTIONS[k]
    root, pad_notes, arp = CHORDS[(k - 1) % 4] if k >= 1 else CHORDS[0]
    for s in range(16):
        t = t0 + s * STEP + (SWING if s % 2 else 0)
        if sec.get('kick') and s % 4 == 0:
            place(dry, kick(), t, 0.9)
            kick_times.append(t)
        if sec.get('clap') and s in (4, 12):
            place(dry, clap(), t, 0.55, pan=0.05, send=0.35)
        if sec.get('shaker'):
            acc = 1.0 if s % 4 == 2 else (0.75 if s % 2 else 0.5)
            place(dry, shaker(acc), t, 0.9, pan=0.35, send=0.05)
        if sec.get('conga') and s in (3, 6, 10, 11, 14):
            f = 330 if s in (6, 14) else 220
            place(dry, conga(f), t, 0.6, pan=-0.35 if f == 220 else -0.15, send=0.12)
        if sec.get('bass') and s in (0, 3, 6, 8, 11, 14):
            f = root * (2 if s == 6 else 1) * (1.5 if s == 11 else 1)
            place(dry, bass(f, 0.2), t, 0.75)
        if sec.get('pluck') and s % 2 == 0:
            note = arp[[0, 2, 1, 3, 4, 2, 3, 1][(s // 2) % 8]]
            place(pad_bus, pluck(note, 0.9, 0.55), t, 0.75 if k == 7 else 0.55, pan=0.4 if (s // 2) % 2 else -0.4, send=0.35)
    if sec.get('pad'):
        pad = saw_pad(pad_notes, 2.1, cutoff=900 if k in (0, 7, 17, 24) else 1600)
        place(pad_bus, pad, t0 - 0.05, 0.8 if k == 7 else (0.55 if k not in (0, 24) else 0.45), send=0.4)

# Ducking du bus mélodique par le kick (effet « pompe »).
duck = np.ones(N)
for tk in kick_times:
    i = int(tk * SR)
    n = min(N - i, int(0.3 * SR))
    duck[i : i + n] = np.minimum(duck[i : i + n], 1 - 0.55 * np.exp(-np.arange(n) / (0.09 * SR)))
pad_bus *= duck[:, None]

# ---------------------------------------------------------------- effets calés sur l'image
# Accroche : chute du « ! », impact, révélation du mot, plongée dans le point.
place(dry, whoosh(0.55, up=False), 0.0, 0.7, send=0.2)
place(dry, impact(1.1), fr(15), 1.0, send=0.5)
place(dry, whoosh(0.5), fr(28), 0.35, pan=0.3, send=0.2)
place(dry, riser(0.6), fr(56), 0.9, send=0.2)
place(dry, impact(0.8), fr(75), 0.75, send=0.4)

# Volets de transition (couverture totale à l'image indiquée).
for f in (135, 195, 255, 435, 615, 795, 975, 1095, 1215, 1395):
    place(dry, whoosh(0.6), fr(f) - 0.42, 0.55, pan=0.0, send=0.25)

# Logo : chaque lettre touche le sol, puis le « ! ».
for d in (0, 4, 8, 12, 16, 20):
    place(dry, tick(1800, 0.3), fr(255 + d + 8), 1.0, pan=-0.4 + d / 25, send=0.2)
place(dry, impact(1.2), fr(255 + 37), 1.0, send=0.55)
place(dry, riser(1.2), fr(435 + 60) - 1.2, 0.45)

# Thème : apparition du « & » et des bandeaux.
place(dry, impact(0.6), fr(435), 0.6, send=0.4)
place(dry, tick(3200, 0.2), fr(435 + 60 + 22), 1.0, send=0.3)

# Journées : rencontre des deux générations.
for base in (615, 795):
    place(dry, impact(0.55), fr(base + 48), 0.55, send=0.4)
    place(dry, whoosh(0.4), fr(base + 34), 0.35, pan=-0.6)
    place(dry, whoosh(0.4), fr(base + 37), 0.35, pan=0.6)

# Programme : un « tic » par mot, montée, puis « DU LOURD ARRIVE ! ».
for i in range(5):
    place(dry, tick(2200 + 300 * i, 0.3), fr(975 + 15 * i), 1.0, send=0.2)
for i in range(8):  # roulement qui accélère
    place(dry, clap(), fr(975 + 40) + i * 0.0625, 0.15 + 0.05 * i, send=0.2)
place(dry, impact(1.3), fr(1050), 1.0, send=0.6)
place(dry, impact(0.7), fr(1050 + 16), 0.7, send=0.4)
place(dry, riser(0.9), fr(1095) - 0.9, 0.8)

# Date : impact de reprise, chiffres qui roulent, épingle.
place(dry, impact(1.2), fr(1095), 1.0, send=0.5)
for i in range(14):
    place(dry, tick(3000, 0.12 * (1 - i / 16)), fr(1095) + i * 0.035, 1.0, pan=0.2)
place(dry, tick(1400, 0.35), fr(1095 + 52), 1.0, send=0.3)

# Consortium : chaque carte qui apparaît.
for i in range(6):
    place(dry, tick(2000 + 150 * i, 0.22), fr(1215 + 82 + 4 * i + (6 if i == 5 else 0)), 1.0, pan=-0.5 + i * 0.2, send=0.25)

# Outro : impact final, le « ! », puis coup de fin.
place(dry, impact(1.3), fr(1395), 1.0, send=0.6)
place(dry, impact(0.8), fr(1395 + 12), 0.7, send=0.4)
place(dry, impact(1.0), bar_t(24), 0.85, send=0.7)

# ---------------------------------------------------------------- réverbe + mastering
ir_len = int(2.4 * SR)
ir = rng.standard_normal((ir_len, 2)) * np.exp(-np.arange(ir_len) / (0.55 * SR))[:, None]
ir = np.stack([lowpass(ir[:, c], 5000) for c in range(2)], axis=1)
ir /= np.sqrt((ir**2).sum(axis=0))
verb = np.stack([signal.fftconvolve(verb_send[:, c], ir[:, c])[:N] for c in range(2)], axis=1)

mix = dry + pad_bus + verb * 0.5
mix = highpass(mix.T, 28, 2).T

# Fondu final.
fade = int(1.2 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2

# Niveau cible ≈ -14 LUFS (norme réseaux sociaux), crêtes adoucies sous -1 dBFS.
target_rms = 10 ** (-14.5 / 20)
mix *= target_rms / (np.sqrt(np.mean(mix**2)) + 1e-12)
ceiling = 10 ** (-1.6 / 20)
knee = 0.6 * ceiling
over = np.abs(mix) > knee
mix[over] = np.sign(mix[over]) * (knee + (ceiling - knee) * np.tanh((np.abs(mix[over]) - knee) / (ceiling - knee)))

rms = 20 * np.log10(np.sqrt(np.mean(mix**2)) + 1e-12)
print(f'durée {DURATION:.2f} s, RMS {rms:.1f} dBFS, crête {20*np.log10(np.max(np.abs(mix))):.1f} dBFS')

out = sys.argv[1] if len(sys.argv) > 1 else 'public/audio/bande-son.wav'
pcm = (mix * 32767).astype('<i2')
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('écrit :', out)
