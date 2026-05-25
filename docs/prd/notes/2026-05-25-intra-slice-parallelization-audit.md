# Intra-Slice Parallelization Audit — 2026-05-25

Closes Item 7 of the TODO. Direct answer to blocking-subject #1 raised mid-week:

> « La parallélisation [...] mais aussi dans le flow [...] sur 1 Slice qui porte 3 US, peut-on lancer US-001 en dev pendant qu'US-002 est encore en clarif ? »

Pilot Slice analyzed: `account-session--signup-to-signed-in-dashboard` (3 User Stories, 3 Specs).

---

## TL;DR

**Yes, intra-Slice parallelization is possible — but not free.** Two of the three User Stories in the pilot Slice are parallelizable today; one is sequentially gated. The gate is **not** a workflow problem, it is a **shared-code-surface problem** that the current PD-001 chain does not surface.

Concrete verdict on the pilot Slice:

| Pair | Verdict | Why |
|---|---|---|
| US-001 (account-created) vs US-002 (signup-error-explained) | **Partial sequential** | Both contribute to the same server action file `app/(auth)/signup/actions.ts` AND to the same typed-result envelope (the error wrapper shape is defined by US-002). Coding US-001 first means defining a minimum stable envelope so US-002 only widens it. Without that contract, US-001 cannot be "finished" until US-002 lands. |
| US-001 (account-created) vs US-003 (no-duplicate-when-signed-in) | **Full parallel** | US-003 only reads `Session` (defined by US-001's schema). Once US-001's schema migration is applied, US-003 can be coded without touching US-001's server action — it lives in `app/(auth)/signup/page.tsx`'s server component, not in the action file. |
| US-002 (signup-error-explained) vs US-003 (no-duplicate-when-signed-in) | **Full parallel** | Disjoint files. No shared contract. |

So on this Slice : 2 parallel coders feasible (US-001 + US-003), then US-002 lands after US-001's envelope is fixed. **Not** the 3-way parallel that a naïve reading of the workflow suggests.

---

## What forces sequential — generalized pattern

Five dependency kinds were observed on the pilot Slice. Only the first two FORCE sequential work:

| Dependency kind | Effect | Pilot example |
|---|---|---|
| **A. Shared canonical schema** | Hard sequential. The first Spec freezes the schema; siblings inherit. If the freezer changes the schema mid-flight, siblings must redo. | `User` / `Session` schema in SP-001, inherited by SP-002 and SP-003. |
| **B. Shared cross-US contract (error envelope, event shape)** | Hard sequential. If US-A emits something US-B consumes, the wire shape is fixed by one of them — the other waits. | The typed signup result `{ ok: false; fieldErrors; formError? }` defined in SP-002, consumed by SP-001's server action emission. |
| **C. Shared code-surface file** | Soft sequential (Git-coordination cost, not a design block). | `app/(auth)/signup/actions.ts` touched by SP-001 (happy path) and SP-002 (error envelope). |
| **D. Shared helper library** | Parallelizable if the helper's interface is stable. | `lib/auth/anti-enumeration.ts` introduced by SP-002 and never touched by SP-001 / SP-003. |
| **E. Logical independence** | Full parallel. | SP-003's already-signed-in check lives in the page server component, not the action. Zero shared surface with SP-002. |

Rule of thumb: **A** + **B** are the only true sequentializers. **C** is Git-coordination, not workflow.

---

## Cartography of the pilot Slice

```
SS:account-session/signup-to-signed-in-dashboard
│
├── US-001 / SP-001  (account-created)
│      │ Schema:  User, Session, Account*, VerificationToken*    ← freezes canonical schema for FA
│      │ File:    app/(auth)/signup/actions.ts                   ← author of the server action
│      │ Emits:   ACCOUNT_EXISTS (Postgres unique-violation) ───┐
│      │ Owns:    4 errors (INPUT_INVALID_EMAIL, …, INTERNAL_ERROR)
│      │
│      ├── inherits FROM: nothing
│      └── exports TO: SP-002 (the emitted ACCOUNT_EXISTS event), SP-003 (the Session schema)
│
├── US-002 / SP-002  (signup-error-explained)
│      │ Schema:  inherits from SP-001 — no change
│      │ File:    app/(auth)/signup/actions.ts (same as SP-001)   ← MUTATES the action's error envelope
│      │          + app/(auth)/signup/page.tsx (form error rendering)
│      │          + lib/auth/anti-enumeration.ts (NEW)
│      │ Owns:    5 errors (the 4 from SP-001 + ACCOUNT_EXISTS handler), typed-result envelope
│      │
│      ├── inherits FROM: SP-001 (schema + the unique-violation emission)  ◄── HARD SEQUENTIAL on B
│      └── exports TO: nothing downstream within this Slice
│
└── US-003 / SP-003  (no-duplicate-when-signed-in)
       │ Schema:  inherits from SP-001 — no change, read-only Session lookup
       │ File:    app/(auth)/signup/page.tsx server component (NOT the action file)
       │ Owns:    auth()-check before render + 303 redirect
       │
       ├── inherits FROM: SP-001 (Session schema only)  ◄── soft sequential on A
       └── exports TO: nothing
```

Concrete sequencing of the Slice:

```
       T0 ─────────────────────────────────────────────►
       │
       ├── SP-001 in dev  ━━━━━━━━━━━━━━━━┓
       │                                   ▼  schema landed + ACCOUNT_EXISTS contract figé
       │                                   │
       │                                   ├── SP-002 in dev  ━━━━━━━━━━━━━━━━┓
       │                                   │                                   ▼ Slice done
       │                                   └── SP-003 in dev  ━━━━━━━━━━━━━┛   │
       │                                                                       │
       │                                                                       ▼
       │                                                            All 3 US landed
```

SP-002 and SP-003 are concurrent **once** SP-001's schema migration + emitted-error contract are pushed.

---

## Hypothetical test: what if US-002 regressed to `exploratory` now?

Suppose tomorrow we realise US-002's anti-enumeration AC-3 is unclear and we move it back to `exploratory` for re-clarification. What unblocks / blocks?

| Artifact | Can it move forward? | Reason |
|---|---|---|
| SP-001 (code) | **Partially yes** | The DB insert + Argon2 + Session.create + redirect + 4 owned errors are codable. The **5th error path** (ACCOUNT_EXISTS via unique-violation) cannot be "finished" — it must throw a typed error of *some* shape, but the canonical shape is owned by SP-002. Minimum workaround: define a stub envelope `{ ok: false; code: 'ACCOUNT_EXISTS'; message: string }` and let SP-002 widen later. Code lands behind a feature flag if needed. |
| SP-003 (code) | **Fully yes** | Zero shared surface with SP-002. The page-level auth() check + redirect ship independently. |
| Tests across the Slice | **Partially yes** | SP-001 + SP-003 acceptance tests stand alone. The cross-Slice acceptance test "owner sees the right message on duplicate signup" cannot be written until SP-002 is back at `ready-for-spec`. |
| The Slice as a "complete vertical" | **No** | The Slice's success is AC-coverage across the 3 US. Missing US-002 means the user-visible duplicate-signup behavior is undefined. Slice cannot be declared done. |

So even with hard sequential coupling on B (error envelope), **US-001 and US-003 can ship to staging behind a flag** while US-002 is in clarif. The Slice is not done, but **2/3 of its code lives**.

---

## What this means for the workflow

### Findings (with evidence)

1. **PD-001 chain (FA → SS → US → Spec → Task) is structurally sound for parallelization between Slices and between FAs.** Both PD-006 (per-FA delivery-ready gate) and the WORK_QUEUE buckets surface this layer correctly.
2. **The chain has no explicit slot to surface intra-Slice coupling.** A Slice with 3 US can be all "ready-for-spec" / "ready-for-implementation" and the agent has no way to know which two of the three can actually run in parallel.
3. **The coupling is real, not paranoid.** On the pilot Slice, blindly parallelizing the 3 US would produce 3 different shapes of the error envelope (one per Spec, all reasonable, all incompatible) — a classic example of premature divergence.
4. **The coupling is detectable from existing artifacts.** Specs already name: shared file paths (Implementation Notes), shared schema (Data Model "Inherits from sibling Spec"), shared events (Async section §4 produced/consumed). The signal exists; it is not aggregated anywhere.

### What's missing (proposed for follow-up, not done in this Item 7)

1. **Slice-level coupling cartography** as an artifact. Either as a new section in the Scope Slice file ("Intra-Slice dependency map: US-A → US-B on contract X") or as a column in `WORK_QUEUE.md`'s Spec rows ("Schema inherited from / Code-surface shared with / Contract consumed from"). The data is there; surface it.
2. **A new readiness check (User Story or Spec level)** that asks: "Does this artifact share a code surface, schema source, or contract envelope with a sibling that is at a different promotion level? If yes, name the sibling and the contract." Failing this check sets `NEED_HUMAN=true` on the dependent artifact with reason "awaiting sibling X's envelope freeze".
3. **WORK_QUEUE buckets refined**. Today `🟢 READY` lumps SP-001 and SP-002 together. A more honest bucketing would be:
   - `🟢 READY-FOUNDATIONAL` — no upstream sibling dependency (e.g. SP:account-session/signup/001, SP:project-workspace/create/001).
   - `🟡 READY-AFTER-FOUNDATION` — codable after the foundational sibling lands its schema + contracts (e.g. SP:account-session/signup/002 after 001).
   - `🟢 READY-INDEPENDENT` — disjoint surfaces, can ship alongside the foundational one (e.g. SP:account-session/signup/003).

These three follow-ups would close the second half of the parallelization concern. They are **not** scoped into Item 7 — Item 7 is the audit.

---

## Conclusion

**Question answered honestly**: yes, on this Slice **2 US can run in parallel with US-001 in dev and US-002 in clarif** (US-001 + US-003). The 3-way parallel that the workflow superficially permits is **not** real — it would produce three incompatible error envelopes. The coupling lives at the Spec contract layer, not the workflow layer.

**The garde-fou that prevents the problem**: the Spec Critic's "Inconsistent data model with sibling Specs" check (now extended to event contracts via Item 3) already catches divergent envelope shapes. What is **missing** is the upstream signal that tells an agent to invoke this check before starting to code in parallel — that's the follow-up work above.

**Net for the pilot Slice today**: SP-001 is the first to land. SP-002 + SP-003 can be authored in parallel once SP-001's schema and emitted-error contract are merged. Real parallelism on the Slice = 2 concurrent coders past T1, not 3.
