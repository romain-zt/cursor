<!--
  Scope Slice scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
-->

# Scope Slice: List and open a project

## Parent Feature Area

[Project workspace](../feature-areas/project-workspace.md)

## Status

`ready-for-user-stories`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## User Value

A returning founder sees the projects they own and opens one to resume PRD work — without re-creating projects or losing track of existing ones.

---

## Exact Boundary

### Included Behavior

- A signed-in owner sees a list of their projects (most-recent-first, or stable order).
- The owner can open a project, which routes them into the project surface.
- Each row identifies the project clearly enough that the founder can pick the right one without ambiguity.
- Empty state when the founder owns no projects yet.

### Excluded Behavior

- Project search / filter / pagination beyond a basic list — deferred unless PRD content forces it.
- Inline rename / archive / delete — separate slices if ever scoped.
- Cross-owner project lists — solo-owner v0 model.
- PRD content rendering within the list — owned by `prd-versioning`.

---

## UX States

| State | When | What the user sees / experiences |
|-------|------|----------------------------------|
| Empty | Owner has zero projects. | A non-failing empty state with a primary CTA toward `create-project`. |
| Populated | Owner has one or more projects. | A list with at least project name and last-touched / created context; each row has an "open" affordance. |
| Loading | List is being fetched. | Skeleton placeholder; no jarring flash; the surrounding shell remains stable. |
| Fetch error | List cannot be loaded. | Non-destructive inline error with retry; the owner is not signed out. |
| Open in progress | Owner clicks open on a row. | The project surface loads; affordance reflects the in-progress state without blocking other interactions in the shell. |

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| Project | Read (list) | Scoped to the signed-in owner; no writes in this slice. |
| User account | Read | For ownership filter. |

---

## Credit / Payment Impact

None — listing and opening projects does not burn credits.

---

## Sharing / Privacy Impact

None — the list is scoped strictly to the owner; no anonymous viewer reads, no share surface change.

---

## Feedback / Instrumentation Impact

None — opening a project is not itself a PRD milestone.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Project workspace](../feature-areas/project-workspace.md) | Feature Area | ready | Parent FA `validated` as of 2026-05-25. |
| Sibling slice `create-project` | Scope Slice (intra-FA) | ready | Creation produces the entities this slice lists. |
| [Account & session](../feature-areas/account-session.md) | Sibling Feature Area | ready | Owner identity prerequisite. |
| [Dashboard shell](../feature-areas/dashboard-shell.md) | Sibling Feature Area | ready | List entry surfaced from the dashboard home. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

A signed-in founder sees only the projects they own, can open one to enter its surface, sees a non-failing empty state when they own none, and recovers from a fetch error without losing session — without exposing other owners' projects, without burning credits, and without performing project mutations from the list.

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
