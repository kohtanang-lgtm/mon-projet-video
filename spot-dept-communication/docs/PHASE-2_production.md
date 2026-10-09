# Phase 2 : production et rendu (41 s, voix off enregistrée)

Statut : **rendu livré** (version du 9 octobre 2026). Le film est calé sur la **voix off enregistrée**. La musique et les effets sonores restent provisoires.

## 1. Ce qui a changé avec vos fichiers du 9 octobre

| Élément reçu | Analyse | Ce qui a été fait |
|---|---|---|
| **Voix off** (`Voix_off.mp3`) | **39,47 s**, mono 44,1 kHz, propre : silences à −80 dB, aucune musique, −27,4 LUFS | La voix sert désormais de **référence temporelle**. Elle est découpée en **24 phrases** sur ses pauses réelles (contrôle phrase par phrase par transcription automatique), puis traitée légèrement : passe-haut, compression douce, −18 LUFS. Le rythme du comédien est conservé tel quel : aucune coupe, aucun retiming. |
| **Durée** | Dernier mot à 39,44 s | Spot de **41,0 s** : la voix, puis 1,55 s de plan fixe sur le logo, comparable aux 40 s de la référence. |
| **Vidéo de référence** | Spot « Groupe scolaire Les Élites » (Sotuba, Bamako), 40 s : le modèle dont le script est adapté | Utilisée **uniquement comme référence** de rythme et de mouvement, rien n'en est repris. Retenu : une idée par phrase, révélations mot à mot, photo en carte arrondie lumineuse, épingle et pulsations sur le lieu, plan final logo + coordonnées. La direction artistique du Département (studio sombre, vert, 5 motifs du logo) est conservée. |
| **Logos** | Identiques au bit près aux fichiers déjà intégrés | Aucun changement |
| **Photo « Entrée de l'Université »** | 1080×642 | **S1** : la photo apparaît quand la voix dit « l'Université de Ngaoundéré », car l'enseigne affiche ces mots. Elle s'ouvre ensuite en plein cadre, assombrie, sous « Un département fait parler de lui ». |
| **Photo « Bâtiment FALSH »** | 1080×524 | **S3** : panneau « Des amphis », légendé « FALSH · CAMPUS DE DANG » |
| **Photo « Étudiants »** | **Non reçue** (2 photos jointes sur 3) | L'emplacement `etudiants` (S5, « Des étudiants aguerris ») garde son illustration animée en attendant |

Textes écran alignés sur ce que dit la voix : « PAS **UNE** THÉORIE DANS LE VIDE. », nouveau temps « **CHAQUE ANNÉE.** » (cinq traits s'allument), « AU **MÉDIA LAB** ». Le compteur « +10 000 ABONNÉS » passe sur le plan final, à côté de « Suivez-nous » : la voix enchaîne désormais sans silence après « à Ngaoundéré ».

## 2. Texte prononcé et repères (extraits de l'enregistrement)

| Repère | Début → fin (s) | Phrase |
|---|---|---|
| hook_a / hook_b | 0,03 → 1,61 / 1,77 → 3,35 | À l'Université de Ngaoundéré, / un département fait parler de lui. |
| prat_a / prat_b / annee | 3,69 → 5,33 / 5,63 → 6,76 / 7,00 → 7,60 | Cent pour cent d'immersion pratique. / Pas une théorie dans le vide. / Chaque année. |
| studios / welcome | 7,87 → 9,28 / 9,52 → 11,46 | Des amphis au Média Lab, / bienvenue au Département de Communication. |
| pros_a / pros_b | 11,80 → 14,12 / 14,40 → 15,18 | Ici, les professionnels de demain ne naissent pas, / ils se forment. |
| aud_a / aud_b / aud_c | 15,51 → 16,72 / 16,95 → 18,16 / 18,39 → 20,34 | Des étudiants aguerris, / des partenaires rassurés / …communication entre de bonnes mains. |
| secret | 20,66 → 21,30 | Notre secret ? |
| p1 / p2 / p3 | 21,58 → 23,21 / 23,40 → 24,50 / 24,63 → 26,05 | Des enseignants-chercheurs qualifiés, / un matériel de pointe / et un suivi personnalisé, |
| lic / master | 26,33 → 28,81 / 28,91 → 29,81 | de la Licence Pro en Journalisme et Culture numérique / jusqu'au Master. |
| reuni | 30,08 → 31,85 | Tout est réuni pour faire la différence. |
| join_a / join_b | 32,09 → 33,20 / 33,33 → 34,09 | Rejoignez-nous à Dang, / à Ngaoundéré. |
| avenir | 34,37 → 36,08 | Votre avenir mérite l'excellence. |
| sig_a / sig_b | 36,30 → 37,64 / 37,92 → 39,44 | Département de Communication. / Votre histoire commence ici. |

Les animations et les effets sonores visent soit une phrase (`p1.start`), soit **un mot** (`welcome@Département`, `join_a@Dang`). L'instant d'un mot est estimé au prorata des lettres dans la phrase. Si une nouvelle prise remplace `assets/audio/source/voix_off.mp3`, lancer `npm run audio` recale tout le film.

**À réécouter :** dans « à Ngaoundéré » (33,3 s), la transcription automatique n'a pas reconnu le mot, ce qui peut signaler une articulation un peu rapide. « Chaque année » (7,0 s) est également très rapide.

## 3. Ce qui reste provisoire

| Élément | Version actuelle | Pour la version finale |
|---|---|---|
| **Musique** | Composition synthétisée par code : 120 BPM, ré majeur, groove sur « Cent pour cent », coupure sur « Notre secret ? », drop sur « Des enseignants-chercheurs », cadence plagale sur « ici » | Déposer une piste sous licence dans `assets/audio/music_licensed.wav`, puis `npm run audio`. Le ducking sous la voix reste automatique. |
| **Effets sonores** | Synthétisés, calés au mot (`config/sfx.json`) | Facultatif : banque sous licence, mêmes repères |
| **Images sans photo** | Illustrations animées (studio, étudiants, partenaires, article, banc de montage, courbe d'engagement) | Voir §4 |

Mix final : −14 LUFS intégré, true peak ≤ −1 dBTP, 48 kHz.

## 4. Emplacements photo (`config/media.js`)

| Emplacement | Scène | État |
|---|---|---|
| `entree` | S1 · « À l'Université de Ngaoundéré » | ✅ `entree_universite.jpg` |
| `amphi` | S3 · « Des amphis… » | ✅ `batiment_falsh.jpg` |
| `studios` | S3 · « …au Média Lab » | Illustration (photo du Média Lab bienvenue) |
| `etudiants` | S5 · « Des étudiants aguerris » | **Photo attendue** |
| `partenaires` | S5 · « des partenaires rassurés » | Illustration |
| `p1` / `p2` / `p3` | S6 · enseignants / matériel / suivi | Illustrations |

Les photos fournies font 1080 px de large. Elles restent nettes en carte, mais s'adoucissent en plein cadre (S1 : assombrie et légèrement floutée à dessein). Des originaux ≥ 2000 px amélioreraient le rendu.

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
│   ├── utils/                   DOM/SVG, courbes cubic-bezier, repères (phrase et mot)
│   ├── components/              motifs (point, onde, guillemets, losange, trait), illustrations, logo, carte
│   ├── scenes/                  s01 → s10, une scène par fichier
│   └── main.js                  chef d'orchestre (timeline GSAP enregistrée pour HyperFrames)
├── tools/
│   ├── audio/                   align_vo.py (voix enregistrée → repères), build_mix.py (musique, SFX, mix),
│   │                            build_vo.py (voix témoin de synthèse, secours), dsp.py, synth.py
│   └── brand/                   split_logo.py (calques du logo), build_map.py (contour du Cameroun)
├── assets/                      brand, fonts (Syne, Inter — OFL), audio (source/voix_off.mp3), images, vendor (GSAP)
└── output/                      MP4 rendus
```

## 6. Commandes

```bash
# audio (Python ≥ 3.11 : pip install -r tools/requirements.txt)
npm run audio          # align_vo.py (voix → repères, vo_master.wav) puis build_mix.py (mix_master.wav)

# rendu (Node ≥ 22, FFmpeg, Chrome headless)
npm run render:16x9    # → output/spot-dc-41s-16x9.mp4  (1920×1080, 60 i/s)
npm run render:9x16    # → output/spot-dc-41s-9x16.mp4  (1080×1920, 60 i/s)
```

Rendus livrés (vérifiés le 9 octobre 2026) :

| Fichier | Format | Images | Audio |
|---|---|---|---|
| `output/spot-dc-41s-16x9.mp4` | H.264, 1920×1080, 60 i/s, 41,000 s, 25,6 Mo | 2 460 | AAC 48 kHz stéréo 256 kb/s, −14,0 LUFS, crête −1,7 dBTP |
| `output/spot-dc-41s-9x16.mp4` | H.264, 1080×1920, 60 i/s, 41,000 s, 24,1 Mo | 2 460 | idem |

Synchronisation contrôlée sur les fichiers finaux : décalage de 0,0 ms entre la voix du MP4 et la voix de référence (corrélation croisée), et image vérifiée sur 12 mots clés.

Note : `hyperframes lint` signale `multiple_root_compositions`, car le projet a deux pages d'entrée. C'est volontaire : chaque rendu cible sa page avec `-c`, et l'audio n'est pas doublé.

## 7. Points à valider avant diffusion

1. **Photo des étudiants** : à joindre (S5).
2. **Nombre exact d'abonnés** au jour de la diffusion. Il s'affiche « +10 000 » et se modifie dans `config/script.fr.js` → `stats.followers`.
3. **Écoute de la voix** sur « à Ngaoundéré » (33,3 s) et « Chaque année » (7,0 s).
4. **Musique sous licence** pour remplacer la musique provisoire.
5. **Logos en haute définition** (SVG ou PNG ≥ 2000 px) pour un plan final parfaitement net.
