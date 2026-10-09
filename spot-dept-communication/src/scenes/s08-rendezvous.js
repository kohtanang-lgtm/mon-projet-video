/* S8 — LE RENDEZ-VOUS : carte du Cameroun, épingle sur Dang / Ngaoundéré (le Point revient),
   puis l'Onde du rayonnement. Le compteur d'abonnés est sur le plan final (S10). */
(DC.sceneBuilders = DC.sceneBuilders || []).push(function s08(ctx) {
  const { tl, C, E, T, F, W, H, L, pick, txt } = ctx;
  const sc = ctx.scene("s8", { bg: C.studio, pre: 0.22, post: 0.4 });
  const t0 = sc.t0;
  ctx.chapter.label(tl, t0 + 0.1, txt.chapters.s8);

  // entrée : volet depuis la gauche, bordé par le Trait vert
  tl.fromTo(sc.el, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: E.glide }, t0 - 0.22);
  const edge = DC.el("div", { cls: "box", style: { left: "0px", top: "0px", width: "8px", height: H + "px", background: C.vertSignal } }, sc.el);
  tl.fromTo(edge, { x: 0, opacity: 1 }, { x: W, duration: 0.4, ease: E.glide }, t0 - 0.22);
  tl.set(edge, { opacity: 0 }, t0 + 0.2);

  const map = DC.cameroon(sc.cam, L ? { x: 230, y: 120, h: 840 } : { x: 0, y: 290, h: 760 });
  if (!L) map.svg.style.left = (W - map.w) / 2 + "px", (map.pin.x += (W - map.w) / 2);
  const pin = map.pin;
  ctx.pin = pin;
  tl.to(map.line, { strokeDashoffset: 0, duration: 0.85, ease: E.glide }, t0 - 0.05);
  tl.to(map.fill, { opacity: 0.1, duration: 0.5 }, t0 + 0.6);

  // épingle (le point rouge du début) sur « Dang »
  const over = DC.svg("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, sc.cam);
  over.style.position = "absolute";
  const ping = DC.svg("circle", { cx: pin.x, cy: pin.y, r: 18, fill: "none", stroke: C.rougeRec, "stroke-width": 4, "vector-effect": "non-scaling-stroke" }, over);
  const dot = DC.svg("circle", { cx: pin.x, cy: pin.y, r: 15, fill: C.rougeRec }, over);
  const pT = T("join_a@Dang");
  tl.fromTo(dot, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: E.land }, pT - 0.2);
  gsap.set(ping, { opacity: 0 });
  tl.fromTo(ping, { scale: 0.6, opacity: 1, svgOrigin: `${pin.x} ${pin.y}` }, { scale: 3.2, opacity: 0, duration: 0.7, ease: E.signalOut, immediateRender: false }, pT + 0.05);

  // libellés
  const lx = pick(900, 0), al = pick("left", "center");
  const kick = DC.textBlock(sc.cam, [{ text: txt.s8.kicker, size: pick(26, 26), cls: "inter", style: { color: "rgba(255,255,255,0.85)", letterSpacing: "0.3em" } }], { x: lx, y: pick(360, 1110), align: al });
  const place = DC.textBlock(sc.cam, [
    { text: txt.s8.place, size: pick(72, 64) },
    { text: txt.s8.city, size: pick(104, 92), color: C.blanc },
    { text: txt.s8.region, size: pick(24, 22), cls: "inter", style: { color: "rgba(255,255,255,0.75)", letterSpacing: "0.26em" } },
  ], { x: lx, y: pick(420, 1160), gap: pick(14, 10), align: al });
  DC.reveal(tl, kick.words, T("join_a.start") - 0.02, { stagger: 0.05 });
  DC.reveal(tl, place.lines[0].words, pT - 0.16, { stagger: 0.06 });
  DC.reveal(tl, place.lines[1].words, T("join_b.start") - 0.04, { dur: 0.45 });
  DC.reveal(tl, place.lines[2].words, T("join_b.start") + 0.3, { stagger: 0.03 });
  if (L) {
    const lead = DC.svg("line", { x1: pin.x + 22, y1: pin.y, x2: lx - 30, y2: pin.y, stroke: "rgba(255,255,255,0.45)", "stroke-width": 2, "stroke-dasharray": "4 8" }, over);
    tl.fromTo(lead, { opacity: 0 }, { opacity: 1, duration: 0.3 }, pT + 0.1);
  }

  // l'Onde : le rayonnement du Département part de Ngaoundéré
  const c0 = T("join_b.start") + 0.12;
  const waves = [0, 1, 2, 3, 4].map(() => DC.svg("circle", { cx: pin.x, cy: pin.y, r: 40, fill: "none", stroke: C.jauneOnde, "stroke-width": 3, opacity: 0.8, "vector-effect": "non-scaling-stroke" }, over));
  waves.forEach((w, i) => tl.fromTo(w, { scale: 0, opacity: 0.75, svgOrigin: `${pin.x} ${pin.y}` }, { scale: 14 + i * 4, opacity: 0, duration: 1.2, ease: E.signalOut }, c0 + i * 0.09));
});
