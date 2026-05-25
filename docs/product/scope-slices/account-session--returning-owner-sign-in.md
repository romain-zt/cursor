<!--
  Scoped from approved `/feature-area slice account-session` + parent Feature Area + PRD
-->

# Scope Slice: Returning owner sign-in

## Parent Feature Area

[Account & session](../feature-areas/account-session.md)

## Status

`ready-for-user-stories`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## User Value

A returning founder can sign back in and reach the signed-in experience without losing account context.

---

## Exact Boundary

### Included Behavior

- **Sign-in path for a returning founder** so they regain the signed-in operating surface (**same founder** as merchant/owner — `docs/prd/PRD.md` Product Surface).
- **Signed-in session** consistent with **one account owns projects and PRDs** (solo v0); account context (**identity for ownership**) is preserved relative to signup.

### Excluded Behavior

- **New account registration / first signup** — use **Signup to signed-in dashboard** sibling slice.
- **Multi-user**: invites, roles, co-editing (PRD Hard v0 exclusions); **merchant vs admin personas** separated from founder — none in v0.
- Default **invite-only/waitlist-only** acquisition as the shipping path — not the default Buyer entry framing for returning users.
- **Credit balance, deductions, recharge, Stripe, auto-reload** — billing and credit metering are separate Feature Areas.
- **Sharing**: mint/revoke read-only links, anonymous viewer flows — handled elsewhere (`docs/prd/PRD.md` sharing exclusions apply to viewer surface, not this signed-in ingress).
- Specific **credential technology** beyond “returning founder can authenticate” — **TBD** at UX/product detail (`docs/prd/PRD.md` does not fix magic link vs password-only at slice level).

---

## UX States

| State | When | What the user sees / experiences |
|-------|------|----------------------------------|
| Awaiting credentials (empty) | Returning founder lands on the sign-in entry without having submitted yet. | A clearly labeled sign-in entry distinct from signup; no error, no progress indicator, no implicit “create a new account” path. |
| Authenticating (in-progress) | Founder submits credentials and the system is verifying them. | Controls disabled to prevent double-submit; non-blocking progress indication; copy reassures that the founder is being signed back in. |
| Session restored (success) | Credentials verified; signed-in session is opened for the existing owner. | Founder arrives at the same signed-in post-auth entry used after signup; **solo-owner** attribution is preserved across the session. |
| Authentication error (error) | Credentials cannot be verified (wrong credentials, account not found, throttled retry, or similar). | Inline, actionable explanation that does not disclose which input is wrong in a way that creates an account enumeration risk; no session is opened; founder can retry without losing the entry context. |
| Already-signed-in (edge / gated) | A founder who is already authenticated reaches the sign-in entry. | Sign-in form is not shown; founder is sent to the signed-in post-auth entry, preserving the existing session. |

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| User account | Authenticate | Verify an **existing** owner identity created via the signup slice; no new account is created from this slice. |
| Session | Open | A new authenticated session is opened for the existing owner; consistent with **in-app first** confirmation (no external email/link as v0 default). |

---

## Credit / Payment Impact

None — sign-in consumes no credits and does not open purchase or ledger flows.

---

## Sharing / Privacy Impact

None — this slice restores private signed-in access for the owner; it does not change share-link visibility or anonymous reader surfaces.

---

## Feedback / Instrumentation Impact

None — milestone feedback attaches to PRD milestones (e.g. after generation/clarification), not to signing in alone (`docs/prd/PRD.md` Learning / feedback).

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Account & session](../feature-areas/account-session.md) | Feature Area | ready | Parent scope |
| Existing user account from signup lifecycle | Slice / precondition | ready | Provided by the now-`ready-for-user-stories` Signup slice; "returning founder" presupposes an account has been created upstream. |
| [Signup to signed-in dashboard](./account-session--signup-to-signed-in-dashboard.md) | Scope Slice | ready | Predecessor slice is `ready-for-user-stories` as of 2026-05-25; the "returning founder" cohort exists only after signup has run. |
| [Dashboard shell](../feature-areas/dashboard-shell.md) — signed-in landing surface | Sibling Feature Area | pending | Parent FA exists at `exploratory`; this slice does not require `dashboard-shell` to be `validated` — landing parity with the signup slice's post-auth entry is satisfied at the boundary where this slice ends; shell content choices are owned by the Dashboard shell FA. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

A founder who already has an account can **authenticate as returning owner**, arrive at the **signed-in web experience** used for PRD work, and the product continues to attribute **solo ownership** to that session—without covering **signup**, **collaborators**, **payment**, or **share-link** journeys in this slice.

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
