# /prd — PRD Discovery Orchestrator

## Usage

```txt
/prd <mode> [optional context]
```

## Modes

| Mode | Lead | Purpose |
|------|------|---------|
| `init` | PRD Bootstrap | Initialize missing docs workspace from `.cursor/templates/prd/` |
| `discover` | PRD Builder skill | Open product discovery, free-form capture |
| `questions` | PRD Question Loop | Ask the next unresolved discovery question |
| `note` | PRD Question Loop | Capture one insight as a discovery note, update question queue |
| `converge` | PRD Lead → PRD Builder skill | Reconstruct product context, then synthesize notes into a proposed PRD delta |
| `challenge` | PRD Lead → Challenger agent | Reconstruct product context, then stress-test assumptions, scope, drift |
| `prioritize` | PRD Lead → PRD Builder skill | Reconstruct product context, then re-rank feature groups using ICE |
| `update` | PRD Lead → PRD Builder skill | Reconstruct product context, then persist an approved delta |

If no mode is given:

1. If `docs/prd/questions/open-questions.md` exists and has an open question, treat the user input as an answer to the current highest-priority open question and run `questions` mode.
2. If the user input looks like a new product insight, correction, or founder note, run `note` mode.
3. If neither applies, ask which mode the user wants.

## Templates

Canonical template rules live in `.cursor/rules/10-prd-discovery.mdc`.

Use `.cursor/templates/prd/` as the only reusable source for generated PRD docs.
Never use `docs/**` files as templates.

## Pre-flight

1. Before reading `docs/prd/PRD.md` or `docs/prd/state.md`, if either file is missing or empty, suggest `/prd init` instead of assuming the PRD exists.
2. Read `docs/prd/PRD.md` — the active PRD.
3. Read `docs/prd/state.md` — version, direction, last major change.
4. **PRD Lead pre-flight (converge / challenge / prioritize / update only):** On the **initial invocation** of any of these modes, invoke the PRD Lead agent (`.cursor/agents/prd/prd-lead.md`) to produce a PRD Context Brief. The mode's lead agent acts only after the brief is available. Skip for `init`, `discover`, `questions`, and `note`. **Do not run pre-flight again when the user responds `approved`, `preview`, or `cancel` to an existing Patch Intent Summary or PRD Delta Proposal** — those responses resume an active approval flow and must not be interrupted.
5. **SISO classification for `/prd update`:** `/prd update` is a structured persistence workflow — not implementation, specs, tickets, or architecture. SISO must not block it as execution. It still requires explicit persistence approval through a Patch Intent Summary or full PRD Delta Proposal (see Mode: update below). In `discover`, `note`, `questions`, and `converge`, all user input is treated as raw discovery material. Never return SISO ORANGE or RED for a product insight given during discovery.

## Mode: init

Initialize or repair the `docs/` PRD workspace from `.cursor/templates/prd/`.

- Create missing directories and missing/empty files.
- Never overwrite non-empty project docs.
- Use only `.cursor/templates/prd/` as the canonical source.
- Do not run discovery or convergence.

See `.cursor/commands/prd-init.md` for the full spec.

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

`/prd update` is a structured persistence workflow. It is not implementation, specs, tickets, or architecture — SISO must not block it. It still requires explicit persistence approval through a Patch Intent Summary or full PRD Delta Proposal.

### Default: Patch Intent Summary

For low-risk patches where **all** of the following are true, produce a **Patch Intent Summary** instead of a full PRD Delta Proposal:

- Content to persist is already present in prior discovery notes, answered questions, or the immediately preceding convergence proposal.
- The update is a PRD/status/state patch, not a version bump.
- No group is being promoted to `committed`.
- No implementation specs, tickets, architecture, or code will be created.
- `history.md` and `archive/` will not be touched.
- The patch can be applied mechanically from existing project context.

**Patch Intent Summary format:**

```txt
Patch Intent Summary

Files to change:
- docs/prd/PRD.md — <short description>
- docs/prd/state.md — <short description>

Files not touched:
- docs/prd/history.md
- docs/prd/archive/
- docs/prd/notes/
- docs/prd/questions/
- docs/product-decisions/

Patch type:
- patch | version bump

Content source:
- <notes file / answered questions / convergence proposal / user-approved checkpoint>

Safety:
- no status promoted to committed
- no implementation specs/tickets/architecture
- no history/archive update
- unresolved blockers remain listed

Approval required:
Reply `approved` to apply.
Reply `preview` to see the full before/after diff first.
```

**Hard rule:** Do not print full PRD sections in chat during Patch Intent Summary mode.

### When to use full PRD Delta Proposal

Use a full PRD Delta Proposal with exact Before/After only when:

- User explicitly replies `preview`
- Version bump
- `history.md` or `archive/` will be touched
- Deleting existing content
- Replacing an already active non-scaffold PRD section
- Promoting status to `validated`, `committed`, or implementation-ready
- Changing ICE by more than ±1
- Changing source of truth, buyer surface, merchant surface, payment model, or market/language after they were already persisted
- User explicitly asks to review exact wording before write

Otherwise, prefer Patch Intent Summary.

### Approval behavior

If the previous assistant turn contained a **Patch Intent Summary**:
- `approved` — apply the patch described in the summary
- `preview` — show the full PRD Delta Proposal with exact Before/After
- `cancel` — stop the update

If the previous assistant turn contained a **full PRD Delta Proposal**:
- `approved` — apply the exact delta

Never accept `ok` alone as persistence approval.

If no Patch Intent Summary or PRD Delta Proposal exists in the immediately preceding turn, respond:

```txt
No Patch Intent Summary or full PRD Delta Proposal exists yet.

Run `/prd update` with a clear persistence target, or run `/prd converge` first if the content has not been synthesized yet.
```

### Output after writing

After `approved`, write files immediately. Do not reprint the full written content.

**Final response format:**

```txt
Updated:
- <file> — <short change>
- <file> — <short change>

Not touched:
- <file/group>
- <file/group>

Remaining open questions:
- <Q-ID if any> — <question>
or
- None

Next recommended command:
- /prd questions | /prd challenge | /prd converge | /prd prioritize
```

**Hard rule:** Do not echo full PRD content after writing. The file is the source of truth.

### Procedure

0. **PRD Lead pre-flight** — on initial invocation, PRD Lead produces the PRD Context Brief (see Pre-flight step 4). PRD Builder skill acts after the brief is available. Skip on `approved`, `preview`, or `cancel` responses.
1. PRD Builder skill assesses whether Patch Intent Summary or full PRD Delta Proposal is required (see rules above).
2. Produce the appropriate format and wait for approval.
3. Challenger verifies every addition has a paired cut, deferral, or kill criterion.
4. **Surface readiness check** — for any group whose Status is being written or promoted:
   - If any required surface field (buyer entry point, buyer-facing surface, merchant operating surface, source of truth, market/language) is UNKNOWN, Status MUST be `validated-with-open-surface` (not `validated`, not `committed`) and the `Surface Blockers` list MUST be persisted verbatim.
   - Confidence in the persisted ICE tuple MUST respect the surface cap (≤ 4 when applicable).
   - A promotion to `validated` or `committed` requires written confirmation that all required surface fields are resolved.
5. On `approved`, apply the smallest edit. Output only the compact final response format — do not echo file content. If version bump: add a row to `docs/prd/history.md`, copy current PRD.md to `docs/prd/archive/PRD-v<N>.md`, then update PRD.md + state.md.

**A PRD patch is not a version bump.** Do not write `docs/prd/history.md` or `docs/prd/archive/` for a patch unless the user explicitly approved those files.

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
