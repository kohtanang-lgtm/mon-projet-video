import {interpolate, random, spring} from 'remotion';
import {EASE_OUT} from './theme';

type Ease = (t: number) => number;

/** Progression 0 → 1 entre `start` et `start + dur`, bornée. */
export const prog = (frame: number, start: number, dur: number, easing: Ease = EASE_OUT) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const sp = (
  frame: number,
  fps: number,
  delay = 0,
  config: {damping?: number; stiffness?: number; mass?: number} = {},
) =>
  spring({
    frame: frame - delay,
    fps,
    config: {damping: 14, stiffness: 160, mass: 0.8, ...config},
  });

/**
 * Tremblement de caméra amorti déclenché à chaque impact.
 * `hits` = images (locales) des impacts.
 */
export const shake = (frame: number, hits: number[], amp = 18, len = 14) => {
  let x = 0;
  let y = 0;
  let r = 0;
  for (const h of hits) {
    const t = frame - h;
    if (t < 0 || t > len) continue;
    const decay = Math.pow(1 - t / len, 2.2);
    x += (random(`sx${h}-${t}`) - 0.5) * 2 * amp * decay;
    y += (random(`sy${h}-${t}`) - 0.5) * 2 * amp * decay;
    r += (random(`sr${h}-${t}`) - 0.5) * 1.2 * decay;
  }
  return {x, y, r};
};

/**
 * Chute avec écrasement à l'impact (squash & stretch).
 * Renvoie un décalage vertical (en fraction de `dist`), les échelles et une vitesse pour le flou.
 */
export const drop = (frame: number, delay: number, fallDur = 9) => {
  const t = frame - delay;
  if (t < 0) return {y: -1, sx: 1, sy: 1.15, v: 0, visible: false};
  if (t < fallDur) {
    const p = t / fallDur;
    const y = -1 + p * p; // accélération
    return {y, sx: 0.92, sy: 1.12, v: 2 * p, visible: true};
  }
  const k = t - fallDur;
  // rebond amorti de l'écrasement
  const squash = Math.exp(-k / 3.2) * Math.cos(k / 1.6);
  return {y: 0, sx: 1 + 0.14 * squash, sy: 1 - 0.18 * squash, v: 0, visible: true};
};
