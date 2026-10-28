#!/usr/bin/env python3
"""Finalise les rendus Remotion pour la diffusion sur les réseaux sociaux.

Pour chaque vidéo de out/brut/ :
  - son normalisé à -14 LUFS, crête vraie -1 dB (norme Instagram, TikTok, Facebook, YouTube)
  - image H.264 yuv420p plage TV, lecture immédiate en ligne (faststart)
  - écrit le résultat dans rendus/ ; la version 9:16 est aussi déclinée en 720p légère (WhatsApp)

Usage : python3 scripts/finaliser.py
"""
import json
import subprocess
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
BRUT = RACINE / 'out/brut'
RENDUS = RACINE / 'rendus'


def mesure(source):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(source), '-vn', '-af',
                        'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True, check=True)
    return json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])


def finaliser(source, cible, largeur=None, crf=17, audio='192k'):
    m = mesure(source)
    norme = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}"
             f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}"
             ":linear=true,aresample=48000")
    image = 'scale=in_range=pc:out_range=tv' + (f',scale={largeur}:-2:flags=lanczos' if largeur else '') + ',format=yuv420p'
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source),
                    '-vf', image, '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-profile:v', 'high',
                    '-color_range', 'tv', '-af', norme, '-c:a', 'aac', '-b:a', audio, '-movflags', '+faststart',
                    str(cible)], check=True)
    print(f'{cible.name} : son {float(m["input_i"]):.1f} LUFS → -14 LUFS')


def main():
    RENDUS.mkdir(exist_ok=True)
    for source in sorted(BRUT.glob('*.mp4')):
        finaliser(source, RENDUS / source.name)
        if '9x16' in source.stem:
            finaliser(source, RENDUS / f'{source.stem}-leger.mp4', largeur=720, crf=24, audio='128k')


if __name__ == '__main__':
    main()
