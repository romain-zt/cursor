<!--
  User Story scaffolded under Phase 3 pilot.
-->

# User Story: Returning owner signs back in

## Parent Scope Slice

[Returning owner sign-in](../scope-slices/account-session--returning-owner-sign-in.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## Story

As a returning founder, I authenticate from the sign-in entry, so that I land at the post-auth entry as the same solo owner without losing account context.

---

## Acceptance Criteria

### AC-1 — Returning founder authenticates with valid credentials

- **Given** a founder owns an existing workspace and is at the sign-in entry without an active session
- **When** they submit valid credentials
- **Then** an authenticated session is opened for the **existing** owner, they arrive at the same post-auth entry used after signup, and solo-owner attribution is preserved

### AC-2 — Authentication progress is visible without enabling double-submit

- **Given** a founder has submitted credentials and the system is verifying them
- **When** they are waiting for the response
- **Then** the entry shows a non-blocking progress indication, the submit control is disabled to prevent double-submit, and the copy reassures the founder that sign-in is in progress

### AC-3 — Sign-in entry is distinct from signup

- **Given** a founder is at the sign-in entry
- **When** they view the entry
- **Then** the surface is clearly labeled as sign-in and not as signup, and there is no implicit "create a new account" path that would shadow the returning-founder intent

---

## UX States Covered

- Awaiting credentials (empty)
- Authenticating (in-progress)
- Session restored (success)

---

## Out of Scope

- Authentication error explanation — covered by sibling story US-002 (`auth-error-explained`).
- Already-signed-in edge on sign-in entry — covered by sibling story US-003 (`no-second-signin-when-signed-in`).
- New account registration — separate slice (Signup to signed-in dashboard).
- Specific credential technology beyond "returning founder can authenticate" — parent slice excludes (PRD does not fix magic link vs password-only at slice level).
- Credit, sharing, feedback flows — out of this Feature Area entirely.

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| User account | Authenticate | Verify an existing owner identity created via the signup slice; no new account is created. |
| Session | Open | Authenticated session opened for the existing owner at the post-auth entry; consistent with **in-app first** confirmation. |

---

## Credit / Payment Impact

None — inherits from parent slice: sign-in consumes no credits and does not open purchase or ledger flows.

---

## Sharing / Privacy Impact

None — inherits from parent slice: sign-in restores private signed-in access for the existing owner; no change to anonymous-readable surfaces.

---

## Feedback / Instrumentation Impact

None — inherits from parent slice: signing in is not itself a PRD-aligned owner milestone for feedback prompts.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Parent Scope Slice](../scope-slices/account-session--returning-owner-sign-in.md) | Scope Slice | ready | `ready-for-user-stories` as of 2026-05-25. |
| Signup slice US-001 (`account-created`) | Cross-slice User Story | ready | The returning-founder cohort exists only after signup has created an account upstream. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

A returning founder with valid credentials ends the flow with an authenticated session opened for the existing owner, lands at the same post-auth entry used after signup, and solo-owner attribution is preserved — without engaging authentication error explanation, already-signed-in handling, signup, or post-auth product flows in this story.

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
