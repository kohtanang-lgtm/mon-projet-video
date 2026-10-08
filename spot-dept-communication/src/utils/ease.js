/* Courbes cubic-bezier utilisables directement comme `ease` GSAP, plus un ressort amorti. */
(function () {
  const DC = (window.DC = window.DC || {});

  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return function (p) {
      if (p <= 0) return 0;
      if (p >= 1) return 1;
      let t = p;
      for (let i = 0; i < 8; i++) {
        const e = sx(t) - p;
        const d = dx(t);
        if (Math.abs(e) < 1e-6) break;
        if (Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      if (t < 0 || t > 1 || Math.abs(sx(t) - p) > 1e-4) {
        let lo = 0, hi = 1;
        t = p;
        for (let i = 0; i < 30; i++) {
          if (sx(t) < p) lo = t; else hi = t;
          t = (lo + hi) / 2;
        }
      }
      return sy(t);
    };
  }

  DC.bezier = bezier;
  DC.ease = {};
  const tokens = (DC.brand && DC.brand.ease) || {};
  for (const k in tokens) DC.ease[k] = bezier.apply(null, tokens[k]);

  /** Ressort amorti : oscille autour de 1 (pour gland du mortier, poses vivantes). */
  DC.ease.spring = function (p) {
    return 1 - Math.exp(-5.2 * p) * Math.cos(p * Math.PI * 4.2);
  };
  /** Oscillation qui s'éteint (valeur finale 0) : pour rotations de balancier. */
  DC.ease.swing = function (p) {
    return Math.exp(-4.2 * p) * Math.sin(p * Math.PI * 5);
  };
})();
