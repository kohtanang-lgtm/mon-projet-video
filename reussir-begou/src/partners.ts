// Partenaires affichés dans la scène « consortium » et dans l'outro.
// Pour remplacer un nom par son logo : déposer le fichier dans public/logos/
// puis renseigner `logo: 'logos/nom-du-fichier.png'`.
export type Partner = {name: string; logo?: string};

export const CONSORTIUM: Partner[] = [
  {name: 'BN2 Smart Group'},
  {name: 'M2E École Polytechnique'},
  {name: 'Job Booster Chad Entreprise'},
  {name: 'Charisma Life'},
  {name: 'Impact360'},
];

export const TECH_PARTNER: Partner = {name: 'N Consulting'};

export const HOST = {
  intro: 'Un évènement porté par',
  firstNames: 'Edgard Djimhotengar',
  lastName: 'DJERASSEM',
};
