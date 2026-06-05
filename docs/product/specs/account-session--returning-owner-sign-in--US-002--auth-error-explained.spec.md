<!--
  Spec scaffolded under Phase 3 pilot.
-->

# Spec: Authentication error explanation and anti-enumeration

## Parent User Story

[Authentication error is explained without account enumeration](../user-stories/account-session--returning-owner-sign-in--US-002--auth-error-explained.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## Summary

Implements the error path of returning-owner sign-in: a single generic message for invalid credentials (regardless of whether the email exists), a constant-time response budget to mitigate timing-based account enumeration, and the invariant that no session is opened. Inherits the canonical schema and the signin server action from sibling Spec `US-001--returning-owner-signs-in.spec.md`.

## Acceptance Criteria Trace

| Parent AC | How this spec satisfies it | Notes |
|-----------|---------------------------|-------|
| AC-1 (failed sign-in explained actionably) | The signin server action returns a typed error result; the client form renders the inline form-level message; the entry context is preserved (no navigation). | Server: `app/(auth)/signin/actions.ts`. Client: `app/(auth)/signin/page.tsx` with `useFormState()`. |
| AC-2 (no account enumeration) | The single `INVALID_CREDENTIALS` branch covers both "email not found" and "wrong password" with identical message text. The authorize callback always runs an Argon2id verify (against a deterministic dummy hash if the email is not found) to keep the response time within the same window. | `lib/auth/constant-time-verify.ts` exposes the dummy-hash verify helper. |
| AC-3 (no session opened on failure) | The Auth.js Credentials provider authorize callback returns null on any failure; the adapter does not create a `Session` row. | No changes to adapter behavior. |

---

## Data Model

Inherits the canonical schema from sibling Spec [`signup-to-signed-in-dashboard--US-001--account-created.spec.md`](./account-session--signup-to-signed-in-dashboard--US-001--account-created.spec.md). No new objects, no field changes, no migration. This Spec only reads `User`.

---

## Contract

### Inputs

Same as sibling Spec US-001 (signin): HTTP POST signin server action with `email` + `password`.

### Outputs

- On any error, the server action returns a typed result `{ ok: false, formError: string }` consumed by `useFormState()`.
- No redirect on error.
- No `Set-Cookie` on error.

### Errors

| Error | When | User-visible message | Recovery |
|-------|------|---------------------|----------|
| `INPUT_MISSING_FIELD` | Email or password missing | "Email and password are both required." | Fill the missing field and resubmit. |
| `INVALID_CREDENTIALS` | Email not matched OR password verify fails (single combined branch) | "Those credentials are not valid." | Retry or use `/signup`. |
| `THROTTLED` | Too many failures from this client in the configured window (e.g. 10 attempts / 10 min) | "Too many sign-in attempts. Try again in a few minutes." | Wait and retry. |
| `INTERNAL_ERROR` | Unexpected server failure | "Sign-in is temporarily unavailable. Please try again." | Retry; no session is opened. |

The `INVALID_CREDENTIALS` message is identical for the "no such user" and "bad password" sub-cases. No second channel (email, etc.) reveals the distinction either.

---

## UI Surface

- Screen: `/signin` (public). Error states rendered by `app/(auth)/signin/page.tsx`:
  - Form-level error (`INVALID_CREDENTIALS`, `THROTTLED`, `INTERNAL_ERROR`): message above the submit, `role=alert`, `aria-live="polite"`.
  - Field error (`INPUT_MISSING_FIELD`): inline under the missing input, with `aria-describedby` association.

---

## Async / Event / Webhook / Cron / Stream

### 1. Long-running operation

- Yes — **handled by constant-time response budget pattern**. Anti-enumeration AC-2 requires sign-in error response time to be invariant to whether `User.email` exists. Implementation: wrap the credential check in `Promise.race(work, sleep(targetMs))` with `targetMs ≈ 700ms` matching the Argon2id worst case. Spec-local pattern; not a background job, a deliberate latency floor in-request.

### 2. External callback (webhook)

- No — sync REST is correct here. No third-party invoked.

### 3. Temporal trigger (cron)

- Out of scope — covered by another layer (infra cron). PD-007 §4 `cleanup.sessions.expired` owns `Session` row expiry. (Brute-force throttling is a separate middleware concern, also out of scope here.)

### 4. Event produced or consumed

- No — sync REST is correct here. Errors emit observability signals (`auth.signin.failed`, `auth.signin.unknown_email_collision`) — local telemetry, not event-bus contracts.

### 5. Real-time push to client (SSE / WebSocket)

- No — sync REST is correct here. Inline error message returned with the form re-render.

### 6. Background job / queue

- No — sync REST is correct here. Constant-time budget is in-request, not deferred.

### Summary

**Async classification:** Sync with async helpers — primary path sync but uses a constant-time response budget via `Promise.race(work, sleep(targetMs))` to defeat timing-based account enumeration.

---

## Tests

### Unit / behavior tests

- `constant-time-verify-when-email-unknown`: a sign-in attempt for an unknown email triggers an Argon2id verify against the dummy hash; total authorize duration is within the same configured window as a real verify.
- `result-shape-on-invalid-credentials`: authorize returning null yields `{ ok: false, formError: "Those credentials are not valid." }`.
- `result-shape-on-throttled`: when the rate-limiter rejects, the server action returns the `THROTTLED` message; authorize is not called.

### Integration tests

- `signin-unknown-email-no-session`: posting an unknown email returns `INVALID_CREDENTIALS`; no `Session` row is created; no Set-Cookie on the response.
- `signin-bad-password-no-session`: posting a matching email with wrong password returns the same `INVALID_CREDENTIALS` message; no `Session` row is created.
- `signin-error-keeps-entry-context`: posting any error case does not navigate away from `/signin`.

### Acceptance tests against parent ACs

- `AC-1-error-actionable`: browser test that asserts the inline form-level message is announced via aria-live and the entry stays at `/signin`.
- `AC-2-message-identical-for-unknown-and-bad-password`: response payloads and rendered DOM strings are byte-identical for the two sub-cases.
- `AC-2-constant-time-budget`: the response time stays within a configured window (e.g. ±50ms) for known-email-good-password (reference), known-email-bad-password, and unknown-email cases.
- `AC-3-no-session-on-failure`: after any failure, no `Session` row exists for the attempted email; no cookie is set.

### Non-functional tests (performance, security, accessibility)

- Security: `no-email-channel-on-error` — no outbound mail or external notification is sent on any error path.
- Security: `error-strings-do-not-disclose-internals` — error payloads never include stack traces or DB error text.
- Accessibility: `form-error-announced` — form-level error is announced via aria-live and has `role=alert`.

---

## Observability

| Signal | Type | Purpose |
|--------|------|---------|
| `auth.signin.failed{reason=invalid_credentials\|input_missing_field\|throttled\|internal_error}` | event with tag | Same event family as sibling Spec US-001 (signin) for shared dashboards. |
| `auth.signin.invalid_credentials.subcase{unknown_email\|bad_password}` | event with tag — **server-only, never sent to client** | Useful internally to detect probing patterns; tag never reaches the client response. |
| `auth.signin.throttled` | event | Detect rate-limiting hits in production. |
| `auth.signin.error.duration_ms` | metric (histogram) | Verify the constant-time budget holds in production. |

The `subcase` tag is recorded server-side only; the user-visible response is the same regardless. This satisfies AC-2 anti-enumeration while preserving operability.

---

## Implementation notes

- **Reuses the signin server action** from sibling Spec US-001. This Spec adds the error branches and the constant-time verify helper.
- **Constant-time verify helper**: `lib/auth/constant-time-verify.ts` exposes `verifyOrSpend(email)` that either verifies the real password hash or runs an Argon2id verify against a deterministic dummy hash, so the total time is statistically indistinguishable across the two branches.
- **Rate limiter**: a simple in-memory token bucket per-IP in `lib/auth/throttle.ts` for v0; switch to a shared store (Redis) when v1 scales out — out of v0 scope.
- **Dummy hash**: pre-computed at app boot from a fixed "no-such-user" password using the same Argon2id parameters as PD-002; stored at `lib/auth/dummy-hash.ts` (not a secret, but kept in code rather than env to avoid drift).
- Stack inherited from PD-002. No new environment variables for the helper; `AUTH_SIGNIN_THROTTLE_WINDOW_MS` and `AUTH_SIGNIN_THROTTLE_MAX` may be tuned via env if added to `.env.example`.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Parent User Story](../user-stories/account-session--returning-owner-sign-in--US-002--auth-error-explained.md) | User Story | ready | `ready-for-spec` as of 2026-05-25. |
| Sibling Spec US-001 (`returning-owner-signs-in.spec.md`) | Spec | ready | Defines the signin server action and the Credentials provider authorize callback this Spec extends. |
| Cross-slice canonical schema Spec (`signup--US-001--account-created.spec.md`) | Cross-slice Spec | ready | Schema source of truth. |
| PD-001, PD-002 | Product Decisions | approved / provisional | Governing decisions. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Out of Scope

- Successful sign-in — sibling Spec US-001.
- Already-signed-in redirect — sibling Spec US-003.
- Account recovery / password reset / magic-link — not v0 PRD.
- Distributed rate-limiter — v0 uses in-memory per-process limit; cross-instance coordination is post-v0.

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

(Subdivision not needed: small helper modules + authorize-callback extension + tests.)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded from approved `/spec propose` (Phase 3 pilot) via `/spec scaffold` | — |
| 2026-05-25 | Refined via `/spec refine` (Phase 3 pilot) | — |
| 2026-05-25 | Promoted to ready-for-implementation after CLEAR readiness check (`/spec promote`) | — |
| 2026-05-25 | Added mandatory `## Async / Event / Webhook / Cron / Stream` section per SP-15. Classification: Sync with async helpers (constant-time budget). | — |
