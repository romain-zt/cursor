diff --git a/.cursor/checkers/scope-readiness-checker.md b/.cursor/checkers/scope-readiness-checker.md
index 0eaa281..fcf3b84 100644
--- a/.cursor/checkers/scope-readiness-checker.md
+++ b/.cursor/checkers/scope-readiness-checker.md
@@ -248,11 +248,14 @@ For Zedos v0 owner milestones:
 
 ---
 
-### SS-11 · Status matches readiness
+### SS-11 · Status is `ready-for-user-stories`
 
-> If status is `ready-for-user-stories`, all Part 2 checks must pass and no NEED_HUMAN flag is set.
+> Valid Scope Slice statuses are: `exploratory`, `blocked`, `deferred`, `ready-for-user-stories`. The status `validated` is not valid for Scope Slices.
+>
+> If the slice has passed all Part 2 checks and has no unresolved NEED_HUMAN flag, status must be `ready-for-user-stories`. User stories may not be written until this status is set.
 
 **FAIL signals:**
+- Status is `validated` (not a valid Scope Slice status — `validated` belongs to Feature Areas only; use `ready-for-user-stories` instead)
 - Status is `ready-for-user-stories` with unresolved NEED_HUMAN
 - Status is `ready-for-user-stories` but SS-01 through SS-10 have failures
 
diff --git a/.cursor/rules/feature-area-workflow.mdc b/.cursor/rules/feature-area-workflow.mdc
index 71df111..4858674 100644
--- a/.cursor/rules/feature-area-workflow.mdc
+++ b/.cursor/rules/feature-area-workflow.mdc
@@ -81,6 +81,18 @@ A Scope Slice must:
 
 If a Scope Slice cannot be fully described without naming technical layers, it is not ready.
 
+### Terminology Compatibility
+
+**"Feature Group" is legacy PRD language** produced by the PRD Builder skill during discovery and convergence.
+
+When transitioning from PRD to execution:
+
+- Convert each broad PRD Feature Group into one or more Feature Areas using this workflow.
+- Do not carry "Feature Group" naming into `docs/product/` artifacts.
+- A single PRD Feature Group may map to multiple Feature Areas — split before decomposing.
+- Do not create Scope Slices directly from a PRD Feature Group without first creating and validating a Feature Area.
+- New documents under `docs/product/` must use Feature Area / Scope Slice terminology exclusively.
+
 ### Service
 
 A runtime or deployment boundary. Only use "service" when architecture has explicitly drawn runtime separation. Do not call a Feature Area a service.
@@ -120,6 +132,12 @@ The following are strictly forbidden at each layer:
 
 ## 5. Readiness Gates
 
+### Feature Area lifecycle
+
+- A Feature Area in `exploratory` status **may** list candidate Scope Slices in its Candidate Scope Slices section (names + one-line descriptions only).
+- Formal Scope Slice documents (files under `docs/product/scope-slices/`) **may only be created** after the Feature Area is marked `validated`.
+- User stories may only be written after a Scope Slice is marked `ready-for-user-stories`.
+
 ### Feature Area → Scope Slices
 
 A Feature Area may be decomposed into Scope Slices only when:
@@ -137,6 +155,8 @@ A Feature Area may be decomposed into Scope Slices only when:
 
 A Scope Slice may produce user stories only when:
 
+- [ ] Status is `ready-for-user-stories`
+
 - [ ] User value is stated without implementation language
 - [ ] Exact boundary is defined (included + excluded behaviors)
 - [ ] UX states are enumerated (empty, loading, error, success, edge cases)
diff --git a/.cursor/skills/prd/prd-builder/SKILL.md b/.cursor/skills/prd/prd-builder/SKILL.md
index 5a8fe90..3e53ee2 100644
--- a/.cursor/skills/prd/prd-builder/SKILL.md
+++ b/.cursor/skills/prd/prd-builder/SKILL.md
@@ -701,3 +701,41 @@ The PRD is considered converged when:
 At this point: stop discovery, freeze PRD direction, transition to specs/implementation. The PRD Builder skill is no longer the active workflow — further changes require a deliberate `/prd update` with a version bump rationale.
 
 A PRD that never converges is not a PRD — it's a brainstorm.
+
+## 13. Handoff to Feature Area Workflow
+
+PRD Builder owns PRD discovery, convergence, and PRD-level Feature Groups. Its scope ends at the product definition layer.
+
+**Feature Area Workflow** (`.cursor/rules/feature-area-workflow.mdc`) owns execution decomposition: converting PRD Feature Groups into Feature Areas, decomposing Feature Areas into Scope Slices, and advancing Scope Slices toward user stories.
+
+### What PRD Builder must NOT do
+
+PRD Builder must never:
+
+- Create Feature Area files (`docs/product/feature-areas/`)
+- Create Scope Slice files (`docs/product/scope-slices/`)
+- Write user stories, specs, or tasks
+- Decompose a PRD Feature Group into Scope Slices directly (without Feature Area decomposition)
+- Use "Feature Group" naming in `docs/product/` artifacts
+
+### When to hand off
+
+Hand off when any of:
+
+- The PRD has converged (§12) and the next step is execution planning
+- A PRD Feature Group is too broad to yield Scope Slices without Feature Area decomposition first
+- The user asks to start building, planning, or decomposing product scope into work
+
+### How to hand off
+
+State explicitly:
+
+```txt
+PRD Feature Group "<name>" is at product-scope convergence.
+Execution decomposition requires Feature Area Workflow.
+
+Next step: read `.cursor/rules/feature-area-workflow.mdc` and convert this
+Feature Group into Feature Areas before creating any Scope Slices.
+```
+
+Do not perform the decomposition. Route clearly and stop.
diff --git a/.cursor/templates/product/scope-slice.template.md b/.cursor/templates/product/scope-slice.template.md
index 3d9185e..7034383 100644
--- a/.cursor/templates/product/scope-slice.template.md
+++ b/.cursor/templates/product/scope-slice.template.md
@@ -15,7 +15,7 @@
 
 ## Status
 
-<!-- One of: exploratory | validated | blocked | deferred | ready-for-user-stories -->
+<!-- One of: exploratory | blocked | deferred | ready-for-user-stories -->
 
 `STATUS`
 
