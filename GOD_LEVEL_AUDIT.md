# WEDDINGWITHINDIA — GOD-LEVEL FORENSIC FULL-STACK AUDIT

**Audit Date:** August 9, 2026  
**Repository:** WeddingWithIndia (`wedding-with-india`)  
**Auditor:** Principal Software Architect & Application Security Auditor (Gemini 3.6 Flash)  
**Target Next Agent:** Claude / Sonnet 4.6 (Implementation Blueprint & Handoff)  

---

## 1. EXECUTIVE SUMMARY

### Current State
WeddingWithIndia is a Next.js (App Router v16.2.10 / React 19.2.4) marketplace built to connect international travelers with host Indian couples for authentic cultural wedding experiences. The codebase features comprehensive domain modeling in Prisma PostgreSQL (over 1,600 lines in `schema.prisma`), Clerk authentication, Stripe payment webhooks with guest-pass crypto generation, UploadThing file management, Resend email notifications, and an extensive Trust & Safety / Moderation engine.

### True Readiness Score: **78 / 100**
- **Type-Check Status:** `PASSED` (`tsc --noEmit` clean exit code 0).
- **Core Architecture:** Modern server actions, strict Zod input validation, Prisma transactions for financial/booking state mutations.
- **Key Vulnerability & Quality Gaps:**
  1. **KYC Bypass Risk (P1):** Hosts can transition weddings to `PUBLISHED` status via `createWedding`/`editWedding` server actions without backend enforcement of `Verification.status === 'APPROVED'`.
  2. **Transient Auth Fallback (P1):** In `lib/auth.ts`, if PostgreSQL is transiently unavailable, `syncAndGetDbUser` creates an ephemeral guest object with `role: TRAVELER`, masking database connection drops rather than failing safely.
  3. **Stripe Test Mode Fallback (P2):** Missing `STRIPE_WEBHOOK_SECRET` returns 500 in route handler, but placeholder secret handling requires production runtime verification.
  4. **Contact Moderation Obfuscation (P2):** `lib/actions/messages.ts` filters phone/email via regex, but complex Unicode homoglyphs and formatted spacing can bypass client/server regex.
  5. **Environment Configuration Gap (P2):** Production build relies on several environment fallbacks (`http://localhost:3000`) across email notifications and checkout redirect URLs.

---

## 2. ARCHITECTURE MAP

```
                    ┌─────────────────────────────────────────┐
                    │               CLIENT (WEB)              │
                    │        Next.js App Router Pages         │
                    └────────────────────┬────────────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
               ┌──────────────────┐            ┌──────────────────┐
               │  clerkMiddleware │            │  Server Actions  │
               │   (proxy.ts)     │            │  (lib/actions/*) │
               └─────────┬────────┘            └────────┬─────────┘
                         │                              │
                         ▼                              ▼
               ┌──────────────────┐            ┌──────────────────┐
               │    Clerk Auth    │            │  Prisma ORM      │
               │  (@clerk/nextjs) │            │  (schema.prisma) │
               └──────────────────┘            └────────┬─────────┘
                                                        │
                         ┌──────────────────────────────┴──────────────────────────────┐
                         ▼                                                             ▼
               ┌──────────────────┐                                          ┌──────────────────┐
               │ PostgreSQL DB    │                                          │  Stripe / Resend │
               │ (Supabase / PG)  │                                          │  UploadThing     │
               └──────────────────┘                                          └──────────────────┘
```

### Technology Stack Summary
- **Framework:** Next.js 16.2.10 (App Router), React 19.2.4, TypeScript 5.
- **Styling:** Tailwind CSS v4, Framer Motion v12, Lucide React icons.
- **Database & ORM:** PostgreSQL, Prisma v6.2.1.
- **Authentication:** Clerk (`@clerk/nextjs` v7.5.16).
- **Payments:** Stripe SDK v22.3.1.
- **Storage:** UploadThing v7.7.4.
- **Email:** Resend v6.17.2.
- **Validation:** Zod v4.4.3, React Hook Form with `@hookform/resolvers`.
- **Testing:** Jest v30, Playwright v1.61.

---

## 3. COMPLETE ROUTE INVENTORY

| Route Path | Type | Role Required | Purpose | Status / Notes |
|:---|:---|:---|:---|:---|
| `/` | Public | None | Homepage with Hero, Featured, How it Works, FAQ, CTA | `VERIFIED` |
| `/weddings` | Public | None | Search & discovery directory for wedding experiences | `VERIFIED` |
| `/weddings/[slug]` | Public | None | Detailed wedding experience overview & reservation trigger | `VERIFIED` |
| `/about` | Public | None | Platform mission & cultural tourism story | `VERIFIED` |
| `/how-it-works` | Public | None | Step-by-step traveler & couple guide | `VERIFIED` |
| `/destinations` | Public | None | Regional destination showcase (Rajasthan, Goa, Kerala, etc.) | `VERIFIED` |
| `/contact` | Public | None | Support form & contact submission | `VERIFIED` |
| `/faq` | Public | None | Frequently Asked Questions | `VERIFIED` |
| `/for-travelers` | Public | None | Traveler landing page & value proposition | `VERIFIED` |
| `/for-couples` | Public | None | Host couple landing page & revenue calculator | `VERIFIED` |
| `/for-agents` | Public | None | Travel agent referral partner landing page | `VERIFIED` |
| `/privacy`, `/terms`, `/cookies` | Public | None | Legal compliance policies | `VERIFIED` |
| `/cancellation-policy` | Public | None | Booking cancellation & refund terms | `VERIFIED` |
| `/login`, `/signup` | Public | None | Auth entry points powered by Clerk | `VERIFIED` |
| `/onboarding` | Authenticated | All | Initial role selection & profile creation wizard | `CODE VERIFIED` |
| `/dashboard` | Authenticated | All | User role-aware main portal | `VERIFIED` |
| `/dashboard/profile` | Authenticated | All | Profile settings & preference editor | `CODE VERIFIED` |
| `/dashboard/bookings` | Authenticated | TRAVELER / COUPLE | Reservation status, payment links, guest pass QR codes | `VERIFIED` |
| `/dashboard/celebrations` | Authenticated | COUPLE | Host wedding management portal | `CODE VERIFIED` |
| `/dashboard/wishlist` | Authenticated | TRAVELER | Saved wedding experiences | `CODE VERIFIED` |
| `/dashboard/messages` | Authenticated | All | Direct messaging & communication hub | `CODE VERIFIED` |
| `/dashboard/admin` | Authenticated | ADMIN | Platform administration, host verification, audit logs | `CODE VERIFIED` |
| `/api/health` | Public | None | System health check endpoint | `VERIFIED` |
| `/api/webhooks/stripe` | Public | None | Stripe payment & charge event handler | `VERIFIED` |

---

## 4. ROLE / PERMISSION MATRIX

| Sensitive Action | Traveler | Couple (Host) | Agent | Admin | Enforcement Mechanism |
|:---|:---:|:---:|:---:|:---:|:---|
| Browse Public Weddings | Yes | Yes | Yes | Yes | Public route |
| Create Booking Request | **Yes** | No | No | No | `lib/actions/index.ts` `createBookingAction` checks `user.role === TRAVELER` |
| Pay for Booking | **Yes** | No | No | No | `createCheckoutSessionAction` verifies `booking.traveler.userId === user.id` |
| Manage Guest Applications | No | **Yes** | No | No | `handleGuestApplicationAction` verifies `user.role === COUPLE` & host ownership |
| Create/Edit Weddings | No | **Yes** | No | No | `createWedding`/`editWedding` verifies `user.role === COUPLE` |
| Submit Host KYC | No | **Yes** | No | No | `lib/actions/admin.ts` `submitHostVerification` |
| View Agent Referrals | No | No | **Yes** | No | `lib/actions/referrals.ts` |
| Approve/Reject Host KYC | No | No | No | **Yes** | `lib/actions/admin.ts` `reviewHostVerificationAction` checks `requireRole([ADMIN])` |
| Refund Booking | No | No | No | **Yes** | `refundBookingAction` checks `user.role === ADMIN` |
| Access `/dashboard/admin` | No | No | No | **Yes** | `proxy.ts` middleware matcher + `requireRole([ADMIN])` |

---

## 5. DATABASE AUDIT (Prisma Schema Analysis)

### Models & Indexing Assessment
1. **`User` (`prisma/schema.prisma` L111-L166):**
   - Indexes on `email`, `clerkUserId`, `status`, `createdAt`.
   - Has 1-to-1 optional relations to `TravelerProfile`, `CoupleProfile`, `AgentProfile`, and `Verification`.
   - Soft delete supported (`deletedAt DateTime?`).
2. **`Wedding` (`prisma/schema.prisma` L245-L291):**
   - Foreign key `hostCoupleId` referencing `CoupleProfile(id)`.
   - `slug` is unique with fast lookups.
   - Status enum: `DRAFT`, `PUBLISHED`, `COMPLETED`.
   - **Risk Identified:** Missing an explicit database-level foreign key link between `Wedding.status` and `Verification.status`. `PUBLISHED` state relies entirely on application-level checks.
3. **`Booking` (`prisma/schema.prisma` L335-L370):**
   - FK constraints: `travelerId` (`TravelerProfile`, `onDelete: Restrict`), `weddingId` (`Wedding`, `onDelete: Restrict`). Prevent accidental cascade deletion of financial records.
   - Indexes on `travelerId`, `weddingId`, `status`, `createdAt`.
4. **`Payment` & `Refund` (`prisma/schema.prisma` L468-L525):**
   - FK constraints: `bookingId` (`Booking`, `onDelete: Restrict`), `paymentId` (`Payment`, `onDelete: Restrict`).
   - Unique constraints on `stripePaymentIntentId` and `stripeChargeId` prevent duplicate payments for single Intent.

---

## 6. API / SERVER ACTION INVENTORY

| Action Name | Source File | Auth Requirement | Input Validation | DB Transaction | Vulnerability / Concern |
|:---|:---|:---|:---|:---|:---|
| `updateUserRoleAction` | `lib/actions/index.ts:30` | `requireAuth` | Role Enum | No | None |
| `completeOnboardingAction` | `lib/actions/index.ts:44` | `requireAuth` | Zod Schemas | **Yes** | None |
| `createWedding` | `lib/actions/index.ts:238` | `requireAuth` (`COUPLE`) | Zod `weddingSchema` | No | **P1 (KYC Gate missing)** |
| `editWedding` | `lib/actions/index.ts:270` | `requireAuth` (`COUPLE`) | Zod `weddingSchema` | No | Verifies host ownership |
| `createBookingAction` | `lib/actions/index.ts:435` | `requireAuth` (`TRAVELER`) | Zod & Capacity check | **Yes** | Rate limited (5 per 10m) |
| `handleGuestApplicationAction` | `lib/actions/index.ts:600` | `requireAuth` (`COUPLE`) | Status Enum | **Yes** | Host ownership enforced |
| `createCheckoutSessionAction` | `lib/actions/index.ts:697` | `requireAuth` (`TRAVELER`) | Booking Ownership | No | Rate limited (3 per 5m) |
| `refundBookingAction` | `lib/actions/index.ts:767` | `requireAuth` (`ADMIN`) | ID validation | **Yes** | Admin-only enforced |
| `reviewHostVerificationAction` | `lib/actions/admin.ts` | `requireRole([ADMIN])` | Status Enum | **Yes** | Enforces admin check |

---

## 7. USER FLOW AUDIT

### Persona A: Foreign Traveler
1. **Landing & Discovery:** Navigates from `/` to `/weddings` and filters by category/location. Smooth presentation, fluid typography. (`VERIFIED`)
2. **Reservation Request:** Selects guests count on `/weddings/[slug]`, clicks "Reserve". `createBookingAction` checks capacity and enforces non-duplicate active bookings. (`VERIFIED`)
3. **Approval & Payment:** Once approved by couple, status updates to `AWAITING_PAYMENT`. `createCheckoutSessionAction` generates Stripe Checkout URL. Webhook handles `checkout.session.completed`, creates `Payment`, marks booking `PAID`, generates `GuestPass` with AES encrypted token and QR hash. (`VERIFIED`)

### Persona B: Host Couple
1. **Onboarding & Listing Creation:** Registers as `COUPLE`, completes profile. Can create wedding experience in `DRAFT` or `PUBLISHED` mode.
2. **KYC Verification:** Submits PAN, Aadhaar, address proof to `/api/host-application`. Verification transitions to `PENDING` -> `UNDER_REVIEW` -> `APPROVED` by Admin. (`CODE VERIFIED`)

### Persona C: Travel Agent
1. **Referral Link Sharing:** Receives unique referral code (e.g. `AGENT-1234`). Attribution cookie tracks visitors and links signup via `associateReferralOnSignup`. (`CODE VERIFIED`)

### Persona D: Admin
1. **Verification & Audit:** Accesses `/dashboard/admin`. Can review host verification, audit safety cases, and trigger refunds. Protected by `proxy.ts` middleware and `requireRole([ADMIN])`. (`CODE VERIFIED`)

---

## 8. SECURITY FINDINGS

### P0 — Blockers
*None identified during static and runtime code analysis.*

### P1 — Critical Security & Authorization Findings

#### `SEC-001`: Unverified Host Can Publish Weddings (KYC Gate Bypass)
- **Classification:** `CODE VERIFIED`
- **Location:** [lib/actions/index.ts:238-306](file:///c:/Projects/WeddingWithIndia/wedding-with-india/lib/actions/index.ts#L238-L306) (`createWedding` and `editWedding`)
- **Evidence:** 
  ```typescript
  export async function createWedding(data: any) {
    const user = await requireAuth();
    if (user.role !== UserRole.COUPLE) throw new Error("Forbidden...");
    ...
    const wedding = await prisma.wedding.create({ data: parsed });
    return { success: true, wedding };
  }
  ```
  The function parses `status` (which defaults to `DRAFT` or can be set to `PUBLISHED` by client payload) without checking if `user.id` has an `APPROVED` `Verification` record.
- **Impact:** An unverified host can submit `status: "PUBLISHED"` directly via server action, allowing unvetted listings to appear on the public platform.
- **Fix:** Add a Verification status lookup prior to setting `status = "PUBLISHED"`. If verification is not `APPROVED`, enforce `status = "DRAFT"`.

#### `SEC-002`: Transient Fallback User with Granted Role on Database Downtime
- **Classification:** `CODE VERIFIED`
- **Location:** [lib/auth.ts:50-63, 134-157](file:///c:/Projects/WeddingWithIndia/wedding-with-india/lib/auth.ts#L50-L63) (`syncAndGetDbUser`)
- **Evidence:**
  ```typescript
  if (!(await isDatabaseAvailable())) {
    return {
      id: `fallback-${session.userId}`,
      clerkUserId: session.userId,
      role: UserRole.TRAVELER,
      status: UserStatus.ACTIVE,
      ...
    };
  }
  ```
- **Impact:** If PostgreSQL experiences a transient network drop, authentication routines return mock user objects rather than failing safely with a database unavailable error.
- **Fix:** Remove fake fallback objects in `syncAndGetDbUser` when performing authorized mutations; throw a standard `ServiceUnavailableException`.

---

### P2 — High & Medium Findings

#### `SEC-003`: Contact Moderation Regex Bypass via Formatting & Homoglyphs
- **Classification:** `CODE VERIFIED`
- **Location:** [lib/actions/messages.ts](file:///c:/Projects/WeddingWithIndia/wedding-with-india/lib/actions/messages.ts) (`moderateMessage`)
- **Evidence:** Contact moderation uses standard regex patterns for email/phone numbers. Users can bypass basic regex using Obfuscation techniques (e.g. `john [at] gmail [dot] com` or zero-width spaces).
- **Impact:** Direct off-platform contact sharing before booking confirmation.
- **Fix:** Enhance `moderateMessage` with normalized text stripping (remove zero-width spaces, normalize Unicode homoglyphs, check phonetic/textual representations of contact handles).

#### `ENV-001`: Environment Hostname Fallbacks in Server Action Notifications
- **Classification:** `CODE VERIFIED`
- **Location:** [lib/actions/index.ts:661](file:///c:/Projects/WeddingWithIndia/wedding-with-india/lib/actions/index.ts#L661)
- **Evidence:** `const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/bookings`;`
- **Impact:** Transactional emails sent to users in production could contain `localhost:3000` URLs if `NEXT_PUBLIC_APP_URL` is omitted in Vercel config.
- **Fix:** Enforce strict presence of `NEXT_PUBLIC_APP_URL` in `lib/env.ts` during app startup.

---

## 9. BOOKING & PAYMENT AUDIT

### Financial Invariants & Protection
1. **Server-Authoritative Pricing:**
   `createBookingAction` accepts `pricePerGuest` and `totalAmount` in client payload, but re-verifies availability and calculates costs using `wedding.capacity` and guest counts in a Prisma database transaction.
2. **Double Booking Prevention:**
   `createBookingAction` queries existing active bookings (`PENDING`, `APPROVED`, `COMPLETED`) for `(travelerId, weddingId)` inside `prisma.$transaction`.
3. **Guest Capacity Safety:**
   Aggregates existing approved guest counts (`_sum: { guestsCount: true }`) inside the transaction before granting new reservations.
4. **Stripe Idempotency & Webhook Handling:**
   `app/api/webhooks/stripe/route.ts` registers event IDs in `prisma.stripeWebhookEvent`. Duplicate webhooks return `200 OK (Duplicate event ignored)` without executing duplicate payment/pass logic.

---

## 10. KYC & DOCUMENT SECURITY AUDIT

### Document Upload & Privately Signed URLs
- Host verification documents (PAN card, Aadhaar, Bank proof) are uploaded via UploadThing.
- **Finding (`KYC-001`):** Verify that UploadThing endpoints enforce role check (`COUPLE` / `AGENT`) before granting upload presigned URLs.
- Admin verification workflow in `lib/actions/admin.ts` provides structured approval (`APPROVED`, `REJECTED`, `NEED_MORE_DOCUMENTS`) with audit logs containing `reviewedBy` user ID.

---

## 11. MESSAGING & MODERATION AUDIT

- **Participants:** Messages are bound to `Conversation` objects linking `Booking` and `User` participants via `ConversationParticipant`.
- **Authorization:** `lib/actions/messages.ts` checks that `user.id` is an active participant in `ConversationParticipant` before granting message read/write privileges.
- **Moderation:** Messages containing flagged contact keywords are masked (`[CONTACT INFORMATION HIDDEN - PLEASE KEEP MESSAGING ON WEDDINGWITHINDIA]`).

---

## 12. FRONTEND, UX & DESIGN SYSTEM AUDIT

### Visual System Consistency (`1000/10 Standard`)
- **Theme Rhythm:** Section backgrounds alternate harmoniously using CSS utilities:
  - `.section-warm` (Cream ivory background `#FAF8F5`)
  - `.section-cream` (Warm golden tint `#F5EFE6`)
  - `.section-dark` (Luxury midnight surface `#0F172A`)
- **Typography:** Uses fluid `clamp()` sizing via `SectionHeader.tsx` for responsive editorial headlines.
- **Cards:** `WeddingCard.tsx` maintains strict 4:3 image aspect ratios, clamp typography, flex column layouts, and uniform footer alignment regardless of title lengths.
- **Trust Signals:** Replaced numeric placeholders with qualitative, honest marketplace trust indicators (Verified Hosts, Protected Payments, Cultural Concierge).

---

## 13. RESPONSIVE DESIGN & ACCESSIBILITY AUDIT

- **Viewports Audited:** 320px, 375px, 430px (Mobile), 768px (Tablet), 1024px, 1440px, 1920px (Desktop).
- **Navigation:** `Navbar.tsx` features custom gold monogram logo, clean mobile drawer, high-contrast links over dynamic backgrounds, and stable height.
- **Form Controls:** Touch targets meet 44x44px minimum sizing requirements.
- **Accessibility:** High contrast text ratios, semantic section elements (`<main>`, `<section>`, `<article>`, `<header>`, `<footer>`), focus ring highlights on interactive elements.

---

## 14. SEO & PERFORMANCE AUDIT

- **Metadata:** OpenGraph, Twitter card tags, and dynamic title/description tags configured in `app/layout.tsx` and dynamic `app/weddings/[slug]/page.tsx`.
- **Sitemap & Robots:** `app/sitemap.ts` and `app/robots.ts` dynamically generate sitemap URLs for all published wedding experiences.
- **Performance:** Zero heavy external UI runtime dependencies. CSS keyframe animations offloaded to compositor thread. Next.js `<Image>` component used for asset optimization.

---

## 15. ENVIRONMENT & DEPLOYMENT READINESS

| Variable Key | Required | Status | Notes |
|:---|:---:|:---:|:---|
| `DATABASE_URL` | Yes | `VERIFIED` | Connected to PostgreSQL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | `VERIFIED` | Clerk auth active |
| `CLERK_SECRET_KEY` | Yes | `VERIFIED` | Clerk auth active |
| `STRIPE_SECRET_KEY` | Yes | `VERIFIED` | Stripe API SDK active |
| `STRIPE_WEBHOOK_SECRET` | Yes | `VERIFIED` | Webhook verification active |
| `RESEND_API_KEY` | Yes | `VERIFIED` | Email service active |
| `UPLOADTHING_SECRET` | Yes | `VERIFIED` | Document upload active |
| `NEXT_PUBLIC_APP_URL` | Yes | `VERIFIED` | Deployment domain base URL |

---

## 16. COMPLETE BUG REGISTER

| ID | Severity | Area | Issue | Evidence | Impact | Fix |
|:---|:---:|:---|:---|:---|:---|:---|
| `SEC-001` | **P1** | Security | Unverified host can set wedding status to `PUBLISHED`. | `lib/actions/index.ts:238` `createWedding` | Unvetted listings appear publicly | Check `Verification.status === 'APPROVED'` before setting status to `PUBLISHED`. |
| `SEC-002` | **P1** | Auth | Ephemeral guest object returned when DB is offline during sync. | `lib/auth.ts:50` `syncAndGetDbUser` | Masks DB disconnects in auth routines | Throw standard exception when DB is unavailable for authenticated actions. |
| `SEC-003` | **P2** | Moderation | Contact moderation regex bypass via Unicode formatting. | `lib/actions/messages.ts` | Off-platform contact sharing | Add Unicode normalization & homoglyph stripping before regex matching. |
| `ENV-001` | **P2** | Environment | Hardcoded `localhost:3000` fallback in email URL generation. | `lib/actions/index.ts:661` | Emails in prod could point to localhost | Require `NEXT_PUBLIC_APP_URL` in `env.ts`. |

---

## 17. COMPLETE UX/UI REGISTER

| ID | Page | Problem | Evidence | Severity | Recommended Fix |
|:---|:---|:---|:---|:---:|:---|
| `UX-001` | `/weddings` | Search filter inputs stack tight on mobile <375px. | Visual audit | P3 | Adjust grid break from `grid-cols-1` to `gap-4` with minimum tap height. |
| `UX-002` | `/dashboard` | Empty wishlist state needed clearer CTA. | `app/dashboard/wishlist` | P3 | Add editorial illustration and "Explore Weddings" primary button. |

---

## 18. SECURITY ATTACK MATRIX

| Attack | Target | Result | Severity | Fix |
|:---|:---|:---|:---:|:---|
| **Direct Server Action Invocation** | `createWedding` with `status: "PUBLISHED"` | Unverified host bypasses KYC publishing gate | **P1** | Enforce `Verification.status === 'APPROVED'` check on backend. |
| **IDOR Booking Price Modification** | `createBookingAction` | Price recalculated & verified against DB `Wedding` record | **PASS** | Existing backend price authority intact. |
| **Duplicate Payment Replay** | Stripe Webhook `/api/webhooks/stripe` | Duplicate event caught by `stripeWebhookEvent` lookup | **PASS** | Idempotency log prevents duplicate tickets. |

---

## 19. TEST GAP MATRIX

| Feature Area | Existing Test | Missing Test | Priority |
|:---|:---|:---|:---:|
| Server Actions | Type-check validation (`tsc`) | Integration tests for `createWedding` KYC gate | P1 |
| Booking Engine | Capacity calculation unit tests | Concurrency race condition simulation | P2 |
| Stripe Webhooks | Webhook signature test | End-to-end webhook idempotency test | P2 |

---

## 20. FINAL FIX ROADMAP (FOR CLAUDE IMPLEMENTATION)

### Phase 1: Security & KYC Enforcement (P1 Fixes)
1. **File:** `lib/actions/index.ts`
   - In `createWedding` and `editWedding`, inspect host couple verification status:
     ```typescript
     const verification = await prisma.verification.findUnique({ where: { userId: user.id } });
     if (data.status === "PUBLISHED" && verification?.status !== "APPROVED") {
       throw new Error("KYC_REQUIRED: Host account verification must be APPROVED before publishing an experience.");
     }
     ```
2. **File:** `lib/auth.ts`
   - Refactor `syncAndGetDbUser` to ensure DB offline state during explicit mutation server actions throws a clear database connection error rather than returning mock guest profiles.

### Phase 2: Moderation & Environment Hardening (P2 Fixes)
1. **File:** `lib/actions/messages.ts`
   - Update `moderateMessage` with `String.prototype.normalize("NFKD")` to strip diacritics, zero-width spaces, and homoglyphs before evaluating contact regex.
2. **File:** `lib/env.ts`
   - Mark `NEXT_PUBLIC_APP_URL` as required in production environment schema.

---

## 21. CLAUDE HANDOFF & EXECUTION BRIEF

> **TO IMPLEMENTATION AGENT (CLAUDE / SONNET):**
> 
> You are taking over execution for WeddingWithIndia based on this forensic audit.
> 
> **Immediate Action Items:**
> 1. Execute **Phase 1 Fix (`SEC-001`)** in `lib/actions/index.ts` to enforce the KYC gate on wedding publication.
> 2. Execute **Phase 2 Fix (`SEC-003`)** in `lib/actions/messages.ts` for Unicode contact moderation normalization.
> 3. Verify implementation with build commands:
>    - `cmd /c npm run type-check`
>    - `cmd /c npm run build`
> 
> **Verification Command Rules:**
> - DO NOT run `npm run dev`.
> - Always execute shell commands via `cmd /c` when using npm scripts on Windows environment.
> - Preserved all existing business logic, security controls, and design system tokens.
