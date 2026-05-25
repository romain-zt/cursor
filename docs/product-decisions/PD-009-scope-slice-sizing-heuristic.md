---
id: PD-009
status: approved
date: 2026-05-25
approved_on: 2026-05-25
related_prd_version: v1
amends: PD-001
---

# PD-009 — Scope Slice sizing heuristic (rich)

## Status note

Approved 2026-05-25 in direct response to Q8 of the H-3 / H-4 review batch. The user picked option **(c) rich heuristic** over (a) judgment-only / (b) simple heuristic.

PD-001 left the sizing of Scope Slices implicit ("granular, independently deliverable user value"). PD-009 makes the sizing rule explicit and measurable.

## Context

A Scope Slice is the unit that promotes from `exploratory` to `ready-for-user-stories` and then drives the post-slice chain (User Stories → Specs → code). The chain assumes a Slice is **"about the right size"** — neither so large that it produces an inflated User Story tree, nor so small that the chain ceremony exceeds the deliverable's value.

Observed during the Zedos v1 macro work:

- **Oversize signals**: 2 Slices were originally drafted with 4+ User Stories that touched 3+ data models. They were split during refinement (`/scope-slice refine`) into smaller Slices.
- **Undersize signals**: 1 Slice (`dashboard-shell/under-construction-placeholders`) carries a single trivial User Story. It works, but borderline — the ceremony cost is high relative to the deliverable.

Without a sizing rule, the agent gravitates toward whatever Slice shape feels natural at the moment — which produces drift across FAs.

PD-009 names 5 sizing dimensions and turns them into a checklist. A Slice that fails any dimension must either be split, merged, or carry an explicit justification in the Slice file.

## Decision

### 1. The 5 sizing dimensions

A Scope Slice is **right-sized** iff all 5 dimensions are within the green band. Yellow band = explicit justification required in the Slice file. Red band = the Slice must be split or merged before it can promote to `ready-for-user-stories`.

| # | Dimension | Green | Yellow (justify) | Red (must reshape) |
|---|---|---|---|---|
| **D1** | User Stories produced | 1–3 | 4–5 | ≥ 6 OR exactly 0 |
| **D2** | Data models touched (created or extended) | 0–2 | 3 | ≥ 4 |
| **D3** | New routes / server actions exposed | 0–5 | 6–8 | ≥ 9 |
| **D4** | Estimated code surface (LOC ballpark, excluding tests) | < 600 | 600–1000 | ≥ 1000 OR < 30 |
| **D5** | Net-new dependencies on FA-external Specs | 0–1 | 2 | ≥ 3 |

### 2. How each dimension is measured

**D1 — User Stories produced.** Counted post-`/scope-slice refine`. The number of US planned for the Slice, not the number eventually produced (which may diverge).

**D2 — Data models touched.** A "model touched" = a Prisma model that is either newly created in this Slice, or extended with non-trivial fields (additive index or scalar field is not counted; new relation, new enum, new sub-document is counted).

**D3 — New routes / server actions exposed.** Distinct externally-callable surface points. Internal helpers don't count.

**D4 — Estimated code surface.** Honest LOC estimate by the agent or reviewer. Treat tests as zero LOC (the question is about feature breadth, not test breadth). Less than 30 LOC = trivial Slice candidate for merging into a sibling.

**D5 — Net-new FA-external dependencies.** Specs in this Slice that depend on Specs in other FAs (not the parent FA). One cross-FA dependency is OK (most verticals have one). 2 = surface starts to creep. 3+ = the Slice is doing too much cross-FA coordination and should be re-cut.

### 3. Yellow band — justification format

When a Slice lands in the yellow band on any dimension, the Slice file must carry a `## Sizing exception` section with:

```markdown
## Sizing exception

| Dimension | Value | Why it's OK in yellow |
|---|---|---|
| D2 (data models) | 3 | The 3 models (`User`, `Session`, `OwnerProfile`) are co-defined by the auth flow and inseparable for delivery; splitting would force a stub Spec. |
```

The justification is **content**, not ceremony. A copy-paste "it's fine" is grounds for a Scope Critic challenge.

### 4. Red band — actions

When a Slice lands in the red band on **any** dimension, the Slice cannot promote. The Slice owner must:

- **Oversize red**: split the Slice. The `/scope-slice refine` command supports splitting; the parent FA inherits both children. Re-evaluate the children against D1..D5.
- **Undersize red** (D1=0 or D4<30): merge into a sibling Slice. If no sibling exists, the Slice should be cancelled and the work moved upstream into the FA's scope.

A Slice in red band that ships anyway = PD-001 violation logged in `POINTS_OF_ATTENTION.md`.

### 5. Where the heuristic is checked

- **Scope Critic agent** — adds a new check section "Slice sizing" that walks the 5 dimensions for any Slice it stress-tests.
- **`scope-readiness-checker.md`** — new Part 9 added: SP-S1 (D1), SP-S2 (D2), SP-S3 (D3), SP-S4 (D4), SP-S5 (D5). The checker emits per-dimension band (green/yellow/red).
- **`/scope-slice promote`** — refuses to move a Slice to `ready-for-user-stories` if any dimension is red.

### 6. Forward-only application

PD-009 applies to **Slices promoted to `ready-for-user-stories` after 2026-05-25**. The 14 existing Slices are not re-evaluated retroactively. A backfill audit (estimating D1..D5 on each existing Slice and flagging which ones would have been yellow / red) is filed as a follow-up but **not** blocking.

### 7. Out of scope for PD-009

- Spec-level sizing (Specs have their own checks SP-01..SP-15).
- User Story sizing (US is one user-visible outcome — atomic by construction).
- Feature Area sizing (FAs are product-level; their size is governed by the PRD).
- Task-level sizing (PD-001 keeps Tasks optional).

## Consequences / tradeoffs

### Benefits

- Slice sizing becomes a **mechanical question** instead of vibes-based judgment.
- Oversize Slices are caught at promotion, not at User Story explosion.
- Undersize Slices are caught at promotion, not at ceremony-cost discovery.
- The 5 dimensions surface different failure modes (US count = user-flow breadth; data models = persistence breadth; routes = API surface; LOC = effort; cross-FA deps = coupling). Catching one dimension while passing all 4 others is meaningful signal.

### Costs

- **D4 (LOC estimate) is inherently fuzzy** at Slice promotion time — the Specs are not yet written. Mitigation: estimate using comparable Slices already shipped. Acceptable error band: ±50%.
- **Adds a new check section** to the Scope Critic and the readiness checker. Implementation surface ~1 hour.
- **Yellow band justifications** can become rubber-stamping if not policed. Mitigation: Scope Critic stress-tests the justification content, not its presence.
- **Forward-only application** means the 14 existing Slices may carry latent oversize / undersize problems. Mitigation: backfill audit as a known follow-up.

### Reversibility

Reversible by superseding PD. If a dimension proves noisy in practice, it can be tuned (greens, yellows, reds) without changing the 5-dimension structure. If the whole heuristic feels heavy, reverting to PD-001's implicit rule is a single PD away.

## Open follow-ups

1. **Backfill audit** — walk the 14 existing Slices, compute D1..D5, flag any yellow / red. Filed under `POINTS_OF_ATTENTION.md` as POA-007.
2. **Scope Critic extension** — add "Slice sizing" section walking the 5 dimensions. Not yet implemented; required for new Slices to pass the check.
3. **Readiness checker Part 9** — add SP-S1..SP-S5 mechanical checks. Not yet implemented.

## Links

- PRD: `docs/prd/PRD.md`
- Methodology: `docs/product-decisions/PD-001-post-slice-workflow.md` (amended)
- Per-FA gate: `docs/product-decisions/PD-006-per-fa-delivery-readiness-gate.md` (upstream sibling)
- Scope Critic: `.cursor/agents/scope-slice/scope-critic.md`
- Readiness checker: `.cursor/checkers/scope-readiness-checker.md`
- Spec → code gate: `docs/product-decisions/PD-008-spec-to-code-strict-gate.md` (downstream sibling)
