# Frontend verification report

Date: 17 October 2026, Asia/Karachi. Scope: frontend and explicitly labeled local demonstrations. Runtime: Node.js 22.14.0 in this verification session.

## Automated checks

| Check                                                                      | Actual result                                                                                                             |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                                                        | Passed; rerun after review refinements                                                                                    |
| `npm run lint`                                                             | Passed; internal anchor lint finding fixed with Next Link                                                                 |
| `npm run format:check`                                                     | Passed                                                                                                                    |
| `npx prettier --check src tests *.ts *.mjs *.json *.md docs/frontend-*.md` | Extended check initially found three frontend documentation files; formatted and rechecked                                |
| `npm test`                                                                 | 16 passed, 0 failed, 0 skipped                                                                                            |
| `npm run build`                                                            | Production compilation, TypeScript and generation of 30 static pages passed; dynamic account/staff/report routes included |
| `git diff --check`                                                         | Passed                                                                                                                    |

New regression coverage includes finite/integer/out-of-range pagination, empty pagination, terminal lifecycle rules, renewal through moderation, material versus price-only edits, cross-brand/storage consistency, integer price/battery bounds, exact findings acknowledgement, approval blockers, malformed local storage, storage-write failure and recovery after browser storage events.

Sandboxed Node initially failed resolving the workspace (`EPERM`). Checks ran with approved execution outside that sandbox. An intermediate rebuild failed with `EBUSY` because QA server logs were inside `.next`; stopped that temporary server and moved its logs outside the build output. Subsequent builds passed. A concurrent typecheck also encountered generated `.next/types` files while the build replaced them; reran type checking after generation. No check was disabled.

## Browser evidence

Supported in-app browser used against the local application and production build on port 3010. No public deployment or real seller/staff communication occurred.

| Flow                     | Observed result                                                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile filter Apply      | Selecting Apple left the URL unchanged until Apply; then `brand=Apple`, active label and three phones appeared                                                    |
| Gallery                  | Full-screen opened, ArrowRight moved from photo 1 to 2, Escape closed and restored focus to the opener                                                            |
| Seller validation        | Empty submission displayed linked error summary and inline errors; focus moved to Brand                                                                           |
| Draft creation           | Dependent Apple/iPhone 13/128 GB fields, price, description and consent progressed through all four steps; fields saved locally                                   |
| Saved preview            | Read-only saved draft opened; no photo persistence claimed and missing-image fallback displayed                                                                   |
| Unknown draft            | Unknown preview ID displayed draft-not-found rather than creating a draft                                                                                         |
| Lifecycle                | Confirmed local pending-review transition, followed by rejection; rejection guidance and edit action appeared                                                     |
| Inactive listing         | Sold example had disabled seller-contact control and no page overflow at 390 pixels                                                                               |
| Findings acknowledgement | Acknowledged revision 1 locally, changed findings to revision 2; checkbox reset and previous acknowledgement no longer applied                                    |
| Moderation conflict      | Demonstrating a newer revision disabled decision preview                                                                                                          |
| Abuse resolution         | Reasoned resolution form returned explicit validation-only feedback; no report resolved                                                                           |
| Staff suspension         | Confirmation opened; completing preview stated no staff access changed                                                                                            |
| Booking                  | Entered future date using native date segments, saved local appointment, saw Karachi time and detail link                                                         |
| Tracking                 | Local booking detail switched to awaiting acknowledgement and displayed exact findings; no overflow at 390 pixels                                                 |
| Staff appointment        | Matching local booking detail displayed assignment, attendance, required reason and unavailable capacity boundary                                                 |
| Temporary photos         | Selected two existing illustrative local JPEGs through file chooser; photo count and ordering controls appeared; reordered cover and opened shared review gallery |
| Gallery within form      | Close button closed the gallery without submitting or leaving the draft                                                                                           |

The native date field did not accept the tooling's initial `fill` operation; native keyboard segment entry produced a valid date and the local booking completed. The initial native unsaved-link confirmation interrupted the browser tool; ordinary link protection was replaced with the shared accessible dialog. The final accessible dialog passed the Keep editing and Leave form checks above.

## Responsive checks

Measured document width against viewport width on `/mobiles`, `/account/listings` and `/staff/reports` at 320, 390, 768, 1024 and 1440 pixels (height 900).

Initial measurements exposed account/staff overflow at the three narrow widths. Fixed the workspace navigation grid item's minimum width. Repeated all 15 route/width combinations: none had horizontal document overflow. Inspected screenshots of the original overflow, the repaired 320-pixel report workspace and the mobile draft gallery. Measurements establish these representative pages only, not every route or browser.

## Limits

No screen-reader certification, WCAG conformance claim, cross-browser suite, 200% zoom sweep, load test, Web Vitals/bundle-budget measurement or exhaustive route/viewport matrix was performed. Corrupt-image fallback and all photo type/size rejection paths were reviewed in source but not exhaustively exercised through the browser.

Native document-unload prompts depend on browser activation/policy. History navigation within the App Router is not intercepted. Browser storage is not transactional and cannot provide cross-client booking locks or authoritative revisions. Staff proposals, report lineage and approval states are explicitly illustrative or unavailable.

No backend authentication, database, secure upload pipeline, real moderation, appointment reservation, financial record, report issuance, private evidence access or delivery was tested. These remain future NestJS service integration boundaries. Original v2 specifications are preserved.
