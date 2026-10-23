/* Legge il referto nel browser a tempo reale: Node >=22, nessuna dipendenza. */
(async () => {
  const port = process.argv[2];
  const deadline = Date.now() + 30000;
  const pause = () => new Promise(resolve => setTimeout(resolve, 50));
  let page;
  while (Date.now() < deadline && !page) {
    const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    page = pages.find(p => p.type === 'page');
    if (!page) await pause();
  }
  if (!page) throw new Error('Chromium non ha aperto la pagina');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, {once:true});
    ws.addEventListener('error', reject, {once:true});
  });
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', event => {
    const reply = JSON.parse(event.data);
    if (pending.has(reply.id)) {
      const {resolve, reject} = pending.get(reply.id);
      pending.delete(reply.id);
      if (reply.error) reject(new Error(reply.error.message));
      else resolve(reply.result);
    }
  });
  const command = (method, params) => new Promise((resolve, reject) => {
    pending.set(++id, {resolve, reject});
    ws.send(JSON.stringify({id, method, params}));
  });
  try {
    while (Date.now() < deadline) {
      const reply = await command('Runtime.evaluate', {
        expression: "(document.querySelector('iframe')?.contentDocument || document).title",
        returnByValue: true
      });
      const title = reply.result?.value || '';
      if (/^(ok ·|FALLITA|ERRORE|\[)/.test(title)) {
        console.log(title);
        return;
      }
      await pause();
    }
    throw new Error('nessun referto entro 30 secondi');
  } finally { ws.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
