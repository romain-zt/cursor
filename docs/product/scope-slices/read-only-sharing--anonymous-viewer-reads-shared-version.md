<!--
  Scope Slice scaffolded under Phase 4 of plan "Zedos verticale + post-slice".
-->

# Scope Slice: Anonymous viewer reads a shared PRD version

## Parent Feature Area

[Read-only sharing](../feature-areas/read-only-sharing.md)

## Status

`ready-for-user-stories`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## User Value

A person who received a read-only share link opens the linked PRD version and reads it without an account — confined to read-only, no PRD work surface, no indexable URL.

---

## Exact Boundary

### Included Behavior

- Anonymous, unauthenticated visitors can open a read-only PRD version via a valid share link.
- The anonymous read surface shows only the version's frozen payload — no project list, no other versions, no owner identity beyond what the PRD itself contains.
- Revoked or invalid links return a clear, non-leaking error page (not the same shape as "version exists but link revoked" vs "link never existed", to avoid enumeration leaks).
- The anonymous read surface is **noindex** for search engines.
- The anonymous surface clearly signals it is a read-only view (no editing affordance ever rendered).

### Excluded Behavior

- Any write / comment / feedback path on the anonymous surface — strictly read-only.
- Anonymous viewer authentication or signup-from-share — out of v0.
- Tracking individual anonymous viewers (per-viewer analytics) — out of v0.
- Showing other versions of the same project — only the linked version is exposed.

---

## UX States

| State | When | What the user sees / experiences |
|-------|------|----------------------------------|
| Read success | Anonymous visitor opens a valid, active share link. | The PRD version's frozen payload is rendered in a read-only surface, with a clear "read-only" framing and no editing affordances. |
| Loading | Page is fetching the shared content. | A skeleton or minimal placeholder; the read-only framing is set before content lands. |
| Invalid / revoked link | Link is unknown or revoked. | A generic non-leaking error page; the visitor cannot distinguish "never existed" from "revoked"; no PRD payload exposed. |
| Fetch error | Backend cannot serve the content (transient). | A non-destructive error page with a generic message; no PRD payload exposed. |
| Crawler hit | Search engine bot reaches the URL. | The surface is served with `noindex` directives so the link is not indexed; no special content for the bot. |

---

## Data Touched

| Object | Operation | Notes |
|--------|-----------|-------|
| Share link | Read (validate + check active status) | Read-only; revocation status is enforced on every read. |
| PRD version | Read (payload) | Only the linked version's payload is returned; no sibling versions, no project metadata beyond what is in the payload itself. |

---

## Credit / Payment Impact

None — anonymous reads do not burn credits (the owner's credits are not consumed by viewers).

---

## Sharing / Privacy Impact

This **is** the public read surface. Privacy posture:
- `noindex` so the URL is not surfaced by search engines.
- No PII exposure beyond what is intentionally in the PRD payload.
- Revoked link returns a non-distinguishing error to avoid enumeration leaks.
- No anonymous viewer profile / tracking.

---

## Feedback / Instrumentation Impact

None — anonymous reads do not feed `owner-milestone-feedback`.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Read-only sharing](../feature-areas/read-only-sharing.md) | Feature Area | ready | Parent FA `validated`. |
| Sibling slice `owner-mints-and-revokes-link` | Scope Slice (intra-FA) | ready | Producer of the share links this slice consumes. |
| [PRD versioning](../feature-areas/prd-versioning.md) | Sibling Feature Area | ready | Captured PRD version payload is the readable artifact. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Acceptance-Level Outcome

An anonymous visitor with a valid active share link reads the linked PRD version's frozen payload in a clearly read-only, `noindex` surface, sees a non-leaking generic error page when the link is invalid or revoked, and never gains write / editing / signup / project-list affordances — without burning the owner's credits, without indexing the URL, and without revealing the difference between "revoked" and "never existed".

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
