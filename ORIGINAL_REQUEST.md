# Original User Request

## Initial Request — 2026-08-09T14:15:54Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Final end-to-end production completion, security hardening, UX polish, and release management for the WeddingWithIndia marketplace.

Working directory: c:\Projects\WeddingWithIndia\wedding-with-india
Integrity mode: production

## Requirements

### R1. Admin Access & Control Center
Ensure `founder@weddingwithindia.com` is safely authorized as Admin. Every mutation in the Admin portal (Users, Bookings, Verifications, Content, etc.) must be server-authorized. 

### R2. Verification Lifecycle & Storage Security
Implement and enforce the Admin-controlled verification flow: Basic Info → Admin Requests Verification → User Uploads → Admin Approves. Unrequested uploads must be blocked at UI, Server Action, UploadThing, and DB levels. Prevent arbitrary KYC uploads and ensure private document access.

### R3. User & Host Lifecycles
Enforce strict lifecycle states for Travelers, Hosts, and Agents. Users cannot skip states (Signup → Profile → Verification → Approval → Feature access). Clients must never control authoritative states (e.g., publishing a wedding without Admin approval).

### R4. Financial Integrity
Ensure server-authoritative calculations for price, tax, fee, commission, and total. Protect against price injection, duplicate webhooks, double refunds/payouts, and cancelled booking payments.

### R5. Privacy & Contact Moderation
Apply role-based data minimization. Ensure no unnecessary exposure of PII or private safety info. All messaging must use robust contact moderation (preventing phone/email/WhatsApp leakage via homoglyphs, spaces, etc.).

### R6. Visual/UX Quality & Responsive QA
Polish the UI/UX to a world-class standard preserving the established design language. Fix broken grids, typography, spacing, contrast, empty/loading states, and ensure responsiveness from 320px to 1920px. 

### R7. Documentation (Maps & Guides)
Generate `FINAL_ROUTE_MAP.md`, `ADMIN_OPERATIONS_GUIDE.md`, and `USER_FLOWS.md` extracting actual routes and flows from the codebase. Document safe Admin access instructions.

## Acceptance Criteria

### Security & Integrity
- [ ] No unauthorized access to Admin routes, actions, or APIs.
- [ ] UploadThing blocks uploads for users without a pending verification request.
- [ ] Financial paths (checkout, webhooks, refunds) strictly reject client-provided totals and negative values.
- [ ] No PII (email/phone) is exposed in public or cross-role API responses unless strictly required.
- [ ] Messaging strictly filters contact information attempts.

### Quality & Performance
- [ ] UI is fully responsive (320px - 1920px) without overflow or clipping.
- [ ] Appropriate empty, loading, and error states exist for all major pages.
- [ ] No fake reviews, metrics, or trust signals exist; all structured data uses actual DB values.
- [ ] Codebase is free of `Math.random`, `as any`, `localhost` fallbacks, and unauthorized test users in production paths.

### Verification
- [ ] `npm run type-check` and `npm run lint` pass.
- [ ] `npm test -- --no-coverage` passes all Jest tests.
- [ ] `npm run build` succeeds.
- [ ] `npx playwright test` passes the E2E suite.
- [ ] "Stranger Test" confirms malicious actor scenarios fail safely.

### Documentation
- [ ] `FINAL_ROUTE_MAP.md` is complete and accurate.
- [ ] `ADMIN_OPERATIONS_GUIDE.md` is complete and accurate.
- [ ] `USER_FLOWS.md` is complete and accurate.
- [ ] `FINAL_PRODUCTION_AUDIT.md` is updated with truthful evidence of verification.

## Follow-up — 2026-08-10T03:38:55Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

God-level authentication, database availability, and admin access repair for the WeddingWithIndia repository to ensure a bulletproof, race-condition-free, and server-authoritative authentication flow.

Working directory: c:\Projects\WeddingWithIndia\wedding-with-india
Integrity mode: production

## Requirements

### R1. Fix Clerk Routing Correctly
The current implementation of `/login` throws a Clerk runtime error because it is not a catch-all route. You must implement the proper architecture (e.g., `app/login/[[...rest]]/page.tsx` and `app/signup/[[...rest]]/page.tsx`) as required by the installed Clerk version, while preserving the custom login UI and existing visual design.

### R2. Remove the Bad Client-Trust Architecture
Audit `app/login/client-trust/page.tsx`. If a catch-all route correctly handles post-login synchronization, remove the `client-trust` route. Implement a server-authoritative user synchronization → role resolution → destination authorization → redirect flow without creating redirect loops or authenticating already authenticated users.

### R3. Fix Database Availability 
Diagnose and fix the `SERVICE_UNAVAILABLE` error originating from `lib/auth.ts:isDatabaseAvailable()`. Identify the root cause (e.g. incorrect `DATABASE_URL`, connection pooling, schema mismatch, Prisma timeout). Do not silently create fake users, do not bypass PostgreSQL, and do not disable database checks.

### R4. Enforce Fail-Closed Database Auth
If the database is genuinely unavailable, the system must fail-closed. Authenticated Clerk users must not receive synthetic roles or permissions. Provide a graceful, professional service-unavailable UI experience instead of exposing runtime exception overlays or stack traces.

### R5. Founder Admin Bootstrap
Ensure the founder bootstrap logic (`founder@weddingwithindia.com`) is secure and deterministic. The founder must be authenticated via Clerk, synchronized with the DB, receive the ADMIN role, and cleanly reach `/dashboard/admin`. Do not allow self-role elevation or arbitrary users to become ADMIN.

### R6. Admin Routing & Auth Redirects
Ensure every admin route (e.g., `/dashboard/admin/*`) is server-authoritatively protected. Fix bad redirect logic across the app (e.g., replace non-existent `/sign-in` redirects with the canonical `/login` route). Prevent open redirect vulnerabilities by strictly allowing internal relative paths.

### R7. Admin Controls & Verification Lifecycle
Ensure the Admin portal remains the operational control center. Maintain the secure verification lifecycle: users can only upload documents after an Admin requests them. Unrequested KYC uploads must be blocked at the UI, Server Action, UploadThing, and DB levels.

### R8. Security, Financial, & UX Integrity
Maintain Stripe webhook idempotency, server-authoritative price calculations, and robust contact moderation (PII minimization). Ensure UX is polished with appropriate loading/empty/error states. Perform a responsive audit to ensure functionality across 320px to 1920px breakpoints. Error boundaries must not leak sensitive internals.

## Verification Resources
- Project's existing TypeScript configuration and linter.
- Project's existing Jest tests (`npm test -- --no-coverage`).
- The canonical production build pipeline (`npm run build`).

## Acceptance Criteria

### Security & Routing
- [ ] `/login` and `/signup` no longer throw Clerk catch-all configuration errors.
- [ ] `/login/client-trust` is either correctly refactored into the catch-all flow or cleanly removed.
- [ ] No authentication redirect loops exist, and no `/sign-in` dead routes remain where `/login` is intended.
- [ ] Open redirects are blocked (only internal paths permitted).

### Database & Auth Synchronization
- [ ] The database availability issue is correctly diagnosed and fixed.
- [ ] Database synchronization succeeds when DB is available, and gracefully fails closed (no fake users/permissions) when unavailable.
- [ ] Founder account (`founder@weddingwithindia.com`) securely resolves to ADMIN and reaches `/dashboard/admin`.
- [ ] Non-admins and unauthenticated users cannot access `/dashboard/admin`.

### Functional Integrity
- [ ] Verification uploads are strictly admin-controlled (unrequested KYC uploads blocked server-side).
- [ ] Financial calculations remain server-authoritative and Stripe webhooks remain idempotent.
- [ ] Contact moderation remains hardened and PII is protected.
- [ ] No production synthetic users or `localhost` fallbacks exist in production paths.
- [ ] Error pages are user-friendly, and mobile layouts remain fully functional.

### Quality Assurance
- [ ] `npm run type-check` passes cleanly.
- [ ] `npm run lint` passes without critical errors.
- [ ] `npm test -- --no-coverage` passes all suites.
- [ ] `npm run build` succeeds, proving production readiness.

## Follow-up — 2026-08-10T16:22:35Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Make the existing WeddingWithIndia application genuinely work end-to-end as a coherent production marketplace, recovering it autonomously through rigorous testing, root-cause fixes, and comprehensive verifications.

Working directory: c:\Projects\WeddingWithIndia\wedding-with-india
Integrity mode: development

## Requirements

### R1. Independent & Coherent Execution
Work autonomously in "Goal Mode." Break the mission into logical workstreams. Parallelize independent investigations but respect dependencies. Maintain a single source of truth for findings. Re-evaluate the entire system after major fixes. Keep security and data integrity as hard constraints.

### R2. Strict Environment & Tooling Constraints
Do not repeatedly run `npm run dev` or leave multiple Next.js servers running to verify if code compiles. Rely on `npm run type-check`, `npm run lint`, `npm test`, and `npm run build` for code-level verification. Use exactly one dev server for actual browser/runtime testing. Never blindly trust previous "production ready" claims.

### R3. Identity & Authentication Hardening
The recent bug involved `P2002` on `email` inside `syncAndGetDbUser()`. The founder's DB row is the canonical truth. Identify users securely: check Clerk ID, fallback to verified email to reconcile Clerk ID, create only if neither exists. Never duplicate founders, downgrade `ADMIN`/`ACTIVE`, or trust client-provided identities.

### R4. Database & Transaction Integrity
Audit `lib/prisma.ts`, `lib/auth.ts`, schema, and API routes. Ensure a strict Prisma singleton, appropriate connection/transaction timeouts, and no `Promise.race` timeouts that cause leaks. Maintain atomicity in transactions without executing global or external calls within them.

### R5. Complete End-to-End Application Repair
Fix all critical blockers and workflows, including:
- **Admin Portal**: Ensure all routes (`users`, `weddings`, `verifications`, `bookings`, `finance`, etc.) render with real data and functional controls.
- **Wedding Lifecycle**: Fix the known "document type error" blocking listing creation. Trace the end-to-end flow from UI to database. Implement approval/rejection workflows.
- **Dashboards**: Ensure Host, Traveler, Agent, Coordinator, and Admin dashboards fetch real backend state and function appropriately.
- **Booking & Stripe**: Secure server-authoritative pricing, checkout, webhooks, and idempotency.
- **Other Systems**: Ensure KYC/document uploads, messaging (with PII filtering), safety, reviews, and agent referrals work exactly as intended.

### R6. UI, Design & Hydration Consistency
Ensure the Admin portal and all dashboards match the homepage's brand colors, typography, spacing, and visual hierarchy. Audit for hydration mismatches (like `Date.now()`, `window` on SSR) and fix them deterministically without using `suppressHydrationWarning`.

### R7. Performance, Data, & Security Integrity
Do not reset the database. Resolve real data corruption safely. Maintain server-authoritative RBAC, Stripe signatures, safe file uploads, and PII moderation. Optimize performance only where justified without sacrificing correctness. 

### R8. Verification & Behavioral Testing
Maintain or add targeted tests for Identity reconciliation, RBAC, Wedding creation/validation, Booking security, and other critical paths. Validate via code-level checks first. Finally, perform real runtime verification (e.g., login → Admin → manage weddings → public listing) on a clean, single Next.js server instance.

## Acceptance Criteria

### AUTH
- [ ] Founder login works
- [ ] Clerk identity works
- [ ] Verified email reconciliation works
- [ ] No P2002
- [ ] No duplicate founder
- [ ] ADMIN preserved
- [ ] DB failure fails closed
- [ ] No Guest User fallback
- [ ] No synthetic identity
- [ ] No client-trust route

### ADMIN
- [ ] Admin dashboard loads
- [ ] Admin gets real data
- [ ] Users work
- [ ] Weddings work
- [ ] Verification works
- [ ] Bookings work
- [ ] Finance works
- [ ] Payments work
- [ ] Reviews work
- [ ] Safety works
- [ ] Messages work
- [ ] Agents work
- [ ] Events work
- [ ] Operations work
- [ ] Support/CMS/settings work where implemented

### WEDDINGS
- [ ] Host can create
- [ ] Draft saves
- [ ] Documents work
- [ ] Media uploads work
- [ ] No document type error
- [ ] Submission works
- [ ] Admin sees submission
- [ ] Admin can approve
- [ ] Admin can reject
- [ ] Rejection reason persists
- [ ] Host sees rejection
- [ ] Host can resubmit
- [ ] Approved wedding becomes public
- [ ] Rejected wedding stays private
- [ ] Wedding detail works

### DASHBOARDS
- [ ] Host dashboard works
- [ ] Traveler dashboard works
- [ ] Agent dashboard works
- [ ] Coordinator dashboard works
- [ ] Admin dashboard works

### BOOKING
- [ ] Discovery works
- [ ] Availability works
- [ ] Pricing server-authoritative
- [ ] Booking works
- [ ] Payment works
- [ ] Webhook works
- [ ] Confirmation works
- [ ] Cancellation/refund works where implemented

### SECURITY
- [ ] Server RBAC
- [ ] Ownership checks
- [ ] Private documents protected
- [ ] PII moderation
- [ ] Stripe signature verification
- [ ] Idempotency
- [ ] Open redirect protection
- [ ] No mock production users
- [ ] No synthetic fallback

### UI
- [ ] Homepage works
- [ ] No hydration errors
- [ ] Admin visually matches homepage
- [ ] Host dashboard matches brand
- [ ] Traveler dashboard matches brand
- [ ] Agent dashboard matches brand
- [ ] Coordinator dashboard matches brand
- [ ] Responsive
- [ ] No broken layouts
- [ ] No dead buttons
- [ ] No fake success states

### QUALITY
- [ ] Type-check
- [ ] Lint
- [ ] Tests
- [ ] Build
- [ ] Runtime/browser verification

### REPORTING
- [ ] A final evidence-based report detailing bugs found, root causes, files/database changes, and all major fixes with specific verification evidence.


