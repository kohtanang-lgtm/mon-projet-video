import {Easing} from 'remotion';

// Couleurs relevées sur l'affiche officielle et le logo.
export const C = {
  blue: '#204095',
  blueDeep: '#0D2266',
  blueNight: '#081548',
  blueLogo: '#3B4293',
  red: '#E30613',
  redDeep: '#A8000C',
  cyan: '#15A2E0',
  cyanLight: '#6FD0FF',
  navy: '#1B2A6B',
  white: '#FFFFFF',
  ink: '#0B1640',
};

export const F = {
  display: 'Anton, Impact, sans-serif',
  sans: 'Montserrat, Arial, sans-serif',
  round: 'Nunito, Montserrat, sans-serif',
  script: '"Kaushan Script", cursive',
};

// Grille rythmique : 120 BPM à 30 i/s -> 1 temps = 15 images, 1 mesure = 60 images.
// Le premier temps fort (impact du « ! ») tombe à l'image 15.
export const FPS = 30;
export const BEAT = 15;
export const BAR = 60;
export const GRID_OFFSET = 15;
export const bar = (k: number) => GRID_OFFSET + BAR * k;

// Découpage des scènes (images absolues).
export const SCENES = {
  hook: {from: 0, to: bar(1)},
  imagine: {from: bar(1), to: bar(4)},
  logo: {from: bar(4), to: bar(7)},
  theme: {from: bar(7), to: bar(10)},
  day1: {from: bar(10), to: bar(13)},
  day2: {from: bar(13), to: bar(16)},
  program: {from: bar(16), to: bar(18)},
  date: {from: bar(18), to: bar(20)},
  team: {from: bar(20), to: bar(23)},
  outro: {from: bar(23), to: bar(25.5)},
} as const;

export const TOTAL_FRAMES = SCENES.outro.to;

// Courbes d'animation.
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1); // expo out
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0); // expo in
export const EASE_IN_OUT = Easing.bezier(0.83, 0, 0.17, 1);
export const EASE_BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

// Angle signature du logo (il est incliné de 7°).
export const TILT = -7;
