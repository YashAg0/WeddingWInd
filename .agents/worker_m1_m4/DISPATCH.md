## 2026-08-09T14:24:45Z
<USER_REQUEST>
You are worker_m1_m4 (teamwork_preview_worker).
Your working directory is: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m1_m4

TASK OBJECTIVE:
Implement security hardening and financial integrity fixes for Milestones M1 (Admin Access) and M4 (Financial Integrity).

INPUTS:
- Read `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md` first.
- Read `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\PROJECT.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

SPECIFIC IMPLEMENTATION REQUIREMENTS:
1. **Milestone M1 (Admin Security Hardening)**:
   - In `lib/actions/founder.ts:9`, replace `const db = prisma as any;` with clean, type-safe Prisma client operations.
   - Inspect `lib/actions/admin.ts`, `lib/actions/admin-dashboards.ts`, `lib/actions/founder.ts`, and `lib/actions/safety.ts` to ensure `await requireRole([UserRole.ADMIN]);` is called at entry for all admin mutation functions.

2. **Milestone M4 (Financial Integrity Hardening)**:
   - In `lib/actions/index.ts` (`createBookingAction`), add strict input validation: verify `data.guestsCount` is a valid positive integer (`typeof data.guestsCount === "number" && Number.isInteger(data.guestsCount) && data.guestsCount >= 1`). If invalid, throw `new Error("INVALID_GUEST_COUNT: Guest count must be a positive integer greater than or equal to 1.")`.
   - In `lib/actions/stripe.ts` (`processPartialRefundAction`), query all existing successful/pending `Refund` records for the `payment.id`. Calculate `totalAlreadyRefunded = existingRefunds.reduce((sum, r) => sum + r.amount, 0)`. Verify `(totalAlreadyRefunded + partialAmount) <= payment.amount`. If exceeded, throw `new Error("EXCEEDS_PAYMENT_AMOUNT: Cumulative partial refunds exceed total payment amount.")`.

VERIFICATION:
- Run `npm run type-check` (`npx tsc --noEmit`).
- Run `npm run lint` (`npx eslint`).
- Run `npm test -- --no-coverage` (`npx jest --passWithNoTests`).

DELIVERABLES:
Write your detailed handoff report to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m1_m4\handoff.md` including terminal commands executed, outputs, files changed, and verification proof. Notify parent when finished.
</USER_REQUEST>
