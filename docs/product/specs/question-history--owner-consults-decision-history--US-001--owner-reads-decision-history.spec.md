# Spec — Owner reads the project's decision history

## Parent User Story

[US-001](../user-stories/question-history--owner-consults-decision-history--US-001--owner-reads-decision-history.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false

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
| — | — | — |

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
- [x] Dependencies known
- [x] Blockers resolved
- [x] Out-of-scope explicit

**Verdict:** READY FOR IMPLEMENTATION

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded, refined, promoted | — |
