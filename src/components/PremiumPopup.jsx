import { useEffect, useState } from 'react';

const LINKS = [
  { href: 'live-vip-expert-terminal.php', icon: '🏏', title: 'VIP Expert Terminal', sub: 'Live Decoding & Fix Market Ank' },
  { href: 'live-vip-scratch-to-win-free-game.php', icon: '🎁', title: 'Scratch & Win Game', sub: "Get Today's Fix Ank For Free" },
  { href: 'live-vip-astrology-free-game.php', icon: '⭐', title: 'Matka Astrology', sub: 'Your Lucky Number by Zodiac' },
  { href: 'live-vip-magic-calculator.php', icon: '🧓', title: 'Magic Calculator', sub: 'Auto OTC & Panel Generator' },
  { href: 'live-vip-dream-number.php', icon: '🌙', title: 'Dream Number Guide', sub: 'Sapna Dekho Number Nikalo' },
  { href: 'live-vip-matka-tricks.php', icon: '🎲', title: 'Evergreen Matka Tricks', sub: 'Special Premium Content' },
];

/** Premium services modal. Open/close via .open-premium-popup triggers. */
export default function PremiumPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onClick = (e) => {
      if (e.target.closest('.open-premium-popup')) {
        e.preventDefault();
        setOpen(true);
      }
      if (
        e.target.classList.contains('premium-popup') ||
        e.target.classList.contains('popup-close')
      ) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="premium-popup active" role="dialog" aria-modal="true">
      <div className="premium-popup-box">
        <button type="button" className="popup-close" onClick={() => setOpen(false)}>
          ×
        </button>
        <div className="popup-title">💎 PREMIUM SERVICES ZONE 💎</div>
        <div className="popup-menu">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="popup-item">
              <span className="popup-icon">{l.icon}</span>
              <span>
                <strong>{l.title}</strong>
                <small>{l.sub}</small>
              </span>
              <span>➜</span>
            </a>
          ))}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://freegame.live.matka/"
            className="popup-item"
          >
            <span className="popup-icon">🎁</span>
            <span>
              <strong>Fix Open, Close &amp; Jodi</strong>
              <small>Kalyan Fix, Milan Fix, Rajdhani Fix</small>
            </span>
            <span>➜</span>
          </a>
        </div>
      </div>
    </div>
  );
}
