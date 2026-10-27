import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

// Polices libres (SIL OFL) embarquées dans public/fonts : aucun accès réseau nécessaire au rendu.
const FICHIERS = [
  { family: 'Nunito', weight: '600', file: 'nunito-latin-600-normal.woff2' },
  { family: 'Nunito', weight: '700', file: 'nunito-latin-700-normal.woff2' },
  { family: 'Nunito', weight: '800', file: 'nunito-latin-800-normal.woff2' },
  { family: 'Nunito', weight: '900', file: 'nunito-latin-900-normal.woff2' },
  { family: 'Montserrat', weight: '600', file: 'montserrat-latin-600-normal.woff2' },
  { family: 'Montserrat', weight: '700', file: 'montserrat-latin-700-normal.woff2' },
  { family: 'Baloo Bhaijaan 2', weight: '600', file: 'baloo-bhaijaan-2-arabic-600-normal.woff2' },
  { family: 'Baloo Bhaijaan 2', weight: '700', file: 'baloo-bhaijaan-2-arabic-700-normal.woff2' },
  { family: 'Baloo Bhaijaan 2', weight: '800', file: 'baloo-bhaijaan-2-arabic-800-normal.woff2' },
];

export const chargerPolices = () =>
  Promise.all(
    FICHIERS.map((f) =>
      loadFont({ family: f.family, weight: f.weight, url: staticFile(`fonts/${f.file}`) }),
    ),
  );
