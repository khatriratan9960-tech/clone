/**
 * The big grid of open-close-jodi panels.
 * Class names mirror the original markup exactly (tkt-val / bg-ylw /
 * vl-clk / vl-clk-2 / gm-clk) so the extracted CSS renders identically.
 */
export default function JodiPanels({ markets }) {
  if (!markets.length) return null;

  return (
    <div className="tkt-val" style={{ borderColor: '#aa00c0', marginBottom: '2px' }}>
      {markets.map((m, i) => (
        <div key={m.slug || i} className={i === 0 ? 'bg-ylw' : ''}>
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
      ))}
    </div>
  );
}
