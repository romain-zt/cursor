# ZedCheckout Planning Test — Retrospective

## Artifacts Created

| Artifact | Path | Status |
|----------|------|--------|
| Vision | `docs/vision.md` | Active |
| Feature | `features/booking-flow.md` | Proposed |
| Story | `stories/book-single-service.md` | Draft |
| Spec | `specs/booking-widget-core.md` | Validated |
| Retrospective | `examples/real-world/zedcheckout-planning-test.md` | This file |

## What the OS Got Right

1. **Scope control classification forced good decisions.** The 1-6 classification table in `scope-control.mdc` made me justify *why* the booking flow is a Reusable Primitive, not a Client Config. This is the most valuable rule in the OS — it prevents the "build it for Little Biceps and generalize later" anti-pattern before it starts.

2. **Templates created consistent, auditable output.** Every artifact has the same structure. The spec template's mandatory "Out of Scope" section is particularly good — it forces you to name what you're NOT building, which is where scope creep hides.

3. **The spec-audit skill caught quality issues deterministically.** Running a checklist against the spec (not vibes, not "looks good") means the bar doesn't drift based on who's reviewing. The "measurable verbs in DoD" requirement specifically prevented me from writing vague criteria like "widget works well."

4. **Discipline rule (`discipline.mdc`) reduced noise.** "Say it in 1 sentence if 1 sentence works" and "Don't explain what you're about to do" kept artifacts tight. The anti-hallucination section ("Never invent API responses") directly prompted the "I'm flagging: I don't have real data on Little Biceps" callout in the Feature.

5. **Agent mode separation prevented scope mixing.** Strategist stays at Vision/Feature level; Planner stays at Feature/Story/Spec. This prevented the common failure mode of jumping from "what should we build" to "here's the database schema" in one step.

## What the OS Got Wrong (Honest Criticisms)

1. **The gate model doesn't work for async/cloud agents.** The prompt says "STOP. Wait for approval" at every stage. This is designed for interactive pair-programming sessions, not background agents. A cloud agent either (a) stops and produces nothing useful, or (b) ignores the gates and self-approves. The OS needs an "async mode" where gates produce artifacts for review but don't block execution. As-is, running the full pipeline required violating the gate protocol.

2. **The health check script has a platform bug.** `stat -f %m` is macOS-specific; `stat -c %Y` is Linux. The script tries both but the `set -u` strict mode causes it to fail on Linux when `stat -f %m` fails and the fallback is reached via subshell. I had to fix this to get PASS. For an "operating system" that's supposed to work anywhere, the health check should be tested on both platforms. This would bite any CI setup on Linux.

3. **No template for "classification justification."** The Feature template has a Classification field, but the scope-control rule says "Classification is a human decision at the boundary." The template doesn't prompt you to *justify* the classification — I added a "Classification Justification" section to the Feature because without it, someone could mark everything as "1. Reusable Primitive" without thinking. The template should require justification.

4. **The Vision template's "Active Features" section is awkward at creation time.** When writing the Vision, I had to forward-reference `features/booking-flow.md` which doesn't exist yet. The template says "Features being worked on now" but at Vision-creation time, no features exist. The template should note that this section starts empty and is backfilled.

5. **Story template doesn't link to acceptance criteria ↔ spec coverage.** The Story has Acceptance Criteria and a Specs list, but there's no mechanism to verify that every acceptance criterion is covered by at least one spec. This is a traceability gap — you could have an acceptance criterion that no spec addresses and nobody would notice until implementation.

6. **The spec-audit skill doesn't check the Solution section.** The audit checks Meta, Problem, Scope, Edge Cases, DoD, and Open Questions — but not Solution. A spec could have a vague or missing Solution ("TBD") and still pass the audit. The Solution section is where the actual design lives.

7. **No "assumptions" section in the spec template.** I had to resolve Open Questions with assumptions (e.g., "booking without payment is acceptable for pilot"). The spec template has Open Questions but no explicit Assumptions section. When an assumption turns out wrong, there's no quick way to find all specs affected. A dedicated Assumptions block would make this traceable.

8. **`specs/backlog.md` is referenced but not structured.** The Vision says "Add to `specs/backlog.md`" for Future Options, and there's a file at that path, but the OS doesn't provide a template for it. It's just a catch-all. For a system that's opinionated about structure everywhere else, the backlog is surprisingly freeform.

## Time Per Stage

| Stage | Approximate effort |
|-------|-------------------|
| Bootstrap | Minimal — workspace already had the OS. Fixed one health-check bug. |
| Vision | Light — template + context mapping. Most time spent on Non-Goals and Anti-Signals. |
| Feature | Moderate — classification justification, risk table, and kill criteria required real thinking. |
| Story | Light — derived directly from Feature's Smallest Valuable Slice. |
| Spec | Heaviest — data models, API design, 9 edge cases, 11 DoD items, 4 open questions. |
| Spec Audit | Fast — deterministic checklist, no ambiguity. |
| Validation | Light — answered open questions, updated status. |
| Retrospective | Moderate — required honest reflection, not just listing what happened. |

## Recommendations for OS v1.1

1. **Add an async/batch mode for the gate protocol.** Allow agents to produce all artifacts in one pass with explicit "ASSUMPTION: self-approved — human review needed" markers. Review happens post-production, not mid-flight.

2. **Fix health-check.sh for Linux.** The `stat` call ordering needs to be Linux-first since most CI and cloud environments are Linux.

3. **Add "Classification Justification" to the Feature template.** Make it a required section, not optional.

4. **Add an "Assumptions" section to the spec template.** Separate from Open Questions. Assumptions are answered (possibly wrong); Open Questions are unanswered.

5. **Add Solution to the spec-audit checklist.** It should be non-empty and describe a concrete approach, not "TBD."

6. **Add a traceability check:** every Story acceptance criterion should map to at least one Spec. Could be a health-check rule.

7. **Template the backlog.** `specs/backlog.md` should have a structured format (table with: item, classification, source feature, date added, status).

8. **Vision template note:** Add a comment to the "Active Features" section: "This section starts empty and is backfilled as Features are created."
