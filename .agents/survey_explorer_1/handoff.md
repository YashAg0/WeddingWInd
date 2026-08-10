# HANDOFF REPORT: Codebase Architecture, Route Map, Auth & Admin Access Controls, and Lifecycle State Machines

**Agent ID**: survey_explorer_1 (teamwork_preview_explorer)  
**Parent ID**: 82d10045-7d36-496d-9ff0-682e6d0606c1  
**Working Directory**: `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\survey_explorer_1`  
**Date**: 2026-08-09T19:48:40Z  
**Requirements Addressed**: R1 (Admin Access & Control Center) & R3 (User & Host Lifecycles)

---

## 1. OBSERVATIONS

### 1.1 Complete App Router Route Tree & Layout Map

The application follows the Next.js 16 App Router architecture in `app/`. Routing proxy middleware is located at `proxy.ts`.

#### Layout Hierarchy
- `app/layout.tsx` (Global Root Layout: Providers, ClerkProvider, Toaster, Navigation Header/Footer)
- `app/about/layout.tsx`
- `app/contact/layout.tsx`
- `app/coordinators/layout.tsx`
- `app/dashboard/layout.tsx` (Authenticated Dashboard Shell with Sidebar & User Context)
- `app/dashboard/admin/layout.tsx` (Admin Portal Shell: Enforces `requireRole([UserRole.ADMIN])`)
- `app/for-agents/layout.tsx`
- `app/for-couples/layout.tsx`
- `app/how-it-works/layout.tsx`
- `app/list-wedding/layout.tsx`

#### Public & Marketing Routes
| Route Path | Page File | Access Control | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | Public | Homepage, Hero, Search, Curated Weddings, Stats |
| `/about` | `app/about/page.tsx` | Public | Brand story, company mission, team overview |
| `/contact` | `app/contact/page.tsx` | Public | Inquiry form submitting to `ContactSubmission` |
| `/privacy` | `app/privacy/page.tsx` | Public | Privacy policy and data handling disclosures |
| `/terms` | `app/terms/page.tsx` | Public | Terms of service |
| `/cookies` | `app/cookies/page.tsx` | Public | Cookie policy |
| `/cancellation-policy` | `app/cancellation-policy/page.tsx` | Public | Booking cancellation rules & refund tiers |
| `/copyright` | `app/copyright/page.tsx` | Public | DMCA and IP policy |
| `/dpdp` | `app/dpdp/page.tsx` | Public | Digital Personal Data Protection Act compliance |
| `/gdpr` | `app/gdpr/page.tsx` | Public | EU GDPR compliance details |
| `/host-agreement` | `app/host-agreement/page.tsx` | Public | Terms for host couples |
| `/traveler-agreement` | `app/traveler-agreement/page.tsx` | Public | Terms for international guest travelers |
| `/agent-agreement` | `app/agent-agreement/page.tsx` | Public | Referral partner commission agreement |
| `/coordinator-agreement` | `app/coordinator-agreement/page.tsx` | Public | On-site coordinator agreement |
| `/refund-policy` | `app/refund-policy/page.tsx` | Public | Refund policy details |
| `/trademark` | `app/trademark/page.tsx` | Public | Brand guidelines and trademark usage |
| `/how-it-works` | `app/how-it-works/page.tsx` | Public | Step-by-step guest & host guide |
| `/for-agents` | `app/for-agents/page.tsx` | Public | Agent partner landing page |
| `/for-agents/apply` | `app/for-agents/apply/page.tsx` | Public / Auth | Agent application form |
| `/for-couples` | `app/for-couples/page.tsx` | Public | Host couple landing page |
| `/coordinators` | `app/coordinators/page.tsx` | Public | On-site coordinator landing page |
| `/coordinators/apply` | `app/coordinators/apply/page.tsx` | Public / Auth | Coordinator application form |

#### Authentication & Onboarding Routes
| Route Path | Page File | Access Control | Purpose |
|---|---|---|---|
| `/login(.*)` | `app/login/[[...login]]/page.tsx` | Public (Clerk) | Clerk sign-in interface |
| `/signup(.*)` | `app/signup/[[...signup]]/page.tsx` | Public (Clerk) | Clerk sign-up interface |
| `/onboarding` | `app/onboarding/page.tsx` | Authenticated (`UserStatus.ONBOARDING`) | Role selection & profile creation |
| `/account` | `app/account/page.tsx` | Authenticated | Account preferences & profile settings |

#### Marketplace & Catalog Routes
| Route Path | Page File | Access Control | Purpose |
|---|---|---|---|
| `/weddings` | `app/weddings/page.tsx` | Public | Search, filter, and discover wedding listings |
| `/weddings/map` | `app/weddings/map/page.tsx` | Public | Geospatial/map view of active weddings |
| `/weddings/[slug]` | `app/weddings/[slug]/page.tsx` | Public | Individual wedding details, gallery, host bio, checkout |
| `/wishlist/shared` | `app/wishlist/shared/page.tsx` | Public | Shared wishlist folder listing |
| `/wishlist/shared/[token]` | `app/wishlist/shared/[token]/page.tsx` | Public | Tokenized guest wishlist view |

#### Traveler (Guest) Dashboard Routes
| Route Path | Page File | Access Control | Purpose |
|---|---|---|---|
| `/dashboard` | `app/dashboard/page.tsx` | Authenticated (`TRAVELER` / Any) | User overview dashboard |
| `/dashboard/profile` | `app/dashboard/profile/page.tsx` | Authenticated (`TRAVELER`) | Traveler bio, interests, preferences |
| `/dashboard/bookings` | `app/dashboard/bookings/page.tsx` | Authenticated (`TRAVELER`) | Guest reservations and payment receipts |
| `/dashboard/events` | `app/dashboard/events/page.tsx` | Authenticated (`TRAVELER`) | Itinerary & schedule across booked weddings |
| `/dashboard/events/[bookingId]` | `app/dashboard/events/[bookingId]/page.tsx` | Authenticated (`TRAVELER`) | Detailed itinerary & digital Guest Pass QR |
| `/dashboard/wishlist` | `app/dashboard/wishlist/page.tsx` | Authenticated (`TRAVELER`) | Saved weddings & collection management |
| `/dashboard/notifications` | `app/dashboard/notifications/page.tsx` | Authenticated | User notification feed |
| `/dashboard/messages` | `app/dashboard/messages/page.tsx` | Authenticated | Direct messaging with hosts/agents |
| `/dashboard/safety` | `app/dashboard/safety/page.tsx` | Authenticated | User Trust & Safety hub, active cases |
| `/dashboard/safety/report` | `app/dashboard/safety/report/page.tsx` | Authenticated | Incident reporting form |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | Authenticated | Account credentials & notifications settings |

#### Host (Couple) Dashboard Routes
| Route Path | Page File | Access Control | Purpose |
|---|---|---|---|
| `/dashboard/listings` | `app/dashboard/listings/page.tsx` | Authenticated (`COUPLE`) | Host wedding management (drafts/published) |
| `/list-wedding` | `app/list-wedding/page.tsx` | Authenticated (`COUPLE`) | Create new wedding experience wizard |
| `/dashboard/celebrations` | `app/dashboard/celebrations/page.tsx` | Authenticated (`COUPLE`) | Celebration analytics & timeline planning |
| `/dashboard/check-in` | `app/dashboard/check-in/page.tsx` | Authenticated (`COUPLE`/`COORDINATOR`) | Host guest entry scanner / pass verifier |
| `/dashboard/earnings` | `app/dashboard/earnings/page.tsx` | Authenticated (`COUPLE`) | Host financial payouts & Stripe Connect |
| `/dashboard/leads` | `app/dashboard/leads/page.tsx` | Authenticated (`COUPLE`) | Guest inquiries and pending booking requests |

#### Agent & Coordinator Dashboard Routes
| Route Path | Page File | Access Control | Purpose |
|---|---|---|---|
| `/for-agents/dashboard` | `app/for-agents/dashboard/page.tsx` | Authenticated (`AGENT`) | Agent referral links, performance, payouts |
| `/dashboard/referrals` | `app/dashboard/referrals/page.tsx` | Authenticated (`AGENT`) | Detailed referral tracking & commission ledger |
| `/coordinators/dashboard` | `app/coordinators/dashboard/page.tsx` | Authenticated (`COORDINATOR`/`ADMIN`) | On-site event roster, guest check-ins, incidents |
| `/dashboard/operations` | `app/dashboard/operations/page.tsx` | Authenticated (`COORDINATOR`/`ADMIN`) | Ground operations management |

#### Admin Portal Routes (`/dashboard/admin/*`)
| Route Path | Page File | Access Control | Purpose |
|---|---|---|---|
| `/dashboard/admin` | `app/dashboard/admin/page.tsx` | `UserRole.ADMIN` | Master platform control panel dashboard |
| `/dashboard/admin/users` | `app/dashboard/admin/users/page.tsx` | `UserRole.ADMIN` | User accounts, roles, status, restrictions |
| `/dashboard/admin/weddings` | `app/dashboard/admin/weddings/page.tsx` | `UserRole.ADMIN` | Approve/reject listings, edit experiences |
| `/dashboard/admin/bookings` | `app/dashboard/admin/bookings/page.tsx` | `UserRole.ADMIN` | Platform booking ledger, override status |
| `/dashboard/admin/verifications` | `app/dashboard/admin/verifications/page.tsx` | `UserRole.ADMIN` | KYC document audit (Passport, Govt ID, PAN/Aadhaar) |
| `/dashboard/admin/payments` | `app/dashboard/admin/payments/page.tsx` | `UserRole.ADMIN` | Stripe transactions, refunds, chargebacks |
| `/dashboard/admin/finance` | `app/dashboard/admin/finance/page.tsx` | `UserRole.ADMIN` | Gross volume, platform fees, agent payouts |
| `/dashboard/admin/agents` | `app/dashboard/admin/agents/page.tsx` | `UserRole.ADMIN` | Approve agent partners, set commission rates |
| `/dashboard/admin/events` | `app/dashboard/admin/events/page.tsx` | `UserRole.ADMIN` | Platform event schedules & venue oversight |
| `/dashboard/admin/messages` | `app/dashboard/admin/messages/page.tsx` | `UserRole.ADMIN` | Communication audit & contact moderation |
| `/dashboard/admin/safety` | `app/dashboard/admin/safety/page.tsx` | `UserRole.ADMIN` | Safety case triage queue & dispute resolution |
| `/dashboard/admin/safety/[caseId]` | `app/dashboard/admin/safety/[caseId]/page.tsx` | `UserRole.ADMIN` | Case investigation, evidence review, holds |
| `/dashboard/admin/cms` | `app/dashboard/admin/cms/page.tsx` | `UserRole.ADMIN` | Homepage hero, SEO, legal terms content CMS |
| `/dashboard/admin/discovery` | `app/dashboard/admin/discovery/page.tsx` | `UserRole.ADMIN` | Listing search boosts, manual trending boost |
| `/dashboard/admin/growth` | `app/dashboard/admin/growth/page.tsx` | `UserRole.ADMIN` | Acquisition metrics, conversion funnel |
| `/dashboard/admin/operations` | `app/dashboard/admin/operations/page.tsx` | `UserRole.ADMIN` | Coordinator assignments & incident reports |
| `/dashboard/admin/reviews` | `app/dashboard/admin/reviews/page.tsx` | `UserRole.ADMIN` | Review moderation, fraud signal review |
| `/dashboard/admin/support` | `app/dashboard/admin/support/page.tsx` | `UserRole.ADMIN` | Customer support submissions management |
| `/dashboard/admin/analytics` | `app/dashboard/admin/analytics/page.tsx` | `UserRole.ADMIN` | Platform telemetry & conversion analytics |
| `/dashboard/admin/settings` | `app/dashboard/admin/settings/page.tsx` | `UserRole.ADMIN` | Platform fees, taxes, verification settings |
| `/dashboard/admin/founder` | `app/dashboard/admin/founder/page.tsx` | `UserRole.ADMIN` | Founder operational settings, promo coupons |

#### API Endpoints (`app/api/*`)
| Route Path | Method(s) | Handler File | Access Control | Purpose |
|---|---|---|---|---|
| `/api/health` | GET | `app/api/health/route.ts` | Public | System healthcheck & DB latency check |
| `/api/readiness` | GET | `app/api/readiness/route.ts` | Public | K8s/hosting readiness probe |
| `/api/ready` | GET | `app/api/ready/route.ts` | Public | Service readiness probe |
| `/api/account/bookings` | GET | `app/api/account/bookings/route.ts` | Authenticated | User's personal booking list API |
| `/api/host-application` | POST | `app/api/host-application/route.ts` | Authenticated | Host application submission endpoint |
| `/api/agent-application` | POST | `app/api/agent-application/route.ts` | Authenticated | Agent partner application endpoint |
| `/api/agents/dashboard` | GET | `app/api/agents/dashboard/route.ts` | Authenticated (`AGENT`) | Agent performance metrics API |
| `/api/cron/event-reminders` | GET/POST | `app/api/cron/event-reminders/route.ts` | Bearer Secret | Automated event notification cron |
| `/api/invoice/[bookingId]` | GET | `app/api/invoice/[bookingId]/route.ts` | Authenticated | PDF/Tax invoice generation endpoint |
| `/api/reports/host/[weddingId]` | GET | `app/api/reports/host/[weddingId]/route.ts` | Authenticated (`COUPLE`/`ADMIN`)| Host event report export endpoint |
| `/api/safety/evidence/[evidenceId]` | GET | `app/api/safety/evidence/[evidenceId]/route.ts` | Authenticated (`ADMIN`/Parties) | Secure evidence file stream handler |
| `/api/uploadthing` | GET/POST | `app/api/uploadthing/route.ts` | UploadThing Presigned | File upload presigned URL handler |
| `/api/webhooks/stripe` | POST | `app/api/webhooks/stripe/route.ts` | Stripe Signature | Stripe webhook listener (PaymentIntents) |
| `/api/admin/overview` | GET | `app/api/admin/overview/route.ts` | `UserRole.ADMIN` | Admin dashboard overview metrics API |
| `/api/admin/bookings` | GET, PATCH | `app/api/admin/bookings/route.ts` | `UserRole.ADMIN` | Admin booking list & status mutation API |
| `/api/admin/hosts` | GET, PATCH | `app/api/admin/hosts/route.ts` | `UserRole.ADMIN` | Admin host applications & approval API |
| `/api/admin/agents` | GET, PATCH | `app/api/admin/agents/route.ts` | `UserRole.ADMIN` | Admin agent approval & verification API |

---

### 1.2 Auth & Admin Access Controls Breakdown

#### 1. Authorization Architecture & Admin Email Handling (`founder@weddingwithindia.com`)
- **Admin Elevation Bootstrap**: `scripts/bootstrap-admin.js:27-33`
  ```js
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN", status: "ACTIVE" }
  });
  ```
  - Command: `node scripts/bootstrap-admin.js founder@weddingwithindia.com`
  - Effect: Promotes the specified Clerk-synced email to `role: "ADMIN"` and `status: "ACTIVE"`.
- **Database Schema**: `prisma/schema.prisma:10-15`
  ```prisma
  enum UserRole {
    TRAVELER
    COUPLE
    AGENT
    ADMIN
  }
  ```
- **Server Role Verification**: `lib/auth.ts:156-162`
  ```ts
  export async function requireRole(allowedRoles: UserRole[]) {
    const user = await requireAuth();
    if (!allowedRoles.includes(user.role)) {
      throw new Error("FORBIDDEN: You do not have permissions to access this route.");
    }
    return user;
  }
  ```
- **Granular RBAC Engine**: `lib/rbac.ts:139-153`
  - Resolves `SUPER_ADMIN` for `superadmin@weddingwithindia.com` or `user_superadmin_seed`.
  - Maps `ADMIN` roles to administrative permissions: `VERIFY_HOST_LISTING`, `APPROVE_AGENT_APPLICATION`, `VIEW_ADMIN_FINANCIAL_LEDGER`, `TRIAGE_SAFETY_CASES`, `MANAGE_CMS_CONTENT`.
- **Self-Elevation Prevention**: `lib/actions/index.ts:36-38`
  ```ts
  if (role === UserRole.ADMIN) {
    throw new Error("FORBIDDEN: Cannot self-assign administrative roles.");
  }
  ```
  Users cannot promote themselves to `ADMIN` via client calls to `updateUserRoleAction`.

#### 2. Middleware Security Gate (`proxy.ts`)
- Configured as Next.js 16 routing proxy middleware using Clerk (`proxy.ts:41-46`):
  ```ts
  export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req) || isAdminRoute(req)) {
      await auth.protect();
    }
  });
  ```
- Matcher patterns:
  - Admin routes: `/dashboard/admin(.*)`, `/api/admin(.*)`
  - Protected user routes: `/dashboard(.*)`, `/onboarding(.*)`, `/coordinators/dashboard(.*)`, `/for-agents/dashboard(.*)`, `/api/account(.*)`, `/api/agents(.*)`, `/api/host-application(.*)`, `/api/agent-application(.*)`

#### 3. Server Action Authorization Checks
- All Server Actions in `lib/actions/admin.ts`, `lib/actions/admin-dashboards.ts`, `lib/actions/founder.ts`, and `lib/actions/safety.ts` execute `await requireRole([UserRole.ADMIN]);` at entry before performing database or financial mutations.
- Page-level server actions (e.g. `app/dashboard/admin/verifications/page.tsx:12`, `app/dashboard/admin/users/page.tsx:13`, `app/dashboard/admin/weddings/page.tsx:21`, `app/dashboard/admin/bookings/page.tsx:13`, `app/dashboard/admin/cms/page.tsx:20`) call `await requireRole([UserRole.ADMIN]);` inside page rendering logic before exposing form action handlers.

---

### 1.3 User, Host, & Agent Lifecycle State Machines

```
+---------------------------------------------------------------------------------------------------------+
|                                      USER & HOST LIFECYCLE STATE MACHINE                                |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|   1. AUTH & SIGNUP                                                                                      |
|      Clerk Authentication ---> syncAndGetDbUser() ---> User (role: TRAVELER, status: ONBOARDING)        |
|                                                     ---> TravelerProfile created                        |
|                                                     ---> Referral linked (ReferralStatus.SIGNED_UP)     |
|                                                                                                         |
|   2. ROLE & ONBOARDING                                                                                  |
|      updateUserRoleAction(role) [TRAVELER | COUPLE | AGENT] (Self-assigning ADMIN is BLOCKED)          |
|      completeOnboardingAction() ---> Parses Zod Schema for Profile                                     |
|                                 ---> User (status: ACTIVE)                                              |
|                                 ---> Referral updated (ReferralStatus.ONBOARDED)                        |
|                                                                                                         |
|   3. VERIFICATION (Admin-Controlled KYC)                                                                |
|      Admin Initiates ---> Verification record created (status: NOT_SUBMITTED)                             |
|      User Uploads   ---> submitVerificationAction()                                                      |
|                          UploadThing Middleware checks:                                                 |
|                          - Requires active Verification record (status != NOT_SUBMITTED)                |
|                          - Blocks if APPROVED or UNDER_REVIEW                                           |
|                          ---> Verification (status: PENDING)                                            |
|      Admin Review   ---> adminReviewVerificationAction()                                                 |
|                          ---> Verification (status: APPROVED | REJECTED | UNDER_REVIEW | NEED_MORE_DOCS)    |
|                          ---> If APPROVED: User (status: ACTIVE), ReputationEvent logged                |
|                                                                                                         |
|   4. HOST WEDDING PUBLISHING                                                                            |
|      createWedding() / editWedding() ---> Checks Verification (status == APPROVED)                      |
|                                     ---> If NOT APPROVED: Silently downgraded to DRAFT status           |
|                                     ---> If APPROVED: Status permitted to be PUBLISHED                  |
|                                                                                                         |
|   5. AGENT LIFECYCLE                                                                                    |
|      Agent Profile ---> Referral Code generated (WWI-XXXX)                                              |
|      Referral      ---> CLICKED -> SIGNED_UP -> ONBOARDED -> QUALIFIED -> CONVERTED                       |
|      Commissions   ---> PENDING -> LOCKED -> APPROVED -> PAYABLE -> PAID                              |
|      Payouts       ---> PayoutRequest (REQUESTED -> UNDER_REVIEW -> APPROVED -> PAID)                   |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

#### Detailed State Transition Rules:
1. **Signup Phase**:
   - `lib/auth.ts:92-104`: New user created with `role: "TRAVELER"` and `status: "ONBOARDING"`.
   - `lib/actions/referrals.ts:88-105`: Links referral cookie, creating `AgentReferral` with `status: "SIGNED_UP"`.
2. **Onboarding Phase**:
   - `lib/actions/index.ts:31-51`: `updateUserRoleAction` validates allowed role transitions and blocks self-assignment of `ADMIN`.
   - `lib/actions/index.ts:56-144`: `completeOnboardingAction` creates role-specific profile (`TravelerProfile`, `CoupleProfile`, `AgentProfile`), updates `User.status = "ACTIVE"`, and transitions referral to `ONBOARDED`.
3. **Verification & KYC Phase (Requirement R2 Enforcement)**:
   - Admin triggers verification request: `Verification` record initialized with `status: "NOT_SUBMITTED"`.
   - User upload guard (`lib/actions/index.ts:912-917`):
     ```ts
     if (!existingVerification || existingVerification.status === VerificationStatus.NOT_SUBMITTED) {
       throw new Error("VERIFICATION_NOT_REQUESTED: Your verification has not been requested yet.");
     }
     ```
   - UploadThing Storage guard (`lib/storage/index.ts:55-63`):
     ```ts
     const verification = await prisma.verification.findUnique({ where: { userId: session.userId } });
     if (!verification) throw new Error("UNAUTHORIZED_NO_VERIFICATION_REQUEST");
     if (verification.status === "APPROVED" || verification.status === "UNDER_REVIEW") throw new Error("UNAUTHORIZED_VERIFICATION_LOCKED");
     ```
   - Admin verification audit (`lib/actions/admin.ts:420-447`): `adminReviewVerificationAction` transitions verification to `APPROVED`, `REJECTED`, `UNDER_REVIEW`, or `NEED_MORE_DOCUMENTS`.
4. **Host Listing Publishing Phase (Requirement R3 Enforcement)**:
   - `lib/actions/index.ts:265-273` & `319-328`:
     ```ts
     if (resolvedStatus === "PUBLISHED" || resolvedStatus === WeddingStatus.PUBLISHED) {
       const verification = await prisma.verification.findUnique({
         where: { userId: user.id },
         select: { status: true }
       });
       if (verification?.status !== VerificationStatus.APPROVED) {
         resolvedStatus = WeddingStatus.DRAFT; // Silent downgrade prevents bypass
       }
     }
     ```
5. **Agent & Commission Lifecycle**:
   - Agent profile created with unique referral code (`lib/actions/index.ts:114-124`).
   - Referral statuses (`prisma/schema.prisma:62-70`): `CLICKED` -> `SIGNED_UP` -> `ONBOARDED` -> `QUALIFIED` -> `CONVERTED`.
   - Commission statuses (`prisma/schema.prisma:52-60`): `PENDING` -> `LOCKED` -> `APPROVED` -> `PAYABLE` -> `PAID`.
   - Payout Request statuses (`prisma/schema.prisma:933-947`): `REQUESTED` -> `UNDER_REVIEW` -> `APPROVED` -> `PROCESSING` -> `PAID`.

---

### 1.4 Feature Inventory: Admin Control & Lifecycles

| Feature Item | Category | File Path | Line Range | Enforcement Mechanism |
|---|---|---|---|---|
| Admin Bootstrap Script | Auth / Admin | `scripts/bootstrap-admin.js` | 1-53 | CLI script setting `role: "ADMIN"` & `status: "ACTIVE"` for target email |
| Admin Role Check Helper | Auth / Admin | `lib/auth.ts` | 156-170 | `requireRole([UserRole.ADMIN])` & `isAdmin()` check DB role |
| RBAC Permission Matrix | Auth / Admin | `lib/rbac.ts` | 66-176 | Granular role-to-permission mapping and `requirePermission` helper |
| Routing Proxy Protection | Middleware | `proxy.ts` | 4-46 | Clerk `clerkMiddleware` protecting `/dashboard/admin/*` and protected routes |
| Self-Role Elevation Block | Security / Lifecycle | `lib/actions/index.ts` | 34-38 | Explicitly throws error if user attempts to self-assign `ADMIN` role |
| KYC Gate for Publishing | Host Lifecycle | `lib/actions/index.ts` | 261-274 | Downgrades `PUBLISHED` attempt to `DRAFT` if host `Verification` != `APPROVED` |
| KYC Gate for Editing | Host Lifecycle | `lib/actions/index.ts` | 315-329 | Blocks unverified hosts from changing existing draft listings to `PUBLISHED` |
| Verification Upload Gate | Verification | `lib/actions/index.ts` | 904-917 | Blocks submission if verification was not explicitly requested by admin |
| Storage Upload Gate | Storage / Verification | `lib/storage/index.ts` | 55-63, 106-114 | UploadThing middleware rejecting presigned URL requests for unrequested/locked users |
| Admin Verification Audit | Verification / Admin | `lib/actions/admin.ts` | 415-455 | `adminReviewVerificationAction` updating status & user active flag |
| Admin Dashboard Stats | Admin Action | `lib/actions/admin.ts` | 41-104 | Server-authorized revenue, listings, and verification queue statistics |
| Admin Wedding Mutation | Admin Action | `lib/actions/admin.ts` | 141-205 | Admin creation, updating, and deletion of listings with audit logging |
| Admin User Status Control | Admin Action | `lib/actions/admin.ts` | 605-645 | Admin updating user status (`ACTIVE`, `ONBOARDING`, `BANNED`) & restrictions |
| Admin Safety Case Triage | Admin / Safety | `lib/actions/safety.ts` | 45-120 | Server-authorized triage, severity assignment, and financial holds |
| Founder Financial Config | Admin / Founder | `lib/actions/founder.ts` | 15-59 | Server-authorized system fees, commission rates, and tax configuration |
| Founder CMS Management | Admin / Founder | `lib/actions/founder.ts` | 65-113 | Server-authorized CMS content, Hero, SEO, and legal policies |
| Admin Agent Approval API | Admin API Route | `app/api/admin/agents/route.ts` | 7-105 | Route handler requiring `UserRole.ADMIN` to approve/reject agents |
| Admin Host Approval API | Admin API Route | `app/api/admin/hosts/route.ts` | 7-83 | Route handler requiring `UserRole.ADMIN` to publish/draft host listings |
| Admin Bookings API | Admin API Route | `app/api/admin/bookings/route.ts` | 7-73 | Route handler requiring `UserRole.ADMIN` to view and update booking statuses |
| Admin Overview API | Admin API Route | `app/api/admin/overview/route.ts` | 6-65 | Route handler requiring `UserRole.ADMIN` for aggregate platform metrics |

---

## 2. LOGIC CHAIN

1. **Observation**: `scripts/bootstrap-admin.js` sets `role: "ADMIN"` and `status: "ACTIVE"` in PostgreSQL for a specified email address (e.g. `founder@weddingwithindia.com`).
   - **Step Reasoning**: Platform administrators do not sign up directly via a public form with admin status. Instead, a user signs up via Clerk, after which an operator runs the bootstrap script to promote the user record to `UserRole.ADMIN`.
2. **Observation**: `lib/auth.ts:requireRole([UserRole.ADMIN])` fetches the authenticated user from the database via Clerk session ID and verifies that `user.role === "ADMIN"`.
   - **Step Reasoning**: This ensures that client claims or JWT tokens cannot spoof admin privilege; the authoritative check is executed directly against PostgreSQL for every server action or route handler call.
3. **Observation**: `proxy.ts` routes all requests matching `/dashboard/admin(.*)` and `/api/admin(.*)` through `auth.protect()`.
   - **Step Reasoning**: Unauthenticated requests are intercepted at the edge/middleware level before reaching page rendering code or API route handlers.
4. **Observation**: `lib/actions/index.ts:updateUserRoleAction` checks `if (role === UserRole.ADMIN) throw new Error(...)`.
   - **Step Reasoning**: Users undergoing onboarding or modifying their profile settings are strictly prohibited from electing themselves into an administrative role.
5. **Observation**: `lib/actions/index.ts:createWedding` and `editWedding` inspect `Verification` status for the host's `userId`. If status is not `APPROVED`, `resolvedStatus` is forced to `WeddingStatus.DRAFT`.
   - **Step Reasoning**: Even if a host tampers with client form fields or sends a raw payload requesting `status: "PUBLISHED"`, the server action enforces the business constraint: only verified hosts can publish wedding experiences.
6. **Observation**: `lib/actions/index.ts:submitVerificationAction` checks `existingVerification.status !== VerificationStatus.NOT_SUBMITTED`, and `lib/storage/index.ts` enforces `UNAUTHORIZED_NO_VERIFICATION_REQUEST` in UploadThing middleware.
   - **Step Reasoning**: Arbitrary user uploads of sensitive KYC documents (passports, PAN, Aadhaar) are blocked until an admin explicitly creates a verification request entry for that user.

---

## 3. CAVEATS

1. **Local Clerk User Setup Required**: While the code structure fully supports admin authorization, running end-to-end tests or manual browser testing requires a real Clerk account synced to PostgreSQL via `scripts/bootstrap-admin.js`.
2. **Database Dependency**: All role and lifecycle state checks rely on active PostgreSQL database connectivity. `lib/auth.ts` correctly raises a `SERVICE_UNAVAILABLE` error if DB is unreachable to prevent transient authorization bypass.
3. **Storage Security**: Document uploads go through UploadThing pre-signed URLs. Verification presigned URLs are guarded by backend status checks in `lib/storage/index.ts`.

---

## 4. CONCLUSION

1. **Admin Access & Control (R1)**: Safely designed and implemented. `founder@weddingwithindia.com` (or any admin user bootstrapped via `scripts/bootstrap-admin.js`) is protected by database-backed role checks (`requireRole([UserRole.ADMIN])`), edge proxy middleware (`proxy.ts`), self-elevation guards in `updateUserRoleAction`, and explicit server-action authorization across all mutations.
2. **User & Host Lifecycles (R3)**: Enforced via server-side state machines. Users progress strictly from Signup -> Onboarding -> Verification -> Active Approval. Unverified hosts cannot bypass verification to publish wedding listings because `createWedding` and `editWedding` perform authoritative server checks and silently force `DRAFT` status if unverified.
3. **Verification Upload Security (R2)**: Enforced at both the Server Action level and UploadThing FileRouter middleware level. Unrequested upload attempts are rejected before presigned URLs can be granted.

---

## 5. VERIFICATION METHOD

To independently verify these findings:

1. **Verify Admin Role Check & Elevation Protection**:
   - Inspect `lib/auth.ts` lines 156-170 using `view_file` to confirm `requireRole` implementation.
   - Inspect `lib/actions/index.ts` lines 34-38 using `view_file` to confirm self-elevation block.
   - Inspect `scripts/bootstrap-admin.js` to confirm admin bootstrapping mechanism.
2. **Verify Middleware Proxy Configuration**:
   - Inspect `proxy.ts` lines 23-46 using `view_file` to confirm matcher patterns `/dashboard/admin(.*)` and `/api/admin(.*)`.
3. **Verify Host Publishing KYC Gate**:
   - Inspect `lib/actions/index.ts` lines 261-274 and lines 315-329 using `view_file` to confirm silent downgrade to `DRAFT` status when host is unverified.
4. **Verify Storage Upload Gate**:
   - Inspect `lib/storage/index.ts` lines 51-66 using `view_file` to confirm UploadThing middleware rejecting presigned URL generation for unrequested verification uploads.
