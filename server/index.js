import { app, ensureReady } from './app.js';
import { config } from './config.js';

/**
 * Local development entry point (`npm run api` / `npm run api:dev`).
 * On Vercel this file is not used - api/index.js takes its place.
 */
async function start() {
  await ensureReady();

  app.listen(config.port, () => {
    console.log(`[api] listening on http://localhost:${config.port} (provider: ${
      config.provider.baseUrl ? 'paid' : 'mock'
    })`);
  });
}

start().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
