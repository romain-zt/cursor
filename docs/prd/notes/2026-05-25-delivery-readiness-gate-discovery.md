# Delivery Readiness Gate — Discovery Note — 2026-05-25

Source: agent-driven methodological discovery (Phase 1.1 of plan `Per-FA Delivery Readiness Gate`).

Status: active

Scope: governance methodology only — defines a per-FA gate between **Feature Area `validated`** and the start of **User Story / Spec / code** work. **Does not** modify the product PRD (`docs/prd/PRD.md`). Output of this note feeds the durable decision in `docs/product-decisions/PD-006-per-fa-delivery-readiness-gate.md` (Phase 1.2).

---

## 2026-05-25 — Why this discovery exists

### Raw input (from plan)

> Là ou le curseur n'est pas encore fixé, c'est comment on peut définir que la partie "macro" est prête, et commencer à itérer sur la première feature -> slice en parallèle de définir les autres.

### Interpreted insight

The workflow today has a **discipline gap** between the FA/Slice layer (`feature-area-workflow.mdc`) and the User Story / Spec / Task layer (`user-story-workflow.mdc`). Each rule is internally consistent, but **nothing tells an agent or a founder when an individual Feature Area is "stable enough" that the downstream chain can start in parallel with the macro elaboration of other Feature Areas**.

Observed consequence in Phase 4 of the plan `Zedos verticale + post-slice`: I elaborated the entire macro layer (PRD → 10 FAs → 12 Scope Slices) **before** running the post-slice vertical on `account-session`. This was a choice, not a constraint of the workflow — but the absence of an explicit signal pushed me toward the safer "do everything macro first" pattern, which costs time-to-first-delivery.

The inverse failure mode is just as real: parallelizing without discipline risks investing in User Stories / Specs / code for FA-1 while FA-5 elaboration uncovers a transverse constraint that invalidates that work.

A **named gate** with **concrete criteria** resolves both failure modes.

### Methodology implication

The gate must be:

- **Per-FA, not global.** A global gate forces synchronization across all FAs, which is what the founder explicitly does not want.
- **Concrete enough to be checkable.** Five or fewer criteria, each evaluable without judgment calls.
- **Placed where investment commitment changes.** Slicing is still PRD-layer work (low cost to redo). User Stories and Specs start being expensive to redo and are the first artifacts that anchor downstream code structure. The gate goes between **Scope Slice `ready-for-user-stories`** and **the first `/user-story scaffold` on that slice**.

---

## 2026-05-25 — Q-M-D-001 — Per-FA vs. global vs. hybrid

### Decision

**Per-FA gate.** No global "macro layer ready" milestone.

Rationale:

- **Global gate** would force all 10 FAs to reach the same maturity before any single one can start delivery. That is precisely the failure mode observed in Phase 4 and what we are trying to fix.
- **Hybrid** (a global "discovery done" gate + per-FA gates) adds an extra synchronization point with no clear payoff: the per-FA gate already enforces the relevant cross-FA assumption (DR-02 requires direct dependencies to be at least scaffolded), so the global gate would be redundant.
- **Per-FA** is the minimum viable discipline: each FA carries its own verdict, and parallelization is authorized exactly when each FA satisfies its own criteria.

Trade-off accepted: requires a per-FA audit (each new `validated` FA goes through one additional check). This is cheap relative to the cost of either failure mode.

---

## 2026-05-25 — Q-M-D-002 — Where in the chain does the gate sit?

### Decision

**Between Scope Slice `ready-for-user-stories` and the first `/user-story scaffold` on that slice's parent Feature Area.**

Concretely: the gate is at the FA level, and it conditions the **start of User Story / Spec / Task / code work** on that FA. Slicing remains authorized at FA `validated`.

Rationale:

- **Earlier (FA → Slice transition):** would not change behavior much, because slicing is still PRD-layer work and benefits from staying flexible.
- **Later (Spec → code):** would let us write Specs that turn out to be wrong because of transverse constraints we discover later. Specs are the first artifact that hard-codes architecture (per PD-001), so by the time we get to "Spec → code", the damage is already done if a cross-FA assumption is invalid.
- **At FA `validated` → FA `delivery-ready` (this decision):** captures the commitment point — once the gate passes, the founder can safely invest in detailed User Stories and Specs for this FA in parallel with macro work on others.

This means the new FA lifecycle has **three concrete states with a clear meaning**:

```
exploratory → validated → delivery-ready
```

with `blocked` and `deferred` remaining as terminal off-ramps.

---

## 2026-05-25 — Q-M-D-003 — Criteria

### Decision

Five criteria, identified `DR-01` through `DR-05`:

- **DR-01 — FA is `validated`.**
  Trivial precondition. Without this, the FA is still in macro discovery.

- **DR-02 — Direct dependencies at minimum scaffolded.**
  Every FA listed in this FA's `Dependencies` section must have an existing file in `docs/product/feature-areas/`. The file can be `exploratory` — the requirement is that the **shape** of the neighboring FA is on paper, so the founder cannot be blindsided by a wildly different definition later.

- **DR-03 — Governing Product Decisions are `approved`.**
  Any PD referenced by this FA's body (or that any reasonable agent would identify as governing the FA's contract or behavior) must be at `status: approved` — not `provisional`, not `proposed`. Prevents the case where a Spec is written against a PD that subsequently changes.

- **DR-04 — No `NEED_HUMAN=true` on this FA or its direct dependencies.**
  An open `NEED_HUMAN` flag on a dependency means the contract with that dependency is not stable; investing in detailed downstream work would risk being invalidated. This is the criterion that will keep `payments` at `validated` (because `credit-system` carries `NEED_HUMAN=true`).

- **DR-05 — At least one Scope Slice is `ready-for-user-stories`.**
  Otherwise there is nothing to deliver. Avoids the degenerate case where a `delivery-ready` FA has no actionable downstream artifact.

### Rejected criteria

- "All Scope Slices `ready-for-user-stories`" — too strict, defeats the purpose of running a vertical on one slice while siblings are still being refined.
- "PRD signed off" — already implied by the existence of the FA at `validated`.
- "Architecture approved" — by design, no architecture exists at FA level (per `feature-area-workflow.mdc` §4); architecture lands at Spec level per PD-001. Including this here would invert the dependency.
- "Tests defined" — tests belong to Specs, not FAs.

---

## 2026-05-25 — Q-M-D-004 — How is the gate operated?

### Decision

Mirror the `/feature-area` ceremony pattern exactly:

- **Check (no writes):** `/feature-area clear-for-vertical <name>` runs the new Part 8 of the checker against the FA file. CLEAR or BLOCKED.
- **Promote (narrow transition):** if CLEAR, the same command applies the predefined edits (`Status` field, `Readiness verdict` section, changelog row) to transition the FA from `validated` to `delivery-ready`.

No separate refine mode — DR-01..DR-05 are mostly about external state (dependencies, PDs, child slices), not about content of the FA file itself. The FA file changes captured by this transition are limited to status + verdict + changelog, which fits the predefined-edit pattern already used by `/feature-area promote`.

### Implication for `/user-story` pre-flight

`/user-story scaffold` (and by transitivity `/user-story propose`) gains a precondition: parent FA must be at `delivery-ready`. The previous precondition (parent Scope Slice at `ready-for-user-stories`) stays. The new check is a single additional read on the FA file.

This preserves the principle that **all downstream commands fail fast** rather than allowing premature work to land.

---

## 2026-05-25 — Q-M-D-005 — Naming

### Decision

Default to **`delivery-ready`** as the status name. Treat naming as reversible: a future PD or maintenance pass can find/replace if the founder prefers another term.

Considered alternatives (informational only):

- `cleared-for-vertical` — verbose, but unambiguous.
- `verticalisable` — French-only, jargon-y.
- `delivery-ready` — short, business-readable, matches the verb pair `validated`/`ready` already used elsewhere in the chain.

The founder flagged naming as low-priority during the cadrage. We default to `delivery-ready` to unblock the rest of the plumbing; revisit if it shows friction in practice.

---

## 2026-05-25 — Cross-cutting risks

- **Drift between `delivery-ready` and reality.** A FA could be promoted to `delivery-ready`, then a dependency changes status to `blocked`, and the original promotion becomes stale. Mitigation: the checker re-runs Part 8 whenever a parent FA's dependencies change (covered by CC-04 propagation in the existing checker — extended in Phase 2.1 of this plan). A `delivery-ready` FA whose dependency drops to `blocked` must be reverted to `validated` and re-checked.
- **Premature `delivery-ready` due to undeclared PDs.** DR-03 trusts the FA file to enumerate its governing PDs. A founder could miss a relevant PD. Mitigation: the Spec stage (SP-08, SP-09) re-checks PD references; a missed PD will be caught one layer down. Acceptable risk for v0 of this gate.
- **Forward-only application.** User Stories and Specs already created during Phases 3 and 4 of the previous plan were authored under the older rule (parent FA `validated`, no `delivery-ready` gate). They are not retroactively invalidated. Documented as such in PD-006.

---

## New / updated questions

- None at PRD product level. PRD remains stable at v1.
- Methodological resolutions captured here are converged in **PD-006-per-fa-delivery-readiness-gate.md** (Phase 1.2).

---

Rules:
- Append only.
- Do not edit past entries unless correcting a clear interpretation error.
- Methodological notes do not flow to `docs/prd/PRD.md` — they flow to `docs/product-decisions/PD-XXX-*.md`.
