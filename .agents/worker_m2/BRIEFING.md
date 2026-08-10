# BRIEFING — 2026-08-10T04:10:00Z

## Mission
Implement Milestone M2: R3 (Diagnose & Fix Database Availability in `lib/prisma.ts`) & R4 (Enforce Fail-Closed Database Auth).

## 🔒 My Identity
- Archetype: implementer, qa, specialist
- Roles: implementer, qa, specialist
- Working directory: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m2
- Original parent: a7f70242-e8a7-4783-aef8-bb812bf35c7c
- Milestone: M2

## 🔒 Key Constraints
- Default timeoutMs in `isDatabaseAvailable()` must be 5000ms.
- On `status: true`, cache for 5000ms. On `status: false`, DO NOT cache `false` for 5 seconds (clear `dbAliveCache` or do not store `false`).
- Audit callers in `app/dashboard/admin/layout.tsx`, `app/api/readiness/route.ts`, and `instrumentation.ts` to ensure default/appropriate timeouts are used.
- Ensure `syncAndGetDbUser()` in `lib/auth.ts` throws `SERVICE_UNAVAILABLE` when DB is genuinely offline.
- Verify `isAdmin()` returns `false` when DB is offline.
- Verify `AdminLayout` renders the DB lock screen when DB is offline.
- Ensure zero synthetic fallback roles/permissions are granted.
- Create unit test suite `__tests__/lib/auth-db-availability.test.ts`.
- Run type-check, lint, and test.

## Current Parent
- Conversation ID: a7f70242-e8a7-4783-aef8-bb812bf35c7c
- Updated: 2026-08-10T04:10:00Z

## Task Summary
- **What to build**: Fix DB ping timeout & caching logic in `lib/prisma.ts`, audit callers, verify fail-closed auth in `lib/auth.ts` and `app/dashboard/admin/layout.tsx`, create unit test suite `__tests__/lib/auth-db-availability.test.ts`.
- **Success criteria**: All requirements pass, type-check, lint, and Jest unit tests pass cleanly without errors or cheats.

## Change Tracker
- **Files modified**:
  - `lib/prisma.ts`: Updated `isDatabaseAvailable()` default `timeoutMs` to 5000, updated caching to only cache `status: true` for 5s and set `dbAliveCache = null` on failure, exported `clearDbAliveCache()`.
  - `app/dashboard/admin/layout.tsx`: Removed explicit 500ms override in call to `isDatabaseAvailable()`.
  - `app/api/readiness/route.ts`: Removed explicit 500ms override in call to `isDatabaseAvailable()`.
  - `instrumentation.ts`: Removed explicit 2000ms override in call to `isDatabaseAvailable()`.
  - `__tests__/lib/auth-db-availability.test.ts`: Created new unit test suite testing timeout, success caching, failure non-caching, fail-closed auth error throwing, `isAdmin()` DB offline handling, and source invariants.
- **Build status**: `type-check` PASS, `lint` PASS, `test` PASS (25 suites, 138 tests)
- **Pending issues**: None

## Quality Status
- **Build/test result**: PASS (25 suites, 138 tests)
- **Lint status**: PASS (0 violations)
- **Tests added/modified**: `__tests__/lib/auth-db-availability.test.ts` (13 test cases added)

## Loaded Skills
- None
