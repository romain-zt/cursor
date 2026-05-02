# Onboarding — Start Here

This repo is our **Cursor Operating System** — a shared brain that makes every project faster and higher quality.

## 5-Minute Setup

1. **Clone this repo** alongside your project repos
2. **Open in Cursor** — rules activate automatically via `.cursor/`
3. **Copy `templates/CONTEXT.md`** to your project root and fill it in
4. **Read this doc** + `docs/operating-model/README.md`

## Structure

```
.cursor/
  rules/core/        → Always-active principles (coordinator, quality, discipline, scope-control)
  rules/agents/      → 5 agent modes (strategist, planner, implementer, reviewer, tester)
  rules/workflow/    → Process rules (spec-writing, review, testing)
  rules/domain/      → Domain-specific (add as needed: payments, CMS, etc.)
  commands/          → Slash commands (planning/, building/, meta/)
  hooks/             → Automated triggers (format-on-edit, guard-dangerous-commands, mode-trace, error-retry)

features/            → Feature artifacts (big capabilities)
stories/             → Story artifacts (user-facing shippable slices)
specs/               → Spec artifacts (technical contracts)
tasks/               → Task files (ephemeral, deleted after merge)

docs/
  onboarding/        → You are here
  operating-model/   → Philosophy, autonomy levels, workflow
  playbooks/         → Step-by-step guides ("how to start a feature")

templates/           → Starting points for specs, tasks, rules, skills, CONTEXT.md
examples/            → How rules, agents, commands, and hooks connect

.agents/skills/      → Community skills (from skills.sh — obra/superpowers, mattpocock, etc.)
```

## How It Works

### Agent Modes

Cursor has one model. We shape its behavior through 5 modes:

| Mode | When | Does | Never Does |
|------|------|------|-----------|
| **Strategist** | Product direction talk | Challenges "why", evaluates trade-offs | Write specs or code |
| **Planner** | Breaking features down | Writes specs, defines stories | Write code |
| **Implementer** | Validated spec exists | Codes, tests first, ships | Go beyond spec |
| **Reviewer** | Work submitted | Finds problems, flags issues | Fix code itself |
| **Tester** | Code needs coverage | Writes failure-path tests | Skip edge cases |

### Work Hierarchy

```
Vision → Feature → Story → Spec → Task
```

No skipping levels. A task without a spec = unauthorized work.

## Key Concepts

| Concept | What it means |
|---------|---------------|
| **Spec-first** | No code without a written spec. Prevents drift. |
| **Scope classification** | Every feature labeled 1-6 before implementation. Prevents mess. |
| **70/30 testing** | 70% failure paths, 30% happy paths. Bugs hide in error handling. |
| **Evidence-based done** | Paste test output + lint output. "Done" isn't a feeling. |
| **Mobile-first** | All UI starts at 320px. Non-negotiable. |

## First Steps

1. Read `docs/playbooks/start-a-feature.md` — the standard workflow end-to-end
2. Look at `examples/hello-world/` — how layers connect (Rule → Skill → Command)
3. Look at `examples/real-world/` — a full Vision → Feature → Story → Spec → Task → Code → Tests trace
4. Start with `/strategize` (idea) → `/feature` → `/story` → `/spec` → `/plan` → `/implement` → `/test` → `/review`

## Commands Cheat Sheet

| You want to... | Use |
|----------------|-----|
| Challenge an idea before building | `/strategize` |
| Define a Feature from an approved idea | `/feature` |
| Write a user-facing Story | `/story` |
| Write a technical Spec from a Story | `/spec` |
| Break a validated Spec into Tasks | `/plan` |
| Implement a validated Spec | `/implement` |
| Audit a Spec, code, or PR | `/review` |
| Write adversarial tests | `/test` |
| Audit the OS itself | `/health` |

## When Forking to a New Project

1. Copy `.cursor/` to your project root (rules, commands, hooks, skills)
2. Copy `templates/CONTEXT.md` to project root, fill it in
3. Copy any templates you'll use (`vision.md`, `feature.md`, `story.md`, `specs/`, `tasks/`)
4. Create `features/`, `stories/`, `specs/`, `tasks/` directories
5. Optionally symlink `.agents/skills/` for community skills
6. Run `/health` to validate the setup
