import { randomUUID } from 'node:crypto';
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import type { Config } from '../config';

export interface SessionInfo {
  id: string;
  accountId: string;
  realm: 'public' | 'staff';
  email: string;
  displayName: string;
}
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id?: string;
      auth?: SessionInfo;
    }
  }
}

/** Thrown when sign-in is temporarily blocked; carries how long to wait. */
export class RateLimited extends HttpException {
  constructor(readonly retryAfter: number) {
    super({ code: 'too_many_attempts', message: 'Too many attempts. Try again later.' }, 429);
  }
}

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);
const generic: Record<number, [string, string]> = {
  400: ['invalid_request', 'The request is not valid.'],
  401: ['unauthenticated', 'Sign in to continue.'],
  403: ['forbidden', 'This action is not allowed.'],
  404: ['not_found', 'Not found.'],
  413: ['payload_too_large', 'The request is too large.'],
  429: ['too_many_requests', 'Too many requests. Try again shortly.'],
};

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.id = randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};

/** API answers are personal and must never be stored by a browser or a shared cache. */
export const noStore = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
};

/**
 * CSRF layer 1. A browser always sends Origin on cross-site writes, so a write from an origin
 * we do not list is refused. A write that carries cookies but no Origin is refused too.
 * (Layer 2 is the per-session token checked in the session guard.)
 */
export const originCheck = (cfg: Config) => {
  const allowed = new Set(cfg.allowedOrigins);
  return (req: Request, res: Response, next: NextFunction) => {
    if (SAFE.has(req.method)) return next();
    const origin = req.headers.origin;
    if ((origin && !allowed.has(origin)) || (!origin && req.headers.cookie)) {
      return void res.status(403).json({
        error: {
          code: 'forbidden_origin',
          message: 'This request is not allowed from here.',
          requestId: req.id,
        },
      });
    }
    next();
  };
};

/** One place decides what the client sees. Internals, stack traces and messages never leak. */
@Catch()
export class ErrorFilter implements ExceptionFilter {
  private readonly log = new Logger('Http');
  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    let status = 500;
    let code = 'internal_error';
    let message = 'Something went wrong. Try again later.';
    let details: unknown;
    if (exception instanceof ZodError) {
      status = 400;
      [code, message] = generic[400]!;
      details = exception.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      const g = generic[status];
      code =
        typeof body === 'object' && body && 'code' in body
          ? String(body.code)
          : (g?.[0] ?? 'error');
      message =
        typeof body === 'object' &&
        body &&
        'message' in body &&
        typeof body.message === 'string' &&
        'code' in body
          ? body.message
          : (g?.[1] ?? message);
      if (exception instanceof RateLimited)
        res.setHeader('Retry-After', String(exception.retryAfter));
    } else if (
      typeof exception === 'object' &&
      exception &&
      'status' in exception &&
      typeof exception.status === 'number' &&
      exception.status >= 400 &&
      exception.status < 500
    ) {
      // Malformed or oversized bodies are rejected by the parser before our code runs.
      status = exception.status;
      [code, message] = generic[status] ?? generic[400]!;
    } else {
      this.log.error(
        `Unhandled error on ${req.method} ${req.path} [${req.id}]: ${exception instanceof Error ? exception.message : 'unknown'}`,
      );
    }
    res
      .status(status)
      .json({ error: { code, message, requestId: req.id, ...(details ? { details } : {}) } });
  }
}
