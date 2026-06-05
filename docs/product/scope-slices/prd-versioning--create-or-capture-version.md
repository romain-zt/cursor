<!--
  Scope Slice scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
-->

# Scope Slice: Create or capture a PRD version

## Parent Feature Area

[PRD versioning](../feature-areas/prd-versioning.md)

## Status

`ready-for-user-stories`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## User Value

A founder captures a stable, named version of their PRD inside a project so progress is not silently overwritten and future iterations can be compared against a known baseline.

---

## Exact Boundary

### Included Behavior

- A signed-in owner of an existing project captures the current PRD state as a versioned snapshot.
- Each version has a stable identifier and an immutable PRD payload (the **content** of a frozen version is not editable in-place).
- A meaningful version label (semantic name, e.g. `v1`, `v2`) is set at capture time.
- The owner sees the captured version listed alongside any prior versions.

### Excluded Behavior

- PRD authoring UI (writing, prompting, editing freeform PRD text) — this slice freezes a payload; authoring is upstream.
- Diff visualization between versions — separate slice if ever scoped.
- Cross-project PRD copy / fork — out of scope.
- Sharing the new version externally — `read-only-sharing` FA.
- Credit accounting for the snapshot itself — capture does not burn credits (credits burn on AI work that produced the underlying content).

---

## UX States

| State | When | What the user sees / experiences |
|-------|------|----------------------------------|
| Awaiting capture | Owner reaches the capture entry. | A clearly labeled affordance to capture the current PRD state, with a default version label suggested. |
| Submitting | Owner confirms capture. | Non-blocking progress; controls disabled to prevent duplicate captures. |
| Captured (success) | Version is persisted. | Owner sees confirmation and the new version listed in the project's version list. |
| Validation error | Version label fails validation (e.g. empty). | Inline message tied to the input; no version created. |
| Conflict | A version with that label already exists in the project. | Inline message; owner can pick a different label without losing the in-progress capture. |
| System error | Persistence fails. | Non-destructive error message; owner can retry. |

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| PRD version | Create | New immutable version snapshot under an existing project. |
| Project | Read | For ownership and version-list scoping. |

---

## Credit / Payment Impact

None — capturing a version snapshot does not burn credits in v0.

---

## Sharing / Privacy Impact

None — the new version is private to the project owner; no share link is minted automatically.

---

## Feedback / Instrumentation Impact

Possible PRD-aligned milestone — capturing v1 may be a milestone surfaced by `owner-milestone-feedback` (consumed downstream, not produced by this slice).

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [PRD versioning](../feature-areas/prd-versioning.md) | Feature Area | ready | Parent FA `validated` as of 2026-05-25. |
| [Project workspace](../feature-areas/project-workspace.md) | Sibling Feature Area | ready | Project entity is the container of PRD versions. |
| [Account & session](../feature-areas/account-session.md) | Sibling Feature Area | ready | Owner identity prerequisite. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

A signed-in founder captures a labeled, immutable PRD version under an owned project, sees it listed alongside prior versions, and is shown an actionable inline message on validation / conflict / system errors — without burning credits, without minting a share link, and without modifying any prior captured version's payload.

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
