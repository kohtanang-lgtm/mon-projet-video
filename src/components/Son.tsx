import React from 'react';
import { Html5Audio, Sequence, staticFile } from 'remotion';
import { MASTER } from '../voixOff';

// Bruitage ponctuel, déclenché à l'image `a` (locale à la scène) ; fichiers générés par scripts/bande-son.py.
export const Son: React.FC<{ a: number; nom: string; volume?: number }> = ({ a, nom, volume = 0.5 }) =>
  a < 0 ? null : (
    <Sequence from={Math.round(a)} durationInFrames={150} layout="none" name={`son ${nom}`}>
      <Html5Audio src={staticFile(`audio/sfx/${nom}.wav`)} volume={volume * MASTER} />
    </Sequence>
  );
