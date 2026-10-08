/* Emplacements photo / B-roll.
   null  → illustration graphique animée (version actuelle, aucune photo fournie).
   "assets/images/xxx.jpg" → la photo remplace l'illustration (recadrage, étalonnage et
   mouvement appliqués automatiquement). Photos idéales : ≥ 2000 px, sujet centré. */
window.DC = window.DC || {};

DC.media = {
  amphi: null,        // S3 — amphithéâtre plein, plan large
  studios: null,      // S3 — studio : caméra, micro, étudiant(e) en tournage
  etudiants: null,    // S5 — groupe d'étudiant(e)s en situation de travail
  partenaires: null,  // S5 — rencontre avec un partenaire / professionnel
  p1: null,           // S6 — enseignant(e) avec étudiant(e)s (journalisme)
  p2: null,           // S6 — matériel : caméra, console, micro
  p3: null,           // S6 — accompagnement en tête-à-tête devant un écran
};
