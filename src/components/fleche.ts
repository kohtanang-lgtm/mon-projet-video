// Géométrie de la flèche du logo Tahwiil (pointe en haut, encoche en bas).
// Mesurée sur le logo : largeur ≈ 1,06 × hauteur, encoche à 76 % de la hauteur.
export const DEMI_LARGEUR = 0.53;
export const ENCOCHE = 0.76;

export type Point = [number, number];

// Points (pointe, coin droit, encoche, coin gauche) d'une flèche centrée sur (cx, cy).
export const pointsFleche = (cx: number, cy: number, h: number): Point[] => [
  [cx, cy - h / 2],
  [cx + DEMI_LARGEUR * h, cy + h / 2],
  [cx, cy - h / 2 + ENCOCHE * h],
  [cx - DEMI_LARGEUR * h, cy + h / 2],
];

export const cheminPoints = (pts: Point[]) =>
  `M ${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')} Z`;

export const cheminFleche = (cx: number, cy: number, h: number) => cheminPoints(pointsFleche(cx, cy, h));
