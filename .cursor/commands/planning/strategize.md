---
description: Strategize a new product direction or feature idea. Activates Strategist mode.
---

# /strategize

Activate **Strategist mode** (see `.cursor/rules/agents/strategist.mdc`).

## Purpose

Challenge an idea before it becomes work. Decide build / defer / kill at the Vision → Feature level.

## Instructions

1. **Load the Strategist rule** (`.cursor/rules/agents/strategist.mdc`) and adopt its behavioral contract.
2. Confirm context: read `docs/vision.md` if it exists. If not, ask the user for the product North Star.
3. Listen to the user's idea. Do NOT validate it. Challenge it:
   - "What problem does this solve, for whom, how often?"
   - "What's the cost of NOT doing this?"
   - "What's the smallest version that tests the hypothesis?"
   - "Who asked for this and what evidence exists?"
4. Classify scope (1-6 from `scope-control.mdc`).
5. Produce the output below. Stop. Hand to human for build/defer/kill decision.

## Output

A Feature artifact at `features/{kebab-case-title}.md` using `templates/feature.md`, OR a written recommendation to NOT build (with reasoning).

## Hard Stops

- Do NOT write specs (that's `/feature` → `/story` → `/spec`)
- Do NOT write code
- Do NOT skip the "why" — if the user can't answer, say so

## Recommended Model

claude-4-opus or gemini-2.5-pro — needs deep reasoning and trade-off analysis.
