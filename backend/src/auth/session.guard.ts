import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { CONFIG, type Config } from '../config';
import { safeEqual } from '../crypto';
import { AuthService, sessionCookieName } from './auth.service';

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Requires a live session; for writes it also requires the per-session CSRF token header. */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    @Inject(CONFIG) private readonly cfg: Config,
  ) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const token: unknown = req.cookies?.[sessionCookieName(this.cfg)];
    const none = () =>
      new UnauthorizedException({ code: 'unauthenticated', message: 'Sign in to continue.' });
    if (typeof token !== 'string' || token.length < 20 || token.length > 100) throw none();
    const session = await this.auth.resolve(token);
    if (!session) throw none();
    if (!SAFE.has(req.method)) {
      const sent = req.header('x-csrf-token');
      if (!sent || !safeEqual(sent, this.auth.csrfToken(session.id)))
        throw new ForbiddenException({
          code: 'invalid_csrf',
          message: 'This request could not be verified.',
        });
    }
    req.auth = session;
    return true;
  }
}
