import { useState } from 'react';
import { useAuth, useApiClient } from './AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const api = useApiClient();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const res = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      login(res.token, res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-wrap">
      <form className="adm-card" onSubmit={onSubmit}>
        <h1 className="adm-title">Live Matka Admin</h1>
        <p className="adm-sub">Sign in to manage markets and declare results</p>

        {error && <div className="adm-error">{error}</div>}

        <label className="adm-label">
          Username
          <input
            className="adm-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
        </label>

        <label className="adm-label">
          Password
          <input
            className="adm-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button className="adm-btn adm-btn-primary" type="submit" disabled={busy}>
          {busy ? 'Signing in...' : 'Sign in'}
        </button>

        <a className="adm-back" href="/">
          &larr; Back to site
        </a>
      </form>
    </div>
  );
}
