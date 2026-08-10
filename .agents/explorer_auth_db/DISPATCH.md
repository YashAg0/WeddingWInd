# DISPATCH — explorer_auth_db

## Task Objective
Investigate Clerk authentication routing, database availability, and fail-closed auth architecture for WeddingWithIndia.

## Requirements Scope
- R1: Fix Clerk Routing Correctly. Examine `app/login`, `app/signup`, catch-all requirement `[[...rest]]/page.tsx`, Clerk middleware, and custom UI preservation.
- R2: Audit `app/login/client-trust/page.tsx` and determine how to eliminate client-side role/redirect trust, replacing it with a server-authoritative user sync -> role resolution -> authorization -> redirect flow.
- R3: Diagnose `SERVICE_UNAVAILABLE` in `lib/auth.ts:isDatabaseAvailable()`. Check `DATABASE_URL`, connection pooling, Prisma client initialization, queries, and root cause of database failures.
- R4: Audit fail-closed behavior when DB is genuinely offline. Ensure no synthetic fallback permissions/roles and verify user-facing service unavailable UI.
- R5: Audit Founder Admin Bootstrap logic for `founder@weddingwithindia.com`. Ensure Clerk user sync, DB record, ADMIN role, and access to `/dashboard/admin`.

## Reference File
Read `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md` (latest timestamp).

## Deliverable
Write a detailed investigation report to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_auth_db\analysis.md` and `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_auth_db\handoff.md` and send completion message to orchestrator with summary.
