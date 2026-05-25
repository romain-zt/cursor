# US-001 — Owner captures a PRD version

## Parent Scope Slice

[Create or capture a PRD version](../scope-slices/prd-versioning--create-or-capture-version.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false

---

## Story

As a **signed-in founder of a project**, I want to **capture the current PRD state as a labeled, immutable version**, so that **progress is preserved against a known baseline and future iterations can be compared**.

## Acceptance Criteria

- **AC-1**: Submitting a valid version label captures the current PRD payload as an immutable `PRDVersion` under the owned project and lists it alongside any prior versions.
- **AC-2**: Submitting a label that already exists for that project shows an inline conflict message; no version is captured; the typed label is retained.
- **AC-3**: Once captured, the version's payload cannot be modified via any API exposed by this slice (immutability contract).

## UX States Covered

| State | Behavior |
|-------|----------|
| Awaiting capture | Capture affordance with suggested default label. |
| Submitting | Controls disabled briefly. |
| Captured (success) | Confirmation + new version listed. |
| Validation error | Inline message; no row. |
| Conflict | Inline conflict message. |
| System error | Non-destructive error; retry. |

## Out of Scope

- PRD authoring UI.
- Diff visualization.
- Cross-project PRD copy / fork.
- Sharing the new version.

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| PRDVersion | Create (immutable) | New snapshot under owned project. |
| Project | Read | Ownership + label-conflict check. |

## Credit / Payment Impact

None — capture itself does not burn credits.

## Sharing / Privacy Impact

None — private; share is a separate FA.

## Feedback / Instrumentation Impact

May be a milestone consumed by `owner-milestone-feedback`.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Create or capture a PRD version](../scope-slices/prd-versioning--create-or-capture-version.md) | Scope Slice | ready | Parent. |
| `project-workspace--create-project` Spec | Sibling Spec | ready | `Project` schema. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Acceptance-Level Outcome

A signed-in project owner captures a labeled, immutable PRD version, sees it listed alongside prior versions, and is shown an actionable inline message on validation / conflict / system errors — without burning credits, without minting a share link, and without mutating any prior captured version's payload.

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
