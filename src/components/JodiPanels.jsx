/**
 * The big grid of open-close-jodi panels.
 * Class names mirror the original markup exactly (tkt-val / bg-ylw /
 * vl-clk / vl-clk-2 / gm-clk) so the extracted CSS renders identically.
 *
 * The yellow strip (.bg-ylw) marks featured markets. It is applied to a fixed
 * set of markets (matched by slug, which is URL-safe and stable) instead of
 * just the first card, so the operator can pin specific markets:
 *   MILAN DAY, KALYAN, MAIN BAZAR, MILAN NIGHT, VIDARB DAY.
 * If none of the featured slugs are present, we fall back to highlighting the
 * first card so the board always has one highlight.
 */

/** Market slugs that get the yellow highlight. Edit this list to change them. */
const FEATURED_SLUGS = new Set([
  'milan-day',
  'kalyan',
  'main-bazar',
  'milan-night',
  'vidarb-day',
]);

export default function JodiPanels({ markets }) {
  if (!markets.length) return null;

  // Which indices are featured (by slug). Used for the no-match fallback below.
  const featuredIndexes = markets
    .map((m, i) => (FEATURED_SLUGS.has(m.slug) ? i : -1))
    .filter((i) => i >= 0);

  return (
    <div className="tkt-val" style={{ borderColor: '#aa00c0', marginBottom: '2px' }}>
      {markets.map((m, i) => {
        const featured = FEATURED_SLUGS.has(m.slug);
        // Fallback: if the operator's list matches nothing currently on the
        // board, keep the original behaviour (first card highlighted).
        const highlight = featured || (featuredIndexes.length === 0 && i === 0);
        return (
          <div key={m.slug || i} className={highlight ? 'bg-ylw' : ''}>
            <h4>{m.market}</h4>
            {/* Leading spaces in the original are intentional - preserve them. */}
            <span>{m.result ?? 'Loading...'}</span>
            <p>
              {m.openTime} &nbsp;&nbsp; {m.closeTime}
            </p>
            <a href={m.jodiUrl} className="vl-clk gm-clk">
              Jodi
            </a>
            <a href={m.panelUrl} className="vl-clk-2 gm-clk">
              Panel
            </a>
          </div>
        );
      })}
    </div>
  );
}
