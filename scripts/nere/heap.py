"""Petit tas de poudre de néré posé sur le tissu (champ de hauteur projeté en perspective)."""
import cv2
import numpy as np

from bogolan import value_noise


class Heap:
    def __init__(self, xc, zc, radius=3.0, height=1.75, seed=5):
        self.xc, self.zc, self.R, self.Hm = xc, zc, radius, height
        rng = np.random.default_rng(seed)
        self.rng = rng
        self.res = 100                       # points par cm
        ext = radius * 1.35
        n = int(2 * ext * self.res)
        self.n = n
        g = (np.arange(n) + 0.5) / self.res - ext
        self.x, self.z = np.meshgrid(g, g)
        r = np.hypot(self.x, self.z)
        phi = np.arctan2(self.z, self.x)
        # contour irrégulier
        wob = np.zeros_like(r)
        for k, a in [(2, 0.05), (3, 0.04), (5, 0.025), (8, 0.015)]:
            wob += a * np.sin(k * phi + rng.uniform(0, 2 * np.pi))
        s = r / (radius * (1 + wob))
        prof = np.clip(1 - s, 0, None) ** 1.25
        h = height * prof
        # sommet arrondi, pied évasé
        h = cv2.GaussianBlur(h.astype(np.float32), (0, 0), 0.28 * self.res)
        # relief de surface (grumeaux)
        bump = value_noise(n, n, 0.6 * self.res, rng=rng, octaves=3) * 0.06
        bump += value_noise(n, n, 0.15 * self.res, rng=rng, octaves=2) * 0.025
        h = np.maximum(h + bump * np.clip(h / 0.3, 0, 1), 0)
        # léger affaissement côté gauche (tas versé à la cuillère)
        h *= (1 + 0.08 * np.clip(self.x / radius, -1, 1))
        self.h = h.astype(np.float32)

    def render(self, nere_tex, scene, light, light_at):
        """Rend le tas : renvoie (couleur, alpha, profondeur) à la résolution de sortie."""
        F, CX, YH, FH, FOC, W, H = (scene[k] for k in ('F', 'CX', 'YH', 'FH', 'FOC', 'W', 'H'))
        SS = 3
        X = self.xc + self.x
        Z = self.zc + self.z
        h = self.h
        valid = h > 0.004
        xs = (((CX + X * FOC / Z) + 0.5) * F - 0.5 + 0.5) * SS - 0.5
        ys = (((YH + (FH - h * FOC) / Z) + 0.5) * F - 0.5 + 0.5) * SS - 0.5

        # ombrage
        gz, gx = np.gradient(h, 1.0 / self.res)
        nrm = np.stack([-gx, np.ones_like(gx), -gz], -1)
        nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
        lam = np.clip(nrm @ light, 0, 1)
        ao = 0.78 + 0.22 * np.clip(h / 0.45, 0, 1)
        shade = (0.16 + 1.25 * lam ** 1.15) * ao * light_at(X, Z) * 1.08

        # texture (photo de référence aplatie) projetée depuis le dessus
        th, tw = nere_tex.shape[:2]
        pxcm = 42.0
        mx = (self.x * pxcm + tw / 2).astype(np.float32)
        my = (self.z * pxcm + th / 2).astype(np.float32)
        col = cv2.remap(nere_tex, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        g = col.mean(-1, keepdims=True)
        col = g + (col - g) * 1.12                 # un peu plus de saturation à l'air libre
        col = col * shade[..., None]

        # rasterisation avec z-buffer (splats 3x3)
        x0 = int(np.floor(xs[valid].min())) - 3; x1 = int(np.ceil(xs[valid].max())) + 4
        y0 = int(np.floor(ys[valid].min())) - 3; y1 = int(np.ceil(ys[valid].max())) + 4
        bw, bh = x1 - x0, y1 - y0
        zbuf = np.full(bw * bh, np.inf, np.float32)
        cbuf = np.zeros((bw * bh, 3), np.float32)
        abuf = np.zeros(bw * bh, np.float32)
        xi = np.round(xs[valid]).astype(np.int64) - x0
        yi = np.round(ys[valid]).astype(np.int64) - y0
        zz = Z[valid].astype(np.float32)
        cc = col[valid].astype(np.float32)
        aa = np.clip(h[valid] / 0.05, 0, 1).astype(np.float32)   # pied qui se fond dans le tissu
        offs = [(dx, dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1)]
        for dx, dy in offs:
            idx = (yi + dy) * bw + (xi + dx)
            np.minimum.at(zbuf, idx, zz + 0.002 * (abs(dx) + abs(dy)))
        for dx, dy in offs:
            idx = (yi + dy) * bw + (xi + dx)
            sel = zz + 0.002 * (abs(dx) + abs(dy)) <= zbuf[idx] + 1e-6
            cbuf[idx[sel]] = cc[sel]
            abuf[idx[sel]] = aa[sel]
        cbuf = cbuf.reshape(bh, bw, 3); abuf = abuf.reshape(bh, bw)
        zb = zbuf.reshape(bh, bw); zb[~np.isfinite(zb)] = self.zc

        # retour à la résolution de sortie
        fx0, fy0 = x0 // SS, y0 // SS
        pad_l, pad_t = x0 - fx0 * SS, y0 - fy0 * SS
        tw_ = int(np.ceil((bw + pad_l) / SS)) * SS; th_ = int(np.ceil((bh + pad_t) / SS)) * SS
        C = np.zeros((th_, tw_, 3), np.float32); A = np.zeros((th_, tw_), np.float32)
        Zm = np.full((th_, tw_), self.zc, np.float32)
        C[pad_t:pad_t + bh, pad_l:pad_l + bw] = cbuf * abuf[..., None]
        A[pad_t:pad_t + bh, pad_l:pad_l + bw] = abuf
        Zm[pad_t:pad_t + bh, pad_l:pad_l + bw] = zb
        C = cv2.resize(C, (tw_ // SS, th_ // SS), interpolation=cv2.INTER_AREA)
        A = cv2.resize(A, (tw_ // SS, th_ // SS), interpolation=cv2.INTER_AREA)
        Zm = cv2.resize(Zm, (tw_ // SS, th_ // SS), interpolation=cv2.INTER_AREA)
        col_full = np.zeros((H, W, 3), np.float32); a_full = np.zeros((H, W), np.float32)
        z_full = np.full((H, W), self.zc, np.float32)
        hh, ww = A.shape
        ys0, xs0 = max(fy0, 0), max(fx0, 0)
        ye, xe = min(fy0 + hh, H), min(fx0 + ww, W)
        col_full[ys0:ye, xs0:xe] = C[ys0 - fy0:ye - fy0, xs0 - fx0:xe - fx0]
        a_full[ys0:ye, xs0:xe] = A[ys0 - fy0:ye - fy0, xs0 - fx0:xe - fx0]
        z_full[ys0:ye, xs0:xe] = Zm[ys0 - fy0:ye - fy0, xs0 - fx0:xe - fx0]
        return col_full, a_full, z_full   # couleur prémultipliée


def scatter_grains(xc, zc, R, nere_tex, rng, n=380):
    """Grains de poudre éparpillés autour du tas (coordonnées sol, cm)."""
    ang = rng.uniform(0, 2 * np.pi, n)
    d = R * 0.95 + rng.exponential(0.55, n) * (1 + 0.5 * (np.cos(ang - 0.3) > 0))
    gx = xc + d * np.cos(ang)
    gz = zc + d * np.sin(ang) * 0.9
    size = np.clip(rng.lognormal(np.log(0.03), 0.4, n), 0.015, 0.085)
    th, tw = nere_tex.shape[:2]
    cols = nere_tex[rng.integers(0, th, n), rng.integers(0, tw, n)].astype(np.float32)
    cols = 0.6 * cols + 0.4 * nere_tex.reshape(-1, 3).mean(0)
    return gx, gz, size, cols
