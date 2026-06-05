<!--
  User Story scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
-->

# US-001 — Owner lands on dashboard home and routes to project work

## Parent Scope Slice

[Signed-in home orientation](../scope-slices/dashboard-shell--signed-in-home-orientation.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false

---

## Story

As a **signed-in founder**, I want to **land on a home surface that names me as owner and routes me toward project work**, so that **I always know where to go next after signing in**.

---

## Acceptance Criteria

- **AC-1**: When a signed-in founder reaches `/dashboard`, the surface displays a greeting tied to the owner's identity and a primary action toward project / PRD work.
- **AC-2**: When the founder owns at least one project, the surface lists existing projects (most-recent-first or stable order) with an affordance to open each.
- **AC-3**: When the founder owns zero projects, the surface shows a non-failing empty state with a primary CTA toward `create-project`; no fake / placeholder projects are shown.

---

## UX States Covered

| State | Behavior |
|-------|----------|
| Empty (no project) | Empty state with CTA toward `project-workspace--create-project`. |
| Populated (≥1 project) | List with project rows + primary action. |
| Loading | Skeleton placeholder while project list is fetched. |
| Fetch error | Non-destructive inline error with retry; owner not signed out. |

## Out of Scope

- Project create / open implementation (`project-workspace` slices).
- Under-construction placeholders for non-PRD nav (sibling slice).
- Credit balance display.

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| User account | Read | Owner identity for greeting. |
| Project | Read (list, owner-scoped) | Read-only here. |

## Credit / Payment Impact

None.

## Sharing / Privacy Impact

None — private to the signed-in owner.

## Feedback / Instrumentation Impact

None — landing is not a PRD milestone.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Signed-in home orientation](../scope-slices/dashboard-shell--signed-in-home-orientation.md) | Scope Slice | ready | Parent slice. |
| [Account & session](../feature-areas/account-session.md) | Sibling FA | ready | Signed-in context. |
| [Project workspace](../feature-areas/project-workspace.md) | Sibling FA | ready | Provides projects to list. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Acceptance-Level Outcome

A signed-in founder reaches `/dashboard`, sees themselves named as owner with a primary action toward project / PRD work, sees their existing projects or a non-failing empty state, and recovers from a fetch error without losing session — without rendering non-PRD areas as if shipped and without exposing share affordances.

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
| 2026-05-25 | Scaffolded from approved User Story proposal (`/user-story scaffold`) | — |
| 2026-05-25 | Refined (`/user-story refine`) | — |
| 2026-05-25 | Promoted to ready-for-spec (`/user-story promote`) | — |
