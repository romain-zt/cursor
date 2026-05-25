<!--
  Feature Area — scaffolded from approved map + docs/prd/PRD.md
-->

# Feature Area: Payments

## Status

`validated`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## PRD Source

- `docs/prd/PRD.md` § Payment model (Stripe one-time, packs, auto-reload); § Integration Boundaries (Payments); § Configuration Matrix (markets, provider, pack denominations, list prices operator-config); § Feature Groups (FG-PRD-V0 — Credit system bridge to Stripe); § Core User Journeys (6); § Risks (Payments & tax; Auto-reload / SCA)
- Related open questions: Q-015, Q-016 (answered — Stripe, FR/EU+US, pack sizes, operator-config pricing)
- Related product decisions: none

---

## Product Intent

The founder can **buy prepaid credit packs** (**100 / 200 / 1000** credits) using **Stripe one-time checkout** in **France/EU + US**, with **clear VAT/tax handling** for digital AI credits as a **product requirement** (details not specified here). They may **opt in** to **auto-reload** that buys **one** of the same packs via a **saved payment method** as a **best-effort convenience**, **never** presented as a subscription; if auto-reload fails or needs authentication (e.g. EU/SCA), the product falls back to **manual recharge UX** while paid AI stays blocked until resolved.

---

## In Scope

- Manual **top-up** path via **Stripe** one-time payment for **100 / 200 / 1000** credit packs (prepaid quantities only, not “N PRDs”).
- **Launch markets:** FR/EU + US per PRD.
- **Opt-in auto-reload** that purchases one prepaid pack using a saved payment method when rules trigger; success adds credits; failure routes to manual recharge messaging.
- Product-level clarity that auto-reload is **prepaid refill**, **not** a subscription, and **not** required to finish the first PRD flow.
- Legible tax/VAT posture for **digital AI credits** to users in supported markets (per PRD intent).

## Out of Scope

- Subscription billing, BYOK, unlimited free AI (Hard v0 exclusions).
- Choosing implementation-specific payment edge cases beyond PRD’s SCA/manual-fallback story (this FA states product behavior, not integration specs).
- Setting fixed EUR/USD list prices in the PRD (operator-config per Q-016).

---

## Business Objects Touched

| Object | Relationship |
|--------|----------------|
| Credit pack purchase | Record/acknowledge completed one-time pack purchases that increase prepaid credits |
| Auto-reload preference / saved instrument | Product-level intent: opt-in convenience tied to saved payment method (coordination with Credit system for when reload fires) |

---

## User Journeys Touched

- Journey 6 — Recharge UX after grace or at zero: **buy pack**, enable **opt-in auto-reload**, or defer with **paid AI blocked**; manual path when auto-reload cannot complete.

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Credit system | pending | Ledger must apply purchased credits correctly |
| **Stripe** as named provider | ready | Integration Boundaries |

---

## Risks

- **Auto-reload / SCA** (PRD): EU/France off-session charges may require authentication — must feel like a designed **manual recharge fallback**, not a broken loop.
- **Payments & tax legibility** (PRD): users must understand what they pay and why (VAT/tax story).

---

## Open Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

*Operator-config **list prices** are tuning, not an open PRD question row; track in ops/commercial planning.*

---

## Candidate Scope Slices

| Slice | Description | Status |
|-------|-------------|--------|
| Manual credit pack checkout | Owner buys a 100/200/1000 pack via one-time payment and receives credits. | exploratory |
| Auto-reload opt-in and outcomes | Owner enables auto-reload; success continues generation; failure/SCA routes to manual recharge UX with clear copy. | exploratory |
| Tax/VAT legibility | Purchase and receipts communicate digital-credits tax stance clearly in supported markets. | exploratory |

---

## Readiness Verdict

- [x] PRD source sections read
- [x] Product intent stated without technical language
- [x] Business objects enumerated
- [x] User journeys identified
- [x] In-scope / out-of-scope explicitly separated
- [x] No unresolved PRD open questions affecting this area
- [x] Deferred behaviors explicitly named
- [x] Candidate Scope Slices are individually small enough

**Verdict:** READY FOR SCOPE SLICES

### Delivery Readiness

- [x] DR-01 — Status is `validated` at audit time
- [x] DR-02 — Direct FA dependency `credit-system` has a scaffolded file (status `exploratory`, but file exists); Stripe is a PRD constraint, not an FA
- [x] DR-03 — Governing Product Decisions are `approved` (PD-002 stack baseline, PD-003 burn tiers, PD-005 auto-reload SCA)
- [ ] **DR-04 — FAIL.** Direct dependency `credit-system` carries `NEED_HUMAN: true` (PRD Surface Blocker: operator-config `X` undefined; plus the FA itself has not been promoted from `exploratory`). Investing in detailed downstream User Story / Spec work for credit-bearing flows is therefore blocked.
- [x] DR-05 — At least one Scope Slice is `ready-for-user-stories` (both v0 slices are)

**Verdict:** NOT READY FOR VERTICAL DELIVERY — blocked by DR-04 (`credit-system` NEED_HUMAN=true).

**Unblock path:** resolve the operator-config-X question on `credit-system`, promote `credit-system` from `exploratory` to `validated`, then re-run `/feature-area clear-for-vertical payments`. See `docs/prd/notes/2026-05-25-delivery-readiness-backfill.md`.

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-09 | Initial scaffold from approved Feature Area map (`/feature-area scaffold`) | — |
| 2026-05-25 | Promoted to validated after CLEAR readiness check (`/feature-area promote`) | — |
| 2026-05-25 | Delivery readiness audited (PD-006); held at validated — DR-04 fails on `credit-system` dependency | — |
