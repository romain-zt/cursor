<!--
  Scope Slice scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
-->

# Scope Slice: Owner consults question / decision history

## Parent Feature Area

[Question history](../feature-areas/question-history.md)

## Status

`ready-for-user-stories`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## User Value

A founder reviews the questions they answered and the resulting decisions for a project, so the PRD's rationale remains traceable instead of lost in the chat.

---

## Exact Boundary

### Included Behavior

- A signed-in owner sees a chronological list of answered questions and recorded decisions for an owned project.
- Each entry is append-only (decisions are recorded once and not silently overwritten).
- Entries are scoped to a single project (no cross-project bleed).
- Empty state when no decision has been captured yet.

### Excluded Behavior

- The question-answer flow itself — owned by `guided-clarification` FA.
- Diff or comparison between decisions — out of scope v0.
- Editing prior decisions — append-only; corrections live as new entries if ever scoped.
- Sharing the history externally — `read-only-sharing` FA.

---

## UX States

| State | When | What the user sees / experiences |
|-------|------|----------------------------------|
| Empty | Project has no recorded decisions yet. | A non-failing empty state that explains decisions will accrue as the owner answers questions; no fake entries shown. |
| Populated | Project has one or more recorded entries. | A list with at least entry timestamp, question, and chosen answer / decision; ordered most-recent-first or chronologically (stable). |
| Loading | List is being fetched. | Skeleton placeholder; surrounding shell remains stable. |
| Fetch error | List cannot be loaded. | Non-destructive inline error with retry; the owner is not signed out. |
| Append behind the scenes | A new decision is recorded by the guided-clarification flow. | The history list reflects the new entry on next render; this slice does not own the capture trigger. |

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| Decision entry (question/answer/decision record) | Read (list, per project) | Scoped to the owner's project; read-only for this slice. |
| Decision entry | Append (contract, not direct UI) | Appends are produced by `guided-clarification` flows; this slice enforces that the surface stays consistent with append-only semantics. |
| Project | Read | For ownership filter. |

---

## Credit / Payment Impact

None — viewing decision history does not burn credits.

---

## Sharing / Privacy Impact

None — surface is signed-in-owner-only; share affordance is owned by `read-only-sharing`.

---

## Feedback / Instrumentation Impact

None — viewing history is not itself a PRD milestone for owner feedback.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Question history](../feature-areas/question-history.md) | Feature Area | ready | Parent FA `validated` as of 2026-05-25. |
| [Project workspace](../feature-areas/project-workspace.md) | Sibling Feature Area | ready | Project entity scopes history entries. |
| [Guided clarification](../feature-areas/guided-clarification.md) | Sibling Feature Area | blocked | FA is `BLOCKED` (NEED_HUMAN: AI provider/quality). This slice tolerates an empty append source in v0 piloting; the **read** surface is functional even if no entry is captured yet. Capture-side User Stories must wait for the upstream FA to unblock. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

A signed-in founder sees a chronological, project-scoped list of recorded decisions for an owned project, sees a non-failing empty state when no entry exists, and recovers from fetch errors without losing session — without exposing other owners' entries, without mutating prior decisions, without burning credits, and without rendering the question-capture UI (which is owned upstream).

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
