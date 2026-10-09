/** Live Matka API promo strip. */
export default function ApiPromo() {
  return (
    <div
      className="text2"
      style={{
        marginBottom: '7px',
        fontSize: '14px',
        padding: '7px',
        lineHeight: '25px',
        background: '#c4001a',
        color: '#f9f9f9',
        textAlign: 'center',
      }}
    >
      LIVE MATKA API-World&apos;s Fastest Satta Matka Result API
      <br />
      <a
        target="_blank"
        rel="noreferrer"
        href="live-result-api.php"
        style={{
          color: '#fff',
          border: '2px solid #fff',
          padding: '6px 0',
          display: 'block',
          width: '230px',
          margin: '8px auto',
          borderRadius: '15px',
          background: '#b3007a',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        🚀CheckApiPricing🚀
      </a>
      Realtime Update,100% Trusted Legacy
      <br />
      10X faster &amp; 24/7 Support &amp; Uptime
    </div>
  );
}

/** Boxed link zones, e.g. Live Matka Special Game Zone, Matka Jodi List. */
export function LinkZone({ title, links }) {
  if (!links?.length) return null;
  return (
    <div className="sky-23">
      <h4>{title}</h4>
      {links.map((l) => (
        <a key={l.href} href={l.href}>
          {l.text}
        </a>
      ))}
    </div>
  );
}
