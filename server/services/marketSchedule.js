/**
 * REFERENCE MARKET SCHEDULE - the original website's open/close times.
 *
 * Provider (matka trial API) + webhook (pushDriven) markets are DISPLAYED
 * with these times. The upstream feed either omits times or sends a
 * full-day fallback (12:00 AM - 11:59 PM), so without this map every
 * provider market looks identical.
 *
 * CUSTOM (manual) markets are NEVER touched by this file - the admin sets
 * their times in MarketManager and those stay exactly as entered.
 */

const RAW_A = [
  ['KALYAN MORNING', '11:40 AM', '12:40 PM'],
  ['MILAN MORNING', '10:30 AM', '11:30 AM'],
  ['SRIDEVI', '11:35 AM', '12:35 PM'],
  ['MAIN BAZAR MORNING', '11:15 AM', '12:15 PM'],
  ['MADHURI', '11:45 AM', '12:45 PM'],
  ['SRIDEVI MORNING', '10:10 AM', '11:10 AM'],
  ['MAHARANI', '12:15 PM', '02:15 PM'],
  ['KARNATAKA DAY', '10:00 AM', '11:00 AM'],
  ['TIME BAZAR MORNING', '11:10 AM', '12:10 PM'],
  ['MAIN SRIDEVI DAY', '01:05 PM', '02:05 PM'],
  ['TIME BAZAR', '01:20 PM', '02:20 PM'],
  ['TARA MUMBAI DAY', '01:35 PM', '03:00 PM'],
  ['PRABHAT', '01:25 PM', '03:05 PM'],
  ['DIAMOND', '01:30 PM', '03:00 PM'],
  ['TIME BAZAR DAY', '02:45 PM', '04:45 PM'],
  ['MILAN DAY', '03:25 PM', '05:25 PM'],
  ['MAIN BAZAR DAY', '03:35 PM', '05:35 PM'],
  ['PUNA BAZAR', '01:30 PM', '03:30 PM'],
  ['MUMBAI MORNING', '01:40 PM', '02:40 PM'],
  ['NEW TIME BAZAR', '01:00 PM', '02:00 PM'],
  ['KALYAN', '04:35 PM', '06:35 PM'],
  ['SRIDEVI NIGHT', '07:15 PM', '08:15 PM'],
  ['DIAMOND NIGHT', '08:00 PM', '09:00 PM'],
  ['MADHURI NIGHT', '06:45 PM', '07:45 PM'],
  ['NIGHT TIME BAZAR', '08:57 PM', '10:57 PM'],
  ['TARA MUMBAI NIGHT', '08:30 PM', '10:30 PM'],
  ['MILAN NIGHT', '09:20 PM', '11:20 PM'],
  ['RAJDHANI NIGHT', '09:35 PM', '11:45 PM'],
  ['MAIN BAZAR', '10:00 PM', '12:10 AM'],
  ['RAJSHREE', '11:15 AM', '12:15 PM'],
  ['MAIN SRIDEVI', '11:45 AM', '12:45 PM'],
  ['MAHARANI DAY', '05:15 PM', '07:15 PM'],
  ['PAREL DAY', '02:00 PM', '04:00 PM'],
  ['BOMBAY DAY', '01:50 PM', '02:50 PM'],
  ['KALYAN NIGHT', '09:45 PM', '11:45 PM'],
  ['MUMBAI NIGHT', '08:45 PM', '10:45 PM'],
  ['SUPREME MORNING', '01:35 PM', '02:35 PM'],
  ['SRIDEVI DAY', '01:35 PM', '02:35 PM'],
  ['PRABHAT NIGHT', '08:20 PM', '10:20 PM'],
  ['SUPER DAY', '01:10 PM', '02:15 PM'],
  ['OLD MUMBAI', '09:45 PM', '11:30 PM'],
  ['OLD MAIN MUMBAI', '09:35 PM', '11:35 PM'],
  ['MADHUR MORNING', '11:30 AM', '12:30 PM'],
  ['MADHUR DAY', '01:30 PM', '02:30 PM'],
  ['MADHUR NIGHT', '08:30 PM', '10:30 PM'],
  ['SHRI DAY', '11:15 AM', '12:15 PM'],
  ['SHRI NIGHT', '08:25 PM', '10:25 PM'],
  ['RATAN KHATRI', '09:40 PM', '11:40 PM'],
  ['WORLI MORNING', '12:05 PM', '01:05 PM'],
  ['WORLI NIGHT', '08:05 PM', '09:05 PM'],
  ['MAHARANI NIGHT', '10:15 PM', '12:15 AM'],
  ['JAY SHREE DAY', '11:21 AM', '12:21 PM'],
  ['SRI DHANALAXMI', '12:00 PM', '01:00 PM'],
  ['BOMBAY NIGHT', '09:35 PM', '12:05 AM'],
  ['SUNDAY BAZAR', '12:30 PM', '02:45 PM'],
  ['PADMAVATHI', '11:40 AM', '12:40 PM'],
  ['PADMAVATHI NIGHT', '07:45 PM', '08:45 PM'],
  ['MAIN RATAN', '09:30 PM', '11:30 PM'],
  ['RATAN GOLD DAY', '12:20 PM', '02:00 PM'],
  ['RATAN GOLD NIGHT', '09:40 PM', '11:40 PM'],
  ['BALAJI', '11:20 AM', '12:20 PM'],
  ['KAMDHENU', '03:40 PM', '05:40 PM'],
  ['KAMDHENU NIGHT', '07:45 PM', '08:45 PM'],
  ['SUPER NIGHT', '09:35 PM', '11:35 PM'],
  ['NEW KALYAN DAY', '02:15 PM', '04:15 PM'],
  ['LUCKY DAY', '12:45 PM', '02:05 PM'],
  ['KALYAN SRIDEVI', '11:30 AM', '12:30 PM'],
  ['KALYAN SRIDEVI NIGHT', '07:30 PM', '08:30 PM'],
  ['CENTRAL MUMBAI', '02:00 PM', '03:00 PM'],
  ['MUMBAI DAY', '02:05 PM', '03:05 PM'],
  ['KOHINOOR DAY', '02:35 PM', '04:35 PM'],
  ['KOHINOOR NIGHT', '08:35 PM', '10:35 PM'],
  ['NEW TARA MUMBAI DAY', '01:45 PM', '03:10 PM'],
  ['STAR TARA MORNING', '10:10 AM', '11:10 AM'],
  ['STAR TARA DAY', '02:20 PM', '03:20 PM'],
  ['STAR TARA NIGHT', '07:20 PM', '08:20 PM'],
];
const RAW_B = [
  ['PUNA NIGHT [ MAIN ]', '11:00 PM', '01:50 AM'],
  ['PUNA NIGHT', '11:00 PM', '01:50 AM'],
  ['SUPREME DAY', '03:35 PM', '05:35 PM'],
  ['SUPREME NIGHT', '08:45 PM', '10:45 PM'],
  ['RADHA MUMBAI DAY', '01:35 PM', '03:05 PM'],
  ['RADHA MUMBAI NIGHT', '08:35 PM', '10:35 PM'],
  ['PARAS DAY', '11:15 AM', '12:15 PM'],
  ['PARAS NIGHT', '07:50 PM', '10:10 PM'],
  ['SRILAKSHMI', '11:20 AM', '12:20 PM'],
  ['SRILAXMI DAY', '01:45 PM', '02:45 PM'],
  ['BHAGYA DAY', '12:20 PM', '01:20 PM'],
  ['BHAGYA NIGHT', '08:20 PM', '09:20 PM'],
  ['WORLI MUMBAI DAY', '01:30 PM', '02:30 PM'],
  ['MAIN MUMBAI RK', '09:30 PM', '11:50 PM'],
  ['WORLI MUMBAI', '09:15 PM', '11:10 PM'],
  ['SITA DAY', '01:45 PM', '02:45 PM'],
  ['COUNTRY BAZAR', '01:20 PM', '02:20 PM'],
  ['AMAR BAZAR', '11:15 AM', '12:15 PM'],
  ['ROSE BAZAR DAY', '02:30 PM', '03:50 PM'],
  ['ROSE BAZAR NIGHT', '10:00 PM', '12:02 AM'],
  ['JANTA MORNING', '01:00 PM', '02:00 PM'],
  ['CENTRAL BOMBAY', '03:15 PM', '04:15 PM'],
  ['TEEN PATTI', '07:55 PM', '08:55 PM'],
  ['DURGA NIGHT', '10:30 PM', '12:30 AM'],
  ['MAHADEVI', '04:30 PM', '06:30 PM'],
  ['SUPER TIME', '12:55 PM', '01:55 PM'],
  ['KAALI', '11:20 PM', '01:35 AM'],
  ['MAIN MUMBAI NIGHT', '09:00 PM', '11:00 PM'],
  ['SITA NIGHT', '06:45 PM', '07:45 PM'],
  ['KAMAL MORNING', '12:10 PM', '01:10 PM'],
  ['KAMAL DAY', '03:40 PM', '05:40 PM'],
  ['KAMAL NIGHT', '08:45 PM', '10:45 PM'],
  ['ANDHRA MORNING', '10:40 AM', '11:40 AM'],
  ['ANDHRA DAY', '03:35 PM', '05:35 PM'],
  ['ANDHRA NIGHT', '08:45 PM', '10:45 PM'],
  ['MAHADEVI MORNING', '11:45 AM', '12:45 PM'],
  ['MAHADEVI NIGHT', '07:50 PM', '08:50 PM'],
  ['DELHI BAZAR', '08:10 PM', '09:10 PM'],
  ['RATAN DAY', '03:55 PM', '05:55 PM'],
  ['WORLI MUMBAI NIGHT', '09:45 PM', '11:45 PM'],
  ['RAJDHANI DAY', '03:15 PM', '05:15 PM'],
  ['TIME NIGHT', '08:15 PM', '10:15 PM'],
  ['BOMBAY RAJSHREE DAY', '01:15 PM', '03:15 PM'],
  ['BOMBAY RAJSHREE NIGHT', '09:00 PM', '11:00 PM'],
  ['CB', '02:15 PM', '03:15 PM'],
  ['CHANDNI MORNING', '11:05 AM', '12:05 PM'],
  ['GUJRAT MORNING', '11:20 AM', '12:20 PM'],
  ['GUJRAT NIGHT', '07:45 PM', '08:45 PM'],
  ['GOWA', '12:30 PM', '02:20 PM'],
  ['RAKHI MORNING', '11:10 AM', '12:10 PM'],
  ['RATNA MORNING', '09:35 AM', '10:30 AM'],
  ['GEETA MORNING', '09:55 AM', '10:55 AM'],
  ['RATNA DAY', '01:35 PM', '02:35 PM'],
  ['RATNA NIGHT', '07:05 PM', '08:05 PM'],
  ['TULSI MORNING', '10:20 AM', '11:20 AM'],
  ['NTR MORNING', '09:10 AM', '10:10 AM'],
  ['NTR DAY', '05:00 PM', '07:00 PM'],
  ['NTR NIGHT', '09:00 PM', '11:00 PM'],
  ['MAYA BAZAR', '10:20 AM', '11:20 AM'],
  ['SUPER KING', '03:35 PM', '05:35 PM'],
  ['SUPER KING NIGHT', '08:45 PM', '10:45 PM'],
  ['MEENA BAZAR', '09:00 PM', '11:00 PM'],
  ['KALYAN KING', '02:00 PM', '04:00 PM'],
  ['SITARA BAZAR', '10:10 PM', '11:45 PM'],
  ['MANGAL BAZAR', '10:10 PM', '11:10 PM'],
  ['MANGAL MORNING', '09:35 AM', '10:35 AM'],
  ['MANGAL DAY', '04:05 PM', '05:05 PM'],
  ['MANGAL NIGHT', '08:25 PM', '09:25 PM'],
  ['GAMA MORNING', '10:10 AM', '11:10 AM'],
  ['GAMA DAY', '02:20 PM', '03:20 PM'],
  ['GAMA NIGHT', '07:20 PM', '08:20 PM'],
  ['MILAN BAZAR MORNING', '10:40 AM', '12:40 PM'],
  ['MILAN BAZAR DAY', '01:30 PM', '03:30 PM'],
  ['MILAN BAZAR NIGHT', '08:30 PM', '10:30 PM'],
  ['MEENA MORNING', '11:30 AM', '12:30 PM'],
  ['ANMOL', '11:25 AM', '12:25 PM'],
  ['STANDARD BAZAR', '11:00 AM', '12:00 PM'],
  ['CITY BAZAR DAY', '02:30 PM', '04:30 PM'],
  ['CITY BAZAR NIGHT', '08:30 PM', '10:30 PM'],
  ['MAIN BAZAR NIGHT', '07:00 PM', '08:00 PM'],
  ['SAMSKARA DAY', '10:00 AM', '11:00 AM'],
  ['SAMSKARA NIGHT', '09:15 PM', '11:15 PM'],
  ['THALAIVA MORNING', '11:45 AM', '12:45 PM'],
  ['THALAIVA NIGHT', '07:50 PM', '08:50 PM'],
  ['THALAIVA', '04:30 PM', '06:30 PM'],
  ['SITA MORNING', '09:45 AM', '10:45 AM'],
  ['VAISHNAVI DAY', '01:40 PM', '02:40 PM'],
  ['ASHA BAZAR', '11:15 AM', '12:15 PM'],
  ['DAY JANTA', '03:40 PM', '05:40 PM'],
  ['NIGHT JANTA', '08:35 PM', '10:35 PM'],
  ['MATKA KING', '01:00 PM', '02:30 PM'],
  ['MATKA KING NIGHT', '08:00 PM', '10:00 PM'],
  ['KIRTI', '02:00 PM', '03:00 PM'],
];

/** "KALYAN  MORNING" -> "KALYAN MORNING" (upper, single spaces). */
export function scheduleKey(name) {
  return String(name ?? '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const MAP = new Map();
for (const [name, open, close] of [...RAW_A, ...RAW_B]) {
  MAP.set(scheduleKey(name), { open, close });
  // "PUNA NIGHT [ MAIN ]" also answers plain "PUNA NIGHT" lookups and back.
  const stripped = scheduleKey(String(name).replace(/\[.*?\]/g, ''));
  if (stripped && !MAP.has(stripped)) MAP.set(stripped, { open, close });
}

/**
 * Reference open/close for a PROVIDER or webhook market, or null when the
 * market is not on the original site's list. NEVER used for manual custom
 * markets - those keep whatever the admin entered.
 *
 * @returns {{open:string, close:string}|null} 12h strings, e.g. {open:'11:40 AM',close:'12:40 PM'}
 */
export function lookupSchedule(name) {
  if (!name) return null;
  return MAP.get(scheduleKey(name)) ?? null;
}

/** "11:40 AM" -> "11:40" (24h, for the Market.openTime/closeTime columns). */
export function to24h(value) {
  const s = String(value ?? '').trim();
  const m = s.match(/^(\d{1,2}):([0-5]\d)\s*([APap])\.?[Mm]?\.?$/);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3].toLowerCase() === 'p') h += 12;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}
