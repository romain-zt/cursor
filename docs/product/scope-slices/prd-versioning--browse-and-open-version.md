<!--
  Scope Slice scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
-->

# Scope Slice: Browse and open a PRD version

## Parent Feature Area

[PRD versioning](../feature-areas/prd-versioning.md)

## Status

`ready-for-user-stories`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## User Value

A founder sees the list of captured PRD versions for a project and opens one to read its frozen content, so prior decisions and PRDs remain consultable instead of lost.

---

## Exact Boundary

### Included Behavior

- A signed-in owner sees the captured versions of an owned project (most-recent-first).
- The owner opens a version to read its frozen payload in a read surface.
- Empty state when no version has been captured yet.

### Excluded Behavior

- Editing version payload — versions are immutable post-capture.
- Diff between versions — separate slice.
- Sharing a version externally — `read-only-sharing` FA.
- Capturing a new version — sibling slice `create-or-capture-version`.

---

## UX States

| State | When | What the user sees / experiences |
|-------|------|----------------------------------|
| Empty | Project has no captured versions yet. | A non-failing empty state with a primary CTA toward `create-or-capture-version`. |
| Populated | Project has one or more captured versions. | A list with at least version label and capture date; each row has an "open" affordance. |
| Loading | List or version content is being fetched. | Skeleton placeholder; the surrounding shell remains stable. |
| Fetch error | List or version content cannot be loaded. | Non-destructive inline error with retry; the owner is not signed out. |
| Read surface open | Owner opens a specific version. | The captured PRD payload is rendered read-only; navigation back to the version list is preserved. |

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| PRD version | Read | Scoped to the owner's project; no writes. |
| Project | Read | For ownership filter. |

---

## Credit / Payment Impact

None — reading captured versions does not burn credits.

---

## Sharing / Privacy Impact

None — read surface is signed-in-owner-only; share affordance is owned by `read-only-sharing`.

---

## Feedback / Instrumentation Impact

None — opening a captured version is not itself a PRD milestone for feedback.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [PRD versioning](../feature-areas/prd-versioning.md) | Feature Area | ready | Parent FA `validated` as of 2026-05-25. |
| Sibling slice `create-or-capture-version` | Scope Slice (intra-FA) | ready | Captures the entities this slice browses. |
| [Project workspace](../feature-areas/project-workspace.md) | Sibling Feature Area | ready | Project entity is the parent container. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

A signed-in founder sees only the captured versions of a project they own, can open one to read its immutable payload, sees a non-failing empty state when no version has been captured, and recovers from fetch errors without losing session — without exposing other owners' versions, without burning credits, and without mutating any captured payload.

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
