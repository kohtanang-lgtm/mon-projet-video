import {continueRender, delayRender, staticFile} from 'remotion';

const FONTS: {family: string; file: string; weight: string}[] = [
  {family: 'Anton', file: 'fonts/anton.woff2', weight: '400'},
  {family: 'Montserrat', file: 'fonts/montserrat-var-latin.woff2', weight: '100 900'},
  {family: 'Nunito', file: 'fonts/nunito-var-latin.woff2', weight: '200 1000'},
  {family: 'Kaushan Script', file: 'fonts/kaushan.woff2', weight: '400'},
];

let loaded = false;

export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Chargement des polices');
  Promise.all(
    FONTS.map(async ({family, file, weight}) => {
      const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, {weight});
      await face.load();
      document.fonts.add(face);
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
