import React from 'react';
import { useMiseEnPage } from '../miseEnPage';
import { F } from '../theme';

// Mention discrète : maquette de démonstration, pas une publication officielle de Tahwiil.
export const Filigrane: React.FC = () => {
  const mp = useMiseEnPage();
  return (
    <div
      style={{
        position: 'absolute',
        top: mp.vertical ? 30 : 12,
        right: mp.vertical ? 34 : 16,
        fontFamily: F.marque,
        fontWeight: 600,
        fontSize: mp.vertical ? 19 : 13,
        letterSpacing: '0.12em',
        color: 'rgba(255,255,255,0.62)',
        textShadow: '0 1px 4px rgba(0,0,0,0.25)',
      }}
    >
      PROPOSITION CRÉATIVE · NON OFFICIELLE
    </div>
  );
};
