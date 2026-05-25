<!--
  Spec scaffolded under Phase 3 pilot.
-->

# Spec: Returning owner sign-in

## Parent User Story

[Returning owner signs back in](../user-stories/account-session--returning-owner-sign-in--US-001--returning-owner-signs-in.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## Summary

Implements the success path of returning-owner sign-in: from valid credentials submission to an authenticated session for the existing owner landing at the same post-auth entry used after signup. Reuses the canonical `User` / `Session` schema defined by sibling Spec [`signup-to-signed-in-dashboard--US-001--account-created.spec.md`](./account-session--signup-to-signed-in-dashboard--US-001--account-created.spec.md); does not modify schema.

## Acceptance Criteria Trace

| Parent AC | How this spec satisfies it | Notes |
|-----------|---------------------------|-------|
| AC-1 (returning founder authenticates with valid credentials) | The `/signin` server action delegates to Auth.js's Credentials provider authorize callback, which looks up the `User` by email and verifies the password hash with Argon2id; on success a `Session` row is created via the Prisma adapter and the cookie is set. | Path: `app/(auth)/signin/actions.ts` calling `signIn('credentials', ...)`. |
| AC-2 (progress visible, no double-submit) | The signin route uses a server action; the client form disables the submit control while pending via `useFormStatus()` and shows a non-blocking pending indicator. | Owns the client form at `app/(auth)/signin/page.tsx`. |
| AC-3 (sign-in entry distinct from signup) | The signin page renders a form with sign-in copy, sign-in submit label, and a secondary link to `/signup` for users without an account; no signup form fields (e.g. no "create account" CTA as the primary action). | Copy and labels in `app/(auth)/signin/page.tsx`. |

---

## Data Model

Inherits the canonical schema from sibling Spec [`signup-to-signed-in-dashboard--US-001--account-created.spec.md`](./account-session--signup-to-signed-in-dashboard--US-001--account-created.spec.md). No new objects, no field changes, no migration. This Spec reads `User` and writes `Session`.

---

## Contract

### Inputs

- HTTP POST to the signin server action with form-encoded body:
  - `email`: string (required, non-empty).
  - `password`: string (required, non-empty).
- Caller: unauthenticated browser.

### Outputs

- On success:
  - HTTP 303 redirect to `/dashboard`.
  - `Set-Cookie` sets the Auth.js session cookie with attributes per the canonical schema (HttpOnly, Secure, SameSite=Lax, Expires = `Session.expires`).

### Errors

| Error | When | User-visible message | Recovery |
|-------|------|---------------------|----------|
| `INPUT_MISSING_FIELD` | Email or password missing | "Email and password are both required." | Fill the missing field and resubmit. |
| `INVALID_CREDENTIALS` | Email not found OR password hash does not verify (single combined branch) | "Those credentials are not valid." | Retry or use `/signup`. |
| `INTERNAL_ERROR` | Unexpected server failure | "Sign-in is temporarily unavailable. Please try again." | Retry; no session is opened. |

The `INVALID_CREDENTIALS` branch is anti-enumeration by design — it does not disclose whether the email matched an existing `User` row. Detailed error treatment is owned by sibling Spec US-002 (`auth-error-explained.spec.md`).

---

## UI Surface

- Screen: `/signin` (public). States rendered by `app/(auth)/signin/page.tsx`:
  - Awaiting credentials: form with email + password inputs, sign-in submit, and a secondary link to `/signup`.
  - Authenticating: same form with submit disabled and a non-blocking pending indicator.
  - Session restored: not rendered by this Spec — `/dashboard` owns this state.
- The `/dashboard` post-auth entry is owned by the `dashboard-shell` Feature Area; this Spec only commits to the redirect target.

---

## Tests

### Unit / behavior tests

- `credentials-authorize-success`: given a `User` with a known Argon2id hash, the authorize callback returns the user object for the matching email + password.
- `credentials-authorize-bad-password`: same `User`, wrong password → authorize returns null (combined with bad-email branch into `INVALID_CREDENTIALS`).
- `email-lookup-lowercase`: lookup normalizes email to lowercase before querying `User`.

### Integration tests

- `signin-server-action-opens-session`: posting valid credentials creates exactly one new `Session` row for the matching `User.id`, returns 303 to `/dashboard`, and sets the session cookie.
- `signin-rejects-unknown-email`: a non-matching email returns the `INVALID_CREDENTIALS` result without revealing the email is unknown.
- `signin-rejects-bad-password`: a matching email with wrong password returns the same `INVALID_CREDENTIALS` result with the same message.

### Acceptance tests against parent ACs

- `AC-1-valid-credentials-restore-session`: browser test — sign in with valid credentials, assert redirect to `/dashboard` with the session cookie set.
- `AC-2-submit-disabled-during-pending`: browser test that asserts the submit control disables while the server action is pending.
- `AC-3-signin-entry-distinct-from-signup`: snapshot or copy assertion — primary CTA reads "Sign in", secondary link reads "Create an account".

### Non-functional tests (performance, security, accessibility)

- Security: `password-never-logged` — application logs do not contain the raw password on any path.
- Security: `session-cookie-attributes` — Set-Cookie header has HttpOnly, Secure, SameSite=Lax, Expires.
- Accessibility: `signin-form-labels-and-aria` — inputs have associated labels and the pending state announces via `aria-live="polite"`.

---

## Observability

| Signal | Type | Purpose |
|--------|------|---------|
| `auth.signin.attempted` | event | How many founders reach the submit step? (funnel input) |
| `auth.signin.succeeded` | event | How many founders successfully restore a session? (funnel success) |
| `auth.signin.failed{reason=invalid_credentials\|input_missing_field\|internal_error}` | event with tag | Which failure modes dominate in production? Same event-name family as signup for shared dashboards. |
| `auth.signin.duration_ms` | metric (histogram) | Is sign-in slow enough that founders abandon? |
| `auth.signin.argon2_verify.duration_ms` | metric (histogram) | Track Argon2 verify latency separately from total. |

No PII attached.

---

## Implementation notes

- **Framework**: Next.js App Router (PD-002).
- **Server entry**: server action `signinAction` in `app/(auth)/signin/actions.ts`, which calls `signIn('credentials', ...)` from Auth.js.
- **Authorize callback**: implemented in `auth.config.ts`; looks up `User` by lowercased email and verifies password via Argon2id (PD-002 parameters); returns `{ id, email }` on success or `null` on failure.
- **Session creation**: handled by the Auth.js Prisma adapter automatically when authorize returns a user.
- **Anti-enumeration**: the authorize callback returns `null` for both "email not found" and "wrong password" — no error type distinction reaches the client. Constant-time response budgeting is in sibling Spec US-002.
- **Configuration**: `AUTH_SECRET`, `DATABASE_URL` already present from the signup Spec; no new environment variables.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Parent User Story](../user-stories/account-session--returning-owner-sign-in--US-001--returning-owner-signs-in.md) | User Story | ready | `ready-for-spec` as of 2026-05-25. |
| Sibling Spec (`signup-to-signed-in-dashboard--US-001--account-created.spec.md`) | Cross-slice Spec | ready | Defines the canonical schema and the Auth.js Credentials provider configuration. |
| PD-001, PD-002 | Product Decisions | approved / provisional | Governing decisions. |
| [Dashboard shell](../feature-areas/dashboard-shell.md) | Sibling FA | pending | Owns `/dashboard` post-auth entry. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Out of Scope

- Authentication error explanation — sibling Spec US-002 (`auth-error-explained.spec.md`).
- Already-signed-in redirect — sibling Spec US-003 (`no-second-signin-when-signed-in.spec.md`).
- New account registration — separate slice (Signup).
- Magic-link, OAuth, password reset — not v0 PRD.
- MFA — not v0 PRD.

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

(Subdivision not needed: server action + client form + Credentials provider config + tests land together.)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded from approved `/spec propose` (Phase 3 pilot) via `/spec scaffold` | — |
| 2026-05-25 | Refined via `/spec refine` (Phase 3 pilot) | — |
| 2026-05-25 | Promoted to ready-for-implementation after CLEAR readiness check (`/spec promote`) | — |
