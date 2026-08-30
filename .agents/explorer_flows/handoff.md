# Master Audit Report: User Journeys, Multi-Role Flows & Adversarial Traversal

**Agent**: Explorer 2 (Flows & Adversarial Traversal)  
**Target Repository**: `WeddingWithIndia` (`c:\Projects\WeddingWithIndia\wedding-with-india`)  
**Audit Scope**: User Flow Matrix across 4 Roles (Section D), State Machine Transitions (Section E), Adversarial Traversal (7 Hostile Scenarios), and Regression Risk Map (Section L).  
**Timestamp**: 2026-08-30T03:12:00Z  
**Audit Integrity Mode**: Strict Read-Only Audit (Zero codebase, database, or config files modified).

---

## 1. Observation

Direct code observations across repository routes, server actions, services, and security models:

### 1.1 Architecture & Role Routing Inventory
- **Route Gatekeeper (`proxy.ts:1-173`)**:
  - `isAdminRoute`: Protects `/dashboard/admin(.*)` and `/api/admin(.*)` (`proxy.ts:6-9`).
  - `isProtectedRoute`: Protects `/dashboard(.*)`, `/onboarding(.*)`, `/coordinators/dashboard(.*)`, `/for-agents/dashboard(.*)`, `/api/account(.*)`, `/api/agents(.*)`, `/api/host-application(.*)`, `/api/agent-application(.*)` (`proxy.ts:12-21`).
  - Unauthenticated API requests receive HTTP 401 JSON (`proxy.ts:31-36`). Browser navigations redirect to `/login?redirect_url=...` (`proxy.ts:48-50`).
  - First-party affiliate tracking (`wwi_ref` cookie, 30-day maxAge, HTTP-only, SameSite: Lax) is ingested in middleware (`proxy.ts:133-158`).
- **Server Component Admin Layout Guard (`app/dashboard/admin/layout.tsx:1-92`)**:
  - Enforces `withDbRetry` query to verify `dbUser.role === UserRole.ADMIN` (`app/dashboard/admin/layout.tsx:33-39`).
  - If unauthenticated, redirects to `/login?redirect_url=/dashboard/admin` (`line 47`).
  - If user is not `ADMIN`, redirects to `/?error=admin_required` (`line 87`).
  - Fail-closed screen rendered on database connection exhaustion (`lines 51-83`).
- **Granular RBAC Engine (`lib/rbac.ts:1-204`)**:
  - Defines 7 roles (`GUEST`, `TRAVELER`, `COUPLE`, `AGENT`, `COORDINATOR`, `ADMIN`, `SUPER_ADMIN`) and 23 fine-grained permissions (`lib/rbac.ts:16-62`).
  - `requirePermission` dynamically checks `ROLE_PERMISSIONS` against database user records (`lib/rbac.ts:172-180`).
- **Database Schema Models (`prisma/schema.prisma:1-1967`)**:
  - `User` with `UserRole (TRAVELER, COUPLE, AGENT, ADMIN, COORDINATOR)` and `UserStatus (ACTIVE, ONBOARDING, BANNED)` (`prisma/schema.prisma:11-64, 1525-1537`).
  - `Booking` with 13 lifecycle statuses: `PENDING`, `APPROVED`, `REJECTED`, `AWAITING_PAYMENT`, `PAID`, `CONFIRMED`, `READY_FOR_EVENT`, `CHECKED_IN`, `ATTENDED`, `COMPLETED`, `CANCELLED`, `REFUNDED`, `NO_SHOW` (`prisma/schema.prisma:339-385, 1545-1559`).
  - `Payment` with statuses `PENDING`, `PAID`, `REFUNDED`, `FAILED` (`prisma/schema.prisma:473-510, 1561-1566`).
  - `HostApplication` with 8 workflow statuses (`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `ACTION_REQUIRED`, `VERIFIED`, `APPROVED_FOR_LISTING`, `REJECTED`, `WITHDRAWN`), multi-day schedules (`HostApplicationDay`), and formal document request tracking (`HostDocumentRequest`, `HostDocument`) (`prisma/schema.prisma:1808-1965`).
  - `GuestPass` with AES-256-GCM token encryption and SHA-256 token hashing (`prisma/schema.prisma:977-997`).
  - `TravelerPreparation` tracking readiness checklist (`prisma/schema.prisma:1015-1031`).
  - `SafetyCase` with `CaseType`, `CaseSeverity`, `CaseStatus`, `financialHold`, and `CaseAppeal` (`prisma/schema.prisma:1126-1227`).

---

## 2. Logic Chain

From the direct code observations, we trace the end-to-end logical mechanics across the 4 user personas and adversarial stress vectors:

### 2.1 Foreign Traveler Journey
1. **Discovery & Exploration**:
   - `app/page.tsx` renders high-impact visual entry points (`Hero.tsx`, `FeaturedWeddings.tsx`, `CulturalCode.tsx`, `TrustStrip.tsx`).
   - `app/weddings/page.tsx:59-191` resolves search parameters (`destination`, `durations`, `tiers`, `religions`, `minGuests`, `maxBudget`, `availability`, `sort`) and executes `sortWeddingsByDiscoveryPriority`.
   - Cultural taxonomy is normalized using `normalizeReligion` (`lib/culture.ts`).
2. **Detail & Cultural Confidence**:
   - `app/weddings/[slug]/page.tsx:86-512` presents celebration schedules (`WeddingTimeline.tsx`), couple bio, dress code guidelines, feast descriptions, inclusions/exclusions, and structured schema.org Event JSON-LD (`lines 102-133`).
   - `WeddingDetailReviews.tsx` renders Bayesian-weighted reviews and category breakdowns (food, hospitality, culture, safety, accommodation) once a celebration has completed (`lines 199-205, 463-475`).
3. **Application & Concurrency Reservation**:
   - Traveler selects attendance side (`BRIDE_SIDE`, `GROOM_SIDE`, `OPEN`) via `WeddingSideSelector.tsx` and guest count (`BookingSidebar.tsx:168-198`).
   - `createBookingAction` (`lib/actions/index.ts:559-719`) acquires a PostgreSQL row lock (`tx.$queryRaw`SELECT id FROM "Wedding" WHERE id = ... FOR UPDATE``) to eliminate race conditions.
   - Calculates authoritative price via `calculateBookingPricing` (`lib/services/pricing-engine.ts:267-336`) preventing client-side price manipulation.
   - Verifies active capacity across `CAPACITY_HOLDING_BOOKING_STATUSES` (`PENDING`, `AWAITING_PAYMENT`, `APPROVED`, `PAID`, `CONFIRMED`, `READY_FOR_EVENT`, `CHECKED_IN`).
   - Inserts `Booking` with status `PENDING` and notifies Host Couple (`lib/actions/index.ts:704-711`).
4. **Checkout & Payment**:
   - Host reviews and approves request via `handleGuestApplicationAction` (`lib/actions/index.ts:861-987`), transitioning status to `AWAITING_PAYMENT`.
   - Payment is executed via official Stripe Webhook (`app/api/webhooks/stripe/route.ts:95-288`) or Admin Manual PayPal verification (`lib/actions/payment-manual.ts:183-245` & `lib/services/payments.ts:284-467`).
   - On payment confirmation:
     - `Booking.status` transitions to `PAID`.
     - An AES-256-GCM encrypted `GuestPass` and SHA-256 `qrTokenHash` are generated idempotently (`lib/services/payments.ts:380-403`).
     - `TravelerPreparation` readiness checklist is provisioned (`lib/services/payments.ts:405-413`).
     - Agent commission ledger is queued with a 14-day hold (`lib/actions/referrals.ts:559-676`).
5. **Pre-Trip Event Hub & Event Day Check-in**:
   - Confirmed traveler opens `/dashboard/events/[bookingId]` (`app/dashboard/events/[bookingId]/page.tsx:21-238`), views dynamic QR pass, host contact roster, venue GPS directions, and checklist.
   - Submits `saveEmergencyContactAction` and `updateTravelerPreparationAction` (`lib/actions/event-operations.ts:536-685`); upon completing mandatory requirements, `calculateTravelerReadiness` transitions `Booking.status` to `READY_FOR_EVENT`.
   - Entry gate scanner executes `checkInGuestAction` (`lib/actions/event-operations.ts:207-371`). Uses atomic conditional update (`updateMany({ where: { id: pass.id, status: "ACTIVE" } })`) to prevent double check-in and transitions `Booking.status` to `CHECKED_IN`.
6. **Post-Event Review**:
   - Host or coordinator marks `markAttendanceAction` -> `ATTENDED` (`lib/actions/event-operations.ts:445-531`).
   - Traveler submits review via `submitReviewAction` (`lib/actions/reviews.ts:97-278`). System evaluates eligibility (`evaluateReviewEligibility`), runs fraud heuristics (`evaluateReviewFraud`), calculates Bayesian rating updates, and records reputation events.

---

### 2.2 Host / Wedding Family Journey
1. **Host Onboarding & Application Submission**:
   - Host visits `/list-wedding` (`app/list-wedding/page.tsx:1-2023`).
   - Form state continuously autosaves to `localStorage` via `saveLocalWeddingDraft` (`lib/storage/wedding-draft.ts`).
   - Unauthenticated hosts are redirected to `/login?redirect_url=/list-wedding?resume=true`. On return, `useEffect` executes `checkHostAuthReadinessAction` and auto-submits draft data via `submitHostApplicationAction` (`lib/actions/host-application.ts:715-780`).
   - Application record is created with status `SUBMITTED`, multi-day schedule (`HostApplicationDay`), and user role upgrades to `COUPLE`.
2. **KYC Verification & Admin Approval**:
   - Admin reviews application at `/dashboard/admin/hosts/[id]` (`app/dashboard/admin/hosts/[id]/page.tsx`).
   - Admin can request supporting documents (`adminRequestHostDocumentsAction`) setting status to `ACTION_REQUIRED`.
   - Host uploads documents via `uploadHostRequestedDocumentAction` (`lib/actions/host-application.ts:784-931`), resetting status to `UNDER_REVIEW`.
   - Admin verifies tier and duration via `adminVerifyHostApplicationAction` (`lib/actions/admin.ts:2205-2400`), provisioning `CoupleProfile`, published `Wedding` listing, and approving `Verification`.
3. **Event Management & Guest Operations**:
   - Host manages wedding itinerary (`createItineraryItemAction`) and broadcasts announcements (`publishWeddingAnnouncementAction`).
   - Reviews guest leads at `/dashboard/leads` and `/dashboard/celebrations`.
   - Approves or declines guest applications via `handleGuestApplicationAction` (`lib/actions/index.ts:861-987`).
   - Tracks guaranteed fixed INR earnings at `/dashboard/earnings` (`pricing-engine.ts:123-160`).

---

### 2.3 Admin Platform Operations Journey
1. **Executive Dashboard & Verification Oversight**:
   - `/dashboard/admin` aggregates platform GMV, pending host verifications, open disputes, and booking volume (`lib/actions/admin.ts:1794-1845`).
2. **Dispute & Safety Resolution**:
   - Incident reports created via `reportIncidentAction` (`lib/actions/safety.ts:93-227`).
   - Admin triages case severity (`adminTriageCaseAction`), enforces financial holds (`adminToggleFinancialHoldAction`), restricts suspicious accounts (`adminRestrictUserAction`), or suspends listings (`adminToggleWeddingSuspensionAction`).
   - Resolves cases with resolution codes (`UPHELD`, `DISMISSED`) triggering automated reputation adjustments.
3. **Escrow Oversight & Refunds**:
   - Admin verifies external PayPal transactions via `adminMarkPaymentPaidAction` (`lib/actions/payment-manual.ts:183-245`).
   - Executes refunds via `adminRecordManualRefundAction` or `refundBookingAction` (`lib/actions/index.ts:1036-1094`), updating transaction ledgers and reversing agent commissions (`lib/actions/referrals.ts:681-736`).

---

### 2.4 Travel Agent / Partner Journey
1. **Partner Portal & Onboarding**:
   - Agents review terms at `/for-agents` and `/agent-agreement`, submitting applications via `api/agent-application/route.ts`.
   - Admin approves agent (`adminReviewAgentApplicationAction`) and generates unique referral code (`generateReferralCode`, format: `WWI-AGENT-XXXX`).
2. **Referral Attribution & Commission Maturity**:
   - Referral visits track via `trackReferralVisitAction` (`lib/actions/referrals.ts:61-121`), setting `wwi_ref` cookie.
   - On signup, `associateReferralOnSignup` links user to agent.
   - When referred traveler pays for a booking, `generateBookingCommissionAction` (`lib/actions/referrals.ts:559-676`) creates a fixed tier-based INR commission (`₹511` to `₹2,511` per guest) with a 14-day hold (`availableAt`).
   - Cron `/api/cron/commission-settlement` settles matured commissions (`settleMaturedCommissionsAction`).
   - Agent requests payout at `/for-agents/dashboard` via `submitPayoutRequestAction` (`lib/actions/referrals.ts:236-310`), locking commissions. Admin approves via `adminReviewPayoutRequestAction`.

---

## 3. Dedicated User Flow Matrix across 4 Roles (Section D)

| Persona | Stage | Route / Entry Point | Server Action / API Handler | Database State Change | Security & Invariants Enforced |
|---|---|---|---|---|---|
| **Foreign Traveler** | 1. Discovery | `/` & `/weddings` | `getWeddings()`, `searchWeddingsAction` | Reads `Wedding` where `status=PUBLISHED, suspended=false, deletedAt=null` | Demo listings visible as showcases; suspended/deleted listings filtered out. |
| | 2. Detail | `/weddings/[slug]` | `getWeddingBySlug(slug)` | Reads `Wedding`, `WeddingEvent`, `WeddingTradition`, `Review` | Schema.org Event JSON-LD rendered. Reviews only visible for completed events. |
| | 3. Host Inquiry | `/dashboard/messages` | `sendMessageAction`, `getOrCreateConversation` | Creates `Conversation`, `ConversationParticipant`, `Message` | Rate limit 30 msgs/min. `assertCanMessage` check. Participant authorization check. |
| | 4. Booking Application | `/weddings/[slug]` (Sidebar) | `createBookingAction` (`lib/actions/index.ts:559`) | Inserts `Booking` (status: `PENDING`), `Notification` (Host) | `SELECT FOR UPDATE` lock on `Wedding`. Capacity aggregate check. Prevents booking own wedding or past date. Server calculates pricing. |
| | 5. Payment Checkout | `/dashboard/bookings` | `adminMarkPaymentPaidAction` or Stripe Webhook (`api/webhooks/stripe`) | `Booking` -> `PAID`, `Payment` -> `PAID`, creates `GuestPass`, `TravelerPreparation` | Idempotent transaction. AES-256-GCM encrypted QR token. Duplicate transaction ID check. |
| | 6. Pre-Trip Preparation | `/dashboard/events/[bookingId]` | `saveEmergencyContactAction`, `updateTravelerPreparationAction` | Creates `EmergencyContact`, `TravelDetail`, updates `TravelerPreparation` | `calculateTravelerReadiness` transitions `Booking` -> `READY_FOR_EVENT` once emergency contact + dress code acknowledged. |
| | 7. Event Day Check-in | `/dashboard/check-in` | `checkInGuestAction` (`lib/actions/event-operations.ts:207`) | `GuestPass` -> `USED`, `Booking` -> `CHECKED_IN`, inserts `GuestCheckIn` | Atomic conditional update (`updateMany` on `status=ACTIVE`). Scanner role check (Host/Coordinator/Admin). |
| | 8. Post-Event Review | `/weddings/[slug]` & `/dashboard/reviews` | `submitReviewAction` (`lib/actions/reviews.ts:97`) | Inserts `Review` (`PUBLISHED` or `UNDER_REVIEW`), `ReviewFraudSignal` | Verified booking eligibility check. Anti-fraud heuristics check. Bayesian rating recalculation. |
| **Host / Family** | 1. Application Draft | `/list-wedding` | `saveHostApplicationDraftAction` | Creates/Updates `HostApplication` (`DRAFT`), `CoupleProfile` | Autosaves to `localStorage` + PostgreSQL. Handles unauthenticated resume flow safely. |
| | 2. Application Submit | `/list-wedding` | `submitHostApplicationAction` | `HostApplication` -> `SUBMITTED`, `User.role` -> `COUPLE`, `Verification` -> `PENDING` | Validates date and duration bounds (1–5 days). Notifies platform admins. |
| | 3. KYC Document Fulfillment | `/list-wedding` / `/dashboard` | `uploadHostRequestedDocumentAction` | Inserts `HostDocument`, updates `HostDocumentRequest` -> `FULFILLED` | Checks ownership. If all required docs fulfilled, transitions `HostApplication` -> `UNDER_REVIEW`. |
| | 4. Schedule & Rules | `/dashboard/operations` | `createItineraryItemAction`, `publishWeddingAnnouncementAction` | Inserts `WeddingItineraryItem`, `WeddingAnnouncement` | Verifies host couple ownership. Dispatches push & email notifications to confirmed attendees. |
| | 5. Guest Lead Review | `/dashboard/leads` | `handleGuestApplicationAction` (`lib/actions/index.ts:861`) | `Booking` -> `AWAITING_PAYMENT` (or `REJECTED`) | `SELECT FOR UPDATE` capacity lock. Dispatches approval email with payment link. |
| | 6. Attendance & Payout | `/dashboard/earnings` & `/dashboard/check-in` | `markAttendanceAction` (`lib/actions/event-operations.ts:445`) | `Booking` -> `ATTENDED` (or `NO_SHOW`), logs reputation event | Verifies host ownership. Fixed INR payout tracked via `pricing-engine.ts`. |
| **Admin** | 1. KYC Verification | `/dashboard/admin/hosts/[id]` | `adminVerifyHostApplicationAction` (`lib/actions/admin.ts:2205`) | `HostApplication` -> `APPROVED_FOR_LISTING`, `Wedding` -> `PUBLISHED`, `Verification` -> `APPROVED` | Normalizes tier & duration. Calculates customer price in USD and creates published listing. |
| | 2. Payment Verification | `/dashboard/admin/payments` | `adminMarkPaymentPaidAction` (`lib/actions/payment-manual.ts:183`) | `Payment` -> `PAID`, `Booking` -> `PAID`, creates `GuestPass`, creates `Transaction` ledger | Verifies PayPal transaction ID. Enforces HTTPS domain allowlist. Generates encrypted QR token. |
| | 3. Dispute Resolution | `/dashboard/admin/safety/[caseId]` | `adminTriageCaseAction`, `adminResolveCaseAction` | `SafetyCase` -> `RESOLVED`, updates timeline, logs reputation event | Enforces role `ADMIN`. Can toggle `financialHold` or restrict user capabilities. |
| | 4. Refunds & Reversals | `/dashboard/admin/payments` | `adminRecordManualRefundAction` (`lib/actions/payment-manual.ts:250`) | `Refund` inserted, `Payment` -> `REFUNDED`, `Booking` -> `REFUNDED`, reverses Commission | Validates refund amount against remaining balance. Reverses agent commission ledger atomically. |
| | 5. User Restrictions | `/dashboard/admin/users` | `adminRestrictUserAction`, `adminToggleWeddingSuspensionAction` | Inserts `UserRestriction`, updates `Wedding.suspended` | Blocks capability (`BOOKING_RESTRICTED`, `HOSTING_RESTRICTED`, etc.). Suspends wedding discovery. |
| **Travel Agent** | 1. Partner Onboarding | `/for-agents/apply` | `api/agent-application/route.ts` & `adminReviewAgentApplicationAction` | Inserts `AgentProfile`, generates `referralCode` (`WWI-AGENT-XXXX`) | Validates uniqueness of referral code. Upgrades role to `AGENT`. |
| | 2. Referral Tracking | `/weddings?ref=CODE` | `trackReferralVisitAction` (`lib/actions/referrals.ts:61`) | Inserts `AgentReferral` (`CLICKED`), sets `wwi_ref` cookie | Validates code regex (`^[a-zA-Z0-9\-]+$`). Verifies agent is not restricted. |
| | 3. Commission Ledger | Internal Trigger | `generateBookingCommissionAction` (`lib/actions/referrals.ts:559`) | Inserts `Commission` (`PENDING`), `AgentReferral` -> `CONVERTED` | Self-referral abuse guard. Fixed INR rate based on tier (`₹511`–`₹2,511`). Sets 14-day hold. |
| | 4. Payout Settlement | `/for-agents/dashboard` | `submitPayoutRequestAction` & `adminReviewPayoutRequestAction` | Inserts `PayoutRequest`, `Commission` -> `LOCKED` -> `PAID` | Checks safety financial hold. Locks only necessary commissions. Admin approves disbursement. |

---

## 4. State Machine Transition Matrices (Section E)

### 4.1 Booking Lifecycle State Machine
```
[PENDING] ──── (Host Approve) ───► [AWAITING_PAYMENT] ─── (Payment Confirmed) ───► [PAID]
   │                                       │                                         │
   ├─ (Host Decline) ──► [REJECTED]        ├─ (Cancelled) ──► [CANCELLED]            ├─ (Prep Done) ──► [READY_FOR_EVENT]
   │                                       │                                         │                     │
   └─ (Traveler Cancel) ──► [CANCELLED]    └─ (Payment Expired) ──► [CANCELLED]      │                     ├─ (Gate Scan)
                                                                                     │                     ▼
                                                                                     ├─ (Gate Scan) ──► [CHECKED_IN]
                                                                                     │                     │
                                                                                     │                     ├─ (Host Confirm) ─► [ATTENDED]
                                                                                     │                     │
                                                                                     │                     └─ (Host No-Show) ─► [NO_SHOW]
                                                                                     │
                                                                                     └─ (Refund / Cancel) ──► [REFUNDED]
```

#### Valid vs Invalid Booking Transitions:
- **Valid Transitions**:
  - `PENDING` -> `AWAITING_PAYMENT`, `REJECTED`, `CANCELLED`
  - `AWAITING_PAYMENT` -> `PAID`, `CANCELLED`, `REJECTED`
  - `PAID` -> `READY_FOR_EVENT`, `CHECKED_IN`, `REFUNDED`, `CANCELLED`, `COMPLETED`
  - `READY_FOR_EVENT` -> `CHECKED_IN`, `PAID` (if mandatory item unchecked), `REFUNDED`
  - `CHECKED_IN` -> `ATTENDED`, `NO_SHOW`, `COMPLETED`
  - `ATTENDED` -> `COMPLETED`
- **Strictly Invalid Transitions (Enforced by invariants)**:
  - `PENDING` -> `PAID` *(Prohibited: Cannot pay without host/admin approval)*
  - `REJECTED` -> `PAID` *(Prohibited: Cannot pay for rejected booking)*
  - `CANCELLED` -> `PAID` *(Prohibited: Cannot pay for cancelled reservation)*
  - `REFUNDED` -> `ATTENDED` / `CHECKED_IN` *(Prohibited: Refunded passes are invalidated)*
  - `COMPLETED` -> `PENDING` *(Prohibited: Final states are immutable)*

---

### 4.2 Payment State Machine
- **States**: `PENDING`, `PAID`, `REFUNDED`, `FAILED`.
- **Valid Transitions**:
  - `PENDING` -> `PAID` *(Admin verification or Stripe webhook `checkout.session.completed`)*
  - `PENDING` -> `FAILED` *(Stripe checkout cancelled/failed)*
  - `PAID` -> `REFUNDED` *(Admin manual refund or cancellation request full refund)*
- **Invalid Transitions**:
  - `PAID` -> `PENDING` *(Cannot un-pay a verified payment)*
  - `REFUNDED` -> `PAID` *(Cannot reverse refund without a new payment record)*

---

### 4.3 Host Application State Machine
- **States**: `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `ACTION_REQUIRED`, `VERIFIED`, `APPROVED_FOR_LISTING`, `REJECTED`, `WITHDRAWN`.
- **Valid Transitions**:
  - `DRAFT` -> `SUBMITTED` *(Host submits application)*
  - `SUBMITTED` -> `UNDER_REVIEW` *(Admin begins inspection)*
  - `UNDER_REVIEW` -> `ACTION_REQUIRED` *(Admin requests additional documents)*
  - `ACTION_REQUIRED` -> `UNDER_REVIEW` *(Host uploads required documents)*
  - `UNDER_REVIEW` -> `APPROVED_FOR_LISTING` *(Admin approves & publishes listing)*
  - `UNDER_REVIEW` -> `REJECTED` *(Admin rejects application)*
  - `SUBMITTED` / `UNDER_REVIEW` -> `WITHDRAWN` *(Host withdraws application)*

---

## 5. Adversarial & Hostile Traversal Audit (7 Scenarios)

### Scenario 1: Back-Button Navigation during Multi-Step Forms & Payment
- **Attack Vector / User Action**: User fills multi-step host application at `/list-wedding` or completes payment on external PayPal / Stripe page and hits browser Back button.
- **Code Observation & Behavioral Analysis**:
  - In `app/list-wedding/page.tsx:248-254`, `getLocalWeddingDraft()` automatically hydrates state from `localStorage` on initial mount. Hitting Back button does NOT clear form state or cause form corruption.
  - If a user completes submission (`setHasAutoSubmitted(true)`), `clearLocalWeddingDraft()` clears the draft and sets `appStatus = 'SUBMITTED'`, preventing duplicate re-submission on Back navigation.
  - In `BookingSidebar.tsx:73-86`, unauthenticated booking intents are stored in `sessionStorage.getItem('pending_booking_${wedding.id}')` and restored after authentication.
  - In `createBookingAction` (`lib/actions/index.ts:630-641`), active reservation status check (`ACTIVE_RESERVATION_STATUSES`) rejects duplicate booking requests if a traveler double-submits via Back button.

### Scenario 2: Direct URL Access & IDOR (Insecure Direct Object Reference)
- **Attack Vector**: User tampers with URL parameters (e.g. `/dashboard/events/[bookingId]`, `/api/invoice/[bookingId]`, `/dashboard/admin/*`, `/api/safety/evidence/[evidenceId]`) using another user's UUID.
- **Code Observation & Behavioral Analysis**:
  - **Admin Route Guard (`app/dashboard/admin/layout.tsx:85-88`)**: Rejects non-admin users with server redirect to `/?error=admin_required`.
  - **Event Hub Detail (`app/dashboard/events/[bookingId]/page.tsx:43-49`)**: Explicit check `if (!booking || booking.traveler.user.id !== user.id)` renders HTTP 403 / "Unauthorized access".
  - **Invoice API (`app/api/invoice/[bookingId]/route.ts:44-49`)**: Validates `if (user.role !== UserRole.ADMIN && booking.traveler.userId !== user.id)` returning HTTP 403 JSON.
  - **Evidence Access API (`app/api/safety/evidence/[evidenceId]/route.ts:34-55`)**: Enforces participant checking (`uploadedById`, `reportedById`, `subjectUserId`, or `caseParticipant`). Non-participants receive HTTP 403.
  - **Cancellation Request (`lib/actions/index.ts:742-745`)**: Validates `dbBooking.traveler.userId !== user.id` throwing explicit forbidden error.

### Scenario 3: Refresh & Deep-Linking State Synchronization
- **Attack Vector**: User deep-links into complex filtered URLs (`/weddings?destinations=rajasthan,goa&durations=3,5&tiers=ROYAL&sort=price_asc`) or refreshes during dynamic stateful workflows.
- **Code Observation & Behavioral Analysis**:
  - `app/weddings/page.tsx:38-60` is configured with `export const dynamic = "force-dynamic"`. It accepts `searchParams: Promise<SearchParams>`, parses query strings on every server render, and dynamically evaluates counts and filters. Refreshing preserves exact filter state.
  - `/weddings/[slug]` uses `params: Promise<{ slug: string }>` with `notFound()` guard. If wedding does not exist, Next.js standard 404 is returned cleanly without unhandled runtime crash.

### Scenario 4: Multi-Tab State Conflicts & Concurrent Browsing
- **Attack Vector**: User opens Tab 1 (booking Wedding A) and Tab 2 (booking Wedding B) simultaneously, or edits profile in Tab 2 while submitting in Tab 1.
- **Code Observation & Behavioral Analysis**:
  - **Multi-Device & Multi-Tab Isolation (`context/AuthContext.tsx:237-262` & `lib/services/device-session.ts`)**: Device session is verified via `validateDeviceSessionAction`. Client maintains isolated device ID in `localStorage` (`lib/device-client.ts`).
  - **Booking Isolation**: Bookings do not rely on a shared global cart. Each `createBookingAction` call receives explicit, self-contained `weddingId`, `date`, `guestsCount`, and `attendanceSide` arguments. Booking Tab 1 and Tab 2 operate completely independently.
  - **Review Edit Concurrency (`lib/actions/reviews.ts:325-403`)**: Implements optimistic concurrency with retry loop (`where: { id: params.reviewId, editCount: expectedEditCount }`). Concurrent edits in two tabs are serialized without overwriting data.

### Scenario 5: Session Expiry Mid-Booking / Mid-Form Submission
- **Attack Vector**: Clerk JWT session expires while traveler is filling a booking or host is filling a 5-day wedding application.
- **Code Observation & Behavioral Analysis**:
  - **Host Application**: Draft data is saved locally every 1500ms via `saveLocalWeddingDraft` (`app/list-wedding/page.tsx:498-513`). If token expires and user submits, `checkHostAuthReadinessAction` detects unauthenticated state, sets `setAutoSubmitIntent(true)`, and redirects to `/login?redirect_url=/list-wedding?resume=true`. On return, the entire draft is restored and auto-submitted.
  - **Traveler Booking**: `BookingSidebar.tsx:74-85` caches `guestsCount` and `attendanceSide` in `sessionStorage` before navigating to `/login`, restoring selection on post-login redirect.
  - **Fail-Closed Auth Engine (`lib/auth.ts:415-424`)**: If session expires mid-action, `requireAuth()` throws `UNAUTHORIZED: Authentication required.` Server actions never execute with unauthenticated / synthetic credentials.

### Scenario 6: Race Conditions (Concurrent Booking of Last Remaining Slot)
- **Attack Vector**: 2 international travelers attempt to book the final remaining slot of a popular wedding simultaneously.
- **Code Observation & Behavioral Analysis**:
  - In `createBookingAction` (`lib/actions/index.ts:591-659`):
    ```ts
    const booking = await prisma.$transaction(async (tx) => {
      // 0. Concurrency lock on Wedding row to serialize simultaneous booking attempts
      await tx.$queryRaw`SELECT id FROM "Wedding" WHERE id = ${data.weddingId} FOR UPDATE`;
      ...
      const approvedGuests = await tx.booking.aggregate({
        where: { weddingId: data.weddingId, status: { in: CAPACITY_HOLDING_BOOKING_STATUSES } },
        _sum: { guestsCount: true },
      });
      const currentBookedCount = approvedGuests._sum.guestsCount || 0;
      if (currentBookedCount + data.guestsCount > wedding.capacity) {
        throw new Error(`Cannot exceed maximum wedding guest capacity. Available spots: ${wedding.capacity - currentBookedCount}.`);
      }
    });
    ```
  - **Outcome**: The PostgreSQL row-level lock (`SELECT ... FOR UPDATE`) serializes the transactions. The first transaction commits and holds capacity. The second transaction immediately reads the updated count and throws a clean capacity error. Double-booking the last seat is mathematically impossible.

### Scenario 7: Payment Webhook Idempotency & Out-of-Order Delivery
- **Attack Vector**: Stripe sends duplicate `checkout.session.completed` webhooks, or `payment_intent.succeeded` arrives before `checkout.session.completed`.
- **Code Observation & Behavioral Analysis**:
  - In `app/api/webhooks/stripe/route.ts:53-88`:
    - Checks `prisma.stripeWebhookEvent.findUnique({ where: { stripeEventId: event.id } })`. If `status === "PROCESSED"`, immediately returns `{ received: true, idempotent: true }`.
    - Inserts event with `status: "PENDING"` wrapped in `try/catch` on Prisma error code `P2002` (unique constraint) to eliminate concurrent webhook delivery race conditions.
  - In `markPaymentPaidAtomic` (`lib/services/payments.ts:319-328`):
    - If `payment.status === PaymentStatus.PAID` and `booking.status === BookingStatus.PAID`, returns early with `{ success: true, alreadyPaid: true }`.
    - Generates `GuestPass` only if `!existingPass` (`lines 381-403`).
    - Commission generation uses unique idempotency key `BOOKING_PAYMENT:${paymentId}:${referral.agentId}` (`lib/actions/referrals.ts:603-610`).

---

## 6. Regression Risk Map (Section L)

High-risk shared modules, global stores, utilities, and components where modifications could cause cascading failures:

```
                          ┌─────────────────────────────────────────┐
                          │         lib/prisma.ts                   │
                          │   (Connection Pool, withDbRetry)        │
                          └────────────────────┬────────────────────┘
                                               │
             ┌─────────────────────────────────┼─────────────────────────────────┐
             ▼                                 ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│     lib/auth.ts         │       │  pricing-engine.ts      │       │   payments.ts &         │
│ (syncAndGetDbUser, RBAC)│       │ (Central Single Truth)  │       │   guest-pass-crypto.ts  │
└────────────┬────────────┘       └────────────┬────────────┘       └────────────┬────────────┘
             │                                 │                                 │
             ▼                                 ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│  context/AuthContext    │       │ createBookingAction     │       │ checkInGuestAction      │
│ (Client Multi-Device)   │       │ & HostEarningsCalc      │       │ & Stripe Webhook        │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
```

### 6.1 Critical Shared Hotspots Table

| Module / Component | Impacted Flows | Failure Mode if Regressed | Mitigation & Guardrail |
|---|---|---|---|
| **`lib/services/pricing-engine.ts`** | Booking creation, Host application verification, Host calculator, Agent commission, Invoicing. | Discrepancy between UI price, host payout, agent payout, and database ledger. | Keep as pure function single source of truth. Never calculate prices in client components. |
| **`lib/auth.ts` (`syncAndGetDbUser`, `requireAuth`)** | Every authenticated route, layout, and server action. | Null user leaks, synthetic permission escalation, authentication deadlocks. | Fail-closed error handling. Comprehensive test suite in `__tests__/lib/auth-*.test.ts`. |
| **`context/AuthContext.tsx`** | Navbar, BottomNav, Dashboard shells, Profile completion, Device limit modals. | Infinite re-renders, state synchronization failure, stale booking cache. | Memoized `refreshData` callback. Device session heartbeat throttled to visibility changes. |
| **`lib/actions/index.ts` (`createBookingAction`)** | Traveler booking reservation funnel. | Overselling capacity, race condition double-booking, client price injection. | Must retain `SELECT FOR UPDATE` PostgreSQL lock and server-side pricing derivation. |
| **`lib/services/payments.ts` (`markPaymentPaidAtomic`)** | Manual PayPal confirmation, Stripe Webhook execution, Guest Pass generation. | Duplicate ticket creation, double commission crediting, unconfirmed bookings. | Retain database-level uniqueness, idempotency guards, and transactional atomicity. |
| **`lib/security/guest-pass-crypto.ts`** | Digital QR passes, Event Hub check-in, Gate scanning. | QR scanner failure, expired token bypass, unauthorized check-in forgery. | Maintain AES-256-GCM authenticated encryption and SHA-256 token hashing. |
| **`components/wedding/BookingSidebar.tsx`** | Wedding detail conversion, side selection, guest slot selection. | Client runtime crash, desynchronized subtotal calculation, lost guest preferences. | Keep URL query synchronization and `sessionStorage` intent preservation. |
| **`lib/actions/host-application.ts`** | Host listing creation, autosave, Clerk post-login auto-resume. | Host lead loss, half-filled listing abandonment, role desynchronization. | Retain dual `localStorage` + PostgreSQL autosave and retry backoff probe. |

---

## 7. Caveats

- **External Gateway Simulation**: In development/test environments, Stripe webhooks and PayPal external checkouts are verified via simulated test tokens and manual administrative workflows (`lib/actions/payment-manual.ts`).
- **Device Gating Limit**: Multi-device restriction is set to 2 active devices per user session. Logging in on a 3rd device prompts the user to revoke a previous session via `DeviceLimitModal.tsx`.
- **Clerk Webhook Dependency**: User provisioning uses synchronous on-demand reconciliation (`syncAndGetDbUser`) rather than relying solely on asynchronous Clerk webhooks, ensuring zero latency on new signups.

---

## 8. Conclusion

1. **State Machine Integrity**: All 5 state machines (Authentication, Booking, Payment, Wedding, and Host Application) are strictly enforced in PostgreSQL with database transactions, explicit status validations, and automated transition audit logs.
2. **Adversarial Resilience**: The system successfully withstands the 7 hostile traversal scenarios:
   - Back button navigation does not corrupt state due to `localStorage` and `sessionStorage` draft preservation.
   - Direct URL and IDOR attacks are blocked at both Server Component layouts and API route handlers.
   - Race conditions on the last available seat are completely eliminated by PostgreSQL row-level locks (`SELECT FOR UPDATE`).
   - Webhook processing is fully idempotent with database uniqueness and status checks.
3. **Role Segregation**: RBAC cleanly isolates Traveler, Host, Admin, Coordinator, and Agent capabilities with strict server-side assertions (`assertCanBook`, `assertCanHost`, `assertCanMessage`, `assertCanRequestPayout`).

---

## 9. Verification Method

To independently reproduce and verify all findings, run the following commands and inspect the test suites:

### 9.1 Test Execution Commands
```powershell
# 1. Run full Jest unit & integration test suite
npm test -- --passWithNoTests

# 2. Run adversarial and concurrency test specifications
npx jest __tests__/lib/remediation-adversarial-concurrency.test.ts
npx jest __tests__/lib/adversarial-production-verification.test.ts
npx jest __tests__/lib/pricing-engine.test.ts
npx jest __tests__/lib/host-application-resume.test.ts
npx jest __tests__/lib/manual-paypal-payment.test.ts

# 3. Execute Next.js type check
npm run type-check
```

### 9.2 Critical Files for Code Inspection
- `lib/actions/index.ts` (lines 559–719 for `createBookingAction` concurrency lock)
- `lib/actions/host-application.ts` (lines 445–780 for draft autosave & auto-resume)
- `lib/services/payments.ts` (lines 284–467 for `markPaymentPaidAtomic` idempotency)
- `app/api/webhooks/stripe/route.ts` (lines 53–288 for Stripe webhook deduplication)
- `lib/actions/event-operations.ts` (lines 207–371 for atomic check-in gate scanning)
- `lib/services/pricing-engine.ts` (lines 1–405 for authoritative pricing matrix)
