import React from "react";
import { COLORS, FONTS, GLASS } from "../theme";
import { Icon, IconName } from "./Icons";

/**
 * Surface en verre dépoli. `frosted` active le flou d'arrière-plan réel :
 * à réserver aux calques 2D (le backdrop-filter est aplati dans un contexte 3D).
 */
export const Glass: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  radius?: number;
  frosted?: boolean;
  accent?: number; // 0 → 1 : liseré rouge lumineux
}> = ({ children, style, radius = 28, frosted = false, accent = 0 }) => (
  <div
    style={{
      position: "relative",
      borderRadius: radius,
      background: GLASS.background,
      border: GLASS.border,
      boxShadow: `${GLASS.shadow}${accent > 0 ? `, 0 0 ${48 * accent}px rgba(227,23,32,${0.45 * accent}), inset 0 0 0 ${1.5 * accent}px rgba(227,23,32,${0.9 * accent})` : ""}`,
      backdropFilter: frosted ? GLASS.blur : undefined,
      WebkitBackdropFilter: frosted ? GLASS.blur : undefined,
      overflow: "hidden",
      ...style,
    }}
  >
    {/* reflet spéculaire supérieur */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: radius,
        background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 38%)",
        pointerEvents: "none",
      }}
    />
    {children}
  </div>
);

/** Pastille d'information (icône + libellé). */
export const Chip: React.FC<{
  icon?: IconName;
  label: string;
  tone?: "glass" | "red" | "light";
  size?: number;
  iconProgress?: number;
  style?: React.CSSProperties;
}> = ({ icon, label, tone = "glass", size = 30, iconProgress = 1, style }) => {
  const palette = {
    glass: {
      bg: "linear-gradient(135deg, rgba(52,56,64,0.94) 0%, rgba(26,28,33,0.94) 100%)",
      fg: COLORS.white,
      border: GLASS.border,
      ic: COLORS.red,
    },
    red: {
      bg: `linear-gradient(135deg, ${COLORS.red}, ${COLORS.redDeep})`,
      fg: COLORS.white,
      border: "1px solid rgba(255,255,255,0.25)",
      ic: COLORS.white,
    },
    light: {
      bg: "rgba(255,255,255,0.96)",
      fg: COLORS.anthracite,
      border: "1px solid rgba(0,0,0,0.06)",
      ic: COLORS.red,
    },
  }[tone];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.42,
        padding: `${size * 0.42}px ${size * 0.8}px ${size * 0.42}px ${icon ? size * 0.55 : size * 0.8}px`,
        borderRadius: 999,
        background: palette.bg,
        border: palette.border,
        boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        color: palette.fg,
        fontFamily: FONTS.ui,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon ? <Icon name={icon} size={size * 1.25} color={palette.ic} strokeWidth={2} progress={iconProgress} /> : null}
      {label}
    </div>
  );
};
