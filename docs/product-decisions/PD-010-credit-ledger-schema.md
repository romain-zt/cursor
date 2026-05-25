---
id: PD-010
status: approved
date: 2026-05-25
approved_on: 2026-05-25
related_prd_version: v1
unblocks: B-003 (FA:credit-system)
---

# PD-010 — Credit ledger schema (Snapshot + Journal, no-expire, full-refund)

## Status note

Approved 2026-05-25 in direct response to Q12 of the H-3 / H-4 review batch. Three sub-decisions:

1. **Storage pattern**: Snapshot + Journal (option b) — separate `CreditBalance` (current state) and `CreditLedgerEntry` (append-only audit journal).
2. **Expiration**: **none** (credits never expire). Option (a) of the sub-question.
3. **Refunds**: **full refund only**, materialized as a negative `CreditLedgerEntry`. Option (a) of the sub-question. No partial refund v0.

This PD **unblocks B-003** (FA:credit-system ledger schema undecided) and cascade-unblocks `FA:payments` (DR-04). The FA can now scaffold slices and Specs.

## Context

PD-003 (burn tiers), PD-004 (grace ceiling), PD-005 (auto-reload SCA) frame the **product rules** of the credit economy but not the **persistence shape**. Without a ledger schema:

- `FA:credit-system` cannot produce Scope Slices (no concrete data model).
- `FA:payments` cannot finalize its webhook contract (Stripe webhook → ledger row creation, but ledger row shape is undefined).
- The Z3 zone (credit event consumer, see WORK_QUEUE) has no producer-side shape to consume from.
- `FA:guided-clarification` (whenever B-002 unblocks) needs to know what to debit and how.

The Q12 decision frames the persistence as **two coupled stores**: a fast-read snapshot for runtime decisions (grace check, generation block) and an append-only journal for audit and reconstruction.

## Decision

### 1. Two-table model

#### 1.a. `CreditLedgerEntry` — append-only journal

```prisma
model CreditLedgerEntry {
  id            String              @id @default(cuid())
  userId        String
  delta         Int                 // positive = credit grant, negative = burn or refund
  kind          CreditEntryKind     // see enum below
  reason        String              // free-text human-readable reason
  referenceId   String?             // optional FK to source: AiOperation, StripePayment, ManualAdjustment, etc.
  referenceKind String?             // discriminator for the polymorphic referenceId

  // Audit metadata
  createdAt     DateTime            @default(now())
  createdBy     String?             // userId of actor when admin-initiated; null when system/owner
  balanceAfter  Int                 // snapshot of balance AFTER this entry, for fast audit + tamper detection

  user          User                @relation(fields: [userId], references: [id])

  @@index([userId, createdAt])      // for owner-side history reads (PRD: question-history-style audits)
  @@index([referenceKind, referenceId])  // for "find the entry that recorded this Stripe payment"
}

enum CreditEntryKind {
  // Positive deltas
  PURCHASE          // Stripe one-time payment (manual or auto-reload)
  PROMO_GRANT       // operator-initiated grant (e.g. onboarding bonus, support credit)
  REFUND_REVERSAL   // reverses a PURCHASE_REFUND; restores credits
  ADJUSTMENT_PLUS   // manual admin adjustment, positive

  // Negative deltas
  AI_BURN           // standard AI operation burn (see PD-003 tier table)
  GRACE_BURN        // burn that consumed first-circuit grace (PD-004)
  PURCHASE_REFUND   // full refund of a prior PURCHASE entry
  ADJUSTMENT_MINUS  // manual admin adjustment, negative
}
```

**Append-only invariant.** No `UPDATE` and no `DELETE` on `CreditLedgerEntry` in v0. Corrections happen via new entries (`ADJUSTMENT_PLUS` / `ADJUSTMENT_MINUS` / `REFUND_REVERSAL`). Application code enforces this; a PG row-level policy or trigger may enforce it in v1+.

#### 1.b. `CreditBalance` — fast-read snapshot

```prisma
model CreditBalance {
  userId            String   @id
  balance           Int      @default(0)         // current credits available
  lifetimePurchased Int      @default(0)         // sum of all PURCHASE entries — used by grace eligibility
  graceConsumed     Boolean  @default(false)     // true once any GRACE_BURN entry exists for this user
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id])
}
```

**One row per user.** Created on user signup (referential trigger or application logic in account-session signup flow). `balance` reflects the **net sum** of all `CreditLedgerEntry.delta` for this user. Mathematical invariant:

```
CreditBalance.balance == SUM(CreditLedgerEntry.delta WHERE userId = ?)
```

This invariant is checkable; a periodic cron (PD-007 §4 candidate, deferred) compares the two and emits `credit.ledger.drift.detected` if they diverge. Drift = bug; halts further writes for the affected user pending investigation.

### 2. Write path — every mutation goes through a single helper

A single application-level helper (`writeCreditLedger`) is the **only** allowed write path. Signature:

```typescript
async function writeCreditLedger(args: {
  userId: string;
  delta: number;                    // positive or negative, never zero
  kind: CreditEntryKind;
  reason: string;
  referenceId?: string;
  referenceKind?: string;
  createdBy?: string;
}): Promise<{ entry: CreditLedgerEntry; balanceAfter: number }>;
```

Implementation invariants (mandatory in the helper):

- **Transactional co-write**: insert `CreditLedgerEntry` AND update `CreditBalance` in the same Prisma transaction. Either both land or neither does.
- **Optimistic concurrency**: use a row-level lock on `CreditBalance` (e.g. `SELECT ... FOR UPDATE`) during the transaction to serialize concurrent writes for the same user.
- **Compute `balanceAfter`** inside the transaction: read current balance, apply delta, write entry with `balanceAfter` = computed value, update `CreditBalance.balance` to the same value.
- **Reject `delta === 0`**: zero-entries are noise; refuse with a typed error.
- **Reject when balance would dip below `-graceCap` AND grace already consumed**: hard guard for PD-004 enforcement. Caller catches the typed error.

Direct `prisma.creditLedgerEntry.create(...)` or `prisma.creditBalance.update(...)` calls in business code are **forbidden** by convention (and enforced by code-review at PD-008 gate clearance).

### 3. Expiration policy — credits never expire

Selected per Q12 sub-question = (a). Decision rationale:

- **Founder UX**: solo founders use Zedos sporadically; expiration creates "found money / lost money" feeling. Net negative for trust.
- **Operations**: expiration logic adds a cron (PD-007 §4) + a notification stream + edge cases (what about credits granted as PROMO_GRANT — same expiration? different?).
- **Audit**: expiration creates entries (`EXPIRATION_BURN`) that are not actions the founder took — confusing in any history view.

**No `EXPIRATION_BURN` kind in v0.** If expiration is ever re-introduced, it becomes a new `CreditEntryKind` in a follow-up PD; the schema doesn't need to change.

Reversibility: trivially reversible. Adding expiration later = adding a cron + a new enum value. No data migration of existing entries.

### 4. Refund policy — full refund only, via negative entry

Selected per Q12 sub-question = (a). Decision rationale:

- **Simplicity**: partial refunds open a debate on "is this PURCHASE entry now half-consumed?" — no.
- **Audit clarity**: a `PURCHASE` followed by a `PURCHASE_REFUND` with `delta = -original.delta` is the simplest possible audit trail.
- **Stripe alignment**: Stripe's refund API supports partial but v0 customer support flow assumes full refund per dispute.

**Refund flow:**

1. Customer support (or Stripe webhook for chargeback) triggers a refund.
2. The refund creates a `PURCHASE_REFUND` entry: `delta = -original_purchase.delta`, `referenceId = original_purchase.id`, `referenceKind = "CreditLedgerEntry"`.
3. `CreditBalance.balance` is decremented by `original_purchase.delta`. **If this makes the balance negative**, the balance goes negative — no compensating burn-reversal. The founder is now in debt to Zedos for the credits they spent against a since-refunded purchase. PD-004 grace logic does NOT apply (grace is first-circuit-only).
4. The founder's next attempt to use a paid AI operation is **blocked at zero balance** (per PD-005). The negative balance forces them to recharge or close the account.
5. If the original purchase was inadvertently refunded (admin error), the `REFUND_REVERSAL` entry restores the credits.

**No partial-refund support v0.** A future PD can introduce `PARTIAL_REFUND` as a new kind + a `refundAmount` field; not in scope here.

**No `chargeback` kind**: chargebacks ARE refunds (same money flow) and use `PURCHASE_REFUND`. The `reason` field carries the human-readable distinction.

### 5. Read paths

The two-table model serves two distinct read patterns:

#### 5.a. Runtime decisions (hot path)

- **"Can the founder run this AI operation?"** Read `CreditBalance` only. Single-row index hit. Latency target: < 5ms p95.
- **"Show the founder their current balance."** Same single-row read.
- **"Is the founder eligible for grace?"** Read `CreditBalance.graceConsumed` flag. Same read.

`CreditLedgerEntry` is **not touched** on the runtime hot path. The snapshot is the authority for "can I proceed."

#### 5.b. Audit / history (cold path)

- **"Show me my credit history."** Read `CreditLedgerEntry` filtered by `userId`, ordered by `createdAt DESC`, paginated. Indexed.
- **"Reconcile this Stripe payment to a ledger entry."** Read `CreditLedgerEntry` filtered by `referenceKind = "StripePayment"` and `referenceId = <stripe-id>`. Indexed.
- **"Reconstruct the balance at a point in time."** SUM `delta` WHERE `userId = ? AND createdAt <= ?`. Acceptable for offline reports; not optimized.

History reads do not touch the snapshot. This isolation is the point of the two-table model.

### 6. Drift detection

A nightly cron (PD-007 §4, candidate cron — to be added in v0 cron list):

- For each user, compute `SUM(CreditLedgerEntry.delta WHERE userId = ?)`.
- Compare against `CreditBalance.balance`.
- If they diverge, write a `credit.ledger.drift.detected` event (PD-007 §5 event-bus), pause further writes for the user (a `paused` flag on `CreditBalance` — see §7), and notify operations.

This catches bugs in `writeCreditLedger`, race conditions that escaped the row-level lock, or manual DB writes (forbidden by convention but possible in incident response).

### 7. Operational guards

- **`CreditBalance.paused: Boolean`** (default `false`) — set by drift detection or manual operator intervention. While `paused = true`, `writeCreditLedger` refuses with a typed error. AI operations referring this user are blocked at the application gate, not at the ledger.
- **No silent re-create**: deleting a user's `CreditBalance` row is forbidden in v0. User deletion (RGPD) requires zeroing balance + anonymizing journal entries (`userId → tombstone`), not deleting rows.
- **No cross-user transfer v0**: credits are bound to a single user. Transfer would require a `TRANSFER_OUT` / `TRANSFER_IN` entry pair; out of scope.

### 8. Migration / seeding

New repo — no existing data to migrate. The schema lands in the initial Prisma migration alongside `User` (PD-002). No seed data required: balances default to 0, no entries exist until the founder first interacts with the credit system.

### 9. Out of scope for PD-010

- Pricing of credit packs (PD-003 burn tiers; pack pricing handled by `FA:payments`).
- Stripe integration mechanics (PD-007 §2 webhook, `FA:payments` Specs).
- Grace ceiling values (PD-004).
- Auto-reload trigger thresholds (PD-005 + `FA:payments`).
- Reporting / analytics queries on the ledger (cold-path beyond simple history reads; out of scope v0).
- Multi-currency or non-credit billing units.

## Consequences / tradeoffs

### Benefits

- **Two-table separation** = hot-path read on a single indexed row + cold-path audit on an append-only journal. Each serves its purpose.
- **Append-only journal** = full audit by construction. Customer support, dispute resolution, and regulatory inquiries (RGPD-style "what did you do with my money") have a single source.
- **No expiration** = simpler product narrative, fewer edge cases, no cron, no notification flow.
- **Full-refund-only** = simplest possible refund semantics, aligned with v0 customer support workflow.
- **Single write path** = invariants checkable in one helper, not scattered across call sites.
- **Drift detection** = bugs visible operationally; no silent data corruption.

### Costs

- **Two tables instead of one** = small write overhead (~2 row writes per credit mutation). Acceptable for v0 scale.
- **Snapshot can diverge from journal** if `writeCreditLedger` has bugs. Mitigated by drift cron + `paused` flag.
- **Negative balances are possible** (after refund of consumed credits). Application must handle the "founder owes us credits they already spent" UX; PD-010 frames it as "block until recharge or close account" but the actual UX message is a `FA:credit-system` Spec concern.
- **No partial refund** may force ops to refund-and-re-grant for partial cases. Acceptable v0; revisit if frequency justifies.
- **No expiration** means lifetime liability accumulates on the books (accounting concern). For v0 with bounded customer base, acceptable.

### Reversibility

- Two-table → one-table = reversible by computing snapshot on every read; cost = latency. Recoverable.
- Add expiration = additive (new enum value + cron). No data migration.
- Add partial refund = additive (new kind + amount field). No migration.
- Drop journal = catastrophic; would lose audit. **Not reversible without data loss.**

## Links

- PRD: `docs/prd/PRD.md`
- Related PDs: PD-003 (burn tiers), PD-004 (grace ceiling), PD-005 (auto-reload SCA), PD-007 (webhook + event bus + cron patterns).
- Unblocks: `B-003` (FA:credit-system ledger schema), and cascades to `FA:payments` (DR-04).
- Affected FA: `docs/product/feature-areas/credit-system.md` (must now scaffold slices).
- Affected FA cascade: `docs/product/feature-areas/payments.md` (DR-04 unblocks once `FA:credit-system` produces slices).
- Affected Spec template section: `## Data Touched` of any Spec writing to credits.
- Stack baseline: PD-002 (Prisma + Postgres).
