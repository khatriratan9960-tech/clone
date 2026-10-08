import { app, ensureReady } from './app.js';
import { providerName } from './services/provider.js';
import { config } from './config.js';

/**
 * Local development entry point (`npm run api` / `npm run api:dev`).
 * On Vercel this file is not used - api/index.js takes its place.
 */
async function start() {
  await ensureReady();

  app.listen(config.port, () => {
    console.log(`[api] listening on http://localhost:${config.port}`);
    console.log(
      `[provider] ${providerName()} - trial: ${config.matka.domainKey ? 'matka configured (domain_key set)' : 'mock (no trial key configured)'}`
    );
  });
}

start().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
