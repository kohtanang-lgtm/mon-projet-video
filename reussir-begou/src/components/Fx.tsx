import React, {useId} from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {prog} from '../anim';
import {C, EASE_IN, EASE_OUT} from '../theme';
import {Excl} from './Logo';

/** Grain « film » léger, recalculé à chaque image. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.075}) => {
  const frame = useCurrentFrame();
  const i = frame % 6;
  const ox = (frame * 137) % 400;
  const oy = (frame * 251) % 400;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile(`grain/grain${i}.png`)})`,
        backgroundPosition: `${ox}px ${oy}px`,
        mixBlendMode: 'overlay',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

/** Flou de mouvement directionnel (filtre SVG), proportionnel à la vitesse. */
export const MBlur: React.FC<{x?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  x = 0,
  y = 0,
  children,
  style,
}) => {
  const id = useId().replace(/:/g, '');
  const active = x > 0.3 || y > 0.3;
  return (
    <div style={{...style, filter: active ? `url(#mb${id})` : undefined}}>
      {active ? (
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <filter id={`mb${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={`${x.toFixed(2)} ${y.toFixed(2)}`} />
          </filter>
        </svg>
      ) : null}
      {children}
    </div>
  );
};

/**
 * Révélation par masque : le contenu monte depuis une ligne invisible.
 * `exit` : image de début de sortie (le contenu repart vers le haut).
 */
export const MaskUp: React.FC<{
  delay?: number;
  dur?: number;
  exit?: number;
  exitDur?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  from?: 'bottom' | 'top';
}> = ({delay = 0, dur = 16, exit, exitDur = 10, children, style, from = 'bottom'}) => {
  const frame = useCurrentFrame();
  const pin = prog(frame, delay, dur, EASE_OUT);
  const pout = exit === undefined ? 0 : prog(frame, exit, exitDur, EASE_IN);
  const dir = from === 'bottom' ? 1 : -1;
  const y = (1 - pin) * 145 * dir - pout * 145 * dir;
  const speed = Math.abs(interpolate(frame, [delay, delay + dur * 0.35], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <div style={{overflow: 'hidden', display: 'inline-block', paddingTop: '0.04em', paddingBottom: '0.04em', ...style}}>
      <MBlur y={pin > 0 && pin < 1 ? speed * 10 : 0}>
        <div style={{transform: `translateY(${y}%) skewY(${(1 - pin) * 4 * dir}deg)`}}>{children}</div>
      </MBlur>
    </div>
  );
};

/**
 * Transition par panneaux diagonaux empilés (angle de la marque).
 * `at` : image (locale) où l'écran est entièrement couvert.
 */
export const Wipe: React.FC<{at: number; colors: string[]; dir?: 1 | -1; dur?: number}> = ({at, colors, dir = 1, dur = 10}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const n = colors.length;
  const extra = height * 0.5;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      {colors.map((c, i) => {
        const inStart = at - dur - (n - 1 - i) * 2;
        const outStart = at + (n - 1 - i) * 2;
        const pin = prog(frame, inStart, dur, EASE_IN_OUT_W);
        const pout = prog(frame, outStart, dur, EASE_IN_OUT_W);
        if (pin <= 0 || pout >= 1) return null;
        const travel = width + extra * 2;
        const x = (-travel + pin * travel + pout * travel) * dir;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: -20,
              bottom: -20,
              left: -extra,
              width: width + extra * 2,
              background: c,
              transform: `translateX(${x}px) skewX(${-14 * dir}deg)`,
              boxShadow: i === n - 1 ? '0 0 60px rgba(0,0,0,0.25)' : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Le « ! » de la marque traverse l'écran avec le dernier panneau */}
            {i === n - 1 ? (
              <div style={{transform: `skewX(${14 * dir}deg)`}}>
                <Excl height={height * 0.34} color={c.toUpperCase() === '#FFFFFF' ? C.red : C.white} />
              </div>
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const EASE_IN_OUT_W = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Flash blanc bref (impact). */
export const Flash: React.FC<{at: number; strength?: number; len?: number; color?: string}> = ({at, strength = 0.5, len = 8, color = '#fff'}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > len) return null;
  return <AbsoluteFill style={{background: color, opacity: strength * Math.pow(1 - t / len, 2), pointerEvents: 'none'}} />;
};

/** Onde de choc circulaire. */
export const Shockwave: React.FC<{at: number; x: number; y: number; color?: string; maxR?: number; len?: number}> = ({
  at,
  x,
  y,
  color = '#fff',
  maxR = 900,
  len = 22,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame - at;
  if (t < 0 || t > len) return null;
  const p = EASE_OUT(t / len);
  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <circle cx={x} cy={y} r={20 + p * maxR} fill="none" stroke={color} strokeWidth={Math.max(0.5, 26 * (1 - p))} opacity={0.8 * (1 - p)} />
      <circle cx={x} cy={y} r={10 + p * maxR * 0.62} fill="none" stroke={color} strokeWidth={Math.max(0.5, 10 * (1 - p))} opacity={0.5 * (1 - p)} />
    </svg>
  );
};

/** Balayage lumineux diagonal sur un élément (à placer dans un conteneur en overflow hidden). */
export const Sheen: React.FC<{at: number; dur?: number; opacity?: number}> = ({at, dur = 22, opacity = 0.55}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, dur, EASE_IN_OUT_S);
  if (p <= 0 || p >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(105deg, transparent ${p * 140 - 40}%, rgba(255,255,255,${opacity}) ${p * 140 - 25}%, transparent ${p * 140 - 10}%)`,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

const EASE_IN_OUT_S = (t: number) => t * t * (3 - 2 * t);
