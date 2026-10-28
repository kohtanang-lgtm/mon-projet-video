import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Fond } from '../components/Fond';
import { Entete } from '../components/Logo';
import { BlocTitre } from '../components/Texte';
import { prog, ressort, INOUT } from '../components/anim';
import { Son } from '../components/Son';
import { cheminFleche } from '../components/fleche';
import { CARTE_TCHAD } from '../data/carteTchad';
import { HISTOIRE, TITRES } from '../histoire';
import { useMiseEnPage, Zone } from '../miseEnPage';
import { BOITE_ILLU, BOITE_TITRE, C, F } from '../theme';
import { loc, R } from '../voixOff';

const f = (t: number) => loc('trajet', t);

// « Ahmat, lui, y pense. / À chaque envoi pour sa maman, / à Abéché. »
const T = {
  titre: Math.max(f(R.ahmat), 20),
  titre2: f(R.yPense),
  trace: 12,
  depart: Math.max(f(R.ahmat), 20),
  villes: 36,
  arc: f(R.aChaqueEnvoi),
  maman: f(R.maman),
  arrivee: f(R.aAbeche),
};

type CleVille = keyof typeof CARTE_TCHAD.villes;

const Etiquette: React.FC<{ x: number; y: number; nom: string; ville: string; p: number; fond: string; texte: string }> = ({
  x,
  y,
  nom,
  ville,
  p,
  fond,
  texte,
}) => (
  <g transform={`translate(${x} ${y}) scale(${p * 1.3})`} opacity={Math.min(1, p * 1.5)}>
    <rect x={-120} y={-46} width={240} height={92} rx={46} fill={fond} />
    <text x={0} y={-6} textAnchor="middle" fontFamily={F.titre} fontWeight={900} fontSize={36} fill={texte}>
      {nom}
    </text>
    <text x={0} y={30} textAnchor="middle" fontFamily={F.titre} fontWeight={700} fontSize={26} fill={texte} opacity={0.8}>
      {ville}
    </text>
  </g>
);

export const S2Trajet: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mp = useMiseEnPage();
  const villes = CARTE_TCHAD.villes;
  const depart = villes[HISTOIRE.villeDepart as CleVille];
  const arrivee = villes[HISTOIRE.villeArrivee as CleVille];
  const autres = (Object.keys(villes) as CleVille[]).filter(
    (k) => k !== HISTOIRE.villeDepart && k !== HISTOIRE.villeArrivee,
  );

  const echelleCarte = 0.7;
  const pTrace = prog(frame, T.trace, T.trace + 40, INOUT);
  const pRemplissage = prog(frame, T.trace + 24, T.trace + 54);
  const pDepart = ressort(frame, fps, T.depart, { damping: 10, stiffness: 160 });
  const pEtiquetteDepart = ressort(frame, fps, T.depart + 4, { damping: 12, stiffness: 150 });
  const pArc = prog(frame, T.arc, T.arrivee, INOUT);
  const pArrivee = ressort(frame, fps, T.maman, { damping: 8, stiffness: 160 });
  const pEtiquetteArrivee = ressort(frame, fps, T.maman + 3, { damping: 12, stiffness: 150 });

  // Arc entre les deux villes (courbe de Bézier quadratique).
  const P0 = [depart.x, depart.y];
  const P2 = [arrivee.x, arrivee.y];
  const P1 = [(P0[0] + P2[0]) / 2, Math.min(P0[1], P2[1]) - 190];
  const t = pArc;
  const bx = (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t ** 2 * P2[0];
  const by = (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t ** 2 * P2[1];
  const dx = 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
  const dy = 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  const arc = `M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`;
  const tailleFleche = interpolate(frame, [T.arc - 2, T.arc + 4, T.arrivee - 2, T.arrivee + 4], [0, 70, 70, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const onde = (frame - (T.arrivee + 2)) / 30;

  return (
    <AbsoluteFill>
      <Fond />
      <Entete y={mp.entete.y} largeur={mp.entete.largeur} />
      <Zone placement={mp.titre} l={BOITE_TITRE.l} h={BOITE_TITRE.h}>
        <BlocTitre
          lignes={[{ ...TITRES.trajet[0], de: T.titre }, { ...TITRES.trajet[1], de: T.titre2 }]}
          debut={T.titre}
          align="center"
        />
      </Zone>
      <Zone placement={mp.illu} l={BOITE_ILLU.l} h={BOITE_ILLU.h}>
        <svg
          width={CARTE_TCHAD.largeur * echelleCarte}
          height={CARTE_TCHAD.hauteur * echelleCarte}
          viewBox={`0 0 ${CARTE_TCHAD.largeur} ${CARTE_TCHAD.hauteur}`}
          style={{ position: 'absolute', left: (BOITE_ILLU.l - CARTE_TCHAD.largeur * echelleCarte) / 2, top: 0, overflow: 'visible' }}
        >
          <defs>
            <mask id="revele-arc">
              <path d={arc} stroke="#fff" strokeWidth={30} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pArc} />
            </mask>
            <filter id="ombre-carte" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#7a2200" floodOpacity="0.28" />
            </filter>
          </defs>
          <path
            d={CARTE_TCHAD.d}
            fill={`rgba(255,255,255,${0.2 * pRemplissage})`}
            stroke={C.blanc}
            strokeWidth={6}
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - pTrace}
            filter="url(#ombre-carte)"
          />
          {autres.map((k, i) => {
            const v = villes[k];
            const p = ressort(frame, fps, T.villes + i * 4, { damping: 10, stiffness: 160 });
            return <circle key={k} cx={v.x} cy={v.y} r={9 * p} fill="rgba(255,255,255,0.8)" />;
          })}
          <path d={arc} stroke={C.blanc} strokeWidth={9} fill="none" strokeDasharray="2 22" strokeLinecap="round" mask="url(#revele-arc)" />
          {/* Départ */}
          <circle cx={depart.x} cy={depart.y} r={22 * pDepart} fill={C.bleu} stroke={C.blanc} strokeWidth={7} />
          {/* Arrivée */}
          {onde > 0 && onde < 1 ? (
            <circle cx={arrivee.x} cy={arrivee.y} r={22 + onde * 70} fill="none" stroke={C.blanc} strokeWidth={6} opacity={1 - onde} />
          ) : null}
          <circle cx={arrivee.x} cy={arrivee.y} r={22 * pArrivee} fill={C.blanc} stroke={C.bleu} strokeWidth={8} />
          <path
            d={cheminFleche(0, 0, tailleFleche)}
            fill={C.bleu}
            stroke={C.blanc}
            strokeWidth={5}
            strokeLinejoin="round"
            transform={`translate(${bx} ${by}) rotate(${angle})`}
          />
          <Etiquette x={depart.x + 20} y={depart.y + 115} nom={HISTOIRE.expediteur} ville={depart.nom} p={pEtiquetteDepart} fond={C.blanc} texte={C.bleu} />
          <Etiquette x={arrivee.x} y={arrivee.y - 110} nom="Maman" ville={arrivee.nom} p={pEtiquetteArrivee} fond={C.bleu} texte={C.blanc} />
        </svg>
      </Zone>
      <Son a={T.trace} nom="souffle-doux" volume={0.25} />
      <Son a={T.depart} nom="pop-2" volume={0.35} />
      <Son a={T.arc} nom="glissement" volume={0.32} />
      <Son a={T.maman} nom="pop-3" volume={0.35} />
      <Son a={T.arrivee} nom="validation" volume={0.4} />
    </AbsoluteFill>
  );
};
