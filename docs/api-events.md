# API and Event Contracts

## General contract

All external resources under `/api/v1`. BFF exposes same-origin web paths and routes services; service endpoints remain private. Each service publishes an OpenAPI specification, generated clients and additive compatibility tests. IDs opaque UUIDs; public report code random and nonsequential. Timestamps ISO 8601 UTC; display localized. Idempotency-Key on booking, issuance, state changes and upload completion. If-Match or expected_version on edits.

The following is the required endpoint inventory. Implementation must expand field schemas, validation and examples into OpenAPI; this documentation does not claim a generated executable contract already exists.

## Identity endpoints

| Method and path | Inputs / effect | Access |
|---|---|---|
| POST /auth/signup | name, email, password, terms_version; pending public account | Anonymous throttled |
| POST /auth/verify-email | challenge token; activate email | Anonymous token-bound |
| POST /auth/login | email, password; user session | Public realm |
| POST /staff/auth/login | email, password; restricted MFA challenge | Invited staff |
| POST /staff/auth/mfa/verify | challenge_id, TOTP/recovery code; staff session | Bound challenge |
| POST /auth/logout; POST /auth/logout-all | Revoke session/family | Current realm + CSRF |
| POST /auth/password/forgot | email, realm; generic acceptance | Throttled |
| POST /auth/password/reset | token, new_password; single-use reset/revoke | Token-bound |
| PATCH /auth/password | old/new password; revoke other sessions | Reauthenticated |
| POST /auth/phone/challenges; POST /auth/phone/verify | Phone ownership, not login | Active public account |
| GET /auth/sessions; DELETE /auth/sessions/:id | List/revoke own sessions | Owner of session |
| POST /staff/invitations | intended email, approved grants | Staff manager + step-up |
| POST /staff/activate | invitation, password; restricted MFA setup | Token-bound |
| POST /staff/mfa/setup; POST /staff/mfa/confirm | Enrollment secret, then confirmation | Restricted setup/reauthed staff |
| PATCH /staff/accounts/:id/grants | Replace reviewed grants and bump authz version | Owner/delegated manager + step-up |
| POST /staff/accounts/:id/suspend | Revoke access and sessions | Authorized manager |
| POST /internal/auth/introspect | Validate realm/session/object action, no raw secret logging | Allowed workload only |

Password change/email change/recovery paths cannot be used to promote realm. Staff and public recovery tokens are not interchangeable. Email-change initiation/confirmation and MFA disable/recovery require explicit additional protected resources in implementation.

## Marketplace endpoints

| Method and path | Behavior | Permission |
|---|---|---|
| GET /catalog; GET /shops/:id | Safe catalog/policy display | Public |
| GET /listings | Validated filters, bounded pages, current eligibility composition | Public |
| GET /listings/:id | Sanitized current detail and live status | Public published, owner draft |
| POST /listings | Draft creation | Verified active public identity |
| PATCH /listings/:id | Own revision; material edit increments device_revision | Owner + expected_version |
| POST /listings/:id/attachments | ready asset_id, generation, position | Owner; Media owner/purpose verified |
| DELETE /listings/:id/attachments/:id | Revision-aware unlink | Owner |
| POST /listings/:id/submit | Validate phone/contact/photos/current revision | Owner |
| POST /listings/:id/withdraw; /mark-sold; /renew | State machine transition | Owner |
| POST /listings/:id/contact | mode, challenge proof, request key; normalized contact target | Current eligible listing + live identity-status check |
| GET /me/listings; GET /me/profile; PATCH /me/profile | Own data, not credentials | Public account |
| GET /me/favorites; PUT /me/favorites/:id; DELETE ... | Favorites | Active public account |
| POST /abuse-reports | listing, reason, details | Rate-limited reporter |
| GET /staff/moderation; POST /staff/listings/:id/decision | reviewed_revision, decision, reason | Ad moderator |
| PATCH /staff/shop/settings; POST /staff/catalog/... | Versioned configuration | Configuration grant |
| GET /internal/listings/:id/snapshot | id, seller, status, device_revision, media refs only | Inspection/Media scoped workload |

Private contact returned only after consent/current eligibility checks, never in initial listing response. Log event metadata without phone/URL payload. API output includes safe inspection_state `current/not_inspected/expired/revoked/unavailable`; only current can show a positive badge.

## Inspection and Media endpoints

| Method and path | Behavior | Permission |
|---|---|---|
| GET /inspection-slots | Future shop slots and capacity | Public |
| POST /inspection-requests | listing_id, slot_id, terms_version | Seller + current listing match |
| GET /me/inspection-requests | Own booking states | Seller |
| POST /inspection-requests/:id/cancel | Reason; release reservation | Seller/authorized staff |
| GET /inspection-reports/:code | Public allowlisted findings plus current listing eligibility | Public; no-store |
| POST /inspection-drafts/:id/acknowledge | draft_revision and displayed findings digest | Exact seller |
| POST /staff/inspection-requests/:id/check-in | Device attendance | Assigned inspector |
| PATCH /staff/inspection-drafts/:id | Checklist/evidence/notes; increments draft_revision | Assigned inspector |
| POST /staff/inspection-drafts/:id/submit | Required checks and matched identity | Assigned inspector |
| POST /staff/inspection-drafts/:id/approve | Expected revision, ack, fee gate | Distinct report approver + live grants |
| POST /staff/inspection-reports/:id/revoke | Reason; immutable report status change | Approver + recent step-up |
| POST /staff/inspection-requests/:id/fees | Manual paid/waived record | Fee-recording grant |
| GET /internal/inspection-summaries | Bulk listing IDs, max 50 | Marketplace workload |
| POST /media/upload-intents | Purpose, target_id, expected bytes/type | Authorized target owner/assigned inspector |
| POST /media/uploads/:id/complete | Object version/checksum reference | Ticket owner; idempotent |
| GET /media/assets/:id | Safe job state and ready variants | Authorized owner/target access |
| POST /media/assets/:id/retry | Retry permitted failure without new owner/target | Authorized owner/staff |
| POST /media/evidence/:id/access | short-lived authorized access | Assigned inspector/scoped admin |
| DELETE /media/assets/:id | Mark deletion and queue storage cleanup | Owner service authorized lifecycle |

Operations exposes own notification list/read resources and privileged audit search. Notification events do not authorize actions. Separate catalog/slot/assignment/abuse resolution/staff recovery endpoint schemas must be detailed during implementation, following the same permission rules.

## Event envelope

```json
{
  "event_id":"uuid",
  "type":"media.asset.ready",
  "schema_version":1,
  "producer":"media",
  "occurred_at":"2026-10-09T00:00:00Z",
  "aggregate_id":"asset-uuid",
  "aggregate_version":2,
  "traceparent":"W3C trace context",
  "payload":{"asset_id":"uuid","generation":1,"purpose":"listing","target_id":"uuid"}
}
```

Examples contain placeholders, not real credentials. Contracts validate payload size (start 64 KB maximum), field types and producer permissions. Do not include raw photos, password, token, IMEI, private notes or contact phone. Verification email/SMS delivery uses separate encrypted restricted commands, not broad domain event payloads.

| Event | Producer | Consumers / effect |
|---|---|---|
| identity.account.activated/suspended/deleted | Identity | Marketplace profile projection, Operations notification/audit; never auth authority |
| identity.staff.grants.changed | Identity | Cache hint invalidation; live checks remain authoritative |
| marketplace.listing.submitted/published/changed/sold/suspended | Marketplace | Operations notifications, Inspection hint update, Media lifecycle |
| marketplace.listing.attachment.removed | Marketplace | Media reconciles unreferenced eligible assets |
| inspection.request.booked/cancelled/no_show | Inspection | Operations in-app notice/delivery |
| inspection.report.published/revoked | Inspection | Marketplace search hints/cache invalidation, Operations |
| media.asset.processing.requested | Media | Media worker with owner-service job authorization |
| media.asset.ready/failed/deleted | Media | Marketplace/Inspection attachment status, Operations |
| *.audit.recorded | Respective service | Operations redacted audit projection |

## Delivery, ordering and compatibility

- Consumer-specific queues and inbox keys prevent one consumer ack from removing another consumer's work.
- Persistent publish with mandatory routing/publisher confirms; unroutable events stay pending and alert. Ack after local commit, never before.
- Exponential backoff with jitter, max five attempts for transient work; invalid schema goes to DLQ immediately. Retry at most configured age; record cause without secrets.
- Outbox/inbox retention must cover replay windows: initial 30 days processed events; retain unresolved outbox/DLQ until reviewed with policy. Replaying older events requires archived dedupe evidence or authoritative reconciliation.
- Aggregate_version for state projections; duplicates no-op. Older changes must not overwrite newer suspension/revocation state. Consumers can accept unknown optional fields but reject incompatible schema versions safely.
- Never replay external SMS/email blindly after provider timeout. Use provider idempotency if supported; otherwise mark delivery uncertain, reconcile provider receipt and document possible duplicates.
