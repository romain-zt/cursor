---
id: PD-007
status: approved
date: 2026-05-25
approved_on: 2026-05-25
related_prd_version: v1
amends: PD-002
---

# PD-007 — Async / Event / Webhook / Cron / Stream baseline

## Status note

Authored 2026-05-25 in response to the async architecture audit (`docs/prd/notes/2026-05-25-async-architecture-audit.md`). Status: **`approved`** as of 2026-05-25.

Approval resolved the 3 arbitrages this PD originally listed as pending:

1. **Redis is admitted to the v0 stack.** PD-002 is hereby amended to authorize Redis as an available infrastructure component. See §10 "PD-002 amendment".
2. **`pg-boss` confirmed** as the v0 background-job runtime. Postgres-backed durability for jobs is the right pick even with Redis available; jobs need transactional co-write semantics with the rest of the schema.
3. **Vercel Cron confirmed** as the v0 cron runner. The deploy target is committed to **Vercel** (or a Vercel-compatible serverless platform that exposes the same Cron primitive).

Specs whose async classification depended on PD-007 ratification can now drop their `NEED_HUMAN=true` flag (with one exception: `question-history/consult/001`, which keeps `NEED_HUMAN=true` for a different reason — its producer-side contract still depends on `FA:guided-clarification` unblocking).

This PD is the architectural pair to PD-001 (post-slice methodology) — PD-001 defined the artifacts, PD-007 defines the async primitives those artifacts may reference.

## Context

The async architecture audit identified five critical zones missing from the current Spec corpus (LLM streaming, Stripe webhook, credit event consumer, mailer queue, cleanup cron) and a systemic bias toward sync REST across all 16 existing Specs. The audit's meta-conclusion was clear: the pipeline did not force the question.

The corrective infrastructure now in place:

- **SP-15** in `.cursor/checkers/scope-readiness-checker.md` forces every Spec to classify its async surface in six sub-questions plus a one-line classification.
- The Spec template carries a mandatory `## Async / Event / Webhook / Cron / Stream` section.
- The Spec Critic now stress-tests default-to-sync REST as a hard block (section 4 / Hard Rules).

PD-007 closes that pipeline by **naming the v0 patterns** so Specs answering SP-15 do not invent five different queues, three different cron runners, or two different event bus shapes. PD-002 (stack baseline) intentionally left async out of scope; this PD closes that gap and amends PD-002.

## Decision

### 1. Streaming (server → client)

- **Pattern: SSE (Server-Sent Events)** via Next.js route handlers returning a native `ReadableStream`.
- **Cancel**: required, via `AbortController` on the request.
- **Reconnect**: client retries on connection close. No server-side resume token v0.
- **Heartbeat**: 15-second comment line to defeat proxy idle timeouts.
- **Use cases v0**: LLM token streaming for guided clarification, PRD generation, dynamic form questioning.
- **WebSocket**: deferred. SSE covers v0 needs (server → client only; client → server uses normal HTTP POST). Reconsider when an actual collaborative-editing or bidirectional use case appears.

### 2. Webhook (third party → Zedos)

- **Pattern**: `POST /api/webhooks/<source>` route handler.
- **Signature verification**: provider-specific (`stripe-signature` header for Stripe, equivalent for mailer providers) using the provider SDK's verification helper. Never roll custom HMAC verification.
- **Idempotency**: `WebhookEvent` table with `(provider, eventId)` unique constraint. Insert-or-skip pattern; duplicate inserts return 200 OK without re-processing.
- **Replay**: supported by construction (idempotency).
- **Retry**: rely on provider retry policy (Stripe retries up to 3 days). No internal incoming-webhook retry queue v0.
- **Timeout posture**: webhook handlers must return 200 within 5 seconds. Heavier work is deferred to a background job (section 3) emitted from the handler.
- **Sources v0**: Stripe (activated when `payments` FA unblocks).
- **Sources v1+**: mailer (delivery / bounce / spam_report), OAuth identity provider (token rotation).

### 3. Background jobs (Zedos-internal async work)

- **Runtime v0**: **`pg-boss`** — Postgres-backed durable job queue.
- **Rationale**: jobs need transactional co-write semantics with the application schema (enqueue must commit atomically with the state change that triggered it). Postgres queue gives this for free; Redis-based queues (BullMQ) require a separate consistency story. Redis is admitted to the stack (§10) but for different concerns: cache, rate-limiting, optional session adapter, ephemeral pub-sub. **Durable jobs stay on Postgres.**
- **Job contract**: every job declares an idempotency key (hash of the inputs that determine the outcome). Re-enqueue with the same key is a no-op.
- **Retry policy**: max 3 attempts, exponential backoff (5s, 30s, 5min). After max attempts, the job lands in a dead-letter state and emits a `job.<name>.dead-letter` observability signal.
- **Use cases v0**: deferred email send (welcome, password reset if added), retry-driven side effects from webhook handlers, cleanup tasks too heavy for cron.
- **Worker process**: same Node.js process as the web app in v0 (no separate worker host). Spawned via `pg-boss` background mode on application boot. Splits to a dedicated worker process when concurrent jobs exceed ~10/second sustained.

### 4. Cron / scheduled tasks

- **Runtime v0**: **Vercel Cron**. This commits the deploy target to Vercel; see §10 "PD-002 amendment" for the stack-baseline implication.
- **Minimum interval**: 1 minute (Vercel Cron limitation). Sub-minute scheduling forces an alternative; no v0 use case currently needs it.
- **Idempotency**: every cron run must be safe to repeat (e.g. `DELETE WHERE expiresAt < now()` is naturally idempotent).
- **Observability**: every cron emits `cron.<name>.run`, `cron.<name>.duration_ms`, and `cron.<name>.failed` signals.
- **Cron list v0**:
  - `cleanup.sessions.expired` — hourly. Delete `Session` rows where `expiresAt < now()`.
  - `cleanup.share-links.revoked` — daily. Delete `ShareLink` rows in status `REVOKED` older than 30 days.
  - `cleanup.webhook-events` — weekly. Delete `WebhookEvent` rows older than 30 days.
  - `cleanup.milestone-events.consumed` — weekly. Delete `OwnerMilestoneEvent` rows where `consumedAt IS NOT NULL` older than 90 days.

### 5. Event bus (intra-Zedos async coupling)

- **Runtime v0**: **Postgres `Event` table + `LISTEN/NOTIFY`** for low-latency in-process consumers, with **polling fallback** on the `Event` table for cross-process and missed-notification cases.
- **Pattern**:
  1. Producer writes an `Event` row **in the same DB transaction** as the state change. This makes the event atomic with the state mutation.
  2. After commit, producer optionally issues `NOTIFY <channel>` for low-latency in-process listeners.
  3. Consumers prefer `LISTEN` for liveness; fall back to polling the `Event` table on a short interval (e.g. 5s) when the listener is not connected or when at-least-once durability is needed.
- **Rationale**: at-least-once delivery, atomic with state mutations, zero additional infrastructure for durability. Redis pub/sub is intentionally NOT chosen here despite being available (§10), because it is fire-and-forget and breaks the atomicity guarantee. Redis may be used as a low-latency notification channel as an optimization layered on top of `LISTEN/NOTIFY`, but never as the durable source of truth.
- **Use cases v0**:
  - `OwnerMilestoneEvent` — already exists in the `owner-milestone-feedback` Spec; re-tag as an event-bus row, drop the polling-on-render pattern in favor of `LISTEN/NOTIFY` + Event table polling fallback.
  - `DecisionEntry` — when `guided-clarification` produces a decision, downstream `question-history` consumes for ordered display.
  - `ai.operation.completed` — when an AI operation finishes, the `credit-system` consumer debits the ledger per PD-003 burn tiers.
- **Naming convention**: `<domain>.<entity>.<verb>`, lowercase, dot-separated (e.g. `prd.version.captured`, `share.link.minted`, `ai.operation.completed`).
- **Delivery contract**: at-least-once. Consumers must be idempotent (typically via the event's natural id).

### 6. Default-sync exemption rule

A Spec may classify as `Pure sync — REST` only when **none** of Spec Critic section 4a..4f applies. Default-sync is always a CHOICE with a stated reason in the Spec's async section.

The acceptable rationale is one of:

- (a) Operation is constant-time bounded and `<` 2s wall time with no external HTTP.
- (b) No cross-Spec event contract is touched.
- (c) Explicit "out of scope for v0" with a forward note naming the future Spec that will handle async.
- (d) The Spec is read-only and stateless.

A sync POST that does I/O (DB write + external HTTP) is **always** suspect — Spec Critic section 4 will fire.

### 7. Reversibility matrix

| Choice | Reversibility cost | Trigger to reconsider |
|---|---|---|
| SSE for streaming | Low — swap to WebSocket library (e.g. `partykit`) per affected Spec. | Bidirectional or fan-out use case appears. |
| Webhook pattern (section 2) | Low — pattern is vendor-neutral. | — |
| `pg-boss` for jobs | Medium — swap to BullMQ uses the Redis already in the stack but requires worker-process splitting + Spec updates on every job-using Spec. | Sustained throughput > ~10 jobs/sec or job latency budget < ~1s. |
| Vercel Cron | Medium — moving off Vercel forces the deploy-target decision to re-open. Swap to `node-cron` worker only changes the runner code, but the deploy story changes. | Deploy target moves off Vercel. |
| Postgres LISTEN/NOTIFY for events | Medium — swap to Redis pub/sub (now available) requires accepting fire-and-forget semantics or layering durability on top. Cross-process delivery latency budget < 100ms is the trigger. | Cross-process delivery latency budget < 100ms or event volume > ~100/sec. |
| Default-sync exemption rule (section 6) | Low — pure governance. | — |
| Redis admission (§10) | Low — adding caches / rate-limits / session adapter is incremental. Removing Redis later means rewriting any caller that depends on it. | — |

### 8. Out of scope for PD-007

- Multi-region async coordination.
- Saga / distributed transaction frameworks.
- Stream processing infrastructure (Kafka, Pulsar, etc.).
- Mobile / browser push notification infrastructure.
- Long-poll fallback for SSE-incompatible clients (no v0 use case).

### 9. How Specs reference PD-007

Every Spec whose async classification is anything other than `Pure sync — REST` must:

- Reference the specific PD-007 section that names the pattern (e.g. "Pattern per PD-007 §3 (background jobs)").
- Name the concrete runtime element (queue name, cron name, event type, SSE route).
- Re-state idempotency / cancel / retry contract specifics for that Spec (PD-007 names the defaults; the Spec may tighten, never weaken).

The Spec Critic checks this alignment in section 4 / section 7 (sibling consistency on named events).

### 10. PD-002 amendment — Redis admitted + Vercel deploy target

This PD amends PD-002 in two ways:

**10.a. Redis added to the v0 stack** — for non-durable concerns. Authorized uses v0:

- **Cache**: read-through cache for hot Postgres reads (rate-limited reads, computed PRD aggregations, etc.).
- **Rate-limiting**: token-bucket counters keyed on user / IP / endpoint.
- **Session adapter (optional)**: Auth.js may switch from Prisma-backed sessions to Redis-backed if observed session-table contention becomes an issue. PD-002 default (Prisma sessions) stays unless triggered.
- **Ephemeral pub-sub layer (optional)**: low-latency notification channel layered on top of Postgres `LISTEN/NOTIFY` (never as the durable source).

Authorized uses v1+:

- Job queue runtime (BullMQ) **if and only if** the `pg-boss` envelope is exceeded (see §7 reversibility trigger).

NOT authorized v0:

- Redis as durable source of truth for any business entity.
- Redis as the event bus (atomicity with state mutation is mandatory; only Postgres can give it).
- Redis as the job-queue runtime (durability and transactional co-write win over latency for v0).

**10.b. Deploy target = Vercel** — section 4 commits the v0 cron runner to Vercel Cron. This commits PD-002 to Vercel (or a Vercel-compatible serverless platform) as the v0 deploy target. Reverting this opens the cron-runner decision (swap to `node-cron` worker, which then requires a long-running worker host elsewhere).

## Consequences / tradeoffs

### Benefits

- Every Spec reaching SP-15 now has a canonical answer set to draw from.
- v0 infrastructure surface = PD-002 baseline + Postgres + Redis + Vercel (cron + deploy).
- All five blind-spot zones from the audit (Z1..Z5) have a named v0 pattern.
- Reversibility costs are explicit; infrastructure upgrades are triggered by observed evidence, not speculation.
- Spec Critic section 4 can now block default-sync with a concrete forward-pointer to the right pattern.
- Redis admission unblocks ergonomic concerns (cache, rate-limit) without compromising durability primitives.

### Costs

- **Two stores instead of one**: Postgres + Redis. Operational surface doubles. Acceptable because Redis is single-purpose (ephemeral) and Postgres remains the source of truth for everything durable.
- **Vercel coupling**: section 4 commits to Vercel. Moving off Vercel later means re-opening the cron-runner story (and probably the serverless-vs-long-running-worker story for jobs too).
- **`pg-boss` ceiling**: reliable to roughly hundreds of jobs per hour. v0 load fits comfortably; upgrade to BullMQ (Redis already in stack) requires rewriting affected Specs + splitting worker process.
- **`LISTEN/NOTIFY` ceiling**: low-latency in-process only. Cross-process consumers degrade to polling at 5s intervals. If a Spec ever needs cross-process event delivery under 100ms, layered Redis pub/sub on top of Postgres becomes the upgrade path.
- **No central async observability dashboard**: Spec Critic section 5 forces per-Spec signals, but no aggregated `async health` view exists in v0. Acceptable while the Spec corpus is small.

### Reversibility

This PD is reversible by user approval of a follow-up PD that supersedes it. Specs grounded in PD-007 inherit the choice; swapping any of these primitives later means rewriting affected Specs and, for the Vercel commitment, amending PD-002 again.

## Links

- PRD: `docs/prd/PRD.md`
- Methodology: `docs/product-decisions/PD-001-post-slice-workflow.md`
- Stack baseline (amended by §10): `docs/product-decisions/PD-002-pilot-stack-baseline.md`
- Auto-reload SCA: `docs/product-decisions/PD-005-auto-reload-sca-fallback.md`
- Per-FA gate: `docs/product-decisions/PD-006-per-fa-delivery-readiness-gate.md`
- Driving audit: `docs/prd/notes/2026-05-25-async-architecture-audit.md`
- Re-promote pass: `docs/prd/notes/2026-05-25-async-repromote-pass.md`
- Affected template: `.cursor/templates/product/spec.template.md` (Async section)
- Affected checker: `.cursor/checkers/scope-readiness-checker.md` (SP-15)
- Affected agent: `.cursor/agents/spec/spec-critic.md` (section 4)
- Affected rule: `.cursor/rules/user-story-workflow.mdc` (Spec async mandatory)
