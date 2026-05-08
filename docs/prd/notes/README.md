# Discovery Notes

Raw meeting-style notes captured during `/prd discover` and `/prd note` sessions.

These files are **input material** — not part of the PRD. They feed into `/prd converge`, which synthesizes them into a delta proposal for human review before anything is written to `PRD.md`.

## File naming

```
YYYY-MM-DD-<topic>-discovery-note.md
```

One file per topic or session. Append new entries to the same file as the topic continues.

## Entry format

```md
## <sequence number or timestamp>

### Raw user input
> <exact user words>

### Interpreted product insight
<1–3 lines>

### PRD implication
<1–3 lines>

### Open question
<single question, or "None">
```

## Rules

- Do not edit past entries — append only.
- Do not promote content directly to `PRD.md` — always go through `/prd converge` → delta proposal → human approval → `/prd update`.
- Notes are ephemeral once converged. After a successful `/prd update`, mark the note file as `[converged: YYYY-MM-DD]` in its header.
