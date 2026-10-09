# Polices embarquées

| Fichier | Famille | Graisse | Source | Licence |
|---|---|---|---|---|
| `montserrat-latin-{500,600,700,800}-normal.woff2` | Montserrat | 500 → 800 | `@fontsource/montserrat@5.3.0` | SIL OFL 1.1 |
| `inter-latin-{400,500,600,700}-normal.woff2` | Inter | 400 → 700 | `@fontsource/inter@5.3.0` | SIL OFL 1.1 |

Sous-ensemble « latin » (U+0000-00FF) : couvre tous les accents du français.
Les polices sont chargées par `src/fonts.ts` (bloque le rendu jusqu'au chargement complet).
Pour utiliser la police propriétaire UBA, déposer les fichiers ici et modifier `FONT_FILES` dans `src/fonts.ts`.
