# Mobile Market backend: Identity service

NestJS and PostgreSQL. This first slice covers sign-up, sign-in, sessions and logout, built to the
design in `docs/auth-security.md`. The Marketplace, Inspection and Media services follow.

## Run it locally

```
cd backend
cp .env.example .env            # then fill in CSRF_SECRET and IP_HMAC_KEY
docker compose up -d            # PostgreSQL 16 (set POSTGRES_PASSWORD first)
npm ci && npm run build
npm run migrate
npm start                       # http://localhost:4001/healthz
```

## Database: Docker or Supabase?

Either works, because the service only needs a PostgreSQL connection string (`DATABASE_URL`).

- **Develop and test with Docker.** It is free, works offline, and matches the specification.
- **Production can be any managed PostgreSQL**, including Supabase. If you use Supabase, treat it as
  plain PostgreSQL: keep the service's own sign-in, do not expose these tables through Supabase's
  public data API, use the direct or session connection string with `DATABASE_SSL=true`, and create a
  limited database user for the service instead of the owner role.

## Test

```
npm test       # builds, then runs the integration tests against a real PostgreSQL
```

Tests need a database `mm_test` for role `mm_test` (or set `TEST_DATABASE_URL`).
