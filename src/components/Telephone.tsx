import React from 'react';
import { C, F } from '../theme';

export const ECRAN_MARGE = 17;

// Téléphone stylisé ; le bas se fond dans le décor pour laisser la place aux sous-titres.
export const Telephone: React.FC<{
  largeur: number;
  hauteur: number;
  heure?: string;
  barreClaire?: boolean;
  children: React.ReactNode;
  hors?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ largeur, hauteur, heure = '14:32', barreClaire = false, children, hors, style }) => (
  <div
    style={{
      position: 'absolute',
      width: largeur,
      height: hauteur,
      WebkitMaskImage: 'linear-gradient(to bottom, #000 84%, transparent 100%)',
      maskImage: 'linear-gradient(to bottom, #000 84%, transparent 100%)',
      ...style,
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: largeur * 0.13,
        background: 'linear-gradient(160deg, #2A2E36 0%, #0E1014 40%, #1C1F25 100%)',
        boxShadow: '0 40px 90px rgba(90, 20, 0, 0.38), inset 0 0 0 3px rgba(255,255,255,0.08)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: ECRAN_MARGE,
        borderRadius: largeur * 0.105,
        overflow: 'hidden',
        background: C.blanc,
      }}
    >
      {children}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 34,
          fontFamily: F.titre,
          fontWeight: 800,
          fontSize: 22,
          color: barreClaire ? C.blanc : C.encre,
        }}
      >
        {heure}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          width: largeur * 0.28,
          height: 34,
          marginLeft: -largeur * 0.14,
          borderRadius: 20,
          background: '#0B0C0F',
        }}
      />
      <div style={{ position: 'absolute', top: 24, right: 32, display: 'flex', gap: 5, alignItems: 'flex-end' }}>
        {[8, 12, 16, 20].map((h) => (
          <div key={h} style={{ width: 5, height: h * 0.8, borderRadius: 2, background: barreClaire ? C.blanc : C.encre }} />
        ))}
        <div
          style={{
            marginLeft: 6,
            width: 30,
            height: 15,
            borderRadius: 4,
            border: `2px solid ${barreClaire ? C.blanc : C.encre}`,
            padding: 2,
          }}
        >
          <div style={{ width: '75%', height: '100%', borderRadius: 2, background: barreClaire ? C.blanc : C.encre }} />
        </div>
      </div>
    </div>
    {hors}
  </div>
);
