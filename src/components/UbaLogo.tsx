import React from "react";
import { BRAND } from "../brand";
import { UBA_ICON, UBA_MARK, UBA_WORD } from "../brand/ubaLogo";
import { mix } from "../lib/motion";
import { COLORS, FONTS } from "../theme";

/**
 * Logo officiel UBA, entièrement vectoriel (src/brand/ubaLogo.ts).
 * Repère commun : l'icône carrée occupe 0 → 100.
 */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Direction de la bande rouge qui sépare les deux formes de la marque. */
const BAND = { x: Math.cos(1.08), y: Math.sin(1.08) };

/**
 * Les deux formes de la marque. `build` 0 → 1 : elles glissent l'une contre l'autre le long
 * de la bande diagonale et se verrouillent en place (assemblage du « S »).
 */
const MarkShapes: React.FC<{ color: string; build: number }> = ({ color, build }) => {
  const d = (1 - build) * 26;
  const o = clamp01(build * 2.2);
  return (
    <>
      <path d={UBA_MARK.left} fill={color} opacity={o} transform={`translate(${BAND.x * d} ${BAND.y * d})`} />
      <path d={UBA_MARK.right} fill={color} opacity={o} transform={`translate(${-BAND.x * d} ${-BAND.y * d})`} />
    </>
  );
};

/**
 * Icône d'application officielle (carré rouge, marque + « UBA » en blanc).
 * square : le fil rouge s'épaissit en carré · mark : assemblage de la marque · word : « UBA » monte.
 */
export const UbaIcon: React.FC<{
  size: number;
  square?: number;
  mark?: number;
  word?: number;
  shadow?: boolean;
}> = ({ size, square = 1, mark = 1, word = 1, shadow = true }) => {
  const h = mix(3.2, 100, square);
  const r = mix(1.6, UBA_ICON.radius, square);
  const [wx0, wy0, wx1, wy1] = UBA_WORD.bbox;
  const id = React.useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        overflow: "visible",
        filter: shadow
          ? `drop-shadow(0 ${size * 0.08}px ${size * 0.16}px rgba(214,27,12,${0.35 * square})) drop-shadow(0 ${size * 0.03}px ${size * 0.05}px rgba(0,0,0,0.4))`
          : undefined,
      }}
    >
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={COLORS.redGlow} />
          <stop offset="0.5" stopColor={COLORS.red} />
          <stop offset="1" stopColor={COLORS.redDeep} />
        </linearGradient>
        <clipPath id={`w${id}`}>
          <rect x={wx0 - 2} y={wy0 - 3} width={wx1 - wx0 + 4} height={wy1 - wy0 + 6} />
        </clipPath>
      </defs>
      <rect x={0} y={50 - h / 2} width={100} height={h} rx={r} fill={`url(#g${id})`} />
      {/* reflet supérieur discret */}
      <rect x={0} y={50 - h / 2} width={100} height={h * 0.5} rx={r} fill="white" opacity={0.07 * square} />
      {mark > 0 ? <MarkShapes color={COLORS.white} build={mark} /> : null}
      <g clipPath={`url(#w${id})`}>
        <path
          d={UBA_WORD.d}
          fill={COLORS.white}
          opacity={clamp01(word * 1.5)}
          transform={`translate(0 ${(1 - word) * (wy1 - wy0 + 4)})`}
        />
      </g>
    </svg>
  );
};

/** Marque + « UBA » en blanc, sans le carré (pour une surface déjà rouge). */
export const UbaGlyph: React.FC<{ size: number; color?: string; build?: number }> = ({
  size,
  color = COLORS.white,
  build = 1,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", display: "block" }}>
    <MarkShapes color={color} build={build} />
    <path d={UBA_WORD.d} fill={color} opacity={clamp01(build * 1.4)} />
  </svg>
);

/**
 * Signature horizontale telle qu'imprimée sur les cartes : « UBA » + marque à droite,
 * marque ≈ 1,75 × la hauteur des lettres, bases alignées.
 */
export const UbaLockup: React.FC<{ height: number; color?: string; build?: number }> = ({
  height,
  color = COLORS.white,
  build = 1,
}) => {
  const [wx0, wy0, wx1, wy1] = UBA_WORD.bbox;
  const [mx0, my0, mx1, my1] = UBA_MARK.bbox;
  const wordH = wy1 - wy0;
  const markScale = (wordH * 1.75) / (my1 - my0);
  const gap = wordH * 0.42;
  const markW = (mx1 - mx0) * markScale;
  const totalW = wx1 - wx0 + gap + markW;
  const totalH = wordH * 1.75;
  return (
    <svg
      height={height}
      width={(height * totalW) / totalH}
      viewBox={`0 0 ${totalW} ${totalH}`}
      style={{ overflow: "visible", display: "block" }}
    >
      <g transform={`translate(${-wx0} ${totalH - wy1})`} opacity={clamp01(build * 1.6)}>
        <path d={UBA_WORD.d} fill={color} />
      </g>
      <g transform={`translate(${wx1 - wx0 + gap} 0) scale(${markScale}) translate(${-mx0} ${-my0})`}>
        <MarkShapes color={color} build={build} />
      </g>
    </svg>
  );
};

/** Signature complète du pack-shot : icône officielle + « United Bank for Africa » + pays. */
export const UbaSignature: React.FC<{
  size: number;
  square: number;
  mark: number;
  word: number;
  nameReveal: number;
}> = ({ size, square, mark, word, nameReveal }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.3 }}>
    <UbaIcon size={size} square={square} mark={mark} word={word} />
    <div
      style={{
        clipPath: `inset(-10% ${(1 - nameReveal) * 100}% -10% 0)`,
        display: "flex",
        flexDirection: "column",
        gap: size * 0.07,
        transform: `translateX(${mix(-24, 0, nameReveal)}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 700,
          fontSize: size * 0.27,
          color: COLORS.white,
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
          lineHeight: 1.05,
        }}
      >
        {BRAND.name}
      </div>
      <div
        style={{
          fontFamily: FONTS.ui,
          fontWeight: 600,
          fontSize: size * 0.15,
          color: COLORS.redGlow,
          letterSpacing: "0.42em",
          textTransform: "uppercase",
        }}
      >
        {BRAND.country}
      </div>
    </div>
  </div>
);
