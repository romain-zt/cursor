<!--
  Spec scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
  Inherits stack baseline from PD-002.
-->

# Spec — Under-construction placeholder on non-PRD areas

## Parent User Story

[US-001](../user-stories/dashboard-shell--under-construction-placeholders--US-001--sees-placeholder-on-non-prd-areas.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false

---

## Summary

A single `UnderConstruction` server component is rendered on the route group `app/(under-construction)/*` (Next.js per PD-002). Routes covered: `settings`, `billing`, `support`, `team`, plus a catch-all `[[...slug]]` under the group. Auth middleware from `account-session` ensures signed-in only.

## Acceptance Criteria Trace

- **AC-1** → All listed non-PRD routes render the same `UnderConstruction` component; covered by an integration test loading each listed route and asserting the consistent surface.
- **AC-2** → `UnderConstruction` renders a "Back to projects" affordance linking to `/dashboard`; covered by a unit test asserting the link target.
- **AC-3** → Direct URL hit on the catch-all subroute renders the same component (no 404); covered by an integration test on an arbitrary slug under each group.

## Data Model

No data writes / reads.

## Contract

### Inputs
- HTTP `GET` for each route under `app/(under-construction)/*`.

### Outputs
- HTML page rendered by `UnderConstruction`.

### Errors
- Unauthenticated → redirect to `/signin` (middleware).

## UI Surface

- Route group: `app/(under-construction)/`.
- Component: `app/_components/UnderConstruction.tsx`.
- Primary nav visually differentiates "PRD" entries from "under construction" entries via a tag / style; nav component lives in `app/_components/AppNav.tsx`.

## Tests (mandatory)

### Unit
- `UnderConstruction` renders the v0-scope copy and a `<Link>` to `/dashboard`.

### Integration
- Each listed non-PRD route (`/settings`, `/billing`, `/support`, `/team`) renders the same component.
- A catch-all subroute (`/settings/some-future-page`) renders the same component (no 404).

### Acceptance (E2E)
- Signed-in founder clicks a non-PRD nav entry and sees the placeholder; clicks "Back to projects" and lands on `/dashboard`.

### Non-functional
- Smoke only.

## Observability

- Log `under_construction.view` event with `route` (server-side).

## Implementation Notes

- Framework: Next.js App Router (PD-002), `(under-construction)` route group.
- Auth gating reused from `account-session` middleware.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [US-001](../user-stories/dashboard-shell--under-construction-placeholders--US-001--sees-placeholder-on-non-prd-areas.md) | Parent | ready | — |
| [PD-002](../../product-decisions/PD-002-pilot-stack-baseline.md) | Decision | approved | Stack baseline. |
| `account-session` middleware Spec | Sibling Spec | ready | Auth gating. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Out of Scope

- Functional implementations of any non-PRD page.

## Readiness Checklist

- [x] Spec ties cleanly back to its parent User Story
- [x] Acceptance criteria are mapped to tests
- [x] Data model changes (or absence of changes) explicit
- [x] Inputs / outputs / errors enumerated
- [x] Mandatory tests named (unit, integration, acceptance, non-functional)
- [x] Observability touchpoints named
- [x] Implementation framework / lib / persistence choices explicit (anchored on PD-002)
- [x] Dependencies named with known statuses
- [x] Blockers resolved or NEED_HUMAN=true with rationale
- [x] Out-of-scope explicit

**Verdict:** READY FOR IMPLEMENTATION

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded, refined, promoted | — |
