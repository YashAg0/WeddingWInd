## 2026-08-10T16:25:00Z
Investigate requirements R5 (Booking/Stripe, KYC, Messaging), R6 (UI & Hydration Consistency), and R7 (Security & Data Integrity):
1. Financial Integrity & Booking:
   - Audit `lib/stripe.ts`, API routes (`app/api/stripe/*`, `app/api/bookings/*`), Server Actions, and checkout flows.
   - Verify server-authoritative price calculation (reject client-provided prices/totals).
   - Check Stripe webhook signature verification, idempotency handling, duplicate event safety, and booking status updates.
2. Security, KYC & Messaging:
   - Audit KYC/document upload gating: verify that unrequested document uploads are strictly blocked at UI, Server Actions, UploadThing, and DB levels.
   - Audit messaging & PII moderation: check contact info filtering (phone, email, WhatsApp, homoglyphs, spaces, obfuscation).
3. UI & Hydration Consistency:
   - Audit Admin portal and all dashboards for visual consistency with homepage brand colors, typography, spacing, and hierarchy.
   - Audit codebase for SSR hydration errors (e.g. `Date.now()`, `Math.random()`, `window` checks, local time vs server time mismatch).
   - List all files where hydration errors occur and check for bad fixes like `suppressHydrationWarning`.
