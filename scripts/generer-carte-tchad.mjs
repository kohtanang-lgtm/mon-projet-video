// Génère le tracé SVG du Tchad (données Natural Earth via world-atlas) et la position des villes.
// Usage : npm run carte
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoMercator, geoPath } from 'd3-geo';

const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/countries-50m.json', import.meta.url)));
const pays = feature(topo, topo.objects.countries);
const tchad = pays.features.find((f) => f.id === '148');
if (!tchad) throw new Error('Tchad introuvable dans world-atlas');

const LARGEUR = 800;
const HAUTEUR = 1100;
const projection = geoMercator().fitSize([LARGEUR, HAUTEUR], tchad);
const chemin = geoPath(projection);

const villes = {
  ndjamena: { nom: "N'Djamena", lon: 15.0444, lat: 12.1348 },
  abeche: { nom: 'Abéché', lon: 20.8324, lat: 13.8292 },
  moundou: { nom: 'Moundou', lon: 16.0833, lat: 8.5667 },
  sarh: { nom: 'Sarh', lon: 18.3922, lat: 9.1429 },
  mongo: { nom: 'Mongo', lon: 18.6929, lat: 12.1837 },
  bol: { nom: 'Bol', lon: 14.7147, lat: 13.4586 },
  faya: { nom: 'Faya-Largeau', lon: 19.1066, lat: 17.9257 },
};
const points = Object.fromEntries(
  Object.entries(villes).map(([cle, v]) => {
    const [x, y] = projection([v.lon, v.lat]);
    return [cle, { nom: v.nom, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }];
  }),
);

const d = chemin(tchad).replace(/(\d+\.\d{1})\d+/g, '$1');
const contenu = `// Fichier généré par scripts/generer-carte-tchad.mjs – ne pas modifier à la main.
// Source : Natural Earth (domaine public) via le paquet world-atlas.
export const CARTE_TCHAD = {
  largeur: ${LARGEUR},
  hauteur: ${HAUTEUR},
  d: ${JSON.stringify(d)},
  villes: ${JSON.stringify(points, null, 2)},
} as const;
`;
writeFileSync(new URL('../src/data/carteTchad.ts', import.meta.url), contenu);
console.log('Carte générée :', d.length, 'caractères ;', points);
