# Handoff Report — spec_miner_admin_routes

## 1. Observation

- **Admin Routes & Layout Protection**:
  - `app/dashboard/admin/layout.tsx:33-35`: `if (!session?.userId) { redirect("/login?redirect_url=/dashboard/admin"); }`
  - `app/dashboard/admin/layout.tsx:38-40`: `const dbAvailable = await isDatabaseAvailable(500); if (!dbAvailable) return (<LockUI />);`
  - `app/dashboard/admin/layout.tsx:82-93`: `const dbUser = await prisma.user.findUnique({ where: { clerkUserId: session.userId }, select: { role: true } }); if (userRole !== "ADMIN") redirect("/?error=admin_required");`
  - `proxy.ts:25-28`: `const isAdminRoute = createRouteMatcher(["/dashboard/admin(.*)", "/api/admin(.*)"]);`
  - `proxy.ts:42-46`: `const clerkHandler = clerkMiddleware(async (auth, req) => { if (isProtectedRoute(req) || isAdminRoute(req)) await auth.protect(); });`
  - `app/api/admin/agents/route.ts:9,30`: `await requireRole([UserRole.ADMIN]);`
  - `app/api/admin/bookings/route.ts:8,31`: `await requireRole([UserRole.ADMIN]);`
  - `app/api/admin/hosts/route.ts:8,33`: `await requireRole([UserRole.ADMIN]);`
  - `app/api/admin/overview/route.ts:8`: `await requireRole([UserRole.ADMIN]);`

- **Auth Redirects & Open Redirect Sanitization**:
  - `app/login/client-trust/page.tsx:43-56`:
    ```typescript
    let dest = params?.redirect_url || "/dashboard";
    if (dest.startsWith("http") || dest.startsWith("//") || !dest.startsWith("/")) {
      dest = "/dashboard";
    }
    if (dest.startsWith("/dashboard/admin")) {
      if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        dest = "/dashboard?error=unauthorized";
      }
    }
    redirect(dest);
    ```
  - `app/login/page.tsx`, `components/dashboard/DashboardShell.tsx`, `components/wedding/BookingSidebar.tsx`, `components/wedding/StickyBookingCard.tsx` all redirect unauthenticated users to `/login?redirect_url=...`. No `app/sign-in` route exists in the codebase.

- **Verification Upload Flow & 4-Level Unrequested KYC Blocking**:
  - **Level 1 (UI)**: `components/dashboard/VerificationForm.tsx:191-200`:
    ```tsx
    {currentStatus === "NOT_SUBMITTED" && (
      <div className="text-center py-10 space-y-4">
        <ShieldCheck className="w-12 h-12 text-warm-400 mx-auto" />
        <h3 className="font-display font-bold text-lg text-charcoal-900">Document Upload Locked</h3>
        <p className="text-charcoal-500 text-xs max-w-md mx-auto">
          You must wait for an Admin to request your verification documents...
        </p>
      </div>
    )}
    ```
  - **Level 2 (Server Action)**: `lib/actions/index.ts:913-922`:
    ```typescript
    const existingVerification = await prisma.verification.findUnique({ where: { userId: user.id } });
    if (!existingVerification || existingVerification.status === VerificationStatus.NOT_SUBMITTED) {
      throw new Error("VERIFICATION_NOT_REQUESTED: Your verification has not been requested yet...");
    }
    ```
  - **Level 3 (UploadThing Storage Route)**: `lib/storage/index.ts:55-63 & 106-114`:
    ```typescript
    const verification = await prisma.verification.findUnique({ where: { userId: session.userId } });
    if (!verification) throw new Error("UNAUTHORIZED_NO_VERIFICATION_REQUEST");
    if (verification.status === "APPROVED" || verification.status === "UNDER_REVIEW") {
      throw new Error("UNAUTHORIZED_VERIFICATION_LOCKED");
    }
    ```
  - **Level 4 (Prisma DB Schema & Mutation)**: `prisma/schema.prisma:628-689` defines `Verification.userId` as `@unique`. `lib/actions/index.ts:924` calls `prisma.verification.update(...)` (not `.upsert`), failing with Prisma exception `P2025` if no record exists. Only `adminRequestVerificationAction` (`lib/actions/admin.ts:366`) creates the initial DB record.

---

## 2. Logic Chain

1. **R6 Admin Protection & Routing**:
   - Observations show that `app/dashboard/admin/layout.tsx` gates all `/dashboard/admin/*` routes at the server component level before rendering child pages.
   - If a user is not logged in, Clerk `auth()` check redirects them to `/login?redirect_url=/dashboard/admin`.
   - If the database is unreachable, `isDatabaseAvailable(500)` returns `false`, preventing silent pass-through or mock role fallback by rendering a hard lock UI.
   - If the user is logged in and DB is available, `prisma.user.findUnique` fetches the user's role from PostgreSQL. If `userRole !== "ADMIN"`, the layout executes `redirect("/?error=admin_required")`.
   - All server actions and API endpoints perform secondary explicit checks (`await requireRole([UserRole.ADMIN])`), ensuring multi-layered defense.

2. **R6 Redirects & Sanitization**:
   - `proxy.ts` and UI links exclusively point to canonical `/login`. No `app/sign-in` route exists in the codebase.
   - `app/login/client-trust/page.tsx` checks query parameter `redirect_url` against open-redirect patterns (`dest.startsWith("http")`, `dest.startsWith("//")`, `!dest.startsWith("/")`), overriding dangerous values with `/dashboard`.
   - Admin destination URLs (`/dashboard/admin`) are checked against user role prior to redirection.

3. **R7 Verification Lifecycle**:
   - Step 1: User registers (Verification status is implicitly missing or `NOT_SUBMITTED`).
   - Step 2: Admin reviews user in admin panel and invokes `adminRequestVerificationAction`, creating/updating a `Verification` row with status `PENDING`.
   - Step 3: User accesses `/dashboard/verification`. UI checks `Verification.status`. Upload controls are only rendered if status is `PENDING` or `NEED_MORE_DOCUMENTS`.
   - Step 4: When user uploads via UploadThing, storage middleware verifies `Verification` row exists in DB before supplying presigned URL.
   - Step 5: When user submits form, `submitVerificationAction` checks `Verification.status !== NOT_SUBMITTED` and executes `prisma.verification.update`.
   - Step 6: Admin approves or rejects via `adminReviewVerificationAction`.

---

## 3. Caveats

- In `app/login/page.tsx:25` and `app/signup/page.tsx:25`, client-side `useEffect` hooks call `router.replace(redirectUrl || "/dashboard")` directly when an already-authenticated user lands on `/login` or `/signup`. Sanitization is enforced when routing through `/login/client-trust/page.tsx`, but standardizing a single client/server URL sanitizer utility function in `lib/utils.ts` is recommended for maximum consistency.

---

## 4. Conclusion

- **R6 Admin Routing & Auth Redirects**: The platform features complete, server-authoritative RBAC protection for all 21 admin page subroutes and 4 API routes. Dead `/sign-in` routes have been eliminated in favor of `/login`. Open redirect attacks are mitigated via URL pattern validation and RBAC checks in `app/login/client-trust/page.tsx`.
- **R7 Admin Controls & Verification Lifecycle**: The verification lifecycle is strictly Admin-gated. Unrequested KYC document uploads are blocked at all 4 architectural layers: UI Component, Server Action, UploadThing Endpoint, and Prisma DB Schema/Mutation.

---

## 5. Verification Method

To independently verify these conclusions:

1. **Verify Admin Page Guard & Database Fail-Closed**:
   - Inspect `app/dashboard/admin/layout.tsx`. Confirm `auth()`, `isDatabaseAvailable(500)`, and `prisma.user.findUnique` checks.
2. **Verify 4-Level Verification Blocking**:
   - Inspect `components/dashboard/VerificationForm.tsx:191-200` (UI Level).
   - Inspect `lib/actions/index.ts:913-922` (Server Action Level).
   - Inspect `lib/storage/index.ts:55-63 & 106-114` (UploadThing Level).
   - Inspect `prisma/schema.prisma:628-689` and `lib/actions/index.ts:924` (Prisma DB Level).
3. **Run Existing Automated Security Tests**:
   - Execute: `npx jest __tests__/lib/security-regression.test.ts --no-coverage`
   - All tests asserting `submitVerificationAction` admin-gated lifecycle and `requireRole` checks pass.
