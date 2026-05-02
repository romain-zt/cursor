# Prompt: Test Cursor OS on ZedCheckout (Planning Loop Only)

> This is a **planning-only validation** — no code is written.
> Goal: stress-test the OS by running the full Vision → Feature → Story → Spec pipeline on a real product.
> Stop condition: one Validated Spec exists.

## Where to run

Cursor Background Agent (Ctrl+E) on a **fresh empty repo** OR a new local Cursor Agent session in a fresh folder.

## Prerequisites

1. The Cursor OS repo (this one) is accessible — either:
   - Pushed to GitHub and the agent can clone it, OR
   - Available at a known local path the agent can read
2. A **target ZedCheckout repo** (can be empty, will be populated)
3. Recommended model: **claude-4-opus** or **claude-3.7-sonnet (thinking)** — needs reasoning for Strategist mode

---

## THE PROMPT (paste below into the agent)

---

You are testing our company's Cursor Operating System on a real product: **ZedCheckout**.

This is a PLANNING-ONLY exercise. You will write artifacts (Vision, Feature, Stories, Specs) but NO production code. The goal is to validate that the OS produces useful, opinionated planning output on a real engagement.

## Step 0 — Bootstrap the OS into this repo

1. Clone or copy the Cursor OS from `https://github.com/romain-zt/cursor` (or local path: `~/Projects/AI/cursor`) into a temp directory.
2. Copy these from the OS into THIS repo:
   - `.cursor/` (entire folder — rules, commands, hooks, skills)
   - `templates/` (entire folder)
   - `docs/` (entire folder)
3. Create empty directories: `features/`, `stories/`, `specs/`, `tasks/`
4. Run `bash .cursor/hooks/health-check.sh` and confirm RESULT: PASS (or only minor warnings).
5. Confirm setup with one line: "OS bootstrapped. Ready."

If bootstrap fails, STOP and report the exact error. Do NOT improvise.

## Step 1 — Define the ZedCheckout Vision

Use `templates/vision.md` to write `docs/vision.md`. Use this context (do not invent):

- **Product:** ZedCheckout (a Booking-first product wedge under the Zed brand)
- **Wedge:** ZedCheckout Booking — booking flow that lives ON the merchant's site, not on a marketplace
- **First production pilot:** Little Biceps (a real merchant, not a toy MVP)
- **Critical product rule:** Build reusable primitives, configure Little Biceps. Never build Little-Biceps-only features.
- **Related but separate:** PayloadCMS.ai assistant (controlled internal beta), churn V0 → future rebooking intelligence
- **Explicit non-goal:** Do NOT build a Shopify alternative

Apply Strategist mode (`.cursor/rules/agents/strategist.mdc`). Challenge the input. If anything in the context above is unclear or contradictory, ask ONE question (not five). Otherwise, write the Vision.

The Vision document MUST include:
- A North Star sentence
- "Who we serve" + "Not for"
- The Wedge (one paragraph max)
- Non-Goals (at least 3)
- Success Signals (12 months) and Anti-Signals
- Active Features (start empty — fill in Step 2)

STOP after writing. Show me the Vision document. Wait for approval before Step 2.

## Step 2 — Define ONE Feature: Booking Flow

After Vision approval, switch to Planner mode (`.cursor/rules/agents/planner.mdc`).

Use `templates/feature.md` to write `features/booking-flow.md`.

The Feature is "Merchant booking flow on their own site." Use the Vision as grounding.

Required:
- Status = Proposed
- Classification (1-6 from `scope-control.mdc`) — this is critical, justify your choice
- Problem statement (real, not invented — base on the Little Biceps pilot reality)
- Outcome (concrete user-observable change)
- 3-5 Stories listed in the table
- "Smallest Valuable Slice" — pick ONE Story and justify
- At least 3 Out of Scope items (resist temptations: "while we're at it" features)
- 3+ risks with mitigation
- Kill Criteria (what would make us stop building)

If you find yourself inventing user pain points or evidence, STOP and say "I'm guessing here — I need real input from the user." Do NOT fabricate.

STOP after writing. Show me the Feature. Wait for approval.

## Step 3 — Write the Smallest Valuable Story

After Feature approval, write `stories/{name-of-smallest-slice}.md` using `templates/story.md`.

Required:
- User Statement: `As a {user type}, I can {do X} so that {benefit}`
- Acceptance Criteria — user-observable ONLY (never "function returns X"; always "user sees Y")
- 1-3 Specs listed (don't write them yet)
- Out of Scope for THIS Story
- Definition of Shipped

STOP. Show me the Story. Wait for approval.

## Step 4 — Write the First Spec

After Story approval, switch fully into spec-writing mode (`workflow/spec-writing.mdc`).

Pick ONE of the Specs listed in the Story (the most foundational one). Write it at `specs/{name}.md` using `templates/specs/spec.md`.

Required:
- Status = Draft initially
- Classification copied from the Feature
- Problem, Solution, Scope (in/out)
- Technical Design with concrete data models, API shapes, and dependencies
- Edge Cases table with at least 5 rows
- Definition of Done — every item must be VERIFIABLE (use measurable verbs: "passes", "returns", "renders", "matches")
- Open Questions list — every gap must be a question, not an assumption

After writing, run the spec-audit skill (`.cursor/skills/quality/spec-audit/SKILL.md`) on your own spec. Report the audit result.

If the audit returns "NEEDS WORK," fix and re-audit. Do NOT promote to Validated until audit returns "READY TO VALIDATE."

If Open Questions remain, leave status as Draft and present the questions. Do NOT validate prematurely.

STOP after the audit. Show me the Spec + audit result. Wait for me to answer Open Questions.

## Step 5 — Validate

After I answer the Open Questions, update the Spec:
- Mark all Open Questions as resolved (with my answers integrated into the Spec body)
- Move status from Draft → Validated
- Run `bash .cursor/hooks/health-check.sh` to confirm OS still passes

STOP. The Spec is now ready for `/implement` (which we will NOT run in this test).

## Step 6 — Retrospective

Produce a short retrospective at `examples/real-world/zedcheckout-planning-test.md`:

- What artifacts were created (with file paths)
- What the OS got right (be specific — name the rule/agent/skill)
- What the OS got wrong or felt awkward (be honest — bureaucracy? missing template field? unclear gate?)
- Time spent per stage (Vision, Feature, Story, Spec)
- Recommendations for OS v1.1

---

## Hard Rules (apply throughout)

1. **No code.** This is planning-only. If you find yourself writing TypeScript, STOP.
2. **No invented data.** If you don't know something about Little Biceps or ZedCheckout reality, ASK. Do not fabricate user pain points, metrics, or competitive context.
3. **One question at a time.** When stuck, ask ONE clarifying question. Do not dump 5 questions.
4. **Stop at every gate.** Vision → wait. Feature → wait. Story → wait. Spec → wait. Validation → wait. Each gate is a human approval point.
5. **No agent personas.** Stay in the mode the rule defines. Do not invent "The ZedCheckout Architect."
6. **Token discipline.** No "Great question!" No "Let me explain what I'm about to do." Just do it. Confirm in 1 line.
7. **If the OS feels wrong, say so.** Part of this test is finding bugs in the OS itself. Flag them in the retrospective.

## What success looks like

- 5 artifacts on disk: `docs/vision.md`, `features/booking-flow.md`, `stories/{x}.md`, `specs/{x}.md`, `examples/real-world/zedcheckout-planning-test.md`
- All artifacts pass their respective audits / templates
- `bash .cursor/hooks/health-check.sh` returns RESULT: PASS
- A retrospective with at least 3 honest criticisms of the OS

## What failure looks like

- Made-up user data (pretending to know Little Biceps' usage patterns)
- Skipping a gate (writing a Spec without showing the Story for approval)
- Writing code (any `.ts`, `.tsx`, `.js`)
- Spec marked Validated with unanswered Open Questions
- Retrospective that says "everything is great" — that means you didn't look hard
