# Onboarding — Start Here

Welcome. This repo is our **Cursor Operating System** — a shared brain that makes every project faster and higher quality.

## What is this?

A collection of rules, skills, commands, and templates that tell AI agents (and humans) how to work. Think of it as your team's "operating manual" that Cursor reads automatically.

## 5-Minute Setup

1. **Clone this repo** alongside your project repos
2. **Open in Cursor** — everything activates automatically via `.cursor/`
3. **Read the Operating Model** → `docs/operating-model/README.md`
4. **Start working** — the rules guide the agent's behavior

## Structure at a Glance

```
.cursor/
  rules/core/        → Always-active principles (scope control, quality, coordination)
  rules/workflow/    → Process rules (how to write specs, how to review)
  rules/domain/     → Domain-specific (payments, CMS, frontend — added as needed)
  skills/           → Reusable capabilities (organized by category)
  commands/         → Slash commands (/spec, /plan, /health)
  hooks/            → Automated triggers (post-save, post-commit)

docs/
  onboarding/       → You are here
  operating-model/  → Philosophy, autonomy levels, principles
  playbooks/        → Step-by-step guides for common workflows
  reference/        → Cursor tips, features, shortcuts

templates/          → Starting points for specs, tasks, rules, skills
examples/           → Working examples to learn from

.agents/skills/     → Installed community skills (from skills.sh)
```

## How to Use in Your Project

This repo is a **reference + source**. For your actual project:

1. Copy the `.cursor/rules/core/` folder (always needed)
2. Copy relevant `rules/workflow/` and `rules/domain/` rules
3. Copy templates you'll use
4. Symlink or copy `.agents/skills/` for community skills

Over time, improvements flow back here and propagate to all projects.

## Key Concepts

| Concept | What it means |
|---------|---------------|
| **Spec-first** | No code without a written spec. Prevents drift and overbuilding. |
| **Scope classification** | Every feature is labeled 1-6 before implementation. Prevents mess. |
| **Definition of Done** | Specific checklist that must be green before "done" is real. |
| **Progressive loading** | Only load context when needed. Saves tokens, reduces noise. |
| **Mobile-first** | All UI starts at 320px and scales up. Non-negotiable. |

## Next Steps

- Read `docs/operating-model/README.md` for the full philosophy
- Look at `examples/hello-world/` to see rule→skill→command in action
- Check `docs/playbooks/` for "how do I..." guides
