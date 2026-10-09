import React from "react";
import { EASE, COLORS, FONTS } from "../theme";
import { mix, prog } from "../lib/motion";

export type KWord = {
  text: string;
  /** Instant (s, temps vidéo) où le mot est prononcé. */
  at: number;
  accent?: boolean;
  color?: string;
};

/** Avance visuelle : le mot commence à apparaître juste avant d'être entendu. */
const LEAD = 0.08;

/**
 * Typographie cinétique synchronisée mot à mot.
 * Chaque mot glisse hors d'un masque, se défloute et se pose sur sa syllabe d'attaque.
 */
export const KineticLine: React.FC<{
  t: number;
  words: KWord[];
  size: number;
  weight?: number;
  font?: string;
  color?: string;
  exitAt?: number;
  exitDuration?: number;
  align?: "left" | "center" | "right";
  tracking?: string;
  lineHeight?: number;
  style?: React.CSSProperties;
  duration?: number;
}> = ({
  t,
  words,
  size,
  weight = 700,
  font = FONTS.display,
  color = COLORS.white,
  exitAt = Infinity,
  exitDuration = 0.45,
  align = "left",
  tracking = "-0.025em",
  lineHeight = 1.08,
  style,
  duration = 0.75,
}) => {
  const q = prog(t, exitAt, exitDuration, EASE.in);
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        columnGap: `${size * 0.26}px`,
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: tracking,
        lineHeight,
        color,
        opacity: 1 - q,
        transform: `translate3d(0, ${-q * size * 0.35}px, 0)`,
        filter: q > 0 ? `blur(${q * 12}px)` : undefined,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = prog(t, w.at - LEAD, duration, EASE.out);
        return (
          <span
            key={`${w.text}-${i}`}
            style={{
              display: "inline-block",
              overflow: "hidden",
              padding: "0.06em 0 0.14em",
              margin: "-0.06em 0 -0.14em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                color: w.color ?? (w.accent ? COLORS.red : undefined),
                opacity: p,
                transform: `translate3d(0, ${mix(110, 0, p)}%, 0)`,
                filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
              }}
            >
              {w.text}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Petit sur-titre (eyebrow) : trait rouge + libellé en capitales espacées. */
export const Eyebrow: React.FC<{
  t: number;
  at: number;
  label: string;
  exitAt?: number;
  style?: React.CSSProperties;
}> = ({ t, at, label, exitAt = Infinity, style }) => {
  const p = prog(t, at - LEAD, 0.8);
  const q = prog(t, exitAt, 0.4, EASE.in);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity: p * (1 - q),
        fontFamily: FONTS.ui,
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color: COLORS.silver,
        ...style,
      }}
    >
      <div
        style={{
          width: 56 * p,
          height: 3,
          borderRadius: 2,
          background: COLORS.red,
          boxShadow: `0 0 16px ${COLORS.red}`,
        }}
      />
      <span style={{ transform: `translateX(${mix(-16, 0, p)}px)` }}>{label}</span>
    </div>
  );
};
