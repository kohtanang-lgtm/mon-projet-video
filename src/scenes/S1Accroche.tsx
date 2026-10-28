import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Fond } from '../components/Fond';
import { Entete } from '../components/Logo';
import { Son } from '../components/Son';
import { LigneTexte, TexteCinetique } from '../components/Texte';
import { ressort } from '../components/anim';
import { TITRES } from '../histoire';
import { useMiseEnPage, Zone } from '../miseEnPage';
import { BOITE_CONTENU, C, F } from '../theme';
import { loc, R } from '../voixOff';

const f = (t: number) => loc('accroche', t);

// Temps forts calés sur la voix : « Quand on envoie de l'argent… / on envoie bien plus. / Avez-vous pensé à ces 3 points ? »
const T = {
  ligneA1: f(R.quandOnEnvoie) + 2,
  ligneA2: f(R.quandOnEnvoie) + 14,
  ligneA3: f(R.bienPlus),
  ligneA4: f(R.bienPlus) + 10,
  pulse: f(R.bienPlus) + 22,
  sortieA: f(R.avezVous) - 8,
  ligneB1: f(R.avezVous),
  ligneB2: f(R.avezVous) + 10,
  ligneB3: f(R.troisPoints) - 6,
  pastilles: f(R.troisPoints) + 2,
};

const avecDepart = (lignes: readonly LigneTexte[], departs: number[]): LigneTexte[] =>
  lignes.map((l, i) => ({ ...l, de: departs[i] }));

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
  const p = ressort(frame, fps, debut, { damping: 9, stiffness: 170, mass: 0.6 });
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
  const pulse = ressort(frame, fps, T.pulse, { damping: 7, stiffness: 200, mass: 0.5 });
  const echelleA = 1 + Math.sin(Math.min(1, pulse) * Math.PI) * 0.05;
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
        {/* Temps 1 : « Quand on envoie de l'argent… on envoie bien plus. » */}
        <div
          style={{
            position: 'absolute',
            top: 290,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            transform: `scale(${echelleA})`,
          }}
        >
          <TexteCinetique
            lignes={avecDepart(TITRES.accrocheA, [T.ligneA1, T.ligneA2, T.ligneA3, T.ligneA4])}
            debut={T.ligneA1}
            sortie={T.sortieA}
            align="center"
            ecart={3}
          />
        </div>
        {/* Temps 2 : « Avez-vous pensé à ces 3 points ? » */}
        <div style={{ position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <TexteCinetique
            lignes={avecDepart(TITRES.accrocheB, [T.ligneB1, T.ligneB2, T.ligneB3])}
            debut={T.ligneB1}
            align="center"
            ecart={3}
          />
        </div>
        <svg
          width={BOITE_CONTENU.l}
          height={170}
          style={{
            position: 'absolute',
            top: 960,
            left: 0,
            opacity: interpolate(frame, [T.pastilles + 14, T.pastilles + 24], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <line x1={300} y1={85} x2={700} y2={85} stroke="rgba(255,255,255,0.6)" strokeWidth={7} strokeDasharray="2 20" strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', top: 960, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 60 }}>
          {[1, 2, 3].map((n, i) => (
            <Pastille key={n} n={n} debut={T.pastilles + i * 5} />
          ))}
        </div>
      </Zone>
      {INTERROGATIONS.map((q, i) => (
        <Son key={`q${i}`} a={q.debut} nom="pop-doux" volume={0.12 + q.opacite * 0.12} />
      ))}
      <Son a={T.ligneA4} nom="impact-doux" volume={0.35} />
      {[0, 1, 2].map((i) => (
        <Son key={`p${i}`} a={T.pastilles + i * 5} nom={`pop-${i + 1}`} volume={0.42} />
      ))}
    </AbsoluteFill>
  );
};
