# Spec — Owner mints and revokes a read-only share link

## Parent User Story

[US-001](../user-stories/read-only-sharing--owner-mints-and-revokes-link--US-001--owner-mints-and-revokes-share-link.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false

---

## Summary

Adds mint / revoke server actions and a share-link surface on the version detail page (Next.js per PD-002). Tokens are generated via `crypto.randomBytes(32)` and base64url-encoded; only their **hash** is stored. The plaintext URL is shown to the owner exactly once on mint, and on subsequent visits the link surface shows "active" with a copy affordance (the token is also retrievable via a separate "reveal" action that re-derives the URL by signing the stored token — but the simpler v0 approach below is to store the token in plaintext server-side scoped to authenticated owner reads only).

For v0 minimality: store the token in plaintext server-side but ensure (a) `ShareLink.token` column is **not** returned to anonymous reads, (b) only the owner of the version can read the token. Defines the canonical `ShareLink` schema for the FA.

## Acceptance Criteria Trace

- **AC-1** → `mintShareLink` action persists a `ShareLink` with a random token; integration test asserts token bytes >=32; URL renders with copy affordance.
- **AC-2** → mint action upserts on `(versionId, status: ACTIVE)`; integration test asserts no two `ACTIVE` rows can exist for the same `versionId`.
- **AC-3** → `revokeShareLink` action flips `status` to `REVOKED` + sets `revokedAt`; subsequent anonymous reads see no `ACTIVE` row and fail per sibling Spec.

## Data Model (canonical for `read-only-sharing` FA)

```prisma
enum ShareLinkStatus {
  ACTIVE
  REVOKED
}

model ShareLink {
  id         String          @id @default(cuid())
  projectId  String
  versionId  String
  version    PRDVersion      @relation(fields: [versionId], references: [id])
  token      String          @unique
  status     ShareLinkStatus @default(ACTIVE)
  createdAt  DateTime        @default(now())
  revokedAt  DateTime?

  @@unique([versionId, status], name: "one_active_per_version")
  @@index([projectId])
}
```

The partial unique on `(versionId, status)` is enforced at app level if Postgres partial-unique syntax is not used; the simpler `@@unique([versionId, status])` works because there is exactly one `ACTIVE` row possible. If there are multiple `REVOKED` rows, this constraint fails — so the migration uses a **partial unique index** in raw SQL:

```sql
CREATE UNIQUE INDEX share_link_one_active_per_version
  ON "ShareLink"("versionId") WHERE status = 'ACTIVE';
```

## Contract

### Inputs
- Server action `mintShareLink({ versionId })`.
- Server action `revokeShareLink({ shareLinkId })`.

### Outputs
- `mintShareLink`: returns `{ url: string }` where `url = /share/{token}`.
- `revokeShareLink`: returns `{ ok: true }`.

### Errors
- Unauthenticated → middleware redirect.
- Non-owner of `versionId` → 404.
- Mint on already-active version → returns the existing `ACTIVE` row's URL (idempotent).

## UI Surface

- `app/projects/[id]/versions/[versionId]/_components/ShareLinkPanel.tsx` (client).
- `app/projects/[id]/versions/[versionId]/_actions/shareLink.ts` (server actions).

## Tests (mandatory)

### Unit
- Token generator returns >=32 bytes of entropy.
- `mintShareLink` is idempotent against an already-`ACTIVE` row.

### Integration
- Mint on a version owned by the founder → `ShareLink` row exists with `status=ACTIVE`.
- Mint again → returns the same URL; only one `ACTIVE` row exists.
- Revoke → row flips to `REVOKED` + `revokedAt` set.
- Non-owner mint attempt → 404; no row created.

### Acceptance (E2E)
- Owner mints a link from the version page, copies the URL, then revokes; the URL surface reflects "revoked".

### Non-functional
- Smoke only.

## Observability

- Log `share_link.mint` with `ownerId`, `versionId`, `shareLinkId`.
- Log `share_link.revoke` with `ownerId`, `shareLinkId`.

## Implementation Notes

- Framework: Next.js App Router (PD-002).
- Persistence: Prisma; partial unique index enforced via raw migration SQL.
- Token entropy: `crypto.randomBytes(32).toString('base64url')`.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [US-001](../user-stories/read-only-sharing--owner-mints-and-revokes-link--US-001--owner-mints-and-revokes-share-link.md) | Parent | ready | — |
| `prd-versioning` Specs | Sibling Specs | ready | `PRDVersion` schema. |
| [PD-002](../../product-decisions/PD-002-pilot-stack-baseline.md) | Decision | approved | Stack. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Out of Scope

- Per-link expiry / password protection.
- Email / external delivery.
- Cross-version share.

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
