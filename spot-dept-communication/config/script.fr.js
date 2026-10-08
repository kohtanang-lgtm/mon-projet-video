/* Textes à l'écran (français). La voix off est dans tools/audio/build_vo.py (GROUPS).
   Changer un texte ici ne demande aucune modification d'animation. */
window.DC = window.DC || {};

DC.script = {
  stats: {
    // ⚠ À METTRE À JOUR le jour de la diffusion avec le nombre exact d'abonnés de la page.
    followers: 10000,
    followersPrefix: "+",
    followersLabel: "ABONNÉS",
    followersSub: "SUR NOS RÉSEAUX",
  },
  chapters: {
    s1: "UNIVERSITÉ DE NGAOUNDÉRÉ · FALSH",
    s2: "IMMERSION PRATIQUE",
    s4: "EXCELLENCE ACADÉMIQUE",
    s6: "NOTRE MÉTHODE",
    s8: "NOUS REJOINDRE",
  },
  s1: {
    kicker: "FACULTÉ DES ARTS, LETTRES ET SCIENCES HUMAINES",
    uniA: "UNIVERSITÉ DE",
    uniB: "NGAOUNDÉRÉ",
    title: ["UN DÉPARTEMENT", "FAIT PARLER", "DE LUI."],
    titlePortrait: ["UN", "DÉPARTEMENT", "FAIT PARLER", "DE LUI."],
  },
  s2: {
    gaugeLabel: "D'IMMERSION PRATIQUE",
    lineA: "PAS DE THÉORIE",
    lineB: "DANS LE",
    hollow: "VIDE.",
  },
  s3: {
    left: { kicker: "DES", title: "AMPHIS", tag: "LA THÉORIE" },
    right: { kicker: "AUX", title: "STUDIOS", tag: "LA PRATIQUE" },
    welcome: "BIENVENUE AU",
    nameA: "DÉPARTEMENT DE",
    nameB: "COMMUNICATION",
  },
  s4: {
    kicker: "LES PROFESSIONNELS DE DEMAIN",
    lineA: ["NE", "NAISSENT", "PAS"],
    lineB: "ILS SE FORMENT.",
  },
  s5: {
    a: { kicker: "DES ÉTUDIANTS", title: "AGUERRIS." },
    b: { kicker: "DES PARTENAIRES", title: "RASSURÉS." },
    statementA: "DES TALENTS",
    statementB: "PRÊTS POUR LE MARCHÉ.",
  },
  s6: {
    secret: "NOTRE SECRET",
    panels: [
      { n: "01", kicker: "ENSEIGNANTS-CHERCHEURS", title: ["JOURNALISME", "NUMÉRIQUE"], media: "p1", illus: "journalisme" },
      { n: "02", kicker: "MATÉRIEL DE POINTE", title: ["PRODUCTION", "AUDIOVISUELLE"], media: "p2", illus: "production" },
      { n: "03", kicker: "SUIVI PERSONNALISÉ", title: ["STRATÉGIE", "DIGITALE"], media: "p3", illus: "strategie" },
    ],
    licence: "LICENCE PRO",
    licenceSub: "JOURNALISME & CULTURE NUMÉRIQUE",
    master: "MASTER",
  },
  s7: { lineA: "TOUT EST RÉUNI", lineB: "POUR FAIRE LA", emphasis: "DIFFÉRENCE." },
  s8: {
    kicker: "REJOIGNEZ-NOUS",
    place: "CAMPUS DE DANG",
    city: "NGAOUNDÉRÉ",
    region: "ADAMAOUA · CAMEROUN",
  },
  s9: { lineA: "VOTRE AVENIR", lineB: "MÉRITE", emphasis: "L'EXCELLENCE." },
  s10: {
    tagline: ["VOTRE", "HISTOIRE", "COMMENCE", "ICI."],
    endorsement: "FALSH · UNIVERSITÉ DE NGAOUNDÉRÉ",
    follow: "SUIVEZ-NOUS SUR NOS RÉSEAUX",
  },
};
