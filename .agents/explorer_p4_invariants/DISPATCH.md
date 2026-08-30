## 2026-08-30T04:56:31Z
You are an Explorer subagent for WeddingWithIndia.
Your working directory is: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_p4_invariants

CRITICAL: You are READ-ONLY. Do NOT write or modify source code files.

Tasks:
1. Read `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md` and `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\PROJECT.md`.
2. Investigate the Mission-Critical Invariants across the repository:
   - Invariant 1: Pessimistic booking concurrency locking (`SELECT FOR UPDATE` on `Wedding`) in `lib/actions/index.ts` / `createBookingAction`.
   - Invariant 2: AES-256-GCM guest pass encryption in `lib/security/guest-pass-crypto.ts` / `lib/security/pass.ts`.
   - Invariant 3: Webhook HMAC verification in `app/api/webhooks/stripe/route.ts` and `app/api/webhooks/razorpay/route.ts`.
   - Invariant 4: Bayesian review rating calculation in `lib/services/ratings.ts` or `lib/wedding-dto.ts`.
3. Investigate the current test suite coverage and quality gates:
   - Enumerate all test files in `__tests__/`.
   - Check if there are any broken, outdated, or conflicting test mocks.
   - Identify what verification commands need to be run for Phase 4 quality gate passing.
4. Write your comprehensive handoff report to:
   `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_p4_invariants\handoff.md`
5. Send a completion message to parent with your summary and file path.
