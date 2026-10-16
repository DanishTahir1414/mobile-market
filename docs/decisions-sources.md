# Decisions Assumptions and References

## Architecture decision record

| ID | Decision | Why / tradeoff | Revisit when |
|---|---|---|---|
| ADR-001 | Four domain microservices and Operations worker from launch | Explicit requested isolation/scaling; adds networking, consistency and deployment work | Domain/team workload justifies split/merge with migration plan |
| ADR-002 | Separate logical databases/roles on one cluster initially | Lower baseline cost while preserving ownership; shares failure domain | Need isolated capacity/availability or independent teams |
| ADR-003 | Current report metadata via bulk synchronous lookup | Avoid eventual-event projection granting stale inspection badge | Strong current authority still preserved under alternative composition |
| ADR-004 | Object storage bytes, database metadata | Keeps relational backups/query workload smaller; distributed cleanup required | Explicit unusual binary retention requirement, after benchmarking |
| ADR-005 | WebP async worker and precomputed variants | CPU isolated from web; upload UI has processing delay | Observed quality/decoder needs require additional format |
| ADR-006 | Argon2id plus invitation-only staff MFA | Strong password storage and role boundary; hash work needs bounded budget | Vetted identity provider/passkeys adopted without reducing security |
| ADR-007 | RabbitMQ outbox/inbox at-least-once | Durable work/replay and explicit duplicate handling; broker operational burden | Throughput/ops evidence warrants a different broker |
| ADR-008 | Web opaque cookies, mobile short access/rotated refresh | Revocable web sessions with less browser token exposure; BFF dependency | Identity platform/provider architecture changes |
| ADR-009 | Monochrome UI, actual photo colors retained | Requested visual style while preserving device evidence | Owner explicitly wants monochrome photo treatment |
| ADR-010 | No Kubernetes/search cluster/service mesh at pilot | Avoid idle infrastructure overhead and operating complexity | Measured need plus operating capability |

## Changes from v1

Password signup/login replaces OTP-only login; email verification plus phone verification separates account login from seller contact proof. Admin and employee pages map to one secured staff realm. Four service data owners replace one shared backend/database model. Image variants and asynchronous WebP pipeline are explicit. Trace/error/audit contracts now govern every service. Monochrome design removes the earlier generic green-badge wording.

## Proposed defaults requiring owner review

| Setting | Initial value |
|---|---|
| Listing lifetime | 30 days |
| Inspection eligibility | 14 days |
| Input images | 5 MB, 20 MP, up to eight photos |
| Staff MFA | Mandatory TOTP with recovery codes |
| Public login identifier | Verified email; phone verified before advertising |
| Active page status refresh | On focus and every 30 seconds |
| Public media CDN lifetime | Up to 60 seconds plus purge on withdrawal/deletion |
| Report/contact HTTP caching | no-store; never trust stale affirmative badge |
| Capacity pilot | 10,000 active ads, 50 mixed concurrent users, benchmark required |
| Recovery | RPO 24 h / RTO 4 h initially, tested |

A fee, provider, shop branding/location, statutory compliance/retention obligations and exact deployment budget were not supplied. Fee/configuration remains editable; technical/policy review before launch supplies these values. No guarantees of originality, permanent scalability, zero bugs or legal compliance are implied.

## Official references verified 9 October 2026

1. **OWASP Top 10:2025:** https://top10.owasp.org/2025/ : current category baseline used for the control matrix. Top 10 is an awareness document, not certification.
2. **OWASP Password Storage Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html : Argon2id and documented minimum of 19 MiB, two iterations and parallelism one; unique salts and cost policy.
3. **OWASP Authentication Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html : password strength, generic authentication responses and recovery considerations. The project selects stricter consistent passphrase policy across realms.
4. **OWASP File Upload Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html : layered validation, isolated storage and image decode/re-encode. Re-encoding is one defense, not a complete security guarantee.
5. **OpenTelemetry signals:** https://opentelemetry.io/docs/concepts/signals/ : traces/logs/metrics foundation. Project sampling, retention and alert thresholds are design choices.
6. **Sharp constructor:** https://sharp.pixelplumbing.com/api-constructor/ : limitInputPixels and decoder inputs. Explicit project allowlist is narrower than library capabilities.
7. **Sharp output:** https://sharp.pixelplumbing.com/api-output/ : WebP output and default metadata stripping. Variant sizes and quality settings are project defaults.
8. **RabbitMQ reliability:** https://www.rabbitmq.com/docs/reliability : confirms, acknowledgements and duplicate-aware recovery.
9. **RabbitMQ confirms:** https://www.rabbitmq.com/docs/confirms : producer confirms and consumer acknowledgements are separate reliability mechanisms.
10. **Next.js metadata:** https://nextjs.org/docs/app/getting-started/metadata-and-og-images : metadata/SEO facilities for public pages.
11. **NestJS OpenAPI:** https://docs.nestjs.com/openapi/introduction : documenting service REST contracts.
12. **PostgreSQL partial indexes:** https://www.postgresql.org/docs/16/indexes-partial.html : partial unique constraints for active lifecycle records. This reference does not prescribe a deployment database major version.

## Implementation gaps intentionally left explicit

This pack does not contain application source code, executable migrations, generated OpenAPI files, deployment configuration/secrets or measured tests. dbschema.md is the comprehensive typed logical model; API inventory must be expanded into machine-readable contracts during implementation. Future provider choice affects SMS, upload signing, secret rotation, broker HA and notification receipts. Validate these capabilities before selecting providers.

## Document maintenance

Keep docs with the implementation repository once a repository exists, then version through pull requests. Update affected requirements, endpoints, schema and runbooks with each behavior change. Every architecture change records an ADR; every incident links a regression test and release. These Markdown files are authoritative v2 documentation; the older DOCX remains historical.
