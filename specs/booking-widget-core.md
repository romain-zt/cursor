# [SPEC] Booking Widget Core

## Meta
- **Status:** Implemented
- **Classification:** 1. Reusable Primitive
- **Target:** ZedCheckout
- **Author:** (needs assignment)
- **Date:** 2026-05-02

## Problem

Merchants need an embeddable booking flow on their own site. Currently no component exists that: (a) renders a service list from configuration, (b) exposes available time slots, (c) captures customer info, and (d) persists a booking. Without this core, no booking story can ship.

## Solution

A booking widget (web component) backed by a lightweight API. The widget renders a multi-step flow: service selection → slot selection → customer info → confirmation. The API manages service definitions, availability, and booking creation. All merchant-specific data (services, hours, branding) comes from configuration — no per-merchant code.

## Scope

### In Scope
- Data model for Service, TimeSlot, and Booking entities
- REST API for: list services, list available slots for a service + date, create a booking
- Widget rendering contract (web component with a config attribute)
- Optimistic slot hold with race condition handling
- Mobile-first layout (320px minimum)
- Configuration schema for merchant-specific data

### Out of Scope
- Payment processing (separate feature)
- Email/SMS notifications (separate spec)
- Customer authentication (anonymous booking only)
- Merchant admin dashboard
- Multi-location support
- Calendar navigation UI (month/week views)
- Recurring/rebooking logic

## Technical Design

### Data Models

**Service**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| merchant_id | UUID | FK to merchant config |
| name | string | e.g. "60-min Personal Training" |
| duration_minutes | integer | Length of the service |
| price_cents | integer | nullable — display-only in V1, no payment |
| active | boolean | Soft toggle |

**TimeSlot**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| service_id | UUID | FK to Service |
| starts_at | datetime (UTC) | |
| ends_at | datetime (UTC) | Computed from starts_at + duration |
| status | enum | `available`, `held`, `booked` |
| held_until | datetime | nullable — TTL for optimistic hold |

**Booking**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| reference_code | string | Human-readable, e.g. "ZC-A3F7" |
| slot_id | UUID | FK to TimeSlot |
| customer_name | string | |
| customer_email | string | |
| status | enum | `confirmed`, `cancelled` |
| created_at | datetime | |

**MerchantConfig**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| name | string | Merchant display name |
| timezone | string | IANA timezone, e.g. "America/New_York" |
| branding | JSON | Optional: primary color, logo URL |

### API / Interfaces

**`GET /api/v1/merchants/{merchant_id}/services`**
Returns active services for a merchant.

Response: `{ services: Service[] }`

**`GET /api/v1/services/{service_id}/slots?date=YYYY-MM-DD`**
Returns available slots for a service on a given date. Only returns slots where `status = available` or where `status = held` and `held_until < now` (expired holds). Times returned in merchant's configured timezone.

Response: `{ slots: TimeSlot[], timezone: string }`

**`POST /api/v1/bookings`**
Creates a booking. Atomically transitions the slot from `available` → `booked` (or `held` → `booked` if held by same session).

Request: `{ slot_id, customer_name, customer_email }`
Response (201): `{ booking: Booking }`
Response (409): `{ error: "slot_unavailable" }` — slot was taken between selection and submission.

**Widget embed contract:**
```html
<zed-checkout
  merchant-id="uuid-here"
  api-base="https://api.zedcheckout.com"
  theme="auto"
></zed-checkout>
<script src="https://cdn.zedcheckout.com/widget/v1.js"></script>
```

The widget reads `merchant-id` and `api-base` from attributes. `theme` accepts `auto` (inherits page styles), `light`, or `dark`.

### Dependencies
- A hosting environment for the API (technology TBD — this spec is technology-agnostic)
- CDN for widget script distribution
- Database for persistence (relational preferred given the FK relationships)

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Two customers try to book the same slot simultaneously | First `POST /bookings` wins (atomic status transition). Second gets 409 with `slot_unavailable`. Widget shows error and refreshes slot list. |
| Customer starts booking flow, waits 20 minutes, then submits | Slot may have been booked by another customer. Same 409 handling. No silent failures. |
| Merchant has no services configured | Widget shows "No services available" message. Does not crash or show empty UI. |
| Merchant has services but no available slots on selected date | Slot list shows "No availability on this date." Customer can pick another date. |
| Customer enters invalid email format | Client-side validation blocks submission. Error shown inline next to the email field. |
| Widget is embedded on a page with conflicting CSS | Web component shadow DOM isolates styles. Merchant's CSS does not break the widget. |
| API is unreachable (network error) | Widget shows "Unable to load booking. Please try again." with a retry button. Does not show a blank screen. |
| Merchant config has no timezone set | API defaults to UTC. Widget displays times in UTC with a note: "Times shown in UTC." |
| Slot's `held_until` expires between slot list load and booking attempt | Slot becomes available again. If another customer books it first, original customer gets 409. If no one else booked it, booking succeeds normally. |

## Definition of Done

- [ ] `GET /merchants/{id}/services` returns configured services for a merchant and returns empty array (not error) for merchants with no services
- [ ] `GET /services/{id}/slots?date=` returns only available slots and excludes booked/actively-held slots
- [ ] `POST /bookings` atomically creates a booking and transitions slot status, returning 201 on success
- [ ] `POST /bookings` returns 409 with `slot_unavailable` when the slot is already booked
- [ ] Widget renders service list, slot picker, customer form, and confirmation screen as a multi-step flow
- [ ] Widget renders without horizontal scrolling at 320px viewport width
- [ ] Widget uses shadow DOM to isolate styles from the host page
- [ ] A second merchant config (different services, different timezone) renders correctly without code changes
- [ ] All edge cases in the table above pass automated tests
- [ ] No hardcoded merchant values (names, IDs, service lists) exist in widget or API code
- [ ] API validates `customer_email` format and returns 422 for invalid input

## Open Questions

All resolved (cloud agent operating without interactive gates — answers assume reasonable V1 defaults; override if needed):

- [x] **Slot hold mechanism:** V1 uses conflict detection only (no optimistic hold). Simpler to build, and at Little Biceps' expected booking volume, concurrent conflicts will be rare. Hold mechanism can be added in a follow-up spec if 409 rates exceed 5%.
- [x] **Time slot generation:** V1 uses pre-generated slots. Merchant (or onboarding support) creates slots manually or via a seed script. Dynamic availability rules are a Story #2 concern (merchant config interface). The data model already supports this — TimeSlot rows are the source of truth regardless of how they're created.
- [x] **Widget distribution:** V1 ships as script tag + CDN only. This matches the "embed on any site" promise and requires zero build tooling from the merchant. npm package is a future option for developer-heavy merchants.
- [x] **Little Biceps payment requirement:** *Assumption: booking without payment is acceptable for pilot.* If this is wrong, a payment spec must be fast-tracked — this is the highest-risk assumption in the spec. Flagged in Feature risks.
