/* Aides DOM / SVG et découpage typographique. */
(function () {
  const DC = (window.DC = window.DC || {});
  const SVGNS = "http://www.w3.org/2000/svg";

  DC.el = function (tag, opts, parent) {
    const n = document.createElement(tag);
    opts = opts || {};
    if (opts.cls) n.className = opts.cls;
    if (opts.text != null) n.textContent = opts.text;
    if (opts.html != null) n.innerHTML = opts.html;
    if (opts.style) Object.assign(n.style, opts.style);
    if (opts.attrs) for (const k in opts.attrs) n.setAttribute(k, opts.attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  DC.svg = function (tag, attrs, parent) {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs || {}) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  /** Calque absolu plein cadre. */
  DC.layer = function (parent, cls, style) {
    return DC.el("div", { cls: "layer " + (cls || ""), style: style }, parent);
  };

  /** Bloc positionné (x, y = coin haut-gauche en px du format). */
  DC.box = function (parent, x, y, style, cls) {
    return DC.el("div", { cls: "box " + (cls || ""), style: Object.assign({ left: x + "px", top: y + "px" }, style || {}) }, parent);
  };

  /**
   * Ligne de texte révélable par masque : renvoie { line, words: [inner spans] }.
   * Chaque mot est enveloppé dans un masque (overflow hidden) pour un reveal de bas en haut.
   */
  DC.maskLine = function (parent, text, style, cls) {
    const line = DC.el("div", { cls: "mline " + (cls || ""), style: style }, parent);
    const words = [];
    text.split(" ").forEach((w, i, arr) => {
      const m = DC.el("span", { cls: "mask" }, line);
      const inner = DC.el("span", { cls: "inner", text: w }, m);
      words.push(inner);
      if (i < arr.length - 1) DC.el("span", { cls: "space", html: "&nbsp;" }, line);
    });
    return { line, words };
  };

  /** Lettres individuelles (pour assemblages lettre à lettre). */
  DC.charLine = function (parent, text, style, cls) {
    const line = DC.el("div", { cls: "cline " + (cls || ""), style: style }, parent);
    const chars = [];
    for (const ch of text) {
      if (ch === " ") {
        DC.el("span", { cls: "space", html: "&nbsp;" }, line);
        continue;
      }
      const c = DC.el("span", { cls: "ch" }, line);
      const top = DC.el("span", { cls: "half top", text: ch }, c);
      const bot = DC.el("span", { cls: "half bot", text: ch }, c);
      DC.el("span", { cls: "ghost", text: ch }, c);
      chars.push({ c, top, bot });
    }
    return { line, chars };
  };

  DC.fmtThousands = function (n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
})();
