<!--
  Spec scaffolded under Phase 3 pilot.
-->

# Spec: Signup error explanation and anti-enumeration

## Parent User Story

[Signup error is explained without leaking signup state](../user-stories/account-session--signup-to-signed-in-dashboard--US-002--signup-error-explained.md)

## Status

`ready-for-implementation`

> **NEED_HUMAN:** false
> **NEED_UPDATE:** false

---

## Summary

Implements the error path of public self-serve signup: actionable inline explanations on validation failure, a single anti-enumeration message on account-already-exists, and the invariant that no partial account or session is created. Inherits the data model from sibling Spec `US-001--account-created.spec.md` (no schema change here).

## Acceptance Criteria Trace

| Parent AC | How this spec satisfies it | Notes |
|-----------|---------------------------|-------|
| AC-1 (actionable explanation on failure) | The signup server action returns a typed error result; the client form renders the inline message tied to the failing field; the entry context is preserved (no full page redirect on error). | Server: `app/(auth)/signup/actions.ts`. Client: `app/(auth)/signup/page.tsx` with `useFormState()`. |
| AC-2 (no partial account or session on failure) | The server action uses a single database transaction wrapping the unique-email insert; any error rolls back; no session is opened on any error path. | Prisma transaction in the server action. |
| AC-3 (no leak to other channels, no enumeration) | All errors are returned in-app via the form result; no email is sent on failure. `ACCOUNT_EXISTS` uses a single generic message indistinguishable from a soft rejection, with a constant-time response budget. | Anti-enumeration constant-time helper in `lib/auth/anti-enumeration.ts`. |

---

## Data Model

Inherits the canonical schema from sibling Spec [`account-session--signup-to-signed-in-dashboard--US-001--account-created.spec.md`](./account-session--signup-to-signed-in-dashboard--US-001--account-created.spec.md). No new objects, no field changes, no migration.

---

## Contract

### Inputs

Same as sibling Spec US-001: HTTP POST signup server action with `email` + `password` form fields.

### Outputs

- On any error, the server action returns a typed result `{ ok: false, fieldErrors: Record<string, string>, formError?: string }` consumed by `useFormState()`.
- No redirect on error.
- No `Set-Cookie` on error.

### Errors

| Error | When | User-visible message | Recovery |
|-------|------|---------------------|----------|
| `INPUT_INVALID_EMAIL` | Email fails RFC-5322 shape validation | "Enter a valid email address." | Correct email and resubmit. |
| `INPUT_PASSWORD_TOO_SHORT` | Password < 12 chars | "Password must be at least 12 characters." | Enter a longer password and resubmit. |
| `INPUT_MISSING_FIELD` | Email or password missing | "Email and password are both required." | Fill the missing field and resubmit. |
| `ACCOUNT_EXISTS` | Postgres unique-email index raises a violation | "Those signup details cannot be used. If you already have an account, sign in instead." | Either sign in or use a different email. |
| `INTERNAL_ERROR` | Unexpected server failure | "Signup is temporarily unavailable. Please try again." | Retry; no account is created. |

The `ACCOUNT_EXISTS` message intentionally does not confirm that the email already has an account. The same generic message text is also used by a soft anti-enumeration branch when validation is suspicious (e.g. probing patterns) — the user-visible string is identical.

---

## UI Surface

- Screen: `/signup` (public). Error states rendered by `app/(auth)/signup/page.tsx`:
  - Field error: inline message under the failing input, role=alert, `aria-live="polite"`.
  - Form-level error (`ACCOUNT_EXISTS`, `INTERNAL_ERROR`): message above the submit, `role=alert`.

---

## Tests

### Unit / behavior tests

- `result-shape-on-validation-error`: invalid inputs yield `{ ok: false, fieldErrors: { email: ..., password: ... } }`.
- `result-shape-on-account-exists`: simulated Postgres unique violation produces `{ ok: false, formError: <generic message> }`.
- `transaction-rollback-on-error`: when the insert fails, no `User` and no `Session` row remains.

### Integration tests

- `signup-rejects-duplicate-email`: two consecutive signups with the same email — second returns `ACCOUNT_EXISTS`, no second `User` row exists.
- `signup-error-keeps-entry-context`: posting invalid inputs does not navigate away from `/signup`.
- `signup-error-no-cookie-set`: response on any error path has no `Set-Cookie`.

### Acceptance tests against parent ACs

- `AC-1-error-actionable`: browser test that submits invalid inputs, asserts the inline message is the expected string and is announced via aria-live.
- `AC-2-no-partial-state`: after an error, the database has no new `User` row and no `Session` row for the attempted email.
- `AC-3-anti-enumeration-constant-time`: error response time stays within a configured window (e.g. ±50ms) whether the email exists in the database or not.

### Non-functional tests (performance, security, accessibility)

- Security: `no-email-channel-on-error` — no outbound mail is sent on any error path.
- Security: `error-strings-do-not-disclose-internals` — error payload never includes stack traces or DB error text.
- Accessibility: `field-errors-associated-with-inputs` — inline errors are programmatically associated with their input via `aria-describedby`.

---

## Observability

| Signal | Type | Purpose |
|--------|------|---------|
| `auth.signup.failed{reason}` | event with tag | How frequent are validation errors vs ACCOUNT_EXISTS vs INTERNAL_ERROR? Same event type as sibling Spec US-001 (so dashboards share semantics). |
| `auth.signup.account_exists_collision` | event | Detect potential enumeration probing (sudden spike). |
| `auth.signup.error.duration_ms` | metric (histogram) | Verify the anti-enumeration constant-time budget holds in production. |

No PII attached; counts only.

---

## Implementation notes

- **Reuses the server action** from sibling Spec US-001. This Spec adds the error branches; it does not introduce a second action.
- **Anti-enumeration constant-time helper**: `lib/auth/anti-enumeration.ts` exposes `withConstantTimeBudget(targetMs, work)` that ensures the response time stays within a configured window regardless of which branch fires. Implementation uses `await Promise.race([work, sleep(targetMs)])` then waits the remainder; rejections from `work` are surfaced after the budget has elapsed.
- **Database error mapping**: a small `mapPrismaError` utility in `lib/auth/prisma-error.ts` translates Prisma's `P2002` (unique violation on `email`) into `ACCOUNT_EXISTS`. Other Prisma errors map to `INTERNAL_ERROR`.
- **No new environment variables.**
- Stack inherited from PD-002.

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| [Parent User Story](../user-stories/account-session--signup-to-signed-in-dashboard--US-002--signup-error-explained.md) | User Story | ready | `ready-for-spec` as of 2026-05-25. |
| Sibling Spec US-001 (`account-created.spec.md`) | Spec | ready | Defines the canonical schema this Spec inherits. |
| PD-001, PD-002 | Product Decisions | approved / provisional | Same governing decisions as sibling Spec. |

---

## Blockers

| Blocker | Blocks | NEED_HUMAN |
|---------|--------|------------|
| — | — | — |

---

## Out of Scope

- Successful signup — sibling Spec US-001.
- Already-signed-in redirect — sibling Spec US-003.
- Account recovery / password reset / magic-link — not v0 PRD.
- Brute-force lockout policy beyond a generic "throttled retry" mention — not in this Spec (operational tuning).

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

(Subdivision not needed: small additions to the existing signup server action + small helper modules.)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-25 | Scaffolded from approved `/spec propose` (Phase 3 pilot) via `/spec scaffold` | — |
| 2026-05-25 | Refined via `/spec refine` (Phase 3 pilot) | — |
| 2026-05-25 | Promoted to ready-for-implementation after CLEAR readiness check (`/spec promote`) | — |
