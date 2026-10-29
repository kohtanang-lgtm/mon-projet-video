import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {prog, sp} from '../anim';
import {Background} from '../components/Background';
import {MBlur, MaskUp} from '../components/Fx';
import {Pill} from '../components/Graphics';
import {StaggerText} from '../components/Text';
import {C, EASE_OUT, F} from '../theme';

export type DayProps = {
  num: 1 | 2;
  label: string;
  pillar: string;
  accent: string;
  left: string;
  right: string;
  lead: string;
  result: string[]; // lignes (format horizontal)
  resultV: string[]; // lignes (format vertical)
};

/** Les deux générations se rejoignent au centre. */
const Meeting: React.FC<{left: string; right: string; accent: string; delay: number}> = ({left, right, accent, delay}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const V = height > width;
  const size = V ? 34 : 36;
  const sl = sp(frame, fps, delay, {damping: 17, stiffness: 120});
  const sr = sp(frame, fps, delay + 3, {damping: 17, stiffness: 120});
  const meet = delay + 14;
  const x = sp(frame, fps, meet, {damping: 10, stiffness: 180});
  const burst = prog(frame, meet, 16, EASE_OUT);
  const travel = width * 0.6;
  const vl = Math.abs(1 - sl) * 40;
  const vr = Math.abs(1 - sr) * 40;

  const pillL = (
    <MBlur x={sl < 0.95 ? vl : 0}>
      <div style={{transform: `translateX(${-(1 - sl) * travel}px)`}}>
        <Pill bg={C.white} color={C.navy} size={size}>
          {left}
        </Pill>
      </div>
    </MBlur>
  );
  const pillR = (
    <MBlur x={sr < 0.95 ? vr : 0}>
      <div style={{transform: `translateX(${(1 - sr) * travel}px)`}}>
        <Pill bg={accent} color={C.white} size={size}>
          {right}
        </Pill>
      </div>
    </MBlur>
  );
  const knot = (
    <div style={{position: 'relative', width: size * 2.4, height: size * 2.4, flexShrink: 0}}>
      <svg width={size * 2.4} height={size * 2.4} viewBox="-60 -60 120 120" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {burst > 0 && burst < 1
          ? Array.from({length: 10}).map((_, i) => {
              const a = (i / 10) * Math.PI * 2;
              const r0 = 40 + burst * 40;
              const r1 = 48 + burst * 70;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * r0}
                  y1={Math.sin(a) * r0}
                  x2={Math.cos(a) * r1}
                  y2={Math.sin(a) * r1}
                  stroke={C.white}
                  strokeWidth={5 * (1 - burst)}
                  strokeLinecap="round"
                />
              );
            })
          : null}
        <g transform={`scale(${x}) rotate(${(1 - x) * 90})`}>
          <circle r={44} fill={C.red} />
          <path d="M -15 -15 L 15 15 M 15 -15 L -15 15" stroke={C.white} strokeWidth={9} strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );

  return (
    <div style={{display: 'flex', flexDirection: V ? 'column' : 'row', alignItems: 'center', gap: V ? 6 : 26}}>
      {pillL}
      {knot}
      {pillR}
    </div>
  );
};

export const DayScene: React.FC<DayProps> = ({num, label, pillar, accent, left, right, lead, result, resultV}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const V = height > width;
  const pfs = V ? 280 : 270;
  const rfs = V ? 70 : 62;
  const lines = V ? resultV : result;
  const hl = prog(frame, 84, 18, EASE_OUT);
  const drift = 1 + frame * 0.0006;
  const bigNumX = 80 - frame * 0.9;

  return (
    <AbsoluteFill>
      <Background variant="blue" seed={`day${num}`} pulseAt={[0]} />
      {/* Grand numéro en contour, en fond */}
      <div
        style={{
          position: 'absolute',
          right: V ? -40 : 90,
          top: V ? 380 : 40,
          fontFamily: F.display,
          fontSize: V ? 1150 : 1000,
          lineHeight: 1,
          color: C.white,
          opacity: 0.05 * prog(frame, 0, 20, EASE_OUT),
          transform: `translateX(${bigNumX}px)`,
        }}
      >
        {num}
      </div>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', transform: `scale(${drift})`}}>
        <MaskUp delay={3} dur={14}>
          <Pill bg={accent} color={C.white} size={V ? 36 : 34}>
            <span>Jour {num}</span>
            <span style={{opacity: 0.6}}>•</span>
            <span>{label}</span>
          </Pill>
        </MaskUp>
        <div style={{height: V ? 24 : 18}} />
        <StaggerText text={pillar} delay={8} stagger={2.5} style={{fontFamily: F.display, fontSize: pfs, color: C.white, textShadow: '0 30px 70px rgba(0,8,40,0.4)'}} />
        <div style={{height: V ? 50 : 30}} />
        <Meeting left={left} right={right} accent={accent} delay={34} />
        <div style={{height: V ? 70 : 48}} />
        <MaskUp delay={74} dur={14}>
          <div style={{fontFamily: F.sans, fontWeight: 600, fontStyle: 'italic', fontSize: V ? 40 : 34, color: C.cyanLight, letterSpacing: '0.02em'}}>{lead}</div>
        </MaskUp>
        <div style={{height: 12}} />
        {lines.map((l, i) => (
          <div key={l} style={{position: 'relative', marginTop: i ? 6 : 0}}>
            <div
              style={{
                position: 'absolute',
                left: -rfs * 0.3,
                right: -rfs * 0.3,
                top: '12%',
                bottom: '4%',
                background: accent,
                transform: `scaleX(${prog(frame, 84 + i * 5, 18, EASE_OUT)}) skewX(-12deg)`,
                transformOrigin: '0% 50%',
                opacity: 0.95 * hl + 0.0,
              }}
            />
            <StaggerText
              text={l}
              delay={80 + i * 5}
              stagger={0.8}
              style={{position: 'relative', fontFamily: F.sans, fontWeight: 900, fontSize: rfs, color: C.white, letterSpacing: '0.02em'}}
            />
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
