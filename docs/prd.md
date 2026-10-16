# Product Requirements Document

Version 2.0 · Scope: one existing shop, physical inspection, direct seller contact.

## Product objective

Make buying and selling used phones easier while giving buyers transparent, current physical inspection findings from the shop. The platform measures listing/contact activity and seller-reported sales. It cannot observe off-platform payment or establish that an inspection caused a sale.

## Personas and permission boundaries

| Persona | Capabilities | Restrictions |
|---|---|---|
| Visitor | Browse/search, view public report, contact through abuse-controlled endpoint | No posting or private evidence |
| User buyer/seller | Own profile, ads, favorites, appointments and findings acknowledgement | Cannot edit others' ads or issue inspection badges |
| Inspector | Assigned appointment check-in, device matching, checklist and evidence drafts | Cannot publish reports, inspect own device or access all users' private data |
| Employee moderator | Ad/abuse review when permission granted | No inspection or staff management rights by default |
| Admin | Ad moderation, report approval/revocation, slots, catalog | Staff access limited to explicit grants; own report approval prohibited |
| Owner | Admin capabilities, staff grants, configuration and recovery governance | Actions audited; no bypass of report prerequisites |

Buyer and seller use the same public account. Employee and inspector roles are assigned as individual permissions, not inferred from login URL. One person may have separate public and staff identities. Last active owner cannot be disabled.

## Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | User signup with email/password, email verification, login, logout, reset and session management | P0 |
| FR-02 | Invite-only staff activation, separate admin/employee login, MFA and revocation | P0 |
| FR-03 | Browse published ads with brand/model/city/price/storage/condition/PTA-claim filters and pagination | P0 |
| FR-04 | Own-device draft, upload 3–8 approved photos, preview and submit; verified phone and contact consent | P0 |
| FR-05 | Admin ad moderation, reasons, revisions, sold/withdrawn/expiry/suspension | P0 |
| FR-06 | Abuse-controlled direct phone/WhatsApp contact; no checkout | P0 |
| FR-07 | Physical inspection slot booking, assignment, cancellation, no-show and manual fee recording | P0 |
| FR-08 | Versioned checklist, private identifiers, findings, seller acknowledgement and distinct approver | P0 |
| FR-09 | Current dated badge, live report, revocation, expiry and revision mismatch behavior | P0 |
| FR-10 | Automatic secure WebP processing, progress/retry UI and deletion lifecycle | P0 |
| FR-11 | Report abuse, in-app notifications, audited privileged actions and shop configuration | P0 |
| FR-12 | Favorites and a seller activity summary | P1 |
| FR-13 | PWA installability, inspection PDF export, promotions and payment integrations | Later |

## Pages

| Public | Account | Staff |
|---|---|---|
| Home `/` | Signup `/signup` | Admin login `/admin/login` |
| Browse `/mobiles` | User login `/login` | Employee/inspector login `/employee/login` |
| Listing `/mobiles/:slug` | Verify email, forgot/reset password | Staff activation `/staff/activate` |
| Report `/inspections/:code` | My listings, draft/edit and Sell | MFA setup/challenge and recovery |
| How inspection works | My appointments and acknowledgement | Moderation and abuse queues |
| Shop, contact and help | Favorites and notifications | Appointments and inspection bench |
| Terms, privacy and inspection policy | Profile, phone verification, sessions/security | Report approval/revocation, staff, catalog/settings and audit |

## Key user flows

1. **Signup:** name/email/password → accept terms → verify email → account active → verify phone before posting. Browsing/contact need no account.
2. **Posting:** verified seller → draft fields → direct photo uploads → WebP processing → review ready previews → contact consent → submit → moderation → published or rejected with reason.
3. **Inspection:** published ad → review fee/terms → choose slot → confirm booking → visit shop → device match → checks → findings → acknowledge exact report revision → independent approval → report published.
4. **Contact:** filters → listing → inspect seller claims and shop findings → challenge if required → Call/WhatsApp → external negotiation. Button action is not a completed sale.
5. **Staff onboarding:** owner sends invitation through application workflow → staff sets password → verifies email → enrolls MFA → permitted dashboard. An admin signup endpoint does not exist.
6. **Material edit:** change device details/photos/defects → increment device_revision → suspend badge eligibility immediately → moderation → new physical inspection required for a current badge.
7. **Sold:** seller confirms sold → search/contact disabled → limited notice. Renewing an expired ad does not renew an inspection.

## Listing lifecycle

`draft → pending_review → published` or `rejected → draft`. Published may become pending_review, sold, expired, suspended or withdrawn. Suspended returns through review. Sold and withdrawn are terminal; create a new listing for another sale. Price-only edits stay published after validation. Contact preference edits require verified contact ownership. Text changing condition/repair claims counts as a material edit.

Report draft stages are editable; published reports are immutable. Corrections create a replacement and revoke the previous report. A report status can be published while its time-based eligibility has expired. A badge is derived, never set by the seller.

## Inspection policy

Record pass/fail/not_tested/not_applicable per check, with notes and observations. Required device identity checks must succeed; required functional tests must have recorded outcomes. A disclosed functional failure does not imply identity failure and may still allow a report. Unknown PTA/battery fields remain unknown. Seller declaration and shop observation stay separate.

Checks cover identity, screen/touch/body, battery/charging, audio/cameras/buttons/ports/sensors, network/Wi-Fi/Bluetooth, applicable biometrics, observed account locks, repair clues, defects and per-IMEI PTA observation with method/time. Full identifiers and private evidence never appear in public responses. Inspection is not legal ownership verification.

Proposed defaults: listings last 30 days, inspection eligibility lasts 14 days, fee configurable in PKR. Inspection fee settlement/waiver is required for issuance when charged. Reinspection/refund/cancellation rules are owner-defined and visible before booking.

## Release acceptance

| ID | Passing evidence |
|---|---|
| AT-01 | Signup/verify/login/reset/logout flows work; passwords absent from DB plaintext and logs |
| AT-02 | Public signup cannot create staff; MFA and permissions enforced regardless of login page |
| AT-03 | User cannot edit another ad, retrieve private evidence or spoof fee/badge fields |
| AT-04 | Two bookings for one slot result in one reservation; retries reuse the same result |
| AT-05 | Unsafe image rejected; valid photo becomes WebP variants; incomplete processing blocks submission |
| AT-06 | Uninspected approved ads publish; defects and unknown checks display accurately |
| AT-07 | Revocation, expiry, material edit or unpublished status removes current badge on the next fresh read |
| AT-08 | Inspection dependency outage produces “Inspection unavailable”, not a stale verified badge |
| AT-09 | Sold/suspended/expired ads cannot disclose contact through UI/API |
| AT-10 | Report approval needs exact seller acknowledgement, distinct approver, matching revision and fee gate |
| AT-11 | One trace/request ID connects browser error, gateway, service and worker investigation |
| AT-12 | Restore, role removal, broker outage and failed image job procedures successfully rehearsed |

No system can retract a phone number or photo already copied by a visitor. No browser already displaying an old page can be guaranteed to update instantly. Refresh and action-time checks must return current status; focus refresh and 30-second active-page status polling reduce stale display.

## MVP and measurements

P0 includes four services, secure auth, classifieds, inspection, media processing, staff tools, observability and operating runbooks. P1 adds favorites/activity when core is stable. Exclude native app, multi-vendor marketplace, checkout, escrow, delivery, live chat, auctions and warranty product.

Measure form completion, moderation latency, eligible contact actions/visits, booking/no-show rates, inspection turnaround, seller-reported sell-through and abuse rates. Segment inspected/uninspected comparisons by model, price and ad age. Pilot suggestion: 20–30 ads and ten physical inspections after release gates pass.
