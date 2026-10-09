import type { CSSProperties } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { EasingFunction } from "remotion";
import { EASE } from "../theme";

/** Temps absolu de la vidéo, en secondes (indépendant du fps de rendu). */
export const useTime = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

/** Progression 0 → 1 entre `start` et `start + duration`, avec courbe d'accélération. */
export const prog = (t: number, start: number, duration: number, easing: EasingFunction = EASE.out) =>
  !Number.isFinite(start)
    ? Number(start < 0)
    : duration <= 0
      ? Number(t >= start)
      : interpolate(t, [start, start + duration], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing,
        });

/** Interpolation linéaire. */
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** Enveloppe d'apparition / disparition : 0 → 1 → 0. */
export const envelope = (t: number, start: number, end: number, inDur = 0.6, outDur = 0.5) =>
  prog(t, start, inDur) * (1 - prog(t, end - outDur, outDur, EASE.in));

/** Ressort physique (sans rebond par défaut) déclenché à `start` secondes. */
export const springAt = (
  t: number,
  start: number,
  fps: number,
  config: Partial<{ damping: number; mass: number; stiffness: number }> = { damping: 200 },
) => spring({ frame: Math.max(0, (t - start) * fps), fps, config });

/**
 * Révélation « premium » : montée + défloutage + fondu.
 * p = progression d'entrée (0 → 1), q = progression de sortie (0 → 1).
 */
export const rise = (p: number, q = 0, distance = 40, blur = 14): CSSProperties => ({
  opacity: p * (1 - q),
  transform: `translate3d(0, ${mix(distance, 0, p) - q * distance * 0.6}px, 0)`,
  filter: p < 1 || q > 0 ? `blur(${(1 - p) * blur + q * blur}px)` : undefined,
});

/** Léger flottement continu (respiration des objets 3D). */
export const float = (t: number, amplitude = 8, period = 4, phase = 0) =>
  Math.sin(((t + phase) / period) * Math.PI * 2) * amplitude;

/** Formatage monétaire à la française (espaces fines insécables), avec ou sans l'unité FCFA. */
export const fcfa = (value: number, unit = true) =>
  `${Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f")}${unit ? "\u00a0FCFA" : ""}`;
