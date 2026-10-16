# Observability and Bug Investigation Runbook

## Required diagnostic contract

Every edge request generates a validated request_id and starts/continues a W3C trace. Propagate traceparent across allowed service calls and job messages; ignore malformed/spoofed identifiers. End-user sees a short support reference, not stack traces. Error tracking uploads protected source maps from the exact release; maps are not public static files.

Required structured log fields:

```json
{"timestamp":"ISO-8601","level":"error","service":"inspection","environment":"production","release":"commit-sha","request_id":"uuid","trace_id":"hex","span_id":"hex","route":"POST /inspection-requests","error_code":"SLOT_UNAVAILABLE","duration_ms":80,"dependency":"inspection-db"}
```

Log route templates, not raw reset URLs; internal safe entity IDs when needed. Remove passwords, session/OTP/reset/MFA secrets, full phone/email/IP, IMEI, evidence contents, request bodies and provider signed URLs. Use pseudonymous stable IDs only where necessary. Never put account/listing IDs in metric labels: high cardinality can overload telemetry.

## Telemetry signals and retention

| Signal | Purpose | Initial storage policy |
|---|---|---|
| JSON logs | Error context, deployment/startup and sanitized dependency failure | 30 days |
| Traces | Cross-service/SQL/job timing with trace propagation | Seven days; sampled normal traffic |
| Metrics | Low-cardinality performance, queue and saturation trends | 90 days aggregate |
| Error tracking | Deduplicated release-linked exceptions, regression detection | 30 days; scrub before export |
| Local transactional audit | Sensitive action evidence independent of telemetry uptime | One year, reviewed policy |

Start normal request trace sampling at 10%; collect errors with bounded tail sampling or error-focused policy. Cap exporter buffers and drop routine telemetry under pressure instead of blocking traffic. Restrict audit/telemetry access and log access to exports.

## Dashboards

1. **User experience:** error rate, p50/p95/p99 latency by route, availability, Web Vitals, current deployment.
2. **Identity:** attempts/throttle rate, MFA failures, reset volume, session revocations, hash-pool wait and saturation.
3. **Marketplace:** active ads, DB pool wait, slow query counts, contact failures, moderation backlog and listing-cache hit rate.
4. **Inspection:** booking conflicts vs unexpected DB errors, request latency, reports awaiting ack/approval, eligibility lookup timeouts.
5. **Media:** oldest pending job, conversion time/memory, ready/failed/DLQ counts, storage error rate, original cleanup lag.
6. **Infrastructure/events:** CPU/memory/OOM, DB connections/locks/disk, RabbitMQ ready/unacked/dead messages, outbox age, consumer lag and failed backups.

## Alert policy

Proposed thresholds, tune after pilot:

| Alert | Trigger | Response |
|---|---|---|
| Public API degradation | >2% unexpected 5xx for five minutes with minimum request volume | Check release/dependency and route traces |
| Latency | p95 >1 s for ten minutes at sufficient traffic | Identify slow span/DB pool saturation |
| Identity attack | Sharp failure/throttle spike or staff MFA abuse | Review signals, increase temporary controls, do not disable hashing |
| Media backlog | Oldest normal job >2 min or any DLQ entry | Inspect worker/broker/storage; throttle uploads |
| Outbox backlog | Oldest unpublished event >60 s | Broker routing/confirms and publisher health |
| Permission/audit fault | Denied privileged anomaly or failed local audit mutation | Security owner review; fail affected write |
| Database risk | >80% connection budget/disk or persistent lock contention | Bound pools/work, diagnose locks, plan capacity |
| Backup risk | Scheduled backup missing or restore verification failed | Restore operator investigates; no silent green dashboard |

Alerts include service/environment/release, redacted error code, dashboard/runbook links and dedupe key. Route to owner-chosen channel at deployment; this document does not send alerts/messages itself. Avoid alerting on ordinary 401/404/booking conflicts as crashes.

## Investigation procedure

1. Obtain support reference, approximate local time, page/action and reproducible steps. Never request password/OTP/IMEI over support chat.
2. Find request_id, then trace_id and release. Follow gateway → domain service → DB/provider/worker spans.
3. Classify: input/permission expected outcome, application exception, dependency failure, concurrency conflict, queue delay, resource saturation or bad deployment.
4. Check rate change against release and resource graphs. Read safe logs; reproduce in staging with synthetic records and exact contract version.
5. Fix root cause, add a meaningful regression test, run affected contracts/security checks, deploy canary and watch metrics.
6. Record incident with impact, trigger, evidence, fix, tests and prevention. Do not claim no future recurrence solely because restarting worked.

## Specific runbooks

### Upload stuck processing

Check asset generation, ticket state, processing job, outbox event and consumer inbox. Verify worker lease/heartbeat, queue age, storage reachability and last safe error code. If source is safe and present, requeue same generation idempotently after fixing fault. Unsafe/deleted input remains rejected. Clean orphans after grace period. No manual DB update to ready.

### Incorrect badge or stale report

Compare current listing status/device_revision and primary Inspection report status/revision/valid_until. Check no-store path, UI polling/focus behavior and read composition. Disable affirmative badge if freshness cannot be established; do not set “verified=true” manually. Repair hints only through replay/reconciliation. If issue is a race, preserve exact reports and reproduce with concurrent test.

### Booking conflict or duplicate

Inspect idempotency record, body hash, slot row and active reservation. A normal conflict is 409, not a retry with another booking. If duplicate domain rows exist, stop booking for affected slot, preserve audit, resolve with authorized cancellation and repair constraint/migration. Rehearse concurrency fix before resuming.

### Suspected credential compromise

Revoke sessions/families, suspend affected staff if needed, preserve redacted audit, rotate compromised workload keys, review grants/exports and notify through approved recovery workflow. MFA reset requires identity review; no password emailing. Record scope and evidence without downloading unnecessary private data.

### Broker/provider outage

Domain actions keep local outbox. Inspect publisher confirms, mandatory routing and credentials. Recover broker/consumer; deduplicated replay. Provider timeout may mean sent but unconfirmed, so use receipt/idempotency reconciliation before resend. Staff see pending notification delivery, not rollback of a valid booking.

### Database restore

Pause affected writes, record cutover time, restore each service DB to a coordinated documented point, then reconcile outbox/inbox and cross-service references. Reconcile storage objects against Media rows and published attachments. Retain event history through restore window so dedupe survives. Revoke restored old sessions/reset tokens if rollback could resurrect credentials. Validate booking/badge/media invariants before reopening.

## Operational ownership

Assign primary and backup operator, security reviewer and release approver before pilot. On a solo project one person may fill roles, but the runbook and backup access must be explicit. Maintain a sanitized incident log and monthly restore/alert exercises. Service ownership and traceability reduce diagnosis time; they do not guarantee every bug is automatically identified.
