<!--
  Spec scaffolded under Phase 3 pilot.
-->

# Spec: Already-signed-in founder redirected from signin entry

## Parent User Story

[Already-signed-in founder is not asked to sign in again](../user-stories/account-session--returning-owner-sign-in--US-003--no-second-signin-when-signed-in.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## Summary

Implements the edge path for `/signin`: when a request arrives with an active authenticated session, the signin form is not rendered and the founder is sent to the post-auth entry, with the existing session preserved unchanged. Mirrors the signup-side edge Spec ([`signup--US-003--no-duplicate-when-signed-in.spec.md`](./account-session--signup-to-signed-in-dashboard--US-003--no-duplicate-when-signed-in.spec.md)); inherits the canonical schema.

## Acceptance Criteria Trace

| Parent AC | How this spec satisfies it | Notes |
|-----------|---------------------------|-------|
| AC-1 (form not shown, founder redirected) | The `/signin` route segment performs a server-side `auth()` check; if a valid session exists, the page returns a redirect to `/dashboard` before rendering the form. | Implemented in `app/(auth)/signin/page.tsx`. |
| AC-2 (existing session preserved unchanged) | The redirect path does not call `signIn()`, does not call the Auth.js Credentials provider, and does not touch `Session.sessionToken` or `Session.expires`; the existing session cookie is forwarded unchanged in the redirect response. | No interaction with the signin server action from this Spec. |

---

## Data Model

Inherits the canonical schema from sibling Spec [`signup-to-signed-in-dashboard--US-001--account-created.spec.md`](./account-session--signup-to-signed-in-dashboard--US-001--account-created.spec.md). No new objects, no field changes, no migration. This Spec only reads `Session` to detect the active-session condition.

---

## Contract

### Inputs

- HTTP GET (or POST attempting submission) to `/signin` with an existing valid `__Secure-next-auth.session-token` cookie.

### Outputs

- HTTP 303 redirect to `/dashboard`.
- No new `Set-Cookie`; the existing session cookie is left untouched.
- No body content.

### Errors

| Error | When | User-visible message | Recovery |
|-------|------|---------------------|----------|
| `INVALID_SESSION_COOKIE` | The cookie value does not decode or the matching `Session` row is missing or expired | (no message; the cookie is cleared and the signin form is rendered as if unauthenticated) | The founder proceeds with normal sign-in. |

Same anti-enumeration posture as the signup-edge Spec: invalid cookie is treated as "unauthenticated", not surfaced as a user-visible error.

---

## UI Surface

- Screen: `/signin` (public). Edge state rendered by `app/(auth)/signin/page.tsx`:
  - Already-signed-in (edge / gated): not rendered — the redirect short-circuits the response.

No new UI elements introduced.

---

## Tests

### Unit / behavior tests

- `is-active-session-detection-shared-with-signup-edge`: the active-session helper used here is the same one used by sibling Spec `signup--US-003`; same behavior across both edges.
- `invalid-session-cookie-cleared-on-signin`: when the cookie value fails decode, the response includes a Set-Cookie that clears the session cookie.

### Integration tests

- `signin-route-redirects-when-authenticated`: a request to `/signin` with a valid session cookie returns 303 to `/dashboard`.
- `signin-route-renders-form-when-unauthenticated`: a request to `/signin` without a cookie returns 200 and renders the signin form.
- `existing-session-not-rotated`: after the redirect, `Session.sessionToken` and `Session.expires` are unchanged.

### Acceptance tests against parent ACs

- `AC-1-redirect-not-form`: browser test — sign in, navigate to `/signin`, assert URL becomes `/dashboard` and the signin form is not rendered.
- `AC-2-session-preserved`: after the redirect, `Session.sessionToken` is identical to the pre-visit value and `Session.expires` is unchanged.

### Non-functional tests (performance, security, accessibility)

- Security: `signin-action-not-invoked-when-authenticated` — the signin server action is not invoked when the redirect short-circuits; a probe POST to the action with a valid session cookie also redirects without creating a second `Session` row.
- Accessibility: None — no user-visible UI changes; the redirect is the response.

---

## Observability

| Signal | Type | Purpose |
|--------|------|---------|
| `auth.signin.redirect_when_authenticated` | event | How often do already-signed-in founders hit `/signin`? Informs UX. |
| `auth.signin.invalid_session_cookie` | event | Detect cookie-tampering or expired-cookie patterns at the signin entry. |

Same event-name family as the signup-edge Spec for dashboard reuse.

---

## Implementation notes

- **Server-side detection** via Auth.js's `auth()` helper at the top of `app/(auth)/signin/page.tsx` (or a shared `layout.tsx` for the auth segment — coordinate with sibling signup-edge Spec).
- **Redirect mechanism**: Next.js `redirect()` from `next/navigation`.
- **Cookie clearing** on invalid session uses `cookies().delete()`.
- **Shared with signup-edge**: consider extracting the active-session-or-redirect logic into a shared helper at `lib/auth/redirect-if-authenticated.ts` to avoid duplication; both signup and signin pages call it identically. This is a refactor opportunity, not a blocker.
- Stack inherited from PD-002. No new environment variables.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Parent User Story](../user-stories/account-session--returning-owner-sign-in--US-003--no-second-signin-when-signed-in.md) | User Story | ready | `ready-for-spec` as of 2026-05-25. |
| Sibling Spec (signup-edge, `signup-to-signed-in-dashboard--US-003--no-duplicate-when-signed-in.spec.md`) | Cross-slice Spec | ready | Identical mechanism; opportunity for shared helper. |
| Cross-slice canonical schema Spec | Cross-slice Spec | ready | Schema source of truth. |
| PD-001, PD-002 | Product Decisions | approved / provisional | Governing decisions. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Out of Scope

- Successful sign-in — sibling Spec US-001.
- Authentication error explanation — sibling Spec US-002.
- Sign-out flow — separate future slice.
- Account-switching between multiple owners — multi-user is a v0 Hard exclusion.

---

## Readiness for Implementation

- [x] Summary traces back to the parent User Story
- [x] All parent ACs traced (satisfied here, or explicitly deferred)
- [x] Data model fields named with constraints
- [x] Contract inputs/outputs/errors enumerated
- [x] UI surface named or marked None with reason
- [x] Tests section non-empty across unit, integration, and acceptance layers
- [x] Observability signals named with purpose
- [x] Implementation notes name stack and runtime constraints
- [x] All dependencies named with status
- [x] All blockers resolved or NEED_HUMAN=true explicitly set
- [x] Out of scope explicitly named

**Verdict:** READY FOR IMPLEMENTATION

---

## Tasks (optional)

| Task | Path | Status |
|------|------|--------|
| — | — | — |

(Subdivision not needed: a single short-circuit in the signin segment + tests; possibly a shared helper extracted with the signup-edge Spec.)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded from approved `/spec propose` (Phase 3 pilot) via `/spec scaffold` | — |
| 2026-05-25 | Refined via `/spec refine` (Phase 3 pilot) | — |
| 2026-05-25 | Promoted to ready-for-implementation after CLEAR readiness check (`/spec promote`) | — |
