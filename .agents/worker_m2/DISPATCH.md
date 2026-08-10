# DISPATCH — worker_m2

## Task Objective
Implement Milestone M2: Diagnose & Fix Database Availability (R3) & Enforce Fail-Closed Database Auth (R4).

## Scope & Instructions
1. **R3: Database Availability Fix**:
   - Update `lib/prisma.ts`: Modify `isDatabaseAvailable(timeoutMs = 5000)` to default `timeoutMs` to 5000ms (accounting for Supabase AWS Sydney cloud database latency).
   - Update `isDatabaseAvailable()` caching logic:
     - On **success** (`status: true`), cache `{ status: true, timestamp: now }` for 5000ms.
     - On **failure** (`status: false`), do NOT cache `false` for 5 seconds (or clear cache), allowing immediate retry on subsequent requests so transient latency spikes do not lock out the app for 5-second windows.
   - Audit `app/dashboard/admin/layout.tsx`, `app/api/readiness/route.ts`, and callers passing timeout values to `isDatabaseAvailable()` to ensure they use appropriate timeouts.

2. **R4: Fail-Closed Database Auth Verification**:
   - Verify that `syncAndGetDbUser()` in `lib/auth.ts` throws `SERVICE_UNAVAILABLE` when DB is genuinely offline.
   - Verify `isAdmin()` returns `false` when DB is offline.
   - Verify `AdminLayout` renders the professional service-unavailable DB lock screen when DB is offline.
   - Ensure zero synthetic fallback roles, mock permissions, or fake admin overrides are granted when DB is unavailable.
   - Add/update unit test suite `__tests__/lib/auth-db-availability.test.ts` testing `isDatabaseAvailable()` timeout behavior, success caching vs failure non-caching, and fail-closed auth handling.

3. **Verification**:
   - Run `npm run type-check`.
   - Run `npm run lint`.
   - Run `npm test -- --no-coverage`.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverable
Write your implementation summary and verification command output to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m2\handoff.md` and notify parent.
