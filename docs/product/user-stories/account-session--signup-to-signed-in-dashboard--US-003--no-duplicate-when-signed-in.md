<!--
  User Story scaffolded under Phase 3 pilot.
-->

# User Story: Already-signed-in founder cannot create a duplicate account

## Parent Scope Slice

[Signup to signed-in dashboard](../scope-slices/account-session--signup-to-signed-in-dashboard.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## Story

As an already-authenticated founder, I am not allowed to create a second account from the signup entry, so that my solo-owner attribution remains intact and I am steered toward the signed-in experience.

---

## Acceptance Criteria

### AC-1 — Already-signed-in founder is redirected, signup form is not shown

- **Given** a founder has an active authenticated session as the owner of an existing workspace
- **When** they reach the signup entry
- **Then** the signup form is not shown, and the founder is sent to the signed-in post-auth entry, preserving the existing session

### AC-2 — No second account is created from this edge

- **Given** an already-signed-in founder reaches the signup entry
- **When** the redirect to the post-auth entry happens
- **Then** no second user account is created and the original solo-owner attribution remains intact

---

## UX States Covered

- Already-signed-in redirect (edge / gated)

---

## Out of Scope

- Successful signup from an unauthenticated entry — covered by sibling story US-001 (`account-created`).
- Signup error explanation — covered by sibling story US-002 (`signup-error-explained`).
- Account-switching between multiple owners — multi-user is a v0 Hard exclusion.
- Sign-out before signup intent — out of this story; sign-out belongs to a separate slice / future story.

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| Session | Read | The existing authenticated session is read to detect the already-signed-in condition. |
| User account | Read | The existing owner identity is read for attribution preservation; no new account is created. |

---

## Credit / Payment Impact

None — inherits from parent slice: the redirect does not interact with credits or purchase flows.

---

## Sharing / Privacy Impact

None — inherits from parent slice: the redirect preserves the existing private signed-in workspace context; no change to anonymous-readable surfaces.

---

## Feedback / Instrumentation Impact

None — inherits from parent slice: the redirect is not a PRD-aligned owner milestone for feedback prompts.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Parent Scope Slice](../scope-slices/account-session--signup-to-signed-in-dashboard.md) | Scope Slice | ready | `ready-for-user-stories` as of 2026-05-25. |
| US-001 (`account-created`) | Sibling User Story | ready | Establishes the existence of an account whose session this story preserves. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

An already-authenticated founder reaching the signup entry is redirected to the signed-in post-auth entry without seeing the signup form, no second account is created, and the original solo-owner attribution is preserved — without engaging the successful-signup path or signup error explanation in this story.

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
