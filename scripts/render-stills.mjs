// Rendu d'images fixes de contrôle (QA) à des instants précis du film.
// Usage : node scripts/render-stills.mjs [t1 t2 …]   (secondes, temps vidéo)
//         sans argument : une image par repère clé du découpage.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const DEFAULT_TIMES = [
  0.6,
  1.6,
  3.4,
  5.2,
  6.6, // S1
  7.6,
  9.6,
  11.4,
  13.4,
  15.6,
  17.3, // S2
  18.9,
  20.6,
  22.9,
  25.4,
  27.6,
  29.6,
  30.6, // S3
  32.4,
  34.2,
  36.6,
  38.4,
  40.4, // S4
  41.8,
  43.4,
  46.6,
  49.5, // S5
];

const times = process.argv
  .slice(2)
  .map(Number)
  .filter((n) => !Number.isNaN(n));
const outDir = path.resolve("out/stills");
mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const composition = await selectComposition({ serveUrl, id: "UbaTchadSpot", browserExecutable });

for (const t of times.length ? times : DEFAULT_TIMES) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
  const output = path.join(outDir, `t${t.toFixed(2).padStart(5, "0")}.jpg`);
  await renderStill({ composition, serveUrl, output, frame, imageFormat: "jpeg", jpegQuality: 88, browserExecutable });
  console.log(`✓ ${output}`);
}
