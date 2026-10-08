/* Logo animé (calques officiels), carte du Cameroun, aides typographiques. */
(function () {
  const DC = (window.DC = window.DC || {});

  /** Révèle des mots masqués (voir DC.maskLine). */
  DC.reveal = function (tl, targets, t, o) {
    o = o || {};
    tl.to(targets, { yPercent: 0, duration: o.dur || 0.55, ease: o.ease || DC.ease.signalOut, stagger: o.stagger == null ? 0.07 : o.stagger }, t);
  };
  DC.exitUp = function (tl, targets, t, o) {
    o = o || {};
    tl.to(targets, { yPercent: -115, duration: o.dur || 0.3, ease: o.ease || DC.ease.press, stagger: o.stagger == null ? 0.025 : o.stagger }, t);
  };
  DC.hideWords = function (words) {
    gsap.set(words, { yPercent: 115 });
  };

  /** Texte Syne/Inter positionné, en lignes masquées. Renvoie { el, lines:[{line, words}], words }. */
  DC.textBlock = function (parent, lines, o) {
    const el = DC.el("div", { cls: "box", style: Object.assign({ left: o.x + "px", top: o.y + "px", textAlign: o.align || "left" }, o.style || {}) }, parent);
    if (o.align === "center") Object.assign(el.style, { left: "0px", width: "100%" });
    if (o.align === "right") Object.assign(el.style, { left: "auto", right: o.x + "px" });
    const out = { el, lines: [], words: [] };
    lines.forEach((ln, i) => {
      const spec = typeof ln === "string" ? { text: ln } : ln;
      const style = Object.assign({ fontSize: (spec.size || o.size) + "px", justifyContent: o.align === "center" ? "center" : o.align === "right" ? "flex-end" : "flex-start", marginTop: i ? (o.gap || 0) + "px" : "0px" }, spec.style || {});
      const l = DC.maskLine(el, spec.text, style, spec.cls || o.cls || "syne");
      if (spec.color) l.words.forEach((w) => (w.style.color = spec.color));
      out.lines.push(l);
      out.words.push(...l.words);
    });
    DC.hideWords(out.words);
    return out;
  };

  /** Logo du Département construit à partir de ses calques (assets/brand/layers). */
  DC.logo = function (parent, o) {
    const meta = DC.logoLayers;
    const s = o.h / meta.height;
    const w = meta.width * s;
    if (o.cx != null) {
      const ls0 = Object.values(meta.layers);
      const ux0 = (Math.min(...ls0.map((m) => m.x0)) + Math.max(...ls0.map((m) => m.x1))) / 2;
      o.x = o.cx - ux0 * s;
    }
    const wrap = DC.el("div", { cls: "box", style: { left: o.x + "px", top: o.y + "px", width: w + "px", height: o.h + "px" } }, parent);
    const order = ["ellipse", "bubble", "book", "ribbon", "d", "c", "dots", "waves", "caption", "board", "tassel", "quote_l", "quote_r"];
    const L = {};
    order.forEach((k) => {
      const m = meta.layers[k];
      const img = DC.el("img", { attrs: { src: `assets/brand/layers/dc_${k}.png` }, style: {
        position: "absolute", left: "0px", top: "0px", width: "100%", height: "100%",
        transformOrigin: `${(m.cx / meta.width) * 100}% ${(m.cy / meta.height) * 100}%`,
      } }, wrap);
      L[k] = img;
    });
    // le gland pivote depuis son attache sur le plateau
    L.tassel.style.transformOrigin = `${(652 / meta.width) * 100}% ${(184 / meta.height) * 100}%`;
    // centre optique : union des boîtes des calques
    const ls = Object.values(meta.layers);
    const ux = (Math.min(...ls.map((m) => m.x0)) + Math.max(...ls.map((m) => m.x1))) / 2;
    const uy = (Math.min(...ls.map((m) => m.y0)) + Math.max(...ls.map((m) => m.y1))) / 2;
    const box = (k) => {
      const m = meta.layers[k];
      return { x: o.x + m.x0 * s, y: o.y + m.y0 * s, w: (m.x1 - m.x0) * s, h: (m.y1 - m.y0) * s, cx: o.x + ((m.x0 + m.x1) / 2) * s, cy: o.y + ((m.y0 + m.y1) / 2) * s };
    };
    return { el: wrap, layers: L, scale: s, w, box, center: { x: ux * s, y: uy * s } };
  };

  /** Carte du Cameroun (tracé Natural Earth) — renvoie aussi la position écran de Ngaoundéré. */
  DC.cameroon = function (parent, o) {
    const m = DC.mapCameroon;
    const vw = m.viewBox[2], vh = m.viewBox[3];
    const k = o.h / vh;
    const w = vw * k;
    const s = DC.svg("svg", { width: w, height: o.h, viewBox: `0 0 ${vw} ${vh}` }, parent);
    Object.assign(s.style, { position: "absolute", left: o.x + "px", top: o.y + "px" });
    const fill = DC.svg("path", { d: m.d, fill: DC.brand.color.vertSignal, opacity: 0 }, s);
    const line = DC.svg("path", { d: m.d, fill: "none", stroke: DC.brand.color.vertSignal, "stroke-width": 3 / k, "stroke-linejoin": "round", pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 }, s);
    return { svg: s, fill, line, w, pin: { x: o.x + m.pin[0] * k, y: o.y + m.pin[1] * k } };
  };
})();
