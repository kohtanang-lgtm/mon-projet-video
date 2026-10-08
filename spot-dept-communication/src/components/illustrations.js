/* Illustrations animées de repli (utilisées tant qu'aucune photo n'est fournie dans
   config/media.js). Chacune explique son sujet : rien n'est décoratif.
   Toutes sont dessinées dans un cadre 800×600 et remplissent leur panneau (slice). */
(function () {
  const DC = (window.DC = window.DC || {});
  const C = () => DC.brand.color;

  let uid = 0;
  function base(parent, bgTop, bgBot) {
    const s = DC.svg("svg", { class: "illus", viewBox: "0 0 800 600", preserveAspectRatio: "xMidYMid slice" }, parent);
    const id = "illus-bg-" + uid++;
    const defs = DC.svg("defs", {}, s);
    const lg = DC.svg("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    DC.svg("stop", { offset: 0, "stop-color": bgTop }, lg);
    DC.svg("stop", { offset: 1, "stop-color": bgBot }, lg);
    DC.svg("rect", { width: 800, height: 600, fill: `url(#${id})` }, s);
    return { s, defs };
  }

  // pseudo-aléatoire déterministe
  function rnd(seed) {
    let x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  const I = {};

  /** Amphithéâtre : gradins en arcs (le motif « onde ») qui se remplissent depuis l'estrade. */
  I.amphi = function (parent) {
    const { s } = base(parent, "#18222d", "#0e141b");
    const g = DC.svg("g", {}, s);
    const cx = 400, cy = 600;
    const heads = [];
    for (let i = 0; i < 8; i++) {
      const rx = 150 + i * 78, ry = 70 + i * 52;
      DC.svg("path", { d: `M${cx - rx},${cy} A${rx},${ry} 0 0 1 ${cx + rx},${cy}`, fill: "none",
        stroke: i === 3 ? C().vertSignal : "rgba(255,255,255,0.22)", "stroke-width": i === 3 ? 4 : 3,
        "stroke-dasharray": "14 10" }, g);
      const n = 9 + i * 4;
      for (let k = 0; k < n; k++) {
        if (rnd(i * 31 + k) < 0.32) continue;
        const a = Math.PI * (0.08 + 0.84 * (k + 0.5) / n);
        heads.push(DC.svg("circle", { cx: cx - rx * Math.cos(a), cy: cy - ry * Math.sin(a) - 9, r: 7,
          fill: rnd(k * 7 + i) < 0.12 ? C().jauneOnde : "rgba(255,255,255,0.55)" }, g));
      }
    }
    DC.svg("rect", { x: 360, y: 540, width: 80, height: 60, rx: 4, fill: C().vertInstitution }, g);
    DC.svg("rect", { x: 352, y: 532, width: 96, height: 12, rx: 3, fill: C().vertSignal }, g);
    return {
      svg: s,
      animate(tl, t) {
        tl.fromTo(g, { clipPath: "circle(0% at 50% 100%)" }, { clipPath: "circle(120% at 50% 100%)", duration: 1.1, ease: DC.ease.signalOut }, t);
        tl.fromTo(heads, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.3, ease: DC.ease.land, stagger: { each: 0.004, from: "start" } }, t + 0.15);
      },
    };
  };

  /** Studio : projecteur, micro et forme d'onde vivante (la voix qui part à l'antenne). */
  I.studios = function (parent) {
    const { s, defs } = base(parent, "#121a23", "#0b1016");
    const spotId = "spot-" + uid++;
    const rg = DC.svg("radialGradient", { id: spotId, cx: "50%", cy: "0%", r: "75%" }, defs);
    DC.svg("stop", { offset: 0, "stop-color": "rgba(255,255,255,0.20)" }, rg);
    DC.svg("stop", { offset: 1, "stop-color": "rgba(255,255,255,0)" }, rg);
    const spot = DC.svg("path", { d: "M330,0 L470,0 L700,600 L100,600 Z", fill: `url(#${spotId})` }, s);
    const mic = DC.svg("g", {}, s);
    DC.svg("rect", { x: 362, y: 150, width: 76, height: 150, rx: 38, fill: "#2b3642", stroke: "rgba(255,255,255,0.35)", "stroke-width": 3 }, mic);
    for (let k = 0; k < 6; k++) DC.svg("line", { x1: 372, x2: 428, y1: 175 + k * 18, y2: 175 + k * 18, stroke: "rgba(255,255,255,0.18)", "stroke-width": 3 }, mic);
    DC.svg("path", { d: "M340,250 C340,330 460,330 460,250", fill: "none", stroke: "rgba(255,255,255,0.45)", "stroke-width": 5 }, mic);
    DC.svg("line", { x1: 400, x2: 400, y1: 318, y2: 420, stroke: "rgba(255,255,255,0.45)", "stroke-width": 5 }, mic);
    DC.svg("rect", { x: 350, y: 418, width: 100, height: 10, rx: 5, fill: "rgba(255,255,255,0.45)" }, mic);
    DC.svg("circle", { cx: 400, cy: 172, r: 7, fill: C().rougeRec }, mic);
    const bars = [];
    for (let k = 0; k < 44; k++) {
      bars.push(DC.svg("rect", { x: 70 + k * 15, y: 520, width: 8, height: 4, rx: 4, fill: k % 7 === 3 ? C().jauneOnde : C().vertSignal }, s));
    }
    return {
      svg: s,
      animate(tl, t, dur) {
        tl.fromTo(spot, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: DC.ease.soft }, t);
        tl.fromTo(mic, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: DC.ease.signalOut }, t + 0.05);
        const p = { v: 0 };
        tl.fromTo(p, { v: 0 }, {
          v: 1, duration: dur, ease: "none",
          onUpdate() {
            const tt = p.v * dur;
            bars.forEach((b, k) => {
              const env = Math.min(1, tt * 3);
              const h = 6 + env * (38 * Math.abs(Math.sin(tt * 7.1 + k * 0.55)) * (0.5 + 0.5 * Math.sin(tt * 2.3 + k * 0.21)) + 14 * Math.abs(Math.sin(k * 1.7 + tt * 11)));
              b.setAttribute("height", h.toFixed(1));
              b.setAttribute("y", (520 - h / 2).toFixed(1));
            });
          },
        }, t);
      },
    };
  };

  /** Étudiants : une promotion de mortiers qui se lève, rangée après rangée. */
  I.etudiants = function (parent) {
    const { s } = base(parent, "#16202a", "#0d1319");
    const caps = [];
    const cols = 7, rows = 4;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const x = 110 + c * 96 + (r % 2) * 48, y = 120 + r * 108;
        const g = DC.svg("g", { transform: `translate(${x} ${y})` }, s);
        const hi = r === 2 && c === 3;
        const col = hi ? C().jauneOnde : "rgba(255,255,255,0.75)";
        const inner = DC.svg("g", {}, g);
        DC.svg("path", { d: "M0,-26 L40,-10 L0,6 L-40,-10 Z", fill: col }, inner);
        DC.svg("path", { d: "M-22,-2 L-22,16 C-10,24 10,24 22,16 L22,-2 L0,7 Z", fill: col, opacity: 0.75 }, inner);
        DC.svg("path", { d: "M0,-10 L30,-6 L30,18", fill: "none", stroke: hi ? C().jauneOnde : C().vertSignal, "stroke-width": 3 }, inner);
        caps.push(inner);
      }
    return {
      svg: s,
      animate(tl, t) {
        tl.fromTo(caps, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: DC.ease.land, stagger: { each: 0.025, grid: [rows, cols], from: "end" } }, t);
      },
    };
  };

  /** Partenaires : le Département au centre d'un réseau qui se connecte. */
  I.partenaires = function (parent) {
    const { s } = base(parent, "#16202a", "#0d1319");
    const cx = 400, cy = 300;
    const lines = [], nodes = [];
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / 7;
      const r = 205 + (k % 2) * 30;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a) * 0.92;
      lines.push(DC.svg("line", { x1: cx, y1: cy, x2: x, y2: y, stroke: "rgba(255,255,255,0.35)", "stroke-width": 3, pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 }, s));
      const n = DC.svg("g", { transform: `translate(${x} ${y})` }, s);
      const ni = DC.svg("g", {}, n);
      DC.svg("circle", { r: 26, fill: "#0d1319", stroke: k === 2 ? C().jauneOnde : C().vertSignal, "stroke-width": 4 }, ni);
      DC.svg("circle", { r: 8, fill: k === 2 ? C().jauneOnde : "rgba(255,255,255,0.8)" }, ni);
      nodes.push(ni);
    }
    const hub = DC.svg("g", { transform: `translate(${cx} ${cy})` }, s);
    const hubIn = DC.svg("g", {}, hub);
    DC.svg("circle", { r: 62, fill: C().vertInstitution }, hubIn);
    const txt = DC.svg("text", { x: 0, y: 14, "text-anchor": "middle", fill: "#fff", "font-family": "Syne", "font-weight": 700, "font-size": 44 }, hubIn);
    txt.textContent = "DC";
    const ring = DC.svg("circle", { r: 62, fill: "none", stroke: C().vertSignal, "stroke-width": 3 }, hub);
    return {
      svg: s,
      animate(tl, t) {
        tl.fromTo(hubIn, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.45, ease: DC.ease.land }, t);
        tl.to(lines, { strokeDashoffset: 0, duration: 0.5, ease: DC.ease.signalOut, stagger: 0.06 }, t + 0.15);
        tl.fromTo(nodes, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.35, ease: DC.ease.land, stagger: 0.06 }, t + 0.35);
        tl.fromTo(ring, { scale: 1, opacity: 0.9, transformOrigin: "50% 50%" }, { scale: 2.6, opacity: 0, duration: 1.0, ease: DC.ease.signalOut }, t + 0.5);
      },
    };
  };

  /** Journalisme numérique : un article se compose puis se publie. */
  I.journalisme = function (parent) {
    const { s } = base(parent, "#16202a", "#0d1319");
    const card = DC.svg("g", {}, s);
    DC.svg("rect", { x: 130, y: 90, width: 540, height: 420, rx: 14, fill: "#1d2733", stroke: "rgba(255,255,255,0.12)", "stroke-width": 2 }, card);
    DC.svg("rect", { x: 170, y: 130, width: 90, height: 12, rx: 6, fill: C().vertSignal }, card);
    const heads = [[170, 166, 430], [170, 204, 380], [170, 242, 250]].map(([x, y, w]) =>
      DC.svg("rect", { x, y, width: w, height: 24, rx: 4, fill: "#fff" }, card));
    DC.svg("circle", { cx: 182, cy: 300, r: 12, fill: C().gris }, card);
    DC.svg("rect", { x: 204, y: 295, width: 140, height: 10, rx: 5, fill: "rgba(255,255,255,0.4)" }, card);
    const body = [];
    for (let k = 0; k < 6; k++) body.push(DC.svg("rect", { x: 170, y: 336 + k * 22, width: k === 5 ? 260 : 460, height: 9, rx: 4.5, fill: "rgba(255,255,255,0.28)" }, card));
    const pill = DC.svg("g", { transform: "translate(560 132)" }, card);
    const pillIn = DC.svg("g", {}, pill);
    DC.svg("rect", { x: -62, y: -18, width: 124, height: 36, rx: 18, fill: C().vertSignal }, pillIn);
    const pt = DC.svg("text", { x: 0, y: 6, "text-anchor": "middle", fill: "#fff", "font-family": "Inter", "font-weight": 600, "font-size": 16, "letter-spacing": "2" }, pillIn);
    pt.textContent = "PUBLIÉ";
    return {
      svg: s,
      animate(tl, t) {
        tl.fromTo(card, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: DC.ease.signalOut }, t);
        tl.fromTo(heads, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.35, ease: DC.ease.signalOut, stagger: 0.09 }, t + 0.15);
        tl.fromTo(body, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.22, ease: "none", stagger: 0.12 }, t + 0.45);
        tl.fromTo(pillIn, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.4, ease: DC.ease.land }, t + 1.25);
      },
    };
  };

  /** Production audiovisuelle : la timeline de montage se construit, la tête de lecture avance. */
  I.production = function (parent) {
    const { s } = base(parent, "#141c25", "#0c1117");
    DC.svg("rect", { x: 160, y: 60, width: 480, height: 230, rx: 8, fill: "#0a0e13", stroke: "rgba(255,255,255,0.18)", "stroke-width": 2 }, s);
    const frame = DC.svg("g", {}, s);
    DC.svg("rect", { x: 172, y: 72, width: 456, height: 206, rx: 4, fill: C().vertInstitution }, frame);
    DC.svg("path", { d: DC.arcPath(400, 175, 50, 35, 325), fill: "none", stroke: C().rougeRec, "stroke-width": 16 }, frame);
    DC.svg("path", { d: DC.arcPath(400, 175, 80, 35, 325), fill: "none", stroke: "rgba(255,255,255,0.35)", "stroke-width": 6 }, frame);
    const tracks = [];
    const labels = ["V2", "V1", "A1"];
    labels.forEach((l, i) => {
      const y = 330 + i * 70;
      DC.svg("rect", { x: 60, y, width: 680, height: 54, rx: 6, fill: "rgba(255,255,255,0.05)" }, s);
      const tx = DC.svg("text", { x: 76, y: y + 34, fill: "rgba(255,255,255,0.5)", "font-family": "Inter", "font-weight": 600, "font-size": 18 }, s);
      tx.textContent = l;
    });
    const clips = [
      [130, 330, 150, C().jauneOnde], [300, 330, 210, C().jauneOnde],
      [130, 400, 230, C().vertSignal], [372, 400, 140, C().vertSignal], [524, 400, 200, C().vertSignal],
      [130, 470, 594, "rgba(255,255,255,0.28)"],
    ].map(([x, y, w, col]) => DC.svg("rect", { x, y: y + 8, width: w, height: 38, rx: 5, fill: col, opacity: 0.9 }, s));
    for (let k = 0; k < 70; k++) {
      const h = 6 + 22 * Math.abs(Math.sin(k * 0.9) * Math.cos(k * 0.37));
      tracks.push(DC.svg("rect", { x: 140 + k * 8.3, y: 497 - h / 2, width: 4, height: h, rx: 2, fill: "rgba(255,255,255,0.75)" }, s));
    }
    const head = DC.svg("g", {}, s);
    DC.svg("line", { x1: 0, x2: 0, y1: 312, y2: 540, stroke: C().rougeRec, "stroke-width": 4 }, head);
    DC.svg("path", { d: "M-10,300 L10,300 L0,314 Z", fill: C().rougeRec }, head);
    return {
      svg: s,
      animate(tl, t, dur) {
        tl.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 0.5 }, t + 0.1);
        tl.fromTo(clips, { x: 260, opacity: 0 }, { x: 0, opacity: 0.9, duration: 0.45, ease: DC.ease.signalOut, stagger: 0.07 }, t);
        tl.fromTo(tracks, { scaleY: 0, transformOrigin: "50% 50%" }, { scaleY: 1, duration: 0.3, stagger: 0.004 }, t + 0.35);
        tl.fromTo(head, { x: 150 }, { x: 700, duration: dur, ease: "none" }, t);
      },
    };
  };

  /** Stratégie digitale : la courbe d'engagement monte, les indicateurs suivent. */
  I.strategie = function (parent) {
    const { s } = base(parent, "#16202a", "#0d1319");
    const axes = DC.svg("g", {}, s);
    DC.svg("line", { x1: 100, x2: 100, y1: 90, y2: 470, stroke: "rgba(255,255,255,0.25)", "stroke-width": 3 }, axes);
    DC.svg("line", { x1: 100, x2: 520, y1: 470, y2: 470, stroke: "rgba(255,255,255,0.25)", "stroke-width": 3 }, axes);
    for (let k = 1; k < 4; k++) DC.svg("line", { x1: 100, x2: 520, y1: 470 - k * 95, y2: 470 - k * 95, stroke: "rgba(255,255,255,0.08)", "stroke-width": 2 }, axes);
    const pts = [[100, 430], [170, 410], [240, 380], [310, 392], [380, 300], [450, 240], [520, 140]];
    const d = "M" + pts.map((p) => p.join(",")).join(" L");
    const area = DC.svg("path", { d: d + " L520,470 L100,470 Z", fill: C().vertSignal, opacity: 0 }, s);
    const line = DC.svg("path", { d, fill: "none", stroke: C().vertSignal, "stroke-width": 6, "stroke-linejoin": "round", pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 }, s);
    const dots = pts.slice(1).map(([x, y], i) => DC.svg("circle", { cx: x, cy: y, r: i === pts.length - 2 ? 12 : 7, fill: i === pts.length - 2 ? C().jauneOnde : "#fff" }, s));
    const bars = [], names = ["PORTÉE", "ENGAGEMENT", "AUDIENCE"];
    [190, 260, 320].forEach((h, i) => {
      const x = 580 + i * 70;
      bars.push(DC.svg("rect", { x, y: 470 - h, width: 44, height: h, rx: 4, fill: i === 1 ? C().jauneOnde : "rgba(255,255,255,0.6)" }, s));
      const tx = DC.svg("text", { x: x + 22, y: 500, "text-anchor": "middle", fill: "rgba(255,255,255,0.55)", "font-family": "Inter", "font-weight": 600, "font-size": 12, "letter-spacing": "1" }, s);
      tx.textContent = names[i];
    });
    return {
      svg: s,
      animate(tl, t) {
        tl.fromTo(axes, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t);
        tl.to(line, { strokeDashoffset: 0, duration: 1.0, ease: DC.ease.glide }, t + 0.1);
        tl.fromTo(dots, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.25, ease: DC.ease.land, stagger: 0.14 }, t + 0.2);
        tl.to(area, { opacity: 0.16, duration: 0.6 }, t + 0.8);
        tl.fromTo(bars, { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.6, ease: DC.ease.signalOut, stagger: 0.1 }, t + 0.5);
      },
    };
  };

  DC.illus = I;

  /** Panneau média : photo (si fournie dans config/media.js) ou illustration de repli. */
  DC.mediaPanel = function (parent, slot, illusName, style) {
    const p = DC.el("div", { cls: "panel", style }, parent);
    const src = DC.media && DC.media[slot];
    if (src) {
      const img = DC.el("img", { cls: "photo", attrs: { src } }, p);
      DC.el("div", { cls: "grade" }, p);
      return {
        el: p, photo: true,
        animate(tl, t, dur) {
          tl.fromTo(img, { scale: 1.12 }, { scale: 1.0, duration: dur + 0.6, ease: DC.ease.soft }, t);
        },
      };
    }
    const il = DC.illus[illusName](p);
    return { el: p, photo: false, animate: (tl, t, dur) => il.animate(tl, t, dur) };
  };
})();
