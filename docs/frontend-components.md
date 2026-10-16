# Frontend component and maintenance guide

## Reuse boundaries

| Component/module                       | Responsibility                                     | Keep out                                  |
| -------------------------------------- | -------------------------------------------------- | ----------------------------------------- |
| `Button`, `ButtonLink`                 | Action and navigation appearance                   | Business requests, permission decisions   |
| `Input`, `Select`, `Textarea`, `Field` | Consistent labels, controls, hints, errors and IDs | Domain state ownership                    |
| `Dialog`                               | Accessible modal container                         | Report or contact behavior                |
| `PageHeading`, `Notice`, `EmptyState`  | Page title and feedback presentation               | Invented successful operations            |
| `SiteHeader`, `SiteFooter`             | Public navigation                                  | Session trust                             |
| `WorkspaceShell`                       | Account/staff navigation layout                    | Backend authorization                     |
| `ListingCard`, `ListingGrid`           | Consistent inventory presentation                  | Seller contact disclosure                 |
| `InspectionBadge`                      | Explicit inspection-state labels                   | Determining authoritative eligibility     |
| `FavoriteButton`                       | Local demo favorite interaction                    | Authentication tokens                     |
| `DemoProvider`, `demo-store`           | Non-sensitive local state and feedback             | Real account, payment or report authority |
| `marketplace.ts`, `validation.ts`      | Pure filter/validation rules                       | UI markup or remote side effects          |

## Adding a page

1. Put page behavior in the relevant feature directory.
2. Compose it from a small App Router page file.
3. Reuse existing fields and feedback components.
4. Add the route to `frontend-routes.md` and navigation when relevant.
5. Clearly identify backend-dependent actions rather than inventing a success result.
6. Run type checking, linting, relevant tests and build.

## Connecting the backend later

Keep the sample data and local store replaceable. Introduce typed request/response adapters, response validation and consistent error mapping. Browser credentials must use the eventual BFF's secure HttpOnly session cookies. Never put a bearer token in local storage.

Return backend errors as meaningful form states. Keep request IDs available to support without exposing stack traces or private identifiers. Fresh inspection eligibility, contact consent, object ownership, fee state and report permissions must be decided by domain services.

## Comments and formatting

Prettier formats source. Name components and functions after their visible job. Comments explain non-obvious constraints such as temporary photo URL cleanup, hydration, untrusted local storage and the lack of backend authority. Avoid comments that simply repeat the next line.
