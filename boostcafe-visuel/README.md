# BoostCafé — visuel « Tasse en lévitation »

Visuel publicitaire inspiré de la mise en scène de la Tesla Roadster en lévitation :
la tasse BoostCafé (la vraie tasse en bois et son logo gravé, issus de la photo fournie)
flotte au-dessus de l'espace BoostCafé plongé dans une ambiance nuit, propulsée par
quatre jets de vapeur qui s'écrasent en nuage sur le sol en marbre.

| Fichier | Format | Usage conseillé |
|---|---|---|
| `boostcafe-tasse-envol-5x4.jpg` | 2000 × 1600 (5:4, cadrage de la photo Tesla) | affiche, site, Facebook |
| `boostcafe-tasse-envol-4x5.jpg` | 1280 × 1600 (4:5) | post Instagram |

## Comment le visuel est construit

1. `source/01_decoupe.py` — détoure la tasse + soucoupe (modèle IA BiRefNet), efface la
   cuillère et les sachets de sucre, corrige le reflet rose sur le bord de la soucoupe.
   Résultat : `source/decoupe_tasse.png` (fond transparent, réutilisable ailleurs).
2. `source/02_rendu.py` — compose l'image : fond BoostCafé assombri et flouté (bannière
   « boost café » visible à droite), jets de vapeur, nuage au sol, vapeur qui s'élève du
   café, lueur ambrée sous la soucoupe, trait de lumière orange, reflets, grain.

Pour régénérer :

```bash
pip install "rembg[cpu]" opencv-python-headless numpy pillow
python3 boostcafe-visuel/source/01_decoupe.py   # optionnel : decoupe_tasse.png est déjà fourni
python3 boostcafe-visuel/source/02_rendu.py
```

Les réglages principaux (position et taille de la tasse, nombre de jets, hauteur du nuage,
intensité des lueurs) sont en tête des sections de `02_rendu.py`.
