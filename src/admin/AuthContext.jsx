import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const TOKEN_KEY = 'live_matka_admin_token';
const USER_KEY = 'live_matka_admin_user';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(readStoredUser);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken('');
    setUser(null);
  }, []);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const value = useMemo(
    () => ({ token, user, login, logout, isAuthed: Boolean(token) }),
    [token, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

/** Authenticated fetch wrapper: attaches the token, handles 401. */
export function useApiClient() {
  const { token, logout } = useAuth();

  return useCallback(
    async (path, options = {}) => {
      let res;
      try {
        res = await fetch(path, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers ?? {}),
          },
        });
      } catch {
        // A network-level failure: the API server is down or the dev proxy
        // cannot reach it. Say so, rather than showing a bare "Failed to fetch".
        throw new Error(
          'Cannot reach the server. Is the API running on port 4000? (npm run api)'
        );
      }

      let body = null;
      try {
        body = await res.json();
      } catch {
        /* non-JSON response */
      }

      // An expired or revoked token should drop us straight back to login.
      if (res.status === 401) logout();

      if (!res.ok) {
        throw new Error(body?.error || `Request failed (${res.status})`);
      }
      return body;
    },
    [token, logout]
  );
}
