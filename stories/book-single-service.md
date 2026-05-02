# [STORY] Book a Single Service

## Meta
- **Status:** Draft
- **Feature link:** `features/booking-flow.md`
- **Priority:** P0
- **Created:** 2026-05-02

## User Statement

> As a customer visiting a merchant's website, I can select a service, choose an available time slot, enter my contact details, and confirm a booking — so that I can book without leaving the merchant's site or calling them.

## Acceptance Criteria

- [ ] Customer sees a list of services the merchant offers (name, duration, price if applicable)
- [ ] Customer selects a service and sees only time slots that are currently available
- [ ] Customer picks a time slot, enters their name and email, and submits
- [ ] Customer sees an on-screen confirmation with the service, date, time, and a reference number
- [ ] If the customer tries to book a slot that was just taken (race condition), they see a clear error and can pick another slot
- [ ] The booking flow is usable on a 320px-wide mobile screen without horizontal scrolling
- [ ] A merchant with a different set of services can use the same flow by changing configuration only (no code changes)

## Specs

- [ ] `specs/booking-widget-core.md` — Data model (services, slots, bookings), availability logic, booking creation API, and widget rendering contract
- [ ] `specs/booking-confirmation-display.md` — On-screen confirmation UI after successful booking (deferred — can be a static "thank you" screen in V1)

## Out of Scope (for this Story)

- Email/SMS confirmation (separate Story #3 in the Feature)
- Payment collection
- Customer accounts or login
- Editing or cancelling a booking after submission
- Merchant dashboard to view bookings (separate Story #4)
- Calendar month-view or week-view navigation (simple list of available slots is sufficient for V1)

## Definition of Shipped

- [ ] All Specs implemented and merged
- [ ] Tested at 320px mobile
- [ ] Booking flow deployed on Little Biceps' site (or a staging equivalent) and completes a real booking
- [ ] A second merchant config (even if fictional) proves the flow works without code changes
- [ ] No hardcoded Little Biceps values in the codebase
