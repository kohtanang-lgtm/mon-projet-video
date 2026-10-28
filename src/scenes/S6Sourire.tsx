import React from 'react';
import { Check } from 'lucide-react';
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { Fond } from '../components/Fond';
import { Entete } from '../components/Logo';
import { Son } from '../components/Son';
import { TexteCinetique } from '../components/Texte';
import { prog, ressort, DOUX, INOUT } from '../components/anim';
import { cheminFleche, Point, pointsFleche } from '../components/fleche';
import { HISTOIRE } from '../histoire';
import { useMiseEnPage, Zone } from '../miseEnPage';
import { BOITE_CONTENU, C, F } from '../theme';
import { loc, R } from '../voixOff';

const f = (t: number) => loc('sourire', t);

// « À Abéché, maman reçoit son argent. / Un transfert… / un sourire. »
const T = {
  notif: Math.max(f(R.aAbecheFin), 16),
  visage: f(R.mamanRecoit) - 6,
  yeux: f(R.mamanRecoit) + 6,
  vol: f(R.mamanRecoit) + 16,
  rotation: f(R.unTransfert) - 2,
  morph: f(R.unSourire) - 18,
  eclat: f(R.unSourire) - 2,
  texte: f(R.unTransfert),
  texte2: f(R.unSourire),
  arabe: f(R.unSourire) + 6,
};

export const VISAGE = { x: 500, y: 560, r: 260 };
export const BOUCHE = { x: 500, y: 655 };
const H_FLECHE = 170;

type Segment = [Point, Point, Point]; // c1, c2, fin
const droite = (a: Point, b: Point): Segment => [
  [a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3],
  [a[0] + (2 * (b[0] - a[0])) / 3, a[1] + (2 * (b[1] - a[1])) / 3],
  b,
];

// Flèche pointe en bas (= flèche du logo retournée) : coin gauche → pointe → coin droit → encoche.
const [pointe0, droit0, encoche0, gauche0] = pointsFleche(0, 0, H_FLECHE);
const rot = (p: Point): Point => [-p[0], -p[1]];
const FL_DEPART: Point = rot(droit0);
const FL_SEGMENTS: Segment[] = [
  droite(rot(droit0), rot(pointe0)),
  droite(rot(pointe0), rot(gauche0)),
  droite(rot(gauche0), rot(encoche0)),
  droite(rot(encoche0), rot(droit0)),
];
// Sourire : croissant de même structure.
const SO_DEPART: Point = [-175, -25];
const SO_SEGMENTS: Segment[] = [
  [[-172, 45], [-98, 105], [0, 105]],
  [[98, 105], [172, 45], [175, -25]],
  [[128, 18], [70, 45], [0, 45]],
  [[-70, 45], [-128, 18], [-175, -25]],
];

export const mix = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const cheminMorph = (t: number) => {
  const d = mix(FL_DEPART, SO_DEPART, t);
  const segs = FL_SEGMENTS.map((s, i) => s.map((p, j) => mix(p, SO_SEGMENTS[i][j], t)));
  return `M ${d[0]} ${d[1]} ${segs.map((s) => `C ${s.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')}`).join(' ')} Z`;
};

const ECLATS = new Array(16).fill(0).map((_, i) => ({
  angle: (i / 16) * Math.PI * 2 + random(`a${i}`) * 0.3,
  distance: 300 + random(`d${i}`) * 160,
  taille: 26 + random(`t${i}`) * 22,
  couleur: [C.blanc, C.bleu, C.jaune][i % 3],
}));

export const S6Sourire: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mp = useMiseEnPage();

  const pNotif = ressort(frame, fps, T.notif, { damping: 14, stiffness: 120 });
  const pVisage = ressort(frame, fps, T.visage, { damping: 11, stiffness: 120 });
  const pYeux = ressort(frame, fps, T.yeux, { damping: 9, stiffness: 200 });
  const pVol = ressort(frame, fps, T.vol, { damping: 13, stiffness: 110 });
  const pRot = ressort(frame, fps, T.rotation, { damping: 12, stiffness: 120 });
  const pMorph = prog(frame, T.morph, T.morph + 20, INOUT);
  const pEclat = prog(frame, T.eclat, T.eclat + 30, DOUX);
  const pArabe = prog(frame, T.arabe, T.arabe + 22, DOUX);
  const cligne = frame > T.yeux + 26 && frame < T.yeux + 31 ? 0.12 : 1;

  const yFleche = interpolate(pVol, [0, 1], [1250, BOUCHE.y]);
  const rebond = 1 + Math.sin(prog(frame, T.morph + 16, T.morph + 30) * Math.PI) * 0.12;

  return (
    <AbsoluteFill>
      <Fond />
      <Entete y={mp.entete.y} largeur={mp.entete.largeur} />
      <Zone placement={mp.contenu} l={BOITE_CONTENU.l} h={BOITE_CONTENU.h}>
        {/* Notification de réception */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            right: 120,
            top: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '24px 30px',
            borderRadius: 36,
            background: 'rgba(255,255,255,0.96)',
            boxShadow: '0 20px 44px rgba(110, 30, 0, 0.28)',
            transform: `translateY(${(1 - pNotif) * -260}px)`,
            opacity: Math.min(1, pNotif * 2),
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              background: C.vert,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Check size={50} color={C.blanc} strokeWidth={4} />
          </div>
          <div style={{ flex: 1, fontFamily: F.titre, lineHeight: 1.15 }}>
            <div style={{ fontWeight: 900, fontSize: 34, color: C.encre }}>Transfert reçu</div>
            <div style={{ fontWeight: 700, fontSize: 26, color: C.gris }}>
              {HISTOIRE.montant} de la part d’{HISTOIRE.expediteur}
            </div>
          </div>
          <div style={{ fontFamily: F.titre, fontWeight: 700, fontSize: 21, color: C.gris, alignSelf: 'flex-start' }}>maintenant</div>
        </div>

        <svg width={BOITE_CONTENU.l} height={BOITE_CONTENU.h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            <filter id="ombre-visage" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="22" stdDeviation="24" floodColor="#7a2200" floodOpacity="0.3" />
            </filter>
          </defs>
          {/* Éclats de petites flèches */}
          {pEclat > 0 && pEclat < 1
            ? ECLATS.map((e, i) => {
                const d = e.distance * pEclat;
                const x = VISAGE.x + Math.cos(e.angle) * (VISAGE.r * 0.6 + d);
                const y = VISAGE.y + Math.sin(e.angle) * (VISAGE.r * 0.6 + d);
                return (
                  <path
                    key={i}
                    d={cheminFleche(0, 0, e.taille)}
                    fill={e.couleur}
                    opacity={1 - pEclat}
                    transform={`translate(${x} ${y}) rotate(${(e.angle * 180) / Math.PI + 90})`}
                  />
                );
              })
            : null}
          <g transform={`translate(${VISAGE.x} ${VISAGE.y}) scale(${pVisage})`}>
            <circle r={VISAGE.r} fill={C.blanc} filter="url(#ombre-visage)" />
            <circle cx={-150} cy={95} r={38} fill="#FFB37A" opacity={0.55 * pMorph} />
            <circle cx={150} cy={95} r={38} fill="#FFB37A" opacity={0.55 * pMorph} />
            <g transform={`scale(${pYeux})`}>
              <ellipse cx={-88} cy={-70} rx={27} ry={36 * cligne} fill={C.bleuNuit} />
              <ellipse cx={88} cy={-70} rx={27} ry={36 * cligne} fill={C.bleuNuit} />
              <circle cx={-78} cy={-84} r={8} fill={C.blanc} opacity={cligne > 0.5 ? 1 : 0} />
              <circle cx={98} cy={-84} r={8} fill={C.blanc} opacity={cligne > 0.5 ? 1 : 0} />
            </g>
          </g>
          {/* La flèche du logo arrive, se retourne et devient le sourire */}
          <path
            d={cheminMorph(pMorph)}
            fill={C.bleu}
            stroke={C.bleu}
            strokeWidth={interpolate(pMorph, [0, 1], [4, 22])}
            strokeLinejoin="round"
            opacity={frame >= T.vol ? 1 : 0}
            transform={`translate(${BOUCHE.x} ${yFleche}) rotate(${180 * (1 - pRot)}) scale(${rebond})`}
          />
        </svg>

        <div style={{ position: 'absolute', top: 860, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <TexteCinetique
            lignes={[
              { segments: [{ t: 'UN TRANSFERT,', c: C.blanc }], taille: 96, de: T.texte },
              { segments: [{ t: 'UN SOURIRE.', c: C.bleu }], taille: 124, de: T.texte2 },
            ]}
            debut={T.texte}
            align="center"
          />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 1140,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: F.arabe,
            fontWeight: 800,
            fontSize: 84,
            lineHeight: 1.2,
            color: C.blanc,
            direction: 'rtl',
            clipPath: `inset(-20% -2% -20% ${(1 - pArabe) * 102}%)`,
            textShadow: '0 6px 22px rgba(130, 35, 0, 0.30)',
          }}
        >
          تحويل… ابتسامة
        </div>
      </Zone>
      <Son a={T.notif} nom="notification" volume={0.42} />
      <Son a={T.visage} nom="pop-2" volume={0.32} />
      <Son a={T.vol} nom="glissement" volume={0.28} />
      <Son a={T.rotation} nom="tic" volume={0.25} />
      <Son a={T.eclat} nom="scintillement" volume={0.4} />
    </AbsoluteFill>
  );
};
