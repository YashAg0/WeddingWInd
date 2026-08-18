# WEDDINGWITHINDIA — GOD-LEVEL SYSTEM FORENSIC INVENTORY

**Platform:** WeddingWithIndia  
**Audit Phase:** Phase 1 — Repository & Architecture Forensic Inventory  
**Audited By:** Principal Software Architect, Security Engineer, QA Lead & Production Reliability Engineer  
**Date:** August 18, 2026  

---

## 1. System Identity & Stack Overview

- **Framework:** Next.js 16.2.10 (Turbopack, App Router, React Server Components)
- **Database & ORM:** PostgreSQL 17.6 (Supabase Connection Pooler) + Prisma Client v6.2.1
- **Authentication:** Clerk Auth + Server-Side PostgreSQL User Mapping (`lib/auth.ts`, `lib/actions/auth-experience.ts`)
- **Payment Processing:** Pure External Manual PayPal Workflow (Zero active Stripe runtime / API dependencies)
- **Pass Security & Cryptography:** AES-256-GCM encrypted tokens with SHA-256 venue lookup hashes
- **State Caching:** Next.js ISR/SSR Path & Tag Revalidation (`revalidatePath`, `revalidateTag`)

---

## 2. Complete Actor Hierarchy & Journey Maps

### Journey 1: Traveler Lifecycle
```
TRAVELER REGISTRATION / CLERK LOGIN
  ↓
PROFILE ONBOARDING (`TravelerProfile`)
  ↓
MARKETPLACE DISCOVERY (`/weddings`, `/weddings/map`, Homepage)
  ↓
APPLICATION SUBMISSION (`createBookingAction` → `PENDING`)
  ↓
ADMIN / HOST APPROVAL (`adminApproveBookingAction`)
  ↓
ADMIN PAYMENT REQUEST (`adminRequestPaymentAction` → `AWAITING_PAYMENT`)
  ↓
EXTERNAL PAYPAL PAYMENT (Traveler pays via HTTPS PayPal Link)
  ↓
ADMIN CONFIRMATION & VERIFICATION (`adminMarkPaymentPaidAction` → `PAID`)
  ↓
DIGITAL PASS ISSUED (`GuestPass` with AES-256-GCM QR & WWI-PASS Code)
  ↓
EVENT HUB PREPARATION (`TravelerPreparation`, `/dashboard/events/[bookingId]`)
  ↓
VENUE GATE SCAN BY COORDINATOR (`checkInGuestAction` → `CHECKED_IN`)
  ↓
CELEBRATION ATTENDANCE (`ATTENDED` / `COMPLETED`)
  ↓
VERIFIED REVIEW SUBMISSION (`submitReviewAction`)
```

---

### Journey 2: Host / Couple Lifecycle
```
COUPLE REGISTRATION / CLERK LOGIN
  ↓
HOST ONBOARDING & BIO (`CoupleProfile`)
  ↓
IDENTITY / KYC SUBMISSION (`Verification` → `PENDING`)
  ↓
ADMIN KYC REVIEW (`adminReviewHostApplicationAction` → `APPROVED`)
  ↓
CELEBRATION CREATION (`createWeddingAction` → `DRAFT`)
  ↓
CELEBRATION PUBLICATION (`adminPublishWeddingAction` → `PUBLISHED`)
  ↓
BOOKINGS RECEIVED & REVIEWED (`/dashboard/celebrations`)
  ↓
GUEST LIST & GATE SCAN MONITORING (`/dashboard/celebrations`)
  ↓
POST-EVENT HOST-TO-TRAVELER REVIEW
```

---

### Journey 3: Cultural Coordinator Lifecycle
```
COORDINATOR REGISTRATION & APPLICATION (`CoordinatorProfile`)
  ↓
ADMIN VERIFICATION & ROSTER ENROLLMENT
  ↓
ADMIN SHIFT DEPLOYMENT (`adminAssignCoordinatorAction` from `/dashboard/admin/coordinators`)
  ↓
COORDINATOR SHIFT DASHBOARD (`/coordinators/dashboard`, `/dashboard/check-in`)
  ↓
ATTENDEE ROSTER INSPECTION
  ↓
VENUE GATE QR SCANNING & PASSCODE VALIDATION (`checkInGuestAction`)
  ↓
SAFETY SOS ESCALATION IF NEEDED (`reportSafetyIncidentAction`)
```

---

### Journey 4: Travel Agent / Affiliate Lifecycle
```
AGENT APPLICATION & ONBOARDING (`AgentProfile`)
  ↓
ADMIN AGENT APPROVAL (`adminApproveAgentAction`)
  ↓
UNIQUE REFERRAL LINK GENERATED (`?ref=CODE` → `wwi_ref` cookie)
  ↓
TRAVELER LANDING & BOOKING ATTRIBUTION (`AgentReferral`)
  ↓
PAYMENT CONFIRMED → ACCRUAL OF COMMISSION (`Commission` → `PENDING`)
  ↓
14-DAY MATURATION HOLD (`/api/cron/commission-settlement` → `MATURED`)
  ↓
PAYOUT REQUEST SUBMISSION (`PayoutRequest`)
  ↓
ADMIN PAYOUT APPROVAL & SETTLEMENT (`adminProcessAgentPayoutAction`)
```

---

### Journey 5: Admin Operational Control ("God Mode")
```
ADMIN AUTHENTICATION (`requireRole([UserRole.ADMIN])`)
  ↓
CONTROL CENTER DASHBOARDS (`/dashboard/admin/*`)
  ├── Weddings & Sponsorship Management (`/weddings`, `/weddings/sponsorship`)
  ├── Host Applications & KYC Approvals (`/hosts`, `/verifications`)
  ├── Booking Approvals & Overrides (`/bookings`)
  ├── Manual PayPal Requests, Confirmations & Refunds (`/payments`, `/finance`)
  ├── Coordinator Roster & Shift Deployments (`/coordinators`)
  ├── Travel Agent Approvals & Payout Distributions (`/agents`, `/finance`)
  ├── Safety Emergency SOS Cases & Financial Holds (`/safety`)
  ├── Trust, Reviews & Dispute Moderation (`/reviews`)
  ├── CMS Content & Regional Guide Curation (`/cms`)
  └── Platform Fees & PayPal Allowlist Configuration (`/settings`)
```

---

## 3. Server Actions Complete Inventory (16 Action Files)

| File Path | Primary Responsibilities | Key Exported Server Actions |
| :--- | :--- | :--- |
| `lib/actions/admin.ts` | Complete Admin operations | `adminCreateWeddingAction`, `adminUpdateWeddingAction`, `adminDeleteWeddingAction`, `adminPublishWeddingAction`, `adminToggleFeaturedAction`, `adminToggleSponsoredAction`, `adminUpdateSponsorshipDatesAction`, `adminReviewHostApplicationAction`, `adminReviewVerificationAction`, `adminUpdateUserStatusAction`, `adminAssignCoordinatorAction`, `adminUnassignCoordinatorAction`, `adminGetCoordinatorsAction`, `adminUpdateCMSSectionAction`, `adminUpdateSystemConfigAction`, `adminProcessAgentPayoutAction`, `adminReviewSponsorshipRequestAction` |
| `lib/actions/payment-manual.ts` | Manual PayPal financial operations | `adminRequestPaymentAction`, `adminMarkPaymentPaidAction`, `adminRecordManualRefundAction`, `adminUpdatePaymentRequestAction`, `travelerGetPaymentDetailsAction`, `adminGetPaymentManagementDetailsAction` |
| `lib/actions/index.ts` | Core Marketplace & Bookings | `getWeddings`, `getWeddingBySlug`, `createBookingAction`, `cancelBookingAction`, `adminApproveBookingAction`, `adminRejectBookingAction`, `createWeddingAction`, `updateWeddingAction` |
| `lib/actions/event-operations.ts` | Gate Check-Ins & Coordinator shift operations | `checkInGuestAction`, `getWeddingGuestListAction`, `getCoordinatorDashboardDataAction`, `getGuestPassAction` |
| `lib/actions/reviews.ts` | Reviews, Ratings & Reputation | `submitReviewAction`, `voteReviewHelpfulAction`, `replyToReviewAction`, `reportReviewAction`, `adminModerateReviewAction` |
| `lib/actions/referrals.ts` | Agent links & commissions | `getAgentDashboardAction`, `requestPayoutAction`, `reverseBookingCommissionAction`, `recordReferralClickAction` |
| `lib/actions/safety.ts` | SOS, Incident reports & Emergency holds | `reportSafetyIncidentAction`, `adminResolveSafetyCaseAction`, `checkUserRestriction` |
| `lib/actions/auth-experience.ts` | Authoritative onboarding & role resolver | `resolveAuthenticatedUserExperience` |
| `lib/actions/discovery.ts` | Marketplace search & filters | `searchWeddingsAction`, `getFeaturedWeddingsAction` |
| `lib/actions/host-application.ts` | Couple profile & host submission | `submitHostApplicationAction` |
| `lib/actions/messages.ts` | In-app messaging & inquiry threads | `sendMessageAction`, `getConversationsAction` |
| `lib/actions/profile-completion.ts`| User profile step-up flows | `completeTravelerProfileAction`, `completeCoupleProfileAction` |
| `lib/actions/admin-dashboards.ts` | Metric aggregation for operations | `getOperationsDashboardAction`, `getExecutiveDashboardAction` |
| `lib/actions/admin-leads.ts` | Lead management & CRM | `getAdminLeadsAction` |
| `lib/actions/founder.ts` | Public founder & executive profile | `getFounderProfileDataAction` |
| `lib/actions/device-session.ts` | Multi-device session tracking | `registerDeviceSessionAction` |

---

## 4. API Routes Inventory (17 Route Handlers)

| Route Path | Method | Purpose | Auth / Access Boundary |
| :--- | :---: | :--- | :--- |
| `/api/cron/commission-settlement` | `GET` | Matures commissions older than 14 days | `CRON_SECRET` Header Bearer Token |
| `/api/cron/event-reminders` | `GET` | Dispatches 7d / 24h event reminders | `CRON_SECRET` Header Bearer Token |
| `/api/health` | `GET` | Liveness health check | Public |
| `/api/readiness` / `/api/ready` | `GET` | Database & external service probe | Public |
| `/api/invoice/[bookingId]` | `GET` | Generates downloadable invoice HTML/PDF | Owner or Admin (`requireAuth`) |
| `/api/reports/host/[weddingId]` | `GET` | Exports guest rosters & reports | Host Owner or Admin (`requireAuth`) |
| `/api/safety/evidence/[evidenceId]`| `GET` | Serves uploaded safety evidence files | Safety Admin / Case Parties |
| `/api/admin/bookings` | `GET` | JSON export of bookings | Admin Only (`requireRole`) |
| `/api/admin/hosts` | `GET` | JSON export of host KYC applications | Admin Only (`requireRole`) |
| `/api/admin/agents` | `GET` | JSON export of agent profiles | Admin Only (`requireRole`) |
| `/api/admin/overview` | `GET` | Admin dashboard telemetry overview | Admin Only (`requireRole`) |
| `/api/account/bookings` | `GET` | Traveler personal bookings list | Traveler Owner (`requireAuth`) |
| `/api/agents/dashboard` | `GET` | Agent referral metrics | Agent Owner (`requireAuth`) |
| `/api/contact` | `POST` | General contact form submission | Rate-limited Public |
| `/api/newsletter` | `POST` | Newsletter subscription | Rate-limited Public |
| `/api/uploadthing` | `POST` | Secure cloud asset uploads | Session Protected |
| `/api/test/auth` | `GET/POST`| E2E test cookie token issuer | Local/Staging Test Auth Only |

---

## 5. Background Jobs & Scheduled Workflows

1. **Agent Commission Maturation Settlement (`/api/cron/commission-settlement`):**
   - Scheduled daily. Scans `Commission` records where `status = 'PENDING'`, `createdAt <= NOW() - 14 days`, and associated `Booking` is in `ATTENDED` or `COMPLETED` without active refunds. Transitions status to `MATURED`.
2. **Event Day Reminders (`/api/cron/event-reminders`):**
   - Scheduled daily. Inspects published weddings occurring in 7 days and 24 hours, notifying travelers and hosts with preparation guides.
