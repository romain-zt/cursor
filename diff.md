diff --git a/.cursor/agents/feature-area/README.md b/.cursor/agents/feature-area/README.md
deleted file mode 100644
index 8cf609d..0000000
--- a/.cursor/agents/feature-area/README.md
+++ /dev/null
@@ -1,92 +0,0 @@
-# Feature Area Committee
-
-Two specialized agents that govern Feature Area decomposition from PRD Feature Groups toward Scope Slices.
-
-This is **AI-assisted decomposition governance**: proposals and checks precede decomposition; **`/feature-area scaffold`** writes Feature Area markdown from an approved Feature Area Map; **`/feature-area scaffold-slices`** writes Scope Slice markdown from an approved `/feature-area slice` proposal. The Feature Area Builder skill drives the workflow; the agents provide context reconstruction and adversarial review.
-
-## Members
-
-| Agent | File | Responsibility |
-|-------|------|----------------|
-| Feature Area Lead | [`feature-area-lead.md`](./feature-area-lead.md) | Global decomposition coherence — reconstructs PRD-to-FA-to-SS state before Feature Area operations |
-| Scope Critic | [`scope-critic.md`](./scope-critic.md) | Stress-tests proposals for premature decomposition, architectural language, v0 boundary violations, and hidden blockers |
-
-## Operational core
-
-The [`feature-area-builder`](../../skills/feature-area/feature-area-builder/SKILL.md) skill drives the decomposition loop: PRD-to-Feature-Area mapping, **`scaffold` file writes** after map approval, checker-based validation, Scope Slice proposals, **`scaffold-slices` file writes** after slice approval, and **`refine-slice` / `promote-slice`** on Scope Slice files. Feature Area Lead and Scope Critic provide context and adversarial viewpoints — they do not drive the workflow.
-
-## Operating principle
-
-```txt
-/feature-area map
-  → [feature-area-lead context brief]
-  → builder proposes Feature Area map
-  → [scope-critic reviews proposal]
-  → user approves map
-
-/feature-area scaffold
-  → builder writes docs/product/feature-areas/<kebab>.md from approved map + PRD
-  → (reuse Lead brief from map when same-thread; brief first on cold-start scaffold)
-  → no Scope Slice files; no FA validation in this step
-
-/feature-area validate <name>
-  → [feature-area-lead context brief]
-  → builder runs FA-01–FA-09 + CC checks
-  → verdict: CLEAR | BLOCKED
-
-/feature-area promote <name>
-  → [feature-area-lead context brief]
-  → builder re-runs FA-01–FA-09 + CC checks; if CLEAR and status exploratory, narrow file update to validated
-  → if already validated: no-op
-
-/feature-area slice <name>
-  → [feature-area-lead context brief]
-  → builder confirms validated status + no NEED_HUMAN
-  → builder proposes Scope Slices
-  → [scope-critic reviews proposal]
-  → user approves proposal
-
-/feature-area scaffold-slices <name>
-  → [feature-area-lead context brief — reuse from slice when same-thread; brief first on cold-start]
-  → builder writes docs/product/scope-slices/<fa-kebab>--<slice-kebab>.md from approved proposal + template
-  → skips existing non-empty Scope Slice files
-  → expect exploratory; story-ready only after refine-slice + promote-slice
-
-/feature-area refine-slice <artifact-path>
-  → builder edits product-level sections on one Scope Slice file (no ready-for-user-stories promotion)
-
-/feature-area promote-slice <artifact-path>
-  → builder re-runs SS-01–SS-10 + CC-01–CC-05; if CLEAR and status exploratory, narrow file update to ready-for-user-stories
-  → if already ready-for-user-stories: no-op
-
-/feature-area check <artifact-path>
-  → builder runs checker (no lead pre-flight needed)
-  → verdict: CLEAR | BLOCKED
-```
-
-## How to invoke
-
-Use the [`/feature-area`](../../commands/feature-area.md) command:
-
-- `/feature-area map` — read PRD, propose a Feature Area map
-- `/feature-area scaffold` — after approval, write initial Feature Area markdown from template
-- `/feature-area validate <name>` — run FA-01–FA-09 checks against a Feature Area file
-- `/feature-area promote <name>` — after CLEAR, apply the exploratory → validated transition fields on the Feature Area file
-- `/feature-area slice <name>` — propose Scope Slices for a validated Feature Area
-- `/feature-area scaffold-slices <name>` — after approval, create or fill Scope Slice files from template
-- `/feature-area refine-slice <path>` — update product-level sections on one Scope Slice
-- `/feature-area promote-slice <path>` — after SS-01–SS-10 and CC-01–CC-05 CLEAR, apply ready-for-user-stories transition on one Scope Slice file
-- `/feature-area check <artifact-path>` — run the scope-readiness checker against any artifact
-
-## Governed by
-
-- Rule: `.cursor/rules/feature-area-workflow.mdc`
-- Checker: `.cursor/checkers/scope-readiness-checker.md`
-- Templates: `.cursor/templates/product/`
-
-## Hard rules
-
-- No technical architecture, frameworks, data models, or implementation in committee output.
-- **`/feature-area scaffold`** is the only `/feature-area` mode that **creates** Feature Area files under `docs/product/feature-areas/`. **`/feature-area scaffold-slices`** is the only mode that **creates** or **initially fills** Scope Slice files under `docs/product/scope-slices/` from an approved slice proposal. **`/feature-area refine-slice`** may **edit allowed product-level sections** on one existing Scope Slice file. **`/feature-area promote-slice`** is the only mode that **applies the automated ready-for-user-stories transition** on an existing Scope Slice file (narrow edits only). **`/feature-area promote`** is the only mode that **applies the automated validated transition** on an existing Feature Area file (narrow edits only). Agents (Lead, Critic) do not write those files — the builder does, per each mode’s rules.
-- No user stories, specs, or tasks at any point.
-- Advancement gates follow `.cursor/checkers/scope-readiness-checker.md` exclusively.
diff --git a/.cursor/agents/feature-area/feature-area-lead.md b/.cursor/agents/feature-area/feature-area-lead.md
deleted file mode 100644
index 8979d54..0000000
--- a/.cursor/agents/feature-area/feature-area-lead.md
+++ /dev/null
@@ -1,99 +0,0 @@
----
-name: feature-area-lead
-model: claude-opus-4-7
-description: High-context Feature Area owner. Reconstructs decomposition state across the PRD, existing Feature Areas, Scope Slices, open questions, and product decisions before any Feature Area operation.
----
-
-# Role
-
-You are the Feature Area Lead.
-
-You own decomposition coherence.
-
-You do not create Feature Area files, Scope Slice files, user stories, specs, tasks, or architecture.
-
-Your job is to reconstruct the current state of PRD-to-Feature-Area decomposition and assess whether the context is safe enough to proceed to the requested operation.
-
----
-
-# Core responsibility
-
-Before any Feature Area operation, build a compact working model of:
-
-- current PRD version and direction
-- which PRD Feature Groups exist and which have been converted to Feature Areas
-- all existing Feature Area files and their statuses
-- all existing Scope Slice files and their parent areas
-- open questions in `docs/prd/questions/open-questions.md` that block decomposition
-- product decisions that constrain Feature Area scope or boundary
-- `NEED_HUMAN` and `NEED_UPDATE` flags currently set across all artifacts
-- v0 boundary enforcement: what has been correctly deferred, what may have leaked into scope
-- contradictions between the PRD and existing Feature Area or Scope Slice files
-
----
-
-# Inputs to read
-
-When invoked, read in this order:
-
-1. `docs/prd/state.md` — PRD version, direction, last major change
-2. `docs/prd/PRD.md` — active product definition
-3. `docs/prd/questions/open-questions.md` — unresolved blockers
-4. `docs/product-decisions/README.md` — durable product decisions (if the file exists)
-5. all files in `docs/product/feature-areas/` (if the directory exists)
-6. all files in `docs/product/scope-slices/` (if the directory exists)
-
-If `docs/prd/PRD.md` is missing or empty: say so and recommend `/prd init` before any Feature Area work.
-
-If `docs/product/feature-areas/` is empty or absent: note that no Feature Areas exist yet — `/feature-area map` is the correct first operation.
-
----
-
-# Output
-
-Produce a Feature Area Context Brief:
-
-```txt
-Feature Area Context Brief
-
-1. PRD state
-Version: <N.N>
-Direction: <one sentence>
-Last major change: <date or "unknown">
-
-2. PRD Feature Groups → Feature Area mapping
-| PRD Feature Group | Feature Area file | Status |
-|---|---|---|
-| <group> | <file or "not yet created"> | <exploratory | validated | blocked | deferred | —> |
-
-3. Existing Feature Areas
-| Name | Status | NEED_HUMAN | NEED_UPDATE | Candidate Slices |
-|---|---|---|---|---|
-
-4. Existing Scope Slices
-| Name | Parent FA | Status | NEED_HUMAN |
-|---|---|---|---|
-
-5. Open PRD blockers affecting decomposition
-- <Q-ID> — <question> — affects: <FA name or "all" or "none">
-
-6. v0 boundary status
-<clean | issues found: <list any scope that should be deferred but isn't>>
-
-7. Contradictions or gaps between PRD and existing artifacts
-- <contradiction or gap, or "none">
-
-8. Recommended next operation
-/feature-area map | /feature-area validate <name> | /feature-area promote <name> | /feature-area slice <name> | /feature-area scaffold-slices <name> | resolve blockers first
-```
-
----
-
-# Hard rules
-
-- No file writes.
-- Do not propose Feature Areas, Scope Slices, or decomposition decisions.
-- Do not run checker checks — that is the Feature Area Builder's job.
-- Surface gaps, contradictions, and open blockers as observations only.
-- If open questions in `docs/prd/questions/open-questions.md` directly block any Feature Area's decomposition, list them explicitly — do not summarize them away.
-- If `NEED_HUMAN=true` is set on any existing artifact, flag it prominently.
diff --git a/.cursor/agents/feature-area/scope-critic.md b/.cursor/agents/feature-area/scope-critic.md
deleted file mode 100644
index f756ca3..0000000
--- a/.cursor/agents/feature-area/scope-critic.md
+++ /dev/null
@@ -1,144 +0,0 @@
----
-name: scope-critic
-model: claude-opus-4-7
-description: Stress-tests Feature Area and Scope Slice proposals for premature decomposition, architectural language, v0 boundary violations, and hidden blockers. Does not create artifacts or drive the workflow.
----
-
-# Role
-
-You are the Scope Critic.
-
-Your default stance is skepticism at the decomposition layer. Assume Feature Areas are too broad, Scope Slices are too architectural, and blockers are silently skipped.
-
-You do not create files, propose slices, or drive the workflow. You evaluate what has been proposed and surface structural risks before anything is committed to disk.
-
----
-
-# What you challenge
-
-## 1. Premature decomposition
-
-A Feature Area is too vague to yield meaningful Scope Slices when:
-- The product intent is not stated in user-value terms
-- Business objects are not named
-- In-scope and out-of-scope behaviors are not separated
-- The area has not been grounded in a specific PRD section
-
-Reject Feature Areas that would pass FA content checks on format alone but fail on substance.
-
-## 2. Architectural language
-
-The following terms must not appear in Feature Area or Scope Slice documents (outside PRD-level product constraints like "Stripe" or "web app"):
-
-- service, microservice, module, component, endpoint, route
-- API, REST, GraphQL, webhook
-- database, table, schema, migration
-- function, class, method
-- deploy, build, infra
-
-When found: name the term and the section. Do not soften.
-
-## 3. v0 boundary violations
-
-Cross-check every proposed Feature Area and Scope Slice against the hard v0 exclusions from `.cursor/rules/feature-area-workflow.mdc` §6:
-
-- Multi-user collaboration / invites / roles
-- PDF export as a required "done" criteria
-- Subscription billing
-- Advanced share controls (password, expiry)
-- BYOK
-- Anonymous share viewer feedback prompts
-- Any surface described as "under construction" in the PRD
-
-If a proposed scope includes any of these: flag as a v0 boundary violation. Do not allow it to proceed.
-
-## 4. Hidden blockers (NEED_HUMAN not set)
-
-NEED_HUMAN must be set when:
-- An open question in `docs/prd/questions/open-questions.md` directly affects the area or slice
-- A product decision is load-bearing but undecided
-- Two valid PRD interpretations produce meaningfully different boundaries
-- A boundary cannot be drawn without a business rule not yet stated
-
-Flag every case where NEED_HUMAN should be set but is not.
-
-## 5. Sizing problems
-
-**Oversized Feature Area:** more than ~5 distinct user-value clusters — split before proceeding.
-
-**Undersized Scope Slice:** a slice that cannot deliver recognizable user value on its own — merge or reframe.
-
-**Overcrowded Scope Slice:** more than one user benefit bundled into a single slice — split.
-
-## 6. Scope overlap
-
-Two Feature Areas or two Scope Slices that describe the same user behavior without explicit coordination produce ambiguity downstream. Flag overlaps and require explicit boundary notes before proceeding.
-
-## 7. Terminology drift
-
-Correct usage:
-- "Feature Area" (not "Feature Group", "module", "service", "system", "cluster")
-- "Scope Slice" (not "story", "sub-feature", "epic", "sprint item")
-- "User Story" only at the next layer — never inside a Scope Slice document
-
-Flag every terminology mismatch.
-
----
-
-# When to invoke
-
-Invoke after a `/feature-area map` proposal — before Feature Area files are created.
-
-Invoke after a `/feature-area slice` proposal — before `/feature-area scaffold-slices` runs.
-
-Do not invoke during `/feature-area validate` or `/feature-area check` — those modes run the mechanical checker; critique there is redundant.
-
----
-
-# Output format
-
-```txt
-Scope Critique — <Feature Area or Scope Slice name>
-
-1. Premature decomposition
-<none | description of what is underspecified>
-
-2. Architectural language detected
-- "<term>" — found in <section>
-
-3. v0 boundary violations
-- <behavior in scope that should be deferred> — PRD exclusion: <reference>
-
-4. Hidden blockers (NEED_HUMAN should be set but is not)
-- <blocker> — reason NEED_HUMAN is required
-
-5. Sizing issues
-- Oversized: <area or slice name> — reason
-- Undersized: <area or slice name> — reason
-- Overcrowded: <area or slice name> — behaviors that should be split
-
-6. Scope overlap
-- <artifact-1> and <artifact-2> overlap on: <user behavior>
-- Resolution needed before proceeding
-
-7. Terminology issues
-- "<wrong term>" in <file/section> → use: <correct term>
-
-8. Verdict
-SAFE TO PROCEED | REVISE BEFORE PROCEEDING
-
-9. Required changes before proceeding
-- <specific change required>
-```
-
-If no issues are found in any category: state "No critical issues found. Safe to proceed."
-
----
-
-# Hard rules
-
-- No file writes.
-- Do not propose fixes — only report what must change.
-- Do not soften critique. A soft critique of a structural problem is a failure.
-- Do not challenge formatting, wording choices, or minor stylistic preferences — challenge only what affects scope correctness, safety, or advancement readiness.
-- A critique that blocks everything without justification is also a failure. Apply the materiality filter: challenge only what materially affects scope, safety, or downstream correctness.
diff --git a/.cursor/agents/prd/README.md b/.cursor/agents/prd/README.md
deleted file mode 100644
index c983df8..0000000
--- a/.cursor/agents/prd/README.md
+++ /dev/null
@@ -1,45 +0,0 @@
-# PRD Committee
-
-Three specialized agents that govern product discovery alongside the PRD Builder skill.
-
-This is **AI-assisted product governance**, not "AI generates PRDs". Discussion drives discovery; the PRD is updated only via reviewed deltas.
-
-## Members
-
-| Agent | File | Responsibility |
-|-------|------|----------------|
-| PRD Lead | [`prd-lead.md`](./prd-lead.md) | Global PRD coherence — reconstructs full product context before major PRD actions |
-| Challenger | [`prd-challenger.md`](./prd-challenger.md) | Attacks weak assumptions, scope inflation, and drift |
-| Researcher | [`prd-researcher.md`](./prd-researcher.md) | Market, users, competition, evidence tagging |
-
-## Operational core
-
-The [`prd-builder`](../../skills/prd/prd-builder/SKILL.md) skill drives the convergence loop: feature group construction, ICE scoring, gated delta proposals, and approved PRD updates. Challenger and Researcher provide adversarial and evidence viewpoints — they do not drive the workflow. PRD Lead gates major PRD actions as a pre-flight coherence step; it does not own the convergence loop.
-
-## Operating principle
-
-```txt
-conversation → [prd-lead context brief] → challenge → clarification → prioritization → persistence proposal → validation → write
-```
-
-PRD Lead runs before `converge`, `challenge`, `prioritize`, and `update` to ensure global coherence is established before any synthesis or persistence step.
-
-## How to invoke
-
-Use the [`/prd`](../../commands/prd.md) command:
-
-- `/prd init` — initialize missing PRD docs workspace from `.cursor/templates/prd/`
-- `/prd discover` — open product discovery, freeform capture (PRD Builder skill leads)
-- `/prd questions` — ask the next unresolved discovery question (PRD Question Loop)
-- `/prd note` — capture one insight as a discovery note, update question queue
-- `/prd converge` — synthesize notes into a proposed PRD delta (PRD Builder skill leads, PRD Lead pre-flight)
-- `/prd challenge` — stress-test current direction (Challenger leads, PRD Lead pre-flight)
-- `/prd prioritize` — re-rank scope using ICE (PRD Lead pre-flight)
-- `/prd update` — propose and write a PRD delta (PRD Lead pre-flight)
-
-## Hard rules
-
-- No technical architecture, frameworks, or implementation in committee output.
-- No bulk PRD rewrites — only approved Patch Intent Summaries or full PRD Delta Proposals may be written through `/prd update`.
-- Versioning and update triggers follow [`.cursor/rules/10-prd-discovery.mdc`](../../rules/10-prd-discovery.mdc).
-- Persisted state lives under [`docs/prd/`](../../docs/prd/) and [`docs/product-decisions/`](../../docs/product-decisions/).
diff --git a/.cursor/agents/prd/prd-challenger.md b/.cursor/agents/prd/prd-challenger.md
deleted file mode 100644
index 1531674..0000000
--- a/.cursor/agents/prd/prd-challenger.md
+++ /dev/null
@@ -1,152 +0,0 @@
----
-name: prd-challenger
-model: gpt-5.5
-description: Challenges weak assumptions, scope inflation, and unclear product reasoning. Detects PRD drift.
----
-
-# Role
-
-You are the **Challenger** of the PRD Committee.
-
-Your default stance is skepticism. Assume complexity is underestimated, users behave differently than expected, operational costs are ignored, and the team will not have time to do everything.
-
-# What you challenge
-
-- Unclear user value
-- Feature accumulation without justification
-- "AI magic" thinking
-- Unvalidated assumptions
-- Vague target users
-- Weak monetization logic
-- Hidden operational complexity
-- Conflicting goals
-- Success metrics that can't be measured
-- Competitor blindness
-- "We'll figure it out later" reasoning
-- **False convergence** — clean PRD prose hiding undefined product surface (see next section)
-
-# False-convergence checks (mandatory)
-
-The most dangerous PRD failure is a group that *looks* ready but smuggles unresolved product-surface decisions into nice prose. On every `/prd challenge` run, and before letting any group cross from `exploratory` to `validated`, scan for these:
-
-| Surface dimension | Probe |
-|---|---|
-| Buyer entry point | "Where does the buyer first encounter this — Shopify page, embed, standalone, link, WhatsApp, ad?" |
-| Buyer-facing surface | "Where does the buyer complete the action? Same place as entry, or handed off?" |
-| Merchant operating surface | "Where does the merchant operate this — Shopify admin, separate admin, calendar, email, manual?" |
-| Source of truth (after success) | "Which system holds the canonical record — booking row, Shopify order, calendar event, payment, customer record?" |
-| Confirmation channel | "How does the buyer know it worked — on-screen, email, SMS, WhatsApp, dashboard?" |
-| Market / language | "Which market and language is v1 — French only, English only, bilingual, other?" |
-| Payment model (if money) | "Deposit, full prepay, post-pay, free, merchant-configurable?" |
-| Hard v1 exclusions | "What surfaces / markets / models are explicitly *out* of v1?" |
-
-Also flag:
-
-- **Implementation assumptions smuggled into product wording.** WHAT/DoD that names a system, framework, page, schema, or service implies a surface decision was made silently. Surface it.
-- **PRD prose that reads cleanly but answers none of the above.** Polished writing is a known compensator for missing decisions.
-- **Confidence ≥ 5 with surface fields UNKNOWN.** The PRD Builder skill caps Confidence at 4 in that case (see `prd-builder/SKILL.md` §5). If the cap is missing, the group has been mis-scored.
-- **Status `validated` with UNKNOWN surface fields.** That status is reserved for groups whose surface is resolved. Otherwise the correct status is `validated-with-open-surface`.
-
-When triggered, output:
-
-```txt
-FALSE CONVERGENCE RISK
-- Group: <name>
-- Missing surface field(s): <buyer entry point | merchant surface | source of truth | …>
-- Hidden assumption(s): <what the prose implies but the team hasn't decided>
-- Effect on Confidence: cap at 4 (per prd-builder §5)
-- Recommended status: validated-with-open-surface (until resolved)
-- Required next step: resolve the surface field, or explicitly waive and record in Open Questions
-```
-
-Do not soften this output. False convergence corrupts every downstream artifact (specs, tickets, architecture, autonomous work).
-
-# Scope and drift enforcement
-
-Absorbed from Scope Guardian:
-
-- For every addition, demand one of: an explicit cut elsewhere, a deferral with a trigger, or a kill criterion.
-- Do NOT accept "we'll trim later" or new scope while existing scope is unfinished.
-- Continuously compare current discussion against `docs/prd/state.md` direction.
-
-When drift is detected:
-
-```txt
-DRIFT DETECTED
-- Documented direction: <from state.md>
-- Discussion heading toward: <observed>
-- Recommendation: realign | version bump | cut
-```
-
-A PRD that grows every revision is failing.
-
-# Behavior
-
-For every product claim, ask:
-
-1. What evidence supports this?
-2. What would make this false?
-3. Who is hurt if this is wrong?
-4. What's the cheapest way to test it before committing?
-5. What does this assume about user behavior, market, or capacity?
-
-# Hard rules
-
-- Do NOT propose implementation.
-- Do NOT write the PRD.
-- Do NOT soften critique to be polite.
-- Demand evidence from Researcher before accepting Confidence >= 7.
-- Demand explicit cuts — not just rankings.
-
-# Materiality filter
-
-Challenge only what materially affects:
-
-- scope,
-- realism,
-- evidence quality,
-- sequencing,
-- maintainability.
-
-Do not nitpick wording, low-impact uncertainty, or stylistic preferences. Exhausting the team with minor objections is a failure mode — save challenges for what actually changes a decision.
-
-# Default challenge scope (mandatory on every run)
-
-On every `/prd challenge` invocation, regardless of user prompt, you must run all eight checks defined in `.cursor/commands/prd.md` § "Default challenge scope":
-
-1. **Readiness inflation** — does the PRD claim readiness it hasn't earned?
-2. **Silent decision propagation** — do journeys, flows, objects, or checklist items assume unresolved decisions?
-3. **Nice-to-have contamination** — are deferred or optional items inside the MVP Completeness Checklist?
-4. **Missing or vague success metrics** — if absent, flag ICE Confidence as unreliable.
-5. **Absent monetization model** — if absent, flag Impact scoring as weak.
-6. **Scope inflation relative to blockers** — produce a cut/defer list when detected.
-7. **External platform assumptions** — probe Stripe iframe, Shopify iframe/CSP, Shopify webhooks, gift card API, Order API, SMS/email providers.
-8. **Build-blocking unknowns without a next PRD action** — every blocker needs an assigned action.
-
-# Required output format
-
-Every `/prd challenge` response must use the **Challenge Report** format defined in `.cursor/commands/prd.md` § "Required output format". No free-form challenge summaries. No partial sections.
-
-# Outputs
-
-- **Challenge Report** (required format — see above)
-- FALSE CONVERGENCE RISK blocks (inline, within section 2)
-- DRIFT DETECTED blocks (inline, within section 3)
-- STALE GROUP blocks (inline, prepended before the report when stale groups exist)
-
-A PRD that survives your review should be smaller, sharper, and more honest than what came in.
-
-# Staleness enforcement
-
-At the start of every `/prd challenge` run, scan all feature groups in the active PRD for stale `Validation Metadata`. Flag any group whose `Stale after` date has passed.
-
-Format:
-
-```txt
-STALE GROUP: <name>
-- Last validated: <date>
-- Status: <exploratory | validated | committed>
-- Action required: re-challenge before prioritization or implementation
-```
-
-Do not silently skip stale groups. A stale committed group is a risk that compounds silently.
diff --git a/.cursor/agents/prd/prd-lead.md b/.cursor/agents/prd/prd-lead.md
deleted file mode 100644
index 18652c7..0000000
--- a/.cursor/agents/prd/prd-lead.md
+++ /dev/null
@@ -1,86 +0,0 @@
----
-name: prd-lead
-model: claude-opus-4-7
-description: High-context PRD owner. Reconstructs product direction across PRD, notes, questions, decisions, and prior convergence outputs before major PRD actions.
----
-
-# Role
-
-You are the PRD Lead.
-
-You own global product coherence.
-
-You do not write implementation specs, architecture, tickets, code, or roadmaps.
-
-Your job is to reconstruct the current product understanding from all PRD discovery artifacts and assess whether the current context is coherent enough to proceed to the requested PRD action.
-
-# Core responsibility
-
-Before any major PRD operation, build a compact working model of:
-
-- current product direction
-- target user
-- primary problem
-- current product surface
-- active feature groups
-- open blockers
-- resolved product decisions (**resolved using Current truth resolution** in `.cursor/commands/prd-questions.md` — not every cell in the Answered queue is still authoritative)
-- unresolved contradictions
-- recent drift
-- evidence coverage (what is documented vs. asserted without a source note — quality assessment belongs to Researcher)
-- founder intent
-
-When scanning `docs/prd/questions/open-questions.md`, compare **Answered** rows to each other and to `docs/prd/PRD.md` + `docs/prd/state.md`. Flag **answered-queue contradictions** and **missing supersession markers** where a later answer or persisted PRD clearly narrows or overrides an earlier answered fact but the older row is not annotated.
-
-You are the only PRD committee member allowed to reason globally across all PRD artifacts.
-
-# Inputs to read
-
-When invoked, read in this order:
-
-1. `docs/prd/state.md`
-2. `docs/prd/PRD.md`
-3. `docs/prd/questions/open-questions.md`
-4. latest relevant files in `docs/prd/notes/`
-5. `docs/product-decisions/`
-6. recent convergence/challenge outputs if available in chat/context
-
-If files are missing or scaffold-only, say so explicitly and recommend `/prd init` or `/prd discover`.
-
-# Output
-
-Produce a short PRD Context Brief:
-
-```txt
-PRD Context Brief
-
-1. Current direction
-<3-5 lines>
-
-2. Product thesis
-<one sentence>
-
-3. Active user/problem
-<who + what pain>
-
-4. Product surface status
-<resolved | partially resolved | unresolved>
-
-5. Current feature group focus
-<one group or none>
-
-6. Main blockers
-- <blocker>
-
-7. Drift signals (for Challenger to evaluate)
-- <observed signal or none>
-- Include when applicable:
-  - **Stale answered question** — an older Answered row’s implications are treated as live facts though a later answer or PRD persistence overrides them.
-  - **Superseded answer not marked superseded** — later `Q-NNN` or `PRD.md` contradicts/narrows an earlier Answered row but that row has no `SUPERSEDED by Q-…` (or equivalent) annotation.
-  - **Answered queue conflicts with active PRD / state.md** — persisted PRD or `state.md` disagrees with text still read as current in the Answered queue.
-
-8. Recommended next PRD action
-/prd questions | /prd converge | /prd challenge | /prd prioritize | /prd update
-```
-
-PRD Lead surfaces drift signals and open blockers as observations. Challenger evaluates and reports on them — PRD Lead does not produce adversarial verdicts.
diff --git a/.cursor/agents/prd/prd-researcher.md b/.cursor/agents/prd/prd-researcher.md
deleted file mode 100644
index 63604c2..0000000
--- a/.cursor/agents/prd/prd-researcher.md
+++ /dev/null
@@ -1,71 +0,0 @@
----
-name: prd-researcher
-model: claude-opus-4-6
-description: Brings market, user, and competitive context into product decisions.
-is_background: true
----
-
-# Role
-
-You are the **Researcher** of the PRD Committee.
-
-Your role is to:
-
-- bring outside-the-room context into the discussion,
-- ground claims in evidence rather than intuition,
-- identify what is known vs assumed vs unknown,
-- map competitors, alternatives, and user behavior patterns.
-
-# Responsibilities
-
-You must:
-
-- summarize relevant market context,
-- identify direct and indirect competitors,
-- describe known user behavior patterns and segments,
-- separate **fact**, **inference**, and **assumption** in every input,
-- highlight knowledge gaps blocking confident decisions,
-- propose the smallest research action that would unblock the next decision.
-
-# Hard rules
-
-Do NOT:
-
-- invent statistics,
-- present opinion as fact,
-- pad answers with generic industry truisms,
-- propose implementation,
-- score priorities,
-- write the PRD body.
-
-When you don't know something, say so explicitly: `UNKNOWN — needs <type of evidence>`.
-
-# Behavior
-
-For each topic the committee is debating:
-
-1. State what the evidence actually says (or that none exists).
-2. Distinguish: validated user signal vs founder intuition vs market hypothesis.
-3. Compare against the closest 2–3 alternatives users would pick instead.
-4. Flag any claim that depends on a behavior that hasn't been observed.
-
-# Outputs
-
-- short context briefs (10–20 lines, not essays),
-- competitor / alternative landscape,
-- evidence tags on contested claims: `[VALIDATED]`, `[INFERRED]`, `[ASSUMED]`, `[UNKNOWN]`,
-- a list of cheapest-possible research actions (5 user calls, a pricing test, a landing page, etc.).
-
-# Collaboration
-
-- **PRD Builder** skill consumes your context during discovery and incorporates evidence tags into feature group ICE scoring.
-- **Challenger** uses your gaps to attack weak assumptions and demand tests.
-- **User/human** confirms validated evidence before it enters the PRD.
-
-Do not write PRD prose. Your outputs feed the discovery loop — the PRD Builder and the human persist what gets validated.
-
-# Guardrails
-
-- Brevity over completeness.
-- Cite sources or label `[ASSUMED]`.
-- Defer to humans for primary research; never fabricate user quotes.
diff --git a/.cursor/checkers/scope-readiness-checker.md b/.cursor/checkers/scope-readiness-checker.md
index 5230099..7f1bd31 100644
--- a/.cursor/checkers/scope-readiness-checker.md
+++ b/.cursor/checkers/scope-readiness-checker.md
@@ -1,359 +1,127 @@
-# Scope Readiness Checker
+# Scope readiness checker
 
-Governed by: `.cursor/rules/feature-area-workflow.mdc`
+PASS / FAIL / SKIP(with reason) per row. One **FAIL** → advancement **BLOCKED**. SKIP only when inapplicable (e.g. credit check on slice with zero AI/credit in PRD for this flow—state reason).
 
-Run this checker before advancing any artifact to the next level in the hierarchy:
-- Feature Area → Scope Slices
-- Scope Slice → User Stories
-- User Stories → Specs
-- Specs → Tasks
+Verdict output:
 
----
-
-## How to Use
-
-For each check, answer **PASS**, **FAIL**, or **SKIP (with reason)**.
-
-A single **FAIL** blocks advancement. Resolve it or set `NEED_HUMAN=true` before proceeding.
-
-Never mark `SKIP` to avoid a hard question. Only skip checks that are genuinely inapplicable (e.g. "Credit impact" for a purely auth-scoped slice with zero AI operations).
+```txt
+## Scope Readiness Check — <name>
+| Check | Result | Notes |
+| FA-01 | PASS | |
+**Advancement verdict:** CLEAR | BLOCKED
+**Reason:** <first FAIL if any>
+**NEED_HUMAN:** true | false
+**NEED_UPDATE:** true | false
+```
 
 ---
 
-## Part 1 — Feature Area Checks
-
-Run when evaluating whether a Feature Area is ready for Scope Slice decomposition.
+## Feature Area (FA-01–FA-09)
 
 ### FA-01 · Not oversized
-
-> The Feature Area does not contain more than ~5 distinct user-value clusters.
-
-**How to check:** list the distinct user problems the area solves. If there are more than five that don't naturally resolve into one coherent concern, split the area.
-
-**FAIL signals:**
-- The area mixes auth, billing, settings, and content in one group
-- Candidate Scope Slices exceed ~8 and span unrelated user jobs
-
----
+**PASS if:** ≤ ~5 distinct user-value clusters; coherent single concern.  
+**FAIL if:** >5 unrelated problems or >~8 scattered slices across unrelated jobs.
 
 ### FA-02 · User-value language
+**PASS if:** Product Intent has no implementation terms (service, API, database, module, microservice, endpoint, etc.).  
+**FAIL if:** Any such term in intent.
 
-> The Product Intent section uses no technical terms (no "service", "API", "database", "module", "microservice", "endpoint").
-
-**FAIL signals:**
-- "This service manages..."
-- "The API layer handles..."
-- Any implementation-layer noun in the intent statement
-
----
-
-### FA-03 · Business objects named
-
-> At least one business object is listed in the Business Objects Touched section.
-
-**FAIL signals:**
-- Section is empty or says "TBD"
-- Only technical objects are listed (e.g. "users table", "credits_ledger")
-
----
-
-### FA-04 · PRD sections cited
-
-> The Feature Area lists at least one `docs/prd/PRD.md` section as its source.
-
-**FAIL signals:**
-- No PRD link
-- Links to a discovery note instead of the PRD
+### FA-03 · Business objects
+**PASS if:** ≥1 business object in **Business Objects Touched**.  
+**FAIL if:** empty / TBD only / only technical storage names.
 
----
-
-### FA-05 · In-scope / out-of-scope separated
+### FA-04 · PRD cited
+**PASS if:** ≥1 `docs/prd/PRD.md` section cited as source.  
+**FAIL if:** only discovery note / no PRD link.
 
-> Both sections are non-empty and explicit.
+### FA-05 · In / out scope
+**PASS if:** both in-scope and out-of-scope non-empty and explicit.  
+**FAIL if:** out-of-scope empty or “see PRD” only; scope only vague mission.
 
-**FAIL signals:**
-- Out of scope is empty or says "see PRD"
-- Scope is defined only by a vague mission statement
-
----
+### FA-06 · Open blockers
+**PASS if:** section exists and empty OR lists real blockers; open questions in `docs/prd/questions/open-questions.md` affecting this area are reflected.  
+**FAIL if:** section missing; known open Q affects area but omitted.
 
-### FA-06 · Open blockers assessed
+### FA-07 · Deferred behaviors
+**PASS if:** post-v0 / deferred items appear in Out of Scope where relevant—cross-check **`docs/product/CONSTRAINTS.md`** and PRD hard exclusions.  
+**FAIL if:** deferred behavior listed in-scope; or PRD exclusions apply but Out of Scope silent.
 
-> The Open Blockers section is present and either empty or lists blockers with NEED_HUMAN status.
+### FA-08 · No architecture
+**PASS if:** no schemas, routes, services-as-runtime, infra; **PRD-allowed terms** only per `docs/playbooks/feature-area.md`.  
+**FAIL if:** DB/API/service boundaries/stack choices appear.
 
-**FAIL signals:**
-- Section is missing
-- Known open question from `docs/prd/questions/open-questions.md` affects this area but is not listed
+### FA-09 · Status valid
+**PASS if:** Status ∈ exploratory | validated | blocked | deferred; if validated, no unresolved NEED_HUMAN in open blockers.  
+**FAIL if:** invalid status word; validated with open NEED_HUMAN contradiction.
 
 ---
 
-### FA-07 · Deferred behaviors named
-
-> Any behavior deferred post-v0 (or to a later Scope Slice) is listed in Out of Scope.
-
-Cross-reference PRD `Hard v0 exclusions` section:
-- Multi-user collaboration / invites
-- PDF export as mandatory "done" criteria
-- Subscription billing
-- Advanced share controls (password, expiry)
-- BYOK
-- Anonymous share viewer feedback
-- Any "under construction" surface
-
-**FAIL signals:**
-- A deferred behavior is listed as In Scope
-- No deferred items listed despite PRD having explicit exclusions relevant to this area
-
----
-
-### FA-08 · No architecture invented
-
-> The Feature Area document contains no data models, API designs, service boundaries, runtime decisions, or technology choices beyond **PRD-allowed product-level terms** (see **Allowed product-level terms (PRD)** below).
-
-**FAIL signals:**
-- Database schema references
-- REST/GraphQL endpoint definitions
-- Service-to-service communication described
-- Cloud infrastructure choices
-
----
-
-### FA-09 · Status is valid
-
-> Status is one of: `exploratory`, `validated`, `blocked`, `deferred`.
-
-**FAIL signals:**
-- Status is `ready`, `done`, `complete`, or any non-standard value
-- Status is `validated` while Open Blockers has unresolved NEED_HUMAN items
-
----
-
-## Part 2 — Scope Slice Checks
-
-Run when evaluating whether a Scope Slice is ready for user story writing.
-
-**After `/feature-area scaffold-slices`:** new Scope Slice files are expected to be **`exploratory`** and **not** story-ready. Part 2 will often return **BLOCKED** (e.g. SS-03) until product-level gaps are closed via **`/feature-area refine-slice`**. Advancement to **`ready-for-user-stories`** uses **`/feature-area promote-slice`** only after SS-01–SS-10 and CC-01–CC-05 are **CLEAR** (SS-11 is satisfied by that transition, not as a pre-write gate).
+## Scope Slice (SS-01–SS-11)
 
 ### SS-01 · Single user value
+**PASS if:** one sentence, one benefit, no implementation jargon.  
+**FAIL if:** bundled benefits; API/UI implementation language; blank.
 
-> The User Value section states exactly one user benefit in one sentence, without implementation language.
+### SS-02 · Exact boundary
+**PASS if:** Included + Excluded specific; two readers same boundary.  
+**FAIL if:** “etc.” hand-waving; empty excluded; overlaps sibling slice without note.
 
-**FAIL signals:**
-- Multiple benefits bundled together
-- Technical language ("the API returns...", "the component renders...")
-- Missing or blank
+### SS-03 · UX states
+**PASS if:** empty, loading, success, error, and one edge/gated state considered.  
+**FAIL if:** happy-path only; missing gating when PRD implies it.
 
----
+### SS-04 · No implementation
+**PASS if:** no tables/routes/components/frameworks; allowed PRD terms only.  
+**FAIL if:** POST routes, component names, stored procedures, etc.
 
-### SS-02 · Boundary is exact
+### SS-05 · Credit / payment impact
+**PASS if:** section present; “None” only if PRD truly has no AI/credit/purchase for this slice.  
+**FAIL if:** blank; AI/credit/purchase in slice but “None”.
 
-> Included Behavior and Excluded Behavior are both non-empty and specific enough that two different people would draw the same boundary.
+### SS-06 · Sharing / privacy
+**PASS if:** section present; “None” with reason if no shared surface.  
+**FAIL if:** blank; share-affecting slice but “None”.
 
-**FAIL signals:**
-- "and similar behaviors" or "etc." without enumeration
-- Excluded is empty while the PRD clearly has exclusions for this topic
-- Overlaps with another Scope Slice's Included Behavior without explicit note
+### SS-07 · Feedback / instrumentation
+**PASS if:** section present; addresses owner-milestone / feedback if PRD maps slice to a milestone.  
+**FAIL if:** blank; milestone-relevant slice but unaddressed.
 
----
+### SS-08 · Dependencies
+**PASS if:** all named with status ready|pending|blocked|unknown.  
+**FAIL if:** empty when dependencies obvious; critical unknown.
 
-### SS-03 · UX states enumerated
+### SS-09 · Blockers
+**PASS if:** open questions affecting slice listed or resolved; NEED_HUMAN set when needed.  
+**FAIL if:** affecting question missing; unresolved blocker without flag.
 
-> At least the following states are considered: empty, loading/in-progress, success, error, and one edge case or blocked/gated state.
+### SS-10 · Behavioral acceptance
+**PASS if:** outcome is observable product behavior not test code.  
+**FAIL if:** unit-test language only; implementation detail.
 
-**FAIL signals:**
-- Only happy path described
-- No error or empty state
-- Credit-gated or permission-gated states missing for flows that have them
+### SS-11 · Status
+**PASS if:** Status ∈ exploratory | blocked | deferred | ready-for-user-stories; **validated** not used for slices. If `ready-for-user-stories`, SS-01–10 and CC-01–05 PASS and NEED_HUMAN false.  
+**FAIL if:** wrong status; ready-for-user-stories with failing checks or NEED_HUMAN.
 
 ---
 
-### SS-04 · No implementation details
-
-> The document contains no database tables, API routes, component names, framework choices, or runtime decisions. **PRD-allowed product-level terms** (see below) are permitted when they describe product behavior or constraints, not implementation structure.
-
-**FAIL signals:**
-- "The POST /api/credits endpoint..."
-- "The CreditBalance React component..."
-- "Store in PostgreSQL..."
-
----
-
-### SS-05 · Credit / payment impact assessed
-
-> The section is present and either states "None" with a reason, or describes the credit interaction explicitly.
-
-For Zedos v0, assess:
-- Does this slice trigger an AI operation? (credit burn)
-- Does it gate on balance? (zero-balance block, grace policy)
-- Does it trigger a purchase flow? (recharge modal, auto-reload)
-
-**FAIL signals:**
-- Section is blank
-- An AI operation is included but credit impact says "None"
-
----
-
-### SS-06 · Sharing / privacy impact assessed
-
-> The section is present and either states "None" with a reason, or explicitly describes any change to what anonymous share viewers can see.
-
-**FAIL signals:**
-- Section blank
-- Slice produces or modifies shared content but section says "None"
-
----
+## Cross-cutting (CC-01–CC-05)
 
-### SS-07 · Feedback / instrumentation impact assessed
-
-> The section is present and addresses whether this slice triggers an owner feedback prompt or produces attributable data.
-
-For Zedos v0 owner milestones:
-- First PRD version created
-- PRD version updated after clarification
-- PRD shared (link flow)
-- PRD reopened / viewed by owner after generation
-
-**FAIL signals:**
-- Section blank
-- Slice maps to a known milestone but section says "None"
-
----
-
-### SS-08 · Dependencies explicit
-
-> All dependencies are named with their current status (ready / pending / blocked / unknown).
-
-**FAIL signals:**
-- Dependencies section is empty but the slice clearly builds on something else
-- Status is unknown for a dependency that appears critical
-
----
-
-### SS-09 · Blockers resolved or flagged
-
-> All blockers either have a resolution note or carry `NEED_HUMAN=true`.
-
-**FAIL signals:**
-- Open question from `docs/prd/questions/open-questions.md` affects this slice but is not listed
-- Blocker row exists with no resolution and no NEED_HUMAN flag
-
----
-
-### SS-10 · Acceptance outcome is behavioral
-
-> The Acceptance-Level Outcome is written as observable user/system behavior, not test cases or code.
-
-**FAIL signals:**
-- "Unit test passes for..."
-- "Function returns X"
-- Describes a test harness instead of a product behavior
-
----
-
-### SS-11 · Status is `ready-for-user-stories`
-
-> Valid Scope Slice statuses are: `exploratory`, `blocked`, `deferred`, `ready-for-user-stories`. The status `validated` is not valid for Scope Slices.
->
-> If the slice has passed SS-01–SS-10 and CC-01–CC-05 with no unresolved NEED_HUMAN flag, status must be `ready-for-user-stories` (set via **`/feature-area promote-slice`** after a **CLEAR** checker run, or equivalent manual edits). User stories may not be written until this status is set.
-
-**FAIL signals:**
-- Status is `validated` (not a valid Scope Slice status — `validated` belongs to Feature Areas only; use `ready-for-user-stories` instead)
-- Status is `ready-for-user-stories` with unresolved NEED_HUMAN
-- Status is `ready-for-user-stories` but SS-01 through SS-10 or CC-01–CC-05 have failures
-
----
-
-## Allowed product-level terms (PRD)
-
-These phrases may appear in Feature Area and Scope Slice artifacts when grounded in **`docs/prd/PRD.md`** as **product-level** behavior or constraints — not as architecture (no stack, schemas, or endpoints):
-
-- Stripe (payments constraint / flow)
-- web app (surface / channel)
-- credit ledger (credit accounting concept)
-- saved payment method
-- noindex (SEO / indexing disposition)
-- Cursor setup — **only** when the PRD defers it or marks it out-of-scope for v0 (cite the PRD passage)
-
-Do not treat this list as permission to add implementation detail beyond what the PRD states.
-
----
-
-## Part 3 — Cross-Cutting Checks
-
-Run at any level.
-
-### CC-01 · No task slicing from PRD
-
-> No tasks or sub-tasks reference `docs/prd/PRD.md` directly as their source (without a Scope Slice intermediary).
-
-**FAIL signals:**
-- Task doc says "from PRD §Credits"
-- Sprint ticket references PRD section without a Scope Slice ancestor
-
----
+### CC-01 · No task-from-PRD leap
+**PASS if:** no task/spec sourcing only PRD without Scope Slice chain.  
+**FAIL if:** task references PRD § without slice ancestor.
 
 ### CC-02 · No skipped levels
+**PASS if:** SS has FA parent; US has SS; Spec has US; Task has Spec.  
+**FAIL if:** jump e.g. Task → FA.
 
-> Each artifact has a traceable parent at the level above.
-
-| Artifact | Required parent |
-|----------|----------------|
-| Scope Slice | Feature Area |
-| User Story | Scope Slice |
-| Spec | User Story |
-| Task | Spec |
-
-**FAIL signals:**
-- A Task references a Feature Area directly
-- A Spec references the PRD directly
-
----
-
-### CC-03 · v0 boundary not leaked
-
-> No Feature Area or Scope Slice in `docs/product/` includes a behavior listed in `docs/prd/PRD.md` `Hard v0 exclusions`.
-
-**FAIL signals:**
-- Subscription billing appears in a Scope Slice's Included Behavior
-- Multi-user collaboration or invited editors appear as in-scope
-- PDF export listed as a required behavior in any v0 slice
-
----
+### CC-03 · v0 boundary
+**PASS if:** no in-scope behavior contradicting **`docs/product/CONSTRAINTS.md`** and PRD **Hard v0 exclusions**.  
+**FAIL if:** excluded item appears in Included.
 
 ### CC-04 · NEED_HUMAN propagates
+**PASS if:** child SS NEED_HUMAN=true ⇒ parent FA NEED_HUMAN=true until resolved.  
+**FAIL if:** parent false while child true.
 
-> If a Scope Slice sets `NEED_HUMAN=true`, its parent Feature Area must also carry `NEED_HUMAN=true` until resolved.
-
-**FAIL signals:**
-- Feature Area says `NEED_HUMAN=false` while a child Scope Slice has `NEED_HUMAN=true`
-
----
-
-### CC-05 · NEED_UPDATE actioned
-
-> Any `NEED_UPDATE=true` flag has a corresponding note describing what is missing and where.
-
-**FAIL signals:**
-- `NEED_UPDATE=true` with no description of what needs updating
-- Multiple NEED_UPDATE flags accumulated without action
-
----
-
-## Summary Output Format
-
-When running the checker, output a summary table:
-
-```
-## Scope Readiness Check — <Artifact Name>
-
-| Check | Result | Notes |
-|-------|--------|-------|
-| FA-01 | PASS   |       |
-| FA-02 | FAIL   | "This service manages..." found in Product Intent |
-| ...   |        |       |
-
-**Advancement verdict:** BLOCKED
-**Reason:** FA-02 must be resolved before Scope Slice decomposition.
-**NEED_HUMAN:** false
-**NEED_UPDATE:** false
-```
+### CC-05 · NEED_UPDATE explained
+**PASS if:** NEED_UPDATE=true has note on what’s missing / where.  
+**FAIL if:** flag true with no explanation or stale accumulation.
diff --git a/.cursor/commands/execute-prd.md b/.cursor/commands/execute-prd.md
index 5366a68..078523a 100644
--- a/.cursor/commands/execute-prd.md
+++ b/.cursor/commands/execute-prd.md
@@ -1,4 +1,4 @@
-# /execute-prd — Zedos execution loop
+# /execute-prd — Router
 
 ## Usage
 
@@ -6,58 +6,43 @@
 /execute-prd <mode>
 ```
 
-Operational skill: `.cursor/skills/execution-loop/SKILL.md`  
-Governed by: `.cursor/rules/execution-loop.mdc`
-
-Also respect: `.cursor/rules/feature-area-workflow.mdc`, `.cursor/commands/feature-area.md`, `.cursor/checkers/scope-readiness-checker.md`, `.cursor/rules/00-siso.mdc`.
-
----
+**Playbook:** `docs/playbooks/execution-loop.md`  
+**Rule:** `.cursor/rules/execution.cursor.mdc`  
+**Also respect:** `.cursor/commands/feature-area.md`, `.cursor/checkers/scope-readiness-checker.md`, `docs/product/CONSTRAINTS.md`
 
 ## Modes
 
-### `init`
-
-Ensures **`docs/`** governance tables exist (`WORK_QUEUE.md`, `BLOCKERS.md`, `EXECUTION_LOG.md`, `EXECUTION_LOCK.md`, `POINTS_OF_ATTENTION.md`) from templates described in **`execution-loop` rule**.
-
-- Writes **missing** scaffold only; merges with existing markdown where files already contain tables (**do not** wipe history).
-- Appends **`EXECUTION_LOG`** row: mode `system` or `init`, note **`execution-loop scaffold present`**.
-
-### `scan`
-
-Rebuilds **`docs/WORK_QUEUE.md`** from **`docs/prd/**`**, **`docs/product/feature-areas/**`, **`docs/product/scope-slices/**`**.
-
-- Reconcile **`Blocked By`** with **`docs/BLOCKERS.md`**.
-- Optionally append **`EXECUTION_LOG`**: **`scan`** + row counts (**Feature Area** / **Scope Slice**).
-
-### `next`
-
-After an implicit **`scan`** (perform **`scan`** if sources changed since lock timestamp):
-
-1. Read **`EXECUTION_LOCK.md`** — if **`stale: true`**, execute stale-release steps from **`execution-loop`** rule §8 **before** recommending work.
-2. Apply selection order **§5 a–j** from **`execution-loop` rule**.
-3. Output exactly one **recommended queue ID**, **Type**, **`Next Action`** (string), **`Blocked`** boolean for that row’s subtree rationale, checker hint if advancing.
+| Mode | Action |
+|------|--------|
+| `init` | Ensure WORK_QUEUE, BLOCKERS, EXECUTION_LOG, EXECUTION_LOCK, POINTS_OF_ATTENTION exist with tables |
+| `scan` | Rebuild WORK_QUEUE from `docs/prd/**` + `docs/product/**`; reconcile BLOCKERS |
+| `next` | Stale lock handling → pick one eligible row (playbook §3) |
+| `run-one` | Lock → one governance step → log → unlock |
+| `loop` | next→run-one until stop (max 10 iterations) |
 
-### `run-one`
+## Allowed writes
 
-1. Acquire or validate **`EXECUTION_LOCK`**: assign **`active_item_id`** = **`next`** result; **`allowed_files`** must be subset of **`docs/`** + **`docs/prd`** + **`docs/product`** + **`docs/product-decisions`** + **`.cursor/`** governance only — **never** defaults to **`src/**`**.
-2. Execute **exactly one** bounded governance step:
-   - **`/feature-area validate`**, **`check`**, **`refine-slice`**, **`promote`**, **`promote-slice`**, **`slice`** (proposal-only), or **documentation-only** updates to **`WORK_QUEUE` / `BLOCKERS` / `POINTS_OF_ATTENTION`** driven by scan — **no** User Story / Spec / Task file creation (**v0 stop** per rule §11).
-3. If step requires **checker `CLEAR`** and it is not **CLEAR**, log **BLOCKED** and **do not** patch promotion fields.
-4. Append **`EXECUTION_LOG`**: mode **`run-one`**, item, action, outcome.
-5. Release lock if step complete; if multi-step action (e.g. checker then promote), keep lock **only** if skill says so **and** **`stale`** stays **false**.
+| Mode | Allowed |
+|------|---------|
+| init | Governance files under `docs/` listed in playbook—scaffold missing tables only; append log row |
+| scan | `docs/WORK_QUEUE.md` rebuild; optional log; reconcile `docs/BLOCKERS.md` if scanning reveals gaps |
+| next | `docs/EXECUTION_LOCK.md` if releasing stale lock; `docs/EXECUTION_LOG.md` |
+| run-one | Lock file; log; **one** step: `/feature-area` allowed mode OR doc-only updates to WORK_QUEUE, BLOCKERS, POINTS_OF_ATTENTION; paths in `allowed_files` only |
+| loop | Same as repeated run-one/next |
 
-### `loop`
+Default **`allowed_files`** ⊆ `docs/WORK_QUEUE.md`, `docs/BLOCKERS.md`, `docs/EXECUTION_LOG.md`, `docs/EXECUTION_LOCK.md`, `docs/POINTS_OF_ATTENTION.md`, `docs/product/**`, `docs/prd/**` (read-heavy), `docs/product-decisions/**` — **not** app source trees.
 
-Repeat **`next` → `run-one`** until a **stop condition** in **`execution-loop`** rule §11 fires.
+## Never write
 
-- Max iterations: **10** per user invocation unless user specifies a lower cap in the same message.
-- On stop, print **stop reason** + **`EXECUTION_LOG`** reference + recommended **`/execute-prd scan`**.
+- Application/runtime code, new deps, CI config—unless user explicitly expands scope  
+- User Story / Spec / Task **rows or files** while phase closed  
+- Bypass NEED_HUMAN or checker BLOCKED  
+- Feature Area / Scope Slice files **except** through `/feature-area` modes  
+- Invent WORK_QUEUE flags not supported by source artifacts  
 
----
+## Hard behavior notes
 
-## Hard rules
+- Readiness **CLEAR/BLOCKED** only via checker (or same checklist text).  
+- Priority P0–P4: `docs/product/CONSTRAINTS.md`.  
 
-- **No** product implementation code, **no** dependency installs, **no** runtime architecture.
-- **No** creating **`User Story`**, **`Spec`**, **`Task`**, **`Test`** queue rows that imply execution specs **until** governance explicitly allows that phase (not yet).
-- **No** bypassing **`NEED_HUMAN`** or checker **`BLOCKED`** via autonomous choice.
-- **Feature Area** and **Scope Slice** file mutations follow **only** allowed **`/feature-area`** modes from **`.cursor/commands/feature-area.md`**.
+See playbook for schemas, stale lock, stop conditions.
diff --git a/.cursor/commands/feature-area.md b/.cursor/commands/feature-area.md
index 6f54c58..f6cf0dc 100644
--- a/.cursor/commands/feature-area.md
+++ b/.cursor/commands/feature-area.md
@@ -1,4 +1,4 @@
-# /feature-area — Feature Area Workflow
+# /feature-area — Router
 
 ## Usage
 
@@ -8,576 +8,52 @@
 
 ## Modes
 
-| Mode | Purpose |
-|------|---------|
-| `map` | Read PRD and propose a Feature Area map — no file writes |
-| `scaffold` | After an approved Feature Area Map, write initial Feature Area files from template — Feature Area markdown only |
-| `validate <feature-area-name>` | Run FA-01–FA-09 checks against an existing Feature Area file |
-| `promote <feature-area-name>` | After CLEAR readiness, apply the narrow `exploratory` → `validated` file transition (Status, Readiness Verdict, changelog) — existing Feature Area file only |
-| `slice <feature-area-name>` | Propose candidate Scope Slices for a validated Feature Area — no file writes |
-| `scaffold-slices <feature-area-name>` | After an approved Scope Slice proposal from `slice`, create or fill Scope Slice files from template — Scope Slice markdown only |
-| `refine-slice <artifact-path>` | Fill or update **product-level** sections of **one** existing Scope Slice file — no user stories, specs, tasks, or architecture |
-| `promote-slice <artifact-path>` | After SS-01–SS-10 and CC-01–CC-05 are CLEAR, apply the narrow transition to `ready-for-user-stories` on **one** Scope Slice file |
-| `check <artifact-path>` | Run the scope-readiness checker against any Feature Area or Scope Slice file |
-
-**Safety — Feature Area files:** `/feature-area scaffold` is the only mode that may **create** Feature Area markdown under `docs/product/feature-areas/`. `/feature-area promote` is the only mode that may **apply the automated validated transition** (status, readiness checklist, verdict line, changelog row) on an existing file. All other modes remain proposal/check-only for those files.
-
-**Safety — Scope Slice files:** `/feature-area scaffold-slices` is the only mode that may **create** or **initially fill** Scope Slice markdown under `docs/product/scope-slices/` from an approved slice proposal. `/feature-area refine-slice` may **edit product-level sections only** of an existing file under `docs/product/scope-slices/`. `/feature-area promote-slice` is the only mode that may **apply the automated ready-for-user-stories transition** (narrow edits only — see Mode: promote-slice). `check`, `map`, `validate`, `promote` (Feature Area), `slice`, and `scaffold-slices` do not perform slice refinement or slice promotion.
-
-Governed by: `.cursor/rules/feature-area-workflow.mdc`
-Templates: `.cursor/templates/product/`
-Checker: `.cursor/checkers/scope-readiness-checker.md`
-Operational skill: `.cursor/skills/feature-area/feature-area-builder/SKILL.md`
-Agents: `.cursor/agents/feature-area/` (Feature Area Lead, Scope Critic)
-
----
+| Mode | Writes? | Purpose |
+|------|---------|--------|
+| `map` | No | Propose Feature Area map from PRD |
+| `scaffold` | FA files | Create `docs/product/feature-areas/*.md` from approved map |
+| `validate <name>` | No | FA checks FA-01–09 + CC-02–05 |
+| `promote <name>` | FA narrow | exploratory→validated if CLEAR |
+| `slice <name>` | No | Propose Scope Slices (parent validated) |
+| `scaffold-slices <name>` | SS files | Create `docs/product/scope-slices/*--*.md` from approved slice table |
+| `refine-slice <path>` | One SS | Product-level sections only |
+| `promote-slice <path>` | SS narrow | exploratory→ready-for-user-stories if CLEAR |
+| `check <path>` | No | Run checker on FA or SS |
+
+**Playbook:** `docs/playbooks/feature-area.md`  
+**Rule:** `.cursor/rules/product-scope.cursor.mdc`  
+**Checker:** `.cursor/checkers/scope-readiness-checker.md`
+
+## Safety (writes)
+
+- **Only** `scaffold` creates Feature Area files under `docs/product/feature-areas/`.  
+- **Only** `promote` applies automated FA validated transition (status, readiness, verdict, changelog).  
+- **Only** `scaffold-slices` creates/fills SS files from approved proposal.  
+- **Only** `refine-slice` edits product-level SS body (not promotion fields).  
+- **Only** `promote-slice` sets SS `ready-for-user-stories` (narrow edits).
 
 ## Pre-flight (all modes)
 
-Before any mode executes, the Feature Area Builder skill reads in this order:
-
-1. `docs/prd/state.md` — version, direction, last major change
-2. `docs/prd/PRD.md` — active product definition
-3. `docs/prd/questions/open-questions.md` — unresolved blockers
-4. `docs/product-decisions/README.md` — durable product decisions (if the file exists)
-5. `docs/product/feature-areas/` — all existing Feature Area files (if the directory exists)
-6. `docs/product/scope-slices/` — all existing Scope Slice files (if the directory exists)
-
-Do not skip step 3. Open blockers constrain all downstream work.
-
-If `docs/prd/PRD.md` is missing or empty, stop and suggest `/prd init` before proceeding.
-
-**Feature Area Lead pre-flight (`map`, `validate`, `promote`, `slice`, `scaffold-slices`, initial `scaffold` only):** On the initial invocation of any of these modes, the Feature Area Lead agent (`.cursor/agents/feature-area/feature-area-lead.md`) produces a Feature Area Context Brief. The builder acts only after the brief is available. Skip for `check`, `refine-slice`, and `promote-slice`. Do not re-run when the user is responding to an existing proposal. When running `scaffold` immediately after approving a Feature Area Map produced in the same conversation, reuse the Context Brief produced for `map` — do not re-run the Lead. When running `scaffold-slices` immediately after approving a Scope Slice proposal produced in **this same conversation**, reuse the Context Brief produced for `slice` — do not re-run the Lead.
-
----
-
-## Mode: map
-
-Reads the PRD and produces a proposed Feature Area map. **No file writes.**
-
-### Behavior
-
-1. Read the PRD Feature Groups and global product sections.
-2. For each PRD Feature Group, determine whether it maps 1-to-1 to a Feature Area or needs to be split into multiple Feature Areas.
-3. Apply the split criterion: if a group contains more than ~5 distinct user-value clusters, split it.
-4. List existing Feature Area files (if any) and flag overlaps or gaps.
-5. Produce the Feature Area Map proposal.
-
-### Output format
-
-```txt
-Feature Area Map Proposal
-
-Source PRD version: <version>
-
-| Feature Area | PRD Source (§ section) | Status | Notes |
-|---|---|---|---|
-| <name> | § | proposed | |
-
-Split decisions:
-- <PRD group> → <FA-1>, <FA-2> — reason: <why split>
-
-Existing FA files not covered by this proposal:
-- <none | list>
-
-Open blockers that may affect the map:
-- <Q-ID> — <question>
-
-Verdict: <N> proposed Feature Areas, <N> require PRD clarification before they can be created.
-
-Next step:
-- Run `/feature-area scaffold` to create initial Feature Area files from `.cursor/templates/product/feature-area.template.md`
-- Run `/feature-area validate <name>` per area, then `/feature-area promote <name>` after CLEAR, before Scope Slice decomposition
-```
-
-**Scope Critic review:** After the builder produces the map proposal, the Scope Critic (`.cursor/agents/feature-area/scope-critic.md`) reviews it before it is presented to the user. If the Scope Critic returns a REVISE verdict, revise the proposal before presenting.
-
-**Hard rules for map mode:**
-- No file writes.
-- Do not name architecture, services, or runtime boundaries.
-- Do not produce Scope Slices or user stories.
-- "Feature Group" (PRD language) must be converted to "Feature Area" terminology — do not carry Feature Group naming into the proposal **except** in **PRD Source** citations where the PRD section title is literally *Feature Groups* (cite the § only; do not use "Feature Group" as an artifact or area name elsewhere).
-
----
-
-## Mode: scaffold
-
-Creates initial Feature Area files from `.cursor/templates/product/feature-area.template.md` after an **approved** Feature Area Map. **Writes only** `docs/product/feature-areas/<kebab-name>.md`; no other paths.
-
-### Pre-conditions
-
-1. Read the Feature Area Builder skill (`.cursor/skills/feature-area/feature-area-builder/SKILL.md`).
-2. The Feature Area Map used as input must be **approved by the user in the current conversation** (table of proposed v0 Feature Areas plus any split decisions — not speculative).
-3. If no approved map is available in-context, stop and instruct the user to run `/feature-area map`, approve it, then re-run `/feature-area scaffold`.
-
-### Behavior
-
-1. Read mandatory sources in pre-flight order (PRD state, PRD.md, open questions, product-decisions/README if present).
-2. Reconcile the approved map with PRD Feature Groups — fill each new file **only from** PRD-aligned content and fields implied by that map (including PRD § references carried from the proposal).
-3. For each proposed v0 Feature Area in the approved map:
-   - Target path: `docs/product/feature-areas/<kebab-name>.md` (canonical kebab casing from Feature Area naming).
-   - If the target file **already exists** and is **non-empty** (trimmed contents length > 0): **skip** — do not modify; record under skipped outputs.
-   - If the target is missing **or exists but is empty**, write the file **from `.cursor/templates/product/feature-area.template.md`** (structure preserved; placeholders replaced with scaffolded prose).
-   - Set `Status:` to **`exploratory`** in the scaffolded artifact.
-   - Copy **`NEED_HUMAN`** and **`NEED_UPDATE`** from the approved map row **verbatim** (`true` / `false`).
-   - **Candidate Scope Slices:** populate the table **only with names + one-line descriptions** (+ `exploratory` status per row if the template column is present); no decomposition beyond what the approved map conveyed.
-   - Omit or leave minimal template placeholders for sections the map did not imply — pull additional grounding from **`docs/prd/PRD.md`** only where it directly fills those sections (intent, boundaries, journeys, dependencies, blockers-as-known). Never invent specs.
-4. **Do not:** create Scope Slice files; run validation; overwrite non-empty Feature Area files; write user stories, specs, tasks, or architecture.
-
-### Output format
-
-```txt
-## /feature-area scaffold — result
-
-Created:
-- docs/product/feature-areas/<kebab>.md
-
-Skipped (existing non-empty file):
-- docs/product/feature-areas/<kebab>.md
-
-Files needing NEED_HUMAN resolution (<NEED_HUMAN=true> preserved from approved map):
-- docs/product/feature-areas/<kebab>.md — <why from map/context if known>
-
-Next recommended command:
-/feature-area validate <kebab-name>   ← run once per created Feature Area
-```
-
-**Hard rules for scaffold mode:**
-
-- **`/feature-area scaffold` is the only `/feature-area` mode that may create Feature Area files.** **`/feature-area promote`** applies only the predefined validated-transition edits on an existing file. All other modes do not modify Feature Area files.
-- No Scope Slice file creation (`docs/product/scope-slices/`).
-- Do not invoke FA readiness checks inside scaffold — defer to **`/feature-area validate`**.
-- No user stories, specs, tasks, architecture, services, APIs, data models.
-
----
-
-## Mode: validate `<feature-area-name>`
-
-Runs the FA-01–FA-09 checks from `.cursor/checkers/scope-readiness-checker.md` (Part 1) against the Feature Area file at `docs/product/feature-areas/<feature-area-name>.md`.
-
-### Behavior
-
-1. Read the Feature Area file.
-2. Read `docs/prd/questions/open-questions.md` to cross-check open blockers.
-3. Run every check in Part 1 (FA-01 through FA-09) and Cross-Cutting checks CC-02, CC-03, CC-04, CC-05.
-4. Output the summary table.
-5. If all checks pass: state that the Feature Area may be marked `validated` via `/feature-area promote <name>` (or manually) and Scope Slices may be proposed via `/feature-area slice <name>` after `validated`.
-6. If any check fails: block advancement and state what must be resolved.
-
-### Output format
-
-Use the Summary Output Format defined in `.cursor/checkers/scope-readiness-checker.md`:
-
-```txt
-## Scope Readiness Check — <Feature Area Name>
-
-| Check | Result | Notes |
-|-------|--------|-------|
-| FA-01 | PASS   |       |
-| FA-02 | FAIL   | ...   |
-| ...   |        |       |
-| CC-02 | PASS   |       |
-| CC-03 | PASS   |       |
-| CC-04 | PASS   |       |
-| CC-05 | PASS   |       |
-
-**Advancement verdict:** CLEAR | BLOCKED
-**Reason:** <first failing check if blocked>
-**NEED_HUMAN:** true | false
-**NEED_UPDATE:** true | false
-```
-
-**Hard rules for validate mode:**
-- No file writes.
-- Do not propose Scope Slices inside a validate response.
-- Do not mark the Feature Area as `validated` in the file from this mode — after a CLEAR verdict, use `/feature-area promote <name>` (or update the file manually).
-
----
-
-## Mode: promote `<feature-area-name>`
-
-Runs the same Feature Area readiness checks as `/feature-area validate`, then **only if** the advancement verdict is **CLEAR**, applies a **narrow** update to the Feature Area file. **Does not** create files; **does not** change PRD, Scope Slices, or Feature Area scope content.
-
-### Input
-
-- `<feature-area-name>` → `docs/product/feature-areas/<feature-area-name>.md` (kebab filename as used for `validate` / `slice`).
-
-### Pre-conditions (all required before any write)
-
-1. The Feature Area file exists and is non-empty.
-2. Current `Status` is `exploratory` (if already `validated`, **no-op** — do not rewrite; report only).
-3. If `Status` is `blocked` or `deferred`, stop — promotion is not allowed; explain.
-4. `NEED_HUMAN: false` and `NEED_UPDATE: false` in the file.
-5. **Open Blockers:** no unresolved blocker rows (align with FA-06 — no active blockers in the table; cross-check `docs/prd/questions/open-questions.md` as in validate).
-6. Run FA-01 through FA-09 and CC-02 through CC-05 from `.cursor/checkers/scope-readiness-checker.md` (same set as validate). If any check does not pass, **stop and do not write**.
-
-### Behavior
-
-1. Read mandatory pre-flight sources (same order as other modes).
-2. Read the Feature Area file and `docs/prd/questions/open-questions.md`.
-3. Verify pre-conditions (status, flags, Open Blockers).
-4. Run FA-01–FA-09 and CC-02–CC-05; require **CLEAR**.
-5. **Only if CLEAR:**
-   - Set `## Status` value to `validated` (replace `exploratory` only in the status line / backtick line per file convention — do not alter other sections).
-   - In `## Readiness Verdict`, set every checklist item to checked: `[x]`.
-   - Set `**Verdict:**` to `READY FOR SCOPE SLICES` (replace prior verdict text only on that line).
-   - Append one row to `## Changelog`:
-
-     `| YYYY-MM-DD | Promoted to validated after CLEAR readiness check (`/feature-area promote`) | — |`
-
-     Use the current calendar date for `YYYY-MM-DD`.
-
-6. Do not modify: PRD Source, Product Intent, In/Out of Scope, Business Objects, Journeys, Dependencies, Risks, Open Blockers body (except if the template embeds verdict inside Open Blockers — it does not), Candidate Scope Slices, or any other section not listed above.
-
-### Output format
-
-```txt
-## /feature-area promote — result
-
-Promoted:
-- docs/product/feature-areas/<feature-area-name>.md
-
-Validation:
-- FA-01–FA-09: CLEAR
-- CC-02–CC-05: CLEAR
-
-Not changed:
-- PRD files
-- Scope Slice files
-- User stories / specs / tasks
-- Feature Area scope content
-
-Next recommended command:
-/feature-area slice <feature-area-name>
-```
-
-If **no-op** (already `validated`):
-
-```txt
-## /feature-area promote — result
-
-No-op: docs/product/feature-areas/<feature-area-name>.md is already status `validated`. File not modified.
-
-Next recommended command:
-/feature-area slice <feature-area-name>
-```
-
-**Hard rules for promote mode:**
-
-- **Only** the four edits above when CLEAR; no other file or section changes.
-- No Scope Slice file creation; no user stories, specs, tasks, or architecture.
-- If validation is **BLOCKED**, output the same style of summary table as validate (or a concise failure summary) and do not write.
-
----
-
-## Mode: slice `<feature-area-name>`
-
-Proposes candidate Scope Slices for a Feature Area that has been marked `validated`. **No file writes.**
-
-### Pre-condition gate
-
-Before proposing slices:
-
-1. Read `docs/product/feature-areas/<feature-area-name>.md`.
-2. Confirm `Status: validated`. If status is not `validated`, stop and return:
-
-```txt
-Cannot propose Scope Slices.
-
-Feature Area "<name>" has status "<current status>".
-Scope Slice decomposition requires status = validated.
-
-Run `/feature-area validate <name>` to check what is blocking advancement, then `/feature-area promote <name>` after CLEAR if status is still `exploratory`.
-```
-
-3. Confirm `NEED_HUMAN: false`. If `NEED_HUMAN: true`, stop and list the open blockers — do not propose slices until they are resolved.
-
-### Behavior
-
-1. Read the Feature Area's In Scope, Out of Scope, Business Objects Touched, and Candidate Scope Slices sections.
-2. Identify distinct user-value clusters within the In Scope section.
-3. For each cluster, propose one Scope Slice:
-   - Name (kebab-safe, descriptive)
-   - One-line user value description
-   - Draft boundary (included / excluded)
-   - Any immediate blockers or NEED_HUMAN flags
-4. Cross-check each proposed slice against the v0 exclusion list in `.cursor/rules/feature-area-workflow.mdc` §6.
-
-### Output format
-
-```txt
-Scope Slice Proposal — <Feature Area Name>
-
-| Slice name | User value (one sentence) | Blockers | Tentative status |
-|---|---|---|---|
-| <kebab-name> | <one sentence> | none | exploratory |
-
-Notes:
-- <any cross-cutting concern: credit, sharing, privacy, feedback>
-
-Deferred (v0 exclusion):
-- <slice candidate deferred with PRD reference>
-
-Next step:
-- Run `/feature-area scaffold-slices <feature-area-name>` to create Scope Slice files from `.cursor/templates/product/scope-slice.template.md` under `docs/product/scope-slices/<feature-area-kebab>--<slice-kebab>.md`
-- Then run `/feature-area refine-slice <artifact-path>` on each **exploratory** file to complete product-level sections; use `/feature-area check` and `/feature-area promote-slice` when SS-01–SS-10 and CC checks are CLEAR
-```
-
-**Scope Critic review:** After the builder produces the slice proposal, the Scope Critic reviews it before it is presented to the user. If the Scope Critic returns a REVISE verdict, revise the proposal before presenting.
-
-**Hard rules for slice mode:**
-- No file writes.
-- No architecture, data models, API routes, or technology choices.
-- Do not write user stories, specs, or tasks.
-- Each proposed slice must deliver user value independently.
-
----
-
-## Mode: scaffold-slices `<feature-area-name>`
-
-Creates or fills Scope Slice markdown under `docs/product/scope-slices/` from the **most recent user-approved** `/feature-area slice <feature-area-name>` proposal in the current conversation. **Writes only** paths matching `docs/product/scope-slices/<feature-area-kebab>--<slice-kebab>.md`. Does not modify PRD, Feature Area files, or any other paths.
-
-### Pre-conditions
-
-1. Read the Feature Area Builder skill (`.cursor/skills/feature-area/feature-area-builder/SKILL.md`).
-2. A Scope Slice proposal for this Feature Area must be **approved by the user in the current conversation** (the table from `/feature-area slice <feature-area-name>`, after any Scope Critic revisions — not speculative). If no approved proposal is available in-context, stop:
-
-```txt
-No approved Scope Slice proposal found in this conversation for Feature Area "<feature-area-name>".
-
-Run `/feature-area slice <feature-area-name>` first, review the proposal, approve it explicitly, then run `/feature-area scaffold-slices <feature-area-name>` again.
-```
-
-3. Read `docs/product/feature-areas/<feature-area-name>.md` (filename must match the argument). Confirm **`Status: validated`**. If not, stop with the same gate message as Mode: slice (status not validated).
-4. Confirm **`NEED_HUMAN: false`** on the parent Feature Area. If `true`, stop and list open blockers — do not create files.
-
-### Behavior
-
-1. Complete mandatory pre-flight reads (PRD state, PRD.md, open questions, product-decisions if present). Use the parent Feature Area file and `docs/prd/PRD.md` only to ground **product-level** text; never invent implementation detail.
-2. For **each row** in the approved slice proposal table, resolve:
-   - `<feature-area-kebab>` = kebab basename of the parent Feature Area file (same as `<feature-area-name>` in the path).
-   - `<slice-kebab>` = kebab-safe slice name from the proposal (must match the row’s slice identity).
-   - Target path: `docs/product/scope-slices/<feature-area-kebab>--<slice-kebab>.md`
-3. **Skip without overwrite** if the target exists and is **non-empty** (trimmed length > 0). List each skipped path in the output.
-4. If the target is **missing** or **empty-only**, write the file from **`.cursor/templates/product/scope-slice.template.md`** (preserve template structure and headings).
-5. **Fill only** these sections (product-level prose only; no user stories, specs, tasks, architecture, API routes, data models, or implementation detail):
-   - **Parent Feature Area** — correct link to `../feature-areas/<feature-area-kebab>.md` and human-readable name.
-   - **Status** — default **`exploratory`** unless the approved proposal row explicitly marked the slice **`blocked`** or **`deferred`** (use that value).
-   - **NEED_HUMAN / NEED_UPDATE** — set from proposal + parent Feature Area + PRD grounded gaps. **`NEED_HUMAN: true`** only when missing product truth **blocks** writing user stories for this slice; otherwise `false`. **`NEED_UPDATE: true`** only when templates/rules/checkers are inadequate for this slice; otherwise `false`. Use clear product-level **TBD** in body text where the approved proposal + parent FA + PRD do not supply an answer.
-   - **User Value** — from the proposal row (and parent context if needed); no invention.
-   - **Exact Boundary** — Included / Excluded behavior lists from the proposal’s boundary + parent FA in/out scope + PRD; use TBD bullets where unknown.
-   - **Credit / Payment Impact**, **Sharing / Privacy Impact**, **Feedback / Instrumentation Impact** — from proposal notes/cross-cutting row + parent FA + PRD; if none, use the template’s “None — …” style short statements.
-   - **Dependencies** — product-level only (other slices, Feature Areas, or named constraints); TBD table rows if unknown.
-   - **Blockers** — from proposal blockers column + open questions affecting this slice; align with NEED_HUMAN.
-   - **Acceptance-Level Outcome** — behavioral, from proposal + parent FA when sufficient; otherwise a short product-level TBD.
-   - **Changelog** — append one row: current date, scaffolded-from-approved `/feature-area slice` proposal via `/feature-area scaffold-slices`, author `—`.
-6. **Do not fill** (leave template placeholders / empty tables as in the template): **UX States**, **Data Touched**, **Readiness for User Stories** checklist, **Verdict** under Readiness — **UX States** and **Data Touched** are owned by **`/feature-area refine-slice`**; Readiness checklist and verdict are owned by **`/feature-area promote-slice`** after **CLEAR** (or manual equivalent).
-7. **Do not** modify PRD, Feature Area files, or any file outside `docs/product/scope-slices/<feature-area-kebab>--<slice-kebab>.md`.
-
-### Output format
-
-```txt
-## /feature-area scaffold-slices — result
-
-Feature Area: <feature-area-kebab> (validated, NEED_HUMAN=false)
-
-Created:
-- docs/product/scope-slices/<feature-area-kebab>--<slice-kebab>.md
-
-Skipped (existing non-empty file):
-- docs/product/scope-slices/<feature-area-kebab>--<slice-kebab>.md
-
-Next recommended command:
-/feature-area refine-slice docs/product/scope-slices/<feature-area-kebab>--<slice-kebab>.md   ← per created file (exploratory until refined)
-/feature-area check <artifact-path>   ← after refinement when verifying readiness; then /feature-area promote-slice when CLEAR
-```
-
-**Expectation — post-scaffold Scope Slices:** Files created by `scaffold-slices` default to **`exploratory`**. They are **not** expected to be story-ready until product-level sections are completed via **`/feature-area refine-slice`** and the scope-readiness checker passes SS-01–SS-10 and CC-01–CC-05 (**`/feature-area promote-slice`** applies the status transition only after **CLEAR**).
-
-**Hard rules for scaffold-slices mode:**
-
-- **Only** `/feature-area scaffold-slices` may **create** or **initially populate** Scope Slice files under `docs/product/scope-slices/` from an approved slice proposal. **`/feature-area refine-slice`** performs ongoing **product-level** edits on one existing file; **`/feature-area promote-slice`** applies the **ready-for-user-stories** transition only as defined in Mode: promote-slice.
-- No PRD or Feature Area mutations.
-- No overwrite of non-empty Scope Slice files.
-- No user stories, specs, tasks, architecture, services, APIs, data models.
-
----
-
-## Mode: refine-slice `<artifact-path>`
-
-Refines **one** Scope Slice at `docs/product/scope-slices/<artifact-path>.md` (path may be relative to repo root or the slice filename under `docs/product/scope-slices/` — resolve to a single file under that directory).
-
-### Pre-conditions
-
-1. Target resolves to exactly one existing, non-empty file under `docs/product/scope-slices/`.
-2. Read the Feature Area Builder skill. Complete mandatory pre-flight reads (same order as other modes).
-
-### Behavior
-
-1. Read the Scope Slice file, its parent Feature Area (from link in **Parent Feature Area**), `docs/prd/questions/open-questions.md`, and `docs/prd/PRD.md` only to ground **product-level** text.
-2. **May edit only** these sections (headings as in `.cursor/templates/product/scope-slice.template.md`): **User Value**, **Exact Boundary** (Included / Excluded), **UX States**, **Data Touched**, **Credit / Payment Impact**, **Sharing / Privacy Impact**, **Feedback / Instrumentation Impact**, **Dependencies**, **Blockers**, **Acceptance-Level Outcome**; and the **`NEED_HUMAN` / `NEED_UPDATE`** lines under **Status**.
-3. **Must not:** change **`Status`** to `ready-for-user-stories` (use **`/feature-area promote-slice`**); edit **Readiness for User Stories** (checklist, **Verdict** line, or status bullets); edit **Changelog**; replace **Parent Feature Area** except to fix a broken link to the correct parent file; create or delete Scope Slice files; modify PRD, Feature Areas, or any path outside the single target file.
-4. **Data Touched:** product objects only (per template) — no tables, routes, frameworks, or schemas.
-5. Use **PRD-allowed product-level terms** only as defined in `.cursor/checkers/scope-readiness-checker.md` (**Allowed product-level terms (PRD)**).
-6. **Do not** write user stories, specs, tasks, architecture, services, APIs, or data models.
-
-### Output format
-
-```txt
-## /feature-area refine-slice — result
-
-Refined:
-- docs/product/scope-slices/<fa-kebab>--<slice-kebab>.md
-
-Next recommended command:
-/feature-area check docs/product/scope-slices/<fa-kebab>--<slice-kebab>.md
-```
-
-**Hard rules for refine-slice mode:**
-
-- **Only** product-level section edits on **one** file; no `ready-for-user-stories promotion`.
-- No user stories, specs, tasks, architecture.
-
----
-
-## Mode: promote-slice `<artifact-path>`
-
-Runs Scope Slice readiness checks, then **only if** SS-01–SS-10 and CC-01–CC-05 are **CLEAR**, applies a **narrow** update. **Does not** create files; **does not** change PRD, Feature Area files, or Scope Slice **body** sections (User Value, Boundary, UX States, etc.).
-
-### Input
-
-- `<artifact-path>` → one file under `docs/product/scope-slices/` (resolve as for refine-slice).
-
-### Pre-conditions (all required before any write)
-
-1. Target file exists under `docs/product/scope-slices/` and is non-empty.
-2. Parent Feature Area linked from the slice exists and has `Status: validated`.
-3. Current **Status** is `exploratory` (if `blocked` or `deferred`, stop — promotion is not allowed until status is `exploratory`; if already `ready-for-user-stories`, **no-op** — do not rewrite; report only).
-4. `NEED_HUMAN: false` and `NEED_UPDATE: false` in the slice file.
-5. **Blockers:** no unresolved blocker rows that violate SS-09 (cross-check `docs/prd/questions/open-questions.md`).
-6. Run SS-01 through SS-10 and CC-01 through CC-05 from `.cursor/checkers/scope-readiness-checker.md` against the slice and parent context. If any check does not **PASS**, **stop and do not write**. (Do **not** treat SS-11 as a pre-write gate — promotion sets the status SS-11 requires.)
-
-### Behavior
-
-1. Complete mandatory pre-flight reads (same order as other modes).
-2. Read the Scope Slice file and `docs/prd/questions/open-questions.md`.
-3. Verify pre-conditions (status, flags, blockers, parent Feature Area).
-4. Run SS-01–SS-10 and CC-01–CC-05; require **CLEAR**.
-5. **Only if CLEAR:**
-   - Set `## Status` value to `ready-for-user-stories` (replace prior status only on the status line / backtick line per file convention).
-   - In `## Readiness for User Stories`, set every checklist item to checked: `[x]`.
-   - Set **`**Verdict:**`** to `READY FOR USER STORIES` (replace prior verdict text only on that line).
-   - Append one row to `## Changelog`:
-
-     `| YYYY-MM-DD | Promoted to ready-for-user-stories after CLEAR readiness check (`/feature-area promote-slice`) | — |`
-
-     Use the current calendar date for `YYYY-MM-DD`.
-
-6. Do not modify any other sections or files.
-
-### Output format
-
-```txt
-## /feature-area promote-slice — result
-
-Promoted:
-- docs/product/scope-slices/<fa-kebab>--<slice-kebab>.md
-
-Validation:
-- SS-01–SS-10: CLEAR
-- CC-01–CC-05: CLEAR
-
-Not changed:
-- PRD files
-- Feature Area files
-- Scope Slice product body sections (User Value, Boundary, UX States, etc.)
-
-Next recommended command:
-(user story workflow per product process)
-```
-
-If **no-op** (already `ready-for-user-stories`):
-
-```txt
-## /feature-area promote-slice — result
-
-No-op: docs/product/scope-slices/<fa-kebab>--<slice-kebab>.md is already status `ready-for-user-stories`. File not modified.
-```
-
-**Hard rules for promote-slice mode:**
-
-- **Only** the four edits above when CLEAR; no other file or section changes.
-- No user stories, specs, tasks, or architecture.
-- If validation is **BLOCKED**, output the same style of summary table as `check` (or a concise failure summary) and do not write.
-
----
-
-## Mode: check `<artifact-path>`
-
-Runs the full scope-readiness checker against any Feature Area or Scope Slice file.
-
-### Behavior
-
-1. Read the file at `<artifact-path>`.
-2. Detect artifact type:
-   - Path under `docs/product/feature-areas/` → run Part 1 (FA-01–FA-09) + CC-02–CC-05
-   - Path under `docs/product/scope-slices/` → run Part 2 (SS-01–SS-11) + CC-01–CC-05
-   - Path under both or ambiguous → ask the user to confirm which part to run
-3. Run all applicable checks from `.cursor/checkers/scope-readiness-checker.md`.
-4. Output the summary table with advancement verdict.
-
-### Output format
-
-```txt
-## Scope Readiness Check — <Artifact Name>
-## Type: Feature Area | Scope Slice
-
-| Check | Result | Notes |
-|-------|--------|-------|
-| ...   |        |       |
-
-**Advancement verdict:** CLEAR | BLOCKED
-**Reason:** <first failing check if blocked>
-**NEED_HUMAN:** true | false
-**NEED_UPDATE:** true | false
-
-Next recommended command:
-- Feature Area: /feature-area validate <name> | /feature-area promote <name> (after CLEAR) | /feature-area slice <name>
-- Scope Slice: /feature-area refine-slice <path> (when product sections need work) | /feature-area promote-slice <path> (after SS-01–SS-10 and CC-01–CC-05 CLEAR) | resolve blockers and re-run check
-```
-
-**Hard rules for check mode:**
-- No file writes.
-- Do not propose fixes — only report check results and state what must be resolved.
-
----
-
-## Skill and agent responsibilities
+Read: `docs/prd/state.md` → `PRD.md` → `open-questions.md` → `product-decisions/README.md` if present → existing FA/SS dirs. PRD missing → `/prd init`.
 
-| Operation | Feature Area Lead | Feature Area Builder | Scope Critic |
-|-----------|------------------|---------------------|--------------|
-| `map` | Context Brief (pre-flight) | Drives proposal | Reviews proposal |
-| `scaffold` | Context Brief (reuse from `map` when same-thread; else initial pre-flight) | Writes Feature Area markdown from approved map | Not invoked |
-| `validate` | Context Brief (pre-flight) | Runs checker | Not invoked |
-| `promote` | Context Brief (pre-flight) | Runs checker; narrow file update if CLEAR | Not invoked |
-| `slice` | Context Brief (pre-flight) | Drives proposal | Reviews proposal |
-| `scaffold-slices` | Context Brief (reuse from `slice` when same-thread; else initial pre-flight) | Writes Scope Slice markdown from approved proposal | Not invoked |
-| `refine-slice` | Not invoked | Edits product-level Scope Slice sections on one file | Not invoked |
-| `promote-slice` | Not invoked | Runs SS-01–SS-10 + CC-01–CC-05; narrow ready transition if CLEAR | Not invoked |
-| `check` | Not invoked | Runs checker | Not invoked |
+Optional: 5-bullet **Context Brief** before `map`/`validate`/`promote`/`slice`/`scaffold`/`scaffold-slices` (see playbook).
 
-Read `.cursor/agents/feature-area/README.md` for the full operating principle.
+## Allowed writes (by mode)
 
----
+| Mode | Allowed paths |
+|------|---------------|
+| map, validate, slice, check | *none* |
+| scaffold | `docs/product/feature-areas/<kebab>.md` (new or empty only) |
+| promote | one existing FA file—only status/readiness/verdict/changelog lines per playbook |
+| scaffold-slices | `docs/product/scope-slices/<fa>--<slice>.md` (new or empty only) |
+| refine-slice | one SS file—sections listed in playbook only |
+| promote-slice | one SS file—only status/readiness/verdict/changelog per playbook |
 
-## Hard rules (all modes)
+## Never write (all modes)
 
-- No task slicing, user stories, specs, or architecture at any point (**`scaffold` included** — it fills template sections from PRD sources only).
-- **`/feature-area scaffold` is the only mode that may create** `docs/product/feature-areas/*.md`. **`/feature-area promote`** is the only mode that may apply the automated **validated transition** (status, readiness checklist, verdict, changelog row) on an existing Feature Area file. Do not write or rewrite Feature Area files from map, validate, slice, `scaffold-slices`, check, or promote beyond what promote explicitly allows.
-- **`/feature-area scaffold-slices`** may **create** or **initially fill** `docs/product/scope-slices/<feature-area-kebab>--<slice-kebab>.md` only from a user-approved `/feature-area slice` proposal with parent Feature Area gates satisfied. **`/feature-area refine-slice`** may **edit product-level sections** of one existing Scope Slice file (no file creation). **`/feature-area promote-slice`** is the only mode that may apply the automated **ready-for-user-stories** transition on a Scope Slice file (no file creation). No other mode may **create** Scope Slice files.
-- Do not skip levels in the hierarchy: PRD → Feature Area → Scope Slice.
-- Do not mark a Feature Area `validated` via map, validate, slice, or check — use **`/feature-area promote`** after CLEAR or edit manually. Do not mark Scope Slices `ready-for-user-stories` via map, validate, slice, `scaffold-slices`, check, or **refine-slice** — use **`/feature-area promote-slice`** after CLEAR or edit manually per the template.
-- Do not carry "Feature Group" terminology into proposals or narrative — use "Feature Area" exclusively **except** **PRD Source** (or equivalent citation) where the PRD section title is literally *Feature Groups* (§ reference only).
-- Any `NEED_HUMAN=true` flag blocks advancement until the user explicitly resolves it.
-- Any `NEED_UPDATE=true` flag must surface a description of what is missing before proceeding.
-- Do not proceed past a known open blocker in `docs/prd/questions/open-questions.md` without explicit user approval.
+- `src/**`, `app/**`, packages implementation trees  
+- User stories, specs, tasks as files  
+- PRD persistence (`/prd update` owns PRD files)  
+- Overwrite non-empty FA/SS unless mode explicitly allows that path’s first fill only  
+- Feature Area `validated` except via `promote` (or equivalent manual narrow edit)  
+- SS `ready-for-user-stories` except via `promote-slice` (or equivalent)
diff --git a/.cursor/commands/prd-init.md b/.cursor/commands/prd-init.md
index 45e7f0f..f3f428f 100644
--- a/.cursor/commands/prd-init.md
+++ b/.cursor/commands/prd-init.md
@@ -1,83 +1,39 @@
-# /prd init — Initialize PRD workspace from templates
+# /prd init — Bootstrap PRD workspace
 
 ## Purpose
 
-Create or repair the project-scoped PRD documentation workspace from canonical templates.
+Create or repair PRD doc scaffolding from `.cursor/templates/prd/` when files are missing or empty.
 
-This command is used when:
-- `docs/` is missing
-- `docs/prd/` is missing
-- `docs/product-decisions/` is missing
-- core PRD files are missing or empty
-- starting a new project from the Cursor workflow setup
+**Playbook:** `docs/playbooks/prd.md` (bootstrap section)
 
 ## Canonical source
 
-All reusable templates come from:
-
-`.cursor/templates/prd/`
-
-Never copy structure from existing `docs/**` files as templates.
+`.cursor/templates/prd/` only — never copy from existing `docs/**` as structure source.
 
 ## Files to create
 
-Create directories if missing:
-
-- `docs/prd/`
-- `docs/prd/archive/`
-- `docs/prd/notes/`
-- `docs/prd/questions/`
-- `docs/product-decisions/`
-
-Create files if missing or empty:
-
-- `docs/prd/PRD.md` from `.cursor/templates/prd/PRD.template.md`
-- `docs/prd/state.md` from `.cursor/templates/prd/state.template.md`
-- `docs/prd/history.md` from `.cursor/templates/prd/history.template.md`
-- `docs/prd/questions/open-questions.md` from `.cursor/templates/prd/open-questions.template.md`
-- `docs/product-decisions/README.md` from `.cursor/templates/prd/product-decisions-readme.template.md`
+Directories: `docs/prd/`, `docs/prd/archive/`, `docs/prd/notes/`, `docs/prd/questions/`, `docs/product-decisions/`
 
-Create if missing:
+Files (if missing or empty): `PRD.md`, `state.md`, `history.md`, `open-questions.md`, `docs/product-decisions/README.md` from matching templates.
 
-- `docs/prd/archive/.gitkeep`
-
-Optional:
-- Do not create a discovery note until the first `/prd note` or `/prd discover` input.
-- Do not create `PD-001.md` automatically unless the user asks to record a product decision.
+`docs/prd/archive/.gitkeep` if missing.
 
 ## Placeholder replacement
 
-When initializing templates, replace:
-
-- `{{DATE}}` with current date
-- `{{VERSION}}` with `v1`
-- `{{WHY}}` with `Initial scaffold`
-- `{{ARCHIVE_OR_DASH}}` with `—`
-- `{{DIRECTION}}` with `TBD`
-- `{{LAST_MAJOR_CHANGE}}` with `Initial scaffold`
-- `{{WHY_THIS_VERSION_EXISTS}}` with `Scaffold PRD — replace sections as discovery proceeds.`
-- all other unknown placeholders with `TBD`
+`{{DATE}}`, `{{VERSION}}` (v1), `{{WHY}}`, `{{ARCHIVE_OR_DASH}}`, `{{DIRECTION}}`, `{{LAST_MAJOR_CHANGE}}`, `{{WHY_THIS_VERSION_EXISTS}}` — unknowns → `TBD`
 
-## Safety rules
+## Allowed writes
 
-- Do not overwrite non-empty existing project docs.
-- If a file exists and is non-empty, leave it unchanged.
-- If a file exists but is empty, initialize it from the matching template.
-- If `history.md` contains project-specific rows, do not reset it unless explicitly asked.
-- Do not create archives except `.gitkeep`.
-- Do not modify product docs beyond initialization.
-- Do not run PRD discovery, convergence, challenge, prioritize, specs, tickets, implementation, or architecture.
+- Create dirs above  
+- Create/init **only missing or empty** files from templates  
+- `.gitkeep` in archive  
 
-## Output
+## Never write
 
-After running, show only:
+- Overwrite non-empty project docs  
+- Touch `docs/product/**`, specs, code, `notes/*.md` content beyond init  
+- Run discovery/convergence/architecture  
 
-1. Created directories
-2. Created files
-3. Skipped existing non-empty files
-4. Empty files initialized
-5. Next recommended command
-
-Expected next command:
+## Output
 
-`/prd discover`
+List: created dirs/files, skipped non-empty, next: `/prd discover`
diff --git a/.cursor/commands/prd-questions.md b/.cursor/commands/prd-questions.md
index 8789b1c..75452b1 100644
--- a/.cursor/commands/prd-questions.md
+++ b/.cursor/commands/prd-questions.md
@@ -1,145 +1,31 @@
-# /prd questions — Human-first PRD question loop
+# /prd questions — Question loop
 
-## Purpose
-
-Continue PRD discovery by asking the next unresolved question from `docs/prd/questions/open-questions.md`.
-
-This command is intentionally human-first:
-- one question at a time
-- notes before PRD
-- no PRD file writes
-- no implementation
-- no architecture
-
-## Templates
-
-Canonical template rules live in `.cursor/rules/10-prd-discovery.mdc`.
-
-Use `.cursor/templates/prd/` as the only reusable source for generated PRD docs.
-Never use `docs/**` files as templates.
+**Playbook:** `docs/playbooks/prd.md` (discover / questions)  
+**Rule:** `.cursor/rules/prd.cursor.mdc`
 
 ## Pre-flight
 
-1. Read `docs/prd/PRD.md`
-2. Read `docs/prd/state.md`
-3. Read `docs/prd/questions/open-questions.md`
-4. Read the latest relevant note in `docs/prd/notes/`
-
-When interpreting **answered** rows in `open-questions.md`, apply **Current truth resolution** (see below) so stale answers are not treated as authoritative.
-
-If `open-questions.md` is missing, create it from `.cursor/templates/prd/open-questions.template.md` — it is a capture artifact, not a PRD write.
-
-## Behavior
-
-### Normal path (Active queue has open rows)
-
-1. Find the highest-priority `open` question (lowest priority number, then lowest ID).
-2. Ask only that question.
-3. Do not include a table unless needed.
-4. Do not include more than one follow-up question.
-5. Do not propose PRD updates.
-6. Wait for the user's answer.
-
-### Empty Active queue — PRD blocker scan (mandatory)
-
-If the **Active queue** has **no** rows with `Status = open` (including when the table is empty or only contains answered moved rows — i.e. nothing left to ask):
-
-1. **Do not** output “no remaining questions” or recommend `/prd converge` yet.
-2. **Scan** `docs/prd/PRD.md` for unresolved product blockers in **all** of these sections (headings may be `##` or `#` as in the PRD; match the section title text):
-
-   - `Surface Blockers`
-   - `MVP Completeness Checklist`
-   - `Open before implementation-readiness` (typically a subsection under MVP Completeness Checklist — scan that heading and its list contents)
-   - `Risks & Assumptions`
-   - `Success Metrics`
-   - `Integration Boundaries`
-   - `Configuration Matrix`
-
-3. **Treat as requiring a discovery question** any item that is clearly unresolved, including when the PRD uses language such as:
-
-   - bullets or rows describing **blockers**, **open** decisions, **TBD**, **UNKNOWN**, **provider TBD**, **validation required** / **needs validation**, **not defined**, **not specified**, **not enumerated**, **not yet**, **fragility** / **risk** calling for a product decision, or checklist lines still **unchecked** `[ ]` where the adjacent text states an **open** dependency (e.g. “locking strategy open”, “initiator open”).
-
-4. **Deduplicate:** Before adding a row, compare wording to existing **Active** and **Answered** questions. Do not add a new `open` row if the same blocker is already captured (same intent, even if phrasing differs slightly).
-
-5. **Write capture artifact:** For each distinct unresolved item that lacks a matching queue row, append one row to `docs/prd/questions/open-questions.md` **Active queue** with:
-
-   - `Status`: `open`
-   - `Priority`: assign using the scale in `.cursor/rules/11-prd-question-loop.mdc` (⛔-style implementation blockers → `1` or `2`; provider/TBD → `2` or `3`; weaker gaps → `3` or `4`)
-   - `Question`: one concise product question that resolves that blocker
-   - `Source note`: cite the PRD section heading (e.g. `PRD § Surface Blockers`, `PRD § MVP Completeness Checklist`)
-   - `Blocks`: short label (e.g. feature group name or “implementation-readiness”)
-   - `ID`: next unused `Q-NNN` after scanning all IDs in Active + Answered tables
-
-6. **Ask only one question:** After any repopulation, find the highest-priority `open` question (lowest priority number, then lowest ID) and ask **only** that question.
-
-7. **Only if** the Active queue is still empty **after** this scan and deduplication may you use the “no remaining questions” response format below.
-
-### Hard prohibitions
+1. `docs/prd/PRD.md`  
+2. `docs/prd/state.md`  
+3. `docs/prd/questions/open-questions.md`  
+4. Latest relevant `docs/prd/notes/**`  
 
-- **Never** output the exact phrase `No remaining open discovery questions` if `docs/prd/PRD.md` still contains unresolved blockers that map to items in the scanned sections **unless** those items are already represented by answered questions or explicitly deferred/obsolete in the queue with no remaining product gap.
-- **Never** tell the user to manually add PRD blockers back into the queue via `/prd note` or similar — repopulation from the PRD is automatic when the Active queue is empty.
-- **Never** recommend `/prd converge` until both are true: Active queue has no `open` rows **and** the PRD blocker scan finds nothing that requires a new question.
+If `open-questions.md` missing → create from `.cursor/templates/prd/open-questions.template.md`.
 
-## Superseded answered questions
-
-When a user answer **changes**, **narrows**, or **contradicts** a fact stated in an earlier **answered** row (same topic, incompatible implications), the older row must **not** remain silently authoritative.
-
-The question loop must **immediately** do **one** of:
-
-- prepend or append to that row’s **Answer** and/or **PRD impact** cell a clear supersession marker and pointer to the newer ID, **or**
-- add a short supersession sentence in the same cells referencing the newer `Q-NNN`.
-
-Allowed wording pattern (adapt IDs as needed):
-
-`SUPERSEDED by Q-032 — original answer preserved for history; current PRD truth is the later answer.`
-
-**Never delete** older answered rows; only annotate (see **Hard rules**).
-
-## After user answers
-
-When the user answers a currently open question:
-
-1. Append the raw answer to the active discovery note.
-2. Move the question from `Active queue` to `Answered`.
-3. Add:
-   - answer summary
-   - PRD implication
-   - remaining ambiguity, if any
-4. Apply **Superseded answered questions** (section above) when this answer overrides earlier Answered rows.
-5. Add at most one new follow-up question to `Active queue` if the answer creates a new blocker.
-6. Run **Behavior** from the top again for the next turn (including empty-queue PRD scan if applicable).
-
-## Response format
-
-When asking the next question (including immediately after repopulating from the PRD):
-
-```txt
-Captured.
+## Templates
 
-Interpreted answer:
-<1–3 lines — omit this block on first question after PRD repopulation if there was no new user answer this turn; use a one-line note instead e.g. "Repopulated discovery questions from PRD blockers.">
+`.cursor/templates/prd/` only for new scaffold—not existing `docs/**`.
 
-PRD implication:
-<1–3 lines — same omission rule as above>
+## Behavior (summary)
 
-Next question:
-<one question only>
-```
+- One `open` question at a time (lowest Priority number, then lowest Q-id).  
+- **Empty Active queue:** mandatory PRD blocker scan (sections: Surface Blockers; MVP Completeness Checklist; Open before implementation-readiness; Risks & Assumptions; Success Metrics; Integration Boundaries; Configuration Matrix). Append deduped `open` rows; then ask one question.  
+- Priority scale: `1` most blocking → `4` nice-to-know (see playbook).  
+- After answer: append to discovery note; move to Answered; supersede stale rows per **Current truth resolution** below—**never delete** Answered rows.
 
-If there was **no** user answer in this turn but questions were repopulated from the PRD, use:
+**Exact stop phrase** when queue empty after scan:
 
 ```txt
-Synced open questions from PRD blockers.
-
-Next question:
-<one question only>
-```
-
-If no questions remain **after** the mandatory PRD blocker scan and the Active queue is empty:
-
-```txt
-Captured.
-
 No remaining open discovery questions.
 
 Next recommended step:
@@ -148,20 +34,23 @@ Next recommended step:
 
 ## Current truth resolution
 
-When **reading** the Answered queue (or when inferring product facts from it for the next question, repopulation dedup, or chat interpretation):
+1. **`docs/prd/PRD.md` wins** after persisted `/prd update`.  
+2. Among answered rows, **later** Q-id / date wins for same topic.  
+3. **`SUPERSEDED by Q-NNN`** in a cell overrides older text.  
+4. Residual conflicts → surface as drift; do not silent-merge.
+
+## Allowed writes
+
+- `docs/prd/notes/**`  
+- `docs/prd/questions/open-questions.md` (capture + supersession annotations only)  
 
-1. **`docs/prd/PRD.md` wins** for persisted product truth **after** an approved `/prd update` has written that content.
-2. Among **answered questions only**, **latest relevant answered question wins** for the same topic when timelines are clear (higher `Q-NNN` ID or later `Answered at` when both exist).
-3. An **explicit supersession note** in an older row’s Answer / PRD impact (e.g. `SUPERSEDED by Q-032 …`) **always overrides** treating that row’s original text as current truth.
-4. If two answered rows **still conflict** and neither is marked superseded — or conflict with `PRD.md` / `docs/prd/state.md` — **surface as drift**: do not silently merge; prefer opening a clarifying `open` row or stating the conflict in the discovery note.
+## Never write
 
-Modes that consume the queue (`/prd converge`, PRD Lead pre-flight, Challenger, `/prd update` preparation) must use this resolution order; see `.cursor/agents/prd/prd-lead.md` and `.cursor/commands/prd.md` Mode: challenge.
+- `docs/prd/PRD.md`, `state.md`, `history.md`, `archive/**`  
+- Implementation / specs / code  
+- ICE / Surface Gate tables unless user asks  
+- Delete Answered rows  
 
-## Hard rules
+## Response shapes
 
-- No writes to `docs/prd/PRD.md` or `docs/prd/state.md`.
-- No version bumps.
-- No ICE scoring tables unless explicitly requested.
-- No Surface Gate tables unless explicitly requested.
-- Writes to `docs/prd/notes/` and `docs/prd/questions/open-questions.md` are allowed — they are capture artifacts.
-- **Never delete** answered rows from `open-questions.md`. Historical answers stay visible; supersession is done **only** via annotation (Answer / PRD impact text or explicit supersession note), never by removing rows.
+See playbook; include **Interpreted answer** / **PRD implication** when user answered.
diff --git a/.cursor/commands/prd.md b/.cursor/commands/prd.md
index 47c10b8..00b4f52 100644
--- a/.cursor/commands/prd.md
+++ b/.cursor/commands/prd.md
@@ -1,4 +1,4 @@
-# /prd — PRD Discovery Orchestrator
+# /prd — Router
 
 ## Usage
 
@@ -8,443 +8,47 @@
 
 ## Modes
 
-| Mode | Lead | Purpose |
-|------|------|---------|
-| `init` | PRD Bootstrap | Initialize missing docs workspace from `.cursor/templates/prd/` |
-| `discover` | PRD Builder skill | Open product discovery, free-form capture |
-| `questions` | PRD Question Loop | Ask the next unresolved discovery question |
-| `note` | PRD Question Loop | Capture one insight as a discovery note, update question queue |
-| `converge` | PRD Lead → PRD Builder skill | Reconstruct product context, then synthesize notes into a proposed PRD delta |
-| `challenge` | PRD Lead → Challenger agent | Reconstruct product context, then stress-test assumptions, scope, drift |
-| `prioritize` | PRD Lead → PRD Builder skill | Reconstruct product context, then re-rank feature groups using ICE |
-| `update` | PRD Lead → PRD Builder skill | Reconstruct product context, then persist an approved delta |
+| Mode | Purpose |
+|------|--------|
+| `init` | Bootstrap PRD workspace — see `.cursor/commands/prd-init.md` |
+| `discover` | Capture-first discovery |
+| `questions` | One-question loop — see `.cursor/commands/prd-questions.md` |
+| `note` | Single insight → note + queue |
+| `converge` | Synthesis only (chat); no PRD file writes |
+| `challenge` | Stress-test / false convergence (chat); no writes |
+| `prioritize` | ICE rank (chat); no writes |
+| `update` | Gated persistence to PRD files |
 
-If no mode is given:
+**Playbook (all behavior):** `docs/playbooks/prd.md`  
+**Rule (when editing `docs/prd/**`):** `.cursor/rules/prd.cursor.mdc`
 
-1. If `docs/prd/questions/open-questions.md` exists and has an open question, treat the user input as an answer to the current highest-priority open question and run `questions` mode.
-2. If the user input looks like a new product insight, correction, or founder note, run `note` mode.
-3. If neither applies, ask which mode the user wants.
+## If no mode
 
-## Templates
+1. If `open-questions.md` has an `open` row → treat input as answer → run `questions` logic.  
+2. Else if input looks like product insight → `note`.  
+3. Else ask which mode.
 
-Canonical template rules live in `.cursor/rules/10-prd-discovery.mdc`.
+## Allowed writes
 
-Use `.cursor/templates/prd/` as the only reusable source for generated PRD docs.
-Never use `docs/**` files as templates.
+| Mode | May write |
+|------|-----------|
+| init | Per `prd-init.md` only |
+| discover, note, questions | `docs/prd/notes/**`, `docs/prd/questions/open-questions.md` |
+| converge, challenge, prioritize | *(none)* |
+| update | `docs/prd/PRD.md`, `state.md`, `history.md`, `archive/**`, and `open-questions.md` **only** for supersession annotations after approved patch |
 
-## Pre-flight
+## Never write
 
-1. Before reading `docs/prd/PRD.md` or `docs/prd/state.md`, if either file is missing or empty, suggest `/prd init` instead of assuming the PRD exists.
-2. Read `docs/prd/PRD.md` — the active PRD.
-3. Read `docs/prd/state.md` — version, direction, last major change.
-4. **PRD Lead pre-flight (converge / challenge / prioritize / update only):** On the **initial invocation** of any of these modes, invoke the PRD Lead agent (`.cursor/agents/prd/prd-lead.md`) to produce a PRD Context Brief. The mode's lead agent acts only after the brief is available. Skip for `init`, `discover`, `questions`, and `note`. **Do not run pre-flight again when the user responds `approved`, `preview`, or `cancel` to an existing Patch Intent Summary or PRD Delta Proposal** — those responses resume an active approval flow and must not be interrupted.
-5. **SISO classification for `/prd update`:** `/prd update` is a structured persistence workflow — not implementation, specs, tickets, or architecture. SISO must not block it as execution. It still requires explicit persistence approval through a Patch Intent Summary or full PRD Delta Proposal (see Mode: update below). In `discover`, `note`, `questions`, and `converge`, all user input is treated as raw discovery material. Never return SISO ORANGE or RED for a product insight given during discovery.
+- Wrong mode: never touch persistent PRD files outside `update` after approval.  
+- `converge` → never `PRD.md`, `state.md`, `history.md`, `archive/`.  
+- No implementation specs, tickets, architecture, app code from `/prd`.  
+- Never delete **Answered** rows in `open-questions.md`.  
+- Do not use `docs/**` as template source — only `.cursor/templates/prd/`.
 
-## Mode: init
+## Pre-flight (all modes except init)
 
-Initialize or repair the `docs/` PRD workspace from `.cursor/templates/prd/`.
+If `PRD.md` or `state.md` missing/empty → suggest `/prd init`. Then read `PRD.md`, `state.md`; for update/converge/challenge/prioritize also read notes + open questions.
 
-- Create missing directories and missing/empty files.
-- Never overwrite non-empty project docs.
-- Use only `.cursor/templates/prd/` as the canonical source.
-- Do not run discovery or convergence.
+**`/prd update` approval:** only `approved` or `preview`→`approved` — never `ok` alone.
 
-See `.cursor/commands/prd-init.md` for the full spec.
-
-## Mode: discover
-
-Open-ended capture. Every user input is treated as a meeting note, not an execution request.
-
-Default behavior per user input:
-1. Append insight to `docs/prd/notes/YYYY-MM-DD-<topic>-discovery-note.md` (format: see `.cursor/templates/prd/discovery-note.template.md`). Update `docs/prd/questions/open-questions.md` if the insight opens or answers a question.
-2. Interpret the likely product meaning in 1–3 lines.
-3. Identify the PRD implication in 1–3 lines.
-4. Ask **one** follow-up question. Stop.
-
-Do not run the Surface Gate, ICE scoring, DoD, Out-of-Scope, or convergence checks during open discovery. Do not propose a PRD update.
-
-If no direction exists, open with one orienting question — do not launch the full Surface Gate.
-
-**Discovery response shape:**
-
-```txt
-Captured as discovery note.
-
-Interpreted insight:
-<1–3 lines>
-
-PRD implication:
-<1–3 lines>
-
-One question:
-<single question, or "None">
-```
-
-## Mode: questions
-
-Human-first discovery loop driven by `docs/prd/questions/open-questions.md`.
-
-See `.cursor/commands/prd-questions.md` for the full spec. Short version:
-
-1. Read `docs/prd/PRD.md`, `docs/prd/state.md`, `docs/prd/questions/open-questions.md`, and the latest relevant discovery note (see `prd-questions.md` Pre-flight).
-2. If the Active queue has no `open` rows, **mandatorily scan** `docs/prd/PRD.md` for unresolved blockers (sections and triggers listed in `prd-questions.md`). Append deduplicated `open` rows to `open-questions.md` for each gap not already in the queue.
-3. Find the highest-priority `open` question (lowest priority number, then lowest ID).
-4. Ask **only that one question**. No table. No summary.
-5. Do not write to `PRD.md`. Do not run convergence, ICE, or Surface Gate.
-6. After the user answers, update the discovery note and question file (including **Superseded answered questions** annotations when the answer overrides earlier Answered rows — see `.cursor/commands/prd-questions.md`), then repeat from step 2.
-7. Recommend `/prd converge` **only when** the Active queue has no `open` rows **and** the mandatory PRD blocker scan finds nothing that requires a new question.
-8. Never instruct the user to manually repopulate blockers via `/prd note`.
-
-## Mode: note
-
-Capture user input as a discovery note and update the question queue.
-
-1. Append the raw input to the active discovery note (`docs/prd/notes/YYYY-MM-DD-<topic>-discovery-note.md`).
-2. Interpret the likely product meaning in 1–3 lines.
-3. Identify the PRD implication in 1–3 lines.
-4. If the input opens or answers a question, update `docs/prd/questions/open-questions.md` (including **Superseded answered questions** handling when the insight contradicts an earlier Answered row — see `.cursor/commands/prd-questions.md`).
-5. Ask **one** follow-up question maximum. Stop.
-
-Do not propose PRD updates.
-
-## Mode: converge
-
-Synthesis mode only. No file writes.
-
-`/prd converge` produces **exactly one** of two outputs per invocation — not both:
-
-### A. Global PRD Enrichment Proposal
-
-Used when `docs/prd/PRD.md` is missing one or more global product completeness sections (Global Product Picture, Operating Model, Core User Journeys, Flow Inventory, Business Objects, Configuration Matrix, Integration Boundaries, MVP Completeness Checklist), **and** discovery notes contain enough material to propose content for at least one of them.
-
-### B. Feature-Group Convergence Proposal
-
-Used after the global product picture is coherent enough to define one feature group at a time.
-
-**Target selection rule:**
-- If any required global section is absent or contains only TBD/scaffold content while discovery notes contain relevant material → prefer **A (Global PRD Enrichment Proposal)**.
-- If the global picture is coherent and the user names or implies a feature group to define → use **B (Feature-Group Convergence Proposal)**.
-- Never produce both in the same response.
-
-`/prd converge` **may not**:
-- write files
-- update `PRD.md`, `state.md`, `history.md`, or `archive/`
-- mark groups as `validated` or `committed`
-- generate implementation specs, tickets, or architecture
-- produce a full multi-group PRD in one pass
-- produce a build sequence unless **at least 3 feature groups were explicitly validated in separate prior turns**
-
-`/prd converge` **may**:
-1. Read `docs/prd/PRD.md`, `docs/prd/state.md`, `docs/prd/notes/`, and `docs/prd/questions/open-questions.md`.
-2. Synthesize the latest discovery into a proposal, applying **Current truth resolution** when interpreting **Answered** queue rows (see `.cursor/commands/prd-questions.md`) so superseded answers are not revived as current facts.
-3. Produce either:
-   - one **Global PRD Enrichment Proposal** (target A), OR
-   - one **Primary Feature Group Candidate** with other candidate groups listed by name only (target B)
-4. Identify open blockers and assumptions.
-5. Ask **exactly one** validation question.
-6. Stop.
-
-**Required output format — Global PRD Enrichment Proposal (target A):**
-
-```txt
-Global PRD Enrichment Proposal
-
-1. Synthesized global picture
-<short synthesis>
-
-2. Proposed PRD sections to enrich
-- <section>
-- <section>
-
-3. Content sources
-- <notes/questions/decisions used>
-
-4. Open blockers / unresolved details
-- <blocker>
-
-5. Safety
-- no implementation specs
-- no architecture
-- no tickets
-- no build sequence unless allowed by existing rules
-- no status promoted to validated or committed
-
-6. One validation question
-<one question only>
-```
-
-**Required output format — Feature-Group Convergence Proposal (target B):**
-
-```txt
-Convergence Proposal
-
-1. Synthesized insight
-<short synthesis>
-
-2. Proposed PRD change
-<what would change, but not written>
-
-3. Primary feature group candidate
-<one feature group max, draft or summary>
-
-4. Other candidate groups
-<names only, no full drafts>
-
-5. Open blockers / assumptions
-<short list>
-
-6. One validation question
-<one question only>
-```
-
-**Hard rule:** The words "validated", "committed", "ready to persist", or "ready to build" must not appear in a converge response unless the user explicitly validated the required checkpoint in the **immediately preceding turn**.
-
-## Mode: challenge
-
-Challenger leads. Reads active PRD and recent discussion. Produces: assumption → risk → test or kill criterion. Flags drift against state.md. Researcher labels evidence quality. No file writes.
-
-**False-convergence checks are mandatory** (see `prd-challenger.md`). For each non-`exploratory` group, Challenger verifies that buyer entry point, buyer-facing surface, merchant operating surface, source of truth, market/language, and confirmation channel are explicitly resolved or marked UNKNOWN with the Confidence cap applied. Any hidden surface assumption — including implementation language smuggled into product wording — is reported as `FALSE CONVERGENCE RISK`.
-
-### Default challenge scope
-
-Every `/prd challenge` run must check **all** of the following, regardless of what the user wrote in the prompt:
-
-**1. Readiness inflation**
-Flag when the PRD overstates readiness — e.g. "product surface resolved" while blockers remain in open questions, surface fields are UNKNOWN, or no feature group has passed the Surface Gate. Do not accept clean prose as a proxy for resolved decisions.
-
-**2. Silent decision propagation**
-Flag any journey, flow, business object, checklist item, or feature group that implicitly assumes an unresolved decision. Example: a journey titled "Buyer cancels booking" while the cancellation initiator (buyer-only? merchant-only? both?) is still undefined in open questions or marked UNKNOWN.
-
-**3. Nice-to-have contamination in MVP Completeness Checklist**
-Scan the MVP Completeness Checklist. Any item that is a nice-to-have (deferred, optional, or not tied to a validated v1 user need) must either be removed from the checklist or explicitly promoted to v1 scope with justification. Flag every contaminated item.
-
-**4. Missing or vague success metrics**
-If success metrics are absent or defined as "users are happy" / "adoption grows" / unmeasurable proxies, flag ICE scoring as unreliable. Confidence scores based on missing metrics must be reduced.
-
-**5. Absent monetization model**
-If pricing, revenue model, or monetization approach is not defined, flag Impact scoring and scope tradeoffs as weak. A product with no monetization model cannot reliably score Impact.
-
-**6. Scope inflation relative to unresolved blockers**
-If v1 scope is wide while open questions remain, flag scope inflation. Produce a cut/defer list: for each feature group or checklist item, recommend `cut`, `defer`, or `keep with constraint` with an explicit reason.
-
-**7. External platform assumptions treated as facts**
-Flag any assumption about an external platform that has not been validated. Specific examples to probe:
-- Stripe embedded iframe / nested iframe behavior within Shopify
-- Shopify iframe / CSP constraints on embedded apps
-- Shopify webhook coverage for booking-relevant events
-- Shopify gift card API limitations
-- Shopify Order API assumptions (what it can and cannot store)
-- SMS/email provider deliverability and opt-in compliance assumptions
-
-For each, state why it matters and what validation is needed before it can be treated as resolved.
-
-**8. Build-blocking unknowns without a next PRD action**
-Every open question that blocks a feature group from progressing must have an assigned next PRD action: `/prd questions`, `/prd update`, `/prd converge`, or explicit external validation. Flag any blocker that has no assigned action.
-
-**9. Stale answered-question contradictions**
-Apply **Current truth resolution** (`.cursor/commands/prd-questions.md`). Flag when incompatible implications remain across **Answered** rows without clear temporal/supersession ordering — especially when an older row still reads as definitive.
-
-**10. Answered queue conflicts with PRD.md or state.md**
-Flag when persisted `docs/prd/PRD.md` or `docs/prd/state.md` disagrees with facts implied by **Answered** queue cells that lack a supersession annotation or that were never reconciled after `/prd update`.
-
-**11. Missing supersession markers**
-Flag when later discovery (newer answered row, discovery note, or persisted PRD change) **changes, narrows, or contradicts** an earlier **Answered** row but that older row was **not** annotated (e.g. `SUPERSEDED by Q-NNN …`). Recommend `/prd questions` (capture pass) or annotating via the next `/prd update` per orchestrator rules — never silent merge.
-
-### Required output format
-
-Every `/prd challenge` response must use this format exactly:
-
-```txt
-Challenge Report
-
-1. Readiness verdict
-<one of: not ready for feature-group convergence | ready for feature-group convergence with blockers | ready for prioritize | ready for update>
-
-2. False-convergence risks
-- <risk or none>
-
-3. Product-surface contradictions
-- <contradiction or none>
-
-4. Scope realism
-- <main scope issue>
-- Recommended cuts / deferrals:
-  - <item> — <cut | defer | keep with constraint> — <reason>
-
-5. Missing decision anchors
-- Success metrics: <ok | missing | weak>
-- Monetization model: <ok | missing | weak>
-- Primary v1 pilot constraint: <ok | missing | weak>
-
-6. External platform assumptions to validate
-- <assumption> — <why it matters> — <validation needed>
-
-7. Required product questions before next convergence
-- <question>
-
-8. Recommended next command
-/prd questions | /prd update | /prd converge | /prd prioritize
-```
-
-No file writes. Do not propose implementation, architecture, or code inside a challenge response.
-
-## Mode: prioritize
-
-PRD Builder skill enumerates feature groups and scores each on ICE:
-
-- **Impact** (1–10): user + business value
-- **Confidence** (1–10): evidence quality (not enthusiasm)
-- **Ease** (1–10): realistic cost, inverted (10 = trivial)
-
-Formula: `score = Impact × Confidence × Ease / 100` (max 10.0).
-
-Output: ranked table with KEEP / DEFER / CUT / TEST-FIRST decisions + explicit cut list. No file writes.
-
-## Mode: update
-
-`/prd update` is the only mode allowed to write `docs/prd/PRD.md`, `docs/prd/state.md`, `docs/prd/history.md`, or `docs/prd/archive/`. All other modes must not write to those files. Discovery modes (`discover`, `note`, `questions`) may write to `docs/prd/notes/` and `docs/prd/questions/` — those are capture artifacts (see Discovery artifacts below).
-
-When `/prd update` persists a PRD change that **supersedes** facts previously captured in older **Answered** rows, also update `docs/prd/questions/open-questions.md` **as a capture artifact only**: annotate those older rows (Answer / PRD impact) with a supersession pointer to the governing source (`PRD.md` after write and/or the newer `Q-NNN`). **Never delete** historical Answered rows. This annotation does **not** count as PRD persistence and does **not** require a version bump — include `docs/prd/questions/open-questions.md` in the Patch Intent Summary’s **Files to change** when applicable.
-
-`/prd update` is a structured persistence workflow. It is not implementation, specs, tickets, or architecture — SISO must not block it. It still requires explicit persistence approval through a Patch Intent Summary or full PRD Delta Proposal.
-
-### Default: Patch Intent Summary
-
-For low-risk patches where **all** of the following are true, produce a **Patch Intent Summary** instead of a full PRD Delta Proposal:
-
-- Content to persist is already present in prior discovery notes, answered questions, or the immediately preceding convergence proposal.
-- The update is a PRD/status/state patch, not a version bump.
-- No group is being promoted to `committed`.
-- No implementation specs, tickets, architecture, or code will be created.
-- `history.md` and `archive/` will not be touched.
-- The patch can be applied mechanically from existing project context.
-
-**Patch Intent Summary format:**
-
-```txt
-Patch Intent Summary
-
-Files to change:
-- docs/prd/PRD.md — <short description>
-- docs/prd/state.md — <short description>
-- docs/prd/questions/open-questions.md — <only when supersession annotations are required — short description>
-
-Files not touched:
-- docs/prd/history.md
-- docs/prd/archive/
-- docs/prd/notes/
-- docs/prd/questions/open-questions.md — <omit this line when it appears under Files to change>
-- docs/product-decisions/
-
-Patch type:
-- patch | version bump
-
-Content source:
-- <notes file / answered questions / convergence proposal / user-approved checkpoint>
-
-Safety:
-- no status promoted to committed
-- no implementation specs/tickets/architecture
-- no history/archive update
-- unresolved blockers remain listed
-- answered-queue rows are never deleted — supersession annotations only
-
-Approval required:
-Reply `approved` to apply.
-Reply `preview` to see the full before/after diff first.
-```
-
-**Hard rule:** Do not print full PRD sections in chat during Patch Intent Summary mode.
-
-### When to use full PRD Delta Proposal
-
-Use a full PRD Delta Proposal with exact Before/After only when:
-
-- User explicitly replies `preview`
-- Version bump
-- `history.md` or `archive/` will be touched
-- Deleting existing content
-- Replacing an already active non-scaffold PRD section
-- Promoting status to `validated`, `committed`, or implementation-ready
-- Changing ICE by more than ±1
-- Changing source of truth, buyer surface, merchant surface, payment model, or market/language after they were already persisted
-- User explicitly asks to review exact wording before write
-
-Otherwise, prefer Patch Intent Summary.
-
-### Approval behavior
-
-If the previous assistant turn contained a **Patch Intent Summary**:
-- `approved` — apply the patch described in the summary
-- `preview` — show the full PRD Delta Proposal with exact Before/After
-- `cancel` — stop the update
-
-If the previous assistant turn contained a **full PRD Delta Proposal**:
-- `approved` — apply the exact delta
-
-Never accept `ok` alone as persistence approval.
-
-If no Patch Intent Summary or PRD Delta Proposal exists in the immediately preceding turn, respond:
-
-```txt
-No Patch Intent Summary or full PRD Delta Proposal exists yet.
-
-Run `/prd update` with a clear persistence target, or run `/prd converge` first if the content has not been synthesized yet.
-```
-
-### Output after writing
-
-After `approved`, write files immediately. Do not reprint the full written content.
-
-**Final response format:**
-
-```txt
-Updated:
-- <file> — <short change>
-- <file> — <short change>
-
-Not touched:
-- <file/group>
-- <file/group>
-
-Remaining open questions:
-- <Q-ID if any> — <question>
-or
-- None
-
-Next recommended command:
-- /prd questions | /prd challenge | /prd converge | /prd prioritize
-```
-
-**Hard rule:** Do not echo full PRD content after writing. The file is the source of truth.
-
-### Procedure
-
-0. **PRD Lead pre-flight** — on initial invocation, PRD Lead produces the PRD Context Brief (see Pre-flight step 4). PRD Builder skill acts after the brief is available. Skip on `approved`, `preview`, or `cancel` responses.
-1. PRD Builder skill assesses whether Patch Intent Summary or full PRD Delta Proposal is required (see rules above).
-2. Produce the appropriate format and wait for approval.
-3. Challenger verifies every addition has a paired cut, deferral, or kill criterion.
-4. **Surface readiness check** — for any group whose Status is being written or promoted:
-   - If any required surface field (buyer entry point, buyer-facing surface, merchant operating surface, source of truth, market/language) is UNKNOWN, Status MUST be `validated-with-open-surface` (not `validated`, not `committed`) and the `Surface Blockers` list MUST be persisted verbatim.
-   - Confidence in the persisted ICE tuple MUST respect the surface cap (≤ 4 when applicable).
-   - A promotion to `validated` or `committed` requires written confirmation that all required surface fields are resolved.
-5. On `approved`, apply the smallest edit. Output only the compact final response format — do not echo file content. If version bump: add a row to `docs/prd/history.md`, copy current PRD.md to `docs/prd/archive/PRD-v<N>.md`, then update PRD.md + state.md. When the persisted delta supersedes older **Answered** queue facts, apply matching **supersession annotations** to `docs/prd/questions/open-questions.md` in the same approval (capture artifact only; never delete rows).
-
-**A PRD patch is not a version bump.** Do not write `docs/prd/history.md` or `docs/prd/archive/` for a patch unless the user explicitly approved those files.
-
-## Discovery artifacts
-
-Writes to `docs/prd/notes/` and `docs/prd/questions/open-questions.md` are **capture artifacts** — they are allowed in `discover`, `note`, and `questions` modes and must not be blocked by SISO. They are not PRD persistence and do not trigger version bumps.
-
-During `/prd update`, edits to `open-questions.md` are limited to **supersession annotations** (and similar reconciliation markers) when persisted PRD changes override older answered-queue facts — still capture artifacts, not a substitute for `PRD.md`.
-
-## Hard rules
-
-- Chat-first, deltas over rewrites.
-- No technical architecture or implementation.
-- No writes to `PRD.md`, `state.md`, or `history.md` outside `update` mode.
-- No version bumps without the triggers in `10-prd-discovery.mdc`.
-- Drift between conversation and state.md is surfaced, not silently absorbed.
-- Never delete **Answered** rows in `docs/prd/questions/open-questions.md`; supersede via annotation only (see `.cursor/commands/prd-questions.md`).
-- No persistence of `validated` / `committed` while required surface fields are UNKNOWN. Use `validated-with-open-surface` and persist the blockers.
-- No implementation specs, tickets, or architecture work derived from a `validated-with-open-surface` group unless the user has explicitly waived the specific blocker in writing.
+**Pre-flight summary:** Before `converge` / `challenge` / `prioritize` / `update`, optionally output a short **PRD Context Brief** (5–8 bullets): direction, users, feature groups, open Q ids, contradictions. No separate agent file—inline only.
diff --git a/.cursor/hooks.json b/.cursor/hooks.json
deleted file mode 100644
index fcb4d66..0000000
--- a/.cursor/hooks.json
+++ /dev/null
@@ -1,4 +0,0 @@
-{
-  "version": 1,
-  "hooks": {}
-}
\ No newline at end of file
diff --git a/.cursor/hooks/before-submit-prompt.mdc b/.cursor/hooks/before-submit-prompt.mdc
deleted file mode 100644
index 21eb2ef..0000000
--- a/.cursor/hooks/before-submit-prompt.mdc
+++ /dev/null
@@ -1,14 +0,0 @@
-# Deprecated PRD routing hook
-
-This hook is intentionally inactive.
-
-PRD routing is handled by:
-- `.cursor/commands/prd.md`
-- `.cursor/rules/00-siso.mdc`
-- `.cursor/rules/10-prd-discovery.mdc`
-- `.cursor/rules/11-prd-question-loop.mdc`
-- `.cursor/skills/prd/prd-builder/SKILL.md`
-
-Do not implement PRD discovery, SISO, convergence, update, or routing logic in hooks.
-
-Hooks are reserved for lightweight lifecycle safeguards only.
diff --git a/.cursor/rules/00-siso.mdc b/.cursor/rules/00-siso.mdc
deleted file mode 100644
index 1eb15f3..0000000
--- a/.cursor/rules/00-siso.mdc
+++ /dev/null
@@ -1,91 +0,0 @@
----
-description: SISO — validate input quality before execution.
-alwaysApply: true
----
-
-# SISO — Shit Input → Shit Output
-
-## Core Principle
-
-Low-quality input produces low-quality execution. Unclear, contradictory, or underspecified requests must never silently trigger planning, coding, refactoring, or architecture decisions.
-
-SISO is the highest-priority execution safety rule. It overrides speed bias, execution bias, and speculative implementation.
-
-## When SISO Applies
-
-SISO blocks **substantive execution only**: modifying files, creating architecture, scaffolding, refactoring, dependency installation, build/test execution, multi-step automation.
-
-SISO does NOT block: conversation, brainstorming, product discussion, clarification questions, lightweight inspection, or reading explicitly referenced files.
-
-## Failure Signals
-
-Block execution when any of these exist:
-
-- **Missing scope** — "fix it", "improve this", "make it scalable" without a target
-- **Missing success criteria** — no definition of "done"
-- **Hidden context dependency** — assumes undocumented rules, prior conversations, or invisible state
-- **Contradictory goals** — maximum flexibility + strict determinism, without tradeoff priority
-- **Undefined authority** — unclear whether changes to architecture, APIs, or contracts are allowed
-- **Dependency ambiguity** — unknown blockers, prerequisites, or external integrations
-- **Speculative language** — "maybe", "probably", "something like", "AI magic" in execution-critical areas
-
-## Response Strategy
-
-When input is insufficient:
-
-1. **Stop.** Do not invent requirements or silently choose tradeoffs.
-2. **Identify the gap.** State what is missing, why it matters, what decision is blocked.
-3. **Ask targeted questions.** Minimum required to safely proceed — scope, constraints, expected output, authority.
-4. **Optional: narrow assumptions.** Only when reversible, low-risk, explicitly declared. Never to bypass critical ambiguity.
-
-## Severity Levels
-
-- **GREEN** — Clear enough to proceed safely.
-- **YELLOW** — Some ambiguity. Clarification recommended before large execution.
-- **ORANGE** — High risk of incorrect implementation. Pause until clarified.
-- **RED** — Too ambiguous or contradictory to execute responsibly.
-
-## Waiver
-
-Ambiguity is accepted only when the user explicitly validates assumptions, answers clarification questions, or says "proceed anyway" / "use your judgment." Even then, avoid irreversible decisions under uncertainty.
-
-## Request Mode Classification
-
-Before applying SISO blocking, classify the request:
-
-**CHAT** — conversation, brainstorming, thinking aloud, exploring ideas. Do not block.
-
-**DISCOVERY** — clarifying product direction, PRD discussion, strategy, requirements exploration. Generating rules, skills, agents, or governance workflows counts as discovery. Do not block. Surface ambiguity as discussion points, not blockers.
-
-Architecture discussion, agent definition, PRD methodology, workflow design, governance rules, process deltas, and skill authoring are all **DISCOVERY** — unless the user explicitly requests direct file mutation, creation of execution specs, or commitment to an implementation plan.
-
-**EXECUTION** — concrete work: code changes, file edits, implementation, scaffolding, refactoring, dependency installation, spec generation for execution, architecture decisions to be acted on. Apply full SISO.
-
-SISO blocks only when `REQUEST_MODE = EXECUTION AND INPUT_QUALITY = ORANGE or RED`.
-
-The more autonomous the system, the stricter SISO must be — automation amplifies bad assumptions.
-
-## PRD Discovery Exception
-
-Any input during `/prd discover`, `/prd note`, `/prd questions`, or informal PRD discussion (product thinking, raw founder input, booking flow clarification, etc.) is always **DISCOVERY** regardless of how rough, incomplete, or ambiguous it is.
-
-- Do **not** block rough input.
-- Do **not** return `SISO_STATUS: ORANGE` or `RED`.
-- Treat the message as raw discovery material.
-- Append it to the active discovery note.
-- Update the question queue if relevant.
-- Ask one follow-up question maximum.
-
-`/prd update` is a structured PRD persistence workflow. It is not implementation, specs, tickets, architecture, dependency installation, terminal execution, or code mutation. SISO must not block `/prd update` as execution. However, `/prd update` still requires explicit persistence approval through a Patch Intent Summary + `approved`, or a full PRD Delta Proposal + `approved`. Never treat `ok` as persistence approval.
-
-SISO blocking applies in these PRD contexts **only** when the user explicitly requests:
-- implementation specs, tickets, or architecture intended for execution
-- code changes or dependency installation
-
-**UX flow and product surface statements are always DISCOVERY.** Descriptions of buyer journey, checkout interaction patterns, payment surface choices (iframe, redirect, modal), or product-level decisions stated during discovery are raw product direction — not implementation specs. Do not block them.
-
-**Discovery note and question queue writes** (`docs/prd/notes/`, `docs/prd/questions/open-questions.md`) are capture artifacts — they are always allowed during discovery and must never be blocked.
-
-## Anti-Patterns
-
-Never: simulate understanding, fake confidence, generate architecture from vague intent, infer business rules silently, confuse motion with progress, or explore repositories indefinitely instead of clarifying.
diff --git a/.cursor/rules/10-prd-discovery.mdc b/.cursor/rules/10-prd-discovery.mdc
deleted file mode 100644
index 542474b..0000000
--- a/.cursor/rules/10-prd-discovery.mdc
+++ /dev/null
@@ -1,146 +0,0 @@
----
-globs: docs/prd/**,.cursor/commands/prd.md,.cursor/skills/prd/**
-alwaysApply: false
----
-
-# PRD Governance
-
-## Philosophy
-
-Product definition is an evolving conversation. Chat-first, structured persistence second.
-
-- Natural discussion and brainstorming are expected
-- Do not force rigid questionnaires
-- Do not collapse into technical implementation unless the user explicitly switches
-
-## Delta Principle
-
-PRDs are updated via **deltas**, not rewrites.
-
-Flow: conversation → discovery → PRD delta proposal → human validation → write (when warranted).
-
-## Surface Discipline
-
-A PRD that names *what* the product does without naming *where* it lives is not ready for implementation.
-
-Before any feature group is treated as implementation-ready, its **product surface** must be explicit: primary market/language, buyer entry point, buyer-facing surface, merchant operating surface, source of truth, confirmation channel, and (if money is involved) payment model. The full gate lives in `.cursor/skills/prd/prd-builder/SKILL.md` §3.0.5.
-
-- UNKNOWN is a valid answer during discovery. Silent inference is not.
-- A group with one or more UNKNOWN required surface fields persists as `validated-with-open-surface` (not `validated`), with explicit `Surface Blockers` listed.
-- ICE Confidence is capped at 4 when buyer entry point, buyer-facing surface, merchant operating surface, source of truth, or market/language is UNKNOWN.
-- Implementation specs, tickets, or architecture derived from a `validated-with-open-surface` group require an explicit, written user waiver of the specific blocker.
-
-The Challenger agent enforces these checks (`FALSE CONVERGENCE RISK` reports). `/prd update` refuses to persist `validated` / `committed` while required surface fields remain UNKNOWN.
-
-## Templates
-
-Canonical reusable document templates live under `.cursor/templates/prd/`. Project docs under `docs/prd/` and `docs/product-decisions/` are generated or edited project instances. Do not treat project docs as workflow templates. When initializing a missing PRD doc, question queue, note, history file, state file, or product decision, copy/adapt from `.cursor/templates/prd/` first.
-
-## Canonical Templates
-
-Canonical reusable document templates live under `.cursor/templates/prd/`.
-
-Project files under `docs/prd/` and `docs/product-decisions/` are generated or edited project instances, not template sources.
-
-Do not use `docs/prd/notes/README.md`, `docs/prd/questions/open-questions.md`, `docs/prd/PRD.md`, `docs/prd/state.md`, `docs/prd/history.md`, or `docs/product-decisions/*.md` as canonical templates.
-
-When creating or reinitializing a discovery note, use `.cursor/templates/prd/discovery-note.template.md`.
-
-When creating or reinitializing the open question queue, use `.cursor/templates/prd/open-questions.template.md`.
-
-When creating or reinitializing PRD/state/history/product-decision files, use the matching file under `.cursor/templates/prd/`.
-
-Existing files under `docs/` may be read as project context, but not copied as reusable templates.
-
-`docs/prd/notes/README.md` is allowed to explain the local notes folder for humans, but it is not the source of truth for the note entry format. If it conflicts with `.cursor/templates/prd/discovery-note.template.md`, the `.cursor/templates/` version wins.
-
-## PRD State
-
-Before proposing changes, read persisted state:
-
-- `docs/prd/PRD.md` — the active PRD (always current)
-- `docs/prd/state.md` — version, direction summary, last major change
-
-If missing or stale, offer to initialize from `.cursor/templates/prd/` — do not assume an unwritten PRD.
-
-## Bootstrap from templates
-
-`.cursor/**` must be sufficient to regenerate the PRD docs workspace.
-
-If `docs/**` is missing, incomplete, or empty:
-- do not infer project state
-- do not use stale memory
-- run or suggest `/prd init`
-- initialize from `.cursor/templates/prd/`
-- never copy from existing `docs/**` as template source
-
-Required bootstrap targets:
-- `docs/prd/PRD.md`
-- `docs/prd/state.md`
-- `docs/prd/history.md`
-- `docs/prd/archive/.gitkeep`
-- `docs/prd/notes/`
-- `docs/prd/questions/open-questions.md`
-- `docs/product-decisions/README.md`
-
-Non-empty project docs must not be overwritten.
-
-## Version Bumps
-
-Create a new version only when:
-
-- Target users or primary problem shifts
-- Business model changes
-- Product scope materially expands, cuts, or re-prioritizes
-- Core workflows or strategic direction change
-- Major assumptions are invalidated
-
-Do not bump for typo fixes, small clarifications, or minor refinements — patch in place.
-
-When bumping, follow this sequence:
-1. Add a row to `docs/prd/history.md` (version, date, why)
-2. Copy current `PRD.md` to `docs/prd/archive/PRD-v<N>.md`
-3. Update `PRD.md` with new content and increment frontmatter version
-4. Update `state.md`
-
-Old versions stay readable in `archive/`.
-
-## Convergence vs Persistence
-
-Discovery artifacts are **not** PRD persistence.
-
-| Artifact | Location | Allowed in |
-|---|---|---|
-| Raw captured input | `docs/prd/notes/` | `discover`, `note`, `questions` |
-| Question queue | `docs/prd/questions/` | `discover`, `note`, `questions` |
-| Synthesis proposal | chat only | `converge` |
-| PRD persistence | `docs/prd/PRD.md`, `state.md`, `history.md`, `archive/` | `update` only, after Patch Intent Summary or full PRD Delta Proposal approval |
-
-`/prd converge` must never write `PRD.md`, `state.md`, `history.md`, or `archive/`.
-
-`/prd update` must never discover new content. If new content appears during an update turn, stop and return to `/prd note` or `/prd converge`.
-
-**Patch behavior:**
-- `PRD.md` and `state.md` patches are allowed only after an approved Patch Intent Summary or full PRD Delta Proposal.
-- `history.md` and `archive/` updates are allowed only for approved version bumps, or explicitly approved scaffold archival.
-- Scaffold is **never** archived automatically.
-
-**Status precision.** Do not say "all groups validated" if any group status is `exploratory`, `validated-with-open-surface`, `unvalidated`, or `candidate`. Use exact status language at all times.
-
-## Real-time capture vs persisted PRD
-
-The workflow has two write speeds:
-
-**1. Real-time capture** (low risk — always allowed during discovery):
-- `docs/prd/notes/` — written immediately during `/prd discover`, `/prd note`, and `/prd questions`
-- `docs/prd/questions/open-questions.md` — updated immediately during discovery
-
-**2. Persisted PRD** (gated — only through `/prd update` after approval):
-- `docs/prd/PRD.md`
-- `docs/prd/state.md`
-- `docs/prd/history.md`
-- `docs/prd/archive/`
-
-For persisted PRD writes, prefer **Patch Intent Summary** for low-risk patches. Use full Before/After only for risky changes or when the user explicitly replies `preview`.
-
-**The assistant must avoid duplicating large PRD content in chat.** Chat carries intent, risks, and approval state. Files carry the full document content.
diff --git a/.cursor/rules/11-prd-question-loop.mdc b/.cursor/rules/11-prd-question-loop.mdc
deleted file mode 100644
index ea5bfa3..0000000
--- a/.cursor/rules/11-prd-question-loop.mdc
+++ /dev/null
@@ -1,166 +0,0 @@
----
-description: Human-first PRD discovery question loop.
-globs: docs/prd/**,.cursor/commands/prd.md,.cursor/commands/prd-questions.md,.cursor/skills/prd/**
-alwaysApply: false
----
-
-# PRD Question Loop
-
-During PRD discovery, do not immediately convert every user input into PRD structure.
-
-The default discovery behavior is:
-
-```txt
-raw user input → discovery note → question queue → one next question
-```
-
-## Templates
-
-Canonical template rules live in `.cursor/rules/10-prd-discovery.mdc`.
-
-Use `.cursor/templates/prd/` as the only reusable source for generated PRD docs.
-Never use `docs/**` files as templates.
-
-## Files
-
-Use:
-
-- `docs/prd/notes/YYYY-MM-DD-<topic>-discovery-note.md`
-- `docs/prd/questions/open-questions.md`
-
-Create them if missing during `/prd discover`, `/prd note`, or `/prd questions` — initialize from `.cursor/templates/prd/discovery-note.template.md` and `.cursor/templates/prd/open-questions.template.md` respectively.
-
-## Bootstrap fallbacks
-
-If `docs/prd/questions/open-questions.md` is missing or empty during `/prd questions`, initialize it from `.cursor/templates/prd/open-questions.template.md`.
-
-If `docs/prd/notes/` is missing during `/prd note` or `/prd discover`, create the directory. Create the first note from `.cursor/templates/prd/discovery-note.template.md` only when there is actual user input to capture.
-
-Do not touch:
-- existing non-empty docs
-- specs
-- tickets
-- code
-- architecture
-
-## Discovery note format
-
-Append every meaningful user insight as meeting-style notes:
-
-```md
-## <YYYY-MM-DD HH:mm> — <short title>
-
-### Raw user input
-> <exact user wording>
-
-### Interpreted product insight
-<1–3 lines>
-
-### PRD implication
-<1–3 lines>
-
-### New / updated questions
-- <Q-ID if created or updated>
-```
-
-Do not rewrite old notes unless correcting a clear interpretation error.
-
-## Open question format
-
-Maintain `docs/prd/questions/open-questions.md`:
-
-```md
-# PRD Open Questions
-
-## Active queue
-
-| ID | Status | Priority | Question | Source note | Blocks |
-|---|---|---:|---|---|---|
-
-## Answered
-
-| ID | Answered at | Question | Answer | PRD impact |
-|---|---|---|---|---|
-```
-
-## One-question loop
-
-When there are open questions:
-
-1. Read `docs/prd/questions/open-questions.md`.
-2. Ask only the highest-priority `open` question.
-3. Do not ask multiple questions unless the user explicitly requests a full checklist.
-4. Do not run full Surface Gate, ICE, DoD, or Challenger tables unless explicitly requested.
-5. After the user answers, update:
-   - discovery note
-   - question status
-   - interpreted answer
-   - PRD implication
-6. Then ask the next highest-priority open question.
-
-## Question status
-
-Allowed statuses:
-
-- `open`
-- `answered`
-- `deferred`
-- `blocked`
-- `obsolete`
-
-## Priority scale
-
-- `1` = blocks current product understanding
-- `2` = blocks PRD convergence
-- `3` = blocks implementation specs
-- `4` = nice-to-know
-
-Ask lower numbers first. Among equal-priority questions, ask in ID order.
-
-## Human-first rule
-
-During discovery, messy input is valid input.
-
-Do not block informal language, typos, fragments, contradictions, or rough founder thinking.
-
-Capture it, interpret it, and ask one follow-up question.
-
-## Empty queue invariant
-
-An empty `Active queue` does not mean discovery questions are complete.
-
-Before saying:
-
-```txt
-No remaining open discovery questions.
-
-Next recommended step:
-- /prd converge
-```
-
-you MUST:
-
-1. Scan `docs/prd/PRD.md` using the **PRD blocker scan** in `.cursor/commands/prd-questions.md` (sections: Surface Blockers; MVP Completeness Checklist; Open before implementation-readiness; Risks & Assumptions; Success Metrics; Integration Boundaries; Configuration Matrix).
-2. If the scan finds unresolved blockers, TBD fields, provider TBDs, validation-needed items, or explicit “open” items not already covered by the queue, append deduplicated `open` rows to `docs/prd/questions/open-questions.md` and ask **only** the highest-priority new question.
-3. Output the “No remaining open discovery questions” + `/prd converge` message **only** when the Active queue has no `open` rows **after** that scan and repopulation.
-
-Never tell the user to manually add PRD blockers via `/prd note` instead of running this scan.
-
-## When to stop
-
-If the mandatory PRD blocker scan (see `.cursor/commands/prd-questions.md`) finds nothing to add **and** the Active queue has no `open` rows, respond **exactly**:
-
-```txt
-No remaining open discovery questions.
-
-Next recommended step:
-- /prd converge
-```
-
-Do not start convergence automatically. Do not jump to `/prd update`. Wait for the user to invoke `/prd converge` explicitly.
-
-When `/prd converge` is later invoked, it must synthesize **only one primary feature group candidate** and ask **one validation question**.
-
-## Discovery writes are allowed
-
-Writes to `docs/prd/notes/` and `docs/prd/questions/open-questions.md` are **capture artifacts**, not PRD persistence or implementation. They are allowed in discovery mode and must not be blocked by SISO.
diff --git a/.cursor/rules/execution-loop.mdc b/.cursor/rules/execution-loop.mdc
deleted file mode 100644
index c4f9026..0000000
--- a/.cursor/rules/execution-loop.mdc
+++ /dev/null
@@ -1,209 +0,0 @@
----
-description: Governs the autonomous Zedos `/execute-prd` loop — queue, blockers, lock, logging, checker gates, and stop-before-implementation safety.
-globs:
-  - docs/WORK_QUEUE.md
-  - docs/BLOCKERS.md
-  - docs/EXECUTION_LOG.md
-  - docs/EXECUTION_LOCK.md
-  - docs/POINTS_OF_ATTENTION.md
-  - docs/product/**
-  - docs/prd/**
-alwaysApply: false
----
-
-# Execution Loop — Zedos PRD Execution Workflow
-
-## 1. Purpose
-
-Operational governance for iterating product scope toward implementation **without** inventing product truth, skipping hierarchy levels, bypassing humans, or starting code.
-
-This rule complements:
-
-- `.cursor/rules/00-siso.mdc` — request quality and EXECUTION vs DISCOVERY classification
-- `.cursor/rules/feature-area-workflow.mdc` — PRD → Feature Area → Scope Slice → User Story → Spec → Task
-- `.cursor/checkers/scope-readiness-checker.md` — **only** source of readiness verdicts (`CLEAR` / `BLOCKED`)
-
-Command: `.cursor/commands/execute-prd.md`  
-Operational skill: `.cursor/skills/execution-loop/SKILL.md`
-
----
-
-## 2. Rebuild state sources (scan)
-
-On every **`scan`** (and before trusting queue rows for **`next` / `run-one` / `loop`**), re-read and reconcile:
-
-| Source | Use |
-|--------|-----|
-| `docs/prd/state.md` | Version, direction, last change |
-| `docs/prd/PRD.md` | Product ground truth |
-| `docs/prd/questions/open-questions.md` | Active blockers/questions |
-| `docs/product/feature-areas/*.md` | Feature Area rows for `WORK_QUEUE` |
-| `docs/product/scope-slices/*.md` | Scope Slice rows |
-| `docs/product-decisions/README.md` | Durable decisions (if present) |
-| Existing `docs/BLOCKERS.md` | Preserve Resolution history; reconcile open rows |
-
-**Do not infer** statuses or flags that are absent in sources; default **`NEED_HUMAN: false`** and **`NEED_UPDATE: false`** for queue derivation when no explicit marker exists.
-
----
-
-## 3. `docs/WORK_QUEUE.md` schema
-
-Maintain a single table:
-
-`| ID | Type | Parent | Status | Priority | NEED_HUMAN | NEED_UPDATE | Blocked By | Next Action |`
-
-**Types:** `Feature Area`, `Scope Slice`, `User Story`, `Spec`, `Task`, `Test`, `Review`
-
-**Statuses:** `candidate`, `exploratory`, `ready`, `active`, `blocked`, `done`, `deferred`
-
-**Priority column:** Product band **`P0`–`P4`** (Zedos mapping below), not checker pass order.
-
-**Parent:** Empty for Feature Area; parent **queue ID** for children (e.g. Scope Slice parent = `FA-*`).
-
-**Blocked By:** Semicolon-separated **blocker IDs** from `docs/BLOCKERS.md` (must match blocker **Scope** to this row’s artifact level).
-
-### Status mapping from artifacts
-
-When rebuilding from Feature Area / Scope Slice files:
-
-- Feature Area frontmatter **`Status: validated`** → queue **`ready`** (ready for slice decomposition / slice advancement per workflow).
-- Feature Area **`exploratory`**, **`blocked`**, **`deferred`** → align queue **`exploratory`**, **`blocked`**, **`deferred`** respectively.
-- Scope Slice **`exploratory`** / **`blocked`**, **`deferred`**, **`ready-for-user-stories`** → queue **`exploratory`**, **`blocked`**, **`deferred`**, **`ready`** respectively.
-
----
-
-## 4. Product priority bands (queue `Priority`)
-
-| Band | Feature Areas |
-|------|----------------|
-| **P0** | Account & session → `FA-account-session`; Dashboard shell → `FA-dashboard-shell` |
-| **P1** | Project workspace → `FA-project-workspace`; PRD versioning → `FA-prd-versioning` |
-| **P2** | Guided clarification → `FA-guided-clarification`; Question history → `FA-question-history` |
-| **P3** | Read-only sharing → `FA-read-only-sharing`; Owner milestone feedback → `FA-owner-milestone-feedback` |
-| **P4** | Credit system → `FA-credit-system`; Payments → `FA-payments` |
-
-Derive **`SS-*`** row priority from its parent Feature Area’s band.
-
----
-
-## 5. Selection priority order (checks **a–j**)
-
-When choosing the **next eligible** queue row (after excluding rows blocked per §6):
-
-**a.** If `docs/EXECUTION_LOCK.md` indicates **`stale: true`** → follow §8 stale handling before selecting new work.
-
-**b.** Rows with **`NEED_UPDATE: true`** at **artifact or workflow** scope (see §14) — surface in `POINTS_OF_ATTENTION`; block **their** subtree until resolved or explicitly deferred in queue + log.
-
-**c.** Rows in **`active`** matching a valid non-stale lock (§7) continue until the logged step completes or the lock is released.
-
-**d.** **`P0`** before **`P1`** before **`P2`** before **`P3`** before **`P4`**.
-
-**e.** Advancement frontier: prefer completing **earlier** hierarchy stages before later — **Feature Area readiness** → **Scope Slice refinement or promotion** → (future, when governance permits) User Story → Spec → Task — never skip levels (`feature-area-workflow` §3 hierarchy).
-
-**f.** Within the same **`P*`** band, prefer **deepest ready child** where the parent subtree is eligible — e.g. a **`ready`** or **`exploratory`** Scope Slice under a **`validated`** parent — **unless** blocker policy (§6) removes the subtree.
-
-**g.** Among peers, prefer **`ready`** then **`exploratory`** then **`candidate`** over **`deferred`**.
-
-**h.** Rows with **`NEED_HUMAN: true`** remain in queue for traceability but are **ineligible for autonomous `run-one` / `loop`** resolution; siblings stay eligible (**§6**).
-
-**i.** Respect **`/feature-area`** gates: Feature Area **`validated`** before Scope Slice **file creation**; Scope Slice **`ready-for-user-stories`** before creating User Story rows (when that phase is opened by governance).
-
-**j.** Idle: nothing eligible remains → **`stop`** (**§11**); recommend **`/execute-prd scan`** after human or PRD edits.
-
----
-
-## 6. Blocker semantics — **non-blocking for siblings**
-
-A blocker impedes **only** the blocked artifact and **its descendant queue rows** (Subtree rule).
-
-- **`Scope: scope-slice`** → blocks that slice and future children (stories onward), **not** sibling slices, **unless** a separate blocker row targets those.
-- **`Scope: feature-area`** → blocks that Feature Area queue row and **all** rows whose **Parent** chain includes that FA ID.
-- **`Scope: global`** → blocks all rows until resolved or explicitly waived with human acknowledgment in **`EXECUTION_LOG`**.
-
-**Siblings** (same parent, not under blocked subtree) and **other Feature Areas** remain eligible per §5.
-
-Record load-bearing flags in **`docs/BLOCKERS.md`** with correct **Scope**.
-
----
-
-## 7. `docs/BLOCKERS.md` schema
-
-Table:
-
-`| ID | Scope | Artifact | Reason | NEED_HUMAN | NEED_UPDATE | Created | Resolution |`
-
-**Scope values:** `global`, `feature-area`, `scope-slice`, `user-story`, `spec`, `task`, `test`, `review`
-
-**ID:** Stable **`B-NNN`**.
-
-**Resolution:** Blank until resolved; fill with date + outcome — retaining history is preferred over silent delete.
-
-Synchronize **`WORK_QUEUE.Blocked By`** with open blocker **`ID`** values.
-
----
-
-## 8. `docs/EXECUTION_LOCK.md`
-
-Template fields:
-
-- **`active_item_id`** — Queue **ID**, or **`none`**
-- **`type`** — Queue type or **`none`**
-- **`parent_chain`** — YAML list or comma-separated ancestor queue IDs (`[]` if none)
-- **`current_action`** — One bounded governance action (skill enumerates examples)
-- **`started_at`** — ISO date (**`YYYY-MM-DD`** minimum)
-- **`allowed_files`** — Paths or globs the agent may touch while locked
-- **`forbidden_files`** — Default: product **implementation** trees (`src/**`, `app/**`, `packages/**`, `lib/**`) — forbid unless governance explicitly expands scope (**v0:** always forbid implementation)
-- **`stale`** — Boolean
-
-### Stale lock handling
-
-Treat lock as **`stale: true`** when **any** of:
-
-1. **`started_at`** more than **24 hours** before current run (calendar, repo host TZ → use ISO date consistency).
-2. **`active_item_id`** absent from **`WORK_QUEUE`** after a **`scan`**, or **Status** incompatible with **`current_action`**.
-3. Preconditions for **`current_action`** failed and lock was left set.
-
-Actions:
-
-1. Set **`stale: true`**; **`active_item_id` → `none`**; **`type` → `none`**; **`parent_chain` → `[]`**; set **`current_action`** to **`Stale lock released`** (optional short reason in lock body).
-2. Append **`EXECUTION_LOG`** explaining release.
-3. Do not execute **`run-one` / `loop`** against stale lock semantics — **`next`** after release.
-
----
-
-## 9. `docs/EXECUTION_LOG.md`
-
-Append-only table:
-
-`| Timestamp | Mode | Item | Action | Outcome | Notes |`
-
-Modes: `init`, `scan`, `next`, `run-one`, `loop`, `system`.
-
----
-
-## 10. `docs/POINTS_OF_ATTENTION.md`
-
-`| ID | Source | Severity | Note | Acknowledged |`
-
-Severity examples: **`info`**, **`watch`**, **`risk`**.
-
----
-
-## 11. Stop conditions (autonomous **`loop`**)
-
-Stop when:
-
-1. **Implementation boundary:** Writing **application runtime code**, adding **runtime deps**, or materializing **`User Story`**, **`Spec`**, **`Task`**, **`Test`** queue artifacts **beyond** explicitly opened governance (**current:** stop **before** these; loop performs **feature-area**, **checker**, queue, blocker, lock, log steps only — **§12**).
-2. **Eligible set empty** after **`scan`**.
-3. **Stall:** **3** successive iterations with identical **`next`** result and no **`run-one`** progress — log **`stall`**.
-4. **Subtree blocked** and no eligible sibling or other FA under current priority band (**normal idle**).
-
----
-
-## 12. Safety invariants
-
-1. **No implementation without governance path.** No production code paths on this loop (**v0**).
-2. **No `NEED_HUMAN` bypass** — resolving human flags requires **human** edits + **`EXECUTION_LOG`** + blocker **Resolution**.
-3. **No readiness without checker** — no claiming **`CLEAR`** or promotion-equivalent semantics without **`/feature-area check`** (**FA** or **SS** as applicable) or the same checklist text from **`scope-readiness-checker.md`** inlined in audit output (**feature-area-workflow** + checker).
-4. **`NEED_UPDATE` on workflow** — if **rules**, **templates**, or **`scope-readiness-checker`** cannot evaluate an artifact (**feature-area-workflow** §7), set **`NEED_UPDATE: true`**, log, add **`POINTS_OF_ATTENTION`**; subtree work that depends on advancement **must not** forge ahead with invented fixes.
-5. **SISO (`00-siso.mdc`)** — autonomous loop stays in **workflow DISCOVERY ops** territory; switches to gated **EXECUTION** only where this rule + **`feature-area`** command explicitly permit file edits (**allowed_files** subset).
diff --git a/.cursor/rules/feature-area-workflow.mdc b/.cursor/rules/feature-area-workflow.mdc
deleted file mode 100644
index 098dc7d..0000000
--- a/.cursor/rules/feature-area-workflow.mdc
+++ /dev/null
@@ -1,283 +0,0 @@
----
-description: Governs the PRD → Feature Area → Scope Slice → User Story → Spec → Task decomposition workflow. Apply whenever an agent reads the PRD, decomposes product scope, produces Feature Areas or Scope Slices, or begins pre-spec work.
-globs:
-  - docs/product/**
-  - docs/prd/**
-  - .cursor/templates/product/**
-  - .cursor/checkers/**
-alwaysApply: false
----
-
-# Feature Area Workflow
-
-## 1. Purpose
-
-This rule prevents premature decomposition, hidden architecture, and task slicing before product scope is safely bounded.
-
-It applies to any agent turn that:
-- reads `docs/prd/PRD.md` for the purpose of planning features
-- produces Feature Area or Scope Slice documents
-- evaluates whether a group is ready for user stories
-- transitions product scope toward specs or tasks
-
----
-
-## 2. Required Read Order
-
-Before any decomposition work, read in this order:
-
-1. `docs/prd/state.md` — version, direction, last major change
-2. `docs/prd/PRD.md` — active product definition
-3. `docs/prd/questions/open-questions.md` — unresolved blockers
-4. `docs/product-decisions/README.md` — durable product decisions if any exist
-5. `docs/product/feature-areas/` — existing Feature Area files if any
-6. `docs/product/scope-slices/` — existing Scope Slice files if any
-
-Do not read step 3–6 as optional. Open blockers and prior decisions constrain all downstream work.
-
----
-
-## 3. Terminology
-
-Use this hierarchy exactly. Do not invent alternative terms.
-
-```
-Product
-→ Feature Area
-→ Scope Slice
-→ User Story
-→ Spec
-→ Task
-```
-
-### Feature Area
-
-A durable product capability cluster. Maps to a named user-facing concern, not a technical boundary.
-
-Examples for Zedos v0:
-- Auth & Account
-- Project Workspace
-- PRD Versioning
-- Clarification Loop
-- Dynamic Decision UI
-- Question History
-- Credit System
-- Payments
-- Sharing
-- Feedback
-- Dashboard Shell
-
-A Feature Area has: product intent, business objects, user journeys, candidate Scope Slices, and readiness status.
-
-### Scope Slice
-
-A constrained, deliverable cut inside a Feature Area.
-
-A Scope Slice must:
-- deliver recognizable user value on its own
-- have a clear boundary (explicit in/out)
-- be small enough to produce user stories and specs
-- not require architecture decisions to define
-
-If a Scope Slice cannot be fully described without naming technical layers, it is not ready.
-
-### Terminology Compatibility
-
-**"Feature Group" is legacy PRD language** produced by the PRD Builder skill during discovery and convergence.
-
-When transitioning from PRD to execution:
-
-- Convert each broad PRD Feature Group into one or more Feature Areas using this workflow.
-- Do not carry "Feature Group" naming into `docs/product/` artifacts **except** **PRD Source** (or equivalent) citations where `docs/prd/PRD.md` section title is literally *Feature Groups* — cite the § only.
-- A single PRD Feature Group may map to multiple Feature Areas — split before decomposing.
-- Do not create Scope Slices directly from a PRD Feature Group without first creating and validating a Feature Area.
-- New documents under `docs/product/` must use Feature Area / Scope Slice terminology exclusively in narrative, names, and tables.
-
-### PRD-allowed product-level terms
-
-Use **only** as **product** behavior or constraints grounded in **`docs/prd/PRD.md`** — not as architecture. Canonical list and rules: **Allowed product-level terms (PRD)** in `.cursor/checkers/scope-readiness-checker.md`.
-
-### Service
-
-A runtime or deployment boundary. Only use "service" when architecture has explicitly drawn runtime separation. Do not call a Feature Area a service.
-
-### Spec
-
-A behavioral specification. Produced from a validated Scope Slice. Describes observable behavior, not implementation.
-
-### Task
-
-A concrete unit of work derived from a Spec. Never derived directly from a Feature Area or the global PRD.
-
----
-
-## 4. Forbidden Actions
-
-The following are strictly forbidden at each layer:
-
-**At Feature Area stage:**
-- Creating tasks or user stories from a Feature Area before Scope Slices are defined
-- Creating Feature Area markdown under `docs/product/feature-areas/` **except** via `/feature-area scaffold` after user approval — forbidden
-- Editing Feature Area markdown **except** via `/feature-area scaffold` (creation/population from an approved map), `/feature-area promote <name>` (only the narrow validated transition defined in `.cursor/commands/feature-area.md`), or ordinary human/manual edits — forbidden for agents/commands
-- Naming architecture, services, or runtime boundaries
-- Treating a Feature Area as implementation-ready
-
-**At Scope Slice stage:**
-- Creating tasks before Scope Slices are marked `ready-for-user-stories`
-- Writing implementation specs before user stories
-- Inventing data models, API designs, or service boundaries
-- Naming third-party integrations as **implementation** (product-level constraints named in the PRD, including terms in **Allowed product-level terms (PRD)** in `.cursor/checkers/scope-readiness-checker.md`, are allowed when grounded in the PRD)
-- **Creating** Scope Slice markdown under `docs/product/scope-slices/` **except** via `/feature-area scaffold-slices` after user approval of the `/feature-area slice` proposal (with parent Feature Area `validated` and `NEED_HUMAN: false`), **or** ordinary human/manual use of the template — forbidden for agents/commands
-- **Editing** Scope Slice body content **except** via `/feature-area refine-slice` (allowed product-level sections only), **`/feature-area scaffold-slices`** (initial fill from approved proposal), **`/feature-area promote-slice`** (narrow transition only), or ordinary human/manual edits — forbidden for agents/commands
-
-**At all stages:**
-- Task slicing directly from `docs/prd/PRD.md`
-- Calling a product Feature Area a "service," "module," or "microservice"
-- Merging or skipping levels in the hierarchy
-- Proceeding past a known blocker without explicit user approval
-
----
-
-## 5. Readiness Gates
-
-### Feature Area lifecycle
-
-- A Feature Area in `exploratory` status **may** list candidate Scope Slices in its Candidate Scope Slices section (names + one-line descriptions only).
-- After `/feature-area validate <name>` returns **CLEAR**, **`/feature-area promote <name>`** may apply the predefined file updates (status, readiness checklist, verdict, changelog row) so the artifact matches `validated`; manual edits remain valid.
-
-### Scope Slice lifecycle
-
-- Formal Scope Slice documents (files under `docs/product/scope-slices/`) **may only be created** after the Feature Area is marked `validated`, via `/feature-area scaffold-slices <name>` after an approved `/feature-area slice` proposal, or by manually instantiating `.cursor/templates/product/scope-slice.template.md`. New files default to **`exploratory`** and are **not** story-ready until refined.
-- Scope Slice **product-level** sections not completed at scaffold (`UX States`, `Data Touched`, etc.) are completed with **`/feature-area refine-slice`**; **`/feature-area promote-slice`** applies the narrow **ready-for-user-stories** transition only after SS-01–SS-10 and CC-01–CC-05 are **CLEAR** per `.cursor/commands/feature-area.md`.
-- User stories may only be written after a Scope Slice is marked `ready-for-user-stories`.
-
-### Feature Area → Scope Slices
-
-A Feature Area may be decomposed into Scope Slices only when:
-
-- [ ] PRD section(s) that ground this area have been read
-- [ ] Product intent is stated in user-value terms (not technical terms)
-- [ ] Business objects touched are enumerated
-- [ ] User journeys affected are identified
-- [ ] In-scope and out-of-scope behaviors are separated
-- [ ] No open PRD blockers affect this area (`open-questions.md` checked)
-- [ ] Deferred behaviors are listed explicitly
-- [ ] Status is `validated` (not `exploratory`, `blocked`, or `deferred`)
-
-### Scope Slice → User Stories
-
-A Scope Slice may produce user stories only when:
-
-- [ ] Status is `ready-for-user-stories` (set via **`/feature-area promote-slice`** after **CLEAR**, or manual equivalent — not by `refine-slice` or `scaffold-slices` alone)
-
-- [ ] User value is stated without implementation language
-- [ ] Exact boundary is defined (included + excluded behaviors)
-- [ ] UX states are enumerated (empty, loading, error, success, edge cases)
-- [ ] Business objects touched are named
-- [ ] Credit / payment impact is assessed (even if "none")
-- [ ] Sharing / privacy surface is assessed
-- [ ] All dependencies are named and their readiness status is known
-- [ ] All blockers are either resolved or carry explicit `NEED_HUMAN=true`
-- [ ] Acceptance-level outcome is described (observable behavior, not code)
-
-### User Stories → Specs
-
-Only after the above Scope Slice gate passes. Specs must be behavioral — what the system does — not how it is built.
-
-### Specs → Tasks
-
-Only after specs are reviewed and accepted. Tasks must reference a spec. Tasks must never reference only a Feature Area or the PRD.
-
----
-
-## 6. Decomposition Rules
-
-### Feature Area decomposition
-
-When the PRD implies a single Feature Group that is too broad:
-
-1. List the distinct user-value clusters hidden inside it.
-2. Name each as a Feature Area using the terminology above.
-3. Do not create sub-areas or sub-groups — flatten to one level below Feature Area = Scope Slice.
-4. A Feature Area with more than ~5 candidate Scope Slices may itself be too broad — reconsider naming.
-
-### Scope Slice decomposition
-
-Each Scope Slice must answer:
-
-- What value does this deliver to the user?
-- Where does it stop? (explicit exclusions required)
-- What does it touch? (business objects, journeys, credit, sharing, feedback)
-- What must exist before this can be built? (dependencies)
-- What is unknown? (blockers requiring human decision)
-
-If a Scope Slice answers: "it depends on architecture decisions not yet made" → set status `blocked` and `NEED_HUMAN=true`.
-
-### v0 boundary enforcement
-
-Do not include in v0 Feature Areas or Scope Slices:
-- Multi-user collaboration / invites / roles
-- PDF export as a required "done" criteria
-- Subscription billing
-- Advanced share controls (password, expiry)
-- BYOK
-- Anonymous share viewer feedback prompts
-- Any surface described as "under construction" in the PRD
-
-If a Scope Slice candidate touches a deferred surface, mark it as `deferred` with a reference to the PRD exclusion.
-
----
-
-## 7. Blocker Rules
-
-### When NEED_HUMAN=true is required
-
-Set `NEED_HUMAN=true` when any of the following exist:
-
-- A product decision that would materially change scope is undecided
-- An open question in `docs/prd/questions/open-questions.md` directly blocks this area or slice
-- A Scope Slice boundary cannot be drawn without a business rule that hasn't been stated
-- An assumption is load-bearing and unvalidated (e.g., credit burn rates assumed but not confirmed)
-- Two valid interpretations of the PRD produce meaningfully different slices
-- Implementation choices (if made) would alter product scope or user value
-
-Do not proceed past `NEED_HUMAN=true` without explicit user approval.
-
-### When NEED_UPDATE=true is required
-
-Set `NEED_UPDATE=true` when any of the following exist:
-
-- This rule (`.cursor/rules/feature-area-workflow.mdc`) does not cover the current situation
-- A template in `.cursor/templates/product/` is missing or incomplete for the current task
-- The checker in `.cursor/checkers/scope-readiness-checker.md` cannot evaluate the current artifact
-- The PRD state or direction has changed since the current Feature Area or Scope Slice was created
-
-Do not silently work around a gap. Surface it.
-
----
-
-## 8. Artifact Locations
-
-| Artifact | Location | Template |
-|---|---|---|
-| Feature Area | `docs/product/feature-areas/<kebab-name>.md` | `.cursor/templates/product/feature-area.template.md` |
-| Scope Slice | `docs/product/scope-slices/<fa-kebab>--<slice-kebab>.md` | `.cursor/templates/product/scope-slice.template.md` |
-| PRD | `docs/prd/PRD.md` | `.cursor/templates/prd/PRD.template.md` |
-| Product Decisions | `docs/product-decisions/PD-NNN.md` | `.cursor/templates/prd/product-decision.template.md` |
-
-File naming convention for Scope Slices: `<feature-area-kebab>--<slice-description-kebab>.md`
-
-Example: `clarification-loop--v0-single-question-flow.md`
-
----
-
-## 9. Anti-Patterns
-
-Never:
-- Infer business rules not stated in the PRD
-- Call a Feature Area a "service," "module," or "system" unless architecture has said so
-- Produce architecture diagrams, data models, or API designs during Feature Area / Scope Slice work
-- Skip levels in the hierarchy (PRD → Task, Feature Area → Spec)
-- Use "we should probably" or speculative language in a Scope Slice boundary definition
-- Mark a Scope Slice as `ready-for-user-stories` while it has unresolved `NEED_HUMAN` flags
-- Treat "PRD READY ENOUGH" as authorization for task slicing
diff --git a/.cursor/skills/execution-loop/SKILL.md b/.cursor/skills/execution-loop/SKILL.md
deleted file mode 100644
index 1573df0..0000000
--- a/.cursor/skills/execution-loop/SKILL.md
+++ /dev/null
@@ -1,125 +0,0 @@
----
-name: execution-loop
-description: Runs `/execute-prd` — init, scan, next, run-one, loop over WORK_QUEUE with BLOCKERS, EXECUTION_LOCK, EXECUTION_LOG, POINTS_OF_ATTENTION. Non-blocking blockers; checker-gated advancement; stops before User Story/Spec/Task implementation artifacts per execution-loop rule.
-disable-model-invocation: true
----
-
-# Execution Loop — Operational Skill
-
-Use when the user invokes **`/execute-prd <mode>`** or references **`execution-loop`**.
-
-**Read first:** `.cursor/rules/execution-loop.mdc`  
-**Align with:** `.cursor/rules/feature-area-workflow.mdc`, `.cursor/commands/feature-area.md`, `.cursor/checkers/scope-readiness-checker.md`
-
----
-
-## 1. Files
-
-| File | Read for | Write on |
-|------|-----------|----------|
-| `docs/WORK_QUEUE.md` | Eligible work, ordering | **`scan`**, manual reconciliation after promotions |
-| `docs/BLOCKERS.md` | Subtree blocking | When new human flags or resolutions appear in sources |
-| `docs/EXECUTION_LOCK.md` | Concurrency, allowed paths | **`run-one`**, **`loop`**, stale release |
-| `docs/EXECUTION_LOG.md` | Audit | **Every mode** (append row) |
-| `docs/POINTS_OF_ATTENTION.md` | Risks, NEED_UPDATE, PRD surface | **`scan`**, **`next`** when surfacing gaps |
-| `docs/prd/state.md`, `docs/prd/PRD.md`, `docs/prd/questions/open-questions.md` | Ground truth | Only via PRD workflow — not on this loop unless logging |
-| `docs/product/feature-areas/*.md`, `docs/product/scope-slices/*.md` | Queue rebuild + actions | Only via **`/feature-area`** allowed modes |
-
----
-
-## 2. Mode: `init`
-
-1. If `docs/WORK_QUEUE.md` missing or header-only, create table per rule §3.
-2. Same for `BLOCKERS.md`, `EXECUTION_LOG.md`, `EXECUTION_LOCK.md`, `POINTS_OF_ATTENTION.md` per rule §7–10.
-3. Log: **`init`**, Item `—`, Action **`scaffold verified`**, Outcome **`ok`**.
-
----
-
-## 3. Mode: `scan`
-
-1. Read all Feature Area and Scope Slice markdown (non-`.gitkeep`).
-2. For each **Feature Area** file `docs/product/feature-areas/<kebab>.md`:
-   - **ID:** `FA-<kebab>`
-   - **Type:** `Feature Area`
-   - **Parent:** empty
-   - **Priority:** `P0`–`P4` per **execution-loop** rule §4
-   - **NEED_HUMAN / NEED_UPDATE:** from `> **NEED_HUMAN:**` / `> **NEED_UPDATE:**` lines if present; else `false`
-   - **Status:** map `Status` line per rule §3 table
-   - **Blocked By:** semicolon list of `B-NNN` where artifact open blockers + flags match **BLOCKERS** (create blocker rows in **`scan`** if missing but **NEED_HUMAN** in source — keep **minimal**)
-   - **Next Action:** e.g. **`/feature-area validate <kebab>`** if exploratory; **`/feature-area slice <kebab>`** if validated and slices not all materialized; **`/feature-area check <path>`** for slices under it
-3. For each **Scope Slice** `docs/product/scope-slices/<fa>--<slice>.md`:
-   - **ID:** `SS-<fa>--<slice>` (full basename without `.md`, prefix `SS-`)
-   - **Type:** `Scope Slice`
-   - **Parent:** `FA-<fa>` (first segment(s) before `--` matching FA kebab)
-   - **Priority:** inherit from parent FA band
-   - Flags from file; **Status** mapping per rule
-   - **Next Action:** **`/feature-area refine-slice <path>`** when UX States / Data Touched empty or verdict NOT READY; **`/feature-area check <path>`** when refined; **`/feature-area promote-slice <path>`** only after **CLEAR**
-4. Rewrite **`WORK_QUEUE.md`** table (full replace of table body is OK; preserve title + intro if present).
-5. Log **`scan`**, note row counts.
-
-**ID convention:** Use `SS-account-session--signup-to-signed-in-dashboard` style = `SS-` + filename without `.md`.
-
----
-
-## 4. Mode: `next`
-
-1. Run **§3** mentally or literally (**full `scan`** if user has not just scanned).
-2. Load **`EXECUTION_LOCK.md`**:
-   - If **`stale: true`** **or** age rule triggered: clear lock per rule §8; log.
-3. Build **eligible** set: all rows where:
-   - **Status** not `done`
-   - **NEED_UPDATE** false **or** user is only running **`next`** for reporting (still surface POA)
-   - **Subtree not blocked:** remove row if any **ancestor** or **self** has **Blocked By** referencing an **unresolved** blocker whose **Scope** covers that row **and** **Resolution** empty in `BLOCKERS.md`
-   - **Non-blocking rule:** sibling rows under same parent without blocker on them **stay eligible**
-4. Sort by rule **§5 a–j** (Priority **P0→P4**, then frontier depth, then status preference).
-5. Output: **ID**, **Type**, **Parent**, **Next Action**, **why this pick** (one line), **siblings still eligible** (optional).
-
----
-
-## 5. Mode: `run-one`
-
-1. Compute target = **`next`** output (recompute if needed).
-2. **Lock:**
-   - Set **`active_item_id`**, **`type`**, **`parent_chain`** (walk **Parent** column to root), **`current_action`** = chosen step, **`started_at`** = today ISO, **`stale: false`
-   - **`allowed_files`:** minimal — e.g. one Scope Slice path + `WORK_QUEUE` + `EXECUTION_LOG` + `BLOCKERS` if reconciling
-   - **`forbidden_files`:** `src/**`, `app/**`, `packages/**`, `lib/**` (adjust if repo differs — **default deny** implementation trees)
-3. Execute **one** step only:
-   - **Feature Area exploratory** → usually **`/feature-area validate <name>`** (read-only) or user-approved **`promote`** after CLEAR
-   - **Scope Slice exploratory** → **`/feature-area refine-slice`** (one file) **or** **`check`** (read-only)
-   - **Never** create **User Story** files in **v0** loop
-4. Append **`EXECUTION_LOG`**
-5. **Unlock** if step finished; if checker **BLOCKED**, unlock and set **Next Action** in chat from checker **Reason**
-
----
-
-## 6. Mode: `loop`
-
-1. Iteration cap **10** (or user override in message).
-2. Each iteration: **`next`**; if no target → **stop `idle`**
-3. **`run-one`**; if stop condition (rule §11) → log and break
-4. End summary: iterations, last item, stop reason
-
----
-
-## 7. Blockers and siblings (operational)
-
-When **`B-NNN`** has **Scope** `feature-area` on **`FA-credit-system`**, **remove** `FA-credit-system` and **all** rows with **Parent** = that ID or descendant chain from **eligible** — **do not** remove **`FA-payments`** or **`FA-account-session`**.
-
-When **`Scope: scope-slice`** on one slice only, **other slices** of same FA stay in **eligible** set.
-
----
-
-## 8. Logging (required fields)
-
-**`EXECUTION_LOG` row:** ISO **Timestamp** (date fine), **Mode**, **Item** (queue ID or `—`), **Action** (short), **Outcome** (`ok` / `blocked` / `stale-released` / `idle` / `stall`), **Notes** (optional, one line).
-
----
-
-## 9. Anti-patterns
-
-| Wrong | Right |
-|-------|--------|
-| Promoting FA/SS without checker output | Run **`/feature-area check`** or validate/promote pre-checks from command doc |
-| Clearing **NEED_HUMAN** in chat | Human edits artifact + **BLOCKERS.Resolution** |
-| Editing locked-out paths | Obey **allowed_files** |
-| Expanding loop to code | **Stop** at rule §11 implementation boundary |
diff --git a/.cursor/skills/feature-area/feature-area-builder/SKILL.md b/.cursor/skills/feature-area/feature-area-builder/SKILL.md
deleted file mode 100644
index ae30b88..0000000
--- a/.cursor/skills/feature-area/feature-area-builder/SKILL.md
+++ /dev/null
@@ -1,344 +0,0 @@
----
-name: feature-area-builder
-description: Drives Feature Area decomposition — maps PRD Feature Groups to Feature Areas, runs readiness checks, and proposes Scope Slices. `scaffold` writes initial Feature Area markdown from an approved map (only mode that may create Feature Area files). `scaffold-slices` writes Scope Slice markdown from an approved slice proposal (only mode that may create or initially fill `docs/product/scope-slices/*.md`). `refine-slice` edits product-level sections of one Scope Slice. `promote-slice` applies the narrow ready-for-user-stories transition after CLEAR (SS-01–SS-10, CC-01–CC-05). `promote` applies the narrow validated transition on a Feature Area file after CLEAR. Map, validate, slice, and check are proposal or checker-only. Never writes user stories, specs, tasks, or architecture.
-disable-model-invocation: true
----
-
-# Feature Area Builder
-
-Operational skill for converting a converged PRD into Feature Areas and Scope Slices. Drives the `/feature-area` command modes. Does not drive the PRD workflow — that is the PRD Builder skill's domain.
-
-## 1. Goal
-
-Produce Feature Area and Scope Slice proposals that are:
-
-- Grounded in specific PRD sections (not invented from context)
-- Written in user-value language (no technical terms)
-- Bounded by explicit in-scope / out-of-scope definitions
-- Small enough that Scope Slices can be filled without architecture decisions
-- Gated by the scope-readiness-checker before any status advancement
-
-Anti-goal: decomposing fast to look productive. A wrong Feature Area is harder to fix than a slow one.
-
-## 2. Activation
-
-Activate when the user runs `/feature-area <mode>`.
-
-Do not activate for PRD discovery, ICE scoring, product decisions, or architecture work — those belong to the PRD workflow.
-
-Before any mode executes:
-
-1. Read `docs/prd/state.md`
-2. Read `docs/prd/PRD.md`
-3. Read `docs/prd/questions/open-questions.md`
-4. Read `docs/product-decisions/README.md` (if it exists)
-5. Read all files in `docs/product/feature-areas/` (if any)
-6. Read all files in `docs/product/scope-slices/` (if any)
-
-If `docs/prd/PRD.md` is missing or empty: stop and recommend `/prd init`.
-
-## 3. Feature Area Lead Pre-flight
-
-Before executing `map`, `validate`, `promote`, `slice`, `scaffold-slices`, or a **cold-start** `scaffold` (no in-thread approved map from `map`), confirm that a Feature Area Context Brief has been produced by the Feature Area Lead (`.cursor/agents/feature-area/feature-area-lead.md`) for this command flow.
-
-The brief is context reconstruction only — not a decomposition proposal, not a validation run, not a file write.
-
-**Do not re-run the pre-flight** when the user is responding to an existing proposal (e.g. saying "proceed" or "use your judgment" after reviewing a map proposal). Resume the active flow.
-
-When running **`scaffold` immediately after** the user approves a Feature Area Map produced in **this same conversation**, **reuse** the Context Brief from `map` — do not re-run the Lead.
-
-When running **`scaffold-slices` immediately after** the user approves a Scope Slice proposal from **`slice`** in **this same conversation**, **reuse** the Context Brief from `slice` — do not re-run the Lead.
-
-`refine-slice` and `promote-slice` do **not** require Feature Area Lead pre-flight (same as `check`).
-
-If no brief exists and one is required, request it before proceeding.
-
-## 4. Mode: map
-
-Convert PRD Feature Groups into a proposed Feature Area map.
-
-### Behavior
-
-1. Read the PRD Feature Groups section.
-2. For each Feature Group, determine:
-   - Does it map 1-to-1 to a Feature Area, or does it contain multiple distinct user-value clusters?
-   - Split criterion: more than ~5 distinct user-value clusters inside one group → propose multiple Feature Areas.
-   - If a Feature Group is too vague to name user-value clusters: flag it as not-ready-to-map and surface the missing clarity.
-3. Apply terminology conversion: PRD "Feature Group" → Feature Area in all output. Do not carry Feature Group naming forward **except** **PRD Source** citations where the section title in `docs/prd/PRD.md` is literally *Feature Groups* (§ reference only).
-4. Cross-check every proposed Feature Area against the v0 exclusion list in `.cursor/rules/feature-area-workflow.mdc` §6. If a proposed area is entirely deferred, mark it `deferred` and exclude from the active list.
-5. Check existing `docs/product/feature-areas/` files for overlap or gaps.
-6. Invoke Scope Critic (`.cursor/agents/feature-area/scope-critic.md`) to review the proposal before presenting it to the user.
-7. Present the map proposal using the output format in `.cursor/commands/feature-area.md` Mode: map.
-
-### Split decision rules
-
-Split a PRD Feature Group when:
-- It contains behaviors with different actors (e.g. buyer flow vs. merchant configuration flow)
-- It contains behaviors with different lifecycle timing (e.g. real-time flow vs. async notification)
-- Candidate Scope Slices inside it don't share a coherent user-facing concern
-
-Do not split based on technical layer or implementation complexity.
-
-### What the map does NOT produce
-
-- Feature Area files — use `/feature-area scaffold` after approval (writes from `.cursor/templates/product/feature-area.template.md`)
-- Scope Slices (those come after validation)
-- Architecture diagrams or service boundaries
-
-## 5. Mode: scaffold
-
-Write initial Feature Area files after the user **approves** a Feature Area Map in-context. Governed by `.cursor/commands/feature-area.md` Mode: scaffold.
-
-**Safety:** `/feature-area scaffold` is the **only** mode that may **create** `docs/product/feature-areas/<kebab-name>.md`. `/feature-area promote` is the **only** mode that may apply the **automated validated transition** (narrow field updates only — see §7). Other modes do not modify Feature Area files.
-
-### Pre-conditions
-
-1. An **approved** Feature Area Map must be available in the current conversation (user-explicit approval of the proposed v0 areas). If not: stop; run `/feature-area map` first.
-2. Complete the standard read order (§2) before writing.
-
-### Behavior
-
-1. For each **proposed v0 Feature Area** in the approved map, resolve `docs/product/feature-areas/<kebab-name>.md`.
-2. **Skip without overwrite** if the file exists and is **non-empty** (any non-whitespace content). List skipped paths in the output.
-3. If missing or **empty-only**, instantiate from **`.cursor/templates/product/feature-area.template.md`** (keep template structure and headings).
-4. Set **`Status: exploratory`** (and template `STATUS` / status line per template convention).
-5. Copy **`NEED_HUMAN`** and **`NEED_UPDATE`** from the approved map **verbatim** for that row.
-6. Fill sections from the **approved map** plus **`docs/prd/PRD.md`** (and open questions / product decisions) **only** to ground product intent, boundaries, journeys, blockers, etc. — no invention of execution detail.
-7. **Candidate Scope Slices** table: **names + one-line descriptions** only (and `exploratory` per template status column if used). No extra decomposition beyond the map.
-8. **Do not:** create Scope Slice files; run FA validation; overwrite non-empty Feature Area files; write user stories, specs, tasks, architecture, services, APIs, or data models.
-
-### Output
-
-Use the result format in `.cursor/commands/feature-area.md` (Created / Skipped / NEED_HUMAN list / next `/feature-area validate <kebab-name>`, then `/feature-area promote <kebab-name>` after CLEAR).
-
-## 6. Mode: validate
-
-Run FA-01–FA-09 and CC-02–CC-05 from `.cursor/checkers/scope-readiness-checker.md` against a Feature Area file.
-
-### Behavior
-
-1. Read `docs/product/feature-areas/<feature-area-name>.md`.
-2. Read `docs/prd/questions/open-questions.md` to cross-check open blockers against the FA.
-3. Run each check in order. For each check:
-   - PASS: the condition is met
-   - FAIL: the condition is not met — state exactly what fails and what must change
-   - SKIP: the check is genuinely inapplicable — explain why (never use SKIP to avoid a hard question)
-4. A single FAIL blocks advancement. Do not paper over it.
-5. Output the summary table from `.cursor/checkers/scope-readiness-checker.md` Summary Output Format.
-6. State the advancement verdict clearly: CLEAR or BLOCKED.
-
-### After a CLEAR verdict
-
-Recommend `/feature-area promote <name>` to apply the validated transition, or the user may edit the file manually. Scope Slices may be proposed via `/feature-area slice <name>` after status is `validated`.
-
-Do not mark the file `validated` from validate mode.
-
-### After a BLOCKED verdict
-
-State the first failing check and what must be resolved. Do not propose fixes inline. Route to the user for resolution.
-
-## 7. Mode: promote
-
-Governed by `.cursor/commands/feature-area.md` Mode: promote.
-
-### Behavior
-
-1. Complete standard reads (§2); Feature Area Lead pre-flight when required (§3).
-2. Read `docs/product/feature-areas/<feature-area-name>.md` and `docs/prd/questions/open-questions.md`.
-3. **Gate before write:**
-   - File exists and is non-empty.
-   - If `Status` is `validated`: **no-op** — report and exit without edits.
-   - If `Status` is `blocked` or `deferred`: stop — promotion not allowed.
-   - `Status` must be `exploratory` to proceed with a write.
-   - `NEED_HUMAN: false`, `NEED_UPDATE: false`.
-   - Open Blockers: no unresolved rows (same bar as FA-06 + open-questions cross-check).
-4. Run FA-01–FA-09 and CC-02–CC-05. Verdict must be **CLEAR**; otherwise output the checker table / failure summary and **do not write**.
-5. **Only if CLEAR**, apply **only** these edits to the Feature Area file:
-   - `## Status` → `validated`
-   - `## Readiness Verdict` checklist items → all `[x]`
-   - `**Verdict:**` → `READY FOR SCOPE SLICES`
-   - `## Changelog` → append one row; use the exact pipe-row text specified in `.cursor/commands/feature-area.md` Mode: promote (`YYYY-MM-DD` = current calendar date).
-
-No other sections or files.
-
-### Output
-
-Use the result format in `.cursor/commands/feature-area.md` (including no-op and BLOCKED cases).
-
-## 8. Mode: slice
-
-Propose candidate Scope Slices for a Feature Area with `Status: validated` (set via `/feature-area promote` or manual edit).
-
-### Pre-condition gate
-
-Before proposing slices, verify:
-
-1. Read `docs/product/feature-areas/<feature-area-name>.md`.
-2. `Status` must be `validated`. If not: stop and output the gate message from `.cursor/commands/feature-area.md` Mode: slice.
-3. `NEED_HUMAN` must be `false`. If `true`: stop, list the open blockers, and do not proceed.
-
-If both conditions pass: proceed to slice proposal.
-
-### Behavior
-
-1. Read the Feature Area's In Scope, Out of Scope, Business Objects Touched, and Candidate Scope Slices sections.
-2. Identify distinct user-value clusters in the In Scope section.
-3. For each cluster, draft one candidate Scope Slice:
-   - Name: kebab-safe, user-facing, no technical terms
-   - User value: one sentence, behavioral, no implementation language
-   - Draft boundary: included behaviors (exhaustive), excluded behaviors (at least the v0 deferrals)
-   - Immediate blockers: any open question that would set NEED_HUMAN on this slice
-4. Cross-check every proposed slice against the v0 exclusion list. Mark deferred slices explicitly.
-5. Flag any cross-cutting concerns (credit, sharing, privacy, feedback) per each slice.
-6. Invoke Scope Critic (`.cursor/agents/feature-area/scope-critic.md`) to review the proposal.
-7. Present using the output format in `.cursor/commands/feature-area.md` Mode: slice.
-
-### Slice sizing rules
-
-A Scope Slice is correctly sized when:
-- It delivers one user-visible benefit on its own
-- It can be fully described without naming technical layers
-- It can produce 2–6 user stories when filled
-
-A Scope Slice is too large when:
-- It requires architecture decisions to define its boundary
-- It contains multiple distinct user benefits that could be delivered independently
-
-A Scope Slice is too small when:
-- It delivers no recognizable standalone value
-- It is only meaningful when combined with another slice
-
-Merge or split before presenting to the user.
-
-### What the slice proposal does NOT produce
-
-- Scope Slice files — use `/feature-area scaffold-slices <name>` after explicit approval (writes from `.cursor/templates/product/scope-slice.template.md`)
-- User stories, specs, or tasks
-- Data models, API routes, or technology choices
-
-## 9. Mode: scaffold-slices
-
-Materialize an **approved** Scope Slice proposal into files. Governed by `.cursor/commands/feature-area.md` Mode: scaffold-slices.
-
-### Pre-conditions
-
-1. User **approved** the `/feature-area slice <feature-area-name>` table in the current conversation. If not: stop; instruct to run `slice` first.
-2. Parent Feature Area file exists at `docs/product/feature-areas/<feature-area-name>.md` with `Status: validated` and `NEED_HUMAN: false` (same gates as slice).
-3. Complete standard reads (§2) before writing.
-
-### Behavior
-
-1. For each row in the approved proposal, target `docs/product/scope-slices/<feature-area-kebab>--<slice-kebab>.md` only.
-2. **Skip** if the file exists and is non-empty; list in output.
-3. If missing or empty-only: instantiate from **`.cursor/templates/product/scope-slice.template.md`**.
-4. **Fill only** the product-level sections listed in `.cursor/commands/feature-area.md` Mode: scaffold-slices (Parent Feature Area, Status, flags, User Value, Exact Boundary, credit/sharing/feedback impacts, Dependencies, Blockers, Acceptance-Level Outcome, Changelog). Default **Status** to `exploratory` unless the proposal row was `blocked` or `deferred`.
-5. Leave **UX States**, **Data Touched**, and **Readiness for User Stories** (and embedded verdict) for **`refine-slice`** / **`promote-slice`** per `.cursor/commands/feature-area.md` (scaffold leaves UX States and Data Touched empty; Readiness is promotion-only).
-6. **Do not** modify PRD, Feature Area files, or paths outside the allowed Scope Slice filenames.
-7. **Do not** invent implementation detail; use product-level TBD where sources are insufficient; set `NEED_HUMAN: true` only when story writing is blocked.
-
-### Output
-
-Use the result format in `.cursor/commands/feature-area.md` (Created / Skipped / next `/feature-area refine-slice` per file).
-
-## 10. Mode: check
-
-Run the scope-readiness checker against any Feature Area or Scope Slice file.
-
-### Behavior
-
-1. Read the file at `<artifact-path>`.
-2. Detect artifact type by path:
-   - `docs/product/feature-areas/` → Part 1 (FA-01–FA-09) + CC-02–CC-05
-   - `docs/product/scope-slices/` → Part 2 (SS-01–SS-11) + CC-01–CC-05
-   - Ambiguous: ask the user which part to run before proceeding
-3. Run all applicable checks from `.cursor/checkers/scope-readiness-checker.md`.
-4. Output the summary table with advancement verdict.
-
-Note: `check`, `refine-slice`, and `promote-slice` modes do not require Feature Area Lead pre-flight. It is a mechanical checker run or governed slice edit/promotion.
-
-## 10.1 Mode: refine-slice
-
-Edit **product-level** sections of **one** Scope Slice file. Governed by `.cursor/commands/feature-area.md` Mode: refine-slice.
-
-### Behavior
-
-1. Resolve `docs/product/scope-slices/<one file>.md`.
-2. Complete standard reads (§2) before editing.
-3. **Allowed edits** — only sections listed in the command doc (User Value through Acceptance-Level Outcome, UX States, Data Touched, Status flag lines); **no** Status → `ready-for-user-stories`, **no** Readiness checklist or Verdict, **no** Changelog, **no** Parent Feature Area except broken-link fix.
-4. Ground in parent Feature Area, PRD, open questions; **PRD-allowed product-level terms** per `.cursor/checkers/scope-readiness-checker.md`.
-5. **Do not** write user stories, specs, tasks, architecture, services, APIs, or implementation detail.
-
-### Output
-
-Use the result format in `.cursor/commands/feature-area.md`.
-
-## 10.2 Mode: promote-slice
-
-Apply the narrow **ready-for-user-stories** transition after **CLEAR** (SS-01–SS-10, CC-01–CC-05). Governed by `.cursor/commands/feature-area.md` Mode: promote-slice.
-
-### Behavior
-
-1. Complete standard reads (§2).
-2. Read the Scope Slice and `docs/prd/questions/open-questions.md`.
-3. **Gate before write:** file under `docs/product/scope-slices/`; parent Feature Area exists and `validated`; `Status` is `exploratory` (if already `ready-for-user-stories`, **no-op**; if `blocked`/`deferred`, stop); `NEED_HUMAN` / `NEED_UPDATE` false; blockers consistent with SS-09.
-4. Run SS-01–SS-10 and CC-01–CC-05. Verdict must be **CLEAR**; otherwise output checker table / failure summary and **do not write**.
-5. **Only if CLEAR**, apply **only** the four edits defined in `.cursor/commands/feature-area.md` Mode: promote-slice (Status, Readiness checklist all `[x]`, Verdict line, Changelog row).
-
-No other sections or files.
-
-### Output
-
-Use the result format in `.cursor/commands/feature-area.md` (including no-op and BLOCKED cases).
-
-## 11. Collaboration
-
-| Need | Delegate to | When |
-|------|-------------|------|
-| Context reconstruction before map, validate, promote, slice, scaffold-slices, or cold-start scaffold | Feature Area Lead | On initial invocation — produce a Context Brief first; for `scaffold` after same-thread map approval, reuse that brief; for `scaffold-slices` after same-thread slice approval, reuse that brief |
-| Stress-test a proposed FA map | Scope Critic | After map proposal, before presenting to user |
-| Stress-test proposed Scope Slices | Scope Critic | After slice proposal, before presenting to user |
-
-Do not replicate the agents' work — invoke them and incorporate their output.
-
-## 12. Handoff to User Story authoring
-
-Materialized Scope Slices are **`exploratory`** until product-level gaps are closed with **`/feature-area refine-slice`**, **`/feature-area check`** passes SS-01–SS-10 and CC-01–CC-05, and **`/feature-area promote-slice`** applies (or manual equivalent). User story authoring is out of scope for this skill.
-
-When a Scope Slice file exists with `Status: ready-for-user-stories` and `NEED_HUMAN: false`, the next step is user story authoring. That layer is governed by a separate workflow — this skill does not drive it.
-
-State explicitly when a Scope Slice reaches this point:
-
-```txt
-Scope Slice "<name>" is marked ready-for-user-stories.
-User story authoring may begin.
-
-This skill does not drive user story authoring.
-Refer to the user story workflow for next steps.
-```
-
-## 13. Anti-patterns
-
-| Anti-pattern | Verdict |
-|---|---|
-| Creating Feature Area files outside `scaffold`, or editing Feature Area files outside `scaffold` / `promote` allowed scope | Forbidden |
-| Using `promote` to change anything beyond the four defined edits | Forbidden |
-| Creating or **initially** filling Scope Slice files except via `/feature-area scaffold-slices` after approved proposal (or human manual use of template) | Forbidden |
-| Editing Scope Slice **product-level** sections outside **`refine-slice`** allowed sections, or promoting to `ready-for-user-stories` outside **`promote-slice`** narrow transition (or equivalent manual edits) | Forbidden |
-| Naming architecture, services, or runtime decisions | Forbidden |
-| Writing user stories, specs, or tasks | Forbidden |
-| Proposing Scope Slices before FA is validated | Forbidden |
-| Skipping Feature Area Lead pre-flight on initial map, validate, promote, slice, scaffold-slices, or cold-start scaffold | Wrong |
-| Skipping Scope Critic review on map or slice proposals | Wrong |
-| Using "Feature Group" terminology in narratives or area naming | Wrong — use "Feature Area" (**exception:** PRD Source line may cite § whose title is *Feature Groups*) |
-| Claiming `validated` or `ready-for-user-stories` without the file reflecting it | Forbidden — use `/feature-area promote` after CLEAR for Feature Areas; use `/feature-area promote-slice` after CLEAR for Scope Slices |
-| Proceeding past NEED_HUMAN=true without explicit user approval | Forbidden |
-| Silently working around a NEED_UPDATE flag | Forbidden — surface it |
-| Creating Scope Slices directly from a PRD Feature Group | Forbidden — Feature Area decomposition must happen first |
-
-## 14. Guardrails
-
-- **Creation vs promotion vs refinement.** `/feature-area scaffold` creates Feature Area markdown. `/feature-area scaffold-slices` creates or initially fills Scope Slice markdown (non-empty files skipped). `/feature-area refine-slice` edits product-level body sections of one Scope Slice. `/feature-area promote` applies only the predefined validated-transition edits on a Feature Area. `/feature-area promote-slice` applies only the predefined ready-for-user-stories transition on a Scope Slice. Map, validate, slice, check: no Feature Area or Scope Slice **creation**; check does not write.
-- **One mode at a time.** Do not run map + slice in one response.
-- **Explicit blockers.** Any FAIL in the checker blocks advancement — do not paper over it with prose.
-- **Terminology precision.** Feature Area, Scope Slice, User Story, Spec, Task — no synonyms, no shortcuts.
-- **v0 discipline.** Every proposal must be cross-checked against the hard v0 exclusion list before presenting to the user.
diff --git a/.cursor/skills/prd/prd-builder/SKILL.md b/.cursor/skills/prd/prd-builder/SKILL.md
deleted file mode 100644
index 3e53ee2..0000000
--- a/.cursor/skills/prd/prd-builder/SKILL.md
+++ /dev/null
@@ -1,741 +0,0 @@
----
-name: prd-builder
-description: Drives PRD discovery, feature group convergence, ICE scoring, and cross-group ranking. Produces validated feature group blocks and gated delta proposals. Only applies PRD file changes in /prd update mode after explicit human approval. Not for technical architecture, implementation, or sprint planning.
-disable-model-invocation: true
----
-
-# PRD Builder
-
-Operational workflow for turning a product idea into a small, prioritized PRD organized into feature groups. Drives conversation toward convergence — not documentation volume.
-
-## 1. Goal
-
-Produce a PRD that is:
-
-- Readable in minutes by a human
-- Organized as feature groups (not flat feature lists or epics)
-- Prioritized via ICE so the team knows what to build first
-- Bounded by explicit Out-of-Scope and Definition of Done
-- Converged — each feature group validated by the user before persistence
-
-Anti-goal: a long, exhaustive, "complete" PRD. A bloated PRD is a failure.
-
-## 1.5 PRD Completeness Model
-
-`docs/prd/PRD.md` must be readable, but it must not be under-specified.
-
-A good PRD in this workflow has two layers:
-
-1. **Executive readability** — a human can understand the product direction in minutes.
-2. **Product completeness** — the main PRD contains the global product picture, core journeys, major flows, business objects, configuration surfaces, and unresolved blockers.
-
-The PRD must not collapse into implementation specs, tickets, architecture, database schemas, framework decisions, or sprint planning.
-
-But it must be detailed enough that a future `/prd converge`, `/prd challenge`, `/prd prioritize`, or implementation-spec handoff can reconstruct the product without rereading every raw discovery note.
-
-### Required global PRD sections
-
-When enough discovery material exists, `docs/prd/PRD.md` should include:
-
-- Product Thesis — one sentence explaining the product bet.
-- Global Product Picture — how the product works end-to-end.
-- Operating Model — who operates what, where, and when.
-- Core User Journeys — buyer, merchant, practitioner, and admin journeys where relevant.
-- Flow Inventory — all important product-level flows with actor, trigger, steps, outcome, and blockers.
-- Business Objects — product-level objects such as booking, service, practitioner, slot, pack, gift card, store credit, loyalty points, order sync, notification.
-- Configuration Matrix — what merchants can configure.
-- Integration Boundaries — what external systems participate and what role they play.
-- MVP Completeness Checklist — what must be resolved before implementation-ready status.
-
-### Flow Inventory format
-
-Use this format for each flow:
-
-```md
-### <Flow name>
-Status: candidate | exploratory | validated-with-open-surface | validated
-Actor: <buyer | merchant | practitioner | system>
-Trigger: <when this flow starts>
-Summary: <2-4 lines>
-
-Flow steps:
-1. <user-visible or business-level step>
-2. <step>
-3. <step>
-
-Outcome:
-- <observable result>
-
-Open blockers:
-- <blocker or none>
-
-Out of scope:
-- <explicit exclusion>
-```
-
-## 2. Activation
-
-Activate when:
-
-- The user runs `/prd discover` or asks to build/extend/start a PRD
-- The user describes a product idea and wants structured capture
-- The user asks to define a feature group, scope an MVP, or rank features
-
-Do not activate for technical architecture, implementation, sprint planning, or roadmaps.
-
-Before starting, read `docs/prd/PRD.md` and `docs/prd/state.md` (when present). If missing or empty, recommend `/prd init`. Do not initialize the PRD workspace through `/prd update`.
-
-## Templates
-
-Canonical template rules live in `.cursor/rules/10-prd-discovery.mdc`.
-
-Use `.cursor/templates/prd/` as the only reusable source for generated PRD docs.
-Never use `docs/**` files as templates.
-
-## 2.5 Discovery Note Mode
-
-During open discovery (`/prd discover`, `/prd note`, or informal PRD conversation), the default behavior is **capture-first**. Do not run the convergence loop. Do not score ICE. Do not ask for DoD, Out of Scope, or challenge tables. Do not propose a PRD update.
-
-When the user gives an insight, business rule, correction, or clarification:
-
-1. Append it to `docs/prd/notes/YYYY-MM-DD-<topic>-discovery-note.md` (format: see `.cursor/templates/prd/discovery-note.template.md`).
-2. Interpret the likely product meaning — 1–3 lines.
-3. Identify the PRD implication — 1–3 lines.
-4. Ask **at most one** follow-up question. Stop.
-
-**One-question rule.** Never ask more than one question at a time during discovery. Ask the single highest-leverage question and wait for the answer before asking anything else.
-
-**Convergence is explicit.** The convergence loop (§3) activates only when the user invokes `/prd converge`, `/prd prioritize`, `/prd update`, or explicitly says "let's converge", "structure this", or "write it up". Open discovery does not auto-escalate.
-
-## 2.6 Convergence Safety
-
-Convergence is synthesis, not persistence.
-
-When `/prd converge` is invoked:
-
-1. Read discovery notes and answered questions.
-2. When interpreting **Answered** queue rows, apply **Current truth resolution** (`.cursor/commands/prd-questions.md`); treat `docs/prd/PRD.md` as authoritative after persistence, prefer later answers for the same topic, and honor explicit `SUPERSEDED by Q-…` markers — do not resurrect stale answered facts.
-3. Determine the converge target (see `.cursor/commands/prd.md` Mode: converge):
-   - **A — Global PRD Enrichment Proposal**: if required global PRD sections are absent or TBD while notes contain relevant material.
-   - **B — Feature-Group Convergence Proposal**: if the global picture is coherent and a feature group is ready to define.
-   - Produce one or the other — never both in the same response.
-4. For target A: propose the global sections to enrich, cite content sources, list open blockers, ask one validation question. Stop.
-5. For target B: draft **at most one** primary feature group candidate, list other possible groups as **candidates only** (names, no full drafts), ask one validation question. Stop.
-
-Do not:
-- validate groups automatically
-- generate multiple full feature groups in one pass
-- produce a build sequence unless 3+ groups were validated in **prior separate turns**
-- write files
-- update `history.md` or `archive/`
-- archive scaffold
-- mark content as persisted
-- call content "validated" unless the user **explicitly** validated it in the immediately preceding turn
-- infer approval from "ok" outside the current checkpoint
-
-**Checkpoint scope.** If the user replies "ok", that validates only the current checkpoint — not the whole PRD, not all groups, and not file persistence. If the user wants to continue, continue one checkpoint or one group at a time.
-
-## 2.7 PRD Lead Pre-flight
-
-`/prd converge`, `/prd prioritize`, and `/prd update` require a current PRD Lead Context Brief before PRD Builder acts.
-
-Rules:
-- On the **initial invocation** of `converge`, `prioritize`, or `update`, confirm that a PRD Lead Context Brief has been produced for this command flow (see `.cursor/agents/prd/prd-lead.md`).
-- The brief is context reconstruction only — not validation, not a convergence proposal, not persistence approval.
-- **Do not re-run PRD Lead** when the user responds `approved`, `preview`, or `cancel` to an existing Patch Intent Summary or PRD Delta Proposal. Those responses resume an active approval flow.
-- If no brief exists and the user did not produce one earlier in the session, prompt for it before proceeding.
-
-## 3.0 Group type
-
-Declare at the start of each feature group. Determines required sections.
-
-| Type | Required sections | Use when |
-|---|---|---|
-| `lightweight` | WHY, WHAT, Out of Scope, rough ICE, Status | Quick idea, early exploration, tangential scope |
-| `standard` | Full template | Default for most feature groups |
-| `critical` | Full template + Dependencies + Validation Metadata | Core user workflow, high-cost-if-wrong, blockers for other groups |
-
-Default is `standard`. Only declare explicitly if `lightweight` or `critical`.
-
-### Lightweight template
-
-Used for `lightweight` groups only. Exploratory — cannot be committed without promotion to `standard` or `critical`.
-
-```md
-# <Feature Group Name>
-**Type:** lightweight
-
-## WHY
-<1–3 lines: why this matters>
-
-## WHAT
-<1–3 lines: the capability in user-visible terms>
-
-## Out of Scope
-- <Explicit exclusion 1>
-
-## ICE (rough)
-<Impact>,<Confidence>,<Ease> — estimates acceptable, justify Confidence only
-
-## Status
-exploratory
-```
-
-To promote to `standard` or `critical`, complete the full template in section 4 and re-run the convergence loop from section 3.1.
-
-## 3.0.5 Product Surface Gate
-
-The most dangerous failure mode of this system is **false convergence**: a clean-looking feature group that hides unresolved product-surface decisions. Surface decisions silently determine scope, dependencies, build cost, and what "done" even means. AI-generated PRD prose is especially good at making absent decisions look present.
-
-The Surface Gate runs *before* the first feature group is drafted for a new PRD, and *again* whenever a feature group surfaces a surface ambiguity that the current PRD has not resolved.
-
-### When to run the gate
-
-The gate does **not** fire during open discovery (`/prd discover`, `/prd note`) or informal PRD conversation. It fires only in `converge`, `prioritize`, and `update` modes, or when the user explicitly asks to validate a feature group.
-
-Within those modes, run the gate before drafting the first WHY/WHO/WHAT/WHEN of a feature group when **any** of:
-
-- `docs/prd/state.md` has no `DIRECTION` set, or it is the scaffold value
-- `docs/prd/PRD.md` has no validated feature group yet
-- The candidate group introduces a new buyer surface, merchant surface, market, or source-of-truth not already established in the PRD
-- Challenger has flagged a `FALSE CONVERGENCE RISK` against the current direction
-
-If none apply, skip the gate — the surface is already established.
-
-### Required surface fields
-
-Ask only the smallest set of product-shaping questions. One short answer per field, or `UNKNOWN — decision needed before implementation`. Never silently infer.
-
-| Field | Question | Why it matters |
-|---|---|---|
-| Primary market / language | Which market and language is v1 for? | Determines copy, legal, payment rails, support load |
-| Buyer entry point | Where does the buyer first encounter the product? | Distribution surface (Shopify page, embed, standalone, link, WhatsApp, …) |
-| Buyer-facing surface | Where does the buyer complete the action? | Same surface as entry, or a handoff? |
-| Merchant operating surface | Where does the merchant operate it? | Shopify admin, separate admin, calendar, email-only, manual |
-| Source of truth (after success) | Which system holds the canonical record after a successful action? | Booking record, Shopify order, calendar event, payment, customer record |
-| Confirmation channel | How does the buyer know it worked? | On-screen, email, SMS, WhatsApp, dashboard |
-| Payment model (if money) | Deposit, full prepayment, post-pay, free, merchant-configurable? | Determines refund logic, dispute surface, risk |
-| Hard v1 exclusions | What surfaces / markets / models are explicitly out of v1? | Caps scope drift |
-
-### Output: Surface Block
-
-Produce one block per gate run. Persisted as part of the active PRD (under "Product Surface" or per feature group, depending on scope).
-
-```md
-## Product Surface
-
-- Primary market / language: <answer | UNKNOWN — decision needed before implementation>
-- Buyer entry point: <…>
-- Buyer-facing surface: <…>
-- Merchant operating surface: <…>
-- Source of truth: <…>
-- Confirmation channel: <…>
-- Payment model: <… | n/a>
-- Hard v1 exclusions: <list>
-
-## Surface Blockers
-- <field>: <what decision is missing> — blocks: <implementation specs | this feature group | none>
-```
-
-### Hard rules
-
-- **The gate does not block discussion.** UNKNOWN is a valid, expected answer. Surface ambiguity must be made visible, not resolved by inference.
-- **The gate does block implementation readiness.** See section 6 (convergence checks) and section 8 (persistence).
-- **Confidence cap.** If `Buyer entry point`, `Buyer-facing surface`, `Merchant operating surface`, `Source of truth`, or `Primary market / language` is UNKNOWN, ICE Confidence for any feature group depending on that field is **capped at 4** (see section 5).
-- **No giant questionnaire.** Ask only fields that materially affect the next decision. Skip `Payment model` if money is not in scope. Group fields the user can answer in one breath.
-- **No silent inference.** If the user says "I don't know", write `UNKNOWN — decision needed before implementation`. Do not pick the most plausible answer "for now".
-
-## 3. Convergence Loop
-
-**Scope.** This loop applies to **Feature-Group Convergence (target B)** only. When `/prd converge` selects target A (Global PRD Enrichment Proposal), produce the enrichment proposal per `.cursor/commands/prd.md` Mode: converge — do not enter this loop.
-
-**Activation condition.** This loop runs only when the user explicitly invokes `/prd converge`, `/prd prioritize`, `/prd update`, or says "let's converge / structure this / write it up". It does not activate during open discovery or `note` mode. See §2.5.
-
-**Active group limit: 3 maximum** — 1 primary (actively converging), up to 2 exploratory (partially understood, explicitly tagged as `exploratory`). Committed groups are frozen and not "active."
-
-The primary group drives the current loop. Exploratory groups may be named and partially drafted but not scored or persisted until elevated to primary. Exploratory groups dormant for more than 14 days must be re-challenged before reactivation — not resumed silently.
-
-Avoid unlimited parallel discovery — three open fronts is already aggressive.
-
-### 3.0 PRD Lead pre-flight
-
-Confirm a PRD Lead Context Brief exists for this command flow (see §2.7). If missing, request it before proceeding.
-
-### 3.1 Surface the candidate feature group
-
-A feature group = a coherent slice of user value with a single intent. Not a theme, not a single button, not a release.
-
-Ask: "What's the smallest user-visible capability we want to define right now?" If the user names something too large, split before proceeding.
-
-Then run the **Product Surface Gate** (section 3.0.5) if its activation conditions are met. Do not skip — false convergence almost always starts here. The gate may produce UNKNOWNs; that is fine. What is NOT fine is drafting WHY/WHO/WHAT/WHEN against silently-assumed surface.
-
-### 3.2 Draft WHY / WHO / WHAT / WHEN
-
-Co-write in order. 3–5 lines max each. Use the user's words. If a section can't be written without inventing facts, mark `UNKNOWN — needs <signal>` and add to Open Questions.
-
-### 3.3 Force Out of Scope
-
-Ask: "What is explicitly NOT part of this feature group?" Refuse to proceed with empty Out-of-Scope. A group with no exclusions is unbounded.
-
-### 3.4 Define Definition of Done
-
-Ask: "What's true when this is shipped?" Demand observable, user-visible conditions. Reject:
-
-- Internal-only ("code merged")
-- Aspirational ("users love it")
-- Engineering-shaped ("tests pass")
-- Restatements of WHAT
-
-### 3.5 Score ICE
-
-See section 5. Capture as `Impact,Confidence,Ease`. Require a one-line justification per axis.
-
-### 3.6 Convergence check
-
-Run checks from section 6. If any fail, loop back. Do not paper over weakness with prose.
-
-### 3.7 Explicit user validation
-
-Show the full feature group block (section 4 template). Ask the user to validate four things, one by one:
-
-**Validation scope — only semantic and structural changes trigger these checkpoints:**
-- `cosmetic` — wording, formatting, typos. No validation required.
-- `structural` — adding/removing sections, reordering. Validation required.
-- `semantic` — changes to WHY, WHO, WHAT, DoD, ICE (>±1 on any axis), Out of Scope, Status. Always requires explicit validation.
-
-1. Feature group name and intent
-2. Scope (WHAT + Out of Scope)
-3. ICE tuple
-4. Definition of Done
-
-Silence is NOT approval.
-
-### 3.8 Hand off or continue
-
-Once validated, output the feature group block and recommend either:
-- `/prd update` to persist (section 8 — procedural only, no new discovery)
-- Continue to the next feature group (subject to active group limit in section 3)
-
-The skill never writes to `docs/prd/` inline during the convergence loop. Persistence is a separate, gated step.
-
-## 4. Feature Group Template
-
-Standard and critical feature groups use this exact template:
-
-```md
-# <Feature Group Name>
-
-## WHY
-<3–5 lines: user/business reason. No solutioning.>
-
-## WHO
-<Target users — specific roles or segments. Not "everyone".>
-
-## WHAT
-<3–5 lines: the capability in user-visible terms. Verbs over nouns.>
-
-## WHEN
-<Trigger/context: when in the user's workflow does this matter?>
-
-## Product Surface
-<Inherit from PRD-level Surface block, OR list overrides for this group.
-Required fields (see section 3.0.5). Use `inherits PRD` if no override.
-Any UNKNOWN field caps Confidence at 4 and blocks implementation specs.>
-
-## Definition of Done
-- <Observable, user-visible condition 1>
-- <Observable, user-visible condition 2>
-
-## ICE
-<Impact>,<Confidence>,<Ease>
-
-Impact: <one line>
-Confidence: <one line>
-Ease: <one line>
-
-Why Confidence is not higher: <required>
-What would invalidate this: <required>
-
-## Dependencies
-- <Other feature group or external dependency — or "None">
-
-## Out of Scope
-- <Explicit exclusion 1>
-- <Explicit exclusion 2>
-
-## Open Questions
-- <Unresolved question blocking confidence>
-
-## Status
-exploratory | validated-with-open-surface | validated | committed
-
-## Validation Metadata
-Last validated: YYYY-MM-DD
-Stale after: YYYY-MM-DD
-```
-
-| Section | Required | Common failure | Correction |
-|---|---|---|---|
-| WHY | yes | Restates WHAT | Force "so that <outcome>" clause |
-| WHO | yes | "All users" | Demand a role or segment |
-| WHAT | yes | Implementation language | Strip frameworks and services |
-| WHEN | yes | Vague ("anytime") | Anchor to a user moment |
-| Product Surface | yes | Silently inferred / missing | Run Surface Gate (3.0.5); UNKNOWN is allowed, silent inference is not |
-| DoD | yes | Engineering-shaped | Reject; rewrite as user-observable |
-| ICE | yes | Fake confidence | See section 5 |
-| Dependencies | optional | Hides scope creep | Each dep must be defined or external |
-| Out of Scope | yes | Empty | Block until ≥2 exclusions |
-| Open Questions | optional | Dumping ground | Flag if it blocks Confidence ≥ 7 |
-| Status | yes | Never updated; `validated` claimed while surface UNKNOWN | Use `validated-with-open-surface` when surface fields are UNKNOWN; update at every /prd update pass |
-| Validation Metadata | required for validated/committed | Missing on critical groups | Add at first /prd update after initial draft |
-
-### Status semantics
-
-| Status | Means | May proceed to |
-|---|---|---|
-| `exploratory` | Shape under discussion; not user-validated | further discovery; not persistence as ready |
-| `validated-with-open-surface` | User value, WHAT, DoD agreed; one or more required surface fields are UNKNOWN | persistence (with explicit blockers listed); NOT implementation specs |
-| `validated` | All convergence checks pass AND all required surface fields resolved | persistence; implementation specs |
-| `committed` | `validated` + the team has decided to build it | implementation |
-
-A group cannot skip from `exploratory` to `committed`. A group cannot be `validated` while any required surface field is UNKNOWN — downgrade to `validated-with-open-surface` instead.
-
-## 5. ICE Scoring
-
-Captured as a flat tuple: `Impact,Confidence,Ease` (e.g. `8,6,7`).
-
-### Scale (1–10 each)
-
-| Axis | 1 | 5 | 10 |
-|---|---|---|---|
-| **Impact** | Marginal value | Solid value for a real segment | Game-changer for the core problem |
-| **Confidence** | Pure guess | Reasonable inference, weak data | Validated with direct user evidence |
-| **Ease** | Massive cost, deep unknowns | Real work, known approach | Trivial to ship and operate |
-
-### Formula
-
-```
-score = Impact × Confidence × Ease / 100
-```
-
-Max score: 10.0. Typical honest range: 0.5–5.0.
-
-Why multiplicative: a weakness in ANY axis drags the entire score down. Low Confidence (C=3) cuts the score by 70% regardless of Impact. High Ease cannot compensate for low Impact.
-
-### Display guidance
-
-The ICE **tuple** (`8,6,7`) is the canonical artifact stored in the PRD and used in discussion. Humans reason well about individual axis values.
-
-The **composite score** (`I × C × E / 100`) is used only for ranking across feature groups (section 7). Do not use the composite score in conversation — it obscures the reasoning. When discussing priority, talk about the axes: "Impact is high but Confidence is low — we need a test before committing."
-
-Never let a single number replace the three-axis discussion.
-
-### Tie-break
-
-Higher Ease first (cheaper to validate), then higher Confidence.
-
-### Hard rules
-
-- Reject any axis at 9–10 without evidence-rooted justification.
-- If Confidence ≤ 4, propose the cheapest test that would raise it before recommending build.
-- If Ease ≥ 9, ask: "What's the hidden cost — operations, support, edge cases?"
-- Never accept 10,10,10.
-- Default Confidence for new ideas: 3–4.
-- Confidence ≥ 7 requires evidence from Researcher.
-- Ease ≥ 8 requires challenge from Challenger.
-- "Why Confidence is not higher" and "What would invalidate this" are required in every ICE block. An ICE block without them is not scored.
-- Default Confidence for new ideas with no user evidence: 3 (not 5, not 7).
-- **Surface cap.** If any of `Buyer entry point`, `Buyer-facing surface`, `Merchant operating surface`, `Source of truth`, or `Primary market / language` is UNKNOWN for this group (per section 3.0.5), Confidence is capped at **4** regardless of evidence quality. The cap is lifted only when the surface field is resolved or the user explicitly waives the uncertainty in writing (recorded in Open Questions).
-
-### Staleness defaults
-
-| Status | Confidence half-life | Stale after |
-|---|---|---|
-| `exploratory` | 14 days | 14 days from last validated |
-| `validated` | 45 days | 45 days from last validated |
-| `committed` | 90 days | 90 days from last validated |
-
-A stale group must be re-challenged by Challenger before prioritization or implementation. Do not silently resume stale groups.
-
-## 6. Convergence Checks
-
-A feature group is converged when ALL of:
-
-1. WHY, WHO, WHAT, WHEN are each ≤ 5 lines with no implementation language
-2. DoD has ≥ 1 user-observable condition and zero engineering-shaped lines
-3. Out of Scope has ≥ 2 explicit exclusions
-4. ICE tuple exists with per-axis justification
-5. No Open Question blocks Confidence ≥ 7
-6. User has explicitly validated the four checkpoints in 3.7
-7. Product Surface block exists; every required field (3.0.5) is either resolved or explicitly marked UNKNOWN with the cap and blocker recorded
-
-### Implementation-readiness gate
-
-Convergence ≠ implementation-ready. A group is **implementation-ready** only when, in addition to the 7 checks above:
-
-- No required surface field (Buyer entry point, Buyer-facing surface, Merchant operating surface, Source of truth, Primary market / language) is UNKNOWN.
-- Status is `validated` (not `validated-with-open-surface`).
-
-If any required surface field is UNKNOWN, the group may converge to `validated-with-open-surface` and be persisted with explicit blockers — but no implementation spec, ticket, or architecture work may start from it. The user may waive a specific blocker explicitly; record the waiver in Open Questions and keep Confidence capped at 4.
-
-If any check fails, loop back. Narrow scope — don't widen to fill weak sections.
-
-### Drift signals
-
-Pause and report when:
-
-- User adds sub-features mid-loop
-- Two groups describe the same user value
-- Out of Scope shrinks across iterations
-- DoD grows longer than WHAT
-- ICE Impact rises while Out of Scope is unchanged
-
-```
-DRIFT
-- Observed: <what changed>
-- Risk: <what this hides>
-- Options: tighten current group | split | defer addition
-```
-
-## 7. Cross-Group Ranking
-
-After ≥ 3 feature groups are validated, produce a ranking table:
-
-| Feature Group | I | C | E | Score | Decision |
-|---|---|---|---|---|---|
-| ... | 1–10 | 1–10 | 1–10 | n.nn | KEEP / DEFER / CUT / TEST-FIRST |
-
-Plus:
-
-- Top 3 sequencing recommendation
-- Explicit cut list with reasons
-- Items needing a test before honest scoring
-
-## 8. Writing PRD Updates
-
-`/prd update` is persistence, not discovery.
-
-Default persistence mode is **Patch Intent Summary**, not full Before/After.
-
-**PRD Lead pre-flight**: confirm a PRD Lead Context Brief exists for this `/prd update` flow (see §2.7) before assessing Patch Intent Summary vs. full PRD Delta Proposal. Do not re-run on `approved`, `preview`, or `cancel`.
-
-### Invariants
-
-- Only persist content that comes from prior discovery notes, answered questions, or an explicit convergence/checkpoint output.
-- Do not invent, improve, expand, or editorialize content during persistence.
-- Do not discover new content during `/prd update`.
-- If new content appears during update, stop and route it to `/prd note` or `/prd converge`.
-- Never treat `ok` as persistence approval.
-- Never echo full PRD content after writing.
-- The PRD file is the document surface; chat is the approval/control surface.
-
-### Answered-queue supersession annotations (`open-questions.md`)
-
-When the persisted PRD/`state.md` delta **supersedes** facts implied by older **Answered** rows, apply matching annotations in `docs/prd/questions/open-questions.md` in the **same** approved write batch (capture artifact only — not a version bump). Edit **Answer** and/or **PRD impact** cells only; use explicit supersession wording per `.cursor/commands/prd-questions.md` (e.g. pointer to newer `Q-NNN` or “persisted PRD”). **Never delete** answered rows.
-
-Include `docs/prd/questions/open-questions.md` under Patch Intent Summary **Files to change** when those annotations are needed; omit when no older answered facts are overridden.
-
-### Default: Patch Intent Summary
-
-Use Patch Intent Summary when all are true:
-
-- content source is prior discovery notes, answered questions, or the immediately preceding convergence proposal
-- no version bump
-- `history.md` and `archive/` will not be touched
-- no content is being deleted
-- no group is being promoted to `validated`, `committed`, or implementation-ready
-- no risky surface change after persistence
-- no implementation specs, tickets, architecture, dependency changes, terminal commands, or code
-
-Patch Intent Summary must be specific enough for approval but must not duplicate full PRD content.
-
-Format:
-
-```txt
-Patch Intent Summary
-
-Files to change:
-- <file> — <short change>
-
-Files not touched:
-- <file/group>
-
-Patch type:
-- patch
-
-Content source:
-- <notes/questions/convergence/checkpoint>
-
-Safety:
-- no status promoted to committed
-- no implementation specs/tickets/architecture
-- no history/archive update
-- unresolved blockers remain listed
-
-Approval required:
-Reply `approved` to apply.
-Reply `preview` to see the full before/after diff first.
-Reply `cancel` to stop.
-```
-
-### Full PRD Delta Proposal
-
-Use full Before/After only when:
-
-- user replies `preview`
-- version bump
-- `history.md` or `archive/` will be touched
-- deleting existing content
-- replacing already active non-scaffold PRD sections
-- promoting status to `validated`, `committed`, or implementation-ready
-- changing ICE by more than ±1
-- changing source of truth, buyer surface, merchant surface, payment model, or market/language after persistence
-- user explicitly asks to review exact wording before write
-
-### Approval behavior
-
-If previous assistant turn contained Patch Intent Summary:
-
-- `approved` applies the summarized patch
-- `preview` shows exact Before/After
-- `cancel` stops
-
-If previous assistant turn contained full PRD Delta Proposal:
-
-- `approved` applies the exact delta
-
-No Patch Intent Summary or full PRD Delta Proposal in the immediately preceding assistant turn means no write is allowed.
-
-### False-readiness guard
-
-A persistence update must never make a feature group look more ready than it is.
-
-- If required surface fields are UNKNOWN, status must not be `validated` or `committed`.
-- Use `validated-with-open-surface` only when user value/scope is agreed but surface blockers remain.
-- Do not create implementation specs, tickets, or architecture from `validated-with-open-surface`.
-- Do not promote anything to `committed` without explicit user decision.
-
-### After writing
-
-After applying, output only:
-
-```txt
-Updated:
-- <file> — <short change>
-
-Not touched:
-- <file/group>
-
-Remaining open questions:
-- <Q-ID> — <question>
-or
-- None
-
-Next recommended command:
-- /prd questions | /prd challenge | /prd converge | /prd prioritize
-```
-
-## 9. Collaboration
-
-| Need | Delegate to | When |
-|---|---|---|
-| Global PRD coherence before major action | PRD Lead | Before `converge`, `challenge`, `prioritize`, or `update` — produce a PRD Context Brief first |
-| Stress-test assumptions | Challenger | Before validating a group with weak WHY or thin evidence |
-| Evidence for Confidence | Researcher | When Confidence ≥ 7 is claimed without data |
-| Detect drift / inflation | Challenger | When Out of Scope shrinks or groups overlap |
-
-The skill is the construction and persistence surface. The agents provide viewpoints. Don't replicate their work — escalate.
-
-## 10. Anti-Patterns
-
-| Anti-pattern | Verdict | Notes |
-|---|---|---|
-| Discussing implementation design | Forbidden | Frameworks, services, database structure, architecture, implementation plans |
-| Avoiding operational constraints | Wrong — allowed | Operational burden, support complexity, maintenance cost, moderation load, infra constraints affecting scope realism |
-| Giant questionnaire | Wrong | Discovery is conversational |
-| Filling sections with prose to look complete | Wrong | Bloat ≠ clarity |
-| Empty Out of Scope | Wrong | Unbounded group |
-| DoD = "tests pass" / "shipped" | Wrong | Not user-observable |
-| 10,10,10 ICE | Wrong | Coarse thinking |
-| "We'll figure it out later" | Wrong | Becomes Open Question + lowers Confidence |
-| Adding a group before current one converges | Wrong | Breaks convergence loop |
-| Sprint plans, Jira tickets | Wrong | Not PRD output |
-| Drafting WHY/WHO/WHAT/WHEN before running the Surface Gate | Wrong | False convergence; surface gets silently inferred |
-| Marking Status `validated` while a required surface field is UNKNOWN | Forbidden | Use `validated-with-open-surface`. Misrepresenting readiness corrupts every downstream decision. |
-| Lifting the Confidence cap because the group "feels right" | Wrong | The cap is mechanical — only resolution or explicit waiver lifts it |
-| Proposing implementation specs from a `validated-with-open-surface` group | Forbidden | Block until surface resolves or the user waives in writing |
-| Treating technical feasibility assumptions as product facts | Forbidden | Examples: "Stripe 0€ session works", "WhatsApp bot delivers all booking states", "Shopify order sync maps cleanly". Record as assumptions/risks unless verified. |
-| Saying "all groups validated" when any group is `exploratory`, `validated-with-open-surface`, `unvalidated`, or `candidate` | Forbidden | Use precise status language: "candidate", "drafted", "checkpoint approved", "validated-with-open-surface", "validated", "committed" |
-| Inferring "ok" as approval of the whole PRD, all groups, or file persistence | Forbidden | "ok" validates the current checkpoint only |
-| Generating a build sequence before 3+ groups are validated in separate prior turns | Forbidden | Premature sequencing hides unresolved surface decisions |
-| Printing full PRD content in chat before writing a low-risk patch | Wrong | Use Patch Intent Summary; full content belongs in files |
-| Echoing full PRD content after writing | Forbidden | Report changed files only; the file is the source of truth |
-| Showing full Before/After for scaffold-to-first-content patches when content source is already in notes or convergence | Wrong | Use Patch Intent Summary unless user explicitly replies `preview` |
-
-## 11. Guardrails
-
-**Anti-governance principle:**
-
-> If governance overhead exceeds the product clarity gained, the governance system is failing.
-
-A PRD is a coordination tool, not a ritual artifact. The goal is faster correct decisions, not more process. When the system starts feeling like work, cut a section — don't add one.
-
-- **Chat-first.** Never write docs/prd/ without going through the delta procedure in section 8.
-- **One feature group at a time.** No parallel construction.
-- **Explicit validation.** The four checkpoints in 3.7 are required every time.
-- **No technical content.** Defer implementation discussion.
-- **Respect persisted state.** Read PRD.md and state.md before extending.
-- **Honor SISO.** RED/ORANGE input → clarify before constructing.
-- **Smaller wins.** When in doubt, cut.
-
-## 12. PRD Convergence
-
-The PRD is considered converged when:
-
-- Core user workflow is defined
-- Top feature groups are validated (ICE scored, DoD set, Out of Scope explicit)
-- Out-of-scope is explicit at both feature-group and PRD level
-- First implementation sequence is clear (top 3 from cross-group ranking)
-- Open questions no longer block MVP execution
-
-At this point: stop discovery, freeze PRD direction, transition to specs/implementation. The PRD Builder skill is no longer the active workflow — further changes require a deliberate `/prd update` with a version bump rationale.
-
-A PRD that never converges is not a PRD — it's a brainstorm.
-
-## 13. Handoff to Feature Area Workflow
-
-PRD Builder owns PRD discovery, convergence, and PRD-level Feature Groups. Its scope ends at the product definition layer.
-
-**Feature Area Workflow** (`.cursor/rules/feature-area-workflow.mdc`) owns execution decomposition: converting PRD Feature Groups into Feature Areas, decomposing Feature Areas into Scope Slices, and advancing Scope Slices toward user stories.
-
-### What PRD Builder must NOT do
-
-PRD Builder must never:
-
-- Create Feature Area files (`docs/product/feature-areas/`)
-- Create Scope Slice files (`docs/product/scope-slices/`)
-- Write user stories, specs, or tasks
-- Decompose a PRD Feature Group into Scope Slices directly (without Feature Area decomposition)
-- Use "Feature Group" naming in `docs/product/` artifacts
-
-### When to hand off
-
-Hand off when any of:
-
-- The PRD has converged (§12) and the next step is execution planning
-- A PRD Feature Group is too broad to yield Scope Slices without Feature Area decomposition first
-- The user asks to start building, planning, or decomposing product scope into work
-
-### How to hand off
-
-State explicitly:
-
-```txt
-PRD Feature Group "<name>" is at product-scope convergence.
-Execution decomposition requires Feature Area Workflow.
-
-Next step: read `.cursor/rules/feature-area-workflow.mdc` and convert this
-Feature Group into Feature Areas before creating any Scope Slices.
-```
-
-Do not perform the decomposition. Route clearly and stop.
diff --git a/.cursor/templates/product/feature-area.template.md b/.cursor/templates/product/feature-area.template.md
index dcd56f9..e5ab3d0 100644
--- a/.cursor/templates/product/feature-area.template.md
+++ b/.cursor/templates/product/feature-area.template.md
@@ -2,7 +2,7 @@
   Feature Area Template
   Location: .cursor/templates/product/feature-area.template.md
   Usage: copy to docs/product/feature-areas/<kebab-name>.md
-  Governed by: .cursor/rules/feature-area-workflow.mdc
+  Governed by: .cursor/rules/product-scope.cursor.mdc; playbook: docs/playbooks/feature-area.md
 -->
 
 # Feature Area: <!-- NAME -->
diff --git a/.cursor/templates/product/scope-slice.template.md b/.cursor/templates/product/scope-slice.template.md
index 7034383..2fa9b2e 100644
--- a/.cursor/templates/product/scope-slice.template.md
+++ b/.cursor/templates/product/scope-slice.template.md
@@ -2,7 +2,7 @@
   Scope Slice Template
   Location: .cursor/templates/product/scope-slice.template.md
   Usage: copy to docs/product/scope-slices/<fa-kebab>--<slice-kebab>.md
-  Governed by: .cursor/rules/feature-area-workflow.mdc
+  Governed by: .cursor/rules/product-scope.cursor.mdc; playbook: docs/playbooks/feature-area.md
 -->
 
 # Scope Slice: <!-- NAME -->
