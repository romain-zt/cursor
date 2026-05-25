<!--
  Scope Slice scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
-->

# Scope Slice: Owner mints and revokes a read-only share link

## Parent Feature Area

[Read-only sharing](../feature-areas/read-only-sharing.md)

## Status

`ready-for-user-stories`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## User Value

A founder shares a captured PRD version with someone outside the app via a read-only link, and can revoke that link at any time so access never outlives the founder's intent.

---

## Exact Boundary

### Included Behavior

- A signed-in owner of a captured PRD version mints a read-only link for that specific version.
- The minted link is unguessable (cryptographically random) and never includes raw owner / project identifiers.
- The owner sees the link, can copy it, and can see whether it is active or revoked.
- The owner can revoke the link at any time; revocation is immediate (next anonymous read fails).
- Minting is idempotent per (project, version) — a version has at most one active share link at a time.

### Excluded Behavior

- Anonymous viewer surface itself — sibling slice `anonymous-viewer-reads-shared-version`.
- Cross-version share (a link covering multiple versions) — out of v0.
- Per-link expiry / password protection — deferred; only owner-driven revoke in v0.
- Sharing live (non-versioned) PRD content — only captured versions are shareable.
- Email / external delivery of the link — owner copies and shares it themselves.

---

## UX States

| State | When | What the user sees / experiences |
|-------|------|----------------------------------|
| No link minted | Owner views a captured version that has no active share. | The owner sees a clear affordance to mint a read-only link; no link surface is shown yet. |
| Minting | Owner confirms mint. | Non-blocking progress; controls disabled briefly to prevent duplicate mints. |
| Active link | A share link is minted and active. | Owner sees the link with a copy affordance, plus a clearly labeled revoke affordance. |
| Revoking | Owner confirms revoke. | Non-blocking progress; on completion, the link is shown as inactive and the next anonymous read on that link fails. |
| Revoked | Link has been revoked. | The previously-active link no longer authorizes reads; owner can mint a new link if needed (a new random URL is generated). |
| System error (mint / revoke) | Persistence or signing fails. | Non-destructive error message; no partial state; owner can retry. |

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| Share link | Create / Read / Revoke (soft-delete or status flip) | Tied to (project, version); revocation status is read-checked on each anonymous read. |
| PRD version | Read | For ownership + existence check before minting. |
| User account | Read | Owner attribution. |

---

## Credit / Payment Impact

None — minting or revoking a share link does not burn credits.

---

## Sharing / Privacy Impact

This **is** the privacy / sharing control surface. By construction:
- No PII leaked into the link itself (random token, no owner id, no project id in plaintext).
- Revocation is the owner's single privacy lever (until expiry is added later).

---

## Feedback / Instrumentation Impact

None — minting a link is not a PRD milestone for owner feedback.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Read-only sharing](../feature-areas/read-only-sharing.md) | Feature Area | ready | Parent FA `validated`. |
| [PRD versioning](../feature-areas/prd-versioning.md) | Sibling Feature Area | ready | Captured PRD version is the shareable entity. |
| Sibling slice `anonymous-viewer-reads-shared-version` | Scope Slice (intra-FA) | pending | Consumer of minted links. |
| [Account & session](../feature-areas/account-session.md) | Sibling Feature Area | ready | Owner identity prerequisite. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

A signed-in founder of a captured PRD version mints an unguessable read-only link, sees a single active link per version with a copy affordance, and can revoke the link such that subsequent anonymous reads fail — without leaking PII into the link, without burning credits, and without sharing live or non-versioned PRD content.

---

## Readiness for User Stories

- [x] User value stated without implementation language
- [x] Exact boundary defined (included + excluded)
- [x] UX states enumerated (including error and empty states)
- [x] Business objects named
- [x] Credit / payment impact assessed
- [x] Sharing / privacy surface assessed
- [x] Feedback / instrumentation impact assessed
- [x] All dependencies named and their status known
- [x] All blockers resolved or NEED_HUMAN=true explicitly set
- [x] Acceptance-level outcome is behavioral (not a test or code spec)

**Verdict:** READY FOR USER STORIES

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded from approved Phase 4 slice proposal via `/feature-area scaffold-slices` | — |
| 2026-05-25 | Refined via `/feature-area refine-slice` | — |
| 2026-05-25 | Promoted to ready-for-user-stories after CLEAR readiness check (`/feature-area promote-slice`) | — |
