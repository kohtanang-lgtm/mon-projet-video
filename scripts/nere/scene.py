"""Compose le visuel publicitaire : sachet (poudre de néré) posé sur un tissu bogolan.

Usage : python3 scene.py <sachet.jpg> <nere.jpg> <sortie.png>

Pipeline : fenêtre du sachet remplie de néré (window.py), tissu bogolan procédural
(bogolan.py) posé en perspective avec plis et ombres, tas de néré en relief (heap.py),
fond drapé flou, profondeur de champ, grain photo.
"""
import sys
import time

import cv2
import numpy as np

from bogolan import make_bogolan, value_noise
from heap import Heap, scatter_grains
from window import masked_blur, prepare_nere_texture, replace_window

# ------------------------------------------------------------------ géométrie
F = 1.5                    # facteur d'échelle de la sortie
CW, CH = 920, 1150         # toile à l'échelle de la photo d'origine (format 4:5)
W, H = int(CW * F), int(CH * F)
DX, DY = 84, 69            # décalage du sachet dans la toile (px d'origine)
YH = 150.0                 # ligne d'horizon (px toile)
FOC = 2926.0               # focale (px toile) -> ~41.8 px/cm à 70 cm
Z0 = 70.0                  # distance du sachet (cm)
FH = (891 + DY - YH) * Z0  # f * hauteur caméra
HC = FH / FOC              # hauteur caméra au-dessus de la table (cm)
CX = CW / 2.0
ZE = 95.0                  # bord arrière de la table (cm)
THETA = np.deg2rad(6.0)    # rotation du tissu sur la table
PATTERN = 0.72             # échelle des motifs du tissu
LIGHT = np.array([-0.5, 0.8, -0.35])
LIGHT = LIGHT / np.linalg.norm(LIGHT)
DOF_K = 1300.0             # flou (px de sortie) = DOF_K * |1/Z - 1/Z0|


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ------------------------------------------------------------------ contour du sachet
def arc(cx, cy, r, a0, a1, n=12):
    a = np.deg2rad(np.linspace(a0, a1, n))
    return [(cx + r * np.cos(t), cy + r * np.sin(t)) for t in a]


def pouch_polygon():
    pts = []
    pts += arc(146, 85.5, 30.5, 180, 270)            # coin haut gauche
    pts += arc(606, 85.5, 30.5, 270, 360)            # coin haut droit
    pts += [(636, 190), (634, 225), (632, 270), (629, 300), (626, 345), (624, 390),
            (621, 450), (619, 500), (616, 530), (613, 555), (609, 590), (606, 630),
            (604, 670), (603, 700), (603, 740), (602, 780), (601.5, 820), (601, 840),
            (600, 850), (597, 858)]
    pts += [(584, 873.5), (547, 875.5), (513, 880.5), (480, 887.5), (447, 891.5),
            (397, 892), (330, 891.5), (297, 889.5), (263, 885.5), (230, 878.5),
            (197, 873), (165, 870.5), (159, 865), (155, 858)]
    pts += [(153, 850), (152, 820), (151, 790), (149, 750), (147.5, 710), (147, 670),
            (145, 630), (142, 590), (138, 550), (135, 510), (133, 470), (130, 430),
            (128, 390), (125, 350), (122, 310), (120, 270), (118, 230), (117, 210),
            (116, 190), (116, 120)]
    return np.array(pts, np.float32)


def pouch_alpha(shape, scale, offset, ss=4):
    """Masque anti-aliasé du sachet (encoches de déchirure comprises)."""
    h, w = shape
    poly = (pouch_polygon() + offset) * scale
    big = np.zeros((h * ss, w * ss), np.uint8)
    pts = np.round((poly + 0.5) * ss - 0.5).astype(np.int32)
    cv2.fillPoly(big, [pts], 255, cv2.LINE_AA)
    for (nx, ny) in [(116.3, 131.0), (636.0, 131.0)]:
        c = ((np.array([nx, ny]) + offset) * scale + 0.5) * ss - 0.5
        cv2.circle(big, (int(c[0]), int(c[1])), int(5.2 * scale * ss), 0, -1, cv2.LINE_AA)
    a = cv2.resize(big, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
    return a


# ------------------------------------------------------------------ projections
def screen_to_ground(xs, ys):
    """Coordonnées écran (px toile) -> sol (X, Z en cm)."""
    Z = FH / np.maximum(ys - YH, 1e-3)
    X = (xs - CX) * Z / FOC
    return X, Z


def ground_to_fabric(X, Z):
    c, s = np.cos(THETA), np.sin(THETA)
    u = c * X - s * (Z - Z0)
    v = s * X + c * (Z - Z0)
    return u, v


def fabric_to_ground_grad(dHdu, dHdv):
    c, s = np.cos(THETA), np.sin(THETA)
    return c * dHdu + s * dHdv, -s * dHdu + c * dHdv


# ------------------------------------------------------------------ relief du tissu (plis)
def make_heightfield(umin, umax, vmin, vmax, res=10, seed=3):
    rng = np.random.default_rng(seed)
    w = int((umax - umin) * res); h = int((vmax - vmin) * res)
    uu, vv = np.meshgrid(umin + (np.arange(w) + 0.5) / res, vmin + (np.arange(h) + 0.5) / res)
    Hf = np.zeros((h, w), np.float32)

    def ridge(p0, d, amp, width, bend=0.0, length=60):
        d = np.array(d, np.float32); d /= np.linalg.norm(d)
        n = np.array([-d[1], d[0]])
        du, dv = uu - p0[0], vv - p0[1]
        along = du * d[0] + dv * d[1]
        across = du * n[0] + dv * n[1] - bend * (along / 10.0) ** 2
        fade = np.exp(-(along / length) ** 2)
        return amp * np.exp(-(across / width) ** 2) * fade

    Hf += ridge((-13, -6), (0.55, 1.0), 0.55, 1.6, bend=0.6, length=14)
    Hf += ridge((-19, 6), (0.2, 1.0), 0.40, 1.3, bend=-0.4, length=16)
    Hf += ridge((12.5, -9), (-0.25, 1.0), 0.50, 1.4, bend=0.5, length=13)
    Hf += ridge((18, 10), (0.35, 1.0), 0.35, 1.1, length=12)
    Hf += ridge((6, -13), (1.0, 0.18), 0.30, 1.0, bend=0.3, length=7)
    Hf += ridge((-7, -14), (1.0, -0.1), 0.25, 1.2, length=6)
    Hf -= ridge((-16, 0), (0.4, 1.0), 0.18, 1.0, length=12)
    Hf += 0.22 * value_noise(h, w, 7 * res, rng=rng, octaves=2)
    Hf += 0.05 * value_noise(h, w, 1.5 * res, rng=rng, octaves=2)
    # le sachet aplatit le tissu sous lui
    X, Z = uu, vv  # approx. (rotation faible)
    flat = np.exp(-((X / 7.5) ** 4 + ((Z - 3) / 5.0) ** 4))
    Hf *= (1 - 0.85 * flat)
    return Hf, dict(umin=umin, vmin=vmin, res=res)


# ------------------------------------------------------------------ ombre du sachet
def make_shadow_map(heap=None, xmin=-30, xmax=40, zmin=50, zmax=120, res=10):
    w = int((xmax - xmin) * res); h = int((zmax - zmin) * res)
    S = np.zeros((h, w), np.float32)
    kx = -LIGHT[0] / LIGHT[1]; kz = -LIGHT[2] / LIGHT[1]
    contact = None
    for Y in np.arange(0.0, 20.0, 0.4):
        t = Y / 20.0
        half_w = 5.3 + 0.9 * t                    # demi-largeur (cm)
        depth = 5.2 * (1 - t) ** 1.6 + 0.4        # profondeur du soufflet (cm)
        cx = Y * kx; cz = Z0 + Y * kz
        sl = np.zeros((h, w), np.float32)
        xs = np.linspace(-half_w, half_w, 60)
        front = Z0 + 1.6 * (xs / half_w) ** 2 * (1 - t)
        back = Z0 + 1.6 * (1 - t) + depth * np.sqrt(np.clip(1 - (xs / half_w) ** 2, 0, 1))
        poly = [(x + cx, zf + (cz - Z0)) for x, zf in zip(xs, front)]
        poly += [(x + cx, zb + (cz - Z0)) for x, zb in zip(xs[::-1], back[::-1])]
        pts = np.array([((px - xmin) * res, (pz - zmin) * res) for px, pz in poly], np.int32)
        cv2.fillPoly(sl, [pts], 1.0, cv2.LINE_AA)
        if contact is None:
            contact = sl.copy()
        sig = (0.25 + 0.16 * Y) * res
        sl = cv2.GaussianBlur(sl, (0, 0), sig)
        S = np.maximum(S, sl * 0.72 * np.exp(-Y / 24.0))
    # occlusion ambiante au contact
    dist = cv2.distanceTransform((contact < 0.5).astype(np.uint8), cv2.DIST_L2, 5) / res
    ao = 0.72 * np.exp(-dist / 0.22) + 0.30 * np.exp(-dist / 1.6)
    S = 1 - (1 - S) * (1 - ao)
    if heap is not None:
        S = 1 - (1 - S) * (1 - heap_shadow(heap, xmin, zmin, w, h, res, kx, kz))
    return np.clip(S, 0, 0.92), dict(xmin=xmin, zmin=zmin, res=res)


def heap_shadow(heap, xmin, zmin, w, h, res, kx, kz):
    """Ombre douce du tas de poudre sur le tissu (même lumière que le sachet)."""
    ss = 4
    out = np.zeros((h * ss, w * ss), np.float32)
    r = res * ss
    hs = heap.h
    k = r / heap.res
    small_h = cv2.resize(hs, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
    nh, nw = small_h.shape
    ext = heap.n / heap.res / 2
    contact = None
    for Y in np.arange(0.0, heap.Hm, 0.08):
        m = (small_h > Y).astype(np.float32)
        if m.sum() == 0:
            break
        if contact is None:
            contact = (small_h > 0.02).astype(np.float32)
        ox = int(round((heap.xc - ext + Y * kx - xmin) * r))
        oz = int(round((heap.zc - ext + Y * kz - zmin) * r))
        lay = np.zeros_like(out)
        lay[oz:oz + nh, ox:ox + nw] = m
        lay = cv2.GaussianBlur(lay, (0, 0), (0.08 + 0.35 * Y) * r)
        out = np.maximum(out, lay * 0.55 * np.exp(-Y / 3.0))
    lay = np.zeros_like(out)
    ox = int(round((heap.xc - ext - xmin) * r)); oz = int(round((heap.zc - ext - zmin) * r))
    lay[oz:oz + nh, ox:ox + nw] = contact
    dist = cv2.distanceTransform((lay < 0.5).astype(np.uint8), cv2.DIST_L2, 5) / r
    ao = 0.45 * np.exp(-dist / 0.15) * (lay < 0.5)
    out = 1 - (1 - out) * (1 - ao)
    return cv2.resize(out, (w, h), interpolation=cv2.INTER_AREA)


# ------------------------------------------------------------------ fond (mur flou)
def make_backdrop(rng):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    nx, ny = xx / W, yy / H
    # halo lumineux derrière le haut du sachet, côté gauche (lumière principale)
    d = np.sqrt(((nx - 0.40) / 0.62) ** 2 + ((ny - 0.30) / 0.55) ** 2)
    glow = np.exp(-d ** 2 * 1.6)
    c_edge = np.array([22, 30, 44], np.float32)      # brun très sombre (BGR)
    c_mid = np.array([46, 66, 96], np.float32)       # terre cuite assourdie
    c_glow = np.array([80, 112, 152], np.float32)    # ocre chaud
    g = glow[..., None]
    col = c_edge * (1 - g) + c_mid * g
    g2 = (glow ** 2.2)[..., None]
    col = col * (1 - g2) + c_glow * g2
    # texture d'enduit (banco) très floue
    n = value_noise(H, W, 260, rng=rng, octaves=4)
    col *= (1 + 0.07 * n)[..., None]
    n2 = value_noise(H, W, 60, rng=rng, octaves=2)
    col *= (1 + 0.025 * n2)[..., None]
    # grands plis verticaux d'un drapé en lin, très flous
    drape = np.zeros(W, np.float32)
    for k, (per, amp) in enumerate([(0.31, 0.06), (0.17, 0.035), (0.11, 0.02)]):
        ph = rng.uniform(0, 2 * np.pi)
        drape += amp * np.sin(2 * np.pi * np.arange(W) / (per * W) + ph)
    wob = value_noise(H, 1, 400, rng=rng, octaves=1)[:, 0]
    dr = np.array([np.roll(drape, int(40 * wob[i])) for i in range(H)], np.float32)
    col *= (1 + dr)[..., None]
    # léger assombrissement à droite (côté opposé à la lumière)
    col *= (1 - 0.18 * smoothstep(0.55, 1.0, nx))[..., None]
    return cv2.GaussianBlur(col, (0, 0), 9)


# ------------------------------------------------------------------ rendu du tissu
def ambient_light(X, Z):
    light = 0.92 * (1.0 + 0.16 * np.clip(-X / 16.0, -1.2, 1.2) - 0.25 * (X / 19.0) ** 2)
    light *= 1 - 0.25 * smoothstep(80, ZE - 2.5, Z)              # recul vers le fond
    light *= 1 - 0.45 * smoothstep(ZE - 2.5, ZE + 0.4, Z)        # le tissu tombe derrière la table
    light *= 1 - 0.38 * smoothstep(67, 55, Z)                    # premier plan plus sombre
    return light


def render_fabric(tex, tinfo, Hf, hinfo, S, sinfo, rng):
    SS = 3
    y_top = int((YH + FH / (ZE + 9.0)) * F) - 10   # première ligne utile
    y_top = max(0, y_top)
    rows = H - y_top
    ys = (y_top + (np.arange(rows * SS) + 0.5) / SS - 0.5)  # px de sortie
    xs = (np.arange(W * SS) + 0.5) / SS - 0.5
    Xs, Ys = np.meshgrid(xs, ys)
    xc = (Xs + 0.5) / F; yc = (Ys + 0.5) / F   # coordonnées toile
    del Xs, Ys
    Xg, Zg = screen_to_ground(xc, yc)
    del xc, yc

    def sample(img, info, a, b, interp=cv2.INTER_LINEAR):
        mx = ((a - info['umin']) * info['res'] - 0.5).astype(np.float32)
        my = ((b - info['vmin']) * info['res'] - 0.5).astype(np.float32)
        return cv2.remap(img, mx, my, interp, borderMode=cv2.BORDER_REFLECT)

    # parallaxe des plis : le rayon touche le tissu surélevé un peu plus tôt
    X, Z = Xg, Zg
    for _ in range(2):
        u, v = ground_to_fabric(X, Z)
        hh = sample(Hf, hinfo, u, v)
        Z = Zg * (1 - hh / HC)
        X = Xg * Z / Zg
    u, v = ground_to_fabric(X, Z)
    col = sample(tex, tinfo, u / PATTERN, v / PATTERN).astype(np.float32)

    # ombrage des plis (lambert)
    gy_, gx_ = np.gradient(Hf, 1.0 / hinfo['res'])
    gX, gZ = fabric_to_ground_grad(gx_, gy_)
    nrm = np.stack([-gX, np.ones_like(gX), -gZ], -1)
    nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
    lam = np.clip(nrm @ LIGHT, 0, 1) / LIGHT[1]
    shade = 0.35 + 0.65 * lam
    shade_s = sample(shade.astype(np.float32), hinfo, u, v)

    # éclairage global : flaque de lumière à gauche, chute vers les bords et le fond
    light = ambient_light(X, Z)
    # ombre portée du sachet
    sh = cv2.remap(S, ((X - sinfo['xmin']) * sinfo['res'] - 0.5).astype(np.float32),
                   ((Z - sinfo['zmin']) * sinfo['res'] - 0.5).astype(np.float32),
                   cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    total = (shade_s * light * (1 - sh)).astype(np.float32)
    col *= total[..., None]
    # tons chauds de la lumière
    col *= np.array([0.93, 1.0, 1.06], np.float32)

    # bord arrière de la table (légèrement ondulé)
    ze = ZE + 0.6 * np.sin(Xg * 0.38 + 1.0) + 0.3 * np.sin(Xg * 1.1 + 0.4)
    alpha = (Zg < ze).astype(np.float32)

    col = cv2.resize(col, (W, rows), interpolation=cv2.INTER_AREA)
    alpha = cv2.resize(alpha, (W, rows), interpolation=cv2.INTER_AREA)
    Zrow = cv2.resize(Z.astype(np.float32), (W, rows), interpolation=cv2.INTER_AREA)
    full = np.zeros((H, W, 3), np.float32); full[y_top:] = col
    fa = np.zeros((H, W), np.float32); fa[y_top:] = alpha
    fz = np.full((H, W), 200.0, np.float32); fz[y_top:] = Zrow
    return full, fa, fz


def draw_grains(img, heap, nere_tex, rng):
    """Dessine les grains de néré éparpillés sur le tissu (avant le flou de profondeur)."""
    gx, gz, size, cols = scatter_grains(heap.xc, heap.zc, heap.R, nere_tex, rng)
    SS = 4
    xs = ((CX + gx * FOC / gz) + 0.5) * F - 0.5
    ys = ((YH + FH / gz) + 0.5) * F - 0.5
    x0, x1 = int(xs.min()) - 10, int(xs.max()) + 10
    y0, y1 = int(ys.min()) - 10, int(ys.max()) + 10
    x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, W), min(y1, H)
    lay = np.zeros(((y1 - y0) * SS, (x1 - x0) * SS, 3), np.float32)
    al = np.zeros(((y1 - y0) * SS, (x1 - x0) * SS), np.float32)
    lit = ambient_light(gx, gz)
    for i in range(len(gx)):
        sc = F * FOC / gz[i] * SS
        ax = max(1, int(round(size[i] * sc)))
        ay = max(1, int(round(size[i] * sc * (HC / gz[i]) * 1.8)))
        c = ((xs[i] - x0 + 0.5) * SS - 0.5, (ys[i] - y0 + 0.5) * SS - 0.5)
        ci = (int(round(c[0])), int(round(c[1])))
        col = tuple(float(v) for v in cols[i] * lit[i] * rng.uniform(0.8, 1.1))
        cv2.ellipse(lay, ci, (ax, ay), 0, 0, 360, col, -1, cv2.LINE_AA)
        cv2.ellipse(al, ci, (ax, ay), 0, 0, 360, 1.0, -1, cv2.LINE_AA)
    lay = cv2.resize(lay, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)
    al = cv2.resize(al, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)
    reg = img[y0:y1, x0:x1]
    # les couleurs sont dessinées sans prémultiplication : normaliser par l'alpha
    colr = lay / np.maximum(al, 1e-3)[..., None]
    img[y0:y1, x0:x1] = reg * (1 - al[..., None]) + colr * al[..., None]
    return img


def depth_of_field(img, Z):
    sig = DOF_K * np.abs(1.0 / Z - 1.0 / Z0)
    levels = [0, 0.7, 1.4, 2.2, 3.2, 4.5, 6.5, 9.0]
    stack = [img if s == 0 else cv2.GaussianBlur(img, (0, 0), s) for s in levels]
    out = np.zeros_like(img)
    sig = np.clip(sig, 0, levels[-1])
    for i in range(len(levels) - 1):
        a, b = levels[i], levels[i + 1]
        t = np.clip((sig - a) / (b - a), 0, 1)
        sel = ((sig >= a) & (sig <= b)).astype(np.float32)
        w0 = (1 - t) * sel; w1 = t * sel
        out += stack[i] * w0[..., None] + stack[i + 1] * w1[..., None]
        sig = np.where(sel > 0, -1, sig)  # traité
    return out


# ------------------------------------------------------------------ sachet
def prepare_pouch(pouch_bgr):
    img = pouch_bgr.astype(np.float32)
    h, w = img.shape[:2]
    a = pouch_alpha((h, w), 1.0, np.zeros(2, np.float32))
    core = (a > 0.999).astype(np.float32)
    ext = masked_blur(img, core, 1.2)
    edge = ((a < 0.999) & (a > 0)).astype(np.float32)
    edge = np.maximum(edge, cv2.dilate(edge, np.ones((3, 3), np.uint8)) * (1 - core))
    img = img * (1 - edge[..., None]) + ext * edge[..., None]
    # léger assombrissement du bas (moins de lumière renvoyée par le tissu foncé)
    yy = np.arange(h, dtype=np.float32)[:, None]
    bottom = smoothstep(820, 892, yy)
    img *= (1 - 0.10 * bottom)[..., None]
    # mise à l'échelle de sortie
    M = np.array([[F, 0, (DX + 0.5) * F - 0.5], [0, F, (DY + 0.5) * F - 0.5]], np.float32)
    up = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
    alpha = pouch_alpha((H, W), F, np.array([DX, DY], np.float32))
    return np.clip(up, 0, 255), alpha


# ------------------------------------------------------------------ finitions
def finish(img, rng):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx / W - 0.47) / 0.75) ** 2 + ((yy / H - 0.50) / 0.80) ** 2)
    vig = 1 - 0.30 * smoothstep(0.55, 1.25, d)
    img = img * vig[..., None]
    grain = rng.standard_normal((H, W)).astype(np.float32)
    grain = cv2.GaussianBlur(grain, (0, 0), 0.6) * 3.2
    img = img + grain[..., None]
    return np.clip(img, 0, 255)


def main(pouch_path, nere_path, out_path):
    t0 = time.time()
    rng = np.random.default_rng(11)
    pouch = cv2.imread(pouch_path)
    nere = cv2.imread(nere_path)
    pouch = replace_window(pouch, nere)
    print('fenêtre ok', round(time.time() - t0, 1))

    tex, tinfo = make_bogolan()
    print('bogolan ok', round(time.time() - t0, 1))
    Hf, hinfo = make_heightfield(-26, 26, -24, 36)
    heap = Heap(xc=-4.7, zc=65.0, radius=2.55, height=1.95)
    S, sinfo = make_shadow_map(heap)
    back = make_backdrop(rng)
    fab, fa, fz = render_fabric(tex, tinfo, Hf, hinfo, S, sinfo, rng)
    del tex
    print('tissu ok', round(time.time() - t0, 1))

    nere_tex, _ = prepare_nere_texture(nere, scale=1.0, brightness=1.12, contrast=1.0)
    nere_tex = (nere_tex * np.array([0.93, 1.03, 1.0], np.float32)).astype(np.float32)
    fab = draw_grains(fab, heap, nere_tex, rng)
    fab = depth_of_field(fab, fz)
    sig_edge = DOF_K * abs(1 / ZE - 1 / Z0)
    fa = cv2.GaussianBlur(fa, (0, 0), max(sig_edge, 0.5))
    scene = back * (1 - fa[..., None]) + fab * fa[..., None]

    pimg, pa = prepare_pouch(pouch)
    # « light wrap » : un soupçon de lumière du fond déborde sur les bords du sachet
    inner = cv2.erode(pa, np.ones((3, 3), np.uint8), iterations=2)
    band = np.clip(pa - cv2.GaussianBlur(inner, (0, 0), 2.5), 0, 1)
    bgb = cv2.GaussianBlur(scene, (0, 0), 6)
    pimg = pimg * (1 - 0.35 * band[..., None]) + bgb * (0.35 * band[..., None])
    scene = scene * (1 - pa[..., None]) + pimg * pa[..., None]
    sc = dict(F=F, CX=CX, YH=YH, FH=FH, FOC=FOC, W=W, H=H)
    hc_, ha_, hz_ = heap.render(nere_tex, sc, LIGHT, ambient_light)
    sig_h = DOF_K * abs(1 / heap.zc - 1 / Z0)
    hc_ = cv2.GaussianBlur(hc_, (0, 0), sig_h); ha_ = cv2.GaussianBlur(ha_, (0, 0), sig_h)
    scene = scene * (1 - ha_[..., None]) + hc_
    out = finish(scene, rng)
    cv2.imwrite(out_path, out.astype(np.uint8))
    print('terminé', round(time.time() - t0, 1), 's ->', out_path, out.shape)


if __name__ == '__main__':
    main(*sys.argv[1:4])
