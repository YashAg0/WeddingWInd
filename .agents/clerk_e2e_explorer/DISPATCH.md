## 2026-08-09T15:35:00Z
You are clerk_e2e_explorer (teamwork_preview_explorer).
Your working directory is: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\clerk_e2e_explorer

TASK OBJECTIVE:
Investigate why `npx playwright test` fails 41 out of 85 tests with error:
`"Clerk Secret Key is invalid. Make sure that your Clerk Secret Key is correct. Contact support@clerk.com (reason=secret-key-invalid, token-carrier=undefined)."`
when Playwright launches the Next.js dev server or runs against localhost.

INPUTS:
- Read `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md` first.
- Inspect `playwright.config.ts`.
- Inspect `.env`, `.env.test`, `.env.example`, `.env.local` if present.
- Inspect `proxy.ts`, `lib/auth.ts`, `lib/env.ts`, `app/api/` and Clerk middleware configurations.
- Inspect how Clerk authentication environment variables (`CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_ENCRYPTION_KEY`) or mock/testing bypass modes are handled during `NODE_ENV=test` or Playwright E2E execution.

DELIVERABLES:
Write your detailed report to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\clerk_e2e_explorer\handoff.md`. Detail:
1. The exact reason why Clerk throws `Clerk Secret Key is invalid` during Playwright webserver execution.
2. The exact environment variable values or `playwright.config.ts` `webServer.env` / `env` overrides required for E2E testing.
3. The recommended fix strategy for `playwright.config.ts`, `.env.test` or test setup so all 85 Playwright tests pass 100% cleanly.

Do read-only exploration and code inspection. Notify parent when complete.
