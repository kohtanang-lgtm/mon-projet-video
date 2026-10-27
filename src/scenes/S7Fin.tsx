import React from 'react';
import { MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { FondMarque } from '../components/Fond';
import { LogoAnime } from '../components/Logo';
import { ressort } from '../components/anim';
import { CONTACTS, ENTREE } from '../histoire';
import { useMiseEnPage } from '../miseEnPage';
import { C, F } from '../theme';

const T = {
  cercle: ENTREE,
  logo: ENTREE + 6,
  pastilles: ENTREE + 42,
  carte: ENTREE + 64,
  boutiques: ENTREE + 74,
  contacts: ENTREE + 86,
  question: ENTREE + 102,
  mention: ENTREE + 114,
};

const PROMESSES = [
  { fr: 'SIMPLE', ar: 'سهل' },
  { fr: 'RAPIDE', ar: 'سريع' },
  { fr: 'SÉCURISÉ', ar: 'آمن' },
];

// Place un bloc dessiné à taille fixe : centré horizontalement, à une hauteur et une échelle données.
const Bloc: React.FC<{ y: number; echelle: number; largeur: number; children: React.ReactNode }> = ({
  y,
  echelle,
  largeur,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      top: y,
      left: '50%',
      width: largeur,
      marginLeft: -largeur / 2,
      transform: `scale(${echelle})`,
      transformOrigin: '50% 0',
    }}
  >
    {children}
  </div>
);

const Boutique: React.FC<{ petit: string; grand: string; p: number }> = ({ petit, grand, p }) => (
  <div
    style={{
      width: 360,
      height: 104,
      borderRadius: 22,
      background: '#111318',
      color: C.blanc,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingLeft: 34,
      fontFamily: F.titre,
      transform: `scale(${p})`,
      opacity: Math.min(1, p * 2),
    }}
  >
    <div style={{ fontWeight: 700, fontSize: 21, opacity: 0.85 }}>{petit}</div>
    <div style={{ fontWeight: 900, fontSize: 38, lineHeight: 1 }}>{grand}</div>
  </div>
);

export const S7Fin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mp = useMiseEnPage();
  const v = mp.vertical;

  const cfg = v
    ? { cx: 540, cy: 560, r: 370, logo: 560, pastilles: 990, carte: 1150, question: 1622, mention: 1782, e: 1 }
    : { cx: 540, cy: 248, r: 205, logo: 312, pastilles: 470, carte: 578, question: 916, mention: 1034, e: 0.71 };

  const pCercle = ressort(frame, fps, T.cercle, { damping: 12, stiffness: 100 });
  const pCarte = ressort(frame, fps, T.carte, { damping: 15, stiffness: 110 });
  const pQuestion = ressort(frame, fps, T.question, { damping: 12, stiffness: 130 });
  const pMention = ressort(frame, fps, T.mention, { damping: 200 }, 16);
  const hauteurLogo = cfg.logo * (291 / 1180) + cfg.logo * 0.056 * 2.2;

  return (
    <AbsoluteFill>
      <FondMarque />
      {/* Cercle blanc et logo, comme le visuel de profil Tahwiil */}
      <div
        style={{
          position: 'absolute',
          left: cfg.cx - cfg.r,
          top: cfg.cy - cfg.r,
          width: cfg.r * 2,
          height: cfg.r * 2,
          borderRadius: '50%',
          background: C.blanc,
          boxShadow: '0 30px 70px rgba(90, 25, 0, 0.35)',
          transform: `scale(${pCercle})`,
        }}
      />
      <div style={{ position: 'absolute', left: cfg.cx - cfg.logo / 2, top: cfg.cy - hauteurLogo / 2 }}>
        <LogoAnime variante="orange" largeur={cfg.logo} debut={T.logo} couleurSlogan={C.bleu} />
      </div>

      {/* Promesses FR / AR, chaque paire correctement alignée */}
      <Bloc y={cfg.pastilles} echelle={cfg.e} largeur={930}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 26 }}>
          {PROMESSES.map((pr, i) => {
            const p = ressort(frame, fps, T.pastilles + i * 6, { damping: 10, stiffness: 160 });
            return (
              <div
                key={pr.fr}
                style={{
                  width: 290,
                  height: 128,
                  borderRadius: 64,
                  background: C.blanc,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 14px 30px rgba(90, 25, 0, 0.28)',
                  transform: `translateY(${(1 - p) * 60}px) scale(${p})`,
                  opacity: Math.min(1, p * 2),
                }}
              >
                <div style={{ fontFamily: F.titre, fontWeight: 900, fontSize: 40, lineHeight: 1, color: C.orangeVif }}>{pr.fr}</div>
                <div style={{ fontFamily: F.arabe, fontWeight: 700, fontSize: 36, lineHeight: 1.15, color: C.bleu, direction: 'rtl' }}>
                  {pr.ar}
                </div>
              </div>
            );
          })}
        </div>
      </Bloc>

      {/* Carte : appli + contacts */}
      <Bloc y={cfg.carte} echelle={cfg.e} largeur={920}>
        <div
          style={{
            borderRadius: 44,
            background: C.blanc,
            padding: '32px 36px 30px',
            boxShadow: '0 24px 60px rgba(90, 25, 0, 0.32)',
            transform: `translateY(${(1 - pCarte) * 160}px)`,
            opacity: Math.min(1, pCarte * 2),
            fontFamily: F.titre,
          }}
        >
          <div style={{ textAlign: 'center', fontWeight: 900, fontSize: 40, color: C.encre }}>Téléchargez l’application</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 22 }}>
            <Boutique petit="Télécharger dans l’" grand="App Store" p={ressort(frame, fps, T.boutiques, { damping: 11, stiffness: 160 })} />
            <Boutique petit="Disponible sur" grand="Google Play" p={ressort(frame, fps, T.boutiques + 6, { damping: 11, stiffness: 160 })} />
          </div>
          <div style={{ height: 2, background: C.bordure, margin: '28px 0 24px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {[
              { Icone: MessageCircle, fond: C.vertWhatsapp, numero: CONTACTS.whatsapp, legende: 'WhatsApp' },
              { Icone: Phone, fond: C.bleu, numero: CONTACTS.telephone, legende: 'Téléphone' },
            ].map((c, i) => {
              const p = ressort(frame, fps, T.contacts + i * 6, { damping: 200 }, 16);
              const { Icone } = c;
              return (
                <div
                  key={c.numero}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}
                >
                  <div
                    style={{
                      width: 66,
                      height: 66,
                      borderRadius: 33,
                      background: c.fond,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icone size={36} color={C.blanc} strokeWidth={2.6} />
                  </div>
                  <div style={{ lineHeight: 1.05 }}>
                    <div style={{ fontWeight: 700, fontSize: 21, color: C.gris }}>{c.legende}</div>
                    <div style={{ fontWeight: 900, fontSize: 34, color: C.encre }}>{c.numero}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
            <div
              style={{
                padding: '8px 26px',
                borderRadius: 30,
                background: C.orangeVif,
                color: C.blanc,
                fontWeight: 900,
                fontSize: 26,
                opacity: ressort(frame, fps, T.contacts + 14, { damping: 200 }, 14),
              }}
            >
              {CONTACTS.disponibilite}
            </div>
          </div>
        </div>
      </Bloc>

      {/* Appel à commenter, repris de leur publication */}
      <Bloc y={cfg.question} echelle={cfg.e} largeur={920}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: '22px 32px',
            borderRadius: 40,
            background: C.bleu,
            color: C.blanc,
            fontFamily: F.titre,
            boxShadow: '0 18px 40px rgba(0, 40, 80, 0.35)',
            transform: `scale(${pQuestion})`,
            opacity: Math.min(1, pQuestion * 2),
          }}
        >
          <MessageCircle size={56} color={C.blanc} strokeWidth={2.6} style={{ flexShrink: 0 }} />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 900, fontSize: 34 }}>Lequel oubliez-vous le plus souvent ?</div>
            <div style={{ fontWeight: 700, fontSize: 29, opacity: 0.95 }}>Répondez 1, 2 ou 3 en commentaire.</div>
          </div>
        </div>
      </Bloc>

      <div
        style={{
          position: 'absolute',
          top: cfg.mention,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10 * cfg.e,
          fontFamily: F.titre,
          fontWeight: 800,
          fontSize: 24 * cfg.e,
          color: C.blanc,
          opacity: 0.92 * pMention,
          textShadow: '0 2px 8px rgba(90,25,0,0.35)',
        }}
      >
        <ShieldCheck size={30 * cfg.e} color={C.blanc} strokeWidth={2.6} />
        {CONTACTS.mentionLegale}
      </div>
    </AbsoluteFill>
  );
};
