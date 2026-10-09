/* S6–S7 — LE SECRET : la bulle, la plongée, le triptyque, le parcours Licence Pro → Master,
   puis « tout est réuni » (tous les éléments convergent en un point). */
(DC.sceneBuilders = DC.sceneBuilders || []).push(function s06(ctx) {
  const { tl, C, E, T, F, W, H, L, pick, txt } = ctx;
  const sc = ctx.scene("s6", { bg: C.vertInstitution, until: ctx.S.s7[1], post: 0.02, push: 0.02 });
  const t0 = sc.t0;
  ctx.chapter.label(tl, t0 + 0.12, txt.chapters.s6);

  // --- 6a. « Notre secret ? » dans la bulle
  const bx = W / 2, by = H / 2 - 20, rx = pick(450, 420), ry = pick(200, 230);
  const bub = DC.el("div", { cls: "layer" }, sc.cam);
  const bsvg = DC.svg("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, bub);
  bsvg.style.position = "absolute";
  const outline = DC.svg("path", { d: DC.bubblePath(bx, by, rx, ry), fill: "none", stroke: "#fff", "stroke-width": 5, "vector-effect": "non-scaling-stroke", "stroke-linejoin": "round", pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 }, bsvg);
  const sec = DC.el("div", { cls: "box syne", style: { left: "0px", width: W + "px", top: by - pick(34, 30) + "px", textAlign: "center", fontSize: pick(66, 58) + "px", lineHeight: "1" } }, bub);
  DC.el("span", { text: txt.s6.secret }, sec);
  DC.el("span", { text: " ?", style: { color: C.jauneOnde } }, sec);
  const s0 = T("secret.start");
  tl.to(outline, { strokeDashoffset: 0, duration: 0.6, ease: E.signalOut }, s0);
  tl.fromTo(sec, { opacity: 0, letterSpacing: "0.4em" }, { opacity: 1, letterSpacing: "0.02em", duration: 0.8, ease: E.signalOut }, s0 + 0.05);
  // plongée dans la bulle, sur le drop
  const drop = T("p1.start");
  tl.to(bub, { scale: 9, transformOrigin: `${bx}px ${by}px`, duration: 0.42, ease: E.press }, drop - 0.42);
  tl.to(bub, { opacity: 0, duration: 0.08 }, drop - 0.08);

  // --- 6b. triptyque (masques en losange du mortier)
  const tri = DC.el("div", { cls: "layer" }, sc.cam);
  tl.fromTo(tri, { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: E.signalOut }, drop - 0.02);
  const pw = pick(530, 900), ph = pick(600, 330);
  const ang = pick(12, 8);
  const skew = Math.tan((ang * Math.PI) / 180) * ph;
  const pos = L ? [[140, 240], [690, 240], [1240, 240]] : [[90, 300], [90, 670], [90, 1040]];
  const starts = ["p1.start", "p2.start", "p3.start"].map(T);
  const panels = txt.s6.panels.map((spec, i) => {
    const [x, y] = pos[i];
    const wrap = DC.el("div", { cls: "box", style: { left: x + "px", top: y + "px", width: pw + "px", height: ph + "px" } }, tri);
    const media = DC.mediaPanel(wrap, spec.media, spec.illus, { left: "0px", top: "0px", width: pw + "px", height: ph + "px" });
    DC.el("div", { cls: "layer", style: { background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(5,10,14,0.82) 100%)" } }, media.el);
    const shade = DC.el("div", { cls: "layer", style: { background: "rgba(0,40,22,0.62)", opacity: 0 } }, media.el);
    const full = `polygon(${skew}px 0px, ${pw}px 0px, ${pw - skew}px ${ph}px, 0px ${ph}px)`;
    media.el.style.clipPath = `polygon(${skew}px 0px, ${skew}px 0px, 0px ${ph}px, 0px ${ph}px)`;
    const num = DC.el("div", { cls: "box syne", text: spec.n, style: { left: skew + 26 + "px", top: "22px", fontSize: pick(56, 50) + "px", color: C.jauneOnde } }, media.el);
    const tb = DC.textBlock(media.el, [
      { text: spec.kicker, size: pick(15, 18), cls: "inter", style: { color: "rgba(255,255,255,0.9)", letterSpacing: "0.16em" } },
      ...(L ? spec.title.map((t) => ({ text: t, size: 36 })) : [{ text: spec.title.join(" "), size: 44 }]),
    ], { x: pick(40, skew + 30), y: ph - pick(150, 120), gap: 6 });
    const t = starts[i];
    tl.to(media.el, { clipPath: full, duration: 0.55, ease: E.signalOut }, t - 0.04);
    media.animate(tl, t + 0.05, 2.0);
    tl.fromTo(num, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: E.land }, t + 0.1);
    DC.reveal(tl, tb.words, t + 0.18, { stagger: 0.06 });
    return { wrap, media, shade, x, y };
  });
  // focus : le panneau actif est plein, les précédents reculent
  panels.forEach((p, i) => {
    if (i === 0) return;
    const prev = panels.slice(0, i);
    tl.to(prev.map((q) => q.shade), { opacity: 1, duration: 0.35, ease: E.soft }, starts[i] - 0.05);
    tl.to(prev.map((q) => q.wrap), { scale: 0.96, duration: 0.35, ease: E.soft }, starts[i] - 0.05);
  });

  // --- 6c. parcours Licence Pro → Master : les panneaux deviennent des jalons
  const lic = T("lic.start"), mas = T("master.start");
  const A = L ? { x: 300, y: 640 } : { x: 200, y: 1380 };
  const B = L ? { x: 1620, y: 640 } : { x: 200, y: 560 };
  const marks = [0.27, 0.5, 0.73].map((f) => ({ x: A.x + (B.x - A.x) * f, y: A.y + (B.y - A.y) * f, f }));
  panels.forEach((p, i) => {
    const cxp = p.x + pw / 2, cyp = p.y + ph / 2;
    tl.to(p.wrap, { x: marks[i].x - cxp, y: marks[i].y - cyp, scale: 0.06, opacity: 0, duration: 0.5, ease: E.glide }, lic - 0.12 + i * 0.04);
  });
  const path = DC.svg("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, sc.cam);
  path.style.position = "absolute";
  const base = DC.svg("line", { x1: A.x, y1: A.y, x2: B.x, y2: B.y, stroke: "rgba(255,255,255,0.18)", "stroke-width": 4, "stroke-dasharray": "2 14", "stroke-linecap": "round" }, path);
  const trail = DC.svg("line", { x1: A.x, y1: A.y, x2: B.x, y2: B.y, stroke: "#fff", "stroke-width": 6, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 }, path);
  const nA = DC.svg("circle", { cx: A.x, cy: A.y, r: 16, fill: "#fff" }, path);
  const nB = DC.svg("circle", { cx: B.x, cy: B.y, r: 20, fill: C.jauneOnde }, path);
  const mk = marks.map((m) => DC.svg("rect", { x: m.x - 14, y: m.y - 14, width: 28, height: 28, fill: C.vertSignal, stroke: "#fff", "stroke-width": 3, transform: `rotate(45 ${m.x} ${m.y})` }, path));
  tl.fromTo(base, { opacity: 0 }, { opacity: 1, duration: 0.3 }, lic);
  tl.fromTo(nA, { scale: 0, svgOrigin: `${A.x} ${A.y}` }, { scale: 1, duration: 0.35, ease: E.land }, lic);
  const travel = mas + 0.12 - (lic + 0.25);
  tl.to(trail, { strokeDashoffset: 0, duration: travel, ease: E.soft }, lic + 0.25);
  mk.forEach((m, i) => {
    tl.fromTo(m, { scale: 0, svgOrigin: `${marks[i].x} ${marks[i].y}` }, { scale: 1, duration: 0.3, ease: E.land }, lic + 0.05 + i * 0.05);
    tl.to(m, { fill: C.jauneOnde, duration: 0.15 }, lic + 0.25 + travel * marks[i].f);
    tl.fromTo(m, { scale: 1 }, { scale: 1.35, svgOrigin: `${marks[i].x} ${marks[i].y}`, duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }, lic + 0.25 + travel * marks[i].f);
  });
  tl.fromTo(nB, { scale: 0, svgOrigin: `${B.x} ${B.y}` }, { scale: 1, duration: 0.4, ease: E.land }, mas + 0.1);

  const licTb = DC.textBlock(sc.cam, [
    { text: txt.s6.licence, size: pick(66, 64) },
    { text: txt.s6.licenceSub, size: pick(22, 22), cls: "inter", style: { color: "rgba(255,255,255,0.9)", letterSpacing: "0.18em" } },
  ], { x: pick(A.x - 16, A.x + 50), y: pick(A.y - 150, A.y - 70), gap: pick(16, 14) });
  DC.reveal(tl, licTb.words, lic + 0.05, { stagger: 0.05 });
  const masTb = DC.textBlock(sc.cam, [{ text: txt.s6.master, size: pick(104, 96) }], L
    ? { x: W - B.x - 20, y: B.y - 160, align: "right" }
    : { x: B.x + 50, y: B.y - 50 });
  DC.reveal(tl, masTb.words, mas, { dur: 0.45 });
  // le mortier se pose sur le mot MASTER
  const capW = pick(150, 130);
  const capX = L ? B.x - 20 - capW * 1.25 : B.x + 50 + capW * 0.9;
  const capY = L ? B.y - 160 - capW * 0.62 : B.y - 50 - capW * 0.62;
  const cap = DC.mortarboard(sc.cam, { size: capW, color: "#fff", tassel: C.jauneOnde });
  Object.assign(cap.svg.style, { left: capX + "px", top: capY + "px" });
  tl.fromTo(cap.svg, { y: -260, opacity: 0, rotation: -14 }, { y: 0, opacity: 1, rotation: -8, duration: 0.3, ease: E.press }, mas - 0.18);
  tl.to(cap.svg, { rotation: -4, duration: 0.5, ease: E.land }, mas + 0.12);
  tl.fromTo(cap.tassel, { rotation: 0, svgOrigin: "176 58" }, { rotation: 22, duration: 1.3, ease: DC.ease.swing, immediateRender: false }, mas + 0.12);

  // --- S7. « Tout est réuni » : tout converge en un point, une onde part
  const r0 = T("reuni.start");
  const P = { x: W / 2, y: H / 2 };
  const conv = r0 - 0.34;
  DC.exitUp(tl, licTb.words.concat(masTb.words), conv - 0.1, { stagger: 0.02 });
  tl.to(cap.svg, { x: P.x - capX - capW / 2, y: P.y - capY - capW * 0.4, scale: 0, opacity: 0, duration: 0.4, ease: E.glide }, conv);
  tl.to([nA, nB, ...mk, trail, base], { opacity: 0, duration: 0.15 }, conv + 0.3);
  [nA, nB, ...mk].forEach((n) => {
    const bb = n.tagName === "circle" ? { x: +n.getAttribute("cx"), y: +n.getAttribute("cy") } : null;
    if (bb) tl.to(n, { x: P.x - bb.x, y: P.y - bb.y, duration: 0.4, ease: E.glide }, conv);
  });
  mk.forEach((m, i) => tl.to(m, { x: P.x - marks[i].x, y: P.y - marks[i].y, duration: 0.45, ease: E.glide }, conv));
  tl.to(trail, { scaleX: 0, scaleY: 0, svgOrigin: `${P.x} ${P.y}`, duration: 0.4, ease: E.glide }, conv);
  tl.to(base, { scaleX: 0, scaleY: 0, svgOrigin: `${P.x} ${P.y}`, duration: 0.4, ease: E.glide }, conv);

  const ring = DC.svg("circle", { cx: P.x, cy: P.y, r: 60, fill: "none", stroke: C.jauneOnde, "stroke-width": 6, "vector-effect": "non-scaling-stroke" }, path);
  const core = DC.svg("circle", { cx: P.x, cy: P.y, r: 14, fill: "#fff" }, path);
  const hit = r0 + 0.1;
  tl.fromTo(core, { scale: 0, svgOrigin: `${P.x} ${P.y}` }, { scale: 1, duration: 0.2, ease: E.land }, conv + 0.26);
  tl.to(core, { scale: 0, duration: 0.2, ease: E.press }, hit);
  tl.fromTo(ring, { scale: 0, opacity: 1, svgOrigin: `${P.x} ${P.y}` }, { scale: 12, opacity: 0, duration: 1.0, ease: E.signalOut }, hit);
  // 16:9 : « POUR FAIRE LA DIFFÉRENCE. » sur une ligne ; 9:16 : « DIFFÉRENCE. » sur sa propre ligne
  const re = DC.textBlock(sc.cam, L
    ? [{ text: txt.s7.lineA, size: 126 }, { text: txt.s7.lineB, size: 80 }]
    : [{ text: "TOUT EST", size: 112 }, { text: "RÉUNI", size: 112 }, { text: txt.s7.lineB, size: 76 }, { text: txt.s7.emphasis, size: 76, color: C.jauneOnde }],
  { x: 0, y: pick(350, 660), gap: pick(22, 14), align: "center" });
  const extra = [];
  if (L) {
    const ll = re.lines[1].line;
    DC.el("span", { cls: "space", html: "&nbsp;" }, ll);
    extra.push(DC.el("span", { cls: "inner", text: txt.s7.emphasis, style: { color: C.jauneOnde } }, DC.el("span", { cls: "mask" }, ll)));
    DC.hideWords(extra);
  }
  const head = re.lines.slice(0, L ? 1 : 2).flatMap((l) => l.words);
  const tail = re.lines.slice(L ? 1 : 2).flatMap((l) => l.words).concat(extra);
  DC.reveal(tl, head, hit, { stagger: 0.07 });
  DC.reveal(tl, tail, T("reuni@pour") - 0.06, { stagger: 0.07 });
  DC.exitUp(tl, re.words.concat(extra), ctx.S.s7[1] - 0.12, { stagger: 0.012, dur: 0.25 });
});
