#!/usr/bin/env python3
"""Bande-son de la vidéo « Astuce Tahwiil ».

Génère, à partir de la timeline src/data/voixOff.json :
  - public/audio/voix-off.wav   voix ElevenLabs traitée (égalisation, compression, niveau)
  - public/audio/musique.wav    musique originale afro-pop (104 BPM, ré majeur), calée sur les scènes
  - public/audio/sfx/*.wav      bruitages synthétisés (pops, souffles, tampon, cadenas…)

Tout est synthétisé ici : aucun son externe, donc aucun droit à négocier.
Usage : python3 scripts/bande-son.py   (nécessite numpy et ffmpeg)
"""
import json
import subprocess
import wave
from pathlib import Path

import numpy as np

RACINE = Path(__file__).resolve().parent.parent
SR = 48000
DATA = json.loads((RACINE / 'src/data/voixOff.json').read_text())
FPS = DATA['fps']
DUREE = DATA['dureeTotale'] / FPS
AUDIO = RACINE / 'public/audio'
SFX = AUDIO / 'sfx'
rng = np.random.default_rng(2026)


# ----------------------------------------------------------------------------- outils

def ecrire(chemin, x):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = x[:, None]
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(str(chemin), 'wb') as w:
        w.setnchannels(x.shape[1])
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def temps(duree):
    return np.arange(int(SR * duree)) / SR


def filtre(x, bas=None, haut=None, ordre=2):
    """Filtre passe-haut (`bas`) et/ou passe-bas (`haut`) de type Butterworth, appliqué par FFT."""
    n = len(x)
    N = 1 << (n - 1).bit_length()
    X = np.fft.rfft(x, N)
    fr = np.fft.rfftfreq(N, 1 / SR)
    H = np.ones_like(fr)
    if haut:
        H /= np.sqrt(1 + (fr / haut) ** (2 * ordre))
    if bas:
        H /= np.sqrt(1 + (bas / np.maximum(fr, 1e-3)) ** (2 * ordre))
    return np.fft.irfft(X * H, N)[:n]


def egaliseur(x, f0, gain_db, largeur=1.0):
    """Correction en cloche (largeur en octaves), sans déphasage, appliquée par FFT."""
    n = len(x)
    N = 1 << (n - 1).bit_length()
    X = np.fft.rfft(x, N)
    fr = np.maximum(np.fft.rfftfreq(N, 1 / SR), 1.0)
    cloche_ = 1 / (1 + (np.log2(fr / f0) / largeur) ** 2)
    return np.fft.irfft(X * 10 ** (gain_db * cloche_ / 20), N)[:n]


def convolution(x, h):
    n = len(x) + len(h) - 1
    N = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(h, N), N)[:n]


def reponse_reverb(duree=1.6, rt60=1.3, predelai=0.014, clair=6500, graine=0):
    g = np.random.default_rng(graine)
    t = temps(duree)
    ir = g.standard_normal(len(t)) * np.exp(-6.9 * t / rt60)
    ir = filtre(ir, bas=180, haut=clair)
    ir[: int(predelai * SR)] = 0
    return ir / np.sqrt(np.sum(ir ** 2))


IR_G = reponse_reverb(graine=1)
IR_D = reponse_reverb(graine=2)


def reverb_stereo(x, mouille=0.2):
    g = convolution(x, IR_G)[: len(x)]
    d = convolution(x, IR_D)[: len(x)]
    return np.stack([x + mouille * g, x + mouille * d], axis=1)


def normaliser_crete(x, crete=0.7):
    m = np.max(np.abs(x))
    return x * (crete / m) if m > 0 else x


def bruit_balaye(duree, centre, largeur=0.6, enveloppe=None, graine=0):
    """Bruit filtré dont la bande (centre en Hz, fonction du temps 0..1) se déplace : souffles, glissements."""
    g = np.random.default_rng(graine)
    n = int(SR * duree)
    x = g.standard_normal(n + 2048)
    taille, pas = 1024, 256
    fen = np.hanning(taille)
    sortie = np.zeros(n + 2048)
    poids = np.zeros(n + 2048)
    fr = np.fft.rfftfreq(taille, 1 / SR)
    lf = np.log2(np.maximum(fr, 20))
    for debut in range(0, n, pas):
        u = min(1.0, debut / n)
        c = np.log2(centre(u))
        masque = np.exp(-0.5 * ((lf - c) / largeur) ** 2)
        trame = np.fft.irfft(np.fft.rfft(x[debut:debut + taille] * fen) * masque, taille)
        sortie[debut:debut + taille] += trame * fen
        poids[debut:debut + taille] += fen ** 2
    y = sortie[:n] / np.maximum(poids[:n], 1e-6)
    if enveloppe is not None:
        y *= enveloppe(np.linspace(0, 1, n))
    return y


def mtof(note):
    return 440.0 * 2 ** ((note - 69) / 12)


def loudnorm(source, cible, lufs, crete=-1.5, filtres=''):
    """Normalisation de sonie en deux passes (EBU R128) avec ffmpeg."""
    chaine = (filtres + ',' if filtres else '') + f'loudnorm=I={lufs}:TP={crete}:LRA=11:print_format=json'
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(source), '-af', chaine, '-f', 'null', '-'],
                       capture_output=True, text=True, check=True)
    bloc = r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1]
    m = json.loads(bloc)
    chaine2 = (filtres + ',' if filtres else '') + (
        f"loudnorm=I={lufs}:TP={crete}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}"
        f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source), '-af', chaine2,
                    '-ar', str(SR), str(cible)], check=True)
    return float(m['input_i'])


# ----------------------------------------------------------------------------- instruments

def marimba(f, duree=0.7, vel=1.0):
    """Lame de balafon / marimba : partiels inharmoniques, attaque boisée."""
    t = temps(duree)
    partiels = [(1.0, 1.0, 0.5), (3.932, 0.22, 0.11), (9.538, 0.05, 0.035), (2.0, 0.06, 0.18)]
    y = sum(a * np.sin(2 * np.pi * f * r * t + rng.uniform(0, 6.28)) * np.exp(-t / d) for r, a, d in partiels)
    clic = filtre(rng.standard_normal(len(t)) * np.exp(-t / 0.003), bas=1500) * 0.12
    y = (y + clic) * np.minimum(1, t / 0.0015)
    y += 0.04 * np.tanh(5 * y)  # léger grésillement des calebasses
    return vel * y


def grosse_caisse(vel=1.0):
    t = temps(0.5)
    f = 47 + 95 * np.exp(-t / 0.032)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.26)
    y += 0.22 * filtre(rng.standard_normal(len(t)) * np.exp(-t / 0.0025), bas=2500)
    return vel * np.tanh(1.7 * y) / np.tanh(1.7)


def claquement(vel=1.0):
    t = temps(0.4)
    env = sum(np.where(t >= o, np.exp(-(t - o) / 0.0055), 0) for o in (0, 0.0085, 0.017))
    env = env + 0.9 * np.where(t >= 0.025, np.exp(-(t - 0.025) / 0.085), 0)
    y = filtre(rng.standard_normal(len(t)) * env, bas=900, haut=4200)
    return vel * normaliser_crete(y, 1.0)


def baguette(vel=1.0):
    t = temps(0.12)
    y = (np.sin(2 * np.pi * 1750 * t) * 0.6 + np.sin(2 * np.pi * 820 * t) * 0.5) * np.exp(-t / 0.018)
    y += filtre(rng.standard_normal(len(t)) * np.exp(-t / 0.004), bas=2000) * 0.5
    return vel * normaliser_crete(y, 1.0)


def shaker(vel=1.0):
    t = temps(0.09)
    env = np.minimum(1, t / 0.012) * np.exp(-t / 0.028)
    y = filtre(rng.standard_normal(len(t)) * env, bas=5200, haut=14000)
    return vel * normaliser_crete(y, 1.0)


def conga(f=330, vel=1.0):
    t = temps(0.3)
    hauteur = f * (1 + 0.12 * np.exp(-t / 0.02))
    y = np.sin(2 * np.pi * np.cumsum(hauteur) / SR) * np.exp(-t / 0.15)
    y += filtre(rng.standard_normal(len(t)) * np.exp(-t / 0.006), bas=900, haut=3500) * 0.35
    return vel * normaliser_crete(y, 1.0)


def basse(f, duree, vel=1.0):
    t = temps(duree + 0.06)
    y = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    env = np.minimum(1, t / 0.004) * (0.7 + 0.3 * np.exp(-t / 0.08))
    env *= np.clip((duree + 0.06 - t) / 0.05, 0, 1)
    return vel * np.tanh(1.3 * y * env) / np.tanh(1.3)


def nappe(notes, duree, brillance=0.5, vel=1.0):
    """Nappe chaude (accord tenu), deux voix légèrement désaccordées pour la largeur stéréo."""
    t = temps(duree + 0.8)
    env = np.minimum(1, t / 0.35) * np.clip((duree + 0.8 - t) / 0.8, 0, 1)
    g = np.zeros(len(t))
    d = np.zeros(len(t))
    for n in notes:
        f = mtof(n)
        for cote, desaccord in ((g, 0.997), (d, 1.003)):
            for h in range(1, 8):
                a = (1 / h ** 1.3) * brillance ** (h - 1)
                cote += a * np.sin(2 * np.pi * f * desaccord * h * t + rng.uniform(0, 6.28))
    return vel * np.stack([g * env, d * env], axis=1) / (len(notes) * 2.2)


def cymbale(duree=1.8, vel=1.0):
    t = temps(duree)
    y = filtre(rng.standard_normal(len(t)), bas=4200, haut=16000) * np.exp(-t / 0.55)
    for f in rng.uniform(3000, 9000, 14):
        y += 0.05 * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28)) * np.exp(-t / rng.uniform(0.3, 0.9))
    return vel * normaliser_crete(y * np.minimum(1, t / 0.003), 1.0)


# ----------------------------------------------------------------------------- musique

def musique():
    tempo = 104
    mesure = 4 * 60 / tempo
    pas = mesure / 16
    n = int(SR * DUREE)
    bus = {k: np.zeros((n + SR * 3, 2)) for k in ('batterie', 'basse', 'melodie', 'nappe', 'effets')}

    def poser(nom, x, t, pan=0.0, gain=1.0):
        i = int(round(t * SR))
        if i < 0 or i >= n:
            return
        if x.ndim == 1:
            g, d = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            x = np.stack([x * g * 1.414, x * d * 1.414], axis=1)
        fin = min(len(bus[nom]), i + len(x))
        bus[nom][i:fin] += gain * x[: fin - i]

    # Accords (ré majeur) : D – A – Bm – G, avec résolutions sur les moments forts.
    ACCORDS = {'D': (50, [62, 66, 69, 74]), 'A': (45, [61, 64, 69, 73]), 'Bm': (47, [62, 66, 71, 74]), 'G': (43, [62, 67, 71, 74])}
    grille = ['D', 'A', 'Bm', 'G']
    derniere = int(np.floor((DUREE - 1.75) / mesure))  # mesure du coup final
    def accord(b):
        if b in (19, derniere - 1):
            return 'A'
        if b == derniere:
            return 'D'
        return grille[b % 4]

    sourire = (18, 19)  # respiration émotionnelle : la batterie s'arrête
    MOTIF_MARIMBA = [(0, 0), (3, 2), (6, 1), (10, 2), (12, 3), (14, 1)]
    MOTIF_BASSE = [(0, 0, 3), (3, 0, 2), (6, 7, 2), (10, 0, 2), (12, 12, 1), (14, 7, 2)]

    for b in range(derniere + 1):
        t0 = b * mesure
        nom = accord(b)
        racine, notes = ACCORDS[nom]
        humain = lambda: rng.normal(0, 0.003)
        swing = lambda s: (pas * 0.1 if s % 2 else 0)
        final = b == derniere
        intro = b < 2
        calme = b in sourire

        if final:
            poser('batterie', grosse_caisse(1.0), t0)
            poser('effets', cymbale(2.2, 0.7), t0, 0.1)
            for i, nn in enumerate(notes):
                poser('melodie', marimba(mtof(nn), 2.2, 0.55), t0 + i * 0.012, (-0.3, -0.1, 0.1, 0.3)[i])
            poser('basse', basse(mtof(racine - 12), 1.6, 0.9), t0)
            poser('nappe', nappe(notes, 1.6, 0.55, 1.0), t0)
            break

        # Nappe
        brillance = 0.28 + 0.1 * b if intro else (0.55 if calme else 0.42)
        poser('nappe', nappe([x - 12 for x in notes], mesure, brillance, 1.15 if calme else 0.85), t0)

        # Balafon : motif syncopé (à l'octave du dessus pendant le sourire)
        for s, degre in MOTIF_MARIMBA:
            if intro and s not in (0, 6, 10):
                continue
            note = notes[degre] + (0 if calme else -12)
            vel = (0.85 if s == 0 else 0.6) * rng.uniform(0.85, 1.0)
            poser('melodie', marimba(mtof(note), 0.8, vel), t0 + s * pas + swing(s) + humain(), (-0.35, 0.35)[s % 2])

        # Shaker (dès la 2e mesure)
        if b >= 1:
            for s in range(16):
                vel = (0.75 if s % 4 == 2 else 0.4) * (0.6 if calme else 1.0)
                poser('batterie', shaker(vel), t0 + s * pas + swing(s) + humain(), 0.3)

        if intro or calme:
            if calme:
                poser('basse', basse(mtof(racine - 12), mesure * 0.95, 0.35), t0)
            continue

        # Batterie afro-pop
        for s, vel in ((0, 1.0), (8, 0.95), (11, 0.55)):
            poser('batterie', grosse_caisse(vel), t0 + s * pas + humain())
        for s in (4, 12):
            poser('batterie', claquement(0.55), t0 + s * pas + humain(), -0.05)
        for s in (3, 6, 10, 13):
            poser('batterie', baguette(0.32), t0 + s * pas + swing(s) + humain(), -0.25)
        for s, f, vel in ((7, 340, 0.4), (9, 300, 0.35), (15, 340, 0.45), (14, 230, 0.3)):
            poser('batterie', conga(f, vel), t0 + s * pas + swing(s) + humain(), 0.2)

        # Basse
        for s, intervalle, longueur in MOTIF_BASSE:
            poser('basse', basse(mtof(racine - 12 + intervalle), longueur * pas * 0.9, 0.8), t0 + s * pas + swing(s))

    # Montée avant le logo (mesure 19) et cymbale à l'arrivée du logo (mesure 20)
    t_montee = 19 * mesure
    montee = bruit_balaye(mesure, lambda u: 400 * (12000 / 400) ** u, 0.5, lambda u: (u ** 2.2) * 0.9, graine=5)
    poser('effets', montee, t_montee, 0.0, 0.5)
    poser('effets', cymbale(1.8, 0.6), 20 * mesure, -0.1)
    poser('batterie', grosse_caisse(1.0), 20 * mesure)
    # Ouverture : petit accord frappé
    for i, nn in enumerate(ACCORDS['D'][1]):
        poser('melodie', marimba(mtof(nn + 12), 1.4, 0.35), 0.02 + i * 0.03, (-0.3, -0.1, 0.1, 0.3)[i])

    melodie = bus['melodie'][:n]
    melodie = melodie + 0.22 * np.stack([convolution(melodie[:, 0], IR_G)[:n], convolution(melodie[:, 1], IR_D)[:n]], axis=1)
    nappe_bus = bus['nappe'][:n]
    nappe_bus = np.stack([filtre(nappe_bus[:, 0], bas=120, haut=5000), filtre(nappe_bus[:, 1], bas=120, haut=5000)], axis=1)
    basse_bus = np.stack([filtre(bus['basse'][:n, 0], haut=1200)] * 2, axis=1)
    batterie = bus['batterie'][:n]
    batterie = batterie + 0.08 * np.stack([convolution(batterie[:, 0], IR_G)[:n], convolution(batterie[:, 1], IR_D)[:n]], axis=1)
    effets = bus['effets'][:n]
    # Place pour la voix : on creuse la musique entre 1,5 et 4 kHz.
    harmonie = 0.42 * melodie + 0.34 * nappe_bus
    harmonie = np.stack([egaliseur(egaliseur(harmonie[:, c], 2600, -5, 0.9), 900, -1.5, 0.8) for c in (0, 1)], axis=1)
    mix = 1.0 * batterie + 0.95 * basse_bus + harmonie + 0.5 * effets
    mix = np.stack([egaliseur(mix[:, c], 3000, -2.5, 1.0) for c in (0, 1)], axis=1)
    # Fondu final doux et limiteur
    mix *= np.clip((DUREE - np.arange(n) / SR) / 0.6, 0, 1)[:, None]
    mix = np.tanh(1.2 * mix / np.max(np.abs(mix))) / np.tanh(1.2) * 0.9
    return mix


# ----------------------------------------------------------------------------- bruitages

def cloche(f, duree=0.9, vel=1.0):
    t = temps(duree)
    y = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d)
            for r, a, d in ((1, 1, 0.45), (2.0, 0.3, 0.25), (3.0, 0.14, 0.15), (4.2, 0.07, 0.1)))
    return vel * y * np.minimum(1, t / 0.002)


def bloop(f, duree=0.2, decroissance=0.06):
    t = temps(duree)
    hauteur = f * (0.78 + 0.42 * (1 - np.exp(-t / 0.014)))
    y = np.sin(2 * np.pi * np.cumsum(hauteur) / SR) + 0.18 * np.sin(4 * np.pi * np.cumsum(hauteur) / SR)
    y *= np.minimum(1, t / 0.0012) * np.exp(-t / decroissance)
    return y


def suite(*elements, duree=1.0):
    y = np.zeros(int(SR * duree))
    for t0, x in elements:
        i = int(t0 * SR)
        fin = min(len(y), i + len(x))
        y[i:fin] += x[: fin - i]
    return y


def avec_reverb(x, mouille=0.25, rt60=0.9):
    ir = reponse_reverb(1.2, rt60, graine=9)
    return x + mouille * convolution(x, ir)[: len(x)]


def bruitages():
    s = {}
    for i, f in enumerate((520, 620, 740, 880), start=1):
        s[f'pop-{i}'] = avec_reverb(np.pad(bloop(f), (0, SR // 3)), 0.18)
    s['pop-doux'] = avec_reverb(np.pad(filtre(bloop(430, 0.25, 0.09), haut=3000), (0, SR // 3)), 0.2)
    t = temps(0.9)
    boum = np.sin(2 * np.pi * np.cumsum(45 + 50 * np.exp(-t / 0.05)) / SR) * np.exp(-t / 0.3)
    s['impact-doux'] = avec_reverb(boum + 0.3 * filtre(rng.standard_normal(len(t)) * np.exp(-t / 0.05), haut=500), 0.3)
    s['souffle'] = bruit_balaye(0.95, lambda u: 300 * (5500 / 300) ** min(1, u / 0.6), 0.55,
                                lambda u: np.where(u < 0.5, (u / 0.5) ** 2, np.clip(1 - (u - 0.5) / 0.4, 0, 1)), graine=11)
    s['souffle-doux'] = 0.7 * bruit_balaye(0.55, lambda u: 600 * (3200 / 600) ** u, 0.5,
                                           lambda u: np.sin(np.pi * u) ** 1.5, graine=12)
    s['glissement'] = bruit_balaye(0.75, lambda u: 900 + 1600 * np.sin(np.pi * u), 0.45,
                                   lambda u: np.sin(np.pi * u) ** 1.2, graine=13)
    s['validation'] = avec_reverb(suite((0, cloche(1046.5, 0.8)), (0.07, 0.6 * cloche(1318.5, 0.8)), duree=1.1), 0.25)
    s['succes'] = avec_reverb(suite((0, marimba(880, 0.8, 0.9)), (0.09, marimba(1318.5, 0.9, 1.0)),
                                    (0.09, 0.25 * cloche(2637, 0.6)), duree=1.2), 0.25)
    s['tic'] = suite((0, bloop(1650, 0.08, 0.025)), duree=0.15)
    for i, centre in enumerate((2400, 3200, 4100), start=1):
        t = temps(0.06)
        clic = filtre(rng.standard_normal(len(t)) * np.exp(-t / 0.0035), bas=centre * 0.6, haut=centre * 1.6)
        clic += 0.5 * np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.01)
        s[f'touche-{i}'] = clic
    t = temps(0.13)
    bz = sum(np.sin(2 * np.pi * 196 * k * t) / k + np.sin(2 * np.pi * 185 * k * t) / k for k in (1, 3, 5, 7, 9))
    bz = filtre(bz * np.minimum(1, t / 0.005) * np.clip((0.13 - t) / 0.03, 0, 1), haut=2600)
    s['erreur'] = suite((0, bz), (0.17, bz), duree=0.45)
    t = temps(0.42)
    f = 230 * (0.62 + 0.38 * np.exp(-t / 0.2))
    bq = sum(np.sin(2 * np.pi * np.cumsum(f * k) / SR) / k for k in (1, 3, 5, 7))
    s['bloque'] = filtre(bq * (0.75 + 0.25 * np.sin(2 * np.pi * 18 * t)) * np.minimum(1, t / 0.006) * np.exp(-t / 0.2), haut=2200)
    t = temps(0.14)
    s['tape'] = np.sin(2 * np.pi * np.cumsum(140 + 140 * np.exp(-t / 0.01)) / SR) * np.exp(-t / 0.03) + \
        0.25 * filtre(rng.standard_normal(len(t)) * np.exp(-t / 0.003), haut=3500)
    s['message'] = avec_reverb(suite((0, marimba(987.8, 0.6, 0.9)), (0.11, marimba(1318.5, 0.7, 1.0)), duree=0.9), 0.2)
    s['notification'] = avec_reverb(suite((0, marimba(1174.7, 0.6)), (0.08, marimba(1480, 0.6)), (0.16, marimba(1760, 0.8)),
                                          (0.16, 0.2 * cloche(3520, 0.6)), duree=1.1), 0.25)
    t = temps(1.3)
    sub = np.sin(2 * np.pi * np.cumsum(38 + 40 * np.exp(-t / 0.06)) / SR) * np.exp(-t / 0.42)
    choc = filtre(rng.standard_normal(len(t)) * np.exp(-t / 0.07), bas=150, haut=900)
    claque = filtre(rng.standard_normal(len(t)) * np.exp(-t / 0.025), bas=1000, haut=4500)
    transitoire = filtre(rng.standard_normal(len(t)) * np.exp(-t / 0.003), bas=3000)
    s['tampon'] = avec_reverb(np.tanh(1.4 * (sub + 0.6 * choc + 0.35 * claque + 0.3 * transitoire)), 0.22, 0.8)
    t = temps(0.05)
    clic_metal = filtre(rng.standard_normal(len(t)) * np.exp(-t / 0.004), bas=2000, haut=9000) + \
        0.4 * np.sin(2 * np.pi * 2400 * t) * np.exp(-t / 0.02) + 0.25 * np.sin(2 * np.pi * 3150 * t) * np.exp(-t / 0.015)
    s['verrou'] = avec_reverb(suite((0, 0.7 * clic_metal), (0.075, clic_metal), duree=0.4), 0.15)
    t = temps(1.6)
    paillettes = np.zeros(len(t))
    for _ in range(20):
        t0 = rng.uniform(0, 0.9)
        f = rng.uniform(2400, 6200)
        d = rng.uniform(0.06, 0.22)
        m = t >= t0
        paillettes[m] += rng.uniform(0.3, 1) * np.sin(2 * np.pi * f * (t[m] - t0)) * np.exp(-(t[m] - t0) / d)
    glisse = 0.25 * np.sin(2 * np.pi * np.cumsum(1200 * 2 ** (np.minimum(t, 0.5) / 0.5)) / SR) * np.exp(-t / 0.35)
    s['scintillement'] = avec_reverb(paillettes * 0.5 + glisse, 0.35, 1.2)
    return s


# ----------------------------------------------------------------------------- principal

def main():
    SFX.mkdir(parents=True, exist_ok=True)
    tmp = RACINE / 'out'
    tmp.mkdir(exist_ok=True)

    # 1. Voix : nettoyage du bas, présence, compression douce, puis -18 LUFS (marge pour le mixage).
    chaine_voix = ('highpass=f=75,lowpass=f=15500,equalizer=f=220:t=q:w=1.0:g=-1.5,'
                   'equalizer=f=3200:t=q:w=1.2:g=2.0,equalizer=f=9000:t=q:w=1.0:g=1.0,'
                   'acompressor=threshold=-22dB:ratio=2.5:attack=6:release=120:makeup=2')
    mesure_voix = loudnorm(AUDIO / 'voix-off-originale.mp3', AUDIO / 'voix-off.wav', -18, -2.0, chaine_voix)
    print(f'voix : {mesure_voix:.1f} LUFS → -18 LUFS')

    # 2. Musique
    m = musique()
    ecrire(tmp / 'musique-brute.wav', m)
    mesure_musique = loudnorm(tmp / 'musique-brute.wav', AUDIO / 'musique.wav', -18, -2.0)
    print(f'musique : {mesure_musique:.1f} LUFS → -18 LUFS ({DUREE:.2f} s)')

    # 3. Bruitages
    for nom, x in bruitages().items():
        ecrire(SFX / f'{nom}.wav', normaliser_crete(np.asarray(x, dtype=np.float64), 0.7))
    print('bruitages :', ', '.join(sorted(p.stem for p in SFX.glob('*.wav'))))


if __name__ == '__main__':
    main()
