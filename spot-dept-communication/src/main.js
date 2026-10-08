/* Chef d'orchestre : construit la scène pour le format actif, enchaîne les scènes et
   enregistre la timeline GSAP (pilotée image par image par HyperFrames). */
(function () {
  const DC = window.DC;
  const F = DC.formats[window.DC_FORMAT || "landscape"];
  const root = document.getElementById("root");
  root.style.width = F.w + "px";
  root.style.height = F.h + "px";

  const tl = gsap.timeline({ paused: true });
  const ctx = {
    tl, root, F, W: F.w, H: F.h, L: F.w > F.h,
    C: DC.brand.color, E: DC.ease, T: DC.T, D: DC.timeline.duration,
    S: DC.scenes(), txt: DC.script,
  };
  ctx.pick = (landscape, portrait) => (ctx.L ? landscape : portrait);

  const stage = DC.layer(root, "stage");
  ctx.stage = stage;

  /** Crée une scène : calque visible sur [début − pre, fin + post], caméra qui pousse doucement. */
  ctx.scene = function (name, o) {
    o = o || {};
    const [t0, t1] = ctx.S[name];
    const el = DC.el("div", { cls: "scene " + name, style: { background: o.bg || "transparent" } }, stage);
    const cam = DC.el("div", { cls: "cam" }, el);
    const a = Math.max(0, t0 - (o.pre || 0));
    const b = Math.min(ctx.D, (o.until || t1) + (o.post || 0));
    tl.set(el, { visibility: "visible" }, a);
    if (b < ctx.D) tl.set(el, { visibility: "hidden" }, b);
    const push = o.push == null ? 0.035 : o.push;
    if (push) tl.fromTo(cam, { scale: 1 }, { scale: 1 + push, duration: b - a, ease: "none" }, a);
    return { el, cam, t0, t1, a, b };
  };

  ctx.chapter = DC.chapterBug(root, ctx);
  gsap.set(ctx.chapter.quoteWrap, { opacity: 0 });
  ctx.fx = DC.grain(root, tl, ctx);

  (DC.sceneBuilders || []).forEach((build) => build(ctx));

  tl.set({}, {}, ctx.D);
  DC.mainTimeline = tl;
})();
