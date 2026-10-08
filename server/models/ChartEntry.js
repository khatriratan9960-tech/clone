import mongoose from 'mongoose';

const { Schema } = mongoose;

/** One day of chart history for one provider market (matka / mock). */
const chartEntrySchema = new Schema(
  {
    slug: { type: String, required: true, lowercase: true, trim: true, index: true },
    market: { type: String, required: true, trim: true },
    // Date this draw belongs to (YYYY-MM-DD, server local timezone).
    date: { type: String, required: true, trim: true },
    // Normalized into the "openPana-jodi-closePana" display string.
    openPana: { type: String, required: true, trim: true }, // 3-digit open panna
    jodi: { type: String, required: true, trim: true }, // 2-digit jodi
    closePana: { type: String, required: true, trim: true }, // 3-digit close panna
    display: { type: String, required: true, trim: true }, // e.g. "558-84-789"
    // Which provider produced this row.
    source: { type: String, enum: ['matka', 'mock'], default: 'matka' },
  },
  { timestamps: true }
);

// Unique per market per date - deterministic upsert, no duplicates.
chartEntrySchema.index({ slug: 1, date: 1 }, { unique: true });

export const ChartEntry = mongoose.models.ChartEntry || mongoose.model('ChartEntry', chartEntrySchema);
