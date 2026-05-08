# Cursor AIflow — Core Rules

## Read order (mandatory)

Before any action, read in this order:
1. `docs/CURRENT_STATE.md`
2. `docs/SPEC_QUEUE.md`
3. `docs/EXECUTION_LOCK.md`

Never start from memory. Never start from a previous session's context.

If the three files disagree (spec status, lock state, or next action conflict) — stop.
Do not continue. Resolve the inconsistency before acting.

---

## Execution invariants

```
Cursor can only act on a locked spec.
A spec cannot be locked without a PRD link.
A spec cannot be locked without passing all checkers.
A spec cannot be locked without defined acceptance criteria.
A spec cannot be locked without a risk level.
Never start implementation without a SPEC-ID.
Never expand scope beyond the active spec.
Never create something without first passing the Reuse Checker.
```

---

## Team setup invariants

The setup must be project-specific, not generic.

Before onboarding a project, generate docs/TEAM_SETUP.md from:
- PRD risks
- External integrations
- Data criticality
- Domain complexity
- Delivery urgency
- Known failure modes

Capability promotion hierarchy (never skip levels):
1. Can existing core rule handle it?
2. Can a checker handle it?
3. Can a reusable skill/prompt handle it?
4. Only then: create a specialized agent

Do not create agents by default.
Create capabilities first.
Promote a capability only when the previous level is proven insufficient.

An agent is justified only when ALL 4 conditions are true:
1. The domain is high-risk or frequently revisited
2. Generic rules are insufficient
3. A checker alone is not enough
4. The agent has a narrow, defined trigger condition

---

## Preference order (apply always)

```
Prefer deletion over creation.
Prefer update over addition.
Prefer one source of truth over synchronization.
Prefer locked execution over dynamic replanning.
Prefer vertical slice over technical task.
Prefer assumption log over blocking ambiguity.
```

---

## SISO Checker

Apply before acting on any input (spec request, feature idea, task).

Classify the input:

```
ACCEPTED                   → input is clear enough, proceed
ACCEPTED_WITH_ASSUMPTIONS  → input is usable but contains gaps
NEEDS_HUMAN                → input requires a human decision before proceeding
REJECTED                   → input is too weak to produce reliable specs
```

For ACCEPTED_WITH_ASSUMPTIONS, log every assumption in the `## Active assumptions` table in CURRENT_STATE.md:

```
ID:          A-XXX
Assumption:
Risk:
Validation:
Rollback:
Linked spec:
Status:      Pending validation / Validated / Invalidated
```

Do not reject all ambiguous inputs. Reject only inputs where proceeding would cause irreversible damage or major rework. Use ACCEPTED_WITH_ASSUMPTIONS for normal uncertainty.

Checker output format:

```
Result:           ACCEPTED / ACCEPTED_WITH_ASSUMPTIONS / NEEDS_HUMAN / REJECTED
Findings:
Required changes:
```

---

## Reuse Checker

Before creating any artifact (spec, doc, rule, agent, skill, service, folder, component, abstraction, pattern):

```
1. Does something already cover this need?
2. Can I extend an existing spec?
3. Can I reuse an existing rule?
4. Can I modify an existing component?
5. Can I add a field instead of a new document?
```

Only after exhausting these: create.

No new artifact without a passed Reuse Checker.

Checker output format:

```
Result:           PASS / FAIL
Findings:
Required changes:
```

---

## Risk Classifier

Every spec must have a risk level before locking:

```
LOW    → wording, isolated UI, static content, small non-critical component, non-critical refactor
MEDIUM → product feature, CRUD, form, conditional logic, limited business logic
HIGH   → payment, booking, auth, permissions, external sync, DB migration, multi-tenant,
         critical data, file/queue/worker, architecture decision
```

Risk level determines PR flow:

```
LOW    → 1 PR  (spec + tests + impl combined)
MEDIUM → 2 PRs (spec PR | tests + impl PR)
HIGH   → 3 PRs (spec PR | tests PR | impl PR)
```

Checker output format:

```
Result:           PASS / FAIL / NEED_HUMAN
Risk level:       LOW / MEDIUM / HIGH
Findings:
Required changes:
```

---

## Dependency Checker

Every spec must declare:

```
Depends on:
Blocks:
Blocked by:
Can start now: yes / no / partial
```

Before marking a spec READY, verify:

```
- Data model known?         yes/no
- API contract known?       yes/no
- Auth/permissions known?   yes/no
- External dependency known? yes/no
- Test strategy known?      yes/no
- Rollback path known?      yes/no
```

If any answer is "no" and it is blocking → spec status is BLOCKED, not READY.

Checker output format:

```
Result:           PASS / FAIL / NEED_HUMAN
Findings:
Blocking gaps:
Required changes:
```

If partial execution is possible:

```
Partial allowed:    yes/no
Allowed scope:
Forbidden scope:
Debt created:
Must close before:
Production allowed: yes/no
```

No partial scope critical path ships to production.

---

## Scope Checker

Apply before every PR:

```
- Is this inside the active spec?
- Is this required by acceptance criteria?
- Is this introducing extra behavior?
- Is this creating an abstraction too early?
- Is this touching files unrelated to the spec?
```

If any answer reveals out-of-scope work:

```
Stop.
Create a candidate spec in SPEC_QUEUE.md.
Do not implement now.
```

Checker output format:

```
Result:           PASS / FAIL
Findings:
Out-of-scope items detected:
Required changes:
```

---

## Docs Checker

Apply after every PR:

```
Docs impact:
- PRD changed?            yes/no
- SPEC_QUEUE changed?     yes/no
- EXECUTION_LOCK changed? yes/no
- DECISIONS changed?      yes/no
- CURRENT_STATE changed?  yes/no
- Architecture changed?   yes/no
```

Rule: if product behavior changes, a doc must change, or the PR must explain why not.

Checker output format:

```
Result:           PASS / FAIL
Findings:
Docs requiring update:
Required changes:
```

---

## Complexity Budget Checker

Apply at the end of every execution cycle:

```
Max specs in EXECUTION_LOCK:   3
Max new docs per cycle:        1
Max new rules per 10 PRs:      1
Max active autonomous agents:   0 (review lenses don't count — they are not autonomous)
Max labels (statuses):         5
Max PR checklist items:        12
Max unresolved NEED_HUMAN:     3
Max accepted partial scopes:   2
```

Mandatory question at the end of every cycle:

```
Did this cycle add more process than product value?
```

If yes: delete, merge, or simplify before starting the next cycle.

Checker output format:

```
Result:           PASS / FAIL
Budget status:    [counts vs limits for each dimension]
Findings:
Required actions: (delete / merge / simplify)
```

---

## Adding a new rule / agent / skill / doc

Before adding anything, verify against the capability promotion hierarchy in "Team setup invariants".

Default: forbidden.

To add one, you must provide:

```
Problem observed:
Evidence:
Why existing setup failed:
Why reuse is not enough:
Expected benefit:
Cost introduced:
Removal condition:
Owner:
```

The removal condition is mandatory. A rule without a removal condition is debt.

Example removal condition:

```
Remove this rule if it was not triggered in 10 PRs.
```

---

## NEED_HUMAN

Use only for:

```
- Irreversible decisions
- High-cost decisions
- Structural business choices (provider, data model, payment policy, cancellation policy)
- Multi-tenant architecture
- External sync source of truth (Shopify vs app, etc.)
```

Do not use for:

```
- Minor wording
- Naming
- UI detail
- Simple local structure
- Micro-refactor
```

Max unresolved NEED_HUMAN: 3. Above this, the system is blocked by the human — this is a failure state.

---

## Execution cycle

```
1.  Read CURRENT_STATE.md
2.  Read SPEC_QUEUE.md
3.  Check EXECUTION_LOCK.md
4.  If no active lock → apply all checkers → select 1–3 READY specs
5.  Apply SISO Checker
6.  Apply Reuse Checker
7.  Apply Risk Classifier
8.  Apply Dependency Checker
9.  Lock selected specs in EXECUTION_LOCK.md
10. Choose PR strategy by risk level
11. Execute PRs (Spec PR → Tests PR → Impl PR per risk)
12. Apply Scope Checker per PR
13. Apply Docs Checker per PR
14. Update DECISIONS.md if needed
15. Update CURRENT_STATE.md
16. Recalculate SPEC_QUEUE.md
17. Apply Complexity Budget Checker
18. Delete / merge / simplify if budget exceeded
19. Define next action
```

---

## Spec format

```
SPEC-ID:
Title:
User value:
Linked PRD goal:
Status:
Risk level:
Scope:
Out of scope:
Acceptance criteria:
Dependencies:
  Depends on:
  Blocks:
  Blocked by:
  Can start now:
Partial allowed:   yes/no
  Allowed scope:
  Forbidden scope:
  Debt created:
  Must close before:
  Production allowed:
NEED_HUMAN:        yes/no
  Decision needed:
Test expectation:
Definition of done:
```

---

## Queue format (SPEC_QUEUE.md)

```
## NOW
- SPEC-XXX: [Title] | Risk: LOW/MEDIUM/HIGH | Can start: yes

## NEXT
- SPEC-XXX: [Title] | Blocked by: [what]

## BACKLOG
- SPEC-XXX: [Title] | Not yet refined

## BLOCKED
- SPEC-XXX: [Title] | Blocked by: [decision/dependency]

## DONE
- SPEC-XXX: [Title]
```

---

## Decision format (DECISIONS.md)

```
DECISION-ID:
Date:
Context:
Decision:
Why:
Alternatives rejected:
Consequences:
Rollback possible:
Linked specs:
```

Mandatory for: architecture, provider, payment, data model, external sync, permissions, critical business rules, irreversible or costly choices.
