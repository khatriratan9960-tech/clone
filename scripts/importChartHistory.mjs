/**
 * Bulk-import historical chart data (2018-2026 backfill).
 *
 * Charts read from MongoDB, so pasting your old results here fills every
 * Jodi + Panel chart at once. After the backfill, each new day keeps
 * appending on its own (webhook / provider sync / admin declares).
 *
 * WHERE EACH KIND GOES (same collections the live site already reads):
 *   --to chart    provider + webhook markets -> ChartEntry rows
 *   --to results  custom (manual) markets    -> Result halves
 *                 (charts only show dates where BOTH halves exist)
 *
 * CSV FORMAT (header row required, column order free):
 *   market,date,open,jodi,close
 *   - market  optional if --market "NAME" is passed
 *   - date    YYYY-MM-DD, DD/MM/YYYY or DD-MM-YYYY
 *   - open    3-digit open pana, e.g. 900
 *   - jodi    2-digit jodi, e.g. 95
 *   - close   3-digit close pana, e.g. 140
 *   - result  OPTIONAL alt: full "900-95-140" instead of 3 columns
 *   - holiday rows (** or empty) are skipped; the chart prints ** for them
 *
 * EXAMPLES:
 *   node scripts/importChartHistory.mjs file.csv --market "KALYAN MORNING" --to chart --dry-run
 *   node scripts/importChartHistory.mjs file.csv --market "KALYAN MORNING" --to chart
 *   node scripts/importChartHistory.mjs custom.csv --to results --create-markets
 */
import fs from 'node:fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

function parseArgs(argv) {
  const args = { files: [], market: null, to: null, createMarkets: false, open: null, close: null, skipBad: false, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--market') args.market = argv[++i];
    else if (a === '--to') args.to = argv[++i];
    else if (a === '--create-markets') args.createMarkets = true;
    else if (a === '--open') args.open = argv[++i];
    else if (a === '--close') args.close = argv[++i];
    else if (a === '--skip-bad') args.skipBad = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else if (a.startsWith('--')) throw new Error(`Unknown flag: ${a}`);
    else args.files.push(a);
  }
  return args;
}

function splitLine(line) {
  const cells = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { cells.push(cur); cur = ''; }
    else cur += ch;
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

const HEADER_ALIAS = {
  market: 'market', marketname: 'market', name: 'market',
  date: 'date', day: 'date',
  open: 'open', openpana: 'open',
  jodi: 'jodi',
  close: 'close', closepana: 'close',
  result: 'result', display: 'result',
};

function readCsv(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/);
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  if (!lines.length) throw new Error(`${file}: file is empty`);
  const header = splitLine(lines[0]).map((h) => HEADER_ALIAS[h.toLowerCase().replace(/[\s_]+/g, '')] ?? null);
  if (!header.includes('date')) throw new Error(`${file}: header needs a date column (got: ${lines[0]})`);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cells = splitLine(lines[i]);
    const data = {};
    header.forEach((key, idx) => { if (key) data[key] = (cells[idx] ?? '').trim(); });
    rows.push({ file, line: i + 1, data });
  }
  return rows;
}

/* ------------------------------------------------------------------ *
 * Row validation -> normalized draws
 * ------------------------------------------------------------------ */

function slugFromName(name) {
  return String(name)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Split a "900-95-140" style result into its three halves. */
function splitResult(value) {
  const parts = String(value ?? '').split('-').map((p) => p.trim()).filter(Boolean);
  if (parts.length !== 3) return null;
  return { open: parts[0], jodi: parts[1], close: parts[2] };
}

function isPlaceholder(...cells) {
  return cells.every((c) => {
    const s = String(c ?? '').trim();
    return s === '' || /^\*+$/.test(s);
  });
}

function parseDate(value) {
  const s = String(value ?? '').trim();
  let y, m, d;
  let mch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (mch) { y = Number(mch[1]); m = Number(mch[2]); d = Number(mch[3]); }
  else {
    mch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (!mch) return null;
    d = Number(mch[1]); m = Number(mch[2]); y = Number(mch[3]);
  }
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  const p = (n) => String(n).padStart(2, '0');
  return `${y}-${p(m)}-${p(d)}`;
}

function ankOf(pana) {
  return String(pana).split('').reduce((a, ch) => a + Number(ch), 0) % 10;
}

/**
 * Validate every CSV row -> { draws, errors, holidays }.
 * A draw: { market, slug, date, open, jodi, close }.
 */
function normalizeRows(allRows, defaultMarket) {
  const draws = [];
  const errors = [];
  const seen = new Set();
  let holidays = 0;
  for (const { file, line, data } of allRows) {
    const where = `${file}:${line}`;
    const market = (data.market || defaultMarket || '').trim();
    if (!market) { errors.push(`${where}: no market (pass --market "NAME")`); continue; }
    const date = parseDate(data.date);
    if (!date) { errors.push(`${where}: bad date "${data.date ?? ''}" (use YYYY-MM-DD or DD/MM/YYYY)`); continue; }
    let { open, jodi, close } = data;
    if (data.result && !open && !jodi && !close) {
      const split = splitResult(data.result);
      if (!split) { errors.push(`${where}: bad result "${data.result}" (want "900-95-140")`); continue; }
      ({ open, jodi, close } = split);
    }
    if (isPlaceholder(open, jodi, close)) { holidays += 1; continue; }
    if (!/^\d{3}$/.test(String(open ?? '').trim())) { errors.push(`${where}: bad open pana "${open ?? ''}" (want 3 digits)`); continue; }
    if (!/^\d{3}$/.test(String(close ?? '').trim())) { errors.push(`${where}: bad close pana "${close ?? ''}" (want 3 digits)`); continue; }
    if (!/^\d{2}$/.test(String(jodi ?? '').trim())) { errors.push(`${where}: bad jodi "${jodi ?? ''}" (want 2 digits)`); continue; }
    open = String(open).trim(); jodi = String(jodi).trim(); close = String(close).trim();
    const expected = `${ankOf(open)}${ankOf(close)}`;
    if (jodi !== expected) { errors.push(`${where}: jodi ${jodi} != open/close anks ${expected} (${open}/${close})`); continue; }
    const key = `${market.toLowerCase()}|${date}`;
    if (seen.has(key)) { errors.push(`${where}: duplicate row for ${market} on ${date}`); continue; }
    seen.add(key);
    draws.push({ market, slug: slugFromName(market), date, open, jodi, close });
  }
  return { draws, errors, holidays };
}

function usage() {
  return [
    'Usage:',
    '  node scripts/importChartHistory.mjs <file.csv> [more.csv ...] --market "NAME" --to chart|results [flags]',
    '',
    'Flags: --market NAME | --to chart|results (required) | --create-markets',
    '       --open HH:MM --close HH:MM | --skip-bad | --dry-run | --help',
    '',
    'CSV header: market,date,open,jodi,close  (or a "result" column with "900-95-140").',
    'Dates: YYYY-MM-DD or DD/MM/YYYY. Holiday rows (** or blank) are skipped.',
  ].join('\n');
}
/* ------------------------------------------------------------------ *
 * Database writes
 * ------------------------------------------------------------------ */

function to24h(value) {
  const s = String(value ?? '').trim();
  let mch = s.match(/^(\d{1,2}):([0-5]\d)\s*([APap])\.?[Mm]?\.?$/);
  if (mch) {
    let h = Number(mch[1]) % 12;
    if (mch[3].toLowerCase() === 'p') h += 12;
    return `${String(h).padStart(2, '0')}:${mch[2]}`;
  }
  mch = s.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  return mch ? s : null;
}

/** Provider + webhook markets -> ChartEntry rows (what the chart page reads). */
async function writeChartRows(ChartEntry, draws, dryRun) {
  if (dryRun) return { upserted: 0, matched: 0 };
  const ops = draws.map((d) => ({
    updateOne: {
      filter: { slug: d.slug, date: d.date },
      update: {
        $set: {
          slug: d.slug, market: d.market, date: d.date,
          openPana: d.open, jodi: d.jodi, closePana: d.close,
          display: `${d.open}-${d.jodi}-${d.close}`, source: 'matka',
        },
      },
      upsert: true,
    },
  }));
  let upserted = 0;
  let matched = 0;
  for (let i = 0; i < ops.length; i += 500) {
    const res = await ChartEntry.bulkWrite(ops.slice(i, i + 500), { ordered: false });
    upserted += res.upsertedCount ?? 0;
    matched += (res.matchedCount ?? 0) + (res.modifiedCount ?? 0);
  }
  return { upserted, matched };
}

/** Custom (manual) markets -> Result open+close halves (chart needs both). */
async function writeResultRows({ Market, Result, buildDisplay }, draws, { dryRun, createMarkets, openTime, closeTime }) {
  const bySlug = new Map();
  for (const d of draws) {
    if (!bySlug.has(d.slug)) bySlug.set(d.slug, d.market);
  }
  let created = 0;
  const marketIds = new Map();
  for (const [slug, name] of bySlug) {
    const doc = await Market.findOne({ slug }).lean();
    if (doc) { marketIds.set(slug, doc._id); continue; }
    if (!createMarkets) throw new Error(`Market "${name}" (slug ${slug}) does not exist. Re-run with --create-markets.`);
    if (!openTime || !closeTime) throw new Error(`Market "${name}" is new: pass --open HH:MM --close HH:MM with --create-markets.`);
    const made = await Market.create({ name, slug, openTime, closeTime, active: true });
    marketIds.set(slug, made._id);
    created += 1;
  }
  let halves = 0;
  if (!dryRun) {
    for (const d of draws) {
      const marketId = marketIds.get(d.slug);
      const openDigit = String(ankOf(d.open));
      const closeDigit = String(ankOf(d.close));
      const built = buildDisplay({ number: openDigit, pana: d.open }, { number: closeDigit, pana: d.close });
      if (built.error) throw new Error(`cannot build display for ${d.market} ${d.date}: ${built.error}`);
      for (const session of ['open', 'close']) {
        const half = session === 'open'
          ? { number: openDigit, pana: d.open }
          : { number: closeDigit, pana: d.close };
        await Result.findOneAndUpdate(
          { market: marketId, date: d.date, session },
          {
            $set: {
              number: half.number, pana: half.pana, ank: Number(half.number),
              display: built.display, jodi: built.jodi, jodiComplete: built.jodiComplete,
            },
          },
          { upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
        halves += 1;
      }
    }
  }
  return { markets: bySlug.size, created, halves };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { console.log(usage()); process.exit(0); }
  if (!args.files.length) throw new Error('No CSV file given.\n' + usage());
  if (!args.to || !['chart', 'results'].includes(args.to)) {
    throw new Error('Pass --to chart (provider/webhook markets) or --to results (custom markets).\n' + usage());
  }
  const allRows = args.files.flatMap(readCsv);
  const { draws, errors, holidays } = normalizeRows(allRows, args.market);
  console.log(`rows=${allRows.length} valid=${draws.length} holidays=${holidays} errors=${errors.length}`);
  for (const e of errors.slice(0, 30)) console.log('  ERR ' + e);
  if (errors.length && !args.skipBad) throw new Error(`Fix ${errors.length} bad row(s) or re-run with --skip-bad.`);
  if (!draws.length) throw new Error('Nothing valid to import.');
  const dates = draws.map((d) => d.date).sort();
  const markets = new Set(draws.map((d) => d.market));
  console.log(`markets=${markets.size} range=${dates[0]}..${dates[dates.length - 1]}`);
  for (const m of [...markets].slice(0, 20)) console.log('  - ' + m);
  if (args.dryRun) { console.log('dry-run: no writes.'); return; }

  const mongoUrl = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME || 'dpboss';
  if (!mongoUrl) throw new Error('MONGO_URL is not set (.env). Aborting.');
  await mongoose.connect(mongoUrl, { dbName, serverSelectionTimeoutMS: 8000 });
  try {
    if (args.to === 'chart') {
      const { ChartEntry } = await import('../server/models/ChartEntry.js');
      const { upserted, matched } = await writeChartRows(ChartEntry, draws, false);
      console.log(`chart rows: new=${upserted} already-had=${matched} total=${draws.length}`);
    } else {
      const { Market } = await import('../server/models/Market.js');
      const { Result, buildDisplay } = await import('../server/models/Result.js');
      const openTime = args.open ? to24h(args.open) : null;
      const closeTime = args.close ? to24h(args.close) : null;
      if ((args.open && !openTime) || (args.close && !closeTime)) {
        throw new Error('--open/--close must be HH:MM (24h) or "11:40 AM" style.');
      }
      const r = await writeResultRows({ Market, Result, buildDisplay }, draws, {
        dryRun: false, createMarkets: args.createMarkets, openTime, closeTime,
      });
      console.log(`result halves: markets=${r.markets} created=${r.created} halves=${r.halves}`);
    }
  } finally {
    await mongoose.disconnect();
  }
  console.log('done.');
}

main().catch((err) => { console.error('IMPORT FAILED:', err.message); process.exit(1); });

