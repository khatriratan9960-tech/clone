import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const CX = 100;
const CY = 100;
const R = 78;         // dial radius
const GRIP_R = 11;    // grab radius around each hand tip
const NUM_R = 84;     // hour-number ring radius

/** "HH:MM" (24h) -> { h, m }; defaults to 21:00 when empty. */
function parse24(value) {
  if (!/^\d{2}:\d{2}$/.test(value ?? '')) return { h: 21, m: 0 };
  return { h: Number(value.slice(0, 2)), m: Number(value.slice(3)) };
}

function fmt24(h, m) {
  return `${String(((h % 24) + 24) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** 12-hour label, e.g. "09:45 PM" / "12:00 AM" */
function to12Label(value) {
  const { h, m } = parse24(value);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Point on the dial for a clock angle (0 = 12 o'clock, clockwise). */
function pointAt(angleDeg, radius) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

const hourAngle = (h) => (h % 12) * 30;
const minuteAngle = (m) => m * 6;

/**
 * Analog clock picker with one-minute precision.
 *
 * Drag the LONG hand for minutes, the SHORT hand for the hour. Plus the
 * -1m / +1m / -1h / +1h buttons and a native time input for exact entry
 * and keyboard access.
 *
 * Emits 24-hour "HH:MM" because that is what the API and MongoDB store,
 * and what the public market ordering sorts on.
 */
export default function TimePicker({ label, value, onChange, required = true }) {
  const { h, m } = parse24(value);
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null); // 'hour' | 'minute' | null

  const hourTip = useMemo(() => pointAt(hourAngle(h), R * 0.48), [h]);
  const minuteTip = useMemo(() => pointAt(minuteAngle(m), R * 0.76), [m]);

  const setFromPointer = useCallback(
    (clientX, clientY, which) => {
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const scale = 200 / rect.width; // viewBox is "0 0 200 200"
      const px = (clientX - rect.left) * scale;
      const py = (clientY - rect.top) * scale;

      let deg = (Math.atan2(py - CY, px - CX) * 180) / Math.PI + 90;
      if (deg < 0) deg += 360;

      if (which === 'minute') {
        // Snap to the nearest single minute.
        onChange(fmt24(h, Math.round((deg / 360) * 60) % 60));
      } else {
        // The hour hand is drawn exactly on a mark (it does not drift with
        // the minutes), so snapping to the nearest 30 degrees is exact.
        // Restore the AM/PM half from the current value.
        const hrs12 = Math.round(deg / 30) % 12;
        onChange(fmt24((h >= 12 ? 12 : 0) + hrs12, m));
      }
    },
    [h, m, onChange]
  );

  // Follow the pointer for as long as a hand is held.
  useEffect(() => {
    if (!dragging) return undefined;

    const move = (e) => {
      e.preventDefault();
      setFromPointer(e.clientX, e.clientY, dragging);
    };
    const up = () => setDragging(null);

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);

    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [dragging, setFromPointer]);

  function nudgeMinutes(delta) {
    const total = ((h * 60 + m + delta) % 1440 + 1440) % 1440;
    onChange(fmt24(Math.floor(total / 60), total % 60));
  }

  const startDrag = (which) => (e) => {
    e.preventDefault();
    setDragging(which);
  };

  const hourNumbers = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));


  return (
    <div className="adm-label">
      <span className="adm-clock-label">{label}</span>

      <div className="adm-clock-row">
        <svg
          ref={svgRef}
          className="adm-clock"
          viewBox="0 0 200 200"
          role="group"
          aria-label={`${label} clock face`}
        >
          <circle cx={CX} cy={CY} r={R + 12} className="adm-clock-face" />

          {/* Minute ticks - all 60 of them. */}
          {Array.from({ length: 60 }, (_, i) => {
            const big = i % 5 === 0;
            const p1 = pointAt(i * 6, R + (big ? 3 : 6));
            const p2 = pointAt(i * 6, R + 9);
            return (
              <line
                key={i}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                className={big ? 'adm-clock-tick-big' : 'adm-clock-tick'}
              />
            );
          })}

          {/* Hour numbers 1-12. */}
          {hourNumbers.map((n) => {
            const p = pointAt(n * 30, NUM_R);
            return (
              <text key={n} x={p.x} y={p.y + 5} className="adm-clock-num">
                {n}
              </text>
            );
          })}

          {/* Hour hand (short) */}
          <line
            x1={CX}
            y1={CY}
            x2={hourTip.x}
            y2={hourTip.y}
            className="adm-clock-hand-hour"
            onPointerDown={startDrag('hour')}
          />
          <circle
            cx={hourTip.x}
            cy={hourTip.y}
            r={GRIP_R}
            className="adm-clock-grip"
            onPointerDown={startDrag('hour')}
          />

          {/* Minute hand (long) */}
          <line
            x1={CX}
            y1={CY}
            x2={minuteTip.x}
            y2={minuteTip.y}
            className="adm-clock-hand-min"
            onPointerDown={startDrag('minute')}
          />
          <circle
            cx={minuteTip.x}
            cy={minuteTip.y}
            r={GRIP_R - 2}
            className="adm-clock-grip adm-clock-grip-min"
            onPointerDown={startDrag('minute')}
          />

          <circle cx={CX} cy={CY} r={5} className="adm-clock-pin" />
        </svg>

        <div className="adm-clock-side">
          <div className="adm-clock-readout">{to12Label(value)}</div>
          <div className="adm-clock-24h">{value || '--:--'} (24h)</div>

          <div className="adm-clock-btns">
            <button type="button" className="adm-btn adm-btn-sm" onClick={() => nudgeMinutes(-1)}>
              -1m
            </button>
            <button type="button" className="adm-btn adm-btn-sm" onClick={() => nudgeMinutes(1)}>
              +1m
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              onClick={() => onChange(fmt24(h - 1, m))}
            >
              -1h
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              onClick={() => onChange(fmt24(h + 1, m))}
            >
              +1h
            </button>
          </div>

          {/* Native picker: exact entry and keyboard support. */}
          <input
            type="time"
            className="adm-input adm-clock-native"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            step="60"
          />
        </div>
      </div>
    </div>
  );
}
