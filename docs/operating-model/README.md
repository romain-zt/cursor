# Operating Model

## Philosophy: Evidence-Based Autonomy

Agents can do a lot. But "can" ≠ "should." Our model is simple:

> The agent's autonomy expands with evidence of correctness.

No spec? Agent can only plan.  
Spec validated? Agent can implement.  
Tests pass + lint clean? Agent can report done.  
Never: force push, prod deploy, or billing changes without human approval.

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

## Token Strategy

### Always loaded (via globs: *)
- `coordinator.mdc` — routing logic (~50 lines)
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
2. SPEC        → Agent (or human) writes spec in specs/
3. REVIEW      → Spec is reviewed (holes, scope, classification)
4. VALIDATE    → Open questions resolved, status → Validated
5. TASK        → Agent creates task breakdown in tasks/
6. BUILD       → Agent implements (checking DoD continuously)
7. VERIFY      → Tests pass, lint clean, mobile checked
8. PR          → Agent opens PR with spec link
9. MERGE       → Human approves and merges
10. LEARN      → If something was hard, update a rule or skill
```

Steps 1, 3, 4, 9, 10 require human involvement.  
Steps 2, 5, 6, 7, 8 can be autonomous (within bounds).

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
