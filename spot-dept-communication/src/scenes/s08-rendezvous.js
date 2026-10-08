/* S8 — LE RENDEZ-VOUS : carte du Cameroun, épingle sur Ngaoundéré (le Point revient),
   puis l'Onde de la communauté (+10 000 abonnés). */
(DC.sceneBuilders = DC.sceneBuilders || []).push(function s08(ctx) {
  const { tl, C, E, T, F, W, H, L, pick, txt } = ctx;
  const sc = ctx.scene("s8", { bg: C.studio, pre: 0.22, post: 0.3 });
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
  tl.to(map.line, { strokeDashoffset: 0, duration: 1.1, ease: E.glide }, t0 + 0.05);
  tl.to(map.fill, { opacity: 0.1, duration: 0.6 }, t0 + 0.9);

  // épingle (le point rouge du début)
  const over = DC.svg("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, sc.cam);
  over.style.position = "absolute";
  const ping = DC.svg("circle", { cx: pin.x, cy: pin.y, r: 18, fill: "none", stroke: C.rougeRec, "stroke-width": 4, "vector-effect": "non-scaling-stroke" }, over);
  const dot = DC.svg("circle", { cx: pin.x, cy: pin.y, r: 15, fill: C.rougeRec }, over);
  const pT = T("join_a.start") + 0.95;
  tl.fromTo(dot, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: E.land }, pT - 0.18);
  tl.fromTo(ping, { scale: 0.6, opacity: 1, svgOrigin: `${pin.x} ${pin.y}` }, { scale: 3.2, opacity: 0, duration: 0.8, ease: E.signalOut }, pT + 0.05);

  // libellés
  const lx = pick(900, 0), al = pick("left", "center");
  const kick = DC.textBlock(sc.cam, [{ text: txt.s8.kicker, size: pick(26, 26), cls: "inter", style: { color: "rgba(255,255,255,0.85)", letterSpacing: "0.3em" } }], { x: lx, y: pick(240, 1090), align: al });
  const place = DC.textBlock(sc.cam, [
    { text: txt.s8.place, size: pick(72, 64) },
    { text: txt.s8.city, size: pick(104, 92), color: C.blanc },
    { text: txt.s8.region, size: pick(24, 22), cls: "inter", style: { color: "rgba(255,255,255,0.75)", letterSpacing: "0.26em" } },
  ], { x: lx, y: pick(300, 1140), gap: pick(14, 10), align: al });
  DC.reveal(tl, kick.words, T("join_a.start") + 0.05, { stagger: 0.05 });
  DC.reveal(tl, place.lines[0].words, pT - 0.1, { stagger: 0.06 });
  DC.reveal(tl, place.lines[1].words, T("join_b.start") + 0.12, { dur: 0.55 });
  DC.reveal(tl, place.lines[2].words, T("join_b.start") + 0.5, { stagger: 0.04 });
  if (L) {
    const lead = DC.svg("line", { x1: pin.x + 22, y1: pin.y, x2: lx - 30, y2: pin.y, stroke: "rgba(255,255,255,0.45)", "stroke-width": 2, "stroke-dasharray": "4 8" }, over);
    tl.fromTo(lead, { opacity: 0 }, { opacity: 1, duration: 0.4 }, pT + 0.2);
  }

  // l'Onde de la communauté : compteur d'abonnés
  const c0 = T("join_b.end") + 0.02, c1 = T("join_b.end") + 0.8;
  const waves = [0, 1, 2, 3, 4].map(() => DC.svg("circle", { cx: pin.x, cy: pin.y, r: 40, fill: "none", stroke: C.jauneOnde, "stroke-width": 3, opacity: 0.8, "vector-effect": "non-scaling-stroke" }, over));
  waves.forEach((w, i) => tl.fromTo(w, { scale: 0, opacity: 0.75, svgOrigin: `${pin.x} ${pin.y}` }, { scale: 14 + i * 4, opacity: 0, duration: 1.3, ease: E.signalOut }, c0 + i * 0.09));
  const st = txt.stats;
  const cnt = DC.el("div", { cls: "box", style: L ? { left: lx + "px", top: "640px" } : { left: "0px", width: W + "px", top: "1350px", textAlign: "center" } }, sc.cam);
  const row = DC.el("div", { cls: "syne", style: { fontSize: pick(132, 96) + "px", lineHeight: "1", display: "flex", alignItems: "baseline", gap: "18px", justifyContent: pick("flex-start", "center") } }, cnt);
  const plus = DC.el("span", { text: st.followersPrefix, style: { color: C.jauneOnde } }, row);
  const num = DC.el("span", { text: "0", style: { fontVariantNumeric: "tabular-nums" } }, row);
  const lbl = DC.el("span", { cls: "inter", text: st.followersLabel, style: { fontSize: pick(28, 24) + "px", color: "#fff", letterSpacing: "0.24em" } }, row);
  const sub = DC.el("div", { cls: "inter", text: st.followersSub, style: { fontSize: pick(20, 20) + "px", marginTop: "14px", color: "rgba(255,255,255,0.7)", letterSpacing: "0.3em" } }, cnt);
  tl.fromTo(cnt, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.35, ease: E.signalOut }, c0);
  const p = { v: 0 };
  tl.to(p, { v: st.followers, duration: c1 - c0, ease: E.signalOut, onUpdate: () => (num.textContent = DC.fmtThousands(p.v)) }, c0);
  tl.fromTo(plus, { scale: 0 }, { scale: 1, duration: 0.35, ease: E.land }, c1 - 0.05);
  tl.fromTo(row, { scale: 1 }, { scale: 1.05, transformOrigin: "0% 50%", duration: 0.1, yoyo: true, repeat: 1, immediateRender: false }, c1);
  tl.fromTo(sub, { opacity: 0 }, { opacity: 1, duration: 0.3 }, c1);
  if (!L) {
    tl.to(place.el, { y: -40, duration: 0.4, ease: E.glide }, c0);
    tl.to(kick.el, { opacity: 0, duration: 0.2 }, c0);
  }
});
