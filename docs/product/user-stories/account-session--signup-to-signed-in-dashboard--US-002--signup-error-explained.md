<!--
  User Story scaffolded under Phase 3 pilot.
-->

# User Story: Signup error is explained without leaking signup state

## Parent Scope Slice

[Signup to signed-in dashboard](../scope-slices/account-session--signup-to-signed-in-dashboard.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## Story

As a new founder, I receive an actionable explanation when my signup cannot complete, so that I can correct the input and retry without losing the entry context or ending up with a partial account.

---

## Acceptance Criteria

### AC-1 — Failed signup explains the issue actionably

- **Given** a founder has submitted the signup form and the input or environment does not allow account creation (invalid email shape, missing required field, account-already-exists conflict, or similar)
- **When** the system rejects the submission
- **Then** the entry shows an inline, actionable explanation tied to the failing input, and the founder can correct the input and retry without losing the signup entry context

### AC-2 — No partial account or session is created on failure

- **Given** a signup submission has failed
- **When** the founder sees the explanation
- **Then** no user account exists for that submission, no authenticated session is opened, and no post-auth entry is reached

### AC-3 — Error explanation does not leak signup state to other channels

- **Given** a signup submission has failed
- **When** the explanation is shown
- **Then** the failure is communicated **in-app first** (no email or external channel as v0 default), and the explanation does not disclose which existing identifier collides in a way that creates an account-enumeration risk

---

## UX States Covered

- Signup error (error)

---

## Out of Scope

- Successful signup path — covered by sibling story US-001 (`account-created`).
- Already-signed-in edge — covered by sibling story US-003 (`no-duplicate-when-signed-in`).
- Account recovery, password reset, magic-link flows — not part of this Scope Slice (parent slice excludes credential-technology detail at slice level).
- Credit, sharing, feedback flows — out of this Feature Area entirely.

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| User account | Read (existence check during validation) | No account is created or modified on a failed submission; existence check may inform a generic "account exists" path without identifier-specific disclosure. |
| Session | Not opened | No session is opened; existing browser context is preserved. |

---

## Credit / Payment Impact

None — inherits from parent slice: a failed signup does not deduct credits, does not open a purchase flow, does not interact with the credit ledger.

---

## Sharing / Privacy Impact

None — inherits from parent slice: a failed signup does not change anonymous-readable surfaces or share-link state. Account-enumeration protection is a privacy posture inside this story, not a sharing surface change.

---

## Feedback / Instrumentation Impact

None — inherits from parent slice: signup failure is not a PRD-aligned owner milestone for feedback prompts.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Parent Scope Slice](../scope-slices/account-session--signup-to-signed-in-dashboard.md) | Scope Slice | ready | `ready-for-user-stories` as of 2026-05-25. |
| US-001 (`account-created`) | Sibling User Story | ready | Logical sibling for the success path; this story is the error counterpart. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

A founder whose signup submission cannot complete receives an inline, actionable explanation, no account or session is created, the founder can correct and retry without losing entry context, and the explanation does not enable account enumeration — without engaging the successful-signup path or already-signed-in handling in this story.

---

## Readiness for Spec

- [x] Story in standard form ("As X, I do Y, so that Z")
- [x] 2-5 inline Acceptance Criteria in Given/When/Then form
- [x] UX states covered are a non-empty subset of the parent Scope Slice
- [x] Out of scope explicitly named
- [x] Data touched named as product objects (no implementation detail)
- [x] Credit / payment impact inherited from parent slice
- [x] Sharing / privacy impact inherited from parent slice
- [x] Feedback / instrumentation impact assessed
- [x] All dependencies named and their status known
- [x] All blockers resolved or NEED_HUMAN=true explicitly set
- [x] Acceptance-level outcome is behavioral (not a test or code spec)

**Verdict:** READY FOR SPEC

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded from approved `/user-story propose` (Phase 3 pilot) via `/user-story scaffold` | — |
| 2026-05-25 | Refined via `/user-story refine` (Phase 3 pilot — all product-level sections filled in one pass) | — |
| 2026-05-25 | Promoted to ready-for-spec after CLEAR readiness check (`/user-story promote`) | — |
