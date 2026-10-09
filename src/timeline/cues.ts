import voiceover from "./voiceover.json";

/**
 * Maître du temps : toute la mise en scène est calée sur la voix-off.
 * Les temps (en secondes, temps vidéo) sont lus dans voiceover.json, produit par
 * scripts/align_voiceover.py. Remplacer la voix-off puis relancer `npm run align`
 * suffit à resynchroniser tout le film.
 */

/** Pré-roll visuel avant la première syllabe (ouverture « à froid »). */
export const VO_OFFSET = 0.8;
/** Durée totale du spot (pack-shot final tenu ~4 s après la dernière syllabe). */
export const TOTAL_DURATION = 51;

type Word = (typeof voiceover.words)[number];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9/'.-]/g, "")
    .replace(/[.,:;?!…]+$/, "");

const findWord = (text: string, occurrence = 1): Word => {
  const target = normalize(text);
  const hits = voiceover.words.filter((w) => normalize(w.text) === target);
  const hit = hits[occurrence - 1];
  if (!hit) {
    throw new Error(`Mot « ${text} » (occurrence ${occurrence}) introuvable dans voiceover.json`);
  }
  return hit;
};

/** Début du mot en temps vidéo (s). */
export const at = (text: string, occurrence = 1) => findWord(text, occurrence).start + VO_OFFSET;
/** Fin du mot en temps vidéo (s). */
export const end = (text: string, occurrence = 1) => findWord(text, occurrence).end + VO_OFFSET;

/**
 * Retrouve une suite de mots consécutifs de la voix-off et renvoie, pour chacun,
 * le texte à afficher (casse/ponctuation libres) et son instant d'attaque.
 * `after` permet de viser une occurrence ultérieure (temps vidéo).
 */
export const say = (phrase: string, after = 0): { text: string; at: number }[] => {
  // « ambitions ? » : la ponctuation haute isolée reste collée au mot (espace insécable)
  const tokens = phrase
    .split(/\s+/)
    .filter(Boolean)
    .reduce<string[]>((acc, tok) => {
      if (/^[?!:;]+$/.test(tok) && acc.length) acc[acc.length - 1] += `\u00a0${tok}`;
      else acc.push(tok);
      return acc;
    }, []);
  const wanted = tokens.map(normalize);
  const words = voiceover.words;
  for (let i = 0; i + tokens.length <= words.length; i++) {
    if (words[i].start + VO_OFFSET < after) continue;
    if (wanted.every((w, k) => normalize(words[i + k].text) === w)) {
      return tokens.map((text, k) => ({ text, at: words[i + k].start + VO_OFFSET }));
    }
  }
  throw new Error(`Phrase « ${phrase} » introuvable dans voiceover.json`);
};

export const VO_END = voiceover.groups[voiceover.groups.length - 1].end + VO_OFFSET;

/** Repères nommés utilisés par les scènes (temps vidéo, en secondes). */
export const CUE = {
  // — S1 · Ambition —
  avenir: at("L'avenir"),
  construit: at("construit"),
  ceux: at("ceux"),
  osent: at("osent"),
  voir: at("voir"),
  grand: at("grand"),
  grandEnd: end("grand"),
  et: at("Et"),
  banque: at("banque"),
  reflet: at("reflet"),
  ambitions: at("ambitions"),
  ambitionsEnd: end("ambitions"),

  // — S2 · Particuliers —
  particuliers: at("Particuliers"),
  familles: at("familles"),
  batisseurs: at("bâtisseurs"),
  quotidienEnd: end("quotidien"),
  uba: at("UBA"),
  accompagne: at("accompagne"),
  solutions: at("solutions"),
  proximite: at("proximité"),
  comptes: at("comptes"),
  style: at("style"),
  cartes: at("cartes"),
  securisees: at("sécurisées"),
  chaque: at("chaque"),
  instantEnd: end("instant"),

  // — S3 · Banque digitale —
  plus: at("Plus", 2), // 1re occurrence : « voir plus grand »
  attendre: at("d'attendre"),
  prenez: at("Prenez"),
  controle: at("contrôle"),
  doigts: at("bout"),
  doigtsEnd: end("doigts"),
  ouvrez: at("Ouvrez"),
  minutes: at("quelques"),
  consultez: at("consultez"),
  soldes: at("soldes"),
  tempsReel: at("temps"),
  leo: at("Léo"),
  banquier: at("banquier"),
  simplifier: at("simplifier"),
  paiements: at("paiements"),
  transferts: at("transferts"),
  h24: at("24h/24"),
  h24End: end("24h/24"),

  // — S4 · Corporate —
  entrepreneurs: at("Entrepreneurs"),
  pme: at("PME"),
  organisations: at("grandes"),
  organisationsEnd: end("organisations"),
  propulsez: at("propulsez"),
  sommets: at("sommets"),
  expertise: at("expertise"),
  corporate: at("Corporate"),
  financement: at("solutions", 2),
  surMesure: at("sur-mesure"),
  surMesureEnd: end("sur-mesure"),

  // — S5 · Signature —
  ubaFinal: at("UBA", 2),
  banqueGlobale: at("banque", 2),
  afriqueEnd: end("l'Afrique"),
  rejoignez: at("Rejoignez-nous"),
  url: at("ubachad.com"),
  voEnd: VO_END,
} as const;

/**
 * Fenêtres des scènes (temps vidéo). Chaque scène déborde légèrement sur la
 * suivante : les transitions sont des fondus enchaînés « match cut » où un
 * élément graphique se transforme en celui de la scène suivante.
 */
const OVERLAP = 0.5;
export const SCENES = {
  ambition: { from: 0, to: CUE.particuliers - 0.15 },
  particuliers: { from: CUE.ambitionsEnd, to: CUE.plus + 0.1 },
  digital: { from: CUE.instantEnd - 0.05, to: CUE.entrepreneurs + OVERLAP },
  corporate: { from: CUE.h24End - 0.05, to: CUE.ubaFinal + OVERLAP },
  signature: { from: CUE.surMesureEnd - 0.1, to: TOTAL_DURATION },
} as const;

export type SceneWindow = { from: number; to: number };
