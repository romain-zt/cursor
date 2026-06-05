<!--
  Scoped from approved `/feature-area slice account-session` + parent Feature Area + PRD
-->

# Scope Slice: Signup to signed-in dashboard

## Parent Feature Area

[Account & session](../feature-areas/account-session.md)

## Status

`ready-for-user-stories`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## User Value

A new founder can complete open self-serve signup and land in the signed-in product with a clear path toward PRD work.

---

## Exact Boundary

### Included Behavior

- First-time acquisition via **public self-serve signup** as the default v0 path (aligned with Buyer entry point — no waitlist/invite gate as the default).
- Creating a **single-owner** user account consistent with Journey 1 (Sign up → land in dashboard) and Operating Model (**one account owns** projects and PRDs).
- Ending in a **signed-in session** at the primary post-signup entry (dashboard); downstream flows assume an identifiable owner (**solo v0**).

### Excluded Behavior

- Waitlist-only or invite-only acquisition as the **default** v0 path; **multi-user** collaboration (invites, roles, co-editing — PRD Hard v0 exclusions).
- A **separate merchant or admin** persona — the same signed-in founder is the operating surface in v0 (`docs/prd/PRD.md` Product Surface).
- **Credit packs, ledger, checkout, Stripe, auto-reload, or recharge UX** — credit and payments are other Feature Areas; sign-in/session does not sell or deduct credits here.
- **Share links, anonymous viewers, revoke/disable link, noindex** — sharing is out of this slice’s boundary (other Feature Areas).
- **Concrete dashboard/project UI** beyond “land signed-in” and a **TBD** product-level path toward PRD/project work (`docs/prd/PRD.md` Core User Journey 1 mentions non-PRD areas may show **under construction** — framing only, no delivery mandate in this slice).

---

## UX States

| State | When | What the user sees / experiences |
|-------|------|----------------------------------|
| Awaiting input (empty) | Founder lands on the signup entry without having submitted yet. | A clearly labeled self-serve signup entry with the inputs needed to create an account; no error, no progress indicator, no “sign-in” pre-selected path. |
| Submitting (in-progress) | Founder confirms account creation and the system is processing the new account. | A non-blocking progress indication; controls disabled so the founder cannot double-submit; copy reassures that account creation is underway. |
| Signed-in landed (success) | Account is created and the session is established at the post-auth entry. | Founder arrives at the signed-in web app entry as the **single owner**; the surface makes the next step toward PRD work legible, even if non-PRD areas are framed as **under construction**. |
| Signup error (error) | Submission cannot create an account (e.g. invalid email shape, missing required field, account-already-exists conflict). | An inline, actionable explanation tied to the failing input; no account is created; founder can correct and retry without losing context; no partial session is opened. |
| Already-signed-in redirect (edge / gated) | An already-authenticated founder reaches the signup entry. | Signup form is not shown; founder is sent to the signed-in post-auth entry instead, preserving solo-owner attribution; no second account is created. |

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| User account | Create | New owner identity established with **solo-owner** scope (Operating Model: one account owns projects and PRDs); no team / invite / role objects created. |
| Session | Open | Authenticated session is opened for the new owner at the post-auth entry; consistent with **in-app first** confirmation (no external email/link confirmation as v0 default). |

---

## Credit / Payment Impact

None — no prepaid credit deduction, balance gate, recharge modal, purchase, or auto-reload in this slice.

---

## Sharing / Privacy Impact

None — no share link issuance, revocation, or anonymous-readable surface changes; private signed-in workspace context only.

---

## Feedback / Instrumentation Impact

None — PRD-aligned **owner feedback** milestones (e.g. first PRD version generated) occur after downstream PRD work, not solely as a signup outcome (`docs/prd/PRD.md` Success Metrics / Learning).

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Account & session](../feature-areas/account-session.md) | Feature Area | ready | Parent boundaries and solo-owner stance |
| `docs/prd/PRD.md` — Buyer entry point, Journey 1, Operating Model | PRD constraint | ready | Public signup default; dashboard landing |
| [Dashboard shell](../feature-areas/dashboard-shell.md) — signed-in landing surface | Sibling Feature Area | pending | Parent FA exists at `exploratory`; this slice does not require `dashboard-shell` to be `validated` — the PRD's Journey 1 (Sign up → land in dashboard, non-PRD areas may show **under construction**) is satisfied at the boundary where this slice ends; shell content choices are owned by the Dashboard shell FA. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

A founder without an existing account can use **default public signup**, complete account creation intended for **one owner**, and arrive **signed in** at the web app’s post-auth entry consistent with Journey 1, such that downstream v0 behaviors can assume **solo ownership**—without enabling **multi-user**, **non-default gated acquisition**, or **payment/credit** flows in this slice.

---

## Readiness for User Stories

<!-- Fill before marking ready-for-user-stories -->

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
| 2026-05-09 | Scaffolded from approved `/feature-area slice account-session` via `/feature-area scaffold-slices` | — |
| 2026-05-25 | Promoted to ready-for-user-stories after CLEAR readiness check (`/feature-area promote-slice`) | — |
