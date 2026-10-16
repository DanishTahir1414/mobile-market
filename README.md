# Mobile Market frontend

A responsive Next.js and TypeScript frontend for a single-shop mobile phone classified marketplace. White and off-white surfaces, charcoal controls and original-color phone photography follow the supplied v2 specification.

**Current scope is frontend only**, following the owner's updated instruction. The existing `docs/` specifications describe the future full platform and remain unchanged. This repository does not currently provide authentication, a backend, real phone inventory or a production marketplace.

## Run locally

Use Node.js 22.12 or newer. The implementation was checked with Node.js 24.19.0.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables, accounts or paid credentials are needed. Do not enter real credentials or private device identifiers into demo forms.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

## Explore

- `/`: homepage with search, brands, sample phones and inspection information.
- `/mobiles`: URL-driven search, filters, sort and reusable listing cards.
- `/mobiles/iphone-15-pro`: shared photo gallery, full-screen keyboard navigation and separate seller/shop sections.
- `/sell`: four-step form, local draft saving, temporary photo previews and review.
- `/account`: local dashboard, listings, appointments, favorites and security screens.
- `/staff`: sample moderation, inspection bench, report review and management screens.
- `/login`, `/signup`, `/admin/login`, `/employee/login`: clearly labeled frontend authentication previews.

See [route inventory](docs/frontend-routes.md) for the full list.

## Code organization

```text
src/app/                    Route composition, metadata and error boundaries
src/components/ui/          Buttons, fields, dialogs and other shared primitives
src/components/layout/      Public and workspace navigation
src/components/listings/    Reusable cards, favorites and inspection labels
src/features/marketplace/   Browse, details, seller form and information pages
src/features/account/       Local account workspace
src/features/auth/          Shared public/staff authentication form presentations
src/features/staff/         Staff workspace presentations
src/lib/                    Types, catalog, demo data, storage, validation and filters
public/images/              Locally served illustrative phone photographs
```

Shared components use typed props. Stateful interactions are client components; route files compose feature components. Pure filtering and validation functions are tested independently. Comments explain intent, trust boundaries and lifecycle behavior rather than restating JSX.

## What works locally

- Search by model, filters, sorting, bounded pagination and shareable query parameters. Mobile filters apply only on Apply.
- Favorite toggling and browser persistence.
- Creating, saving, editing, dedicated read-only preview and deleting local listing drafts.
- Explicit local lifecycle scenarios: review, rejection/resubmission, sold/withdrawn, expiry/renewal and suspension. No real listing changes.
- Booking detail timeline, exact-revision acknowledgement demonstration and staff action forms.
- Brand → model → storage dependent choices and form validation.
- Temporary photo selection, ordering and removal. Files are **not uploaded**, processed or persisted.
- Local demo appointment creation, duplicate-slot detection in the current browser state, and cancellation. This does **not** reserve a real shop slot or provide cross-client concurrency control.
- Expandable help answers, mobile navigation, native dialogs and form previews.

## Integration boundary

Frontend form validation is not authorization. Auth forms send no credentials; local drafts are not published; sample staff screens do not grant permissions. Sensitive or unsupported actions show a clear explanation or disabled control.

Replace the isolated demo catalog/data/store with an API adapter when implementing the documented services. Preserve UI models and shared components. Real badges require fresh authoritative inspection checks, contact requires current seller consent, and private evidence requires server authorization.

Local storage contains only demo favorites, listing drafts and appointments. Data is validated before use. Clearing browser site data removes it. If storage is blocked or full, the current tab falls back to in-memory state. Never use this store for tokens, passwords, OTPs or private identifiers.

## Documentation

- [decision.md](decision.md): choices, alternatives and consequences.
- [Frontend routes](docs/frontend-routes.md): route and interaction inventory.
- [Component guide](docs/frontend-components.md): reuse conventions and extension points.
- [Verification report](docs/frontend-verification.md): checks run and verification limits.
- [Asset credits](docs/frontend-assets.md): illustrative photograph sources.

No public website deployment was performed. The owner must review shop identity, legal drafts, fees and policies before any real launch.

## Completion audit

See [completion checklist](docs/frontend-completion-checklist.md), [self-review](docs/frontend-review.md) and [verification evidence](docs/frontend-verification.md). Production authorization, media processing, persistent moderation, report issuance and live eligibility remain backend integration work. Unsaved-change protection covers document unload and ordinary links; browser history navigation within the App Router is not intercepted.
