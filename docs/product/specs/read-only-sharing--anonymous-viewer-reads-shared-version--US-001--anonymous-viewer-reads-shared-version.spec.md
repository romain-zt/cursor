# Spec — Anonymous viewer reads a shared PRD version

## Parent User Story

[US-001](../user-stories/read-only-sharing--anonymous-viewer-reads-shared-version--US-001--anonymous-viewer-reads-shared-version.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false

---

## Summary

Adds `app/share/[token]/page.tsx` (Next.js per PD-002) — a public (no-auth) route that:
1. Looks up `ShareLink` by token; if not found OR status != `ACTIVE`, returns a generic 404 page (same response body for both cases).
2. Otherwise loads the linked `PRDVersion` and renders a read-only view.

The route is **excluded** from the auth middleware. Response headers include `X-Robots-Tag: noindex, nofollow`. The HTML head includes a robots meta tag with the same directive.

## Acceptance Criteria Trace

- **AC-1** → integration test: valid `ACTIVE` token → 200 + payload rendered + no form / mutation control.
- **AC-2** → integration tests:
  - Unknown token → returns the same 404 body shape as a `REVOKED` token (byte-for-byte response body comparison, ignoring randomized parts).
- **AC-3** → integration test asserts presence of both the response header and the meta tag.

## Data Model

No new tables. Reads from `ShareLink` + `PRDVersion`.

## Contract

### Inputs
- `GET /share/{token}` (no session required).

### Outputs
- 200 with the read-only payload view OR a generic 404 page.

### Errors
- All "link not found / not active" cases return the same generic 404 page.
- Backend fetch failure (DB unreachable) → 500 page with non-leaking copy; payload never exposed.

## UI Surface

- Route: `app/share/[token]/page.tsx` (public; excluded from auth middleware).
- Component: `app/share/[token]/_components/PublicVersionView.tsx`.
- Generic error page: `app/share/[token]/_components/GenericShareError.tsx` (used for both unknown-token and revoked-token paths).

## Tests (mandatory)

### Unit
- `PublicVersionView` renders payload but **no** `<form>`, `<button>`, `<input>` outside of inert markup.

### Integration
- Valid `ACTIVE` token → 200 + payload visible.
- Unknown token → 404 + `GenericShareError` body.
- `REVOKED` token → 404 + `GenericShareError` body **byte-equal** to the unknown-token body (ignoring fixed randomized parts like request ids).
- Response includes `X-Robots-Tag: noindex, nofollow` header AND the meta tag in HTML.
- No session cookie is set by the response.

### Acceptance (E2E)
- Owner mints a link → anonymous browser opens the URL → payload visible → owner revokes → reload → 404 generic error.

### Non-functional
- Smoke + assert the share endpoint does not consume any owner-side credit-burning code path.

## Observability

- Log `share.read.success` with `shareLinkId`, request fingerprint.
- Log `share.read.miss` with **hashed** token (no plaintext token in logs).

## Implementation Notes

- Framework: Next.js App Router (PD-002).
- Persistence: Prisma; lookup by `ShareLink.token` then load `PRDVersion`.
- Middleware: configure the auth middleware matcher to exclude `/share/:path*`.
- Indistinguishability: a single helper renders `GenericShareError` for both "not found" and "revoked"; the unit test pins the response body equality.

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [US-001](../user-stories/read-only-sharing--anonymous-viewer-reads-shared-version--US-001--anonymous-viewer-reads-shared-version.md) | Parent | ready | — |
| `read-only-sharing--owner-mints-and-revokes-link` Spec | Sibling Spec | ready | `ShareLink` schema + producer. |
| `prd-versioning` Specs | Sibling Specs | ready | `PRDVersion` payload schema. |
| [PD-002](../../product-decisions/PD-002-pilot-stack-baseline.md) | Decision | approved | Stack. |

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

## Out of Scope

- Per-viewer analytics.
- Comments / feedback on shared content.
- Per-link expiry / password protection.

## Readiness Checklist

- [x] Tied to parent US
- [x] AC trace mapped to tests
- [x] Data model reuse explicit
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
