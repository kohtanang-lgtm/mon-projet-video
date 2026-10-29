import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {drop, prog, sp} from '../anim';
import {LOGO_PATHS, LOGO_TRANSFORM, LOGO_VIEWBOX} from '../logo/logoPaths';
import {C, EASE_OUT} from '../theme';

const TOP = ['R1', 'E', 'U', 'S1', 'S2', 'R2'] as const;
const BOTTOM = ['B', 'E2', 'dash', 'G', 'O', 'U2'] as const;
const VB_W = LOGO_VIEWBOX[2];
const VB_H = LOGO_VIEWBOX[3];
export const LOGO_RATIO = VB_H / VB_W;

const center = (k: string) => {
  const [x0, y0, x1, y1] = LOGO_PATHS[k].bbox;
  return {cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, bottom: y1, top: y0};
};

const Part: React.FC<{k: string; fill: string; transform?: string; opacity?: number; blurY?: number}> = ({k, fill, transform, opacity = 1, blurY = 0}) => {
  const id = `lb-${k}`;
  return (
    <g transform={transform} opacity={opacity} filter={blurY > 0.5 ? `url(#${id})` : undefined}>
      {blurY > 0.5 ? (
        <filter id={id} x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation={`0 ${blurY}`} />
        </filter>
      ) : null}
      <path d={LOGO_PATHS[k].d} transform={LOGO_TRANSFORM} fill={fill} />
    </g>
  );
};

export type LogoMode = 'drop' | 'pop' | 'static';

/**
 * Logo REUSS!R BÉ-GOU vectorisé, animable lettre par lettre.
 * - drop : les lettres tombent une à une, le « ! » arrive en dernier (impact).
 * - pop : apparition rapide par rebond (outro).
 */
export const Logo: React.FC<{
  width: number;
  mode?: LogoMode;
  delay?: number;
  begouDelay?: number;
  white?: string;
  red?: string;
  /** Progression (0 → 1) d'un reflet lumineux qui traverse les lettres. */
  sheen?: number;
}> = ({width, mode = 'static', delay = 0, begouDelay, white = C.white, red = C.red, sheen = 0}) => {
  const raw = useCurrentFrame();
  const {fps} = useVideoConfig();
  const frame = raw - delay;
  const height = width * LOGO_RATIO;

  const topDelays: Record<string, number> = {R1: 0, E: 4, U: 8, S1: 12, S2: 16, R2: 20};
  const bd = begouDelay ?? (mode === 'pop' ? 12 : 40);

  const topPart = (k: string, i: number) => {
    const {cx, bottom, cy} = center(k);
    if (mode === 'drop') {
      const d = drop(frame, topDelays[k], 8);
      if (!d.visible) return null;
      const ty = d.y * 1500;
      return (
        <Part
          key={k}
          k={k}
          fill={white}
          blurY={d.v * 30}
          transform={`translate(0 ${ty}) translate(${cx} ${bottom}) scale(${d.sx} ${d.sy}) translate(${-cx} ${-bottom})`}
        />
      );
    }
    if (mode === 'pop') {
      const s = sp(frame, fps, i * 2, {damping: 11, stiffness: 170});
      if (s <= 0.001) return null;
      return <Part key={k} k={k} fill={white} transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`} />;
    }
    return <Part key={k} k={k} fill={white} />;
  };

  // Le point d'exclamation rouge : arrivée signature.
  const excl = () => {
    const bar = center('excl_bar');
    const dot = center('excl_dot');
    if (mode === 'drop') {
      const db = drop(frame, 28, 9);
      const dd = drop(frame, 32, 8);
      return (
        <g>
          {db.visible ? (
            <Part
              k="excl_bar"
              fill={red}
              blurY={db.v * 40}
              transform={`translate(0 ${db.y * 1600}) translate(${bar.cx} ${bar.bottom}) scale(${db.sx} ${db.sy}) translate(${-bar.cx} ${-bar.bottom})`}
            />
          ) : null}
          {dd.visible ? (
            <Part
              k="excl_dot"
              fill={red}
              blurY={dd.v * 40}
              transform={`translate(0 ${dd.y * 1700}) translate(${dot.cx} ${dot.bottom}) scale(${dd.sx} ${dd.sy}) translate(${-dot.cx} ${-dot.bottom})`}
            />
          ) : null}
        </g>
      );
    }
    if (mode === 'pop') {
      const s = sp(frame, fps, 10, {damping: 9, stiffness: 150});
      const r = (1 - s) * -40;
      return (
        <g transform={`translate(${bar.cx} ${dot.bottom}) rotate(${r}) scale(${s}) translate(${-bar.cx} ${-dot.bottom})`}>
          <Part k="excl_bar" fill={red} />
          <Part k="excl_dot" fill={red} />
        </g>
      );
    }
    return (
      <g>
        <Part k="excl_bar" fill={red} />
        <Part k="excl_dot" fill={red} />
      </g>
    );
  };

  const bottomPart = (k: string, i: number) => {
    if (mode === 'static') return <Part key={k} k={k} fill={white} />;
    const p = prog(frame, bd + i * 3, 16, EASE_OUT);
    if (p <= 0) return null;
    const ty = (1 - p) * 760;
    return <Part key={k} k={k} fill={white} transform={`translate(0 ${ty})`} />;
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`} style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <clipPath id="begou-clip">
          <rect x={-200} y={1040} width={VB_W + 400} height={VB_H - 1040 + 40} />
        </clipPath>
        <clipPath id="logo-all">
          {Object.keys(LOGO_PATHS).map((k) => (
            <path key={k} d={LOGO_PATHS[k].d} transform={LOGO_TRANSFORM} />
          ))}
        </clipPath>
        <linearGradient id="logo-sheen" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.5" stopColor="#BFE9FF" stopOpacity={0.85} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {TOP.map((k, i) => topPart(k, i))}
      {excl()}
      <g clipPath={mode === 'static' ? undefined : 'url(#begou-clip)'}>{BOTTOM.map((k, i) => bottomPart(k, i))}</g>
      {sheen > 0 && sheen < 1 ? (
        <g clipPath="url(#logo-all)">
          <rect
            x={-VB_W * 0.6 + sheen * VB_W * 2.2}
            y={-200}
            width={VB_W * 0.35}
            height={VB_H + 400}
            fill="url(#logo-sheen)"
            transform={`skewX(-20)`}
          />
        </g>
      ) : null}
    </svg>
  );
};

/** Le « ! » seul, issu du logo. Hauteur en px. */
export const EXCL_BOX = {x: 2600, y: 20, w: 285, h: 1040};
export const EXCL_DOT_CENTER = {x: (2743 - 2600) / 285, y: (896 - 20) / 1040};

export const Excl: React.FC<{height: number; color?: string; dotScale?: number; style?: React.CSSProperties}> = ({
  height,
  color = C.red,
  dotScale = 1,
  style,
}) => {
  const width = (height * EXCL_BOX.w) / EXCL_BOX.h;
  const dot = center('excl_dot');
  return (
    <svg width={width} height={height} viewBox={`${EXCL_BOX.x} ${EXCL_BOX.y} ${EXCL_BOX.w} ${EXCL_BOX.h}`} style={{overflow: 'visible', display: 'block', ...style}}>
      <path d={LOGO_PATHS.excl_bar.d} transform={LOGO_TRANSFORM} fill={color} />
      <g transform={`translate(${dot.cx} ${dot.cy}) scale(${dotScale}) translate(${-dot.cx} ${-dot.cy})`}>
        <path d={LOGO_PATHS.excl_dot.d} transform={LOGO_TRANSFORM} fill={color} />
      </g>
    </svg>
  );
};
