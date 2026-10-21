# Frontend route and interaction inventory

Status: implemented presentations, with real browser-local behavior where listed. Backend-dependent actions are explicitly unavailable or validation-only. These are not production acceptance results.

| Area           | Route                                                                                | Behavior                                                                              |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Public         | `/`                                                                                  | Search, brand links, recent inventory and inspection explanation                      |
| Public         | `/mobiles`                                                                           | Query parameters, filters, sorting, empty results and paginated grid                  |
| Public         | `/mobiles/:id`                                                                       | Sample device details, save, copy link, contact explanation and report preview        |
| Public         | `/inspections/demo-:id`                                                              | Sample findings, limitations and separate seller claims                               |
| Public         | `/how-inspection-works`                                                              | Inspection scope and workflow                                                         |
| Public         | `/shop`                                                                              | Unconfigured address/hours, no invented map location                                  |
| Public         | `/contact`                                                                           | Local form validation; no message sent                                                |
| Public         | `/help`                                                                              | Expandable buying/selling guide                                                       |
| Public         | `/terms`, `/privacy`, `/inspection-policy`                                           | Owner-review draft policies                                                           |
| Authentication | `/signup`, `/login`                                                                  | Form validation and password visibility; no account/session created                   |
| Authentication | `/verify-email`, `/forgot-password`, `/reset-password`, `/verify-phone`              | Token/recovery/phone form presentations; no messages sent                             |
| Authentication | `/admin/login`, `/employee/login`                                                    | Separate staff copy; no URL-based permissions                                         |
| Authentication | `/staff/activate`, `/staff/mfa/setup`, `/staff/mfa/challenge`, `/staff/mfa/recovery` | Invitation, MFA and recovery presentations; no dummy secrets                          |
| Seller         | `/sell`                                                                              | Four-step draft, dependent catalog choices, validation and temporary photo previews   |
| Seller         | `/account/listings/:id/edit`                                                         | Continue local draft and review step                                                  |
| Account        | `/account`                                                                           | Local draft/favorite/appointment summary                                              |
| Account        | `/account/listings`                                                                  | Status tabs, draft edit and confirmed deletion                                        |
| Account        | `/account/inspections`, `/account/inspections/book`                                  | Local demo booking and cancellation, Karachi display time                             |
| Account        | `/account/inspections/acknowledge`                                                   | Exact-revision concept, sample acknowledgement preview                                |
| Account        | `/account/favorites`                                                                 | Saved sample phone grid                                                               |
| Account        | `/account/notifications`                                                             | Honest empty state                                                                    |
| Account        | `/account/profile`                                                                   | Form validation only; no personal profile persisted                                   |
| Account        | `/account/security`, `/account/sessions`                                             | Account protection information and disconnected session state                         |
| Staff          | `/staff`                                                                             | Sample task overview and navigation                                                   |
| Staff          | `/staff/moderation`, `/staff/moderation/:id`                                         | Sample queue, seller details and decision form preview                                |
| Staff          | `/staff/abuse`                                                                       | Disconnected report queue state                                                       |
| Staff          | `/staff/appointments`                                                                | Locally created demo appointment list                                                 |
| Staff          | `/staff/inspections`, `/staff/inspections/demo`                                      | Grouped checklist with pass/fail/not-tested/not-applicable and required reasons       |
| Staff          | `/staff/reports`                                                                     | Approval gates, immutable report explanation, correction/revocation preview           |
| Staff          | `/staff/fees`                                                                        | Manual fee entry validation only                                                      |
| Staff          | `/staff/team`                                                                        | Invitation/grants presentation; sending unavailable                                   |
| Staff          | `/staff/catalog`                                                                     | Filterable read-only brand/model/storage catalog                                      |
| Staff          | `/staff/media`                                                                       | Staff-only shop pictures (hero, shop photo): size/shape checks and preview, no upload |
| Staff          | `/staff/settings`                                                                    | Shop branding, configuration and policy form previews                                 |
| Staff          | `/staff/audit`                                                                       | Disconnected audit source state                                                       |
| Shared         | Unknown routes                                                                       | 404 page                                                                              |
| Shared         | Route loading/errors                                                                 | Loading skeleton, retry boundary, safe fallback navigation                            |

## Remaining backend integration checklist

- [ ] Real authentication, sessions, verification and permission-driven navigation.
- [ ] Listing upload/processing, publication, moderation and lifecycle endpoints.
- [ ] Current inspection composition, private evidence and report lineage.
- [ ] Atomic booking, staff assignment, attendance and real fee recording.
- [ ] Notifications, audit queries, profile and policy persistence.
- [ ] Server-backed search, pagination and live contact actions.

These items are outside the updated frontend-only scope and remain future work.
