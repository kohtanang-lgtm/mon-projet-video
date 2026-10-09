import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const FONT_FILES: { family: string; weight: string; file: string }[] = [
  { family: "Montserrat", weight: "500", file: "montserrat-latin-500-normal.woff2" },
  { family: "Montserrat", weight: "600", file: "montserrat-latin-600-normal.woff2" },
  { family: "Montserrat", weight: "700", file: "montserrat-latin-700-normal.woff2" },
  { family: "Montserrat", weight: "800", file: "montserrat-latin-800-normal.woff2" },
  { family: "Inter", weight: "400", file: "inter-latin-400-normal.woff2" },
  { family: "Inter", weight: "500", file: "inter-latin-500-normal.woff2" },
  { family: "Inter", weight: "600", file: "inter-latin-600-normal.woff2" },
  { family: "Inter", weight: "700", file: "inter-latin-700-normal.woff2" },
];

/** Charge toutes les polices ; loadFont bloque le rendu tant qu'elles ne sont pas prêtes. */
export const loadFonts = () =>
  Promise.all(
    FONT_FILES.map(({ family, weight, file }) =>
      loadFont({ family, weight, url: staticFile(`fonts/${file}`), format: "woff2" }),
    ),
  );
