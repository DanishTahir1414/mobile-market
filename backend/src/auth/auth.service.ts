import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CONFIG, type Config } from '../config';
import { dummyHash, hashPassword, hmac, newToken, sha256, verifyPassword } from '../crypto';
import { Database } from '../db';
import { RateLimited, type SessionInfo } from '../security/http';

export interface Ctx {
  ip: string;
  userAgent: string;
  requestId?: string;
}

export const sessionCookieName = (cfg: Config) =>
  cfg.cookieSecure ? '__Host-user_session' : 'user_session';
type Runner = { query: (text: string, params?: unknown[]) => Promise<unknown> };
const invalid = () =>
  new UnauthorizedException({
    code: 'invalid_credentials',
    message: 'Email or password is incorrect.',
  });

@Injectable()
export class AuthService {
  constructor(
    private readonly db: Database,
    @Inject(CONFIG) private readonly cfg: Config,
  ) {}

  csrfToken(sessionId: string) {
    return hmac(this.cfg.csrfSecret, sessionId).toString('base64url');
  }

  private audit(
    c: Runner,
    event: string,
    outcome: 'success' | 'failure' | 'blocked',
    ctx: Ctx,
    accountId?: string,
  ) {
    return c.query(
      'INSERT INTO audit_events (account_id, event, outcome, ip_digest, request_id) VALUES ($1, $2, $3, $4, $5)',
      [
        accountId ?? null,
        event,
        outcome,
        hmac(this.cfg.ipHmacKey, `ip:${ctx.ip}`),
        ctx.requestId ?? null,
      ],
    );
  }

  /**
   * The answer is the same whether or not the email is already registered, so the form cannot
   * be used to find out who has an account. The password is hashed either way to keep timing equal.
   */
  async signup(input: { email: string; password: string; displayName: string }, ctx: Ctx) {
    const phc = await hashPassword(input.password);
    try {
      await this.db.tx(async (c) => {
        const a = await c.query<{ id: string }>(
          `INSERT INTO accounts (realm, email_normalized, display_name, status) VALUES ('public', $1, $2, 'active') RETURNING id`,
          [input.email, input.displayName],
        );
        const id = a.rows[0]!.id;
        await c.query(
          'INSERT INTO password_credentials (account_id, password_hash) VALUES ($1, $2)',
          [id, phc],
        );
        await this.audit(c, 'account.signup', 'success', ctx, id);
      });
    } catch (error) {
      if ((error as { code?: string }).code !== '23505') throw error;
      await this.audit(this.db, 'account.signup', 'blocked', ctx);
    }
  }

  async login(input: { email: string; password: string }, ctx: Ctx) {
    const key = hmac(this.cfg.ipHmacKey, `acct:${input.email}`);
    const ip = hmac(this.cfg.ipHmacKey, `ip:${ctx.ip}`);
    const window = this.cfg.loginWindowMinutes;
    const lock = await this.db.query<{
      by_account: number;
      by_ip: number;
      first_account: Date | null;
      first_ip: Date | null;
    }>(
      `SELECT count(*) FILTER (WHERE key_digest = $1)::int AS by_account,
              count(*) FILTER (WHERE ip_digest = $2)::int AS by_ip,
              min(attempted_at) FILTER (WHERE key_digest = $1) AS first_account,
              min(attempted_at) FILTER (WHERE ip_digest = $2) AS first_ip
         FROM login_attempts
        WHERE attempted_at > now() - make_interval(mins => $3) AND (key_digest = $1 OR ip_digest = $2)`,
      [key, ip, window],
    );
    const l = lock.rows[0]!;
    const byAccount = l.by_account >= this.cfg.loginMaxFailures;
    const byIp = l.by_ip >= this.cfg.loginIpMaxFailures;
    if (byAccount || byIp) {
      const first = (byAccount ? l.first_account : l.first_ip) ?? new Date();
      const wait = Math.max(1, Math.ceil((first.getTime() + window * 60_000 - Date.now()) / 1000));
      await this.audit(this.db, 'auth.login', 'blocked', ctx);
      throw new RateLimited(wait);
    }

    const found = await this.db.query<{
      id: string;
      status: string;
      display_name: string;
      authz_version: string;
      password_hash: string;
    }>(
      `SELECT a.id, a.status, a.display_name, a.authz_version, pc.password_hash
         FROM accounts a JOIN password_credentials pc ON pc.account_id = a.id
        WHERE a.realm = 'public' AND a.email_normalized = $1`,
      [input.email],
    );
    const row = found.rows[0];
    const verified = await verifyPassword(
      row?.password_hash ?? (await dummyHash()),
      input.password,
    );
    if (!row || !verified || row.status !== 'active') {
      await this.db.query('INSERT INTO login_attempts (key_digest, ip_digest) VALUES ($1, $2)', [
        key,
        ip,
      ]);
      await this.audit(this.db, 'auth.login', 'failure', ctx, row?.id);
      throw invalid();
    }

    const token = newToken();
    const session = await this.db.tx(async (c) => {
      await c.query('DELETE FROM login_attempts WHERE key_digest = $1', [key]);
      const s = await c.query<{ id: string }>(
        `INSERT INTO sessions (account_id, realm, session_digest, expires_at, idle_expires_at, authz_version, user_agent_summary, ip_signal_digest)
         VALUES ($1, 'public', $2, now() + make_interval(days => $3), now() + make_interval(hours => $4), $5, $6, $7) RETURNING id`,
        [
          row.id,
          sha256(token),
          this.cfg.sessionAbsoluteDays,
          this.cfg.sessionIdleHours,
          row.authz_version,
          // eslint-disable-next-line no-control-regex
          ctx.userAgent.replace(/[\u0000-\u001f]/g, '').slice(0, 80),
          ip,
        ],
      );
      await this.audit(c, 'auth.login', 'success', ctx, row.id);
      return s.rows[0]!;
    });
    return {
      token,
      session: {
        id: session.id,
        accountId: row.id,
        realm: 'public' as const,
        email: input.email,
        displayName: row.display_name,
      },
    };
  }

  /** Looks the opaque token up by its hash. Expired, idle, revoked or suspended all look the same: no session. */
  async resolve(token: string): Promise<SessionInfo | null> {
    const found = await this.db.query<{
      id: string;
      account_id: string;
      realm: 'public' | 'staff';
      email_normalized: string;
      display_name: string;
    }>(
      `SELECT s.id, s.account_id, s.realm, a.email_normalized, a.display_name
         FROM sessions s JOIN accounts a ON a.id = s.account_id
        WHERE s.session_digest = $1 AND s.revoked_at IS NULL AND s.expires_at > now()
          AND s.idle_expires_at > now() AND a.status = 'active'`,
      [sha256(token)],
    );
    const r = found.rows[0];
    if (!r) return null;
    // Sliding idle timeout, written at most once every few minutes.
    await this.db.query(
      `UPDATE sessions SET idle_expires_at = least(expires_at, now() + make_interval(hours => $2))
        WHERE id = $1 AND idle_expires_at < now() + make_interval(hours => $2) - interval '5 minutes'`,
      [r.id, this.cfg.sessionIdleHours],
    );
    return {
      id: r.id,
      accountId: r.account_id,
      realm: r.realm,
      email: r.email_normalized,
      displayName: r.display_name,
    };
  }

  async logout(session: SessionInfo, ctx: Ctx) {
    await this.db.query(
      'UPDATE sessions SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL',
      [session.id],
    );
    await this.audit(this.db, 'auth.logout', 'success', ctx, session.accountId);
  }
}
