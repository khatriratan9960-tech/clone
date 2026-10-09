/**
 * Headless render check - confirms components mount and that the CSS
 * class names from the original markup are present in the DOM.
 *
 * Bundles with Vite first (Node cannot import .jsx directly), then runs
 * the bundle inside jsdom.
 *
 *   node verify.mjs
 */
import { build } from 'vite';
import { JSDOM } from 'jsdom';
import { readFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';

console.log('[0] bundling with Vite...');
await build({ logLevel: 'error' });

const jsFile = readdirSync('dist/assets').find((f) => f.endsWith('.js'));
if (!jsFile) throw new Error('No JS bundle produced');

const APP_URL = 'http://localhost:5173/';
const API_URL = 'http://localhost:8000/api/home.php';

const res = await fetch(APP_URL);
const html = await res.text();
console.log(`[1] index.html   -> HTTP ${res.status}, #root present: ${html.includes('id="root"')}`);

// Favicon / apple-touch-icon declarations must be present and local.
const iconLinks = [...html.matchAll(/<link[^>]*rel="[^"]*icon[^"]*"[^>]*>/gi)].map((m) => m[0]);
const localIcons = iconLinks.filter((l) => l.includes('href="/') && !l.includes('live.matka'));
const iconFiles = ['/favicon.ico', '/apple-icon-57.png', '/apple-icon-120.png', '/apple-icon-180.png'];

const iconChecks = [];
for (const f of iconFiles) {
  const r = await fetch(`http://localhost:5173${f}`);
  iconChecks.push([`${f} serves`, r.status === 200]);
}
iconChecks.push(['9 icon link tags', iconLinks.length === 9]);
iconChecks.push(['all icons local (no hotlinking)', localIcons.length === iconLinks.length]);

const api = await (await fetch(API_URL)).json();
console.log(
  `[2] API home.php -> ok=${api.ok} provider=${api.provider} ` +
    `markets=${api.data.markets.length} live=${api.data.liveResults.length} ` +
    `starline=${api.data.starline.length}`
);

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
  url: APP_URL,
  pretendToBeVisual: true,
  runScripts: 'outside-only',
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
// Node 24 exposes navigator as a getter-only global, so define instead.
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
});
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.Event = dom.window.Event;
globalThis.MutationObserver = dom.window.MutationObserver;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.localStorage = dom.window.localStorage;
globalThis.getComputedStyle = dom.window.getComputedStyle;

// Same-origin /api calls -> point at the mock API server.
// Must be set on BOTH globals: the bundle runs inside dom.window.eval,
// so bare `fetch` resolves to window.fetch first.
// Capture the real fetch FIRST - patchedFetch must not call the patched one.
const realFetch = globalThis.fetch.bind(globalThis);
const patchedFetch = async (url, opts) =>
  realFetch(String(url).startsWith('/api') ? `http://localhost:8000${url}` : String(url), opts);

globalThis.fetch = patchedFetch;
dom.window.fetch = patchedFetch;

console.log(`[3] running bundle ${jsFile} in jsdom...`);
dom.window.eval(await readFile(`dist/assets/${jsFile}`, 'utf8'));

await new Promise((r) => setTimeout(r, 3000));

const out = document.getElementById('root').innerHTML;
console.log(`[4] React render -> ${out.length} bytes of DOM\n`);

const linkPairs = (out.match(/gm-clk/g) || []).length / 2;
const liveCards = (out.match(/class="h8"/g) || []).length;

// Time labels inside the panel cards only. Scope to the tkt-val block and
// stop at the first starline table - later sections also contain times.
const afterPanels = out.split('class="tkt-val"')[1] ?? '';
const panelsHtml = afterPanels.split('class="my-table')[0] ?? '';
const timePairs = (panelsHtml.match(/\d{1,2}:\d{2}\s*[AP]M/g) || []).length;
const withTimes = api.data.markets.filter((m) => m.openTime && m.closeTime).length;

// The Final Ank marquee: 25 entries must be separated by <br>, one per line.
const finalAnkHtml = (out.split('class="amthltg"')[1] ?? '').split('</p>')[0] ?? '';
const finalAnkBr = (finalAnkHtml.match(/<br\s*\/?>/g) || []).length;

// The board is built from the clock, so whether anything is pending depends on
// what time the suite runs. Assert against the payload rather than assuming:
// if the API reports pending cards, they must render "Loading...".
const pendingLive = api.data.liveResults.filter((r) => r.isPending).length;

const checks = [
  ['header welcome bar', out.includes('Welcome to Live Matka international')],
  ['text2 (hero)', out.includes('text2')],
  ['f-pti (lucky number)', out.includes('f-pti')],
  ['liv-rslt (live results)', out.includes('liv-rslt')],
  ['tkt-val (jodi panels)', out.includes('tkt-val')],
  ['bg-ylw (highlighted first card)', out.includes('bg-ylw')],
  ['vl-clk + vl-clk-2 (jodi/panel links)', out.includes('vl-clk') && out.includes('vl-clk-2')],
  ['seo-content-box', out.includes('seo-content-box')],
  ['my-table (starline)', out.includes('my-table')],
  ['dis12 (footer)', out.includes('dis12')],
  ['REFRESH button', out.includes('REFRESH')],
  ['Devanagari renders (Join करें)', out.includes('Join करें')],
  ['emoji renders (📢 ☔)', out.includes('📢') && out.includes('☔')],
  ['VIP Zone trigger present', out.includes('VIP Zone')],
  ['no mojibake (Ã / ðŸ)', !out.includes('Ã') && !out.includes('ðŸ')],
  [`all 168 panels rendered (got ${linkPairs})`, linkPairs === 168],
  [`all 14 live cards rendered (got ${liveCards})`, liveCards === 14],
  // The board is built from the clock, so whether anything is pending depends
  // on what time the suite runs. Assert against the payload rather than
  // assuming: if the API reports pending cards, they must render "Loading...".
  [
    `pending live cards render Loading... (${pendingLive} pending now)`,
    pendingLive === 0 || out.includes('Loading...'),
  ],
  ['kalyan 257-48-369 present', out.includes('257-48-369')],
  ['brand logo banner removed from header', !out.includes('/img/live-matka-banner.png')],
  ['header laxmi image', out.includes('/img/live-matka-laxmi.jpg')],
  [
    `all markets have open+close times (${withTimes}/168)`,
    withTimes === 168,
  ],
  [`336 time labels in panel cards (got ${timePairs})`, timePairs === 336],
  ['kalyan times 11:40 AM / 12:40 PM', out.includes('11:40 AM') && out.includes('12:40 PM')],

  // --- Final Ank is an INDEPENDENT dataset, not derived from jodi ---
  ['finalAnk list rendered', out.includes('KALYAN MORNING - 4')],
  [
    'finalAnk matches source (4, not derived 9)',
    api.data.todayLuckyNumber.finalAnk.find((a) => a.market === 'KALYAN MORNING')?.ank === 4,
  ],
  ['finalAnk has 25 entries', api.data.todayLuckyNumber.finalAnk.length === 25],

  // --- new sections ---
  ['3 starline tables', api.data.starlineTables.mainStarline.length > 0
    && api.data.starlineTables.mumbaiRajshree.length > 0
    && api.data.starlineTables.bombay36.length > 0],
  ['MAIN STARLINE heading', out.includes('MAIN STARLINE')],
  ['Mumbai Rajshree heading', out.includes('Mumbai Rajshree Star Line Result')],
  ['MAIN BOMBAY 36 BAZAR heading', out.includes('MAIN BOMBAY 36 BAZAR Chart')],
  ['API promo strip', out.includes('LIVE MATKA API') && out.includes('CheckApiPricing')],
  ['AAJ KYA PASS HUA', out.includes('AAJ KYA PASS HUA') && out.includes('01-10-2026')],
  ['weekly charts (3)', api.data.weeklyCharts.length === 3 && out.includes('Weekly Patti')],
  ['FREE GAME ZONE', out.includes('FREE GAME ZONE OPEN-CLOSE') && out.includes('MILAN MORNING')],
  ['free game markets = 20', api.data.freeGame.markets.length === 20],
  ['day tables (2)', api.data.dayTables.length === 2 && out.includes('कल्याण')],
  ['link zones (2)', api.data.linkZones.length === 2 && out.includes('Matka Jodi List')],

  // --- finalAnk must be one entry per line, not one long row ---
  ['finalAnk uses <br> per line', finalAnkBr === 24],
  [
    'finalAnk first + last entries present',
    finalAnkHtml.includes('KALYAN MORNING - 4') && finalAnkHtml.includes('CITY BAZAR NIGHT - 0'),
  ],
  [
    'finalAnk not collapsed into one row',
    !/KALYAN MORNING - 4\s+MILAN MORNING - 6/.test(finalAnkHtml),
  ],
];

console.log('--- DOM assertions ---');
let failed = 0;
for (const [name, pass] of [...checks, ...iconChecks]) {
  if (!pass) failed++;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
}

console.log(failed === 0 ? '\nALL CHECKS PASSED' : `\n${failed} CHECK(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
