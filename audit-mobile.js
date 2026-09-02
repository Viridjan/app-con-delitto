/* Iniettato nella pagina: misura leggibilita' e ingombri sul telefono. */
const lum = c => { const [r,g,b] = c.map(v => { v/=255; return v<=.03928 ? v/12.92 : ((v+.055)/1.055)**2.4; });
  return .2126*r + .7152*g + .0722*b; };
const rgb = s => (s.match(/[\d.]+/g) || [0,0,0]).slice(0,3).map(Number);
const opaco = el => { let e = el; while (e) { const b = getComputedStyle(e).backgroundColor;
  if (b && !/rgba\(0, 0, 0, 0\)|transparent/.test(b)) return rgb(b); e = e.parentElement; } return [18,22,15]; };
const contrasto = el => { const s = getComputedStyle(el); const a = lum(rgb(s.color)), b = lum(opaco(el));
  return Math.round(((Math.max(a,b)+.05)/(Math.min(a,b)+.05)) * 10) / 10; };
const testo = el => (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 34);

const out = { larghezza: innerWidth, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, testi: [], tocchi: [] };
const visto = new Set();
document.querySelectorAll("#stage *, .avanza, .volume input").forEach(el => {
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const diretto = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  if (diretto) {
    const px = parseFloat(getComputedStyle(el).fontSize);
    const k = testo(el);
    if (!visto.has(k)) { visto.add(k); out.testi.push({ t: k, px: Math.round(px*10)/10, c: contrasto(el) }); }
  }
  if (el.matches("button, a, [role=button]"))
    out.tocchi.push({ t: testo(el) || el.className, w: Math.round(r.width), h: Math.round(r.height) });
});
document.title = JSON.stringify(out);
