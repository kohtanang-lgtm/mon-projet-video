/* Résolution des repères : DC.T("prat_a.start+0.66") → secondes.
   Les repères viennent de config/timeline.js (générés depuis la voix off). */
(function () {
  const DC = (window.DC = window.DC || {});

  const letters = (s) => (s.match(/[\p{L}\p{N}]/gu) || []).length;

  /** Instant estimé d'un mot dans une phrase (débit supposé régulier au sein de la phrase). */
  DC.wordTime = function (cueId, word) {
    const cue = DC.timeline.cues[cueId];
    if (!cue) throw new Error("Repère inconnu : " + cueId);
    const i = cue.text.toLowerCase().indexOf(word.toLowerCase());
    if (i < 0) throw new Error(`Mot « ${word} » absent de « ${cue.text} »`);
    const before = letters(cue.text.slice(0, i)) + 1.5, total = letters(cue.text) + 3;
    return cue.start + (before / total) * (cue.end - cue.start);
  };

  /** "cue.start|end±x" ou "cue@mot±x" → secondes. */
  DC.T = function (expr) {
    if (typeof expr === "number") return expr;
    const s = String(expr).trim();
    const w = s.match(/^(\w+)@(.+?)([+-][\d.]+)?$/u);
    if (w) return DC.wordTime(w[1], w[2]) + parseFloat(w[3] || "0");
    const m = s.replace(/\s/g, "").match(/^(\w+)\.(start|end)([+-][\d.]+)?$/);
    if (!m) throw new Error("Repère invalide : " + expr);
    const cue = DC.timeline.cues[m[1]];
    if (!cue) throw new Error("Repère inconnu : " + m[1]);
    return cue[m[2]] + parseFloat(m[3] || "0");
  };

  /** Bornes des scènes (début inclus, fin exclue), toutes dérivées des repères de la voix. */
  DC.scenes = function () {
    const T = DC.T;
    const b = [
      0,
      T("prat_a.start-0.25"),
      T("studios.start-0.2"),
      T("pros_a.start-0.2"),
      T("aud_a.start-0.15"),
      T("secret.start-0.25"),
      T("reuni.start-0.2"),
      T("join_a.start-0.2"),
      T("avenir.start-0.2"),
      T("sig_a.start-0.2"),
      DC.timeline.duration,
    ];
    const out = {};
    for (let i = 0; i < 10; i++) out["s" + (i + 1)] = [b[i], b[i + 1]];
    return out;
  };
})();
