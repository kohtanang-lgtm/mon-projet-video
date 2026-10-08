---
workflow: general-video
flow: automation
storyboard: no
message: "Kohtanan Genia, 28 ans, créateur digital du Moyen-Chari / Mandoul, donne une identité forte à la jeunesse tchadienne."
destination: social (TikTok / Reels / Shorts)
aspect: "9:16"
resolution: 1080x1920
language: fr
length: ~55s (after silence removal)
---

## Intent

Recut of a raw selfie-style talking-head video (`Vidéo brute`, 464×832, 2 min 18 s) into a
tight vertical social video. The user asked for `/motion-graphics` + `/talking-head-recut`;
because the edit removes silences and drops a retake (a footage remix), the build runs in
`/general-video`, borrowing talking-head-recut's overlay layouts and motion-graphics' kinetic
type / lower-third craft.

User instructions (verbatim, translated order kept):

1. Synchronise le face caméra et les B-Rolls sur le rythme de la voix-off en supprimant tous les silences.
2. Génère une carte d'identité 3D/Néon au début : 'KOHTANAN GENIA | 28 ans | Créateur Digital'.
3. Ajoute une incrustation 'Moyen-Chari / Mandoul 📍' au moment où je parle de mes origines.
4. Incruste mes captures de projets visuels et montages en overlay/split-screen dynamique pendant la démonstration.
5. Ajoute des sous-titres animés dynamiques (Kinetic Typography) en bas de l'écran avec mise en surbrillance des mots-clés.
6. Ajoute des effets sonores (SFX) sur les transitions et un beat de fond ajusté sous la voix.

Render: 9:16, 1080×1920 ("Résolution 8K" also mentioned — see Notes).

## Assets

- `assets/media/facecam.mp4` — silence-cut, 1080×1920 / 30 fps upscale of the raw clip (35 kept speech segments; take 2 of the "Du design graphique…" passage used, take 1 dropped).
- `assets/media/voice.m4a` — the clip's own voice, cleaned (RNNoise, EQ, de-ess, compression, −15 LUFS). No separate voice-over file was supplied.
- `assets/media/beat.m4a` — procedurally synthesised 100 BPM groove (`source/make_beat.py`), arranged on the edit's sections.
- `assets/sfx/*` — HyperFrames bundled SFX library.
- `assets/media/id-photo.jpg` — portrait cropped from the footage for the ID card.
- No `assets/` folder and no project screenshots were supplied: the split-screen panels are designed motion graphics. Drop real captures in `assets/broll/` to swap them in.

## Notes

- Transcript: Whisper large-v3 / turbo + Parakeet TDT v3 (sherpa-onnx, local); Hugging Face is blocked by the environment network policy, models came from GitHub releases.
- Uncertain words in the intro (quiet audio) are listed in `source/script.txt` review notes in the hand-off.
- 8K (4320×7680) not rendered: the source is 464×832, so 8K would be a ~9× upscale with no added detail and a very long render.
