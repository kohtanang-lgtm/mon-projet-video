import React from "react";
import { Img, staticFile } from "remotion";
import { BRAND } from "../brand";
import { mix } from "../lib/motion";
import { COLORS, FONTS } from "../theme";

/**
 * Bloc-marque UBA (substitut typographique tant que le logo officiel n'est pas fourni).
 * `reveal` 0 → 1 : le fil rouge se condense en bloc, puis les lettres et la signature apparaissent.
 */
export const UbaMark: React.FC<{ size: number; reveal?: number; inverted?: boolean }> = ({
  size,
  reveal = 1,
  inverted = false,
}) => {
  const grow = Math.min(1, reveal / 0.45); // 0 → 0.45 : le trait devient un bloc
  const letters = Math.max(0, Math.min(1, (reveal - 0.3) / 0.5));
  if (BRAND.logo) {
    return (
      <Img
        src={staticFile(BRAND.logo)}
        style={{ height: size, opacity: Math.min(1, reveal * 2), transform: `scale(${mix(0.92, 1, letters)})` }}
      />
    );
  }
  return (
    <div
      style={{
        width: size * 1.62,
        height: mix(size * 0.05, size, grow),
        borderRadius: mix(size * 0.03, size * 0.16, grow),
        background: inverted
          ? COLORS.white
          : `linear-gradient(145deg, ${COLORS.redGlow} 0%, ${COLORS.red} 45%, ${COLORS.redDeep} 100%)`,
        boxShadow: inverted
          ? "none"
          : `0 ${size * 0.12}px ${size * 0.4}px rgba(227,23,32,0.35), inset 0 1px 0 rgba(255,255,255,0.35)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <span
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: size * 0.56,
          letterSpacing: "-0.03em",
          color: inverted ? COLORS.red : COLORS.white,
          transform: `translateY(${mix(70, 0, letters)}%)`,
          opacity: letters,
          lineHeight: 1,
        }}
      >
        UBA
      </span>
    </div>
  );
};

/** Signature complète : bloc + « United Bank for Africa » + pays. */
export const UbaLockup: React.FC<{ size: number; reveal?: number; nameReveal?: number }> = ({
  size,
  reveal = 1,
  nameReveal = 1,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.32 }}>
    <UbaMark size={size} reveal={reveal} />
    {BRAND.logo ? null : (
      <div
        style={{
          overflow: "hidden",
          clipPath: `inset(0 ${(1 - nameReveal) * 100}% 0 0)`,
          display: "flex",
          flexDirection: "column",
          gap: size * 0.08,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 700,
            fontSize: size * 0.3,
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
            fontSize: size * 0.19,
            color: COLORS.redGlow,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
          }}
        >
          {BRAND.country}
        </div>
      </div>
    )}
  </div>
);
