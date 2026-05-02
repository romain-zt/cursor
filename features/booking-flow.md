# [FEATURE] Merchant Booking Flow

## Meta
- **Status:** Proposed
- **Classification:** 1. Reusable Primitive
- **Vision link:** `docs/vision.md` — section "The Wedge"
- **Owner:** (needs assignment)
- **Created:** 2026-05-02

### Classification Justification

This is a **1. Reusable Primitive** because the booking flow must work across merchants unchanged. Little Biceps is the first deployment, but the flow itself — service selection, time slot picking, customer info capture, confirmation — is generic to any service-based merchant. Per `scope-control.mdc`: "Build it. Make it configurable." Merchant-specific details (service names, availability windows, branding) are configuration, not code.

## Problem

Service merchants (starting with Little Biceps) currently have no way to accept bookings directly on their own website. Their options are: (a) link out to a marketplace (losing brand control and paying a cut), (b) accept bookings via phone/DM (doesn't scale, error-prone), or (c) use a booking SaaS that redirects customers to a third-party domain (breaks the native experience). The result: lost conversions, diluted brand, and dependency on platforms that compete for the same customer.

**I'm flagging:** I don't have real data on Little Biceps' current booking volume, abandonment rates, or specific pain points. The problem statement above is based on the general pattern described in the prompt context, not on observed merchant data.

## Outcome

A merchant embeds the ZedCheckout booking flow on their own site. A customer visiting that site can browse available services, pick a time slot, enter their details, and confirm a booking — all without leaving the merchant's domain. The merchant sees the booking in their dashboard.

## Smallest Valuable Slice

**Story #1: "Customer books a single service at an available time."** This is the minimum viable booking interaction. Without this, nothing else matters — calendar views, multi-service bundles, payments are all additive. If a customer can pick a service, pick a time, enter their info, and get a confirmation, the core loop is proven. Everything else builds on top.

## Stories

| # | Story | Priority | Status |
|---|-------|----------|--------|
| 1 | As a customer, I can select a service and available time slot and confirm a booking on the merchant's site | P0 | Draft |
| 2 | As a merchant, I can define my available services and time slots through a configuration interface | P1 | Idea |
| 3 | As a customer, I receive a confirmation (email or on-screen) after booking | P1 | Idea |
| 4 | As a merchant, I can view and manage incoming bookings in a dashboard | P1 | Idea |
| 5 | As a merchant, I can embed the booking flow on my site with minimal technical effort | P2 | Idea |

## Out of Scope

- **Payment collection at booking time.** V1 is book-only, no checkout. Payment is a separate feature.
- **Multi-service bundling.** Customer books one service per flow. Bundles are a future story.
- **Waitlisting / overbooking.** If a slot is taken, it's taken. No queue.
- **Customer accounts / login.** Booking is anonymous (name + email). Accounts come later.
- **Rebooking / recurring bookings.** Explicitly deferred per Vision non-goals.
- **Multi-location support.** Single location per merchant in V1.

## Dependencies

- A data model for services, time slots, and bookings (defined in the Spec)
- A hosting/embed strategy for the booking widget (script tag, web component, or iframe — decision needed)
- A backend to persist bookings and expose availability (technology choice TBD in Spec)

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Embed approach feels like a foreign iframe, not native to merchant site | M | H | Use web components or script injection rather than iframe. Test on Little Biceps' actual site early. |
| Time slot availability logic becomes complex (timezone, buffer times, blocked hours) | H | M | Start with simple fixed-duration slots defined by merchant. No timezone conversion in V1 — merchant sets slots in their local time. |
| Little Biceps needs a payment-gated booking and we can't ship without it | M | H | Confirm with Little Biceps before building: is book-without-pay acceptable for pilot? If not, re-scope. |
| Building something that only works for Little Biceps' specific service model | M | H | Enforce Classification 1 throughout. Every Spec gets a "would this work for a yoga studio too?" check. |

## Kill Criteria

- Little Biceps says they won't go live without payment at booking time, AND adding payment would take the scope beyond what's viable for the pilot timeline — kill the "booking-only" approach and re-scope with payments as P0.
- The embed approach requires deep integration with the merchant's site framework (e.g., custom React/Vue bindings per merchant) — means the "works on any site" premise is false.
- After building, no second merchant can be onboarded within a week of config-only work — means the reusable primitive classification was wrong.
