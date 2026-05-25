---
id: PD-002
status: approved
date: 2026-05-25
related_prd_version: v1
---

# PD-002 — Stack Baseline for Zedos v0

## Status note

This decision was first authored as `provisional` by the Phase 3 pilot of plan `Zedos verticale + post-slice` and **approved by the user on 2026-05-25** for use across all Feature Areas in Phase 4 and beyond. Treat the choices below as committed architecture for Zedos v0.

Any future change to this baseline must come through a follow-up Product Decision that supersedes PD-002 explicitly. Specs already grounded in this baseline (the six `account-session` Specs as of 2026-05-25) inherit the approval.

## Context

The post-slice methodology defined in PD-001 specifies that the Spec is the first artifact in the chain where stack, schema, framework, routes, and runtime decisions may appear. The Spec readiness checker (SP-08) requires Implementation notes to name stack and runtime constraints; SP-03 requires a concrete Data Model; SP-04 requires a Contract.

The PRD (`docs/prd/PRD.md`) states product constraints only:

- Web application surface (no native v0).
- Stripe for payments, France/EU + US markets.
- Managed AI inference, no BYOK.
- Public self-serve signup.
- Solo-owner identity, no multi-user.
- Operator-configurable credit pack pricing.

The PRD intentionally does not name a web framework, an auth provider, a database, or a runtime. This is correct PRD discipline (the PRD avoids implementation).

Phase 3 of the post-slice methodology pilot needed Specs for the `account-session` slices (signup, sign-in). Those Specs cannot pass SP-03 / SP-04 / SP-08 without naming concrete technology. There was no upstream PD to inherit from.

This PD freezes a minimal pilot baseline so Phase 3 can complete its exit criterion. It does not pretend to be the architecture of Zedos.

## Decision

The following pilot baseline applies **only to the `account-session` Specs produced under Phase 3 of the post-slice methodology pilot**. Other Feature Areas may inherit it only after user review.

### Web application framework

- **Next.js (App Router)** as the web framework.
- Rationale: aligned with the "web app" PRD constraint; supports server actions, server components, and the auth flows needed; mature for solo founder velocity. Alternatives (Remix, SvelteKit, Astro + island auth) are not blocked, but pilot picks Next.js to make Specs concrete.

### Authentication library

- **Auth.js (NextAuth v5)** as the authentication library.
- Provider for v0: **Credentials provider (email + password)**.
- Rationale: covers the v0 PRD scope (public self-serve signup, solo-owner identity, in-app first confirmation). Magic-link / OAuth providers may be added later without changing the Spec contracts.

### Persistence

- **Postgres** as the relational store.
- **Prisma** as the ORM and migration tool (Prisma MCP is already configured in this repo's MCP servers).
- Rationale: aligned with the existing tooling envelope; supports the schema needed for `User account` + `Session` objects.

### Session model

- **Database-backed sessions** via the Auth.js Prisma adapter.
- Session cookie: HttpOnly, Secure, SameSite=Lax, signed.
- Rationale: database-backed sessions make the "Already-signed-in detection" stories (US-003 in both signup and sign-in slices) cheap to implement; JWT-only sessions would have made session invalidation harder for v0.

### Password hashing

- **Argon2id** with reasonable v0 parameters (m=64MB, t=3, p=4).
- Rationale: modern memory-hard hash; chosen over bcrypt for new-write code.

### Anti-enumeration posture

- Sign-in errors use a single generic message ("Those credentials are not valid.") regardless of whether the account exists, with a constant-time response window to mitigate timing-based enumeration.
- Signup errors disclose validation issues (invalid email shape, missing field) but use a single generic message for "account already exists" indistinguishable from generic rejection, to avoid identifier enumeration.
- Rationale: meets US-002 (signup) AC-3 and US-002 (sign-in) AC-2 anti-enumeration ACs.

### Out of scope for this PD

- Front-end component library / design system (each Spec may state UI surface in product-level terms; concrete component library is a separate decision).
- Background jobs, queues, observability stack — none of the `account-session` Specs require them.
- Multi-region deployment posture, CDN, edge functions — not relevant to the pilot.
- Production secrets management — handled by repo conventions and the user-rule on `.env` files.

## Consequences / tradeoffs

### Benefits

- Phase 3 of the post-slice methodology pilot can complete.
- The 6 `account-session` Specs become writable with consistent technology choices.
- The data model and Auth.js session contract are shared across signup and sign-in stories, satisfying SP-12 (no leakage) and Spec Critic's "sibling consistency" check.

### Costs

- **Provisional status.** This PD was authored by an agent under execution pressure. The user has not yet weighed in on Next.js vs alternatives, Auth.js vs bespoke auth, Postgres vs SQLite-for-v0, etc.
- **Lock-in risk.** Once the `account-session` Specs are at `ready-for-implementation`, swapping any of these choices later means rewriting those Specs (and any code that follows).
- **Scope creep risk.** Future Specs in other Feature Areas may silently assume these choices instead of treating each Spec layer as a fresh architecture decision. PD-001's Spec Critic must explicitly stress-test this on each non-`account-session` Spec.

### Reversibility

This PD is reversible by user approval of a follow-up PD that supersedes it. Until that happens, treat the pilot baseline as the lowest possible commitment that lets Specs exist; do not extend it further without user input.

### User approval — 2026-05-25

User selected option 1 (approve as-is) when prompted at the Phase 4 boundary. Phase 4 proceeds with this baseline as the active architecture for all remaining Feature Areas.

## Links

- PRD: `docs/prd/PRD.md`
- Methodology decision: `docs/product-decisions/PD-001-post-slice-workflow.md`
- Driving plan: `Zedos verticale + post-slice` (Phase 3 friction discovery)
- Friction log: `docs/prd/notes/2026-05-25-post-slice-methodology-discovery.md` (initial) + Phase 3 retrospective note (to be created)
