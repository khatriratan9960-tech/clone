import { Fragment } from 'react';

/**
 * Day-wise tables (KALYAN / कल्याण, KALYAN NIGHT / MAIN BAZAR).
 *
 * Each row is a weekday (Devanagari) followed by 4 ank+number pairs
 * and then 4 single-digit values. The original lays these out as two
 * physical rows sharing a rowspan, which we flatten into one.
 */
export default function DayTables({ tables }) {
  if (!tables?.length) return null;

  return (
    <>
      {tables.map((t) => (
        <table
          key={t.title}
          style={{ width: '100%', borderCollapse: 'collapse' }}
          className="l-obj-giv"
        >
          <tbody>
            <tr>
              <td colSpan={9} className="v5a25">
                {t.title}
              </td>
            </tr>
            {t.rows.map((r) => {
              // values = [ank, num, ank, num, ank, num, ank, num, ...extras]
              const pairs = [];
              const extras = [];
              for (let i = 0; i < r.values.length; i += 2) {
                const ank = r.values[i];
                const num = r.values[i + 1];
                if (num === undefined) {
                  extras.push(ank);
                } else {
                  pairs.push({ ank, num });
                }
              }

              return (
                <tr key={r.day}>
                  <td className="v5a25-v4a5">{r.day}</td>
                  {pairs.map((p, i) => (
                    <Fragment key={i}>
                      <td className="v5a25-v85b">{p.ank}</td>
                      <td>{p.num}</td>
                    </Fragment>
                  ))}
                  {extras.map((e, i) => (
                    <td key={`x${i}`}>{e}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      ))}
    </>
  );
}
