import React from 'react';
import { CircleCheck } from 'lucide-react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Avatar, ChampApp, Curseur, EnteteApp, EtatChamp, Loupe } from '../components/App';
import { Fond } from '../components/Fond';
import { Entete } from '../components/Logo';
import { SousTitres } from '../components/SousTitre';
import { ECRAN_MARGE, Telephone } from '../components/Telephone';
import { BlocTitre } from '../components/Texte';
import { prog, ressort, DOUX, INOUT } from '../components/anim';
import { ENTREE, HISTOIRE, SOUS_TITRES, TITRES } from '../histoire';
import { useMiseEnPage, Zone } from '../miseEnPage';
import { BOITE_ILLU, BOITE_TITRE, C, F } from '../theme';

const T = {
  telephone: ENTREE + 8,
  champs: ENTREE + 18,
  nom: ENTREE + 34,
  numero: ENTREE + 62,
  loupe: ENTREE + 96,
  erreur: ENTREE + 136,
  correction: ENTREE + 180,
  valide: ENTREE + 194,
  badge: ENTREE + 204,
  bouton: ENTREE + 210,
  appui: ENTREE + 236,
};

const PHONE = { x: 220, y: 20, l: 560, h: 840 };

export const S3Verifier: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mp = useMiseEnPage();

  const pTel = ressort(frame, fps, T.telephone, { damping: 16, stiffness: 90, mass: 1 });
  const nom = HISTOIRE.beneficiaire;
  const nbNom = Math.floor(interpolate(frame, [T.nom, T.nom + 24], [0, nom.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const { debut, erreur, fin } = HISTOIRE.numeroFaux;
  const numero = debut + erreur + fin;
  const nbNum = Math.floor(interpolate(frame, [T.numero, T.numero + 30], [0, numero.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  const enErreur = frame >= T.erreur && frame < T.valide;
  const estValide = frame >= T.valide;
  const etatNumero: EtatChamp = enErreur ? 'erreur' : estValide ? 'valide' : 'normal';
  const etatNom: EtatChamp = frame >= T.valide + 8 ? 'valide' : 'normal';
  const secousse =
    frame >= T.erreur && frame < T.erreur + 16 ? Math.sin((frame - T.erreur) * 1.9) * 12 * (1 - (frame - T.erreur) / 16) : 0;
  const pFlip = prog(frame, T.correction, T.correction + 12, INOUT);

  // Loupe : entre, balaie le numéro, s'arrête sur l'erreur, puis repart.
  const pLoupeIn = ressort(frame, fps, T.loupe, { damping: 13, stiffness: 120 });
  const pLoupeOut = prog(frame, T.valide + 4, T.valide + 16, DOUX);
  const loupeX = interpolate(frame, [T.loupe, T.erreur - 6], [70, 276], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT });
  const pBadge = ressort(frame, fps, T.badge, { damping: 10, stiffness: 150 });
  const pBouton = prog(frame, T.bouton, T.bouton + 10);
  const appui = frame - T.appui;

  const champ = (i: number) => {
    const p = ressort(frame, fps, T.champs + i * 6, { damping: 200 }, 16);
    return { opacity: p, transform: `translateY(${(1 - p) * 30}px)` };
  };

  const numeroAffiche = () => {
    const lettres = numero.slice(0, nbNum);
    const avantErreur = lettres.slice(0, debut.length);
    const partieErreur = lettres.slice(debut.length, debut.length + erreur.length);
    const apres = lettres.slice(debut.length + erreur.length);
    return (
      <>
        {avantErreur}
        {partieErreur ? (
          <span
            style={{
              display: 'inline-block',
              position: 'relative',
              overflow: 'hidden',
              height: '1.3em',
              verticalAlign: 'bottom',
              borderRadius: 8,
              padding: '0 3px',
              background: enErreur ? 'rgba(224,53,43,0.16)' : estValide ? 'rgba(24,169,87,0.14)' : 'transparent',
              color: enErreur ? C.rouge : estValide ? C.vert : C.encre,
            }}
          >
            <span style={{ display: 'block', transform: `translateY(${-pFlip * 50}%)`, lineHeight: '1.3em' }}>
              <span style={{ display: 'block' }}>{partieErreur}</span>
              <span style={{ display: 'block' }}>{HISTOIRE.numeroCorrige}</span>
            </span>
          </span>
        ) : null}
        {apres}
      </>
    );
  };

  return (
    <AbsoluteFill>
      <Fond />
      <Entete y={mp.entete.y} largeur={mp.entete.largeur} />
      <Zone placement={mp.titre} l={BOITE_TITRE.l} h={BOITE_TITRE.h}>
        <BlocTitre numero="1" lignes={TITRES.verifier} debut={ENTREE} />
      </Zone>
      <Zone placement={mp.illu} l={BOITE_ILLU.l} h={BOITE_ILLU.h}>
        <Telephone
          largeur={PHONE.l}
          hauteur={PHONE.h}
          barreClaire
          style={{ left: PHONE.x, top: PHONE.y, transform: `translateY(${(1 - pTel) * 700}px) rotate(${(1 - pTel) * 8}deg)` }}
          hors={
            <div
              style={{
                position: 'absolute',
                left: ECRAN_MARGE + loupeX - 92,
                top: ECRAN_MARGE + 422 - 92,
                opacity: Math.min(1, pLoupeIn) * (1 - pLoupeOut),
                transform: `scale(${(0.4 + 0.6 * pLoupeIn) * (1 - 0.4 * pLoupeOut)})`,
                transformOrigin: '92px 92px',
              }}
            >
              <Loupe taille={230} />
            </div>
          }
        >
          <EnteteApp titre="Envoyer de l'argent" />
          <div style={{ position: 'absolute', top: 200, left: 28, right: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
            <ChampApp libelle="Bénéficiaire" etat={etatNom} avant={<Avatar initiales={HISTOIRE.initiales} />} style={champ(0)}>
              {nom.slice(0, nbNom)}
              <Curseur frame={frame} visible={frame >= T.nom && frame < T.numero} />
            </ChampApp>
            <ChampApp libelle={enErreur ? 'Numéro de téléphone · à vérifier' : 'Numéro de téléphone'} etat={etatNumero} style={champ(1)} decalageX={secousse}>
              {numeroAffiche()}
              <Curseur frame={frame} visible={frame >= T.numero && frame < T.loupe} />
            </ChampApp>
            <ChampApp libelle="Montant" style={champ(2)}>
              {HISTOIRE.montant}
            </ChampApp>
            <div
              style={{
                ...champ(3),
                marginTop: 8,
                height: 88,
                borderRadius: 24,
                background: C.bleu,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.titre,
                fontWeight: 900,
                fontSize: 34,
                color: C.blanc,
                position: 'relative',
                overflow: 'hidden',
                filter: `saturate(${0.25 + 0.75 * pBouton})`,
                boxShadow: pBouton > 0 ? `0 0 0 ${6 + Math.sin(frame / 5) * 3}px rgba(8,108,176,${0.25 * pBouton})` : 'none',
              }}
            >
              <span style={{ opacity: 0.55 + 0.45 * pBouton }}>Envoyer</span>
              {appui > 0 && appui < 20 ? (
                <div
                  style={{
                    position: 'absolute',
                    width: 40 + appui * 30,
                    height: 40 + appui * 30,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.35)',
                    opacity: 1 - appui / 20,
                  }}
                />
              ) : null}
            </div>
          </div>
        </Telephone>
        {/* Badge de validation */}
        <div
          style={{
            position: 'absolute',
            left: 560,
            top: 470,
            transform: `scale(${pBadge}) rotate(${(1 - pBadge) * -10}deg)`,
            opacity: Math.min(1, pBadge * 2),
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '18px 26px',
            borderRadius: 40,
            background: C.vert,
            color: C.blanc,
            fontFamily: F.titre,
            fontWeight: 900,
            fontSize: 30,
            boxShadow: '0 16px 36px rgba(0, 60, 20, 0.30)',
            whiteSpace: 'nowrap',
          }}
        >
          <CircleCheck size={38} color={C.blanc} strokeWidth={3} />
          Informations vérifiées
        </div>
      </Zone>
      <SousTitres items={SOUS_TITRES.verifier} />
    </AbsoluteFill>
  );
};

