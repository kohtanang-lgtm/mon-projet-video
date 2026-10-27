import { Easing, interpolate, spring, SpringConfig, useCurrentFrame, useVideoConfig } from 'remotion';

// Ressort (0 → 1) qui démarre à l'image `debut`.
export const useRessort = (debut: number, config: Partial<SpringConfig> = {}, duree?: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - debut,
    fps,
    config: { damping: 14, stiffness: 140, mass: 0.8, ...config },
    durationInFrames: duree,
  });
};

export const ressort = (
  frame: number,
  fps: number,
  debut: number,
  config: Partial<SpringConfig> = {},
  duree?: number,
) =>
  spring({
    frame: frame - debut,
    fps,
    config: { damping: 14, stiffness: 140, mass: 0.8, ...config },
    durationInFrames: duree,
  });

// Progression linéaire bornée (0 → 1) entre deux images, avec courbe d'accélération optionnelle.
export const prog = (frame: number, de: number, a: number, easing: (t: number) => number = Easing.linear) =>
  interpolate(frame, [de, a], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export const DOUX = Easing.bezier(0.22, 1, 0.36, 1);
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1);
