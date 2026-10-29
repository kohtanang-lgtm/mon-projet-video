import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {prog, shake, sp} from '../anim';
import {Background} from '../components/Background';
import {Flash, MBlur, MaskUp} from '../components/Fx';
import {CalendarIcon, PinIcon} from '../components/Graphics';
import {C, EASE_OUT, F} from '../theme';

/** Colonne de chiffres qui roule jusqu'à la bonne valeur. */
const RollDigit: React.FC<{digit: number; delay: number; fs: number; spins?: number}> = ({digit, delay, fs, spins = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = sp(frame, fps, delay, {damping: 15, stiffness: 90, mass: 1});
  const total = spins * 10 + digit;
  const pos = s * total;
  const strip = Array.from({length: total + 2}, (_, i) => i % 10);
  const speed = Math.abs(sp(frame + 1, fps, delay, {damping: 15, stiffness: 90, mass: 1}) - s) * total;
  return (
    <div style={{height: fs * 1.0, overflow: 'hidden', fontFamily: F.display, fontSize: fs, lineHeight: 1, color: C.white}}>
      <MBlur y={Math.min(18, speed * 14)}>
        <div style={{transform: `translateY(${-pos * fs}px)`}}>
          {strip.map((d, i) => (
            <div key={i} style={{height: fs}}>
              {d}
            </div>
          ))}
        </div>
      </MBlur>
    </div>
  );
};

/** Scène 8 — Date et lieu. */
export const S8Date: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const V = height > width;
  const fs = V ? 320 : 360;
  const dash = prog(frame, 10, 14, EASE_OUT);
  const card = sp(frame, fps, 40, {damping: 14, stiffness: 140});
  const sh = shake(frame, [0], 16, 12);
  const drift = 1 + frame * 0.0007;

  return (
    <AbsoluteFill>
      <Background variant="blue" seed="date" pulseAt={[0]} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', transform: `translate(${sh.x}px, ${sh.y}px) scale(${drift})`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: V ? 16 : 22}}>
          <div style={{transform: `scale(${0.6 + 0.4 * prog(frame, 0, 10, EASE_OUT)})`}}>
            <CalendarIcon size={V ? 92 : 84} delay={2} color={C.white} />
          </div>
          <MaskUp delay={2} dur={14}>
            <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: V ? 40 : 36, letterSpacing: '0.45em', color: C.cyanLight, paddingLeft: '0.2em'}}>
              VENDREDI &amp; SAMEDI
            </div>
          </MaskUp>
        </div>
        <div style={{height: V ? 10 : 6}} />
        <div style={{display: 'flex', alignItems: 'center', textShadow: '0 30px 70px rgba(0,8,40,0.4)'}}>
          <RollDigit digit={2} delay={0} fs={fs} />
          <RollDigit digit={0} delay={3} fs={fs} spins={2} />
          <div style={{width: fs * 0.42, height: fs * 0.11, margin: `0 ${fs * 0.1}px`, background: C.red, borderRadius: fs * 0.05, transform: `scaleX(${dash})`}} />
          <RollDigit digit={2} delay={6} fs={fs} />
          <RollDigit digit={1} delay={9} fs={fs} spins={2} />
        </div>
        <MaskUp delay={20} dur={14}>
          <div style={{fontFamily: F.sans, fontWeight: 900, fontSize: V ? 70 : 64, letterSpacing: '0.32em', color: C.white, paddingLeft: '0.32em'}}>NOVEMBRE 2026</div>
        </MaskUp>
        <div style={{height: V ? 70 : 46}} />
        {/* Carte lieu */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: V ? 26 : 22,
            background: C.white,
            borderRadius: 999,
            padding: V ? '26px 64px 26px 40px' : '20px 58px 20px 34px',
            boxShadow: '0 24px 60px rgba(0,8,40,0.4)',
            transform: `scale(${card}) translateY(${(1 - card) * 40}px)`,
          }}
        >
          <PinIcon size={V ? 86 : 74} delay={46} />
          <div style={{fontFamily: F.sans, fontWeight: 900, fontSize: V ? 66 : 58, color: C.navy, letterSpacing: '0.02em', whiteSpace: 'nowrap'}}>RADISSON BLU</div>
        </div>
      </AbsoluteFill>
      <Flash at={0} strength={0.4} len={8} />
    </AbsoluteFill>
  );
};
