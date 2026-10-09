/* S5 — ÉTUDIANTS & PARTENAIRES : deux publics reliés par le Trait, puis la promesse marché. */
(DC.sceneBuilders = DC.sceneBuilders || []).push(function s05(ctx) {
  const { tl, C, E, T, F, W, H, L, pick, txt } = ctx;
  const sc = ctx.scene("s5", { bg: C.studio, post: 0.02 });

  const pw = pick(700, 900), ph = pick(400, 320);
  const skew = Math.tan((12 * Math.PI) / 180) * ph;
  const pos = L ? [[150, 250], [1070, 250]] : [[90, 300], [90, 870]];
  const textY = pick(250 + ph + 40, null);
  const cols = [txt.s5.a, txt.s5.b].map((spec, i) => {
    const [x, y] = pos[i];
    const grp = DC.el("div", { cls: "box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px" } }, sc.cam);
    const panel = DC.mediaPanel(grp, i ? "partenaires" : "etudiants", i ? "partenaires" : "etudiants", { left: x + "px", top: y + "px", width: pw + "px", height: ph + "px" });
    const full = `polygon(${skew}px 0px, ${pw}px 0px, ${pw - skew}px ${ph}px, 0px ${ph}px)`;
    const shut = `polygon(${skew}px 0px, ${skew}px 0px, 0px ${ph}px, 0px ${ph}px)`;
    panel.el.style.clipPath = shut;
    const tb = DC.textBlock(grp, [
      { text: spec.kicker, size: pick(26, 24), cls: "inter", style: { color: "rgba(255,255,255,0.85)" } },
      { text: spec.title, size: pick(100, 92), color: i ? C.blanc : C.blanc },
    ], { x: x + (L ? 0 : 0), y: L ? textY : y + ph + 30, gap: 10 });
    return { grp, panel, full, tb, x, y };
  });

  const ca = T("aud_a.start"), cb = T("aud_b.start");
  [[cols[0], ca, T("aud_a@aguerris") - 0.08], [cols[1], cb, T("aud_b@rassurés") - 0.08]].forEach(([c, t, tt]) => {
    tl.to(c.panel.el, { clipPath: c.full, duration: 0.55, ease: E.signalOut }, t - 0.05);
    c.panel.animate(tl, t + 0.05, 2.5);
    DC.reveal(tl, c.tb.lines[0].words, t, { stagger: 0.06 });
    DC.reveal(tl, c.tb.lines[1].words, tt, { dur: 0.5 });
  });

  // le Trait relie les deux publics (16:9 : horizontal entre les panneaux ; 9:16 : vertical)
  const link = DC.svg("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, sc.cam);
  link.style.position = "absolute";
  const p1 = L ? [150 + pw - skew / 2 + 10, 250 + ph / 2] : [W - 150, 300 + ph + 10];
  const p2 = L ? [1070 + skew / 2 - 10, 250 + ph / 2] : [W - 150, 870 - 10];
  const ln = DC.svg("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], stroke: C.vertSignal, "stroke-width": 6, pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1, "stroke-linecap": "round" }, link);
  const ends = [p1, p2].map(([x, y]) => DC.svg("circle", { cx: x, cy: y, r: 11, fill: C.jauneOnde }, link));
  const lt = T("aud_b.end") - 0.2;
  tl.fromTo(ends[0], { scale: 0, svgOrigin: `${p1[0]} ${p1[1]}` }, { scale: 1, duration: 0.25, ease: E.land }, lt);
  tl.to(ln, { strokeDashoffset: 0, duration: 0.4, ease: E.glide }, lt + 0.05);
  tl.fromTo(ends[1], { scale: 0, svgOrigin: `${p2[0]} ${p2[1]}` }, { scale: 1, duration: 0.25, ease: E.land }, lt + 0.4);

  // « des talents prêts pour le marché » : les deux colonnes cèdent la place
  const sOut = T("aud_c.start") + 0.1;
  cols.forEach((c, i) => tl.to(c.grp, { y: -H * 0.75, duration: 0.5, ease: E.press, delay: i * 0.04 }, sOut));
  tl.to(link, { y: -H * 0.75, duration: 0.5, ease: E.press }, sOut + 0.02);
  const st = DC.textBlock(sc.cam, L
    ? [{ text: txt.s5.statementA, size: 140 }, { text: txt.s5.statementB.replace(" MARCHÉ.", ""), size: 84, inline: true }]
    : [{ text: txt.s5.statementA, size: 100 }, { text: "PRÊTS POUR", size: 84 }, { text: "LE", size: 84 }],
  { x: 0, y: pick(410, 730), gap: pick(18, 12), align: "center" });
  // le mot MARCHÉ. en jaune, sur la dernière ligne
  const lastLine = st.lines[st.lines.length - 1].line;
  DC.el("span", { cls: "space", html: "&nbsp;" }, lastLine);
  const mm = DC.el("span", { cls: "mask" }, lastLine);
  const marche = DC.el("span", { cls: "inner", text: "MARCHÉ.", style: { color: C.jauneOnde } }, mm);
  DC.hideWords([marche]);
  const sIn = T("aud_c.start") + 0.38;
  DC.reveal(tl, st.lines[0].words, sIn, { dur: 0.6 });
  const rest = st.lines.slice(1).flatMap((l) => l.words).concat([marche]);
  DC.reveal(tl, rest, sIn + 0.45, { stagger: 0.09 });

  // transition : le losange du mortier (vert institution) recouvre l'écran
  const los = DC.el("div", { cls: "box", style: { left: W / 2 - 40 + "px", top: -H * 0.25 + "px", width: "80px", height: H * 1.5 + "px", background: C.vertInstitution, transform: "skewX(-24deg)" } }, sc.el);
  tl.fromTo(los, { scaleX: 0 }, { scaleX: pick(34, 22), duration: 0.42, ease: E.glide }, sc.t1 - 0.3);
});
