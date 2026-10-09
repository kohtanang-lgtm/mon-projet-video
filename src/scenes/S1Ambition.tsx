import React from "react";
import { AbsoluteFill } from "remotion";
import { KineticLine } from "../components/KineticText";
import { mix, prog, useTime } from "../lib/motion";
import { CUE, say } from "../timeline/cues";
import { COLORS, EASE } from "../theme";

/**
 * S1 · AMBITION — « L'avenir se construit avec ceux qui osent voir plus grand.
 * Et si la banque devenait enfin le reflet de vos ambitions ? »
 *
 * Fil rouge : un point de lumière s'étire en ligne d'horizon, puis l'horizon
 * se cabre en courbe de croissance sur « voir plus grand ».
 */

type Pt = [number, number];
const FLAT: Pt[] = [
  [230, 700],
  [700, 700],
  [1220, 700],
  [1690, 700],
];
const RISE: Pt[] = [
  [230, 800],
  [900, 795],
  [1360, 720],
  [1690, 290],
];

const QUESTION_TOP = 330;
const SLAB_Y = 556;

const bezier = (pts: Pt[]) =>
  `M ${pts[0][0]} ${pts[0][1]} C ${pts[1][0]} ${pts[1][1]}, ${pts[2][0]} ${pts[2][1]}, ${pts[3][0]} ${pts[3][1]}`;

const pointOn = (pts: Pt[], s: number): Pt => {
  const u = 1 - s;
  const k = [u * u * u, 3 * u * u * s, 3 * u * s * s, s * s * s];
  return [0, 1].map((i) => pts.reduce((acc, p, j) => acc + p[i] * k[j], 0)) as Pt;
};

const HorizonLine: React.FC<{ t: number }> = ({ t }) => {
  const draw = prog(t, 0.25, 1.4, EASE.inOut);
  const morph = prog(t, CUE.voir - 0.12, 1.25, EASE.inOut);
  const dim = mix(1, 0.32, prog(t, CUE.et - 0.2, 0.9, EASE.inOut));
  const out = prog(t, CUE.reflet - 0.3, 1.2, EASE.inOut);
  const pts = FLAT.map((p, i) => [mix(p[0], RISE[i][0], morph), mix(p[1], RISE[i][1], morph)] as Pt);
  const d = bezier(pts);
  // tracé symétrique depuis le centre pendant l'ouverture, puis plein
  const tip = pointOn(pts, Math.min(1, 0.5 + draw / 2));
  const spark = prog(t, 0.1, 0.4) * (1 - prog(t, CUE.grandEnd, 0.8, EASE.in));
  const sparkPos: Pt = morph > 0 ? tip : [mix(960, tip[0], draw), tip[1]];
  const dash = { pathLength: 1, strokeDasharray: `${draw} 1`, strokeDashoffset: -(1 - draw) / 2 };
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: dim * (1 - out) }}>
      <defs>
        {/* userSpaceOnUse : un dégradé « boîte englobante » disparaît sur un trait parfaitement horizontal */}
        <linearGradient id="thread" gradientUnits="userSpaceOnUse" x1={230} x2={1690} y1={0} y2={0}>
          <stop offset="0" stopColor={COLORS.red} stopOpacity={0} />
          <stop offset="0.25" stopColor={COLORS.red} />
          <stop offset="1" stopColor={COLORS.redGlow} />
        </linearGradient>
        <filter id="glow" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={COLORS.red}
        strokeWidth={22}
        strokeLinecap="round"
        opacity={0.35}
        filter="url(#glow)"
        {...dash}
      />
      <path d={d} fill="none" stroke="url(#thread)" strokeWidth={4} strokeLinecap="round" {...dash} />
      <path d={d} fill="none" stroke="#FFC9CC" strokeWidth={1.2} strokeLinecap="round" opacity={0.7} {...dash} />
      <circle cx={sparkPos[0]} cy={sparkPos[1]} r={26} fill={COLORS.red} opacity={0.45 * spark} filter="url(#glow)" />
      <circle cx={sparkPos[0]} cy={sparkPos[1]} r={5} fill="#FFE3E4" opacity={spark} />
    </svg>
  );
};

export const S1Ambition: React.FC = () => {
  const t = useTime();

  // Bloc 1 : manifeste
  const lineA = say("L'avenir se construit");
  const lineB = say("avec ceux qui osent");
  const block1Out = CUE.grandEnd + 0.05;
  const settle = prog(t, CUE.voir - 0.32, 0.7, EASE.inOut); // le manifeste s'efface derrière « GRAND »

  const grand = prog(t, CUE.grand - 0.1, 1.1, EASE.out);
  const grandOut = prog(t, block1Out, 0.5, EASE.in);

  // Bloc 2 : la question
  const lineC = say("Et si la banque devenait enfin");
  const lineD = say("le reflet de vos ambitions ?").map((w) => ({ ...w, accent: /ambitions|\?/.test(w.text) }));
  const reflet = prog(t, CUE.reflet - 0.1, 1.0, EASE.out);
  // Sortie resserrée dans la pause de 0,38 s qui précède « Particuliers »
  const sceneOut = CUE.ambitionsEnd - 0.02;
  const OUT = 0.36;
  const slabOut = prog(t, sceneOut, OUT, EASE.inOut);

  // Respiration de caméra : très lent travelling arrière sur toute la scène
  const camera = mix(1.06, 1, prog(t, 0, CUE.particuliers, EASE.linear));

  return (
    <AbsoluteFill style={{ transform: `scale(${camera})` }}>
      <HorizonLine t={t} />

      {/* — Bloc 1 — */}
      <div
        style={{
          position: "absolute",
          top: mix(372, 214, settle),
          width: 1920,
          opacity: mix(1, 0.5, settle),
          transform: `scale(${mix(1, 0.8, settle)})`,
          transformOrigin: "50% 0",
        }}
      >
        <KineticLine t={t} words={lineA} size={76} weight={600} align="center" exitAt={block1Out} />
        <div style={{ height: 14 }} />
        <KineticLine
          t={t}
          words={lineB}
          size={76}
          weight={600}
          align="center"
          color={COLORS.silver}
          exitAt={block1Out}
        />
      </div>
      <div style={{ position: "absolute", top: 452, width: 1920 }}>
        <KineticLine t={t} words={say("voir plus")} size={64} weight={600} align="center" exitAt={block1Out} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 512,
          width: 1920,
          textAlign: "center",
          fontFamily: "Montserrat",
          fontWeight: 800,
          fontSize: 236,
          lineHeight: 1,
          color: COLORS.white,
          letterSpacing: `${mix(-0.08, 0.01, grand)}em`,
          opacity: grand * (1 - grandOut),
          transform: `scale(${mix(0.86, 1, grand) + grandOut * 0.08})`,
          filter: grand < 1 || grandOut > 0 ? `blur(${(1 - grand) * 18 + grandOut * 16}px)` : undefined,
          textShadow: "0 0 80px rgba(227,23,32,0.45)",
        }}
      >
        GRAND
      </div>

      {/* — Bloc 2 : la question et son reflet — */}
      <div style={{ position: "absolute", top: QUESTION_TOP, width: 1920 }}>
        <KineticLine t={t} words={lineC} size={80} weight={600} align="center" exitAt={sceneOut} exitDuration={OUT} />
        <div style={{ height: 10 }} />
        <KineticLine t={t} words={lineD} size={80} weight={700} align="center" exitAt={sceneOut} exitDuration={OUT} />
      </div>
      {/* Dalle de verre : la ligne d'horizon devient une surface réfléchissante */}
      <div
        style={{
          position: "absolute",
          left: 960 - 800,
          top: SLAB_Y,
          width: 1600,
          height: 280,
          opacity: reflet * (1 - slabOut),
          transform: `translateX(${-slabOut * 380}px) scaleX(${mix(0.55, 1, reflet)})`,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0) 100%)",
          maskImage: "linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 22%, #000 78%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage: "linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 22%, #000 78%, rgba(0,0,0,0) 100%)",
        }}
      >
        <div
          style={{
            height: 2,
            background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 35%, ${COLORS.redGlow} 50%, rgba(255,255,255,0.75) 65%, rgba(255,255,255,0) 100%)`,
            boxShadow: `0 0 24px rgba(227,23,32,0.55)`,
          }}
        />
      </div>
      {/* Reflet : symétrie exacte par rapport à la dalle (origine de l'axe = ligne de la dalle) */}
      <div
        style={{
          position: "absolute",
          top: QUESTION_TOP,
          width: 1920,
          opacity: 0.32 * reflet * (1 - slabOut),
          transformOrigin: `50% ${SLAB_Y - QUESTION_TOP}px`,
          transform: `translateY(${mix(36, 0, reflet)}px) scaleY(-1)`,
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 10%, rgba(0,0,0,0.95) 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 10%, rgba(0,0,0,0.95) 100%)",
          filter: "blur(1.2px)",
        }}
      >
        <KineticLine t={t} words={lineC} size={80} weight={600} align="center" />
        <div style={{ height: 10 }} />
        <KineticLine t={t} words={lineD} size={80} weight={700} align="center" />
      </div>
    </AbsoluteFill>
  );
};
