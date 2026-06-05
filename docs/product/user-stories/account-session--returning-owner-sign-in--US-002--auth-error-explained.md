<!--
  User Story scaffolded under Phase 3 pilot.
-->

# User Story: Authentication error is explained without account enumeration

## Parent Scope Slice

[Returning owner sign-in](../scope-slices/account-session--returning-owner-sign-in.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## Story

As a returning founder, I receive an actionable explanation when my sign-in cannot complete, so that I can retry without losing the entry context and without exposing whether the account exists.

---

## Acceptance Criteria

### AC-1 — Failed sign-in explains the issue actionably

- **Given** a founder has submitted credentials and the system cannot verify them (wrong credentials, account not found, throttled retry, or similar)
- **When** the system rejects the submission
- **Then** the entry shows an inline, actionable explanation, and the founder can retry without losing the sign-in entry context

### AC-2 — Explanation does not enable account enumeration

- **Given** a sign-in submission has failed
- **When** the explanation is shown
- **Then** the message does not disclose whether the account exists in a way that distinguishes "wrong credentials for existing account" from "account does not exist", and no second channel reveals that distinction either

### AC-3 — No session is opened on failure

- **Given** a sign-in submission has failed
- **When** the founder sees the explanation
- **Then** no authenticated session is opened, no post-auth entry is reached, and no second account is created

---

## UX States Covered

- Authentication error (error)

---

## Out of Scope

- Successful sign-in — covered by sibling story US-001 (`returning-owner-signs-in`).
- Already-signed-in edge — covered by sibling story US-003 (`no-second-signin-when-signed-in`).
- Account recovery, password reset, magic-link request — parent slice excludes credential-technology detail at slice level.
- Brute-force lockout policy beyond a generic "throttled retry" mention — out of this story (operational tuning beyond product scope).
- Credit, sharing, feedback flows — out of this Feature Area entirely.

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| User account | Read (existence + credential check) | No account is created or modified; existence-check semantics are constrained by anti-enumeration. |
| Session | Not opened | No session is opened; existing browser context is preserved. |

---

## Credit / Payment Impact

None — inherits from parent slice: a failed sign-in does not interact with credits, ledger, or purchase flows.

---

## Sharing / Privacy Impact

None — inherits from parent slice: a failed sign-in does not change anonymous-readable surfaces or share-link state. Anti-enumeration is a privacy posture inside this story, not a sharing surface change.

---

## Feedback / Instrumentation Impact

None — inherits from parent slice: sign-in failure is not a PRD-aligned owner milestone for feedback prompts.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Parent Scope Slice](../scope-slices/account-session--returning-owner-sign-in.md) | Scope Slice | ready | `ready-for-user-stories` as of 2026-05-25. |
| US-001 (`returning-owner-signs-in`) | Sibling User Story | ready | Logical sibling for the success path. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

A founder whose sign-in submission cannot complete receives an inline, actionable explanation that does not enable account enumeration, no session is opened, and the founder can retry without losing the entry context — without engaging the successful-sign-in path or already-signed-in handling in this story.

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
