# Original User Request

## 2026-08-30T04:09:01Z

Execute a surgical, regression-safe, traveler-first remediation of verified findings in the WeddingWithIndia marketplace while strictly preserving mission-critical invariants (authentication, KYC, booking concurrency, pricing authority, AES-256-GCM guest passes, and escrow services).

Working directory: c:\Projects\WeddingWithIndia\wedding-with-india
Integrity mode: development

## Requirements

### R1. Phase 1 — Critical Security, Medical Safety & Server Resilience (P0)
1. **E2E Auth Bypass Remediation (SEC-01)**: Gate isE2ETestAuthEnabled() in lib/test-auth.ts, proxy.ts, pp/api/test/auth/route.ts, and lib/auth.ts strictly to test environments (process.env.NODE_ENV === test && process.env.PLAYWRIGHT_TEST === true), completely blocking unauthorized remote session creation in production while preserving Playwright compatibility.
2. **Medical Safety & Structured Dietary Pipeline (UX-01)**: Convert unstructured free-text food preferences in pp/onboarding/page.tsx and Event Hub into structured allergen chips (Strict Veg, Vegan, Jain, Halal, Celiac/Gluten-Free, Nut Allergies, Dairy) with custom notes. Fix pp/api/reports/host/[weddingId]/route.ts to serialize TravelDetail.dietaryRequirements and accompanying guest dietary alerts into host catering exports.
3. **Server Process Resilience (OPS-01)**: Remove process.exit(0) on unhandledRejection in instrumentation.ts. Implement structured logging via logger.error() to maintain server liveness during non-fatal asynchronous rejections.
4. **CSV Formula Injection Neutralization (SEC-02)**: In pp/api/reports/host/[weddingId]/route.ts, neutralize spreadsheet formula prefix characters (=, +, -, @, \t, \r) with single-quote escaping in escapeCsv.

### R2. Phase 2 — Booking, Trust Verification & Multi-Currency Architecture (P1)
1. **Truthful Trust Badge Binding (TRU-01)**: In lib/wedding-dto.ts and WeddingCard.tsx, bind isVerified strictly to actual approved database KYC records (awWedding.hostCouple?.user?.verification?.status === APPROVED or UserQualityBadge), eliminating synthetic badges on unvetted hosts.
2. **Cancellation & Escrow Transparency (UX-03)**: Embed an expandable Cancellation & Escrow Protection drawer directly below the booking CTA in components/wedding/BookingSidebar.tsx, clearly explaining the platform's 4-tier refund policy (90%/70%/40%/0%) and escrow guarantees.
3. **Multi-Guest Attendee Manifest (UX-02)**: In BookingSidebar.tsx and Event Hub, introduce dynamic BookingGuest attendee card collection (names, dietary restrictions) for multi-seat bookings (2–10 guests).
4. **Native Multi-Currency Engine (FIN-01)**: Expand lib/currency.ts and Navbar.tsx to support GBP, AUD, CAD, SGD, AED alongside USD/EUR/INR as display estimates while preserving authoritative INR transaction pricing.
5. **Route Shadowing Resolution (ROU-01)**: Remove the shadowed permanent redirect from 
ext.config.ts:124 to unshadow the regional destination directory at pp/destinations/page.tsx.

### R3. Phase 3 — Performance, Skeletons & UX Simplification (P2–P3)
1. **Suspense Boundaries (PRF-01)**: Add standardized skeleton loading.tsx boundaries to missing route subtrees (pp/destinations/*, pp/learn/*, and unboundary dashboard pages) to eliminate navigation freezing and layout shifts.
2. **Static Mock Data Decoupling (PRF-02)**: Decouple static mock listing data from client bundles by moving it to seed utilities, reducing JavaScript parse/eval overhead on mobile.
3. **Marquee CPU Optimization (UX-06)**: Replace the 28-second continuous marquee repaint loop in TrustStrip.tsx with a static 4-column trust badge grid.
4. **Legal Route Consolidation (UX-05)**: Consolidate 27+ fragmented legal pages into a unified 3-tab /trust portal (*Terms*, *Privacy & Data*, *Safety & Incidents*).

### R4. Phase 4 — Verification, Quality Gates & Regression Protection
1. **Preserve Mission-Critical Invariants**: Strictly verify that SELECT FOR UPDATE pessimistic booking locking, AES-256-GCM pass encryption, Stripe/Razorpay webhook HMAC verification, and Bayesian review rating calculations remain 100% untouched.
2. **Quality Gates**: Pass TypeScript check (
px tsc --noEmit), Jest unit/integration test suites (
px jest), and Next.js production build (
pm run build).

## Acceptance Criteria

### Security & Safety
- [ ] Unauthenticated requests to /api/test/auth?role=ADMIN return 404 or are rejected in production configurations.
- [ ] Host CSV export accurately includes structured dietary allergen alerts and neutralizes formula injection prefixes.
- [ ] Server process does not exit on unhandled promise rejections.

### Trust & UX
- [ ] Green verified host badges render only for hosts with approved KYC status in PostgreSQL.
- [ ] Cancellation terms and escrow guarantees are visible before booking submission in BookingSidebar.tsx.
- [ ] Currency selector includes GBP, AUD, CAD, SGD, and AED without altering authoritative INR settlement.

### Build & Integrity
- [ ] TypeScript check compiles with zero errors (
px tsc --noEmit).
- [ ] All Jest unit and integration test suites pass (
pm test or 
px jest).
- [ ] Next.js production build succeeds (
pm run build).
- [ ] Working tree diff contains zero unrelated changes or secrets.
