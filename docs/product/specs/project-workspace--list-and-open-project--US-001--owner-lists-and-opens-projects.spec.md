# Spec — Owner lists and opens projects

## Parent User Story

[US-001](../user-stories/project-workspace--list-and-open-project--US-001--owner-lists-and-opens-projects.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false

---

## Summary

Implements two routes (Next.js App Router per PD-002):
- `app/projects/page.tsx` — server component, queries `Project` for the authenticated owner ordered by `updatedAt desc`, renders a list with an "open" link to `/projects/{id}` per row, or an empty state with CTA to `/projects/new`.
- `app/projects/[id]/page.tsx` — server component, fetches the project by id, asserts `ownerId` matches the session, renders the project surface (initial scaffold; PRD content rendering deferred to `prd-versioning`).

Reuses the `Project` schema from the `create-project` Spec.

## Acceptance Criteria Trace

- **AC-1** → list query + ordering test asserts the right rows in the right order for the owner.
- **AC-2** → `[id]` page fetches by id and asserts owner match before render; integration test for happy path + cross-owner forbidden path.
- **AC-3** → empty state component renders when query returns `[]`; CTA link target is `/projects/new`.

## Data Model

No new tables. Reuses `Project` from `create-project` Spec.

## Contract

### Inputs
- `GET /projects` with session.
- `GET /projects/{id}` with session.

### Outputs
- `/projects`: list page or empty state.
- `/projects/{id}`: project surface (or 404 if not owned).

### Errors
- Unauthenticated → middleware redirect to `/signin`.
- `/projects/{id}` requested by a non-owner → 404 (same shape as "id not found" to avoid existence enumeration).

## UI Surface

- `app/projects/page.tsx` (list).
- `app/projects/[id]/page.tsx` (project surface).
- `app/projects/_components/ProjectListItem.tsx`.
- `app/projects/_components/EmptyProjects.tsx`.

## Async / Event / Webhook / Cron / Stream

### 1. Long-running operation

- No — sync REST is correct here. Two indexed Prisma queries (list `Project` by `ownerId`, get `Project` by id); p99 under 100ms.

### 2. External callback (webhook)

- No — sync REST is correct here. No third-party invoked.

### 3. Temporal trigger (cron)

- No — sync REST is correct here. No scheduled work owned by this Spec.

### 4. Event produced or consumed

- No — sync REST is correct here. List and read are pure reads, no domain event.

### 5. Real-time push to client (SSE / WebSocket)

- No — sync REST is correct here. Polling-on-render acceptable in v0: list refreshes on navigation. Live updates (new project from another tab) deferred.

### 6. Background job / queue

- No — sync REST is correct here. No deferred work.

### Summary

**Async classification:** Pure sync — no async patterns required, REST/server-action sufficient.

## Tests (mandatory)

### Unit
- `ProjectListItem` renders name + last-updated timestamp + open link.
- `EmptyProjects` renders CTA pointing to `/projects/new`.

### Integration
- Owner with 3 projects → list page returns all 3 in `updatedAt desc` order.
- Owner with 0 projects → list page returns the empty state.
- Cross-owner GET on `/projects/{otherOwnerId.projectId}` → 404 response (not 403, not project content).

### Acceptance (E2E)
- Founder signs in, creates a project, returns to `/projects`, sees the new project, clicks "open", lands on `/projects/{id}`.

### Non-functional
- Smoke only.

## Observability

- Log `project.list.view` with `ownerId` + count.
- Log `project.open.success` with `ownerId` + `projectId`.
- Log `project.open.forbidden_or_unknown` with `ownerId` + the **hashed** requested id (no plaintext id of another owner).

## Implementation Notes

- Framework: Next.js App Router (PD-002).
- Persistence: Prisma `findMany` for list, `findFirst({ where: { id, ownerId }})` for the detail page (returns null if not owned → 404).
- The detail page is a scaffold; PRD content rendering is owned by `prd-versioning` Specs.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [US-001](../user-stories/project-workspace--list-and-open-project--US-001--owner-lists-and-opens-projects.md) | Parent | ready | — |
| `project-workspace--create-project` Spec | Sibling Spec | ready | Provides `Project` schema. |
| [PD-002](../../product-decisions/PD-002-pilot-stack-baseline.md) | Decision | approved | Stack. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Out of Scope

- Project search / filter / pagination.
- Rename / archive / delete affordances.
- PRD content on `/projects/{id}` (deferred to `prd-versioning`).

## Readiness Checklist

- [x] Tied to parent US
- [x] AC trace mapped to tests
- [x] Data model reuse explicit
- [x] Inputs / outputs / errors enumerated
- [x] Mandatory tests named
- [x] Observability named
- [x] Implementation choices anchored on PD-002
- [x] Async / Event / Webhook / Cron / Stream — all 6 sub-questions answered + classification line filled (SP-15)
- [x] Dependencies known
- [x] Blockers resolved
- [x] Out-of-scope explicit

**Verdict:** READY FOR IMPLEMENTATION

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded, refined, promoted | — |
| 2026-05-25 | Added mandatory `## Async / Event / Webhook / Cron / Stream` section per SP-15. Classification: Pure sync. | — |
