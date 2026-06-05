---
id: PD-006
status: approved
date: 2026-05-25
related_prd_version: v1
---

# PD-006 — Per-FA delivery readiness gate

## Context

The workflow defined by `feature-area-workflow.mdc` and `user-story-workflow.mdc` lets agents move smoothly from Product → Feature Area → Scope Slice → User Story → Spec → Task, but it does **not** name when a single Feature Area is "stable enough" to start its downstream chain (User Story / Spec / code) in parallel with the macro elaboration of other Feature Areas. The result observed during Phase 4 of plan `Zedos verticale + post-slice`: the macro layer was elaborated for all 10 FAs in series before the post-slice vertical was run on `account-session`. This was a defensive choice in the absence of a discipline gate; it cost time-to-first-delivery.

The inverse failure mode is real: parallelizing without a gate risks investing in User Stories / Specs / code for FA-1 while continued macro work on FA-5 surfaces a transverse constraint that invalidates that investment.

This decision introduces a per-FA gate to make the parallel path safe.

The discovery note that fed this decision is `docs/prd/notes/2026-05-25-delivery-readiness-gate-discovery.md`.

## Decision

### 1. New Feature Area status

The Feature Area lifecycle gains one new status between `validated` and any downstream delivery work:

```
exploratory → validated → delivery-ready
```

with `blocked` and `deferred` remaining as terminal off-ramps.

A Feature Area at `delivery-ready` authorizes the start of User Story / Spec / Task / code work on that FA, independent of the state of any other FA in the product.

### 2. Placement of the gate

The gate sits between Feature Area `validated` and the **first** `/user-story scaffold` (or any equivalent first investment in delivery artifacts) on any Scope Slice of that FA.

- **Slicing remains authorized at FA `validated`.** Slice creation, refinement, and promotion to `ready-for-user-stories` is still PRD-layer work and stays at the `validated` gate.
- **User Story / Spec / Task creation requires FA `delivery-ready`.** This is the commitment point where downstream artifacts become expensive to redo.

### 3. Criteria

A Feature Area transitions from `validated` to `delivery-ready` when **all five** of the following hold:

- **DR-01 — FA is `validated`.**
  Trivial precondition.

- **DR-02 — Direct dependencies at minimum scaffolded.**
  Every Feature Area listed in this FA's `Dependencies` section has an existing file in `docs/product/feature-areas/`. The file can still be `exploratory` — the requirement is that the **shape** of the neighboring FA is on paper.

- **DR-03 — Governing Product Decisions are `approved`.**
  Any Product Decision (PD) that governs this FA's contract or behavior is at `status: approved`. `provisional` and `proposed` do **not** satisfy DR-03.

- **DR-04 — No `NEED_HUMAN=true` on this FA or its direct dependencies.**
  An open `NEED_HUMAN` on a dependency means the contract with that dependency is not stable. Investing in detailed downstream work would risk being invalidated.

- **DR-05 — At least one Scope Slice is `ready-for-user-stories`.**
  Without at least one slice ready to be sliced into User Stories, the `delivery-ready` status is degenerate (nothing to deliver).

### 4. Operating the gate

The gate is operated through a new `/feature-area` mode:

- `/feature-area clear-for-vertical <name>` — runs Part 8 of `.cursor/checkers/scope-readiness-checker.md` (DR-01..DR-05 + CC-01..CC-05). CLEAR or BLOCKED.
- If CLEAR, the same command applies the predefined transition edits to the FA file: `Status` field → `delivery-ready`, readiness verdict checked, changelog row appended.

No separate `refine-for-vertical` mode. DR-01..DR-05 evaluate external state (dependencies, PDs, child slices); no FA file content is restructured by this transition beyond the status / verdict / changelog updates listed above.

### 5. Downstream commands gain a pre-flight check

`/user-story propose`, `/user-story scaffold`, and (by transitivity through their pre-flight) `/spec propose` and `/spec scaffold` add one new precondition:

> Parent Feature Area is at `delivery-ready`.

The previous precondition (parent Scope Slice at `ready-for-user-stories`) stays in place. The new check is one additional file read.

If the parent FA is at `validated` and the founder wants to start User Story work, the agent must either run `/feature-area clear-for-vertical <name>` first (if criteria are met) or surface what is blocking DR-01..DR-05.

### 6. Drift handling

If a Feature Area is at `delivery-ready` and a dependency subsequently changes status (e.g. `validated` → `blocked`), the FA **must** be reverted to `validated` and the Part 8 checker re-run before any further downstream work proceeds. CC-04 already enforces NEED_HUMAN propagation across the chain — this is the same principle applied to DR-02 and DR-04.

This is encoded in the checker (Part 8 introduction) and in `feature-area-workflow.mdc` §5.

### 7. Forward-only application

User Stories and Specs already authored during Phases 3 and 4 of plan `Zedos verticale + post-slice` were created under the older rule (parent FA `validated`, no `delivery-ready` gate). They are **not** retroactively invalidated. This PD applies forward-only.

The Phase 3 / Phase 4 backfill audit (Phase 3 of the current plan) reclassifies each `validated` FA against DR-01..DR-05 and either promotes it to `delivery-ready` or documents which criterion fails — so the going-forward chain stays consistent with the new gate.

### 8. Naming

`delivery-ready` is the chosen status name. Treated as reversible: if friction surfaces in practice, a future PD or maintenance pass may rename to e.g. `cleared-for-vertical` via find/replace across rules, checker, commands, and FA files. No semantic implication.

## Consequences / tradeoffs

- **Pros.**
  - Parallel macro elaboration + per-FA delivery becomes a first-class, safe pattern.
  - Each FA's downstream investment is bounded by a checkable precondition; failures fail fast.
  - The gate naturally surfaces hidden blockers: any FA that cannot reach `delivery-ready` exposes its dependency or PD gap explicitly instead of being silently parallelized into broken work.
  - Existing CC-04 / NEED_HUMAN propagation logic plugs in cleanly via DR-04.

- **Cons.**
  - One additional ceremony step per FA (the `clear-for-vertical` transition). Cost: one command, ~5 checks.
  - DR-03 trusts the FA file to enumerate its governing PDs. A missed PD is caught later (at Spec stage SP-08), but not at this gate.
  - Forward-only application means the audit (Phase 3 of the plan) is a one-shot reconciliation cost; subsequent FAs pay only the standard ceremony.
  - Adds a new file-level transition to track in changelogs.

- **Reversibility.**
  - Status name (`delivery-ready`) is reversible by find/replace.
  - The gate itself is reversible by superseding PD — but undoing it would re-introduce the original discipline gap, so reversal is unlikely without a deeper rework.

## User approval

Ratified by user on **2026-05-25** as part of the retroactive PD validation pass (Q5 of the H-3 review batch). 5 DR criteria, `clear-for-vertical` ceremony, and forward-only application approved as-is.

## Links

- PRD: `docs/prd/PRD.md`
- Discovery note: `docs/prd/notes/2026-05-25-delivery-readiness-gate-discovery.md`
- Related PDs: PD-001 (post-slice workflow), PD-002 (stack baseline), PD-008 (gate Spec → code).
- Affected rules: `.cursor/rules/feature-area-workflow.mdc`, `.cursor/rules/user-story-workflow.mdc`
- Affected commands: `.cursor/commands/feature-area.md`, `.cursor/commands/execute-prd.md`
- Affected checker: `.cursor/checkers/scope-readiness-checker.md` (new Part 8)
