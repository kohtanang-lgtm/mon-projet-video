import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {prog, shake, sp} from '../anim';
import {Background} from '../components/Background';
import {Flash, MaskUp, Shockwave} from '../components/Fx';
import {CalendarIcon, PinIcon, ScriptThree} from '../components/Graphics';
import {LOGO_RATIO, Logo} from '../components/Logo';
import {StaggerText} from '../components/Text';
import {C, EASE_IN_OUT, EASE_OUT, F} from '../theme';
import {Banners} from './S4Theme';

const InfoPill: React.FC<{icon: React.ReactNode; text: string; delay: number; fs: number}> = ({icon, text, delay, fs}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = sp(frame, fps, delay, {damping: 14, stiffness: 150});
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: fs * 0.45,
        background: C.white,
        borderRadius: 999,
        padding: `${fs * 0.32}px ${fs * 0.9}px ${fs * 0.32}px ${fs * 0.5}px`,
        boxShadow: '0 18px 44px rgba(0,8,40,0.35)',
        transform: `translateY(${(1 - s) * 50}px) scale(${0.8 + 0.2 * s})`,
        opacity: Math.min(1, s * 1.6),
      }}
    >
      {icon}
      <div style={{fontFamily: F.sans, fontWeight: 900, fontSize: fs, color: C.navy, whiteSpace: 'nowrap', letterSpacing: '0.01em'}}>{text}</div>
    </div>
  );
};

/** Scène 10 — Carton final. */
export const S10Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const V = height > width;

  const logoW = V ? 860 : 740;
  const confFs = V ? 78 : 62;
  const pillFs = V ? 46 : 46;
  const sh = shake(frame, [0, 12], V ? 12 : 16, 12);
  const divider = prog(frame, 14, 22, EASE_IN_OUT);
  const zoom = 1.04 - 0.04 * prog(frame, 0, 60, EASE_OUT);

  const logoBlock = (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{width: logoW, height: logoW * LOGO_RATIO, filter: 'drop-shadow(0 30px 50px rgba(0,8,40,0.4))'}}>
        <Logo width={logoW} mode="pop" begouDelay={12} sheen={prog(frame, 80, 28, (t) => t)} />
      </div>
      <div style={{display: 'flex', alignItems: 'flex-start', marginTop: confFs * 0.5}}>
        <StaggerText text="CONFÉRENCE" delay={16} stagger={1.4} style={{fontFamily: F.sans, fontWeight: 900, fontSize: confFs, color: C.white, letterSpacing: '0.04em'}} />
        <div style={{marginLeft: -confFs * 0.18, marginTop: -confFs * 0.42}}>
          <ScriptThree height={confFs * 1.55} delay={28} dur={18} />
        </div>
      </div>
    </div>
  );

  const infoBlock = (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <Sequence from={22} layout="none">
        <Banners fs={V ? 56 : 58} bw={V ? 800 : 780} showLabel={false} float={false} inline />
      </Sequence>
      <div style={{height: V ? 60 : 44}} />
      <div style={{display: 'flex', flexDirection: V ? 'column' : 'column', alignItems: 'center', gap: V ? 22 : 18}}>
        <InfoPill icon={<CalendarIcon size={pillFs * 1.3} delay={46} />} text="20 & 21 NOV. 2026" delay={42} fs={pillFs} />
        <InfoPill icon={<PinIcon size={pillFs * 1.3} delay={52} />} text="RADISSON BLU" delay={48} fs={pillFs} />
      </div>
    </div>
  );

  return (
    <AbsoluteFill>
      <Background variant="blue" seed="outro" pulseAt={[0, 12]} />
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(${zoom})`}}>
        {V ? (
          <AbsoluteFill style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 70}}>
            {logoBlock}
            {infoBlock}
          </AbsoluteFill>
        ) : (
          <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0, paddingBottom: 70}}>
            <div style={{width: 860, display: 'flex', justifyContent: 'center'}}>{logoBlock}</div>
            <div style={{width: 4, height: 560, background: 'rgba(255,255,255,0.28)', borderRadius: 2, transform: `scaleY(${divider})`, margin: '0 40px'}} />
            <div style={{width: 860, display: 'flex', justifyContent: 'center'}}>{infoBlock}</div>
          </AbsoluteFill>
        )}
        {/* Hashtag */}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: V ? 150 : 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
          <StaggerText text="#REUSSIRBEGOU" delay={60} stagger={1.2} style={{fontFamily: F.display, fontSize: V ? 76 : 56, color: C.cyanLight, letterSpacing: '0.06em'}} />
          <MaskUp delay={72} dur={14}>
            <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: V ? 34 : 26, letterSpacing: '0.4em', color: C.white, opacity: 0.85, paddingLeft: '0.4em'}}>
              RESTEZ CONNECTÉS
            </div>
          </MaskUp>
        </div>
        <Shockwave at={12} x={V ? width / 2 + logoW * 0.27 : width / 2 - 450 + logoW * 0.27} y={V ? height * 0.27 : height / 2 - 120} maxR={Math.max(width, height) * 0.6} />
      </AbsoluteFill>
      <Flash at={0} strength={0.3} len={7} />
    </AbsoluteFill>
  );
};
