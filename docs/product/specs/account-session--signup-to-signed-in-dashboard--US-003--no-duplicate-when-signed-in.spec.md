<!--
  Spec scaffolded under Phase 3 pilot.
-->

# Spec: Already-signed-in founder redirected from signup entry

## Parent User Story

[Already-signed-in founder cannot create a duplicate account](../user-stories/account-session--signup-to-signed-in-dashboard--US-003--no-duplicate-when-signed-in.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## Summary

Implements the edge path for `/signup`: when a request arrives with an active authenticated session, the signup form is not rendered and the founder is sent to the post-auth entry, preserving the existing session and solo-owner attribution. Inherits the data model from sibling Spec `US-001--account-created.spec.md`.

## Acceptance Criteria Trace

| Parent AC | How this spec satisfies it | Notes |
|-----------|---------------------------|-------|
| AC-1 (form not shown, founder redirected) | The `/signup` route segment performs a server-side `auth()` check; if a valid session exists, the layout / page returns a redirect to `/dashboard` before rendering the form. | Implemented in `app/(auth)/signup/page.tsx` (or a route-level `layout.tsx` short-circuit). |
| AC-2 (no second account created, attribution preserved) | The redirect happens before any signup server action runs; no `User` row is inserted; the existing session cookie is forwarded unchanged. | No interaction with the signup server action from this Spec. |

---

## Data Model

Inherits the canonical schema from sibling Spec [`account-session--signup-to-signed-in-dashboard--US-001--account-created.spec.md`](./account-session--signup-to-signed-in-dashboard--US-001--account-created.spec.md). No new objects, no field changes, no migration. This Spec only reads `Session` for the active-session check.

---

## Contract

### Inputs

- HTTP GET (or POST attempting submission) to `/signup` with an existing valid `__Secure-next-auth.session-token` cookie.

### Outputs

- HTTP 303 redirect to `/dashboard`.
- No new `Set-Cookie`; the existing session cookie is left untouched.
- No body content (the redirect short-circuits the page render).

### Errors

| Error | When | User-visible message | Recovery |
|-------|------|---------------------|----------|
| `INVALID_SESSION_COOKIE` | The cookie value does not decode or the matching `Session` row is missing or expired | (no message; the cookie is cleared and the signup form is rendered as if unauthenticated) | The founder proceeds with normal signup. |

Note: an expired or invalid session cookie is not surfaced as a user-visible error in this Spec; it is treated as "unauthenticated" by Auth.js and falls through to the normal signup flow owned by sibling Spec US-001.

---

## UI Surface

- Screen: `/signup` (public). Edge state rendered by `app/(auth)/signup/page.tsx`:
  - Already-signed-in (edge / gated): not rendered — the redirect short-circuits the response.

No new UI elements introduced.

---

## Async / Event / Webhook / Cron / Stream

### 1. Long-running operation

- No — sync REST is correct here. Single indexed read on `Session.sessionToken` (O(1)) followed by a redirect. p99 well under 50ms.

### 2. External callback (webhook)

- No — sync REST is correct here. No third-party involved.

### 3. Temporal trigger (cron)

- Out of scope — covered by another layer (infra cron). PD-007 §4 `cleanup.sessions.expired` owns `Session` row expiry.

### 4. Event produced or consumed

- No — sync REST is correct here. Detection of an already-signed-in request is a routing concern, not a domain event.

### 5. Real-time push to client (SSE / WebSocket)

- No — sync REST is correct here. 303 redirect; browser navigates.

### 6. Background job / queue

- No — sync REST is correct here. No deferred work on this path.

### Summary

**Async classification:** Pure sync — no async patterns required, REST/server-action sufficient.

---

## Tests

### Unit / behavior tests

- `is-active-session-detection`: a request with a valid session cookie returns truthy from the active-session helper; an expired cookie returns falsy.
- `invalid-session-cookie-cleared`: when the cookie value fails decode, the response includes a Set-Cookie that clears the session cookie (max-age=0).

### Integration tests

- `signup-route-redirects-when-authenticated`: a request to `/signup` with a valid session cookie returns 303 to `/dashboard` and the body is empty.
- `signup-route-renders-form-when-unauthenticated`: a request to `/signup` without a cookie returns 200 and renders the signup form.
- `existing-session-not-rotated`: after the redirect, the `Session.sessionToken` and `Session.expires` for the existing session are unchanged in the database.

### Acceptance tests against parent ACs

- `AC-1-redirect-not-form`: browser test — sign in, navigate to `/signup`, assert URL becomes `/dashboard` and the signup form is not rendered.
- `AC-2-attribution-preserved`: after the redirect, `auth()` in a server component still returns the original `User.id`, and `User` row count is unchanged from before the visit.

### Non-functional tests (performance, security, accessibility)

- Security: `signup-action-not-invoked-when-authenticated` — the signup server action is not invoked when the redirect short-circuits; a probe POST to the action with a valid session cookie also redirects without inserting a `User`.
- Accessibility: None — no user-visible UI changes; the redirect is the response.

---

## Observability

| Signal | Type | Purpose |
|--------|------|---------|
| `auth.signup.redirect_when_authenticated` | event | How often do already-signed-in founders hit `/signup`? Informs UX (do we need a clearer "sign in" link elsewhere?). |
| `auth.signup.invalid_session_cookie` | event | Detect cookie-tampering or expired-cookie patterns in production. |

No PII attached.

---

## Implementation notes

- **Server-side detection** via Auth.js's `auth()` helper called at the top of `app/(auth)/signup/page.tsx` (and in a `layout.tsx` that wraps the auth segment when appropriate).
- **Redirect mechanism**: Next.js `redirect()` from `next/navigation` returns a 303.
- **Cookie clearing** on invalid session uses `cookies().delete()` from `next/headers`.
- Stack inherited from PD-002. No new environment variables.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Parent User Story](../user-stories/account-session--signup-to-signed-in-dashboard--US-003--no-duplicate-when-signed-in.md) | User Story | ready | `ready-for-spec` as of 2026-05-25. |
| Sibling Spec US-001 (`account-created.spec.md`) | Spec | ready | Defines the canonical schema and the Auth.js session model this Spec relies on. |
| PD-001, PD-002 | Product Decisions | approved / provisional | Governing decisions. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Out of Scope

- Successful signup — sibling Spec US-001.
- Signup error handling — sibling Spec US-002.
- Sign-out before signup intent — separate slice.
- Multi-account switching — multi-user is a v0 Hard exclusion.

---

## Readiness for Implementation

- [x] Summary traces back to the parent User Story
- [x] All parent ACs traced (satisfied here, or explicitly deferred)
- [x] Data model fields named with constraints
- [x] Contract inputs/outputs/errors enumerated
- [x] UI surface named or marked None with reason
- [x] Async / Event / Webhook / Cron / Stream — all 6 sub-questions answered with one of the four allowed responses, and Async classification line filled
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

(Subdivision not needed: a single short-circuit in the auth segment + tests.)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded from approved `/spec propose` (Phase 3 pilot) via `/spec scaffold` | — |
| 2026-05-25 | Refined via `/spec refine` (Phase 3 pilot) | — |
| 2026-05-25 | Promoted to ready-for-implementation after CLEAR readiness check (`/spec promote`) | — |
| 2026-05-25 | Added mandatory `## Async / Event / Webhook / Cron / Stream` section per SP-15. Classification: Pure sync. | — |
