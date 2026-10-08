/* S1 — LE SIGNAL (hook) : point REC → ondes → guillemet → institution → « fait parler de lui ». */
(DC.sceneBuilders = DC.sceneBuilders || []).push(function s01(ctx) {
  const { tl, C, E, T, F, W, H, L, pick, txt } = ctx;
  const sc = ctx.scene("s1", { bg: C.studio, post: 0.02 });
  const cx = W / 2, cy = H / 2;

  // --- le Point et l'Onde
  const svg = DC.svg("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, sc.cam);
  svg.style.position = "absolute";
  const arcs = DC.ondes(svg, cx, cy, [70, 125, 190], { color: C.jauneOnde, width: 6, gap: 80 });
  const dot = DC.svg("circle", { cx, cy, r: 16, fill: C.rougeRec }, svg);
  tl.fromTo(dot, { scale: 0, svgOrigin: `${cx} ${cy}` }, { scale: 1, duration: 0.32, ease: E.land }, 0.1);
  tl.set(dot, { opacity: 0 }, 0.42);
  tl.set(dot, { opacity: 1 }, 0.46);
  arcs.forEach((a, i) => {
    const t = 0.22 + i * 0.12;
    tl.to(a, { strokeDashoffset: 0, duration: 0.45, ease: E.signalOut }, t);
    tl.fromTo(a, { scale: 0.75, svgOrigin: `${cx} ${cy}` }, { scale: 1.4, duration: 0.95, ease: E.signalOut, immediateRender: false }, t);
    tl.to(a, { opacity: 0, duration: 0.3, ease: E.soft }, t + 0.32);
  });

  // --- le point devient le guillemet ouvrant, qui part se ranger dans le bandeau
  const qSize = pick(120, 110);
  const qw = qSize * (196 / 122);
  const qBox = DC.box(sc.cam, cx - qw / 2, cy - qSize / 2, { width: qw + "px", height: qSize + "px", transformOrigin: "0% 0%" });
  DC.quoteMark(qBox, { size: qSize, color: C.vertSignal, open: true });
  tl.to(dot, { scale: 0, duration: 0.18, ease: E.press }, 0.5);
  tl.fromTo(qBox, { scale: 0, rotation: -25, transformOrigin: "50% 50%" }, { scale: 1, rotation: 0, duration: 0.32, ease: E.land }, 0.5);
  const k = 32 / qSize;
  tl.to(qBox, { x: F.bug.x - (cx - qw / 2), y: F.bug.y - (cy - qSize / 2), scale: k, transformOrigin: "0% 0%", duration: 0.42, ease: E.glide }, 0.74);
  tl.set(qBox, { opacity: 0 }, 1.16);
  tl.set(ctx.chapter.quoteWrap, { opacity: 1 }, 1.16);
  ctx.chapter.label(tl, 1.05, txt.chapters.s1);

  // --- l'institution (« À l'Université de Ngaoundéré »)
  const ha = T("hook_a.start");
  const seal = DC.el("img", { attrs: { src: "assets/brand/logo_universite_ngaoundere.webp" }, style: {
    position: "absolute", width: pick(230, 250) + "px", height: pick(230, 250) + "px",
    left: pick(cx - 640, cx - 125) + "px", top: pick(cy - 128, 540) + "px" } }, sc.cam);
  tl.fromTo(seal, { scale: 0.55, rotation: -40, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: E.land }, ha + 0.42);

  const uniX = pick(cx - 360, 0);
  const uni = DC.textBlock(sc.cam, [
    { text: txt.s1.kicker, size: pick(20, 17), cls: "inter", style: { letterSpacing: pick("0.2em", "0.12em") } },
    { text: txt.s1.uniA, size: pick(72, 64) },
    { text: txt.s1.uniB, size: pick(120, 104) },
  ], { x: uniX, y: pick(cy - 135, 860), gap: pick(14, 14), align: pick("left", "center") });
  const rule = DC.el("div", { style: { height: "6px", background: C.vertSignal, marginTop: "22px", width: pick("100%", "70%"), marginLeft: pick("0", "15%"), transformOrigin: "0% 50%" } }, uni.el);
  gsap.set(rule, { scaleX: 0 });
  DC.reveal(tl, uni.lines[0].words, ha + 0.5, { stagger: 0.02 });
  DC.reveal(tl, uni.lines[1].words, ha + 0.58);
  DC.reveal(tl, uni.lines[2].words, ha + 1.2, { dur: 0.6 });
  tl.to(rule, { scaleX: 1, duration: 0.6, ease: E.signalOut }, ha + 1.5);
  const outA = T("hook_b.start") - 0.15;
  DC.exitUp(tl, uni.words, outA, { stagger: 0.015 });
  tl.to(rule, { scaleX: 0, transformOrigin: "100% 50%", duration: 0.3, ease: E.press }, outA);
  tl.to(seal, { scale: 0.7, opacity: 0, rotation: 30, duration: 0.35, ease: E.press }, outA);

  // --- « Un département fait parler de lui. »
  const hb = T("hook_b.start");
  const lines = pick(txt.s1.title, txt.s1.titlePortrait);
  const size = pick(F.type.hero, F.type.hero);
  const title = DC.textBlock(sc.cam, lines.map((t, i) => ({ text: t, color: i === lines.length - 1 ? C.jauneOnde : null })), {
    x: pick(260, F.margin + 10), y: pick(cy - (lines.length * size * 0.98 + 30) / 2, 760), size, gap: pick(10, 6),
  });
  const at = pick([0.02, 0.62, 1.15], [0.02, 0.25, 0.62, 1.15]);
  title.lines.forEach((l, i) => DC.reveal(tl, l.words, hb + at[i], { dur: 0.5, stagger: 0.06 }));
  DC.exitUp(tl, title.words, T("prat_a.start") - 0.5, { stagger: 0.02 });

  // relais : un point jaune au centre (devient le centre de la jauge de S2)
  const relay = DC.svg("circle", { cx, cy, r: 12, fill: C.jauneOnde }, svg);
  tl.fromTo(relay, { scale: 0, svgOrigin: `${cx} ${cy}` }, { scale: 1, duration: 0.25, ease: E.land }, T("prat_a.start") - 0.42);
});
