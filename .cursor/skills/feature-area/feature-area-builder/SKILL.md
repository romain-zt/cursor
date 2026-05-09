---
name: feature-area-builder
description: Drives Feature Area decomposition — maps PRD Feature Groups to Feature Areas, runs readiness checks, and proposes Scope Slices. `scaffold` writes initial Feature Area markdown from an approved map (only mode that may create Feature Area files). All other modes are proposal/check-only. Never creates Scope Slice files here. Never writes user stories, specs, tasks, or architecture.
disable-model-invocation: true
---

# Feature Area Builder

Operational skill for converting a converged PRD into Feature Areas and Scope Slices. Drives the `/feature-area` command modes. Does not drive the PRD workflow — that is the PRD Builder skill's domain.

## 1. Goal

Produce Feature Area and Scope Slice proposals that are:

- Grounded in specific PRD sections (not invented from context)
- Written in user-value language (no technical terms)
- Bounded by explicit in-scope / out-of-scope definitions
- Small enough that Scope Slices can be filled without architecture decisions
- Gated by the scope-readiness-checker before any status advancement

Anti-goal: decomposing fast to look productive. A wrong Feature Area is harder to fix than a slow one.

## 2. Activation

Activate when the user runs `/feature-area <mode>`.

Do not activate for PRD discovery, ICE scoring, product decisions, or architecture work — those belong to the PRD workflow.

Before any mode executes:

1. Read `docs/prd/state.md`
2. Read `docs/prd/PRD.md`
3. Read `docs/prd/questions/open-questions.md`
4. Read `docs/product-decisions/README.md` (if it exists)
5. Read all files in `docs/product/feature-areas/` (if any)

If `docs/prd/PRD.md` is missing or empty: stop and recommend `/prd init`.

## 3. Feature Area Lead Pre-flight

Before executing `map`, `validate`, `slice`, or a **cold-start** `scaffold` (no in-thread approved map from `map`), confirm that a Feature Area Context Brief has been produced by the Feature Area Lead (`.cursor/agents/feature-area/feature-area-lead.md`) for this command flow.

The brief is context reconstruction only — not a decomposition proposal, not a validation run, not a file write.

**Do not re-run the pre-flight** when the user is responding to an existing proposal (e.g. saying "proceed" or "use your judgment" after reviewing a map proposal). Resume the active flow.

When running **`scaffold` immediately after** the user approves a Feature Area Map produced in **this same conversation**, **reuse** the Context Brief from `map` — do not re-run the Lead.

If no brief exists and one is required, request it before proceeding.

## 4. Mode: map

Convert PRD Feature Groups into a proposed Feature Area map.

### Behavior

1. Read the PRD Feature Groups section.
2. For each Feature Group, determine:
   - Does it map 1-to-1 to a Feature Area, or does it contain multiple distinct user-value clusters?
   - Split criterion: more than ~5 distinct user-value clusters inside one group → propose multiple Feature Areas.
   - If a Feature Group is too vague to name user-value clusters: flag it as not-ready-to-map and surface the missing clarity.
3. Apply terminology conversion: PRD "Feature Group" → Feature Area in all output. Do not carry Feature Group naming forward.
4. Cross-check every proposed Feature Area against the v0 exclusion list in `.cursor/rules/feature-area-workflow.mdc` §6. If a proposed area is entirely deferred, mark it `deferred` and exclude from the active list.
5. Check existing `docs/product/feature-areas/` files for overlap or gaps.
6. Invoke Scope Critic (`.cursor/agents/feature-area/scope-critic.md`) to review the proposal before presenting it to the user.
7. Present the map proposal using the output format in `.cursor/commands/feature-area.md` Mode: map.

### Split decision rules

Split a PRD Feature Group when:
- It contains behaviors with different actors (e.g. buyer flow vs. merchant configuration flow)
- It contains behaviors with different lifecycle timing (e.g. real-time flow vs. async notification)
- Candidate Scope Slices inside it don't share a coherent user-facing concern

Do not split based on technical layer or implementation complexity.

### What the map does NOT produce

- Feature Area files — use `/feature-area scaffold` after approval (writes from `.cursor/templates/product/feature-area.template.md`)
- Scope Slices (those come after validation)
- Architecture diagrams or service boundaries

## 5. Mode: scaffold

Write initial Feature Area files after the user **approves** a Feature Area Map in-context. Governed by `.cursor/commands/feature-area.md` Mode: scaffold.

**Safety:** `/feature-area scaffold` is the **only** `/feature-area` mode that may create `docs/product/feature-areas/<kebab-name>.md`. All other modes remain proposal/check-only for Feature Area files.

### Pre-conditions

1. An **approved** Feature Area Map must be available in the current conversation (user-explicit approval of the proposed v0 areas). If not: stop; run `/feature-area map` first.
2. Complete the standard read order (§2) before writing.

### Behavior

1. For each **proposed v0 Feature Area** in the approved map, resolve `docs/product/feature-areas/<kebab-name>.md`.
2. **Skip without overwrite** if the file exists and is **non-empty** (any non-whitespace content). List skipped paths in the output.
3. If missing or **empty-only**, instantiate from **`.cursor/templates/product/feature-area.template.md`** (keep template structure and headings).
4. Set **`Status: exploratory`** (and template `STATUS` / status line per template convention).
5. Copy **`NEED_HUMAN`** and **`NEED_UPDATE`** from the approved map **verbatim** for that row.
6. Fill sections from the **approved map** plus **`docs/prd/PRD.md`** (and open questions / product decisions) **only** to ground product intent, boundaries, journeys, blockers, etc. — no invention of execution detail.
7. **Candidate Scope Slices** table: **names + one-line descriptions** only (and `exploratory` per template status column if used). No extra decomposition beyond the map.
8. **Do not:** create Scope Slice files; run FA validation; overwrite non-empty Feature Area files; write user stories, specs, tasks, architecture, services, APIs, or data models.

### Output

Use the result format in `.cursor/commands/feature-area.md` (Created / Skipped / NEED_HUMAN list / next `/feature-area validate <kebab-name>`).

## 6. Mode: validate

Run FA-01–FA-09 and CC-02–CC-05 from `.cursor/checkers/scope-readiness-checker.md` against a Feature Area file.

### Behavior

1. Read `docs/product/feature-areas/<feature-area-name>.md`.
2. Read `docs/prd/questions/open-questions.md` to cross-check open blockers against the FA.
3. Run each check in order. For each check:
   - PASS: the condition is met
   - FAIL: the condition is not met — state exactly what fails and what must change
   - SKIP: the check is genuinely inapplicable — explain why (never use SKIP to avoid a hard question)
4. A single FAIL blocks advancement. Do not paper over it.
5. Output the summary table from `.cursor/checkers/scope-readiness-checker.md` Summary Output Format.
6. State the advancement verdict clearly: CLEAR or BLOCKED.

### After a CLEAR verdict

State that the Feature Area may be marked `validated` by the user and that Scope Slices may then be proposed via `/feature-area slice <name>`.

Do not mark the file `validated` — that is the user's action.

### After a BLOCKED verdict

State the first failing check and what must be resolved. Do not propose fixes inline. Route to the user for resolution.

## 7. Mode: slice

Propose candidate Scope Slices for a Feature Area that the user has marked `validated`.

### Pre-condition gate

Before proposing slices, verify:

1. Read `docs/product/feature-areas/<feature-area-name>.md`.
2. `Status` must be `validated`. If not: stop and output the gate message from `.cursor/commands/feature-area.md` Mode: slice.
3. `NEED_HUMAN` must be `false`. If `true`: stop, list the open blockers, and do not proceed.

If both conditions pass: proceed to slice proposal.

### Behavior

1. Read the Feature Area's In Scope, Out of Scope, Business Objects Touched, and Candidate Scope Slices sections.
2. Identify distinct user-value clusters in the In Scope section.
3. For each cluster, draft one candidate Scope Slice:
   - Name: kebab-safe, user-facing, no technical terms
   - User value: one sentence, behavioral, no implementation language
   - Draft boundary: included behaviors (exhaustive), excluded behaviors (at least the v0 deferrals)
   - Immediate blockers: any open question that would set NEED_HUMAN on this slice
4. Cross-check every proposed slice against the v0 exclusion list. Mark deferred slices explicitly.
5. Flag any cross-cutting concerns (credit, sharing, privacy, feedback) per each slice.
6. Invoke Scope Critic (`.cursor/agents/feature-area/scope-critic.md`) to review the proposal.
7. Present using the output format in `.cursor/commands/feature-area.md` Mode: slice.

### Slice sizing rules

A Scope Slice is correctly sized when:
- It delivers one user-visible benefit on its own
- It can be fully described without naming technical layers
- It can produce 2–6 user stories when filled

A Scope Slice is too large when:
- It requires architecture decisions to define its boundary
- It contains multiple distinct user benefits that could be delivered independently

A Scope Slice is too small when:
- It delivers no recognizable standalone value
- It is only meaningful when combined with another slice

Merge or split before presenting to the user.

### What the slice proposal does NOT produce

- Scope Slice files (the user creates those from `.cursor/templates/product/scope-slice.template.md`)
- User stories, specs, or tasks
- Data models, API routes, or technology choices

## 8. Mode: check

Run the scope-readiness checker against any Feature Area or Scope Slice file.

### Behavior

1. Read the file at `<artifact-path>`.
2. Detect artifact type by path:
   - `docs/product/feature-areas/` → Part 1 (FA-01–FA-09) + CC-02–CC-05
   - `docs/product/scope-slices/` → Part 2 (SS-01–SS-11) + CC-01–CC-05
   - Ambiguous: ask the user which part to run before proceeding
3. Run all applicable checks from `.cursor/checkers/scope-readiness-checker.md`.
4. Output the summary table with advancement verdict.

Note: `check` mode does not require Feature Area Lead pre-flight. It is a mechanical checker run.

## 9. Collaboration

| Need | Delegate to | When |
|------|-------------|------|
| Context reconstruction before map, validate, slice, or cold-start scaffold | Feature Area Lead | On initial invocation — produce a Context Brief first; for `scaffold` after same-thread map approval, reuse that brief |
| Stress-test a proposed FA map | Scope Critic | After map proposal, before presenting to user |
| Stress-test proposed Scope Slices | Scope Critic | After slice proposal, before presenting to user |

Do not replicate the agents' work — invoke them and incorporate their output.

## 10. Handoff to User Story authoring

Feature Area Builder scope ends at Scope Slice proposals.

When a Scope Slice file exists with `Status: ready-for-user-stories` and `NEED_HUMAN: false`, the next step is user story authoring. That layer is governed by a separate workflow — this skill does not drive it.

State explicitly when a Scope Slice reaches this point:

```txt
Scope Slice "<name>" is marked ready-for-user-stories.
User story authoring may begin.

This skill does not drive user story authoring.
Refer to the user story workflow for next steps.
```

## 11. Anti-patterns

| Anti-pattern | Verdict |
|---|---|
| Creating Feature Area files outside `scaffold` or overwriting non-empty FA files | Forbidden |
| Creating Scope Slice files inside this workflow | Forbidden — proposals only unless a separate authoring step creates them |
| Naming architecture, services, or runtime decisions | Forbidden |
| Writing user stories, specs, or tasks | Forbidden |
| Proposing Scope Slices before FA is validated | Forbidden |
| Skipping Feature Area Lead pre-flight on initial map, validate, slice, or cold-start scaffold | Wrong |
| Skipping Scope Critic review on map or slice proposals | Wrong |
| Using "Feature Group" terminology in any output | Wrong — use "Feature Area" |
| Marking artifacts as `validated` or `ready-for-user-stories` in response text | Forbidden — the user updates the file |
| Proceeding past NEED_HUMAN=true without explicit user approval | Forbidden |
| Silently working around a NEED_UPDATE flag | Forbidden — surface it |
| Creating Scope Slices directly from a PRD Feature Group | Forbidden — Feature Area decomposition must happen first |

## 12. Guardrails

- **Proposal-first except `scaffold`.** `/feature-area scaffold` is the only Feature Area mode that may create Feature Area markdown files (`docs/product/feature-areas/`). Every other mode: proposals/checks only.
- **One mode at a time.** Do not run map + slice in one response.
- **Explicit blockers.** Any FAIL in the checker blocks advancement — do not paper over it with prose.
- **Terminology precision.** Feature Area, Scope Slice, User Story, Spec, Task — no synonyms, no shortcuts.
- **v0 discipline.** Every proposal must be cross-checked against the hard v0 exclusion list before presenting to the user.
