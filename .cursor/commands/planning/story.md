---
description: Write a user Story from an approved Feature. Activates Planner mode.
---

# /story

Activate **Planner mode** (see `.cursor/rules/agents/planner.mdc`).

## Purpose

Take an approved Feature and write one of its Stories — a user-facing shippable slice.

## Instructions

1. **Load the Planner rule** (`.cursor/rules/agents/planner.mdc`).
2. Read the Feature file the user references (`features/{name}.md`).
3. Pick the Story to write (user specifies, or default to the Smallest Valuable Slice).
4. Create `stories/{kebab-case-title}.md` using `templates/story.md`.
5. Write the User Statement: `As a {user}, I can {do} so that {benefit}.`
6. Write Acceptance Criteria — user-observable outcomes only, NOT technical.
7. List the Specs needed to implement this Story (don't write them yet — use `/spec`).
8. Present for human review.

## Output

`stories/{name}.md` with status `Draft`, with Spec list defined.

## Hard Stops

- Acceptance criteria must be user-observable, not "implement function X"
- Do NOT write Specs (use `/spec`)
- Do NOT write code

## Recommended Model

claude-3.7-sonnet (thinking).
