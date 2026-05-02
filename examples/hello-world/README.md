# Example: Rule → Skill → Command

Demonstrates how rules, skills, and commands connect in the Cursor OS.

## The 3 layers

| Layer | File type | Does what | Analogy |
|-------|-----------|-----------|---------|
| **Rule** | `.mdc` | Sets policy ("always do X") | A law |
| **Skill** | `SKILL.md` | Provides capability ("here's HOW to do X") | A manual |
| **Command** | `.md` in commands/ | Orchestrates workflow ("when user says /X") | A button |

## How they connect

```
User types: /spec

Command (commands/planning/spec.md)
  → reads Rule (workflow/spec-writing.mdc) for process requirements
  → reads Rule (core/scope-control.mdc) for classification
  → uses Template (templates/specs/spec.md) for structure
  → outputs: specs/my-feature.md
```

## Real example from this repo

### Rule: `rules/core/scope-control.mdc`

Policy: "Before implementing ANY feature, classify it as 1-6."

The rule doesn't DO anything — it defines what MUST happen.

### Agent: `rules/agents/planner.mdc`

Behavior: "Break features into stories → specs. Use the template. Flag missing requirements."

The agent follows the rule while performing its job.

### Command: `commands/planning/spec.md`

Workflow: "Ask user for the idea → classify scope → create spec file → present for review."

The command orchestrates the agent + rules into a user-triggered action.

## Key insight

**Rules constrain. Agents execute. Commands orchestrate.**

If you're adding a new capability:
1. Does it set policy? → Rule
2. Does it define behavior for a work mode? → Agent
3. Does it provide a step-by-step procedure? → Skill
4. Does it start a user-triggered workflow? → Command
5. Does it automate on events? → Hook
