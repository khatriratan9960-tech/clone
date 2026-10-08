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
router.post('/', async (req, res) => {
  const {
    marketName,
    resultDate,
    apiOpenPana,
    apiOpenDigit,
    apiClosePana,
    apiCloseDigit,
  } = req.body ?? {};

  // --- marketName ---
  if (!marketName || typeof marketName !== 'string' || !marketName.trim()) {
    return res.status(400).json({ ok: false, error: 'marketName is required' });
  }

  // --- resultDate (YYYY-MM-DD) ---
  if (!resultDate || typeof resultDate !== 'string' || !DATE_RE.test(resultDate.trim())) {
    return res.status(400).json({ ok: false, error: 'resultDate must be in YYYY-MM-DD format' });
  }

  // --- apiOpenPana (3 digits) ---
  if (!apiOpenPana || typeof apiOpenPana !== 'string' || !OPEN_PANA_RE.test(apiOpenPana.trim())) {
    return res.status(400).json({ ok: false, error: 'apiOpenPana must be exactly 3 digits' });
  }

  // --- apiOpenDigit (1-2 digits) ---
  if (!apiOpenDigit || typeof apiOpenDigit !== 'string' || !OPEN_DIGIT_RE.test(apiOpenDigit.trim())) {
    return res.status(400).json({ ok: false, error: 'apiOpenDigit must be 1-2 digits' });
  }

  // --- apiClosePana (3 digits) ---
  if (!apiClosePana || typeof apiClosePana !== 'string' || !CLOSE_PANA_RE.test(apiClosePana.trim())) {
    return res.status(400).json({ ok: false, error: 'apiClosePana must be exactly 3 digits' });
  }

  // --- apiCloseDigit (1-2 digits) ---
  if (!apiCloseDigit || typeof apiCloseDigit !== 'string' || !CLOSE_DIGIT_RE.test(apiCloseDigit.trim())) {
    return res.status(400).json({ ok: false, error: 'apiCloseDigit must be 1-2 digits' });
  }

  const trimmedMarketName = marketName.trim();

  // --- Look up the market (case-insensitive) ---
  let market = await Market.findOne({
    name: trimmedMarketName,
    active: true,
  }).lean();

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
  const open = await Result.findOneAndUpdate(
    { market: market._id, date: resultDate, session: 'open' },
    {
      $set: {
        number: apiOpenDigit.trim(),
        pana: apiOpenPana.trim(),
        ank: Number(apiOpenPana.trim().slice(-1)),
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  // --- Upsert the CLOSE half ---
  const close = await Result.findOneAndUpdate(
    { market: market._id, date: resultDate, session: 'close' },
    {
      $set: {
        number: apiCloseDigit.trim(),
        pana: apiClosePana.trim(),
        ank: Number(apiClosePana.trim().slice(-1)),
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  // --- Build display + jodi ---
  const built = buildDisplay(open, close);

  res.status(201).json({
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
});

export default router;
