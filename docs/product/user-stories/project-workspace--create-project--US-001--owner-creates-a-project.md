# US-001 — Owner creates a project

## Parent Scope Slice

[Create a project](../scope-slices/project-workspace--create-project.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false

---

## Story

As a **signed-in founder**, I want to **create a named project**, so that **subsequent PRD work has a stable owned container**.

## Acceptance Criteria

- **AC-1**: Submitting a valid project name creates a new `Project` owned by the signed-in founder and routes them to the project surface.
- **AC-2**: Submitting an empty / too-long / otherwise invalid name shows an inline, actionable error; no project is created; the typed name is retained.
- **AC-3**: Double-clicking the submit affordance does not create two projects (idempotent or guarded against double-submit).

## UX States Covered

| State | Behavior |
|-------|----------|
| Awaiting input | Form rendered, no error, no progress. |
| Submitting | Controls disabled briefly; progress visible. |
| Created (success) | Routed into the new project's surface. |
| Validation error | Inline message; no creation; input retained. |
| System error | Non-destructive error; retry possible. |

## Out of Scope

- Project archival / delete / rename.
- PRD authoring inside the new project.
- Sharing the new project.

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| Project | Create | Solo-owner v0. |
| User account | Read | Attribution. |

## Credit / Payment Impact

None — creating an empty project does not burn credits.

## Sharing / Privacy Impact

None — private to owner by default.

## Feedback / Instrumentation Impact

None.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Create a project](../scope-slices/project-workspace--create-project.md) | Scope Slice | ready | Parent. |
| [Account & session](../feature-areas/account-session.md) | Sibling FA | ready | Owner identity. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Acceptance-Level Outcome

A signed-in founder creates a named, validated project they solely own, is taken to the project surface on success, sees an actionable inline error on invalid input, and cannot accidentally create duplicate projects from a stuttered submit — without burning credits, without exposing share affordances, and without multi-owner membership.

## Readiness for Spec

- [x] Story uses As-X-I-do-Y-so-Z
- [x] ACs are behavioral and verifiable
- [x] UX states named
- [x] Out-of-scope explicit
- [x] Impacts assessed
- [x] Dependencies named
- [x] Blockers resolved
- [x] Acceptance-level outcome is behavioral

**Verdict:** READY FOR SPEC

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded, refined, promoted | — |
