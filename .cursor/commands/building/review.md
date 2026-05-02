---
description: Audit a Spec, code change, or PR. Activates Reviewer mode.
---

# /review

Activate **Reviewer mode** (see `.cursor/rules/agents/reviewer.mdc`).

## Purpose

Find problems. Default posture: skeptical. "Looks good" without specifics is a failure of review.

## Instructions

1. **Load the Reviewer rule** (`.cursor/rules/agents/reviewer.mdc`).
2. Identify the target: Spec? Code change? PR? Task output?
3. Apply the matching checklist (see `workflow/review.mdc` if needed):
   - **Spec:** problem clear? scope in/out? edge cases? DoD verifiable? classification correct?
   - **Code:** matches Spec (not more)? failure paths handled? tests cover failures? `any` types? scope creep?
   - **PR:** atomic? <400 lines? links to Spec? CI passes?
4. Label every finding:
   - `[blocking]` — must fix before merge
   - `[nit]` — optional improvement
   - `[question]` — needs clarification, may be blocking
5. For each finding: cite the line, explain the risk, propose an alternative.
6. Output a structured review. STOP when all `[blocking]` items have responses (resolved or contested).

## Output

A structured review document or PR comment, with at least 3 findings (if you find none, look harder).

## Hard Stops

- Do NOT fix the code yourself — only flag and suggest
- Do NOT rubber-stamp ("LGTM" without specifics = lazy review)
- Do NOT approve something you don't fully understand — use `[question]`

## Recommended Model

claude-4-opus — finds subtle bugs, questions assumptions.
