import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Grain, Wipe} from './components/Fx';
import {DayScene} from './scenes/DayScene';
import {S10Outro} from './scenes/S10Outro';
import {S1Hook} from './scenes/S1Hook';
import {S2Imagine} from './scenes/S2Imagine';
import {S3Logo} from './scenes/S3Logo';
import {S4Theme} from './scenes/S4Theme';
import {S7Program} from './scenes/S7Program';
import {S8Date} from './scenes/S8Date';
import {S9Team} from './scenes/S9Team';
import {C, SCENES} from './theme';

type SceneKey = keyof typeof SCENES;

// Chaque scène est rendue une image de plus que sa durée : la bascule se fait sous un volet.
const Scene: React.FC<{k: SceneKey; children: React.ReactNode}> = ({k, children}) => (
  <Sequence from={SCENES[k].from} durationInFrames={SCENES[k].to - SCENES[k].from + 1} name={k}>
    {children}
  </Sequence>
);

export const Video: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => {
  return (
    <AbsoluteFill style={{background: C.blueNight}}>
      <Scene k="hook">
        <S1Hook />
      </Scene>
      <Scene k="imagine">
        <S2Imagine />
      </Scene>
      <Scene k="logo">
        <S3Logo />
      </Scene>
      <Scene k="theme">
        <S4Theme />
      </Scene>
      <Scene k="day1">
        <DayScene
          num={1}
          label="Vendredi 20 nov."
          pillar="EMPLOI"
          accent={C.cyan}
          left="Les aînés DRH"
          right="Les cadets diplômés"
          lead="pour parler"
          result={['CROISSANCE PROFESSIONNELLE']}
          resultV={['CROISSANCE', 'PROFESSIONNELLE']}
        />
      </Scene>
      <Scene k="day2">
        <DayScene
          num={2}
          label="Samedi 21 nov."
          pillar="CAPITAL"
          accent={C.red}
          left="Les DG de banque"
          right="Les jeunes entrepreneurs"
          lead="pour se dire les vérités sur"
          result={['LE FINANCEMENT DU BUSINESS']}
          resultV={['LE FINANCEMENT', 'DU BUSINESS']}
        />
      </Scene>
      <Scene k="program">
        <S7Program />
      </Scene>
      <Scene k="date">
        <S8Date />
      </Scene>
      <Scene k="team">
        <S9Team />
      </Scene>
      <Scene k="outro">
        <S10Outro />
      </Scene>

      {/* Volets de transition entre scènes */}
      <Sequence from={SCENES.logo.from - 20} durationInFrames={40} layout="none">
        <Wipe at={20} colors={[C.red, C.cyan, C.blue]} />
      </Sequence>
      <Sequence from={SCENES.theme.from - 20} durationInFrames={40} layout="none">
        <Wipe at={20} colors={[C.white, C.red, C.blueDeep]} dir={-1} />
      </Sequence>
      <Sequence from={SCENES.day1.from - 20} durationInFrames={40} layout="none">
        <Wipe at={20} colors={[C.red, C.white, C.cyan]} />
      </Sequence>
      <Sequence from={SCENES.day2.from - 20} durationInFrames={40} layout="none">
        <Wipe at={20} colors={[C.cyan, C.white, C.red]} dir={-1} />
      </Sequence>
      <Sequence from={SCENES.program.from - 20} durationInFrames={40} layout="none">
        <Wipe at={20} colors={[C.cyan, C.white, C.blueDeep]} />
      </Sequence>
      <Sequence from={SCENES.date.from - 20} durationInFrames={40} layout="none">
        <Wipe at={20} colors={[C.white, C.cyan, C.blue]} dir={-1} />
      </Sequence>
      <Sequence from={SCENES.team.from - 20} durationInFrames={40} layout="none">
        <Wipe at={20} colors={[C.red, C.cyan, C.blueDeep]} />
      </Sequence>
      <Sequence from={SCENES.outro.from - 20} durationInFrames={40} layout="none">
        <Wipe at={20} colors={[C.cyan, C.red, C.blue]} dir={-1} />
      </Sequence>

      <Grain />
      {withAudio ? <Audio src={staticFile('audio/bande-son.wav')} /> : null}
    </AbsoluteFill>
  );
};
