# US-001 — Owner sees a milestone prompt and submits / dismisses feedback

## Parent Scope Slice

[Milestone prompt and feedback capture](../scope-slices/owner-milestone-feedback--milestone-prompt-and-capture.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false

---

## Story

As a **signed-in founder**, I want to **see a single, non-blocking feedback prompt when I hit a PRD-defined milestone, and submit or dismiss it**, so that **the product learns from real moments without nagging me**.

## Acceptance Criteria

- **AC-1**: When a signed-in founder first triggers a PRD-defined milestone, a non-blocking feedback prompt is shown with clear milestone copy and a submit / dismiss affordance.
- **AC-2**: Submitting valid feedback persists a `FeedbackEntry` tied to the owner + milestone id and marks the milestone as "prompt-shown"; the prompt does not return.
- **AC-3**: Dismissing without submitting closes the prompt and marks the milestone as "prompt-shown"; the prompt does not return for that owner / milestone.

## UX States Covered

| State | Behavior |
|-------|----------|
| No prompt | No surface change. |
| Prompt shown | Non-blocking prompt with milestone copy. |
| Submitting | Controls disabled briefly. |
| Submitted | Brief acknowledgement. |
| Dismissed | Prompt closes; not re-shown. |
| System error | Non-destructive error; input preserved; retry. |

## Out of Scope

- Cross-owner aggregation / admin dashboard.
- Continuous NPS / CSAT loops.
- Editing / deleting feedback after submission.

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| FeedbackEntry | Create | Owner + milestone id + content + timestamp. |
| OwnerMilestoneState | Read / Update | Marks milestone as prompt-shown. |
| User account | Read | Attribution. |

## Credit / Payment Impact

None.

## Sharing / Privacy Impact

None — feedback is private to owner and product.

## Feedback / Instrumentation Impact

This **is** the feedback surface.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Milestone prompt and feedback capture](../scope-slices/owner-milestone-feedback--milestone-prompt-and-capture.md) | Scope Slice | ready | Parent. |
| `prd-versioning--create-or-capture-version` Spec | Sibling Spec | ready | Emits a milestone signal on first capture. |
| `payments--manual-credit-pack-checkout` Spec | Sibling Spec | pending (FA downstream blocked on `credit-system`) | Could emit a milestone signal on first purchase; not required for this story to ship. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Acceptance-Level Outcome

A signed-in founder sees at most one non-blocking feedback prompt per PRD-defined milestone, can submit short feedback or dismiss, never sees the same milestone prompt return, and is shown a non-destructive error on submission failure with their input preserved — without nagging, without blocking PRD work, and without exposing feedback content via any sharing surface.

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
