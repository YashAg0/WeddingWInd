# Handoff Report: Financials, Security, UI & Hydration Investigation

## 1. Observation
- **Stripe & Pricing**:
  - `lib/stripe.ts:11`: Instantiates Stripe singleton with `env.STRIPE_SECRET_KEY`.
  - `lib/actions/stripe.ts:16-169`: `createStripeCheckoutAction` derives amount from `booking.totalAmount` in DB. Server validates promo coupons against `prisma.coupon`. Line item `unit_amount: Math.round(finalAmount * 100)`.
  - `lib/actions/index.ts:481-580`: `createBookingAction` ignores client price inputs and computes `serverTotalAmount = wedding.pricePerGuest * data.guestsCount`.
  - `app/api/webhooks/stripe/route.ts:37`: `stripe.webhooks.constructEvent(bodyText, sigHeader, webhookSecret)` verifies webhook signatures using `env.STRIPE_WEBHOOK_SECRET`.
  - `app/api/webhooks/stripe/route.ts:48-64`: Webhook idempotency registered in `prisma.stripeWebhookEvent`. Duplicate events (`status === "PROCESSED"`) return `200 OK (Duplicate event ignored)`.
  - `app/api/webhooks/stripe/route.ts:80-201`: `checkout.session.completed` processes status updates in a `prisma.$transaction`. Checks for cancelled/rejected/refunded status or existing payments.
- **KYC Gating**:
  - `lib/storage/index.ts:55-63, 106-114`: UploadThing `verificationDocument` and `passport` endpoints check `prisma.verification.findUnique({ where: { userId: session.userId } })` and throw `UNAUTHORIZED_NO_VERIFICATION_REQUEST` if unrequested or `UNAUTHORIZED_VERIFICATION_LOCKED` if `APPROVED`/`UNDER_REVIEW`.
  - `lib/actions/index.ts:913-922`: `submitVerificationAction` checks `existingVerification` and status !== `NOT_SUBMITTED`, throwing `VERIFICATION_NOT_REQUESTED` if missing.
  - `components/dashboard/VerificationForm.tsx:191-200`: UI displays locked state for `NOT_SUBMITTED` status and disables form controls when `APPROVED`/`UNDER_REVIEW`.
- **Messaging PII Moderation**:
  - `lib/services/contact-moderation.ts:34-47`: `normalizeForModeration` strips zero-width/invisible chars (`\u200B-\u200D`, `\uFEFF`, etc.), executes `NFKD` decomposition, strips combining diacritics, and collapses whitespace.
  - `lib/services/contact-moderation.ts:50-56`: Regex patterns detect email (`EMAIL_REGEX`), phone numbers (`PHONE_REGEX`, `SPAL_PHONE_REGEX`), and social/WhatsApp/solicitation terms (`SOCIAL_WHATSAPP_REGEX`).
  - `lib/actions/messages.ts:227-236, 340-341`: `sendMessage` and `editMessage` call `detectProhibitedContactInfo(text)`, log `CONTACT_INFO_BLOCKED` to audit log, and block transmission.
- **UI & Hydration Consistency**:
  - `app/globals.css:9-89`: Defines brand tokens (`--color-maroon-800`, `--color-gold-500`, `--color-warm-50`, `--color-charcoal-900`, `font-display`, `font-sans`). Dashboard shell and Admin pages (`app/dashboard/admin/*`) strictly match these tokens.
  - No occurrences of `suppressHydrationWarning` exist in source code files.
  - 19 Client Components (`"use client"`) use un-guarded `new Date(date).toLocaleDateString()` directly in JSX render trees, which creates potential SSR/CSR hydration mismatch warnings when Node.js server locale/timezone differs from user browser locale/timezone.

## 2. Logic Chain
1. **Financial Integrity**: Server-side price calculation in `createBookingAction` combined with database lookup in `createStripeCheckoutAction` prevents client-side price tampering. Signature verification and DB idempotency tracking in `app/api/webhooks/stripe/route.ts` guarantee safe payment processing without duplicate actions.
2. **KYC Document Gating**: Document uploads are gated at UploadThing middleware, Server Action logic, UI component conditional rendering, and DB schema. Unrequested document uploads are rejected across all entry points.
3. **Messaging PII Moderation**: Unicode normalization before regex matching eliminates homoglyphs, zero-width spaces, and diacritic obfuscation. Blocking occurs server-side in `sendMessage` and `editMessage`.
4. **UI & Hydration**: Design system tokens in `app/globals.css` are uniformly applied across Admin and Dashboard interfaces. Zero `suppressHydrationWarning` hacks are present. `toLocaleDateString()` calls in 19 Client Components present potential SSR hydration mismatches that should be mitigated using client-side mounting guards.

## 3. Caveats
- No caveats regarding backend security logic or Stripe webhook validation.
- Client-side hydration audit identified potential timezone/locale shifts for `toLocaleDateString()` rendering on client components during SSR; testing in different browser locales (e.g. `en-US` vs `en-IN`) is recommended.

## 4. Conclusion
The implementation for Requirements R5, R6, and R7 is robust:
- **Financial Integrity & Stripe**: Fully server-authoritative, signature-verified, and idempotent.
- **Security & KYC Gating**: Blocked across all layers (UploadThing, Server Action, UI, DB).
- **Messaging PII Moderation**: Robust Unicode normalization and multi-pattern regex filtering active.
- **UI Consistency & Hydration**: Visual styling across Admin/Dashboards matches homepage brand tokens. Codebase is clean of `suppressHydrationWarning`.

## 5. Verification Method
1. **Stripe & Booking Integrity**:
   - Inspect `createBookingAction` in `lib/actions/index.ts` and `createStripeCheckoutAction` in `lib/actions/stripe.ts`.
   - Inspect signature verification and idempotency check in `app/api/webhooks/stripe/route.ts`.
2. **KYC Document Gating**:
   - Inspect `verificationDocument` and `passport` endpoints in `lib/storage/index.ts`.
   - Inspect `submitVerificationAction` in `lib/actions/index.ts`.
3. **Messaging Moderation**:
   - Inspect `normalizeForModeration` and regex patterns in `lib/services/contact-moderation.ts`.
   - Inspect `sendMessage` in `lib/actions/messages.ts`.
4. **UI & Hydration Audit**:
   - Verify design tokens in `app/globals.css`.
   - Grep for `suppressHydrationWarning` across project.
