import React from 'react';
import { Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { LOGO } from '../logoData';
import { C, F } from '../theme';
import { prog, ressort } from './anim';

type Props = {
  variante: 'blanc' | 'orange';
  largeur: number;
  debut?: number;
  slogan?: boolean;
  couleurSlogan?: string;
  statique?: boolean;
};

// Logo Tahwiil reconstruit pièce par pièce : les lettres tombent en place,
// la flèche bleue monte dans le W, l'arabe se dévoile de droite à gauche.
export const LogoAnime: React.FC<Props> = ({
  variante,
  largeur,
  debut = 0,
  slogan = true,
  couleurSlogan,
  statique = false,
}) => {
  const frameBrut = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = statique ? 10_000 : frameBrut - debut;
  const s = largeur / LOGO.largeur;
  const hauteurLogo = LOGO.hauteur * s;
  const tailleSlogan = largeur * 0.056;
  const couleur = couleurSlogan ?? (variante === 'blanc' ? C.blanc : C.bleu);

  const pFleche = ressort(f, fps, 13, { damping: 10, stiffness: 120, mass: 0.7 });
  const pArabe = prog(f, 17, 34, Easing.out(Easing.cubic));
  const pSlogan = prog(f, 24, 44, Easing.out(Easing.cubic));

  return (
    <div style={{ position: 'relative', width: largeur, height: hauteurLogo + (slogan ? tailleSlogan * 2.2 : 0) }}>
      {LOGO.lettres.map((l, i) => {
        const p = ressort(f, fps, i * 2.2, { damping: 12, stiffness: 170, mass: 0.6 });
        return (
          <Img
            key={i}
            src={staticFile(`brand/${variante}-l${i}.png`)}
            style={{
              position: 'absolute',
              left: l.x * s,
              top: l.y * s,
              width: l.w * s,
              height: l.h * s,
              opacity: Math.min(1, p * 1.6),
              transform: `translateY(${(1 - p) * hauteurLogo * 0.45}px) scale(${0.7 + 0.3 * p})`,
              transformOrigin: '50% 100%',
            }}
          />
        );
      })}
      <Img
        src={staticFile(`brand/${variante}-fleche.png`)}
        style={{
          position: 'absolute',
          left: LOGO.fleche.x * s,
          top: LOGO.fleche.y * s,
          width: LOGO.fleche.w * s,
          height: LOGO.fleche.h * s,
          opacity: interpolate(f, [13, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          transform: `translateY(${(1 - pFleche) * hauteurLogo * 1.1}px)`,
        }}
      />
      <Img
        src={staticFile(`brand/${variante}-arabe.png`)}
        style={{
          position: 'absolute',
          left: LOGO.arabe.x * s,
          top: LOGO.arabe.y * s,
          width: LOGO.arabe.w * s,
          height: LOGO.arabe.h * s,
          clipPath: `inset(-10% -2% -10% ${(1 - pArabe) * 102}%)`,
        }}
      />
      {slogan ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: hauteurLogo + tailleSlogan * 0.55,
            textAlign: 'center',
            fontFamily: F.marque,
            fontWeight: 600,
            fontSize: tailleSlogan,
            lineHeight: 1,
            color: couleur,
            whiteSpace: 'nowrap',
            letterSpacing: `${interpolate(pSlogan, [0, 1], [0.5, 0.24])}em`,
            paddingLeft: `${interpolate(pSlogan, [0, 1], [0.5, 0.24])}em`,
            opacity: pSlogan,
          }}
        >
          TRANSFERT D’ARGENT
        </div>
      ) : null}
    </div>
  );
};

// Logo d'en-tête fixe, centré en haut de l'écran.
export const Entete: React.FC<{ y: number; largeur: number; animer?: boolean; debut?: number }> = ({
  y,
  largeur,
  animer = false,
  debut = 0,
}) => (
  <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
    <LogoAnime variante="blanc" largeur={largeur} statique={!animer} debut={debut} />
  </div>
);
