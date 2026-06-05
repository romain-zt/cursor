<!--
  Scope Slice scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
-->

# Scope Slice: Under-construction placeholders for non-PRD surfaces

## Parent Feature Area

[Dashboard shell](../feature-areas/dashboard-shell.md)

## Status

`ready-for-user-stories`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## User Value

A signed-in founder who navigates to non-PRD areas of the v0 dashboard sees an explicit "under construction" surface instead of a broken or fake-functional one — so trust in the product is preserved while only PRD work is operational.

---

## Exact Boundary

### Included Behavior

- An explicit placeholder surface for non-PRD areas linked from the dashboard shell (settings, billing, support, etc.) — content reflects PRD v0 scope.
- Consistent visual framing across all placeholder surfaces (same "under construction" affordance, not invented per-page).
- A clear "back to projects / PRD" affordance from any placeholder page.

### Excluded Behavior

- Any functional behavior on non-PRD pages (no working settings save, no working billing detail page) — those are deferred.
- The signed-in home itself (covered by the sibling slice `signed-in-home-orientation`).
- The actual credit / payment surfaces — `payments` FA owns those even when shown as placeholders if they overlap.
- Marketing / unauthenticated landing pages — out of scope (PRD focus is signed-in v0).

---

## UX States

| State | When | What the user sees / experiences |
|-------|------|----------------------------------|
| Placeholder rendered | Owner navigates to a non-PRD area listed in v0. | A consistent "under construction" surface with explicit copy that this area is not part of v0, plus an affordance back to PRD work. |
| Placeholder linked from primary nav | Primary nav exposes a non-PRD entry. | The entry visually differentiates "PRD" (operational) from "under construction" (placeholder) so the owner is never surprised by clicking. |
| Edge — direct URL hit | Owner pastes / bookmarks a non-PRD URL. | Same placeholder content is rendered (no 404, no broken state). |
| Edge — unauthenticated direct hit | Anonymous user reaches a placeholder URL. | Routed through normal auth gating (handled by `account-session`); placeholder content does not leak from this slice. |

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| — | — | This slice is presentational; no business-object reads or writes. |

---

## Credit / Payment Impact

None — placeholder surfaces do not consume credits or trigger purchase flows.

---

## Sharing / Privacy Impact

None — placeholder surfaces are signed-in-only; they do not expose private data because they intentionally render no data.

---

## Feedback / Instrumentation Impact

None — visiting an under-construction surface is not a PRD-aligned milestone.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Dashboard shell](../feature-areas/dashboard-shell.md) | Feature Area | ready | Parent FA `validated` as of 2026-05-25. |
| Sibling slice `signed-in-home-orientation` | Scope Slice (intra-FA) | pending | Inherits navigation framing from the home slice. |
| [Account & session](../feature-areas/account-session.md) | Sibling Feature Area | ready | Auth gating reused on placeholder routes. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

A signed-in founder who navigates to any non-PRD area in the v0 dashboard sees a consistent "under construction" surface that names v0 scope, offers a return path to PRD work, and never simulates working functionality — without exposing data, without triggering credit / payment flows, and without breaking the signed-in shell.

---

## Readiness for User Stories

- [x] User value stated without implementation language
- [x] Exact boundary defined (included + excluded)
- [x] UX states enumerated (including error and empty states)
- [x] Business objects named
- [x] Credit / payment impact assessed
- [x] Sharing / privacy surface assessed
- [x] Feedback / instrumentation impact assessed
- [x] All dependencies named and their status known
- [x] All blockers resolved or NEED_HUMAN=true explicitly set
- [x] Acceptance-level outcome is behavioral (not a test or code spec)

**Verdict:** READY FOR USER STORIES

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded from approved Phase 4 slice proposal via `/feature-area scaffold-slices` | — |
| 2026-05-25 | Refined via `/feature-area refine-slice` | — |
| 2026-05-25 | Promoted to ready-for-user-stories after CLEAR readiness check (`/feature-area promote-slice`) | — |
