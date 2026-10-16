# Testing Deployment and Scaling Plan

## Test layers

| Layer | Required coverage |
|---|---|
| Domain unit | Listing/report states, badge rule, fee gate, revision materiality, permission and expiry boundaries |
| Service integration | Real PostgreSQL constraints/transactions, outbox/inbox, session/token behavior, media state |
| Contract | OpenAPI clients, producer/consumer schema compatibility, optional/unknown fields |
| Cross-service | Signup through posting, target ownership, issuance races, badge fallback and staff revocation |
| UI end-to-end | Mobile/desktop posting, all login realms/MFA/recovery, contact, inspection approval and error states |
| Security | OWASP controls, object access, CSRF, injection, upload bombs, role spoofing and secret absence |
| Reliability | Duplicate/out-of-order events, worker crash, broker/storage/Identity/Inspection failure and restore |
| Load | Mixed browse/auth/upload/booking at documented targets; capture CPU/memory/pool and p95/p99 |

Use synthetic devices/images, controlled test clocks and ephemeral dependency containers. Keep fixed seeds for generated load data. Assertions must check user-visible/domain invariants, not mirror implementation code. Do not use real user passwords/IMEI in fixtures.

## Mandatory regression scenarios

- Public signup with role=admin cannot create staff; public session cannot call staff routes. Same person/realm identities do not share privileges.
- Password hash format/cost/salt verified; duplicate passwords have distinct hashes; plaintext absent from logs/events and DB fields. Login throttles before expensive pool saturation.
- Reset token consumed once, expires, cannot cross realms; reset revokes sessions and does not bypass staff MFA. TOTP replay rejected and recovery code consumed atomically.
- Cross-user ad/evidence ID, service header spoof, manipulated asset target, forged event producer and unverified phone all denied.
- Concurrent capacity-one bookings: many attempts yield one reservation. Same idempotency key/body produces original response; changed body yields conflict.
- Simultaneous material edit/report issuance never yields current badge for mismatched revisions. Report revocation after read is reflected on next read/action; unavailable service yields no badge.
- Inspector cannot approve own report; seller/public alias conflict handled where known. Ack revision changes invalidate approval. Fee unpaid blocks charged issuance.
- Fake extension/signature, SVG, animation, huge decoded dimensions, EXIF location and corrupt input rejected/stripped. Valid output variants readable and correctly oriented.
- Upload completion retry, worker crash after writing variants/before commit, deleted target during job and reordered older events do not resurrect or duplicate assets.
- No full IMEI or phone in listing HTML/JSON/search index/logs; contact returned only by authorized current action. Private evidence storage is not public.
- Account/staff suspension effective for sensitive routes without waiting for event projection. Dependency timeout fails closed.
- Restore preserves current lifecycle, replay dedupe and private ownership; secrets/old sessions cannot be unintentionally revived.

## CI gates

1. Formatting/type-check/lint and relevant domain tests.
2. Migration/integration tests with service-owned DBs.
3. OpenAPI/event compatibility diff and consumer tests.
4. SAST, secret scan, dependency/container vulnerability scan, SBOM and license review.
5. Frontend build budget, representative accessibility and end-to-end tests.
6. Protected artifact creation with pinned inputs; publish build digest and release/source commit.
7. Staging DAST/security smoke and mixed load checks for changed high-risk paths.

Critical/high exploitable findings block release. Exceptions require documented rationale, owner and expiry, not an ignored scanner rule. Protect CI tokens and artifact provenance; never run untrusted pull-request code with production secrets.

## Environments and secrets

Local, staging and production have separate DBs/storage/broker namespaces/keys. Seed data synthetic. Configuration validated at startup with explicit required variables. Secret names include DB_URL, SESSION/ASSERTION_SIGNING_KEY, IDENTIFIER_ENCRYPTION_KEY, IDENTIFIER_HMAC_KEY, MFA_ENCRYPTION_KEY, OTP_HMAC_KEY, STORAGE_CREDENTIALS, BROKER_CREDENTIALS and provider keys; values must never appear in sample files. Key IDs/rotation policy documented. Use least-privilege service roles, not cluster administrator.

## Deployment procedure

1. Build once, sign/record artifact digest, scan, deploy same artifact through staging and production.
2. Back up and verify compatible migrations. Service-specific expansion migrations run once by controlled job, not every replica startup.
3. Deploy compatible service producer/consumer order, database backfills and feature flags.
4. Start readiness checks only after DB/schema/required dependencies validated. Liveness checks process health only; optional provider outage must not cause restart storms.
5. Canary one replica or small traffic share, verify login/permissions/contact/badge/booking/media probes and error/latency graphs.
6. Complete rollout if gates pass; retain previous application artifacts. Drain requests/jobs gracefully on shutdown; nack/unlease incomplete work.
7. Contract/remove old schema/API only after consumers and rollback window no longer need it.

## Rollback and data recovery

Application rollback only to versions compatible with current expanded schema. Do not pretend destructive migration is automatically reversible. Data corruption needs restore/forward repair plan and reconciliation, not an app restart. During Identity rollback revoke sessions that could have been resurrected; preserve security audit evidence and notify approved operators.

## Resource deployment stages

| Stage | Setup | Exit/upgrade trigger |
|---|---|---|
| Local development | Compose per-service containers and isolated databases/roles | Contract/integration flows pass |
| Shop pilot | Separate deployable app services, bounded Media worker, private managed/shared dependency cluster | Measured mixed-load test and recovery drill |
| Growth | API/worker replicas, larger/split DB workloads, broker HA and CDN tuning | Sustained queue/latency/connection risk at safe capacity |
| Larger platform | Orchestrator/managed HA when operating burden warrants; independent DB clusters/search if measured | Documented capacity bottleneck and staffing/operational plan |

Microservices always remain separate; stage changes hosting resources, not domain boundaries. Sharing an app host or DB cluster is a pilot cost choice and shares downtime risk. No fixed VM can be called future-proof without measurement.

## Release checklist

- P0 acceptance AT-01 through AT-12 with evidence.
- All realms, invitation, MFA/reset and least-privilege access verified.
- Monochrome pages/accessibility/device layouts tested.
- WebP pipeline budgets and deletion/retention jobs tested.
- No affirmative cached badge or private cached responses.
- Owner-configured terms, fee, hours, cancellation/retention and support contact.
- Backup restore, failed worker, broker outage and alert drill passed.
- Runbooks, dashboards, release/source IDs, OpenAPI and migration ownership current.
- Pilot staff trained; realistic sample data removed or clearly marked.

## Future native applications

Reuse versioned API/event/domain contracts. Add mobile token rotation/secure OS storage, device-token table, notification preferences, deep links and camera upload. Do not add device trust based solely on an app installation. Allow previous app API versions during staged updates and revoke compromised versions through documented policy. Web deployment cannot force all installed apps to update immediately.
