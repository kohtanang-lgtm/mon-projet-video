/**
 * Ressources de marque officielles (fournies par le client, dossier public/brand/).
 *  • Logo : vectorisé depuis l'icône officielle → src/brand/ubaLogo.ts (scripts/vectorize_logo.py)
 *  • Léo : détouré depuis le visuel officiel → public/brand/leo-cutout.png (scripts/prepare_leo.py)
 * Les cartes Débit / Prépayée sont redessinées en vectoriel d'après les visuels fournis,
 * avec des données fictives (numéro masqué, titulaire inventé).
 */
export const BRAND = {
  leoCutout: "brand/leo-cutout.png",
  /** Taille du détourage de Léo (px) et repères du visage, en fraction de l'image. */
  leoSize: { width: 507, height: 695 },
  leoFace: { x: 0.47, top: 0, chin: 0.83 },
  name: "United Bank for Africa",
  country: "Tchad",
  url: "ubachad.com",
  tagline: "La banque globale de l'Afrique",
} as const;
