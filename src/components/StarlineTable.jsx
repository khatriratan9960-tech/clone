/**
 * Two-column Time/Result starline table, as used by MAIN STARLINE,
 * Mumbai Rajshree and MAIN BOMBAY 36 BAZAR.
 *
 * The original keeps a "Result" column that is empty for the last
 * (not-yet-drawn) slot - preserve that rather than hiding the cell.
 */
export default function StarlineTable({ title, rows, className = '' }) {
  if (!rows || rows.length === 0) return null;

  return (
    <div className={`my-table ${className}`.trim()}>
      <h4>{title}</h4>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Result</th>
            <th>Time</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.time}-${i}`}>
              <td>{r.time}</td>
              <td>{r.result}</td>
              <td>{r.time2}</td>
              <td>{r.result2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
