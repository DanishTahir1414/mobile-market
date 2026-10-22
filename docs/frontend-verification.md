# Frontend verification report

Date: 17 October 2026, Asia/Karachi. Scope: frontend only.

## Checks executed

| Command             | Actual result                                                                     |
| ------------------- | --------------------------------------------------------------------------------- |
| `npm run typecheck` | Passed after fixing a seller-form JSX syntax error                                |
| `npm run lint`      | Passed after replacing effect-based storage hydration with `useSyncExternalStore` |
| `npm test`          | 9 tests passed, 0 failed                                                          |
| `npm run build`     | Passed; Next.js generated 26 static pages and the dynamic route handlers          |

The initial `tsx --test` launcher could not create its IPC socket in this environment (`EPERM`). The test script was changed to `node --import tsx --test`, which actually ran and passed all tests. No test was marked passed based on the failed launcher.

## Automated test coverage

- Combined brand, PTA and budget filtering.
- Exclusion of expired inspections from inspected-only demo results.
- Case-insensitive trimmed search.
- Numeric price ordering without mutating the sample data.
- Exclusion of sold/withdrawn listings from browse results.
- Empty result behavior.
- Positive bounded price and contact-consent validation.
- Battery percentage bounds.
- PKR formatting and Asia/Karachi time conversion.

## Update 22 October 2026 (site pictures, gallery, scroll CSS)

`typecheck`, `lint`, `format:check`, 14 tests and `build` passed. A production server returned 200 for `/`, `/shop`, `/staff/media` and listing detail pages, and the HTML contained the managed hero, the staff notice and the three-photo gallery controls. No browser was available, so swipe, zoom, layout and real scroll speed are unverified.

## Update 22 October 2026 (seller lifecycle)

`typecheck`, `lint`, 17 tests and `build` passed. Lifecycle rules are unit-tested, including that sellers can never publish. HTTP checks confirmed the listings page renders every status tab. Clicking through submit, withdraw, mark sold and reopen was not done: no browser was available.

## Verification limits

The supported browser-control skill was unavailable in the managed environment. No desktop/mobile screenshot review, interactive end-to-end flow, keyboard walkthrough, screen-reader test or automated overflow measurement was performed. Responsive CSS and semantic controls are implemented, but visual/accessibility acceptance remains unverified.

Production build checks compilation, types and static prerendering. It does not prove that every dynamic route or browser interaction works. Browser-local photo preview, persistence, dialogs and booking interaction still need browser QA.

No backend, database, authentication, upload worker, external delivery or production deployment was tested or claimed. They are outside the updated frontend-only scope.

No load, Web Vitals, bundle-budget or WCAG conformance result is claimed.

## Owner review before real use

- Replace illustrative inventory/photos with authorized seller content.
- Supply real shop details, fees, hours and approved policies.
- Implement the documented backend and security controls.
- Run route, viewport, keyboard and accessibility checks.
- Verify contact, media and inspection eligibility against authoritative services.

The existing v2 specifications remain the baseline for that future implementation.

## Update 22 October 2026 (inspection timeline, catalog, staff queue)

`typecheck`, `lint`, 22 tests and `build` (44 pages) passed. A production server returned 200 for browse with filters, moderation queue and detail, appointments, account inspections and a new listing page. Touch behavior of the filter sheet, the timeline layout and real device scroll speed are unverified: no browser was available.

## Update 23 October 2026 (theme and photo viewer)

`typecheck`, `lint`, 22 tests and `build` passed. Screenshots from a headless browser (no GPU) confirmed the full-screen viewer fits the photo on a 1280 px and a 390 px screen, and that the home, browse, listing and staff pages render with the new theme. Real-phone touch swipe, hover zoom feel and scroll speed are still unverified.
