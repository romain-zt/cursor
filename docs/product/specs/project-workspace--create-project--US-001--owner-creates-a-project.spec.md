# Spec — Owner creates a project

## Parent User Story

[US-001](../user-stories/project-workspace--create-project--US-001--owner-creates-a-project.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false

---

## Summary

Adds a `/projects/new` page (Next.js App Router per PD-002) with a server action that validates the project name and persists a new `Project` row via Prisma, scoped to the authenticated owner. Redirects to `/projects/{id}` on success. This Spec defines the canonical `Project` schema for the `project-workspace` FA; sibling specs reuse it.

## Acceptance Criteria Trace

- **AC-1** → server action creates Project + redirects to `/projects/{id}`; integration test asserts row + redirect.
- **AC-2** → Zod schema rejects invalid names; integration test asserts form renders error and no row is created.
- **AC-3** → server action is idempotent on (ownerId, normalized name, sameRequest) via a request-token field; unit test for the guard.

## Data Model (canonical for `project-workspace` FA)

```prisma
model Project {
  id        String   @id @default(cuid())
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id])
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ownerId, updatedAt])
}
```

Validation: name length 1–80 chars; trimmed; collapses internal whitespace; not unique within an owner (founders can have multiple "Untitled" if they really want; PRD does not require unique).

## Contract

### Inputs
- `POST` server action `createProject({ name: string })` with Auth.js session.

### Outputs
- Success: redirect to `/projects/{id}`.
- Validation failure: re-render form with field-level error.
- System failure: re-render form with a non-destructive banner.

### Errors
- Unauthenticated → middleware redirect to `/signin`.
- Zod failure → field-level error.
- Prisma failure → banner; row not created.

## UI Surface

- Page: `app/projects/new/page.tsx` (form).
- Server action: `app/projects/_actions/createProject.ts`.
- Project surface (target of the redirect): owned by `list-and-open-project` Spec.

## Tests (mandatory)

### Unit
- `nameSchema.parse` rejects empty / >80 chars / whitespace-only.
- Server action returns the redirect target on success.

### Integration
- Authenticated POST with valid name → `Project` row exists with `ownerId`, response is a redirect.
- Authenticated POST with invalid name → no row created, form re-renders with error.
- Authenticated POST simulated double-submit (same idempotency key) → exactly one row created.

### Acceptance (E2E)
- Signed-in founder fills the form and lands on the project surface; an existing row exists in the DB.

### Non-functional
- Smoke only.

## Observability

- Log `project.create.success` (server) with `ownerId` + `projectId`.
- Log `project.create.validation_error` (server) with `ownerId` + error code.

## Implementation Notes

- Framework: Next.js App Router (PD-002).
- Validation: Zod.
- Persistence: Prisma Client (PD-002).
- Idempotency: a hidden `requestToken` (UUID) submitted with the form is upserted via `Project.upsert` keyed on `(ownerId, requestToken)` for that submission window.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [US-001](../user-stories/project-workspace--create-project--US-001--owner-creates-a-project.md) | Parent | ready | — |
| [PD-002](../../product-decisions/PD-002-pilot-stack-baseline.md) | Decision | approved | Stack. |
| `account-session` Specs | Sibling | ready | `User` schema + middleware. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Out of Scope

- Project rename / archive / delete.
- PRD authoring within the project.

## Readiness Checklist

- [x] Tied to parent US
- [x] AC trace mapped to tests
- [x] Data model explicit (canonical for FA)
- [x] Inputs / outputs / errors enumerated
- [x] Mandatory tests named
- [x] Observability named
- [x] Implementation choices anchored on PD-002
- [x] Dependencies known
- [x] Blockers resolved
- [x] Out-of-scope explicit

**Verdict:** READY FOR IMPLEMENTATION

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded, refined, promoted | — |
