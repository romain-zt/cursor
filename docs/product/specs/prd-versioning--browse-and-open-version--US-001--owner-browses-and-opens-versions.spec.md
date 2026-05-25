# Spec — Owner browses and opens captured PRD versions

## Parent User Story

[US-001](../user-stories/prd-versioning--browse-and-open-version--US-001--owner-browses-and-opens-versions.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false

---

## Summary

Adds two routes (Next.js per PD-002):
- `app/projects/[id]/versions/page.tsx` — server component, queries `PRDVersion` for the owned project ordered `createdAt desc`, renders list or empty state.
- `app/projects/[id]/versions/[versionId]/page.tsx` — server component, fetches `PRDVersion` by id (scoped to the project + owner), renders the payload in a `<VersionReadOnlyView>`.

Reuses the `PRDVersion` schema from the capture Spec.

## Acceptance Criteria Trace

- **AC-1** → list query ordering test asserts rows in expected order.
- **AC-2** → detail page renders the payload without any form / editor; integration test asserts no `<form>` or `<button type=submit>` is present.
- **AC-3** → empty state component renders on `[]` query; CTA links to `/projects/{id}/versions/new`.

## Data Model

No new tables. Reuses `PRDVersion`.

## Contract

### Inputs
- `GET /projects/{id}/versions` with session.
- `GET /projects/{id}/versions/{versionId}` with session.

### Outputs
- List page or empty state.
- Version read-only surface.

### Errors
- Unauthenticated → middleware redirect.
- Non-owner / unknown id → 404.

## UI Surface

- `app/projects/[id]/versions/page.tsx`.
- `app/projects/[id]/versions/[versionId]/page.tsx`.
- `app/projects/[id]/versions/_components/VersionListItem.tsx`.
- `app/projects/[id]/versions/_components/VersionReadOnlyView.tsx`.
- `app/projects/[id]/versions/_components/EmptyVersions.tsx`.

## Async / Event / Webhook / Cron / Stream

### 1. Long-running operation

- No — sync REST is correct here. Two indexed reads on `PRDVersion` (list-by-project + get-by-id); p99 under 100ms.

### 2. External callback (webhook)

- No — sync REST is correct here. No third-party invoked.

### 3. Temporal trigger (cron)

- No — sync REST is correct here. No scheduled work owned by this Spec. `PRDVersion` rows are kept indefinitely in v0 (audit trail).

### 4. Event produced or consumed

- Out of scope — covered by sibling Spec. Version-list view does not emit page-view events in v0; if analytics consumes one later, it will come from the create-or-capture Spec, not this read-only one.

### 5. Real-time push to client (SSE / WebSocket)

- No — sync REST is correct here. Polling-on-render acceptable in v0: list refreshes on navigation. Live "new version captured" push deferred.

### 6. Background job / queue

- No — sync REST is correct here. No deferred work on the read path.

### Summary

**Async classification:** Pure sync — no async patterns required, REST/server-action sufficient.

## Tests (mandatory)

### Unit
- `VersionListItem` renders label + capture date + open link.
- `VersionReadOnlyView` renders payload content without any interactive `form`.

### Integration
- Owner with 3 versions → list returns 3 rows in `createdAt desc`.
- Owner with 0 versions → empty state.
- Non-owner GET on `/projects/{otherOwner.projectId}/versions` → 404.
- Detail page rendered for an owned version contains the captured payload byte-for-byte (JSON match).

### Acceptance (E2E)
- Owner captures `v1` then navigates to the version list, opens `v1`, and sees the payload read-only.

### Non-functional
- Smoke only.

## Observability

- Log `prd_version.list.view` with `ownerId`, `projectId`, count.
- Log `prd_version.open.success` with `ownerId`, `versionId`.

## Implementation Notes

- Framework: Next.js App Router (PD-002).
- Persistence: Prisma `findMany` + `findFirst` with owner guard via project join.
- Read-only enforcement: the component renders payload via static markup; no client-side form or mutation is exposed.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [US-001](../user-stories/prd-versioning--browse-and-open-version--US-001--owner-browses-and-opens-versions.md) | Parent | ready | — |
| `prd-versioning--create-or-capture-version` Spec | Sibling Spec | ready | `PRDVersion` schema. |
| [PD-002](../../product-decisions/PD-002-pilot-stack-baseline.md) | Decision | approved | Stack. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Out of Scope

- Editing payload.
- Diff between versions.
- Sharing.

## Readiness Checklist

- [x] Tied to parent US
- [x] AC trace mapped to tests
- [x] Data model reuse explicit
- [x] Inputs / outputs / errors enumerated
- [x] Mandatory tests named
- [x] Observability named
- [x] Implementation anchored on PD-002
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
