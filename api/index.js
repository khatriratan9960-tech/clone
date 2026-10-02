/**
 * Vercel serverless entry point for the whole API.
 *
 * vercel.json rewrites every /api/* request to this function, appending the
 * original path as a ?__p= query parameter:
 *
 *   /api/markets.php?slug=kalyan
 *     -> /api/index?__p=/api/markets.php&slug=kalyan
 *
 * Express routes on the real path, so we restore it before handing the
 * request to the shared app. If Vercel ever passes the original path
 * through unchanged, __p is absent and req.url is used as-is - both
 * behaviours are handled.
 */
import app from '../server/app.js';

export default function handler(req, res) {
  const url = req.url || '/';
  const q = url.indexOf('?');
  const search = q === -1 ? '' : url.slice(q + 1);

  if (search.includes('__p=')) {
    const params = new URLSearchParams(search);
    let original = params.get('__p');
    // An empty wildcard (bare /api) may arrive unsubstituted; any literal
    // ':' means the placeholder was not replaced - fall back to the root.
    if (!original || original.includes(':')) original = '/api';
    params.delete('__p');
    const rest = params.toString();
    req.url = original + (rest ? `?${rest}` : '');
  }

  return app(req, res);
}