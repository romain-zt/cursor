# Spec — Owner reads the project's decision history

## Parent User Story

[US-001](../user-stories/question-history--owner-consults-decision-history--US-001--owner-reads-decision-history.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** true — read surface is implementable as sync today (PD-007 §5 event-bus pattern committed as of 2026-05-25 approval), but the **producer contract** (write-side of `DecisionEntry`) still depends on `FA:guided-clarification` unblocking (B-002 — AI provider undecided). See §4 below.

---

## Summary

Adds `app/projects/[id]/decisions/page.tsx` (Next.js per PD-002) — server component, queries `DecisionEntry` for the owned project ordered `createdAt asc` (chronological), renders list or empty state. Defines the canonical `DecisionEntry` schema (read-side now, write-side later via `guided-clarification`).

## Acceptance Criteria Trace

- **AC-1** → list query + ordering test asserts rows in expected order.
- **AC-2** → page contains no edit / delete affordance; integration test asserts no `<form>` / `<button>` for mutation on the page.
- **AC-3** → empty state component renders on `[]` query.

## Data Model (canonical for `question-history` FA)

```prisma
model DecisionEntry {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  question  String
  decision  String
  payload   Json?
  createdAt DateTime @default(now())

  @@index([projectId, createdAt])
}
```

Write paths to `DecisionEntry` are not implemented in this Spec — they are the responsibility of `guided-clarification` Specs once that FA is unblocked.

## Contract

### Inputs
- `GET /projects/{id}/decisions` with session.

### Outputs
- List page or empty state.

### Errors
- Unauthenticated → middleware redirect.
- Non-owner / unknown projectId → 404.

## UI Surface

- `app/projects/[id]/decisions/page.tsx`.
- `app/projects/[id]/decisions/_components/DecisionListItem.tsx`.
- `app/projects/[id]/decisions/_components/EmptyDecisions.tsx`.

## Async / Event / Webhook / Cron / Stream

### 1. Long-running operation

- No — sync REST is correct here on the read path. One indexed Prisma `findMany` on `(projectId, createdAt asc)`; p99 under 100ms.

### 2. External callback (webhook)

- No — sync REST is correct here. No third-party invoked.

### 3. Temporal trigger (cron)

- No — sync REST is correct here. `DecisionEntry` rows are kept indefinitely in v0 (audit trail; PD-007 §4 cleanup list does not include them).

### 4. Event produced or consumed

- **Out of scope — deferred to future `guided-clarification` Spec (write side).** This Spec is the **consumer / read surface** for `DecisionEntry`. The producer contract — when, who, with what transactional guarantees — belongs to `guided-clarification` Specs (FA `exploratory`, blocked). When PD-007 is ratified and `guided-clarification` is cleared for vertical, those Specs will emit `decision.entry.appended` events per PD-007 §5 (at-least-once, idempotent on `(projectId, eventId)`). Until then, this read surface is functional with empty / externally-seeded data.

### 5. Real-time push to client (SSE / WebSocket)

- No — sync REST is correct here. Polling-on-render acceptable in v0: list refreshes on navigation. Live-update (new decision arrives mid-session) is out of scope.

### 6. Background job / queue

- No — sync REST is correct here. No deferred work on the read path.

### Summary

**Async classification:** Pure sync — read surface only. Producer contract (event production for `DecisionEntry`) is deferred to `guided-clarification` Specs.

## Tests (mandatory)

### Unit
- `DecisionListItem` renders timestamp + question + decision; no mutation affordance.

### Integration
- Owner with N entries → list returns N rows in `createdAt asc`.
- Owner with 0 entries → empty state.
- Non-owner GET → 404.
- DOM assertion: no `<form>` or interactive control for editing on the page.

### Acceptance (E2E)
- Owner navigates to `/projects/{id}/decisions`; with no entries, sees the empty state; with seeded entries, sees them in chronological order.

### Non-functional
- Smoke only.

## Observability

- Log `decision_history.view` with `ownerId`, `projectId`, count.

## Implementation Notes

- Framework: Next.js App Router (PD-002).
- Persistence: Prisma `findMany` with owner guard via project join.
- Append-only contract enforced at the API surface (no UPDATE / DELETE exposed for `DecisionEntry`).

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [US-001](../user-stories/question-history--owner-consults-decision-history--US-001--owner-reads-decision-history.md) | Parent | ready | — |
| `project-workspace--create-project` Spec | Sibling Spec | ready | `Project` schema. |
| [PD-002](../../product-decisions/PD-002-pilot-stack-baseline.md) | Decision | approved | Stack. |
| `guided-clarification` Specs | Sibling Specs | pending (FA blocked) | Will populate `DecisionEntry`. Read surface is functional with empty data. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| `guided-clarification` FA is `exploratory` + `NEED_HUMAN=true` (AI provider undecided — B-002). Read surface implementable now; producer contract for `DecisionEntry` deferred. | Write path (producer) for `DecisionEntry`. | true |

PD-007 was approved 2026-05-25 — event-bus pattern (§5) is the committed path for `decision.entry.appended`. The remaining `NEED_HUMAN` is purely about the producer-side ownership, which lives in `guided-clarification`.

## Out of Scope

- Write paths to `DecisionEntry`.
- Edit / delete affordances.
- Sharing the history.

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
- [x] Blockers resolved or NEED_HUMAN=true explicitly set (producer contract deferred to `guided-clarification` Specs; PD-007 approved)
- [x] Out-of-scope explicit

**Verdict:** READY FOR IMPLEMENTATION

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded, refined, promoted | — |
| 2026-05-25 | Added mandatory `## Async / Event / Webhook / Cron / Stream` section per SP-15. Classification: Pure sync (read surface). Producer contract for `DecisionEntry` deferred to `guided-clarification` Specs per PD-007 §5. NEED_HUMAN=true. | — |
| 2026-05-25 | PD-007 approved. PD-007 dependency lifted; remaining NEED_HUMAN reason is solely B-002 (`guided-clarification` AI provider undecided). | — |
