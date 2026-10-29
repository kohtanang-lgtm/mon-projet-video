import {Config} from '@remotion/cli/config';
import fs from 'node:fs';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
Config.setConcurrency(4);

// Dans l'environnement cloud, un Chromium headless est déjà installé.
const preinstalled = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (fs.existsSync(preinstalled)) {
  Config.setBrowserExecutable(preinstalled);
}
