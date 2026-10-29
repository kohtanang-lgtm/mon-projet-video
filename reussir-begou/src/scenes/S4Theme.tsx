import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {prog, sp} from '../anim';
import {Background} from '../components/Background';
import {MaskUp, Sheen} from '../components/Fx';
import {StaggerText} from '../components/Text';
import {C, EASE_IN, EASE_OUT, F} from '../theme';

/** Grands mots : VÉRITÉS & RÉCONCILIATION. */
const BigWords: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const V = height > width;
  const f1 = V ? 270 : 300;
  const f2 = V ? 170 : 230;
  const amp = sp(frame, fps, 9, {damping: 10, stiffness: 160});
  const ampOut = prog(frame, 54, 9, EASE_IN);
  const drift = 1 + frame * 0.001;
  const EXIT = 52;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', transform: `scale(${drift})`}}>
      <StaggerText text="VÉRITÉS" delay={0} stagger={2} exit={EXIT} style={{fontFamily: F.display, fontSize: f1, color: C.white, textShadow: '0 30px 70px rgba(0,8,40,0.4)'}} />
      <div style={{display: 'flex', flexDirection: V ? 'column' : 'row', alignItems: 'center', marginTop: V ? 0 : f2 * 0.04}}>
        <div
          style={{
            fontFamily: F.script,
            fontSize: f2 * (V ? 0.95 : 0.8),
            color: C.red,
            lineHeight: 1,
            transform: `scale(${amp * (1 - ampOut)}) rotate(${(1 - amp) * -30}deg)`,
            marginRight: V ? 0 : f2 * 0.12,
            marginTop: V ? -f2 * 0.1 : 0,
            marginBottom: V ? f2 * 0.05 : 0,
            textShadow: '0 12px 30px rgba(60,0,10,0.35)',
          }}
        >
          &amp;
        </div>
        <StaggerText text="RÉCONCILIATION" delay={14} stagger={1.4} exit={EXIT + 2} style={{fontFamily: F.display, fontSize: f2, color: C.cyanLight}} />
      </div>
    </AbsoluteFill>
  );
};

/** Bandeaux du thème, comme sur l'affiche. */
export const Banners: React.FC<{fs?: number; bw?: number; showLabel?: boolean; float?: boolean; inline?: boolean}> = (props) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const V = height > width;
  const fs = props.fs ?? (V ? 64 : 86);
  const bw = props.bw ?? (V ? 860 : 1120);
  const showLabel = props.showLabel ?? true;
  const float = props.float ?? true;
  const bh = fs * 1.5;
  const off = fs * 0.38;

  const cyanP = prog(frame, 2, 16, EASE_OUT);
  const redP = prog(frame, 9, 16, EASE_OUT);
  const amp = sp(frame, fps, 22, {damping: 9, stiffness: 150});
  const floatX = float ? Math.sin(frame / 40) * 2.2 : 0;
  const floatY = float ? Math.cos(frame / 50) * 2.5 : 0;
  const drift = float ? 1 + frame * 0.0006 : 1;

  return (
    <Wrapper inline={props.inline}>
      <div style={{transform: `rotateX(${floatY}deg) rotateY(${floatX}deg) scale(${drift})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {showLabel ? (
          <>
            <MaskUp delay={0} dur={14}>
              <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: V ? 34 : 36, letterSpacing: '0.5em', color: C.cyanLight, paddingLeft: '0.5em'}}>
                LE THÈME
              </div>
            </MaskUp>
            <div style={{height: V ? 40 : 46}} />
          </>
        ) : null}
        {/* Bandeau cyan */}
        <div
          style={{
            position: 'relative',
            width: bw,
            height: bh,
            transform: `translateX(${-off}px)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(180deg, #2DB4F0 0%, ${C.cyan} 100%)`,
              transform: `scaleX(${cyanP})`,
              transformOrigin: '0% 50%',
              boxShadow: '0 18px 40px rgba(0,10,50,0.35)',
              overflow: 'hidden',
            }}
          >
            <Sheen at={70} dur={28} opacity={0.7} />
          </div>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <MaskUp delay={8} dur={14}>
              <div style={{fontFamily: F.round, fontWeight: 800, fontSize: fs, color: C.white, lineHeight: 1.1, textShadow: '0 3px 0 rgba(10,60,120,0.35)', whiteSpace: 'nowrap'}}>
                Vérités et Réconciliation
              </div>
            </MaskUp>
          </AbsoluteFill>
        </div>
        {/* Bandeau rouge */}
        <div style={{position: 'relative', width: bw, height: bh, transform: `translateX(${off}px)`, marginTop: fs * 0.09}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(180deg, #F0202D 0%, ${C.red} 100%)`,
              transform: `scaleX(${redP})`,
              transformOrigin: '100% 50%',
              boxShadow: '0 18px 40px rgba(0,10,50,0.35)',
              overflow: 'hidden',
            }}
          >
            <Sheen at={76} dur={28} opacity={0.6} />
          </div>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
            <MaskUp delay={14} dur={14}>
              <div style={{fontFamily: F.round, fontWeight: 800, fontSize: fs, color: C.white, lineHeight: 1.1, whiteSpace: 'nowrap'}}>sur l'Emploi</div>
            </MaskUp>
            <div
              style={{
                fontFamily: F.script,
                fontSize: fs * 1.75,
                color: C.navy,
                lineHeight: 0.8,
                margin: `0 ${fs * 0.24}px 0 ${fs * 0.2}px`,
                transform: `translateY(${fs * 0.08}px) scale(${amp}) rotate(${(1 - amp) * 40}deg)`,
                textShadow: '0 4px 0 rgba(255,255,255,0.15)',
              }}
            >
              &amp;
            </div>
            <MaskUp delay={18} dur={14}>
              <div style={{fontFamily: F.round, fontWeight: 800, fontSize: fs, color: C.white, lineHeight: 1.1, whiteSpace: 'nowrap'}}>le Capital</div>
            </MaskUp>
          </AbsoluteFill>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper: React.FC<{inline?: boolean; children: React.ReactNode}> = ({inline, children}) =>
  inline ? (
    <div style={{display: 'flex', justifyContent: 'center', perspective: 1600}}>{children}</div>
  ) : (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', perspective: 1600}}>{children}</AbsoluteFill>
  );

/** Scène 4 — Le thème : « Vérités et Réconciliation sur l'Emploi & le Capital ». */
export const S4Theme: React.FC = () => (
  <AbsoluteFill>
    <Background variant="blue" seed="theme" pulseAt={[0, 60]} />
    <Sequence durationInFrames={64}>
      <BigWords />
    </Sequence>
    <Sequence from={60}>
      <Banners />
    </Sequence>
  </AbsoluteFill>
);
