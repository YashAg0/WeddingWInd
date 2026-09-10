# Execution Plan: WeddingWithIndia Remediation & Verification

## Objective
Execute a surgical, regression-safe remediation of verified findings in the WeddingWithIndia marketplace while strictly preserving mission-critical invariants.

## Milestones & Iteration Strategy

### Milestone 1 (Phase 1 - P0): Critical Security, Medical Safety & Server Resilience
- **SEC-01**: Gate `isE2ETestAuthEnabled()` in `lib/test-auth.ts`, `proxy.ts`, `app/api/test/auth/route.ts`, and `lib/auth.ts` strictly to test environments (`process.env.NODE_ENV === 'test' && process.env.PLAYWRIGHT_TEST === 'true'`).
- **UX-01**: Structured allergen chips (Strict Veg, Vegan, Jain, Halal, Celiac/Gluten-Free, Nut Allergies, Dairy) + custom notes in `app/onboarding/page.tsx` & Event Hub; serialize `TravelDetail.dietaryRequirements` and guest dietary alerts into host catering CSV in `app/api/reports/host/[weddingId]/route.ts`.
- **OPS-01**: Remove `process.exit(0)` on `unhandledRejection` in `instrumentation.ts`; implement structured logging via `logger.error()`.
- **SEC-02**: Neutralize spreadsheet formula prefix characters (`=`, `+`, `-`, `@`, `\t`, `\r`) with single-quote escaping in `escapeCsv` in `app/api/reports/host/[weddingId]/route.ts`.
- **Iteration Loop**: Explorer -> Worker -> Reviewers (2) -> Challengers (2) -> Forensic Auditor -> Gate.

### Milestone 2 (Phase 2 - P1): Booking, Trust Verification & Multi-Currency Architecture
- **TRU-01**: Bind `isVerified` strictly to approved database KYC records (`rawWedding.hostCouple?.user?.verification?.status === 'APPROVED'` or `UserQualityBadge`) in `lib/wedding-dto.ts` and `WeddingCard.tsx`.
- **UX-03**: Embed expandable Cancellation & Escrow Protection drawer directly below booking CTA in `components/wedding/BookingSidebar.tsx` (4-tier refund policy 90%/70%/40%/0% + escrow guarantees).
- **UX-02**: Multi-guest attendee manifest cards in `BookingSidebar.tsx` and Event Hub for multi-seat bookings (2-10 guests).
- **FIN-01**: Native Multi-Currency Engine for GBP, AUD, CAD, SGD, AED alongside USD/EUR/INR as display estimates in `lib/currency.ts` and `Navbar.tsx` (authoritative INR transaction settlement preserved).
- **ROU-01**: Remove shadowed permanent redirect from `next.config.ts` to unshadow `app/destinations/page.tsx`.
- **Iteration Loop**: Explorer -> Worker -> Reviewers (2) -> Challengers (2) -> Forensic Auditor -> Gate.

### Milestone 3 (Phase 3 - P2/P3): Performance, Skeletons & UX Simplification
- **PRF-01**: Standardized skeleton `loading.tsx` boundaries to missing route subtrees (`app/destinations/*`, `app/learn/*`, dashboard subtrees).
- **PRF-02**: Decouple static mock listing data from client bundles to seed utilities.
- **UX-06**: Replace 28s continuous marquee repaint loop in `TrustStrip.tsx` with static 4-column trust badge grid.
- **UX-05**: Consolidate 27+ legal pages into unified 3-tab `/trust` portal (*Terms*, *Privacy & Data*, *Safety & Incidents*).
- **Iteration Loop**: Explorer -> Worker -> Reviewers (2) -> Challengers (2) -> Forensic Auditor -> Gate.

### Milestone 4 (Phase 4): Verification, Quality Gates & Regression Protection
- **Invariants**: Strictly verify `SELECT FOR UPDATE` pessimistic booking locking, AES-256-GCM pass encryption, Stripe/Razorpay webhook HMAC verification, and Bayesian review rating calculations.
- **Quality Gates**: Pass `npx tsc --noEmit`, `npm test` / `npx jest`, and `npm run build`.
- **Forensic Audit**: Comprehensive victory integrity audit across the entire codebase.
