---
description: Implement a validated Spec. Activates Implementer mode.
---

# /implement

Activate **Implementer mode** (see `.cursor/rules/agents/implementer.mdc`).

## Purpose

Translate a validated Spec into working, tested code. One Spec = one focused implementation pass.

## Instructions

1. **Load the Implementer rule** (`.cursor/rules/agents/implementer.mdc`).
2. Read the Spec the user references (`specs/{name}.md`).
3. **Gate check:** Spec status MUST be `Validated`. If `Draft` or `In Review`, refuse and route to `/spec` review flow.
4. Re-read the Spec's DoD. Quote it back so it's anchored.
5. Identify the Edge Cases table — these become failure-path tests (write FIRST, red-green-refactor).
6. Create or update the Task file at `tasks/{spec-name}.md` using `templates/tasks/task.md`.
7. Implement the MINIMUM that satisfies the Spec. Tests first.
8. After implementation:
   - Run lint. Paste output.
   - Run tests. Paste output.
   - Verify each DoD checkbox. Paste evidence.
9. Hand to `/review` for code audit. Do NOT self-approve.

## Output

- Working code matching the Spec
- Test file with 70% failure-path coverage
- Updated `tasks/{spec-name}.md` with all checkboxes green + evidence

## Hard Stops

- Do NOT implement beyond the Spec
- Do NOT skip tests ("I'll add later" = won't add)
- Do NOT report "done" without pasting actual lint + test output
- Do NOT touch unrelated files ("while I'm here" → no)
- Do NOT install dependencies without justifying why

## Recommended Model

claude-4-sonnet or claude-3.7-sonnet — fast, accurate code generation.
