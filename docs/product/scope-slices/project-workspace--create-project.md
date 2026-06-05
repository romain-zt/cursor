<!--
  Scope Slice scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
-->

# Scope Slice: Create a project

## Parent Feature Area

[Project workspace](../feature-areas/project-workspace.md)

## Status

`ready-for-user-stories`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## User Value

A signed-in founder creates a named project so subsequent PRD work has a stable container — there is no PRD authoring without a project first.

---

## Exact Boundary

### Included Behavior

- A signed-in owner provides a project name and creates a new project owned solely by them.
- Default state of the new project includes no PRD versions yet (PRD versioning is its own FA).
- Idempotent guard against accidental double-submit (no duplicate project from a stuttered click).
- Validation of the project name against PRD content rules (non-empty; reasonable length cap).

### Excluded Behavior

- Multi-owner project membership (not in v0).
- Project archival / delete (separate slice if ever scoped).
- PRD content within the project — owned by `prd-versioning`.
- Sharing the new project — `read-only-sharing` FA.
- Credit accounting for creating a project — creation itself does not burn credits (per PRD v0 burn tiers).

---

## UX States

| State | When | What the user sees / experiences |
|-------|------|----------------------------------|
| Awaiting input | Owner reaches the create-project entry. | Clearly labeled input for the project name and a primary action; no error, no progress. |
| Submitting | Owner confirms creation. | Non-blocking progress indication; controls disabled to prevent double-submit. |
| Created (success) | Project is created. | Owner is taken into the new project's surface (handled by `list-and-open-project` for navigation parity). |
| Validation error | Name fails validation. | Inline, actionable message; no project created; input retained for correction. |
| System error | Persistence fails. | Non-destructive error message; owner can retry without losing the typed name. |

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| Project | Create | New project entity owned by the signed-in founder (solo-owner v0 model). |
| User account | Read | Owner identity is read for attribution; not modified. |

---

## Credit / Payment Impact

None — creating an empty project does not burn credits (PRD v0: credits burn on AI work, not on container creation).

---

## Sharing / Privacy Impact

None — a freshly created project is private to its owner by default; no share link minted automatically.

---

## Feedback / Instrumentation Impact

None — project creation is not itself a PRD milestone for owner feedback (feedback attaches to PRD events).

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Project workspace](../feature-areas/project-workspace.md) | Feature Area | ready | Parent FA `validated` as of 2026-05-25. |
| [Account & session](../feature-areas/account-session.md) | Sibling Feature Area | ready | Owner identity prerequisite. |
| [Dashboard shell](../feature-areas/dashboard-shell.md) | Sibling Feature Area | ready | FA `validated`; create-project entry is reached from the dashboard home slice. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

A signed-in founder creates a named, validated project owned solely by them, is taken into the new project's surface on success, and is shown an actionable inline message on validation or system errors — without burning credits, without exposing share affordances, and without enabling multi-owner membership.

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
