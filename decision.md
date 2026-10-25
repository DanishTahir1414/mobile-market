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

**Tradeoff:** The small six-phone demo applies filters immediately. A large real catalog should debounce text/range input or use an explicit Apply flow and server pagination.

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

## 11. Staff-owned site pictures, separate from listing photos

Shop-level pictures (homepage hero, shop photo) are defined as named slots in `lib/site-media.ts` and rendered through `resolveSiteMedia`. Pages never hard-code those images. Staff manage them on `/staff/media`; sellers and buyers can only add photos to their own listings, which use a different component and a moderation path.

The frontend validates file type, size, dimensions and shape and refuses unsafe sources (`javascript:`, `data:`, protocol-relative URLs). It does not upload or publish: that needs the Media service, with server-side staff permission checks and WebP processing. Until then the slot defaults live in the repository.

**Migration:** replace `getSiteMedia()` with a Media-service adapter that returns the same `SiteMediaMap`, and have the upload button call a staff-only endpoint. Optional slots with no picture show the existing placeholder rather than an invented image.

## 12. Scroll speed over 3D effects

The site favors fast scrolling on low-end phones, so no 3D, smooth-scroll or animation library was added. Gallery swiping uses native CSS scroll-snap, only the first photo loads eagerly, and below-the-fold sections use `content-visibility: auto` so the browser skips off-screen layout and paint. The 3D starter kit was reviewed; its accessibility, reduced-motion and phone-testing rules were kept, its WebGL techniques were not.

**Tradeoff:** The homepage is less cinematic. Measure real devices before adding any motion.

## 13. Seller lifecycle, and verification kept separate

Sellers move an ad through draft, waiting for review, live, needs changes, sold and withdrawn using the pure rules in `lib/listing-lifecycle.ts`. Sellers can submit, resubmit, withdraw, mark sold and reopen; they can never publish or approve. Approval and rejection are staff decisions the server must make. Live ads are not edited in place; withdrawing first keeps half-finished changes away from buyers.

Shop verification is a separate, optional choice. The shop only verifies the device; the seller decides whether to ask for it, and a Shop inspected badge never changes a listing's status or blocks selling. The account page offers it as a link, not a requirement.

Statuses are stored in this browser only. Every message says nothing was sent to the shop, so submitting does not pretend a review is happening. Only draft and waiting-for-review can occur locally; live, needs changes, sold and withdrawn come from the future backend, and the screens already handle them.

**Tradeoff:** "Rejected" shows no reason yet. Add the reviewer note when the Marketplace service exists.

## 14. Optional inspection progress, larger sample catalog, staff queue prompts

Sellers see inspection progress as five read-only stages: booked, arrived, being inspected, report under review, badge awarded. Only staff move a stage, and the server must enforce that; the local demo is always at "booked". A cancelled visit shows no timeline.

The sample catalog grew from 6 to 24 fictional phones so filters and pagination can be exercised. Only Apple, Samsung and Google are generated because only those have local illustrative photos; photos are shared across listings and labelled illustrative. The first six hand-built phones are kept as a fixed fixture for the original filter tests.

Moderation flags (price far from same-model peers, unknown PTA, no iPhone battery, Fair condition with no defects) are prompts for a human, never decisions. Price is only compared when at least three same-model, same-storage ads exist. Approve stays disabled until the reviewer ticks three checks. Appointments are grouped by Karachi day, not by the viewer's time zone.

**Correction:** the browse page already had a mobile filter sheet. It now adds active-filter chips, a count on the button, Escape to close, scroll lock and no history entry per typed digit.

## 15. Pastel and glass look replaces the monochrome direction; full-screen photo viewer

The owner asked for a more modern look with soft colour, so the earlier "monochrome, no gradients, no blue or purple" direction is superseded. The palette is a violet accent with mint, peach, sky and rose pastels over a soft background, and white glass surfaces. Phone photos still keep their original colours. Warm greys in the older CSS were retinted to cool lavender greys, and a theme layer at the end of `globals.css` holds the new tokens.

Blur is used only on small surfaces (header, floating cards, gallery controls, photo viewer) because blur on every card slows scrolling on low-end phones. Reduced-transparency and reduced-motion settings fall back to solid, still surfaces.

Clicking or tapping a listing photo opens a full-screen viewer that shows only the photo, fitted without cropping, with arrows, keyboard, swipe, Escape and a close button. A mouse also gets a hover zoom on the photo. The earlier version put the photo in a generic dialog, which cropped it and added scroll bars.

**Tradeoff:** The earlier design documents still describe the monochrome look; this decision takes precedence.

## 16. Vendor logo, amber palette with no blue or purple, floating navbar, CSS preloader

The shop's logo (Jugnu GSM) replaces the phone icon in the header, the browser tab icon and the loading screen. It is a staff-managed site picture slot (`brand-logo`), so staff can replace it later without a code change.

The palette now comes from the logo: amber and golden yellow accents on a warm cream background, dark brown ink for text, and peach and mint pastels. Blue, purple and lavender shades are not used anywhere, and the website itself is light, not black. This replaces the violet accent from decision 15.

The navbar floats: rounded, inset from the page edges, frosted glass, and sticky.

The loading screen is pure CSS (logo, drifting fireflies for "jugnu", a thin progress bar) and fades out by itself after about a second, so it cannot hang and needs no JavaScript. It is decorative only (aria-hidden). The 3D starter kit's rule to wait for a scene does not apply because this site has no 3D scene. It shows on a full page load, not on in-app navigation.

**Open:** the reference loading screen on the artivistaa site was not available to me, so the animation follows the logo and the kit's rules only.

## 17. 3D hero, copy and wording cleanup, browser tests

The homepage hero is a sticky stage: scrolling through it turns a gold phone, built from basic shapes with the shop logo on its screen, once around. The server renders the copy and the static photo first, so the first paint is fast. The 3D scene loads afterwards and only on capable devices; reduced-motion, data-saver and low-power devices keep the photo. It draws only when scrolled (demand rendering), so it uses no power at rest. `?hero=3d` and `?hero=off` force either mode for testing.

Homepage copy was cut to the essentials, and all demo, sample and fictional wording was removed from the interface. Surfaces that were dark are amber with dark text, so no text is white on yellow. Low-contrast grey text was darkened for accessibility.

`npm run test:e2e` runs a headless-browser check of page loads, sideways scrolling, the loading screen, the 3D turn, the photo viewer and accessibility (critical problems fail the run). It refuses to start if its port is already in use, because a leftover server serves an old build.
