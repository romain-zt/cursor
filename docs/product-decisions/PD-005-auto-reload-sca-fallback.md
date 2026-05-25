---
id: PD-005
status: approved
date: 2026-05-25
related_prd_version: v1
---

# PD-005 — Auto-reload as best-effort with SCA fallback

## Context

Q-020 (PRD v1) settled the EU-SCA friction in the auto-reload feature: the founder wanted opt-in convenience, but Strong Customer Authentication on off-session payments can break a silent reload. The PRD answer pinned this as "best-effort with manual fallback," which Q-020 also notes resolves a false-convergence risk raised by `/prd challenge`. Freezing the decision in a PD keeps the rationale and the **hard invariants** stable across PRD refactors and is required for the `payments` and `credit-system` Feature Areas to design coherently.

## Decision

Auto-reload is **opt-in, best-effort** with explicit SCA-aware fallback:

1. **Primary path.** Manual top-up via Stripe one-time payments remains the primary path. Auto-reload is an optional convenience layer.
2. **Opt-in only.** Auto-reload is never default-on. Enabling requires explicit founder action with a saved payment method (per Q-016 packs).
3. **Trigger.** When the post-grace credit balance hits a configured threshold (defined by `credit-system`), auto-reload attempts a one-time purchase of one of the standard packs (100 / 200 / 1000) using the saved payment method.
4. **Success path.** If the off-session charge succeeds without SCA challenge, credits are added and any blocked / pending generation resumes.
5. **SCA fallback.** If the provider requires Strong Customer Authentication or fails the off-session attempt, auto-reload **does not retry silently**. Instead:
   - The founder is shown the **manual recharge UX** with a clear explanation that authentication is required.
   - Any work that triggered the reload is **paused / preserved** until the founder manually confirms or authenticates.
   - Auto-reload stays enabled but flagged for the founder's attention.
6. **Hard invariants.**
   - **No hidden debt** — the balance is never quietly negative beyond the first-circuit grace ceiling (PD-004).
   - **No silent retry loop** — a failed auto-reload never re-attempts off-session in a loop.
   - **No subscription** — auto-reload buys discrete prepaid packs, not a recurring product (Q-015, Q-016).
7. **Generation block.** Until a successful recharge (auto or manual) lands, paid AI generation remains blocked at zero balance.

## Consequences / tradeoffs

- **Pros.** Preserves the founder convenience auto-reload promises while staying honest about EU-SCA reality. Hard invariants give engineering a clear "what must never happen" list to test against. Fallback UX keeps trust intact when off-session payments fail.
- **Cons.** Auto-reload is not "fully silent" — some founders may still get interrupted by SCA challenges, which can feel like a regression from the marketing of "convenience." Implementation surface includes both off-session and on-session flows in `payments`. Auto-reload trigger threshold is parameterizable, adding configuration burden.
- **Reversibility.** Reversible: a future PD could remove auto-reload entirely (manual top-up still works). Migration of opted-in users would simply disable their auto-reload preference; no data destruction.

## Links

- PRD: `docs/prd/PRD.md`
- Question source: `docs/prd/questions/open-questions.md` (Q-020)
- Related PDs: PD-003 (burn tiers), PD-004 (grace ceiling).
