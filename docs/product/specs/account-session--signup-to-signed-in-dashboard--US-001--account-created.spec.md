<!--
  Spec scaffolded under Phase 3 pilot of plan "Zedos verticale + post-slice".
  Grounded in PD-001 (post-slice methodology) and PD-002 (provisional stack baseline).
-->

# Spec: Account created from signup entry

## Parent User Story

[Account created from signup entry](../user-stories/account-session--signup-to-signed-in-dashboard--US-001--account-created.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## Summary

Implements the success path of public self-serve signup: from valid input submission to an authenticated session for the new owner landing at the post-auth entry. This Spec also **defines the canonical `User` and `Session` schema shared with all other `account-session` Specs**; sibling Specs reference this schema rather than re-declaring it.

## Acceptance Criteria Trace

| Parent AC | How this spec satisfies it | Notes |
|-----------|---------------------------|-------|
| AC-1 (signup completes with valid inputs) | Server action validates inputs, creates a `User` record with hashed password, opens a session via Auth.js Prisma adapter, returns a redirect to the post-auth entry. | Path: `app/(auth)/signup/actions.ts`. |
| AC-2 (progress visible, no double-submit) | The signup route uses a server action; the client form disables the submit control while pending using the `useFormStatus()` hook and shows a non-blocking pending indicator. | Owns the client form at `app/(auth)/signup/page.tsx`. |
| AC-3 (post-auth entry reflects solo-owner attribution) | After successful signup, the session cookie is set and the response redirects to `/dashboard` (post-auth entry), where the Dashboard shell FA owns layout; this Spec asserts the redirect target and solo-owner attribution in the session payload. | Sibling FA Dashboard shell owns the `/dashboard` surface; this Spec only commits to the redirect. |

---

## Data Model

**Canonical shared schema for `account-session`.** Sibling Specs reference this section; they do not re-declare.

### New / extended objects

- `User` (new) — single-owner identity record.
- `Session` (new) — database-backed authenticated session (Auth.js Prisma adapter convention).
- `Account` (new, Auth.js convention) — present in schema for future OAuth providers; **not written by v0** (no rows created with the Credentials provider).
- `VerificationToken` (new, Auth.js convention) — present in schema for future magic-link or email-verification flows; **not written by v0**.

### Field-level constraints

`User`:
- `id` — UUID, primary key, generated server-side.
- `email` — string, lowercase-normalized, unique index, RFC-5322 shape validation.
- `passwordHash` — string, Argon2id, parameters m=64MB / t=3 / p=4 (per PD-002).
- `createdAt`, `updatedAt` — timestamps with timezone; `updatedAt` auto-refresh on row update.

`Session`:
- `id` — UUID.
- `sessionToken` — opaque random string, unique index, 32 bytes encoded as URL-safe base64.
- `userId` — UUID, foreign key → `User.id`, ON DELETE CASCADE.
- `expires` — timestamp with timezone; v0 lifetime = 30 days from creation.

### Migrations or schema changes

- Initial Prisma migration creates the four tables above and the unique indexes. Migration name: `init-auth-session`. Migration runs once; subsequent Specs in `account-session` do not require migrations.

---

## Contract

### Inputs

- HTTP POST to the signup server action with form-encoded body:
  - `email`: string (required, non-empty, ≤320 chars).
  - `password`: string (required, ≥12 chars).
- Caller: unauthenticated browser (no existing session).

### Outputs

- On success:
  - HTTP 303 redirect to `/dashboard`.
  - `Set-Cookie` header sets the Auth.js session cookie (`__Secure-next-auth.session-token` in production; non-secure name in dev), HttpOnly, Secure, SameSite=Lax, Path=`/`, Expires = `Session.expires`.
- On already-authenticated request (edge handled in sibling Spec US-003): HTTP 303 redirect to `/dashboard`, no new account created.

### Errors

| Error | When | User-visible message | Recovery |
|-------|------|---------------------|----------|
| `INPUT_INVALID_EMAIL` | Email fails RFC-5322 shape validation | "Enter a valid email address." | Correct the email and resubmit. |
| `INPUT_PASSWORD_TOO_SHORT` | Password < 12 chars | "Password must be at least 12 characters." | Enter a longer password and resubmit. |
| `INPUT_MISSING_FIELD` | Email or password missing | "Email and password are both required." | Fill the missing field and resubmit. |
| `INTERNAL_ERROR` | Unexpected server failure | "Signup is temporarily unavailable. Please try again." | Retry; no account is created. |

Note: the `ACCOUNT_EXISTS` collision case is delegated to sibling Spec US-002 (`signup-error-explained`) per its anti-enumeration AC; this Spec only emits the four errors above.

---

## UI Surface

- Screen: `/signup` (public). States rendered by `app/(auth)/signup/page.tsx`:
  - Awaiting input: form with email + password inputs and a submit control.
  - Submitting: same form with submit disabled and a non-blocking pending indicator (e.g. inline spinner adjacent to submit).
  - Signed-in landed: not rendered by this Spec — `/dashboard` owns this state. This Spec only commits to the redirect.
- The `/dashboard` post-auth entry is owned by the `dashboard-shell` Feature Area; this Spec does not render `/dashboard` content.

---

## Async / Event / Webhook / Cron / Stream

### 1. Long-running operation

- No — sync REST is correct here. Argon2id hashing (PD-002 params m=64MB / t=3 / p=4) is constant-time bounded under ~500ms typical / ~1.2s p99 on commodity hardware; the two indexed DB writes (`User` insert + `Session` insert) are O(1). Total p99 stays well under the 2s threshold, with no external HTTP.

### 2. External callback (webhook)

- No — sync REST is correct here. No third-party is invoked by this Spec; signup is a Zedos-internal flow with no Stripe, mailer, or OAuth call.

### 3. Temporal trigger (cron)

- Out of scope — covered by another layer (infra cron). `Session` row expiry cleanup is owned by PD-007 §4 cron `cleanup.sessions.expired` (hourly), not by this Spec.

### 4. Event produced or consumed

- No — sync REST is correct here. v0 signup does not emit a cross-Spec event. Welcome email is Out of Scope; sibling Specs do not depend on a signup-completed event.

### 5. Real-time push to client (SSE / WebSocket)

- No — sync REST is correct here. The response is a 303 redirect; the client navigates to `/dashboard` via the browser. No further server-pushed state is needed for this Spec.

### 6. Background job / queue

- No — sync REST is correct here. Welcome email is Out of Scope (no mailer in v0 per PD-002). The only post-signup work is the redirect; nothing is deferred.

### Summary

**Async classification:** Pure sync — no async patterns required, REST/server-action sufficient.

---

## Tests

### Unit / behavior tests

- `argon2id-hash`: hashing a known password yields a verifiable hash with PD-002 parameters.
- `email-normalize-lowercase`: emails like `"User@Example.com"` are persisted lowercased.
- `password-length-validation`: a 11-char password fails validation, a 12-char password passes.

### Integration tests

- `signup-server-action-creates-user-and-session`: posting valid inputs creates exactly one `User` row, exactly one `Session` row tied to it, and returns a 303 to `/dashboard` with a Set-Cookie that decodes to the session token.
- `prisma-migration-init-auth-session`: applying the initial migration on a clean schema yields the four tables and the expected unique indexes.

### Acceptance tests against parent ACs

- `AC-1-valid-signup`: end-to-end browser test that submits valid inputs and observes redirect to `/dashboard` with the session cookie set.
- `AC-2-submit-disabled-during-pending`: browser test that asserts the submit control disables while the server action is pending and re-enables after completion.
- `AC-3-solo-owner-attribution`: after signup, `auth()` in a server component returns the new `User.id` and no other identity.

### Non-functional tests (performance, security, accessibility)

- Security: `email-uniqueness-enforced-by-db` — concurrent signups with the same email yield exactly one success and one `ACCOUNT_EXISTS` rejection (latter handled by sibling Spec).
- Security: `password-hash-not-logged` — application logs do not contain the raw password in any path.
- Accessibility: `signup-form-labels-and-aria` — inputs have associated labels and the pending state announces via `aria-live="polite"`.

---

## Observability

| Signal | Type | Purpose |
|--------|------|---------|
| `auth.signup.attempted` | event | How many founders reach the submit step? (funnel input) |
| `auth.signup.succeeded` | event | How many founders successfully create an account? (funnel success) |
| `auth.signup.failed{reason}` | event with tag | Which validation errors are most common in production? |
| `auth.signup.duration_ms` | metric (histogram) | Is signup slow enough that founders abandon? |
| `auth.signup.argon2.duration_ms` | metric (histogram) | Are the Argon2 parameters tuned to a sensible response window? |

Signals are emitted server-side; no PII (email, password) is attached to event payloads — only opaque user IDs once the account exists.

---

## Implementation notes

- **Framework**: Next.js App Router (PD-002).
- **Server entry**: server action `signupAction` in `app/(auth)/signup/actions.ts`, called from the client form via `<form action={signupAction}>`.
- **Auth library**: Auth.js v5 with the Prisma adapter; Credentials provider configured in `auth.config.ts`.
- **Password hashing**: Argon2id via `@node-rs/argon2` with PD-002 parameters.
- **Persistence**: Prisma client singleton at `lib/db.ts`.
- **Session strategy**: database-backed sessions (PD-002), 30-day lifetime, cookie attributes per Contract → Outputs.
- **Concurrency**: rely on the Postgres unique index on `User.email` to serialize signup races; do not pre-check + insert (race window). Translate the unique-violation error into the appropriate `ACCOUNT_EXISTS` event for sibling Spec US-002.
- **Configuration**: `AUTH_SECRET`, `DATABASE_URL` from environment per `.env.example`; this Spec does not introduce new environment variables.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Parent User Story](../user-stories/account-session--signup-to-signed-in-dashboard--US-001--account-created.md) | User Story | ready | `ready-for-spec` as of 2026-05-25. |
| PD-001 (post-slice workflow) | Product Decision | approved | Defines this Spec's gate ceremony. |
| PD-002 (pilot stack baseline) | Product Decision | provisional | Defines stack choices used here; awaits user approval before Phase 4 use. |
| [Dashboard shell](../feature-areas/dashboard-shell.md) | Sibling FA | pending | Owns the `/dashboard` post-auth entry that this Spec redirects to; FA exists at `exploratory`. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Out of Scope

- Signup error handling for `ACCOUNT_EXISTS` collision — sibling Spec US-002 (`signup-error-explained.spec.md`).
- Already-signed-in redirect — sibling Spec US-003 (`no-duplicate-when-signed-in.spec.md`).
- `/dashboard` content and layout — Dashboard shell Feature Area.
- Sign-out flow — separate future slice / story.
- OAuth providers, magic-link, password reset — not in v0 PRD; schema reserves the tables but no v0 writes.
- Multi-factor authentication — not in v0 PRD.

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

(Subdivision not needed: this Spec fits a single coherent commit / PR — schema migration + server action + client form + tests land together.)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded from approved `/spec propose` (Phase 3 pilot) via `/spec scaffold` | — |
| 2026-05-25 | Refined via `/spec refine` (Phase 3 pilot — all sections filled in one pass) | — |
| 2026-05-25 | Promoted to ready-for-implementation after CLEAR readiness check (`/spec promote`) | — |
| 2026-05-25 | Added mandatory `## Async / Event / Webhook / Cron / Stream` section per SP-15 (template + PD-007 + Spec Critic §4). Classification: Pure sync. | — |
