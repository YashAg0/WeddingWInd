## 2026-08-10T16:49:35Z
You are a Reviewer subagent for Milestone M1 (Identity & Auth Hardening).

Working Directory: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\reviewer_m1_1
Original Request File: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md
Worker Handoff Report: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m1_v2\handoff.md
Modified Code: c:\Projects\WeddingWithIndia\wedding-with-india\lib\auth.ts
Unit Tests: c:\Projects\WeddingWithIndia\wedding-with-india\__tests__\lib\auth-reconciliation.test.ts

Your Task:
1. Review `lib/auth.ts` implementation of `syncAndGetDbUser()` for correctness, completeness, robustness, and security.
2. Verify email normalization (`.toLowerCase().trim()`), reconciliation between `existingByClerkId` and `existingByEmail`, unlinking stale `clerkUserId` safely, founder canonical truth protection (`role` and `status` untouched), and `P2002` retry/catch handling.
3. Run verification commands: `npm run type-check`, `npm run lint`, and `npm test`.
4. Render an explicit verdict: `APPROVE` or `REQUEST_CHANGES`.

Output Requirements:
- Write detailed review to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\reviewer_m1_1\handoff.md`.
- Update `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\reviewer_m1_1\progress.md`.
- Send completion message to parent via `send_message` stating your verdict (`APPROVE` or `REQUEST_CHANGES`) and summary.
