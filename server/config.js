/**
 * Central configuration. Every value can be overridden by a .env file.
 * Copy .env.example to .env and edit.
 */
import 'dotenv/config';
import crypto from 'node:crypto';

const isProd = process.env.NODE_ENV === 'production';

export const config = {
  isProd,
  port: Number(process.env.PORT || 4000),
  mongoUrl: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
  dbName: process.env.DB_NAME || 'dpboss',

  // In production a real JWT secret is REQUIRED. In dev we generate a
  // random one per boot so tokens never survive a restart.
  jwtSecret: process.env.JWT_SECRET || (isProd ? '' : crypto.randomBytes(32).toString('hex')),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',

  // Bootstrap admin, created on first run only.
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },

  // Upstream paid result API. Leave blank to run on mock data.
  provider: {
    baseUrl: process.env.PROVIDER_BASE_URL || '',
    apiKey: process.env.PROVIDER_API_KEY || '',
    // Poll interval for syncing upstream results.
    syncMs: Number(process.env.PROVIDER_SYNC_MS || 5 * 60 * 1000),
    timeoutMs: Number(process.env.PROVIDER_TIMEOUT_MS || 15000),
  },
};

if (isProd && !config.jwtSecret) {
  throw new Error('JWT_SECRET must be set in production');
}
