---
name: prd-builder
description: Construct and extend a Product Requirements Document as a set of prioritized feature groups, conversationally, using the WHY / WHO / WHAT / WHEN / Definition of Done / ICE structure. Use when the user wants to build, extend, refine, or converge a PRD; mentions feature groups, ICE scoring, scope, MVP, Definition of Done, prioritization, or "what should we build first"; or runs `/prd discover` and needs a structured construction loop. Not for technical architecture, framework choice, sprint planning, or implementation breakdown.
disable-model-invocation: true
---

# PRD Builder

Operational workflow for turning a vague product idea into a small, prioritized PRD organized into **feature groups**. The skill drives the conversation toward convergence — not toward documentation volume.

## 1. Goal

Produce a PRD that is:

- **readable in minutes** by a human,
- organized as **feature groups**, not as flat feature lists or epics,
- **prioritized via ICE** so the team can decide what gets built first,
- **bounded** by explicit Out-of-Scope and Definition of Done,
- **converged** — each feature group is explicitly validated by the user before being persisted.

Anti-goal: producing a long, exhaustive, "complete" PRD. A bloated PRD is a failure of this skill.

## 2. Activation conditions

Activate when **any** of:

- the user runs `/prd discover` or asks to "build / extend / start a PRD",
- the user describes a product idea and wants structured capture,
- the user asks to define a feature group, scope an MVP, or rank features,
- the user explicitly names this skill.

Do **not** activate when:

- the user is asking for technical architecture, implementation, or sprint planning,
- the user is asking for a roadmap (Gantt, dates, dependencies) — that is downstream,
- input is RED/ORANGE per [`SISO`](../../../rules/00-siso.mdc) — clarify first.

Before starting, read (when present): `docs/prd/current.md`, `docs/prd/state.md`, and the active PRD file. If they are missing, offer to initialize them via the `/prd update` flow — do not silently start writing.

## 3. Workflow

The skill operates as a **convergence loop**, one feature group at a time. Never expand to a second feature group until the current one is validated.

```
Task Progress (per feature group):
- [ ] 3.1  Surface the candidate feature group
- [ ] 3.2  Draft WHY / WHO / WHAT / WHEN
- [ ] 3.3  Force Out of Scope
- [ ] 3.4  Define Definition of Done
- [ ] 3.5  Score ICE
- [ ] 3.6  Convergence check (challenge + size)
- [ ] 3.7  Explicit user validation
- [ ] 3.8  Hand off to PRD Editor for delta write
```

### 3.1 Surface the candidate feature group

A **feature group** = a coherent slice of user value with a single intent (e.g. "Conversational checkout", "Self-serve onboarding"). Not a theme, not a single button, not a release.

Ask one focused question, e.g. *"What's the smallest user-visible capability we want to define right now?"* If the user names something larger than a feature group (e.g. "the whole product"), split it explicitly before proceeding.

### 3.2 Draft WHY / WHO / WHAT / WHEN

Co-write the four narrative sections in this order. Keep each to **3–5 lines max**. Use the user's words verbatim where possible. If a section can't be written without inventing facts, mark it `UNKNOWN — needs <signal>` and add it to Open Questions instead of fabricating.

### 3.3 Force Out of Scope

Before scoring, ask: *"What is explicitly NOT part of this feature group?"* Refuse to proceed with an empty Out-of-Scope. A feature group with no exclusions is not a feature group — it's an unbounded wish.

### 3.4 Define Definition of Done

Ask: *"What's true when we consider this group shipped?"* Demand observable, user-visible conditions. Reject DoDs that are:

- internal-only (e.g. "code merged"),
- aspirational ("users love it"),
- engineering-shaped ("tests pass"),
- a restatement of WHAT.

Acceptable DoD lines look like: *"A new user can complete checkout end-to-end without leaving the page on mobile and desktop."*

### 3.5 Score ICE

See section 5. Capture as `Impact,Confidence,Ease`, e.g. `8,6,7`. Require a one-line justification per axis the first time the group is scored.

### 3.6 Convergence check

Before asking for validation, run the checks in section 6. If any fail, loop back to the relevant section. Do not paper over weakness with prose.

### 3.7 Explicit user validation

Show the full feature group block (template in section 4). Ask the user to validate **four things, one by one**:

1. Feature group name and intent
2. Scope (WHAT + Out of Scope)
3. ICE tuple
4. Definition of Done

Anything not explicitly validated is **not** validated. Don't infer agreement from silence or generic "looks good".

### 3.8 Hand off

Once validated, do **not** write `docs/prd/` directly. Output a clean, copy-pasteable feature group block (section 4 template) and recommend `/prd update` so the **PRD Editor** agent can produce the delta against the active PRD file.

## 4. PRD section methodology

Every feature group MUST use this exact template. Order is fixed — it mirrors how a reader's brain converges from purpose to constraints.

```md
# <Feature Group Name>

## WHY
<3–5 lines: the user / business reason this exists. No solutioning.>

## WHO
<Target users — specific roles or segments. Not "everyone".>

## WHAT
<3–5 lines: the capability, in user-visible terms. Verbs over nouns.>

## WHEN
<Trigger / context: when in the user's life or workflow does this matter?>

## Definition of Done
- <Observable, user-visible condition 1>
- <Observable, user-visible condition 2>
- <Optional condition 3>

## ICE
<Impact>,<Confidence>,<Ease>
<One-line justification per axis>

## Dependencies
- <Other feature group / external thing this needs — or "None">

## Out of Scope
- <Explicit exclusion 1>
- <Explicit exclusion 2>

## Open Questions
- <Unresolved question blocking confidence>
```

### Section-by-section guidance

| Section | Required | Common failure | Correction |
|---|---|---|---|
| WHY | yes | Restates WHAT | Force a "so that <user/business outcome>" clause |
| WHO | yes | "All users", "everyone" | Demand a role, segment, or job-to-be-done |
| WHAT | yes | Implementation language | Strip frameworks, libraries, services |
| WHEN | yes | Vague ("anytime") | Anchor to a user moment or trigger |
| Definition of Done | yes | Engineering-shaped | Reject; rewrite as user-observable |
| ICE | yes | Fake confidence | See section 5 |
| Dependencies | optional | Hides scope creep | If non-empty, each dep must already be a defined feature group OR an explicit external thing |
| Out of Scope | yes | Empty | Block until at least 2 explicit exclusions exist |
| Open Questions | optional | Used as a dumping ground | Keep tight; an Open Question that blocks ICE Confidence ≥ 7 must be flagged |

## 5. ICE scoring guidance

ICE is captured as a flat tuple in the PRD:

```
Impact,Confidence,Ease
```

Example:

```
8,6,7
```

### Scale

Each axis is scored **1–10**.

| Axis | 1 | 5 | 10 |
|---|---|---|---|
| **Impact** | Marginal user/business value | Solid value for a real segment | Game-changer for the core problem |
| **Confidence** | Pure guess | Reasonable inference, weak data | Validated with direct user evidence |
| **Ease** | Massive cost, deep unknowns | Real work, known approach | Trivial to ship and operate |

Note: **Ease** is inverted from "Effort" — higher = easier. Higher tuple values across all three axes mean higher priority.

### Score interpretation

- The tuple itself is the artifact stored in the PRD.
- For ranking across feature groups, use the sum: `score = Impact + Confidence + Ease` (max 30).
- Higher score = higher priority.
- Tie-break: higher Ease first, then higher Confidence.

This skill captures the per-feature-group ICE tuple at construction time. The committee's [`prd-prioritizer`](../../../agents/prd/prd-prioritizer.md) agent uses the same ICE model (same axes, same scale, same formula, same tie-break) when re-ranking across the full backlog during `/prd prioritize`. Stay consistent — do not switch axes, scale, or formula between the two.

### Hard rules

- Reject any axis at 9–10 without a one-line justification rooted in evidence (not enthusiasm).
- If Confidence is ≤ 4, propose the **cheapest test** that would raise it before recommending build.
- If Ease is 9–10, ask once: *"What's the hidden cost — operations, support, edge cases?"* before accepting.
- Never accept `10,10,10`. It always means thinking is too coarse.

## 6. Convergence logic

A feature group is **converged** when ALL of the following are true:

1. WHY, WHO, WHAT, WHEN are each ≤ 5 lines and contain no implementation language.
2. Definition of Done has ≥ 1 user-observable condition and zero engineering-shaped lines.
3. Out of Scope contains ≥ 2 explicit exclusions.
4. ICE tuple exists with per-axis justification.
5. No Open Question blocks Confidence ≥ 7.
6. The user has explicitly validated the four checkpoints in 3.7.

If any condition fails, loop back. Do **not** widen scope to "fill in" a weak section — narrow it instead.

### Drift signals during the loop

Pause the loop and surface a drift report when:

- the user starts adding sub-features mid-loop ("oh, and we should also..."),
- two feature groups start describing the same user value,
- Out of Scope shrinks across iterations instead of growing,
- DoD becomes longer than WHAT (it should be shorter),
- ICE Impact rises while Out of Scope is unchanged.

Drift report format:

```
DRIFT
- Observed: <what changed>
- Risk: <what this hides — usually scope inflation>
- Options: tighten current group | split into a second group | defer addition
```

## 7. Anti-patterns

Refuse to produce, and explicitly call out, the following:

| Anti-pattern | Why it's wrong |
|---|---|
| Discussing frameworks, libraries, infra | This is a PRD, not architecture. |
| Generating a giant questionnaire | Discovery is conversational, not a form. |
| Filling all sections with prose to look "complete" | Bloat ≠ clarity. |
| Empty Out of Scope | An unbounded group is not a group. |
| DoD = "tests pass" / "shipped" / "MVP done" | Not user-observable. |
| `10,10,10` ICE | Coarse thinking. |
| "We'll figure it out later" | Becomes Open Question + lowers Confidence. |
| Adding a feature group before the current one converges | Breaks convergence loop. |
| Renaming an old group to absorb new scope | Silent drift. |
| Sprint plans, Jira tickets, Gantt charts | Not PRD output. |
| Motivational / startup-guru tone | This is a guide, not a coach. |

## 8. Outputs

The skill produces only these artifacts, in this order:

1. **Working dialogue** — clarification, drafts, and challenges in chat. No file writes.
2. **Feature group block** — the section-4 template, fully filled, after convergence.
3. **Validation summary** — three lines:
   ```
   Validated: <feature group name>
   ICE: <I,C,E>
   Recommended next: /prd update | define next feature group | run /prd prioritize
   ```
4. **Hand-off note** — explicit instruction to run `/prd update` so [`prd-editor`](../../../agents/prd/prd-editor.md) writes the delta.

The skill **never** writes to `docs/prd/` itself. That is the Editor's job, gated by user approval.

## 9. Collaboration guidance

This skill composes with the PRD Committee in [`.cursor/agents/prd/`](../../../agents/prd/):

| Need | Delegate to | When |
|---|---|---|
| Stress-test assumptions | [`prd-challenger`](../../../agents/prd/prd-challenger.md) | Before validating a feature group with weak WHY or thin evidence |
| Evidence for Confidence | [`prd-researcher`](../../../agents/prd/prd-researcher.md) | When Confidence ≥ 7 is claimed without data |
| Cross-group ranking | [`prd-prioritizer`](../../../agents/prd/prd-prioritizer.md) | After ≥ 3 feature groups are validated |
| Detect drift / inflation | [`prd-scope-guardian`](../../../agents/prd/prd-scope-guardian.md) | Whenever Out of Scope shrinks or two groups overlap |
| Write delta to `docs/prd/` | [`prd-editor`](../../../agents/prd/prd-editor.md) | After user validation, via `/prd update` |
| Strategic synthesis | [`prd-product-lead`](../../../agents/prd/prd-product-lead.md) | When direction itself is unclear (escalate before building groups) |

The skill is the **construction surface**. The committee provides the **review surface**. Don't replicate their work — escalate.

## 10. Guardrails

- **Chat-first.** Never write `docs/prd/` directly. Hand off to the Editor.
- **One feature group at a time.** No parallel construction; no batch dumps.
- **Explicit validation, every time.** Silence ≠ approval. The four checkpoints in 3.7 are required.
- **No technical content.** If the user pulls toward implementation, name it and defer.
- **Respect persisted state.** Read `docs/prd/current.md` and `state.md` before extending an existing PRD.
- **Honor [`SISO`](../../../rules/00-siso.mdc).** If the request is RED/ORANGE, clarify before constructing — do not invent a feature group from a vague idea.
- **Honor [`10-prd-discovery.mdc`](../../../rules/10-prd-discovery.mdc).** Deltas over rewrites; no version bump without the documented triggers.
- **Smaller wins.** When in doubt, cut. A converged feature group beats a rich one.

A PRD that survives this skill should be **fewer feature groups, sharper scope, and more honest ICE** than what came in.
