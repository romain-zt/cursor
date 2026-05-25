---
id: PD-004
status: approved
date: 2026-05-25
related_prd_version: v1
---

# PD-004 — First-circuit grace: 20-credit ceiling with pre-check gate

## Context

Q-019 (PRD v1) replaced the vague "slightly exceeds" first-circuit grace language with a hard, founder-anchored rule. Freezing it in a durable PD prevents drift back to ambiguity in any future PRD refactor and gives the `credit-system` Feature Area an explicit overage policy.

## Decision

The first-circuit grace policy is **fixed at 20 extra credits**:

1. **Scope.** Applies **once**, during the **first PRD circuit** for a new account.
2. **Pre-check gate.** Before starting any AI operation, the system computes the **projected** credit cost. If `projected_overage > 20`, the operation is **blocked outright** — the grace ceiling cannot be exceeded by starting a too-expensive call.
3. **In-flight completion.** If `projected_overage <= 20`, the operation runs to completion even if the running balance dips below zero by up to 20 credits.
4. **After grace fires.** Once the grace has been consumed (any negative balance reached), the founder is shown the recharge modal: buy credits now, enable auto-reload, or continue blocked.
5. **Post-first-circuit.** No grace applies. Paid AI is **blocked at zero balance** unless auto-reload covers it (governed by PD-005).
6. **No silent re-use.** The grace cannot be re-armed by re-creating an account, switching projects, or other workaround paths (anti-abuse posture).

## Consequences / tradeoffs

- **Pros.** Eliminates the "slightly exceeds" ambiguity — operations team knows exactly when to allow / block. Avoids a bad first-use interruption mid-response. Pre-check gate prevents the grace from being weaponized to run an unbounded expensive call. Anchors `credit-system` FA design for the overage edge.
- **Cons.** 20 is a fixed magic number; if real burn rates change, 20 may feel either tight or generous (mitigated: `credit-system` design can re-evaluate, requiring a new PD if changed). Pre-check requires reliable cost projection per operation, adding implementation surface in `credit-system`.
- **Reversibility.** Reversible by superseding PD. Existing usage history would not need a migration; the rule applies forward-only.

## Links

- PRD: `docs/prd/PRD.md`
- Question source: `docs/prd/questions/open-questions.md` (Q-019)
- Related PDs: PD-003 (burn tiers), PD-005 (auto-reload SCA fallback).
