import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import type { Config } from './config';
import { ErrorFilter, noStore, originCheck, requestId } from './security/http';

/** Builds the app with every security layer, in one place so tests exercise the real thing. */
export async function createApp(cfg: Config) {
  const app = await NestFactory.create<NestExpressApplication>(AppModule.forRoot(cfg), {
    bodyParser: false,
    logger: cfg.env === 'test' ? false : ['error', 'warn', 'log'],
  });
  app.disable('x-powered-by');
  app.set('trust proxy', cfg.trustProxy);
  app.use(requestId);
  app.use(
    helmet({
      // This service returns JSON only, so the browser may load nothing from it.
      contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
      referrerPolicy: { policy: 'no-referrer' },
      hsts:
        cfg.env === 'production'
          ? { maxAge: 63_072_000, includeSubDomains: true, preload: true }
          : false,
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );
  const allowed = new Set(cfg.allowedOrigins);
  app.enableCors({
    origin: (origin, done) => done(null, !origin || allowed.has(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
    maxAge: 600,
  });
  app.use('/v1', noStore);
  app.use(cookieParser());
  app.useBodyParser('json', { limit: '20kb' });
  app.use(originCheck(cfg));
  app.useGlobalFilters(new ErrorFilter());
  app.enableShutdownHooks();
  return app;
}
