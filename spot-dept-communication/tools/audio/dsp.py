"""Petite boîte à outils DSP (numpy/scipy) partagée par la voix, la musique et le mix."""
import numpy as np
from scipy import signal

SR = 48000


def db(x):
    return 10 ** (x / 20.0)


def biquad(kind, f0, sr=SR, q=0.707, gain_db=0.0):
    """Coefficients RBJ (Audio EQ Cookbook)."""
    a_lin = 10 ** (gain_db / 40.0)
    w0 = 2 * np.pi * f0 / sr
    cw, sw = np.cos(w0), np.sin(w0)
    alpha = sw / (2 * q)
    if kind == "peak":
        b = [1 + alpha * a_lin, -2 * cw, 1 - alpha * a_lin]
        a = [1 + alpha / a_lin, -2 * cw, 1 - alpha / a_lin]
    elif kind in ("lowshelf", "highshelf"):
        s = 2 * np.sqrt(a_lin) * alpha
        if kind == "lowshelf":
            b = [a_lin * ((a_lin + 1) - (a_lin - 1) * cw + s), 2 * a_lin * ((a_lin - 1) - (a_lin + 1) * cw),
                 a_lin * ((a_lin + 1) - (a_lin - 1) * cw - s)]
            a = [(a_lin + 1) + (a_lin - 1) * cw + s, -2 * ((a_lin - 1) + (a_lin + 1) * cw),
                 (a_lin + 1) + (a_lin - 1) * cw - s]
        else:
            b = [a_lin * ((a_lin + 1) + (a_lin - 1) * cw + s), -2 * a_lin * ((a_lin - 1) + (a_lin + 1) * cw),
                 a_lin * ((a_lin + 1) + (a_lin - 1) * cw - s)]
            a = [(a_lin + 1) - (a_lin - 1) * cw + s, 2 * ((a_lin - 1) - (a_lin + 1) * cw),
                 (a_lin + 1) - (a_lin - 1) * cw - s]
    elif kind == "lowpass":
        b = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif kind == "highpass":
        b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif kind == "bandpass":
        b = [alpha, 0, -alpha]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    else:
        raise ValueError(kind)
    b, a = np.array(b) / a[0], np.array(a) / a[0]
    return b, a


def eq(x, kind, f0, q=0.707, gain_db=0.0, sr=SR):
    b, a = biquad(kind, f0, sr, q, gain_db)
    return signal.lfilter(b, a, x, axis=0)


def envelope(x, sr, attack, release):
    """Suiveur d'enveloppe (valeur absolue), attaque/relâchement en secondes."""
    x = np.abs(x)
    ga = np.exp(-1.0 / (sr * attack))
    gr = np.exp(-1.0 / (sr * release))
    out = np.empty_like(x)
    e = 0.0
    for i, v in enumerate(x):
        g = ga if v > e else gr
        e = g * e + (1 - g) * v
        out[i] = e
    return out


def compressor(x, sr=SR, threshold_db=-20.0, ratio=3.0, attack=0.005, release=0.08, knee_db=6.0, sidechain=None):
    sc = x if sidechain is None else sidechain
    if sc.ndim > 1:
        sc = np.max(np.abs(sc), axis=1)
    env = envelope(sc, sr, attack, release)
    lvl = 20 * np.log10(env + 1e-9)
    over = lvl - threshold_db
    gr = np.where(over <= -knee_db / 2, 0.0,
                  np.where(over >= knee_db / 2, over * (1 - 1 / ratio),
                           (1 - 1 / ratio) * (over + knee_db / 2) ** 2 / (2 * knee_db)))
    g = db(-gr)
    return x * (g[:, None] if x.ndim > 1 else g)


def limiter(x, sr=SR, ceiling_db=-1.0, lookahead=0.004, release=0.06):
    """Limiteur crête à anticipation (sur échantillons suréchantillonnés ×4 pour approcher le true peak)."""
    ceil = db(ceiling_db)
    mono = np.max(np.abs(x), axis=1) if x.ndim > 1 else np.abs(x)
    up = np.abs(signal.resample_poly(mono, 4, 1))[::4][: len(mono)]
    peak = np.maximum(mono, up)
    need = np.minimum(1.0, ceil / np.maximum(peak, 1e-9))
    la = int(sr * lookahead)
    # minimum glissant sur la fenêtre d'anticipation
    from scipy.ndimage import minimum_filter1d
    need = minimum_filter1d(need, size=2 * la + 1, origin=0)
    gr = np.exp(-1.0 / (sr * release))
    g = np.empty_like(need)
    cur = 1.0
    for i, v in enumerate(need):
        cur = v if v < cur else gr * cur + (1 - gr) * v
        g[i] = cur
    g = np.concatenate([g[la:], np.full(la, g[-1])])
    return x * (g[:, None] if x.ndim > 1 else g)


def fade(x, sr, fin=0.0, fout=0.0):
    x = x.copy()
    n_in, n_out = int(fin * sr), int(fout * sr)
    if n_in:
        x[:n_in] *= np.linspace(0, 1, n_in)[:, None] if x.ndim > 1 else np.linspace(0, 1, n_in)
    if n_out:
        x[-n_out:] *= np.linspace(1, 0, n_out)[:, None] if x.ndim > 1 else np.linspace(1, 0, n_out)
    return x


def place(buf, clip, t, sr=SR, gain=1.0):
    """Ajoute `clip` dans `buf` à l'instant t (secondes), stéréo ou mono."""
    i = int(round(t * sr))
    if i >= len(buf):
        return
    if i < 0:
        clip, i = clip[-i:], 0
    n = min(len(clip), len(buf) - i)
    if buf.ndim == 2 and clip.ndim == 1:
        clip = np.stack([clip, clip], axis=1)
    buf[i:i + n] += clip[:n] * gain


def pan(mono, p):
    """p ∈ [-1, 1], loi à puissance constante."""
    ang = (p + 1) * np.pi / 4
    return np.stack([mono * np.cos(ang), mono * np.sin(ang)], axis=1)
