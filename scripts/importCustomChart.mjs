/**
 * importCustomChart.mjs - seed one market's chart history into EVERY
 * admin-created (non-push) custom market.
 *
 * The JSON (json data/custome.json) holds a single market's panel chart:
 *   { game, panel_chart: { title, columns, day_format, weeks: [
 *       { date_range: "15/01/2024 to 21/01/2024",
 *         Mon: {open_panna, jodi, close_panna}, ... Sun: {...} } ] } }
 *
 * The left date of `date_range` maps to the Mon column POSITIONALLY
 * (date = leftDate + columnIndex), because some weeks don't actually start
 * on a Monday. Each cell's jodi is validated as ank(open)+ank(close).
 *
 * Admin-created markets are the ones in the `markets` collection with
 * pushDriven != true (i.e. NOT the external webhook/CB feeds). Each such
 * market gets its chart from the `results` collection, so we write the
 * open + close half for every date via the same buildDisplay() the site
 * uses. Upserts are keyed (market, date, session) so re-runs are no-ops.
 *
 * USAGE:
 *   node scripts/importCustomChart.mjs                       # all custom markets
 *   node scripts/importCustomChart.mjs --dry-run             # preview, no writes
 *   node scripts/importCustomChart.mjs --slug kuber-d        # one market (repeatable)
 *   node scripts/importCustomChart.mjs --file "json data/custome.json"
 */
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_FILE = 'json data/custome.json';
const DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const USAGE = [
  'importCustomChart.mjs - seed custome.json chart into every admin-created market',
  '',
  '  node scripts/importCustomChart.mjs [--dry-run] [--skip-bad]',
  '  node scripts/importCustomChart.mjs --slug kuber-d --slug arvind-night',
  '  node scripts/importCustomChart.mjs --file "json data/custome.json"',
].join('\n');

function parseArgs(argv) {
  const args = { dryRun: false, file: DEFAULT_FILE, slugs: [], skipBad: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--skip-bad') args.skipBad = true;
    else if (a === '--file') args.file = argv[++i];
    else if (a === '--slug') args.slugs.push(String(argv[++i]).toLowerCase());
    else if (a === '--help' || a === '-h') { console.log(USAGE); process.exit(0); }
    else throw new Error(`Unknown flag: ${a}`);
  }
  return args;
}

/** Sum of digits mod 10 (the ank of a panna). */
function ankOf(pana) {
  return String(pana).split('').reduce((a, ch) => a + Number(ch), 0) % 10;
}

/** Parse "15/01/2024" -> Date (local). */
function parseDMY(value) {
  const m = String(value ?? '').trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!m) return null;
  const d = Number(m[1]), mo = Number(m[2]), y = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

/** Date -> "YYYY-MM-DD". */
function ymd(dt) {
  const p = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}

/**
 * Parse custome.json -> { draws, holidays, errors }.
 * draws: [{ date, open, jodi, close }]
 */
function loadDraws(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const weeks = (raw && raw.panel_chart && raw.panel_chart.weeks) || [];
  if (!weeks.length) throw new Error(`No panel_chart.weeks found in ${filePath}`);
  const draws = [];
  const errors = [];
  let holidays = 0;
  let corrected = 0;
  for (const wk of weeks) {
    const left = String(wk.date_range || '').split('to')[0] || '';
    const start = parseDMY(left);
    if (!start) { errors.push(`bad date_range "${wk.date_range}"`); continue; }
    for (let i = 0; i < DAY_KEYS.length; i++) {
      const cell = wk[DAY_KEYS[i]];
      if (!cell) continue;
      const open = String(cell.open_panna ?? '').trim();
      const jodi = String(cell.jodi ?? '').trim();
      const close = String(cell.close_panna ?? '').trim();
      // Holiday / blank / placeholder cells (** or xxx or empty) -> skipped,
      // chart shows ** for them.
      const isPlaceholder = (s) => s === '' || /^[*xX.\-]+$/.test(s);
      if (isPlaceholder(open) || isPlaceholder(close) || isPlaceholder(jodi)) { holidays++; continue; }
      if (!/^\d{3}$/.test(open) || !/^\d{3}$/.test(close)) {
        errors.push(`${wk.date_range} ${DAY_KEYS[i]}: bad panna ${open}/${close}`);
        continue;
      }
      // The jodi is ALWAYS derived from the panna anks (the site never types it
      // in). If the source jodi disagrees we keep the pannas and recompute the
      // jodi, noting the correction instead of dropping the day.
      const derived = `${ankOf(open)}${ankOf(close)}`;
      if (jodi && /^\d{2}$/.test(jodi) && jodi !== derived) corrected++;
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      draws.push({ date: ymd(d), open, jodi: derived, close });
    }
  }
  draws.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { draws, holidays, errors, corrected };
}


async function main() {
  const args = parseArgs(process.argv.slice(2));
  const filePath = path.resolve(process.cwd(), args.file);
  const { draws, holidays, errors, corrected } = loadDraws(filePath);
  console.log(`file=${path.basename(filePath)} valid=${draws.length} holidays=${holidays} jodi-corrected=${corrected} errors=${errors.length}`);
  for (const e of errors.slice(0, 30)) console.log('  ERR ' + e);
  if (errors.length && !args.skipBad) {
    throw new Error(`Fix ${errors.length} bad cell(s) or re-run with --skip-bad.`);
  }
  if (!draws.length) throw new Error('Nothing valid to import.');
  console.log(`range=${draws[0].date}..${draws[draws.length - 1].date}`);

  const mongoUrl = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME || 'dpboss';
  if (!mongoUrl) throw new Error('MONGO_URL is not set (.env). Aborting.');
  await mongoose.connect(mongoUrl, { dbName, serverSelectionTimeoutMS: 8000 });
  try {
    const { Market } = await import('../server/models/Market.js');
    const { Result, buildDisplay } = await import('../server/models/Result.js');

    // Admin-created markets: everything in `markets` that is NOT a push/CB feed.
    const filter = { pushDriven: { $ne: true } };
    if (args.slugs.length) filter.slug = { $in: args.slugs };
    const markets = await Market.find(filter).sort({ closeTime: 1 }).lean();
    if (!markets.length) throw new Error('No matching custom markets found.');

    console.log(`target markets=${markets.length}`);
    for (const m of markets) console.log(`  - ${m.name} (slug=${m.slug})`);

    if (args.dryRun) { console.log('dry-run: no writes.'); return; }

    let totalHalves = 0;
    for (const m of markets) {
      const ops = [];
      for (const d of draws) {
        const openDigit = String(ankOf(d.open));
        const closeDigit = String(ankOf(d.close));
        const built = buildDisplay({ number: openDigit, pana: d.open }, { number: closeDigit, pana: d.close });
        if (built.error) throw new Error(`cannot build display for ${m.slug} ${d.date}: ${built.error}`);
        for (const session of ['open', 'close']) {
          const half = session === 'open'
            ? { number: openDigit, pana: d.open }
            : { number: closeDigit, pana: d.close };
          ops.push({
            updateOne: {
              filter: { market: m._id, date: d.date, session },
              update: { $set: {
                number: half.number, pana: half.pana, ank: Number(half.number),
                display: built.display, jodi: built.jodi, jodiComplete: built.jodiComplete,
              } },
              upsert: true,
            },
          });
        }
      }
      let upserted = 0;
      let matched = 0;
      for (let i = 0; i < ops.length; i += 500) {
        const res = await Result.bulkWrite(ops.slice(i, i + 500), { ordered: false });
        upserted += res.upsertedCount ?? 0;
        matched += (res.matchedCount ?? 0) + (res.modifiedCount ?? 0);
      }
      totalHalves += ops.length;
      console.log(`  ${m.name}: new=${upserted} already=${matched} halves=${ops.length}`);
    }
    console.log(`done. markets=${markets.length} days=${draws.length} total-halves=${totalHalves}`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => { console.error('IMPORT FAILED:', err.message); process.exit(1); });
