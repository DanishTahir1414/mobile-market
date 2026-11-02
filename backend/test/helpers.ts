import 'reflect-metadata';
import { Pool } from 'pg';
import { createApp } from '../src/bootstrap';
import { loadConfig } from '../src/config';
import { migrate } from '../src/migrate';

export const ORIGIN = 'http://localhost:3000';

export const testConfig = (over: Record<string, string> = {}) =>
  loadConfig({
    NODE_ENV: 'test',
    DATABASE_URL:
      process.env.TEST_DATABASE_URL ?? 'postgres://mm_test:mm_test@127.0.0.1:5432/mm_test',
    CSRF_SECRET: 'c'.repeat(40),
    IP_HMAC_KEY: 'i'.repeat(40),
    ALLOWED_ORIGINS: ORIGIN,
    COOKIE_SECURE: 'false',
    THROTTLE_AUTH_LIMIT: '1000',
    THROTTLE_GLOBAL_LIMIT: '10000',
    ...over,
  });

export async function start(over: Record<string, string> = {}) {
  const cfg = testConfig(over);
  const pool = new Pool({ connectionString: cfg.databaseUrl });
  await migrate(pool);
  await pool.query('TRUNCATE accounts, login_attempts, audit_events CASCADE');
  const app = await createApp(cfg);
  await app.init();
  return { app, pool, cfg, http: app.getHttpServer() };
}

export const user = {
  email: 'Ayesha@Example.com',
  password: 'correct horse battery 7',
  displayName: 'Ayesha',
};
