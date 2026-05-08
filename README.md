# Cursor AIflow

> **Cursor cannot act unless a spec is locked, linked to the PRD, bounded by scope, validated by checkers, and reflected in current state.**

A minimal, constraint-driven execution framework for AI-assisted development.

---

## What this is

Not a project. Not a product. A machine.

It answers one question at all times:

```
What do we do now, why, in what scope, with what dependencies, at what risk?
```

It stays minimal by design. Every artifact added must justify its existence against this test:

```
Does this reduce uncertainty, prevent an observed failure, or accelerate execution?
If not — it is forbidden.
```

---

## Repo structure

```
README.md                          ← you are here
.cursor/
  rules/
    core.md                        ← single source of rules for Cursor (1 core rule)
    review-lenses/                 ← review lenses (not autonomous agents)
      orchestrator.mdc             ← coordination, execution cycle (alwaysApply)
      product-manager.mdc          ← product clarity, PRD coherence
      architect.mdc                ← feasibility, dependencies, risk
      designer.mdc                 ← UX coherence, flow completeness
      copywriter.mdc               ← wording, UX writing, CTAs
      recruiter.mdc                ← gap detection, role proposals
  commands/
    orchestrate.md                 ← run execution cycle
    review-product.md              ← product review lens
    review-architecture.md         ← architecture review lens
    review-design.md               ← design review lens
    review-copy.md                 ← copy review lens
    recruit.md                     ← recruiter diagnostic

docs/
  PRD.md                           ← product vision (no stack, no tech)
  TEAM_SETUP.md                    ← template until onboarding; project-specific after
  SPEC_QUEUE.md                    ← NOW / NEXT / BACKLOG / BLOCKED / DONE
  EXECUTION_LOCK.md                ← currently active specs (max 3, stable)
  DECISIONS.md                     ← irreversible / costly decisions log
  CURRENT_STATE.md                 ← operational memory (read this first)
```

V0 surface: 1 README + 1 core rule + 6 review lenses + 6 commands + 6 operational docs.

`TEAM_SETUP.md` is a blank template until a project is onboarded. Do not treat it as active before onboarding.

Additional folders (`docs/specs/`, `docs/services/`, `docs/architecture/`) are created **only when a real pain is observed**. Not before.

---

## How to start a session

1. Read `docs/CURRENT_STATE.md`
2. Read `docs/SPEC_QUEUE.md`
3. Check `docs/EXECUTION_LOCK.md`
4. If nothing is locked → apply checkers → lock 1–3 specs
5. Act on the locked spec only

Do not touch anything outside the locked spec.

---

## Core invariants

- No implementation without a SPEC-ID
- No spec without a PRD link
- No action outside the locked spec scope
- No new artifact without passing Reuse Checker + Complexity Budget
- No irreversible decision without logging it in DECISIONS.md
- No behavior change without updating docs (or explaining why not)

Full rules in `.cursor/rules/core.md`.

---

## Complexity budget (V0)

```
Max specs in EXECUTION_LOCK:   3
Max new docs per cycle:        1
Max new rules per 10 PRs:      1
Max active autonomous agents:   0 (review lenses don't count)
Max labels (statuses):         5
Max PR checklist items:        12
Max unresolved NEED_HUMAN:     3
Max accepted partial scopes:   2
```

If a cycle adds more process than product value → delete, merge, or simplify before continuing.

---

## PR flow by risk

```
LOW risk    → 1 PR  (spec + tests + impl)
MEDIUM risk → 2 PRs (spec | tests + impl)
HIGH risk   → 3 PRs (spec | tests | impl)
```

HIGH risk examples: payment, booking, auth, permissions, DB migration, external sync, multi-tenant, critical data.

---

## Reuse before create

Before creating anything (spec, doc, rule, agent, service, folder, component, abstraction):

```
1. Can I reuse?
2. Can I extend?
3. Can I merge?
4. Can I update?
5. Can I delete?
6. Only then: can I create?
```
