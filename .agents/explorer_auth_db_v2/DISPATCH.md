## 2026-08-10T16:24:54Z
Investigate requirements R3 (Identity & Auth Hardening) and R4 (Database & Transaction Integrity):
1. Resolve P2002 email error in `syncAndGetDbUser()`:
   - Inspect `lib/auth.ts`, `syncAndGetDbUser()`, user creation, Clerk ID lookup, email lookup logic.
   - Trace how Clerk ID vs verified email reconciliation works when a user already exists in DB vs when a user is new.
   - Verify founder DB row canonical truth protection (never duplicate founders, never downgrade ADMIN/ACTIVE status).
2. Database & Transaction Integrity:
   - Audit `lib/prisma.ts`, `lib/auth.ts`, schema, and API routes.
   - Check strict Prisma singleton pattern across Next.js dev hot-reloading and production.
   - Inspect database connection/transaction timeouts.
   - Identify any `Promise.race` timeouts or async handling that causes unhandled rejections, connection leaks, or background query leaks.
   - Check transaction atomicity: verify that no global state, external HTTP calls, or side effects are executed inside Prisma transactions.
