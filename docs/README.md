# Mobile Marketplace Documentation Pack

Version 2.0 · 9 October 2026 · Prepared for Muhammad Danish Tahir

This pack specifies a single existing shop's mobile classified marketplace: public sellers advertise phones, the shop physically inspects devices, and buyers contact sellers by phone or WhatsApp. It is an implementation specification, not a built or security-tested application.

## Decisions that govern every document

- Separate microservices from the first production release: Identity, Marketplace, Inspection and Media. An Operations worker handles delivery of notifications and aggregation of audit events.
- Separate deployment units and data ownership, even when databases initially share one managed PostgreSQL cluster. No cross-service SQL access or distributed foreign keys.
- User email/password signup and login; verified phone required to advertise. Admin and employee/inspector sign in through separate staff screens using invitation-only staff identities and mandatory MFA.
- Passwords use Argon2id. No plain text passwords, reversible password encryption, MD5 or plain SHA hashes for passwords.
- Uploaded listing images are automatically decoded and converted into WebP variants by a bounded worker. Image files belong in object storage; database records hold keys, sizes, dimensions, state and ownership. Image binary/base64 storage inside PostgreSQL is explicitly excluded to meet the lightweight requirement.
- Monochrome interface: black, white, neutral greys. No blue or purple. Preserve original phone photo colors in actual listings so buyers can assess device color and condition; the preceding grayscale mockup illustrated the interface style.
- Public ads may be uninspected. Inspection is a dated condition report, not a warranty. Contact, negotiation and payment occur outside the website.

## Reading order

| File | Purpose |
|---|---|
| prd.md | Product, scope, permissions, flows and release acceptance |
| trd.md | Technical requirements, budgets, API conventions and rollout |
| design.md | Monochrome tokens, pages, states and responsive behavior |
| architecture.md | Service ownership, topology and distributed consistency |
| dbschema.md | Typed logical schema, relationships, constraints and indexing |
| auth-security.md | All signup/login/recovery flows and OWASP control matrix |
| api-events.md | REST resources, event contracts and authorization boundaries |
| media-pipeline.md | Safe upload, WebP conversion and media lifecycle |
| observability-runbook.md | Bug tracing, dashboards, alerts and incident procedures |
| testing-deployment.md | Tests, CI gates, deployment, migrations and scaling |
| decisions-sources.md | Architectural decisions, assumptions and official references |

All requirements use MUST for release gates and SHOULD for recommendations. Numeric timeouts, limits, retention periods and capacity targets are proposed configuration defaults, not measured capacity or legal standards. The owner can change them through a reviewed policy.

## Authority and traceability

This v2 pack supersedes the earlier `Mobile_Marketplace_PRD.docx` implementation choices for authentication and backend topology. The earlier product intent remains. The old document is retained as history; do not implement OTP-only login or a single backend from it. Functional IDs FR-* map to acceptance IDs AT-* and test cases. Security requirements SEC-* are in auth-security.md.

Branding, shop address, city, hours, inspection fee, cancellation/refund policy and staff list remain owner configuration. Provider selection, resource sizing and secret values are deployment tasks. Do not invent operational secrets or use demo credentials in production.
