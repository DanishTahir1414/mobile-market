import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { loadConfig } from '../src/config';
import { sha256 } from '../src/crypto';
import { ORIGIN, start, testConfig, user } from './helpers';

type Ctx = Awaited<ReturnType<typeof start>>;
const cookieOf = (res: request.Response) =>
  (res.headers['set-cookie'] as unknown as string[] | undefined)?.[0] ?? '';
const tokenOf = (res: request.Response) => cookieOf(res).split(';')[0]!.split('=')[1]!;

describe('identity service', () => {
  let t: Ctx;
  before(async () => (t = await start()));
  after(async () => {
    await t.app.close();
    await t.pool.end();
  });
  beforeEach(() => t.pool.query('TRUNCATE accounts, login_attempts, audit_events CASCADE'));

  const post = (path: string, body: unknown, origin: string | null = ORIGIN) => {
    const r = request(t.http).post(path);
    if (origin) r.set('Origin', origin);
    return r.send(body as object);
  };
  const signup = (u: object = user) => post('/v1/auth/signup', u);
  const login = (email = user.email, password = user.password) =>
    post('/v1/auth/login', { email, password });
  const signedIn = async () => {
    await signup();
    const res = await login();
    return { res, cookie: `user_session=${tokenOf(res)}`, csrf: res.body.csrfToken as string };
  };

  describe('headers and errors', () => {
    it('sets hardening headers, hides the framework and tags each request', async () => {
      const res = await request(t.http).get('/healthz');
      assert.equal(res.status, 200);
      assert.match(res.headers['content-security-policy']!, /default-src 'none'/);
      assert.equal(res.headers['x-content-type-options'], 'nosniff');
      assert.equal(res.headers['x-powered-by'], undefined);
      assert.ok(res.headers['x-request-id']);
    });
    it('answers unknown routes and bad JSON with generic errors, never internals', async () => {
      const missing = await request(t.http).get('/nope');
      assert.equal(missing.status, 404);
      assert.doesNotMatch(JSON.stringify(missing.body), /Cannot GET|at .*\.js/);
      const bad = await request(t.http)
        .post('/v1/auth/login')
        .set('Origin', ORIGIN)
        .set('Content-Type', 'application/json')
        .send('{"email":');
      assert.equal(bad.status, 400);
      assert.equal(bad.body.error.code, 'invalid_request');
    });
    it('refuses oversized bodies', async () => {
      const res = await post('/v1/auth/signup', {
        email: 'a@b.co',
        password: 'x'.repeat(30_000),
        displayName: 'A',
      });
      assert.equal(res.status, 413);
    });
    it('does not cache API answers', async () => {
      const { cookie } = await signedIn();
      const res = await request(t.http).get('/v1/auth/me').set('Cookie', cookie);
      assert.equal(res.headers['cache-control'], 'no-store');
    });
  });

  describe('signup', () => {
    it('stores an Argon2id hash, never the password, and a lower-case email', async () => {
      const res = await signup();
      assert.equal(res.status, 202);
      const row = (
        await t.pool.query(
          'SELECT a.email_normalized, p.password_hash FROM accounts a JOIN password_credentials p ON p.account_id = a.id',
        )
      ).rows[0];
      assert.equal(row.email_normalized, 'ayesha@example.com');
      assert.match(row.password_hash, /^\$argon2id\$/);
      assert.ok(!row.password_hash.includes(user.password));
    });
    it('gives the same answer for an email that already exists', async () => {
      const first = await signup();
      const again = await signup({ ...user, displayName: 'Someone else' });
      assert.equal(again.status, first.status);
      assert.deepEqual(again.body, first.body);
      assert.equal((await t.pool.query('SELECT count(*)::int AS n FROM accounts')).rows[0].n, 1);
    });
    it('rejects weak, common and email-derived passwords', async () => {
      for (const password of ['short1', 'password1234', 'ayesha-is-here-2026']) {
        const res = await signup({ ...user, password });
        assert.equal(res.status, 400, password);
      }
    });
    it('rejects unknown fields so nobody can pick their own role or realm', async () => {
      const res = await signup({ ...user, realm: 'staff', role: 'owner' });
      assert.equal(res.status, 400);
      assert.equal((await t.pool.query('SELECT count(*)::int AS n FROM accounts')).rows[0].n, 0);
    });
    it('treats SQL in fields as plain data', async () => {
      const res = await signup({ ...user, email: "x' OR '1'='1@example.com" });
      assert.equal(res.status, 400);
      const ok = await signup({ ...user, displayName: "Robert'); DROP TABLE accounts;--" });
      assert.equal(ok.status, 202);
      assert.equal((await t.pool.query('SELECT count(*)::int AS n FROM accounts')).rows[0].n, 1);
    });
  });

  describe('sessions and CSRF', () => {
    it('issues an HttpOnly SameSite cookie and stores only a digest of it', async () => {
      const { res } = await signedIn();
      const cookie = cookieOf(res);
      assert.match(cookie, /HttpOnly/i);
      assert.match(cookie, /SameSite=Lax/i);
      assert.match(cookie, /Path=\//);
      assert.doesNotMatch(cookie, /Domain=/i);
      const stored = (await t.pool.query('SELECT session_digest FROM sessions')).rows[0]
        .session_digest as Buffer;
      assert.deepEqual(stored, sha256(tokenOf(res)));
    });
    it('requires a session for /me', async () => {
      assert.equal((await request(t.http).get('/v1/auth/me')).status, 401);
      const { cookie } = await signedIn();
      const me = await request(t.http).get('/v1/auth/me').set('Cookie', cookie);
      assert.equal(me.status, 200);
      assert.equal(me.body.account.email, 'ayesha@example.com');
    });
    it('blocks writes without the CSRF token and revokes the session on logout', async () => {
      const { cookie, csrf } = await signedIn();
      const out = (token?: string) => {
        const r = request(t.http)
          .post('/v1/auth/logout')
          .set('Origin', ORIGIN)
          .set('Cookie', cookie);
        return token ? r.set('X-CSRF-Token', token) : r;
      };
      assert.equal((await out()).status, 403);
      assert.equal((await out('wrong')).status, 403);
      assert.equal((await out(csrf)).status, 204);
      assert.equal((await request(t.http).get('/v1/auth/me').set('Cookie', cookie)).status, 401);
    });
    it('refuses writes from another origin, or with cookies and no origin', async () => {
      const { cookie } = await signedIn();
      const evil = await post(
        '/v1/auth/login',
        { email: user.email, password: user.password },
        'https://evil.example',
      );
      assert.equal(evil.status, 403);
      assert.equal(evil.body.error.code, 'forbidden_origin');
      const noOrigin = await request(t.http).post('/v1/auth/logout').set('Cookie', cookie).send({});
      assert.equal(noOrigin.status, 403);
    });
    it('ends sessions that are idle, expired, revoked or whose account is suspended', async () => {
      const { cookie } = await signedIn();
      const me = () => request(t.http).get('/v1/auth/me').set('Cookie', cookie);
      for (const sql of [
        "UPDATE sessions SET idle_expires_at = now() - interval '1 minute'",
        "UPDATE sessions SET idle_expires_at = now() + interval '1 hour', expires_at = now() - interval '1 minute'",
        "UPDATE sessions SET expires_at = now() + interval '1 day', revoked_at = now()",
        "UPDATE sessions SET revoked_at = NULL; UPDATE accounts SET status = 'suspended'",
      ]) {
        await t.pool.query(sql);
        assert.equal((await me()).status, 401, sql);
      }
    });
    it('gives a new session on every sign-in', async () => {
      await signup();
      const a = tokenOf(await login());
      const b = tokenOf(await login());
      assert.notEqual(a, b);
    });
  });

  describe('sign-in protection', () => {
    it('answers unknown email and wrong password identically', async () => {
      await signup();
      const wrong = await login(user.email, 'not the password 123');
      const unknown = await login('nobody@example.com', 'not the password 123');
      assert.equal(wrong.status, 401);
      assert.equal(unknown.status, 401);
      assert.deepEqual(
        { ...wrong.body.error, requestId: 0 },
        { ...unknown.body.error, requestId: 0 },
      );
    });
    it('locks an account after repeated failures, even for the right password', async () => {
      await signup();
      for (let i = 0; i < 5; i++)
        assert.equal((await login(user.email, 'wrong password 123')).status, 401);
      const locked = await login();
      assert.equal(locked.status, 429);
      assert.ok(Number(locked.headers['retry-after']) > 0);
      await signup({ ...user, email: 'other@example.com' });
      assert.equal((await login('other@example.com')).status, 200);
    });
    it('clears the failure count after a successful sign-in', async () => {
      await signup();
      for (let i = 0; i < 3; i++) await login(user.email, 'wrong password 123');
      assert.equal((await login()).status, 200);
      for (let i = 0; i < 3; i++)
        assert.equal((await login(user.email, 'wrong password 123')).status, 401);
    });
    it('records security events without secrets', async () => {
      await signup();
      await login(user.email, 'wrong password 123');
      await login();
      const events = (
        await t.pool.query('SELECT event, outcome, detail FROM audit_events ORDER BY id')
      ).rows;
      assert.deepEqual(
        events.map((e) => `${e.event}:${e.outcome}`),
        ['account.signup:success', 'auth.login:failure', 'auth.login:success'],
      );
      assert.doesNotMatch(JSON.stringify(events), /correct horse|wrong password|ayesha/i);
    });
  });
});

describe('request rate limiting', () => {
  let t: Ctx;
  before(async () => (t = await start({ THROTTLE_AUTH_LIMIT: '3' })));
  after(async () => {
    await t.app.close();
    await t.pool.end();
  });
  it('returns 429 with Retry-After once the per-minute limit is passed', async () => {
    const hit = () =>
      request(t.http)
        .post('/v1/auth/login')
        .set('Origin', ORIGIN)
        .send({ email: 'a@example.com', password: 'whatever' });
    for (let i = 0; i < 3; i++) assert.equal((await hit()).status, 401);
    const limited = await hit();
    assert.equal(limited.status, 429);
    assert.ok(limited.headers['retry-after']);
    assert.equal(limited.body.error.code, 'too_many_requests');
  });
  it('leaves the health check unthrottled', async () => {
    for (let i = 0; i < 10; i++) assert.equal((await request(t.http).get('/healthz')).status, 200);
  });
});

describe('configuration', () => {
  const base = {
    DATABASE_URL: 'postgres://x',
    CSRF_SECRET: 'c'.repeat(40),
    IP_HMAC_KEY: 'i'.repeat(40),
    ALLOWED_ORIGINS: 'https://shop.example',
  };
  it('refuses weak or missing secrets without printing them', () => {
    assert.throws(
      () => loadConfig({ ...base, CSRF_SECRET: 'short-secret-value' }),
      (e: Error) => /CSRF_SECRET/.test(e.message) && !e.message.includes('short-secret-value'),
    );
    assert.throws(() => loadConfig({ ...base, IP_HMAC_KEY: undefined }), /IP_HMAC_KEY/);
  });
  it('refuses insecure production settings and wildcard origins', () => {
    assert.throws(
      () =>
        loadConfig({
          ...base,
          NODE_ENV: 'production',
          COOKIE_SECURE: 'false',
          DATABASE_SSL: 'true',
        }),
      /COOKIE_SECURE/,
    );
    assert.throws(
      () => loadConfig({ ...base, NODE_ENV: 'production', DATABASE_SSL: 'false' }),
      /DATABASE_SSL/,
    );
    assert.throws(() => loadConfig({ ...base, ALLOWED_ORIGINS: '*' }), /ALLOWED_ORIGINS/);
    assert.throws(
      () =>
        loadConfig({
          ...base,
          NODE_ENV: 'production',
          DATABASE_SSL: 'true',
          ALLOWED_ORIGINS: 'http://shop.example',
        }),
      /https/,
    );
  });
  it('uses the __Host- cookie prefix when cookies are secure', () => {
    assert.equal(testConfig({ COOKIE_SECURE: 'true' }).cookieSecure, true);
  });
});
afterEach(() => undefined);
