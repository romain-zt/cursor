# US-001 — Anonymous viewer reads a shared PRD version

## Parent Scope Slice

[Anonymous viewer reads a shared PRD version](../scope-slices/read-only-sharing--anonymous-viewer-reads-shared-version.md)

## Status

`ready-for-spec`

> **NEED_HUMAN:** false

---

## Story

As an **anonymous visitor with a share link**, I want to **open the linked PRD version and read it without an account**, so that **I can review what the founder has shared with me — bounded strictly to read-only, no surrounding app surfaces, and no search-engine indexing**.

## Acceptance Criteria

- **AC-1**: A `GET /share/{token}` with a valid `ACTIVE` token renders the linked `PRDVersion.payload` in a read-only surface; no editing / signup / project-list affordances are present.
- **AC-2**: A `GET /share/{token}` with an unknown or `REVOKED` token returns a generic non-leaking error page; the response is **indistinguishable** between "never existed" and "revoked" (no enumeration leak).
- **AC-3**: The response sets `X-Robots-Tag: noindex, nofollow` and includes a `<meta name="robots" content="noindex, nofollow">` tag.

## UX States Covered

| State | Behavior |
|-------|----------|
| Read success | Payload rendered read-only with framing. |
| Loading | Skeleton or minimal placeholder. |
| Invalid / revoked link | Generic non-leaking error page. |
| Fetch error | Non-destructive error page; no payload exposed. |
| Crawler hit | `noindex, nofollow` served. |

## Out of Scope

- Any write / comment / feedback path.
- Anonymous viewer authentication / signup-from-share.
- Per-viewer analytics.
- Showing other versions of the same project.

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| ShareLink | Read | Existence + `ACTIVE` status. |
| PRDVersion | Read (payload only) | Only the linked version's payload. |

## Credit / Payment Impact

None.

## Sharing / Privacy Impact

This **is** the public read surface. Privacy posture is enforced here:
- `noindex, nofollow`.
- Non-leaking error indistinguishability.
- No PII beyond payload contents.

## Feedback / Instrumentation Impact

None.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Anonymous viewer reads a shared PRD version](../scope-slices/read-only-sharing--anonymous-viewer-reads-shared-version.md) | Scope Slice | ready | Parent. |
| Sibling `owner-mints-and-revokes-link` Spec | Sibling Spec | ready | Producer of share links. |
| `prd-versioning` Specs | Sibling | ready | `PRDVersion` payload schema. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Acceptance-Level Outcome

An anonymous visitor reaches `/share/{token}` and, for a valid active link, reads the version's frozen payload in a read-only, `noindex` surface — and for invalid or revoked tokens sees a generic non-leaking error page that does not reveal which case applies — without gaining write affordances, without exposing sibling versions, and without burning the owner's credits.

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
