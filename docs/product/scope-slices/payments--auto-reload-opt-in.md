<!--
  Scope Slice scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
-->

# Scope Slice: Auto-reload opt-in (SCA-fallback aware)

## Parent Feature Area

[Payments](../feature-areas/payments.md)

## Status

`ready-for-user-stories`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** true — downstream User Story work for this slice is blocked until `credit-system` FA is unblocked.

---

## User Value

A founder enables auto-reload so that hitting a low-credit threshold during PRD work does not interrupt them — with explicit, predictable behavior on SCA (strong customer authentication) fallback per Q-020.

---

## Exact Boundary

### Included Behavior

- A signed-in owner enables auto-reload, choosing a tier and a low-credit trigger threshold (within PRD-defined bounds per Q-018/Q-019).
- The owner can disable auto-reload at any time.
- When the trigger fires and the saved payment method succeeds without SCA, the credit grant happens silently and the owner is notified after the fact (in-app).
- When the trigger fires and SCA is required (per Q-020), auto-reload **falls back** to a one-off SCA confirmation surface; the work that triggered the reload is paused / requeued until confirmation, and the owner sees an unambiguous prompt.

### Excluded Behavior

- Manual one-off purchases (sibling slice `manual-credit-pack-checkout`).
- Subscription / recurring billing — out of scope v0 (auto-reload is event-triggered, not time-recurring).
- Multi-method fallback (chain of payment methods) — single saved method in v0.
- Refund flows — out of scope.

---

## UX States

| State | When | What the user sees / experiences |
|-------|------|----------------------------------|
| Disabled (default) | Owner has never enabled auto-reload. | Surface explains what auto-reload does, what tier and threshold mean, and offers an opt-in affordance. |
| Enabling | Owner submits opt-in with tier and threshold. | Non-blocking progress; provider may require an initial setup confirmation. |
| Enabled (idle) | Auto-reload is active and threshold not yet hit. | Surface displays current configuration and a disable affordance. |
| Reload fired (silent success) | Trigger fired and provider charged without SCA. | Owner sees a deferred, non-blocking in-app notification confirming the grant. |
| Reload fired (SCA required) | Trigger fired and provider requires user confirmation. | Owner is presented with an unambiguous SCA prompt surface (Q-020 fallback); current work is paused / preserved. |
| Reload failure | Provider declines or errors. | Owner sees an actionable in-app message; no credits granted; auto-reload remains enabled but flagged for the owner's attention. |
| Disabling | Owner disables auto-reload. | Configuration is removed and confirmed; in-progress reload (if any) is allowed to complete or fail per provider semantics; idempotency on disable is preserved. |

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| Auto-reload configuration | Create / Update / Delete | Owner-scoped; stores tier + threshold + saved method reference. |
| Saved payment method | Reference (read) | Setup of the saved method happens via the provider; this slice does not store raw card data. |
| Purchase (auto-reload event) | Create | Each fired reload records a purchase with attribution = `auto-reload`. |
| Credit balance | Increment (idempotent) | Granted only on verified payment; idempotency keyed on the provider event id. |

---

## Credit / Payment Impact

Significant — auto-reload is an additional **producer** surface for credit grants, with the explicit Q-020 SCA-fallback behavior baked in.

---

## Sharing / Privacy Impact

None — payment surfaces are signed-in-owner-only; auto-reload status is not shared anonymously.

---

## Feedback / Instrumentation Impact

None at this slice — first auto-reload event could be a PRD milestone, consumed by `owner-milestone-feedback`.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Payments](../feature-areas/payments.md) | Feature Area | ready | Parent FA `validated`. |
| Sibling slice `manual-credit-pack-checkout` | Scope Slice (intra-FA) | ready | Establishes the purchase / receipt / idempotency primitives this slice reuses. |
| [Credit system](../feature-areas/credit-system.md) | Sibling Feature Area | blocked | Same upstream block as the manual slice (FA NEED_HUMAN). |
| External payment provider | External | acknowledged | Saved method + SCA semantics are part of the committed PRD posture. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| `credit-system` FA upstream is BLOCKED. | Promotion of this slice's User Stories to `ready-for-spec`. | true (upstream FA) |

---

## Acceptance-Level Outcome

A signed-in founder enables auto-reload with a chosen tier and threshold, and when the threshold is hit, credits are deterministically granted either silently on a successful charge or after an explicit SCA fallback prompt that pauses / preserves the triggering work — with idempotent grants on webhook replay, an in-app notification path, a disable affordance, and clearly actionable failure states. Manual purchase, refunds, and tax legibility are explicitly out of scope.

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
