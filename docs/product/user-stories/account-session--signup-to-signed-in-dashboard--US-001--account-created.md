<!--
  User Story scaffolded from approved /user-story propose for Scope Slice
  account-session--signup-to-signed-in-dashboard. Pilot under Phase 3 of plan
  "Zedos verticale + post-slice" (2026-05-25).
-->

# User Story: Account created from signup entry

## Parent Scope Slice

[Signup to signed-in dashboard](../scope-slices/account-session--signup-to-signed-in-dashboard.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## Story

As a new founder, I complete public self-serve signup from the signup entry, so that I arrive signed in at the post-auth entry as the sole owner of my workspace.

---

## Acceptance Criteria

### AC-1 — Founder completes signup with valid inputs

- **Given** a founder is at the signup entry without an active session and has provided the inputs required to create an account
- **When** they submit the signup form
- **Then** an account is created with the founder as the **single owner**, an authenticated session is opened, and they land at the post-auth entry consistent with Journey 1

### AC-2 — Submission progress is visible without enabling double-submit

- **Given** a founder has submitted the signup form and the system is processing account creation
- **When** they are waiting for the response
- **Then** the entry shows a non-blocking progress indication, the submit control is disabled to prevent double-submit, and the copy reassures the founder that account creation is underway

### AC-3 — Post-auth entry reflects solo-owner attribution

- **Given** a founder has just completed signup
- **When** they land at the post-auth entry
- **Then** the surface attributes ownership to that founder alone (Operating Model: one account owns projects and PRDs), the next step toward PRD work is legible, and non-PRD surfaces are framed as **under construction** rather than as shipped scope

---

## UX States Covered

- Awaiting input (empty)
- Submitting (in-progress)
- Signed-in landed (success)

---

## Out of Scope

- Signup error explanation — covered by sibling story US-002 (`signup-error-explained`).
- Already-signed-in redirect — covered by sibling story US-003 (`no-duplicate-when-signed-in`).
- Credit pack purchase, recharge UX, Stripe checkout — out of this Feature Area entirely; covered by Credit System / Payments Feature Areas.
- Share link creation or anonymous viewer access — out of this Feature Area entirely.
- Concrete dashboard / project UI beyond "land signed-in" — parent slice already excludes; Dashboard shell FA owns.

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| User account | Create | New owner identity established with **solo-owner** scope; no team / invite / role objects created. |
| Session | Open | Authenticated session opened at the post-auth entry; consistent with **in-app first** confirmation. |

---

## Credit / Payment Impact

None — inherits from parent slice: signup does not deduct credits, does not open a purchase flow, does not interact with the credit ledger.

---

## Sharing / Privacy Impact

None — inherits from parent slice: signup opens a private signed-in workspace context only; no share link, no anonymous-readable surface change.

---

## Feedback / Instrumentation Impact

None — inherits from parent slice: PRD-aligned owner feedback milestones (first PRD version generated, etc.) occur after downstream PRD work, not on signup completion.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Parent Scope Slice](../scope-slices/account-session--signup-to-signed-in-dashboard.md) | Scope Slice | ready | `ready-for-user-stories` as of 2026-05-25. |
| [Dashboard shell](../feature-areas/dashboard-shell.md) — landing surface | Sibling Feature Area | pending | Same product-level pending as the parent slice; this story does not require dashboard-shell `validated`. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

A new founder using public self-serve signup with valid inputs ends the flow with an account created under solo-owner attribution and an authenticated session landing them at the post-auth entry consistent with Journey 1 — without engaging signup error explanation, already-signed-in handling, credits, sharing, or feedback flows in this story.

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
