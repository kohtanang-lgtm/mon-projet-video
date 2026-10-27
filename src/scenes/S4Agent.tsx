import React from 'react';
import { Banknote, Check, Clock, IdCard, MapPin, MessageCircle } from 'lucide-react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Fond } from '../components/Fond';
import { Entete, LogoAnime } from '../components/Logo';
import { SousTitres } from '../components/SousTitre';
import { BlocTitre } from '../components/Texte';
import { ressort } from '../components/anim';
import { CONTACTS, ENTREE, SOUS_TITRES, TITRES } from '../histoire';
import { useMiseEnPage, Zone } from '../miseEnPage';
import { BOITE_ILLU, BOITE_TITRE, C, F } from '../theme';

const T = {
  guichet: ENTREE + 8,
  agent: ENTREE + 26,
  bulles: ENTREE + 50,
  reponses: ENTREE + 128,
  whatsapp: ENTREE + 168,
};

const QUESTIONS = [
  { texte: 'Frais ?', Icone: Banknote, x: 0, y: 120 },
  { texte: 'Délais ?', Icone: Clock, x: 690, y: 120 },
  { texte: 'Pièce d’identité ?', Icone: IdCard, x: 0, y: 330 },
  { texte: 'Lieu de retrait ?', Icone: MapPin, x: 690, y: 330 },
];

// Agent Tahwiil en illustration plate, qui salue de la main.
const AgentIllustration: React.FC<{ frame: number }> = ({ frame }) => {
  const salut = Math.sin(frame / 5) * 14;
  const cligne = frame % 75 > 70 ? 0.15 : 1;
  return (
    <svg width={300} height={330} viewBox="0 0 300 330" style={{ overflow: 'visible' }}>
      {/* bras qui salue */}
      <g transform={`rotate(${salut} 228 240)`}>
        <path d="M 228 240 L 268 160" stroke={C.orangeVif} strokeWidth={36} strokeLinecap="round" />
        <circle cx={272} cy={148} r={22} fill={C.peau} />
      </g>
      {/* buste */}
      <path d="M 40 330 C 40 250 82 214 150 214 C 218 214 260 250 260 330 Z" fill={C.orangeVif} />
      <path d="M 120 216 L 150 252 L 180 216 Z" fill={C.blanc} />
      <path d="M 112 214 L 150 246 L 134 262 Z M 188 214 L 150 246 L 166 262 Z" fill={C.orangeBrule} />
      <circle cx={206} cy={278} r={15} fill={C.blanc} />
      <path d="M 206 268 L 213 286 L 206 282 L 199 286 Z" fill={C.bleu} />
      {/* cou et tête */}
      <rect x={130} y={176} width={40} height={46} rx={14} fill={C.peauOmbre} />
      <circle cx={88} cy={136} r={13} fill={C.peau} />
      <circle cx={212} cy={136} r={13} fill={C.peau} />
      <ellipse cx={150} cy={128} rx={62} ry={70} fill={C.peau} />
      <path d="M 88 118 C 86 66 118 50 150 50 C 186 50 216 64 212 118 C 204 92 188 82 150 82 C 112 82 96 94 88 118 Z" fill={C.cheveux} />
      <g transform={`translate(0 ${(1 - cligne) * 6})`}>
        <ellipse cx={126} cy={132} rx={7} ry={9 * cligne} fill={C.cheveux} />
        <ellipse cx={174} cy={132} rx={7} ry={9 * cligne} fill={C.cheveux} />
      </g>
      <path d="M 114 112 Q 126 104 138 110 M 162 110 Q 174 104 186 112" stroke={C.cheveux} strokeWidth={5} strokeLinecap="round" fill="none" />
      <path d="M 124 160 Q 150 190 176 160 Q 150 170 124 160 Z" fill={C.blanc} stroke={C.cheveux} strokeWidth={4} strokeLinejoin="round" />
    </svg>
  );
};

const Bulle: React.FC<{ q: (typeof QUESTIONS)[number]; i: number }> = ({ q, i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = ressort(frame, fps, T.bulles + i * 16, { damping: 11, stiffness: 150 });
  const pRep = ressort(frame, fps, T.reponses + i * 7, { damping: 9, stiffness: 180 });
  const gauche = q.x < 500;
  const flotte = Math.sin(frame / 16 + i * 1.3) * 5;
  const { Icone } = q;
  return (
    <div
      style={{
        position: 'absolute',
        left: q.x,
        top: q.y,
        width: 310,
        transform: `translateY(${flotte}px) scale(${p})`,
        transformOrigin: gauche ? '90% 80%' : '10% 80%',
        opacity: Math.min(1, p * 2),
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '18px 20px',
          borderRadius: 30,
          background: C.blanc,
          boxShadow: '0 16px 34px rgba(110, 30, 0, 0.25)',
        }}
      >
        <div
          style={{
            width: 66,
            height: 66,
            borderRadius: 33,
            background: C.bleu,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icone size={36} color={C.blanc} strokeWidth={2.6} />
        </div>
        <div style={{ fontFamily: F.titre, fontWeight: 900, fontSize: 29, lineHeight: 1.1, color: C.encre }}>{q.texte}</div>
        {/* pointe de la bulle */}
        <div
          style={{
            position: 'absolute',
            bottom: -14,
            [gauche ? 'right' : 'left']: 46,
            width: 32,
            height: 32,
            background: C.blanc,
            transform: 'rotate(45deg)',
            borderRadius: 6,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -18,
            [gauche ? 'left' : 'right']: -14,
            width: 52,
            height: 52,
            borderRadius: 26,
            background: C.vert,
            border: `5px solid ${C.blanc}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${pRep})`,
            boxShadow: '0 6px 14px rgba(0,60,20,0.3)',
          }}
        >
          <Check size={28} color={C.blanc} strokeWidth={4} />
        </div>
      </div>
    </div>
  );
};

export const S4Agent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mp = useMiseEnPage();
  const pGuichet = ressort(frame, fps, T.guichet, { damping: 15, stiffness: 100 });
  const pAgent = ressort(frame, fps, T.agent, { damping: 12, stiffness: 110 });
  const pWa = ressort(frame, fps, T.whatsapp, { damping: 13, stiffness: 130 });

  return (
    <AbsoluteFill>
      <Fond />
      <Entete y={mp.entete.y} largeur={mp.entete.largeur} />
      <Zone placement={mp.titre} l={BOITE_TITRE.l} h={BOITE_TITRE.h}>
        <BlocTitre numero="2" lignes={TITRES.agent} debut={ENTREE} />
      </Zone>
      <Zone placement={mp.illu} l={BOITE_ILLU.l} h={BOITE_ILLU.h}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateY(${(1 - pGuichet) * 500}px)`,
            opacity: Math.min(1, pGuichet * 2),
          }}
        >
          {/* Enseigne */}
          <div
            style={{
              position: 'absolute',
              left: 380,
              top: 40,
              width: 240,
              height: 92,
              borderRadius: 14,
              background: C.rougeEnseigne,
              color: C.blanc,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 24px rgba(110,20,0,0.25)',
              zIndex: 2,
            }}
          >
            <div style={{ fontFamily: F.titre, fontWeight: 900, fontSize: 32, lineHeight: 1 }}>CAISSE 1</div>
            <div style={{ fontFamily: F.arabe, fontWeight: 700, fontSize: 26, lineHeight: 1.1, direction: 'rtl' }}>الصندوق 1</div>
          </div>
          {/* Vitre et agent */}
          <div
            style={{
              position: 'absolute',
              left: 230,
              top: 110,
              width: 540,
              height: 450,
              borderRadius: 18,
              overflow: 'hidden',
              background: 'linear-gradient(180deg, #F5F8FB 0%, #E6EDF4 100%)',
              boxShadow: 'inset 0 0 0 14px #FFFFFF, 0 18px 40px rgba(110,30,0,0.25)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 120,
                top: 110,
                transform: `translateY(${(1 - pAgent) * 340}px)`,
              }}
            >
              <AgentIllustration frame={frame} />
            </div>
            <div
              style={{
                position: 'absolute',
                inset: 14,
                borderRadius: 8,
                background:
                  'linear-gradient(115deg, rgba(190,225,248,0.35) 0%, rgba(190,225,248,0.18) 30%, rgba(255,255,255,0.55) 31%, rgba(255,255,255,0.0) 38%, rgba(190,225,248,0.12) 60%, rgba(255,255,255,0.4) 61%, rgba(255,255,255,0) 66%)',
              }}
            />
            <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 14px #FFFFFF', borderRadius: 18 }} />
          </div>
          {/* Comptoir */}
          <div
            style={{
              position: 'absolute',
              left: 150,
              top: 540,
              width: 700,
              height: 34,
              borderRadius: 10,
              background: '#F1F3F6',
              boxShadow: '0 10px 18px rgba(80,20,0,0.18)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 175,
              top: 572,
              width: 650,
              height: 230,
              borderRadius: '0 0 16px 16px',
              background: C.blanc,
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 40,
            }}
          >
            <LogoAnime variante="orange" largeur={270} statique couleurSlogan={C.bleu} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 44, background: C.orangeVif }} />
          </div>
        </div>
        {QUESTIONS.map((q, i) => (
          <Bulle key={i} q={q} i={i} />
        ))}
        {/* Contact WhatsApp 24h/7j */}
        <div
          style={{
            position: 'absolute',
            left: 110,
            top: 610,
            width: 780,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: '20px 30px',
            borderRadius: 60,
            background: C.vertWhatsapp,
            color: C.blanc,
            boxShadow: '0 18px 40px rgba(0, 70, 30, 0.35)',
            transform: `translateY(${(1 - pWa) * 300}px) scale(${0.8 + 0.2 * pWa})`,
            opacity: Math.min(1, pWa * 2),
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
            }}
          >
            <MessageCircle size={50} color={C.vertWhatsapp} strokeWidth={2.8} />
          </div>
          <div style={{ fontFamily: F.titre, lineHeight: 1.1 }}>
            <div style={{ fontWeight: 800, fontSize: 28, opacity: 0.95 }}>Une question ? WhatsApp · 24h/7j</div>
            <div style={{ fontWeight: 900, fontSize: 46, letterSpacing: '0.01em' }}>{CONTACTS.whatsapp}</div>
          </div>
        </div>
      </Zone>
      <SousTitres items={SOUS_TITRES.agent} />
    </AbsoluteFill>
  );
};

