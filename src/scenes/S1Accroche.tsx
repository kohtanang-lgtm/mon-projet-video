import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Fond } from '../components/Fond';
import { Entete } from '../components/Logo';
import { TexteCinetique } from '../components/Texte';
import { ressort } from '../components/anim';
import { TITRES } from '../histoire';
import { useMiseEnPage, Zone } from '../miseEnPage';
import { BOITE_CONTENU, C, F } from '../theme';

// Points d'interrogation flottants (position en % de l'écran).
const INTERROGATIONS = [
  { x: 0.12, y: 0.2, taille: 0.17, opacite: 0.3, debut: 8, rot: -14 },
  { x: 0.85, y: 0.205, taille: 0.22, opacite: 0.95, debut: 14, rot: 12 },
  { x: 0.09, y: 0.56, taille: 0.13, opacite: 0.28, debut: 20, rot: 10 },
  { x: 0.9, y: 0.6, taille: 0.15, opacite: 0.32, debut: 26, rot: -8 },
  { x: 0.2, y: 0.86, taille: 0.12, opacite: 0.22, debut: 32, rot: 6 },
  { x: 0.82, y: 0.88, taille: 0.1, opacite: 0.2, debut: 36, rot: -10 },
];

const Pastille: React.FC<{ n: number; debut: number }> = ({ n, debut }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = ressort(frame, fps, debut, { damping: 9, stiffness: 150, mass: 0.7 });
  const flotte = Math.sin((frame - debut) / 14 + n) * 6 * Math.min(1, p);
  return (
    <div
      style={{
        width: 170,
        height: 170,
        borderRadius: 85,
        background: C.blanc,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: F.titre,
        fontWeight: 900,
        fontSize: 110,
        color: C.bleu,
        boxShadow: '0 18px 40px rgba(120, 30, 0, 0.30)',
        transform: `translateY(${(1 - p) * 120 + flotte}px) scale(${p})`,
      }}
    >
      {n}
    </div>
  );
};

export const S1Accroche: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mp = useMiseEnPage();
  const base = Math.min(mp.W, mp.H);
  // Le « 3 POINTS ? » pulse une fois le texte en place.
  const pulse = ressort(frame, fps, 62, { damping: 7, stiffness: 200, mass: 0.5 });
  const echelle3 = 1 + Math.sin(Math.min(1, pulse) * Math.PI) * 0.06;
  return (
    <AbsoluteFill>
      <Fond />
      {INTERROGATIONS.map((q, i) => {
        const p = ressort(frame, fps, q.debut, { damping: 9, stiffness: 120, mass: 0.8 });
        const flotte = Math.sin(frame / 20 + i * 1.7) * 14;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: q.x * mp.W,
              top: q.y * mp.H,
              fontFamily: F.titre,
              fontWeight: 900,
              fontSize: q.taille * base * (mp.vertical ? 1.6 : 1),
              lineHeight: 1,
              color: C.blanc,
              opacity: q.opacite * Math.min(1, p),
              transform: `translate(-50%, -50%) translateY(${flotte}px) rotate(${q.rot + Math.sin(frame / 26 + i) * 5}deg) scale(${p})`,
              textShadow: '0 10px 30px rgba(120,30,0,0.25)',
            }}
          >
            ?
          </div>
        );
      })}
      <Entete y={mp.vertical ? 120 : 40} largeur={mp.vertical ? 500 : 300} animer debut={2} />
      <Zone placement={mp.contenu} l={BOITE_CONTENU.l} h={BOITE_CONTENU.h}>
        <div
          style={{
            position: 'absolute',
            top: 330,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            transform: `scale(${echelle3})`,
          }}
        >
          <TexteCinetique lignes={TITRES.accroche} debut={18} align="center" ecart={3} />
        </div>
        <svg
          width={BOITE_CONTENU.l}
          height={170}
          style={{
            position: 'absolute',
            top: 960,
            left: 0,
            opacity: interpolate(frame, [90, 104], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}
        >
          <line x1={300} y1={85} x2={700} y2={85} stroke="rgba(255,255,255,0.6)" strokeWidth={7} strokeDasharray="2 20" strokeLinecap="round" />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 960,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 60,
          }}
        >
          {[1, 2, 3].map((n, i) => (
            <Pastille key={n} n={n} debut={72 + i * 8} />
          ))}
        </div>
      </Zone>
    </AbsoluteFill>
  );
};
