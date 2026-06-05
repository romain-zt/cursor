# Async Re-promote Pass — 2026-05-25

Closes Item 5 of the TODO. Companion to `2026-05-25-async-architecture-audit.md`.

## What this pass did

Added the mandatory `## Async / Event / Webhook / Cron / Stream` section (SP-15) to every Spec in `docs/product/specs/`. Each Spec now answers the 6 sub-questions with one of the four allowed shapes and ends with a one-line classification.

No Spec was demoted from `ready-for-implementation`. For Specs whose async path depends on PD-007 (still `proposed`), `NEED_HUMAN=true` was set with reason `awaiting PD-007 ratification` — implementation can start on the sync surface but the event-bus wiring must wait for PD-007 approval.

## Classification distribution (16 Specs)

| Classification | Count | Specs |
|---|---|---|
| Pure sync — REST/server-action sufficient | 11 | account-session signup-US-001, signup-US-003, signin-US-001, signin-US-003 ; dashboard-shell × 2 ; project-workspace × 2 ; prd-versioning--browse ; read-only-sharing × 2 |
| Sync with async helpers (constant-time budget) | 2 | account-session signup-US-002, signin-US-002 |
| Mixed sync + async (PD-007 §5 event bus) | 2 | prd-versioning--create-or-capture (producer of `prd.version.first-captured`) ; owner-milestone-feedback (consumer) |
| Pure sync (read-only) — producer contract deferred | 1 | question-history (consumer of `DecisionEntry`; producer side deferred to `guided-clarification`) |

## NEED_HUMAN raised (pending PD-007 approval)

| Spec | Reason |
|---|---|
| `prd-versioning--create-or-capture-version--US-001` | Produces `prd.version.first-captured` event via PD-007 §5; needs PD-007 ratified before committing to the `Event` table pattern. |
| `question-history--owner-consults-decision-history--US-001` | Read surface implementable now ; producer contract for `DecisionEntry` deferred to `guided-clarification` (FA blocked) + PD-007 ratification. |
| `owner-milestone-feedback--milestone-prompt-and-capture--US-001` | Re-casts the previously-implicit `OwnerMilestoneEvent` polling pattern as PD-007 §5 event-bus consumer ; needs PD-007 ratified before final wiring. Current polling-on-render works as the v0 poll fallback. |

The other 13 Specs reference PD-007 only for cron cleanup ownership (`PD-007 §4`) — read-only, non-blocking.

## Wins from this pass

- Three previously-implicit cross-Spec event contracts (`OwnerMilestoneEvent`, `DecisionEntry`, future `ai.operation.completed`) are now **named contracts** instead of conventions.
- Both anti-enumeration Specs (signup-error / signin-error) now explicitly name their constant-time budget as a Spec-local async helper rather than a stack-baseline obligation.
- Every cleanup concern (`Session`, `ShareLink`, `WebhookEvent`, `OwnerMilestoneEvent`) is traced to a named PD-007 §4 cron, not silently expected from somewhere.
- The Spec corpus is now **internally consistent on async**: a downstream agent reading any of the 16 Specs gets the same answer set against the same six questions.

## Forward expectations

When the 5 missing zones from the audit (Z1..Z5) eventually get Specs (LLM streaming, Stripe webhook, credit event consumer, mailer queue, cleanup cron), they will **be born aligned** with PD-007 patterns rather than retrofitted. The garde-fou is now active.
