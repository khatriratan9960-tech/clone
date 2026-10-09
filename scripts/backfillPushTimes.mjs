/**
 * One-time backfill: existing webhook (pushDriven) markets in MongoDB carry
 * the old full-day window (openTime 00:00 / closeTime 23:59), so the public
 * site shows them all as "12:00 AM - 11:59 PM".
 *
 * This script rewrites ONLY pushDriven markets whose BOTH times are the
 * fallback, using the original site's reference schedule. Manual custom
 * markets are NEVER touched (their admin-set times stay as entered).
 *
 *   node scripts/backfillPushTimes.mjs
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Market } from '../server/models/Market.js';
import { lookupSchedule, to24h } from '../server/services/marketSchedule.js';

dotenv.config();

const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME || 'dpboss';
if (!mongoUrl) {
  console.error('MONGO_URL is not set (.env). Aborting.');
  process.exit(1);
}

await mongoose.connect(mongoUrl, { dbName, serverSelectionTimeoutMS: 8000 });

const stale = await Market.find({ pushDriven: true, openTime: '00:00', closeTime: '23:59' }).lean();
console.log(`pushDriven markets on fallback window: ${stale.length}`);

let updated = 0;
let skipped = 0;
for (const m of stale) {
  const sched = lookupSchedule(m.name);
  if (!sched) {
    console.log(`SKIP (not on reference list): ${m.name}`);
    skipped += 1;
    continue;
  }
  const openTime = to24h(sched.open);
  const closeTime = to24h(sched.close);
  await Market.updateOne({ _id: m._id }, { $set: { openTime, closeTime } });
  console.log(`OK ${m.name}: ${sched.open} - ${sched.close} (stored ${openTime}/${closeTime})`);
  updated += 1;
}

console.log(`\ndone: updated=${updated} skipped=${skipped}`);
await mongoose.disconnect();
process.exit(0);
