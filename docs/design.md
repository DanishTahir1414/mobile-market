# Frontend Design Specification

## Visual direction

Minimal monochrome interface based on the reviewed desktop/mobile mockup. “Mobile Market” is temporary branding. No blue or purple accents. Use black for primary actions, light surfaces and neutral borders. Do not gray out real product photography by CSS: image color is device information. No gradients, animated backgrounds or heavy illustrations.

```css
:root {
  --canvas: #fafafa;
  --surface: #ffffff;
  --surface-muted: #f2f2f2;
  --text: #171717;
  --text-muted: #595959;
  --border: #d4d4d4;
  --action: #111111;
  --action-text: #ffffff;
  --focus: #111111;
  --radius-control: 8px;
  --radius-card: 12px;
}
```

Status is conveyed through icon, label and structure, never color alone. “Shop inspected”, “Inspection expired”, “Inspection unavailable” and “Not inspected” have distinct text. Use outlined warnings and error icons with plain explanations in the same palette.

## Typography and spacing

Use a self-hosted system-compatible sans font, at most two weights (400/600) plus bold 700 if necessary. Body 16px, helper 14px, card title 16px/600, page heading 28–40px desktop and 26–30px mobile. Spacing scale 4/8/12/16/24/32/48. Max content width 1280px; desktop gutter 32px, mobile 16px. Controls ≥44px high. Links underline on focus/hover; retain visible black focus outline with offset.

## Responsive structure

| Width | Navigation | Browse grid | Filters |
|---|---|---|---|
| 360–639px | Compact header, bottom navigation | Two cards if each can remain readable; one column on very narrow/zoomed layouts | Full-height sheet with Apply/Clear |
| 640–1023px | Header plus compact actions | Two/three columns | Collapsible drawer |
| ≥1024px | Full navigation and Sell button | Three columns beside sidebar | 240px sidebar |

No horizontal page overflow at 320px or 200% zoom. Sticky contact actions and bottom navigation respect safe-area insets. Do not overlap the report/consent text. Long brand names and prices wrap without clipping.

## Page design requirements

| Page | Main components | Important states |
|---|---|---|
| Home | Search, city, brand chips, recent/inspected lists, shop inspection explanation | Loading, empty inventory, service outage |
| Browse | Filter sidebar/sheet, count, sort, grid, pagination | URL-restored filters, no results, unavailable inspection state |
| Listing | Gallery, price/specs, seller claims, dated findings, defects, Call/WhatsApp | Current/expired/revoked report, sold, processing assets |
| Sell/edit | Four-step draft, photos, claims, contact consent, preview | Saved, invalid, upload progress, processing/retry, material edit warning |
| Signup/login | Explicit labels, password show/hide, validation, recovery | Email verification pending, generic credential error, throttled |
| Admin login | Staff email/password and MFA; admin portal heading | Not invited, MFA required, generic login failure |
| Employee login | Same secure staff realm with employee/inspector heading | Assigned rights determine destination; no public signup |
| MFA/setup | TOTP setup, confirmation and recovery codes | Never show secrets again after setup; explain safe storage |
| User dashboard | Own ad status, appointments, notifications, security | Empty, pending review, no-show, revoked session |
| Staff overview | Queue counts, assigned tasks and dependency health | No permission, overdue tasks, services unavailable |
| Inspection bench | Device matching, grouped checklist, measurements/evidence | Unsaved changes, conflicts, required checks incomplete |
| Approval/report | Exact revision, defects, acknowledgement, fee and decision | Cannot approve own report; changed revision invalidates ack |
| Audit/settings | Searchable actions and scoped configuration | Confirm sensitive change, step-up authentication |

## Components and behavior

- Cards: image ratio 4:3 with object-fit contain, heart only for registered favorites, brand/model/storage, condition, PKR price, city, seller type and current report indicator. Avoid seller phone in card HTML.
- Forms: persistent labels, inline field errors plus error summary, keyboard focus to first error, preserved nonsecret values. Never persist passwords/OTP in drafts or analytics.
- Photo upload: slots show uploading → processing → ready/failed. Reorder/remove; original image never becomes public before processing and moderation. Show Retry only for recoverable failures.
- Filters: state encoded in URL, Apply avoids repeated mobile requests, Clear resets all. Preserve navigation/back position and query cancelation.
- Contact: explicit seller consent, bot/rate check, backend current-status verification; recognizable WhatsApp text and call icon in black.
- Reports: observed and seller-declared sections separated. Dates formatted in local shop timezone. Defects are visible without expanding a hidden panel.
- Staff checklists: not_tested requires reason on mandatory functional checks; missing identity match blocks submission. Save draft after debounced changes, conflict resolution explicit.
- Destructive actions: focused confirmation for revoke/suspend/mark sold; reason field for staff. Prevent double submissions but also rely on API idempotency.
- Error screen: clear action and support reference ID; no exception details. Password reset response remains generic.

## Accessibility and lightweight frontend

Target WCAG 2.2 AA behavior: contrast validation, keyboard flows, screen-reader labels/live announcements, focus restoration and reduced motion. Never use icon-only status. Optimize images with srcset/sizes using precomputed WebP; reserve dimensions to avoid layout shift. Load only first visible images eagerly; others lazy. Dynamic-load staff charts/gallery code. Use inline SVG icons, no full icon-font library. Charts are P1 and must have a text/table equivalent.

## Cache and live status UI

Public base listing content may be cached briefly. Render no affirmative badge in cached shells; hydrate from current composed status. Inspected-only filters require fresh eligibility before return. Report page and contact action are no-store. On page focus and each 30 seconds while active, refresh relevant status. Display “Inspection unavailable” if the authoritative lookup times out. This design avoids a false current badge while accepting temporary reduced availability.

## Definition of design completion

Responsive layouts for public, auth, user and staff pages; component states; tested keyboard/zoom; no blue/purple; sample data labeled; documented spacing/tokens. The earlier generated image is a visual concept, not a source of phone specifications, real prices or factual seller data.
