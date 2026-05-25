<!--
  User Story scaffolded under Phase 3 pilot.
-->

# User Story: Already-signed-in founder is not asked to sign in again

## Parent Scope Slice

[Returning owner sign-in](../scope-slices/account-session--returning-owner-sign-in.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## Story

As an already-authenticated founder, I am not shown the sign-in form when I reach the sign-in entry, so that my existing session is preserved and I am steered to the signed-in experience.

---

## Acceptance Criteria

### AC-1 — Sign-in form is not shown to an already-signed-in founder

- **Given** a founder has an active authenticated session as the owner of an existing workspace
- **When** they reach the sign-in entry
- **Then** the sign-in form is not shown, and the founder is sent to the signed-in post-auth entry

### AC-2 — Existing session is preserved unchanged

- **Given** an already-signed-in founder reaches the sign-in entry
- **When** the redirect to the post-auth entry happens
- **Then** the existing authenticated session is preserved without being reopened or rotated by this story, and solo-owner attribution remains intact

---

## UX States Covered

- Already-signed-in (edge / gated)

---

## Out of Scope

- Successful sign-in from an unauthenticated entry — covered by sibling story US-001 (`returning-owner-signs-in`).
- Authentication error explanation — covered by sibling story US-002 (`auth-error-explained`).
- Account-switching between multiple owners — multi-user is a v0 Hard exclusion.
- Sign-out before sign-in intent — out of this story; sign-out belongs to a separate slice / future story.

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| Session | Read | The existing authenticated session is read to detect the already-signed-in condition; not opened or rotated. |
| User account | Read | The existing owner identity is read for attribution preservation; no account state changes. |

---

## Credit / Payment Impact

None — inherits from parent slice: the redirect does not interact with credits or purchase flows.

---

## Sharing / Privacy Impact

None — inherits from parent slice: the redirect preserves the private signed-in workspace context; no change to anonymous-readable surfaces.

---

## Feedback / Instrumentation Impact

None — inherits from parent slice: the redirect is not a PRD-aligned owner milestone for feedback prompts.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Parent Scope Slice](../scope-slices/account-session--returning-owner-sign-in.md) | Scope Slice | ready | `ready-for-user-stories` as of 2026-05-25. |
| US-001 (`returning-owner-signs-in`) | Sibling User Story | ready | Establishes the existence of an active session whose preservation this story guarantees. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

An already-authenticated founder reaching the sign-in entry is sent to the post-auth entry without seeing the sign-in form, the existing session is preserved unchanged, and solo-owner attribution remains intact — without engaging the successful-sign-in path or authentication error handling in this story.

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
