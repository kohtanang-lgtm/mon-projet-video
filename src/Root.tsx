import React from 'react';
import { cancelRender, Composition, continueRender, delayRender } from 'remotion';
import { DUREE_TOTALE, FPS } from './histoire';
import { chargerPolices } from './polices';
import { AstuceTahwiil } from './Video';

const attentePolices = delayRender('Chargement des polices');
chargerPolices()
  .then(() => continueRender(attentePolices))
  .catch((err) => cancelRender(err));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="AstuceTahwiil-9x16"
      component={AstuceTahwiil}
      durationInFrames={DUREE_TOTALE}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{ filigrane: true }}
    />
    <Composition
      id="AstuceTahwiil-1x1"
      component={AstuceTahwiil}
      durationInFrames={DUREE_TOTALE}
      fps={FPS}
      width={1080}
      height={1080}
      defaultProps={{ filigrane: true }}
    />
  </>
);
