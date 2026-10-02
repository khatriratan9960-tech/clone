/** Weekly patti / line / jodi charts (sun-col). */
export default function WeeklyCharts({ charts }) {
  if (!charts?.length) return null;

  return (
    <div className="sun-col">
      {charts.map((c) => (
        <div key={c.title}>
          <h4>{c.title}</h4>
          {c.lines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      ))}
    </div>
  );
}
