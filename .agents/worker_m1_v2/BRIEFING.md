# BRIEFING — 2026-08-10T16:48:30Z

## Mission
Implement complete specification for `syncAndGetDbUser()` in `lib/auth.ts` for Milestone M1 (Identity & Auth Hardening / Requirement R3).

## 🔒 My Identity
- Archetype: implementer/qa/specialist
- Roles: implementer, qa, specialist
- Working directory: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m1_v2
- Original parent: aab74dd5-dc0b-4693-b07d-07bb9ebb7e15
- Milestone: M1

## 🔒 Key Constraints
- Email normalization: `clerkUser.email.toLowerCase().trim()` before querying or storing.
- Identity & reconciliation logic for `syncAndGetDbUser`:
  - Handle `existingByClerkId` and `existingByEmail` cases properly.
  - If both exist and refer to different records: update `existingByEmail` with `clerkUserId: clerkUser.id`, `name`, `avatar`, and clear `clerkUserId` from `existingByClerkId` so `clerkUserId` remains unique. Preserve role and status on `existingByEmail`.
  - Else if `existingByEmail`: update with `clerkUserId`, `name`, `avatar`. Do NOT mutate `role` or `status`.
  - Else if `existingByClerkId`: update with `email`, `name`, `avatar`.
  - Else: create user in try/catch for Prisma `P2002` error. Fallback to `findUnique({ where: { email } })`.
- Run type-check, lint, and test suites.

## Current Parent
- Conversation ID: aab74dd5-dc0b-4693-b07d-07bb9ebb7e15
- Updated: 2026-08-10T16:48:30Z

## Task Summary
- **What to build**: Full reconciliation logic in `syncAndGetDbUser()` in `lib/auth.ts`.
- **Success criteria**: All identity reconciliation cases handled, email normalized, type-check, lint, and auth tests passing.
- **Interface contracts**: PROJECT.md & explorer analysis
- **Code layout**: lib/auth.ts, __tests__/lib/auth-reconciliation.test.ts

## Change Tracker
- **Files modified**:
  - `lib/auth.ts`: Implemented email normalization, identity reconciliation state machine, unlinking stale `clerkUserId`, P2002 race recovery, and safe optional chaining on `createdAt`/`updatedAt`.
  - `__tests__/lib/auth-reconciliation.test.ts`: Created new behavioral unit test suite (5 tests).
- **Build status**: PASS (`tsc --noEmit` exit 0)
- **Pending issues**: None

## Quality Status
- **Build/test result**: PASS (3 test suites passed, 27/27 tests passed)
- **Lint status**: PASS (0 errors, clean)
- **Tests added/modified**: Added `__tests__/lib/auth-reconciliation.test.ts` (5 tests)

## Loaded Skills
- None

## Key Decisions Made
- Unlink stale `clerkUserId` from `existingByClerkId` by setting `clerkUserId: unlinked_${existingByClerkId.id}_${Date.now()}` when `existingByClerkId` and `existingByEmail` point to different DB records, satisfying the PostgreSQL `@unique` key requirement before updating `existingByEmail`.
- Protect canonical founder row by excluding `role` and `status` from `update` payloads during reconciliation.
- Added optional chaining `dbUser?.createdAt?.getTime() === dbUser?.updatedAt?.getTime()` for robust handling when date fields are missing or mocked.

## Artifact Index
- c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m1_v2\DISPATCH.md — Dispatch instructions
- c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m1_v2\BRIEFING.md — Persistent briefing state
- c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m1_v2\progress.md — Progress tracker
- c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m1_v2\handoff.md — Final handoff report
