# US-001 — Owner mints and revokes a read-only share link

## Parent Scope Slice

[Owner mints and revokes a read-only share link](../scope-slices/read-only-sharing--owner-mints-and-revokes-link.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false

---

## Story

As a **signed-in owner of a captured PRD version**, I want to **mint an unguessable read-only share link and revoke it on demand**, so that **I can share frozen PRD content externally and rescind access at any time**.

## Acceptance Criteria

- **AC-1**: For a captured `PRDVersion` they own, the founder can mint a `ShareLink` whose URL contains a cryptographically random token and no owner / project id in plaintext; the link is shown with a copy affordance.
- **AC-2**: A version has at most one **active** share link at a time — minting again when one is active either reuses the same active link or replaces it deterministically (no two active links).
- **AC-3**: The owner can revoke the active link; after revocation, the link is shown as inactive and subsequent anonymous reads on that URL fail (see sibling US).

## UX States Covered

| State | Behavior |
|-------|----------|
| No link minted | Mint affordance present. |
| Minting | Progress; controls disabled briefly. |
| Active link | URL shown + copy + revoke affordances. |
| Revoking | Progress; controls disabled briefly. |
| Revoked | URL shown inactive; can mint a new one (new random URL). |
| System error | Non-destructive error; no partial state; retry. |

## Out of Scope

- Anonymous read surface itself (sibling US).
- Per-link expiry / password protection.
- Cross-version share (one link covers multiple versions).
- Email / external delivery of the link.

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| ShareLink | Create / Update (revoke) | Tied to `(projectId, versionId)`. |
| PRDVersion | Read | Existence + ownership. |
| User account | Read | Attribution. |

## Credit / Payment Impact

None.

## Sharing / Privacy Impact

This **is** the privacy control: revocation is the owner's lever, and links never embed owner / project plaintext ids.

## Feedback / Instrumentation Impact

None.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Owner mints and revokes a read-only share link](../scope-slices/read-only-sharing--owner-mints-and-revokes-link.md) | Scope Slice | ready | Parent. |
| `prd-versioning` Specs | Sibling | ready | `PRDVersion` schema. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Acceptance-Level Outcome

A signed-in version owner mints an unguessable share link, sees at most one active link per version, can copy the URL and revoke it on demand, and observes that revoked links no longer authorize anonymous reads — without leaking owner / project plaintext ids in the URL and without burning credits.

## Readiness for Spec

- [x] As-X-I-do-Y-so-Z
- [x] ACs behavioral
- [x] UX states named
- [x] Out-of-scope explicit
- [x] Impacts assessed
- [x] Dependencies known
- [x] No open blockers
- [x] Outcome behavioral

**Verdict:** READY FOR SPEC

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded, refined, promoted | — |
