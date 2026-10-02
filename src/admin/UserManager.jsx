import { useState } from 'react';
import { useApiClient } from './AuthContext.jsx';

const ROLES = [
  { value: 'admin', label: 'Admin - manage own markets' },
  { value: 'editor', label: 'Editor - read only' },
  { value: 'super_admin', label: 'Super admin - full access' },
];

function fmtDate(v) {
  if (!v) return 'never';
  return new Date(v).toLocaleString();
}

export default function UserManager({ users, onChanged, currentUserId }) {
  const api = useApiClient();
  const [form, setForm] = useState({ username: '', password: '', role: 'admin' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function create(e) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const r = await api('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ username: '', password: '', role: 'admin' });
      setMsg({ type: 'ok', text: `Created ${r.data.username} (${r.data.role}).` });
      onChanged();
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(u) {
    setMsg(null);
    const next = !u.active;
    const warning = next
      ? ''
      : `\n\nThis will also HIDE all ${u.marketsTotal} markets owned by ${u.username}, removing them from the public site.`;
    if (!confirm(`${next ? 'Reactivate' : 'Deactivate'} ${u.username}?${warning}`)) return;

    try {
      const r = await api(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          active: next,
          reason: next ? '' : 'Deactivated by super admin',
        }),
      });
      setMsg({
        type: 'ok',
        text: `${u.username} ${next ? 'reactivated' : 'deactivated'}. ${
          r.marketsChanged
            ? `${r.marketsChanged} market(s) ${next ? 'restored to' : 'removed from'} the public site.`
            : 'No markets affected.'
        }`,
      });
      onChanged();
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    }
  }

  async function changeRole(u, role) {
    setMsg(null);
    try {
      await api(`/api/admin/users/${u.id}`, { method: 'PATCH', body: JSON.stringify({ role }) });
      onChanged();
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    }
  }

  async function removeUser(u) {
    const keep = confirm(
      `Delete ${u.username}?\n\nOK = delete them AND their ${u.marketsTotal} market(s).\nCancel = keep the markets and reassign them to you.`
    );
    if (
      !confirm(
        `Are you sure? ${
          keep ? 'Their markets will be deleted.' : 'Their markets will be transferred to you.'
        }`
      )
    ) {
      return;
    }

    setMsg(null);
    try {
      const r = await api(`/api/admin/users/${u.id}?keepMarkets=${keep ? 'false' : 'true'}`, {
        method: 'DELETE',
      });
      setMsg({
        type: 'ok',
        text: `Deleted ${u.username}. Markets deleted: ${r.marketsDeleted}${
          r.marketsKept ? ' (markets transferred to you)' : ''
        }.`,
      });
      onChanged();
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    }
  }

  return (
    <>
      <div className="adm-section">
        <h2>Create an admin</h2>
        {msg && <div className={msg.type === 'ok' ? 'adm-ok' : 'adm-error'}>{msg.text}</div>}

        <form onSubmit={create}>
          <div className="adm-grid2">
            <label className="adm-label">
              Username
              <input
                className="adm-input"
                value={form.username}
                onChange={set('username')}
                placeholder="rajesh"
                pattern="[a-z0-9._\-]{3,32}"
                required
              />
            </label>

            <label className="adm-label">
              Password
              <input
                className="adm-input"
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Minimum 8 characters"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>

            <label className="adm-label">
              Role
              <select className="adm-input" value={form.role} onChange={set('role')}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            className="adm-btn adm-btn-primary"
            type="submit"
            disabled={busy}
            style={{ maxWidth: 200 }}
          >
            {busy ? 'Creating...' : 'Create admin'}
          </button>
        </form>
      </div>

      <div className="adm-section">
        <h2>Admins &amp; performance</h2>
        <p className="adm-hint">
          Deactivating an admin immediately hides every market they created, so those markets
          leave the public site. Re-activating restores them.
        </p>

        <table className="adm-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Markets</th>
              <th>Results</th>
              <th>Last login</th>
              <th>Status</th>
              <th style={{ width: 210 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={u.active ? {} : { opacity: 0.55 }}>
                <td>
                  <strong>{u.username}</strong>
                  {u.id === currentUserId && (
                    <span className="adm-badge adm-badge-custom" style={{ marginLeft: 6 }}>
                      you
                    </span>
                  )}
                </td>
                <td>
                  <select
                    className="adm-input"
                    style={{ padding: '4px 6px', fontSize: 12 }}
                    value={u.role}
                    onChange={(e) => changeRole(u, e.target.value)}
                    disabled={u.id === currentUserId}
                    title={u.id === currentUserId ? 'You cannot change your own role' : ''}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.value}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="adm-result">
                  {u.marketsActive}
                  <span style={{ color: 'var(--adm-muted)', fontWeight: 400 }}> / {u.marketsTotal}</span>
                  {u.marketsHidden > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--adm-muted)' }}>{u.marketsHidden} hidden</div>
                  )}
                </td>
                <td>{u.resultsDeclared}</td>
                <td style={{ fontSize: 12, color: 'var(--adm-muted)' }}>{fmtDate(u.lastLoginAt)}</td>
                <td>
                  <span className={`adm-badge ${u.active ? 'adm-badge-on' : 'adm-badge-off'}`}>
                    {u.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td>
                  <button
                    className="adm-btn adm-btn-sm"
                    onClick={() => toggleActive(u)}
                    disabled={u.id === currentUserId}
                    title={u.id === currentUserId ? 'You cannot deactivate yourself' : ''}
                  >
                    {u.active ? 'Deactivate' : 'Reactivate'}
                  </button>{' '}
                  <button
                    className="adm-btn adm-btn-sm adm-btn-danger"
                    onClick={() => removeUser(u)}
                    disabled={u.id === currentUserId}
                    title={u.id === currentUserId ? 'You cannot delete yourself' : ''}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
