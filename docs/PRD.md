# PRD — Cursor AIflow

> This document is product-only. No stack, no tech, no framework.
> Technical feasibility constraints are allowed in the dedicated section below.

---

## Product vision

A minimal execution framework that transforms a vague project idea into a stable, scoped, AI-assisted delivery machine — without becoming organizational overhead.

The system answers one question at all times:

```
What do we do now, why, in what scope, with what dependencies, at what risk, with what proof of completion?
```

---

## Target user

A solo developer or small team using Cursor AI, working on one or several projects simultaneously, who:

- has ideas but struggles to stay focused on execution
- tends to scope-creep or context-switch under pressure
- wants AI to act as a structured execution partner, not a code generator
- needs to ship real value without managing a fake AI organization

---

## Problem

Without structure, Cursor:
- starts coding from vague or contradictory inputs
- drifts into scope that wasn't asked for
- loses context between sessions
- repeats work or contradicts earlier decisions
- generates process instead of product

Without constraint, AI-assisted development becomes:
- impressive in documentation
- weak in delivery
- slower than regular development

---

## Promise

Cursor AIflow gives you:
- always-clear next action
- bounded execution that doesn't drift
- explicit assumptions instead of silent hallucinations
- decisions that don't disappear between sessions
- a system you can maintain in under 15 minutes per day

---

## Workflows

### 1. Bootstrap

```
New project idea
→ SISO check
→ PRD
→ SPEC_QUEUE (3 specs max to start)
→ EXECUTION_LOCK (1 spec to start)
→ first PR
```

### 2. Execution cycle

```
Read CURRENT_STATE
→ check EXECUTION_LOCK
→ if locked: execute
→ if not locked: apply checkers → lock 1–3 specs → execute
→ Docs Checker
→ update CURRENT_STATE
→ Complexity Budget check
→ next action
```

### 3. Decision handling

```
Decision needed
→ NEED_HUMAN if irreversible or costly
→ ACCEPTED_WITH_ASSUMPTIONS if safe to assume
→ log in DECISIONS.md either way
→ unblock spec
```

### 4. Scope protection

```
PR in progress
→ Scope Checker
→ out-of-scope found?
→ create candidate spec in SPEC_QUEUE
→ do not implement now
```

---

## Business goals

1. Cursor sessions are always grounded — no context drift, no stale state
2. Every PR traces back to a spec, every spec traces back to the PRD
3. The system doesn't grow unless growth is justified by evidence
4. Partial scopes never silently ship incomplete features
5. Human intervention is required rarely and only for the right decisions

---

## Success criteria

- A new project reaches its first useful PR within 1 execution cycle
- Session starts with a clear "next action" in under 2 minutes
- Zero PRs without a SPEC-ID
- Zero specs without an accepted PRD link
- Zero new docs/agents/rules created without a documented justification
- Zero partial scopes in production without explicit debt tracking

---

## Constraints (business)

- The system must not require more than 15 min/day of human maintenance
- The system must not create more than 1 new document per execution cycle
- The system must not require human decisions more than 3 times simultaneously (NEED_HUMAN cap)
- The system must stay useful across multiple concurrent projects (Z Slot, PayloadCMS AI, Z Checkout)

---

## Technical feasibility constraints

> Not tech choices. Structural constraints that affect the product.

- The system depends entirely on Cursor reading `.cursor/rules/core.md` consistently
- CURRENT_STATE.md is the highest-priority context injection — if stale, the session is corrupted
- SPEC_QUEUE.md and EXECUTION_LOCK.md must never conflict (one spec cannot be in both NOW and LOCK with different state)
- Any spec touching payment, auth, or external APIs must use the HIGH risk flow — this is non-negotiable

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cursor ignores rules under long context | HIGH | CURRENT_STATE.md is always first, short and explicit |
| Human stops maintaining docs under pressure | CRITICAL | Fewer docs, mandatory Docs Checker |
| System generates more process than product | CRITICAL | Complexity Budget Checker at every cycle end |
| Assumptions silently become truth | HIGH | ACCEPTED_WITH_ASSUMPTIONS must be logged and reviewed |
| Partial scopes accumulate untracked debt | HIGH | Debt fields required, no prod without review |
| NEED_HUMAN blocks execution | MEDIUM | Cap at 3, strict qualification criteria |
