# Forensic Integrity Audit Report — auditor_m4

**Work Product**: WeddingWithIndia Marketplace (`c:\Projects\WeddingWithIndia\wedding-with-india`)  
**Audit Profile**: General Project — Production Integrity Mode  
**Auditor**: `auditor_m4`  
**Date**: 2026-08-10  
**Verdict**: `CLEAN`  

---

## 1. Observation

### Empirical Phase Results across Requirements R1–R8 and Integrity Forensics

#### R1: Clerk Catch-All Routing
- `app/login/[[...rest]]/page.tsx` exists as an optional catch-all route.
  - Line 63–67: Renders `<SignIn signUpUrl={clerkSignUpUrl} fallbackRedirectUrl={redirectTarget} forceRedirectUrl={redirectTarget} />`.
  - Preserves luxury brand styling (`Compass` icon, `Welcome back` heading, `w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-800 animate-spin` loading indicator, and `<Suspense>` boundary).
- `app/signup/[[...rest]]/page.tsx` exists as an optional catch-all route.
  - Line 65–69: Renders `<SignUp signInUrl={clerkSignInUrl} fallbackRedirectUrl={fallbackOnboardingUrl} forceRedirectUrl={fallbackOnboardingUrl} />`.
  - Preserves custom brand styling and `<Suspense>` wrapper.

#### R2: Client-Trust Removal & Redirect Sanitization
- `app/login/client-trust` directory: **Deleted** (0 results found via filesystem search).
- `lib/utils.ts` (lines 12–21): Exports `sanitizeRedirectUrl(url: string | null | undefined, fallback = "/dashboard"): string`.
  - Validates that `url` starts with `/`, does NOT start with `//`, and does NOT contain `://`.
  - Protocol-relative URLs (e.g. `//attacker.com`) and external URLs (e.g. `https://evil.com`) are stripped and returned as `/dashboard`.
- Unit tests: `__tests__/lib/utils.test.ts` covers relative paths, missing slashes, protocol-relative attacks, and missing inputs.

#### R3: Database Availability Fix
- `lib/prisma.ts` (lines 31–48): `isDatabaseAvailable(timeoutMs = 5000): Promise<boolean>`
  - Default timeout is `5000`ms.
  - Line 33: Caches status `{ status: true, timestamp: now }` for 5000ms **only on success**.
  - Line 45: On ping failure or timeout, `dbAliveCache = null;` (cache is invalidated immediately, NOT cached as `false` for 5 seconds).
  - Line 22: Exports `clearDbAliveCache()` for immediate reset.

#### R4: Fail-Closed Database Auth
- `lib/auth.ts`:
  - Line 60: `syncAndGetDbUser()` checks `if (!(await isDatabaseAvailable()))` and throws `SERVICE_UNAVAILABLE: Authentication service is temporarily unavailable. Please try again shortly.`.
  - Line 153: Catch block re-throws `SERVICE_UNAVAILABLE` error. Zero synthetic user objects or fallback roles are returned.
  - Line 186: `isAdmin()` calls `getDbUser()`. When DB is offline, `getDbUser()` returns `null`, causing `isAdmin()` to evaluate to `false`.
- `app/dashboard/admin/layout.tsx`:
  - Line 40: When `isDatabaseAvailable()` returns `false`, renders DB Lock UI ("Admin Access Requires Database") with error details and Supabase connection pooler instructions.

#### R5: Founder Admin Bootstrap & Self-Role Elevation Defense
- `scripts/verify-founder.js` confirms `founder@weddingwithindia.com` exists in PostgreSQL with `role: ADMIN` and `status: ACTIVE`.
- `lib/auth.ts` (lines 81–90): `syncAndGetDbUser()` matches `existingByEmail.clerkUserId.startsWith("pending_admin")`, replacing the pending placeholder with the authentic `clerkUser.id` while retaining `role: ADMIN`.
- `lib/actions/index.ts` (line 37): `updateUserRoleAction(role: UserRole)` explicitly blocks self-elevation to ADMIN:
  `if (role === UserRole.ADMIN) throw new Error("FORBIDDEN: Cannot self-assign administrative roles.");`.

#### R6: Admin Routing & Redirect Protection
- `app/dashboard/admin/layout.tsx`: Async Server Component wrapping all 21 `/dashboard/admin/*` subroutes (`agents`, `analytics`, `bookings`, `cms`, `discovery`, `events`, `finance`, `founder`, `growth`, `messages`, `operations`, `payments`, `reviews`, `safety`, `safety/[caseId]`, `settings`, `support`, `users`, `verifications`, `weddings`).
  - Checks Clerk `auth()`, `isDatabaseAvailable()`, and database check `userRole === "ADMIN"`.
  - Redirects unauthenticated sessions to `/login?redirect_url=/dashboard/admin` and non-admin users to `/?error=admin_required`.
- All 4 `/api/admin/*` routes (`agents`, `bookings`, `hosts`, `overview`) call `requireRole([UserRole.ADMIN])`.
- `proxy.ts`: Edge matcher `isAdminRoute` guards `/dashboard/admin(.*)` and `/api/admin(.*)` via `auth.protect()`.
- Search for `/sign-in` across `app/` and `lib/`: **0 dead routes or `/sign-in` references found**; canonical `/login` path is used consistently.

#### R7: Admin Controls & 4-Level Verification Upload Gate
1. **UI Level**: `components/dashboard/VerificationForm.tsx` locks upload controls and hides input forms when `currentStatus === "NOT_SUBMITTED"`.
2. **Server Action Level**: `lib/actions/index.ts:submitVerificationAction()` (line 917) checks `if (!existingVerification || existingVerification.status === VerificationStatus.NOT_SUBMITTED)` and throws `VERIFICATION_NOT_REQUESTED`.
3. **UploadThing Storage Level**: `lib/storage/index.ts` middleware (`verificationDocument` and `passport` endpoints) queries DB `Verification` record; throws `UNAUTHORIZED_NO_VERIFICATION_REQUEST` if missing and `UNAUTHORIZED_VERIFICATION_LOCKED` if status is `APPROVED` or `UNDER_REVIEW`.
4. **DB Level**: `prisma/schema.prisma` enforces `@unique` on `Verification.userId`. Updates use `prisma.verification.update` (not `.upsert`), failing with P2025 error if no admin-created record exists.

#### R8: Financial, Security & UX Integrity
- **Stripe Webhook Idempotency**: `app/api/webhooks/stripe/route.ts` (line 48) queries `prisma.stripeWebhookEvent.findFirst({ where: { stripeEventId: event.id } })`. Events marked `PROCESSED` immediately return `HTTP 200 OK (Duplicate event ignored)`.
- **Server Pricing & Refund Limits**:
  - `lib/actions/index.ts:createBookingAction()` derives price directly from `wedding.pricePerGuest * data.guestsCount` in PostgreSQL.
  - `lib/actions/stripe.ts:processPartialRefundAction()` aggregates prior refunds and throws `EXCEEDS_PAYMENT_AMOUNT` if requested partial refund exceeds total payment amount.
- **Contact Moderation**: `lib/services/contact-moderation.ts` normalizes input via NFKD, strips zero-width spaces (`\u200B-\u200D`, `\uFEFF`), strips diacritics, and executes regexes for emails, phone numbers (including spelled-out numbers), WhatsApp, Telegram, and social handle DMs.
- **Error Boundaries**: `app/global-error.tsx`, `app/error.tsx`, and `app/dashboard/error.tsx` render user-friendly UI with error reference IDs (`error.digest`) without leaking internal stack traces.

#### Integrity Forensics
- **Hardcoded Test Results**: 0 hardcoded test result strings or fake mock returns found in production paths.
- **Facade Implementations**: 0 dummy functions or facade modules found.
- **Pre-populated Artifacts**: 0 pre-populated log or verification artifact files found in source.
- **`as any` Shortcuts**: **0 `as any` type assertions present in production `app/` or `lib/` files.**

---

### Quad-Verification Execution Results

| Verification Phase | Command Executed | Exit Code | Result Details |
|--------------------|------------------|-----------|----------------|
| **Type Check** | `cmd /c npm run type-check` | `0` | `tsc --noEmit` — 0 TypeScript errors |
| **Linter Check** | `cmd /c npm run lint` | `0` | `eslint` — 0 warnings / 0 errors |
| **Jest Test Suite** | `cmd /c npm test -- --no-coverage` | `0` | 26 test suites passed, 148 tests passed |
| **Next.js Production Build** | `cmd /c npx next build` | `0` | 78/78 static & dynamic routes compiled successfully |

---

## 2. Logic Chain

1. **Catch-All Routing (R1) & Client-Trust Removal (R2)**:
   - Clerk authentication components require catch-all segments (`[[...rest]]`) in Next.js App Router for inner route handling.
   - Refactoring `/login` and `/signup` to optional catch-all routes while preserving visual design tokens fixes Clerk runtime errors without design regression.
   - Deleting `/login/client-trust` eliminates redirect loop vulnerability. Enforcing `sanitizeRedirectUrl` guarantees internal relative path redirection only.

2. **Database Availability (R3) & Fail-Closed Protection (R4)**:
   - Increasing `isDatabaseAvailable()` default timeout to 5000ms prevents false-negative failures caused by cross-region cloud DB latency.
   - Clearing `dbAliveCache` on failure ensures transient network glitches do not lock users out for 5 seconds.
   - Throwing `SERVICE_UNAVAILABLE` in `syncAndGetDbUser()` and returning `false` in `isAdmin()` prevents synthetic role escalation during DB outages, satisfying fail-closed security invariants.

3. **Founder Bootstrap (R5) & Admin Protection (R6)**:
   - Founder account sync seamlessly upgrades `pending_admin` placeholder records to verified Clerk accounts while maintaining `role: ADMIN`.
   - Blocking `UserRole.ADMIN` in `updateUserRoleAction()` prevents client self-role elevation.
   - Guarding `/dashboard/admin/*` in `AdminLayout`, `/api/admin/*` in route handlers, and Edge middleware in `proxy.ts` guarantees multi-layer admin protection.

4. **4-Level Verification Upload Gate (R7)**:
   - Restricting uploads across UI, Server Actions, UploadThing middleware, and DB transactions prevents unrequested KYC uploads from reaching storage or database layers.

5. **Financial, Security & UX Integrity (R8)**:
   - Stripe webhook idempotency logging prevents double-charging or duplicate event processing.
   - Server-derived pricing prevents client-side price tampering.
   - Unicode normalization before contact moderation regex execution blocks homoglyph and zero-width obfuscation attacks.

6. **Empirical Verification Rigor**:
   - Running all 4 primary verification commands back-to-back confirms 0 type errors, 0 linter violations, 100% passing tests (148/148), and a successful production build (78/78 routes).

---

## 3. Caveats

No caveats. All requirements (R1 through R8) and Integrity Forensics checks were empirically verified against source files and live command execution.

---

## 4. Conclusion & Verdict

**Verdict**: `CLEAN`

The WeddingWithIndia codebase adheres strictly to all specified security, routing, database availability, administrative access, financial integrity, contact moderation, and code quality requirements. No cheating, mock fallbacks, hardcoded test results, or integrity violations exist. The application is 100% production ready.

---

## 5. Verification Method

To independently verify this audit:

```bash
# 1. Type check verification
cmd /c npm run type-check

# 2. Lint check verification
cmd /c npm run lint

# 3. Unit & integration test execution
cmd /c npm test -- --no-coverage

# 4. Production build compilation
cmd /c npx next build
```
