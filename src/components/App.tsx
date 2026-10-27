import React from 'react';
import { ArrowLeft, CircleCheck, TriangleAlert } from 'lucide-react';
import { C, F } from '../theme';
import { LogoAnime } from './Logo';

// Éléments d'interface d'une appli de transfert, illustratifs (pas l'appli réelle de Tahwiil).

export const EnteteApp: React.FC<{ titre: string; hauteur?: number }> = ({ titre, hauteur = 176 }) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: hauteur,
      background: `linear-gradient(135deg, ${C.orangeVif} 0%, ${C.orange} 100%)`,
    }}
  >
    <div style={{ position: 'absolute', top: 72, left: 26 }}>
      <ArrowLeft size={32} color={C.blanc} strokeWidth={3} />
    </div>
    <div style={{ position: 'absolute', top: 76, right: 28 }}>
      <LogoAnime variante="blanc" largeur={128} slogan={false} statique />
    </div>
    <div
      style={{
        position: 'absolute',
        left: 28,
        top: 116,
        fontFamily: F.titre,
        fontWeight: 900,
        fontSize: 34,
        color: C.blanc,
      }}
    >
      {titre}
    </div>
  </div>
);

export type EtatChamp = 'normal' | 'erreur' | 'valide';

export const ChampApp: React.FC<{
  libelle: string;
  etat?: EtatChamp;
  children: React.ReactNode;
  avant?: React.ReactNode;
  style?: React.CSSProperties;
  decalageX?: number;
}> = ({ libelle, etat = 'normal', children, avant, style, decalageX = 0 }) => {
  const bordure = etat === 'erreur' ? C.rouge : etat === 'valide' ? C.vert : C.bordure;
  const fond = etat === 'erreur' ? '#FFF2F1' : etat === 'valide' ? '#EFFAF3' : C.blanc;
  return (
    <div style={{ ...style }}>
      <div
        style={{
          fontFamily: F.titre,
          fontWeight: 800,
          fontSize: 21,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: etat === 'erreur' ? C.rouge : C.gris,
          marginBottom: 10,
        }}
      >
        {libelle}
      </div>
      <div
        style={{
          height: 82,
          borderRadius: 22,
          border: `3px solid ${bordure}`,
          background: fond,
          padding: '0 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontFamily: F.titre,
          fontWeight: 800,
          fontSize: 31,
          color: C.encre,
          transform: `translateX(${decalageX}px)`,
          boxShadow: etat === 'normal' ? 'none' : `0 0 0 6px ${etat === 'erreur' ? 'rgba(224,53,43,0.12)' : 'rgba(24,169,87,0.12)'}`,
        }}
      >
        {avant}
        <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>{children}</div>
        {etat === 'valide' ? <CircleCheck size={36} color={C.vert} strokeWidth={2.8} /> : null}
        {etat === 'erreur' ? <TriangleAlert size={36} color={C.rouge} strokeWidth={2.8} /> : null}
      </div>
    </div>
  );
};

export const Avatar: React.FC<{ initiales: string; taille?: number; fond?: string }> = ({
  initiales,
  taille = 48,
  fond = C.bleu,
}) => (
  <div
    style={{
      width: taille,
      height: taille,
      borderRadius: taille / 2,
      background: fond,
      color: C.blanc,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: F.titre,
      fontWeight: 900,
      fontSize: taille * 0.42,
      flexShrink: 0,
    }}
  >
    {initiales}
  </div>
);

// Curseur de saisie clignotant.
export const Curseur: React.FC<{ frame: number; visible: boolean }> = ({ frame, visible }) =>
  visible ? (
    <span
      style={{
        display: 'inline-block',
        width: 3,
        height: 34,
        marginLeft: 3,
        verticalAlign: 'middle',
        background: C.bleu,
        opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
      }}
    />
  ) : null;

// Loupe (rappel de l'icône du carrousel).
export const Loupe: React.FC<{ taille?: number }> = ({ taille = 230 }) => (
  <svg width={taille} height={taille} viewBox="0 0 230 230">
    <defs>
      <filter id="ombre-loupe" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#3a1000" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#ombre-loupe)">
      <rect x={128} y={140} width={34} height={96} rx={17} transform="rotate(-45 145 188)" fill="#6C4AB6" />
      <rect x={128} y={140} width={34} height={26} rx={8} transform="rotate(-45 145 188)" fill="#4B3290" />
      <circle cx={92} cy={92} r={70} fill="rgba(210,235,255,0.28)" stroke={C.bleuNuit} strokeWidth={15} />
      <path d="M 52 70 A 48 48 0 0 1 84 44" stroke="rgba(255,255,255,0.85)" strokeWidth={9} strokeLinecap="round" fill="none" />
    </g>
  </svg>
);
