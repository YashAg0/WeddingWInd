# USER_FLOWS — End-to-End User Journey Specifications & State Diagrams

> **Platform**: WeddingWithIndia  
> **Target Roles**: Traveler (Guest), Host (Couple), Agent (Referral Partner), Admin (Platform Operator)  
> **Document Status**: Production Complete & Verified  

---

## 1. Traveler Guest Journey Specification

### 1.1 Journey Architecture & Flowchart

```
+-----------------------------------------------------------------------------------------------------------------------+
|                                              TRAVELER GUEST JOURNEY                                                   |
+-----------------------------------------------------------------------------------------------------------------------+
|                                                                                                                       |
|  [Discovery]             Marketplace (`/weddings`) OR Map View (`/weddings/map`)                                       |
|                          - Dynamic filters (Region, Tradition, Date Range, Guest Capacity, Price per Guest)          |
|                          - Dynamic DB queries with static fallback rendering                                          |
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [Inspection]            Wedding Detail Page (`/weddings/[slug]`)                                                     |
|                          - Experience itinerary, host bio, venue details, cultural rules                              |
|                          - Public reviews DTO (sanitized ratings & verified guest badges)                             |
|                          - Guest count selector (`guestsCount >= 1`)                                                  |
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [Reservation]           Click "Book Experience" -> Server Action `createBookingAction`                                |
|                          - Validates guest count >= 1 and integer constraints                                         |
|                          - Computes server-authoritative total (`wedding.pricePerGuest * data.guestsCount`)           |
|                          - Creates DB `Booking` with status `PENDING`                                                  |
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [Payment & Pass]        Stripe Checkout (`createStripeCheckoutAction`) OR $0 Coupon Bypass                           |
|                          - Webhook listener catches `checkout.session.completed`                                      |
|                          - Deduplicates against `StripeWebhookEvent`                                                  |
|                          - Issues digital `GuestPass` with AES-256-GCM encrypted token & SHA-256 QR hash               |
|                          - Transitions Booking status to `PAID` / `CONFIRMED`                                         |
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [Event Attendance]      Traveler Dashboard (`/dashboard/events/[bookingId]`)                                         |
|                          - Access digital Guest Pass QR code for entry check-in                                      |
|                          - Contact-moderated host messaging (`/dashboard/messages`)                                   |
|                          - Pre-event preparation checklist & emergency contact details                                |
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [Post-Event Review]     Review Submission (`createReviewAction`)                                                     |
|                          - Gated to `ATTENDED` or `COMPLETED` booking status                                          |
|                          - Computes reputation scores, verified guest badge, and review aggregates                   |
|                                                                                                                       |
+-----------------------------------------------------------------------------------------------------------------------+
```

### 1.2 Step-by-Step Step Details

#### Step 1: Discovery & Filtering
- **Route**: `/weddings` or `/weddings/map`
- **Actions/APIs**: Server Component calls `getWeddings({ location, dateRange, tradition, minPrice, maxPrice })`.
- **Data Returned**: Sanitized `Wedding` cards featuring cover image, title, host name, city, state, price per guest, and average rating.

#### Step 2: Experience Inspection
- **Route**: `/weddings/[slug]`
- **Actions/APIs**: `getWeddingBySlug(slug)`.
- **Minimization**: Host's private contact information (phone, email) is omitted. Public host bio and verified trust badges are displayed.

#### Step 3: Server-Authoritative Reservation
- **Action**: `createBookingAction({ weddingId, date, guestsCount, specialRequests })`
- **Validation Rules**:
  1. User must be authenticated (`requireAuth()`).
  2. `guestsCount` must be an integer `>= 1`.
  3. Price calculation is computed strictly on the server: `totalAmount = wedding.pricePerGuest * guestsCount`. Client-provided price parameters are rejected.

#### Step 4: Payment Execution & Pass Issuance
- **Action / Route**: `createStripeCheckoutAction({ bookingId, couponCode })` or `/api/webhooks/stripe`.
- **$0 Coupon Bypass Logic**: If coupon reduces final total to $0, payment status is set to `PAID`, a `GuestPass` record is created, and an email invoice is issued without calling Stripe.
- **Paid Path Logic**: Redirects to Stripe Hosted Checkout. Upon payment success, Stripe webhook triggers `checkout.session.completed`, generates `GuestPass` with encrypted token, and updates booking to `PAID`.

#### Step 5: Event Attendance & Guest Pass QR
- **Route**: `/dashboard/events/[bookingId]`
- **Features**: Displays venue directions, event schedule, host contact box (gated by `normalizeForModeration` contact interceptor), and encrypted QR code pass.

#### Step 6: Post-Event Verified Review
- **Action**: `createReviewAction({ bookingId, rating, comment, title })`
- **Validation**: System checks `booking.status === "COMPLETED"` or `"ATTENDED"`. Computes reputation points (`VERIFIED_REVIEW_SUBMITTED`) and updates listing rating aggregates.

---

## 2. Host Couple Journey Specification

### 2.1 Journey Architecture & Flowchart

```
+-----------------------------------------------------------------------------------------------------------------------+
|                                               HOST COUPLE JOURNEY                                                     |
+-----------------------------------------------------------------------------------------------------------------------+
|                                                                                                                       |
|  [Host Signup]           Landing Page (`/for-couples`) -> Signup (`/signup`) -> Onboarding (`/onboarding`)           |
|                          - User selects role `COUPLE`                                                                |
|                          - Action `completeOnboardingAction` creates `CoupleProfile` and sets `status = ACTIVE`       |
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [KYC Requirement]       Host Dashboard (`/dashboard/verification`)                                                   |
|                          - User sees verification requirement                                                         |
|                          - Admin issues verification request (`adminRequestVerificationAction`)                       |
|                          - Host uploads PAN card, Govt ID, Bank account details, Wedding venue proof                  |
|                          - Action `submitVerificationAction` sets status `PENDING`                                    |
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [Admin KYC Audit]       Admin Portal (`/dashboard/admin/verifications`)                                             |
|                          - Admin reviews host PAN/Aadhaar/Bank verification documents                                 |
|                          - Admin approves -> `VerificationStatus` transitions to `APPROVED`                           |
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [Listing Creation]      Listing Wizard (`/list-wedding`) -> Server Actions `createWedding` / `editWedding`           |
|                          - Host inputs title, description, ceremony schedule, guest capacity, price per guest        |
|                          - PUBLISHING GATE: Server checks `VerificationStatus == APPROVED`                            |
|                          - If APPROVED: Listing transitions to `PUBLISHED`                                           |
|                          - If NOT APPROVED: Status silently downgraded to `DRAFT`                                     |
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [Guest Management]      Host Dashboard (`/dashboard/leads` & `/dashboard/check-in`)                                 |
|                          - Review incoming guest bookings & guest dietary/accessibility details                       |
|                          - On-site QR Check-in Scanner (`/dashboard/check-in`) verifies guest passes at venue entrance|
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [Earnings & Payouts]    Host Earnings Dashboard (`/dashboard/earnings`)                                              |
|                          - View gross booking revenue, 22% platform fee split, net host balance                      |
|                          - Connect Stripe Custom Account (`stripeConnectOnboarding`) for automatic payouts             |
|                                                                                                                       |
+-----------------------------------------------------------------------------------------------------------------------+
```

### 2.2 Step-by-Step Details

#### Step 1: Host Onboarding & Profile Setup
- **Route**: `/for-couples` -> `/onboarding`
- **Actions**: `updateUserRoleAction({ role: "COUPLE" })` followed by `completeOnboardingAction({ weddingDate, weddingLocation, expectedGuests, traditions })`.
- **State Transition**: `User.role` becomes `COUPLE`, `User.status` becomes `ACTIVE`, `CoupleProfile` created.

#### Step 2: Admin-Driven KYC Verification Request & Submission
- **Trigger**: Admin selects host in `/dashboard/admin/users` and invokes `adminRequestVerificationAction`.
- **Upload Execution**: Host opens `/dashboard/verification`. UploadThing middleware verifies that `Verification` record exists in `PENDING` status. Host submits PAN number/scan, bank IFSC & account number, and venue confirmation proof.
- **Submission Action**: `submitVerificationAction` updates record and triggers review notification.

#### Step 3: Admin Review & KYC Approval
- **Route**: `/dashboard/admin/verifications`
- **Action**: `reviewVerificationAction({ verificationId, status: "APPROVED", notes })`
- **State Transition**: `Verification.status` becomes `APPROVED`. `Verification.expiryDate` set to 365 days.

#### Step 4: Wedding Experience Publishing Gate
- **Route**: `/list-wedding` or `/dashboard/listings`
- **Action**: `createWedding(data)` or `editWedding(weddingId, data)`
- **KYC Publishing Gate Check**:
  ```typescript
  if (resolvedStatus === "PUBLISHED") {
    const verification = await prisma.verification.findUnique({ where: { userId } });
    if (verification?.status !== "APPROVED") {
      resolvedStatus = "DRAFT"; // Authoritative server downgrade
    }
  }
  ```

#### Step 5: On-Site QR Pass Check-In
- **Route**: `/dashboard/check-in`
- **Action**: Host or assigned coordinator scans traveler's Guest Pass QR code. Server decodes AES-256-GCM token and matches `qrTokenHash`. Marks booking status as `CHECKED_IN` and `ATTENDED`.

#### Step 6: Host Financial Earnings & Payouts
- **Route**: `/dashboard/earnings`
- **Logic**: Host inspects gross earnings, platform fee deduction (22%), and net payout balance. Host completes Stripe Connect onboarding to enable automated payouts upon event completion.

---

## 3. Agent Partner Journey Specification

### 3.1 Journey Architecture & Flowchart

```
+-----------------------------------------------------------------------------------------------------------------------+
|                                                AGENT PARTNER JOURNEY                                                  |
+-----------------------------------------------------------------------------------------------------------------------+
|                                                                                                                       |
|  [Agent Application]     Landing Page (`/for-agents`) -> Application Form (`/for-agents/apply`)                      |
|                          - Agent submits agency details, target market, promotional channels                           |
|                          - Creates `AgentProfile` record with pending verification checks                             |
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [Admin Approval]        Admin Agent Portal (`/dashboard/admin/agents`)                                              |
|                          - Admin reviews application and approves agent                                               |
|                          - System generates unique referral code `WWI-XXXX` (e.g. `WWI-A89K`)                         |
|                          - `AgentProfile.verifiedChecks` set to `true`                                                |
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [Referral Link Sharing] Agent Dashboard (`/for-agents/dashboard` & `/dashboard/referrals`)                           |
|                          - Agent shares referral URL: `https://weddingwithindia.com?ref=WWI-A89K`                      |
|                          - Traveler clicks link -> System stores referral cookie                                      |
|                          - Referral status: `AgentReferralStatus.CLICKED`                                             |
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [Multi-Stage Conversion]Traveler signs up & completes booking                                                        |
|                          - Signup -> Referral transitions to `SIGNED_UP`                                              |
|                          - Onboarding complete -> Referral transitions to `ONBOARDED`                                 |
|                          - Booking payment complete -> Referral transitions to `CONVERTED`                            |
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [Commission & Payout]   Commission Lifecycle:                                                                        |
|                          - `PENDING` -> Created upon booking payment                                                  |
|                          - `APPROVED` -> Approved after cancellation window passes                                    |
|                          - `PAYABLE`  -> Total eligible commission meets payout threshold                           |
|                          - `PAID`     -> Admin approves PayoutRequest via Stripe Payout stream                        |
|                                                                                                                       |
+-----------------------------------------------------------------------------------------------------------------------+
```

### 3.2 Step-by-Step Details

#### Step 1: Agent Registration & Approval
- **Route**: `/for-agents/apply` -> `/dashboard/admin/agents`
- **Actions**: `applyAgentAction(payload)` creates `AgentProfile`. Admin approves application via `/dashboard/admin/agents`, setting `verifiedChecks = true` and generating unique referral code `WWI-XXXX`.

#### Step 2: Referral Link Tracking & Attribution
- **Link Format**: `https://weddingwithindia.com?ref=WWI-XXXX`
- **Attribution Handler**: Client entry middleware captures `ref` parameter and sets an encrypted HTTP-only cookie `wwi_ref`.

#### Step 3: Referral State Machine Transitions
When a referred user interacts with the platform, `lib/actions/referrals.ts` executes state updates:
1. `CLICKED`: Cookie stored upon initial landing.
2. `SIGNED_UP`: Referred traveler/host registers account via Clerk.
3. `ONBOARDED`: Referred user completes role profile selection.
4. `QUALIFIED`: Referred host lists a verified wedding or traveler completes profile details.
5. `CONVERTED`: Referred user completes a paid booking.

#### Step 4: Commission State Machine & Release
Commission calculations follow platform tier rules (`lib/constants/financial-model.ts`):
- `PENDING`: Generated immediately upon booking payment.
- `LOCKED`: Retained during active cancellation refund window.
- `APPROVED`: Released once cancellation window expires post-event.
- `PAYABLE`: Aggregated into agent's payable balance.
- `PAID`: Dispatched to agent's connected bank account upon Admin payout approval.

---

## 4. Admin Governance & Platform Oversight Flow

### 4.1 Journey Architecture & Flowchart

```
+-----------------------------------------------------------------------------------------------------------------------+
|                                              ADMIN GOVERNANCE FLOW                                                    |
+-----------------------------------------------------------------------------------------------------------------------+
|                                                                                                                       |
|  [Elevation]             CLI Bootstrap Script (`node scripts/bootstrap-admin.js founder@weddingwithindia.com`)         |
|                          - Server-authoritative promotion to `UserRole.ADMIN` & `status = ACTIVE`                     |
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [Edge Edge Auth]        Edge Proxy Middleware (`proxy.ts`) & Page Guard (`lib/auth.ts:requireRole([ADMIN])`)          |
|                          - Intercepts all attempts to access `/dashboard/admin/*` and `/api/admin/*`                  |
|                                     |                                                                                 |
|                                     v                                                                                 |
|  [Control Panel]         Master Admin Dashboard (`/dashboard/admin`)                                                   |
|                          - Platform GMV, total active listings, pending KYC queue, open safety cases                  |
|                                     |                                                                                 |
|             +-----------------------+-----------------------+-----------------------+                                 |
|             |                       |                       |                       |                                 |
|             v                       v                       v                       v                                 |
|  [User Governance]    [KYC Audit Queue]      [Listing Control]      [Safety & Refunds]                              |
|  `/dashboard/admin/   `/dashboard/admin/     `/dashboard/admin/     `/dashboard/admin/                              |
|   users`               verifications`         weddings`              safety` & `payments`                            |
|  - Suspend / Ban      - Audit Passports/PAN  - Review experience    - Investigate disputes                           |
|  - Apply restrictions - Approve/Reject KYC    - Publish/Draft status - Process partial/full                           |
|  - Audit logging      - Enable uploads       - Feature boosts       refunds & holds                                  |
|                                                                                                                       |
+-----------------------------------------------------------------------------------------------------------------------+
```

### 4.2 Step-by-Step Governance Details

#### Step 1: Admin Authorization Verification
- Operator logs in with bootstrapped email (`founder@weddingwithindia.com`). Edge proxy middleware (`proxy.ts`) validates Clerk session, and `requireRole([UserRole.ADMIN])` verifies database role.

#### Step 2: System Telemetry & Overview Inspection
- **Route**: `/dashboard/admin`
- **Data Fetched**: Aggregate platform metrics (`/api/admin/overview`), including total bookings, active hosts, total revenue volume, platform 22% fee earnings, and active safety alerts.

#### Step 3: KYC Verification Audit Queue
- **Route**: `/dashboard/admin/verifications`
- **Action**: Admin inspects uploaded identity and venue documents, confirms authenticity, and executes `reviewVerificationAction`. Automatically unlocks listing publishing for approved hosts.

#### Step 4: Listing Approval & Quality Enforcement
- **Route**: `/dashboard/admin/weddings`
- **Action**: Admin reviews experience descriptions, itinerary, venue safety compliance, pricing per guest, and host credentials before releasing listing to the public marketplace.

#### Step 5: Safety Triage & Financial Dispute Resolution
- **Route**: `/dashboard/admin/safety` & `/dashboard/admin/safety/[caseId]`
- **Action**: Admin accesses evidence files via secure proxy `/api/safety/evidence/[evidenceId]`. Places host payout holds if necessary, issues full or partial refunds via `processFullRefundAction` / `processPartialRefundAction`, and logs immutable audit entries.

---

## 5. User Journey Summary & Integration Matrix

| User Journey | Primary Route | Key State Machine | Enforcement Mechanisms |
|---|---|---|---|
| Traveler Guest | `/weddings` -> `/dashboard/events/[bookingId]` | Booking: `PENDING` -> `PAID` -> `CONFIRMED` -> `ATTENDED` -> `COMPLETED` | Server price calculation, Stripe signature verification, encrypted Guest Pass QR |
| Host Couple | `/for-couples` -> `/list-wedding` -> `/dashboard/earnings` | Host KYC: `NOT_SUBMITTED` -> `PENDING` -> `APPROVED`; Listing: `DRAFT` -> `PUBLISHED` | Verification publishing gate, UploadThing middleware storage gate, check-in scanner |
| Agent Partner | `/for-agents` -> `/dashboard/referrals` | Referral: `CLICKED` -> `SIGNED_UP` -> `ONBOARDED` -> `CONVERTED`; Commission: `PENDING` -> `APPROVED` -> `PAYABLE` -> `PAID` | Unique code `WWI-XXXX`, cookie attribution, tier referral budget limit |
| Admin Operator | `/dashboard/admin/*` | System RBAC: `UserRole.ADMIN`; Account Status: `ACTIVE` / `BANNED` | CLI elevation script, `requireRole` guards, edge proxy middleware, immutable audit logging |
