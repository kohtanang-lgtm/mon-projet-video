import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../theme';

type Variant = 'blue' | 'red' | 'white';

const PALETTE: Record<Variant, {inner: string; outer: string; tri: string; triMax: number; glowA: string; glowB: string; vignette: string}> = {
  blue: {
    inner: '#2B52B8',
    outer: C.blueNight,
    tri: '#FFFFFF',
    triMax: 0.075,
    glowA: 'rgba(21,162,224,0.35)',
    glowB: 'rgba(227,6,19,0.18)',
    vignette: 'rgba(4,10,40,0.65)',
  },
  red: {
    inner: '#F01C2A',
    outer: '#8E0010',
    tri: '#FFFFFF',
    triMax: 0.08,
    glowA: 'rgba(255,170,120,0.25)',
    glowB: 'rgba(80,0,20,0.35)',
    vignette: 'rgba(60,0,8,0.55)',
  },
  white: {
    inner: '#FFFFFF',
    outer: '#DCE6F7',
    tri: C.blue,
    triMax: 0.06,
    glowA: 'rgba(21,162,224,0.18)',
    glowB: 'rgba(227,6,19,0.08)',
    vignette: 'rgba(32,64,149,0.18)',
  },
};

/**
 * Fond de marque : dégradé radial, mosaïque de triangles (rappel de l'affiche),
 * grands chevrons en parallaxe, halos de lumière et vignettage.
 */
export const Background: React.FC<{variant?: Variant; seed?: string; pulseAt?: number[]}> = ({
  variant = 'blue',
  seed = 'bg',
  pulseAt = [],
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const p = PALETTE[variant];
  const size = 150;
  const h = (size * Math.sqrt(3)) / 2;

  const tris = useMemo(() => {
    const out: {pts: string; base: number; phase: number; cx: number; cy: number}[] = [];
    const cols = Math.ceil(width / (size / 2)) + 4;
    const rows = Math.ceil(height / h) + 3;
    for (let r = -1; r < rows; r++) {
      for (let c = -2; c < cols; c++) {
        const x = (c * size) / 2;
        const y = r * h;
        const up = (r + c) % 2 === 0;
        const pts = up
          ? `${x},${y + h} ${x + size / 2},${y} ${x + size},${y + h}`
          : `${x},${y} ${x + size},${y} ${x + size / 2},${y + h}`;
        const rnd = random(`${seed}-${r}-${c}`);
        if (rnd < 0.55) continue;
        out.push({pts, base: (rnd - 0.55) / 0.45, phase: random(`${seed}-p-${r}-${c}`) * Math.PI * 2, cx: x + size / 2, cy: y + h / 2});
      }
    }
    return out;
  }, [width, height, seed, h]);

  // Pulsation des triangles lors des impacts : une onde part du centre.
  const wave = (cx: number, cy: number) => {
    let boost = 0;
    for (const hit of pulseAt) {
      const t = frame - hit;
      if (t < 0 || t > 30) continue;
      const d = Math.hypot(cx - width / 2, cy - height / 2);
      const front = t * 70;
      const dist = Math.abs(d - front);
      boost += Math.max(0, 1 - dist / 160) * (1 - t / 30);
    }
    return boost;
  };

  const drift = frame * 0.35; // chaque scène a son propre compteur local, la dérive reste faible
  const big = Math.max(width, height);

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 75% at 50% 45%, ${p.inner} 0%, ${p.outer} 100%)`, overflow: 'hidden'}}>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${-drift}, 0)`}>
          {tris.map((t, i) => {
            const shimmer = 0.55 + 0.45 * Math.sin(frame * 0.045 + t.phase);
            const o = Math.min(0.4, p.triMax * t.base * shimmer + 0.25 * wave(t.cx, t.cy));
            return <polygon key={i} points={t.pts} fill={p.tri} opacity={o} />;
          })}
        </g>
        {/* Grands chevrons (flèches de l'affiche), en parallaxe lente */}
        {[0, 1, 2].map((i) => {
          const s = big * (0.55 + i * 0.18);
          const x = width * (0.62 + i * 0.12) - frame * (0.6 + i * 0.35);
          const y = height * (0.15 + i * 0.3);
          return (
            <polygon
              key={`chev${i}`}
              points={`${x},${y - s / 2} ${x + s * 0.62},${y} ${x},${y + s / 2}`}
              fill={p.tri}
              opacity={0.035 + i * 0.012}
            />
          );
        })}
      </svg>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${18 + 8 * Math.sin(frame / 70)}% ${12 + 6 * Math.cos(frame / 90)}%, ${p.glowA} 0%, transparent 45%), radial-gradient(circle at ${85 - 6 * Math.sin(frame / 80)}% ${90 - 5 * Math.cos(frame / 60)}%, ${p.glowB} 0%, transparent 50%)`,
        }}
      />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, ${p.vignette} 100%)`}} />
    </AbsoluteFill>
  );
};
