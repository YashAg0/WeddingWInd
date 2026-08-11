# Comprehensive Technical Analysis: Financials, Security, UI & Hydration Workstream

**Target System**: WeddingWithIndia  
**Workstream**: Financial Integrity, Security & KYC Gating, PII Moderation, UI Consistency & SSR Hydration  
**Auditor**: Explorer Agent (`explorer_financial_ux_v2`)  
**Date**: August 10, 2026  

---

## 1. Financial Integrity & Booking System Audit

### 1.1 Stripe Client Configuration (`lib/stripe.ts`)
- **Key Validation**: Instantiates `Stripe` singleton via `env.STRIPE_SECRET_KEY`, validated at application startup by `lib/env.ts`. Missing secret keys in production throw immediate startup exceptions rather than falling back to mock or test keys.
- **API Version**: Synchronized with `2026-06-24.dahlia`.
- **Expiry Config**: Configurable via `PAYMENT_EXPIRY_MINUTES` (defaults to 30 minutes).

### 1.2 Server-Authoritative Price Calculation
- **Booking Creation (`createBookingAction` in `lib/actions/index.ts`)**:
  - `guestsCount` validated as positive integer (`>= 1`).
  - **Price Injection Prevention**: Client inputs `pricePerGuest` and `totalAmount` are strictly ignored.
  - Price per guest (`serverPricePerGuest`) is fetched directly from the database record `wedding.pricePerGuest`.
  - Authoritative total is calculated on the server: `serverTotalAmount = serverPricePerGuest * data.guestsCount`.
- **Checkout Session Creation (`createStripeCheckoutAction` in `lib/actions/stripe.ts`)**:
  - Loads booking from DB via `bookingId` and verifies traveler ownership or admin role.
  - Initial amount is fetched from `booking.totalAmount` in DB.
  - Server validates promo coupon codes against `prisma.coupon` (checking `active`, `discountPercent`, `discountAmount`, `maxDiscount`).
  - Line items `unit_amount` sent to Stripe API: `Math.round(finalAmount * 100)`.
  - **$0 Discount Bypass**: If `finalAmount <= 0`, creates payment record, PaymentIntent (`succeeded`), updates booking status to `PAID`, issues encrypted `GuestPass`, sends invoice email, and returns redirect URL without calling Stripe APIs.

### 1.3 Webhook Signature Verification, Idempotency & Booking Updates (`app/api/webhooks/stripe/route.ts`)
- **Signature Verification**: Verifies raw request body (`req.text()`) and `stripe-signature` header via `stripe.webhooks.constructEvent(bodyText, sigHeader, webhookSecret)`. Returns HTTP `400` on invalid signature, HTTP `500` if `STRIPE_WEBHOOK_SECRET` is missing.
- **Event Idempotency**:
  - Tracked in `prisma.stripeWebhookEvent`.
  - Skips processing and returns `200 OK (Duplicate event ignored)` if event ID is already marked as `PROCESSED`.
  - Records new events as `RECEIVED`, updates to `PROCESSED` on success, or `FAILED` on exception.
- **Booking Lifecycle & Duplicate Safety**:
  - Handled inside `prisma.$transaction`.
  - Guards against cancelled/rejected/refunded bookings.
  - Skips if booking is already `PAID` or has paid payment records.
  - Creates `Payment`, `PaymentIntent`, `Transaction` ledger entry, updates booking to `PAID`, generates encrypted `GuestPass` QR token, initializes `TravelerPreparation`, dispatches host/traveler notifications, sends invoice email, and calculates agent commission via `generateBookingCommissionAction`.
- **Refund Webhook Handler (`lib/services/refunds.ts`)**:
  - Uses DB idempotency key `REFUND:${cancellationRequestId}:${payment.id}` when creating refunds with Stripe.
  - Webhook handler `handleStripeRefundSucceeded` updates `Refund` to `SUCCESS`, `Payment` to `REFUNDED`, `Booking` to `REFUNDED`, records ledger transaction, reverses agent commissions, logs reputation penalties, and sends email.

---

## 2. Security, KYC Gating & Messaging Moderation

### 2.1 KYC & Document Upload Gating
The codebase enforces multi-layered gating to ensure users cannot upload unrequested KYC documents:
1. **UploadThing Level (`lib/storage/index.ts`)**:
   - `verificationDocument` and `passport` file router endpoints execute custom middleware checking `prisma.verification.findUnique({ where: { userId: session.userId } })`.
   - Throws `UNAUTHORIZED_NO_VERIFICATION_REQUEST` if no verification record exists.
   - Throws `UNAUTHORIZED_VERIFICATION_LOCKED` if verification status is `APPROVED` or `UNDER_REVIEW`.
2. **Server Action Level (`submitVerificationAction` in `lib/actions/index.ts`)**:
   - Verifies `existingVerification` in DB.
   - Throws `VERIFICATION_NOT_REQUESTED` if record is missing or status is `NOT_SUBMITTED`.
3. **UI Level (`components/dashboard/VerificationForm.tsx`)**:
   - Displays locked message when status is `NOT_SUBMITTED`: *"You must wait for an Admin to request your verification documents. Once requested, you will be able to upload your ID and credentials here."*
   - Disables upload controls when status is `APPROVED` or `UNDER_REVIEW`.
4. **Database Level (`prisma/schema.prisma`)**:
   - `Verification` table links to `User` and enforces explicit status enum (`NOT_SUBMITTED`, `PENDING`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `NEED_MORE_DOCUMENTS`).

### 2.2 Messaging & PII Moderation
- **Contact Moderation Engine (`lib/services/contact-moderation.ts`)**:
  - `normalizeForModeration(text)` prevents obfuscation bypasses by:
    1. Removing zero-width/invisible characters (`U+200B` - `U+200D`, `U+FEFF`, `U+00AD`, etc.).
    2. Applying `NFKD` decomposition to normalize Unicode homoglyphs and compatibility characters.
    3. Stripping combining diacritic marks (`U+0300` - `U+036F`).
    4. Collapsing whitespace variants (non-breaking spaces, em-spaces) to single spaces.
  - **Pattern Matching**:
    - `EMAIL_REGEX`: Detects standard email formats and obfuscation (`name [at] domain [dot] com`, `name (at) domain (dot) com`, `name AT domain DOT com`).
    - `PHONE_REGEX` & `SPAL_PHONE_REGEX`: Detects standard phone numbers and spelled-out digits (e.g. `zero nine eight seven`).
    - `SOCIAL_WHATSAPP_REGEX`: Detects social/messaging platforms (`wa.me`, `whatsapp`, `wsp`, `t.me`, `telegram`, `insta`, `instagram`, `facebook`, `twitter`, `x.com`, `linkedin`, `snapchat`, `tiktok`, `discord`) and contact solicitation phrases (`dm me`, `call me`, `my number is`).
- **Server Action Enforcement (`lib/actions/messages.ts`)**:
  - `sendMessage` and `editMessage` evaluate non-admin inputs with `detectProhibitedContactInfo(text)`.
  - If prohibited content is detected, writes an audit log (`CONTACT_INFO_BLOCKED`) and throws a user-facing error blocking message delivery.

---

## 3. UI & Hydration Consistency

### 3.1 Brand Colors, Typography, Spacing & Hierarchy
- **Design Tokens (`app/globals.css`)**:
  - **Primary**: Royal Maroon (`--color-maroon-800`: `#6b1026`, `--color-brand-primary`).
  - **Secondary**: Luxury Gold (`--color-gold-500`: `#c9972a`).
  - **Background**: Warm Ivory (`--color-warm-50`: `#fdfaf7`, `bg-warm-50`).
  - **Text**: Dark Charcoal (`--color-charcoal-900`: `#1a1a1a`).
  - **Typography**: Playfair Display (`font-display`) for headings, Inter (`font-sans`) for body text.
- **Admin Portal & Dashboards Audit**:
  - `DashboardShell.tsx`, `Sidebar.tsx`, `DashboardHeader.tsx`, and Admin pages (`app/dashboard/admin/*`) consistently utilize the design tokens (`bg-warm-50`, `font-display`, `text-charcoal-900`, `bg-maroon-800`, `rounded-2xl`/`rounded-3xl`, `shadow-sm`/`shadow-luxury`).
  - No color scheme mismatches or unstyled generic components were found in dashboard layouts.

### 3.2 SSR Hydration Error Audit
- **`suppressHydrationWarning`**: Audit confirms **zero occurrences** of `suppressHydrationWarning` in source files.
- **Hydration Risk Areas Identified**:
  - Un-guarded client-side date formatting (`new Date(date).toLocaleDateString()`) in Client Components (`"use client"`) can cause SSR hydration mismatch errors if the server environment (Node.js UTC) outputs a different locale/timezone representation than the browser client.
  - **Files with direct `toLocaleDateString()` in `"use client"` components**:
    1. `app/dashboard/admin/agents/ClientAdminAgentsList.tsx` (Line 222)
    2. `app/dashboard/admin/events/ClientAdminEvents.tsx` (Line 93)
    3. `app/dashboard/admin/reviews/ClientAdminReviews.tsx` (Line 163)
    4. `app/dashboard/admin/cms/page.tsx` (Line 413)
    5. `app/dashboard/admin/discovery/page.tsx` (Line 212)
    6. `app/dashboard/admin/growth/page.tsx` (Line 74)
    7. `app/dashboard/admin/messages/page.tsx` (Line 166)
    8. `app/dashboard/admin/support/page.tsx` (Line 74)
    9. `app/dashboard/admin/weddings/page.tsx` (Line 361)
    10. `components/wedding/StickyBookingCard.tsx` (Line 152)
    11. `components/wedding/WeddingCard.tsx` (Line 164)
    12. `components/wedding/WeddingDetailReviews.tsx` (Lines 279, 348)
    13. `app/account/page.tsx` (Line 116)
    14. `app/dashboard/earnings/page.tsx` (Lines 131, 209)
    15. `app/dashboard/events/page.tsx` (Line 75)
    16. `app/dashboard/leads/page.tsx` (Lines 119, 122)
    17. `app/dashboard/listings/page.tsx` (Line 340)
    18. `app/dashboard/page.tsx` (Line 472)
    19. `app/dashboard/safety/page.tsx` (Line 77)

- **Deterministic Resolution Recommendation**:
  - Wrap date formatting rendering in a client-side mounting guard (e.g. `const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), []);`) or format dates with explicit ISO strings on initial render to guarantee identical SSR and CSR output.
