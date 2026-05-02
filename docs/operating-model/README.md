# Operating Model

## Philosophy: Evidence-Based Autonomy

> The agent's autonomy expands with evidence of correctness.

No spec? Agent can only plan.  
Spec validated? Agent can implement.  
Tests pass + lint clean? Agent can report done.  
Never: force push, prod deploy, or billing changes without human approval.

---

## Agent System: 5 Modes

Cursor has ONE agent (the model). We shape its behavior via `.mdc` rules.
"Agents" = behavioral modes, activated contextually via the coordinator.

### Work Hierarchy

```
Vision → Feature → Story → Spec → Task
```

Each mode operates at specific levels. Never skip levels.

### Agent Modes

| Mode | Level | Gate | Stop Condition | Model |
|------|-------|------|----------------|-------|
| **Strategist** | Vision → Feature | Product direction discussion | Feature defined or "don't build" decision | claude-4-opus / gemini-2.5-pro |
| **Planner** | Feature → Spec | Feature defined | Spec status = Validated | claude-3.7-sonnet (thinking) |
| **Implementer** | Spec → Task | Spec = Validated | DoD 100% green with evidence | claude-4-sonnet / claude-3.7-sonnet |
| **Reviewer** | Any | Something to review | All [blocking] resolved | claude-4-opus |
| **Tester** | Task | Code exists | Every spec edge case has a test | claude-3.7-sonnet |

### Mode Transitions

```
Strategist → Planner → Implementer → Reviewer
                              ↕
                           Tester
```

- Strategist → Planner: Feature defined, ready for decomposition.
- Planner → Implementer: Spec validated (no open questions, DoD defined).
- Implementer → Reviewer: DoD claimed with evidence.
- Implementer ↔ Tester: Work alongside or sequentially.
- Any → Planner: Requirements unclear → stop and plan.
- Any → Strategist: "Why" is missing → go back.

### Key Boundaries

| Mode | Forbidden Actions |
|------|-------------------|
| Strategist | Writing specs, code, or technical decisions |
| Planner | Writing code, creating files outside specs/tasks |
| Implementer | Beyond-spec work, skipping tests, fake-done |
| Reviewer | Fixing code (only flag + suggest), rubber-stamping |
| Tester | Happy-path-only tests, mocking internals |

---

## What Each Artifact Type Is For

| Artifact | Purpose | NOT for |
|----------|---------|---------|
| **Rules** (`.mdc`) | Persistent policy. "Always do X." | Implementation details. Long docs. |
| **Skills** (`SKILL.md`) | Procedural capability. "Here's HOW to do X." | Policy decisions. Opinions. |
| **Commands** (`.md`) | User-triggered workflow. "When I say /X, do this." | Background automation. |
| **Hooks** | Event-driven automation. "After X happens, do Y." | User interaction. |
| **Specs** | Source of truth for a feature. "WHAT we're building and WHY." | How to code it (that's a task). |
| **Tasks** | Granular checklist for current work. Ephemeral. | Long-term documentation. |
| **Templates** | Starting point for new artifacts. | Active configuration. |
| **Docs** | Human-readable knowledge. Onboarding, playbooks, reference. | Agent instructions (use rules). |

---

## Autonomy Levels

| Level | Allowed | Forbidden | Examples |
|-------|---------|-----------|----------|
| **L0 — Analysis** | Read, explore, explain | Any file changes | Product strategy, pricing, security review |
| **L1 — Draft** | Create docs, specs, plans | Code changes, installs | Spec writing, task planning, copywriting drafts |
| **L2 — Bounded Build** | Implement within spec scope | Unspecified features, new deps without asking | Frontend components, bug fixes, tests |
| **L3 — Ship** | Open PR, push to staging | Merge to main, prod deploy | Feature branches, preview deploys |
| **L4 — Dangerous** | Nothing without explicit human approval | Everything by default | Prod DB migrations, billing API changes, force push |

### Domain → Autonomy Mapping

| Domain | Default Level | Notes |
|--------|--------------|-------|
| Product strategy | L0 | Human decides |
| Architecture | L0-L1 | Agent proposes, human decides |
| Frontend UI | L2 | Within spec bounds |
| Backend logic | L2 | Within spec bounds |
| Payments (Stripe/Shopify) | L1 | Draft only, human implements or reviews carefully |
| Production deploy | L4 | Human only |
| Tests | L2 | Agent writes and runs freely |
| Docs | L1-L2 | Agent drafts, human approves |
| Copywriting | L1 | Agent drafts, human approves tone |
| Marketing | L0-L1 | Strategy is human, execution drafts are agent |

---

## Testing Philosophy

Embedded in Implementer + Tester modes:

- NO e2e tests. Only unit (logic/edge cases) + integration (flow).
- 70% failure paths / 30% happy path.
- Every bug fix starts with a failing test.
- Test behavior, not implementation.
- Name tests as sentences: `it('returns 400 when email is missing')`.

---

## Token Strategy

### Always loaded (via globs: *)
- `coordinator.mdc` — routes between 5 agent modes (~40 lines)
- `scope-control.mdc` — classification system (~40 lines)

### Loaded by context (via globs on file types)
- `quality.mdc` — only on code files
- `spec-writing.mdc` — only in `specs/` folder
- `review.mdc` — loaded manually when reviewing

### Loaded on demand (via skills)
- Domain skills (Stripe, CMS, etc.) — only when that domain is active
- Community skills (`.agents/skills/`) — only when explicitly invoked

### Rules for rule-writing
- Max 60 lines per rule (if longer, split into rule + skill)
- No prose. Telegram-style. Tables over paragraphs.
- Use references (`see scope-control.mdc`) instead of repeating content
- One concern per rule file

---

## Workflow: Idea → Shipped

```
1. IDEA        → Human describes what they want
2. STRATEGIZE  → Strategist challenges "why", defines Feature (or kills it)
3. PLAN        → Planner breaks Feature into Stories → Specs
4. REVIEW SPEC → Reviewer audits spec (holes, scope, classification)
5. VALIDATE    → Open questions resolved, status → Validated
6. BUILD       → Implementer implements (tests first, DoD continuously)
7. TEST        → Tester writes adversarial tests (failure-path focus)
8. VERIFY      → Tests pass, lint clean, DoD evidence collected
9. REVIEW CODE → Reviewer audits code against spec
10. PR         → Agent opens PR with spec link
11. MERGE      → Human approves and merges
12. LEARN      → If something was hard, update a rule or skill
```

Steps 1, 4, 5, 11, 12 require human involvement.  
Steps 2, 3, 6, 7, 8, 9, 10 can be autonomous (within bounds).

---

## When to Create New Artifacts

| Signal | Action |
|--------|--------|
| Same mistake happens twice | Create a rule |
| Same procedure runs 3+ times | Create a skill |
| Users keep asking "how do I..." | Create a playbook |
| A workflow has 5+ steps | Create a command |
| A rule exceeds 60 lines | Split into rule + skill |
| A new domain is entered | Create a `rules/domain/` file |

### When NOT to create

- One-off task → just do it
- Uncertain if reusable → wait for the 3rd occurrence
- Pure documentation → put in `docs/`, not a rule
