import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';
import { C } from '../theme';
import { DEMI_LARGEUR, ENCOCHE } from '../components/fleche';

type Props = Record<string, never>;

// Transition signature : une immense flèche Tahwiil traverse l'écran de bas en haut,
// et la scène suivante apparaît dans son encoche.
const BalayageFleche: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const { width: W, height: H } = useVideoConfig();
  if (presentationDirection === 'exiting') {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }
  const L = Math.max(H, W) * 1.05; // hauteur de la flèche
  const demi = Math.max(L * DEMI_LARGEUR * 1.6, W * 0.75);
  const N = L * (1 - ENCOCHE);
  const avance = L * 0.1; // la flèche claire précède la flèche bleue
  const parcours = H + L + avance + 40;
  const pointe = H + avance - presentationProgress * parcours;

  const fleche = (yPointe: number) => {
    const yCoins = yPointe + L;
    const yEncoche = yCoins - N;
    return {
      d: `M ${W / 2} ${yPointe} L ${W / 2 + demi} ${yCoins} L ${W / 2} ${yEncoche} L ${W / 2 - demi} ${yCoins} Z`,
      yCoins,
      yEncoche,
    };
  };
  const principale = fleche(pointe);
  const claire = fleche(pointe - avance);
  const clip = `polygon(${W / 2 - demi}px ${principale.yCoins}px, ${W / 2}px ${principale.yEncoche}px, ${W / 2 + demi}px ${principale.yCoins}px, ${W / 2 + demi}px ${H + 4000}px, ${W / 2 - demi}px ${H + 4000}px)`;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: clip }}>{children}</AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <path d={claire.d} fill={C.bleuClair} />
        <path d={principale.d} fill={C.bleu} />
      </svg>
    </AbsoluteFill>
  );
};

export const balayageFleche = (): TransitionPresentation<Props> => ({
  component: BalayageFleche,
  props: {},
});
