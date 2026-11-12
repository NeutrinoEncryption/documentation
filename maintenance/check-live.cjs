// Run from docs/: node maintenance/check-live.cjs
// Saves real deployed-page screenshots using an isolated headless Edge session.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'neutrino-docs-'));
const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', '--no-first-run', '--remote-debugging-port=9351', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let socket;
async function main() {
  let tab;
  for (let i = 0; i < 50; i++) {
    try { tab = (await (await fetch('http://127.0.0.1:9351/json/list')).json()).find(t => t.type === 'page'); if (tab) break; } catch {}
    await pause(200);
  }
  if (!tab) throw new Error('Headless browser did not start');
  socket = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', e => { const r = JSON.parse(e.data); if (pending.has(r.id)) { const p = pending.get(r.id); pending.delete(r.id); r.error ? p.reject(r.error) : p.resolve(r.result); } });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); socket.send(JSON.stringify({ id: n, method, params })); });
  const evaluate = async expression => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'https://docs.neutrino.peretas.live/?verify=' + Date.now() });
  await pause(6000);
  const report = await evaluate(`({title:document.title,heading:document.querySelector('h1')?.innerText,logos:[...document.images].filter(i=>i.src.includes('/logo/')).map(i=>({src:i.src,loaded:i.complete&&i.naturalWidth>0,width:i.width,height:i.height,href:i.closest('a')?.href}))})`);
  console.log(JSON.stringify(report, null, 2));
  if (report.heading !== 'Introduction') { console.log('DEPLOY_PENDING'); return; }
  for (const theme of ['dark', 'light']) {
    await evaluate(`document.querySelector('button[aria-label="Switch to ${theme} theme"]')?.click()`);
    await pause(1200);
    const actual = await evaluate('document.documentElement.className');
    if (!actual.includes(theme)) throw new Error('Theme did not change: ' + actual);
    const png = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(`maintenance/live-${theme}.png`, Buffer.from(png.data, 'base64'));
    console.log('Saved maintenance/live-' + theme + '.png');
  }
  fs.writeFileSync('maintenance/live-verification.json', JSON.stringify(report, null, 2) + '\n');
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => { socket?.close(); browser.kill(); });
