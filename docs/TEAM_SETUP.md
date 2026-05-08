# TEAM_SETUP — ZedCheckout

> Generated during onboarding from `docs/PRD-ZCHECKOUT.md` risk profile.

---

## Project risk profile

- Domain complexity: **Medium–High** — scheduling rules, holds, policies, eventual multi-resource.
- Technical complexity: **High** — distinct channel (WhatsApp), commerce backbone (Shopify), AI boundary.
- External integrations: **High** — Shopify Admin APIs + OAuth; WhatsApp Cloud API / BSP patterns.
- Data criticality: **High** — double-book and payment-adjacent flows are reputation/legal risk.
- UX complexity: **Medium** — conversational UX + merchant onboarding + minimal operator surfaces.
- Compliance/security sensitivity: **High** — tokens, PII in messaging, regional commerce rules.
- Delivery urgency: **Medium** — pilot-first; correctness before breadth.

---

## Required capabilities

| Capability | Why needed | Current support | Gap | Action |
|------------|-----------|-----------------|-----|--------|
| Shopify app + OAuth | Shop identity, scopes, webhooks | Review lenses only | No app codebase yet | SPEC-ZC-001 → lock → impl |
| Booking correctness | No hallucinated inventory | — | Engine not built | SPEC-ZC-002 |
| WhatsApp messaging | Primary channel | — | Env + adapter | SPEC-ZC-003 |
| AI guardrails | Misrepresentation risk | — | Structured outputs policy | Define in SPEC-ZC-003 arch |
| Merchant-facing UI (minimal) | Install/configure | — | TBD scope post-connect | Defer until SPEC-ZC-001 done |

---

## Enabled checkers (always active)

- SISO Checker
- Scope Checker
- Reuse Checker
- Dependency Checker
- Docs Checker
- Risk Classifier
- Complexity Budget Checker

---

## Review lenses (invoked on demand, not agents)

- Product lens — PRD-ZCHECKOUT scope vs specs
- Architecture lens — Shopify app shape, engine boundaries, webhook strategy
- UX lens — conversational flows, merchant onboarding copy (later)
- QA lens — concurrency, idempotency, adapter contracts

---

## Enabled agents

None by default.

---

## Candidate agents

| Agent | Trigger condition | Why not active yet | Removal condition |
|-------|-------------------|---------------------|-------------------|
| Shopify CI runner | Repeated GraphQL validation pain | No codebase | Skill or script suffices |
| Support triage | Production pilot volume | Not live | — |

---

## Enabled skills

| Skill | Used for | Trigger condition | Removal condition |
|-------|----------|-------------------|-------------------|
| Shopify skills (workspace) | Admin API patterns, CLI execution | Any Shopify implementation task | N/A |

---

## Rules added for this project

| Rule | Problem addressed | Evidence | Removal condition |
|------|-------------------|----------|-------------------|
| _(none yet)_ | — | — | — |
