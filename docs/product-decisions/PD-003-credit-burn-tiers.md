---
id: PD-003
status: approved
date: 2026-05-25
related_prd_version: v1
---

# PD-003 — Credit burn tier model

## Context

Q-018 (PRD v1) defined a directional burn model so that the 100 / 200 / 1000 credit packs (Q-016) map to recognizable founder value. The PRD captures this as a product assumption tied to credit economics. Freezing it in a durable PD keeps the rationale intact independent of future PRD refactors and gives the `credit-system` Feature Area an explicit cost model to design against.

## Decision

Adopt the following **directional burn table** for AI operations in v0. Final per-operation costs are operator-tunable in configuration, but the **tier structure** is a product commitment:

| AI operation tier | Burn (credits) |
|---|---:|
| Lightweight clarification step | 1 |
| Standard decision / clarification step | 3 |
| Dynamic mini-form decision step | 5 |
| PRD version generation or major PRD update | 10 |
| PRD challenge / convergence pass | 15 |

Pack legibility anchors (informational, not normative):
- 100 credits → meaningful first PRD circuit.
- 200 credits → deeper iteration.
- 1000 credits → power / multi-project use.

This table governs how the `credit-system` Feature Area models the credit ledger and how the `payments` Feature Area presents pack value to the founder.

## Consequences / tradeoffs

- **Pros.** Founder-legible packs (100/200/1000 map to obvious "amounts of work"). Burn rates are tunable per operation without changing the **tier structure**, so the product narrative stays stable while ops can rebalance. Gives the `credit-system` FA a concrete cost vector to design against, unblocking part of its `NEED_HUMAN` flag (burn-tier sizing).
- **Cons.** Per-operation costs are still tunable, so users may see slight drift between releases (mitigated by tier labels in the UI rather than raw numbers). Tiered model assumes AI operations can be classified — operations that don't cleanly map need an explicit assignment in design.
- **Reversibility.** Reversible: the tier table can be rewritten as a new PD if the burn model changes. Existing credit ledgers would need a migration plan if costs are renumbered post-launch.

## Links

- PRD: `docs/prd/PRD.md`
- Question source: `docs/prd/questions/open-questions.md` (Q-018)
- Related PDs: PD-002 (stack baseline), PD-004 (grace ceiling), PD-005 (auto-reload SCA fallback).
