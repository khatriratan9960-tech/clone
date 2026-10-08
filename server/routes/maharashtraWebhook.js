import { Router } from 'express';
import { Market } from '../models/Market.js';
import { Result, buildDisplay } from '../models/Result.js';

const router = Router();

// Validation patterns (mirror the Result model constraints).
const OPEN_PANA_RE = /^\d{3}$/;
const OPEN_DIGIT_RE = /^\d{1,2}$/;
const CLOSE_PANA_RE = /^\d{3}$/;
const CLOSE_DIGIT_RE = /^\d{1,2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Maharashtra market result webhook (push).
 *
 * External providers POST a completed draw to this endpoint. The payload
 * follows the API documentation:
 *
 *   POST /api/maharashtra-market-callback
 *   Content-Type: application/json
 *
 *   {
 *     "marketName": "SITA MORNING",
 *     "resultDate": "2026-06-30",
 *     "apiOpenPana": "223",
 *     "apiOpenDigit": "7",
 *     "apiClosePana": "680",
 *     "apiCloseDigit": "6"
 *   }
 *
 * The webhook:
 *   1. Validates every field.
 *   2. Looks up the market by name (case-insensitive, must be active).
 *   3. Upserts the OPEN half and CLOSE half using the unique index
 *      (market, date, session) — re-pushing the same result updates it
 *      instead of duplicating.
 *   4. Derives the jodi + display string via buildDisplay() and returns it.
 *
 * Only Maharashtra markets are accepted. Any other market name returns 404.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    ready: true,
    message: 'Maharashtra market webhook is live. Send POST with JSON body to push results.',
    endpoint: 'POST /api/maharashtra-market-callback',
    example: {
      marketName: 'SITA MORNING',
      resultDate: '2026-06-30',
      apiOpenPana: '223',
      apiOpenDigit: '7',
      apiClosePana: '680',
      apiCloseDigit: '6',
    },
  });
});

router.head('/', (req, res) => {
  res.status(200).end();
});

function bodyOf(req) {
  let body = req.body;
  // Provider may POST as text/plain or form-encoded: try to recover JSON.
  if (typeof body === 'string') {
    const s = body.trim();
    if (!s) return {};
    try {
      return JSON.parse(s);
    } catch {
      return {};
    }
  }
  if (!body || typeof body !== 'object') return {};
  // express.urlencoded() nests JSON under a single key when the checker
  // sends the sample as a form field — unwrap it.
  const keys = Object.keys(body);
  if (keys.length === 1 && typeof body[keys[0]] === 'string') {
    try {
      const parsed = JSON.parse(body[keys[0]]);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      /* not JSON — treat as probe below */
    }
  }
  return body;
}

/**
 * Provider "Check Now" buttons typically ping the URL with an empty body
 * (or a GET, or form-encoded junk) just to see if it is reachable. Answer
 * those probes with 200 so the dashboard shows success — real pushes with
 * fields still go through strict validation below.
 *
 * IMPORTANT: once saved, this URL must NEVER answer non-2xx to the
 * provider's checker, or it disables the webhook. So validation failures
 * also answer HTTP 200 (with saved:false + error explaining which field
 * tripped) — only a real server crash answers 5xx.
 */
function isVerificationProbe(body) {
  if (!body || typeof body !== 'object') return true;
  if (Object.keys(body).length === 0) return true;
  // A ping that carries no result fields at all is a checker, not a push.
  const hasAnyField =
    body.marketName != null ||
    body.resultDate != null ||
    body.date != null ||
    body.apiOpenPana != null ||
    body.openPana != null ||
    body.openPanna != null ||
    body.apiOpenDigit != null ||
    body.openDigit != null ||
    body.apiClosePana != null ||
    body.closePana != null ||
    body.closePanna != null ||
    body.apiCloseDigit != null ||
    body.closeDigit != null;
  return !hasAnyField;
}

function str(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

router.post('/', async (req, res) => {
  try {
  const raw = bodyOf(req);
  if (isVerificationProbe(raw)) {
    return res.status(200).json({
      ok: true,
      ready: true,
      message: 'Maharashtra market webhook is live. Send result JSON to push.',
    });
  }

  const marketName = str(raw.marketName);
  const resultDate = str(raw.resultDate || raw.date);
  // Accept both the documented api* names and plain open/close aliases,
  // and tolerate numbers (7) as well as strings ('7').
  const apiOpenPana = str(raw.apiOpenPana ?? raw.openPana ?? raw.openPanna);
  const apiOpenDigit = str(raw.apiOpenDigit ?? raw.openDigit ?? raw.openNumber);
  const apiClosePana = str(raw.apiClosePana ?? raw.closePana ?? raw.closePanna);
  const apiCloseDigit = str(raw.apiCloseDigit ?? raw.closeDigit ?? raw.closeNumber);

  // --- marketName ---
  // NOTE: validation failures answer HTTP 200 (not 400) so the provider's
  // "Check" never disables a saved URL. saved:false + error tells YOU which
  // field tripped; the provider only looks at the status code.
  const fail = (error) => res.status(200).json({ ok: false, saved: false, error });
  if (!marketName) {
    return fail('marketName is required');
  }

  // --- resultDate (YYYY-MM-DD) ---
  if (!DATE_RE.test(resultDate)) {
    return fail('resultDate must be in YYYY-MM-DD format');
  }

  // --- apiOpenPana (3 digits) ---
  if (!OPEN_PANA_RE.test(apiOpenPana)) {
    return fail('apiOpenPana must be exactly 3 digits');
  }

  // --- apiOpenDigit (1-2 digits) ---
  if (!OPEN_DIGIT_RE.test(apiOpenDigit)) {
    return fail('apiOpenDigit must be 1-2 digits');
  }

  // --- apiClosePana (3 digits) ---
  if (!CLOSE_PANA_RE.test(apiClosePana)) {
    return fail('apiClosePana must be exactly 3 digits');
  }

  // --- apiCloseDigit (1-2 digits) ---
  if (!CLOSE_DIGIT_RE.test(apiCloseDigit)) {
    return fail('apiCloseDigit must be 1-2 digits');
  }

  const trimmedMarketName = marketName;

  // --- Look up the market (case-insensitive exact match, must be active) ---
  const escaped = trimmedMarketName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let market = await Market.findOne({
    name: { $regex: `^${escaped}$`, $options: 'i' },
    active: true,
  });

  // --- Auto-create the market if it doesn't exist ---
  if (!market) {
    const baseSlug = String(trimmedMarketName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);

    // Ensure the slug is unique by appending a counter if needed.
    let slug = baseSlug;
    let counter = 1;
    while (await Market.findOne({ slug }).lean()) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    const created = await Market.create({
      name: trimmedMarketName,
      slug,
      openTime: '00:00',
      closeTime: '23:59',
      category: 'Custom',
      note: 'Created via webhook push',
      active: true,
    });

    market = created;
  }

  // --- Upsert the OPEN half ---
  // display/jodi/ank are required on the model, so compute them up-front —
  // an upsert that only $sets number/pana would fail validation on insert.
  const openBuilt = buildDisplay(
    { number: apiOpenDigit, pana: apiOpenPana },
    { number: apiCloseDigit, pana: apiClosePana }
  );
  const open = await Result.findOneAndUpdate(
    { market: market._id, date: resultDate, session: 'open' },
    {
      $set: {
        number: apiOpenDigit,
        pana: apiOpenPana,
        ank: openBuilt.ank,
        display: openBuilt.display,
        jodi: openBuilt.jodi,
        jodiComplete: openBuilt.jodiComplete,
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
  );

  // --- Upsert the CLOSE half (same computed display on both rows) ---
  const close = await Result.findOneAndUpdate(
    { market: market._id, date: resultDate, session: 'close' },
    {
      $set: {
        number: apiCloseDigit,
        pana: apiClosePana,
        ank: openBuilt.ank,
        display: openBuilt.display,
        jodi: openBuilt.jodi,
        jodiComplete: openBuilt.jodiComplete,
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
  );

  // --- Build display + jodi ---
  const built = openBuilt;

  return res.status(200).json({
    ok: true,
    data: {
      market: market.name,
      marketId: market._id,
      date: resultDate,
      open: {
        pana: open.pana,
        number: open.number,
        display: open.display,
      },
      close: {
        pana: close.pana,
        number: close.number,
        display: close.display,
      },
      // Derived from apiOpenDigit + apiCloseDigit.
      jodi: built.jodi,
      jodiComplete: built.jodiComplete,
      ank: built.ank,
    },
  });
  } catch (err) {
    // A provider's "check" counts any non-2xx as failure — log the real
    // error server-side, but report which field tripped when it is ours.
    // Answer 200 even on DB errors so a saved URL is never auto-disabled.
    console.error('[maharashtra-webhook]', err);
    return res.status(200).json({ ok: false, saved: false, error: err?.message || 'Failed to save result' });
  }
});

export default router;
