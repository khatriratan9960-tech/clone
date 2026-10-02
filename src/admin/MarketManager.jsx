import { useEffect, useState } from 'react';
import { useApiClient } from './AuthContext.jsx';
import TimePicker from './TimePicker.jsx';

const BLANK = { name: '', openTime: '', closeTime: '', category: 'Custom', note: '' };

export default function MarketManager({ markets, onChanged }) {
  const api = useApiClient();
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function create(e) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      await api('/api/admin/markets', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm(BLANK);
      setMsg({ type: 'ok', text: `Created "${form.name}" - it now appears on the public site.` });
      onChanged();
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function toggle(m) {
    setMsg(null);
    try {
      await api(`/api/admin/markets/${m.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !m.active }),
      });
      onChanged();
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    }
  }

  async function remove(m) {
    if (!confirm(`Delete "${m.name}"? Its declared results will be deleted too.`)) return;
    setMsg(null);
    try {
      await api(`/api/admin/markets/${m.id}`, { method: 'DELETE' });
      setMsg({ type: 'ok', text: `Deleted "${m.name}".` });
      onChanged();
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    }
  }

  return (
    <>
      <div className="adm-section">
        <h2>Create a market</h2>
        <p className="adm-hint">
          It is published on the homepage immediately, sorted into place by its
          close time so it sits naturally among the other markets.
        </p>

        {msg && <div className={msg.type === 'ok' ? 'adm-ok' : 'adm-error'}>{msg.text}</div>}

        <form onSubmit={create}>
          <div className="adm-grid2">
            <label className="adm-label">
              Market name
              <input
                className="adm-input"
                value={form.name}
                onChange={set('name')}
                placeholder="e.g. SHRI KALYAN NIGHT"
                required
                maxLength={80}
              />
            </label>

            <label className="adm-label">
              Category
              <input
                className="adm-input"
                value={form.category}
                onChange={set('category')}
                placeholder="Custom"
                maxLength={40}
              />
            </label>

            <TimePicker
              label="Open time"
              value={form.openTime}
              onChange={(v) => setForm((f) => ({ ...f, openTime: v }))}
            />

            <TimePicker
              label="Close time"
              value={form.closeTime}
              onChange={(v) => setForm((f) => ({ ...f, closeTime: v }))}
            />
          </div>

          <label className="adm-label">
            Note (optional)
            <input
              className="adm-input"
              value={form.note}
              onChange={set('note')}
              maxLength={500}
            />
          </label>

          <button className="adm-btn adm-btn-primary" type="submit" disabled={busy} style={{ maxWidth: 200 }}>
            {busy ? 'Creating...' : 'Create market'}
          </button>
        </form>
      </div>

      <div className="adm-section">
        <h2>Your markets ({markets.length})</h2>

        {markets.length === 0 ? (
          <p className="adm-empty">No custom markets yet. Create one above.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Open</th>
                <th>Close</th>
                <th>Status</th>
                <th style={{ width: 190 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((m) => (
                <tr key={m.id}>
                  <td>
                    <strong>{m.name}</strong>
                    <br />
                    <small style={{ color: 'var(--adm-muted)' }}>/{m.slug}</small>
                  </td>
                  <td>{m.openTimeLabel}</td>
                  <td>{m.closeTimeLabel}</td>
                  <td>
                    <span className={`adm-badge ${m.active ? 'adm-badge-on' : 'adm-badge-off'}`}>
                      {m.active ? 'Live' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <button className="adm-btn adm-btn-sm" onClick={() => toggle(m)}>
                      {m.active ? 'Hide' : 'Show'}
                    </button>{' '}
                    <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => remove(m)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
