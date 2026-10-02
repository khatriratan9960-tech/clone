import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { connectDb } from './db.js';
import authRoutes, { ensureSeedAdmin } from './routes/auth.js';
import adminMarketRoutes from './routes/adminMarkets.js';
import adminResultRoutes from './routes/adminResults.js';
import adminUserRoutes from './routes/adminUsers.js';
import publicRoutes from './routes/public.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Compact request log - useful while wiring the provider up.
app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - started}ms)`);
    }
  });
  next();
});

// Public endpoints (no auth).
app.use('/api', publicRoutes);

// Auth + admin (JWT required except login).
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminUserRoutes);
app.use('/api/admin', adminMarketRoutes);
app.use('/api/admin', adminResultRoutes);

// 404 for unknown API routes, so a typo never returns HTML.
app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, error: `No such endpoint: ${req.method} ${req.path}` });
});

// Central error handler - always JSON, never a stack trace to the client.
app.use((err, req, res, _next) => {
  console.error('[error]', err);
  res.status(err.status || 500).json({
    ok: false,
    error: err.message || 'Internal server error',
  });
});

async function start() {
  await connectDb();
  await ensureSeedAdmin();

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
