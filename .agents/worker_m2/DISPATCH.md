## 2026-08-30T04:32:45Z
You are a Worker subagent for Milestone 2 (Phase 2: Booking, Trust Verification & Multi-Currency Architecture) of WeddingWithIndia.
Your working directory is: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m2
Project root is: c:\Projects\WeddingWithIndia\wedding-with-india

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You have exclusive write ownership of the following files:
- `lib/wedding-dto.ts`
- `components/wedding/WeddingCard.tsx`
- `next.config.ts`
- `components/wedding/BookingSidebar.tsx`
- `components/wedding/StickyBookingCard.tsx`
- `lib/actions/index.ts`
- `lib/actions/event-operations.ts`
- `app/dashboard/events/[bookingId]/page.tsx`
- `app/dashboard/events/[bookingId]/ClientEventHubForm.tsx`
- `lib/currency.ts`
- `context/CurrencyContext.tsx`
- `components/layout/Navbar.tsx`
- Unit test files under `__tests__/`

Read authoritative requirements and context at:
`c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md`
`c:\Projects\WeddingWithIndia\wedding-with-india\.agents\PROJECT.md`

Read the 3 M2 Explorer handoff reports for exact guidance and code specifications:
- `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\m2_explorer_trust_routes\handoff.md`
- `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\m2_explorer_booking_manifest\handoff.md`
- `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\m2_explorer_currency\handoff.md`

Implement:
1. **TRU-01**: In `lib/wedding-dto.ts` and `lib/actions/index.ts`, bind `isVerified` strictly to actual approved database KYC records (`rawWedding.hostCouple?.user?.verification?.status === 'APPROVED'` or `UserQualityBadge` with key `verified-host` or explicit non-demo `isVerified: true`), eliminating synthetic badges on unvetted hosts. Ensure `WeddingCard.tsx` and `app/weddings/[slug]/page.tsx` reflect this truthful state.
2. **ROU-01**: In `next.config.ts`, remove the permanent redirect rule `{ source: "/destinations", destination: "/weddings", permanent: true }` to unshadow `app/destinations/page.tsx`.
3. **UX-03**: In `components/wedding/BookingSidebar.tsx`, embed an expandable Cancellation & Escrow Protection drawer directly below the booking CTA, displaying the 4-tier refund policy (>30d: 90%, 15-30d: 70%, 7-14d: 40%, <7d: 0%), 100% host cancellation guarantee, and platform escrow holding terms.
4. **UX-02**:
   - In `components/wedding/BookingSidebar.tsx`, add dynamic `BookingGuest` attendee card collection (name, dietary chips, accessibility) for multi-seat bookings (2–10 guests).
   - In `lib/actions/index.ts` (`createBookingAction`), accept `guests` array and atomically insert `BookingGuest` records while strictly preserving `SELECT FOR UPDATE` locking and server-authoritative pricing.
   - In `app/dashboard/events/[bookingId]`, update `page.tsx` to include `guests: true`, add the Guest Manifest tab in `ClientEventHubForm.tsx`, and add `saveBookingGuestsAction` in `lib/actions/event-operations.ts`.
5. **FIN-01**:
   - In `lib/currency.ts`, expand support to 8 currencies (`USD`, `EUR`, `GBP`, `AUD`, `CAD`, `SGD`, `AED`, `INR`) with conversion rates, metadata, and auto-detection.
   - In `context/CurrencyContext.tsx`, update `CurrencyProvider` to support all 8 currencies, helpers `formatPriceFromUSD`, `convertUSD`, `convertINR`, and localStorage persistence.
   - In `components/layout/Navbar.tsx`, implement the 8-currency picker grid in desktop popover and mobile drawer.
   - In `WeddingCard.tsx`, `BookingSidebar.tsx`, and `StickyBookingCard.tsx`, update price displays to reflect active currency estimates while preserving authoritative USD/INR settlement notes.
6. **Tests & Build Verification**:
   - Write comprehensive unit tests in `__tests__/` covering TRU-01, ROU-01, UX-03, UX-02, and FIN-01.
   - Run `npx tsc --noEmit` and `npx jest` to ensure 100% passing test suites and zero TypeScript errors.

Write your handoff report to:
`c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m2\handoff.md`
Report your completion via send_message to your caller.
