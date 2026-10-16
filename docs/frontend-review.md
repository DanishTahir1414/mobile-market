# Frontend self-review

Review date: 17 October 2026, Asia/Karachi. Separate source/diff review after implementation; this is not a guarantee of defect absence.

## Findings fixed

- Out-of-range, fractional and non-finite page values could produce empty or misleading browse pages. Added bounded pure pagination with regression tests.
- Mobile filter changes immediately changed the applied URL. Added a pending selection with explicit Apply and Clear, using the existing native dialog.
- Unknown draft edit IDs created a fresh draft. Added an explicit recoverable not-found state; dedicated previews never save on mount.
- Published price-only edits and material edits needed distinct handling. Added shared edit classification, validation before editing a published scenario, confirmation for material edits and a return through review. Terminal states cannot open the editor.
- Storage writes failed silently while the UI claimed persistence. Draft writes now report persistent versus current-tab-only storage.
- The initial unsaved guard also intercepted error-summary anchors, and pristine new forms appeared dirty. Excluded same-page anchors and initialized the clean snapshot from actual initial fields.
- Dialog headings used a shared fixed ID. Each instance now uses a unique React ID. Browser verified native Escape and focus return.
- Battery health of zero displayed as missing. Changed the display to check null explicitly.
- A lint finding used a plain internal anchor in the new approval presentation. Replaced it with Next Link.
- Diff review found encoding artifacts introduced while editing and excess blank lines. Repaired them and formatted the changed source.
- Bench validation previously accepted an identity mismatch. Submission preview now requires a matching identity and identity-check pass.
- Removed obsolete overlay/gallery CSS and redundant mobile close control after replacing the overlay with a native dialog.
- Tightened staff catch-all routing so arbitrary inspection detail IDs do not silently select the sample bench.

- Browser viewport checks exposed workspace navigation widening grid tracks at 320/390/768 pixels. Added a zero minimum width to the navigation grid item so its existing scroll container can constrain content.
- Review found the shared dialog close button could submit an enclosing draft form. Set its explicit button type; gallery navigation already uses non-submit buttons.
- Excluded terminal public sample listings from the illustrative moderation queue so they are not mislabeled as awaiting review.

- Replaced the ordinary-link native unsaved confirmation with the shared accessible dialog after browser tooling could not reliably handle the native prompt. Document unload still uses the browser warning.
- Removed an unused exported photo type; no new dependency was introduced.

## Boundaries and remaining limitations

- No authentication, authorization, network mutation, upload pipeline, real slot reservation, moderation, fee settlement or report issuance exists. Staff forms validate proposals or show explicit unavailable/permission explanations.
- Lifecycle states are browser-local scenarios. Status transitions and acknowledgement are not evidence that an operational action occurred.
- Photo previews are memory-only. Saved previews deliberately display a missing-photo fallback after navigation/reload; files must be selected again. The gallery uses illustrative photographs which may differ from the advertised model or color.
- Unsaved protection covers unload and ordinary links. App Router history transitions are not intercepted. Browsers may suppress unload prompts without prior user activation.
- Browser storage synchronization is not transactional concurrency control. Future mutations need expected-revision validation and action-time authorization.
- Public correction history is an explicitly illustrative presentation, not a real immutable report chain. Eligibility remains unavailable for a real report.
- See frontend-verification.md for exactly which interactive checks were performed and which remain unverified.

No v2 specification documents were changed. The pre-existing next-env.d.ts modification is excluded from the delivery commit.
