---
id: PD-001
status: approved
date: 2026-05-25
related_prd_version: v1
---

# PD-001 — Post-Slice Methodology Workflow

## Context

The Cursor agent workflow in this repo defines a chain `PRD → Feature Area → Scope Slice` with full ceremony (propose / scaffold / refine / check / promote) implemented at all three levels (`.cursor/commands/feature-area.md`, `.cursor/checkers/scope-readiness-checker.md`, `.cursor/agents/feature-area/`).

`scope-readiness-checker.md` lines 5-9 commits the methodology to a six-level chain extending further to **User Story**, **Spec**, **Task** — but no commands, agents, skills, templates, or checker parts for those three levels exist. `.cursor/commands/execute-prd.md` lines 61-63 (Hard rules) explicitly forbids creating User Story / Spec / Task files until governance allows.

Two Scope Slices for `account-session` reached `ready-for-user-stories` on 2026-05-25 with no defined downstream chain. Without a frozen methodology, these slices remain dormant artifacts.

This decision freezes the post-slice methodology so the downstream workflow can be scaffolded coherently. It is the convergent output of the discovery note `docs/prd/notes/2026-05-25-post-slice-methodology-discovery.md`.

## Decision

### 1. Three new artifact types

1. **User Story** — always required. One file per Scope Slice acceptance dimension. Behavioral, product-readable. Format: "As an X, I do Y, so that Z." with 2–5 inline Acceptance Criteria in Given/When/Then form. Granularity: 3–6 User Stories per Slice as a rule of thumb. Path: `docs/product/user-stories/<fa-kebab>--<slice-kebab>--US-<NNN>--<short-kebab>.md`.
2. **Implementation Spec** — always required. One file per User Story. First artifact where stack, schema, framework, routes, and runtime appear. Engineer-readable. Mandatory **Tests** section before **Implementation notes**. Path: `docs/product/specs/<fa-kebab>--<slice-kebab>--US-<NNN>--<short-kebab>.spec.md`.
3. **Task** — **optional**. Created only when a Spec needs subdivision across multiple coherent commits / short PRs. Implementer-readable. Path: `docs/product/tasks/<fa-kebab>--<slice-kebab>--US-<NNN>--T-<NNN>--<short-kebab>.task.md`.

Acceptance Criteria are **inline in the User Story**, not a separate file. Tests are part of the Spec, not a separate file.

### 2. Statuses

| Artifact | Allowed statuses |
|---|---|
| User Story | `exploratory`, `blocked`, `deferred`, `ready-for-spec` |
| Spec | `exploratory`, `blocked`, `deferred`, `ready-for-implementation` |
| Task | `exploratory`, `blocked`, `deferred`, `ready-for-merge` |

### 3. Ceremony — same gate pattern as `/feature-area`

For each artifact level (User Story / Spec / Task), the modes are:

- **`propose <parent-path>`** — proposal-only, no writes.
- **`scaffold <parent-path>`** — creates files from the most recently approved proposal in conversation.
- **`refine <artifact-path>`** — edits product/impl sections of one existing file. Cannot change status to `ready-*`.
- **`check <artifact-path>`** — runs the checker, no writes.
- **`promote <artifact-path>`** — applies the narrow `ready-*` transition only when checker is CLEAR (status line, readiness checklist, verdict line, changelog row).

### 4. Commands

**Three separate commands**, not extensions of `/feature-area`:

- `/user-story <mode> [arg]` — modes: `propose`, `scaffold`, `refine`, `check`, `promote`.
- `/spec <mode> [arg]` — same modes.
- `/task <mode> [arg]` — same modes.

Each command carries its own pre-flight (read PRD state + PRD + open questions + product decisions + parent chain artifacts).

### 5. Agents

| Phase | Lead | Critic |
|---|---|---|
| User Story | User Story Lead | Story Critic |
| Spec | Spec Lead | Spec Critic |
| Task | (none) | (none) |

Lead agents produce a Context Brief on the first invocation of `propose`, `scaffold`, `refine`, or `check` per conversation (mirrors Feature Area Lead behavior). Critic agents run after the builder produces a proposal and may return REVISE / APPROVE verdicts (mirrors Scope Critic behavior).

Tasks have no agent because Tasks inherit context entirely from their parent Spec; ceremony cost would exceed signal.

### 6. Skills

- `.cursor/skills/user-story/user-story-builder/SKILL.md`
- `.cursor/skills/spec/spec-builder/SKILL.md`
- `.cursor/skills/task/task-builder/SKILL.md`

### 7. Checker

Extend `.cursor/checkers/scope-readiness-checker.md` with:

- **Part 4 — User Story Checks (US-01 … US-N)**
- **Part 5 — Spec Checks (SP-01 … SP-N)**
- **Part 6 — Task Checks (TK-01 … TK-N)**

CC-01..CC-05 (cross-cutting) apply to all new artifacts as-is.

### 8. Rules

New file `.cursor/rules/user-story-workflow.mdc` covering all three artifact levels (parallel to `feature-area-workflow.mdc`).

### 9. `/execute-prd` extension

- Lift the Hard-rules ban on User Story / Spec / Task file creation, but only behind the same proposed/approved gates.
- Extend `allowed_files` to include `docs/product/user-stories/`, `docs/product/specs/`, `docs/product/tasks/`.
- `scan` mode rebuilds `WORK_QUEUE.md` including these directories.
- `run-one` allowed bounded steps include `/user-story refine|check|promote|scaffold`, `/spec refine|check|promote|scaffold`, `/task refine|check|promote|scaffold`.
- `src/**` remains excluded from `allowed_files` until a future explicit governance step.

## Consequences / tradeoffs

### Benefits

- Coherent six-level chain `PRD → FA → Slice → US → Spec → Task` with a single ceremony pattern.
- US stays product-readable, Spec becomes engineer-readable — explicit separation between behavior and implementation.
- Spec is the gated place where architecture first appears, with a Critic that stress-tests it.
- Tasks remain optional, avoiding mandatory ceremony for small Specs.
- Test discipline encouraged structurally (mandatory Tests section in Spec template) without being hard-gated by the checker.

### Costs

- **Ceremony surface grows significantly**: 3 new commands, 5 modes each = 15 modes; 4 new agents; 3 new templates; 3 new checker parts; 1 new rule; updates to `execute-prd`. This is a one-time methodology investment, but a real one.
- **Spec is where architecture first lands** — a poorly-designed first Spec can mislead later Specs. Mitigation: Spec Critic explicitly stress-tests for premature commitment, gold-plating, missing observability.
- **Test-first as a soft constraint** may erode in practice for a solo founder using AI agents. Acceptable for v0; revisit after first Specs land if drift appears.
- **Self-validation risk**: this decision is taken by an agent inside the workflow it modifies. Mitigation: Phase 3 of the plan (`Zedos verticale + post-slice`) requires that the new chain be exercised on the two `account-session` slices before being applied to the 9 remaining Feature Areas.

### Reversibility

This decision is reversible. If the methodology proves too heavy in Phase 3, individual elements can be collapsed (e.g. merge Spec and User Story into a single artifact) by a follow-up PD that supersedes PD-001.

## Links

- PRD: `docs/prd/PRD.md`
- Related notes: `docs/prd/notes/2026-05-25-post-slice-methodology-discovery.md`
- Driving plan: `Zedos verticale + post-slice` (Phase 2.2)
- Parent ceremony reference: `.cursor/commands/feature-area.md`, `.cursor/checkers/scope-readiness-checker.md`
