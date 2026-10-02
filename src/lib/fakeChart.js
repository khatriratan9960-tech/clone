/**
 * FAKE chart history generator (UI preview only).
 *
 * Real history will come from `Result` rows via a public chart API later.
 * For now every market slug deterministically generates the same fake
 * weeks, so custom admin markets work too with zero backend changes.
 */

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad2 = (n) => String(n).padStart(2, '0');
const pick = (rand, arr) => arr[Math.floor(rand() * arr.length)];

/** A plausible 3-digit panna (digits may repeat). */
function panna(rand) {
  return `${Math.floor(rand() * 10)}${Math.floor(rand() * 10)}${Math.floor(rand() * 10)}`;
}

function prettyName(slug) {
  return (slug || 'market').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Generate deterministic fake weekly history.
 * @returns { weeks: [{ label, days: [{ open, jodi, close, missing }] }] } newest-last
 */
export function fakeChart(slug, weekCount = 24) {
  const rand = mulberry32(hashSeed(`dpboss-fake:${slug}`));
  const weeks = [];
  const today = new Date();
  // Align weeks to Monday like dpboss weekly rows.
  const monday = new Date(today);
  const dow = (monday.getDay() + 6) % 7; // Mon=0
  monday.setDate(monday.getDate() - dow - (weekCount - 1) * 7);

  for (let w = 0; w < weekCount; w++) {
    const start = new Date(monday);
    start.setDate(start.getDate() + w * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const fmt = (d) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(date.getDate() + d);
      const isFuture = date > today;
      // ~5% historic gaps render as ** like the real site.
      const missing = !isFuture && rand() < 0.05;
      const open = panna(rand);
      const close = panna(rand);
      const jodi = isFuture || missing ? null : pad2(Math.floor(rand() * 100));
      days.push({ open, close, jodi, missing: isFuture || missing, isFuture });
    }
    weeks.push({ label: `${fmt(start)} to ${fmt(end)}`, days });
  }

  // Latest non-missing day = "latest result" header line.
  let latest = null;
  for (let w = weeks.length - 1; w >= 0 && !latest; w--) {
    for (let d = 6; d >= 0 && !latest; d--) {
      const day = weeks[w].days[d];
      if (!day.missing && day.jodi) latest = day;
    }
  }

  return { market: prettyName(slug), weeks, latest };
}

/** Small pool of SEO-ish filler lines so the page isn't just a table. */
export function fakeBlurb(market, type) {
  const kind = type === 'panel' ? 'Panel Chart' : 'Jodi Chart';
  return [
    `${market} ${kind} (FAKE PREVIEW) — date-wise weekly records generated locally for UI testing. Connect the real Result history API later to replace these numbers.`,
    `Each row below is one Monday-to-Sunday week. ${type === 'panel' ? 'Panel cells show open panna, jodi and close panna.' : 'Jodi cells show the two-digit result.'} Missing draws render as ** like the original site.`,
  ];
}

export { prettyName, pick };
