# DISPATCH — worker_m4

## Task Objective
Implement Milestone M4: Financial/UX Integrity Hardening (R8), Quad-Verification Run, and Final Documentation Update.

## Scope & Instructions
1. **R8: Financial, Security, & UX Integrity Audit & Hardening**:
   - Verify Stripe webhook idempotency (`app/api/webhooks/stripe/route.ts` & `StripeWebhookEvent` DB table).
   - Verify server-authoritative pricing in checkout (`createBookingAction` & `createStripeCheckoutAction` using DB values).
   - Verify contact moderation filters (`lib/services/contact-moderation.ts`) stripping zero-width spaces, NFKD diacritics, and blocking email/phone/WhatsApp leakage.
   - Verify error boundary leak prevention (`app/global-error.tsx`, `app/error.tsx`, `app/dashboard/error.tsx`).
   - Verify responsive layout boundaries (320px to 1920px).

2. **Documentation Verification & Update**:
   - Verify `FINAL_ROUTE_MAP.md`, `ADMIN_OPERATIONS_GUIDE.md`, `USER_FLOWS.md`, and update `FINAL_PRODUCTION_AUDIT.md` with truthful evidence of all 8 requirements (R1–R8) and all verification commands.

3. **Quad-Verification Execution**:
   - Run `npm run type-check` (Must pass with Exit Code 0).
   - Run `npm run lint` (Must pass with Exit Code 0).
   - Run `npm test -- --no-coverage` (Must pass all 26+ test suites / 148+ tests with Exit Code 0).
   - Run `npm run build` (Must succeed with Exit Code 0).

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverable
Write your implementation report and full command outputs to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m4\handoff.md` and notify parent.

## 2026-08-10T03:46:54Z
Worker worker_m4 starting execution of Milestone M4: R8 Security, Financial, & UX Integrity Hardening, Quad-Verification Execution, and Final Documentation Update.

