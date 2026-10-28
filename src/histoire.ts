import { C } from './theme';
import { R } from './voixOff';

// Tous les textes de la vidéo, au même endroit pour les modifier facilement.
// Les données du scénario (noms, numéro, référence) sont fictives.

export const HISTOIRE = {
  expediteur: 'Ahmat',
  beneficiaire: 'Achta Mahamat',
  initiales: 'AM',
  villeDepart: 'ndjamena',
  villeArrivee: 'abeche', // à remplacer par une ville réellement desservie (voir src/data/carteTchad.ts)
  nomVilleArrivee: 'Abéché',
  numeroFaux: { debut: '+235 66 01 ', erreur: '43', fin: ' 21' },
  numeroCorrige: '34',
  montant: '50 000 FCFA',
  reference: 'TW-4829-1307',
  dateHeure: '27 oct. 2026 · 14:32',
  heure: '14:32',
} as const;

export const CONTACTS = {
  whatsapp: '+235 86 07 76 76',
  telephone: '+235 30 77 76 76',
  disponibilite: 'Disponible 24h/7j',
  mentionLegale: 'Service de paiement mobile agréé · Supervision COBAC et BEAC',
} as const;

// Décalage d'entrée : laisse passer le balayage avant d'animer le contenu d'une scène.
export const ENTREE = 16;

const B = C.bleu;
const W = C.blanc;

export const TITRES = {
  // Accroche en deux temps, exactement comme la voix off.
  accrocheA: [
    { segments: [{ t: 'QUAND ON ENVOIE', c: W }], taille: 84 },
    { segments: [{ t: "DE L'ARGENT…", c: W }], taille: 84 },
    { segments: [{ t: 'ON ENVOIE', c: B }], taille: 84 },
    { segments: [{ t: 'BIEN PLUS.', c: W }], taille: 132 },
  ],
  accrocheB: [
    { segments: [{ t: 'AVEZ-VOUS PENSÉ', c: B }], taille: 80 },
    { segments: [{ t: 'À CES', c: B }], taille: 80 },
    { segments: [{ t: '3 POINTS ?', c: W }], taille: 190 },
  ],
  trajet: [
    { segments: [{ t: `${HISTOIRE.expediteur.toUpperCase()}, LUI,`, c: W }], taille: 104 },
    { segments: [{ t: 'Y PENSE.', c: B }], taille: 124 },
  ],
  verifier: [
    { segments: [{ t: 'VÉRIFIER LES', c: W }], taille: 76 },
    { segments: [{ t: 'INFORMATIONS', c: W }], taille: 76 },
    { segments: [{ t: 'DU BÉNÉFICIAIRE', c: B }], taille: 76 },
  ],
  agent: [
    { segments: [{ t: 'SE RENSEIGNER', c: B }], taille: 70 },
    { segments: [{ t: "AUPRÈS D'UN AGENT", c: W }], taille: 64 },
    { segments: [{ t: 'SUR LES MODALITÉS', c: W }], taille: 64 },
    { segments: [{ t: 'APPLICABLES', c: W }], taille: 64 },
  ],
  justificatif: [
    { segments: [{ t: 'CONSERVER LE JUSTIFICATIF', c: B }], taille: 44 },
    { segments: [{ t: 'ET', c: B }, { t: 'PROTÉGER SES', c: W }], taille: 64 },
    { segments: [{ t: 'INFORMATIONS', c: W }], taille: 64 },
    { segments: [{ t: 'PERSONNELLES.', c: W }], taille: 64 },
  ],
} as const;

// Sous-titres calés sur la voix off (temps en secondes de la voix).
// Chaque morceau correspond à une prise de parole ; le mot prononcé s'allume en jaune.
// Les phrases déjà écrites à l'écran (accroche, bulles, « JAMAIS », « Un transfert, un sourire », fin) n'en ont pas.
export type MorceauSousTitre = { readonly texte: string; readonly de: number; readonly a: number };
export const SOUS_TITRES: readonly (readonly MorceauSousTitre[])[] = [
  [
    { texte: 'À chaque envoi pour sa maman,', de: R.aChaqueEnvoi, a: 9.06 },
    { texte: `à ${HISTOIRE.nomVilleArrivee}.`, de: R.aAbeche, a: R.finTrajet },
  ],
  [{ texte: 'Il vérifie le nom et le numéro du bénéficiaire.', de: R.ilVerifie, a: R.finVerifie }],
  [{ texte: 'Car un seul chiffre de travers…', de: R.carUnSeul, a: R.finTravers }],
  [{ texte: '… et tout peut se bloquer.', de: R.toutBloquer, a: R.finBloquer }],
  [
    { texte: 'Vérifié.', de: R.verifie, a: R.finVerifieMot },
    { texte: 'Validé.', de: R.valide, a: R.finValide },
    { texte: 'L’esprit tranquille.', de: R.espritTranquille, a: R.finPoint1 },
  ],
  [{ texte: 'Il pose ses questions.', de: R.poseQuestions, a: R.finQuestions }],
  [{ texte: 'Un agent Tahwiil lui répond.', de: R.agentRepond, a: R.finRepond }],
  [
    { texte: 'En agence ou sur WhatsApp,', de: R.enAgence, a: R.finWhatsapp },
    { texte: 'jour et nuit,', de: R.jourEtNuit, a: R.finJourNuit },
    { texte: '7 jours sur 7.', de: R.septJours, a: R.finPoint2 },
  ],
  [
    { texte: 'Il garde précieusement son reçu…', de: R.garde, a: R.finRecu },
    { texte: 'jusqu’au retrait.', de: R.jusquauRetrait, a: R.finRetrait },
  ],
  [{ texte: 'Et si un inconnu lui réclame son code PIN ?', de: R.etSiInconnu, a: R.finInconnu }],
  [
    { texte: 'Un code PIN,', de: R.unCodePin, a: R.finUnCodePin },
    { texte: 'ça ne se partage pas.', de: R.partage, a: R.finPoint3 },
  ],
  [
    { texte: `À ${HISTOIRE.nomVilleArrivee},`, de: R.aAbecheFin, a: 41.59 },
    { texte: 'maman reçoit son argent.', de: R.mamanRecoit, a: R.finMamanRecoit },
  ],
];
