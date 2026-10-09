/**
 * Ressources de marque.
 * Le film fonctionne sans fichier externe grâce à des substituts vectoriels fidèles à la charte.
 * Pour la version de diffusion, déposer les fichiers officiels fournis par UBA dans
 * public/brand/ et renseigner leur chemin ci-dessous (ex. "brand/uba-logo.svg").
 */
export const BRAND = {
  /** Logo officiel UBA (SVG/PNG fond transparent, version blanche ou rouge). */
  logo: null as string | null,
  /** Avatar officiel de Léo, le banquier virtuel. */
  leoAvatar: null as string | null,
  name: "United Bank for Africa",
  country: "Tchad",
  url: "ubachad.com",
  tagline: "La banque globale de l'Afrique",
} as const;
