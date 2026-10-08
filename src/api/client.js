/**
 * Single place where the app talks to the backend.
 *
 * Vite proxies /api -> http://localhost:8000 (the PHP server) in dev,
 * so the browser only ever makes same-origin requests. That means
 * CORS is a non-issue and the paid API key never reaches the client.
 *
 * SWAPPING TO THE PAID API: nothing below changes. Set PROVIDER_BASE_URL
 * and PROVIDER_API_KEY on the server (see .env.example).
 */

const BASE = '/api';

async function getJson(path) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    // Network-level failure - the API is down. Surface something actionable
    // instead of the browser's bare "Failed to fetch".
    throw new Error('Cannot reach the results server. It may be restarting - retry shortly.');
  }

  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (body && body.error) msg = body.error;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(msg);
  }

  const body = await res.json();
  if (body && body.ok === false) {
    throw new Error(body.error || 'API returned ok:false');
  }
  return body;
}

export const api = {
  home: () => getJson('/home.php'),
  liveResult: () => getJson('/live-result.php'),
  markets: (slug) =>
    getJson(slug ? `/markets.php?slug=${encodeURIComponent(slug)}` : '/markets.php'),
  starline: (slug = '') =>
    getJson(`/starline.php${slug ? `?slug=${encodeURIComponent(slug)}` : ''}`),

  /**
   * Chart data for a market. The server reads the MongoDB chart-history
   * collection (and the operator's Result rows for custom markets) and returns
   * the same shape fakeChart() uses, so the chart pages can show real history
   * as soon as the trial API has stored a draw for a market.
   */
  chart: (slug, weeks = 24) =>
    getJson(`/chart.php?slug=${encodeURIComponent(slug)}${weeks !== 24 ? `&weeks=${weeks}` : ''}`),
};
