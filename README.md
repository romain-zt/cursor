# Cursor OS

A reusable, company-wide AI operating system for Cursor IDE.

## What is this?

Shared rules, skills, commands, hooks, and workflows that make AI agents work faster with consistent quality across all projects.

## Quick Start

Read `docs/onboarding/README.md`

## Structure

| Directory | Purpose |
|-----------|---------|
| `.cursor/rules/` | Agent behavior policies (core, agents, workflow, domain) |
| `.cursor/commands/` | Slash commands (planning + building + meta) |
| `.cursor/hooks/` | Event-driven automation (format, guard, trace, retry) |
| `features/` | Feature artifacts (capabilities) |
| `stories/` | User Story artifacts (shippable slices) |
| `specs/` | Spec artifacts (technical contracts) |
| `tasks/` | Active implementation tasks (ephemeral) |
| `docs/` | Human documentation (onboarding, operating model, playbooks) |
| `templates/` | Starting points for new artifacts |
| `.agents/skills/` | Community skills from skills.sh |

## Work Hierarchy

```
Vision → Feature → Story → Spec → Task
```

## Commands by Stage

| Stage | Command | Activates |
|-------|---------|-----------|
| Strategy | `/strategize` | Strategist mode (challenge before build) |
| Feature definition | `/feature` | Planner mode (writes Feature artifact) |
| Story writing | `/story` | Planner mode (user-facing slices) |
| Spec writing | `/spec` | Planner mode (technical contract) |
| Spec → Tasks | `/plan` | Planner mode (task decomposition) |
| Building | `/implement` | Implementer mode (code, tests first) |
| Reviewing | `/review` | Reviewer mode (find problems) |
| Testing | `/test` | Tester mode (70% failure paths) |
| OS audit | `/health` | Meta (consistency check) |

## Agent Modes

| Mode | Job | Model |
|------|-----|-------|
| Strategist | Challenge "why", evaluate trade-offs | claude-4-opus |
| Planner | Break features → stories → specs → tasks | claude-3.7-sonnet (thinking) |
| Implementer | Code from spec, tests first | claude-4-sonnet |
| Reviewer | Find problems, skeptical by default | claude-4-opus |
| Tester | Break things, 70% failure paths | claude-3.7-sonnet |

## Philosophy

**Evidence-Based Autonomy** — agents earn freedom by proving correctness.

No spec → can only plan.
Spec validated → can implement.
Tests pass → can report done.
Never → force push, prod deploy, billing changes without human OK.
