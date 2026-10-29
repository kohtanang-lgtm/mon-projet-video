import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {prog, shake, sp} from '../anim';
import {Background} from '../components/Background';
import {Flash, MBlur, MaskUp} from '../components/Fx';
import {EXCL_BOX, Excl} from '../components/Logo';
import {StaggerText} from '../components/Text';
import {BEAT, C, EASE_OUT, F} from '../theme';

const TOPICS: string[][] = [['FINANCE'], ['TECH'], ['BUSINESS'], ['ORIENTATION', '& FORMATION'], ['OPPORTUNITÉS', "D'INVESTISSEMENT"]];

/** Défilement « bandit manchot » des thèmes, un par temps. */
const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const V = height > width;
  const fs = V ? 128 : 180;
  const lineH = fs * 1.02;
  const gap = fs * 0.32;

  // Position (centre) de chaque élément dans la pile.
  const heights = TOPICS.map((t) => t.length * lineH);
  const centers: number[] = [];
  let acc = 0;
  heights.forEach((h) => {
    centers.push(acc + h / 2);
    acc += h + gap;
  });

  let offset = centers[0];
  const steps = TOPICS.map((_, i) => (i === 0 ? 1 : sp(frame, fps, i * BEAT, {damping: 16, stiffness: 200})));
  for (let i = 1; i < TOPICS.length; i++) offset += steps[i] * (centers[i] - centers[i - 1]);
  const active = steps.reduce((a, s, i) => (s > 0.5 ? i : a), 0);
  const appear = prog(frame, 0, 10, EASE_OUT);
  const moving = TOPICS.some((_, i) => i > 0 && steps[i] > 0.02 && steps[i] < 0.9);

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: V ? 300 : 90, display: 'flex', justifyContent: 'center'}}>
        <MaskUp delay={0} dur={12}>
          <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: V ? 40 : 36, letterSpacing: '0.5em', color: C.cyanLight, paddingLeft: '0.5em'}}>AU PROGRAMME</div>
        </MaskUp>
      </div>
      {/* Repère central */}
      <div
        style={{
          position: 'absolute',
          left: V ? 26 : 200,
          top: height / 2 - fs * 0.45,
          width: 14,
          height: fs * 0.9,
          background: C.red,
          borderRadius: 7,
          transform: `scaleY(${appear})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: V ? 26 : 200,
          top: height / 2 - fs * 0.45,
          width: 14,
          height: fs * 0.9,
          background: C.red,
          borderRadius: 7,
          transform: `scaleY(${appear})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          WebkitMaskImage: `linear-gradient(180deg, transparent ${V ? 26 : 22}%, #000 ${V ? 38 : 38}%, #000 ${V ? 62 : 64}%, transparent ${V ? 76 : 84}%)`,
        }}
      >
      <div style={{position: 'absolute', left: 0, right: 0, top: height / 2 - offset, opacity: appear}}>
        <MBlur y={moving ? 6 : 0}>
          {TOPICS.map((t, i) => {
            const isActive = i === active;
            const dist = Math.abs(i - active);
            return (
              <div
                key={i}
                style={{
                  height: heights[i],
                  marginBottom: gap,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: F.display,
                  fontSize: fs,
                  lineHeight: 1.02,
                  color: isActive ? C.white : 'transparent',
                  WebkitTextStroke: isActive ? undefined : `2px rgba(255,255,255,${dist === 1 ? 0.45 : 0.18})`,
                  transform: `scale(${isActive ? 1 : 0.86})`,
                  textShadow: isActive ? '0 26px 60px rgba(0,8,40,0.45)' : undefined,
                }}
              >
                {t.map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>
            );
          })}
        </MBlur>
      </div>
      </div>
    </AbsoluteFill>
  );
};

/** « DU LOURD ARRIVE ! » */
const Heavy: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const V = height > width;
  const fs = V ? 250 : 300;
  const slam = sp(frame, fps, 0, {damping: 12, stiffness: 240});
  const sh = shake(frame, [1, 18], V ? 14 : 20, 12);
  const exclS = sp(frame, fps, 16, {damping: 8, stiffness: 220});
  const exclH = fs * 0.916;
  const exclW = (exclH * EXCL_BOX.w) / EXCL_BOX.h;
  return (
    <AbsoluteFill>
      <Background variant="red" seed="heavy" pulseAt={[0, 18]} />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          transform: `translate(${sh.x}px, ${sh.y}px) scale(${1.25 - 0.25 * slam + frame * 0.0012})`,
        }}
      >
        <StaggerText text="DU LOURD" delay={0} stagger={1.5} dur={10} style={{fontFamily: F.display, fontSize: fs, color: C.white, textShadow: '0 30px 70px rgba(60,0,8,0.45)'}} />
        <div style={{display: 'flex', alignItems: 'center'}}>
          <StaggerText text="ARRIVE" delay={6} stagger={1.5} dur={10} style={{fontFamily: F.display, fontSize: fs, color: C.white, textShadow: '0 30px 70px rgba(60,0,8,0.45)'}} />
          <div style={{width: fs * 0.1}} />
          <div style={{width: exclW, height: exclH, transform: `scale(${exclS}) rotate(${(1 - exclS) * 25}deg)`, transformOrigin: '50% 100%'}}>
            <Excl height={exclH} color={C.white} />
          </div>
        </div>
      </AbsoluteFill>
      <Flash at={0} strength={0.6} len={8} />
      <Flash at={18} strength={0.25} len={6} />
    </AbsoluteFill>
  );
};

/** Scène 7 — Au programme, puis « Du lourd arrive ! ». */
export const S7Program: React.FC = () => (
  <AbsoluteFill>
    <Background variant="blue" seed="program" pulseAt={[0, 15, 30, 45, 60]} />
    <Sequence durationInFrames={76}>
      <Reel />
    </Sequence>
    <Sequence from={75}>
      <Heavy />
    </Sequence>
  </AbsoluteFill>
);

