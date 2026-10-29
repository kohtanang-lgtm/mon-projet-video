import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {prog, sp} from '../anim';
import {C, EASE_IN_OUT, EASE_OUT, F} from '../theme';

/** Le « 3 » manuscrit rouge de l'affiche, tracé à la main (animation de trait). */
export const ScriptThree: React.FC<{height: number; delay?: number; dur?: number; color?: string}> = ({
  height,
  delay = 0,
  dur = 22,
  color = C.red,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE_IN_OUT);
  const w = (height * 100) / 150;
  return (
    <svg width={w} height={height} viewBox="0 0 100 150" style={{overflow: 'visible', display: 'block'}}>
      <path
        d="M 14 22 C 30 19, 62 20, 86 14 C 70 34, 54 50, 40 66 C 70 58, 96 78, 90 108 C 84 140, 42 150, 14 128 C 8 122, 10 114, 18 116"
        fill="none"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
    </svg>
  );
};

/** Icône calendrier (rouge) dont la coche se dessine. */
export const CalendarIcon: React.FC<{size: number; delay?: number; color?: string}> = ({size, delay = 0, color = C.red}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = sp(frame, fps, delay, {damping: 12, stiffness: 170});
  const check = prog(frame, delay + 8, 12, EASE_OUT);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block', transform: `scale(${s})`}}>
      <rect x={10} y={18} width={80} height={72} rx={12} fill="none" stroke={color} strokeWidth={8} />
      <rect x={10} y={18} width={80} height={20} rx={10} fill={color} />
      <rect x={10} y={30} width={80} height={10} fill={color} />
      <line x1={30} y1={8} x2={30} y2={26} stroke={color} strokeWidth={8} strokeLinecap="round" />
      <line x1={70} y1={8} x2={70} y2={26} stroke={color} strokeWidth={8} strokeLinecap="round" />
      <path
        d="M 33 63 L 46 75 L 69 52"
        fill="none"
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - check}
      />
    </svg>
  );
};

/** Épingle de localisation qui tombe et rebondit. */
export const PinIcon: React.FC<{size: number; delay?: number; color?: string}> = ({size, delay = 0, color = C.red}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = sp(frame, fps, delay, {damping: 9, stiffness: 140});
  const y = (1 - s) * -size * 0.9;
  const shadow = Math.min(1, s);
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <div
        style={{
          position: 'absolute',
          left: size * 0.25,
          bottom: -size * 0.02,
          width: size * 0.5,
          height: size * 0.1,
          borderRadius: '50%',
          background: 'rgba(11,22,64,0.25)',
          transform: `scale(${0.4 + 0.6 * shadow})`,
          opacity: shadow,
        }}
      />
      <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, transform: `translateY(${y}px)`, opacity: s > 0.02 ? 1 : 0}}>
        <path d="M50 96 C 38 78, 16 58, 16 38 A 34 34 0 1 1 84 38 C 84 58, 62 78, 50 96 Z" fill={color} />
        <circle cx={50} cy={38} r={13} fill="#fff" />
      </svg>
    </div>
  );
};

/** Pastille de texte (label). */
export const Pill: React.FC<{
  children: React.ReactNode;
  bg?: string;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({children, bg = C.white, color = C.navy, size = 30, style}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.5,
      background: bg,
      color,
      fontFamily: F.sans,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      padding: `${size * 0.42}px ${size * 0.95}px`,
      borderRadius: size * 2,
      whiteSpace: 'nowrap',
      boxShadow: '0 14px 40px rgba(4,12,48,0.28)',
      ...style,
    }}
  >
    {children}
  </div>
);
