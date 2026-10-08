# Phase 2 : production et rendu (version animatique 45 s)

Statut : **rendu livré**, en version animatique : la voix est une voix témoin, la musique est provisoire et le film est entièrement graphique.

## 1. Décisions appliquées (votre validation du 8 octobre 2026)

| Sujet | Décision |
|---|---|
| Durée | **45 s** : script long, avec les corrections de la Phase 1 |
| « 100 % d'immersion pratique » | Conservé (voix et jauge animée) |
| Licence Pro | **« Journalisme & Culture Numérique »** (intitulé officiel) |
| Média Lab | Aucun nom propre : « **des amphis aux studios** » (voix et écran) |
| Abonnés | « **+10 000** » en attendant le chiffre exact au jour de la diffusion. Le chiffre se modifie en une ligne : `config/script.fr.js` → `stats.followers` |
| Voix | Voix témoin de synthèse traitée comme une voix de spot (voir §3), à remplacer par le comédien |
| Images de la page Facebook | **Non intégrées** : la politique réseau de l'environnement bloque facebook.com (refus 403). Le film utilise des **illustrations animées** à la place, et chaque emplacement accepte une photo (voir §4). |
| Logos | Logos DC, FALSH et Université utilisés tels que fournis. Le logo DC est découpé en 13 calques alignés au pixel, ce qui permet de le construire à l'écran. |

## 2. Script voix off final (45 s)

> « À l'Université de Ngaoundéré, un département fait parler de lui. Cent pour cent d'immersion pratique : pas de théorie dans le vide. Des amphis aux studios, bienvenue au Département de Communication. Ici, les professionnels de demain ne naissent pas : ils se forment. Des étudiants aguerris, et des partenaires rassurés, qui savent leur communication entre de bonnes mains. Notre secret ? Des enseignants-chercheurs qualifiés, un matériel de pointe, et un suivi personnalisé, de la Licence Pro Journalisme et Culture numérique, jusqu'au Master. Tout est réuni pour faire la différence. Rejoignez-nous à Dang, à Ngaoundéré. Votre avenir mérite l'excellence. Département de Communication : votre histoire commence ici. »

Les repères de synchronisation (23 phrases, à 60 i/s) sont dans `config/timeline.json`. Le dernier mot tombe à 43,5 s ; le logo reste ensuite seul à l'écran pendant 1,5 s.

## 3. Ce qui est provisoire et comment le remplacer

| Élément | Version actuelle | Pour la version finale |
|---|---|---|
| **Voix off** | Kokoro TTS (voix `ff_siwis`, modèle libre), traitée comme une voix pub : égalisation, de-esser, compression en deux étages, légère ambiance studio, −18 LUFS | Déposer les prises du comédien dans `assets/audio/vo_takes/G01.wav` … `G11.wav` (un fichier par groupe de `tools/audio/build_vo.py`), puis lancer `npm run audio`. **Toute l'animation se recale seule** sur la nouvelle voix. |
| **Musique** | Composition synthétisée par code : 120 BPM, ré majeur, coupure sur « Notre secret ? », drop sur la première raison, cadence plagale sur « ici » | Déposer une piste sous licence dans `assets/audio/music_licensed.wav`, puis `npm run audio`. Le ducking sous la voix reste automatique. |
| **Effets sonores** | Synthétisés (whooshes, impacts, tics, tambour d'appel, signature sonore en 3 notes) | Facultatif : remplacer par une banque sous licence, mêmes repères (`config/sfx.json`) |
| **Images** | Illustrations animées (gradins, studio, promotion, réseau de partenaires, article, banc de montage, courbe d'engagement) | Voir §4 |

Mix final : −14 LUFS intégré, true peak ≤ −1 dBTP, 48 kHz.

## 4. Ajouter les photos du Département

1. Déposer les photos dans `assets/images/`. Idéalement ≥ 2000 px, sujet centré, et avec l'accord des personnes reconnaissables.
2. Renseigner leur chemin dans `config/media.js` :

| Emplacement | Scène | Photo attendue |
|---|---|---|
| `amphi` | « Des amphis… » | Amphithéâtre plein, plan large |
| `studios` | « …aux studios » | Caméra, micro, étudiant(e) en tournage |
| `etudiants` | « Des étudiants aguerris » | Étudiant(e)s en situation de travail |
| `partenaires` | « …des partenaires rassurés » | Rencontre avec un professionnel ou un partenaire |
| `p1` | 01 · Enseignants-chercheurs | Enseignant(e) avec étudiant(e)s |
| `p2` | 02 · Matériel de pointe | Caméra, console, micro |
| `p3` | 03 · Suivi personnalisé | Accompagnement en tête-à-tête |

Le recadrage, l'étalonnage commun et le léger mouvement de caméra s'appliquent automatiquement. Le plus simple : **joindre les photos dans la conversation**, et je les intègre et relance le rendu.

## 5. Architecture du projet

```
spot-dept-communication/
├── index.html / vertical.html   pages d'entrée 16:9 et 9:16 (même code, format choisi par DC_FORMAT)
├── config/                      tout ce qui se modifie sans toucher à l'animation
│   ├── brand.js                 couleurs, polices, courbes d'easing
│   ├── script.fr.js             textes à l'écran, nombre d'abonnés
│   ├── formats.js               dimensions, marges, zones de sécurité
│   ├── media.js                 emplacements photo (null = illustration)
│   ├── timeline.js/.json        repères générés depuis la voix off
│   ├── sfx.json                 effets sonores et structure musicale, calés sur les repères
│   └── logo-layers.js, map-cameroon.js   générés par tools/brand
├── src/
│   ├── utils/                   DOM/SVG, courbes cubic-bezier, repères temporels
│   ├── components/              motifs (point, onde, guillemets, losange, trait), illustrations, logo, carte
│   ├── scenes/                  s01 → s10, une scène par fichier
│   └── main.js                  chef d'orchestre (timeline GSAP enregistrée pour HyperFrames)
├── tools/
│   ├── audio/                   build_vo.py (voix + repères), build_mix.py (musique, SFX, mix), dsp.py, synth.py
│   └── brand/                   split_logo.py (calques du logo), build_map.py (contour du Cameroun)
├── assets/                      brand, fonts (Syne, Inter — OFL), audio, images, vendor (GSAP)
└── output/                      MP4 rendus
```

## 6. Commandes

```bash
# audio (Python ≥ 3.11 : pip install -r tools/requirements.txt ; modèle Kokoro dans $KOKORO_DIR)
npm run audio

# rendu (Node ≥ 22, FFmpeg, Chrome headless)
npm run render:16x9   # → output/spot-dc-45s-16x9.mp4  (1920×1080, 60 i/s)
npm run render:9x16   # → output/spot-dc-45s-9x16.mp4  (1080×1920, 60 i/s)
```

## 7. Points à valider avant la version finale

1. **Nombre exact d'abonnés** au jour de la diffusion. Il s'affiche actuellement « +10 000 ».
2. **Prononciation** de « Ngaoundéré » et de « Dang » par la voix témoin : à corriger lors de l'enregistrement du comédien.
3. **Photos** de la page Facebook : à transmettre directement, car l'environnement ne peut pas accéder à Facebook (voir §4).
4. **Logos en haute définition** (SVG ou PNG ≥ 2000 px) pour un plan final parfaitement net. Les fichiers actuels de 500 px sont légèrement agrandis.
