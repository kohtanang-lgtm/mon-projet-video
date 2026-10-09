/* S2 — LA PRATIQUE : jauge 100 % (l'Onde devient donnée) puis « le vide » qui se remplit. */
(DC.sceneBuilders = DC.sceneBuilders || []).push(function s02(ctx) {
  const { tl, C, E, T, F, W, H, pick, txt } = ctx;
  const sc = ctx.scene("s2", { post: 0.12 });   // fond transparent : la sortie de S1 reste visible dessous
  const t0 = sc.t0;
  ctx.chapter.label(tl, t0 + 0.1, txt.chapters.s2);

  // --- jauge circulaire
  const cx = W / 2, cy = pick(470, 840), r = pick(230, 270);
  const g = DC.el("div", { cls: "box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px" } }, sc.cam);
  const svg = DC.svg("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, g);
  svg.style.position = "absolute";
  const track = DC.svg("circle", { cx, cy, r, fill: "none", stroke: "rgba(255,255,255,0.10)", "stroke-width": 14 }, svg);
  const arc = DC.svg("path", { d: DC.arcPath(cx, cy, r, -90, 269.9), fill: "none", stroke: C.jauneOnde, "stroke-width": 16, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 }, svg);
  const center = DC.svg("circle", { cx, cy, r: 12, fill: C.jauneOnde }, svg);
  const num = DC.el("div", { cls: "syne", style: { position: "absolute", left: cx - 300 + "px", width: "600px", top: cy - pick(88, 100) + "px", textAlign: "center", fontSize: pick(170, 190) + "px", lineHeight: "1", letterSpacing: "-0.04em" } }, g);
  const n = DC.el("span", { text: "0" }, num);
  DC.el("span", { text: "%", style: { fontSize: "0.42em", color: C.vertSignal, marginLeft: "0.06em", verticalAlign: "0.9em" } }, num);
  const label = DC.textBlock(g, [{ text: txt.s2.gaugeLabel, size: pick(26, 28), cls: "inter", style: { letterSpacing: "0.3em", color: "rgba(255,255,255,0.85)" } }], { x: 0, y: cy + r + pick(56, 70), align: "center" });

  const g0 = T("prat_a.start") - 0.18, g1 = T("prat_a.start") + 0.66;
  tl.fromTo(track, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t0);
  tl.to(center, { scale: 0, svgOrigin: `${cx} ${cy}`, duration: 0.25, ease: E.press }, g0);
  tl.fromTo(num, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: E.signalOut }, g0);
  tl.to(arc, { strokeDashoffset: 0, duration: g1 - g0, ease: DC.bezier(0.5, 0, 0.3, 1) }, g0);
  const p = { v: 0 };
  tl.to(p, { v: 100, duration: g1 - g0, ease: DC.bezier(0.5, 0, 0.3, 1), onUpdate: () => (n.textContent = Math.round(p.v)) }, g0);
  tl.fromTo(g, { scale: 1, transformOrigin: `${cx}px ${cy}px` }, { scale: 1.06, duration: 0.12, ease: E.signalOut, yoyo: true, repeat: 1, immediateRender: false }, g1);
  tl.set(arc, { attr: { stroke: "#FFFFFF" } }, g1);
  tl.set(arc, { attr: { stroke: C.jauneOnde } }, g1 + 0.05);
  DC.reveal(tl, label.words, g1 + 0.05, { stagger: 0.05 });

  // sortie de la jauge
  const gOut = T("prat_b.start") - 0.2;
  tl.to(g, { scale: 0.55, opacity: 0, y: -60, duration: 0.35, ease: E.press }, gOut);

  // --- « Pas de théorie dans le vide. » — le mot VIDE est creux, puis se remplit
  const pb = T("prat_b.start");
  const sz = pick(124, 90);
  const blk = DC.el("div", { cls: "box", style: { left: "0px", width: "100%", top: pick(330, 740) + "px", textAlign: "center" } }, sc.cam);
  const l1 = DC.maskLine(blk, txt.s2.lineA, { fontSize: sz + "px", justifyContent: "center" }, "syne");
  const l2 = DC.el("div", { cls: "mline syne", style: { fontSize: sz + "px", justifyContent: "center", marginTop: pick(18, 14) + "px" } }, blk);
  const w2 = [];
  txt.s2.lineB.split(" ").forEach((w) => {
    const m = DC.el("span", { cls: "mask" }, l2);
    w2.push(DC.el("span", { cls: "inner", text: w }, m));
    DC.el("span", { cls: "space", html: "&nbsp;" }, l2);
  });
  const m = DC.el("span", { cls: "mask" }, l2);
  const hollowIn = DC.el("span", { cls: "inner", style: { position: "relative" } }, m);
  DC.el("span", { text: txt.s2.hollow, style: { color: "transparent", WebkitTextStroke: "3px #FFFFFF" } }, hollowIn);
  const fill = DC.el("span", { text: txt.s2.hollow, style: { position: "absolute", left: "0", top: "0", color: C.vertSignal, clipPath: "inset(100% 0 0 0)" } }, hollowIn);
  const all = l1.words.concat(w2, [hollowIn]);
  DC.hideWords(all);
  DC.reveal(tl, l1.words, pb - 0.02, { stagger: 0.07 });
  DC.reveal(tl, w2, T("prat_b@dans") - 0.08, { stagger: 0.07 });
  DC.reveal(tl, [hollowIn], T("prat_b@vide") - 0.18);
  tl.to(fill, { clipPath: "inset(0% 0 0 0)", duration: 0.36, ease: E.glide }, T("prat_b@vide") - 0.02);

  // « Chaque année. » — cinq traits s'allument, un par année
  const yr = DC.el("div", { style: { display: "flex", justifyContent: "center", alignItems: "center", gap: pick("26px", "20px"), marginTop: pick("34px", "28px") } }, blk);
  const yl = DC.maskLine(yr, txt.s2.annee, { fontSize: pick(54, 50) + "px", color: C.vertSignal }, "syne");
  yl.words.forEach((w) => (w.style.color = C.vertSignal));
  DC.hideWords(yl.words);
  const ticks = DC.el("div", { style: { display: "flex", gap: "10px", alignItems: "center" } }, yr);
  const tk = [0, 1, 2, 3, 4].map(() => DC.el("span", { style: { width: "9px", height: pick("40px", "36px"), borderRadius: "5px", background: "rgba(255,255,255,0.18)", display: "inline-block" } }, ticks));
  const an = T("annee.start");
  gsap.set(ticks, { opacity: 0 });
  tl.to(ticks, { opacity: 1, duration: 0.15 }, an - 0.1);
  DC.reveal(tl, yl.words, an - 0.08, { stagger: 0.06, dur: 0.4 });
  tk.forEach((t, i) => tl.to(t, { backgroundColor: C.jauneOnde, duration: 0.06 }, an + i * 0.08));

  // sortie : poussée vers la gauche (le split d'S3 entre par la droite)
  tl.to(blk, { x: -W * 0.35, opacity: 0, duration: 0.35, ease: E.press }, sc.t1 - 0.12);
});
