import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { C } from '../theme';
import { Motif } from './Motif';

// Fond orange dégradé façon carrousel Tahwiil, avec motif de flèches et grain léger.
export const Fond: React.FC<{ motif?: boolean; children?: React.ReactNode }> = ({ motif = true, children }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 75% at 40% 46%, ${C.jaune} 0%, ${C.orange} 34%, ${C.orangeVif} 60%, ${C.orangeBrule} 86%, ${C.orangeProfond} 112%)`,
      overflow: 'hidden',
    }}
  >
    {motif ? <Motif /> : null}
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('textures/grain.png')})`,
        backgroundSize: '420px 420px',
        mixBlendMode: 'overlay',
        opacity: 0.16,
      }}
    />
    <AbsoluteFill
      style={{ background: 'radial-gradient(140% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(90,20,0,0.28) 100%)' }}
    />
    {children}
  </AbsoluteFill>
);

// Fond « marque » : motif orangé du visuel de profil Tahwiil (scène de fin).
export const FondMarque: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: C.motif, overflow: 'hidden' }}>
    <Motif variante="marque" taille={360} vitesse={0.6} />
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('textures/grain.png')})`,
        backgroundSize: '420px 420px',
        mixBlendMode: 'overlay',
        opacity: 0.12,
      }}
    />
    <AbsoluteFill
      style={{ background: 'radial-gradient(130% 90% at 50% 40%, rgba(0,0,0,0) 50%, rgba(90,25,0,0.30) 100%)' }}
    />
    {children}
  </AbsoluteFill>
);
