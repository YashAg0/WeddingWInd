## 2026-08-10T17:11:16Z

<USER_REQUEST>
You are a Worker subagent assigned to implement Milestone M3: Wedding Lifecycle & Listing Creation Repair (Requirement R5).

Working Directory: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m3_v2
Original Request File: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md
Scope Document: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\PROJECT.md
Explorer Technical Analysis: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_wedding_dashboards_v2\analysis.md
Explorer Handoff Report: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_wedding_dashboards_v2\handoff.md

Your Task:
1. **Fix "Document Type Error" in Listing & Verification Schemas (`lib/validation/index.ts`)**:
   - Inspect `verificationSchema`, wedding document schemas, and listing creation schemas in `lib/validation/index.ts`.
   - Update URL fields so that empty string inputs (`""`) are preprocessed or transformed to `null` / `undefined` before URL validation runs, eliminating Zod "Invalid url" errors on optional/unselected document uploads.
2. **Fix Dashboard Listing Edit URL Parameter Bug (`app/dashboard/listings/page.tsx`)**:
   - Inspect edit button links on line 377 of `app/dashboard/listings/page.tsx`.
   - Update edit links to direct to `/dashboard/listings?action=edit&id=...` (or preserve query strings when navigating/redirecting from `/dashboard/celebrations`), ensuring the edit modal/form opens with the correct listing ID.
3. **Verify Lifecycle State & Rejection Workflow**:
   - Verify that `createWedding` / `editWedding` / `submitVerificationAction` / `approveVerificationAction` / `rejectVerificationAction` in `lib/actions/index.ts` correctly manage lifecycle state transitions: `DRAFT` -> `SUBMITTED` -> `Admin Review` -> `APPROVED` / `REJECTED` -> `PUBLISHED`.
   - Verify rejection notes persistence in `Verification.notes`, rejection notification/email dispatch, and host re-upload resubmission flow (`PENDING`).
4. **Testing & Verification**:
   - Run `npm run type-check`, `npm run lint`, and `npm test`.
   - Write targeted unit/integration tests in `__tests__/lib/wedding-lifecycle.test.ts` for empty string Zod URL transformation and lifecycle state transitions.
   - Document verification commands and exact results in your handoff report.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Output Requirements:
- Write implementation changes to `lib/validation/index.ts`, `app/dashboard/listings/page.tsx`, and relevant actions/tests.
- Write detailed handoff report to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m3_v2\handoff.md`.
- Update `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m3_v2\progress.md`.
- Send completion message to parent via `send_message` with summary and artifact links.
</USER_REQUEST>
