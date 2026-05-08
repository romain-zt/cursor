# /prd — PRD Committee orchestrator

Run the PRD Committee in a specific mode. The committee lives in [`.cursor/agents/`](../agents/prd/).

## Usage

```txt
/prd <mode> [optional context]
```

## Modes

| Mode | Lead agent | Purpose |
|------|------------|---------|
| `discover` | Product Lead | Open product discovery / clarify direction |
| `challenge` | Challenger | Stress-test current assumptions and scope |
| `review` | Product Lead (full committee) | Full review of the active PRD |
| `prioritize` | Prioritizer | Re-rank scope using Impact / Confidence / Effort |
| `update` | PRD Editor | Extract a PRD delta proposal from recent discussion |
| `summarize` | Product Lead | Short structured snapshot of current understanding |

If no mode is given, ask the user which mode they want — never default to `update` (writing PRD is the most expensive action).

## Universal pre-flight (run for every mode)

1. Read [`docs/prd/current.md`](../../docs/prd/current.md) → identify active PRD file.
2. Read [`docs/prd/state.md`](../../docs/prd/state.md) → version, direction, last major change.
3. Read the active PRD file (do not load older versions unless comparing history).
4. Apply [`SISO`](../rules/00-siso.mdc) classification on the user's framing. If RED/ORANGE, clarify before invoking the committee.
5. Honor [`10-prd-discovery.mdc`](../rules/10-prd-discovery.mdc): chat-first, deltas over rewrites, no premature implementation.

## Mode: `discover`

Lead: **Product Lead**. Support: Researcher, Challenger.

Flow:

1. Product Lead surfaces the actual product problem and unclear assumptions.
2. Researcher tags claims as `[VALIDATED]` / `[INFERRED]` / `[ASSUMED]` / `[UNKNOWN]`.
3. Challenger attacks weak logic.
4. Product Lead summarizes evolving understanding and unresolved decisions.
5. **Do not** write to `docs/prd/`. Output is structured discussion only.

## Mode: `challenge`

Lead: **Challenger**. Support: Scope Guardian, Researcher.

Flow:

1. Pull the active PRD direction and recent discussion.
2. Challenger produces an explicit list: assumption → risk → suggested test or kill criterion.
3. Scope Guardian flags drift vs `state.md` direction.
4. Researcher labels which contested claims have evidence.
5. Output: prioritized risk/kill list. **No writes.**

## Mode: `review`

Lead: **Product Lead** (full committee).

Flow:

1. Product Lead reads active PRD section by section.
2. For each section, every relevant agent annotates: clarity, evidence, scope, priority.
3. Output a single review report:
   - what is solid,
   - what is weak,
   - what is missing,
   - what should be cut,
   - whether a version bump is warranted.
4. **No writes.** If changes are warranted, recommend `/prd update`.

## Mode: `prioritize`

Lead: **Prioritizer**. Support: Researcher (Confidence), Challenger (Effort honesty), Scope Guardian (cuts).

Flow:

1. Enumerate current scope candidates from the active PRD + recent discussion.
2. Score each: **Impact (1–5)**, **Confidence (1–5)**, **Effort (1–5)**.
3. Compute `score = (Impact + Confidence) / Effort`.
4. Output a ranked table with explicit `KEEP / DEFER / CUT / TEST-FIRST` decisions.
5. Scope Guardian publishes the cut list.
6. **No writes** unless user runs `/prd update` afterward.

## Mode: `update`

Lead: **PRD Editor**. Support: Product Lead, Scope Guardian.

This is the **only** mode that proposes file writes.

Flow:

1. Verify recent discussion contains validated committee output (not raw chat).
2. Editor produces a **PRD Delta Proposal** block (see [`prd-editor.md`](../agents/prd-editor.md)):
   - target file,
   - section,
   - change type: `patch` | `new section` | `version bump`,
   - exact before / after,
   - rationale,
   - whether it triggers a version bump.
3. Scope Guardian checks: every addition has a paired cut, deferral, or kill criterion.
4. **Wait for human approval.**
5. On approval, apply the smallest possible edit. If a version bump is triggered:
   - create `docs/prd/PRD-vN+1.md` with frontmatter + `# Why This Version Exists`,
   - update `docs/prd/current.md`,
   - update `docs/prd/state.md` (`CURRENT_PRD_VERSION`, direction, `LAST_MAJOR_CHANGE`),
   - add `docs/prd/changelog/v(N)-to-v(N+1).md`.
6. If a discrete decision was made, propose `docs/product-decisions/PD-00n.md` referenced from the PRD.

## Mode: `summarize`

Lead: **Product Lead**.

Flow:

1. Read active PRD + `state.md`.
2. Produce a tight snapshot (≤ 30 lines):
   - Direction one-liner
   - Target users
   - Core problem
   - In-scope (top 3–5)
   - Explicitly out-of-scope (top 3–5)
   - Top open questions
   - Top risks
3. **No writes.** This is a working memory pass, not a PRD update.

## Hard rules across all modes

- Chat-first, deltas over rewrites.
- No technical architecture, frameworks, or implementation.
- No file writes outside `update` mode.
- No version bumps without the triggers in [`10-prd-discovery.mdc`](../rules/10-prd-discovery.mdc).
- Drift between conversation and `state.md` is surfaced, not silently absorbed.
