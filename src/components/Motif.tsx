import React, { useId } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';
import { cheminFleche } from './fleche';

// Motif de flèches montantes / descendantes repris du fond de marque Tahwiil.
// variante « discret » : flèches blanches très légères sur le dégradé orange.
// variante « marque » : tons orangés comme sur leur visuel de profil.
export const Motif: React.FC<{
  variante?: 'discret' | 'marque';
  taille?: number;
  vitesse?: number;
  opacite?: number;
}> = ({ variante = 'discret', taille = 300, vitesse = 0.5, opacite = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const id = useId().replace(/:/g, '');
  const tw = taille;
  const th = taille * 0.92;
  const h = taille * 0.42;
  const decalage = -((frame * vitesse) % th);
  const clair = variante === 'marque' ? C.motifClair : 'rgba(255,255,255,0.05)';
  const sombre = variante === 'marque' ? C.motifSombre : 'rgba(120,30,0,0.045)';
  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', inset: 0, opacity: opacite }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <pattern
          id={`motif-${id}`}
          width={tw}
          height={th}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(0 ${decalage})`}
        >
          <path d={cheminFleche(tw * 0.25, th * 0.25, h)} fill={clair} strokeLinejoin="round" stroke={clair} strokeWidth={h * 0.08} />
          <path
            d={cheminFleche(tw * 0.75, th * 0.25, h)}
            fill={sombre}
            stroke={sombre}
            strokeWidth={h * 0.08}
            strokeLinejoin="round"
            transform={`rotate(180 ${tw * 0.75} ${th * 0.25})`}
          />
          <path
            d={cheminFleche(tw * 0.25, th * 0.75, h)}
            fill={sombre}
            stroke={sombre}
            strokeWidth={h * 0.08}
            strokeLinejoin="round"
            transform={`rotate(180 ${tw * 0.25} ${th * 0.75})`}
          />
          <path d={cheminFleche(tw * 0.75, th * 0.75, h)} fill={clair} stroke={clair} strokeWidth={h * 0.08} strokeLinejoin="round" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#motif-${id})`} />
    </svg>
  );
};
