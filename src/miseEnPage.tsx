import React from 'react';
import { useVideoConfig } from 'remotion';

type Placement = { x: number; y: number; echelle: number };

export type MiseEnPage = {
  vertical: boolean;
  W: number;
  H: number;
  entete: { y: number; largeur: number };
  titre: Placement;
  illu: Placement;
  contenu: Placement;
  sousTitre: { y: number; taille: number; largeurMax: number };
};

// Deux formats : 9:16 (Reels, TikTok, statut WhatsApp) et 1:1 (fil Facebook / Instagram).
export const useMiseEnPage = (): MiseEnPage => {
  const { width, height } = useVideoConfig();
  const vertical = height > width * 1.3;
  if (vertical) {
    return {
      vertical,
      W: width,
      H: height,
      entete: { y: 92, largeur: 380 },
      titre: { x: 40, y: 285, echelle: 1 },
      illu: { x: 40, y: 735, echelle: 1 },
      contenu: { x: 40, y: 290, echelle: 1 },
      sousTitre: { y: 1622, taille: 44, largeurMax: 920 },
    };
  }
  return {
    vertical,
    W: width,
    H: height,
    entete: { y: 26, largeur: 230 },
    titre: { x: 230, y: 112, echelle: 0.62 },
    illu: { x: 240, y: 382, echelle: 0.6 },
    contenu: { x: 250, y: 126, echelle: 0.58 },
    sousTitre: { y: 954, taille: 32, largeurMax: 880 },
  };
};

// Zone de conception à taille fixe, placée et mise à l'échelle selon le format.
export const Zone: React.FC<{
  placement: Placement;
  l: number;
  h: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ placement, l, h, children, style }) => (
  <div
    style={{
      position: 'absolute',
      left: placement.x,
      top: placement.y,
      width: l,
      height: h,
      transform: `scale(${placement.echelle})`,
      transformOrigin: '0 0',
      ...style,
    }}
  >
    {children}
  </div>
);
