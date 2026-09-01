/* Censimento dei corpi di testo: quante misure esistono davvero, e quali
   testi non hanno nessuna regola che li vesta. */
const regole = [];   // {sel, val, media}
for (const foglio of document.styleSheets) {
  let rr; try { rr = foglio.cssRules; } catch (e) { continue; }
  const scava = (lista, media) => {
    for (const r of lista) {
      if (r.media) { scava(r.cssRules, r.conditionText); continue; }
      if (!r.style) continue;
      const v = r.style.getPropertyValue("font-size");
      if (v) regole.push({ sel: r.selectorText, val: v, media });
    }
  };
  scava(rr, null);
}
const attive = regole.filter(r => !r.media || matchMedia(r.media).matches);
const veste = el => attive.some(r => { try { return el.matches(r.sel); } catch (e) { return false; } });

const misure = new Map(), nudi = [], vestiti = [];
const visti = new Set();
for (const el of document.querySelectorAll("#stage *")) {
  const diretto = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  if (!diretto) continue;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) continue;
  const px = Math.round(parseFloat(getComputedStyle(el).fontSize) * 10) / 10;
  const t = el.textContent.replace(/\s+/g, " ").trim().slice(0, 30);
  const k = el.className + "|" + t;
  if (visti.has(k)) continue; visti.add(k);
  misure.set(px, (misure.get(px) || 0) + 1);
  (veste(el) ? vestiti : nudi).push(`${px}px ${el.tagName.toLowerCase()}.${el.className || "—"} «${t}»`);
}
window.__cens = { regole: regole.length, attive: attive.length, misure: [...misure].sort((a,b)=>a[0]-b[0]), nudi, vestiti: vestiti.length };
