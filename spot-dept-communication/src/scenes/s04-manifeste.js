/* S4 — LE MANIFESTE : « ne ~~naissent~~ pas : ils se forment » (la typographie raconte). */
(DC.sceneBuilders = DC.sceneBuilders || []).push(function s04(ctx) {
  const { tl, C, E, T, F, W, H, L, pick, txt } = ctx;
  const sc = ctx.scene("s4", { bg: C.studio, post: 0.02 });
  const t0 = sc.t0;
  ctx.chapter.label(tl, t0 + 0.08, txt.chapters.s4);

  const x0 = pick(200, F.margin + 10);
  // kicker précédé d'un trait
  const kick = DC.el("div", { cls: "box", style: { left: x0 + "px", top: pick(330, 560) + "px", display: "flex", alignItems: "center", gap: "22px" } }, sc.cam);
  const bar = DC.el("span", { style: { width: "70px", height: "5px", background: C.vertSignal, display: "inline-block", transformOrigin: "0% 50%" } }, kick);
  const kl = DC.maskLine(kick, txt.s4.kicker, { fontSize: pick(28, 26) + "px", color: "rgba(255,255,255,0.85)" }, "inter");
  DC.hideWords(kl.words);
  tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: E.signalOut }, T("pros_a.start") + 0.05);
  DC.reveal(tl, kl.words, T("pros_a.start") + 0.12, { stagger: 0.05 });

  // « NE NAISSENT PAS » avec barrure
  const sz = pick(132, 100);
  const blockA = DC.el("div", { cls: "box", style: { left: x0 + "px", top: pick(420, 650) + "px" } }, sc.cam);
  const rows = pick([txt.s4.lineA], [txt.s4.lineA.slice(0, 2), txt.s4.lineA.slice(2)]);
  const words = {};
  rows.forEach((row, ri) => {
    const line = DC.el("div", { cls: "mline syne", style: { fontSize: sz + "px", marginTop: ri ? "10px" : "0px" } }, blockA);
    row.forEach((w, i) => {
      const m = DC.el("span", { cls: "mask" }, line);
      const inner = DC.el("span", { cls: "inner", text: w, style: { position: "relative" } }, m);
      words[w] = inner;
      if (i < row.length - 1) DC.el("span", { cls: "space", html: "&nbsp;" }, line);
    });
  });
  const wl = Object.values(words);
  DC.hideWords(wl);
  const strike = DC.el("span", { style: { position: "absolute", left: "-2%", width: "104%", top: "47%", height: "0.1em", background: C.vertSignal, transformOrigin: "0% 50%" } }, words.NAISSENT);
  gsap.set(strike, { scaleX: 0 });
  const pe = T("pros_a.end");
  tl.to(words.NE, { yPercent: 0, duration: 0.45, ease: E.signalOut }, pe - 0.95);
  tl.to(words.NAISSENT, { yPercent: 0, duration: 0.45, ease: E.signalOut }, pe - 0.82);
  tl.to(words.PAS, { yPercent: 0, duration: 0.45, ease: E.signalOut }, pe - 0.48);
  tl.to(strike, { scaleX: 1, duration: 0.2, ease: E.press }, pe - 0.35);
  tl.to(words.NAISSENT, { color: "rgba(255,255,255,0.32)", duration: 0.25 }, pe - 0.2);

  // « ILS SE FORMENT. » — chaque lettre s'assemble en deux moitiés
  const pb = T("pros_b.start");
  const lineB = pick([txt.s4.lineB], ["ILS SE", "FORMENT."]);
  const blockB = DC.el("div", { cls: "box", style: { left: x0 + "px", top: pick(620, 930) + "px" } }, sc.cam);
  const chars = [];
  lineB.forEach((t, i) => {
    const cl = DC.charLine(blockB, t, { fontSize: sz + "px", marginTop: i ? "10px" : "0px" }, "syne");
    cl.chars.forEach((c) => chars.push(c));
  });
  const formIdx = lineB.join(" ").replace(/ /g, "").indexOf("FORMENT");
  chars.forEach((c, i) => {
    if (i >= formIdx) [c.top, c.bot].forEach((h) => (h.style.color = C.jauneOnde));
    tl.fromTo(c.top, { y: -sz * 0.55, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: E.land }, pb + i * 0.045);
    tl.fromTo(c.bot, { y: sz * 0.55, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: E.land }, pb + i * 0.045);
  });

  // sortie
  const out = sc.t1 - 0.22;
  DC.exitUp(tl, kl.words.concat(wl), out, { stagger: 0.01 });
  tl.to([bar, strike], { opacity: 0, duration: 0.15 }, out);
  tl.to(blockB, { y: -60, opacity: 0, duration: 0.25, ease: E.press }, out + 0.02);
});
