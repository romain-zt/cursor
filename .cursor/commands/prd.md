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

## Pre-flight

1. Read `docs/prd/PRD.md` — the active PRD.
2. Read `docs/prd/state.md` — version, direction, last major change.
3. **Apply SISO only in `update`, `challenge`, and `prioritize` modes.** In `discover`, `note`, and `converge`, all user input is treated as raw discovery material regardless of ambiguity level. Never return SISO ORANGE or RED for a product insight given during discovery.

## Mode: discover

Open-ended capture. Every user input is treated as a meeting note, not an execution request.

Default behavior per user input:
1. Append insight to `docs/prd/notes/YYYY-MM-DD-<topic>-discovery-note.md` (see `docs/prd/notes/README.md` for format). Update `docs/prd/questions/open-questions.md` if the insight opens or answers a question.
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

Synthesis mode. Read all files under `docs/prd/notes/`. Run the Surface Gate (§3.0.5) if any required surface field is unresolved. Propose a PRD delta. No file writes — output is a structured delta proposal. The user must approve before proceeding to `update`.

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

`/prd update` is the only mode allowed to propose changes to `docs/prd/PRD.md`, `docs/prd/state.md`, and `docs/prd/history.md`. All other modes must not write to those files. Discovery modes (`discover`, `note`, `questions`) may write to `docs/prd/notes/` and `docs/prd/questions/` — those are capture artifacts (see Discovery artifacts below).

1. PRD Builder skill produces a delta proposal: target file, section, before/after, rationale, version-bump decision.
2. Challenger verifies every addition has a paired cut, deferral, or kill criterion.
3. **Surface readiness check** — for any group whose Status is being written or promoted:
   - If any required surface field (buyer entry point, buyer-facing surface, merchant operating surface, source of truth, market/language) is UNKNOWN, Status MUST be `validated-with-open-surface` (not `validated`, not `committed`) and the `Surface Blockers` list MUST be persisted verbatim.
   - Confidence in the persisted ICE tuple MUST respect the surface cap (≤ 4 when applicable).
   - A promotion to `validated` or `committed` requires written confirmation that all required surface fields are resolved.
4. Wait for human approval.
5. On approval, apply the smallest edit. If version bump: add a row to `docs/prd/history.md`, copy current PRD.md to `docs/prd/archive/PRD-v<N>.md`, then update PRD.md + state.md.

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
