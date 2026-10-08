/* S3 — DES AMPHIS AUX STUDIOS, puis le nom : « Bienvenue au Département de Communication ». */
(DC.sceneBuilders = DC.sceneBuilders || []).push(function s03(ctx) {
  const { tl, C, E, T, F, W, H, L, pick, txt } = ctx;
  const sc = ctx.scene("s3", { bg: C.studio, pre: 0.06, post: 0.02 });
  const t0 = sc.t0;
  const gap = 8;

  // --- split : amphi | studios (vertical en 16:9, horizontal en 9:16)
  const half = L ? W / 2 : H / 2;
  const geomA = L ? { left: "0px", top: "0px", width: half - gap / 2 + "px", height: H + "px" } : { left: "0px", top: "0px", width: W + "px", height: half - gap / 2 + "px" };
  const geomB = L ? { left: half + gap / 2 + "px", top: "0px", width: half - gap / 2 + "px", height: H + "px" } : { left: "0px", top: half + gap / 2 + "px", width: W + "px", height: half - gap / 2 + "px" };
  const pA = DC.mediaPanel(sc.cam, "amphi", "amphi", geomA);
  const pB = DC.mediaPanel(sc.cam, "studios", "studios", geomB);
  const divider = DC.el("div", { cls: "box", style: L ? { left: half - 3 + "px", top: "0px", width: "6px", height: H + "px", background: C.vertSignal, transformOrigin: "50% 0%" } : { left: "0px", top: half - 3 + "px", width: W + "px", height: "6px", background: C.vertSignal, transformOrigin: "0% 50%" } }, sc.cam);
  tl.fromTo(divider, L ? { scaleY: 0 } : { scaleX: 0 }, L ? { scaleY: 1, duration: 0.35, ease: E.signalOut } : { scaleX: 1, duration: 0.35, ease: E.signalOut }, t0 - 0.06);
  tl.fromTo(pA.el, { clipPath: L ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: E.signalOut }, t0 - 0.02);
  tl.fromTo(pB.el, { clipPath: L ? "inset(0% 0% 0% 100%)" : "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: E.signalOut }, t0 + 0.04);
  pA.animate(tl, t0 + 0.05, 1.6);
  pB.animate(tl, t0 + 0.1, 3.8);

  // libellés des panneaux (dégradé de lisibilité en pied de panneau)
  [pA, pB].forEach((p) => DC.el("div", { cls: "layer", style: { background: "linear-gradient(180deg, rgba(13,17,23,0) 55%, rgba(13,17,23,0.88) 100%)" } }, p.el));
  const lab = (parent, spec, x, y) => {
    const b = DC.textBlock(parent, [
      { text: spec.kicker, size: pick(26, 26), cls: "inter", style: { color: "rgba(255,255,255,0.85)" } },
      { text: spec.title, size: pick(104, 96) },
    ], { x, y, gap: 8 });
    return b;
  };
  const la = lab(pA.el, txt.s3.left, pick(70, 70), pick(H - 230, half - 220));
  const lb = lab(pB.el, txt.s3.right, pick(70, 70), pick(H - 230, 130));
  DC.reveal(tl, la.words, T("studios.start") + 0.0, { stagger: 0.08 });
  DC.reveal(tl, lb.words, T("studios.start") + 0.55, { stagger: 0.08 });

  // viseur caméra sur le panneau « studios »
  const vf = DC.el("div", { cls: "layer" }, pB.el);
  const ins = 46, len = 64, th = 5;
  const corners = [[0, 0, 1, 1], [1, 0, -1, 1], [0, 1, 1, -1], [1, 1, -1, -1]].map(([ax, ay, sx, sy]) => {
    const c = DC.el("div", { cls: "box", style: { width: len + "px", height: len + "px", [ax ? "right" : "left"]: ins + "px", [ay ? "bottom" : "top"]: ins + "px",
      [ay ? "borderBottom" : "borderTop"]: `${th}px solid #fff`, [ax ? "borderRight" : "borderLeft"]: `${th}px solid #fff` } }, vf);
    return { c, sx, sy };
  });
  const rec = DC.el("div", { cls: "box inter", style: { left: ins + 30 + "px", top: ins + 26 + "px", fontSize: "22px", color: "#fff", display: "flex", alignItems: "center", gap: "12px", letterSpacing: "0.14em" } }, vf);
  const recDot = DC.el("span", { style: { width: "16px", height: "16px", borderRadius: "50%", background: C.rougeRec, display: "inline-block" } }, rec);
  DC.el("span", { text: "REC" }, rec);
  const tc = DC.el("span", { text: "00:00:00:00", style: { marginLeft: "18px", fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.8)" } }, rec);
  const spec = DC.el("div", { cls: "box inter", text: "4K · 60 I/S", style: { right: ins + 30 + "px", top: ins + 30 + "px", fontSize: "18px", color: "rgba(255,255,255,0.7)" } }, vf);
  const vfT = T("studios.start") + 0.5;
  corners.forEach(({ c, sx, sy }) => tl.fromTo(c, { x: -sx * 40, y: -sy * 40, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.45, ease: E.land }, vfT));
  tl.fromTo([rec, spec], { opacity: 0 }, { opacity: 1, duration: 0.2 }, vfT + 0.1);
  for (let k = 0; k < 6; k++) tl.set(recDot, { opacity: k % 2 ? 1 : 0.15 }, vfT + 0.5 + k * 0.5);
  const tcp = { v: 0 };
  tl.to(tcp, { v: 4, duration: 4, ease: "none", onUpdate: () => {
    const fr = Math.floor(tcp.v * 60), s = Math.floor(fr / 60), f = fr % 60;
    tc.textContent = `00:00:${String(8 + s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
  } }, vfT);

  // on entre dans les studios : le panneau droit prend tout le cadre
  const pushT = T("welcome.start") - 0.32;
  tl.to(pA.el, L ? { x: -half, duration: 0.45, ease: E.glide } : { y: -half, duration: 0.45, ease: E.glide }, pushT);
  tl.to(divider, { opacity: 0, duration: 0.2 }, pushT);
  tl.to(pB.el, L ? { left: 0, width: W, duration: 0.45, ease: E.glide } : { top: 0, height: H, duration: 0.45, ease: E.glide }, pushT);
  DC.exitUp(tl, la.words.concat(lb.words), pushT, { stagger: 0.02 });
  const dim = DC.el("div", { cls: "layer", style: { background: "rgba(13,17,23,0.62)" } }, pB.el);
  tl.fromTo(dim, { opacity: 0 }, { opacity: 1, duration: 0.4 }, pushT + 0.1);

  // indicateur de saisie « • • • » (quelqu'un va prendre la parole)
  const ws = T("welcome.start");
  const dots = DC.el("div", { cls: "box", style: { left: W / 2 - 110 + "px", top: H / 2 - 60 + "px", width: "220px", height: "120px", borderRadius: "60px", border: "4px solid rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", gap: "22px" } }, sc.cam);
  const ds = [0, 1, 2].map(() => DC.el("span", { style: { width: "26px", height: "26px", borderRadius: "50%", background: C.jauneOnde, display: "inline-block" } }, dots));
  tl.fromTo(dots, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: E.land }, ws - 0.08);
  ds.forEach((d, i) => {
    tl.fromTo(d, { scale: 0 }, { scale: 1, duration: 0.2, ease: E.land }, ws + 0.02 + i * 0.14);
    tl.to(d, { y: -12, duration: 0.12, ease: E.soft, yoyo: true, repeat: 1 }, ws + 0.3 + i * 0.07);
  });

  // impact : l'aplat vert institution s'ouvre depuis la bulle, le nom s'écrit
  const hit = T("welcome.start") + 0.62;
  const green = DC.layer(sc.cam, "", { background: C.vertInstitution, clipPath: `circle(0px at ${W / 2}px ${H / 2}px)` });
  tl.to(green, { clipPath: `circle(${Math.hypot(W, H)}px at ${W / 2}px ${H / 2}px)`, duration: 0.45, ease: E.glide }, hit - 0.12);
  tl.to(dots, { scale: 0, opacity: 0, duration: 0.2, ease: E.press }, hit - 0.1);
  const nm = DC.textBlock(green, [
    { text: txt.s3.welcome, size: pick(28, 28), cls: "inter", style: { color: "rgba(255,255,255,0.88)", letterSpacing: "0.32em" } },
    { text: txt.s3.nameA, size: pick(118, 74) },
    { text: txt.s3.nameB, size: pick(160, 82) },
  ], { x: 0, y: pick(300, 760), gap: pick(14, 14), align: "center" });
  DC.reveal(tl, nm.lines[0].words, hit - 0.05, { stagger: 0.05 });
  DC.reveal(tl, nm.lines[1].words, hit + 0.02, { stagger: 0.07 });
  DC.reveal(tl, nm.lines[2].words, T("welcome.start") + 1.2, { dur: 0.6 });
  // la seule secousse du film, réservée au nom
  tl.to(sc.cam, { x: 6, duration: 0.03, ease: "none", yoyo: true, repeat: 5 }, hit);
  tl.set(sc.cam, { x: 0 }, hit + 0.2);

  // sortie : l'aplat vert se referme en iris
  tl.to(green, { clipPath: `circle(0px at ${W / 2}px ${H / 2}px)`, duration: 0.3, ease: E.press }, sc.t1 - 0.28);
});
