/* S9 — LA LUMIÈRE : l'onde blanche part de Ngaoundéré, le film passe du studio à la lumière.
   « Votre avenir mérite l'excellence. » */
(DC.sceneBuilders = DC.sceneBuilders || []).push(function s09(ctx) {
  const { tl, C, E, T, F, W, H, L, pick, txt } = ctx;
  const sc = ctx.scene("s9", { bg: C.papier, pre: 0.08, post: 0.15 });
  const t0 = sc.t0;
  const pin = ctx.pin || { x: W / 2, y: H / 2 };
  const R = Math.hypot(Math.max(pin.x, W - pin.x), Math.max(pin.y, H - pin.y)) + 20;
  tl.fromTo(sc.el, { clipPath: `circle(0px at ${pin.x}px ${pin.y}px)` }, { clipPath: `circle(${R}px at ${pin.x}px ${pin.y}px)`, duration: 0.42, ease: E.glide }, t0 - 0.08);

  // habillage : le bandeau passe à l'encre, le grain s'allège, la vignette disparaît
  ctx.chapter.hideLabel(tl, t0 - 0.1);
  tl.to(ctx.chapter.quote.querySelectorAll("path"), { fill: C.encre, duration: 0.3 }, t0 - 0.05);
  tl.to(ctx.fx.grain, { opacity: 0.03, duration: 0.3 }, t0);
  tl.to(ctx.fx.vignette, { opacity: 0, duration: 0.3 }, t0 - 0.1);

  const lines = L
    ? [{ text: txt.s9.lineA, size: 128, color: C.vertInstitution }, { text: txt.s9.lineB, size: 96, color: C.studio }]
    : [{ text: "VOTRE", size: 112, color: C.vertInstitution }, { text: "AVENIR", size: 112, color: C.vertInstitution }, { text: txt.s9.lineB, size: 84, color: C.studio }, { text: txt.s9.emphasis, size: 84, color: C.vertSignal }];
  const b = DC.textBlock(sc.cam, lines, { x: 0, y: pick(420, 680), gap: pick(22, 14), align: "center" });
  const extra = [];
  if (L) {
    const ll = b.lines[1].line;
    DC.el("span", { cls: "space", html: "&nbsp;" }, ll);
    extra.push(DC.el("span", { cls: "inner", text: txt.s9.emphasis, style: { color: C.vertSignal } }, DC.el("span", { cls: "mask" }, ll)));
    DC.hideWords(extra);
  }
  const a0 = T("avenir.start");
  const head = b.lines.slice(0, L ? 1 : 2).flatMap((l) => l.words);
  const tail = b.lines.slice(L ? 1 : 2).flatMap((l) => l.words).concat(extra);
  DC.reveal(tl, head, a0 + 0.1, { stagger: 0.08 });
  DC.reveal(tl, tail, T("avenir@mérite") - 0.06, { stagger: 0.1 });
  DC.exitUp(tl, b.words.concat(extra), T("sig_a.start") - 0.28, { stagger: 0.02, dur: 0.26 });
});
