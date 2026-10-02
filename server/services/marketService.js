import { Market } from '../models/Market.js';
import { Result } from '../models/Result.js';
import { fetchProviderMarkets, fetchProviderLive } from './provider.js';
import { mergeMarkets } from './mergeMarkets.js';
import { rankLiveCards, BOARD_SIZE } from './liveBoard.js';
import { toMinutes, to12Hour, nowMinutes, windowStatus } from './marketClock.js';
import { revealCustom } from './customReveal.js';

/** Today's date in YYYY-MM-DD using the server's local timezone. */
export function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Load active custom markets plus their declared halves.
 *
 * Both halves of the draw are kept, keyed market -> { open, close }, taken
 * from the most recent DATE that has any row. Keeping a single "latest row"
 * per market would drop the other half, which would hide the open pana or the
 * close pana from the public page.
 */
export async function loadCustomMarkets() {
  const markets = await Market.find({ active: true }).lean();

  if (markets.length === 0) return { markets: [], halvesByMarket: new Map() };

  const results = await Result.find({
    market: { $in: markets.map((m) => m._id) },
  })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  const halvesByMarket = new Map();
  for (const r of results) {
    const key = String(r.market);
    let entry = halvesByMarket.get(key);

    // The first row seen for this market fixes which draw we describe.
    if (!entry) {
      entry = { date: r.date, open: null, close: null };
      halvesByMarket.set(key, entry);
    }
    // Ignore older draws - only the most recent date is on the public page.
    if (r.date !== entry.date) continue;

    if (r.session === 'close') entry.close = r;
    else entry.open = r;
  }

  return { markets, halvesByMarket };
}

/**
 * The merged public market list: provider markets + custom markets,
 * interleaved by close time so custom ones blend into the flow.
 */
export async function getPublicMarkets(now = nowMinutes()) {
  const [{ markets, halvesByMarket }, providerMarkets] = await Promise.all([
    loadCustomMarkets(),
    fetchProviderMarkets(),
  ]);

  return mergeMarkets(providerMarkets, markets, halvesByMarket, now);
}

/**
 * Live-result cards.
 *
 * The board is time-driven, not declaration-driven: a market appears
 * because its draw window says it should. A custom market therefore shows
 * up on its own schedule, and its declared result (when the operator has
 * published one for today) is what fills the card in.
 *
 * The CLOCK gates the reveal (see customReveal.js): a result declared at
 * 09:00 for a market that opens at 09:15 shows nothing until 09:15, the
 * open half alone shows while the window is open, and the full result
 * appears once the close time passes.
 */
export async function getPublicLive(date = today(), now = nowMinutes()) {
  const [providerLive, { markets }] = await Promise.all([
    fetchProviderLive(),
    loadCustomMarkets(),
  ]);

  const declaredToday = markets.length
    ? await Result.find({
        market: { $in: markets.map((m) => m._id) },
        date,
      }).lean()
    : [];

  // A market has TWO rows per draw (session 'open' and 'close'), so they are
  // collected into one entry per market. Building the map with
  // `rows.map(r => [marketId, r])` would silently drop one half, because the
  // second row would overwrite the first.
  const byMarket = new Map();
  for (const r of declaredToday) {
    const key = String(r.market);
    let entry = byMarket.get(key);
    if (!entry) {
      entry = { open: null, close: null };
      byMarket.set(key, entry);
    }
    if (r.session === 'close') entry.close = r;
    else entry.open = r;
  }

  const customCards = markets
    .map((m) => {
      const openMin = toMinutes(m.openTime);
      const closeMin = toMinutes(m.closeTime);

      // Nothing to say about a market we cannot schedule.
      if (windowStatus(openMin, closeMin, now) === 'unknown') return null;

      const halves = byMarket.get(String(m._id)) ?? { open: null, close: null };
      const { status, result, ank, isPending } = revealCustom(
        m,
        halves.open,
        halves.close,
        now
      );

      return {
        market: m.name,
        slug: m.slug,
        result,
        ank,
        isPending,
        status,
        openTime: to12Hour(openMin),
        closeTime: to12Hour(closeMin),
        _open: openMin,
        _close: closeMin,
      };
    })
    .filter(Boolean);

  // One board, one ranking: provider cards and custom cards compete for
  // the same top slots on equal terms.
  const ranked = rankLiveCards([...providerLive, ...customCards]);

  // Drop the internal sort keys before responding.
  return ranked.slice(0, BOARD_SIZE).map(({ _open, _close, ...rest }) => rest);
}
