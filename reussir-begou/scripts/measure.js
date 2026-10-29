// Mesure des textes dans les polices du projet (largeur à 100 px + encre des capitales).
// usage : node scripts/measure.js "Anton|400|TEXTE" "Montserrat|800|TEXTE" ...
const {chromium} = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');
const fonts = path.resolve(__dirname, '../public/fonts');
const items = process.argv.slice(2).map((s) => s.split('|'));
(async () => {
  const html = `<!doctype html><style>
  @font-face{font-family:Anton;src:url(${fonts}/anton.woff2)}
  @font-face{font-family:Montserrat;src:url(${fonts}/montserrat-var-latin.woff2);font-weight:100 900}
  @font-face{font-family:Nunito;src:url(${fonts}/nunito-var-latin.woff2);font-weight:200 1000}
  @font-face{font-family:'Kaushan Script';src:url(${fonts}/kaushan.woff2)}
  span{font-size:100px;white-space:nowrap;line-height:1;position:absolute;left:0}</style><body></body>`;
  const file = path.join(os.tmpdir(), 'measure-fonts.html');
  fs.writeFileSync(file, html);
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 4000, height: 300}});
  await p.goto('file://' + file);
  const res = await p.evaluate(async (items) => {
    const out = [];
    for (const [fam, w, t] of items) {
      const s = document.createElement('span');
      s.style.fontFamily = fam; s.style.fontWeight = w; s.textContent = t;
      document.body.appendChild(s);
    }
    await document.fonts.ready;
    await new Promise((r) => setTimeout(r, 400));
    const c = document.createElement('canvas').getContext('2d');
    document.querySelectorAll('span').forEach((s, i) => {
      const [fam, w, t] = items[i];
      c.font = `${w} 100px ${fam.includes(' ') ? `'${fam}'` : fam}`;
      const m = c.measureText(t);
      out.push({text: t, font: fam, width: +s.getBoundingClientRect().width.toFixed(1), inkAscent: m.actualBoundingBoxAscent, inkDescent: m.actualBoundingBoxDescent, fontAscent: m.fontBoundingBoxAscent, fontDescent: m.fontBoundingBoxDescent, loaded: document.fonts.check(c.font)});
    });
    return out;
  }, items);
  for (const r of res) console.log(JSON.stringify(r));
  await b.close();
})();
