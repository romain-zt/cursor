# /prd — PRD Discovery Orchestrator

## Usage

```txt
/prd <mode> [optional context]
```

## Modes

| Mode | Lead | Purpose |
|------|------|---------|
| `discover` | PRD Builder skill | Open product discovery, free-form capture |
| `questions` | PRD Question Loop | Ask the next unresolved discovery question |
| `note` | PRD Question Loop | Capture one insight as a discovery note, update question queue |
| `converge` | PRD Builder skill | Synthesize notes into a proposed PRD delta |
| `challenge` | Challenger agent | Stress-test assumptions, scope, drift |
| `prioritize` | PRD Builder skill | Re-rank feature groups using ICE |
| `update` | PRD Builder skill | Persist an approved delta |

If no mode is given:

1. If `docs/prd/questions/open-questions.md` exists and has an open question, treat the user input as an answer to the current highest-priority open question and run `questions` mode.
2. If the user input looks like a new product insight, correction, or founder note, run `note` mode.
3. If neither applies, ask which mode the user wants.

## Templates

Canonical reusable document templates live under `.cursor/templates/prd/`.

Project files under `docs/prd/` and `docs/product-decisions/` are generated or edited project instances, not template sources.

Do not use `docs/prd/notes/README.md`, `docs/prd/questions/open-questions.md`, `docs/prd/PRD.md`, `docs/prd/state.md`, `docs/prd/history.md`, or `docs/product-decisions/*.md` as canonical templates.

When creating or reinitializing a discovery note, use `.cursor/templates/prd/discovery-note.template.md`.

When creating or reinitializing the open question queue, use `.cursor/templates/prd/open-questions.template.md`.

When creating or reinitializing PRD/state/history/product-decision files, use the matching file under `.cursor/templates/prd/`.

Existing files under `docs/` may be read as project context, but not copied as reusable templates.

`docs/prd/notes/README.md` is allowed to explain the local notes folder for humans, but it is not the source of truth for the note entry format. If it conflicts with `.cursor/templates/prd/discovery-note.template.md`, the `.cursor/templates/` version wins.

## Pre-flight

1. Read `docs/prd/PRD.md` — the active PRD.
2. Read `docs/prd/state.md` — version, direction, last major change.
3. **Apply SISO only in `update`, `challenge`, and `prioritize` modes.** In `discover`, `note`, `questions`, and `converge`, all user input is treated as raw discovery material regardless of ambiguity level. Never return SISO ORANGE or RED for a product insight given during discovery.

## Mode: discover

Open-ended capture. Every user input is treated as a meeting note, not an execution request.

Default behavior per user input:
1. Append insight to `docs/prd/notes/YYYY-MM-DD-<topic>-discovery-note.md` (format: see `.cursor/templates/prd/discovery-note.template.md`). Update `docs/prd/questions/open-questions.md` if the insight opens or answers a question.
2. Interpret the likely product meaning in 1–3 lines.
3. Identify the PRD implication in 1–3 lines.
4. Ask **one** follow-up question. Stop.

Do not run the Surface Gate, ICE scoring, DoD, Out-of-Scope, or convergence checks during open discovery. Do not propose a PRD update.

If no direction exists, open with one orienting question — do not launch the full Surface Gate.

**Discovery response shape:**

```txt
Captured as discovery note.

Interpreted insight:
<1–3 lines>

PRD implication:
<1–3 lines>

One question:
<single question, or "None">
```

## Mode: questions

Human-first discovery loop driven by `docs/prd/questions/open-questions.md`.

See `.cursor/commands/prd-questions.md` for the full spec. Short version:

1. Read `docs/prd/questions/open-questions.md`.
2. Find the highest-priority `open` question (lowest priority number, then lowest ID).
3. Ask **only that one question**. No table. No summary.
4. Do not write to `PRD.md`. Do not run convergence, ICE, or Surface Gate.
5. After the user answers, update the discovery note and question file, then ask the next open question.
6. When no open questions remain, suggest `/prd converge`.

## Mode: note

Capture user input as a discovery note and update the question queue.

1. Append the raw input to the active discovery note (`docs/prd/notes/YYYY-MM-DD-<topic>-discovery-note.md`).
2. Interpret the likely product meaning in 1–3 lines.
3. Identify the PRD implication in 1–3 lines.
4. If the input opens or answers a question, update `docs/prd/questions/open-questions.md`.
5. Ask **one** follow-up question maximum. Stop.

Do not propose PRD updates.

## Mode: converge

Synthesis mode only. No file writes.

`/prd converge` **may not**:
- write files
- update `PRD.md`, `state.md`, `history.md`, or `archive/`
- mark groups as `validated` or `committed`
- generate implementation specs, tickets, or architecture
- produce a full multi-group PRD in one pass
- produce a build sequence unless **at least 3 feature groups were explicitly validated in separate prior turns**

`/prd converge` **may only**:
1. Read `docs/prd/PRD.md`, `docs/prd/state.md`, `docs/prd/notes/`, and `docs/prd/questions/open-questions.md`.
2. Synthesize the latest discovery into a proposal.
3. Draft **at most one** primary feature group candidate.
4. List other possible feature groups as **candidates only** (names, no full drafts).
5. Identify open blockers and assumptions.
6. Ask **exactly one** validation question.
7. Stop.

**Required output format:**

```txt
Convergence Proposal

1. Synthesized insight
<short synthesis>

2. Proposed PRD change
<what would change, but not written>

3. Primary feature group candidate
<one feature group max, draft or summary>

4. Other candidate groups
<names only, no full drafts>

5. Open blockers / assumptions
<short list>

6. One validation question
<one question only>
```

**Hard rule:** The words "validated", "committed", "ready to persist", or "ready to build" must not appear in a converge response unless the user explicitly validated the required checkpoint in the **immediately preceding turn**.

## Mode: challenge

Challenger leads. Reads active PRD and recent discussion. Produces: assumption → risk → test or kill criterion. Flags drift against state.md. Researcher labels evidence quality. No file writes.

**False-convergence checks are mandatory** (see `prd-challenger.md`). For each non-`exploratory` group, Challenger verifies that buyer entry point, buyer-facing surface, merchant operating surface, source of truth, market/language, and confirmation channel are explicitly resolved or marked UNKNOWN with the Confidence cap applied. Any hidden surface assumption — including implementation language smuggled into product wording — is reported as `FALSE CONVERGENCE RISK`.

## Mode: prioritize

PRD Builder skill enumerates feature groups and scores each on ICE:

- **Impact** (1–10): user + business value
- **Confidence** (1–10): evidence quality (not enthusiasm)
- **Ease** (1–10): realistic cost, inverted (10 = trivial)

Formula: `score = Impact × Confidence × Ease / 100` (max 10.0).

Output: ranked table with KEEP / DEFER / CUT / TEST-FIRST decisions + explicit cut list. No file writes.

## Mode: update

`/prd update` is the only mode allowed to write `docs/prd/PRD.md`, `docs/prd/state.md`, `docs/prd/history.md`, or `docs/prd/archive/`. All other modes must not write to those files. Discovery modes (`discover`, `note`, `questions`) may write to `docs/prd/notes/` and `docs/prd/questions/` — those are capture artifacts (see Discovery artifacts below).

### Update approval rule

`/prd update` **may write files only if the immediately preceding assistant turn contained a complete PRD Delta Proposal.**

A complete PRD Delta Proposal must include:
- target file(s)
- exact section(s)
- before content (or "n/a — new section")
- after content
- rationale
- version bump decision
- explicit list of files that will **not** be touched

If no complete PRD Delta Proposal exists in the immediately preceding turn, respond:

```txt
No approved PRD delta exists yet.

Run /prd converge first to create a delta proposal, then approve it explicitly.
```

**The word "ok" alone does not authorize a full PRD write** unless the immediately preceding assistant message contained the full PRD Delta Proposal.

Before writing, `/prd update` must restate:
- files to be changed
- files not to be touched
- whether `history.md` / `archive/` will be touched
- whether this is a patch or a version bump

Then wait for explicit approval: **approved**

### Procedure

1. PRD Builder skill produces a delta proposal: target file, section, before/after, rationale, version-bump decision.
2. Challenger verifies every addition has a paired cut, deferral, or kill criterion.
3. **Surface readiness check** — for any group whose Status is being written or promoted:
   - If any required surface field (buyer entry point, buyer-facing surface, merchant operating surface, source of truth, market/language) is UNKNOWN, Status MUST be `validated-with-open-surface` (not `validated`, not `committed`) and the `Surface Blockers` list MUST be persisted verbatim.
   - Confidence in the persisted ICE tuple MUST respect the surface cap (≤ 4 when applicable).
   - A promotion to `validated` or `committed` requires written confirmation that all required surface fields are resolved.
4. Wait for explicit human approval (see approval rule above).
5. On approval, apply the smallest edit. If version bump: add a row to `docs/prd/history.md`, copy current PRD.md to `docs/prd/archive/PRD-v<N>.md`, then update PRD.md + state.md.

**A PRD patch is not a version bump.** Do not write `docs/prd/history.md` or `docs/prd/archive/` for a patch unless the user explicitly approved those files in the PRD Delta Proposal.

## Discovery artifacts

Writes to `docs/prd/notes/` and `docs/prd/questions/open-questions.md` are **capture artifacts** — they are allowed in `discover`, `note`, and `questions` modes and must not be blocked by SISO. They are not PRD persistence and do not trigger version bumps.

## Hard rules

- Chat-first, deltas over rewrites.
- No technical architecture or implementation.
- No writes to `PRD.md`, `state.md`, or `history.md` outside `update` mode.
- No version bumps without the triggers in `10-prd-discovery.mdc`.
- Drift between conversation and state.md is surfaced, not silently absorbed.
- No persistence of `validated` / `committed` while required surface fields are UNKNOWN. Use `validated-with-open-surface` and persist the blockers.
- No implementation specs, tickets, or architecture work derived from a `validated-with-open-surface` group unless the user has explicitly waived the specific blocker in writing.
