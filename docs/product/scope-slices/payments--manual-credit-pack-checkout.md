<!--
  Scope Slice scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
-->

# Scope Slice: Manual credit pack checkout

## Parent Feature Area

[Payments](../feature-areas/payments.md)

## Status

`ready-for-user-stories`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** true — downstream User Story work for this slice is blocked until `credit-system` FA is unblocked (NEED_HUMAN at upstream FA). Slice scope itself is defined.

---

## User Value

A founder buys a one-off credit pack so they can continue AI-assisted PRD work past their starter grant — using a predictable price, a deterministic credit grant, and a clear receipt path.

---

## Exact Boundary

### Included Behavior

- A signed-in owner initiates a manual purchase of a credit pack from a clearly named entry surface.
- One of the PRD-defined pack tiers (per Q-018 burn tiers) is selected; pricing for that tier is shown before the owner commits.
- The owner is taken through a hosted payment surface (Stripe Checkout per PD-002 / PRD payment posture) and returns to the app with a deterministic outcome (success / failure / cancel).
- On success, the credit grant is recorded against the owner's balance with idempotency (no double-grant on retry / webhook replay).
- A receipt artifact (or receipt link) is available to the owner.

### Excluded Behavior

- Auto-reload behavior (separate slice `auto-reload-opt-in`).
- Tax / VAT line-item legibility (separate slice `tax-vat-legibility`).
- Refund / chargeback flows — out of v0 scope unless PRD says otherwise.
- Cross-currency selection beyond what the payment provider derives — deferred.
- The credit balance display surface in the app shell — owned by `credit-system` FA.

---

## UX States

| State | When | What the user sees / experiences |
|-------|------|----------------------------------|
| Awaiting selection | Owner reaches the manual purchase entry. | Tier choices with price and resulting credit amount; no payment in progress. |
| Submitting (provider redirect) | Owner confirms a tier. | Owner is taken to the hosted payment surface; controls disabled in-app; clear in-app indication that purchase is in progress externally. |
| Success return | Provider confirms payment and the app receives a verified callback. | Owner sees a confirmation page that names the granted credits and links to the receipt. |
| Cancel return | Owner cancels in the hosted surface. | Owner returns to a non-failing state in the app with no credits granted; can retry. |
| Failure return | Provider declines or errors. | Owner returns to an actionable in-app message; no credits granted; receipt / decline reason is conveyed if available. |
| Webhook replay edge | Same purchase event is delivered twice. | The second delivery does not duplicate the credit grant or the receipt; the owner sees no second confirmation. |

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| Purchase (manual credit pack) | Create | One-off purchase entity recording tier, price, currency, provider id, status. |
| Credit balance | Increment (idempotent) | Granted only on verified payment confirmation; idempotency keyed on the provider event id. |
| Receipt | Create | Provider-issued receipt or app-generated receipt link associated with the purchase. |
| User account | Read | Owner attribution. |

---

## Credit / Payment Impact

Significant — this slice is one of the **producer** surfaces for credit grants. Credit balance is incremented only on a verified payment success. Q-018 burn tiers govern available pack sizes; this slice does **not** define the tiers, it presents them.

---

## Sharing / Privacy Impact

None — payment surfaces are signed-in-owner-only; receipts are not shared anonymously by default.

---

## Feedback / Instrumentation Impact

None at this slice — the first successful purchase may be a PRD milestone in `owner-milestone-feedback`, but the prompt is consumed downstream, not produced here.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Payments](../feature-areas/payments.md) | Feature Area | ready | Parent FA `validated` as of 2026-05-25. |
| [Credit system](../feature-areas/credit-system.md) | Sibling Feature Area | blocked | FA `BLOCKED` (NEED_HUMAN: starter grant + burn tier sizing). This slice's User Stories cannot fully proceed without `credit-system` defining the credit primitive (balance object, idempotent increment contract). Slice scope itself stands. |
| [Account & session](../feature-areas/account-session.md) | Sibling Feature Area | ready | Owner identity prerequisite. |
| [Dashboard shell](../feature-areas/dashboard-shell.md) | Sibling Feature Area | ready | Purchase entry surfaced from a known navigation surface. |
| External payment provider (Stripe per PD-002 / PRD posture) | External | acknowledged | Hosted payment provider contract is committed at PRD level. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| `credit-system` FA upstream is BLOCKED (NEED_HUMAN: starter grant + burn tier sizing). | Promotion of this slice's User Stories to `ready-for-spec` (the credit grant contract must exist). | true (upstream FA) |

---

## Acceptance-Level Outcome

A signed-in founder selects a PRD-defined credit pack tier, confirms the purchase on a hosted payment surface, and on verified success returns to the app with credits deterministically granted, a receipt available, and no double-grant on webhook replay — and on cancel / failure returns to a non-failing in-app state with no credits granted. Auto-reload, tax legibility, and refunds are explicitly out of scope here.

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

**Verdict:** READY FOR USER STORIES (downstream blocked on `credit-system` FA)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded from approved Phase 4 slice proposal via `/feature-area scaffold-slices` | — |
| 2026-05-25 | Refined via `/feature-area refine-slice` (flagged downstream block on `credit-system`) | — |
| 2026-05-25 | Promoted to ready-for-user-stories after CLEAR readiness check (`/feature-area promote-slice`) | — |
