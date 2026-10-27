import { C } from './theme';

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

// Durées des scènes (images, 30 i/s). Les transitions se chevauchent avec les scènes.
export const FPS = 30;
export const DUREE_TRANSITION = 28;
export const DUREES = {
  accroche: 150,
  trajet: 150,
  verifier: 300,
  agent: 285,
  justificatif: 315,
  sourire: 165,
  fin: 230,
} as const;

export const DUREE_TOTALE =
  Object.values(DUREES).reduce((a, b) => a + b, 0) -
  (Object.keys(DUREES).length - 1) * DUREE_TRANSITION;

// Décalage d'entrée : laisse passer le balayage avant d'animer le contenu d'une scène.
export const ENTREE = 16;

const B = C.bleu;
const W = C.blanc;

export const TITRES = {
  accroche: [
    { segments: [{ t: 'AVANT', c: B }, { t: 'UN TRANSFERT,', c: W }], taille: 74 },
    { segments: [{ t: 'AVEZ-VOUS PENSÉ À CES', c: B }], taille: 66 },
    { segments: [{ t: '3 POINTS ?', c: W }], taille: 190 },
  ],
  trajet: [
    { segments: [{ t: `${HISTOIRE.expediteur.toUpperCase()} ENVOIE`, c: W }], taille: 78 },
    { segments: [{ t: "DE L'ARGENT À SA MAMAN,", c: W }], taille: 64 },
    { segments: [{ t: `À ${HISTOIRE.nomVilleArrivee.toUpperCase()}.`, c: B }], taille: 78 },
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

// Sous-titres (images locales à chaque scène). Ils servent aussi de texte pour la voix off.
export const SOUS_TITRES = {
  verifier: [
    { de: ENTREE + 34, a: 168, texte: 'Vérifiez le nom et le numéro de votre bénéficiaire.' },
    { de: 172, a: 300, texte: 'Une seule erreur peut retarder ou bloquer votre transfert.' },
  ],
  agent: [
    { de: ENTREE + 34, a: 165, texte: 'Frais, délais, pièces à fournir : un agent vous explique tout.' },
    { de: 169, a: 285, texte: 'En agence ou sur WhatsApp, 24h/7j.' },
  ],
  justificatif: [
    { de: ENTREE + 34, a: 168, texte: 'Gardez votre justificatif jusqu’au retrait.' },
    { de: 172, a: 315, texte: 'Et votre code PIN ne se partage jamais. Avec personne.' },
  ],
  sourire: [{ de: ENTREE + 10, a: 165, texte: `À ${HISTOIRE.nomVilleArrivee}, maman reçoit son argent.` }],
} as const;
