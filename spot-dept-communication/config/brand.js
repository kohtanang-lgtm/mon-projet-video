/* Charte du Département de Communication — couleurs, typographies, courbes de mouvement.
   Modifier une valeur ici la change dans tout le film. */
window.DC = window.DC || {};

DC.brand = {
  color: {
    studio: "#0D1117",          // plateau « avant l'antenne »
    studio2: "#141B24",         // panneaux sur fond studio
    vertInstitution: "#006837", // aplats
    vertSignal: "#00A859",      // traits, guillemets, accents
    jauneOnde: "#FFD100",       // ondes, chiffres-clés, 1 emphase par scène
    rougeRec: "#E31E24",        // uniquement le point REC / l'épingle
    gris: "#9C9C9C",            // labels secondaires (gris de l'ellipse du logo)
    papier: "#F7F7F5",          // fond du plan final
    encre: "#111111",           // guillemets du logo sur fond papier
    blanc: "#FFFFFF",
  },
  font: {
    titre: "Syne",              // assets/fonts/Syne-Bold.ttf
    texte: "Inter",             // assets/fonts/Inter-*.ttf
  },
  // courbes cubic-bezier (x1, y1, x2, y2) — voir src/utils/ease.js
  ease: {
    signalOut: [0.16, 1, 0.3, 1],   // reveals, masques
    glide: [0.76, 0, 0.24, 1],      // transitions, caméra
    press: [0.7, 0, 0.84, 0],       // sorties rapides, chutes
    land: [0.34, 1.56, 0.64, 1],    // poses avec léger dépassement
    soft: [0.45, 0, 0.55, 1],       // dérives lentes
  },
  grain: 0.05,                      // opacité du grain sur fond sombre
};
