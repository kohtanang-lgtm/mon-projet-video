"""Etape 1 : detoure la tasse + soucoupe BoostCafe et efface la cuillere.

Entree  : ../references/boostcafe-tasse.jpg
Sortie  : decoupe_tasse.png (RGBA, meme taille que la photo)
Depend. : pip install "rembg[cpu]" opencv-python-headless numpy
          (le modele BiRefNet ~1 Go est telecharge au premier lancement)
"""
import os, cv2, numpy as np
from PIL import Image
from rembg import remove, new_session

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'references', 'boostcafe-tasse.jpg')

im8 = cv2.imread(SRC)
H, W = im8.shape[:2]

# 1) masque IA (BiRefNet) sur la zone de la tasse
crop = Image.open(SRC).convert('RGB').crop((260, 90, 760, 560))
mcrop = np.array(remove(crop, session=new_session('birefnet-general'), only_mask=True))
m = np.zeros((H, W), np.uint8); m[90:560, 260:760] = mcrop

# 2) ellipse de la soucoupe (contour sans la cuillere ni la tasse)
p0 = np.array([645., 302.]); d = np.array([0.61641549, 0.78742107]); n = np.array([-d[1], d[0]])
cnts, _ = cv2.findContours((m > 128).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
c = max(cnts, key=cv2.contourArea)[:, 0, :].astype(np.float32)
rel = c - p0; t = rel @ d; s = rel @ n
pts = c[(c[:, 1] > 320) & ~((t > -10) & (s > -35) & (s < 30))]
(cx, cy), (ma, MA), ang = cv2.fitEllipse(pts)

im = im8.astype(np.float32); mf = m.astype(np.float32) / 255
ell = np.zeros((H, W), np.uint8); cv2.ellipse(ell, ((cx, cy), (ma, MA), ang), 255, -1, cv2.LINE_AA)
ell = ell.astype(np.float32) / 255
ell_in = cv2.erode(ell, np.ones((3, 3), np.uint8))
a1, a2 = ma / 2, MA / 2
th = np.deg2rad(ang); u1 = np.array([np.cos(th), np.sin(th)]); u2 = np.array([-np.sin(th), np.cos(th)])
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
X = xx - cx; Y = yy - cy
p1 = (X * u1[0] + Y * u1[1]) / a1; p2 = (X * u2[0] + Y * u2[1]) / a2
r = np.sqrt(p1 ** 2 + p2 ** 2); phi = np.arctan2(p1, p2)

def rot_sample(img, deg):
    ph = phi + np.deg2rad(deg)
    q1 = r * np.sin(ph) * a1; q2 = r * np.cos(ph) * a2
    mx = (cx + q1 * u1[0] + q2 * u2[0]).astype(np.float32); my = (cy + q1 * u1[1] + q2 * u2[1]).astype(np.float32)
    return cv2.remap(img, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

# 3) effacement de la cuillere : bois voisin decale + bord de soucoupe recopie par rotation
t = (xx - p0[0]) * d[0] + (yy - p0[1]) * d[1]; s = (xx - p0[0]) * n[0] + (yy - p0[1]) * n[1]
S0, S1 = -19., 14.
band = cv2.GaussianBlur(((t > 12) & (s > S0 - 1.5) & (s < S1 + 1.5)).astype(np.float32), (0, 0), 1.0)
wid = S1 - S0 + 6
trans = cv2.remap(im, (xx + wid * n[0]).astype(np.float32), (yy + wid * n[1]).astype(np.float32), cv2.INTER_LINEAR)
wr = np.clip((r - 0.80) / 0.08, 0, 1)[..., None]
fill = trans * (1 - wr) + rot_sample(im, -30) * wr
out = im * (1 - band[..., None]) + fill * band[..., None]

# 4) alpha final : tasse (IA) + soucoupe (ellipse), sans cuillere ni sachets
lower = np.clip((yy - 282) / 12, 0, 1)
kill = ((xx > 600) & (yy > 300)).astype(np.float32) * (1 - ell)
alpha = np.clip(np.maximum(mf * (1 - kill), ell * lower), 0, 1)

# 5) suppression du reflet rose des sachets de sucre sur le bord
lab = cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)
A, B = lab[..., 1], lab[..., 2]
wood = ((B > 145) & (alpha > 0.9)).astype(np.float32)
nb = cv2.GaussianBlur(wood, (0, 0), 25) + 1e-4
Aw = cv2.GaussianBlur(A * wood, (0, 0), 25) / nb; Bw = cv2.GaussianBlur(B * wood, (0, 0), 25) / nb
pur = np.maximum(np.clip((150 - B) / 14, 0, 1) * np.clip((A - 122) / 10, 0, 1), np.clip((140 - B) / 10, 0, 1))
pur = cv2.GaussianBlur(pur, (0, 0), 1.5) * (yy > 250)
lab[..., 1] = A * (1 - pur) + Aw * pur; lab[..., 2] = B * (1 - pur) + Bw * pur
out = cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)

rgba = np.dstack([out, (alpha * 255).astype(np.uint8)])
cv2.imwrite(os.path.join(HERE, 'decoupe_tasse.png'), rgba)
print('ellipse soucoupe :', (cx, cy), (ma, MA), ang)
