import React from 'react';
import { AbsoluteFill } from 'remotion';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { Filigrane } from './components/Filigrane';
import { INOUT } from './components/anim';
import { DUREE_TRANSITION, DUREES } from './histoire';
import { S1Accroche } from './scenes/S1Accroche';
import { S2Trajet } from './scenes/S2Trajet';
import { S3Verifier } from './scenes/S3Verifier';
import { S4Agent } from './scenes/S4Agent';
import { S5Justificatif } from './scenes/S5Justificatif';
import { S6Sourire } from './scenes/S6Sourire';
import { S7Fin } from './scenes/S7Fin';
import { C } from './theme';
import { balayageFleche } from './transitions/balayageFleche';

const SCENES: { cle: keyof typeof DUREES; Composant: React.FC }[] = [
  { cle: 'accroche', Composant: S1Accroche },
  { cle: 'trajet', Composant: S2Trajet },
  { cle: 'verifier', Composant: S3Verifier },
  { cle: 'agent', Composant: S4Agent },
  { cle: 'justificatif', Composant: S5Justificatif },
  { cle: 'sourire', Composant: S6Sourire },
  { cle: 'fin', Composant: S7Fin },
];

// « Astuce Tahwiil » : les 3 points à vérifier avant un transfert.
export const AstuceTahwiil: React.FC<{ filigrane: boolean }> = ({ filigrane }) => (
  <AbsoluteFill style={{ backgroundColor: C.orangeVif }}>
    <TransitionSeries>
      {SCENES.flatMap(({ cle, Composant }, i) => {
        const elements = [
          <TransitionSeries.Sequence key={cle} durationInFrames={DUREES[cle]} name={cle}>
            <Composant />
          </TransitionSeries.Sequence>,
        ];
        if (i < SCENES.length - 1) {
          elements.push(
            <TransitionSeries.Transition
              key={`${cle}-transition`}
              presentation={balayageFleche()}
              timing={linearTiming({ durationInFrames: DUREE_TRANSITION, easing: INOUT })}
            />,
          );
        }
        return elements;
      })}
    </TransitionSeries>
    {filigrane ? <Filigrane /> : null}
  </AbsoluteFill>
);
