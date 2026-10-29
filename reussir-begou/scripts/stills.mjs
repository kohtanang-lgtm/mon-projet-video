// Rend des images de contrôle : node scripts/stills.mjs <dossier> <composition> <images...>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [outDir, compId, ...frames] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {withAudio: false};
const composition = await selectComposition({serveUrl, id: compId, inputProps, browserExecutable});
for (const f of frames) {
  await renderStill({composition, serveUrl, frame: Number(f), output: path.join(outDir, `${compId}-${String(f).padStart(4, '0')}.png`), inputProps, browserExecutable, scale: 0.5});
  process.stdout.write(`${f} `);
}
console.log('ok');
