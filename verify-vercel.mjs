/**
 * Pre-deployment check: simulates how Vercel invokes the API.
 *
 * vercel.json rewrites /api/* to /api/index?__p=<original path>, so this
 * spins up an HTTP server that routes requests through api/index.js exactly
 * like the function, plus one that mounts the app directly (local-dev
 * style), and asserts the contract the React frontend depends on.
 *
 *   node verify-vercel.mjs        (needs MongoDB on :27017 and a .env)
 */
import http from 'node:http';
import handler from './api/index.js';
import app from './server/app.js';

const results = [];
function check(name, cond, extra = '') {
  results.push([name, Boolean(cond)]);
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? `  (${extra})` : ''}`);
}

// Vercel-style: everything goes through the function entry.
const vercel = http.createServer((req, res) => handler(req, res));
// Local-style: plain Express.
const local = http.createServer(app);
await new Promise((r) => vercel.listen(4310, r));
await new Promise((r) => local.listen(4311, r));

async function get(url) {
  const res = await fetch(url);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* HTML */
  }
  return { status: res.status, text, json };
}

try {
  // 1. Health through the Vercel handler (path restored from ?__p=).
  const health = await get('http://localhost:4310/api/index?__p=/api/health');
  check(
    'health via ?__p= rewrite',
    health.status === 200 && health.json?.ok === true,
    `db=${health.json?.db} provider=${health.json?.provider}`
  );

  // 2. Homepage payload - proves php-api/data fixtures load inside the bundle.
  const home = await get('http://localhost:4310/api/index?__p=/api/home.php');
  check(
    'home.php via ?__p= rewrite',
    home.status === 200 && home.json?.ok === true && Array.isArray(home.json?.data?.markets),
    `${home.json?.data?.markets?.length ?? 0} markets`
  );

  // 3. Query strings must survive the rewrite.
  const markets = await get('http://localhost:4310/api/index?__p=/api/markets.php&limit=3');
  check(
    'markets.php?limit=3 keeps the query string',
    markets.status === 200 && markets.json?.count === 3,
    `count=${markets.json?.count}`
  );

  // 4. POST body parsing through the function (admin login path).
  const login = await fetch('http://localhost:4310/api/index?__p=/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'definitely-not-a-user', password: 'nope' }),
  });
  const loginBody = await login.json();
  check(
    'login rejects bad credentials with JSON',
    login.status === 401 && loginBody.ok === false,
    `status=${login.status}`
  );

  // 5. Unknown API path stays JSON, never HTML.
  const miss = await get('http://localhost:4310/api/index?__p=/api/nope.php');
  check(
    'unknown endpoint -> JSON 404',
    miss.status === 404 && miss.json?.ok === false,
    `status=${miss.status}`
  );

  // 6. Bare /api (empty wildcard) does not crash.
  const bare = await get('http://localhost:4310/api/index?__p=/api/');
  check(
    'bare /api handled',
    bare.status === 404 || bare.status === 200,
    `status=${bare.status}`
  );

  // 7. Local-dev style (direct Express mount) still works.
  const localHealth = await get('http://localhost:4311/api/health');
  check(
    'local direct app works',
    localHealth.status === 200 && localHealth.json?.ok === true
  );
} finally {
  vercel.close();
  local.close();
}

const failed = results.filter(([, ok]) => !ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
