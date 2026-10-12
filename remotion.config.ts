import { Config } from "@remotion/cli/config";

// Finition « master » :
//  • images intermédiaires PNG (sans perte) : aucun artefact JPEG dans les dégradés sombres ;
//  • H.264 preset « slow », CRF 14 : piqué maximal à débit raisonnable ;
//  • yuv420p + BT.709 balisé : rouge UBA fidèle et lecture universelle (web, TV, mobiles).
Config.setVideoImageFormat("png");
Config.setCodec("h264");
Config.setCrf(14);
Config.setX264Preset("slow");
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
Config.setAudioCodec("aac");
Config.setAudioBitrate("320k");
// Moteur WebGL logiciel : rendu identique sur toutes les machines (CI, cloud, poste).
Config.setChromiumOpenGlRenderer("swangle");

// Permet de pointer vers un Chromium déjà installé (CI / conteneur hors-ligne).
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
