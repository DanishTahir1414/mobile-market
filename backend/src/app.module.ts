import { Controller, type DynamicModule, Get, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SkipThrottle, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthController, limits } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { SessionGuard } from './auth/session.guard';
import { CONFIG, type Config } from './config';
import { Database } from './db';

@Controller()
class HealthController {
  @SkipThrottle()
  @Get('healthz')
  health() {
    return { status: 'ok' };
  }
}

@Module({})
export class AppModule {
  static forRoot(cfg: Config): DynamicModule {
    limits.auth = cfg.authLimit;
    return {
      module: AppModule,
      // In-memory counters suit one instance. Behind several replicas, use a shared store.
      imports: [
        ThrottlerModule.forRoot({
          throttlers: [{ name: 'default', ttl: 60_000, limit: cfg.globalLimit }],
        }),
      ],
      controllers: [HealthController, AuthController],
      providers: [
        { provide: CONFIG, useValue: cfg },
        Database,
        AuthService,
        SessionGuard,
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    };
  }
}
