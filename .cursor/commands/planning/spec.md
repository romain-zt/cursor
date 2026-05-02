---
description: Create a new feature spec from a rough idea
---

# /spec

Create a new spec document from a user's idea or requirement.

## Instructions

1. Ask the user to describe the feature/change in 1-3 sentences (if not already provided).
2. Ask clarifying questions (max 3) to fill gaps.
3. Determine the **scope classification** (1-6 from scope-control rule).
4. Create a new file at `specs/{kebab-case-title}.md` using the template at `templates/specs/feature.md`.
5. Fill in all sections. Mark status as `Draft`.
6. List **Open Questions** that need human answers before validation.
7. Present the spec for review. Do NOT proceed to implementation.

## Output

A complete spec file in `specs/` with status `Draft`.
