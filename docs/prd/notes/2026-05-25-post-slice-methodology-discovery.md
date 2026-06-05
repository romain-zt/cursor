# Post-Slice Methodology Discovery Note — 2026-05-25

Source: agent-driven methodological discovery (Phase 2.1 of plan `Zedos verticale + post-slice`)

Status: active

Scope: governance methodology only — defines artifacts and gates between **Scope Slice → code** for the Zedos project. **Does not** modify product PRD (`docs/prd/PRD.md`) content. Output of this note feeds the durable decision in `docs/product-decisions/PD-001-post-slice-workflow.md` (Phase 2.2).

---

## 2026-05-25 — Why this discovery exists

### Raw input (from plan)

> Le repo n'a aucune commande, agent, skill, template ou checker pour la phase Scope Slice → code. `/execute-prd` impose explicitement un stop a ce niveau (.cursor/commands/execute-prd.md lignes 61-63). Tout est a concevoir.

### Interpreted insight

The current Cursor workflow stops at `ready-for-user-stories`. Two scope slices for `account-session` now hold that status with no downstream chain. Without a defined post-slice methodology, the slices are dormant artifacts — no path to code, no path to value.

The chain envisioned by `scope-readiness-checker.md` (lines 5-9) is six levels deep:

```
PRD → Feature Area → Scope Slice → User Story → Spec → Task
```

The first three are implemented. The last three are not. This note designs the last three for v0 of the methodology.

### Methodology implication

The post-slice workflow must mirror the FA/Slice ceremony pattern (propose → approve → scaffold → refine → check → promote) so the founder learns one ceremony, not three. Anything that diverges from that pattern needs a strong justification or it adds cognitive cost without compensating benefit.

---

## 2026-05-25 — Q-M-001 — Which artifacts live between Scope Slice and code?

### Candidates

User Story, Acceptance Criteria, Implementation Spec, Task, Test.

### Decision

**3 new file artifact types** for v0 of the post-slice methodology:

1. **User Story** — always required. Behavioral statement of one user-visible capability. Granularity: per Acceptance Criterion of a Scope Slice (a slice typically yields 3–6 user stories). Format: standard "As an X, I do Y, so that Z." Acceptance Criteria are **inline** in the User Story (Given/When/Then bullets), not a separate file. Audience: product-readable.

2. **Implementation Spec** — always required, one per User Story. Names the technical contract: data model touched (real schema or in-memory shape), API surface or function signature, UI elements involved, error modes handled, observability hooks. **This is the first artifact where architecture appears.** Audience: engineer-readable.

3. **Task** — **optional**. Created only when a Spec needs subdivision (e.g. a Spec that touches both UI and a background job may warrant 2 Tasks). A Spec that fits in one focused implementation does not require Task files. Audience: implementer-readable, scoped to a single coherent commit or short PR.

### Rejected as separate artifact

- **Acceptance Criteria** — inlined in User Story. Reason: forcing a separate file doubles ceremony for content that always reads against its parent US.
- **Test** — not a separate artifact. Test planning lives in Spec; test execution discipline (test-first or not) is enforced at implementation time, not by a file gate. Reason: a Test file would either duplicate the Spec or become a checklist that no one updates after first pass.

### Implication for templates

3 templates required (User Story, Spec, Task). All under `.cursor/templates/product/`.

---

## 2026-05-25 — Q-M-002 — Granularity of User Story

### Decision

**Per Acceptance Criterion of a Scope Slice**, with each US carrying 2–5 inline ACs.

Rationale:

- 1 US per UX state is too fine (5+ UXs × 10 slices = 50+ US files, ceremony overhead crushes signal).
- 1 US per Slice is too coarse (a single US can't carry inline ACs for "success" + "error" + "edge" coherently).
- Per-AC strikes a balance: a slice with 5 UX states typically resolves to 3–6 US (some UXs collapse, like "loading" being an intra-AC detail rather than a US in itself).

Concrete sizing check on the `signup-to-signed-in-dashboard` slice:

- US-1: "Founder creates an account from the signup entry." (covers empty + submitting + success states, ACs: 3)
- US-2: "Founder receives an actionable error when signup cannot complete." (covers error state, ACs: 3)
- US-3: "Already-authenticated founder is not allowed to create a duplicate account." (covers edge state, ACs: 2)

3 US per slice for an authentication slice; scales reasonably for larger slices.

---

## 2026-05-25 — Q-M-003 — Spec separated from User Story, or inlined?

### Decision

**Separated.** One Spec file per User Story.

Rationale:

- Spec is the first artifact where stack, schema, framework, routes, and runtime appear. Inlining it in US violates SS-04 in spirit (US should stay behavioral / product-readable).
- Spec has a distinct lifecycle: approve → implement → archive. US has its own: approve → satisfied. Different cadence.
- A Spec change does not necessarily change the US (a US can survive multiple Spec revisions if implementation evolves). Coupling them in one file would create artificial churn on the US side.

Filename pattern: `docs/product/specs/<fa-kebab>--<slice-kebab>--US-<id>--<short-kebab>.md`.

---

## 2026-05-25 — Q-M-004 — Test-first discipline

### Decision

**Encouraged by Spec template, not gated by workflow.**

- The Spec template has a mandatory **Tests** section listed **before** the **Implementation notes** section, so a Spec without a Tests section fails the Spec readiness check.
- However, the checker does NOT verify that tests are written first in time. That is a discipline for implementation, not a file gate.

Rationale: a solo founder using AI agents to code needs flexibility to iterate. Hard test-first gates create false-positive blocks (e.g. exploratory spike to verify a third-party API before writing tests). Soft enforcement via template structure preserves the discipline without weaponizing it.

---

## 2026-05-25 — Q-M-005 — Who can create / promote what?

### Decision

**Mirror FA/Slice ceremony pattern exactly**, applied to each new artifact:

| Phase | User Story modes | Spec modes | Task modes |
|---|---|---|---|
| Propose (no writes) | `stories <slice-path>` | `specs <story-path>` | `tasks <spec-path>` |
| Scaffold (creates files from approved proposal) | `scaffold-stories <slice-path>` | `scaffold-specs <story-path>` | `scaffold-tasks <spec-path>` |
| Refine (edits product/impl fields on one file) | `refine-story <story-path>` | `refine-spec <spec-path>` | `refine-task <task-path>` |
| Check (runs checker, no writes) | `check <story-path>` | `check <spec-path>` | `check <task-path>` |
| Promote (narrow transition only when CLEAR) | `promote-story <story-path>` | `promote-spec <spec-path>` | `promote-task <task-path>` |

Statuses by artifact:

- **User Story:** `exploratory` → `ready-for-spec` (terminal: `blocked`, `deferred`)
- **Spec:** `exploratory` → `ready-for-implementation` (terminal: `blocked`, `deferred`)
- **Task:** `exploratory` → `ready-for-merge` (terminal: `blocked`, `deferred`)

Open question on command surface (resolved by 2.4 of the plan):

- **Option A**: Extend `/feature-area` with the new modes (16 new modes total — doubles the command surface).
- **Option B**: Create `/user-story`, `/spec`, `/task` as 3 separate commands (each carrying its own propose/scaffold/refine/check/promote modes, ~5 modes each = 15 modes).

**Recommendation:** **Option B (3 separate commands).** Reasons:
- Each command stays under ~5 modes, matching the readability ceiling of the current `/feature-area` command.
- Each command can carry its own pre-flight (read parent artifact, its parent, and PRD context) without the existing `/feature-area` command growing unwieldy.
- Easier to enable/disable phases independently as the methodology matures.

Trade-off accepted: 3 new commands instead of 1. Cost is real but bounded; payoff is per-command clarity.

---

## 2026-05-25 — Q-M-006 — Agents per phase

### Decision

| Phase | Lead agent | Critic agent | Skill |
|---|---|---|---|
| User Story | **User Story Lead** (high-context: reads PRD + parent FA + parent Slice + open questions + product decisions before any operation) | **Story Critic** (stress-tests for: premature implementation language, weak ACs, hidden assumptions, scope creep beyond parent slice) | `user-story-builder` |
| Spec | **Spec Lead** (reads parent US + Slice + FA + PRD + product decisions; primary author for impl-level content) | **Spec Critic** (stress-tests for: gold-plating, missing error modes, missing observability, missing tests section, leaking out of parent US boundary) | `spec-builder` |
| Task | None | None | `task-builder` |

Rationale for no agent on Task: Tasks are intentionally small and inherit context entirely from their parent Spec. A dedicated Lead/Critic would add ceremony with no signal added on top of the Spec critic already having run.

---

## 2026-05-25 — Q-M-007 — Checker scope

### Decision

**Extend the existing `scope-readiness-checker.md` with new parts**, not a separate checker.

New parts:

- **Part 4 — User Story Checks** (US-01 … US-N).
- **Part 5 — Spec Checks** (SP-01 … SP-N).
- **Part 6 — Task Checks** (TK-01 … TK-N).

The existing **Cross-Cutting Checks (CC-01 … CC-05)** already cover NEED_HUMAN propagation, NEED_UPDATE, no-skipped-levels, no-task-slicing-from-PRD, and v0-boundary-not-leaked across the full chain. They apply to the new artifacts as-is.

Rationale: one checker file = one mental model. Splitting checkers per artifact would force three separate places to update when conventions change.

---

## 2026-05-25 — Q-M-008 — `/execute-prd` rule changes

### Decision

Update `.cursor/rules/execution-loop.mdc` and `.cursor/commands/execute-prd.md`:

1. **Hard rules** line 61-63 of `execute-prd.md` (forbidding User Story / Spec / Task creation): **lift the ban** — but only behind the **same** gates as FA/Slice (propose → approve → scaffold → refine → check → promote). Autonomous creation outside approved proposals stays forbidden.
2. **`allowed_files`** in `EXECUTION_LOCK.md` extends to:
   - `docs/product/user-stories/`
   - `docs/product/specs/`
   - `docs/product/tasks/`
3. **`scan` mode** rebuilds `WORK_QUEUE.md` from these new directories too.
4. **`run-one` mode** allowed bounded steps gain: `/user-story refine|check|promote|scaffold` etc., mirroring the FA list.
5. **Stop conditions**: extend rule §11 with `BLOCKED` from any of US/Spec/Task checkers triggering a halt.
6. **`src/**`** stays excluded from `allowed_files` by default. Code writes require an explicit further extension (out of scope of this discovery).

---

## 2026-05-25 — Cross-cutting risks

- **Ceremony fatigue.** 3 new commands × 5 modes + 4 new agents + 3 templates + 3 checker parts + 1 rule + execute-prd updates = a large surface added in one batch. Mitigation: scaffold the minimum needed to test on `account-session`, and **only after Phase 3 confirms the chain holds**, generalize to the 9 other FAs in Phase 4.
- **Premature architecture lock-in via Spec.** Spec is where implementation choices first land. A bad first Spec can poison the rest. Mitigation: Spec Critic explicitly stress-tests for premature commitment, and Spec promotion requires PRD-aligned data-model + observability sections rather than free-form architecture.
- **Test-first as a soft constraint.** May erode in practice. Acceptable for v0 of methodology; revisit after first Specs land if test coverage drifts.

---

## New / updated questions

- None at PRD product level. PRD remains stable at v1.
- Methodological resolutions captured here are converged in **PD-001-post-slice-workflow.md** (Phase 2.2).

---

Rules:
- Append only.
- Do not edit past entries unless correcting a clear interpretation error.
- Methodological notes do not flow to `docs/prd/PRD.md` — they flow to `docs/product-decisions/PD-XXX-*.md`.
