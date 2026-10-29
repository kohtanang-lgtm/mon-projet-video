# REUSS!R BÉ-GOU — Conférence 3 · vidéo motion design

Vidéo promotionnelle de la conférence « Vérités et Réconciliation sur l'Emploi & le Capital »
(20 et 21 novembre 2026, Radisson Blu), portée par Edgard Djimhotengar DJERASSEM et le consortium.

- Durée : 51,5 s, 30 images/s
- Deux formats depuis le même code : **16:9** (1920×1080) et **9:16** (1080×1920)
- Réalisée avec [Remotion](https://www.remotion.dev/) (React → MP4)

## Découpage (calé sur un tempo de 120 BPM)

| # | Temps | Scène | Contenu |
|---|-------|-------|---------|
| 1 | 0:00 | Accroche | Le « ! » rouge du logo s'écrase et devient le « I » de « !MAGINEZ », puis la caméra plonge dans son point |
| 2 | 0:02 | Imaginez | « 2 jours » · « dans une grande salle » · « avec des invités exceptionnels » |
| 3 | 0:08 | Logo | Les lettres REUSS!R tombent une à une, le « ! » arrive en dernier ; « Conférence 3 » se trace |
| 4 | 0:14 | Thème | « Vérités & Réconciliation », puis les bandeaux de l'affiche |
| 5 | 0:20 | Jour 1 | Emploi — les aînés DRH × les cadets diplômés — croissance professionnelle |
| 6 | 0:26 | Jour 2 | Capital — les DG de banque × les jeunes entrepreneurs — financement du business |
| 7 | 0:32 | Programme | Finance, tech, business, orientation & formation, opportunités d'investissement → « Du lourd arrive ! » |
| 8 | 0:36 | Date & lieu | 20–21 novembre 2026, Radisson Blu |
| 9 | 0:40 | Consortium | Le porteur du projet, les 5 partenaires, l'assistance technique |
| 10 | 0:46 | Fin | Logo, thème, date, lieu, #REUSSIRBEGOU |

## Utilisation

```bash
npm install
npm run studio        # aperçu interactif dans le navigateur
npm run render        # rend les deux formats dans out/
```

## Personnaliser

- **Logos des partenaires** : déposer les fichiers dans `public/logos/` puis renseigner `logo:` dans
  `src/partners.ts`. Sans logo, le nom du partenaire s'affiche dans la carte.
- **Textes** : les journées sont paramétrées dans `src/Video.tsx`, les autres textes sont dans `src/scenes/`.
- **Couleurs, polices, rythme** : `src/theme.ts` (couleurs relevées sur l'affiche officielle).
- **Musique** : `public/audio/bande-son.wav`. Pour la remplacer par un morceau sous licence, écraser ce
  fichier (même nom) ; idéalement un titre à 120 BPM dont le premier temps fort tombe à 0,5 s.

## Fichiers

- `assets-source/` : affiche et logo reçus (références d'origine).
- `src/logo/logoPaths.ts` : logo vectorisé lettre par lettre (généré par `scripts/vectorize_logo.py`).
- `scripts/make_audio.py` : bande son **provisoire**, entièrement synthétisée (libre de droits),
  avec impacts et whooshs placés sur les animations.
- `scripts/stills.mjs` : rend des images de contrôle (`node scripts/stills.mjs <dossier> Teaser16x9 15 300 …`).
- `scripts/measure.js` : mesure la largeur des textes dans les polices du projet.
- `public/fonts/` : Anton, Montserrat, Nunito, Kaushan Script (Google Fonts, licence OFL).
