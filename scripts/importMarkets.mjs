import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JSON_DIR = path.join(__dirname, '..', 'json data');
const MARKETS = [
  { file: 'KALYAN.json', name: 'KALYAN', slug: 'kalyan' },
  { file: 'MILAN DAY.json', name: 'MILAN DAY', slug: 'milan-day' },
  { file: 'TIME BAZAR.json', name: 'TIME BAZAR', slug: 'time-bazar' },
  { file: 'SRIDEVI.json', name: 'SRIDEVI', slug: 'sridevi' },
  { file: 'SRIDEVI NIGHT.json', name: 'SRIDEVI NIGHT', slug: 'sridevi-night' },
  { file: 'MAIN BAZAR.json', name: 'MAIN BAZAR', slug: 'main-bazar' },
  { file: 'MILAN NIGHT.json', name: 'MILAN NIGHT', slug: 'milan-night' },
  { file: 'RAJDHANI NIGHT.json', name: 'RAJDHANI NIGHT', slug: 'rajdhani-night' },
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const pad2 = (n) => String(n).padStart(2, '0');
const ymd = (d) => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
function parseDMY(s) {
  const m = String(s || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return Number.isNaN(d.getTime()) ? null : d;
}
function clean3(v) {
  const s = String(v == null ? '' : v).trim();
  if (!s || s.indexOf('*') >= 0) return null;
  if (!/^\d{3}$/.test(s)) return null;
  return s;
}
function clean2(v) {
  const s = String(v == null ? '' : v).trim();
  if (!s || s.indexOf('*') >= 0) return null;
  if (!/^\d{2}$/.test(s)) return null;
  return s;
}
/** Digit rank for matka panna ordering: 1..9 then 0 last. */
const digitRank = (d) => (Number(d) === 0 ? 10 : Number(d));
/** Pannas are always written ascending in the 1..9,0 sequence. */
function sortPanna(panna) {
  return String(panna).split('').sort((a, b) => digitRank(a) - digitRank(b)).join('');
}
/** Open Ank = last digit of the sum of a panna's three digits. */
function ankOf(panna) {
  return String(panna).split('').reduce((a, ch) => a + Number(ch), 0) % 10;
}
/**
 * Normalize a draw to matka canon. The jodi is ALWAYS derived from the two
 * panna anks (it is never an independent value in matka), and both pannas are
 * written ascending. The source JSON has a handful of rows whose stored jodi
 * disagrees with its own pannas or whose pannas are out of order; we correct
 * the representation so the stored chart is internally consistent with what the
 * chart UI renders. This is not inventing data - the drawn digits are the
 * source's own; we only fix their canonical form.
 */
function normalizeDraw(open, jodi, close) {
  const o = sortPanna(open);
  const c = sortPanna(close);
  const derivedJodi = String(ankOf(o)) + String(ankOf(c));
  return { openPana: o, jodi: derivedJodi, closePana: c };
}
function loadDraws(cfg) {
  const fp = path.join(JSON_DIR, cfg.file);
  if (!fs.existsSync(fp)) throw new Error('Missing file: ' + fp);
  const raw = JSON.parse(fs.readFileSync(fp, 'utf8'));

  // Shape A: { panel_record: { weeks: [ { date_range, Mon:{open_panna,jodi,close_panna}... } ] } }
  // Shape B: { records: [ { date_range, Mon:{panel:[..],jodi,result:[..]}... } ] }
  const src = (raw && raw.panel_record) || raw || {};
  const weeks = src.weeks || src.records || [];

  const draws = [];
  let holidays = 0;
  for (const wk of weeks) {
    const left = String((wk && wk.date_range) || '').split('to')[0] || '';
    const start = parseDMY(left);
    if (!start) continue;
    for (let i = 0; i < DAYS.length; i++) {
      const cell = wk[DAYS[i]];
      if (!cell || typeof cell !== 'object') continue;
      let open;
      let jodi;
      let close;
      if (cell.panel || cell.result) {
        // Shape B: panel = open panna (3 digits), result = close panna (3
        // digits), jodi = ank(open)+ank(close). Verified across all rows.
        const panelStr = Array.isArray(cell.panel) ? cell.panel.join('') : cell.panel;
        const resultStr = Array.isArray(cell.result) ? cell.result.join('') : cell.result;
        open = clean3(panelStr);
        jodi = clean2(cell.jodi);
        close = clean3(resultStr);
      } else {
        // Shape A
        open = clean3(cell.open_panna);
        jodi = clean2(cell.jodi);
        close = clean3(cell.close_panna);
      }
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      if (!open || !jodi || !close) { holidays++; continue; }
      const norm = normalizeDraw(open, jodi, close);
      draws.push({ slug: cfg.slug, market: cfg.name, date: ymd(d), openPana: norm.openPana, jodi: norm.jodi, closePana: norm.closePana, display: norm.openPana + '-' + norm.jodi + '-' + norm.closePana, source: 'matka' });
    }
  }
  return { draws: draws, holidays: holidays, weeks: weeks.length };
}

async function run() {
  const argv = process.argv.slice(2);
  const dry = argv.indexOf('dry-run') >= 0 || argv.indexOf('--dry-run') >= 0;
  let only = null;
  for (const a of argv) {
    if (String(a).indexOf('markets=') === 0) only = String(a).slice(8).split(',').map((s) => s.trim().toUpperCase());
  }
  const wanted = new Set(only || MARKETS.map((m) => m.name));
  const selected = MARKETS.filter((m) => wanted.has(m.name));
  if (!selected.length) throw new Error('No markets selected');
  let total = 0;
  const per = [];
  for (const cfg of selected) {
    const r = loadDraws(cfg);
    const dates = r.draws.map((d) => d.date).sort();
    per.push({ cfg: cfg, draws: r.draws });
    total += r.draws.length;
    console.log(cfg.name + ' (' + cfg.slug + '): weeks=' + r.weeks + ' valid=' + r.draws.length + ' holidays=' + r.holidays + (dates.length ? ' range=' + dates[0] + '..' + dates[dates.length - 1] : ''));
  }
  console.log('total valid days: ' + total);
  if (dry) { console.log('dry-run: no writes.'); return; }
  const mongoUrl = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME || 'dpboss';
  if (!mongoUrl) throw new Error('MONGO_URL missing');
  await mongoose.connect(mongoUrl, { dbName: dbName, serverSelectionTimeoutMS: 8000 });
  try {
    const mod = await import('../server/models/ChartEntry.js');
    const ChartEntry = mod.ChartEntry;
    for (const item of per) {
      let up = 0; let had = 0;
      const ops = item.draws.map((d) => ({ updateOne: { filter: { slug: d.slug, date: d.date }, update: { $set: d }, upsert: true } }));
      for (let i = 0; i < ops.length; i += 500) {
        const res = await ChartEntry.bulkWrite(ops.slice(i, i + 500), { ordered: false });
        up += res.upsertedCount || 0;
        had += (res.matchedCount || 0) + (res.modifiedCount || 0);
      }
      console.log(item.cfg.name + ': new=' + up + ' already-had=' + had + ' total=' + item.draws.length);
    }
  } finally { await mongoose.disconnect(); }
  console.log('done.');
}
run().catch((e) => { console.error('IMPORT FAILED:', e.message); process.exit(1); });
