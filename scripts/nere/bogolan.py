"""Génère une texture de tissu bogolan (motifs crème sur fond brun) en coordonnées physiques (cm)."""
import cv2
import numpy as np

RNG = np.random.default_rng(7)


def value_noise(h, w, cell, rng=RNG, octaves=1, persistence=0.5):
    """Bruit lisse multi-octaves (valeurs ~[-1, 1])."""
    out = np.zeros((h, w), np.float32)
    amp, total = 1.0, 0.0
    c = float(cell)
    for _ in range(octaves):
        gh, gw = int(h / c) + 3, int(w / c) + 3
        g = rng.standard_normal((gh, gw)).astype(np.float32)
        up = cv2.resize(g, (int(gw * c), int(gh * c)), interpolation=cv2.INTER_CUBIC)
        out += amp * up[:h, :w]
        total += amp
        amp *= persistence
        c /= 2.0
        if c < 1.5:
            break
    return out / total


class Canvas:
    """Masque de dessin en cm (1 = crème, 0 = brun)."""

    def __init__(self, umin, umax, vmin, vmax, res):
        self.umin, self.vmin, self.res = umin, vmin, res
        self.w = int(round((umax - umin) * res))
        self.h = int(round((vmax - vmin) * res))
        self.m = np.zeros((self.h, self.w), np.uint8)
        self.SH = 4  # précision sub-pixel des fonctions OpenCV

    def p(self, u, v):
        s = 1 << self.SH
        return (int(round((u - self.umin) * self.res * s)), int(round((v - self.vmin) * self.res * s)))

    def L(self, cm):
        return max(1, int(round(cm * self.res)))

    def line(self, u0, v0, u1, v1, t, val=255):
        cv2.line(self.m, self.p(u0, v0), self.p(u1, v1), val, self.L(t), cv2.LINE_AA, self.SH)

    def poly(self, pts, t, val=255, closed=False):
        arr = np.array([self.p(u, v) for u, v in pts], np.int32)
        cv2.polylines(self.m, [arr], closed, val, self.L(t), cv2.LINE_AA, self.SH)

    def fillpoly(self, pts, val=255):
        arr = np.array([self.p(u, v) for u, v in pts], np.int32)
        cv2.fillPoly(self.m, [arr], val, cv2.LINE_AA, self.SH)

    def circle(self, u, v, r, t=-1, val=255):
        s = 1 << self.SH
        cv2.circle(self.m, self.p(u, v), int(round(r * self.res * s)), val,
                   -1 if t < 0 else self.L(t), cv2.LINE_AA, self.SH)

    def rect(self, u0, v0, u1, v1, val=255):
        self.fillpoly([(u0, v0), (u1, v0), (u1, v1), (u0, v1)], val)


# ---------------------------------------------------------------- motifs
def m_dots(c, r, sp=1.05, rad=0.2):
    u0, v0, u1, v1 = r
    nu = max(1, int((u1 - u0) / sp)); nv = max(1, int((v1 - v0) / sp))
    du = (u1 - u0) / nu; dv = (v1 - v0) / nv
    for i in range(nu):
        for j in range(nv):
            off = du / 2 if j % 2 else 0
            u = u0 + du * (i + 0.5) + off - du / 4
            if u > u1 - 0.2:
                continue
            c.circle(u, v0 + dv * (j + 0.5), rad * RNG.uniform(0.85, 1.15))


def m_zigzag(c, r, n=2, period=1.5, t=0.2):
    u0, v0, u1, v1 = r
    hgt = (v1 - v0)
    for k in range(n):
        a = v0 + hgt * (k + 0.2) / n
        b = v0 + hgt * (k + 0.8) / n
        pts = []
        u = u0
        i = 0
        while u <= u1 + 1e-6:
            pts.append((u, a if i % 2 == 0 else b))
            u += period / 2
            i += 1
        c.poly(pts, t)


def m_diamonds(c, r, cell=3.6, t=0.17):
    u0, v0, u1, v1 = r
    n = max(1, int(round((u1 - u0) / cell)))
    cw = (u1 - u0) / n
    vc = (v0 + v1) / 2
    hh = (v1 - v0) / 2 * 0.9
    for i in range(n):
        uc = u0 + cw * (i + 0.5)
        hw = cw / 2 * 0.9
        for s in (1.0, 0.68, 0.36):
            c.poly([(uc - hw * s, vc), (uc, vc - hh * s), (uc + hw * s, vc), (uc, vc + hh * s)], t, closed=True)
        c.circle(uc, vc, 0.16)
        # petits points dans les coins
        for du in (-cw / 2 + 0.35, cw / 2 - 0.35):
            for dvv in (-hh + 0.3, hh - 0.3):
                c.circle(uc + du, vc + dvv, 0.13)


def m_crosses(c, r, cell=2.0, t=0.2):
    u0, v0, u1, v1 = r
    nu = max(1, int(round((u1 - u0) / cell))); nv = max(1, int(round((v1 - v0) / cell)))
    du = (u1 - u0) / nu; dv = (v1 - v0) / nv
    s = min(du, dv) * 0.28
    for i in range(nu):
        for j in range(nv):
            u = u0 + du * (i + 0.5); v = v0 + dv * (j + 0.5)
            c.line(u - s, v, u + s, v, t); c.line(u, v - s, u, v + s, t)
            if i < nu - 1 and j < nv - 1:
                c.circle(u + du / 2, v + dv / 2, 0.12)


def m_ladder(c, r, t=0.15, step=0.55):
    u0, v0, u1, v1 = r
    a = v0 + (v1 - v0) * 0.22; b = v1 - (v1 - v0) * 0.22
    c.line(u0, a, u1, a, t); c.line(u0, b, u1, b, t)
    u = u0 + step / 2
    while u < u1:
        c.line(u, a, u, b, t * 0.9)
        u += step


def m_circles(c, r, cell=2.4, t=0.17):
    u0, v0, u1, v1 = r
    nu = max(1, int(round((u1 - u0) / cell))); nv = max(1, int(round((v1 - v0) / cell)))
    du = (u1 - u0) / nu; dv = (v1 - v0) / nv
    rad = min(du, dv) * 0.34
    for i in range(nu):
        for j in range(nv):
            u = u0 + du * (i + 0.5); v = v0 + dv * (j + 0.5)
            c.circle(u, v, rad, t)
            c.circle(u, v, 0.14)


def m_teeth(c, r, period=1.2):
    """Rangée de triangles pleins (dents de scie)."""
    u0, v0, u1, v1 = r
    u = u0
    while u < u1 - 1e-6:
        c.fillpoly([(u, v1), (min(u + period / 2, u1), v0), (min(u + period, u1), v1)])
        u += period


def m_negative_dots(c, r, sp=1.1, rad=0.2):
    """Fond crème avec points bruns (motif inversé)."""
    u0, v0, u1, v1 = r
    c.rect(u0, v0, u1, v1, 255)
    nu = max(1, int((u1 - u0) / sp)); nv = max(1, int((v1 - v0) / sp))
    du = (u1 - u0) / nu; dv = (v1 - v0) / nv
    for i in range(nu):
        for j in range(nv):
            c.circle(u0 + du * (i + 0.5), v0 + dv * (j + 0.5), rad, val=0)


def m_hatch(c, r, step=0.6, t=0.15):
    u0, v0, u1, v1 = r
    hgt = v1 - v0
    u = u0
    k = 0
    while u < u1 - hgt * 0.5:
        if k % 2 == 0:
            c.line(u, v1 - 0.15, u + hgt * 0.5, v0 + 0.15, t)
        else:
            c.line(u, v0 + 0.15, u + hgt * 0.5, v1 - 0.15, t)
        u += step
        k += 1


# ---------------------------------------------------------------- tissu
def make_bogolan(umin=-31, umax=31, vmin=-22, vmax=42, res=62, strip_w=15.0, seed=7):
    global RNG
    RNG = np.random.default_rng(seed)
    c = Canvas(umin, umax, vmin, vmax, res)

    # Bandes tissées cousues (largeur ~15 cm), centrées sur u = 0
    seams = [s for s in np.arange(-strip_w * 2.5, strip_w * 3, strip_w) if umin - 1 < s < umax + 1]
    strips = [(seams[i], seams[i + 1]) for i in range(len(seams) - 1)]

    # séquence des rangées (hauteur en cm, type)
    big = [m_diamonds, m_crosses, m_circles, m_dots, m_diamonds, m_negative_dots]
    small = [m_zigzag, m_ladder, m_teeth, m_hatch]
    for si, (sa, sb) in enumerate(strips):
        vshift = RNG.uniform(-0.35, 0.35)
        a, b = sa + 0.55, sb - 0.55
        # liserés verticaux le long des coutures
        for uu in (a, b):
            c.line(uu, vmin, uu, vmax, 0.16)
        for uu in (a + 0.35, b - 0.35):
            c.line(uu, vmin, uu, vmax, 0.09)
        v = vmin + vshift
        k = 0
        while v < vmax:
            hb = 4.6 if k % 2 == 0 else 2.0
            r = (a + 0.75, v + 0.45, b - 0.75, v + hb - 0.45)
            if k % 2 == 0:
                fn = big[(k // 2 + si) % len(big)]
            else:
                fn = small[(k // 2 + si * 3) % len(small)]
            fn(c, r)
            # doubles lignes de séparation
            c.line(a, v + hb, b, v + hb, 0.17)
            c.line(a, v + hb + 0.32, b, v + hb + 0.32, 0.09)
            v += hb + 0.32
            k += 1

    m = c.m.astype(np.float32) / 255.0
    h, w = m.shape

    # Tracé à la main : déformation lisse + bords irréguliers
    du = value_noise(h, w, 1.6 * res, octaves=3) * 0.06 * res
    dv = value_noise(h, w, 1.6 * res, octaves=3) * 0.06 * res
    xx, yy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    m = cv2.remap(m, xx + du, yy + dv, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    del du, dv
    rough = value_noise(h, w, 0.12 * res, octaves=2)
    m = cv2.GaussianBlur(m, (0, 0), 0.04 * res)
    m = np.clip((m - 0.5 + 0.22 * rough) * 4.0 + 0.5, 0, 1)
    m = cv2.GaussianBlur(m, (0, 0), 0.6)

    # Couleurs (BGR)
    mud = np.array([26, 34, 46], np.float32)        # brun foncé (boue)
    mud2 = np.array([40, 56, 78], np.float32)       # brun plus clair (boue moins dense)
    cream = np.array([152, 184, 210], np.float32)   # crème écru
    cream2 = np.array([112, 146, 180], np.float32)  # crème teinté (diffusion de la boue)

    n1 = value_noise(h, w, 3.0 * res, octaves=4)
    t1 = np.clip(0.5 + 0.55 * n1, 0, 1)[..., None]
    dark = mud * (1 - t1) + mud2 * t1
    n2 = value_noise(h, w, 1.2 * res, octaves=3)
    halo = cv2.GaussianBlur(m, (0, 0), 0.12 * res)  # les zones fines sont plus teintées
    t2 = np.clip(0.25 + 0.35 * n2 + 0.5 * (1 - halo), 0, 1)[..., None]
    light = cream * (1 - t2) + cream2 * t2
    tex = dark * (1 - m[..., None]) + light * m[..., None]
    del dark, light

    # Coutures entre les bandes : fine rainure sombre + points de couture
    seam_mask = np.zeros((h, w), np.float32)
    for s in seams:
        x = (s - umin) * res
        if 0 <= x < w:
            d = np.abs(np.arange(w, dtype=np.float32) - x)
            seam_mask = np.maximum(seam_mask, np.exp(-(d / (0.05 * res)) ** 2)[None, :].repeat(h, 0))
    tex *= (1 - 0.45 * seam_mask[..., None])

    # Tissage du coton (fils) + fibres
    period = 0.085 * res
    wu = np.sin(2 * np.pi * xx / period)
    wv = np.sin(2 * np.pi * yy / period)
    weave = 0.5 * wu * wv + 0.5 * value_noise(h, w, 0.4 * res, octaves=2)
    fib = RNG.standard_normal((h, w)).astype(np.float32)
    fib = cv2.GaussianBlur(fib, (0, 0), 0.8)
    tex *= (1 + 0.07 * weave + 0.05 * fib)[..., None]
    # nuances globales (lavage, usure)
    n3 = value_noise(h, w, 9 * res, octaves=2)
    tex *= (1 + 0.07 * n3)[..., None]
    return np.clip(tex, 0, 255).astype(np.uint8), dict(umin=umin, vmin=vmin, res=res, seams=seams)


if __name__ == "__main__":
    import sys
    tex, info = make_bogolan()
    cv2.imwrite(sys.argv[1], tex)
    small = cv2.resize(tex, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA)
    cv2.imwrite(sys.argv[2], small)
    print(tex.shape, info)
