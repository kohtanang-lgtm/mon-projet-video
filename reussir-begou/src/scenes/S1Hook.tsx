import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {prog, shake} from '../anim';
import {Background} from '../components/Background';
import {Flash, MBlur, Shockwave} from '../components/Fx';
import {EXCL_BOX, EXCL_DOT_CENTER, Excl} from '../components/Logo';
import {C, EASE_IN_OUT, EASE_OUT, F} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Scène 1 — Accroche.
 * Le « ! » rouge du logo s'écrase au centre, puis devient le « I » de « !MAGINEZ »
 * (même jeu typographique que REUSS!R). La caméra plonge ensuite dans le point du « ! ».
 */
export const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const V = height > width;
  const IMPACT = 15;

  const fs = V ? 250 : 400;
  const exclH = fs * 0.916;
  const exclW = (exclH * EXCL_BOX.w) / EXCL_BOX.h;
  const gap = fs * 0.07;
  const textW = fs * 3.263;
  const cx = width / 2;
  const cy = height / 2;

  // Chute (accélérée) puis écrasement.
  const fallP = interpolate(frame, [0, IMPACT], [0, 1], clamp);
  // Distance de chute réglée pour que le bas du « ! » soit déjà visible dès la première image.
  const fallDist = cy + exclH * 2.15 * 0.15;
  const fallY = -(1 - fallP * fallP) * fallDist;
  const k = frame - IMPACT;
  const squash = k >= 0 ? Math.exp(-k / 3.2) * Math.cos(k / 1.6) : 0;
  const sx = k >= 0 ? 1 + 0.16 * squash : 0.9;
  const sy = k >= 0 ? 1 - 0.2 * squash : 1.14;
  const big = interpolate(frame, [28, 44], [2.15, 1], {...clamp, easing: EASE_IN_OUT});

  // Révélation du mot depuis l'arrière du « ! ».
  const reveal = prog(frame, 31, 20, EASE_OUT);
  const rowW = exclW + reveal * (gap + textW);
  const rowLeft = cx - rowW / 2;
  const revealSpeed = interpolate(frame, [31, 40], [1, 0], clamp);

  // Plongée dans le point du « ! ».
  const zoomP = interpolate(frame, [58, 75], [0, 1], {...clamp, easing: Easing.in(Easing.exp)});
  const zoom = Math.pow(90, zoomP);
  const dotX = rowLeft + exclW * EXCL_DOT_CENTER.x;
  const dotY = cy - exclH / 2 + exclH * EXCL_DOT_CENTER.y;

  const sh = shake(frame, [IMPACT], V ? 16 : 22);
  const glow = k >= 0 ? Math.exp(-k / 10) : 0;

  return (
    <AbsoluteFill style={{background: C.blueNight}}>
      <AbsoluteFill
        style={{
          transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg)`,
          transformOrigin: `${dotX}px ${dotY}px`,
        }}
      >
        <AbsoluteFill style={{transform: `scale(${1.06 * zoom})`, transformOrigin: `${dotX}px ${dotY}px`}}>
          <AbsoluteFill style={{opacity: interpolate(frame, [0, 10, IMPACT], [0.35, 0.55, 1], clamp)}}>
            <Background variant="blue" seed="hook" pulseAt={[IMPACT]} />
          </AbsoluteFill>
          {/* Halo rouge à l'impact */}
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at ${dotX}px ${cy}px, rgba(227,6,19,${0.45 * glow}) 0%, transparent ${30 + 20 * (1 - glow)}%)`,
            }}
          />
          <Shockwave at={IMPACT} x={cx} y={cy + exclH * 0.4} maxR={Math.max(width, height) * 0.75} />

          {/* Le mot */}
          <div
            style={{
              position: 'absolute',
              left: rowLeft + exclW,
              top: cy - fs / 2,
              width: reveal * (gap + textW),
              display: reveal > 0 ? 'block' : 'none',
              height: fs * 1.1,
              overflow: 'hidden',
            }}
          >
            <MBlur x={revealSpeed * reveal * 18}>
              <div
                style={{
                  paddingLeft: gap,
                  fontFamily: F.display,
                  fontSize: fs,
                  lineHeight: 1,
                  color: C.white,
                  whiteSpace: 'nowrap',
                  transform: `translateX(${-(1 - reveal) * textW * 0.45}px)`,
                  textShadow: '0 24px 60px rgba(0,8,40,0.35)',
                }}
              >
                MAGINEZ
              </div>
            </MBlur>
          </div>

          {/* Le « ! » */}
          <div
            style={{
              position: 'absolute',
              left: rowLeft,
              top: cy - exclH / 2,
              width: exclW,
              height: exclH,
              transform: `translateY(${fallY}px) scale(${big})`,
              transformOrigin: '50% 50%',
            }}
          >
            <div style={{transform: `scale(${sx}, ${sy})`, transformOrigin: '50% 100%'}}>
              <MBlur y={frame < IMPACT ? 6 + fallP * 30 : 0}>
                <Excl height={exclH} style={{filter: 'drop-shadow(0 18px 40px rgba(80,0,10,0.35))'}} />
              </MBlur>
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <Flash at={IMPACT} strength={0.35} len={7} />
      <AbsoluteFill style={{background: C.red, opacity: interpolate(frame, [71, 74], [0, 1], clamp)}} />
    </AbsoluteFill>
  );
};
