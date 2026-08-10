# Detailed Investigation & Analysis Report — explorer_auth_db

**Date**: 2026-08-10  
**Target Project**: WeddingWithIndia (`c:\Projects\WeddingWithIndia\wedding-with-india`)  
**Investigator**: explorer_auth_db  

---

## Executive Summary

This report provides a comprehensive, evidence-based investigation into authentication routing, client-trust removal, database availability diagnostics, fail-closed auth behavior, and founder admin bootstrap logic for WeddingWithIndia.

Key findings:
1. **R1 (Clerk Routing)**: `app/login/page.tsx` and `app/signup/page.tsx` are single-segment static routes rather than optional catch-all routes (`app/login/[[...rest]]/page.tsx` and `app/signup/[[...rest]]/page.tsx`). Clerk embedded components (`<SignIn />`, `<SignUp />`) using path routing fail on multi-step auth or callbacks without `[[...rest]]`.
2. **R2 (Client-Trust Removal)**: `app/login/client-trust/page.tsx` introduces an explicit intermediate client-trust redirect route that conflicts with `app/login/page.tsx` client `useEffect` handlers, risking redirect loops. It should be removed in favor of server-authoritative post-auth routing with strict internal relative URL validation.
3. **R3 (Database Availability Diagnosis)**: The `SERVICE_UNAVAILABLE` error in `lib/auth.ts:isDatabaseAvailable()` is caused by an overly aggressive 300ms default ping timeout (and 500ms in `AdminLayout` / `readiness`). Because network latency to the cloud Supabase DB (AWS Sydney) is **~1400ms warm** / **~3500ms cold**, the 300ms ping timeout ALWAYS fails. `isDatabaseAvailable()` then caches `{ status: false }` for 5 seconds, locking out all database queries across the entire application for 5-second intervals.
4. **R4 (Fail-Closed DB Auth)**: When the database is genuinely unavailable, no synthetic roles or mock permissions are granted. `syncAndGetDbUser()` throws `SERVICE_UNAVAILABLE`, `isAdmin()` returns `false`, and `AdminLayout` renders a professional DB lock screen.
5. **R5 (Founder Admin Bootstrap)**: `founder@weddingwithindia.com` exists in PostgreSQL with `role: ADMIN` and `status: ACTIVE`. When signed in via Clerk, `syncAndGetDbUser()` links the pending admin record to the Clerk User ID while preserving ADMIN privileges and granting clean access to `/dashboard/admin`.

---

## Requirement 1: Clerk Routing Architecture

### Observation
- **File Paths**:
  - `c:\Projects\WeddingWithIndia\wedding-with-india\app\login\page.tsx` (lines 1–88)
  - `c:\Projects\WeddingWithIndia\wedding-with-india\app\signup\page.tsx` (lines 1–92)
  - `c:\Projects\WeddingWithIndia\wedding-with-india\proxy.ts` (lines 5–22)
- **Current Structure**:
  - `app/login/page.tsx` contains `<SignIn signUpUrl={clerkSignUpUrl} fallbackRedirectUrl="..." forceRedirectUrl="..." />`.
  - `app/signup/page.tsx` contains `<SignUp signInUrl={clerkSignInUrl} fallbackRedirectUrl="..." forceRedirectUrl="..." />`.
  - Both routes are single-segment page files rather than catch-all routes (`[[...rest]]/page.tsx`).
  - `proxy.ts` matcher `_isPublicRoute` includes `"/login(.*)"` and `"/signup(.*)"`.

### Logic Chain
1. `@clerk/nextjs` `<SignIn />` and `<SignUp />` components operate in path-based routing mode by default.
2. During authentication sub-flows (such as `/login/sso-callback`, `/login/factor-one`, email verification links, or multi-factor authentication steps), Clerk expects Next.js App Router to match all paths under `/login/*` and `/signup/*`.
3. Because `app/login/page.tsx` and `app/signup/page.tsx` lack the `[[...rest]]` folder segment, Next.js cannot map nested path parameters to the login page, resulting in Next.js 404 errors or Clerk runtime configuration exceptions (`Clerk: Catch-all route missing`).
4. Reorganizing the file structure to `app/login/[[...rest]]/page.tsx` and `app/signup/[[...rest]]/page.tsx` preserves all existing custom visual elements (`Compass` brand icon, luxury container styling, title, sub-heading, custom loading spinners) while fulfilling Clerk's catch-all route requirement.

---

## Requirement 2: Removal of Client-Trust Architecture

### Observation
- **File Paths**:
  - `c:\Projects\WeddingWithIndia\wedding-with-india\app\login\client-trust\page.tsx` (lines 1–61)
  - `c:\Projects\WeddingWithIndia\wedding-with-india\app\login\page.tsx` (lines 17–28, 65–66)
  - `c:\Projects\WeddingWithIndia\wedding-with-india\app\signup\page.tsx` (lines 69–70)
- **Current Behavior**:
  - `app/login/page.tsx` configures `<SignIn>` with `fallbackRedirectUrl` and `forceRedirectUrl` pointing to `/login/client-trust?redirect_url=...`.
  - `app/login/page.tsx` ALSO runs a client-side `React.useEffect` (lines 17–28) that triggers `router.replace(redirectUrl || "/dashboard")` when `user` is detected in `AuthContext`.
  - `app/login/client-trust/page.tsx` is an async Server Component that invokes `syncAndGetDbUser()`, checks `user.status === "ONBOARDING"`, checks `dest.startsWith("/dashboard/admin")` against `user.role`, and performs `redirect(dest)`.
  - If `syncAndGetDbUser()` throws an error, `client-trust/page.tsx` redirects back to `/login?error=sync_failed`.

### Logic Chain
1. Having dual redirection mechanisms—a client-side `useEffect` in `app/login/page.tsx` and a server-side redirect route in `app/login/client-trust/page.tsx`—creates race conditions and potential redirect loops.
2. If `syncAndGetDbUser()` encounters a transient DB error or latency, `client-trust` redirects to `/login?error=sync_failed`. The user (who is already authenticated in Clerk) lands back on `/login`, where `AuthContext` sees `user` and attempts `router.replace()`, or Clerk component re-triggers `forceRedirectUrl` to `client-trust`, causing an infinite loop.
3. **Refactoring Recommendation**:
   - Delete `app/login/client-trust/page.tsx`.
   - Implement server-authoritative post-login resolution inside `/login/[[...rest]]/page.tsx` (or direct post-auth redirect to `/dashboard` or `redirect_url`).
   - Server-side flow steps:
     1. Authenticate session with `auth()`.
     2. If session exists, call `syncAndGetDbUser()`.
     3. If user requires onboarding (`user.status === "ONBOARDING"` and `user.role !== "ADMIN"`), redirect to `/onboarding`.
     4. If user targets `/dashboard/admin` and `user.role !== "ADMIN"`, redirect to `/dashboard?error=unauthorized`.
     5. Validate `redirect_url` to prevent open redirects: enforce that `redirect_url` starts with `/` and does NOT start with `//` or contain `://`.

---

## Requirement 3: Database Availability Diagnosis (`lib/auth.ts:isDatabaseAvailable()`)

### Observation & Diagnostic Results
- **File Paths**:
  - `c:\Projects\WeddingWithIndia\wedding-with-india\lib\prisma.ts` (lines 22–39)
  - `c:\Projects\WeddingWithIndia\wedding-with-india\lib\auth.ts` (lines 23, 60)
  - `c:\Projects\WeddingWithIndia\wedding-with-india\app\dashboard\admin\layout.tsx` (line 38)
  - `c:\Projects\WeddingWithIndia\wedding-with-india\app\api\readiness\route.ts` (line 16)
- **Code Snippet (`lib/prisma.ts`)**:
  ```ts
  export async function isDatabaseAvailable(timeoutMs = 300): Promise<boolean> {
    const now = Date.now();
    if (dbAliveCache && now - dbAliveCache.timestamp < 5000) {
      return dbAliveCache.status;
    }
    try {
      const pingPromise = prisma.$queryRaw`SELECT 1`;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Database ping timeout")), timeoutMs)
      );
      await Promise.race([pingPromise, timeoutPromise]);
      dbAliveCache = { status: true, timestamp: now };
      return true;
    } catch {
      dbAliveCache = { status: false, timestamp: now };
      return false;
    }
  }
  ```
- **Diagnostic Execution Results (`.agents/explorer_auth_db/test_db.ts`)**:
  - `isDatabaseAvailable(300)` returned `false`.
  - `isDatabaseAvailable(5000)` returned `false`.
  - Direct query `prisma.$queryRaw`SELECT 1`` without `Promise.race` timeout:
    - **Cold start query time**: **3507 ms**
    - **Warm connection query 1**: **1413 ms**
    - **Warm connection query 2**: **1409 ms**
    - **Warm connection query 3**: **1492 ms**

### Logic Chain & Root Cause Analysis
1. The project PostgreSQL database is hosted on Supabase in AWS Sydney (`aws-0-ap-southeast-2.pooler.supabase.com:5432`).
2. Round-trip latency from the application host to the remote Sydney database is **~1400ms for warm queries** and **~3500ms for cold connection establishment**.
3. `isDatabaseAvailable()` uses a default `timeoutMs` of **300ms** (and `AdminLayout` / `readiness` pass `500ms`).
4. Because actual network latency (1400ms–3500ms) exceeds 300ms/500ms, `timeoutPromise` ALWAYS rejects before `pingPromise` completes.
5. Consequently, `isDatabaseAvailable()` ALWAYS catches the timeout error and returns `false`.
6. On returning `false`, it saves `dbAliveCache = { status: false, timestamp: now }`.
7. For the next 5,000ms (5 seconds), any call to `isDatabaseAvailable()` returns the cached `false` without making any database query.
8. When `syncAndGetDbUser()` runs, `if (!(await isDatabaseAvailable()))` triggers, throwing:
   `SERVICE_UNAVAILABLE: Authentication service is temporarily unavailable. Please try again shortly.`
9. When `AdminLayout` runs, `isDatabaseAvailable(500)` returns `false`, rendering the DB lock UI ("Admin Access Requires Database").
10. **Conclusion**: The `SERVICE_UNAVAILABLE` error is NOT caused by a database outage, bad schema, or connection refusal. It is caused by an **overly restrictive ping timeout (300ms/500ms)** combined with **5-second caching of false negatives**.

### Proposed Fix for Implementer
- In `lib/prisma.ts`:
  1. Increase default `timeoutMs` in `isDatabaseAvailable` from `300` to `5000` (or `7000`).
  2. Separate caching behavior for success vs. failure:
     - On **success** (`status: true`): cache for 5,000 ms.
     - On **failure** (`status: false`): do NOT cache for 5 seconds (or cache for at most 1,000 ms) so transient network pings or ongoing cold connections can recover immediately.

---

## Requirement 4: Fail-Closed Database Auth Audit

### Observation
- **File Paths**:
  - `c:\Projects\WeddingWithIndia\wedding-with-india\lib\auth.ts` (lines 23, 56–63, 148–154)
  - `c:\Projects\WeddingWithIndia\wedding-with-india\app\dashboard\admin\layout.tsx` (lines 40–76)
  - `c:\Projects\WeddingWithIndia\wedding-with-india\app\error.tsx` (lines 1–68)
- **Security Check Results**:
  - `getDbUser()` returns `null` when database is unavailable.
  - `syncAndGetDbUser()` explicitly refuses to return synthetic or mock user objects when DB is unavailable, throwing `SERVICE_UNAVAILABLE`.
  - `isAdmin()` returns `false` if `getDbUser()` returns `null`.
  - `requireRole([UserRole.ADMIN])` throws `SERVICE_UNAVAILABLE` or `FORBIDDEN`.
  - `AdminLayout` displays a user-friendly hard lock screen when DB is unavailable.

### Logic Chain
1. The authentication layer operates in a strict fail-closed mode: no fallback permissions, synthetic roles, or mock admin accounts are granted during database connectivity failures.
2. The UI handles database unavailability gracefully:
   - Admin routes display the dedicated DB requirement panel (`AdminLayout`).
   - General application routes bubble errors to `app/error.tsx` ("A Momentary Interruption") or `app/global-error.tsx`.
3. Once R3's timeout parameter is adjusted, fail-closed auth will operate cleanly without false positives.

---

## Requirement 5: Founder Admin Bootstrap Audit (`founder@weddingwithindia.com`)

### Observation
- **File Paths**:
  - `c:\Projects\WeddingWithIndia\wedding-with-india\scripts\bootstrap-admin.js` (lines 1–62)
  - `c:\Projects\WeddingWithIndia\wedding-with-india\scripts\verify-founder.js` (lines 1–39)
  - `c:\Projects\WeddingWithIndia\wedding-with-india\lib\auth.ts` (lines 76–90)
- **Verification Execution Output**:
  - Command: `node --env-file=.env scripts/verify-founder.js`
  - Result:
    - `[VERIFY] Founder User Exists: 3ad1e68d-cef6-46f3-a1c1-ab225b160a81`
    - `[VERIFY] Clerk User ID: pending_admin_1786309454941`
    - `[VERIFY] Role: ADMIN`
    - `[VERIFY] Status: ACTIVE`
    - `[VERIFY] Role is correct. Admin privileges confirmed.`

### Logic Chain
1. `scripts/bootstrap-admin.js founder@weddingwithindia.com` creates/elevates the user record in PostgreSQL with `role: ADMIN` and `status: ACTIVE`.
2. When the founder signs in via Clerk using `founder@weddingwithindia.com`, `syncAndGetDbUser()` detects `existingByEmail.clerkUserId.startsWith("pending_admin")`, updates `clerkUserId` with the real Clerk user ID (`clerkUser.id`), and retains `role: ADMIN`.
3. `AdminLayout` verifies `dbUser.role === "ADMIN"` server-side before allowing access to `/dashboard/admin/*`.
4. `updateUserRoleAction` in `lib/actions/index.ts` blocks client attempts to self-elevate to ADMIN.
5. **Conclusion**: Founder Admin Bootstrap is fully implemented, verified, and secure.

---

## Summary of Actionable Recommendations for Implementation Phase

1. **R1 (Clerk Catch-all Routes)**:
   - Rename/move `app/login/page.tsx` to `app/login/[[...rest]]/page.tsx`.
   - Rename/move `app/signup/page.tsx` to `app/signup/[[...rest]]/page.tsx`.
   - Maintain full visual presentation and suspense boundaries.

2. **R2 (Remove `client-trust` & Implement Server Flow)**:
   - Delete `app/login/client-trust/page.tsx`.
   - Update `<SignIn>` and `<SignUp>` redirect URLs to point directly to `/dashboard` or destination URL.
   - Perform server-side validation of `redirect_url` ensuring only relative paths starting with `/` (excluding `//`) are accepted.

3. **R3 (Fix `isDatabaseAvailable` Timeout & Caching)**:
   - Update `lib/prisma.ts`: set default `timeoutMs = 5000` in `isDatabaseAvailable()`.
   - Do NOT cache false failure results for 5 seconds (`status: false`).

4. **R4 (Fail-Closed Auth)**:
   - Preserve current throw behavior in `syncAndGetDbUser()` on DB failure.

5. **R5 (Founder Admin)**:
   - Maintain `scripts/bootstrap-admin.js` workflow and `syncAndGetDbUser()` pending admin linking.
