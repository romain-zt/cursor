# Phase 4 + Phase 5 completion — 2026-05-25

> Outcome note for plan `Zedos verticale + post-slice` (`c:\Users\khrai\.cursor\plans\zedos_verticale_+_post-slice_39f3dda1.plan.md`).

## TL;DR

- Phase 4 complete for **all unblocked Feature Areas** (FA → Slice → User Story → Spec → `ready-for-implementation`).
- Phase 4 explicitly halted at the **User Story step** for `payments` slices because the upstream `credit-system` FA is `BLOCKED` on `NEED_HUMAN`. Slices themselves are `ready-for-user-stories` with `NEED_UPDATE=true`.
- `guided-clarification` FA remains `BLOCKED` on `NEED_HUMAN` (AI provider / quality). `question-history`'s read-side slice and US/Spec ship independently of this block; the capture side is queued.
- Phase 5 complete: Q-018, Q-019, Q-020 frozen as `PD-003`, `PD-004`, `PD-005` (renumbered from the plan's `PD-002/003/004` because PD-002 was already taken by the stack baseline approved during Phase 3).

## Phase 4 — per-FA status

| Feature Area | FA status | Slices (count, status) | User Stories (count, status) | Specs (count, status) |
|---|---|---|---|---|
| `account-session` (Phase 1 + 3) | validated | 2 / `ready-for-user-stories` | 6 / `ready-for-spec` | 6 / `ready-for-implementation` |
| `dashboard-shell` | validated | 2 / `ready-for-user-stories` | 2 / `ready-for-spec` | 2 / `ready-for-implementation` |
| `project-workspace` | validated | 2 / `ready-for-user-stories` | 2 / `ready-for-spec` | 2 / `ready-for-implementation` |
| `prd-versioning` | validated | 2 / `ready-for-user-stories` | 2 / `ready-for-spec` | 2 / `ready-for-implementation` |
| `question-history` | validated | 1 / `ready-for-user-stories` (read-side) | 1 / `ready-for-spec` | 1 / `ready-for-implementation` |
| `payments` | validated | 2 / `ready-for-user-stories` with `NEED_UPDATE=true` | 0 (blocked downstream on `credit-system`) | 0 |
| `owner-milestone-feedback` | validated | 1 / `ready-for-user-stories` | 1 / `ready-for-spec` | 1 / `ready-for-implementation` |
| `read-only-sharing` | validated | 2 / `ready-for-user-stories` | 2 / `ready-for-spec` | 2 / `ready-for-implementation` |
| `credit-system` | **BLOCKED** — `NEED_HUMAN=true` (starter grant + burn tier sizing) | — | — | — |
| `guided-clarification` | **BLOCKED** — `NEED_HUMAN=true` (AI provider / quality) | — | — | — |

### Slice scoping decisions worth flagging

- `project-workspace`: I dropped the candidate slice `switch-active-project` — it is redundant with `list-and-open-project` in v0 (no "active project" notion separate from navigation). 2 slices, not 3.
- `payments`: I dropped `tax-vat-legibility` as a slice — it is a constraint on the receipt produced by checkout and auto-reload, not a slice in its own right. 2 slices, not 3.
- `question-history`: I consolidated capture + read into a single slice with a read-only User Story. The capture path is a producer responsibility of `guided-clarification` once that FA is unblocked.

### Blockers carried forward

1. **`credit-system` FA is BLOCKED.** The Phase 4 audit noted `NEED_HUMAN=true` on starter credit grant + burn tier sizing. Phase 5 (below) freezes Q-018 (burn tiers) and Q-019 (grace ceiling) into PDs, which **answers part of** the FA's `NEED_HUMAN` flag. The remaining piece — confirmation that the FA's `NEED_HUMAN` is now resolved — requires explicit user signoff before `credit-system` can be promoted to `validated` and its downstream slices / User Stories can proceed.
2. **`guided-clarification` FA is BLOCKED.** `NEED_HUMAN=true` on AI provider / quality. Unblocking requires a product decision on AI provider strategy. Not addressed by this plan.

Both blocks are surfaced **explicitly** rather than worked around silently — per SISO posture.

## Phase 5 — PD numbering and content

The plan assumed `PD-002 / PD-003 / PD-004` for Q-018 / Q-019 / Q-020. Phase 3 had already approved `PD-002` for the stack baseline, so the gel of Q-018/019/020 lands at:

- **`PD-003-credit-burn-tiers.md`** — freezes the directional burn table from Q-018.
- **`PD-004-first-circuit-grace-ceiling.md`** — freezes the 20-credit grace ceiling + pre-check gate from Q-019.
- **`PD-005-auto-reload-sca-fallback.md`** — freezes the best-effort + SCA fallback posture from Q-020, including the three hard invariants (no hidden debt, no silent retry loop, no subscription).

All three are authored at `status: approved` because Q-018/019/020 are already committed in the PRD; the PDs are durable records of the rationale, not new product decisions.

## What is intentionally not done

- **Tasks (`docs/product/tasks/**`).** Per PD-001, tasks are optional. No task artifacts were created in Phase 3 or Phase 4. This is consistent with PD-001's stance that tasks are an opt-in subdivision when a Spec is too large to implement in one pass.
- **`payments` User Stories.** Created only after `credit-system` is unblocked (requires user signoff on whether PD-003 + PD-004 sufficiently answer `credit-system`'s `NEED_HUMAN`).
- **`guided-clarification` slicing.** Awaits a product decision on AI provider strategy.
- **`question-history` capture-side User Story.** Tied to `guided-clarification` unblock.
- **No application code authored.** Per `/execute-prd` Hard rules and the SISO rule, this plan stays at PRD / Spec layer. Implementation is downstream.

## Recommended next steps (out of scope of this plan)

1. **User signoff on `credit-system` `NEED_HUMAN` resolution.** If PD-003 + PD-004 satisfy the FA's blockers, `credit-system` can be promoted to `validated` and its slicing + downstream chain run. Otherwise: list the remaining open product questions explicitly.
2. **Product decision on `guided-clarification` AI provider / quality.** Likely follow-up: a new PRD note + a discovery cycle.
3. **Pilot implementation against the `account-session` + `dashboard-shell` Specs.** All 8 Specs in those two FAs are `ready-for-implementation`. A subsequent session can lift `/execute-prd`'s "Hard rules" with explicit user authority and begin coding against PD-002's stack.
