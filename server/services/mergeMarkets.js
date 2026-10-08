/**
 * Merge provider markets with the operator's own markets into one list.
 *
 * The goal is that a custom market is INDISTINGUISHABLE from a provider one:
 * same field names, same ordering, same result format. It is interleaved by
 * draw time rather than appended, so it slots into the natural flow of the
 * page instead of looking bolted on at the bottom.
 */

import { toMinutes, to12Hour, nowMinutes, publicStatus } from './marketClock.js';
import { buildDisplay } from '../models/Result.js';

// Re-exported so existing callers keep working from this module.
export { toMinutes, to12Hour };

/** Last digit of a result tail, or null. */
function ankOf(display) {
  if (!display) return null;
  const parts = String(display).split('-').filter(Boolean);
  const tail = parts[parts.length - 1] ?? '';
  return /^\d+$/.test(tail) ? Number(tail.slice(-1)) : null;
}

/** Shape a provider market to the same contract custom markets use. */
function normalizeProvider(raw, now) {
  const name = raw.market ?? raw.name ?? '';
  const open = raw.open ?? null;
  const close = raw.close ?? null;
  const jodi = raw.jodi ?? null;

  const hasAll = open != null && close != null && jodi != null && jodi !== '';
  const hasPair = open != null && close != null && !hasAll;

  let display = null;
  if (hasAll) display = `${open}-${close}-${jodi}`;
  else if (hasPair) display = `${open}-${close}`;
  else if (jodi != null && jodi !== '') display = String(jodi);

  const slug = raw.slug ?? String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return {
    market: name,
    slug,
    open,
    close,
    jodi: hasAll ? jodi : null,
    result: display,
    openTime: raw.openTime ?? '',
    closeTime: raw.closeTime ?? '',
    ank: raw.ank ?? ankOf(display),
    // Clock-driven, not result-driven: a market inside its draw window is
    // "live" even before anything has been published for it.
    status: publicStatus(
      toMinutes(raw.openTime ?? raw.open_time),
      toMinutes(raw.closeTime ?? raw.close_time),
      now,
      display !== null
    ),
    source: 'provider',
    jodiUrl: `/jodi-chart-record/${slug}.php`,
    panelUrl: `/panel-chart-record/${slug}.php`,
    _sort: toMinutes(raw.closeTime ?? raw.close_time),
  };
}

/**
 * Shape one of the operator's markets + its declared halves.
 *
 * ALL custom markets (manual + webhook) are RESULT-driven: the stored halves
 * decide what shows, not the clock.
 *   - open only   -> "223-7" the moment the open half is saved
 *   - both halves -> "223-76-680" the moment the close half is saved
 *   - nothing yet -> pending (Loading...)
 */
function normalizeCustom(market, halves, now) {
  const openM = toMinutes(market.openTime);
  const closeM = toMinutes(market.closeTime);

  // Same for manual + webhook markets: show whatever halves are stored.
  const built = halves?.open || halves?.close ? buildDisplay(halves?.open ?? null, halves?.close ?? null) : null;
  const ok = built && !built.error ? built : null;
  // Latest open row, so the listing can publish its pana even before close.
  const openRow = halves?.open ?? halves?.close ?? null;
    return {
      market: market.name,
      slug: market.slug,
      open: halves?.open?.pana ?? null,
      close: halves?.close?.pana ?? null,
      jodi: ok?.jodi ?? null,
      result: ok?.display ?? null,
      openTime: to12Hour(openM),
      closeTime: to12Hour(closeM),
      ank: ok?.ank ?? null,
      status: ok ? (ok.jodiComplete ? 'closed' : 'live') : 'pending',
      source: 'custom',
      // Internal only - stripped before the API responds.
      _sort: closeM,
      _marketId: String(market._id),
      jodiUrl: `/jodi-chart-record/${market.slug}.php`,
      panelUrl: `/panel-chart-record/${market.slug}.php`,
    };
}

/**
 * @param {Array} providerMarkets  normalized-by-provider markets
 * @param {Array} customMarkets    Mongo Market docs
 * @param {Map}   halvesByMarket   marketId -> { open, close } Result docs
 * @param {number} now             minutes since midnight in the market
 *                                 timezone; defaults to the real clock.
 *                                 Injectable so the schedule can be tested.
 */
export function mergeMarkets(providerMarkets, customMarkets, halvesByMarket, now = nowMinutes()) {
  const provider = (providerMarkets ?? []).map((r) => normalizeProvider(r, now));
  const custom = (customMarkets ?? []).map((m) =>
    normalizeCustom(m, halvesByMarket?.get(String(m._id)), now)
  );

  const all = [...provider, ...custom];

  // Interleave by close time. Anything without a parseable time sinks to the
  // end rather than scrambling the ordering.
  all.sort((a, b) => {
    const av = a._sort ?? Number.MAX_SAFE_INTEGER;
    const bv = b._sort ?? Number.MAX_SAFE_INTEGER;
    if (av !== bv) return av - bv;
    // Stable tiebreak: alphabetical, so the order never flickers between loads.
    return String(a.market).localeCompare(String(b.market));
  });

  // Drop the internal sort key before it reaches the client.
  return all.map(({ _sort, _marketId, ...rest }) => rest);
}
