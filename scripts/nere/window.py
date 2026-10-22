"""Remplace le contenu de la fenêtre transparente du sachet par la poudre de néré."""
import cv2
import numpy as np

# Contour de la fenêtre (coordonnées de l'image d'origine 736x977)
WINDOW_POLY = np.array([
    (168, 546), (250, 548), (350, 549.5), (450, 550), (530, 549), (583, 545),
    (585, 580), (584.5, 620), (583.5, 660), (582, 700),
    (560, 703), (520, 706), (480, 709.5), (440, 711.5), (400, 712.5), (350, 711.5),
    (300, 709), (250, 703), (210, 699), (177, 697),
    (174, 660), (171.5, 620), (169.5, 580),
], np.float32)


def poly_mask(shape, poly, ss=4):
    """Masque anti-aliasé d'un polygone (sur-échantillonnage ss)."""
    h, w = shape[:2]
    big = np.zeros((h * ss, w * ss), np.uint8)
    pts = np.round((poly + 0.5) * ss - 0.5).astype(np.int32)
    cv2.fillPoly(big, [pts], 255, lineType=cv2.LINE_AA)
    return cv2.resize(big, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0


def masked_blur(img, mask, sigma):
    m = mask if img.ndim == 2 else mask[..., None]
    num = cv2.GaussianBlur(img * m, (0, 0), sigma)
    den = cv2.GaussianBlur(mask, (0, 0), sigma)
    den = np.maximum(den, 1e-4)
    return num / (den if img.ndim == 2 else den[..., None])


def prepare_nere_texture(nere_bgr, scale=0.9, brightness=1.12, contrast=0.9):
    """Aplatit l'éclairage de la photo de référence et met la texture à l'échelle."""
    t = nere_bgr.astype(np.float32)
    low = cv2.GaussianBlur(t, (0, 0), 35)
    mean = t.reshape(-1, 3).mean(0)
    flat = t / np.maximum(low, 1) * mean
    flat = mean + (flat - mean) * contrast
    flat *= brightness
    flat = cv2.resize(flat, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    return np.clip(flat, 0, 255), mean * brightness


def replace_window(img_bgr, nere_bgr, debug=False):
    img = img_bgr.astype(np.float32)
    h, w = img.shape[:2]
    win = poly_mask(img.shape, WINDOW_POLY)
    core = (win > 0.999).astype(np.float32)

    # 1) Décomposition de la fenêtre d'origine : O = s * c0 + v  (v = voile/reflet gris additif)
    clean = np.zeros_like(core)
    clean[585:690, 250:500] = 1
    c0 = img[clean > 0].mean(0)                   # couleur moyenne de la poudre d'origine
    A = np.stack([c0, np.ones(3, np.float32)], 1)  # 3x2
    pinv = np.linalg.pinv(A)                       # 2x3
    sv = img.reshape(-1, 3) @ pinv.T               # (N,2)
    s = sv[:, 0].reshape(h, w)
    v = sv[:, 1].reshape(h, w)
    # Lissage (supprime la texture de l'ancienne poudre, garde l'éclairage et les reflets)
    s_l = masked_blur(s, core, 3.0)
    v_l = masked_blur(v, core, 3.5)
    v_l = np.maximum(v_l, 0)
    s_ref = np.median(s[clean > 0])
    shade = s_l / s_ref

    # 2) Texture de néré
    tex, tex_mean = prepare_nere_texture(nere_bgr)
    th, tw = tex.shape[:2]
    x0, y0 = 166, 543
    ww, wh = 422, 172
    ox = max(0, (tw - ww) // 2)
    oy = max(0, (th - wh) // 2)
    patch = tex[oy:oy + wh, ox:ox + ww]
    canvas = img.copy()
    T = np.zeros_like(img)
    T[y0:y0 + patch.shape[0], x0:x0 + patch.shape[1]] = patch
    # léger flou : la poudre est vue à travers le film plastique
    T = cv2.GaussianBlur(T, (0, 0), 0.55)

    # reflets légèrement chauds (environnement chaud) et poudre très légèrement réchauffée
    warm_veil = np.array([0.93, 0.98, 1.0], np.float32)
    new = T * shade[..., None] * np.array([0.93, 1.03, 1.0], np.float32) + v_l[..., None] * warm_veil
    # 3) Fondu sur le bord de la fenêtre (garde le liseré d'origine)
    inner = cv2.GaussianBlur(cv2.erode(win, np.ones((3, 3), np.uint8)), (0, 0), 0.8)
    alpha = np.clip(inner, 0, 1)[..., None]
    out = canvas * (1 - alpha) + new * alpha
    out = np.clip(out, 0, 255).astype(np.uint8)
    if debug:
        return out, dict(shade=shade, veil=v_l, win=win, c0=c0)
    return out


if __name__ == "__main__":
    import sys
    a = cv2.imread(sys.argv[1])
    b = cv2.imread(sys.argv[2])
    out, d = replace_window(a, b, debug=True)
    cv2.imwrite(sys.argv[3], out)
    print('c0', d['c0'])
    sh = d['shade']; ve = d['veil']; m = d['win'] > 0.99
    print('shade range', np.percentile(sh[m], [1, 50, 99]), 'veil', np.percentile(ve[m], [1, 50, 99]))
