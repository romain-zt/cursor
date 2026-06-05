# US-001 — Owner lists and opens projects

## Parent Scope Slice

[List and open a project](../scope-slices/project-workspace--list-and-open-project.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false

---

## Story

As a **signed-in founder**, I want to **see the projects I own and open one**, so that **I can resume PRD work without re-creating projects or losing track of them**.

## Acceptance Criteria

- **AC-1**: The signed-in founder sees a list of every `Project` they own, ordered most-recently-updated first, with name + last-updated context per row.
- **AC-2**: Clicking the open affordance of a row routes the founder to `/projects/{id}` for that project.
- **AC-3**: When the founder owns zero projects, a non-failing empty state with a CTA to `/projects/new` is shown.

## UX States Covered

| State | Behavior |
|-------|----------|
| Empty | Empty state with CTA to create. |
| Populated | Rows ordered most-recent-first. |
| Loading | Skeleton placeholder. |
| Fetch error | Inline non-destructive error with retry. |
| Open in progress | Routing to project surface. |

## Out of Scope

- Search / filter / pagination of projects.
- Inline rename / archive / delete.

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| Project | Read (list, owner-scoped) | No writes. |

## Credit / Payment Impact

None.

## Sharing / Privacy Impact

None — owner-scoped read only.

## Feedback / Instrumentation Impact

None.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [List and open a project](../scope-slices/project-workspace--list-and-open-project.md) | Scope Slice | ready | Parent. |
| Sibling slice `create-project` | Scope Slice | ready | Produces the entities listed here. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Acceptance-Level Outcome

A signed-in founder sees only the projects they own ordered by recency, opens one to enter its surface, sees a non-failing empty state when they own none, and recovers from a fetch error without losing session — without exposing other owners' projects and without burning credits.

## Readiness for Spec

- [x] As-X-I-do-Y-so-Z
- [x] ACs behavioral
- [x] UX states named
- [x] Out-of-scope explicit
- [x] Impacts assessed
- [x] Dependencies known
- [x] No open blockers
- [x] Outcome behavioral

**Verdict:** READY FOR SPEC

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded, refined, promoted | — |
