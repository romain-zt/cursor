# /prd questions — Human-first PRD question loop

## Purpose

Continue PRD discovery by asking the next unresolved question from `docs/prd/questions/open-questions.md`.

This command is intentionally human-first:
- one question at a time
- notes before PRD
- no PRD file writes
- no implementation
- no architecture

## Templates

Canonical reusable document templates live under `.cursor/templates/prd/`.

Project files under `docs/prd/` and `docs/product-decisions/` are generated or edited project instances, not template sources.

Do not use `docs/prd/notes/README.md`, `docs/prd/questions/open-questions.md`, `docs/prd/PRD.md`, `docs/prd/state.md`, `docs/prd/history.md`, or `docs/product-decisions/*.md` as canonical templates.

When creating or reinitializing a discovery note, use `.cursor/templates/prd/discovery-note.template.md`.

When creating or reinitializing the open question queue, use `.cursor/templates/prd/open-questions.template.md`.

When creating or reinitializing PRD/state/history/product-decision files, use the matching file under `.cursor/templates/prd/`.

Existing files under `docs/` may be read as project context, but not copied as reusable templates.

`docs/prd/notes/README.md` is allowed to explain the local notes folder for humans, but it is not the source of truth for the note entry format. If it conflicts with `.cursor/templates/prd/discovery-note.template.md`, the `.cursor/templates/` version wins.

## Pre-flight

1. Read `docs/prd/PRD.md`
2. Read `docs/prd/state.md`
3. Read `docs/prd/questions/open-questions.md`
4. Read the latest relevant note in `docs/prd/notes/`

If `open-questions.md` is missing, create it from `.cursor/templates/prd/open-questions.template.md` — it is a capture artifact, not a PRD write.

## Behavior

1. Find the highest-priority `open` question (lowest priority number, then lowest ID).
2. Ask only that question.
3. Do not include a table unless needed.
4. Do not include more than one follow-up question.
5. Do not propose PRD updates.
6. Wait for the user's answer.

## After user answers

When the user answers a currently open question:

1. Append the raw answer to the active discovery note.
2. Move the question from `Active queue` to `Answered`.
3. Add:
   - answer summary
   - PRD implication
   - remaining ambiguity, if any
4. Add at most one new follow-up question to `Active queue` if the answer creates a new blocker.
5. Ask the next highest-priority open question.

## Response format

```txt
Captured.

Interpreted answer:
<1–3 lines>

PRD implication:
<1–3 lines>

Next question:
<one question only>
```

If no questions remain:

```txt
Captured.

No remaining open discovery questions.

Next recommended step:
/prd converge
```

## Hard rules

- No writes to `docs/prd/PRD.md` or `docs/prd/state.md`.
- No version bumps.
- No ICE scoring tables unless explicitly requested.
- No Surface Gate tables unless explicitly requested.
- Writes to `docs/prd/notes/` and `docs/prd/questions/open-questions.md` are allowed — they are capture artifacts.
