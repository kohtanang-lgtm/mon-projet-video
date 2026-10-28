import data from './data/voixOff.json';

// Timeline pilotée par la voix off : toutes les animations se calent sur ces repères.

export const FPS = data.fps;
export const DECALAGE_VO = data.decalage; // la voix démarre à 0,4 s dans la vidéo
export const FICHIER_VO = data.fichier;
export const DUREE_TOTALE = data.dureeTotale;
export const DUREE_TRANSITION = data.transition;
export const DUREE_FONDU = data.fondu;

export const R = data.reperes;
export type Repere = keyof typeof R;

export const ORDRE = ['accroche', 'trajet', 'verifier', 'agent', 'justificatif', 'sourire', 'fin'] as const;
export type CleScene = (typeof ORDRE)[number];
export const DEBUT: Record<CleScene, number> = data.scenes;

// Image de la vidéo correspondant à un instant de la voix off (en secondes).
export const img = (t: number) => Math.round((t + DECALAGE_VO) * FPS);
// Même chose, mais en images locales à une scène.
export const loc = (scene: CleScene, t: number) => img(t) - DEBUT[scene];

// Transition qui suit chaque scène : balayage en flèche, sauf le fondu sourire → logo.
export const transitionApres = (cle: CleScene) => (cle === 'sourire' ? DUREE_FONDU : DUREE_TRANSITION);

export const DUREES = Object.fromEntries(
  ORDRE.map((cle, i) => {
    const fin = i < ORDRE.length - 1 ? DEBUT[ORDRE[i + 1]] + transitionApres(cle) : DUREE_TOTALE;
    return [cle, fin - DEBUT[cle]];
  }),
) as Record<CleScene, number>;

// Plages de parole (images absolues), pour baisser la musique quand la voix parle.
export const PAROLE: [number, number][] = data.parole.map(([a, b]) => [img(a), img(b)]);
