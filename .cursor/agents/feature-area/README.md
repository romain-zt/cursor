# Feature Area Committee

Two specialized agents that govern Feature Area decomposition from PRD Feature Groups toward Scope Slices.

This is **AI-assisted decomposition governance**, not "AI generates Feature Areas". The Feature Area Builder skill drives the workflow; the agents provide context reconstruction and adversarial review.

## Members

| Agent | File | Responsibility |
|-------|------|----------------|
| Feature Area Lead | [`feature-area-lead.md`](./feature-area-lead.md) | Global decomposition coherence — reconstructs PRD-to-FA-to-SS state before Feature Area operations |
| Scope Critic | [`scope-critic.md`](./scope-critic.md) | Stress-tests proposals for premature decomposition, architectural language, v0 boundary violations, and hidden blockers |

## Operational core

The [`feature-area-builder`](../../skills/feature-area/feature-area-builder/SKILL.md) skill drives the decomposition loop: PRD-to-Feature-Area mapping, checker-based validation, and Scope Slice proposals. Feature Area Lead and Scope Critic provide context and adversarial viewpoints — they do not drive the workflow.

## Operating principle

```txt
/feature-area map
  → [feature-area-lead context brief]
  → builder proposes Feature Area map
  → [scope-critic reviews proposal]
  → user creates Feature Area files

/feature-area validate <name>
  → [feature-area-lead context brief]
  → builder runs FA-01–FA-09 + CC checks
  → verdict: CLEAR | BLOCKED

/feature-area slice <name>
  → [feature-area-lead context brief]
  → builder confirms validated status + no NEED_HUMAN
  → builder proposes Scope Slices
  → [scope-critic reviews proposal]
  → user creates Scope Slice files

/feature-area check <artifact-path>
  → builder runs checker (no lead pre-flight needed)
  → verdict: CLEAR | BLOCKED
```

## How to invoke

Use the [`/feature-area`](../../commands/feature-area.md) command:

- `/feature-area map` — read PRD, propose a Feature Area map
- `/feature-area validate <name>` — run FA-01–FA-09 checks against a Feature Area file
- `/feature-area slice <name>` — propose Scope Slices for a validated Feature Area
- `/feature-area check <artifact-path>` — run the scope-readiness checker against any artifact

## Governed by

- Rule: `.cursor/rules/feature-area-workflow.mdc`
- Checker: `.cursor/checkers/scope-readiness-checker.md`
- Templates: `.cursor/templates/product/`

## Hard rules

- No technical architecture, frameworks, data models, or implementation in committee output.
- No Feature Area or Scope Slice files created by agents — the user creates files after reviewing proposals.
- No user stories, specs, or tasks at any point.
- Advancement gates follow `.cursor/checkers/scope-readiness-checker.md` exclusively.
