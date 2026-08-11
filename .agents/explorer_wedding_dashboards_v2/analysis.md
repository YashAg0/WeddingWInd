# Requirement R5 Technical Analysis: Wedding Lifecycle & Dashboards

## Executive Summary
This document presents the read-only technical audit and evidence-based analysis for Requirement R5 (Wedding Lifecycle & Dashboards) of the WeddingWithIndia marketplace.

The investigation examined:
1. **Wedding Lifecycle & Creation Flow**: Document upload schemas, root cause of the "document type error", server actions, Prisma DB schemas, lifecycle state transitions, and rejection workflow.
2. **Dashboards State & Controls**: Complete audit of Host, Traveler, Agent, Coordinator, and Admin dashboards (`app/dashboard/*`, `app/admin/*`), database state integration vs mock/placeholder data, and Admin portal operational controls.

---

## Part 1: Wedding Lifecycle & Listing Creation

### 1. Root Cause Analysis: "Document Type Error" & Verification Lock
* **UploadThing Configuration (`lib/storage/index.ts`)**:
  - Upload endpoints are strictly typed with allowed file formats:
    - `verificationDocument`: `pdf` (max 8MB, max 2 count) and `image` (max 8MB, max 2 count).
    - `passport`: `pdf` (max 8MB, max 1 count) and `image` (max 8MB, max 1 count).
    - `documents`: `pdf` (max 16MB), `image` (max 16MB), `blob` (max 16MB).
  - Middleware Gating Security Violation Handling:
    ```ts
    const verification = await prisma.verification.findUnique({
      where: { userId: session.userId }
    });
    if (!verification) {
      throw new Error("UNAUTHORIZED_NO_VERIFICATION_REQUEST");
    }
    if (verification.status === "APPROVED" || verification.status === "UNDER_REVIEW") {
      throw new Error("UNAUTHORIZED_VERIFICATION_LOCKED");
    }
    ```
  - **Root Cause #1 (Unrequested KYC Upload Attempt)**: When a host or user attempts to upload document files before an Admin explicitly requests verification (when no `Verification` record exists or `status === NOT_SUBMITTED`), UploadThing middleware throws `UNAUTHORIZED_NO_VERIFICATION_REQUEST`, preventing presigned URL creation.
  - **Root Cause #2 (Empty String Validation Error)**: In `lib/validation/index.ts`, `verificationSchema` validates URLs using `z.string().url().nullable().optional()`. When client forms (e.g. `VerificationForm.tsx`) submit empty string `""` values for unselected document URLs (such as `panUrl: ""`), Zod parsing throws a URL format error because `""` is neither a valid URL nor `null`.
  - **Root Cause #3 (Silent KYC Gating on Listing Publish)**: In `createWedding` and `editWedding` (`lib/actions/index.ts`), the KYC gate (`SEC-001`) checks host verification. An unverified host attempting to publish a listing has their status silently downgraded from `PUBLISHED` to `DRAFT`.

### 2. End-to-End Creation Flow Tracing
* **Flow 1: Host Application Form (`/list-wedding`)**:
  - UI Component: `app/list-wedding/page.tsx`
  - Endpoint: `POST /api/host-application`
  - Auth Check: `requireRole([UserRole.COUPLE])`, verifies `email` matches authenticated session.
  - DB Mutations:
    1. Upserts `CoupleProfile` for authenticated `userId`.
    2. Creates `Wedding` with generated slug (`${coupleNames}-${city}-${Date.now()}`), default `status: "DRAFT"`, `pricePerGuest: 16000`, `capacity: intlGuestCapacity`.
    3. Upserts `Verification` with `status: "PENDING"`, `submissionDate: now()`, and duration notes.
    4. Inserts `AuditLog` entry for `HOST_APPLICATION_SUBMITTED`.

* **Flow 2: Host Dashboard Listing Manager (`/dashboard/listings`)**:
  - UI Component: `app/dashboard/listings/page.tsx`
  - Server Action: `createWedding(data)` / `editWedding(weddingId, data)` in `lib/actions/index.ts`.
  - Auth Check: `requireAuth()`, verifies `user.role === UserRole.COUPLE`.
  - KYC Gate: If `status === "PUBLISHED"`, verifies `Verification.status === "APPROVED"`. If host is not verified, status defaults to `"DRAFT"`.
  - DB Mutations: Parses payload with `weddingSchema`, generates unique slug via `generateUniqueWeddingSlug()`, creates/updates `Wedding` row in PostgreSQL.

* **Flow 3: Admin Portal Wedding Creator (`/dashboard/admin/weddings`)**:
  - UI Component: `app/dashboard/admin/weddings/page.tsx`
  - Server Action: `adminCreateWeddingAction(data)` / `adminUpdateWeddingAction(weddingId, data)` in `lib/actions/admin.ts`.
  - Auth Check: `requireRole([UserRole.ADMIN])`.
  - DB Mutations: Parses payload with `adminWeddingSchema`, creates/updates `Wedding` row in DB, logs `AuditLog` entry (`CREATE_WEDDING` / `UPDATE_WEDDING`).

### 3. Lifecycle State Transitions
- **`DRAFT`**: Initial state when created by host or admin prior to host identity verification.
- **`SUBMITTED` / `PENDING`**: When host submits application or verification, `Verification.status` becomes `PENDING` or `UNDER_REVIEW`.
- **`Admin Review`**: Admin views queue at `/dashboard/admin/verifications` or `/dashboard/admin/weddings`.
- **`APPROVED` / `REJECTED`**:
  - When Admin approves verification (`adminReviewVerificationAction`), `Verification.status` -> `APPROVED` and `User.status` -> `ACTIVE`.
  - Host can now publish weddings (`status: "PUBLISHED"`).
- **`Public Listing`**: `getWeddings()` and `getWeddingBySlug()` in `lib/actions/index.ts` query `prisma.wedding.findMany({ where: { status: "PUBLISHED" } })`. Draft and suspended weddings are filtered out from public view.

### 4. Rejection Workflow Analysis
- **Rejection Reason Persistence**: In `adminReviewVerificationAction` (`lib/actions/admin.ts`), the `notes` parameter is stored directly in `Verification.notes`, `status` is set to `REJECTED` or `NEED_MORE_DOCUMENTS`, and `User.status` is set to `ONBOARDING`.
- **Host Notification**: System generates a `Notification` (type: `ALERT`) and sends `sendVerificationRejectedEmail(user.email, userName, notes)`.
- **Host UI Display**: `VerificationForm.tsx` (rendered on `/dashboard/verification` and `/dashboard`) checks `currentStatus`:
  - `REJECTED`: Displays red banner with `Reason: "${initialVerification.notes}"`.
  - `NEED_MORE_DOCUMENTS`: Displays amber banner with `Admin Audit Note: "${initialVerification.notes}"`.
- **Host Resubmission**: Form enables file upload dropzones. Host uploads updated files and triggers `submitVerificationAction`, setting `Verification.status` back to `PENDING` and updating `submissionDate` to `now()`.
- **Schema Nuance**: In Prisma, `WeddingStatus` enum is strictly `DRAFT`, `PUBLISHED`, `COMPLETED`. Rejection status is tracked on the linked `Verification` model (`VerificationStatus`: `REJECTED`, `NEED_MORE_DOCUMENTS`) or via `Wedding.suspended` flag.

---

## Part 2: Dashboards State & Controls Audit

### 1. Host Dashboard (`/dashboard`, `/dashboard/listings`, `/dashboard/earnings`)
- **Database Integration**: Fully integrated with Prisma database via `fetchDashboardDataAction()`, `getMyWeddings()`, and `getWeddingEvent()`. Real query data populates bookings, guest counts, and revenue.
- **Controls & Actions**:
  - Guest application approval/rejection (`handleGuestApplicationAction`).
  - Listing creation/editing (`createWedding`, `editWedding`, `deleteWedding`).
  - Payout ledger tracking (`coupleStats.paidGuests`).
- **Routing Issue Identified**: On `/dashboard/listings` (line 377), edit buttons link to `/dashboard/celebrations?action=edit&id=...`. Since `/dashboard/celebrations/page.tsx` performs a server redirect to `/dashboard/listings`, query parameters (`?action=edit&id=...`) are stripped unless updated to `/dashboard/listings?action=edit&id=...`.

### 2. Traveler Dashboard (`/dashboard`, `/dashboard/bookings`, `/dashboard/wishlist`, `/dashboard/profile`)
- **Database Integration**: Fully integrated with Prisma database via `fetchDashboardDataAction()`, `fetchInbox()`, `fetchRecentlyViewed()`, `fetchSavedSearches()`, and `getPersonalizedRecommendations()`.
- **Controls & Actions**:
  - Booking creation and cancellation (`createBookingAction`, `cancelBookingAction`).
  - Wishlist toggling (`toggleWishlistAction`).
  - Profile settings updates (`updateProfileDetails`).
  - AI match advisor (`recommendWeddingAction`).

### 3. Agent Dashboard (`/dashboard/referrals`, `/dashboard/earnings`)
- **Database Integration**: Integrated with Prisma database via `lib/actions/referrals.ts`.
- **Controls & Actions**:
  - Referral link generation (`generateReferralCode`).
  - Commission performance tracking.
  - Verification gating for commission eligibility.
- **Audit Observation**: In `/app/dashboard/page.tsx`, fallback stat cards for Agent View contain hardcoded numbers ("580 clicks", "42 converted") in the overview component, whereas `/dashboard/referrals/page.tsx` queries real DB counts.

### 4. Coordinator Dashboard (`/dashboard/check-in`, `/dashboard/operations`, `/dashboard/events`)
- **Database Integration**: Integrated with `lib/actions/event-operations.ts` and `lib/security/guest-pass-crypto.ts`.
- **Controls & Actions**:
  - QR code guest pass check-in scanner (`ClientCheckInScanner.tsx`).
  - Real-time `GuestCheckIn` database logging.
  - Event operations monitoring.

### 5. Admin Portal Routes Audit (`app/dashboard/admin/*`)

| Admin Route | Backend Data Action / Source | Functional Controls | Real DB Status |
|---|---|---|---|
| `/dashboard/admin` | `adminGetDashboardStatsAction()` | High-level metrics, Stripe volume, quick links | Real DB Data |
| `/dashboard/admin/users` | `prisma.user.findMany()` | Role updates (`adminUpdateUserRoleAction`), user deletion (`adminDeleteUserAction`), verification requests (`adminRequestVerificationAction`) | Real DB Data |
| `/dashboard/admin/weddings` | `prisma.wedding.findMany()` | CRUD (`adminCreateWeddingAction`, `adminUpdateWeddingAction`, `adminDeleteWeddingAction`), status toggle (`adminToggleWeddingStatusAction`), featured toggle (`adminToggleWeddingFeaturedAction`) | Real DB Data |
| `/dashboard/admin/verifications` | `prisma.verification.findMany()` | Verification audit, status approval/rejection (`adminReviewVerificationAction`), request more docs, under review | Real DB Data |
| `/dashboard/admin/bookings` | `prisma.booking.findMany()` | Status override (`adminOverrideBookingStatusAction`), cancel ticket, trigger refund (`refundBookingAction`), export CSV (`adminExportBookingsCSVAction`) | Real DB Data |
| `/dashboard/admin/finance` | `getFinanceDashboardAction()` | Gross volume, net revenue, escrow holds, agent commission ledger | Real DB Data |
| `/dashboard/admin/payments` | `adminGetPaymentsAndQueuesAction()` | Transaction log, refund queue, host payouts (`adminProcessHostPayoutAction`), Stripe webhooks (`AdminStripeAuditManager`) | Real DB Data |
| `/dashboard/admin/reviews` | `prisma.review.findMany()` (flagged) | Moderation actions (hide, publish, remove), report dismissal, fraud signal analysis | Real DB Data |
| `/dashboard/admin/safety` | `adminGetSafetyMetricsAction()`, `prisma.safetyCase.findMany()` | Incident triage, case severity audit, financial holds, user restrictions | Real DB Data |
| `/dashboard/admin/safety/[caseId]` | `prisma.safetyCase.findUnique()` | Case detail inspection, timeline logging, appeal resolution | Real DB Data |
| `/dashboard/admin/messages` | `adminGetConversations()` | Global chat search, filter open/archived, transcript JSON export | Real DB Data |
| `/dashboard/admin/agents` | `prisma.agentProfile.findMany()` | Agent verification audit, commission rule configuration | Real DB Data |
| `/dashboard/admin/events` | `prisma.weddingEvent.findMany()` | Global event schedule monitoring and filtering | Real DB Data |
| `/dashboard/admin/operations` | `getOperationsDashboardAction()` | Operational metrics, check-in logs, active wedding monitors | Real DB Data |
| `/dashboard/admin/cms` | `prisma.fAQ`, `prisma.blogPost`, `prisma.testimonial` | FAQ CRUD (`adminUpsertFAQAction`), Blog CRUD (`adminUpsertBlogPostAction`), Testimonial CRUD | Real DB Data |
| `/dashboard/admin/growth` | `getGrowthDashboardAction()` | Newsletter subscribers, coupon management, search analytics | Real DB Data |
| `/dashboard/admin/analytics` | `adminGetAuditLogsAction()` | Audit log inspection, search analytics | Real DB Data |
| `/dashboard/admin/founder` | `adminGetDashboardStatsAction()` | Founder dashboard metrics and system readiness | Real DB Data |
| `/dashboard/admin/settings` | `prisma.systemConfig.findUnique()` | System config updates (fees, maintenance mode, currency) | Real DB Data |
| `/dashboard/admin/support` | `getSupportDashboardAction()` | Contact submissions, active customer support conversations | Real DB Data |

---

## Recommended Implementations / Fixes for Implementer
1. **Fix Host Dashboard Listing Edit Link**: In `app/dashboard/listings/page.tsx` line 377, change `href={`/dashboard/celebrations?action=edit&id=${w.id}`}` to `href={`/dashboard/listings?action=edit&id=${w.id}`}` to prevent redirect query-string loss.
2. **Sanitize Empty Strings in Verification Submissions**: Ensure empty strings `""` for optional URL fields are converted to `null` before passing to Zod schemas or Prisma queries.
3. **Dynamicize Agent Stat Cards in Overview**: In `app/dashboard/page.tsx`, connect the static Agent StatCards ("580 clicks", "42 converted") to real DB referral metrics.
