/**
 * Proves that a CUSTOM market's declared result is published ON TIME, not
 * when the operator happens to save it.
 *
 * The scenario: a market opening 09:15 / closing 21:15, where the admin
 * declares BOTH halves at 09:00 - 15 minutes early. The public site must
 * show nothing at 09:00, the open half alone from 09:15, and the full
 * result from 21:15.
 *
 *   node verify-timing.mjs
 */
import { revealCustom } from './server/services/customReveal.js';
import { mergeMarkets } from './server/services/mergeMarkets.js';
import { buildLiveBoard } from './server/services/liveBoard.js';

const results = [];
function check(name, cond, extra = '') {
  results.push([name, Boolean(cond)]);
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? `  (${extra})` : ''}`);
}

const hm = (s) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

// A market open 09:15, close 21:15.
const market = { openTime: '09:15', closeTime: '21:15' };
const OPEN_MIN = hm('09:15');
const CLOSE_MIN = hm('21:15');

// Declared at 09:00: the open half 1/257 and the close half 8/369.
const openRow = { session: 'open', number: '7', pana: '257', ank: 7 };
const closeRow = { session: 'close', number: '2', pana: '369', ank: 9 };

// --- 1. Before the open: nothing at all, even though both halves exist. ---
const before = revealCustom(market, openRow, closeRow, hm('09:00'));
check(
  '09:00 (declared) -> nothing published',
  before.status === 'upcoming' && before.result === null && before.isPending,
  `status=${before.status} result=${before.result}`
);

// --- 2. At the open: only the open half. ---
const during = revealCustom(market, openRow, closeRow, OPEN_MIN + 1);
check(
  '09:16 -> open half only',
  during.status === 'live' && during.result === '257-7' && during.jodi === null,
  `status=${during.status} result=${during.result}`
);

// The close pana must NOT leak while the window is still open.
check(
  '09:16 -> close pana hidden',
  during.result !== null && !during.result.includes('369'),
  `result=${during.result}`
);

// --- 3. Exactly at the open minute, the open half appears. ---
const atOpen = revealCustom(market, openRow, closeRow, OPEN_MIN);
check(
  '09:15 exactly -> open half appears',
  atOpen.status === 'live' && atOpen.result === '257-7',
  `result=${atOpen.result}`
);

// --- 4. Before the close: still only the open half. ---
const beforeClose = revealCustom(market, openRow, closeRow, CLOSE_MIN - 1);
check(
  '21:14 -> still open half only',
  beforeClose.status === 'live' && beforeClose.result === '257-7',
  `result=${beforeClose.result}`
);

// --- 5. At/after the close: the full result with the jodi. ---
const after = revealCustom(market, openRow, closeRow, CLOSE_MIN);
check(
  '21:15 -> full result published',
  after.status === 'closed' && after.result === '257-72-369',
  `result=${after.result}`
);

// --- 6. Declared open half alone, after close -> no invented jodi. ---
const openOnly = revealCustom(market, openRow, null, CLOSE_MIN + 10);
check(
  'closed but close not declared -> no jodi',
  openOnly.result === '257-7' && openOnly.jodi === null,
  `result=${openOnly.result}`
);

// --- 7. Declared close half alone while live -> stays hidden. ---
const closeOnlyLive = revealCustom(market, null, closeRow, OPEN_MIN + 5);
check(
  'close declared but window open -> hidden',
  closeOnlyLive.result === null,
  `result=${closeOnlyLive.result}`
);

// --- 8. The merged public market list honours the same clock. ---
const halves = new Map([['m1', { open: openRow, close: closeRow }]]);
const customMarket = {
  _id: 'm1',
  name: 'MY MARKET',
  slug: 'my-market',
  openTime: '09:15',
  closeTime: '21:15',
};

const listEarly = mergeMarkets([], [customMarket], halves, hm('09:00'));
check(
  'merged list hides early result',
  listEarly[0].result === null && listEarly[0].status === 'upcoming',
  `result=${listEarly[0].result} status=${listEarly[0].status}`
);

const listLive = mergeMarkets([], [customMarket], halves, hm('10:00'));
check(
  'merged list shows open half while live',
  listLive[0].result === '257-7' && listLive[0].status === 'live',
  `result=${listLive[0].result}`
);

const listClosed = mergeMarkets([], [customMarket], halves, hm('22:00'));
check(
  'merged list shows full result after close',
  listClosed[0].result === '257-72-369' && listClosed[0].status === 'closed',
  `result=${listClosed[0].result}`
);

// --- 9. Provider markets are untouched by this gate. ---
const providerMarket = {
  market: 'KALYAN MORNING',
  open: '257',
  close: '369',
  jodi: '79',
  openTime: '11:40 AM',
  closeTime: '12:40 PM',
};
const providerList = mergeMarkets([providerMarket], [], new Map(), hm('06:00'));
check(
  'provider market keeps its own clock rules',
  providerList.length === 1 && typeof providerList[0].status === 'string',
  `status=${providerList[0].status}`
);

// --- 10. A market whose times cannot be parsed stays silent. ---
const broken = revealCustom({ openTime: '', closeTime: '' }, openRow, closeRow, hm('10:00'));
check('unparseable times -> nothing published', broken.result === null, `status=${broken.status}`);

// --- 11. Midnight-wrapping market (22:00 -> 00:30). ---
// The clock (marketClock.js) treats the window as running to midnight, so the
// draw is still "live" at 23:00 and "closed" just after midnight. Once the
// window has fully passed it correctly returns to "upcoming" for tonight.
const night = { openTime: '22:00', closeTime: '00:30' };
const nightLive = revealCustom(night, openRow, closeRow, hm('23:00'));
const nightClosed = revealCustom(night, openRow, closeRow, hm('00:05'));
const nightLater = revealCustom(night, openRow, closeRow, hm('01:00'));
check(
  'night market: open half at 23:00, full just after midnight',
  nightLive.status === 'live' &&
    nightLive.result === '257-7' &&
    nightClosed.status === 'closed' &&
    nightClosed.result === '257-72-369',
  `23:00=${nightLive.result} 00:05=${nightClosed.result}`
);
check(
  'night market: hidden again once tonight has not opened',
  nightLater.status === 'upcoming' && nightLater.result === null,
  `01:00 status=${nightLater.status} result=${nightLater.result}`
);
// --- 12. IMMINENT: a market due within 10 min is listed on the board. ---
// Market opens 21:15. At 21:10 only 5 minutes remain, so it must already
// appear on the live board instead of being buried under every other
// upcoming market.
{
  const soon = { market: 'SOON MARKET', open: '111', close: '222', jodi: '33', openTime: '09:15 PM', closeTime: '09:45 PM' };
  const later = { market: 'LATER MARKET', open: '111', close: '222', jodi: '33', openTime: '11:00 PM', closeTime: '11:30 PM' };

  const now5 = hm('21:10');
  const board = buildLiveBoard([soon, later], { now: now5 });

  check(
    '21:10 -> market opening at 21:15 is imminent',
    board[0]?.market === 'SOON MARKET' && board[0]?.isImminent === true,
    `first=${board[0]?.market} imminent=${board[0]?.isImminent}`
  );
  check(
    '21:10 -> market opening at 23:00 is not imminent',
    board.find((c) => c.market === 'LATER MARKET')?.isImminent === false
  );
  check(
    'imminent market is still pending (no result leaked early)',
    board[0]?.result === null && board[0]?.status === 'upcoming',
    `status=${board[0]?.status} result=${board[0]?.result}`
  );
}

// --- 13. The boundary: exactly 10 minutes counts, 11 does not. ---
{
  const m = { market: 'EDGE', open: '111', close: '222', jodi: '33', openTime: '09:15 PM', closeTime: '09:45 PM' };
  const at10 = buildLiveBoard([m], { now: hm('21:05') })[0];
  const at11 = buildLiveBoard([m], { now: hm('21:04') })[0];
  check(
    'exactly 10 min -> imminent, 11 min -> not',
    at10.isImminent === true && at11.isImminent === false,
    `10min=${at10.isImminent} 11min=${at11.isImminent}`
  );
}

// --- 14. An imminent market outranks a closed one, so it is never cut. ---
{
  const soon = { market: 'SOON', open: '111', close: '222', jodi: '33', openTime: '09:15 PM', closeTime: '09:45 PM' };
  // Several recently-closed markets that would otherwise fill the top slots.
  const closedMarkets = [
    { market: 'C1', open: '1', close: '2', jodi: '3', openTime: '06:00 PM', closeTime: '06:30 PM' },
    { market: 'C2', open: '1', close: '2', jodi: '3', openTime: '06:30 PM', closeTime: '07:00 PM' },
    { market: 'C3', open: '1', close: '2', jodi: '3', openTime: '07:00 PM', closeTime: '07:30 PM' },
  ];
  const board = buildLiveBoard([...closedMarkets, soon], { now: hm('21:10') });
  check(
    'imminent market ranks above recently-closed markets',
    board[0]?.market === 'SOON',
    `order=${board.map((c) => c.market).join(',')}`
  );
}

// --- 15. A market already drawing is live, never "imminent". ---
{
  const m = { market: 'DRAWING', open: '257', close: '369', jodi: '79', openTime: '09:15 PM', closeTime: '09:45 PM' };
  const card = buildLiveBoard([m], { now: hm('21:30') })[0];
  check(
    'drawing market is live, not imminent',
    card.status === 'live' && card.isImminent === false,
    `status=${card.status} imminent=${card.isImminent}`
  );
}

// --- 16. Midnight wrap: imminent works just before midnight. ---
{
  const night = { market: 'NIGHT', open: '111', close: '222', jodi: '33', openTime: '11:50 PM', closeTime: '12:30 AM' };
  const card = buildLiveBoard([night], { now: hm('23:45') })[0];
  check(
    '23:45 -> market opening 23:50 is imminent',
    card.isImminent === true && card.result === null,
    `imminent=${card.isImminent} result=${card.result}`
  );
}


const failed = results.filter(([, ok]) => !ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);