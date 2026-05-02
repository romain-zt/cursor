---
description: Break a validated spec into an implementation plan with tasks
---

# /plan

Create a task breakdown from a validated spec.

## Instructions

1. Read the specified spec file (user provides the path or name).
2. Verify the spec status is `Validated`. If still `Draft` or `In Review`, refuse and explain why.
3. Decompose the spec into **ordered subtasks** with dependencies.
4. For each subtask, estimate complexity: S (< 1h), M (1-3h), L (3-8h).
5. If any subtask is L, suggest splitting it further.
6. Create a task file at `tasks/{spec-name}.md` using `templates/tasks/task.md`.
7. Present the plan for human review before implementation.

## Rules

- Max 8 subtasks per plan. If more, the spec should be split.
- Each subtask must be independently verifiable.
- Dependencies must be explicit (subtask B depends on A).
- No implementation during planning. Plan only.

## Output

A task file in `tasks/` linked to the spec, with ordered subtasks.
