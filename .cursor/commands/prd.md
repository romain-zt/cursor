# /prd — PRD Discovery Orchestrator

## Usage

```txt
/prd <mode> [optional context]
```

## Modes

| Mode | Lead | Purpose |
|------|------|---------|
| `discover` | PRD Builder skill | Open product discovery, convergence loop |
| `challenge` | Challenger agent | Stress-test assumptions, scope, drift |
| `prioritize` | PRD Builder skill | Re-rank feature groups using ICE |
| `update` | PRD Builder skill | Propose and write a PRD delta |

If no mode is given, ask the user which mode they want.

## Pre-flight (every mode)

1. Read `docs/prd/PRD.md` — the active PRD.
2. Read `docs/prd/state.md` — version, direction, last major change.
3. Apply SISO. If RED/ORANGE, clarify before proceeding.

## Mode: discover

The PRD Builder skill drives the convergence loop (one feature group at a time). Researcher tags evidence. Challenger attacks weak logic. No file writes — output is structured discussion.

## Mode: challenge

Challenger leads. Reads active PRD and recent discussion. Produces: assumption → risk → test or kill criterion. Flags drift against state.md. Researcher labels evidence quality. No file writes.

## Mode: prioritize

PRD Builder skill enumerates feature groups and scores each on ICE:

- **Impact** (1–10): user + business value
- **Confidence** (1–10): evidence quality (not enthusiasm)
- **Ease** (1–10): realistic cost, inverted (10 = trivial)

Formula: `score = Impact × Confidence × Ease / 100` (max 10.0).

Output: ranked table with KEEP / DEFER / CUT / TEST-FIRST decisions + explicit cut list. No file writes.

## Mode: update

`/prd update` is the only mode allowed to propose PRD file changes and, after explicit human approval, apply them. All other modes are read/discussion-only and must not touch `docs/prd/`.

1. PRD Builder skill produces a delta proposal: target file, section, before/after, rationale, version-bump decision.
2. Challenger verifies every addition has a paired cut, deferral, or kill criterion.
3. Wait for human approval.
4. On approval, apply the smallest edit. If version bump: add a row to `docs/prd/history.md`, copy current PRD.md to `docs/prd/archive/PRD-v<N>.md`, then update PRD.md + state.md.

## Hard rules

- Chat-first, deltas over rewrites.
- No technical architecture or implementation.
- No file writes outside `update` mode.
- No version bumps without the triggers in `10-prd-discovery.mdc`.
- Drift between conversation and state.md is surfaced, not silently absorbed.
