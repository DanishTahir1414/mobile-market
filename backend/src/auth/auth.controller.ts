import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CONFIG, type Config } from '../config';
import { AuthService, sessionCookieName, type Ctx } from './auth.service';
import { loginSchema, signupSchema } from './schemas';
import { SessionGuard } from './session.guard';

/** Set when the module is built, so the per-route limit follows configuration. */
export const limits = { auth: 10 };
const strict = { default: { limit: () => limits.auth, ttl: 60_000 } };

const ctxOf = (req: Request): Ctx => ({
  ip: req.ip ?? 'unknown',
  userAgent: String(req.headers['user-agent'] ?? ''),
  requestId: req.id,
});

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    @Inject(CONFIG) private readonly cfg: Config,
  ) {}

  private cookieOptions() {
    return { httpOnly: true, secure: this.cfg.cookieSecure, sameSite: 'lax' as const, path: '/' };
  }

  @Post('signup')
  @HttpCode(202)
  @Throttle(strict)
  async signup(@Body() body: unknown, @Req() req: Request) {
    await this.auth.signup(signupSchema.parse(body), ctxOf(req));
    return { message: 'Your account is ready. You can sign in now.' };
  }

  @Post('login')
  @HttpCode(200)
  @Throttle(strict)
  async login(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, session } = await this.auth.login(loginSchema.parse(body), ctxOf(req));
    res.cookie(sessionCookieName(this.cfg), token, {
      ...this.cookieOptions(),
      maxAge: this.cfg.sessionAbsoluteDays * 86_400_000,
    });
    return {
      account: { id: session.accountId, email: session.email, displayName: session.displayName },
      csrfToken: this.auth.csrfToken(session.id),
    };
  }

  @Get('me')
  @UseGuards(SessionGuard)
  me(@Req() req: Request) {
    const s = req.auth!;
    return {
      account: { id: s.accountId, email: s.email, displayName: s.displayName },
      csrfToken: this.auth.csrfToken(s.id),
    };
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(SessionGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.auth!, ctxOf(req));
    res.clearCookie(sessionCookieName(this.cfg), this.cookieOptions());
  }
}
