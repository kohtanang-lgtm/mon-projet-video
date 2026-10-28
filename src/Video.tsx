import React from 'react';
import { AbsoluteFill, Html5Audio, Sequence, staticFile } from 'remotion';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { Filigrane } from './components/Filigrane';
import { Son } from './components/Son';
import { SousTitres } from './components/SousTitre';
import { INOUT } from './components/anim';
import { SOUS_TITRES } from './histoire';
import { S1Accroche } from './scenes/S1Accroche';
import { S2Trajet } from './scenes/S2Trajet';
import { S3Verifier } from './scenes/S3Verifier';
import { S4Agent } from './scenes/S4Agent';
import { S5Justificatif } from './scenes/S5Justificatif';
import { S6Sourire } from './scenes/S6Sourire';
import { S7Fin } from './scenes/S7Fin';
import { C } from './theme';
import { balayageFleche } from './transitions/balayageFleche';
import { CleScene, DEBUT, DUREE_TOTALE, DUREES, FICHIER_VO, img, MASTER, ORDRE, PAROLE, R, transitionApres } from './voixOff';

const COMPOSANTS: Record<CleScene, React.FC> = {
  accroche: S1Accroche,
  trajet: S2Trajet,
  verifier: S3Verifier,
  agent: S4Agent,
  justificatif: S5Justificatif,
  sourire: S6Sourire,
  fin: S7Fin,
};

// --- Mixage de la musique : elle s'efface sous la voix et se coupe net sur « JAMAIS ».
const MUSIQUE_PAUSE = 0.65 * MASTER; // niveau entre les phrases
const MUSIQUE_VOIX = 0.38 * MASTER; // niveau sous la voix (environ 11 LU sous la voix)
const COUPURE = [img(R.jamais) - 2, img(R.unCodePin) - 4] as const;

const activiteVoix = new Float32Array(DUREE_TOTALE + 1);
for (const [a, b] of PAROLE) {
  for (let f = Math.max(0, a - 5); f <= Math.min(DUREE_TOTALE, b + 14); f++) {
    const montee = f < a ? (f - (a - 5)) / 5 : 1;
    const descente = f > b + 4 ? 1 - (f - (b + 4)) / 10 : 1;
    activiteVoix[f] = Math.max(activiteVoix[f], Math.min(montee, descente));
  }
}

const volumeMusique = (f: number) => {
  const act = activiteVoix[Math.min(DUREE_TOTALE, Math.max(0, f))];
  let v = MUSIQUE_PAUSE + (MUSIQUE_VOIX - MUSIQUE_PAUSE) * act;
  const [c0, c1] = COUPURE;
  if (f >= c0 - 2 && f <= c1 + 3) {
    const entree = Math.min(1, Math.max(0, (f - (c0 - 2)) / 2));
    const sortie = Math.min(1, Math.max(0, (c1 + 3 - f) / 3));
    v *= 1 - Math.min(entree, sortie);
  }
  return v;
};

// « Astuce Tahwiil » : les 3 points à vérifier avant un transfert, calés sur la voix off.
export const AstuceTahwiil: React.FC<{ filigrane: boolean }> = ({ filigrane }) => (
  <AbsoluteFill style={{ backgroundColor: C.orangeVif }}>
    <TransitionSeries>
      {ORDRE.flatMap((cle, i) => {
        const Composant = COMPOSANTS[cle];
        const elements = [
          <TransitionSeries.Sequence key={cle} durationInFrames={DUREES[cle]} name={cle}>
            <Composant />
          </TransitionSeries.Sequence>,
        ];
        if (i < ORDRE.length - 1) {
          const timing = linearTiming({ durationInFrames: transitionApres(cle), easing: INOUT });
          elements.push(
            cle === 'sourire' ? (
              <TransitionSeries.Transition key={`${cle}-transition`} presentation={fade()} timing={timing} />
            ) : (
              <TransitionSeries.Transition key={`${cle}-transition`} presentation={balayageFleche()} timing={timing} />
            ),
          );
        }
        return elements;
      })}
    </TransitionSeries>
    <SousTitres items={SOUS_TITRES} />
    {filigrane ? <Filigrane /> : null}

    {/* Bande-son */}
    <Html5Audio src={staticFile('audio/musique.wav')} volume={volumeMusique} />
    <Sequence from={img(0)} layout="none" name="voix off">
      <Html5Audio src={staticFile(FICHIER_VO)} volume={MASTER} />
    </Sequence>
    {ORDRE.slice(1, -1).map((cle) => (
      <Son key={`souffle-${cle}`} a={DEBUT[cle]} nom="souffle" volume={0.42} />
    ))}
  </AbsoluteFill>
);
