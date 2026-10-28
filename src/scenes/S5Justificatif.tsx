import React from 'react';
import { ArrowLeft, Check, Download, FolderCheck, Lock, LockOpen, ShieldCheck } from 'lucide-react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Fond } from '../components/Fond';
import { Entete } from '../components/Logo';
import { Son } from '../components/Son';
import { Telephone } from '../components/Telephone';
import { BlocTitre } from '../components/Texte';
import { prog, ressort, INOUT } from '../components/anim';
import { HISTOIRE, TITRES } from '../histoire';
import { useMiseEnPage, Zone } from '../miseEnPage';
import { BOITE_ILLU, BOITE_TITRE, C, F } from '../theme';
import { loc, R } from '../voixOff';

const f = (t: number) => loc('justificatif', t);

// « Trois : il garde précieusement son reçu… jusqu'au retrait. / Et si un inconnu lui réclame son code PIN ? /
//   JAMAIS. / Un code PIN, ça ne se partage pas. »
const T = {
  titre: Math.max(f(R.trois), 18),
  telephone: 20,
  coche: f(R.garde),
  lignes: f(R.garde) + 12,
  bouton: f(R.garde) + 26,
  appui: f(R.recu) - 2,
  enregistre: f(R.recu) + 4,
  dossier: f(R.jusquauRetrait) - 4,
  bascule: f(R.etSiInconnu) - 6,
  ecrit: f(R.etSiInconnu) + 8,
  message: f(R.etSiInconnu) + 22,
  tampon: f(R.jamais),
  pin: f(R.unCodePin),
  verrou: f(R.partage) + 6,
};

const PHONE = { x: 220, y: 20, l: 560, h: 840 };

const LIGNES_RECU = [
  ['Bénéficiaire', HISTOIRE.beneficiaire],
  ['Numéro', HISTOIRE.numeroFaux.debut + HISTOIRE.numeroCorrige + HISTOIRE.numeroFaux.fin],
  ['Montant', HISTOIRE.montant],
  ['Référence', HISTOIRE.reference],
];

const EcranRecu: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pCoche = ressort(frame, fps, T.coche, { damping: 9, stiffness: 160 });
  const pTitre = ressort(frame, fps, T.coche + 6, { damping: 200 }, 16);
  const pBouton = ressort(frame, fps, T.bouton, { damping: 200 }, 16);
  const enregistre = frame >= T.enregistre;
  const appui = frame - T.appui;
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.blanc }}>
      <div style={{ position: 'absolute', top: 88, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: 124,
            height: 124,
            borderRadius: 62,
            background: C.vert,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${pCoche})`,
            boxShadow: `0 0 0 ${14 * pCoche}px rgba(24,169,87,0.15)`,
          }}
        >
          <Check size={72} color={C.blanc} strokeWidth={4} />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 232,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: F.titre,
          opacity: pTitre,
          transform: `translateY(${(1 - pTitre) * 20}px)`,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 38, color: C.encre }}>Transfert envoyé</div>
        <div style={{ fontWeight: 700, fontSize: 23, color: C.gris, marginTop: 4 }}>{HISTOIRE.dateHeure}</div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 330,
          left: 28,
          right: 28,
          borderRadius: 26,
          background: C.grisClair,
          padding: '12px 24px',
        }}
      >
        {LIGNES_RECU.map(([libelle, valeur], i) => {
          const p = ressort(frame, fps, T.lignes + i * 5, { damping: 200 }, 14);
          return (
            <div
              key={libelle}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 56,
                borderTop: i === 0 ? 'none' : `2px dashed ${C.bordure}`,
                fontFamily: F.titre,
                opacity: p,
                transform: `translateX(${(1 - p) * 30}px)`,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 22, color: C.gris }}>{libelle}</span>
              <span style={{ fontWeight: 900, fontSize: 25, color: C.encre }}>{valeur}</span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 600,
          left: 28,
          right: 28,
          height: 84,
          borderRadius: 24,
          border: `3px solid ${enregistre ? C.vert : C.bleu}`,
          background: enregistre ? C.vert : C.blanc,
          color: enregistre ? C.blanc : C.bleu,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          fontFamily: F.titre,
          fontWeight: 900,
          fontSize: 30,
          overflow: 'hidden',
          opacity: pBouton,
          transform: `translateY(${(1 - pBouton) * 30}px) scale(${appui > 0 && appui < 6 ? 0.96 : 1})`,
        }}
      >
        {enregistre ? <Check size={36} color={C.blanc} strokeWidth={3.5} /> : <Download size={34} color={C.bleu} strokeWidth={3} />}
        {enregistre ? 'Reçu enregistré' : 'Enregistrer le reçu'}
        {appui > 0 && appui < 18 ? (
          <div
            style={{
              position: 'absolute',
              width: 40 + appui * 34,
              height: 40 + appui * 34,
              borderRadius: '50%',
              background: 'rgba(8,108,176,0.25)',
              opacity: 1 - appui / 18,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

const EcranMessage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ecrit = frame >= T.ecrit && frame < T.message;
  const pMsg = ressort(frame, fps, T.message, { damping: 13, stiffness: 160 });
  const pPin = ressort(frame, fps, T.pin, { damping: 13, stiffness: 140 });
  const verrouille = frame >= T.verrou;
  const pVerrou = ressort(frame, fps, T.verrou, { damping: 8, stiffness: 200, mass: 0.6 });
  const pBouclier = ressort(frame, fps, T.verrou + 8, { damping: 10, stiffness: 160 });
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#EAEFF4' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 170, background: C.blanc, boxShadow: '0 2px 0 #DDE3EA' }}>
        <div style={{ position: 'absolute', top: 92, left: 22 }}>
          <ArrowLeft size={32} color={C.encre} strokeWidth={3} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 70,
            width: 62,
            height: 62,
            borderRadius: 31,
            background: '#9AA5B4',
            color: C.blanc,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: F.titre,
            fontWeight: 900,
            fontSize: 34,
          }}
        >
          ?
        </div>
        <div style={{ position: 'absolute', top: 78, left: 148, fontFamily: F.titre }}>
          <div style={{ fontWeight: 900, fontSize: 30, color: C.encre }}>Numéro inconnu</div>
          <div style={{ fontWeight: 700, fontSize: 21, color: C.gris }}>Message reçu à 14:35</div>
        </div>
      </div>
      {ecrit ? (
        <div
          style={{
            position: 'absolute',
            top: 206,
            left: 28,
            padding: '22px 26px',
            borderRadius: '8px 28px 28px 28px',
            background: C.blanc,
            display: 'flex',
            gap: 10,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: '#9AA5B4',
                transform: `translateY(${Math.sin(frame / 3 - i) * 5}px)`,
              }}
            />
          ))}
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          top: 206,
          left: 28,
          width: 420,
          padding: '20px 24px 14px',
          borderRadius: '8px 28px 28px 28px',
          background: C.blanc,
          boxShadow: '0 4px 12px rgba(20,40,70,0.08)',
          fontFamily: F.titre,
          transform: `scale(${pMsg})`,
          transformOrigin: '0 0',
          opacity: Math.min(1, pMsg * 2),
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 27, lineHeight: 1.32, color: C.encre }}>
          Bonjour, je suis agent. Envoyez-moi votre <b style={{ fontWeight: 900 }}>code PIN</b> pour valider votre transfert.
        </div>
        <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 19, color: C.gris, marginTop: 6 }}>14:35</div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 500,
          left: 28,
          right: 28,
          padding: '22px 24px',
          borderRadius: 28,
          background: C.blanc,
          boxShadow: '0 10px 26px rgba(20,40,70,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          opacity: Math.min(1, pPin * 2),
          transform: `translateY(${(1 - pPin) * 60}px)`,
        }}
      >
        <div
          style={{
            width: 82,
            height: 82,
            borderRadius: 41,
            background: verrouille ? C.bleu : '#9AA5B4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${verrouille ? 0.85 + 0.15 * pVerrou : 1})`,
            flexShrink: 0,
          }}
        >
          {verrouille ? <Lock size={44} color={C.blanc} strokeWidth={2.8} /> : <LockOpen size={44} color={C.blanc} strokeWidth={2.8} />}
        </div>
        <div style={{ flex: 1, fontFamily: F.titre }}>
          <div style={{ fontWeight: 900, fontSize: 28, color: C.encre }}>Votre code PIN</div>
          <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ width: 22, height: 22, borderRadius: 11, background: C.encre }} />
            ))}
          </div>
        </div>
        <div style={{ transform: `scale(${pBouclier})` }}>
          <ShieldCheck size={62} color={C.vert} strokeWidth={2.6} />
        </div>
      </div>
    </div>
  );
};

export const S5Justificatif: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mp = useMiseEnPage();
  const pTel = ressort(frame, fps, T.telephone, { damping: 16, stiffness: 90, mass: 1 });
  const pDossier = ressort(frame, fps, T.dossier, { damping: 10, stiffness: 150 });
  const pBascule = prog(frame, T.bascule, T.bascule + 14, INOUT);
  const pTampon = ressort(frame, fps, T.tampon, { damping: 9, stiffness: 220, mass: 0.6 });
  const dt = frame - T.tampon;
  const secousse = dt >= 0 && dt < 14 ? Math.sin(dt * 2.1) * 14 * (1 - dt / 14) : 0;

  return (
    <AbsoluteFill>
      <Fond />
      <Entete y={mp.entete.y} largeur={mp.entete.largeur} />
      <Zone placement={mp.titre} l={BOITE_TITRE.l} h={BOITE_TITRE.h}>
        <BlocTitre numero="3" lignes={TITRES.justificatif} debut={T.titre} />
      </Zone>
      <Zone placement={mp.illu} l={BOITE_ILLU.l} h={BOITE_ILLU.h} style={{ transform: `scale(${mp.illu.echelle}) translateX(${secousse}px)` }}>
        <Telephone
          largeur={PHONE.l}
          hauteur={PHONE.h}
          style={{ left: PHONE.x, top: PHONE.y, transform: `translateY(${(1 - pTel) * 700}px) rotate(${(1 - pTel) * -8}deg)` }}
        >
          <div style={{ position: 'absolute', inset: 0, transform: `translateX(${-pBascule * 30}%)`, opacity: 1 - pBascule * 0.6 }}>
            <EcranRecu />
          </div>
          <div style={{ position: 'absolute', inset: 0, transform: `translateX(${(1 - pBascule) * 100}%)` }}>
            <EcranMessage />
          </div>
        </Telephone>
        {/* Dossier « Mes reçus » */}
        <div
          style={{
            position: 'absolute',
            left: 640,
            top: 128,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '18px 26px 18px 20px',
            borderRadius: 40,
            background: C.blanc,
            boxShadow: '0 16px 36px rgba(110, 30, 0, 0.28)',
            transform: `scale(${pDossier * (1 - pBascule)}) rotate(${(1 - pDossier) * 12}deg)`,
            opacity: Math.min(1, pDossier * 2) * (1 - pBascule),
          }}
        >
          <FolderCheck size={42} color={C.bleu} strokeWidth={2.6} />
          <span style={{ fontFamily: F.titre, fontWeight: 900, fontSize: 30, color: C.encre }}>Mes reçus</span>
          <span
            style={{
              fontFamily: F.titre,
              fontWeight: 900,
              fontSize: 24,
              color: C.blanc,
              background: C.orangeVif,
              borderRadius: 20,
              padding: '4px 12px',
            }}
          >
            +1
          </span>
        </div>
        {/* Tampon « JAMAIS » */}
        <div
          style={{
            position: 'absolute',
            left: 520,
            top: 470,
            transform: `translate(-50%, -50%) rotate(-11deg) scale(${interpolate(pTampon, [0, 1], [2.6, 1])})`,
            opacity: frame >= T.tampon ? Math.min(1, pTampon * 3) : 0,
            padding: '4px 30px',
            border: `9px solid ${C.rouge}`,
            borderRadius: 22,
            background: 'rgba(255,255,255,0.92)',
            color: C.rouge,
            fontFamily: F.titre,
            fontWeight: 900,
            fontSize: 86,
            lineHeight: 1.1,
            letterSpacing: '0.02em',
            boxShadow: '0 20px 40px rgba(120, 10, 0, 0.30)',
            whiteSpace: 'nowrap',
          }}
        >
          JAMAIS !
        </div>
      </Zone>
      <Son a={T.telephone} nom="souffle-doux" volume={0.28} />
      <Son a={T.coche} nom="succes" volume={0.4} />
      <Son a={T.appui} nom="tape" volume={0.4} />
      <Son a={T.enregistre} nom="tic" volume={0.35} />
      <Son a={T.dossier} nom="pop-2" volume={0.38} />
      <Son a={T.bascule} nom="glissement" volume={0.28} />
      <Son a={T.message} nom="message" volume={0.42} />
      <Son a={T.tampon} nom="tampon" volume={0.85} />
      <Son a={T.pin} nom="souffle-doux" volume={0.24} />
      <Son a={T.verrou} nom="verrou" volume={0.5} />
      <Son a={T.verrou + 8} nom="tic" volume={0.3} />
    </AbsoluteFill>
  );
};
