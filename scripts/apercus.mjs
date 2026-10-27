// Génère des images fixes de contrôle à des instants donnés.
// Usage : node scripts/apercus.mjs <composition> <dossier> <image1> <image2> ...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import { mkdirSync } from 'node:fs';

const [compositionId, dossier, ...images] = process.argv.slice(2);
mkdirSync(dossier, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const browserExecutable = process.env.REMOTION_CHROME ?? null;
const composition = await selectComposition({ serveUrl, id: compositionId, browserExecutable });
for (const img of images) {
  const frame = Number(img);
  const sortie = path.join(dossier, `${compositionId}-${String(frame).padStart(4, '0')}.png`);
  await renderStill({ composition, serveUrl, frame, output: sortie, browserExecutable, imageFormat: 'png' });
  console.log('✓', sortie);
}
