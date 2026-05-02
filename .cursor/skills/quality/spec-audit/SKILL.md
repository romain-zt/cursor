---
name: spec-audit
description: >-
  Audits a Spec file for completeness, scope clarity, and DoD verifiability before it transitions to Validated.
  Use when reviewing a Spec, before /implement, or when a Spec status moves Draft → In Review.
---

# Spec Audit Skill

Audit a Spec file using a deterministic checklist. Output a pass/fail report per section.

## When to Use

- A Spec moves from Draft → In Review
- Before any `/implement` invocation
- During `/review` when target is a Spec
- When `/health` flags spec hygiene issues

## Prerequisites

- Target Spec file exists at `specs/{name}.md`
- The user has identified the file (or it's the most recently modified spec)

## Steps

1. **Read the Spec file.** Confirm it exists. If not, fail with clear error.

2. **Check Meta block:**
   - Status field present and one of: `Draft | In Review | Validated | Implemented | Deprecated`
   - Classification field present and one of `1-6` from `scope-control.mdc`
   - Target field present (Product name or "Global")
   - Author and Date present

3. **Check Problem section:**
   - Non-empty
   - Names a specific problem (not vague like "improve UX")
   - Identifies who has the problem

4. **Check Scope section:**
   - "In Scope" list non-empty
   - "Out of Scope" list non-empty (mandatory — forces thinking)

5. **Check Edge Cases table:**
   - At least 3 rows
   - Each row has both Scenario AND Expected Behavior

6. **Check Definition of Done:**
   - All items are checkboxes
   - Each item is verifiable (contains a measurable verb: "passes", "returns", "renders", "matches")
   - Reject vague items: "works well", "is good", "is clean"

7. **Check Open Questions:**
   - If Status is `Validated`, this list MUST be empty or all items checked
   - If Status is `Draft` or `In Review`, document any unanswered questions

8. **Output the report:**

```
SPEC AUDIT: specs/{name}.md
===========================
Meta:           PASS / FAIL — {reason}
Problem:        PASS / FAIL — {reason}
Scope:          PASS / FAIL — {reason}
Edge Cases:     PASS / FAIL — {reason}
DoD:            PASS / FAIL — {reason}
Open Questions: PASS / FAIL — {reason}

Verdict: READY TO VALIDATE / NEEDS WORK
Blockers: {numbered list of what to fix}
```

## Validation

The skill executed correctly when:
- Output report is present with all 6 section verdicts
- A clear final verdict is given
- If "NEEDS WORK", actionable blockers are listed

## Anti-Patterns

- Don't approve a Spec just because it has all sections — check the QUALITY of each
- Don't accept "improve X" or "make it better" as DoD criteria
- Don't pass a Spec with empty Edge Cases — that's a guarantee of bugs

## Related

- Rule: `.cursor/rules/workflow/spec-writing.mdc`
- Rule: `.cursor/rules/agents/reviewer.mdc`
- Command: `.cursor/commands/building/review.md`
