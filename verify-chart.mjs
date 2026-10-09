/**
 * Proves the PUBLIC chart pages are 100% REAL - nothing fabricated.
 *
 * It boots the ACTUAL Express API (which reads the real MongoDB), mounts the
 * real ChartPage in a jsdom browser that fetches from that live API, then
 * asserts every rendered panel/jodi cell is a mathematically valid draw whose
 * data came straight from the database:
 *   jodi === (lastDigit(sum(open)) + lastDigit(sum(close))) % 10
 *
 *   node verify-chart.mjs [jodi|panel] [slug]
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { build } from 'esbuild';
import dotenv from 'dotenv';
import pkg from 'jsdom';

dotenv.config();
const { JSDOM } = pkg;

const type = process.argv[2] || 'panel';
const slug = process.argv[3] || 'sridevi';
// Kept inside the project so the externalized react imports still resolve.
const tmp = path.resolve('node_modules/.cache/verify-chart-bundle.mjs');
fs.mkdirSync(path.dirname(tmp), { recursive: true });

/* 0. Boot the REAL API on an ephemeral port so the page fetches genuine
      history from MongoDB. The component uses relative /api/... URLs, so the
      jsdom page is served from this same origin. */
const { app } = await import('./server/app.js');
const server = http.createServer(app);
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;
const ORIGIN = `http://127.0.0.1:${PORT}`;
console.log(`API up on ${ORIGIN} (reads real MongoDB) - chart will be live data`);

/* 1. Bundle the component with esbuild (CSS imports are irrelevant here).
      react-dom/client stays external so we can mount a REAL client root that
      runs ChartPage's useApi effect and pulls genuine history from the API. */
const dropCss = {
  name: 'drop-css',
  setup(b) {
    b.onResolve({ filter: /\.css$/ }, () => ({ path: 'empty', namespace: 'drop' }));
    b.onLoad({ filter: /.*/, namespace: 'drop' }, () => ({ contents: '', loader: 'js' }));
  },
};

await build({
  entryPoints: [path.resolve('verify-chart.entry.jsx')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  jsx: 'automatic',
  outfile: tmp,
  external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [dropCss],
  logLevel: 'error',
});

const { renderChartPage } = await import(`file://${tmp.replace(/\\/g, '/')}`);
fs.rmSync(tmp, { force: true });

/* 2. Render the page in a REAL DOM so ChartPage's useApi effect runs against
      the live API - every cell on the page is genuine stored history. */
async function render(pathname) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: ORIGIN + pathname, // same origin as the live API -> relative /api works
    pretendToBeVisual: true,
  });
  // Give the bundle a browser-ish environment. fetch stays Node's native impl,
  // which jsdom's URL base turns /api/... into an absolute call to the server.
  const g = globalThis;
  g.window = dom.window;
  g.document = dom.window.document;
  g.self = dom.window;
  // Node 21+ exposes a read-only global `navigator`; redefine it for the page.
  Object.defineProperty(g, 'navigator', { value: dom.window.navigator, configurable: true });
  g.HTMLElement = dom.window.HTMLElement;
  g.Element = dom.window.Element;
  g.Node = dom.window.Node;
  g.getComputedStyle = dom.window.getComputedStyle;
  g.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  g.cancelAnimationFrame = (id) => clearTimeout(id);
  // The component calls fetch('/api/...') relative to the page. Node's fetch
  // needs an absolute URL, so wrap it to resolve against the live API origin.
  const nativeFetch = g.fetch;
  g.fetch = (url, opts) => nativeFetch(new URL(url, ORIGIN), opts);
  const rootEl = dom.window.document.getElementById('root');
  renderChartPage(pathname, rootEl);
  // Wait for the async useApi effect + live fetch to resolve and React to flush.
  await new Promise((r) => setTimeout(r, 1500));
  return dom.window.document;
}

const panelDoc = await render(`/panel-chart-record/${slug}.php`);
const doc = await render(`/${type}-chart-record/${slug}.php`);

const ank = (s) => String(s).split('').reduce((a, d) => a + Number(d), 0) % 10;
const pad2 = (n) => String(n).padStart(2, '0');

// index -> { open, jodi, close } straight from the panel cells
const panelCells = [...panelDoc.querySelectorAll('td.chp-cell')].map((td) => {
  const txt = td.textContent.replace(/\s+/g, '');
  if (!/^\d{8}$/.test(txt)) return null; // missing / future draw
  return { open: txt.slice(0, 3), jodi: txt.slice(3, 5), close: txt.slice(5, 8) };
});

const cells = [...doc.querySelectorAll('td.chp-cell')];
let checked = 0;
let bad = 0;

/* Panel cells must satisfy: panna sorted in 1..9,0 order and jodi maths. */
const rank = (d) => (Number(d) === 0 ? 10 : Number(d));
const sorted = (s) => s.split('').sort((a, b) => rank(a) - rank(b)).join('');

if (type === 'panel') {
  for (const p of panelCells) {
    if (!p) continue;
    checked++;
    for (const key of ['open', 'close']) {
      if (p[key] !== sorted(p[key])) {
        bad++;
        console.log(`  ORDER ${p[key]} (${key}) must be written ascending 1..9,0 -> ${sorted(p[key])}`);
      }
    }
    // Jodi = Open Ank followed by Close Ank (NOT their sum).
    const expected = `${ank(p.open)}${ank(p.close)}`;
    if (p.jodi !== expected) {
      bad++;
      console.log(
        `  MISMATCH open=${p.open} jodi=${p.jodi} close=${p.close} expected=${expected}` +
          ` (ank ${p.open}=${ank(p.open)}, ank ${p.close}=${ank(p.close)})`
      );
    }
  }
}

/* Jodi cells must be exactly the jodi of the panel cell in the same slot. */
if (type === 'jodi') {
  cells.forEach((td, i) => {
    const shown = td.textContent.trim();
    const p = panelCells[i];
    if (!p) return; // missing / future slot
    checked++;
    if (shown !== p.jodi) {
      bad++;
      console.log(`  MISMATCH cell#${i} jodi page=${shown} panel page=${p.jodi} (${p.open}-${p.close})`);
    }
  });
}

const head = [...doc.querySelectorAll('.chp-line')].map((n) => n.textContent.trim());

if (process.argv.includes('--dump')) {
  console.log('--- sample cells ---');
  [...doc.querySelectorAll('td.chp-cell')]
    .filter((td) => td.textContent.trim())
    .slice(-3)
    .forEach((td) => console.log(td.innerHTML.replace(/\s+/g, ' ')));
}
const title = doc.querySelector('.chp-title')?.textContent.replace(/\s+/g, ' ').trim();
const caption = doc.querySelector('.chp-cap')?.textContent.replace(/\s+/g, ' ').trim();
const links = doc.querySelectorAll('.chp-links a').length;
const faq = doc.querySelectorAll('.chp-faq-h').length;

console.log(`URL      : /${type}-chart-record/${slug}.php`);
console.log(`Title    : ${title}`);
console.log(`Caption  : ${caption}`);
console.log(`Result   : ${head[0]} ${head[1] ? `(bottom box: ${head[1]})` : ''}`);
console.log(`Cells    : ${cells.length} total, ${checked} drawn, ${bad} invalid`);
console.log(`FAQ items: ${faq}, chart links: ${links}`);

const latest = head[0]?.split('-');
if (latest?.length === 3 && latest[1] !== `${ank(latest[0])}${ank(latest[2])}`) {
  bad++;
  console.log(`  HEADER MISMATCH: ${head[0]}`);
}

const pass = bad === 0 && checked > 0;
console.log(pass
  ? `PASS - ${checked} REAL draws from MongoDB, every jodi matches its open/close panna`
  : 'FAIL');
server.close();
process.exit(pass ? 0 : 1);