import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { useMiseEnPage } from '../miseEnPage';
import { C, F } from '../theme';
import { ressort } from './anim';

type Item = { readonly de: number; readonly a: number; readonly texte: string };

// Sous-titres incrustés (vidéo compréhensible sans le son), calés sur la future voix off.
export const SousTitres: React.FC<{ items: readonly Item[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mp = useMiseEnPage();
  const actif = items.find((i) => frame >= i.de && frame < i.a);
  if (!actif) return null;
  const p = ressort(frame, fps, actif.de, { damping: 200, stiffness: 160 }, 12);
  const sortie = interpolate(frame, [actif.a - 6, actif.a], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const mots = actif.texte.split(' ');
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: mp.sousTitre.y,
        display: 'flex',
        justifyContent: 'center',
        transform: `translateY(-50%) translateY(${(1 - p) * 24}px) scale(${0.96 + 0.04 * p})`,
        opacity: p * sortie,
      }}
    >
      <div
        style={{
          maxWidth: mp.sousTitre.largeurMax,
          padding: `${mp.sousTitre.taille * 0.38}px ${mp.sousTitre.taille * 0.75}px`,
          borderRadius: mp.sousTitre.taille * 0.6,
          background: 'rgba(11, 37, 64, 0.82)',
          boxShadow: '0 12px 34px rgba(60, 15, 0, 0.25)',
          color: C.blanc,
          fontFamily: F.titre,
          fontWeight: 800,
          fontSize: mp.sousTitre.taille,
          lineHeight: 1.25,
          textAlign: 'center',
        }}
      >
        {mots.map((m, i) => {
          const pm = ressort(frame, fps, actif.de + 2 + i * 1.6, { damping: 200 }, 10);
          return (
            <span key={i} style={{ display: 'inline-block', opacity: 0.25 + 0.75 * pm, marginRight: i < mots.length - 1 ? '0.26em' : 0 }}>
              {m}
            </span>
          );
        })}
      </div>
    </div>
  );
};
