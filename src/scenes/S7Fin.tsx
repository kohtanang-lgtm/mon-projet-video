import React from 'react';
import { Download, HandCoins, MessageCircle, Phone, Send, ShieldCheck, Smartphone, Wallet } from 'lucide-react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { FondMarque } from '../components/Fond';
import { LogoAnime } from '../components/Logo';
import { Son } from '../components/Son';
import { prog, ressort, INOUT } from '../components/anim';
import { CONTACTS, HISTOIRE } from '../histoire';
import { LOGO } from '../logoData';
import { useMiseEnPage } from '../miseEnPage';
import { C, F } from '../theme';
import { DUREE_FONDU, loc, R } from '../voixOff';
import { BOUCHE, cheminMorph, VISAGE } from './S6Sourire';

const f = (t: number) => loc('fin', t);

// « Tahwiil. / Simple. Rapide. Sécurisé. / Envoyez, payez, retirez… depuis votre téléphone. /
//   Un service agréé, toujours à vos côtés. / Faites comme Ahmat : téléchargez Tahwiil ! »
// Le raccord ne démarre qu'une fois le fondu terminé, pour que le visage reste identique pendant le fondu.
const D0 = DUREE_FONDU;
const T = {
  logo: D0 + 2,
  promesses: [f(R.simple), f(R.rapide), f(R.securise)].map((x) => x - 2),
  carte: f(R.envoyez) - 8,
  verbes: [f(R.envoyez), f(R.payez), f(R.retirez)].map((x) => x - 2),
  telephone: f(R.depuisTelephone),
  agree: f(R.serviceAgree),
  cotes: f(R.toujoursCotes),
  faites: f(R.faitesComme),
  telechargez: f(R.telechargez),
  tahwiil: f(R.tahwiilFinal),
  question: f(R.finVO) + 6,
};

const PROMESSES = [
  { fr: 'SIMPLE', ar: 'سهل' },
  { fr: 'RAPIDE', ar: 'سريع' },
  { fr: 'SÉCURISÉ', ar: 'آمن' },
];

const VERBES = [
  { texte: 'Envoyez', Icone: Send },
  { texte: 'Payez', Icone: Wallet },
  { texte: 'Retirez', Icone: HandCoins },
];

const pop = (p: number, monte = 40) => ({
  transform: `translateY(${(1 - p) * monte}px) scale(${p})`,
  opacity: Math.min(1, p * 2),
});

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

const Boutique: React.FC<{ petit: string; grand: string; p: number; bosse: number }> = ({ petit, grand, p, bosse }) => (
  <div
    style={{
      width: 360,
      height: 100,
      borderRadius: 22,
      background: '#111318',
      color: C.blanc,
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      paddingLeft: 30,
      fontFamily: F.titre,
      transform: `scale(${p * (1 + bosse * 0.06)})`,
      opacity: Math.min(1, p * 2),
      boxShadow: bosse > 0.01 ? `0 0 0 ${bosse * 8}px rgba(8,108,176,0.35)` : 'none',
    }}
  >
    <Download size={40} color={C.blanc} strokeWidth={2.6} />
    <div>
      <div style={{ fontWeight: 700, fontSize: 20, opacity: 0.85 }}>{petit}</div>
      <div style={{ fontWeight: 900, fontSize: 36, lineHeight: 1 }}>{grand}</div>
    </div>
  </div>
);

export const S7Fin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mp = useMiseEnPage();
  const v = mp.vertical;

  const cfg = v
    ? { cx: 540, cy: 500, r: 330, logo: 500, pastilles: 862, carte: 1018, confiance: 1366, contacts: 1450, appel: 1642, question: 1796, e: 1 }
    : { cx: 540, cy: 180, r: 145, logo: 220, pastilles: 340, carte: 434, confiance: 652, contacts: 700, appel: 818, question: 920, e: 0.64 };

  // --- Raccord : le visage de la scène précédente devient le cercle du logo, le sourire redevient la flèche.
  const e0 = mp.contenu.echelle;
  const depart = { x: mp.contenu.x + VISAGE.x * e0, y: mp.contenu.y + VISAGE.y * e0, r: VISAGE.r * e0 };
  const pC = ressort(frame, fps, D0, { damping: 15, stiffness: 95, mass: 0.9 });
  const cx = interpolate(pC, [0, 1], [depart.x, cfg.cx]);
  const cy = interpolate(pC, [0, 1], [depart.y, cfg.cy]);
  const r = interpolate(pC, [0, 1], [depart.r, cfg.r]);
  const k = r / VISAGE.r;
  const lambda = r / cfg.r;

  const s = cfg.logo / LOGO.largeur;
  const hauteurLogo = LOGO.hauteur * s + cfg.logo * 0.056 * 2.2;
  const fente = {
    x: (LOGO.fleche.x + LOGO.fleche.w / 2) * s - cfg.logo / 2,
    y: (LOGO.fleche.y + LOGO.fleche.h / 2) * s - hauteurLogo / 2,
    h: LOGO.fleche.h * s * 0.98,
  };
  const pYeux = 1 - prog(frame, D0, D0 + 9);
  const m = 1 - prog(frame, D0, D0 + 14, INOUT);
  const pRot = ressort(frame, fps, D0 + 2, { damping: 13, stiffness: 120 });
  const pA = ressort(frame, fps, D0 + 4, { damping: 14, stiffness: 110 });
  const bouche = { x: cx, y: cy + (BOUCHE.y - VISAGE.y) * k };
  const cible = { x: cx + fente.x * lambda, y: cy + fente.y * lambda };
  const flecheX = interpolate(pA, [0, 1], [bouche.x, cible.x]);
  const flecheY = interpolate(pA, [0, 1], [bouche.y, cible.y]);
  const flecheEchelle = interpolate(pA, [0, 1], [k, (fente.h * lambda) / 170]);

  const pCarte = ressort(frame, fps, T.carte, { damping: 15, stiffness: 110 });
  const pTel = ressort(frame, fps, T.telephone, { damping: 200 }, 14);
  const pConfiance = ressort(frame, fps, T.agree, { damping: 11, stiffness: 140 });
  const pContacts = ressort(frame, fps, T.cotes - 4, { damping: 15, stiffness: 120 });
  const pAppel = ressort(frame, fps, T.faites, { damping: 12, stiffness: 120 });
  const pTelecharge = ressort(frame, fps, T.telechargez, { damping: 10, stiffness: 160 });
  const bosse = Math.sin(Math.min(1, ressort(frame, fps, T.tahwiil, { damping: 200 }, 14)) * Math.PI);
  const bosseBoutiques = Math.sin(Math.min(1, ressort(frame, fps, T.telechargez, { damping: 200 }, 16)) * Math.PI);
  const pQuestion = ressort(frame, fps, T.question, { damping: 200 }, 16);

  return (
    <AbsoluteFill>
      <FondMarque />
      <svg width={mp.W} height={mp.H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <filter id="ombre-cercle" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="22" stdDeviation="24" floodColor="#7a2200" floodOpacity="0.3" />
          </filter>
        </defs>
        <g transform={`translate(${cx} ${cy}) scale(${k})`}>
          <circle r={VISAGE.r} fill={C.blanc} filter="url(#ombre-cercle)" />
          <circle cx={-150} cy={95} r={38} fill="#FFB37A" opacity={0.55 * pYeux} />
          <circle cx={150} cy={95} r={38} fill="#FFB37A" opacity={0.55 * pYeux} />
          <g transform={`scale(${pYeux})`}>
            <ellipse cx={-88} cy={-70} rx={27} ry={36} fill={C.bleuNuit} />
            <ellipse cx={88} cy={-70} rx={27} ry={36} fill={C.bleuNuit} />
            <circle cx={-78} cy={-84} r={8} fill={C.blanc} />
            <circle cx={98} cy={-84} r={8} fill={C.blanc} />
          </g>
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: cx - cfg.logo / 2,
          top: cy - hauteurLogo / 2,
          transform: `scale(${lambda * (1 + bosse * 0.04)})`,
          transformOrigin: `${cfg.logo / 2}px ${hauteurLogo / 2}px`,
        }}
      >
        <LogoAnime variante="orange" largeur={cfg.logo} debut={T.logo} couleurSlogan={C.bleu} sansFleche />
      </div>
      <svg width={mp.W} height={mp.H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path
          d={cheminMorph(m)}
          fill={C.bleu}
          stroke={C.bleu}
          strokeWidth={interpolate(m, [0, 1], [3, 22])}
          strokeLinejoin="round"
          transform={`translate(${flecheX} ${flecheY}) rotate(${180 * pRot}) scale(${flecheEchelle})`}
        />
      </svg>

      {/* Simple · Rapide · Sécurisé, chaque mot avec son équivalent arabe */}
      <Bloc y={cfg.pastilles} echelle={cfg.e} largeur={930}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 26 }}>
          {PROMESSES.map((pr, i) => {
            const p = ressort(frame, fps, T.promesses[i], { damping: 10, stiffness: 170 });
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
                  ...pop(p, 60),
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

      {/* Envoyez, payez, retirez… depuis votre téléphone — et les contacts */}
      <Bloc y={cfg.carte} echelle={cfg.e} largeur={920}>
        <div
          style={{
            borderRadius: 44,
            background: C.blanc,
            padding: '28px 34px 28px',
            boxShadow: '0 24px 60px rgba(90, 25, 0, 0.32)',
            fontFamily: F.titre,
            ...pop(pCarte, 160),
            transform: `translateY(${(1 - pCarte) * 160}px)`,
          }}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            {VERBES.map(({ texte, Icone }, i) => {
              const p = ressort(frame, fps, T.verbes[i], { damping: 10, stiffness: 180 });
              return (
                <div
                  key={texte}
                  style={{
                    flex: 1,
                    height: 84,
                    borderRadius: 24,
                    background: C.grisClair,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    ...pop(p, 30),
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      background: C.orangeVif,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icone size={30} color={C.blanc} strokeWidth={2.6} />
                  </div>
                  <span style={{ fontWeight: 900, fontSize: 34, color: C.encre }}>{texte}</span>
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              fontWeight: 900,
              fontSize: 38,
              color: C.bleu,
              opacity: pTel,
              transform: `translateY(${(1 - pTel) * 16}px)`,
            }}
          >
            <Smartphone size={40} color={C.bleu} strokeWidth={2.6} />
            … depuis votre téléphone
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
            <Boutique
              petit="Télécharger dans l’"
              grand="App Store"
              p={ressort(frame, fps, T.telephone + 6, { damping: 11, stiffness: 160 })}
              bosse={bosseBoutiques}
            />
            <Boutique
              petit="Disponible sur"
              grand="Google Play"
              p={ressort(frame, fps, T.telephone + 12, { damping: 11, stiffness: 160 })}
              bosse={bosseBoutiques}
            />
          </div>
        </div>
      </Bloc>

      {/* « Un service agréé » */}
      <Bloc y={cfg.confiance} echelle={cfg.e} largeur={920}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 26px',
              borderRadius: 40,
              background: 'rgba(255,255,255,0.18)',
              border: '3px solid rgba(255,255,255,0.85)',
              color: C.blanc,
              fontFamily: F.titre,
              fontWeight: 800,
              fontSize: 25,
              whiteSpace: 'nowrap',
              textShadow: '0 2px 8px rgba(90,25,0,0.3)',
              ...pop(pConfiance, 20),
            }}
          >
            <ShieldCheck size={32} color={C.blanc} strokeWidth={2.6} />
            {CONTACTS.mentionLegale}
          </div>
        </div>
      </Bloc>

      {/* « … toujours à vos côtés » : contacts disponibles 24h/7j */}
      <Bloc y={cfg.contacts} echelle={cfg.e} largeur={920}>
        <div
          style={{
            borderRadius: 40,
            background: C.blanc,
            padding: '22px 34px 20px',
            boxShadow: '0 20px 50px rgba(90, 25, 0, 0.3)',
            fontFamily: F.titre,
            ...pop(pContacts, 60),
            transform: `translateY(${(1 - pContacts) * 60}px)`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {[
              { Icone: MessageCircle, fond: C.vertWhatsapp, numero: CONTACTS.whatsapp, legende: 'WhatsApp' },
              { Icone: Phone, fond: C.bleu, numero: CONTACTS.telephone, legende: 'Téléphone' },
            ].map((c, i) => {
              const p = ressort(frame, fps, T.cotes + i * 6, { damping: 200 }, 16);
              const { Icone } = c;
              return (
                <div
                  key={c.numero}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
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
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <div
              style={{
                padding: '8px 26px',
                borderRadius: 30,
                background: C.orangeVif,
                color: C.blanc,
                fontWeight: 900,
                fontSize: 26,
                ...pop(ressort(frame, fps, T.cotes + 12, { damping: 11, stiffness: 160 }), 10),
              }}
            >
              {CONTACTS.disponibilite}
            </div>
          </div>
        </div>
      </Bloc>

      {/* « Faites comme Ahmat : téléchargez Tahwiil ! » */}
      <Bloc y={cfg.appel} echelle={cfg.e} largeur={920}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '20px 30px',
            borderRadius: 44,
            background: C.bleu,
            color: C.blanc,
            fontFamily: F.titre,
            boxShadow: `0 18px 40px rgba(0, 40, 80, 0.35), 0 0 0 ${bosse * 10}px rgba(255,255,255,0.35)`,
            ...pop(pAppel, 50),
            transform: `translateY(${(1 - pAppel) * 50}px) scale(${pAppel * (1 + bosse * 0.04)})`,
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              background: C.blanc,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transform: `scale(${0.6 + 0.4 * pTelecharge})`,
            }}
          >
            <Download size={46} color={C.bleu} strokeWidth={3} />
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 800, fontSize: 32, opacity: 0.95 }}>Faites comme {HISTOIRE.expediteur} :</div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 52,
                opacity: Math.min(1, pTelecharge * 2),
                transform: `translateX(${(1 - pTelecharge) * 30}px)`,
              }}
            >
              téléchargez Tahwiil !
            </div>
          </div>
        </div>
      </Bloc>

      {/* Appel à commenter, repris de leur publication (après la voix) */}
      <div
        style={{
          position: 'absolute',
          top: cfg.question,
          left: 40,
          right: 40,
          textAlign: 'center',
          fontFamily: F.titre,
          fontWeight: 800,
          fontSize: 26 * cfg.e,
          lineHeight: 1.3,
          color: C.blanc,
          textShadow: '0 2px 8px rgba(90,25,0,0.35)',
          opacity: pQuestion,
          transform: `translateY(${(1 - pQuestion) * 14}px)`,
        }}
      >
        Lequel des 3 points oubliez-vous le plus souvent ? Répondez 1, 2 ou 3 en commentaire.
      </div>

      <Son a={D0} nom="glissement" volume={0.3} />
      {T.promesses.map((a, i) => (
        <Son key={`p${i}`} a={a} nom={`pop-${i + 1}`} volume={0.4} />
      ))}
      <Son a={T.carte} nom="souffle-doux" volume={0.28} />
      {T.verbes.map((a, i) => (
        <Son key={`v${i}`} a={a} nom={`pop-${i + 2}`} volume={0.36} />
      ))}
      <Son a={T.telephone + 6} nom="tic" volume={0.28} />
      <Son a={T.agree} nom="succes" volume={0.32} />
      <Son a={T.cotes} nom="pop-1" volume={0.3} />
      <Son a={T.faites} nom="souffle-doux" volume={0.3} />
      <Son a={T.telechargez} nom="tic" volume={0.32} />
    </AbsoluteFill>
  );
};
