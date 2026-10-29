import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {prog, shake, sp} from '../anim';
import {Background} from '../components/Background';
import {Flash, MaskUp, Shockwave} from '../components/Fx';
import {ScriptThree} from '../components/Graphics';
import {LOGO_RATIO, Logo} from '../components/Logo';
import {StaggerText} from '../components/Text';
import {C, EASE_IN, F, TILT} from '../theme';

/**
 * Scène 3 — Révélation du logo REUSS!R BÉ-GOU, puis « CONFÉRENCE 3 ».
 * Les lettres tombent une à une ; le « ! » rouge arrive en dernier avec un impact.
 */
export const S3Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const V = height > width;

  const logoW = V ? 900 : 1000;
  const logoH = logoW * LOGO_RATIO;
  const EXCL_HIT = 28 + 9; // le « ! » touche le sol
  const sh = shake(frame, [EXCL_HIT], V ? 14 : 18, 14);

  // Le logo prend son inclinaison signature après l'impact.
  const tiltS = sp(frame, fps, EXCL_HIT + 6, {damping: 12, stiffness: 120});
  const tilt = TILT * tiltS;
  const push = 1 + frame * 0.0006;

  // Sortie : le logo s'éloigne vers le haut.
  const out = prog(frame, 166, 14, EASE_IN);

  const confFs = V ? 92 : 92;

  return (
    <AbsoluteFill>
      <Background variant="blue" seed="logo" pulseAt={[EXCL_HIT]} />
      <AbsoluteFill
        style={{
          transform: `translate(${sh.x}px, ${sh.y}px) scale(${push * (1 - out * 0.15)}) translateY(${-out * 120}px)`,
          opacity: 1 - out,
        }}
      >
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          {/* Le bloc complet (logo + CONFÉRENCE 3) prend l'inclinaison de la marque */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `rotate(${tilt}deg)`}}>
            <div style={{width: logoW, height: logoH, filter: 'drop-shadow(0 30px 50px rgba(0,8,40,0.4))'}}>
              <Logo width={logoW} mode="drop" begouDelay={44} sheen={prog(frame, 92, 26, (t) => t)} />
            </div>
            <div style={{display: 'flex', alignItems: 'flex-start', marginTop: confFs * 0.55}}>
              <StaggerText
                text="CONFÉRENCE"
                delay={62}
                stagger={1.6}
                style={{fontFamily: F.sans, fontWeight: 900, fontSize: confFs, color: C.white, letterSpacing: '0.04em'}}
              />
              <div style={{marginLeft: -confFs * 0.18, marginTop: -confFs * 0.42}}>
                <ScriptThree height={confFs * 1.55} delay={78} dur={20} />
              </div>
            </div>
            <div style={{marginTop: confFs * 0.3}}>
              <MaskUp delay={92} dur={14}>
                <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 34, letterSpacing: '0.42em', color: C.cyanLight, paddingLeft: '0.42em'}}>
                  3ᵉ ÉDITION
                </div>
              </MaskUp>
            </div>
          </div>
        </AbsoluteFill>
        <Shockwave at={EXCL_HIT} x={width / 2 + logoW * 0.27} y={height / 2 - (confFs * 1.1 + 20)} maxR={Math.max(width, height) * 0.7} />
      </AbsoluteFill>
      <Flash at={0} strength={0.25} len={6} />
      <Flash at={EXCL_HIT} strength={0.3} len={7} />
    </AbsoluteFill>
  );
};
