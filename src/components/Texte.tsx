import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, F, OMBRE_TEXTE } from '../theme';
import { ressort } from './anim';

export type Segment = { readonly t: string; readonly c?: string };
// `de` : image d'apparition propre à la ligne (sinon, enchaînement automatique depuis `debut`).
export type LigneTexte = { readonly segments: readonly Segment[]; readonly taille: number; readonly de?: number };

// Texte cinétique : chaque mot remonte derrière un masque, ligne après ligne.
// `sortie` : image à partir de laquelle les mots ressortent par le haut.
export const TexteCinetique: React.FC<{
  lignes: readonly LigneTexte[];
  debut: number;
  sortie?: number;
  align?: 'left' | 'center';
  interligne?: number;
  ecart?: number;
  police?: string;
  poids?: number;
}> = ({ lignes, debut, sortie, align = 'left', interligne = 0.98, ecart = 2.4, police = F.titre, poids = 900 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let index = 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start' }}>
      {lignes.map((ligne, li) => {
        const mots = ligne.segments.flatMap((seg) =>
          seg.t.split(' ').map((mot) => ({ mot, couleur: seg.c ?? C.blanc })),
        );
        const departLigne = ligne.de;
        return (
          <div
            key={li}
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              fontFamily: police,
              fontWeight: poids,
              fontSize: ligne.taille,
              lineHeight: interligne,
              paddingTop: ligne.taille * 0.16,
              paddingBottom: ligne.taille * 0.08,
              marginTop: li === 0 ? 0 : -ligne.taille * 0.2,
              paddingLeft: 8,
              paddingRight: 8,
              letterSpacing: '-0.01em',
            }}
          >
            {mots.map((m, mi) => {
              const i = index++;
              const depart = departLigne !== undefined ? departLigne + mi * ecart : debut + i * ecart + li * 2;
              const p = ressort(frame, fps, depart, { damping: 200, stiffness: 120 }, 20);
              const q = sortie === undefined ? 0 : ressort(frame, fps, sortie + i * 1.2, { damping: 200, stiffness: 140 }, 14);
              return (
                <span
                  key={mi}
                  style={{
                    display: 'inline-block',
                    color: m.couleur,
                    marginRight: mi < mots.length - 1 ? '0.24em' : 0,
                    transform: `translateY(${interpolate(p, [0, 1], [115, 0]) - q * 115}%) rotate(${interpolate(p, [0, 1], [6, 0])}deg)`,
                    opacity: interpolate(p, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' }) * (1 - q),
                    textShadow: OMBRE_TEXTE,
                  }}
                >
                  {m.mot}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// Bloc titre façon carrousel : grand chiffre blanc à gauche, lignes de titre à droite.
export const BlocTitre: React.FC<{
  numero?: string;
  lignes: readonly LigneTexte[];
  debut: number;
  align?: 'left' | 'center';
}> = ({ numero, lignes, debut, align = 'left' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = ressort(frame, fps, debut, { damping: 11, stiffness: 110, mass: 0.9 });
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        gap: 18,
      }}
    >
      {numero ? (
        <div
          style={{
            fontFamily: F.titre,
            fontWeight: 900,
            fontSize: 400,
            lineHeight: 0.8,
            color: C.blanc,
            width: 250,
            textAlign: 'center',
            flexShrink: 0,
            transform: `scale(${interpolate(p, [0, 1], [0.2, 1])}) rotate(${interpolate(p, [0, 1], [-25, 0])}deg)`,
            opacity: Math.min(1, p * 2),
            textShadow: '0 14px 40px rgba(130, 35, 0, 0.35)',
          }}
        >
          {numero}
        </div>
      ) : null}
      <TexteCinetique lignes={lignes} debut={debut + 6} align={align} />
    </div>
  );
};
