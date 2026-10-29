import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {prog, sp} from '../anim';
import {Background} from '../components/Background';
import {MaskUp} from '../components/Fx';
import {StaggerText} from '../components/Text';
import {CONSORTIUM, HOST, Partner, TECH_PARTNER} from '../partners';
import {C, EASE_OUT, F} from '../theme';

const Card: React.FC<{p: Partner; delay: number; w: number; h: number; tech?: boolean}> = ({p, delay, w, h, tech}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = sp(frame, fps, delay, {damping: 13, stiffness: 150});
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 22,
        background: C.white,
        border: tech ? `5px solid ${C.cyan}` : undefined,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 24px',
        boxShadow: '0 20px 50px rgba(0,8,40,0.35)',
        transform: `translateY(${(1 - s) * 60}px) scale(${0.7 + 0.3 * s})`,
        opacity: Math.min(1, s * 1.5),
      }}
    >
      {tech ? (
        <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 17, letterSpacing: '0.22em', color: C.cyan, marginBottom: 8}}>ASSISTANCE TECHNIQUE</div>
      ) : null}
      {p.logo ? (
        <Img src={staticFile(p.logo)} style={{maxWidth: '86%', maxHeight: tech ? '62%' : '80%', objectFit: 'contain'}} />
      ) : (
        <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: w > 400 ? 34 : 30, lineHeight: 1.15, color: C.navy, textAlign: 'center'}}>{p.name}</div>
      )}
    </div>
  );
};

/** Scène 9 — Le porteur du projet et le consortium. */
export const S9Team: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const V = height > width;
  const fs = V ? 210 : 220;
  const m = sp(frame, fps, 64, {damping: 18, stiffness: 110});
  const lift = m * (V ? 480 : 290);
  const scale = 1 - 0.42 * m;
  const bar = prog(frame, 24, 18, EASE_OUT);
  const nameW = 4.414 * fs;

  const cols = V ? 2 : 3;
  const cw = V ? 460 : 360;
  const ch = V ? 150 : 150;
  const gap = V ? 24 : 26;
  const all = [...CONSORTIUM.map((p) => ({p, tech: false})), {p: TECH_PARTNER, tech: true}];
  const gridTop = V ? height / 2 + 30 : height / 2 - 20;

  return (
    <AbsoluteFill>
      <Background variant="blue" seed="team" pulseAt={[0]} />
      {/* Porteur */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${-lift}px) scale(${scale})`}}>
          <MaskUp delay={0} dur={14}>
            <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: V ? 40 : 38, letterSpacing: '0.42em', color: C.cyanLight, paddingLeft: '0.42em', textTransform: 'uppercase'}}>
              {HOST.intro}
            </div>
          </MaskUp>
          <div style={{height: 22}} />
          <MaskUp delay={6} dur={16}>
            <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: V ? 66 : 64, color: C.white}}>{HOST.firstNames}</div>
          </MaskUp>
          <StaggerText text={HOST.lastName} delay={10} stagger={2} style={{fontFamily: F.display, fontSize: fs, color: C.white, textShadow: '0 30px 70px rgba(0,8,40,0.4)'}} />
          <div style={{width: nameW, height: 16, marginTop: 10, background: C.red, borderRadius: 8, transform: `scaleX(${bar})`, transformOrigin: '0% 50%'}} />
        </div>
      </AbsoluteFill>

      {/* Consortium */}
      <div style={{position: 'absolute', left: 0, right: 0, top: gridTop - (V ? 110 : 86), display: 'flex', justifyContent: 'center'}}>
        <MaskUp delay={76} dur={14}>
          <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: V ? 38 : 34, letterSpacing: '0.42em', color: C.cyanLight, paddingLeft: '0.42em'}}>ET LE CONSORTIUM</div>
        </MaskUp>
      </div>
      <div
        style={{
          position: 'absolute',
          left: (width - (cols * cw + (cols - 1) * gap)) / 2,
          top: gridTop,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cw}px)`,
          gap,
        }}
      >
        {all.map(({p, tech}, i) => (
          <Card key={p.name} p={p} tech={tech} delay={82 + i * 4 + (tech ? 6 : 0)} w={cw} h={ch} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
