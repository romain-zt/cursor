# /feature-area — Feature Area Workflow

## Usage

```txt
/feature-area <mode> [argument]
```

## Modes

| Mode | Purpose |
|------|---------|
| `map` | Read PRD and propose a Feature Area map — no file writes |
| `validate <feature-area-name>` | Run FA-01–FA-09 checks against an existing Feature Area file |
| `slice <feature-area-name>` | Propose candidate Scope Slices for a validated Feature Area — no file writes |
| `check <artifact-path>` | Run the scope-readiness checker against any Feature Area or Scope Slice file |

Governed by: `.cursor/rules/feature-area-workflow.mdc`
Templates: `.cursor/templates/product/`
Checker: `.cursor/checkers/scope-readiness-checker.md`
Operational skill: `.cursor/skills/feature-area/feature-area-builder/SKILL.md`
Agents: `.cursor/agents/feature-area/` (Feature Area Lead, Scope Critic)

---

## Pre-flight (all modes)

Before any mode executes, the Feature Area Builder skill reads in this order:

1. `docs/prd/state.md` — version, direction, last major change
2. `docs/prd/PRD.md` — active product definition
3. `docs/prd/questions/open-questions.md` — unresolved blockers
4. `docs/product-decisions/README.md` — durable product decisions (if the file exists)
5. `docs/product/feature-areas/` — all existing Feature Area files (if the directory exists)

Do not skip step 3. Open blockers constrain all downstream work.

If `docs/prd/PRD.md` is missing or empty, stop and suggest `/prd init` before proceeding.

**Feature Area Lead pre-flight (`map`, `validate`, `slice` only):** On the initial invocation of any of these modes, the Feature Area Lead agent (`.cursor/agents/feature-area/feature-area-lead.md`) produces a Feature Area Context Brief. The builder acts only after the brief is available. Skip for `check`. Do not re-run when the user is responding to an existing proposal.

---

## Mode: map

Reads the PRD and produces a proposed Feature Area map. **No file writes.**

### Behavior

1. Read the PRD Feature Groups and global product sections.
2. For each PRD Feature Group, determine whether it maps 1-to-1 to a Feature Area or needs to be split into multiple Feature Areas.
3. Apply the split criterion: if a group contains more than ~5 distinct user-value clusters, split it.
4. List existing Feature Area files (if any) and flag overlaps or gaps.
5. Produce the Feature Area Map proposal.

### Output format

```txt
Feature Area Map Proposal

Source PRD version: <version>

| Feature Area | PRD Source (§ section) | Status | Notes |
|---|---|---|---|
| <name> | § | proposed | |

Split decisions:
- <PRD group> → <FA-1>, <FA-2> — reason: <why split>

Existing FA files not covered by this proposal:
- <none | list>

Open blockers that may affect the map:
- <Q-ID> — <question>

Verdict: <N> proposed Feature Areas, <N> require PRD clarification before they can be created.

Next step:
- Create Feature Area files from `.cursor/templates/product/feature-area.template.md`
- Run `/feature-area validate <name>` per area before attempting Scope Slice decomposition
```

**Scope Critic review:** After the builder produces the map proposal, the Scope Critic (`.cursor/agents/feature-area/scope-critic.md`) reviews it before it is presented to the user. If the Scope Critic returns a REVISE verdict, revise the proposal before presenting.

**Hard rules for map mode:**
- No file writes.
- Do not name architecture, services, or runtime boundaries.
- Do not produce Scope Slices or user stories.
- "Feature Group" (PRD language) must be converted to "Feature Area" terminology — do not carry Feature Group naming into the proposal.

---

## Mode: validate `<feature-area-name>`

Runs the FA-01–FA-09 checks from `.cursor/checkers/scope-readiness-checker.md` (Part 1) against the Feature Area file at `docs/product/feature-areas/<feature-area-name>.md`.

### Behavior

1. Read the Feature Area file.
2. Read `docs/prd/questions/open-questions.md` to cross-check open blockers.
3. Run every check in Part 1 (FA-01 through FA-09) and Cross-Cutting checks CC-02, CC-03, CC-04, CC-05.
4. Output the summary table.
5. If all checks pass: state that the Feature Area may be marked `validated` and Scope Slices may be proposed via `/feature-area slice <name>`.
6. If any check fails: block advancement and state what must be resolved.

### Output format

Use the Summary Output Format defined in `.cursor/checkers/scope-readiness-checker.md`:

```txt
## Scope Readiness Check — <Feature Area Name>

| Check | Result | Notes |
|-------|--------|-------|
| FA-01 | PASS   |       |
| FA-02 | FAIL   | ...   |
| ...   |        |       |
| CC-02 | PASS   |       |
| CC-03 | PASS   |       |
| CC-04 | PASS   |       |
| CC-05 | PASS   |       |

**Advancement verdict:** CLEAR | BLOCKED
**Reason:** <first failing check if blocked>
**NEED_HUMAN:** true | false
**NEED_UPDATE:** true | false
```

**Hard rules for validate mode:**
- No file writes.
- Do not propose Scope Slices inside a validate response.
- Do not mark the Feature Area as `validated` in the file — the user must do that after reviewing the verdict.

---

## Mode: slice `<feature-area-name>`

Proposes candidate Scope Slices for a Feature Area that has been marked `validated`. **No file writes.**

### Pre-condition gate

Before proposing slices:

1. Read `docs/product/feature-areas/<feature-area-name>.md`.
2. Confirm `Status: validated`. If status is not `validated`, stop and return:

```txt
Cannot propose Scope Slices.

Feature Area "<name>" has status "<current status>".
Scope Slice decomposition requires status = validated.

Run `/feature-area validate <name>` to check what is blocking advancement.
```

3. Confirm `NEED_HUMAN: false`. If `NEED_HUMAN: true`, stop and list the open blockers — do not propose slices until they are resolved.

### Behavior

1. Read the Feature Area's In Scope, Out of Scope, Business Objects Touched, and Candidate Scope Slices sections.
2. Identify distinct user-value clusters within the In Scope section.
3. For each cluster, propose one Scope Slice:
   - Name (kebab-safe, descriptive)
   - One-line user value description
   - Draft boundary (included / excluded)
   - Any immediate blockers or NEED_HUMAN flags
4. Cross-check each proposed slice against the v0 exclusion list in `.cursor/rules/feature-area-workflow.mdc` §6.

### Output format

```txt
Scope Slice Proposal — <Feature Area Name>

| Slice name | User value (one sentence) | Blockers | Tentative status |
|---|---|---|---|
| <kebab-name> | <one sentence> | none | exploratory |

Notes:
- <any cross-cutting concern: credit, sharing, privacy, feedback>

Deferred (v0 exclusion):
- <slice candidate deferred with PRD reference>

Next step:
- Create Scope Slice files from `.cursor/templates/product/scope-slice.template.md`
  Location: docs/product/scope-slices/<feature-area-kebab>--<slice-kebab>.md
- Run `/feature-area check <artifact-path>` after filling each file
```

**Scope Critic review:** After the builder produces the slice proposal, the Scope Critic reviews it before it is presented to the user. If the Scope Critic returns a REVISE verdict, revise the proposal before presenting.

**Hard rules for slice mode:**
- No file writes.
- No architecture, data models, API routes, or technology choices.
- Do not write user stories, specs, or tasks.
- Each proposed slice must deliver user value independently.

---

## Mode: check `<artifact-path>`

Runs the full scope-readiness checker against any Feature Area or Scope Slice file.

### Behavior

1. Read the file at `<artifact-path>`.
2. Detect artifact type:
   - Path under `docs/product/feature-areas/` → run Part 1 (FA-01–FA-09) + CC-02–CC-05
   - Path under `docs/product/scope-slices/` → run Part 2 (SS-01–SS-11) + CC-01–CC-05
   - Path under both or ambiguous → ask the user to confirm which part to run
3. Run all applicable checks from `.cursor/checkers/scope-readiness-checker.md`.
4. Output the summary table with advancement verdict.

### Output format

```txt
## Scope Readiness Check — <Artifact Name>
## Type: Feature Area | Scope Slice

| Check | Result | Notes |
|-------|--------|-------|
| ...   |        |       |

**Advancement verdict:** CLEAR | BLOCKED
**Reason:** <first failing check if blocked>
**NEED_HUMAN:** true | false
**NEED_UPDATE:** true | false

Next recommended command:
- /feature-area validate <name> | /feature-area slice <name> | resolve blockers and re-run check
```

**Hard rules for check mode:**
- No file writes.
- Do not propose fixes — only report check results and state what must be resolved.

---

## Skill and agent responsibilities

| Operation | Feature Area Lead | Feature Area Builder | Scope Critic |
|-----------|------------------|---------------------|--------------|
| `map` | Context Brief (pre-flight) | Drives proposal | Reviews proposal |
| `validate` | Context Brief (pre-flight) | Runs checker | Not invoked |
| `slice` | Context Brief (pre-flight) | Drives proposal | Reviews proposal |
| `check` | Not invoked | Runs checker | Not invoked |

Read `.cursor/agents/feature-area/README.md` for the full operating principle.

---

## Hard rules (all modes)

- No task slicing, user stories, specs, or architecture at any point.
- Do not skip levels in the hierarchy: PRD → Feature Area → Scope Slice.
- Do not mark any artifact as `validated` or `ready-for-user-stories` in response text — the user must update the file.
- Do not carry "Feature Group" terminology into any output — use "Feature Area" exclusively.
- Any `NEED_HUMAN=true` flag blocks advancement until the user explicitly resolves it.
- Any `NEED_UPDATE=true` flag must surface a description of what is missing before proceeding.
- Do not proceed past a known open blocker in `docs/prd/questions/open-questions.md` without explicit user approval.
