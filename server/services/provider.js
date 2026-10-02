import { config } from '../config.js';
import { readFileSync } from 'node:fs';
import { buildLiveBoard } from './liveBoard.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_DIR = join(__dirname, '..', '..', 'php-api');

/** Read the seeded fixtures so mock mode has real-looking markets. */
function loadFixtures() {
  const mockPhp = readFileSync(join(API_DIR, 'data', 'mock.php'), 'utf8');
  const sections = JSON.parse(readFileSync(join(API_DIR, 'data', 'sections.json'), 'utf8'));

  const rows = [];
  const start = mockPhp.search(/function\s+mockMarkets\s*\(/);
  const body = mockPhp.slice(mockPhp.indexOf('[', start), mockPhp.indexOf('];', start));

  for (const chunk of body.split(/\]\s*,\s*\[/)) {
    const obj = {};
    const re = /'([A-Za-z]+)'\s*=>\s*(null|'((?:[^'\\]|\\.)*)')/g;
    let m;
    while ((m = re.exec(chunk)) !== null) {
      obj[m[1]] = m[2] === 'null' ? null : m[3].replace(/\\'/g, "'");
    }
    if (obj.market) rows.push(obj);
  }

  return { rows, sections };
}

const fixtures = loadFixtures();

export function providerName() {
  return config.provider.baseUrl ? 'paid' : 'mock';
}

/**
 * Fetch markets from the upstream provider.
 *
 * When no credentials are configured this returns the seeded fixtures, so the
 * whole stack (admin, custom markets, merge, frontend) is fully testable
 * before the paid API is purchased. Point PROVIDER_BASE_URL at the real
 * service and this transparently switches over - no other file changes.
 */
export async function fetchProviderMarkets() {
  if (!config.provider.baseUrl) {
    return fixtures.rows.map((r) => ({ ...r }));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.provider.timeoutMs);

  try {
    const res = await fetch(`${config.provider.baseUrl}/live-result`, {
      headers: {
        'X-API-Key': config.provider.apiKey,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Upstream returned HTTP ${res.status}`);
    }

    const body = await res.json();
    const data = Array.isArray(body?.data) ? body.data : [];

    // TODO(paid): map the vendor's field names onto our contract here.
    // Expected: [{ market/name, open, close, jodi, openTime, closeTime, slug }]
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchProviderLive() {
  if (!config.provider.baseUrl) {
    // Mock mode: build the board from the full fixture set against the real
    // clock, so it advances through the day exactly like the live site.
    return buildLiveBoard(fixtures.rows);
  }

  try {
    const res = await fetch(`${config.provider.baseUrl}/live-result`, {
      headers: { 'X-API-Key': config.provider.apiKey, Accept: 'application/json' },
    });
    const body = await res.json();
    return Array.isArray(body?.data) ? body.data : [];
  } catch {
    // Never let an upstream outage break the public page.
    return [];
  }
}

export const getSections = () => fixtures.sections;
