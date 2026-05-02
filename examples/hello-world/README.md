# Hello World Example

This demonstrates how **Rule → Skill → Command** work together.

## The Scenario

You want to add a "greeting" feature to a project. Here's how the system works:

---

## 1. Rule (Policy)

File: `.cursor/rules/domain/greeting.mdc`

```markdown
---
description: Standards for greeting components
globs: "**/greeting*"
---

# Greeting Standards

- Always use the user's first name (never full name)
- Greetings must be time-aware (morning/afternoon/evening)
- Accessible: use role="status" for dynamic greetings
- Mobile: min height 48px for the greeting container
```

**What it does:** Sets the "what" and "why." Loaded automatically when files match the glob.

---

## 2. Skill (Capability)

File: `.cursor/skills/development/greeting/SKILL.md`

```markdown
# Greeting Component Skill

## When to use
When building a greeting component that needs time-awareness.

## How

1. Detect current hour via `new Date().getHours()`
2. Map to period:
   - 5-11 → "Good morning"
   - 12-17 → "Good afternoon"  
   - 18-4 → "Good evening"
3. Combine with user's first name
4. Wrap in <p role="status"> for accessibility
5. Apply min-h-12 (48px) for mobile touch target
```

**What it does:** Provides the "how." Referenced when the agent needs this specific capability.

---

## 3. Command (Workflow)

File: `.cursor/commands/building/greeting.md`

```markdown
---
description: Scaffold a time-aware greeting component
---

# /greeting

1. Check the greeting rule is loaded (domain/greeting.mdc)
2. Use the greeting skill for implementation details
3. Create the component at the user-specified path
4. Verify: role="status" present, time logic correct, min-h-12 applied
5. Report done with evidence
```

**What it does:** Orchestrates the rule + skill into a user-triggerable action.

---

## How They Connect

```
User types: /greeting

Command activates → reads Rule (policy) + Skill (how-to)
                  → implements following both
                  → validates against Rule's standards
                  → reports done
```

The key insight: **Rules constrain. Skills enable. Commands orchestrate.**
