# US-001 — Owner reads the project's decision history

## Parent Scope Slice

[Owner consults question / decision history](../scope-slices/question-history--owner-consults-decision-history.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false

---

## Story

As a **signed-in project owner**, I want to **read the chronological list of questions I answered and the resulting decisions for an owned project**, so that **PRD rationale remains traceable**.

## Acceptance Criteria

- **AC-1**: The owner sees an ordered list (most-recent or chronological — stable) of `DecisionEntry` rows for an owned project, each row showing at least timestamp, question text, and chosen answer / decision.
- **AC-2**: Entries are append-only on the read surface — no edit / delete affordance is rendered.
- **AC-3**: When the project has zero recorded entries, a non-failing empty state explains entries will accrue as the owner answers questions; no fake entries shown.

## UX States Covered

| State | Behavior |
|-------|----------|
| Empty | Non-failing empty state. |
| Populated | List in stable order. |
| Loading | Skeleton placeholder. |
| Fetch error | Inline retry; session preserved. |
| Append behind the scenes | Next render reflects new entry. |

## Out of Scope

- Question-capture flow (owned by `guided-clarification` FA — currently blocked).
- Diff / comparison between decisions.
- Editing / deleting prior decisions.
- Sharing the history externally.

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| DecisionEntry | Read (list, project-scoped) | No writes from this story. |
| Project | Read | Ownership filter. |

## Credit / Payment Impact

None.

## Sharing / Privacy Impact

None.

## Feedback / Instrumentation Impact

None.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Owner consults decision history](../scope-slices/question-history--owner-consults-decision-history.md) | Scope Slice | ready | Parent. |
| `project-workspace` Specs | Sibling | ready | `Project` schema. |
| `guided-clarification` FA | Sibling FA | blocked | Producer of entries; in v0 piloting, the read surface is functional even with an empty entries table. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Acceptance-Level Outcome

A signed-in project owner sees a chronological, project-scoped list of recorded decisions for an owned project (or a non-failing empty state), without edit / delete affordances, without exposing other owners' entries, without burning credits, and without rendering the question-capture UI.

## Readiness for Spec

- [x] As-X-I-do-Y-so-Z
- [x] ACs behavioral
- [x] UX states named
- [x] Out-of-scope explicit
- [x] Impacts assessed
- [x] Dependencies known
- [x] No open blockers (read-side independent of upstream block)
- [x] Outcome behavioral

**Verdict:** READY FOR SPEC

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded, refined, promoted | — |
