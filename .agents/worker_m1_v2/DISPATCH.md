## 2026-08-10T16:37:09Z
You are a Worker subagent assigned to implement Milestone M1: Identity & Auth Hardening (Requirement R3).

Working Directory: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m1_v2
Original Request File: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md
Scope Document: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\PROJECT.md
Explorer Technical Analysis: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_auth_db_v2\analysis.md
Explorer Handoff Report: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_auth_db_v2\handoff.md

Your Task:
Implement the complete specification for `syncAndGetDbUser()` in `lib/auth.ts`:
1. **Email Normalization**:
   - Normalize email via `clerkUser.email.toLowerCase().trim()` before querying or storing.
2. **Identity & Reconciliation Logic**:
   - Look up `existingByClerkId = await tx.user.findUnique({ where: { clerkUserId: clerkUser.id } })`.
   - Look up `existingByEmail = await tx.user.findUnique({ where: { email } })`.
   - If both `existingByEmail` and `existingByClerkId` exist and refer to different records:
     - Update `existingByEmail` with `clerkUserId: clerkUser.id`, `name`, `avatar`. (Do NOT mutate `role` or `status` — preserving founder canonical row).
     - Clear `clerkUserId` from `existingByClerkId` if needed or log/resolve gracefully so `clerkUserId` remains unique.
   - Else if `existingByEmail` exists:
     - Update `existingByEmail` with `clerkUserId: clerkUser.id`, `name`, `avatar`. (Do NOT mutate `role` or `status`).
   - Else if `existingByClerkId` exists:
     - Update `existingByClerkId` with `email`, `name`, `avatar`.
   - Else:
     - Wrap `tx.user.create()` in a try/catch for Prisma `P2002` error. If a `P2002` error occurs (e.g. concurrent signup race), fetch and return `await tx.user.findUnique({ where: { email } })`.
3. **Verification**:
   - Run `npm run type-check`, `npm run lint`, and `npm test -- --no-coverage` (especially auth test suites).
   - Document verification commands and exact results in your handoff report.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Output Requirements:
- Write implementation changes to `lib/auth.ts`.
- Write detailed report to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m1_v2\handoff.md`.
- Update `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m1_v2\progress.md`.
- Send completion message to parent via `send_message` with summary and artifact links.
