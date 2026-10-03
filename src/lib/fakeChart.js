/**
 * Deterministic chart history generator (UI preview only).
 *
 * Real history will come from `Result` rows via a public chart API later.
 * For now every market slug deterministically generates the same fake
 * weeks, so custom admin markets work too with zero backend changes.
 *
 * IMPORTANT - matka maths enforced here so the panel / jodi pages can never
 * show an impossible combination:
 *   Panna      = the three drawn digits printed ascending in the order
 *                1,2,3,4,5,6,7,8,9,0 (so 0 is written LAST: 370, 170, 098)
 *   Open Ank  = last digit of (d1 + d2 + d3) of the Open Panna
 *   Close Ank = last digit of (d1 + d2 + d3) of the Close Panna
 *   Jodi      = Open Ank followed by Close Ank (two digits, in that order)
 * e.g. Open 579 (5+7+9=21 -> 1) + Close 366 (3+6+6=15 -> 5) => Jodi 15
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

/**
 * Digit order used by every matka chart: 1,2,3,4,5,6,7,8,9,0 - a panna is
 * always written ascending in that sequence, so 0 is printed LAST
 * (370 and 170 are valid, 037 / 703 are not).
 */
const digitRank = (d) => (Number(d) === 0 ? 10 : Number(d));

/** Sort the digits of a panna ascending in the 1..9,0 sequence. */
export function sortPanna(panna) {
  return String(panna)
    .split('')
    .sort((a, b) => digitRank(a) - digitRank(b))
    .join('');
}

/** True when the panna digits are already in 1..9,0 ascending order. */
export function isSortedPanna(panna) {
  const s = String(panna);
  return s === sortPanna(s);
}

/** Three drawn digits, always printed in ascending order (digits may repeat). */
function panna(rand) {
  return sortPanna(
    [0, 1, 2]
      .map(() => Math.floor(rand() * 10))
      .join('')
  );
}

/** Sum of the digits of a panna / jodi string. */
export function digitSum(num) {
  return String(num)
    .split('')
    .reduce((sum, d) => sum + (Number(d) || 0), 0);
}

/**
 * The single "Ank" of a panna: add the three digits and keep the last digit.
 * 1+3+5 = 9   -> 9      4+7+9 = 20 -> 0      5+5+7 = 17 -> 7
 */
export function ankOf(num) {
  return digitSum(num) % 10;
}

/**
 * The Jodi of a draw is the Open Ank followed by the Close Ank:
 *   first digit  = Open Ank  (last digit of the Open Panna's three digits)
 *   second digit = Close Ank (last digit of the Close Panna's three digits)
 * e.g. Open 579 -> 1, Close 366 -> 5  =>  Jodi "15"  =>  579-15-366
 */
export function jodiOf(openPanna, closePanna) {
  return `${ankOf(openPanna)}${ankOf(closePanna)}`;
}

/** Digits that appear in BOTH the open and the close panna (highlighted red). */
export function hitDigits(openPanna, closePanna) {
  const close = new Set(String(closePanna).split(''));
  return new Set(String(openPanna).split('').filter((d) => close.has(d)));
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
      // The jodi is NEVER random - it is derived from the two drawn panna.
      const jodi = jodiOf(open, close);
      days.push({
        open,
        close,
        jodi,
        openAnk: ankOf(open),
        closeAnk: ankOf(close),
        missing: isFuture || missing,
        isFuture,
      });
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

/**
 * SEO copy for the chart pages. Same section order as the live site:
 * intro paragraph, "Get <Market> <Kind> Records", how the numbers work and
 * a FAQ block. `type` is 'jodi' | 'panel'.
 */
export function chartCopy(market, type, slug) {
  const kind = type === 'panel' ? 'Panel Chart' : 'Jodi Chart';
  const other = type === 'panel' ? 'jodi' : 'panel';

  const intro =
    `${market} ${kind} on DPBOSS provides date-wise, month-wise and year-wise records of ` +
    `${market} Matka results, focusing on ${type === 'panel' ? 'Open Panel and Close Panel' : 'Jodi'} results ` +
    `for each available date. Check the latest ${market} ${other === 'panel' ? 'Panel' : 'Jodi'} result and browse ` +
    `historical chart data by date, month or year. The regularly updated chart brings recent and previous ` +
    `${market} records together in one easy-to-navigate place.`;

  const getHeading = `Get ${market} ${kind} Records`;

  const getBody =
    `When you consider DPBoss Services to play the ${market} game, you do not need to search for other analogous ` +
    `sites online. The chart stores every declared draw of the market so the Open Panna, the Jodi and the Close ` +
    `Panna can always be verified against each other, week after week.`;

  const mathHeading =
    `How Is the ${market} ${type === 'panel' ? 'Panel' : 'Jodi'} Number Calculated?`;

  const mathBody =
    `Add the three digits of a Panna and keep the last digit of that total - that digit is the Ank. ` +
    `The Open Panna gives the Open Ank and the Close Panna gives the Close Ank, and the Jodi is those two ` +
    `Anks written side by side: the Open Ank is the first digit of the Jodi and the Close Ank is the second. ` +
    `Example: an Open Pana of 5, 7 and 9 gives 5 + 7 + 9 = 21, so the Open Ank is 1; a Close Pana of 3, 6 and 6 ` +
    `gives 3 + 6 + 6 = 15, so the Close Ank is 5; the Jodi is therefore 15 and the draw is published as ` +
    `${market} 579-15-366. Every cell in this chart follows exactly this rule.`;

  const orderHeading = `How Is a ${market} Panna Written?`;

  const orderBody =
    `A Panna is always written in increasing order, and 0 is treated as the largest digit, so the sequence is ` +
    `1, 2, 3, 4, 5, 6, 7, 8, 9, 0 and 0 always goes at the end after 9. That is why 598 is printed as 589, ` +
    `901 as 190, 109 as 190, 320 as 230 and 402 as 240. Both the Open Panna and the Close Panna in this chart ` +
    `follow this order, so the three digits of a cell can be read straight from the top down.`;

  const faqs =
    type === 'panel'
      ? [
          [
            `Q1: What is the purpose of ${market} Panel Chart?`,
            `The primary purpose of ${market} Panel Chart is to organize historical panel number combinations into a structured format for easier comparison. Chronological presentation improves readability while supporting long-term reference.`,
          ],
          [
            `Q2: Why do readers prefer ${market} Panel Chart for historical records?`,
            `Many readers prefer ${market} Panel Chart because structured historical records simplify navigation and comparison. Organized number history reduces confusion while improving accessibility.`,
          ],
          [
            `Q3: How does ${market} Panel Chart improve readability?`,
            `A well-structured ${market} Panel Chart improves readability through clean formatting, organized spacing, and chronological presentation, so readers can compare historical panel records more comfortably.`,
          ],
          [
            `Q4: What features make ${market} Panel Chart more effective?`,
            `Several features increase the effectiveness of ${market} Panel Chart, including chronological arrangement, accurate record organization, readable formatting, and logical sectioning. These elements support efficient historical number comparison.`,
          ],
          [
            `Q5: Why is organized historical data important in ${market} Panel Chart?`,
            `Organized historical data enhances ${market} Panel Chart by preserving consistency and improving accessibility. Systematic records allow readers to review previous combinations efficiently while reducing unnecessary repetition.`,
          ],
        ]
      : [
          [
            `Q1: Can I Play my ${market} game on DPBoss Services from any part of the world?`,
            `Yes, you can because DPBoss Services provides its website users the convenience to play the ${market} game as well as other Satta Matka games from anywhere on earth.`,
          ],
          [
            `Q2: Why do most gamers prefer DPBoss Services?`,
            `It is because the website meets the entire playing needs of both novice players as well as veteran gamblers.`,
          ],
          [
            `Q3: What is a ${market} Jodi Chart?`,
            `A ${market} Jodi Chart lists the two-digit winning Jodi of every draw, week by week, so old combinations can be checked quickly instead of guessed from memory.`,
          ],
          [
            `Q4: How is the ${market} Jodi result produced?`,
            `The Jodi is the sum of the Open Ank and the Close Ank. The Open Ank is the last digit of the three drawn Open Panna digits and the Close Ank works the same way, so the Jodi always matches the panel record of the same date.`,
          ],
          [
            `Q5: Why is organized historical data important in a ${market} Jodi Chart?`,
            `Organized historical data enhances the ${market} Jodi Chart by preserving consistency and improving accessibility, letting readers review previous Jodi combinations efficiently while reducing unnecessary repetition.`,
          ],
        ];

  return {
    kind,
    intro,
    getHeading,
    getBody,
    mathHeading,
    mathBody,
    orderHeading,
    orderBody,
    faqs,
    other,
    slug,
  };
}

export { prettyName, pick };
