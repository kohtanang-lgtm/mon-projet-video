import React from 'react';
import {useCurrentFrame} from 'remotion';
import {prog} from '../anim';
import {EASE_IN, EASE_OUT} from '../theme';
import {MBlur} from './Fx';

/**
 * Texte révélé lettre par lettre (chaque lettre monte derrière un masque).
 */
export const StaggerText: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  dur?: number;
  exit?: number;
  style?: React.CSSProperties;
  charStyle?: (i: number) => React.CSSProperties | undefined;
}> = ({text, delay = 0, stagger = 2, dur = 14, exit, style, charStyle}) => {
  const frame = useCurrentFrame();
  const chars = Array.from(text);
  return (
    <div style={{display: 'inline-flex', whiteSpace: 'pre', lineHeight: 1, ...style}}>
      {chars.map((ch, i) => {
        const d = delay + i * stagger;
        const p = prog(frame, d, dur, EASE_OUT);
        const out = exit === undefined ? 0 : prog(frame, exit + i * 1, 9, EASE_IN);
        const y = (1 - p) * 140 - out * 140;
        const v = p > 0 && p < 0.6 ? (1 - p) * 9 : 0;
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingTop: '0.16em', paddingBottom: '0.06em', marginTop: '-0.16em', marginBottom: '-0.06em'}}>
            <MBlur y={v}>
              <span style={{display: 'inline-block', transform: `translateY(${y}%)`, ...charStyle?.(i)}}>{ch === ' ' ? ' ' : ch}</span>
            </MBlur>
          </span>
        );
      })}
    </div>
  );
};

/** Ligne de texte en contour qui défile (écho graphique derrière un titre). */
export const EchoLine: React.FC<{
  text: string;
  fontFamily: string;
  fontSize: number;
  speed: number;
  top: number;
  color?: string;
  opacity?: number;
  delay?: number;
}> = ({text, fontFamily, fontSize, speed, top, color = '#fff', opacity = 0.2, delay = 0}) => {
  const frame = useCurrentFrame();
  const appear = prog(frame, delay, 14, EASE_OUT);
  const line = Array(8).fill(text).join('   ');
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top,
        whiteSpace: 'nowrap',
        fontFamily,
        fontSize,
        lineHeight: 1,
        color: 'transparent',
        WebkitTextStroke: `2px ${color}`,
        opacity: opacity * appear,
        transform: `translateX(${-fontSize * 4 + frame * speed}px)`,
      }}
    >
      {line}
    </div>
  );
};
