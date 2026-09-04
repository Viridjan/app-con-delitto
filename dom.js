/* node dom.js prima.txt — scrive il markup di ogni schermata, battute scoperte.
   Prima e dopo un riordino del codice, tolti `class` e `style`, il diff dei due
   file dev'essere vuoto: se non lo e', il riordino ha cambiato la sostanza. */
const fs = require("fs");
const { openApp } = require("./stub-dom");

const { app, stage } = openApp("{state,SLIDES,STORY,goTo,render}");
const normalizeMarkup = t => t
  .replace(/data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+/g, "DATA")   // i data URI non dicono niente
  .replace(/\s+/g, " ").replace(/> </g, ">\n<");

const out = [];
for (let i = 0; i < app.SLIDES.length; i++) {
  const s = app.SLIDES[i];
  app.goTo(i);
  if (s.t === "scene") { app.state.step = app.STORY.scene[s.i].battute.length; app.render(); }
  out.push(`===== ${i} ${s.t} =====\n` + normalizeMarkup(stage.innerHTML));
}
// il dettaglio di un indizio e' l'unica schermata che non si raggiunge con vai()
app.goTo(app.SLIDES.findIndex(x => x.t === "tavolo"));
app.state.clue = 0; app.render();
out.push("===== dettaglio indizio =====\n" + normalizeMarkup(stage.innerHTML));

fs.writeFileSync(process.argv[2], out.join("\n\n"));
console.log("scritto", process.argv[2]);
