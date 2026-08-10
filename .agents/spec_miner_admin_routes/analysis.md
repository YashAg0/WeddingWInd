# Specification Analysis: Admin Routing, Security Redirects, and Verification Lifecycle (R6 & R7)

## Executive Summary

This report presents a specification analysis of **R6 (Admin Routing & Auth Redirects)** and **R7 (Admin Controls & Verification Lifecycle)** for the WeddingWithIndia platform. 

All findings are based on code analysis of `app/`, `lib/`, `components/`, `prisma/schema.prisma`, `proxy.ts`, and test files.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | R6 Admin Routing | `/dashboard/admin/*` Page Protection | Server component layout wrapping all 20+ admin subroutes to enforce Clerk session, DB availability, and `ADMIN` role. | Next.js Page Request (`req.url`) | Rendered Admin Layout & Children | Redirects to `/login?redirect_url=/dashboard/admin` if unauthenticated; returns DB-offline Lock UI if DB down; redirects to `/?error=admin_required` if non-admin. | `app/dashboard/admin/layout.tsx` |
| 2 | R6 Admin Routing | Admin Middleware Edge Guard | Edge matcher `isAdminRoute` catching `/dashboard/admin(.*)` and `/api/admin(.*)`. | `NextRequest` | Edge Passthrough or `NextResponse.redirect` | In test/mock mode: API routes return `401 Unauthorized`, pages redirect to `/login?redirect_url=...`. | `proxy.ts:25-75` |
| 3 | R6 Admin Routing | Admin API Route RBAC | API endpoints for agents, bookings, hosts, and overview checking `UserRole.ADMIN`. | HTTP GET/PATCH request | JSON payload (`{ agents }`, `{ bookings }`, `{ hosts }`, `{ overview }`) | Returns `500` JSON with error message or `UNAUTHORIZED`/`FORBIDDEN`. | `app/api/admin/*` |
| 4 | R6 Auth Redirects | Canonical `/login` Routing | Single canonical login route handling user auth and post-login redirection. | Query param `redirect_url` or `returnTo` | Rendered `<SignIn />` component or redirect to destination | If user is unauthenticated or session drops, redirects to `/login`. | `app/login/page.tsx` |
| 5 | R6 Open Redirect | Open Redirect Sanitization | Server handoff route validating destination URL relative path format. | `searchParams.redirect_url` | HTTP 307 Redirect to validated `dest` | Overrides invalid/external URLs (`http://`, `//`, or non-`/`) with default `/dashboard`. Overrides non-admin attempts to access `/dashboard/admin` with `/dashboard?error=unauthorized`. | `app/login/client-trust/page.tsx:42-59` |
| 6 | R7 Verification | Admin Verification Gate Request | Admin action triggering verification requirement for specific user. | `userId: string`, `requiredDocuments: string`, `adminNotes?: string` | `Verification` DB record created/updated (`status: PENDING`), User `Notification` created | Throws error if target user not found or admin acts on self. | `lib/actions/admin.ts:340-413` |
| 7 | R7 Verification | User Document Submission Action | User Server Action for submitting identity documents. | `formData` object (passportUrl, govtIdUrl, selfieUrl, etc.) | Updated `Verification` DB record (`status: PENDING`, `submissionDate: now()`), confirmation email | Throws `VERIFICATION_NOT_REQUESTED` if no admin request exists or status is `NOT_SUBMITTED`. | `lib/actions/index.ts:896-947` |
| 8 | R7 Verification | Admin Review & Approval/Rejection | Admin action reviewing KYC submissions and changing user status. | `verificationId: string`, `status: VerificationStatus`, `notes: string` | Updated `Verification` and `User` records, Reputation event logged (+10 score), notification & status email sent | Throws `FORBIDDEN` if caller is not `ADMIN`. | `lib/actions/admin.ts:415-529` |
| 9 | R7 Verification | UploadThing Presigned URL Guard | Storage endpoint middleware validating verification status before granting presigned URL. | Upload request for `verificationDocument` or `passport` | Presigned Upload URL metadata | Throws `UNAUTHORIZED_NO_VERIFICATION_REQUEST` if no `Verification` row exists, or `UNAUTHORIZED_VERIFICATION_LOCKED` if status is `APPROVED`/`UNDER_REVIEW`. | `lib/storage/index.ts:47-69, 97-120` |
| 10 | R7 Verification | Verification UI State Lock | Dashboard UI form rendering locked state when verification is unrequested. | `initialVerification` prop | Lock screen UI banner | Hides input fields and `<UploadButton>` components when `currentStatus === "NOT_SUBMITTED"`. | `components/dashboard/VerificationForm.tsx:191-200` |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | R6 Admin Protection | Database offline during admin page request | `AdminLayout` catches DB unavailability (`isDatabaseAvailable(500) === false`) and renders a hard block Lock UI explaining connection requirements instead of granting access or crashing. |
| 2 | R6 Admin Protection | Non-admin authenticated user visiting `/dashboard/admin/users` | `AdminLayout` checks `userRole !== "ADMIN"` and redirects user to `/?error=admin_required`. |
| 3 | R6 Open Redirect | `redirect_url=https://attacker.com/phishing` | `client-trust/page.tsx` checks `dest.startsWith("http")` and resets `dest = "/dashboard"`. |
| 4 | R6 Open Redirect | `redirect_url=//evil.com` (Protocol-relative open redirect) | `client-trust/page.tsx` checks `dest.startsWith("//")` and resets `dest = "/dashboard"`. |
| 5 | R6 Open Redirect | Non-admin requesting `redirect_url=/dashboard/admin/settings` | `client-trust/page.tsx` checks RBAC for admin target and resets `dest = "/dashboard?error=unauthorized"`. |
| 6 | R7 Verification Lifecycle | User directly calling `submitVerificationAction` without prior Admin request | Server Action checks `!existingVerification || existingVerification.status === NOT_SUBMITTED` and throws `VERIFICATION_NOT_REQUESTED`. |
| 7 | R7 Verification Lifecycle | Direct API call to UploadThing `verificationDocument` endpoint without Admin request | UploadThing middleware queries `prisma.verification.findUnique` and throws `UNAUTHORIZED_NO_VERIFICATION_REQUEST`, denying presigned URL. |
| 8 | R7 Verification Lifecycle | User attempting to re-upload documents after verification is already `APPROVED` | UploadThing middleware checks `verification.status === "APPROVED"` and throws `UNAUTHORIZED_VERIFICATION_LOCKED`. Form submit button is disabled. |
| 9 | R7 Verification Lifecycle | Attempting `prisma.verification.update` on a user with no DB record | Database engine rejects query with `P2025: Record to update not found` because `submitVerificationAction` uses `.update` instead of `.upsert`. |
| 10 | R7 Verification Lifecycle | Admin attempting to request verification on their own admin account | `adminRequestVerificationAction` checks `userId === admin.id` and throws `"Forbidden: Admins cannot request verification on themselves."` |

---

## Deep-Dive Analysis: R6 Admin Routing & Auth Redirects

### 1. Map of `/dashboard/admin/*` Routes
All admin subroutes are located in `app/dashboard/admin/` and inherit protection from `app/dashboard/admin/layout.tsx`:
1. `/dashboard/admin` — Main Operations & Executive Overview (`page.tsx`)
2. `/dashboard/admin/agents` — Partner Agent Directory & Application Approvals (`agents/page.tsx`)
3. `/dashboard/admin/analytics` — Platform Metrics & Revenue Growth (`analytics/page.tsx`)
4. `/dashboard/admin/bookings` — Master Booking Register & Status Overrides (`bookings/page.tsx`)
5. `/dashboard/admin/cms` — FAQ, Blog Posts, Hero, & Testimonial Content Management (`cms/page.tsx`)
6. `/dashboard/admin/discovery` — Search & Discovery Curation (`discovery/page.tsx`)
7. `/dashboard/admin/events` — Wedding Event Rosters & Operations (`events/page.tsx`)
8. `/dashboard/admin/finance` — Financial Ledger & Fee Structure (`finance/page.tsx`)
9. `/dashboard/admin/founder` — System Founder Bootstrap & System Override (`founder/page.tsx`)
10. `/dashboard/admin/growth` — Growth Funnel & Referral Performance (`growth/page.tsx`)
11. `/dashboard/admin/messages` — Platform Messaging & Moderation Audit (`messages/page.tsx`)
12. `/dashboard/admin/operations` — On-Site Coordinator Roster (`operations/page.tsx`)
13. `/dashboard/admin/payments` — Payment Ledger, Refund Queue, & Host Payout Processing (`payments/page.tsx`)
14. `/dashboard/admin/reviews` — Review Moderation, Fraud Signals, & Appeals (`reviews/page.tsx`)
15. `/dashboard/admin/safety` — Trust & Safety Case Management (`safety/page.tsx`)
16. `/dashboard/admin/safety/[caseId]` — Specific Safety Case Details & Evidence Audit (`safety/[caseId]/page.tsx`)
17. `/dashboard/admin/settings` — Platform System Settings (`settings/page.tsx`)
18. `/dashboard/admin/support` — Support Desk & Help Tickets (`support/page.tsx`)
19. `/dashboard/admin/users` — User Directory, Role Promotions, & Account Deletion (`users/page.tsx`)
20. `/dashboard/admin/verifications` — Identity Verification Queue & Document Audit (`verifications/page.tsx`)
21. `/dashboard/admin/weddings` — Wedding Directory & Status Toggles (`weddings/page.tsx`)

Admin API Routes (`app/api/admin/*`):
- `GET /api/admin/agents` — List agent applications (Guarded by `requireRole([UserRole.ADMIN])`)
- `PATCH /api/admin/agents` — Approve or reject agent applications (Guarded by `requireRole([UserRole.ADMIN])`)
- `GET /api/admin/bookings` — List all bookings (Guarded by `requireRole([UserRole.ADMIN])`)
- `PATCH /api/admin/bookings` — Admin status override (Guarded by `requireRole([UserRole.ADMIN])`)
- `GET /api/admin/hosts` — List host couple applications (Guarded by `requireRole([UserRole.ADMIN])`)
- `PATCH /api/admin/hosts` — Update wedding/host status (Guarded by `requireRole([UserRole.ADMIN])`)
- `GET /api/admin/overview` — Admin dashboard summary stats (Guarded by `requireRole([UserRole.ADMIN])`)

### 2. Server-Authoritative Protection Audit
- **Layout Level Protection (`app/dashboard/admin/layout.tsx`)**:
  - The layout is an `async` Server Component.
  - Calls `auth()` from `@clerk/nextjs/server`. If unauthenticated (`!session?.userId`), triggers `redirect("/login?redirect_url=/dashboard/admin")`.
  - Checks database availability (`isDatabaseAvailable(500)`). If offline, renders a Fail-Closed Lock UI component rather than passing through or using synthetic permissions.
  - Queries `prisma.user.findUnique({ where: { clerkUserId: session.userId }, select: { role: true } })`.
  - Enforces `if (userRole !== "ADMIN") redirect("/?error=admin_required");`.
- **Edge Middleware Protection (`proxy.ts`)**:
  - Configures route matcher `isAdminRoute = createRouteMatcher(["/dashboard/admin(.*)", "/api/admin(.*)"])`.
  - Invokes `await auth.protect()` for matched routes.
- **Server Action Protection (`lib/actions/admin.ts`)**:
  - Every single admin action (e.g. `adminGetDashboardStatsAction`, `adminUpdateUserRoleAction`, `adminRequestVerificationAction`, `adminReviewVerificationAction`, `adminProcessHostPayoutAction`) executes `await requireRole([UserRole.ADMIN])`.

### 3. Canonical `/login` vs Dead `/sign-in` Audit
- The canonical authentication route for the application is `/login` (`app/login/page.tsx`).
- Verification of dead `/sign-in` routes:
  - There is NO `app/sign-in` page directory in the codebase.
  - All redirects in production code point directly to `/login` (e.g., `app/dashboard/admin/layout.tsx:34`, `proxy.ts:66`, `app/for-couples/page.tsx:245`, `components/dashboard/DashboardShell.tsx:22`, `components/wedding/BookingSidebar.tsx:49`, `components/wedding/StickyBookingCard.tsx:204`).
  - Search across codebase shows `/sign-in` occurs only in comments (`layout.tsx:11,32`), Playwright test suite regex matchers (`/sign-in|login/i` in `e2e/*.spec.ts`), and documentation files.

### 4. Open Redirect Protection Audit
- Location: `app/login/client-trust/page.tsx`
- Implementation code:
  ```typescript
  let dest = params?.redirect_url || "/dashboard";

  // Security: Prevent open redirects (only allow relative paths)
  if (dest.startsWith("http") || dest.startsWith("//") || !dest.startsWith("/")) {
    dest = "/dashboard";
  }

  // RBAC: Check admin routes
  if (dest.startsWith("/dashboard/admin")) {
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      dest = "/dashboard?error=unauthorized";
    }
  }

  redirect(dest);
  ```
- Assessment:
  - Protocol-relative URLs (`//evil.com`) and absolute URLs (`http://evil.com`, `https://evil.com`) are stripped and defaulted to `/dashboard`.
  - Relative targets attempting to enter `/dashboard/admin` are subjected to a server-side DB role check (`user.role === "ADMIN" || "SUPER_ADMIN"`).
  - **Recommendation**: Create a central `sanitizeRedirectUrl(url: string | null): string` helper in `lib/utils.ts` to be used uniformly in client-side router hooks (`app/login/page.tsx`, `app/signup/page.tsx`, `app/onboarding/page.tsx`).

---

## Deep-Dive Analysis: R7 Verification Lifecycle & 4-Level Upload Blocking

### Verification Lifecycle Steps
1. **Admin Initiation**: Admin calls `adminRequestVerificationAction(userId, requiredDocuments, adminNotes)` in `lib/actions/admin.ts:340`. A `Verification` DB record is created/updated with `status: PENDING` and `submissionDate: null`.
2. **User Document Upload**: User navigates to `/dashboard/verification`. If `Verification.status` is `PENDING` (or `NEED_MORE_DOCUMENTS`), document upload controls become active. User uploads identity files and calls `submitVerificationAction(formData)` in `lib/actions/index.ts:896`.
3. **Admin Audit & Decision**: Admin inspects files in `/dashboard/admin/verifications` and executes `adminReviewVerificationAction(verificationId, status, notes)` in `lib/actions/admin.ts:415`.

### 4-Level Enforcement Architecture for Unrequested KYC Uploads

```
[ Client / User ]
       │
       ▼
 ┌─────────────────────────────────────────────────────────┐
 │ 1. UI COMPONENT (components/dashboard/VerificationForm) │
 │    - Status === "NOT_SUBMITTED"                         │
 │    - Hides input fields & <UploadButton> components      │
 └─────────────────────────┬───────────────────────────────┘
                           │ (Attempted Direct Call)
                           ▼
 ┌─────────────────────────────────────────────────────────┐
 │ 2. SERVER ACTION (lib/actions/index.ts)                 │
 │    - submitVerificationAction checks DB status          │
 │    - Throws VERIFICATION_NOT_REQUESTED if NOT_SUBMITTED   │
 └─────────────────────────┬───────────────────────────────┘
                           │ (Attempted Direct Storage Upload)
                           ▼
 ┌─────────────────────────────────────────────────────────┐
 │ 3. UPLOADTHING ENDPOINT (lib/storage/index.ts)          │
 │    - verificationDocument & passport middleware         │
 │    - Throws UNAUTHORIZED_NO_VERIFICATION_REQUEST         │
 └─────────────────────────┬───────────────────────────────┘
                           │ (Attempted Direct DB Mutation)
                           ▼
 ┌─────────────────────────────────────────────────────────┐
 │ 4. PRISMA DB SCHEMA & MUTATION LAYER (schema.prisma)   │
 │    - Verification.userId is @unique                      │
 │    - submitVerificationAction uses .update (NOT .upsert)│
 │    - Rejects uninitiated row update (Prisma P2025)       │
 └─────────────────────────────────────────────────────────┘
```

1. **Level 1: UI Component Guard (`components/dashboard/VerificationForm.tsx:191-200`)**:
   When `currentStatus === "NOT_SUBMITTED"`, the component renders a locked state banner ("Document Upload Locked") and completely omits rendering form input fields and UploadThing `<UploadButton>` components.
2. **Level 2: Server Action Guard (`lib/actions/index.ts:913-922`)**:
   `submitVerificationAction` fetches the user's verification record from Prisma. If `!existingVerification || existingVerification.status === VerificationStatus.NOT_SUBMITTED`, it throws an explicit runtime exception: `VERIFICATION_NOT_REQUESTED`.
3. **Level 3: UploadThing Route / Endpoint Guard (`lib/storage/index.ts:55-63 & 106-114`)**:
   Both `verificationDocument` and `passport` endpoints in UploadThing router execute `.middleware()` before returning presigned URLs. The middleware queries `prisma.verification.findUnique({ where: { userId: session.userId } })`. If missing or in `APPROVED`/`UNDER_REVIEW` state, it throws `UNAUTHORIZED_NO_VERIFICATION_REQUEST` or `UNAUTHORIZED_VERIFICATION_LOCKED`.
4. **Level 4: Prisma DB Schema & Mutation Guard (`prisma/schema.prisma` & `lib/actions/index.ts:924-931`)**:
   `Verification.userId` is defined as `@unique`. The user-facing Server Action `submitVerificationAction` invokes `prisma.verification.update(...)` rather than `.upsert(...)` or `.create(...)`. Attempting to update a non-existent `Verification` row produces a database-level P2025 exception. Only the admin-initiated action `adminRequestVerificationAction` can insert the initial `Verification` record into the database.

---

## Conclusion & Specification Completeness Verification

- **R6 Requirements**: Satisfied. All 21 admin page routes and 4 API routes are mapped and verified to be server-authoritatively protected. Open redirect sanitization is active in `client-trust/page.tsx`. Canonical `/login` route is used across the app, with no dead `/sign-in` pages present.
- **R7 Requirements**: Satisfied. Verification lifecycle is fully admin-controlled. Unrequested KYC uploads are strictly blocked across all 4 defense-in-depth levels (UI, Server Action, UploadThing Endpoint, and Prisma DB Schema/Mutation).
