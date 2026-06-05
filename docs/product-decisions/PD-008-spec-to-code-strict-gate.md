---
id: PD-008
status: approved
date: 2026-05-25
approved_on: 2026-05-25
related_prd_version: v1
amends: PD-001
---

# PD-008 — Strict gate: Spec → code (mandatory human review)

## Status note

Approved 2026-05-25 in direct response to Q7 of the H-3 / H-4 review batch. The user picked option **(c) strict gate** over (a) no gate / (b) light gate.

This PD introduces the only **irreversible-on-commit transition** in the post-slice methodology: the moment a Spec stops being a document and starts producing code. PD-001 left this transition implicit; PD-008 makes it explicit and gated.

## Context

PD-001 (post-slice workflow) defines the chain PRD → FA → Scope Slice → User Story → Spec → Task → code. The first 5 links carry written artifacts that can be revised cheaply. The 6th link (code) carries:

- Source files committed to `src/`, `app/`, `lib/`, migration files in `prisma/`.
- Lockfile changes (`package-lock.json`, `pnpm-lock.yaml`).
- Dependency additions in `package.json`.
- Test infrastructure decisions.

Once these land, "revising" them costs more than rewriting an upstream Spec. The asymmetry justifies an explicit gate.

Without a gate, two failure modes have been observed elsewhere:

1. **Premature scaffolding** — Spec passes `ready-for-implementation` (SP-01..SP-15 all green) but a cross-Spec contract was missed by SP-12; a developer starts code, lands a schema, and breaks a sibling Spec on merge.
2. **Drift between Spec and implementation** — developer reads the Spec, "improves" the approach, never updates the Spec; the Spec becomes a lie. Months later nobody remembers which is authoritative.

PD-008 names the gate that catches both.

## Decision

### 1. Scope of the gate

A Spec is **forbidden from producing code** until the gate is cleared. Code production includes any of:

- Creating a file under `src/`, `app/`, `lib/`, `prisma/`, `tests/`, `__tests__/`, `e2e/`.
- Adding a dependency to `package.json`.
- Generating Prisma migrations.
- Writing test infrastructure (Jest config, Playwright config, etc.).
- Provisioning external resources (DB, Stripe webhook endpoints, Vercel env vars, etc.).

Code production does **not** include:

- Reading the codebase for exploration.
- Editing `.cursor/` (rules, agents, checkers, templates) — that's methodology, not Spec implementation.
- Editing `docs/` — that's the Spec layer itself.

### 2. The 4 gate clearances (all required)

A Spec passes the gate iff **all 4** of the following are explicitly satisfied:

**G-1. SP-01..SP-15 readiness checker — all green.**
The Spec is `ready-for-implementation` with no open `NEED_HUMAN`, no open `NEED_UPDATE`, and no upstream artifact in `exploratory` / `blocked` status. SP-15 (async section) must classify the Spec with a canonical async pattern per PD-007.

**G-2. Spec Critic — `SAFE TO PROCEED`.**
The Spec Critic agent has been run on the Spec **at its current promoted state** (not on an earlier draft) and the output is `SAFE TO PROCEED`. Any `REVISE BEFORE PROCEEDING` blocks the gate. The Spec Critic output is captured in the Spec's `Changelog` with the verdict timestamp.

**G-3. Cross-Spec sibling consistency review — explicit pass.**
For every Spec in the same Slice (or with a stated cross-Slice dependency), the gate-clearer must verify:

- Shared schema fields are aligned (no duplicate `Project` shape, no duplicate `Session` shape).
- Shared error envelope (typed errors table) is identical across siblings or explicitly justified per-Spec.
- Shared event names follow PD-007 §5 convention and are produced by exactly one Spec.
- Shared code-surface files (server actions, route handlers) are named consistently across Specs and either: (a) one Spec owns the file and others inherit, or (b) the file is co-owned with an explicit ownership comment.

Sibling-consistency review is a **manual sweep** by a human — no automation v0.

**G-4. Human approval — written, dated, named.**
A human reviewer (the user or a designated approver) writes a single line in the Spec's `Changelog`:

```
| <DATE> | Gate Spec → code cleared by <NAME>. G-1 ✅ G-2 ✅ G-3 ✅. First code commit authorized. | — |
```

This line is the **trigger**. No code may be committed for this Spec before this line exists in the Spec file (committed to the repo).

### 3. Forbidden short-circuits

- **No agent may write the gate-clearance line for itself.** The agent may prepare G-1, G-2, G-3 evidence and request approval; the user (or designated human approver) types and commits G-4 manually or via explicit approval-in-chat. This is a hard rule, mirroring SISO discipline on irreversible decisions.
- **No retroactive gate.** Code committed before G-4 is recorded is a **process violation** even if the Spec is later cleared. The Changelog must show G-4 strictly before any code commit referencing the Spec.
- **No bulk gate.** Each Spec is cleared individually. A statement like "gate cleared for all account-session Specs" is not valid — each Spec carries its own G-4 line with its own date.

### 4. Re-gating on Spec revision

If a Spec is materially revised **after** the gate is cleared (data model change, contract change, async classification change, new dependency, etc.), the gate **resets** and must be re-cleared. The Spec's Changelog records the revision + the re-gate event.

"Material revision" is interpreted strictly: changes to Implementation Notes wording or Test cases wording do **not** reset the gate. Changes to any section that defines a contract (Data Touched, Contract, Errors, Async classification, Dependencies) **do** reset the gate.

### 5. Forward-only application

PD-008 applies to **Specs gated for code after 2026-05-25**. Specs that have already produced code (none today — Item 9 still pending) are not retroactively re-gated. The gate is a forward-only commitment.

### 6. Tooling implication

The gate G-1 / G-2 / G-3 evidence collection is **agent-friendly** (an AI agent can run the readiness checker, invoke the Spec Critic, and produce a sibling-consistency report). The G-4 approval is **human-only** by construction.

A future tool (`/spec gate <SP-ID>`) may automate G-1 / G-2 / G-3 evidence packaging into a single artifact. PD-008 does not require that tool — current manual practice (run the readiness checker, run the Spec Critic, write the sibling-consistency note, request G-4 in chat) is sufficient.

### 7. Out of scope for PD-008

- E2E test gate (already covered: PD-001 keeps E2E out of v0).
- Production deployment gate (different concern; would be a future PD).
- Database migration gate (PD-008 already blocks migration files until the gate is cleared, but does not define migration review separately).
- Code review of the resulting PR (different process — code review happens after code is written, the gate is about authorizing the writing).

## Consequences / tradeoffs

### Benefits

- The irreversible transition (document → code) is named and gated.
- Cross-Spec consistency is checked before code, not at merge time.
- Spec Critic output is mandatorily fresh, not stale from a pre-promotion check.
- Process violation is detectable by an auditor reading any Spec's Changelog.
- Removes ambiguity about "is this Spec ready to code?" — the G-4 line is the single binary answer.

### Costs

- **Adds friction** between Spec ready-for-implementation and first code commit. Expected cost per Spec: 15-30 min of sibling-consistency review + Spec Critic invocation + human approval round-trip.
- **Manual G-3** does not scale beyond a few dozen Specs without tooling. Tooling is a known follow-up.
- **Re-gating on revision** can create a perception of "documentation churn." Mitigation: the gate is about consequential revisions only; cosmetic edits don't trigger.
- Requires discipline on the **forbidden short-circuit** (no agent self-clearance). Easy to forget under execution pressure.

### Reversibility

Reversible by superseding PD. If the gate proves too heavy in practice, a follow-up PD can replace G-3 with an automated check, soften G-4, or drop the strict gate entirely. The Spec corpus is not invalidated by reverting; only future gate ceremony changes.

## Open follow-ups

These are documented but not blocking PD-008:

1. **Tooling for G-1/G-2/G-3 evidence packaging** — `/spec gate <SP-ID>` command. Estimated cost: medium. Triggered when manual ceremony becomes painful (~5 Specs gated through the manual path).
2. **Sibling-consistency automation** — a checker that diffs shared schema fields, error envelopes, event names across Specs in the same Slice. Triggered when manual G-3 produces false negatives.
3. **Re-gate detection** — a watcher on Spec files that flags "this section is contract-defining, gate must re-clear." Triggered when a re-gate is missed in practice.

## Links

- PRD: `docs/prd/PRD.md`
- Methodology: `docs/product-decisions/PD-001-post-slice-workflow.md` (amended)
- Per-FA gate: `docs/product-decisions/PD-006-per-fa-delivery-readiness-gate.md` (upstream sibling)
- Spec Critic: `.cursor/agents/spec/spec-critic.md`
- Readiness checker: `.cursor/checkers/scope-readiness-checker.md`
- Async baseline: `docs/product-decisions/PD-007-async-event-baseline.md`
