import { z } from 'zod';

export const CONFIG = Symbol('CONFIG');

export interface Config {
  env: 'development' | 'test' | 'production';
  port: number;
  databaseUrl: string;
  databaseSsl: boolean;
  csrfSecret: string;
  ipHmacKey: string;
  allowedOrigins: string[];
  cookieSecure: boolean;
  trustProxy: number;
  globalLimit: number;
  authLimit: number;
  loginMaxFailures: number;
  loginIpMaxFailures: number;
  loginWindowMinutes: number;
  sessionIdleHours: number;
  sessionAbsoluteDays: number;
}

const int = (min: number, max: number) => z.coerce.number().int().min(min).max(max);

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: int(1, 65535),
  DATABASE_URL: z.string().min(1),
  DATABASE_SSL: z.enum(['true', 'false']),
  CSRF_SECRET: z.string().min(32, 'must be at least 32 characters'),
  IP_HMAC_KEY: z.string().min(32, 'must be at least 32 characters'),
  ALLOWED_ORIGINS: z.string().min(1),
  COOKIE_SECURE: z.enum(['true', 'false']),
  TRUST_PROXY: int(0, 5),
  THROTTLE_GLOBAL_LIMIT: int(1, 100000),
  THROTTLE_AUTH_LIMIT: int(1, 1000),
  LOGIN_MAX_FAILURES: int(1, 100),
  LOGIN_IP_MAX_FAILURES: int(1, 1000),
  LOGIN_WINDOW_MINUTES: int(1, 1440),
  SESSION_IDLE_HOURS: int(1, 720),
  SESSION_ABSOLUTE_DAYS: int(1, 90),
});

const defaults: Record<string, string> = {
  NODE_ENV: 'development',
  PORT: '4001',
  DATABASE_SSL: 'false',
  COOKIE_SECURE: 'true',
  TRUST_PROXY: '0',
  THROTTLE_GLOBAL_LIMIT: '120',
  THROTTLE_AUTH_LIMIT: '10',
  LOGIN_MAX_FAILURES: '5',
  LOGIN_IP_MAX_FAILURES: '20',
  LOGIN_WINDOW_MINUTES: '15',
  SESSION_IDLE_HOURS: '24',
  SESSION_ABSOLUTE_DAYS: '14',
};

/**
 * Reads and checks every setting once at start-up. Secrets have no defaults, so a missing or
 * short secret stops the service instead of running with a weak one. Errors name the
 * variable but never print its value.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const merged: Record<string, string> = { ...defaults };
  for (const [k, v] of Object.entries(env)) if (v !== undefined && v !== '') merged[k] = v;
  const parsed = schema.safeParse(merged);
  if (!parsed.success) {
    const names = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid configuration (${names})`);
  }
  const e = parsed.data;
  const allowedOrigins = e.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  for (const origin of allowedOrigins) {
    let url: URL;
    try {
      url = new URL(origin);
    } catch {
      throw new Error(
        'Invalid configuration (ALLOWED_ORIGINS: each entry must be a full origin URL)',
      );
    }
    if (origin === '*' || url.origin !== origin)
      throw new Error(
        'Invalid configuration (ALLOWED_ORIGINS: use exact origins such as https://example.com)',
      );
    if (e.NODE_ENV === 'production' && url.protocol !== 'https:')
      throw new Error('Invalid configuration (ALLOWED_ORIGINS: production origins must be https)');
  }
  if (e.NODE_ENV === 'production') {
    if (e.COOKIE_SECURE !== 'true')
      throw new Error('Invalid configuration (COOKIE_SECURE must be true in production)');
    if (e.DATABASE_SSL !== 'true')
      throw new Error('Invalid configuration (DATABASE_SSL must be true in production)');
  }
  return {
    env: e.NODE_ENV,
    port: e.PORT,
    databaseUrl: e.DATABASE_URL,
    databaseSsl: e.DATABASE_SSL === 'true',
    csrfSecret: e.CSRF_SECRET,
    ipHmacKey: e.IP_HMAC_KEY,
    allowedOrigins,
    cookieSecure: e.COOKIE_SECURE === 'true',
    trustProxy: e.TRUST_PROXY,
    globalLimit: e.THROTTLE_GLOBAL_LIMIT,
    authLimit: e.THROTTLE_AUTH_LIMIT,
    loginMaxFailures: e.LOGIN_MAX_FAILURES,
    loginIpMaxFailures: e.LOGIN_IP_MAX_FAILURES,
    loginWindowMinutes: e.LOGIN_WINDOW_MINUTES,
    sessionIdleHours: e.SESSION_IDLE_HOURS,
    sessionAbsoluteDays: e.SESSION_ABSOLUTE_DAYS,
  };
}
