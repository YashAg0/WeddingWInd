# Handoff Report — Financials, Quality, Testing, UI/UX & Documentation Baseline

**Agent**: `survey_explorer_3` (teamwork_preview_explorer)  
**Working Directory**: `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\survey_explorer_3`  
**Date**: 2026-08-09  

---

## 1. Observation

### Financial Calculations & Security
- **Server-Authoritative Pricing**: In `lib/actions/index.ts` lines 561-562, booking pricing is computed directly from database fields:
  ```typescript
  const serverPricePerGuest = wedding.pricePerGuest;
  const serverTotalAmount = serverPricePerGuest * data.guestsCount;
  ```
  However, in `createBookingAction` (`lib/actions/index.ts` line 480), `data.guestsCount` is passed as a parameter but is **not validated** against `guestsCount <= 0` or non-integer values prior to multiplication.
- **Stripe Checkout & $0 Bypass**: `lib/actions/stripe.ts` lines 32-52 calculates `finalAmount = booking.totalAmount` minus coupon discounts. If `finalAmount <= 0`, lines 66-136 execute a `$0 Bypass` that creates a `PAID` payment record, issues a `GuestPass`, and sends an invoice email without invoking Stripe.
- **Webhook Handlers & Idempotency**: `app/api/webhooks/stripe/route.ts` line 36 verifies signatures via `stripe.webhooks.constructEvent`. Lines 47-63 check `prisma.stripeWebhookEvent` for existing `stripeEventId` to ensure idempotency. Lines 92-99 guard against processing payments for `CANCELLED`, `REJECTED`, or `REFUNDED` bookings.
- **Refund Controls**: `lib/actions/stripe.ts` lines 174-225 implements `processFullRefundAction` (restricted to `UserRole.ADMIN`), checking `payment.status === PaymentStatus.PAID`. `processPartialRefundAction` (lines 230-268) checks `partialAmount > 0` and `partialAmount < payment.amount`, but **does not aggregate existing partial refunds** for the payment, creating a double-refund/over-refund risk across multiple partial requests.
- **Cancellation Policy Engine**: `lib/services/cancellation-policy.ts` lines 48-161 calculates tiered refunds (30+ days: 90%, 15-29 days: 70%, 7-14 days: 40%, <7 days: 0%) using integer cents (`totalCents = Math.round(totalAmount * 100)`). `lib/services/refunds.ts` lines 190-224 uses Stripe idempotency keys `REFUND:${cancellationRequestId}:${payment.id}`.

### Quality & Anti-Patterns Audit
- **`Math.random`**: Grep search across `c:\Projects\WeddingWithIndia\wedding-with-india` returned **0 instances** of `Math.random` in TypeScript/JavaScript source files. Cryptographic randomness uses `crypto.randomBytes` (e.g. `lib/actions/stripe.ts:67`) and `crypto.randomInt` (e.g. `lib/auth.ts:81`).
- **`as any`**: Grep search identified **45+ occurrences** of `as any` in production TS/TSX files. Key occurrences include:
  - `lib/actions/founder.ts:9`: `const db = prisma as any;`
  - `lib/actions/stripe.ts:36-37`: `(prisma as any).coupon.findUnique(...)`
  - `components/wedding/WeddingDetailReviews.tsx:257`: `(rev as any).authorAvatar`
  - `app/api/webhooks/stripe/route.ts:71`: `const session = event.data.object as any;`
- **`localhost` Fallbacks**: `lib/env.ts` lines 30-37 explicitly rejects `localhost` in `NEXT_PUBLIC_APP_URL` when `NODE_ENV === "production"`. However:
  - `lib/actions/stripe.ts:63`: `const origin = process.env.NEXT_PUBLIC_APP_URL || "https://weddingwithindia.com";`
  - `playwright.config.ts:12`: `baseURL: "http://localhost:3000"`
  - `e2e/*.spec.ts`: Test scripts default `BASE_URL` to `http://localhost:3000`.
- **Fake Reviews & Fallbacks**:
  - `components/wedding/WeddingDetailReviews.tsx:257`: Falls back to `https://i.pravatar.cc/80?img=4` if avatar is null.
  - `lib/actions/index.ts:1404-1407`: Falls back to Unsplash stock photo URLs if host/couple avatars are missing.
  - `lib/mock-data-store.ts`: Retains an in-memory/localStorage `coordinatorMockStore` for event coordinators.
- **Test Users**: `scripts/bootstrap-admin.js` seeds test users (`superadmin@weddingwithindia.com`, `admin@weddingwithindia.com`, `host@weddingwithindia.com`, `guest@weddingwithindia.com`, `agent@weddingwithindia.com`, `coordinator@weddingwithindia.com`).

### Test Infrastructure Baseline
- **`package.json` Scripts**:
  - `"lint": "eslint"`
  - `"type-check": "tsc --noEmit"`
  - `"test": "jest --passWithNoTests"`
  - `"e2e": "playwright test"`
  - `"build": "prisma generate && next build"`
- **Jest Unit Test Suite**: 22 test files in `__tests__/lib/` (`badges.test.ts`, `contact-moderation.test.ts`, `discovery-ranking.test.ts`, `edit-review-concurrency.test.ts`, `manual-adjustment-retry.test.ts`, `public-review-dto.test.ts`, `public-review-policy.test.ts`, `rate-limit.test.ts`, `refund-reputation.test.ts`, `reputation-events.test.ts`, `reputation.test.ts`, `review-aggregates.test.ts`, `review-eligibility.test.ts`, `review-fraud.test.ts`, `review-helpful.test.ts`, `review-reply.test.ts`, `review-reports.test.ts`, `review-reputation-corrections.test.ts`, `safety-reputation.test.ts`, `safety.test.ts`, `security-regression.test.ts`, `validation.test.ts`).
- **Playwright E2E Test Suite**: 9 spec files in `e2e/` (`admin-journey.spec.ts`, `agent-journey.spec.ts`, `auth-flow.spec.ts`, `booking-flow.spec.ts`, `browser-console.spec.ts`, `homepage.spec.ts`, `host-journey.spec.ts`, `omega-resilience.spec.ts`, `traveler-journey.spec.ts`).

### UI/UX & Responsive Layout Status
- **Design Tokens & Theme**: `app/globals.css` uses Tailwind CSS v4 `@theme inline` with primary colors Maroon (`#6b1026`), Gold (`#c9972a`), and Warm Ivory (`#fdfaf7`), responsive containers (`.container-luxury`), and accessibility defaults (`prefers-reduced-motion`).
- **Loading States**: `loading.tsx` exists in 3 directories (`dashboard/loading.tsx`, `weddings/[slug]/loading.tsx`, `weddings/loading.tsx`). Dedicated loading files are **missing** for sub-dashboards (`dashboard/admin/*`, `dashboard/bookings`, `dashboard/listings`, `dashboard/messages`, `dashboard/events`).
- **Error Boundaries**: `error.tsx` exists in 3 files (`app/error.tsx`, `app/global-error.tsx`, `app/dashboard/error.tsx`).
- **404 Boundary**: `app/not-found.tsx` exists.
- **Grid Layout Responsiveness**: Most pages use Tailwind responsive classes (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`). Exception found: `app/about/AboutContent.tsx` line 148 has `grid-cols-5 gap-2` without mobile breakpoint overrides.

### Documentation & Maps Status
- **Missing Required Docs**:
  - `FINAL_ROUTE_MAP.md`: Missing (needs generation for R7).
  - `ADMIN_OPERATIONS_GUIDE.md`: Missing (needs generation for R7).
  - `USER_FLOWS.md`: Missing (needs generation for R7).
- **Existing Documentation**: `FINAL_PRODUCTION_AUDIT.md`, `ADMIN_GUIDE.md`, `ADMIN_SETUP.md`, `AUTH_GUIDE.md`, `DASHBOARD_GUIDE.md`, `DATABASE.md`, `DEPLOYMENT.md`, `ENVIRONMENT.md`, `GOD_LEVEL_AUDIT.md`, `PORTALS.md`, `RBAC_GUIDE.md`, `SECURITY.md`, `SEO.md`, `WORKFLOW.md`, `walkthrough.md`.

---

## 2. Logic Chain

1. **Financial Security Logic**: `createBookingAction` correctly calculates `serverTotalAmount = wedding.pricePerGuest * data.guestsCount`, eliminating client price tampering. However, because `data.guestsCount` is not checked for `guestsCount >= 1`, an attacker could send a non-positive integer and generate a zero or negative booking total.
2. **Refund Security Logic**: While `processFullRefundAction` guards against non-PAID refunds, `processPartialRefundAction` only verifies that `partialAmount < payment.amount`. Without aggregating existing `Refund` records in the database, multiple sequential partial refunds could exceed 100% of `payment.amount`.
3. **Quality & Anti-Pattern Logic**: `Math.random` has been fully replaced with `crypto` utilities. However, widespread `as any` casting weakens TypeScript type safety around DB models (`coupon`, `searchAnalytics`, `systemConfig`).
4. **Test Infrastructure Logic**: The repository contains comprehensive Jest (22 files) and Playwright (9 files) test suites. Command scripts in `package.json` cover `lint`, `type-check`, `test`, `e2e`, and `build`.
5. **Documentation Gap Logic**: Requirement R7 explicitly requires `FINAL_ROUTE_MAP.md`, `ADMIN_OPERATIONS_GUIDE.md`, and `USER_FLOWS.md`. None of these three specific files currently exist in the project root.

---

## 3. Caveats

- Exploration was conducted strictly via read-only code analysis without executing runtime database mutations or external Stripe/UploadThing network calls.
- Webhook signature validation in `app/api/webhooks/stripe/route.ts` requires a valid `STRIPE_WEBHOOK_SECRET` in live production environments.

---

## 4. Conclusion

The financial calculation engine and webhook infrastructure are structurally sound with server-authoritative pricing and idempotency tracking. However, two financial security flaws require remediation:
1. Validating `guestsCount >= 1` in `createBookingAction`.
2. Summing previous partial refunds before approving new partial refunds in `processPartialRefundAction`.

The codebase is free of `Math.random`, but contains 45+ `as any` type assertions and lacks three key documentation deliverables (`FINAL_ROUTE_MAP.md`, `ADMIN_OPERATIONS_GUIDE.md`, `USER_FLOWS.md`).

---

## 5. Verification Method

To verify these findings:
1. **Type-Check**: Run `npm run type-check` (`tsc --noEmit`).
2. **Linting**: Run `npm run lint` (`eslint`).
3. **Unit Tests**: Run `npm test` (`jest --passWithNoTests`).
4. **E2E Tests**: Run `npx playwright test`.
5. **File Inspection**:
   - Inspect `lib/actions/index.ts` lines 480-575 for `guestsCount` validation.
   - Inspect `lib/actions/stripe.ts` lines 230-268 for partial refund summation.
   - Verify existence of `FINAL_ROUTE_MAP.md`, `ADMIN_OPERATIONS_GUIDE.md`, and `USER_FLOWS.md`.

---

## 6. Feature Inventory Summary

| Category | Feature / Item | File Path | Status / Finding |
|---|---|---|---|
| Financial | Server-Authoritative Booking Pricing | `lib/actions/index.ts` | Authoritative calculation implemented; missing `guestsCount >= 1` input check. |
| Financial | Stripe Checkout & $0 Bypass | `lib/actions/stripe.ts` | Computes amount from DB; handles $0 coupon bypass cleanly. |
| Financial | Webhook Signature & Idempotency | `app/api/webhooks/stripe/route.ts` | Signature verified; uses `StripeWebhookEvent` for idempotency. |
| Financial | Cancellation & Tiered Refund Policy | `lib/services/cancellation-policy.ts` | 4-tier refund policy using integer cents arithmetic. |
| Financial | Ledger & Refund Service | `lib/services/refunds.ts` | Stripe idempotency key used; commission reversal & reputation hooks active. |
| Financial | Partial Refund Guard | `lib/actions/stripe.ts` | Admin restricted; missing cumulative partial refund limit. |
| Financial | Commission Model | `lib/constants/financial-model.ts` | 22% platform commission, 78% host split, tier referral budgets. |
| Quality | `Math.random` Audit | Entire codebase | 0 instances in source code. |
| Quality | `as any` Type Casting Audit | Multiple files | 45+ instances found across server actions, webhooks, and components. |
| Quality | Environment & `localhost` Fallbacks | `lib/env.ts`, `lib/actions/stripe.ts` | Enforces production domain in env; fallback string in stripe action. |
| Testing | Test Scripts Baseline | `package.json` | `lint`, `type-check`, `test`, `e2e`, `build` configured. |
| Testing | Unit Test Suite Baseline | `__tests__/lib/*.test.ts` | 22 Jest test files covering security, safety, reputation, reviews. |
| Testing | E2E Test Suite Baseline | `e2e/*.spec.ts` | 9 Playwright test files covering full user and admin journeys. |
| UI/UX | Responsive CSS Tokens | `app/globals.css` | Tailwind v4 inline theme, maroon/gold brand tokens, accessibility setup. |
| UI/UX | Loading & Error Boundaries | `app/` | `loading.tsx` (3 files), `error.tsx` (3 files), `not-found.tsx` (1 file). |
| Docs | Route Map Document | `FINAL_ROUTE_MAP.md` | Missing — needs generation for R7. |
| Docs | Admin Operations Guide | `ADMIN_OPERATIONS_GUIDE.md` | Missing — needs generation for R7. |
| Docs | User Flows Document | `USER_FLOWS.md` | Missing — needs generation for R7. |
| Docs | Production Audit Document | `FINAL_PRODUCTION_AUDIT.md` | Exists — needs truthful verification evidence update. |
