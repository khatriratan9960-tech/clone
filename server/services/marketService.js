import { Market } from '../models/Market.js';
import { Result } from '../models/Result.js';
import { fetchProviderMarkets, fetchProviderLive } from './provider.js';
import { mergeMarkets } from './mergeMarkets.js';
import { rankLiveCards, BOARD_SIZE } from './liveBoard.js';
import { toMinutes, to12Hour, nowMinutes, windowStatus } from './marketClock.js';

/** Today's date in YYYY-MM-DD using the server's local timezone. */
export function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Load active custom markets plus their most recent declared result. */
export async function loadCustomMarkets() {
  const markets = await Market.find({ active: true }).lean();

  if (markets.length === 0) return { markets: [], resultByMarket: new Map() };

  // Latest result per market, for the most recent date that has one.
  const results = await Result.find({
    market: { $in: markets.map((m) => m._id) },
  })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  const resultByMarket = new Map();
  for (const r of results) {
    const key = String(r.market);
    if (!resultByMarket.has(key)) resultByMarket.set(key, r);
  }

  return { markets, resultByMarket };
}

/**
 * The merged public market list: provider markets + custom markets,
 * interleaved by close time so custom ones blend into the flow.
 */
export async function getPublicMarkets(now = nowMinutes()) {
  const [{ markets, resultByMarket }, providerMarkets] = await Promise.all([
    loadCustomMarkets(),
    fetchProviderMarkets(),
  ]);

  return mergeMarkets(providerMarkets, markets, resultByMarket, now);
}

/**
 * Live-result cards.
 *
 * The board is time-driven, not declaration-driven: a market appears
 * because its draw window says it should. A custom market therefore shows
 * up on its own schedule, and its declared result (when the operator has
 * published one for today) is what fills the card in.
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

  const byMarket = new Map(declaredToday.map((r) => [String(r.market), r]));

  const customCards = markets
    .map((m) => {
      const openMin = toMinutes(m.openTime);
      const closeMin = toMinutes(m.closeTime);
      const status = windowStatus(openMin, closeMin, now);

      // Nothing to say about a market we cannot schedule.
      if (status === 'unknown') return null;

      const r = byMarket.get(String(m._id));
      const display = r?.display ?? null;

      // Before the open there is genuinely nothing to publish yet, so the
      // card stays pending even if a result was declared early.
      if (status === 'upcoming') {
        return {
          market: m.name,
          slug: m.slug,
          result: null,
          ank: null,
          isPending: true,
          status,
          openTime: to12Hour(openMin),
          closeTime: to12Hour(closeMin),
          _open: openMin,
          _close: closeMin,
        };
      }

      return {
        market: m.name,
        slug: m.slug,
        result: display,
        ank: r?.ank ?? null,
        isPending: display === null,
        status: display === null && status === 'live' ? 'live' : status,
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
