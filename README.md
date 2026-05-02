# Cursor OS

A reusable, company-wide AI operating system for Cursor IDE.

## What is this?

Shared rules, skills, commands, and workflows that make AI agents (and humans) work faster with consistent quality across all projects.

## Quick Start

→ Read `docs/onboarding/README.md`

## Commands

| Command | Purpose |
|---------|---------|
| `/spec` | Create a feature spec from an idea |
| `/plan` | Break a spec into implementation tasks |
| `/health` | Audit the OS for consistency issues |

## Structure

```
.cursor/rules/     → Agent behavior policies
.cursor/skills/    → Reusable capabilities
.cursor/commands/  → User-triggered workflows
.cursor/hooks/     → Event-driven automation
docs/              → Human documentation
templates/         → Starting points for new artifacts
examples/          → Learn by example
.agents/skills/    → Community skills (skills.sh)
```

## Philosophy

**Evidence-Based Autonomy** — agents earn freedom by proving correctness.

No spec → can only plan.  
Spec validated → can implement.  
Tests pass → can report done.  
Never → force push, prod deploy, billing changes without human OK.
