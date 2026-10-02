/** WhatsApp channel promo box (verbatim styles from the original). */
export default function WhatsAppBanner() {
  return (
    <div
      style={{
        background: '#fff8dc',
        border: '2px solid #f0b400',
        borderRadius: '14px',
        padding: '8px',
        margin: '0 0 4px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(180,130,0,.15)',
      }}
    >
      <div style={{ fontSize: '18px', fontWeight: 800, color: '#9a6500', lineHeight: '24px' }}>
        📢 DPBoss WhatsApp Channel
      </div>
      <div
        style={{
          fontSize: '15px',
          fontWeight: 700,
          color: '#4a3a00',
          lineHeight: '21px',
          margin: '2px 0 7px',
        }}
      >
        🎯 Kalyan Fix Jodi के लिए अभी Join करें
      </div>
      <a
        href="https://whatsapp.com/channel/0029VbCH7KEGpLHN8giIeL2F"
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'inline-block',
          background: '#f0a900',
          color: '#fff',
          padding: '7px 22px',
          borderRadius: '20px',
          textDecoration: 'none',
          fontSize: '15px',
          fontWeight: 800,
          lineHeight: '20px',
        }}
      >
        📲 Join Now
      </a>
    </div>
  );
}
