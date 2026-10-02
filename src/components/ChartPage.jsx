import { fakeChart, fakeBlurb } from '../lib/fakeChart.js';

function slugFromPath() {
  const p = window.location.pathname;
  // Supports:
  //   /jodi-chart-record/sridevi.php
  //   /panel-chart-record/sridevi.php
  //   /chart/jodi/sridevi   (clean SPA fallback)
  //   /chart/panel/sridevi
  let type = 'jodi';
  if (p.startsWith('/panel-chart-record') || p.includes('/panel')) type = 'panel';
  const last = p.split('/').filter(Boolean).pop() || '';
  const slug = last.replace(/\.php.*$/, '').replace(/^chart-/, '') || 'sridevi';
  return { slug, type };
}

function CellJodi({ day }) {
  if (day.missing) return <span style={{ color: '#c00' }}>{day.isFuture ? '' : '**'}</span>;
  return <span>{day.jodi}</span>;
}

function CellPanel({ day }) {
  if (day.missing) {
    return (
      <span style={{ color: '#c00', lineHeight: 1.1 }}>
        *<br />**<br />*
      </span>
    );
  }
  return (
    <span style={{ lineHeight: 1.25, display: 'inline-block' }}>
      {day.open}
      <br />
      <b>{day.jodi}</b>
      <br />
      {day.close}
    </span>
  );
}

export default function ChartPage() {
  const { slug, type } = slugFromPath();
  const data = fakeChart(slug, 24);
  const blurbs = fakeBlurb(data.market, type);
  const upper = data.market.toUpperCase();
  const kind = type === 'panel' ? 'PANEL' : 'JODI';

  const goTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const goBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

  return (
    <>
      <div className="m-icon">
        <a href="/" style={{ color: '#fff' }}>
          <img src="/img/dpboss-banner.png" alt="Image of dpboss.tax" height="57" width="292" />
        </a>
      </div>

      <div className="text2" style={{ padding: '8px 6px' }}>
        <h2>
          {upper} {kind} CHART
        </h2>
        <p style={{ fontSize: 12, fontWeight: 400 }}>
          {upper} {kind === 'PANEL' ? 'Panel Chart' : 'Jodi Chart'} (FAKE PREVIEW) — {blurbs[0]}
        </p>
      </div>

      <div className="tkt-val" style={{ padding: '8px 4px' }}>
        <h4>{upper}</h4>
        <span>
          {data.latest ? `${data.latest.open}-${data.latest.jodi}-${data.latest.close}` : 'Loading...'}
        </span>
        <p>
          <button type="button" className="gm-clk" style={{ position: 'static' }} onClick={() => window.location.reload()}>
            Refresh Result
          </button>
        </p>
        <p style={{ fontSize: 12 }}>
          <a href="/" style={{ color: '#522f92' }}>← Back to home</a>
          {'  |  '}
          <a href={type === 'panel' ? `/jodi-chart-record/${slug}.php` : `/panel-chart-record/${slug}.php`} style={{ color: '#522f92' }}>
            View {type === 'panel' ? 'Jodi' : 'Panel'} chart
          </a>
        </p>
      </div>

      <div style={{ margin: '6px 0', fontSize: 12 }}>
        <button type="button" onClick={goBottom} style={{ marginRight: 8 }}>Go to Bottom</button>
        <button type="button" onClick={goTop}>Go to Top</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }} className="l-obj-giv">
          <thead>
            <tr>
              {type === 'panel' && <th style={{ border: '1px solid #999', padding: 4 }}>Date</th>}
              {['Mo', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <th key={d} style={{ border: '1px solid #999', padding: 4 }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.weeks.map((w) => (
              <tr key={w.label}>
                {type === 'panel' && (
                  <td style={{ border: '1px solid #999', padding: 4, fontSize: 11 }}>{w.label}</td>
                )}
                {w.days.map((day, i) => (
                  <td key={i} style={{ border: '1px solid #999', padding: 4, textAlign: 'center' }}>
                    {type === 'panel' ? <CellPanel day={day} /> : <CellJodi day={day} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text3" style={{ marginTop: 8, textAlign: 'left' }}>
        {blurbs.map((b, i) => (
          <p key={i} style={{ fontSize: 12, marginBottom: 6 }}>{b}</p>
        ))}
      </div>

      <div style={{ margin: '8px 0' }}>
        <a href="/" className="gm-clk" style={{ position: 'static', display: 'inline-block' }}>Back to Home</a>
      </div>
    </>
  );
}
