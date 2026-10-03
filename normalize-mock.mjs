/**
 * Audits the market fixture (php-api/data/mock.php) against the matka rules.
 * Read-only: it never rewrites the data, it just reports violations.
 *
 *   node normalize-mock.mjs
 *
 * Rules checked on every complete draw:
 *   1. Both panna are written ascending in the order 1,2,...,9,0 (0 is last):
 *      598 -> 589, 901 -> 190, 320 -> 230.
 *   2. Open Ank  = last digit of the three Open Panna digits.
 *      Close Ank = last digit of the three Close Panna digits.
 *   3. Jodi = Open Ank followed by Close Ank (NOT their sum):
 *      Open 579 (ank 1) + Close 366 (ank 5)  =>  Jodi "15"  =>  579-15-366
 *
 * Mid-draw rows (no close panna yet) carry only the Open Ank - that value is
 * verified too, and never invented.
 *
 * NOTE on the fixture field names: `close` holds the JODI and `jodi` holds the
 * CLOSE PANNA (the upstream provider's shape, documented in
 * server/services/liveBoard.js), so the printed result stays "open-jodi-close".
 */
import fs from 'node:fs';
import path from 'node:path';

const FILE = path.resolve('php-api/data/mock.php');

/** 1 < 2 < ... < 9 < 0 - zero counts as the largest digit. */
const rank = (d) => (Number(d) === 0 ? 10 : Number(d));
const sortPanna = (s) => String(s).split('').sort((a, b) => rank(a) - rank(b)).join('');
const ankOf = (s) => String(s).split('').reduce((t, d) => t + Number(d), 0) % 10;

const src = fs.readFileSync(FILE, 'utf8');

let draws = 0;
let partials = 0;
const problems = [];

// Complete draws: 3-digit open panna, 1-2 digit jodi, 3-digit close panna.
const drawRe = /'open' => '(\d{3})', 'close' => '(\d{1,2})', 'jodi' => '(\d{3})'/g;
let m;
while ((m = drawRe.exec(src)) !== null) {
  draws++;
  const [, open, jodi, closePanna] = m;

  if (open !== sortPanna(open)) {
    problems.push(`open panna ${open} not ascending 1..9,0 -> ${sortPanna(open)}`);
  }
  if (closePanna !== sortPanna(closePanna)) {
    problems.push(`close panna ${closePanna} not ascending 1..9,0 -> ${sortPanna(closePanna)}`);
  }
  const expected = `${ankOf(open)}${ankOf(closePanna)}`;
  if (jodi !== expected) {
    problems.push(`${open}-${jodi}-${closePanna}: jodi should be ${expected}`);
  }
}

// Mid-draw rows: open panna + its ank, no close panna yet.
const partialRe = /'open' => '(\d{3})', 'close' => '(\d)', 'jodi' => null/g;
while ((m = partialRe.exec(src)) !== null) {
  partials++;
  const [, open, ank] = m;
  if (open !== sortPanna(open)) {
    problems.push(`open panna ${open} not ascending 1..9,0 -> ${sortPanna(open)}`);
  }
  if (String(ankOf(open)) !== ank) {
    problems.push(`${open}-${ank}: open ank should be ${ankOf(open)}`);
  }
}

console.log(`complete draws : ${draws}`);
console.log(`mid-draw rows  : ${partials}`);
if (problems.length === 0) {
  console.log('PASS - every fixture draw follows the panna order and the ank/jodi rule');
  process.exit(0);
}
console.log(`${problems.length} violation(s):`);
problems.slice(0, 20).forEach((p) => console.log(`  ${p}`));
if (problems.length > 20) console.log(`  ... and ${problems.length - 20} more`);
process.exit(1);