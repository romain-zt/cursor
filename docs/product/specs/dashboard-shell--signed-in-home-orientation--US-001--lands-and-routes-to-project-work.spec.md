<!--
  Spec scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
  Inherits stack baseline from PD-002.
-->

# Spec — Owner lands on dashboard home and routes to project work

## Parent User Story

[US-001](../user-stories/dashboard-shell--signed-in-home-orientation--US-001--lands-and-routes-to-project-work.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false

---

## Summary

Implements the signed-in `/dashboard` page in the Next.js App Router (per PD-002): server component reads the authenticated owner from the Auth.js session, queries the owner's projects via Prisma (most-recent-first), and renders a greeting + primary action + project list (or empty-state CTA). Unauthenticated requests are redirected to `/signin` by the existing middleware established in the `account-session` Specs.

## Acceptance Criteria Trace

- **AC-1** → renders greeting + primary action for any authenticated session; covered by unit test of the `<DashboardHome>` component and an integration test against the page route with a stubbed session.
- **AC-2** → projects list rendered when the owner has ≥1 project; covered by an integration test seeding a project and asserting list rendering with the open affordance.
- **AC-3** → empty state shown when the owner has zero projects; CTA links to `/projects/new` (owned by `project-workspace`); covered by an integration test with no seeded projects.

## Data Model

No new tables. Reads from:
- `User` (`id`, `email`, optional `displayName`) — established by `account-session` US-001 Spec.
- `Project` (`id`, `ownerId`, `name`, `createdAt`, `updatedAt`) — defined in `project-workspace--create-project` Spec (sibling). Until that Spec is implemented, this Spec stubs the project list as an empty array.

## Contract

### Inputs
- HTTP `GET /dashboard` with an Auth.js session cookie.

### Outputs
- HTML page server-rendered with greeting, primary action, and project list (or empty state).

### Errors
- Unauthenticated → redirect to `/signin` (middleware).
- DB read failure → renders the page shell with an inline non-destructive error banner; does not log the owner out.

## UI Surface

- Page route: `app/dashboard/page.tsx` (server component).
- Component: `app/dashboard/_components/DashboardHome.tsx` (presentational).
- Empty state CTA links to `/projects/new` (route to be implemented by `project-workspace` Spec).

## Tests (mandatory)

### Unit
- `DashboardHome` renders greeting with the owner's display name (or email fallback).
- Empty state renders CTA pointing to `/projects/new`.

### Integration
- Authenticated session + zero projects → empty state visible, CTA rendered.
- Authenticated session + N projects → list of N rows visible in stable order.
- DB failure mocked → inline error banner visible; session intact.

### Acceptance (E2E)
- Sign up → land on `/dashboard` → empty state shown (covered by `account-session` E2E happy path).

### Non-functional
- Page TTFB acceptable for v0 (no explicit threshold; smoke-only).

## Observability

- Log `dashboard.view` event with `ownerId` (server-side; no PII in client).

## Implementation Notes

- Framework: Next.js App Router (PD-002).
- Auth: Auth.js v5 server-session read (PD-002).
- Persistence: Prisma Client (PD-002), query `prisma.project.findMany({ where: { ownerId }, orderBy: { updatedAt: 'desc' } })`.
- Strict TypeScript: explicit `Project` type from generated Prisma types.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [US-001](../user-stories/dashboard-shell--signed-in-home-orientation--US-001--lands-and-routes-to-project-work.md) | Parent | ready | — |
| [PD-001](../../product-decisions/PD-001-post-slice-workflow.md) | Decision | approved | Workflow governance. |
| [PD-002](../../product-decisions/PD-002-pilot-stack-baseline.md) | Decision | approved | Stack baseline. |
| `account-session` Specs (signup / sign-in) | Sibling Spec(s) | ready | Provide session middleware + `User` schema. |
| `project-workspace--create-project` Spec | Sibling Spec | pending | Provides `Project` schema. Until ready, this Spec stubs the project list. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Out of Scope

- Project creation form / page (`project-workspace` Spec).
- Credit balance display.

## Readiness Checklist

- [x] Spec ties cleanly back to its parent User Story
- [x] Acceptance criteria are mapped to tests
- [x] Data model changes (or absence of changes) explicit
- [x] Inputs / outputs / errors enumerated
- [x] Mandatory tests named (unit, integration, acceptance, non-functional)
- [x] Observability touchpoints named
- [x] Implementation framework / lib / persistence choices explicit (anchored on PD-002)
- [x] Dependencies named with known statuses
- [x] Blockers resolved or NEED_HUMAN=true with rationale
- [x] Out-of-scope explicit

**Verdict:** READY FOR IMPLEMENTATION

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded (`/spec scaffold`), refined (`/spec refine`), promoted (`/spec promote`) | — |
