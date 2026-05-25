# Spec — Owner sees milestone prompt and submits / dismisses feedback

## Parent User Story

[US-001](../user-stories/owner-milestone-feedback--milestone-prompt-and-capture--US-001--owner-sees-prompt-and-submits-feedback.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false — PD-007 approved 2026-05-25. `OwnerMilestoneEvent` is re-cast as an event-bus row per PD-007 §5; consumer uses `LISTEN/NOTIFY` with Event-table polling fallback.

---

## Summary

Adds a global `<MilestonePromptHost>` client component mounted in the signed-in layout (Next.js per PD-002). On every signed-in render, the host queries the server for any unprompted milestone for the current owner (server action) and, if present, renders one prompt at a time. Submit and dismiss both update `OwnerMilestoneState.promptShownAt`. Submit additionally creates a `FeedbackEntry` row. Defines the canonical schemas for the FA.

## Acceptance Criteria Trace

- **AC-1** → first time a milestone fires (e.g. via the `prd-versioning--create-or-capture-version` Spec emitting an `OwnerMilestoneEvent` row), the next signed-in render surfaces the prompt; integration test seeds the event and asserts prompt visibility.
- **AC-2** → submit handler persists `FeedbackEntry` + flips `OwnerMilestoneState.promptShownAt`; integration test asserts row + non-re-display on next render.
- **AC-3** → dismiss handler flips `OwnerMilestoneState.promptShownAt` without creating a `FeedbackEntry`; integration test asserts row absent + non-re-display.

## Data Model (canonical for `owner-milestone-feedback` FA)

```prisma
model OwnerMilestoneEvent {
  id          String   @id @default(cuid())
  ownerId     String
  milestoneId String
  createdAt   DateTime @default(now())

  @@index([ownerId, milestoneId])
}

model OwnerMilestoneState {
  ownerId        String
  milestoneId    String
  promptShownAt  DateTime?
  updatedAt      DateTime @updatedAt

  @@id([ownerId, milestoneId])
}

model FeedbackEntry {
  id          String   @id @default(cuid())
  ownerId     String
  milestoneId String
  content     String
  createdAt   DateTime @default(now())

  @@index([ownerId, createdAt])
}
```

`OwnerMilestoneEvent` is appended by producer slices (e.g. `prd-versioning`) when a milestone first fires for an owner. `OwnerMilestoneState` is the "have we already prompted" record.

## Contract

### Inputs
- Server action `getNextMilestonePrompt(): { milestoneId; copy } | null`.
- Server action `submitFeedback({ milestoneId, content })`.
- Server action `dismissMilestonePrompt({ milestoneId })`.

### Outputs
- One milestone prompt at a time on the client.

### Errors
- Submission Zod failure → returned to client; prompt re-rendered with error; input preserved.
- DB failure → non-destructive banner; prompt remains; retry possible.

## UI Surface

- `app/(authed)/_components/MilestonePromptHost.tsx` (client).
- `app/(authed)/_actions/milestonePrompt.ts` (server actions).

## Async / Event / Webhook / Cron / Stream

### 1. Long-running operation

- No — sync REST is correct here for the prompt fetch and the submit/dismiss actions. Each call is one or two indexed queries on `(ownerId, milestoneId)`; p99 under 80ms.

### 2. External callback (webhook)

- No — sync REST is correct here. No third-party invoked.

### 3. Temporal trigger (cron)

- Out of scope — covered by another layer (infra cron). PD-007 §4 `cleanup.milestone-events.consumed` (weekly) deletes `OwnerMilestoneEvent` rows where `consumedAt IS NOT NULL` older than 90 days.

### 4. Event produced or consumed

- **Yes — handled by PD-007 §5 event bus.** This Spec **consumes** events of type `<domain>.<entity>.<milestone-trigger>` (e.g. `prd.version.first-captured` from `prd-versioning--create-or-capture-version`, future `project.first-created`, etc.). The current Spec models the consumer state via `OwnerMilestoneEvent` rows — under PD-007 §5 these become event-bus rows backed by the canonical `Event` table; the consumer uses `LISTEN` for liveness and falls back to polling the `Event` table on the existing render path. Delivery contract: at-least-once, idempotent on `(ownerId, milestoneId)` via the `OwnerMilestoneState` upsert. The Spec **does not produce** any cross-Spec event.

### 5. Real-time push to client (SSE / WebSocket)

- No — sync REST is correct here in v0. **Polling-on-render acceptable in v0** with explicit rationale: prompt latency is non-critical (acceptable to surface on the next page navigation, not within the millisecond the milestone fires). Future SSE-based push (so a milestone fired in another tab appears immediately) is reversible per PD-007 §5 reversibility matrix.

### 6. Background job / queue

- No — sync REST is correct here. No deferred work; the consumer logic runs inline on render.

### Summary

**Async classification:** Mixed sync + async — primary path sync (server actions for prompt / submit / dismiss), but consumes milestone events through the PD-007 §5 event bus (`Event` table + `LISTEN/NOTIFY` + polling fallback). The previous "polling-on-render" pattern is re-cast as the consumer's poll fallback, not a homegrown pattern.

## Tests (mandatory)

### Unit
- `getNextMilestonePrompt` returns `null` when no event exists or when `promptShownAt` is set.
- `submitFeedback` rejects empty / >1000 char content.

### Integration
- Seed `OwnerMilestoneEvent` for owner + milestone → next page render shows the prompt.
- Submit handler creates `FeedbackEntry` + sets `promptShownAt`; next render shows no prompt.
- Dismiss handler sets `promptShownAt` without creating `FeedbackEntry`; next render shows no prompt.
- Re-running the event producer does not re-show the prompt (idempotency at state level).

### Acceptance (E2E)
- Owner captures their first PRD version → on next render they see the prompt → submit short feedback → prompt closes → does not return.

### Non-functional
- Smoke only.

## Observability

- Log `milestone.prompt.shown` with `ownerId`, `milestoneId`.
- Log `milestone.prompt.submitted` with `ownerId`, `milestoneId`.
- Log `milestone.prompt.dismissed` with `ownerId`, `milestoneId`.

## Implementation Notes

- Framework: Next.js App Router (PD-002).
- Persistence: Prisma; `OwnerMilestoneState` upserted by both submit and dismiss.
- Idempotency: producer slices write to `OwnerMilestoneEvent`; only the first event per `(ownerId, milestoneId)` matters because `OwnerMilestoneState` is checked before prompting.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [US-001](../user-stories/owner-milestone-feedback--milestone-prompt-and-capture--US-001--owner-sees-prompt-and-submits-feedback.md) | Parent | ready | — |
| `account-session` Specs | Sibling Specs | ready | `User` + middleware. |
| `prd-versioning--create-or-capture-version` Spec | Sibling Spec | ready | Producer of at least one milestone signal. |
| [PD-002](../../product-decisions/PD-002-pilot-stack-baseline.md) | Decision | approved | Stack. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | false |

PD-007 was approved 2026-05-25. `OwnerMilestoneEvent` is now a canonical event-bus row (PD-007 §5).

## Out of Scope

- Cross-owner aggregation / admin dashboard.
- Continuous NPS / CSAT loops.
- Edit / delete of `FeedbackEntry`.

## Readiness Checklist

- [x] Tied to parent US
- [x] AC trace mapped to tests
- [x] Data model explicit (canonical for FA)
- [x] Inputs / outputs / errors enumerated
- [x] Mandatory tests named
- [x] Observability named
- [x] Implementation anchored on PD-002
- [x] Async / Event / Webhook / Cron / Stream — all 6 sub-questions answered + classification line filled (SP-15)
- [x] Dependencies known
- [x] Blockers resolved (PD-007 approved 2026-05-25; `LISTEN/NOTIFY` + polling fallback committed)
- [x] Out-of-scope explicit

**Verdict:** READY FOR IMPLEMENTATION

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded, refined, promoted | — |
| 2026-05-25 | Added mandatory `## Async / Event / Webhook / Cron / Stream` section per SP-15. Classification: Mixed sync + async (consumes milestone events via PD-007 §5 event bus). Previously-implicit `OwnerMilestoneEvent` polling pattern formalized as the v0 poll fallback. NEED_HUMAN=true pending PD-007 ratification. | — |
| 2026-05-25 | PD-007 approved. NEED_HUMAN lifted (true → false). `LISTEN/NOTIFY` + Event-table polling committed. | — |
