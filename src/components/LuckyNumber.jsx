import { Fragment } from 'react';

/**
 * "Today Lucky Number".
 *
 * finalAnk is an INDEPENDENT dataset supplied by the API - it is NOT
 * derived from the jodi digit. The two genuinely disagree on the source
 * site (KALYAN MORNING shows 4 here, while its jodi 369 derives to 9),
 * so never recompute it client-side.
 */
export default function LuckyNumber({ goldenAnk, finalAnk }) {
  const list = Array.isArray(finalAnk) ? finalAnk : [];

  return (
    <div className="f-pti">
      <h3 style={{ marginBottom: '2px' }}>Today Lucky Number</h3>
      <div className="dflex">
        <div className="j52g4" style={{ borderRight: '1px solid #ff0016', width: '40%' }}>
          <h4>Golden Ank</h4>
          <p>{goldenAnk}</p>
        </div>
        <div className="j52g4" style={{ width: '60%' }}>
          <h4>Final Ank</h4>
          <div className="amthltg">
            {/* One entry per line, matching the original markup.
                NOTE: .amthltg sets white-space:nowrap, so plain \n joins
                would collapse into a single line - real <br> is required. */}
            <p>
              {list.length === 0
                ? 'Loading...'
                : list.map((a, i) => (
                    <Fragment key={`${a.market}-${i}`}>
                      {i > 0 && <br />}
                      {a.market} - {a.ank}
                    </Fragment>
                  ))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
