import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {sp, shake} from '../anim';
import {Background} from '../components/Background';
import {MBlur, MaskUp, Wipe} from '../components/Fx';
import {Pill} from '../components/Graphics';
import {EchoLine, StaggerText} from '../components/Text';
import {C, F} from '../theme';

const useV = () => {
  const {width, height} = useVideoConfig();
  return {V: height > width, width, height};
};

/** « 2 JOURS » sur fond rouge. */
const PhraseDays: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {V} = useV();
  const fs = V ? 300 : 400;
  const s = sp(frame, fps, 0, {damping: 13, stiffness: 260});
  const scale2 = 2.6 - 1.6 * s;
  const sh = shake(frame, [2], 12, 10);
  const drift = 1 + frame * 0.0009;
  return (
    <AbsoluteFill>
      <Background variant="red" seed="days" pulseAt={[0]} />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: fs * 0.12,
          transform: `translate(${sh.x}px, ${sh.y}px) scale(${drift})`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', fontFamily: F.display, fontSize: fs, color: C.white, lineHeight: 1}}>
          <MBlur x={0} y={s < 0.7 ? (1 - s) * 12 : 0}>
            <div style={{transform: `scale(${scale2})`, textShadow: '0 30px 70px rgba(60,0,8,0.45)'}}>2</div>
          </MBlur>
          <div style={{width: fs * 0.22}} />
          <StaggerText text="JOURS" delay={5} stagger={2} style={{textShadow: '0 30px 70px rgba(60,0,8,0.45)'}} />
        </div>
        <MaskUp delay={16} dur={16}>
          <Pill bg={C.white} color={C.red} size={V ? 34 : 40}>
            20 &amp; 21 novembre 2026
          </Pill>
        </MaskUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** « UNE GRANDE SALLE » sur fond bleu, avec échos en contour. */
const PhraseRoom: React.FC = () => {
  const frame = useCurrentFrame();
  const {V, height} = useV();
  const fs = V ? 330 : 300;
  const drift = 1 + frame * 0.0008;
  const titleH = V ? fs * 2 : fs;
  return (
    <AbsoluteFill>
      <Background variant="blue" seed="room" />
      <EchoLine text="GRANDE SALLE" fontFamily={F.display} fontSize={fs * 0.62} speed={-3} top={height / 2 - titleH / 2 - fs * 0.85} delay={4} />
      <EchoLine text="GRANDE SALLE" fontFamily={F.display} fontSize={fs * 0.62} speed={3} top={height / 2 + titleH / 2 + fs * 0.2} delay={6} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', transform: `scale(${drift})`}}>
        <MaskUp delay={2} dur={14}>
          <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: V ? 52 : 50, letterSpacing: '0.45em', color: C.cyanLight, paddingLeft: '0.45em'}}>
            DANS UNE
          </div>
        </MaskUp>
        <div style={{height: fs * 0.06}} />
        {V ? (
          <>
            <StaggerText text="GRANDE" delay={6} stagger={2} style={{fontFamily: F.display, fontSize: fs, color: C.white}} />
            <StaggerText text="SALLE" delay={12} stagger={2} style={{fontFamily: F.display, fontSize: fs, color: C.white}} />
          </>
        ) : (
          <StaggerText text="GRANDE SALLE" delay={6} stagger={2} style={{fontFamily: F.display, fontSize: fs, color: C.white, textShadow: '0 30px 70px rgba(0,8,40,0.4)'}} />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** « DES INVITÉS EXCEPTIONNELS » sur fond blanc. */
const PhraseGuests: React.FC = () => {
  const frame = useCurrentFrame();
  const {V} = useV();
  const fs = V ? 175 : 280;
  const drift = 1 + frame * 0.0008;
  const line = interpolate(frame, [18, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Background variant="white" seed="guests" />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', transform: `scale(${drift})`}}>
        <MaskUp delay={0} dur={12}>
          <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: V ? 44 : 46, letterSpacing: '0.4em', color: C.red, paddingLeft: '0.4em'}}>AVEC</div>
        </MaskUp>
        <div style={{height: fs * 0.08}} />
        <StaggerText text="DES INVITÉS" delay={3} stagger={2} style={{fontFamily: F.display, fontSize: fs, color: C.blue}} />
        <StaggerText text="EXCEPTIONNELS" delay={10} stagger={1.5} style={{fontFamily: F.display, fontSize: fs, color: C.red}} />
        <div style={{marginTop: fs * 0.12, height: 10, width: (V ? 700 : 1100) * line, background: C.blue, borderRadius: 5}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Scène 2 — « Imaginez 2 jours, dans une grande salle, avec des invités exceptionnels ». */
export const S2Imagine: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={61}>
        <PhraseDays />
      </Sequence>
      <Sequence from={60} durationInFrames={61}>
        <PhraseRoom />
      </Sequence>
      <Sequence from={120}>
        <PhraseGuests />
      </Sequence>
      <Wipe at={60} colors={[C.white, C.cyan, C.blue]} />
      <Wipe at={120} colors={[C.red, C.cyan, C.white]} dir={-1} />
    </AbsoluteFill>
  );
};
