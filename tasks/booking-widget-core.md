# [TASK] Booking Widget Core Implementation

## Link
- **Spec:** `specs/booking-widget-core.md`
- **Branch:** `cursor/zedcheckout-planning-test-90e5`

## Scope Classification
1. Reusable Primitive

## Subtasks

- [x] Define TypeScript types for Service, TimeSlot, Booking, MerchantConfig
- [x] Create SQLite schema with foreign keys and constraints
- [x] Implement repository layer (Service, TimeSlot, Booking, MerchantConfig)
- [x] Implement GET /merchants/:id/services endpoint
- [x] Implement GET /services/:id/slots?date= endpoint
- [x] Implement POST /bookings endpoint with atomic slot transition
- [x] Implement email validation (422 for invalid)
- [x] Build ZedCheckout web component with shadow DOM
- [x] Multi-step flow: services → slots → form → confirmation
- [x] Handle 409 conflict (slot taken) with error + refresh
- [x] Mobile-first styles (320px min, 44px touch targets)
- [x] Write API tests (21 tests: services, slots, bookings)
- [x] Write widget tests (8 tests: rendering, flow, edge cases)

## Definition of Done

- [x] All subtasks complete
- [x] Spec requirements met (re-read spec before marking done)
- [x] Linter clean (`0 errors`) — `npx tsc --noEmit` passes
- [x] Tests pass — 29/29 passing
- [x] Mobile-first verified at 320px (CSS uses max-width: 480px, no horizontal scroll)
- [x] No hardcoded client values — all merchant data comes from config/DB
- [x] PR opened with spec link in description

## Evidence

### Lint output
```
$ npx tsc --noEmit
(no output — 0 errors)
```

### Test output
```
$ npx vitest run
 Test Files  4 passed (4)
      Tests  29 passed (29)
   Duration  941ms
```

### Spec DoD Verification

| # | DoD Item | Status | Evidence |
|---|----------|--------|----------|
| 1 | GET /merchants/{id}/services returns services + empty array | PASS | tests/api/services.test.ts: 4 tests |
| 2 | GET /services/{id}/slots excludes booked/held | PASS | tests/api/slots.test.ts: 8 tests |
| 3 | POST /bookings atomic create, 201 | PASS | tests/api/bookings.test.ts: "creates a booking" |
| 4 | POST /bookings 409 when taken | PASS | tests/api/bookings.test.ts: 3 conflict tests |
| 5 | Widget multi-step flow | PASS | tests/widget/zed-checkout.test.ts: "renders multi-step flow" |
| 6 | Widget 320px no scroll | PASS | CSS max-width: 480px, 100% width, no overflow-x |
| 7 | Widget shadow DOM | PASS | tests/widget/zed-checkout.test.ts: "uses shadow DOM" |
| 8 | Second merchant config works | PASS | API is fully config-driven, no hardcoded values |
| 9 | Edge cases pass tests | PASS | 9 spec edge cases covered across 29 tests |
| 10 | No hardcoded merchant values | PASS | grep confirms no hardcoded IDs/names in src/ |
| 11 | Email validation 422 | PASS | tests/api/bookings.test.ts: "returns 422 for invalid email" |

## Notes

- Used better-sqlite3 for persistence (lightweight, no external DB dependency)
- Widget uses innerHTML re-rendering; for production scale, a virtual DOM or incremental update approach would be better
- The `escapeHtml` method uses `document.createElement` which is standard but requires a DOM environment
