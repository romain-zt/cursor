---
description: Define a Feature from a strategized idea. Activates Planner mode.
---

# /feature

Activate **Planner mode** (see `.cursor/rules/agents/planner.mdc`).

## Purpose

Take an approved idea (output of `/strategize`) and define it as a formal Feature with Stories.

## Instructions

1. **Load the Planner rule** (`.cursor/rules/agents/planner.mdc`) and adopt its behavioral contract.
2. Verify input: a Feature should be approved (either via `/strategize` output or explicit user direction). If unclear, refuse and route to `/strategize`.
3. Read `docs/vision.md` (if present) to ground the Feature in the product's North Star.
4. Create the Feature file at `features/{kebab-case-title}.md` using `templates/feature.md`.
5. Decompose the Feature into 2-5 user-facing Stories. List them in the Feature's Stories table.
6. Identify the **Smallest Valuable Slice** — which Story ships first.
7. Write Out of Scope, Risks, Kill Criteria.
8. Present for human review. Do NOT proceed to Stories yet.

## Output

`features/{name}.md` with status `Proposed`, awaiting human approval.

## Hard Stops

- Do NOT write Story files (use `/story`)
- Do NOT write Specs (use `/spec`)
- Do NOT write code

## Recommended Model

claude-3.7-sonnet (thinking) — structured decomposition.
