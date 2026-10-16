# Technical Requirements Document

## Technology and build decisions

| Layer | Decision |
|---|---|
| Web | Next.js with TypeScript; server rendering for public SEO pages; minimal client components |
| Services | NestJS TypeScript; independently deployable Identity, Marketplace, Inspection, Media |
| Database | PostgreSQL, one database/role per service; an Operations database for delivery/audit aggregation |
| Async events | RabbitMQ durable queues with publisher confirms, manual consumer ack, retry and DLQ |
| Media | S3-compatible object storage; Sharp/libvips in constrained Media workers; WebP |
| Telemetry | OpenTelemetry traces/metrics, structured JSON logs, centralized error tracking |
| API | REST `/api/v1`; service OpenAPI specifications and generated client types |
| Deployment | Containers; Compose for local development; managed dependencies or privately networked services |

Choose supported releases at implementation time, pin exact versions, maintain lockfiles and update through CI. Versions/provider prices are not fixed in this document. Do not start with Kubernetes, Kafka, Elasticsearch or a service mesh without a measured operational need.

## Nonfunctional requirements

| ID | Requirement and proposed target |
|---|---|
| NFR-01 | At 10,000 active ads and 50 concurrent mixed users, p95 public API under 500 ms excluding uploads and external OTP; validate, do not assume |
| NFR-02 | Mobile p75 LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 in a documented representative profile; initial route JS target ≤180 KB gzip |
| NFR-03 | Normal valid photo processing p95 ≤10 s after job starts; queue wait p95 ≤30 s during normal load |
| NFR-04 | Proposed pilot availability objective 99.5% monthly; a single-host setup is not HA |
| NFR-05 | Daily backups; pilot RPO ≤24 h/RTO ≤4 h after successful restore drill. Upgrade to PITR for stricter recovery |
| NFR-06 | Every error carries request ID; every service call/job carries trace context and release identifier |
| NFR-07 | Security gates in auth-security.md; no unresolved critical/high exploitable release findings |
| NFR-08 | Horizontal API replicas possible without filesystem sessions; worker concurrency bounded |

## Resource and load control

- Starting experiment, not capacity guarantee: managed PostgreSQL/storage/broker, web and API containers measured independently. A 4 vCPU/8 GB combined app host can be a benchmark starting point, not a promise that all self-hosted dependencies fit.
- Media worker: begin one concurrent image job, 512 MiB memory reservation and 1 GiB hard limit, one vCPU, hard execution timeout 20 s. Measure decoded-image peak usage; scale safely rather than raising limits blindly.
- Identity Argon2 jobs run in a bounded pool (start two concurrent verifications per replica). Rate-limit before expensive hashing; short bounded wait, then 429/503. Never lower hashing cost to absorb attacks.
- Per-service database pool starts at five connections per replica; sum service/worker/migration pools must remain within cluster capacity with ≥20% headroom. Pool saturation alerts precede replica increases.
- Listing page limit 24, maximum API limit 50. Restrict expensive unindexed filter combinations. Start indexed text search in PostgreSQL; add external search only after measured evidence.
- Public text/catalog caching is short and bounded. Badge/status/contact cannot use stale-while-revalidate. Optimized image variants can use CDN; private evidence cannot.
- Backpressure: queue saturation → pause new upload intents with 429/Retry-After while browsing continues. Reject oversized requests at edge and service.

## API behavior

Validate fields with allowlists, reject unexpected privileged fields, parameterize SQL, use explicit public DTOs and bounded response sizes. Error envelope:

```json
{"error":{"code":"SLOT_UNAVAILABLE","message":"This slot is no longer available.","request_id":"opaque-id","retryable":false}}
```

Use 400 validation, 401 missing/invalid session, 403 insufficient permission, 404 inaccessible object, 409 stale revision/state conflict, 413 size, 415 format, 429 abuse/budget, 503 dependency unavailable. Never expose stack traces, SQL or provider secrets. Server-side logs retain redacted diagnostic context.

Idempotency: UUID key + authenticated actor + operation + request hash. Same body/key returns original result; different body/key reuse returns 409. Store at least 24 h for requests; maintain persistent domain uniqueness beyond that window. Use ETag/If-Match or expected_version for mutations. Non-idempotent requests are never blindly retried by the frontend.

## Authentication interfaces

Public signup/login are email+password. Email verification activates the account; verified phone is an extra posting requirement, not a password substitute. Staff invitations and MFA are mandatory. The web BFF stores session cookies HttpOnly; frontend JavaScript never reads access/refresh tokens. Future mobile clients use an Identity token flow with short-lived audience-scoped access and rotated refresh credentials in OS secure storage.

## Observability and code organization

Every service separates controller/DTO, application use case, domain rules and persistence/provider adapter. Shared packages contain schemas, error codes and telemetry only. Do not share ORM models or use service imports to bypass APIs. Tests follow behavior: permission, state, concurrency, integration and contract tests before broad UI snapshots.

Monorepo proposed layout:

```text
apps/web
services/identity
services/marketplace
services/inspection
services/media
workers/operations
packages/contracts
packages/telemetry
infra
runbooks
docs
```

The layout above is a directory inventory, not a runtime dependency graph. CI builds/tests changed units plus affected contract consumers. Maintain per-service changelogs and compatibility windows.

## Delivery sequence

1. Contracts, schema ownership, auth, error envelopes, tracing and threat model.
2. Marketplace upload intent integration, Media API/worker, moderation and contact.
3. Inspection booking/reporting plus strongly current badge reads.
4. Staff tools, revocation/recovery, alerts, concurrency and restore tests.
5. Controlled shop pilot, measured resource sizing and documented issues.

Re-estimate milestones before committing a date: distributed-service testing is additional work beyond the earlier 7–9-week single-backend estimate. Do not promise zero future bugs or permanent scalability. APIs, migrations, traces and tests make changes diagnosable and maintainable.
