# mon-projet-video
Projet de création et montage vidéo automatisé (Remotion / HyperFrames) pour le concours national « EXPRIME TON TALENT » (Tchad 2026).

## Spot institutionnel UBA Tchad — « Voir plus grand »

Film de motion design de **51 s** (1920 × 1080), entièrement généré par code avec [Remotion](https://www.remotion.dev/)
et **synchronisé mot à mot sur la voix-off**.

- 📋 **Découpage synchro, analyse du site et direction artistique** : [`docs/DECOUPAGE.md`](docs/DECOUPAGE.md)
- 🎙️ Voix-off : `public/audio/voix-off-uba-tchad.mp3` (maître du temps)
- 🔊 Habillage sonore procédural : `public/audio/sound-design.mp3`

### Démarrage

```bash
npm install
npm run studio        # prévisualisation interactive (timeline, scrubbing image par image)
npm run render        # rendu final → out/uba-tchad-spot.mp4 (H.264 CRF 16, AAC 320k)
npm run render:draft  # brouillon rapide en demi-résolution
npm run stills        # images de contrôle aux repères clés → out/stills/
```

Rendu en 60 i/s (le montage est écrit en secondes, aucune retouche nécessaire) :

```bash
npx remotion render UbaTchadSpot out/uba-tchad-spot-60fps.mp4 --props='{"fps":60,"soundDesign":true}'
```

Sur une machine sans accès au téléchargement de Chrome, pointer vers un Chromium existant :

```bash
export REMOTION_BROWSER_EXECUTABLE=/chemin/vers/chrome-headless-shell
```

### Chaîne de synchronisation

```
voix-off.mp3 ──► scripts/align_voiceover.py ──► src/timeline/voiceover.json ──► src/timeline/cues.ts ──► scènes
                 (pauses, virgules, sibilantes)   (126 mots horodatés)            (repères nommés : CUE.leo…)
```

- `npm run align` — ré-aligne le texte sur l'audio (Python 3 + numpy + ffmpeg). Chaque mot est marqué
  « mesuré » ou « estimé » ; les temps forts de l'image ne sont calés que sur des mots mesurés.
- `npm run sound` — régénère l'habillage sonore à partir des mêmes repères (ducking automatique sous la VO).
- Changer de voix-off = remplacer le MP3, adapter le texte dans `SCRIPT` (align_voiceover.py), relancer
  `npm run align && npm run sound`. Toutes les animations suivent.

### Structure

```
src/
  theme.ts            charte : couleurs UBA, polices, courbes d'animation, verre
  brand.ts            ressources de marque (logo officiel, avatar Léo, URL, signature)
  fonts.ts            chargement bloquant des polices (Montserrat, Inter — OFL)
  timeline/           voiceover.json (généré) + cues.ts (repères, fenêtres de scènes)
  lib/motion.ts       primitives d'animation (progressions, ressorts, révélations)
  components/         fond & lumière, typographie cinétique, verre, iso 3D, smartphone,
                      carte bancaire, avatar Léo, globe, logo, pictogrammes
  scenes/             S1 Ambition · S2 Particuliers · S3 Digital · S4 Corporate · S5 Signature
scripts/
  align_voiceover.py      alignement mot à mot de la voix-off
  generate_sound_design.py habillage sonore procédural
  render-stills.mjs       images de contrôle (QA)
```

### Avant diffusion

Le film fonctionne sans fichier externe grâce à des substituts vectoriels fidèles à la charte. Pour la
version finale, déposer dans `public/brand/` le **logo officiel UBA** et l'**avatar de Léo**, puis renseigner
leurs chemins dans `src/brand.ts`. Voir la liste complète des points à valider dans
[`docs/DECOUPAGE.md`](docs/DECOUPAGE.md#5-points-à-valider-avant-diffusion).
