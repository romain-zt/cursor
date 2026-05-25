# Phase 3 Post-Slice Methodology Pilot — Retrospective — 2026-05-25

Source: Phase 3 of plan `Zedos verticale + post-slice`. Pilot run over the two `account-session` Scope Slices.

Status: active

Scope: methodological retrospective only. Documents frictions encountered while running the workflow defined by PD-001 on a real case before applying it to the 9 remaining Feature Areas. Does not modify the PRD.

---

## What ran

Pilot exercised every mode of the new chain on two `ready-for-user-stories` Scope Slices:

- `account-session--signup-to-signed-in-dashboard` → 3 User Stories → 3 Specs.
- `account-session--returning-owner-sign-in` → 3 User Stories → 3 Specs.

Final state: 12 new artifacts, all at the target ready-* status, plus 1 provisional Product Decision.

| Artifact | Count | Final status |
|---|---|---|
| User Story files | 6 | `ready-for-spec` |
| Spec files | 6 | `ready-for-implementation` |
| Task files | 0 | n/a (all 6 Spec proposals returned `Subdivision needed: no`) |
| Product Decision | 1 (PD-002) | `provisional` — awaits user approval |

Exit criterion of Phase 3 ("all artifacts at ready status by the new checker") is met.

---

## Friction 1 — Spec layer surfaces a stack-baseline gap (CRITICAL)

### Observation

Writing the first Spec (`signup--US-001--account-created.spec.md`) immediately required naming concrete technology (web framework, auth library, database, ORM, session model, password hashing) because the Spec checker mandates Data Model (SP-03), Contract (SP-04), Tests (SP-06), and Implementation notes (SP-08). The PRD intentionally does not name these (correct PRD discipline). No prior PD addressed them either.

### What I did

Created **PD-002 (Pilot Stack Baseline for Zedos v0)** with `status: provisional`. Picked pragmatic defaults (Next.js / Auth.js / Postgres / Prisma / Argon2id / DB-backed sessions). All 6 Specs then ground in PD-002.

### Why this is a real friction

PD-001 specifies that Spec is the first artifact where architecture lands. That is correct for "what artifact carries the decision" but it does **not** specify "what artifact authorizes the decision". In practice, a Spec written by an agent under execution pressure will either:

- invent stack choices ad-hoc (each Spec diverges from the next — fails Spec Critic's sibling-consistency check), or
- block on an unresolved upstream decision (the workflow stalls), or
- assume an upstream decision exists (creates phantom dependencies).

The first batch of Specs across one Feature Area can coast on a single ad-hoc decision, but Phase 4 across 9 Feature Areas amplifies the risk.

### Recommendation (iteration on PD-001)

Add an **Architecture PD** layer above Spec in PD-001. The shape:

- An Architecture PD (e.g. PD-NNN "v0 stack baseline") is the **prerequisite** for a Spec to declare stack-level choices.
- A Spec that references stack-level choices must cite the PD that authorizes them.
- The Spec Critic stress-tests for unjustified divergence from the cited PD.
- The chain becomes `PRD → FA → Slice → US → Architecture PD (when needed) → Spec → Task`. The Architecture PD is not always needed (a Spec may inherit from an existing PD without creating a new one).

Alternative: keep Specs as the architecture authority but add a hard pre-flight check in `/spec propose` that lists "stack choices already committed in sibling Specs" and forces the proposal to either match or justify divergence. Less rigorous than an explicit PD layer but lower ceremony.

**Action item for user:** approve PD-002 as-is, replace it, or reject it (forcing the Architecture-PD-layer iteration). Decision required before Phase 4.

---

## Friction 2 — Sibling-Spec consistency relies on manual reading

### Observation

When writing Specs 2, 3, 5, 6 (all variations / edges of the canonical schema in Spec 1), I had to manually re-read Spec 1 to maintain schema consistency, error-event naming consistency, and observability-signal-family consistency.

The Spec Lead Brief template (`spec-lead.md`) has a "Sibling Specs sharing data / contract surface" table for exactly this reason. In practice, filling it requires reading every sibling Spec file in full.

### Why this is a real friction

For 6 Specs in one Feature Area, manual cross-reading is tractable. At 50+ Specs across 10 Feature Areas, the Spec Lead Brief will silently degrade unless the table is filled rigorously every time.

### Recommendation (no immediate iteration)

No iteration on PD-001 required. The current chain handles this correctly via the Spec Lead pre-flight. The friction is operational discipline, not workflow design.

Add an "operational note" to `.cursor/skills/spec/spec-builder/SKILL.md` (already present implicitly): **when writing a Spec in a Feature Area that already has Specs, treat the sibling-Spec table as load-bearing and fill it exhaustively before proposing**. Optionally: introduce a small `/spec siblings <us-path>` helper mode that lists sibling Specs and their key surfaces — would be a quality-of-life improvement, not a workflow change.

---

## Friction 3 — `/task` workflow was never exercised

### Observation

All 6 Spec proposals returned `Subdivision needed: no`. The `/task` command, agents, skill, template, and checker (Part 6) exist but were not exercised by the pilot.

### Why this is a real friction

The methodology may have unknown gaps at the Task layer. The "default no" stance from PD-001 keeps Tasks light, but it also means the first real subdivision case will hit the workflow cold.

### Recommendation (no immediate iteration)

No iteration. Accept the gap; revisit when a real Spec in Phase 4 needs subdivision (likely candidates: PRD versioning, payments — both touch async flows + UI + persistence).

Document the gap explicitly so the first user of `/task` knows it has not been pilot-tested.

---

## Friction 4 — Chain length is real

### Observation

Per Feature Area, the chain from `validated` to a single implementable Spec is:

```
Feature Area validated
  → Scope Slice ready-for-user-stories
    → User Story ready-for-spec (typically 3–6 per slice)
      → Spec ready-for-implementation (typically 1 per US)
        → (optional Task ready-for-merge)
```

For `account-session`, that meant 14 governance artifacts (2 slices + 6 stories + 6 specs) to ship one auth feature. Phase 4 over 9 Feature Areas suggests on the order of 100+ artifacts before implementation begins.

### Why this is a real friction

The discipline is genuine and the artifacts pay off in clarity, but the **calendar cost is non-trivial**. A solo founder using AI agents must keep this in mind; the methodology is not a velocity tool, it is a correctness tool.

### Recommendation (no immediate iteration)

No iteration. Accept the cost as the explicit trade-off PD-001 commits to. If, after running Phase 4 on 2–3 more FAs, the cost feels disproportionate, consider a follow-up PD that introduces a "fast-track" path for low-complexity Feature Areas (e.g. when a slice has only 1–2 ACs, fold US+Spec into a single combined artifact). Do not do this preemptively — wait for evidence.

---

## Friction 5 — Refine + promote ceremony per artifact

### Observation

In the pilot, every artifact's changelog received 3 rows: one for scaffold, one for refine, one for promote. The pilot did refine in a single pass (filling all sections at once); a real session may iterate refine multiple times, but the changelog still gets a single refine row per artifact (the rules forbid changelog rows from `refine` mode).

### Why this is a real friction

Minor. The 3-row pattern is informative (it traces the artifact's progression) but it does inflate the artifact's changelog footprint. For 100+ artifacts in Phase 4, this is 300+ changelog rows.

### Recommendation (no immediate iteration)

No iteration. The pattern is consistent and traceable; no aggregation needed at this layer. If the changelog inflation becomes a real reading-burden, revisit via a follow-up PD that allows `refine` to amend the most recent refine row instead of skipping.

---

## Friction 6 — PRD-allowed terms boundary at Spec layer

### Observation

The `scope-readiness-checker.md` Allowed product-level terms (PRD) section enumerates short list (Stripe, web app, credit ledger, saved payment method, noindex, Cursor setup). At the Spec layer, these are not the only "PRD-allowed" terms; the entire stack baseline (Next.js, Auth.js, Postgres, etc.) becomes legitimate **because PD-002 authorizes it**.

### Why this is a real friction

The checker's allowed-terms list is written for the FA / Slice / US layers. At the Spec layer, the boundary changes (stack becomes legitimate). The checker correctly handles this via SP checks (which do not run "PRD-allowed terms" enforcement), but the cross-cutting CC checks may give noisy reads at the Spec layer because they were originally written for the higher levels.

### Recommendation (light iteration on scope-readiness-checker.md)

Add a clarification at the top of "Allowed product-level terms (PRD)" stating that this list applies to **Feature Area, Scope Slice, and User Story** artifacts only. At the Spec and Task layers, stack-level terms authorized by a Product Decision (e.g. PD-002) are permitted. This is a documentation-only clarification; no check semantics change.

I have not applied this iteration in the pilot. Recommended as a small follow-up.

---

## Cross-cutting observation — PD-002 unblocks Phase 3 but creates governance debt

Phase 3 exited with PD-002 in `provisional` status. This is **governance debt**: a real load-bearing decision was made by an agent under execution pressure without user input. Phase 4 cannot proceed honestly without addressing it.

The user has three options before Phase 4 begins:

1. **Approve** PD-002 as-is (change `status: provisional` → `status: approved`).
2. **Replace** PD-002 with a different baseline and update the 6 `account-session` Specs accordingly.
3. **Reject** PD-002 and iterate PD-001 to introduce an Architecture-PD layer above Spec.

Friction 1's recommendation aligns with option 3.

---

## Summary verdict

The new post-slice chain (defined by PD-001) **holds on a real Feature Area**.

Frictions identified:

| # | Severity | Action required |
|---|---|---|
| 1 — Stack baseline | CRITICAL | User decision required before Phase 4 (approve / replace / reject PD-002) |
| 2 — Sibling-Spec consistency | minor | Operational discipline; optional helper mode |
| 3 — `/task` never exercised | minor | Accept gap; revisit when first real subdivision arrives |
| 4 — Chain length | accepted | No iteration; revisit after 2–3 more FAs in Phase 4 |
| 5 — Refine + promote ceremony | minor | No iteration; accept |
| 6 — Allowed-terms boundary at Spec | very minor | Light doc clarification recommended |

**Phase 3 exit criterion met.** Phase 4 readiness is conditional on the user addressing Friction 1.

---

Rules:
- Append only.
- This retrospective is methodological, not PRD product material. It does not feed PRD convergence.
- Future Phase 3-style retrospectives (after Phase 4 batches) should append below this section.
