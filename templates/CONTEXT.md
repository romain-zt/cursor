# CONTEXT.md

> Copy this file to your project root when forking the Cursor OS into a new project.
> Fill in every section. Agents use this to understand your domain.

## Product

- **Name:** {product name}
- **One-liner:** {what it does, for whom, in one sentence}
- **Stage:** {idea | prototype | MVP | production | mature}
- **URL:** {production URL if any}

## Domain Vocabulary

Define terms that your team uses. Agents will use these consistently.

| Term | Definition |
|------|-----------|
| {e.g., Merchant} | {A business using our platform to sell} |
| {e.g., Booking} | {A confirmed timeslot reservation by an end-user} |

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | {e.g., Next.js 15, React 19, Tailwind 4} |
| Backend | {e.g., Payload CMS, Node.js} |
| Database | {e.g., PostgreSQL via Payload} |
| Payments | {e.g., Stripe} |
| Hosting | {e.g., Vercel + Railway} |
| Testing | {e.g., Vitest} |

## Key Constraints

- {e.g., Must work offline for POS terminals}
- {e.g., No Shopify dependency — we own the checkout}
- {e.g., Multi-tenant: one codebase, per-merchant config}

## Architecture Decisions

Link to ADRs or list key decisions:

1. {e.g., Chose Payload CMS over Strapi because...}
2. {e.g., Monorepo with pnpm workspaces}

## Current Priorities

1. {What's being built RIGHT NOW}
2. {What's next}
3. {What's explicitly deferred}
