/* Formats de sortie et zones de sécurité. Le format actif est choisi par la page d'entrée
   (index.html = 16:9, vertical.html = 9:16) via window.DC_FORMAT. */
window.DC = window.DC || {};

DC.formats = {
  landscape: {
    w: 1920, h: 1080,
    margin: 120,
    safe: { x0: 120, y0: 80, x1: 1800, y1: 1000 },
    bug: { x: 120, y: 78 },
    type: { hero: 150, title: 120, big: 96, mid: 64, small: 40, kicker: 22, label: 20 },
  },
  portrait: {
    w: 1080, h: 1920,
    margin: 80,
    // TikTok / Reels : on évite le haut (statut), le bas (légende, boutons) et la colonne de droite
    safe: { x0: 90, y0: 260, x1: 990, y1: 1480 },
    bug: { x: 90, y: 250 },
    type: { hero: 104, title: 96, big: 80, mid: 56, small: 36, kicker: 24, label: 22 },
  },
};
