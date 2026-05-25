<!--
  User Story scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
-->

# US-001 — Owner sees an under-construction placeholder on non-PRD areas

## Parent Scope Slice

[Under-construction placeholders](../scope-slices/dashboard-shell--under-construction-placeholders.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false

---

## Story

As a **signed-in founder**, I want to **see an explicit "under construction" surface when I navigate to non-PRD areas in the v0 dashboard**, so that **I am not confused by half-working features and I know what is in scope for v0**.

---

## Acceptance Criteria

- **AC-1**: When the signed-in founder navigates to any non-PRD area listed in v0 (e.g. settings, billing detail, support), they see a consistent "under construction" surface naming v0 scope.
- **AC-2**: Every placeholder surface includes a clearly labeled affordance back to PRD work (projects / PRD versions).
- **AC-3**: Direct URL access to a placeholder route (typed or bookmarked) renders the placeholder surface — no 404, no broken state, no leaked authoring UI.

---

## UX States Covered

| State | Behavior |
|-------|----------|
| Placeholder rendered | Consistent "under construction" surface. |
| Primary nav entry | Non-PRD entries visually distinct from PRD-operational ones. |
| Direct URL hit | Same placeholder content; no 404. |

## Out of Scope

- Functional behavior on non-PRD pages.
- Marketing / unauthenticated landing pages.
- Signed-in home content (sibling slice).

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| — | — | Presentational only; auth gating is reused from `account-session`. |

## Credit / Payment Impact

None.

## Sharing / Privacy Impact

None — signed-in-only; nothing exposed because nothing is rendered.

## Feedback / Instrumentation Impact

None.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Under-construction placeholders](../scope-slices/dashboard-shell--under-construction-placeholders.md) | Scope Slice | ready | Parent slice. |
| [Account & session](../feature-areas/account-session.md) | Sibling FA | ready | Auth gating. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Acceptance-Level Outcome

A signed-in founder who navigates to any non-PRD area sees a consistent under-construction surface with a clear path back to PRD work — without 404s, without simulated functionality, and without breaking the signed-in shell.

## Readiness for Spec

- [x] Story uses the As-an-X-I-do-Y-so-that-Z shape
- [x] Acceptance criteria are behavioral and individually verifiable
- [x] UX states from the parent slice that this story covers are named
- [x] Out-of-scope vs. in-scope explicit relative to the parent slice
- [x] Data, credit/payment, sharing, feedback impacts assessed
- [x] Dependencies named with known statuses
- [x] Blockers either resolved or NEED_HUMAN=true with rationale
- [x] Acceptance-level outcome is behavioral (no architecture)

**Verdict:** READY FOR SPEC

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded (`/user-story scaffold`), refined (`/user-story refine`), promoted (`/user-story promote`) | — |
