# Authentication and Security Requirements

Baseline: OWASP Top 10:2025. This is a requirements/control mapping, not certification. Release requires actual tests and evidence in testing-deployment.md.

## Identity realms and entry points

| Flow | Route | Eligibility | Session boundary |
|---|---|---|---|
| User signup | /signup | Public, creates realm=public only | User cookie |
| User login | /login | Active verified-email public identity | User cookie |
| Admin login | /admin/login | Invited staff with admin/owner grants | Staff cookie + MFA |
| Employee/inspector login | /employee/login | Invited staff with employee/inspector grants | Staff cookie + MFA |
| Staff activation | /staff/activate | Valid single-use invitation | Limited setup session until MFA confirmed |
| Password recovery | Realm-specific recovery pages | Verified email; generic response | No auto-login after reset |

One Identity service implements all credentials. Separate screens never constitute authorization. Public accounts cannot become staff by submitting role, URL, shop_id or headers. Staff identities can hold several explicit grants, but login routes only change navigation, not powers.

## SEC-01 Password storage

- Use vetted Argon2id implementation and encoded PHC hashes with cryptographically random salt per password. Initial parameters: memory 19 MiB (19456 KiB), iterations 2, parallelism 1. Benchmark and strengthen within safe resource budgets; rehash on successful login if policy changes.
- Never use plain SHA-256, MD5, reversible encryption or home-grown hashing for passwords. SHA/HMAC use elsewhere is for random token digests, checksums or identifier matching, not human-password storage.
- Allow passphrases 15–128 Unicode code points for all realms, a maximum UTF-8 input budget of 1024 bytes, no silent trimming/truncation and no arbitrary uppercase/symbol rules. Allow paste and password managers. Reject common/compromised passwords using a locally stored vetted denylist or privacy-preserving approved service; never transmit raw password.
- No periodic forced rotation absent compromise. Require reauthentication for password/email/phone changes and staff critical actions.
- Hash policy is versioned. Password plaintext must never enter logs, analytics, traces, crash attachments, events, backups of request bodies or email.

## SEC-02 Public signup and verification

1. Validate email/name/password and terms; server sets realm public regardless of input.
2. Create pending identity with Argon2id credential and email verification challenge in a local transaction, plus outbox for verification email. For verification-email delivery, keep the random challenge token only in an encrypted, short-retention delivery payload; stored validation digest remains one-way. Operations cannot log it.
3. Return a generic result without disclosing whether email is registered; offer login/reset in UI.
4. Verification uses high-entropy random token (≥256 bits), digest, 24-hour expiry and one-time consumption. Links open confirmation screen; POST performs consumption to avoid email scanners consuming a GET.
5. Active verified email account can log in. Phone verified using SMS challenge before ad submission/contact-number changes: six digits, five-minute expiry, max five attempts, one-time use; keyed digest and rate controls.
6. Bind verification to account, purpose and target. Changing target invalidates prior challenge. Normalize E.164 phone; establish policy for number recycling and support recovery, never transfer someone else's account automatically.

Posting verifies current phone and contact consent at submission. OTP-only passwordless login from v1 is superseded; OTP here verifies the phone. Phone ownership does not prove device ownership.

## SEC-03 Password login and throttling

- Generic invalid-credentials response for nonexistent/wrong/inactive accounts; dummy Argon2id verification on unknown identity within rate limits to reduce timing differences.
- Limits start at five failures per account per 15 minutes and 20 per IP per 15 minutes, with progressive cooldown and bot challenge; use hashed account/IP keys. Avoid permanent lockout that lets attackers disable legitimate accounts.
- Apply global limits and bounded hash pool before verification. Rate signals are shared across replicas; do not reset on restart.
- Password success creates a new random session, rotates any pre-auth session and binds realm. Staff password success produces a short five-minute MFA challenge session, not a privileged session.
- Administrative state cannot be accepted from a public client. Login JSON never returns password hash.

## SEC-04 Staff invitations, MFA and recovery

- Initial owner provisioned through a one-time audited deployment command with no shipped default password. Force owner password setup and MFA; then disable bootstrap path.
- Only owner or explicitly delegated staff manager can invite staff after recent MFA step-up. Invitation token is random, digest-only, 24-hour expiry, single use, bound to intended email and reviewed grant snapshot. Grant changes invalidate outstanding invitation.
- Staff sets password, verifies intended email, enrolls TOTP and confirms a valid code. Session remains limited until enrollment finishes. Encrypt TOTP secret with managed key; recovery codes are random, one-way stored and displayed once.
- TOTP accepts a small clock window (initial ±1 step), limits attempts and atomically rejects already accepted time steps per factor. Keep clocks synchronized.
- Staff password reset does not remove MFA. Losing MFA requires a recovery code or an owner-controlled audited recovery with identity review and notifications. Owner recovery uses an offline documented emergency procedure, not an unprotected reset endpoint.
- Recent step-up = MFA/password completed within five minutes. Require it for grants, email/phone/password/MFA changes, report revocation, evidence export and staff management. Separate account recovery and report approval duties where staff count permits.
- No self-inspection or self-approval: approver must differ from report inspector and device seller identity, including an explicitly linked staff/public identity when known.

## SEC-05 Web sessions and future app tokens

Web cookies: separate `__Host-user_session` and `__Host-staff_session`, Secure, HttpOnly, SameSite=Lax, Path=/, no Domain. Values are ≥256-bit random; DB stores digest. BFF forwards cookie only to Identity, then uses delegated assertions. Browser JavaScript/localStorage never stores bearer credentials.

Proposed user session: idle 24 h, absolute seven days. Staff: idle 30 min, absolute eight hours. Rotate on login/MFA/grant change. Check current session and authz_version for sensitive actions. Logout revokes server session; logout-all, suspension, password reset and security changes revoke all relevant session families.

Unsafe cookie requests need CSRF token plus Origin validation, including logout/login-sensitive operations; no state-changing GET. CORS exact allowlist, no wildcard with credentials. Staff and public cookies are rejected in the wrong realm. Future mobile access token five-minute lifetime, exact audience/issuer/algorithm, rotated refresh tokens, replay-family revocation and secure OS storage; browser never reuses mobile token persistence.

## SEC-06 Reset and account changes

Reset request always returns generic acceptance. High-entropy reset token expires after 15 minutes, digest-only and single use. Token changes password in one transaction with session revocation/audit. Show reset success and require normal login. No security questions. Token URL/query is scrubbed from logs, analytics and referers; page uses restrictive Referrer-Policy.

Email/phone changes require recent reauth, proof of new target, invalidate old challenges, revoke sessions and notify previous verified channel. Password and MFA changes send security notice. Return-to links must be relative allowed paths to prevent open redirects. Never email existing or temporary plaintext passwords.

## SEC-07 Authorization

Enforce realm, active account, scope/role, shop boundary and object ownership at each service endpoint, not only BFF. Public DTOs never include phone/IMEI/private evidence/staff notes. Parameterized ID lookup still needs owner checks. Sensitive action performs live Identity authorization; Identity failure denies.

| Permission | Public user | Inspector | Moderator | Admin/owner |
|---|---|---|---|---|
| Own ad draft/edit | Yes | Only separate public identity | Only separate public identity | Only separate public identity |
| Ad approve/suspend | No | No | If granted | Yes |
| Assigned inspection draft | No | Yes | No | If inspector grant |
| Report approve/revoke | No | No | No | Yes, conflict check |
| Private identifier/evidence read | No | Assigned job only | No | Scoped need + step-up for export |
| Staff invite/grant | No | No | No | Owner/delegated manager only |
| Audit search | Own-session page only | Own work where needed | Scoped | Explicit audit permission |

Single shop still uses shop_id in every authorization boundary. Do not reserve a future multi-tenant design by disabling these checks now.

## OWASP Top 10 control and evidence matrix

| 2025 category | Project control | Required evidence |
|---|---|---|
| A01 Broken Access Control | Deny default, ownership/realm/shop checks, workload scope, private evidence gate, no arbitrary URL fetch/SSRF | Cross-user IDs, role/header spoofing, private object and internal-network fetch tests |
| A02 Security Misconfiguration | Hardened TLS/headers/CORS/cookies, private infrastructure, no debug/default credentials, least privilege | Configuration scan and deployed smoke tests |
| A03 Software Supply Chain Failures | Locked dependencies, SBOM, vulnerability/license review, pinned containers, reviewed CI and build provenance | Dependency/image scans and artifact provenance checks |
| A04 Cryptographic Failures | Argon2id, encrypted identifiers/MFA, key rotation, TLS and credential redaction | DB/log sample inspection, crypto config and recovery/rotation drill |
| A05 Injection | Parameterized queries, allowlisted sort/filter, escaped output, no HTML descriptions, strict DTOs | SQL/XSS payload and unsafe shell/file path tests |
| A06 Insecure Design | Threat model, booking locks, trust boundaries, step-up, immutable findings, current badge reads | Abuse-case/concurrency/race tests and design review |
| A07 Authentication Failures | Strong passphrases, generic errors, MFA, session rotation, reset and throttling | Credential stuffing, fixation, token replay and realm tests |
| A08 Software or Data Integrity Failures | Validated service/event schemas, signed build artifacts, outbox/inbox, revision/ack checks | Tampered contract/event and duplicate/out-of-order tests |
| A09 Security Logging and Alerting Failures | Local transactional audit, trace IDs, redaction, alerts and retained evidence | Alert drill, privileged-action audit and no-secret log tests |
| A10 Mishandling of Exceptional Conditions | Fail closed, bounded work, timeouts/backpressure, safe errors and recovery | Dependency outage, corrupt upload, OOM/retry/DLQ and recovery tests |

Top 10 is an awareness baseline. Use relevant OWASP ASVS requirements as a granular implementation checklist, especially auth, session, access and upload controls. Do not label the application “OWASP certified”.

## SEC-08 Upload and infrastructure controls

Files from users are untrusted. Validate extension, signature, decoded format, dimensions, byte count and owner/purpose. Quarantine first; re-encode; disallow SVG/GIF/remote-URL imports in MVP. Isolate worker with no arbitrary network egress/root privileges and CPU/memory/time bounds. WebP conversion alone is not malware protection.

Set CSP using nonces where applicable, frame-ancestors restrictions, HSTS only once HTTPS is validated, nosniff and restrictive referrer policy. No raw HTML in listings. Secrets in managed secret store/environment, not source/images. Admin UI hidden URLs are not a security control. Broker/database/object-store permissions separated per service.

## SEC-09 Privacy, retention and deletion

Proposed retention: challenges purged 24 h after expiry, security abuse signals 30 days, raw contact events 90 days, public ad originals ≤24 h after successful conversion, abandoned uploads 24 h, operational logs 30 days, traces seven days, local audits one year, inspection identifiers/private evidence 12 months after validity unless dispute hold. Backups expire on a documented cycle, initially 30 days. These are owner-approved operational policies, not legal claims.

Encrypt sensitive identifiers/evidence at rest, log accesses, and limit exports. An account deletion initiates session revocation/contact removal, listing withdrawal, asset removal and redaction of projections. Published public findings can retain pseudonymous lineage only under the declared policy. Holds have reason, reviewer, review date and scope; no indefinite default hold. Never retain seller IMEI in logs, traces/events or public report snapshots.

## Security references

See decisions-sources.md for official OWASP and implementation references verified on 9 October 2026. Numeric policy settings here are project decisions; published Argon2 minimum and Top 10 category names are source-backed. Tests must establish actual protection.
