import { Config } from "@remotion/cli/config";

// Finition « broadcast » : JPEG haute qualité pour les images intermédiaires,
// H.264 CRF 16 en yuv420p (compatibilité universelle, aucun artefact visible).
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");
Config.setAudioCodec("aac");
Config.setAudioBitrate("320k");
// Moteur WebGL logiciel : rendu identique sur toutes les machines (CI, cloud, poste).
Config.setChromiumOpenGlRenderer("swangle");

// Permet de pointer vers un Chromium déjà installé (CI / conteneur hors-ligne).
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
