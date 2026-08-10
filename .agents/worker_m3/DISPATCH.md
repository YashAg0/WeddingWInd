# DISPATCH — worker_m3

## Task Objective
Implement Milestone M3: Founder Admin Bootstrap (R5), Admin Routing Protection & Auth Redirects (R6), and Admin Controls Verification Lifecycle (R7).

## Scope & Instructions
1. **R5: Founder Admin Bootstrap & Sync Verification**:
   - Audit `lib/auth.ts:syncAndGetDbUser()`: verify that when `founder@weddingwithindia.com` signs in via Clerk, pending admin records (`clerkUserId.startsWith("pending_admin")`) link their `clerkUserId` to the authenticated Clerk User ID while retaining `role: ADMIN` and `status: ACTIVE`.
   - Ensure founder user cleanly reaches `/dashboard/admin` upon post-login redirect.
   - Verify self-role elevation attempts to ADMIN in user actions (`lib/actions/index.ts`) remain blocked.

2. **R6: Admin Routing & Auth Redirect Protection**:
   - Audit all `/dashboard/admin/*` subroutes and `/api/admin/*` endpoints to ensure server-authoritative protection (`auth()`, DB check, `isAdmin()`, `requireRole([UserRole.ADMIN])`).
   - Audit the entire codebase for dead `/sign-in` path references; ensure all auth redirect paths explicitly use canonical `/login`.
   - Audit open redirect protection: ensure `sanitizeRedirectUrl` is applied across all redirect handlers to strictly permit internal relative paths starting with `/` (excluding `//` and `://`).

3. **R7: Admin Controls & 4-Level Verification Upload Gate**:
   - Verify the admin-controlled verification flow: Admin requests verification -> User uploads -> User submits -> Admin reviews & approves/rejects.
   - Audit 4-level defense-in-depth blocking for unrequested KYC uploads:
     1. UI: `components/dashboard/VerificationForm.tsx` locks upload UI when status is `NOT_SUBMITTED`.
     2. Server Action: `lib/actions/index.ts:submitVerificationAction` throws `VERIFICATION_NOT_REQUESTED` if unrequested.
     3. UploadThing Storage: `lib/storage/index.ts` middleware throws `UNAUTHORIZED_NO_VERIFICATION_REQUEST` if unrequested or `UNAUTHORIZED_VERIFICATION_LOCKED` if approved.
     4. DB: `Verification.userId` is `@unique` and user action uses `.update` (not `.upsert`), rejecting uninitiated rows.

4. **Unit Tests & Verification**:
   - Create unit test suite `__tests__/lib/m3-admin-verification.test.ts` testing founder admin bootstrap sync, open redirect sanitization, admin route protection, and 4-tier verification upload blocking.
   - Run `npm run type-check`.
   - Run `npm run lint`.
   - Run `npm test -- --no-coverage`.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverable
Write your implementation summary and verification command output to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m3\handoff.md` and notify parent.
