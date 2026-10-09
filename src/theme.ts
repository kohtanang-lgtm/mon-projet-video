import { Easing } from "remotion";

/**
 * Charte UBA appliquée au film.
 * Rouge UBA = dominante / accents · Noir profond & anthracite = fonds · Blanc = lisibilité.
 */
export const COLORS = {
  red: "#E31720", // Rouge UBA (référence logo)
  redDeep: "#A80F16", // ombres et dégradés de carte
  redGlow: "#FF2A33", // halos lumineux uniquement
  black: "#060607",
  ink: "#0D0E10",
  anthracite: "#16181C",
  graphite: "#1F2228",
  steel: "#2A2E35",
  mute: "#8A8F98",
  silver: "#C9CDD3",
  white: "#FFFFFF",
  success: "#2BD47D",
} as const;

export const FONTS = {
  display: "Montserrat, Inter, system-ui, sans-serif",
  ui: "Inter, system-ui, sans-serif",
} as const;

export const VIDEO = {
  width: 1920,
  height: 1080,
  defaultFps: 30,
} as const;

/** Courbes d'animation : zéro saccade, décélérations longues et « premium ». */
export const EASE = {
  /** Entrées : attaque franche, atterrissage très doux. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Sorties : départ doux, accélération progressive. */
  in: Easing.bezier(0.32, 0, 0.67, 0),
  /** Mouvements de caméra et transitions symétriques. */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** Transitions « match cut » plus nerveuses. */
  snap: Easing.bezier(0.83, 0, 0.17, 1),
  linear: Easing.linear,
} as const;

/** Verre dépoli : fond, bordure et ombre communs à toutes les surfaces UI. */
export const GLASS = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.035) 100%)",
  border: "1px solid rgba(255,255,255,0.14)",
  shadow: "0 40px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14)",
  blur: "blur(28px) saturate(140%)",
} as const;
