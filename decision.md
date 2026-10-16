# Frontend implementation decisions

Status: implemented frontend scope. Date: 17 October 2026, Asia/Karachi.

## 1. Follow the latest frontend-only instruction

The original brief requested a complete distributed application. The owner subsequently asked for only the frontend, readable reusable code, decision documentation and GitHub storage. That instruction defines this delivery.

Backend work started during initial exploration was removed before delivery. The v2 specification documents remain intact as the future baseline. Backend services, production authentication, real inspection workflows and infrastructure are not silently represented as completed.

**Consequence:** This repository can run without credentials, but cannot operate a real marketplace. Future backend work must implement the v2 security and service boundaries.

## 2. Next.js App Router and TypeScript

Chosen instead of a single HTML mockup or an untyped React SPA because the requested site has public details, account/staff sections and many shared layouts. Next.js supports route metadata, server rendering, image optimization and a gradual transition to server-backed data. TypeScript makes listing models and component contracts explicit.

Exact installed versions are pinned in `package.json`; `package-lock.json` is committed. Next.js 16.4.2 and React 19.3.1 were obtained from the registry during implementation. Official framework installation and upgrade guidance was checked before selecting the Node-compatible stack.

**Tradeoff:** Requires Node.js for local rendering and production builds rather than opening one HTML file. No deployment platform is imposed.

## 3. Reusable primitives, feature-oriented modules

`components/ui` owns controls, fields, dialogs, headings and empty states. `components/listings` owns product-specific components. Feature modules own page behavior. Route files stay small and compose those features.

Chosen instead of duplicating a complete form or listing card per page. Public and staff authentication share a presentation component while keeping distinct copy and modes. Account and staff workspaces share a layout component with separate navigation definitions.

**Consequence:** Visual changes to a button, field or card propagate consistently. Feature files can be split further as actual backend workflows grow; do not abstract unrelated business actions into a generic “do everything” component.

## 4. Explicit demo boundary, no fake backend success

The sample data is isolated in `lib/demo-data.ts`. Listing prices and claims are fictional. Authentication, messaging, payment recording, report issuance, moderation and permission updates do not return simulated production success.

Forms either validate locally and explain that nothing was sent, or keep the action unavailable. Phone/WhatsApp controls explain why sample sellers cannot be contacted.

Chosen instead of fake asynchronous endpoints or role switches that appear to grant privileges.

**Migration:** Introduce a typed API adapter and map backend responses to UI models. Keep authoritative authorization and inspection eligibility on the server. Do not promote browser demo state to production authority.

## 5. Browser persistence only for non-sensitive demo state

Favorites, listing drafts and demo bookings use a small external store with React `useSyncExternalStore`. This avoids hydration mismatches and effect-driven copies of external state. Zod validates stored data; browser storage events synchronize tabs. Failed storage access falls back to current-tab memory.

Chosen instead of a large state library because the frontend has one small, bounded local state model. Passwords, phone ownership codes, session tokens and device identifiers never enter this store.

**Limitations:** Local bookings are not real reservations. Cross-tab synchronization is not transactional locking. Photo previews are temporary object URLs and are released on removal/unmount.

## 6. URL-based marketplace filters

Search, brand, city, price, condition, PTA, storage, inspection and ordering use query parameters. The pure filtering function is separate from React.

Chosen instead of hidden component-only filter state because links can be copied, refreshed and revisited with browser Back. Pagination is available when a result set exceeds the page size.

**Tradeoff:** Desktop filters apply immediately; the mobile dialog keeps pending choices until Apply. Four items per sample page make pagination inspectable. A real catalog needs server pagination and authoritative eligibility.

## 7. Monochrome interface and system typography

The supplied ZIP contained the 12 Markdown specifications but no separate mockup asset. The design document therefore provides the visual baseline: restrained borders, white/off-white surfaces, black buttons and generous spacing. Actual photographs retain color.

System fonts avoid a runtime font provider dependency. Lucide supplies tree-shakeable SVG icons instead of a full icon font. CSS tokens and shared classes define common spacing, controls and responsive behavior.

**Tradeoff:** System typography varies slightly across platforms. Replace branding and typography centrally after owner review.

## 8. Native dialogs and standard semantic controls

The reusable dialog uses the browser `dialog` element for focus containment and Escape support. Inputs and labels share generated IDs; errors and hints are connected with ARIA. Forms use native constraints plus domain-specific validation. Reduced-motion preferences and visible focus states are included.

Chosen instead of implementing custom focus traps and bespoke pseudo-selects, which add code and accessibility failure modes.

**Limit:** These implementation choices are not a WCAG certification. Manual keyboard, zoom, screen-reader and mobile visual checks remain required.

## 9. Policies and shop details remain owner-review drafts

No address, staff identity, phone number or final fee was invented. Terms, privacy and inspection text are labeled drafts. The shop settings screen previews editable fields without falsely saving or publishing them.

**Migration:** Load versioned owner-approved content from the future Marketplace service. Preserve draft/published policy states and backend configuration permissions.

## 10. Verification evidence over assumptions

Type checks, lint, domain-focused frontend tests and production build are executable project scripts. A GitHub Actions workflow repeats the checks.

The supported browser-control capability was unavailable in this environment. Browser screenshots, full route navigation, viewport overflow checks and end-to-end flows were therefore not claimed as passed. See the verification report for exact results.

Official references: https://nextjs.org/docs/app/getting-started/installation, https://nextjs.org/docs/app/guides/upgrading/version-16, https://react.dev/reference/react/useSyncExternalStore.

## 11. Local workflow scenarios retain the existing demo boundary

Lifecycle transitions reuse the browser draft store and typed pure transition rules; inspection and staff scenarios remain page-local presentations. A saved preview is read-only and never creates or overwrites a draft. Material published edits return to review after confirmation; price-only edits retain their listing state. Storage writes report persistent versus current-tab-only results.

Chosen over fake API routes or a second state library. These scenarios demonstrate controls without implying real moderation, authorization or report issuance. All consequential local transitions identify themselves as demo actions.

Migration: replace store mutations with typed, authorized service adapters and expected revision checks. Keep the pure transition, validation and acknowledgement tests as UI regression coverage, while duplicating authoritative enforcement in the owning services. Real report approval and bookings require transactional backend checks. No backend architecture change is made.
