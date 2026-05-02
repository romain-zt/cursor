# [VISION] ZedCheckout

> One vision per product. Lives at `docs/vision.md` in the consuming project.
> Changes rarely (quarterly at most). All Features trace back to this.

## Meta

- **Owner:** (needs assignment)
- **Last reviewed:** 2026-05-02
- **Status:** Active

## The North Star

Merchants keep every booking on their own site — no marketplace cut, no brand dilution, no platform dependency.

## Who We Serve

- **Primary user:** Independent service merchants (studios, clinics, salons, trainers) who want bookings on their own site, not through a marketplace.
- **Secondary users:** Their end customers who book services.
- **Not for:** Enterprise chains with 50+ locations. Marketplace aggregators. Merchants who want a full e-commerce platform (that's Shopify's job, not ours).

## The Wedge

ZedCheckout Booking: an embeddable booking flow that lives on the merchant's existing site. No marketplace listing, no redirect to a third-party domain. The merchant's brand, the merchant's customer relationship. First production pilot is Little Biceps — a real merchant, not a demo. Everything built for Little Biceps must be a reusable primitive configured for their case, never a one-off.

## Non-Goals

- **Build a Shopify alternative.** ZedCheckout is not a full e-commerce platform. No product catalogs, no inventory management, no shipping.
- **Build a marketplace.** We don't aggregate merchants or send them traffic. The merchant's own site is the channel.
- **Automate rebooking intelligence now.** "Churn V0" / rebooking intelligence is a future capability — explicitly deferred from the current vision cycle. It lives in `specs/backlog.md` as a Future Option.
- **Build a PayloadCMS product.** The PayloadCMS.ai assistant is a controlled internal beta, separate from ZedCheckout. It may share infrastructure later but is NOT part of this product vision.
- **Support multi-location scheduling out of the gate.** Single-location first. Multi-location is a future expansion, not a launch requirement.

## Success Signals (12 months)

- Little Biceps is live and processing real bookings through ZedCheckout on their own site.
- At least 2 additional merchants onboarded using the same primitives (no custom code per merchant).
- Booking completion rate ≥ 70% (users who start a booking flow finish it).
- Zero marketplace dependency — no bookings flow through a third-party aggregator.

## Anti-Signals

- Little Biceps requires custom code that can't be reused by a second merchant — means the primitives are wrong.
- Merchants ask for features that turn ZedCheckout into a full storefront — means the wedge isn't sharp enough.
- End customers abandon the flow because it feels like a bolt-on iframe, not native — means the embed approach is failing.

## Active Features

- `features/booking-flow.md` — Merchant booking flow on their own site