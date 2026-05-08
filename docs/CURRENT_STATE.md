# CURRENT_STATE

> Read this first. Always.
> This is the operational memory of the system.
> If it's stale, the session is corrupted — update it before doing anything else.

---

## Last updated

2026-05-08

---

## Current goal

Onboard and execute **ZedCheckout**: WhatsApp AI front-end + booking engine with Shopify as the pluggable commerce backbone (`docs/PRD-ZCHECKOUT.md`).

Deferred until reprioritized: PayloadCMS AI; Little Biceps / Z Slot (may converge later).

Next step: refine SPEC-ZC-001 → NOW + checker pass → EXECUTION_LOCK (Shopify connect slice first).

---

## Active specs

None. EXECUTION_LOCK is empty.

---

## Current branch

`setup-V2`

---

## Recent decisions

- DECISION-001: Adopted Cursor AIflow V0 architecture (constrained, minimal artifacts, checkers over agents)
- DECISION-002: Replaced TRD.md (fixed org chart) with TEAM_SETUP.md (diagnostic-driven capability allocator)
- DECISION-003: Onboarded ZedCheckout as first execution project (`docs/PRD-ZCHECKOUT.md`)

---

## Known blockers

- Initial ZedCheckout specs are in BACKLOG — none READY for lock until dependency checker + risk classification complete
- WhatsApp + Shopify production constraints (templates, scopes, payments alignment) need Architect review before NOW promotion

---

## Active assumptions

| ID | Assumption | Risk | Validation | Rollback | Linked spec | Status |
|----|-----------|------|------------|----------|-------------|--------|
| A-001 | ZedCheckout is the active first project | Low — confirmed 2026-05-08 | Align specs to PRD-ZCHECKOUT | Reprioritize in CURRENT_STATE | SPEC-ZC-* | Accepted |
| A-002 | WhatsApp is a channel adapter; booking engine is core | Medium — Meta API complexity could block | Implement engine without WhatsApp first in one vertical slice | Swap order of SPEC-ZC-002 vs SPEC-ZC-003 | SPEC-ZC-003 | Pending validation |

---

## What changed recently

- **ZedCheckout onboarded** — `docs/PRD-ZCHECKOUT.md`, `docs/TEAM_SETUP.md`, BACKLOG specs in `SPEC_QUEUE.md`; DECISION-003
- Replaced TRD.md (fixed org chart) with TEAM_SETUP.md (diagnostic-driven, project-specific capability allocator)
- Full system bootstrapped: README, core.md, PRD, SPEC_QUEUE, DECISIONS, CURRENT_STATE, EXECUTION_LOCK
- Team roles implemented as Cursor review lenses + slash commands

---

## Next action

```
Run Architecture + Dependency review on SPEC-ZC-001 (Shopify app install / shop identity).
When READY: promote SPEC-ZC-001 to NOW → checkers → EXECUTION_LOCK → first PR (HIGH risk / 3 PRs).
```

---

## Complexity budget status

```
Specs in EXECUTION_LOCK:   0 / 3   ✓
New docs this cycle:       1 / 1   ✓ (PRD-ZCHECKOUT.md this cycle)
New rules this cycle:      7 / 1   ⚠ (bootstrap exception — core.md + 6 review lenses)
Review lenses:             6       (in review-lenses/ — Orchestrator, PM, Architect, Designer, Copywriter, Recruiter)
Active autonomous agents:  0 / 0   ✓
Unresolved NEED_HUMAN:     0 / 3   ✓
Accepted partial scopes:   0 / 2   ✓
```

Note: bootstrap doc + rule counts are one-time exceptions. Next cycle must produce ≤ 1 new doc and ≤ 1 new rule.
