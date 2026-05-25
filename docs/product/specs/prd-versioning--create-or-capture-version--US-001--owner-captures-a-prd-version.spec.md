# Spec — Owner captures a PRD version

## Parent User Story

[US-001](../user-stories/prd-versioning--create-or-capture-version--US-001--owner-captures-a-prd-version.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false

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
| — | — | — |

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
- [x] Dependencies known
- [x] Blockers resolved
- [x] Out-of-scope explicit

**Verdict:** READY FOR IMPLEMENTATION

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded, refined, promoted | — |
