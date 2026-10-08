/**
 * MARKET CLOCK - the single source of truth for "where are we in this
 * market's draw window?".
 *
 * Everything that decides between upcoming / live / closed goes through
 * here, so the board can never disagree with itself. This is also what
 * makes the MOCK data behave like the real site: the fixture markets carry
 * genuine open/close times, so feeding the real clock in here makes the
 * mock board advance exactly the way the live one does.
 *
 * All times are minutes since midnight. Windows may wrap past midnight
 * (a 10:15 PM - 12:15 AM market is closeMin < openMin), which is why the
 * comparisons below are not a plain `open <= now < close`.
 */

/** "11:40 AM" / "11:40" / "11:40am" -> minutes since midnight. */
export function toMinutes(value) {
  if (value == null) return null;
  const s = String(value).trim();

  const ampm = s.match(/^(\d{1,2}):([0-5]\d)\s*([APap])\.?[Mm]?\.?$/);
  if (ampm) {
    let h = Number(ampm[1]) % 12;
    if (ampm[3].toLowerCase() === 'p') h += 12;
    return h * 60 + Number(ampm[2]);
  }

  const plain = s.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (plain) return Number(plain[1]) * 60 + Number(plain[2]);

  return null;
}

/** Minutes since midnight -> "11:40 AM" (the format the site displays). */
export function to12Hour(minutes) {
  if (minutes == null) return '';
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const suffix = h24 < 12 ? 'AM' : 'PM';
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
}

/**
 * Minutes since midnight RIGHT NOW, in the market's timezone.
 *
 * Matka runs on IST, but the box this is deployed on may well be UTC, so
 * the timezone is pinned rather than inherited from the host. Override
 * with MARKET_TZ when running a non-Indian market.
 */
export const MARKET_TZ = process.env.MARKET_TZ || 'Asia/Kolkata';

const CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: MARKET_TZ,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23', // 00-23; without this, midnight renders as "24".
});

export function nowMinutes(date = new Date()) {
  const [h, m] = CLOCK.format(date).split(':').map(Number);
  return h * 60 + m;
}

/**
 * Where `now` sits inside one market's draw window.
 *
 *   upcoming - tonight's/the next draw has not opened yet
 *   live     - the window is open right now
 *   closed   - the draw has finished and the result is published
 *   unknown  - the times could not be parsed, so make no claims
 *
 * Midnight-wrapping markets (closeMin <= openMin, e.g. 10:15 PM - 12:15 AM)
 * need care, because one clock reading maps to two different points in
 * the cycle:
 *
 *   22:30 -> live      (inside tonight's window)
 *   00:05 -> live      (still the same draw, just past midnight)
 *   00:20 -> closed    (that draw has now finished)
 *   09:00 -> upcoming   (tonight's window has not opened yet)
 *
 * So the tail before closeMin belongs to the PREVIOUS draw: it reports
 * `closed`, not `live`. Treating it as live is what would leave every night
 * market sitting on the board as "drawing" at 9 in the morning.
 */
export function windowStatus(openMin, closeMin, now) {
  if (openMin == null || closeMin == null) return 'unknown';

  const n = ((Math.trunc(now) % 1440) + 1440) % 1440;

  if (closeMin <= openMin) {
    if (n >= openMin) return 'live'; // tonight's window, running to midnight
    if (n < closeMin) return 'closed'; // previous draw, just finished
    return 'upcoming'; // waiting for tonight
  }

  if (n < openMin) return 'upcoming';
  if (n < closeMin) return 'live';
  return 'closed';
}

/**
 * The `status` published with each market row.
 *
 * A market inside its window is always `live`, even before a result exists
 * - that is the whole point of the live board. Outside the window a
 * published result means `closed`, and silence before the window opens
 * means `upcoming` rather than a vague `pending`.
 */
export function publicStatus(openMin, closeMin, now, hasResult) {
  const win = windowStatus(openMin, closeMin, now);

  if (win === 'live') return 'live';
  if (win === 'unknown') return hasResult ? 'closed' : 'pending';
  if (hasResult) return 'closed';
  return win === 'upcoming' ? 'upcoming' : 'pending';
}

/**
 * How close a market is to its next scheduled event.
 *
 * The live board is capped at a fixed number of cards, so a market whose draw
 * is minutes away would otherwise sit at the bottom of the "upcoming" pile and
 * be pushed off the board entirely - the reader never sees it coming. This
 * measures the distance to the next open/close boundary so such a market can
 * be promoted onto the board in time to be useful.
 *
 * Default 10 minutes; override with LIVE_IMMINENT_MINUTES.
 */
export const IMMINENT_MINUTES = Number(process.env.LIVE_IMMINENT_MINUTES || 10);

/**
 * Minutes from `now` until the market's next open or close boundary.
 *
 * Works for midnight-wrapping windows too, because the distance is always
 * measured forwards around the 24-hour circle. Returns null when the times
 * cannot be parsed, and 0 when a boundary is exactly now.
 */
export function minutesToNextEvent(openMin, closeMin, now) {
  if (openMin == null || closeMin == null) return null;

  const n = ((Math.trunc(now) % 1440) + 1440) % 1440;
  const forward = (t) => (((t - n) % 1440) + 1440) % 1440;

  return Math.min(forward(openMin), forward(closeMin));
}

/**
 * True when a market is due to declare a result within the imminent window.
 *
 * A market already inside its draw window is `live` and therefore already on
 * the board, so this only promotes markets that are still `upcoming` - i.e.
 * the ones at risk of being cut. A `closed` market already outranks upcoming
 * ones, so it needs no promotion either.
 */
export function isImminent(openMin, closeMin, now, minutes = IMMINENT_MINUTES) {
  const mins = minutesToNextEvent(openMin, closeMin, now);
  return mins != null && mins <= minutes;
}

/**
 * Today's date as "YYYY-MM-DD" in the market timezone (Asia/Kolkata).
 * chartHistory.js imports this as `todayStr as today`.
 */
const DAY_FMT = new Intl.DateTimeFormat('en-CA', {
  timeZone: MARKET_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function todayStr(date = new Date()) {
  return DAY_FMT.format(date);
}