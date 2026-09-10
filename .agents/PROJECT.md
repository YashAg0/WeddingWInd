# Project: WeddingWithIndia Remediation & Verification

## Architecture
- Framework: Next.js 14+ / 16 (App Router) / React 18 / TypeScript / Tailwind CSS
- Data & ORM: PostgreSQL / Prisma ORM (`lib/prisma.ts`)
- Authentication: Clerk Auth (`lib/auth.ts`, `lib/test-auth.ts`, `proxy.ts`, `app/api/test/auth/route.ts`)
- Storage & Reports: CSV Reporting (`app/api/reports/host/[weddingId]/route.ts`)
- Payments & Currency: Stripe/Razorpay (`lib/stripe.ts`), Multi-Currency Engine (`lib/currency.ts`)
- Quality & Verification: TypeScript (`npx tsc --noEmit`), Jest (`npm test` / `npx jest`), Next Build (`npm run build`)

## Feature Inventory
| # | Feature | Description | Milestone | Status | Source |
|---|---------|-------------|-----------|--------|--------|
| 1 | SEC-01: E2E Auth Bypass Remediation | Gate `isE2ETestAuthEnabled()` strictly to test env (`NODE_ENV === 'test' && PLAYWRIGHT_TEST === 'true'`) | M1 | DONE | ORIGINAL_REQUEST R1.1 |
| 2 | UX-01: Structured Dietary Allergen Pipeline | Structured dietary allergen chips in onboarding & Event Hub; serialize dietary requirements in host catering CSV | M1 | DONE | ORIGINAL_REQUEST R1.2 |
| 3 | OPS-01: Server Process Resilience | Remove `process.exit(0)` on `unhandledRejection` in `instrumentation.ts`; add structured `logger.error()` | M1 | DONE | ORIGINAL_REQUEST R1.3 |
| 4 | SEC-02: CSV Formula Injection Neutralization | Escape formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) with single quotes in `escapeCsv` in host export | M1 | DONE | ORIGINAL_REQUEST R1.4 |
| 5 | TRU-01: Truthful Trust Badge Binding | Bind `isVerified` strictly to approved database KYC records in `lib/wedding-dto.ts` and `WeddingCard.tsx` | M2 | DONE | ORIGINAL_REQUEST R2.1 |
| 6 | UX-03: Cancellation & Escrow Protection Drawer | Embed expandable Cancellation & Escrow Protection drawer in `components/wedding/BookingSidebar.tsx` | M2 | DONE | ORIGINAL_REQUEST R2.2 |
| 7 | UX-02: Multi-Guest Attendee Manifest Cards | Dynamic `BookingGuest` attendee card collection (names, dietary restrictions) in `BookingSidebar.tsx` & Event Hub | M2 | DONE | ORIGINAL_REQUEST R2.3 |
| 8 | FIN-01: Native Multi-Currency Engine | Support GBP, AUD, CAD, SGD, AED display estimates in `lib/currency.ts` & `Navbar.tsx` (INR authoritative) | M2 | DONE | ORIGINAL_REQUEST R2.4 |
| 9 | ROU-01: Route Shadowing Resolution | Remove shadowed redirect from `next.config.ts` to unshadow `app/destinations/page.tsx` | M2 | DONE | ORIGINAL_REQUEST R2.5 |
| 10| PRF-01: Standardized Suspense Skeletons | Add `loading.tsx` skeletons to missing subtrees (`app/destinations/*`, `app/learn/*`, dashboard pages) | M3 | DONE | ORIGINAL_REQUEST R3.1 |
| 11| PRF-02: Static Mock Data Decoupling | Decouple static mock listing data from client bundles to seed utilities | M3 | DONE | ORIGINAL_REQUEST R3.2 |
| 12| UX-06: Marquee CPU Optimization | Replace 28s continuous repaint loop in `TrustStrip.tsx` with static 4-column trust badge grid | M3 | DONE | ORIGINAL_REQUEST R3.3 |
| 13| UX-05: Legal Route Consolidation | Consolidate 27+ legal pages into unified 3-tab `/trust` portal | M3 | DONE | ORIGINAL_REQUEST R3.4 |
| 14| M4-01: Mission-Critical Invariant Verification | Verify `SELECT FOR UPDATE` booking locking, AES-256-GCM encryption, webhook HMAC, Bayesian review ratings | M4 | DONE | ORIGINAL_REQUEST R4.1 |
| 15| M4-02: Quad-Verification Suite | Verify clean exit code 0 for `tsc --noEmit`, `jest`, `next build`, and zero extraneous diffs | M4 | DONE | ORIGINAL_REQUEST R4.2 |
| 16| M4-03: Forensic Integrity Audit | Independent `teamwork_preview_auditor` verification for CLEAN verdict | M4 | DONE | Forensic Audit |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Critical Security, Medical Safety & Resilience | SEC-01, UX-01, OPS-01, SEC-02 | None | DONE |
| M2 | Booking, Trust Verification & Multi-Currency | TRU-01, UX-03, UX-02, FIN-01, ROU-01 | M1 | DONE |
| M3 | Performance, Skeletons & UX Simplification | PRF-01, PRF-02, UX-06, UX-05 | M2 | DONE |
| M4 | Verification, Quality Gates & Regression Protection | Invariant Verification, tsc, jest, next build, Forensic Audit | M1, M2, M3 | DONE |

## Interface Contracts
### Auth Bypass Gating (`lib/test-auth.ts`, `proxy.ts`, `app/api/test/auth/route.ts`, `lib/auth.ts`)
- `isE2ETestAuthEnabled()` returns true ONLY when `process.env.NODE_ENV === 'test' && process.env.PLAYWRIGHT_TEST === 'true'`.

### Host Catering CSV Export (`app/api/reports/host/[weddingId]/route.ts`)
- `escapeCsv(val)` escapes formula injection prefix characters (`=`, `+`, `-`, `@`, `\t`, `\r`) with a leading single quote `'`.
- Includes dietary requirements from `TravelDetail` and attendee guest alerts.

### Currency Conversion (`lib/currency.ts`)
- Exchange rates for GBP, AUD, CAD, SGD, AED, USD, EUR relative to INR.
- Settlement remains strictly INR.

## Code Layout
- `lib/test-auth.ts`, `proxy.ts`, `app/api/test/auth/route.ts`, `lib/auth.ts`: Auth & test auth gating
- `app/onboarding/page.tsx`, `app/event-hub/**/*`: Onboarding & event attendee UX
- `instrumentation.ts`: Server lifecycle & error handling
- `app/api/reports/host/[weddingId]/route.ts`: Host export & CSV serialization
- `lib/wedding-dto.ts`, `components/wedding/WeddingCard.tsx`: Verification & badge rendering
- `components/wedding/BookingSidebar.tsx`: Booking drawer, multi-guest manifest, cancellation policy
- `lib/currency.ts`, `components/layout/Navbar.tsx`: Currency selector & conversion
- `next.config.ts`: Next.js redirects and configurations
- `app/destinations/**/loading.tsx`, `app/learn/**/loading.tsx`: Suspense boundaries
- `components/landing/TrustStrip.tsx`: Trust badges grid
- `app/trust/page.tsx`: Unified 3-tab legal portal
