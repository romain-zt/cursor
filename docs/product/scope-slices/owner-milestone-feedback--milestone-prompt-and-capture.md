<!--
  Scope Slice scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
-->

# Scope Slice: PRD milestone prompt and feedback capture

## Parent Feature Area

[Owner milestone feedback](../feature-areas/owner-milestone-feedback.md)

## Status

`ready-for-user-stories`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## User Value

A founder is asked for short, contextual feedback at a small set of PRD-defined milestones, so the product can learn what worked / what hurt — without spamming the owner outside of meaningful moments.

---

## Exact Boundary

### Included Behavior

- A small set of PRD-defined milestones (e.g. first version captured, first purchase) trigger a single, dismissable in-app feedback prompt for the owner.
- The owner can submit short feedback (free-text and / or a structured signal — exact shape from PRD) or dismiss the prompt.
- Each milestone prompt is shown **at most once** per owner per milestone (no nag).
- Submitted feedback is recorded with owner attribution and the milestone identifier.
- The feedback surface is non-blocking — it does not stop the owner from continuing PRD work.

### Excluded Behavior

- Cross-owner feedback aggregation / admin dashboard — out of v0.
- Continuous in-product NPS / CSAT loops — out of v0.
- Triggering milestones from non-PRD events (settings change, navigation) — only PRD milestones.
- Sharing feedback content with anonymous viewers — `read-only-sharing` does not cover this.
- Editing or deleting feedback after submission — out of v0.

---

## UX States

| State | When | What the user sees / experiences |
|-------|------|----------------------------------|
| No prompt | Owner has not yet hit a milestone, or has already seen the prompt for it. | No surface change; the owner sees their normal PRD work. |
| Prompt shown | A PRD milestone is reached for the first time. | A non-blocking prompt appears with clear copy naming the milestone, a small input affordance, and a dismiss path. |
| Submitting | Owner submits feedback. | Non-blocking progress; controls disabled briefly to prevent duplicate submit. |
| Submitted (success) | Feedback is recorded. | Owner sees a brief, dismissable acknowledgement; the prompt does not return for this milestone. |
| Dismissed | Owner dismisses without submitting. | Prompt closes; the prompt does not return for this milestone. |
| System error | Recording fails. | The owner sees a non-destructive error; their input is preserved; they can retry. |

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| Feedback entry | Create | Owner-scoped record tying milestone id + content + timestamp + owner id. |
| Owner milestone state | Read / Update | Marks the milestone as "prompt-shown" for the owner so it does not return. |
| User account | Read | Owner attribution. |

---

## Credit / Payment Impact

None — submitting feedback does not burn credits.

---

## Sharing / Privacy Impact

None — feedback is private to the owner and the product; never exposed via `read-only-sharing`.

---

## Feedback / Instrumentation Impact

This **is** the feedback / instrumentation surface for owner milestones. Other slices may produce the milestone signals; this slice consumes them.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Owner milestone feedback](../feature-areas/owner-milestone-feedback.md) | Feature Area | ready | Parent FA `validated`. |
| Milestone-producer sibling slices (`prd-versioning--create-or-capture-version`, `payments--manual-credit-pack-checkout`) | Cross-FA Scope Slice | ready | Slices that may emit milestone signals; this slice consumes them. |
| [Account & session](../feature-areas/account-session.md) | Sibling Feature Area | ready | Owner identity prerequisite. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

A signed-in founder sees a single non-blocking feedback prompt at each PRD-defined milestone, can submit short feedback or dismiss, sees the prompt at most once per milestone, and has their submission recorded with owner + milestone attribution — without blocking PRD work, without nagging on dismissal, and without exposing feedback content via the share surface.

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
