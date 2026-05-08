# DECISIONS

> Log of irreversible, costly, or structurally important decisions.
> If it's not here, it didn't happen.

---

## When to log

Mandatory for:
- Architecture choices
- Provider selection (payment, messaging, CMS, auth)
- Data model decisions
- External sync source of truth
- Payment and cancellation policies
- Permission models
- Multi-tenant decisions
- Any choice that is costly or hard to reverse

Not needed for:
- Wording
- Variable naming
- Local component structure
- Minor UI details

---

## Decision template

```
DECISION-ID:
Date:
Context:
Decision:
Why:
Alternatives rejected:
Consequences:
Rollback possible:    yes / no
Linked specs:
```

---

## Log

---

### DECISION-001

```
DECISION-ID:     DECISION-001
Date:            2026-05-08
Context:         Need a structured execution framework for AI-assisted development
                 across multiple projects (Z Slot, PayloadCMS AI, Z Checkout).
                 Previous attempt had too many artifacts from the start (TRD, 
                 agents, skills, dependency graphs, QA strategies, etc.) — 
                 creating organizational overhead before any product was shipped.

Decision:        Adopt Cursor AIflow V0 with the following core constraints:
                 - 6 documents only: README, core.md, PRD, SPEC_QUEUE, DECISIONS, CURRENT_STATE
                 - No autonomous agents in V0 — checkers only (embedded in rules)
                 - Complexity budget is explicit and enforced at every cycle end
                 - Reuse before Create is a hard rule
                 - PR flow is risk-proportional (LOW=1PR, MEDIUM=2PR, HIGH=3PR)
                 - EXECUTION_LOCK separates stable execution from dynamic backlog
                 - Every new rule/doc/agent requires evidence + removal condition

Why:             The first version was intellectually coherent but operationally 
                 fragile. It generated structure before need. The revised version 
                 constrains creation, not ambition. The system stays minimal until 
                 pain justifies growth.

Alternatives rejected:
                 - Full V0 with agents (TRD, Designer, Architect, Recruiter, etc.):
                   rejected because it creates AI bureaucracy before any product value
                 - Stripped-down version (just a checklist): 
                   rejected because too weak to prevent drift and scope creep
                 - Separate BACKLOG_DYNAMIC.md:
                   rejected because SPEC_QUEUE.md with NOW/NEXT/BACKLOG/BLOCKED/DONE
                   is sufficient in V0, avoids one more document to maintain

Consequences:    - System starts minimal and grows only under evidence
                 - First project onboarding will feel fast
                 - Complexity budget must be actively enforced to avoid regression
                 - CURRENT_STATE.md becomes the most critical file — if stale, sessions break

Rollback possible: yes — can always add agents/docs/rules if evidence justifies it
Linked specs:    SPEC-000
```

---

### DECISION-002

```
DECISION-ID:     DECISION-002
Date:            2026-05-08
Context:         Initial TRD.md defined 6 fixed roles (Orchestrator, PM, Architect,
                 Designer, Copywriter, Recruiter) as "review modes". While better 
                 than autonomous agents, this is still a preloaded org chart — roles
                 exist before any project evidence justifies them.

Decision:        Replace TRD.md with TEAM_SETUP.md — a diagnostic output generated
                 per-project during onboarding. Roles are replaced by capabilities 
                 identified from the PRD risk profile. Capabilities are promoted 
                 through a strict hierarchy: core rule → checker → skill → agent.
                 Review lenses (Product, Architecture, UX, QA) replace fixed roles.

Why:             The system must not generate structure before need. A fixed org chart
                 (even one called "review modes") is structure without evidence. 
                 The correct model is: identify what this specific project needs, 
                 then allocate the minimal tooling to cover that need.

Alternatives rejected:
                 - Keep TRD with fixed roles as review modes: rejected because it's 
                   still a preloaded org chart, just renamed
                 - No team setup at all: rejected because project-specific constraints 
                   (booking domain, payment risk, Shopify sync) are too important to 
                   leave to generic rules
                 - Full autonomous agent generation: rejected because it creates AI 
                   bureaucracy — agents should be the last resort, not the default

Consequences:    - Each project onboarding now requires a diagnostic phase
                 - No agents exist by default — they must be earned
                 - Review lenses are lighter than roles (no persistent identity)
                 - Project-specific rules become more valuable than generic agents

Rollback possible: yes
Linked specs:    SPEC-000
```

---

### DECISION-003

```
DECISION-ID:     DECISION-003
Date:            2026-05-08
Context:         Cursor AIflow V0 required NEED_HUMAN to choose the first real project
                 to onboard (Z Slot vs PayloadCMS AI vs Z Checkout). User directed work
                 to begin on ZedCheckout: WhatsApp AI + booking engine with Shopify as
                 the pluggable commerce backbone.

Decision:        Onboard **ZedCheckout (Z Checkout)** as the first execution project.
                 Product definition is captured in docs/PRD-ZCHECKOUT.md. Initial backlog
                 specs live in docs/SPEC_QUEUE.md (BACKLOG/NEXT).

Why:             Explicit human priority overrides the earlier recommendation of Z Slot;
                 Shopify + booking + conversational channel is now the active delivery
                 focus.

Alternatives rejected:
                 - Defer Z Checkout again: rejected by user direction this session
                 - Merge Z Slot and Z Checkout without separate PRDs: rejected — risks
                   blurred scope; ZedCheckout PRD is the anchor for this repo cycle

Consequences:    - TEAM_SETUP.md is populated for ZedCheckout risks/capabilities
                 - Specs touching payments, OAuth, WhatsApp, booking → HIGH risk flow
                 - PayloadCMS AI and Little Biceps / Z Slot remain unprioritized here

Rollback possible: yes — reprioritize in CURRENT_STATE + SPEC_QUEUE if strategy shifts
Linked specs:    SPEC-ZC-001, SPEC-ZC-002, SPEC-ZC-003
```
