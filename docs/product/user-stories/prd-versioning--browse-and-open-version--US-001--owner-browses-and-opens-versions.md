# US-001 — Owner browses and opens captured PRD versions

## Parent Scope Slice

[Browse and open a PRD version](../scope-slices/prd-versioning--browse-and-open-version.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false

---

## Story

As a **signed-in project owner**, I want to **see the captured versions of an owned project and open one to read it**, so that **prior decisions remain consultable instead of lost**.

## Acceptance Criteria

- **AC-1**: The owner sees the captured versions for the project ordered most-recent-first, with label + capture date per row.
- **AC-2**: Clicking the open affordance of a row renders the captured payload read-only at `/projects/{id}/versions/{versionId}`; no editing affordances are present.
- **AC-3**: When the project has no captured versions, a non-failing empty state with a CTA toward capture is shown.

## UX States Covered

| State | Behavior |
|-------|----------|
| Empty | Empty state with CTA. |
| Populated | List in stable order. |
| Loading | Skeleton placeholder. |
| Fetch error | Inline retry; session preserved. |
| Read surface | Read-only payload rendered; back affordance. |

## Out of Scope

- Editing payload.
- Diff.
- Sharing.
- Capture itself (sibling slice).

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| PRDVersion | Read | Owner-scoped via project. |
| Project | Read | Ownership filter. |

## Credit / Payment Impact

None.

## Sharing / Privacy Impact

None — share is a separate FA.

## Feedback / Instrumentation Impact

None.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Browse and open a PRD version](../scope-slices/prd-versioning--browse-and-open-version.md) | Scope Slice | ready | Parent. |
| Sibling `create-or-capture-version` Spec | Sibling Spec | ready | Produces `PRDVersion` rows. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Acceptance-Level Outcome

A signed-in project owner sees only the captured versions of an owned project ordered by recency, opens one to read its immutable payload in a read-only surface, sees a non-failing empty state when no version exists, and recovers from fetch errors without losing session — without exposing other owners' versions, without burning credits, and without mutating captured payloads.

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
