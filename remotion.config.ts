import { Config } from '@remotion/cli/config';

// Rendu vidéo : H.264 haute qualité, compatible Facebook, Instagram, TikTok et WhatsApp.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);

// Optionnel : chemin vers un Chrome déjà installé (sinon Remotion télécharge le sien).
if (process.env.REMOTION_CHROME) {
  Config.setBrowserExecutable(process.env.REMOTION_CHROME);
}
