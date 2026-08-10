# DISPATCH — auditor_m4

## Task Objective
Perform a comprehensive Forensic Integrity Audit on the WeddingWithIndia codebase after completion of Milestones M1 through M4.

## Audit Scope
1. **R1: Clerk Catch-All Routing**: Verify `app/login/[[...rest]]/page.tsx` and `app/signup/[[...rest]]/page.tsx` catch-all route structures and custom UI preservation.
2. **R2: Client-Trust Removal**: Verify `app/login/client-trust/page.tsx` is deleted and `sanitizeRedirectUrl` in `lib/utils.ts` enforces server-authoritative relative URL redirects.
3. **R3: Database Availability Fix**: Verify `isDatabaseAvailable()` default timeout in `lib/prisma.ts` is 5000ms and failure results are not cached as `false` for 5 seconds.
4. **R4: Fail-Closed Database Auth**: Verify `syncAndGetDbUser()` throws `SERVICE_UNAVAILABLE`, `isAdmin()` returns `false`, and `AdminLayout` renders DB lock UI when DB is offline.
5. **R5: Founder Admin Bootstrap**: Verify `founder@weddingwithindia.com` in DB, Clerk sync logic in `syncAndGetDbUser()`, and self-role elevation block in `updateUserRoleAction()`.
6. **R6: Admin Routing & Protection**: Verify server protection on all 21 `/dashboard/admin/*` subroutes and 4 `/api/admin/*` endpoints, zero dead `/sign-in` paths, open redirect sanitization.
7. **R7: Admin Controls & 4-Level Verification Gate**: Verify 4-tier blocking for unrequested KYC uploads (UI, Server Action, UploadThing, DB).
8. **R8: Financial, Security & UX Integrity**: Verify Stripe webhook idempotency (`StripeWebhookEvent`), server-authoritative pricing, contact moderation (`lib/services/contact-moderation.ts`), error boundary design, and responsive layout boundaries.
9. **Integrity Forensics**: Check for any hardcoded test results, fake mock implementations, dummy fallbacks, `as any` shortcuts, or synthetic permissions.

## Reference File
Read `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md` (latest timestamp).

## Deliverable
Write your forensic audit findings and explicit verdict (`CLEAN` or `INTEGRITY_VIOLATION`) to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\auditor_m4\handoff.md` and notify parent.
