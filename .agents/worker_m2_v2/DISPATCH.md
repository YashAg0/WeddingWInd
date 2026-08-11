## 2026-08-10T16:55:27Z
You are a Worker subagent assigned to implement Milestone M2: Database & Transaction Integrity (Requirement R4).

Working Directory: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m2_v2
Original Request File: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md
Scope Document: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\PROJECT.md
Explorer Technical Analysis: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_auth_db_v2\analysis.md
Explorer Handoff Report: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_auth_db_v2\handoff.md

Your Task:
Refactor transaction atomicity in `app/api/webhooks/stripe/route.ts` and `lib/actions/index.ts`:
1. **Stripe Webhook Handler (`app/api/webhooks/stripe/route.ts`)**:
   - Locate `sendInvoiceEmail` call inside `prisma.$transaction`.
   - Refactor to execute `prisma.$transaction` strictly for DB state updates (updating booking status, logging webhook event).
   - Capture required parameters during transaction, commit transaction, then execute `await sendInvoiceEmail(...)` outside `$transaction`.
2. **Refund Booking Action (`lib/actions/index.ts`)**:
   - Locate `stripe.refunds.create(...)` call inside `prisma.$transaction` in `refundBookingAction`.
   - Refactor to execute `stripe.refunds.create(...)` outside `$transaction`.
   - Perform the Stripe API refund call first, then update DB status atomically via `prisma.$transaction`.
3. **Verification**:
   - Run `npm run type-check`, `npm run lint`, and `npm test`.
   - Document verification commands and exact results in your handoff report.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Output Requirements:
- Write implementation changes to `app/api/webhooks/stripe/route.ts` and `lib/actions/index.ts`.
- Write detailed handoff report to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m2_v2\handoff.md`.
- Update `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m2_v2\progress.md`.
- Send completion message to parent via `send_message` with summary and artifact links.
