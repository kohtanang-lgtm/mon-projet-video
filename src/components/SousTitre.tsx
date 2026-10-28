import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { MorceauSousTitre } from '../histoire';
import { useMiseEnPage } from '../miseEnPage';
import { C, F } from '../theme';
import { DECALAGE_VO } from '../voixOff';
import { ressort } from './anim';

// Estimation du nombre de syllabes d'un mot français (pour répartir le temps de parole).
const syllabes = (mot: string) => {
  const m = mot.toLowerCase().replace(/[^a-zàâäéèêëîïôöùûüœæç0-9]/g, '');
  if (!m) return 0;
  if (/^\d+$/.test(m)) return m.length;
  let g = (m.match(/[aeiouyàâäéèêëîïôöùûüœæ]+/g) ?? []).length;
  if (g > 1 && /(e|es)$/.test(m)) g -= 1;
  return Math.max(1, g);
};

type Mot = { mot: string; t: number };

// Découpe les morceaux en mots et attribue à chaque mot son instant de prononciation.
const motsDates = (morceaux: readonly MorceauSousTitre[]): Mot[] =>
  morceaux.flatMap((m) => {
    const mots = m.texte.split(' ');
    const poids = mots.map((w) => Math.max(0.4, syllabes(w)));
    const total = poids.reduce((a, b) => a + b, 0);
    let cumul = 0;
    return mots.map((w, i) => {
      const t = m.de + ((m.a - m.de) * cumul) / total;
      cumul += poids[i];
      return { mot: w, t };
    });
  });

// Sous-titres incrustés, synchronisés sur la voix off : le mot prononcé s'allume en jaune.
export const SousTitres: React.FC<{ items: readonly (readonly MorceauSousTitre[])[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mp = useMiseEnPage();
  const t = frame / fps - DECALAGE_VO; // horloge de la voix

  const fenetres = items.map((morceaux, i) => {
    const de = morceaux[0].de - 0.15;
    const finParole = morceaux[morceaux.length - 1].a;
    const suivant = items[i + 1]?.[0].de;
    const a = Math.min(finParole + 0.5, suivant !== undefined ? suivant - 0.18 : Infinity);
    return { morceaux, de, a };
  });
  const actif = fenetres.find((f) => t >= f.de && t < f.a);
  if (!actif) return null;

  const debutImg = (actif.de + DECALAGE_VO) * fps;
  const finImg = (actif.a + DECALAGE_VO) * fps;
  const p = ressort(frame, fps, debutImg, { damping: 200, stiffness: 170 }, 10);
  const sortie = interpolate(frame, [finImg - 5, finImg], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const mots = motsDates(actif.morceaux);
  const courant = mots.reduce((acc, m, i) => (t >= m.t - 0.04 ? i : acc), -1);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: mp.sousTitre.y,
        display: 'flex',
        justifyContent: 'center',
        transform: `translateY(-50%) translateY(${(1 - p) * 22}px) scale(${0.96 + 0.04 * p})`,
        opacity: p * sortie,
      }}
    >
      <div
        style={{
          maxWidth: mp.sousTitre.largeurMax,
          padding: `${mp.sousTitre.taille * 0.38}px ${mp.sousTitre.taille * 0.75}px`,
          borderRadius: mp.sousTitre.taille * 0.6,
          background: 'rgba(11, 37, 64, 0.84)',
          boxShadow: '0 12px 34px rgba(60, 15, 0, 0.25)',
          fontFamily: F.titre,
          fontWeight: 800,
          fontSize: mp.sousTitre.taille,
          lineHeight: 1.25,
          textAlign: 'center',
        }}
      >
        {mots.map((m, i) => {
          const dit = i <= courant;
          const pm = ressort(frame, fps, (m.t + DECALAGE_VO) * fps - 1, { damping: 18, stiffness: 260, mass: 0.5 }, 8);
          const enCours = i === courant;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: i < mots.length - 1 ? '0.26em' : 0,
                color: enCours ? C.jaune : C.blanc,
                opacity: dit ? 1 : 0.38,
                transform: `scale(${enCours ? 1 + 0.06 * Math.sin(Math.min(1, pm) * Math.PI) : 1})`,
              }}
            >
              {m.mot}
            </span>
          );
        })}
      </div>
    </div>
  );
};
