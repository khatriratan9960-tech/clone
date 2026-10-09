/**
 * Sridevi-specific import for 2018-2026 backfill.
 *
 * Reads the structured Sridevi data from server/data/sridevi_2018_2026.js,
 * generates daily draws, applies off-day rules, and upserts into MongoDB.
 *
 * Usage:
 *   node scripts/importSridevi.mjs --market "SRIDEVI MATKA" --to results
 */

import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

function pad2(n) {
  return String(n).padStart(2, '0');
}

/** Add days to a YYYY-MM-DD date (server local timezone). */
export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

/** Day-of-week index (0=Sun..6=Sat). */
export function dayOfWeek(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** Extract the off-day set from a market doc. */
export function getOffDaySet(offDays) {
  if (!offDays || offDays.length === 0) return null;
  return new Set(offDays);
}

/**
 * Parse a Jodi cell value.
 * Closed markers: '*', '**', or empty string.
 */
export function parseJodiCell(val) {
  if (val === null || val === undefined) return { value: null, isClosed: true };
  const s = String(val).trim();
  if (s === '' || s === '*' || s === '**') return { value: null, isClosed: true };
  if (/^\d{2}$/.test(s)) return { value: s, isClosed: false };
  return { value: null, isClosed: true };
}

/**
 * Parse a Panel day row.
 * Closed when panel or jodi is null/undefined.
 */
export function parsePanelDay(day) {
  const dayIndex = day?.dayIndex ?? 0;
  const panel = day?.panel ?? null;
  const jodi = day?.jodi ?? null;
  const isClosed = panel === null || jodi === null;
  return {
    dayIndex,
    panel: isClosed ? null : String(panel).trim(),
    jodi: isClosed ? null : String(jodi).trim(),
    isClosed,
  };
}

/** Load the SRIDEVI data structure. */
export async function loadSrideviData() {
  const mod = await import('../../server/data/sridevi_2018_2026.js');
  return mod.SRIDEVI;
}

/** Generate draws from the Jodi weekly grid. */
export function generateJodiDraws(sridevi, offDaySet) {
  const draws = [];
  const rows = sridevi.jodi.rows ?? [];
  const startDate = sridevi.jodi.startDate || "2018-01-01";
  let cursor = new Date(startDate);
  for (let w = 0; w < rows.length; w++) {
    const row = rows[w];
    for (let i = 0; i < 7; i++) {
      const date = addDays(cursor, i);
      const dow = dayOfWeek(date);
      const isOffDay = offDaySet?.has(dow) ?? false;
      const parsed = parseJodiCell(row?.[i]);
      if (isOffDay) continue;
      if (parsed.isClosed) {
        draws.push({ date, open: null, close: null, jodi: null, closed: true });
      } else {
        draws.push({ date, open: null, close: null, jodi: parsed.value });
      }
    }
    cursor.setDate(cursor.getDate() + 7);
  }
  return draws;
}
