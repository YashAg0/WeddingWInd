## 2026-08-09T21:08:38Z
You are clerk_e2e_worker (teamwork_preview_worker).
Your working directory is: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\clerk_e2e_worker

TASK OBJECTIVE:
Implement the Clerk authentication E2E test middleware and environment fixes so that `npx playwright test` passes 100% of all 85 test cases across 14 spec files without 500 server crashes.

INPUTS:
- Read `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md` first.
- Read `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\clerk_e2e_explorer\handoff.md` for exact fix instructions.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

SPECIFIC IMPLEMENTATION STEPS:
1. **`proxy.ts` (Middleware Catch Guard)**:
   Wrap `auth.protect()` inside `clerkMiddleware` with a try/catch block. When Clerk throws `secret-key-invalid` (or during test mode `NODE_ENV=test` / `PLAYWRIGHT_TEST=true` / mock keys), if the request is protected or admin:
   - For `/api/*` endpoints: Return `NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })`.
   - For page routes (`/dashboard/*`, etc.): Return `NextResponse.redirect(new URL("/login", req.url))` or `/sign-in`.

2. **`lib/auth.ts` (`getSession()` Guard)**:
   In `lib/auth.ts`, wrap `auth()` in `getSession()` in a try/catch block, returning `null` on exception so unauthenticated state is handled safely without throwing HTTP 500 errors.

3. **`.env.test` & `playwright.config.ts`**:
   - Create `.env.test` in project root with `NODE_ENV=test`, `PLAYWRIGHT_TEST=true`, and test environment variables.
   - Update `playwright.config.ts` `webServer.env` block to set `NODE_ENV: "test"`, `PLAYWRIGHT_TEST: "true"`, and mock keys.

4. **Execute & Verify Commands**:
   - Run `npx tsc --noEmit` (`npm run type-check`).
   - Run `npx eslint` (`npm run lint`).
   - Run `npx jest --passWithNoTests` (`npm test -- --no-coverage`).
   - Run `npx playwright test` (`cmd /c "npx playwright test"`). Confirm 100% PASS (85/85 tests passed, 0 failures).

5. **Sync Documentation**:
   - Update `TEST_READY.md` and `FINAL_PRODUCTION_AUDIT.md` with exact empirical logs confirming 100% pass for `npx playwright test`.

DELIVERABLES:
Write your detailed handoff report to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\clerk_e2e_worker\handoff.md` with terminal logs and verification proof. Notify parent when complete.
