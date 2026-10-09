/* S1 — LE SIGNAL (hook) : point REC → ondes → guillemet → l'entrée de l'Université (photo)
   → la photo s'ouvre en plein cadre sous « Un département fait parler de lui ». */
(DC.sceneBuilders = DC.sceneBuilders || []).push(function s01(ctx) {
  const { tl, C, E, T, F, W, H, L, pick, txt } = ctx;
  const sc = ctx.scene("s1", { bg: C.studio, post: 0.3 });
  const cx = W / 2, cy = H / 2;
  const ha = T("hook_a.start"), hb = T("hook_b.start");

  // --- photo de l'entrée (carte arrondie, lueur verte) — sous le guillemet dans l'ordre d'empilement
  const card = L ? { x: 140, y: cy - 226, w: 760, h: 452 } : { x: 90, y: 330, w: 900, h: 535 };
  const src = DC.media && DC.media.entree;
  let photo = null, shade = null, img = null;
  if (src) {
    photo = DC.el("div", { cls: "panel", style: { left: card.x + "px", top: card.y + "px", width: card.w + "px", height: card.h + "px",
      borderRadius: "22px", boxShadow: "0 30px 90px rgba(0,168,89,0.28)", clipPath: "inset(0% 100% 0% 0% round 22px)" } }, sc.cam);
    img = DC.el("img", { cls: "photo", attrs: { src } }, photo);
    DC.el("div", { cls: "grade" }, photo);
    shade = DC.el("div", { cls: "layer", style: { background: C.studio, opacity: 0 } }, photo);
    tl.to(photo, { clipPath: "inset(0% 0% 0% 0% round 22px)", duration: 0.55, ease: E.signalOut }, 0.52);
    tl.fromTo(img, { scale: 1.12 }, { scale: 1.0, duration: 1.3, ease: E.soft }, 0.52);
  }

  // --- le Point et l'Onde
  const svg = DC.svg("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, sc.cam);
  svg.style.position = "absolute";
  const arcs = DC.ondes(svg, cx, cy, [70, 125, 190], { color: C.jauneOnde, width: 6, gap: 80 });
  const dot = DC.svg("circle", { cx, cy, r: 16, fill: C.rougeRec }, svg);
  tl.fromTo(dot, { scale: 0, svgOrigin: `${cx} ${cy}` }, { scale: 1, duration: 0.25, ease: E.land }, 0.02);
  arcs.forEach((a, i) => {
    const t = 0.1 + i * 0.08;
    tl.to(a, { strokeDashoffset: 0, duration: 0.35, ease: E.signalOut }, t);
    tl.fromTo(a, { scale: 0.75, svgOrigin: `${cx} ${cy}` }, { scale: 1.4, duration: 0.7, ease: E.signalOut, immediateRender: false }, t);
    tl.to(a, { opacity: 0, duration: 0.25, ease: E.soft }, t + 0.25);
  });

  // --- le point devient le guillemet ouvrant, qui part se ranger dans le bandeau
  const qSize = pick(120, 110);
  const qw = qSize * (196 / 122);
  const qBox = DC.box(sc.cam, cx - qw / 2, cy - qSize / 2, { width: qw + "px", height: qSize + "px", transformOrigin: "0% 0%" });
  DC.quoteMark(qBox, { size: qSize, color: C.vertSignal, open: true });
  tl.to(dot, { scale: 0, duration: 0.15, ease: E.press }, 0.3);
  tl.fromTo(qBox, { scale: 0, rotation: -25, transformOrigin: "50% 50%" }, { scale: 1, rotation: 0, duration: 0.24, ease: E.land }, 0.3);
  tl.to(qBox, { x: F.bug.x - (cx - qw / 2), y: F.bug.y - (cy - qSize / 2), scale: 32 / qSize, transformOrigin: "0% 0%", duration: 0.34, ease: E.glide }, 0.52);
  tl.set(qBox, { opacity: 0 }, 0.86);
  tl.set(ctx.chapter.quoteWrap, { opacity: 1 }, 0.86);
  ctx.chapter.label(tl, 0.78, txt.chapters.s1);

  // --- « À l'Université de Ngaoundéré »
  const seal = DC.el("img", { attrs: { src: "assets/brand/logo_universite_ngaoundere.webp" }, style: {
    position: "absolute", width: pick(150, 160) + "px", height: pick(150, 160) + "px",
    left: card.x + card.w - pick(95, 110) + "px", top: card.y - pick(60, 70) + "px",
    filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.45))" } }, sc.cam);
  tl.fromTo(seal, { scale: 0.4, rotation: -40, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: E.land }, 0.78);

  const uni = DC.textBlock(sc.cam, [
    { text: txt.s1.kicker, size: pick(17, 17), cls: "inter", style: { letterSpacing: "0.12em" } },
    { text: txt.s1.uniA, size: pick(66, 64) },
    { text: txt.s1.uniB, size: pick(96, 104) },
  ], { x: pick(980, 0), y: pick(cy - 120, 930), gap: pick(14, 14), align: pick("left", "center") });
  const rule = DC.el("div", { style: { height: "6px", background: C.vertSignal, marginTop: "22px", width: pick("100%", "70%"), marginLeft: pick("0", "15%"), transformOrigin: "0% 50%" } }, uni.el);
  gsap.set(rule, { scaleX: 0 });
  // le texte attend que le guillemet ait quitté le centre (≈ 0,8 s)
  DC.reveal(tl, uni.lines[0].words, Math.max(0.8, T("hook_a@Université") + 0.2), { stagger: 0.015 });
  DC.reveal(tl, uni.lines[1].words, Math.max(0.84, T("hook_a@Université") + 0.25));
  DC.reveal(tl, uni.lines[2].words, T("hook_a@Ngaoundéré") - 0.05, { dur: 0.5 });
  tl.to(rule, { scaleX: 1, duration: 0.45, ease: E.signalOut }, T("hook_a@Ngaoundéré") + 0.25);
  const outA = hb - 0.14;
  DC.exitUp(tl, uni.words, outA, { stagger: 0.012 });
  tl.to(rule, { scaleX: 0, transformOrigin: "100% 50%", duration: 0.25, ease: E.press }, outA);
  tl.to(seal, { scale: 0.6, opacity: 0, rotation: 30, duration: 0.3, ease: E.press }, outA);

  // --- la photo s'ouvre en plein cadre et devient le fond du titre
  if (photo) {
    tl.to(photo, { left: 0, top: 0, width: W, height: H, borderRadius: 0, boxShadow: "0 0px 0px rgba(0,168,89,0)", clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.5, ease: E.glide }, outA + 0.02);
    tl.to(shade, { opacity: 0.86, duration: 0.5, ease: E.soft }, outA + 0.05);
    tl.to(img, { scale: 1.08, filter: "saturate(0.7) contrast(1.05) brightness(0.9) blur(4px)", duration: hb + 1.8 - outA, ease: "none" }, outA);
    tl.to(photo, { opacity: 0, duration: 0.3, ease: E.soft }, T("prat_a.start") - 0.3);
  }

  // --- « Un département fait parler de lui. »
  const lines = pick(txt.s1.title, txt.s1.titlePortrait);
  const size = F.type.hero;
  const title = DC.textBlock(sc.cam, lines.map((t, i) => ({ text: t, color: i === lines.length - 1 ? C.jauneOnde : null })), {
    x: pick(260, F.margin + 10), y: pick(cy - (lines.length * size * 0.98 + 30) / 2, 760), size, gap: pick(10, 6),
  });
  const at = L
    ? [hb - 0.04, T("hook_b@fait") - 0.06, T("hook_b@de lui") - 0.08]
    : [hb - 0.04, T("hook_b@département") - 0.08, T("hook_b@fait") - 0.06, T("hook_b@de lui") - 0.08];
  title.lines.forEach((l, i) => DC.reveal(tl, l.words, at[i], { dur: 0.42, stagger: 0.05 }));
  DC.exitUp(tl, title.words, T("prat_a.start") - 0.3, { stagger: 0.015, dur: 0.26 });

  // relais : un point jaune au centre (devient le centre de la jauge de S2)
  const relay = DC.svg("circle", { cx, cy, r: 12, fill: C.jauneOnde }, svg);
  tl.fromTo(relay, { scale: 0, svgOrigin: `${cx} ${cy}` }, { scale: 1, duration: 0.22, ease: E.land }, T("prat_a.start") - 0.3);
});
