/* S10 — LA SIGNATURE : chaque motif du film reprend sa place dans le logo officiel.
   Le guillemet ouvrant du début rejoint le logo ; le guillemet fermant clôt la prise de parole
   sur le dernier accord. « Votre histoire commence ici. » */
(DC.sceneBuilders = DC.sceneBuilders || []).push(function s10(ctx) {
  const { tl, C, E, T, F, W, H, L, pick, txt } = ctx;
  const sc = ctx.scene("s10", { bg: C.papier, push: 0 });
  const t0 = sc.t0;
  const a = T("sig_a.start"), end = T("sig_b.end");

  const lh = pick(600, 680);
  const lw = DC.logoLayers.width * (lh / DC.logoLayers.height);
  const lg = DC.logo(sc.cam, { cx: W / 2, y: pick(28, 290), h: lh });
  const Ly = lg.layers;
  Object.values(Ly).forEach((img) => gsap.set(img, { opacity: 0 }));
  // légère respiration de caméra pendant la construction
  tl.fromTo(sc.cam, { scale: 1.05 }, { scale: 1, duration: 2.4, ease: E.soft }, t0);

  // ellipse + bulle
  tl.fromTo(Ly.ellipse, { scale: 0.35, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: E.land }, a);
  tl.fromTo(Ly.bubble, { opacity: 0, clipPath: "circle(0% at 50% 68%)" }, { opacity: 1, clipPath: "circle(75% at 50% 68%)", duration: 0.7, ease: E.signalOut }, a + 0.05);
  // D et C
  tl.fromTo(Ly.d, { x: -70, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: E.signalOut }, a + 0.25);
  tl.fromTo(Ly.c, { rotation: -120, scale: 0.7, opacity: 0 }, { rotation: 0, scale: 1, opacity: 1, duration: 0.5, ease: E.land }, a + 0.33);
  // les trois points, puis les ondes
  tl.fromTo(Ly.dots, { opacity: 1, clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.3, ease: "steps(3)" }, a + 0.62);
  tl.fromTo(Ly.waves, { opacity: 0, clipPath: "inset(0% 100% 0% 0%)", scale: 0.85 }, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 0.45, ease: E.signalOut }, a + 0.72);
  tl.fromTo(Ly.caption, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: E.signalOut }, a + 0.85);
  // le mortier tombe sur le logo, le gland se balance
  tl.fromTo([Ly.board, Ly.tassel], { y: -lh * 0.6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: E.press }, a + 0.72);
  tl.fromTo(Ly.board, { scaleY: 1 }, { scaleY: 0.94, transformOrigin: "50% 100%", duration: 0.07, yoyo: true, repeat: 1, immediateRender: false }, a + 1.0);
  tl.fromTo(Ly.tassel, { rotation: 0 }, { rotation: 16, duration: 1.4, ease: DC.ease.swing, immediateRender: false }, a + 1.0);
  // le livre s'ouvre, le ruban se déroule
  tl.fromTo(Ly.book, { scaleY: 0, opacity: 1, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.45, ease: E.signalOut }, a + 1.05);
  tl.fromTo(Ly.ribbon, { opacity: 1, clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: E.glide }, a + 1.22);

  // le guillemet ouvrant du bandeau rejoint sa place dans le logo
  const qb = lg.box("quote_l");
  const bugCx = F.bug.x + 26, bugCy = F.bug.y + 16;
  const fly = a + 0.35;
  tl.to(ctx.chapter.quoteWrap, { x: qb.cx - bugCx, y: qb.cy - bugCy, scale: qb.h / 32, duration: 0.5, ease: E.glide }, fly);
  tl.to(ctx.chapter.quoteWrap, { opacity: 0, duration: 0.14 }, fly + 0.42);
  tl.to(Ly.quote_l, { opacity: 1, duration: 0.14 }, fly + 0.4);

  // le guillemet fermant clôt la prise de parole, sur l'accord final
  tl.fromTo(Ly.quote_r, { opacity: 0, scale: 1.8, rotation: 14 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.45, ease: E.land }, end + 0.02);
  // signature sonore : les trois points pulsent sur les trois notes
  [0.08, 0.26, 0.44].forEach((d) => tl.fromTo(Ly.dots, { scale: 1 }, { scale: 1.22, duration: 0.08, yoyo: true, repeat: 1, ease: E.soft, immediateRender: false }, end + d));

  // tagline
  const tg = txt.s10.tagline;
  const tb = DC.textBlock(sc.cam, L
    ? [{ text: tg.slice(0, 3).join(" "), size: 66, color: C.studio }]
    : [{ text: tg.slice(0, 2).join(" "), size: 76, color: C.studio }, { text: tg[2], size: 76, color: C.studio }],
  { x: 0, y: pick(660, 1000), gap: 12, align: "center" });
  const lastLine = tb.lines[tb.lines.length - 1].line;
  DC.el("span", { cls: "space", html: "&nbsp;" }, lastLine);
  const ici = DC.el("span", { cls: "inner", text: tg[3], style: { color: C.vertInstitution } }, DC.el("span", { cls: "mask" }, lastLine));
  DC.hideWords([ici]);
  const bW = T("sig_b.start");
  const wordsT = [0.0, 0.22, 0.66, 1.06];
  tb.words.concat([ici]).forEach((w, i) => DC.reveal(tl, [w], bW + wordsT[Math.min(i, 3)], { dur: 0.5 }));

  // rangée d'endossement : Université + FALSH (seul fondu du film)
  const row = DC.el("div", { cls: "box", style: { left: "0px", width: W + "px", top: pick(850, 1250) + "px", display: "flex", alignItems: "center", justifyContent: "center", gap: pick("34px", "28px") } }, sc.cam);
  DC.el("img", { attrs: { src: "assets/brand/logo_universite_ngaoundere.webp" }, style: { height: pick(112, 104) + "px" } }, row);
  DC.el("img", { attrs: { src: "assets/brand/logo_falsh.png" }, style: { height: pick(124, 116) + "px" } }, row);
  DC.el("span", { style: { width: "2px", height: "80px", background: "rgba(0,0,0,0.18)" } }, row);
  const tx = DC.el("div", { cls: "inter", style: { color: C.studio, fontSize: pick(19, 17) + "px", letterSpacing: "0.18em", lineHeight: "1.7" } }, row);
  DC.el("div", { text: txt.s10.endorsement, style: { fontWeight: 600 } }, tx);
  DC.el("div", { text: txt.s10.follow, style: { color: "rgba(13,17,23,0.65)" } }, tx);
  tl.fromTo(row, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: E.soft }, end + 0.05);
});
