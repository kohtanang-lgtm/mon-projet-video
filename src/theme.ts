// Charte Tahwiil relevée sur leurs visuels (carrousel, logo, page Facebook).
export const C = {
  orangeProfond: '#B73706',
  orangeBrule: '#D54C04',
  orangeVif: '#EF6C02',
  orange: '#FB8603',
  jaune: '#FBAA12',
  orangeLogo: '#D97C2B',
  motif: '#D87E2A',
  motifSombre: '#C66618',
  motifClair: '#E4903C',
  bleu: '#086CB0',
  bleuClair: '#3D9BE0',
  bleuNuit: '#0B2540',
  blanc: '#FFFFFF',
  encre: '#18212E',
  gris: '#6B7685',
  grisClair: '#F1F4F8',
  bordure: '#DDE3EA',
  vert: '#18A957',
  vertWhatsapp: '#25D366',
  rouge: '#E0352B',
  rougeEnseigne: '#E2452C',
  peau: '#7A4A2E',
  peauOmbre: '#5E3720',
  cheveux: '#1A120D',
} as const;

export const F = {
  titre: 'Nunito, sans-serif',
  marque: 'Montserrat, sans-serif',
  arabe: '"Baloo Bhaijaan 2", sans-serif',
} as const;

// Ombre portée douce, utilisée sur les textes posés sur l'orange.
export const OMBRE_TEXTE = '0 6px 22px rgba(130, 35, 0, 0.30)';

// Boîtes de conception : chaque zone est dessinée à taille fixe puis mise à l'échelle selon le format.
export const BOITE_TITRE = { l: 1000, h: 420 } as const;
export const BOITE_ILLU = { l: 1000, h: 800 } as const;
export const BOITE_CONTENU = { l: 1000, h: 1300 } as const;
