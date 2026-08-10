# Analysis Report — R8: Security, Financial, & UX Integrity

**Agent**: `explorer_financial_ux`  
**Date**: 2026-08-10  
**Scope**: Stripe Webhook Idempotency & Server-Authoritative Pricing, Messaging Contact Moderation, Error Boundary Leak Prevention, and Responsive QA Audit (320px to 1920px).

---

## Executive Summary
This investigation confirms that WeddingWithIndia maintains a high standard of security, financial integrity, privacy protection, and responsive visual design across all system layers.
1. **Stripe Webhooks & Checkout Pricing**: Fully server-authoritative. Stripe signature verification is enforced, event idempotency is tracked via the `StripeWebhookEvent` PostgreSQL table, booking prices are calculated server-side from DB records (never client-controlled), and partial refunds enforce cumulative limits against total payment.
2. **Contact Moderation & PII Filtering**: Enforced via `lib/services/contact-moderation.ts`. Employs zero-width character stripping, NFKD Unicode decomposition, diacritic mark removal, and whitespace collapsing before evaluating regex patterns for emails, phone numbers, spelled-out numbers, WhatsApp, and social media handles.
3. **Error Boundaries & Leak Prevention**: Handled across `app/global-error.tsx`, `app/error.tsx`, and `app/dashboard/error.tsx`. Sensitive internal details (Prisma error codes, stack traces, database schema specifics) are stripped in production mode, showing only opaque `error.digest` hashes or user-friendly fallback messaging.
4. **Responsive QA Audit**: Evaluated layout components, viewport tags, grids, typography, and container bounds across 320px to 1920px. Navigation transitions smoothly to mobile menus, touch targets meet accessibility standards (>= 44px), and grid layouts scale cleanly from 1 to 4 columns. All 23 Jest test suites (118 tests) pass cleanly.

---

## Detailed Findings

### 1. Stripe Webhook Idempotency & Financial Integrity
- **Webhook Endpoint**: `app/api/webhooks/stripe/route.ts`
  - **Signature Verification**: Validates `stripe-signature` using `stripe.webhooks.constructEvent(bodyText, sigHeader, webhookSecret)`. Rejects invalid or missing headers with `400 Bad Request`.
  - **Event Idempotency**:
    - Queries `prisma.stripeWebhookEvent.findFirst({ where: { stripeEventId: event.id } })`.
    - If `status === "PROCESSED"`, immediately returns `200 OK ("OK (Duplicate event ignored)")`.
    - If unrecorded, inserts `stripeWebhookEvent` with status `"RECEIVED"`.
    - Upon processing completion, updates status to `"PROCESSED"`. On failure, logs context and sets status to `"FAILED"`.
  - **Transactional Processing (`checkout.session.completed`)**:
    - Executes inside `prisma.$transaction`.
    - Rejects payment if booking status is `CANCELLED`, `REJECTED`, or `REFUNDED`.
    - Ignores duplicate payment events if booking is already `PAID` or has paid payments.
    - Creates `Payment`, `PaymentIntent`, and `Transaction` ledger records with amount directly from `booking.totalAmount` (DB authoritative).
    - Generates GuestPass, TravelerPreparation, Notification, and sends invoice email.
- **Server-Authoritative Pricing**:
  - `createBookingAction` (`lib/actions/index.ts:481-580`): Intentionally ignores `pricePerGuest` and `totalAmount` in client payloads. Recalculates total as `wedding.pricePerGuest * data.guestsCount` using DB values. Validates `guestsCount` as positive integer (`INVALID_GUEST_COUNT`).
  - `createStripeCheckoutAction` (`lib/actions/stripe.ts:16-169`): Resolves `booking.totalAmount` from DB. Applies valid server-validated coupons, system platform fee %, and tax %, sending `unit_amount: Math.round(finalAmount * 100)` to Stripe. $0 coupon transactions bypass Stripe API and execute directly in DB.
  - `processPartialRefundAction` (`lib/actions/stripe.ts:230-281`): Enforces `UserRole.ADMIN`, rejects `partialAmount <= 0`, and checks cumulative partial refunds (`totalAlreadyRefunded + partialAmount <= payment.amount`), throwing `EXCEEDS_PAYMENT_AMOUNT` on over-refund attempts. Uses stable idempotency keys `REFUND:{cancellationRequestId}:{paymentId}` for Stripe API calls.

### 2. Messaging Contact Moderation & Anti-Disintermediation
- **Service**: `lib/services/contact-moderation.ts`
- **Unicode Normalization Pipeline (`normalizeForModeration`)**:
  1. Strips zero-width and invisible control characters (`\u200B-\u200D`, `\uFEFF`, `\u00AD`, etc.).
  2. Applies `NFKD` decomposition (expands ligatures like `ﬁ` → `fi`, full-width characters like `ａ` → `a`).
  3. Strips Unicode combining marks/diacritics (`\u0300-\u036F`), reducing characters like `jöhn` → `john`.
  4. Collapses non-breaking spaces (`\u00A0`), em-spaces, and whitespace variants into single ASCII spaces.
- **Detection Rules (`detectProhibitedContactInfo`)**:
  - **Emails**: Matches standard emails and obfuscated formats (`user [at] domain [dot] com`, `user (at) domain (dot) com`, `user AT domain DOT com`).
  - **Phone Numbers**: Matches formatted numbers with country codes (`+91 9876543210`) as well as spelled-out digit sequences (`nine eight seven six five four three two one zero`).
  - **Social Handles / Off-Platform Apps**: Matches `whatsapp`, `wsp`, `wa.me`, `telegram`, `t.me`, `instagram`, `insta`, `facebook`, `fb.com`, `twitter`, `x.com`, `linkedin`, `snapchat`, `tiktok`, `discord`, `dm me`, `message me`, `call me`, `my number is`.
- **Integration**: Enforced in `sendMessage` and `editMessage` in `lib/actions/messages.ts`. Violations trigger audit log entries (`CONTACT_INFO_BLOCKED`) and throw user-facing errors preventing persistence.

### 3. Error Boundary Architecture & Leak Prevention
- **Root Layout Error Boundary** (`app/global-error.tsx`):
  - Catches unhandled errors in root layout.
  - Renders HTML fallback with message: `"Critical Error"`.
  - Shows only Next.js opaque `error.digest` hash (e.g. `Error ID: 123456789`). Exposes zero stack traces or Prisma internals.
- **App-Level Error Boundary** (`app/error.tsx`):
  - Catches unhandled errors in main app pages.
  - Displays brand-styled card: `"A Momentary Interruption"`.
  - Renders `error.message` strictly when `process.env.NODE_ENV === "development"`. In production, error details are suppressed.
- **Dashboard Error Boundary** (`app/dashboard/error.tsx`):
  - Catches errors in dashboard sub-routes without taking down app shell.
  - Displays `"Dashboard Error — Something went wrong loading your dashboard. Your data is safe."` along with opaque `error.digest`.

### 4. Responsive QA Audit (320px to 1920px)
- **Viewport Configuration**: Defined in `app/layout.tsx`: `width: "device-width", initialScale: 1, themeColor: "#6b1026"`.
- **Navigation & Headers**: `components/layout/Navbar.tsx` implements responsive navigation that adapts seamlessly from desktop menu bars down to mobile slide-over drawers with touch-friendly targets (>= 44px height).
- **Grid Layouts & Containers**: Uses Tailwind container utility (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`) and responsive grid utilities (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) to prevent text wrapping distortion or clipping across 320px (iPhone SE), 375px (iPhone 12/13), 768px (iPad portrait), 1024px (iPad landscape / laptop), and 1920px (Desktop / 1080p+ monitors).
- **Horizontal Overflow**: `overflow-x-hidden` and responsive flex wrapping eliminate unwanted horizontal scrollbars on narrow screens.

---

## Verification Evidence
- **Jest Unit Test Suite**: `npm test -- --no-coverage` ran 23 test suites and 118 unit tests with **100% pass rate**.
  - `__tests__/lib/contact-moderation.test.ts`: Passes all zero-width space, NFKD diacritic, spelled-out phone number, and obfuscated email test cases.
  - `__tests__/lib/m1-m4-hardening.test.ts`: Passes guest count validation (`INVALID_GUEST_COUNT`) and partial refund limit enforcement (`EXCEEDS_PAYMENT_AMOUNT`).
  - `__tests__/lib/refund-reputation.test.ts`: Passes refund policy calculation and reputation event triggers.
  - `e2e/financial-integrity.spec.ts`: E2E suite verifies Stripe webhook route protection (missing signature returns 400), non-owned booking protection, and cancellation percentage tiers.
