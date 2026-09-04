/* Source of truth for the image pipeline. The application is evaluated by the
   shared DOM stub, so formatting changes in STORY cannot alter the inventory. */
const { openApp } = require("./stub-dom");

const { app } = openApp("{STORY}");
const characters = Array.from(app.STORY.personaggi, person => person.c.toLowerCase());
const poses = Array.from(new Set(app.STORY.scene.flatMap(scene => (scene.cast || [])
  .filter(actor => actor.posa)
  .map(actor => `${actor.c.toLowerCase()}_${actor.posa}`))));
const clues = Array.from(app.STORY.oggetti, clue => clue.id);

process.stdout.write(JSON.stringify({ characters, poses, clues }));
