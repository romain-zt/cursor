# Spec — Owner captures a PRD version

## Parent User Story

[US-001](../user-stories/prd-versioning--create-or-capture-version--US-001--owner-captures-a-prd-version.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false — PD-007 approved 2026-05-25. Event-bus pattern (`prd.version.first-captured` per PD-007 §5) is the committed path.

---

## Summary

Adds `/projects/{id}/versions/new` (Next.js per PD-002) with a server action that validates the version label, performs a uniqueness check on `(projectId, label)`, and persists a new `PRDVersion` row whose `payload` JSONB is the captured snapshot of the project's current PRD draft. Defines the canonical `PRDVersion` schema for the `prd-versioning` FA.

## Acceptance Criteria Trace

- **AC-1** → server action creates `PRDVersion`; integration test verifies row + redirect to the version detail page.
- **AC-2** → Prisma unique constraint on `(projectId, label)` triggers the conflict path; integration test asserts inline conflict message + retained label.
- **AC-3** → `PRDVersion.payload` has no `UPDATE` endpoint exposed; integration test asserts no API route accepts mutations on a captured version.

## Data Model (canonical for `prd-versioning` FA)

```prisma
model PRDVersion {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  label     String
  payload   Json
  createdAt DateTime @default(now())

  @@unique([projectId, label])
  @@index([projectId, createdAt])
}
```

`payload` is the immutable snapshot. The "current PRD draft" source the snapshot reads from is the project's working PRD state, which is **not** modeled by this Spec (owned by upstream guided-clarification / authoring FAs). For v0 piloting, the working draft can be a `Project.draftPayload Json` field added in this same Prisma migration (or supplied via session state).

## Contract

### Inputs
- `POST` server action `captureVersion({ projectId: string, label: string })`.

### Outputs
- Success: redirect to `/projects/{projectId}/versions/{versionId}`.
- Conflict: re-render with inline message.
- Validation failure: re-render with field-level error.

### Errors
- Unauthenticated → middleware redirect.
- Non-owner of `projectId` → 404 (existence enumeration mitigation).
- Unique constraint violation → conflict response.

## UI Surface

- Page: `app/projects/[id]/versions/new/page.tsx`.
- Server action: `app/projects/[id]/versions/_actions/captureVersion.ts`.

## Async / Event / Webhook / Cron / Stream

### 1. Long-running operation

- No — sync REST is correct here. One `PRDVersion.create` within a transaction (with the event-write below); p99 under 80ms with no external HTTP.

### 2. External callback (webhook)

- No — sync REST is correct here. No third-party invoked.

### 3. Temporal trigger (cron)

- No — sync REST is correct here. `PRDVersion` rows are kept indefinitely in v0 (audit trail).

### 4. Event produced or consumed

- **Yes — handled by PD-007 §5 event bus.** When this capture is the **first** `PRDVersion` for this owner across all of the owner's projects, this Spec **produces** an event `prd.version.first-captured` consumed by `owner-milestone-feedback`. Per PD-007 §5, the event is written to the `Event` table **in the same DB transaction** as the `PRDVersion.create`; an optional `NOTIFY` is issued post-commit. Delivery contract: at-least-once, idempotent on `(ownerId, "first-captured")` (consumer must guard against multiple inserts if the producer races). This formalizes the previously-implicit contract documented in the `owner-milestone-feedback` Spec's "producer slices write to `OwnerMilestoneEvent`" line.

### 5. Real-time push to client (SSE / WebSocket)

- No — sync REST is correct here. Capture page redirects to `/projects/{id}/versions/{versionId}`; no further server-pushed state.

### 6. Background job / queue

- No — sync REST is correct here. Snapshot of `Project.draftPayload` is in-memory and committed in the same transaction; no work deferred.

### Summary

**Async classification:** Mixed sync + async — primary path sync, but emits `prd.version.first-captured` event (PD-007 §5) when this is the owner's first captured version, consumed by `owner-milestone-feedback`.

## Tests (mandatory)

### Unit
- `labelSchema.parse` rejects empty / >40 chars / whitespace-only.

### Integration
- Owner captures valid label → row exists with that `(projectId, label)`.
- Owner captures duplicate label → conflict response; only one row exists.
- Non-owner attempts capture → 404; no row created.
- Captured payload is byte-equal to the source draft at capture time.

### Acceptance (E2E)
- Owner captures `v1` from a project's draft; the new version is visible in the version list (see browse Spec).

### Non-functional
- Smoke only.

## Observability

- Log `prd_version.capture.success` with `ownerId`, `projectId`, `versionId`.
- Log `prd_version.capture.conflict` with `ownerId`, `projectId`, hashed label.

## Implementation Notes

- Framework: Next.js App Router (PD-002).
- Persistence: Prisma; unique constraint enforces conflict at DB level.
- Validation: Zod for label.
- Immutability: no exposed mutation endpoint; row is treated as append-only.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [US-001](../user-stories/prd-versioning--create-or-capture-version--US-001--owner-captures-a-prd-version.md) | Parent | ready | — |
| `project-workspace--create-project` Spec | Sibling Spec | ready | `Project` schema. |
| [PD-002](../../product-decisions/PD-002-pilot-stack-baseline.md) | Decision | approved | Stack. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | false |

PD-007 was approved 2026-05-25. Event-bus pattern committed per PD-007 §5.

## Out of Scope

- PRD draft authoring.
- Diff between versions.
- Sharing the version.

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
- [x] Blockers resolved (PD-007 approved 2026-05-25)
- [x] Out-of-scope explicit

**Verdict:** READY FOR IMPLEMENTATION

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded, refined, promoted | — |
| 2026-05-25 | Added mandatory `## Async / Event / Webhook / Cron / Stream` section per SP-15. Classification: Mixed sync + async (produces `prd.version.first-captured` event per PD-007 §5). NEED_HUMAN=true pending PD-007 ratification. | — |
| 2026-05-25 | PD-007 approved. NEED_HUMAN lifted (true → false). Event-bus pattern committed. | — |
