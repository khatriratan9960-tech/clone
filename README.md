# DPBoss Clone — React + PHP JSON API

A React (Vite) rebuild of **dpboss.tax**, backed by a PHP JSON API that proxies
the upstream result feed. The styling is the original site's stylesheet,
extracted verbatim, so the rendering matches pixel-for-pixel.

## Key finding about the original site

The live `dpboss.tax` homepage has **no client-side API at all** — no `fetch`,
no `XMLHttpRequest`, no `axios`. It is fully server-rendered PHP: every result
is baked into the HTML at request time, and every "Refresh" button is
`onclick="window.location.reload()"`. So this project *introduces* the API layer
the original never had.

## Architecture

```
Browser (React)  ──fetch('/api/*.php')──>  PHP JSON API  ──>  Upstream provider
   localhost:5173  <──JSON──────────────    localhost:8000      mock | paid
```

Why the PHP layer exists:

- **Solves CORS permanently** — the browser only makes same-origin requests, so
  the upstream vendor does not need to send `Access-Control-Allow-Origin`.
- **Hides the API key** — credentials stay server-side and never reach the client.
- **Enables caching + failover** — you can serve last-known-good data if the
  upstream API is down.

Vite proxies `/api` → `http://localhost:8000` in dev (see `vite.config.js`).

## Running it

Three processes: MongoDB, the API server, and the frontend.

```bash
# 0. MongoDB must be running on :27017

# 1. API server (Express + MongoDB)
npm run api:dev      # http://localhost:4000

# 2. Frontend
npm run dev          # http://localhost:5173
```

| Page | URL |
|---|---|
| Public site | http://localhost:5173/ |
| **Admin panel** | **http://localhost:5173/admin** |
| API health | http://localhost:5173/api/health |

The first boot seeds an admin user from `.env` (`ADMIN_USERNAME` /
`ADMIN_PASSWORD`). Change that password before deploying anywhere public.

## Admin panel

JWT-authenticated, backed by MongoDB.

- **Declare result** — pick a market, date and session, type open/close/jodi.
  A live preview shows the exact string that will publish. Saving makes it
  appear on the public site and the live board immediately.
- **Manage markets** — create a market with its open/close times, show/hide it,
  or delete it (which also deletes its declared results). Times are picked from
  a **12-hour dropdown** (HH:MM + AM/PM) rather than typed as 24-hour values.

## Roles

| Role | Can do |
|---|---|
| `super_admin` | Everything: create/deactivate/delete admins, change roles, see and edit **all** markets |
| `admin` | Create markets and declare results — **only for markets they own** |
| `editor` | Read-only |

The first account created at bootstrap is always a `super_admin`, so the
system can never be set up with nobody able to create other admins.

### Per-admin metrics

The **Admins & metrics** tab (super admin only) shows, for each admin:

- markets **active / total**, plus how many are hidden
- how many results they have declared
- last login
- current role and status

### Deactivating an admin cascades to their markets

Deactivating an admin **immediately hides every market they created**, so those
markets disappear from the public site. Re-activating restores them. Send
`{ cascade: false }` to lock the account but keep markets published.

Deleting an admin offers two choices: delete their markets too, or transfer
them to you (`?keepMarkets=true`).

### Safety rails

The last remaining **active super admin cannot be deactivated, demoted or
deleted** — otherwise the system could be left with nobody able to manage
admins. You also cannot deactivate, demote or delete your own account.

### Ownership is enforced server-side

A normal admin only sees and can only edit their own markets
(`scope: "own"` in `GET /api/admin/markets`). This is checked in the route
handlers, not just hidden in the UI. `adminUsers.js` applies `requireRole`
**per route** rather than router-wide — applying it to the whole router would
also block `/markets` and `/results` for normal admins.

### Your markets blend in, they don't look bolted on

`server/services/mergeMarkets.js` merges provider markets with yours and sorts
the combined list by **close time**, so a custom market lands in its natural
chronological position rather than being appended. Every market goes through
the same shape, so the public page can't tell them apart. Verified: a market
closing at 09:45 PM sits between MANGAL NIGHT (09:25) and MATKA KING NIGHT
(10:00), not at the bottom of the page.

Internal keys (`_sort`, `_marketId`) are stripped before the response, and
`source` is returned for admin/debugging only.

### Declaring a result - two halves, jodi is automatic

You never type a jodi. Each market-day is declared in two steps:

| Step | You enter | Public page shows |
|---|---|---|
| 1. Open | number + open panna, e.g. `7` and `257` | `257-7` (single number) |
| 2. Close | number + close panna, e.g. `9` and `369` | `257-369-79` (jodi = 7 + 9) |

The **jodi is computed server-side** as `open number + close number`. The
declare route never reads a `jodi` from the request body, so even a hand-crafted
request cannot set it (verified: sending `jodi: 999` is ignored).

Saving one half **recomputes both rows**, because declaring the close changes
what the open displays. Deleting one half reverts the other (removing the close
puts it back to `257-7`).

`number` is 1-2 digits, `pana` is exactly 3, and both are validated server-side.
The form shows which halves are already declared for the selected date and
jumps to the other half after you save.

### One row per half

`Result` is now one document per `(market, date, session)` where `session` is
`open` or `close` — so re-saving a half updates it instead of duplicating, and a
typo is fixed by saving the correction.


### MongoDB collections

| Collection | Purpose |
|---|---|
| `users` | Admin accounts, bcrypt hashes |
| `markets` | Your custom markets (name, slug, open/close time, active) |
| `results` | Declared results, unique per `(market, date, session)` |


## Project layout

```
api/
  _bootstrap.php        response helpers, ank derivation, schema normalization
  config.php            API credentials (leave blank for mock)
  provider_paid.php     upstream adapter — fill in once you have credentials
  data/mock.php         market fixtures: 168 markets with real open/close
                        times, plus the starline rows. The live board is
                        derived from the clock, not stored.
  data/sections.json    Final Ank, starline tables, weekly charts, free game
                        zone, day tables, pass list, link zones
  home.php              single call for the whole homepage
  markets.php           ?slug= / ?limit=
  live-result.php       polled every 15s; rebuilt from the clock each poll
  starline.php          15-minute interval rows
server/
  services/marketClock.js  the schedule: parse times, and decide
                        upcoming / live / closed for any market. Shared by
                        mergeMarkets and liveBoard.
  services/liveBoard.js    builds the LIVE RESULT board from the clock
  services/mergeMarkets.js provider + custom markets interleaved by close time
src/
  api/client.js         all fetch calls live here
  hooks/useApi.js       useApi (once) + usePolling (interval)
  components/           Header, Hero, LuckyNumber, WhatsAppBanner,
                        LiveResults, JodiPanels, KeywordStrip, SeoContent,
                        StarlineTable, ApiPromo, PassList, WeeklyCharts,
                        FreeGameZone, DayTables, Footer, PremiumPopup
  styles/dpboss.css     original stylesheet, extracted verbatim (511 lines)
public/img/             dpboss-banner.png, dpboss-laxmi.jpg (extracted from the original)
public/                  favicon.ico + apple-touch-icon-57/60/72/76/114/120/180.png
verify.mjs              headless render assertions
mock-server.mjs         Node stand-in for the PHP API
```

Market data lives in `data/mock.php`; the non-market page content lives in
`data/sections.json`. Both servers read those two files, so the PHP API and the
Node fallback always return identical payloads.

### Important: Final Ank is NOT derived from the jodi

`Final Ank` is its own published dataset. It genuinely disagrees with the jodi
digit on the source site — `KALYAN MORNING` shows **4** there while its jodi
`369` would derive to **9**. It is read from `sections.json` as-is; never
recompute it from the result string in either the API or the components.

## Data schema

All providers are normalized to one contract, so components never change:

```jsonc
{
  "market": "KALYAN MORNING",
  "open": "257", "close": "48", "jodi": "369",
  "result": "257-48-369",
  "openTime": "11:40 AM", "closeTime": "12:40 PM",
  "ank": 9,               // derived: last digit of the jodi
  "status": "closed",     // closed | live | pending
  "slug": "kalyan-morning",
  "jodiUrl": "/jodi-chart-record/kalyan-morning.php",
  "panelUrl": "/panel-chart-record/kalyan-morning.php"
}
```

A market that has not drawn yet comes back with `result: null` and
`isPending: true`; the UI renders the original's `Loading...` placeholder.

## Switching to the paid DPBOSS API

1. Get credentials + docs from DPBOSS (`support@dpboss.net`).
2. Fill in `api/config.php`:
   ```php
   define('DPBOSS_API_BASE', 'https://vendor-host/v1');
   define('DPBOSS_API_KEY',  'your-key');
   ```
3. Map the vendor's field names in `api/provider_paid.php`.
4. Set the env var when starting the server:
   ```bash
   DPBOSS_PROVIDER=paid npm run php
   ```

**No React file changes are needed.** Normalization happens in
`api/_bootstrap.php:normalizeMarket()`.

### Confirm these with the vendor before paying

- [ ] CORS headers present (moot with the proxy, but good to know)
- [ ] Auth style: `X-API-Key` header vs `?api_key=` query
- [ ] Rate limit — live polling is 240 requests/hour
- [ ] How an undrawn market is signalled: `null`, absent, or `"0"`
- [ ] Field names for open / close / jodi / times / ank
- [ ] Historical depth: 100 days jodi + panel, 240 starline rows per market
- [ ] Update latency after a real draw
- [ ] Commercial rights for an ad-supported public site

## Known differences from the original

- **Refresh does not reload the page.** The original used
  `window.location.reload()`; this polls `/api/live-result.php` every 15s and
  updates in place. Visually identical, functionally smoother.
- **No Cloudflare bot-check.** The original injects a
  `/cdn-cgi/challenge-platform/` script and a hidden iframe; both are stripped.
- **Market open/close times come from the fixtures.** All 168 markets carry
  `openTime` / `closeTime` extracted from the saved homepage. When you switch to
  the paid API, map the vendor's timing fields onto the same two keys.

## Fixed from the original source

- Added proper `<!DOCTYPE html>` and `<meta charset="utf-8">` (was `http-equiv`,
  which caused mojibake: `ðŸ’Ž`, `Ã—`, `àª¡à«€àª¬à«‹àª¸`).
- Removed invalid meta tags (`name="google"`, `name="Robots"`, `name="copyright"`).
- De-duplicated the repeated Open Graph tags.
- Moved `width`/`cellspacing`/`cellpadding` off `<table>` into CSS.
- Extracted the 512-line inline `<style>` block into `src/styles/dpbboss.css`.
- Extracted the `<br>`-based footer layout into proper markup.
