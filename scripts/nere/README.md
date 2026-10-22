# Visuel « Poudre de néré » – sachet kraft sur tissu bogolan

Génère `assets/nere/sachet-nere-bogolan.png` (1380×1725, format 4:5) à partir de :

- `assets/nere/sources/sachet-original.jpg` : photo du sachet kraft à fenêtre ;
- `assets/nere/sources/nere-reference.jpg` : photo de référence de la poudre de néré.

```bash
pip install opencv-python-headless numpy
cd scripts/nere
python3 scene.py ../../assets/nere/sources/sachet-original.jpg \
                 ../../assets/nere/sources/nere-reference.jpg \
                 ../../assets/nere/sachet-nere-bogolan.png
```

## Étapes

| Fichier | Rôle |
| --- | --- |
| `window.py` | Remplace la poudre visible dans la fenêtre par la texture de néré. L'image d'origine est décomposée en *ombrage × poudre + reflet du plastique* : l'ombrage et les reflets d'origine sont conservés et réappliqués sur le néré. |
| `bogolan.py` | Dessine un tissu bogolan (motifs crème sur fond brun, bandes tissées cousues, tracé irrégulier, trame du coton). |
| `heap.py` | Petit tas de néré en relief (champ de hauteur projeté en perspective) et grains éparpillés. |
| `scene.py` | Assemble la scène : tissu en perspective avec plis, ombre portée du sachet, fond drapé flou, profondeur de champ, vignettage et grain photo. |

Le sachet lui-même (forme, couleurs, détails) n'est pas retouché : il est seulement détouré et agrandi ×1,5.
