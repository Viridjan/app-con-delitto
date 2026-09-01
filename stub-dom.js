/* Il minimo DOM che l'app usa davvero — non jsdom, una dozzina di metodi.
   Lo condividono smoke.js, dom.js ed estrai-copione.js: ne esistevano tre
   copie, gia' divergenti, e la piu' vecchia funzionava solo per fortuna. */
const fs = require("fs"), vm = require("vm");

const nodo = () => ({
  _html: "", set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
  textContent: "", disabled: false, hidden: false, dataset: {}, style: {}, value: "",
  classList: { toggle() {}, add() {}, remove() {}, contains: () => false },
  addEventListener() {}, focus() {}, scrollIntoView() {}, scrollTo() {}, remove() {},
  insertAdjacentHTML(dove, html) { this._html += html; },
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
  get firstElementChild() { return nodo(); },
  querySelector: () => nodo(), querySelectorAll: () => [],
});

const DA_DISCO = { protocol: "file:", hostname: "" };

/* Apre l'app dentro un contesto finto e restituisce cio' che `coda` nomina,
   piu' lo stage su cui il render scrive. `loc` decide da dove l'app si crede
   servita: e' quello che accende o spegne regia, sviluppo e titoli. */
function apri(coda, loc = DA_DISCO) {
  const html = fs.readFileSync("oliva-blu.html", "utf8");
  const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join("\n");
  const stage = nodo();
  const doc = {
    createElement: nodo, addEventListener() {},
    querySelector: () => null, body: { appendChild: n => n },
    getElementById: id => (id === "stage" ? stage : nodo()),
    documentElement: { requestFullscreen: () => Promise.resolve() },
  };
  const ctx = {
    document: doc, Image: class { set src(_) {} }, matchMedia: () => ({ matches: false }),
    addEventListener() {}, requestAnimationFrame: fn => fn(), console, location: loc,
  };
  return { app: vm.runInNewContext(`${js};(${coda})`, ctx), stage };
}

module.exports = { apri, nodo, DA_DISCO };
