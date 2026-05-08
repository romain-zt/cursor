# SPEC_QUEUE

> The single source of execution priority.
> The backlog is mobile. The lock is stable.
> A spec moves to EXECUTION_LOCK only after passing all checkers.

---

## Queue rules

- Max specs in NOW: 3
- Max specs in EXECUTION_LOCK simultaneously: 3
- A spec in BLOCKED must say explicitly what it is blocked by
- A spec is DONE only when: tests pass, docs updated, CURRENT_STATE updated
- Never start implementation unless the spec is in EXECUTION_LOCK
- NOW means lockable. Not executable. A spec moves from NOW → EXECUTION_LOCK only after all checkers pass.

## READY conditions

A spec can enter NOW only if ALL of the following are true:

```
- PRD link exists
- Risk level defined
- Acceptance criteria are testable
- Dependencies checked (no unknown blockers)
- SISO accepted (not REJECTED or NEEDS_HUMAN)
- Scope is bounded (out-of-scope section is not empty)
```

---

## NOW

> Ready to start. Checkers passed. Lockable immediately.

_Empty — system just bootstrapped. First project must be onboarded._

---

## NEXT

> Refined enough to be queued. Will move to NOW when current specs clear.

_Empty — waiting for first project onboarding._

---

## BACKLOG

> Ideas and future work. Not yet refined. Not a priority.

### SPEC-ZC-001 — Shopify shop connection (OAuth + identity)

```
SPEC-ID:             SPEC-ZC-001
Title:               Shopify app install — OAuth, session token strategy, shop record
User value:          Merchant can install ZedCheckout on a dev shop with a stable shop identity for downstream sync.
Linked PRD goal:     PRD-ZCHECKOUT § Install & connect
Status:              BACKLOG
Risk level:          HIGH (OAuth, external API, multi-tenant identity)
Scope:               Minimal install surface; persist shop + tokens; secure rotation hooks documented; no booking logic yet.
Out of scope:        Billing (unless forced by Shopify), production GDPR DPA, full webhook mesh
Acceptance criteria:
  - Documented OAuth flow matches Shopify Partner requirements for embedded or standalone app (explicit choice in arch review)
  - Shop row exists after install; uninstall path defined
  - Secrets never logged; storage approach documented
Dependencies:
  Depends on:        Architecture review (embedded vs standalone, API version)
  Blocks:            SPEC-ZC-002 (needs shop context)
  Blocked by:        —
  Can start now:     partial (scaffold only until auth strategy locked)
Partial allowed:     yes
  Allowed scope:     Repo scaffold, env templates, non-production Shopify client
  Forbidden scope:   Production token handling without security review
NEED_HUMAN:          no (until Shopify app type choice stalls)
Test expectation:    Manual install on dev store + automated token exchange mocks where possible
Definition of done:  SPEC complete doc + working dev install path + CURRENT_STATE updated
```

### SPEC-ZC-002 — Booking engine core (authoritative availability)

```
SPEC-ID:             SPEC-ZC-002
Title:               Booking engine — resources, slots, holds, commit API
User value:          System returns only real availability; concurrent holds prevent double-book.
Linked PRD goal:     PRD-ZCHECKOUT § Configure bookable offers / Commit booking
Status:              BACKLOG
Risk level:          HIGH (correctness, concurrency, data integrity)
Scope:               CRUD-lite for bookable resource; hold TTL; idempotent commit; in-memory or single-DB MVP behind interface.
Out of scope:        Full recurrence rules, multi-location optimization, payments
Acceptance criteria:
  - Two concurrent clients cannot commit same slot (test demonstrated)
  - Hold expiry returns capacity
  - Engine exposes stable API for channel layer (no WhatsApp-specific types leaked inward)
Dependencies:
  Depends on:        SPEC-ZC-001 for realistic Shopify IDs (can mock initially)
  Blocks:            SPEC-ZC-003 (conversation needs engine)
  Blocked by:        —
  Can start now:     yes (parallel track with mocked shop if boundaries respected)
Partial allowed:     yes — single resource type, fixed duration
NEED_HUMAN:          no
Test expectation:    Concurrency + clock tests required
Definition of done:   Tests green + API doc + CURRENT_STATE updated
```

### SPEC-ZC-003 — WhatsApp channel adapter + AI orchestration boundary

```
SPEC-ID:             SPEC-ZC-003
Title:               WhatsApp inbound/outbound + structured AI → engine calls
User value:          Customer completes flow in WhatsApp; AI never bypasses booking engine.
Linked PRD goal:     PRD-ZCHECKOUT § Customer conversation / Commit booking
Status:              BACKLOG
Risk level:          HIGH (external messaging API, AI safety)
Scope:               Webhook receiver; send messages; map intents to engine queries; strict validation of proposals.
Out of scope:        Full multilingual tuning, marketing broadcasts, voice
Acceptance criteria:
  - Happy path: propose slots → confirm → engine commit reflected in reply
  - AI output rejected if not matching engine schema
  - Template/message policy documented for pilot
Dependencies:
  Depends on:        SPEC-ZC-002 (minimum engine API)
  Blocks:            —
  Blocked by:        Meta developer setup / WABA (environment)
  Can start now:     partial (sandbox/mock webhook until creds)
Partial allowed:     yes — scripted flows before LLM
NEED_HUMAN:          maybe — Business Manager access
Test expectation:    Contract tests on adapter + golden transcript fixtures
Definition of done:   Pilot-ready channel doc + tests + CURRENT_STATE updated
```

---

## BLOCKED

> Cannot start. Explicit blocker declared.

_Empty._

---

## DONE

- SPEC-000: Cursor AIflow V0 bootstrap | Setup complete, system operational

---

## Spec template

Use this when adding a new spec:

```
SPEC-ID:
Title:
User value:
Linked PRD goal:
Status:
Risk level:          LOW / MEDIUM / HIGH
Scope:
Out of scope:
Acceptance criteria:
  -
Dependencies:
  Depends on:
  Blocks:
  Blocked by:
  Can start now:     yes / no / partial
Partial allowed:     yes / no
  Allowed scope:
  Forbidden scope:
  Debt created:
  Must close before:
  Production allowed:
NEED_HUMAN:          yes / no
  Decision needed:
Test expectation:
Definition of done:
```
