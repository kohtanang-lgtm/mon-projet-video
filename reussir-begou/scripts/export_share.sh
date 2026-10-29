#!/usr/bin/env bash
# Crée des versions légères des vidéos rendues, pour le partage (réseaux sociaux, WhatsApp).
# usage : bash scripts/export_share.sh   (à lancer après « npm run render »)
set -euo pipefail
cd "$(dirname "$0")/.."
for fmt in 16x9 9x16; do
  src="out/reussir-begou-${fmt}.mp4"
  [ -f "$src" ] || { echo "manquant : $src"; continue; }
  # Version réseaux sociaux : pleine définition, poids réduit.
  ffmpeg -hide_banner -loglevel error -y -i "$src" \
    -c:v libx264 -preset slow -crf 22 -profile:v high -pix_fmt yuv420p \
    -c:a aac -b:a 192k -movflags +faststart "out/reussir-begou-${fmt}-reseaux.mp4"
  # Version WhatsApp : 720p, très légère.
  if [ "$fmt" = "16x9" ]; then scale="1280:720"; else scale="720:1280"; fi
  ffmpeg -hide_banner -loglevel error -y -i "$src" -vf "scale=${scale}:flags=lanczos" \
    -c:v libx264 -preset slow -crf 25 -maxrate 3M -bufsize 6M -profile:v high -pix_fmt yuv420p \
    -c:a aac -b:a 128k -movflags +faststart "out/reussir-begou-${fmt}-whatsapp.mp4"
done
ls -lh out/
