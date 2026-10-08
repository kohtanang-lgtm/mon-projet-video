/* Les motifs du système visuel : le Point, l'Onde, les Guillemets, le Losange, le Trait.
   Chacun est une pièce du logo ; le film les fait converger vers la marque à la fin. */
(function () {
  const DC = (window.DC = window.DC || {});

  // Un guillemet « 6 » (boule en bas, queue vers le haut à droite) dans une boîte 100×122.
  const MARK = "M4,84 A34,34 0 0 0 72,84 A34,34 0 0 0 52.4,53.2 C54,36 66,19 92,6 L86,0 C52,12 16,40 4,76 Z";

  /** Guillemets ouvrants “ (open=true) ou fermants ” (rotation 180°). */
  DC.quoteMark = function (parent, opts) {
    const h = opts.size;
    const w = h * (196 / 122);
    const s = DC.svg("svg", { width: w, height: h, viewBox: "0 0 196 122" }, parent);
    const g = DC.svg("g", opts.open === false ? { transform: "rotate(180 98 61)" } : {}, s);
    DC.svg("path", { d: MARK, fill: opts.color }, g);
    DC.svg("path", { d: MARK, fill: opts.color, transform: "translate(100 0)" }, g);
    s.style.position = "absolute";
    return s;
  };

  /** Arc de cercle (degrés, 0 = 3 h, sens horaire) — tracé dessinable (pathLength = 1). */
  DC.arcPath = function (cx, cy, r, a0, a1) {
    const rad = (a) => (a * Math.PI) / 180;
    const x0 = cx + r * Math.cos(rad(a0)), y0 = cy + r * Math.sin(rad(a0));
    const x1 = cx + r * Math.cos(rad(a1)), y1 = cy + r * Math.sin(rad(a1));
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
  };

  /** Ondes concentriques ouvertes à droite (géométrie du « C » du logo). */
  DC.ondes = function (svg, cx, cy, radii, opts) {
    const gap = opts.gap == null ? 70 : opts.gap;
    return radii.map((r) =>
      DC.svg("path", {
        d: opts.full ? DC.arcPath(cx, cy, r, -90, 269.9) : DC.arcPath(cx, cy, r, gap / 2, 360 - gap / 2),
        fill: "none", stroke: opts.color, "stroke-width": opts.width || 6, "stroke-linecap": "round",
        pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1,
      }, svg)
    );
  };

  /** Petit mortier (losange + calotte + gland) — motif « académique ». */
  DC.mortarboard = function (parent, opts) {
    const w = opts.size;
    const s = DC.svg("svg", { width: w, height: w * 0.8, viewBox: "0 0 200 160" }, parent);
    s.style.position = "absolute";
    const c = opts.color;
    DC.svg("path", { d: "M100,10 L196,50 L100,90 L4,50 Z", fill: c }, s);
    DC.svg("path", { d: "M46,70 L46,112 C70,128 130,128 154,112 L154,70 L100,92 Z", fill: c, opacity: 0.82 }, s);
    const tassel = DC.svg("g", {}, s);
    DC.svg("path", { d: "M100,50 L176,58 L176,118", fill: "none", stroke: opts.tassel || c, "stroke-width": 5 }, tassel);
    DC.svg("path", { d: "M170,116 L182,116 L186,148 L166,148 Z", fill: opts.tassel || c }, tassel);
    return { svg: s, tassel };
  };

  /** Contour de bulle (ellipse + queue) inspiré du logo. */
  DC.bubblePath = function (cx, cy, rx, ry) {
    const k = 0.5523;
    const tx = cx + rx * 0.05, ty = cy + ry;
    return [
      `M${cx - rx},${cy}`,
      `C${cx - rx},${cy - ry * k} ${cx - rx * k},${cy - ry} ${cx},${cy - ry}`,
      `C${cx + rx * k},${cy - ry} ${cx + rx},${cy - ry * k} ${cx + rx},${cy}`,
      `C${cx + rx},${cy + ry * k} ${cx + rx * k},${cy + ry} ${tx + rx * 0.12},${ty}`,
      `L${tx + rx * 0.02},${ty + ry * 0.32}`,
      `L${tx - rx * 0.1},${ty - ry * 0.01}`,
      `C${cx - rx * k},${cy + ry} ${cx - rx},${cy + ry * k} ${cx - rx},${cy}`,
    ].join(" ");
  };

  /** Grain filmique déterministe (tuile feTurbulence décalée par paliers). */
  DC.grain = function (root, tl, ctx) {
    const tile = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.6 -0.3"/></filter><rect width="256" height="256" filter="url(#n)"/></svg>`
    );
    const g = DC.el("div", { cls: "grain", style: { backgroundImage: `url("data:image/svg+xml,${tile}")`, opacity: DC.brand.grain } }, root);
    const steps = Math.round(ctx.D * 12);
    tl.fromTo(g, { backgroundPosition: "0px 0px" }, { backgroundPosition: `${-97 * steps}px ${-61 * steps}px`, duration: ctx.D, ease: `steps(${steps})` }, 0);
    const v = DC.el("div", { cls: "vignette", style: { background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)" } }, root);
    return { grain: g, vignette: v };
  };

  /** Bandeau de chapitre (haut gauche) : guillemet + libellé qui roule. */
  DC.chapterBug = function (root, ctx) {
    const F = ctx.F;
    const bug = DC.el("div", { cls: "bug", style: { left: F.bug.x + "px", top: F.bug.y + "px" } }, root);
    const qWrap = DC.el("div", { style: { position: "relative", width: 52 + "px", height: 32 + "px" } }, bug);
    const q = DC.quoteMark(qWrap, { size: 32, color: DC.brand.color.vertSignal, open: true });
    const labels = DC.el("div", { cls: "bug-labels inter", style: { fontSize: F.type.label + "px", letterSpacing: "0.24em" } }, bug);
    let current = null;
    return {
      el: bug, quote: q, quoteWrap: qWrap,
      label(tl, t, text) {
        const span = DC.el("span", { cls: "bug-label", text }, labels);
        if (current) tl.to(current, { yPercent: -110, y: 0, duration: 0.35, ease: DC.ease.press }, t);
        tl.fromTo(span, { y: 0, yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: DC.ease.signalOut, immediateRender: false }, t + 0.12);
        current = span;
      },
      hideLabel(tl, t) {
        if (current) tl.to(current, { yPercent: -110, duration: 0.35, ease: DC.ease.press }, t);
        current = null;
      },
    };
  };
})();
