# FINAL SYSTEM ARCHITECTURE & RELATIONSHIP AUDIT

**Platform:** WeddingWithIndia  
**Audit Type:** Master Production Forensic Discovery  
**Date:** August 18, 2026  
**Audited By:** Principal Software Architect, Security Engineer & Reliability Lead  

---

## 1. Actor Roles & Identity Hierarchy

```
                                  +-------------------+
                                  |    Clerk Auth     |
                                  | (Session & JWT)   |
                                  +-------------------+
                                            |
                                            v
                                  +-------------------+
                                  |    User (Base)    |
                                  |  email, role,     |
                                  |  status, name     |
                                  +-------------------+
                                            |
         +-------------------+--------------+--------------+-------------------+
         |                   |                             |                   |
         v                   v                             v                   v
+-----------------+ +-----------------+           +-----------------+ +-----------------+
| TravelerProfile | |  CoupleProfile  |           |  AgentProfile   | |CoordinatorProf. |
| budget, lang,   | | familyBio, exp, |           | agency, org,    | | city, avail,    |
| interests, city | | traditions      |           | referralCode    | | exp, status     |
+-----------------+ +-----------------+           +-----------------+ +-----------------+
         |                   |                             |                   |
         |                   | (Owns)                      | (Refers)          | (Assigned to)
         v                   v                             v                   v
+---------------------------------------------------------------------------------------+
|                                    Wedding Entity                                     |
| title, date, location, pricePerGuest, capacity, status, sponsored, featured, religion |
+---------------------------------------------------------------------------------------+
         |                                                 |
         | (Submits / Holds Spots)                         | (Accrues Commission)
         v                                                 v
+---------------------------------------------------------------------------------------+
|                                    Booking Entity                                     |
| status (PENDING, AWAITING_PAYMENT, PAID, CONFIRMED, CHECKED_IN, ATTENDED, COMPLETED)  |
+---------------------------------------------------------------------------------------+
         |                                                 |
         | (Payment Request & Verification)                | (Check-In Scan)
         v                                                 v
+---------------------------------+               +---------------------------------+
|         Payment Entity          |               |         GuestPass Entity        |
| provider: MANUAL_PAYPAL         |               | AES-256-GCM Encrypted Token     |
| status: PENDING / PAID / REFUND |               | SHA-256 Fast Hash PassCode      |
+---------------------------------+               +---------------------------------+
```

---

## 2. Core Entities & Sources of Truth

| Entity | Primary Table | Source of Truth | Mutation Authority | Invariants |
| :--- | :--- | :--- | :--- | :--- |
| **Identity & Roles** | `User` | PostgreSQL `User.role` + Clerk Auth | Admin / Onboarding | Role locked after onboarding; ADMIN cannot be self-assigned. |
| **Wedding Celebrations** | `Wedding` | PostgreSQL `Wedding` | Host Couple / Admin | Published only if KYC verified; Demo weddings cannot be booked. |
| **Reservations & Bookings** | `Booking` | PostgreSQL `Booking` | Traveler (apply), Admin/Host (approve/reject), Admin (payment confirmation) | Concurrency serialized via `SELECT FOR UPDATE`; capacity strictly held across active statuses. |
| **Payments & Transactions** | `Payment`, `Transaction` | PostgreSQL `Payment` | Admin (Server Action) | Manual PayPal; zero client pricing manipulation; idempotent confirmation. |
| **Refunds** | `Refund`, `Transaction` | PostgreSQL `Refund` | Admin (Server Action) | Total refunds cannot exceed amount paid; unvested commissions reversed. |
| **Digital Guest Passes** | `GuestPass` | PostgreSQL `GuestPass` | `markPaymentPaidAtomic` | Exactly 1 pass per confirmed booking; AES-256-GCM encrypted. |
| **Event Check-Ins** | `GuestCheckIn` | PostgreSQL `GuestCheckIn` | Coordinator / Host / Admin | Pass must match assigned wedding; QR token hash verified. |
| **Agent Commissions** | `Commission` | PostgreSQL `Commission` | Internal Payment Confirmation | 14-day maturation hold; self-referrals blocked. |
| **Reviews & Ratings** | `Review`, `ReputationLog` | PostgreSQL `Review` | Traveler (attended), Host (attended) | Strictly requires verified attendance (`CHECKED_IN`, `ATTENDED`, `COMPLETED`). |

---

## 3. Server Actions & Role Access Boundaries

| Action Name | Target File | Role Enforcement | Purpose |
| :--- | :--- | :--- | :--- |
| `createBookingAction` | `lib/actions/index.ts` | `requireAuth()`, `TRAVELER` | Creates reservation in `PENDING` state with server-side pricing. |
| `adminRequestPaymentAction` | `lib/actions/payment-manual.ts` | `requireRole([ADMIN])` | Generates payment request with fee surcharge and PayPal link. |
| `adminMarkPaymentPaidAction` | `lib/actions/payment-manual.ts` | `requireRole([ADMIN])` | Confirms PayPal settlement, transitions booking to `PAID`, issues pass. |
| `adminRecordManualRefundAction` | `lib/actions/payment-manual.ts` | `requireRole([ADMIN])` | Logs manual refund, creates ledger entry, updates status. |
| `travelerGetPaymentDetailsAction` | `lib/actions/payment-manual.ts` | `requireAuth()`, Owner or Admin | IDOR-safe payment summary for traveler. |
| `checkInGuestAction` | `lib/actions/event-operations.ts` | `COORDINATOR`, `COUPLE`, `ADMIN` | Verifies and checks in traveler at venue. |
| `submitReviewAction` | `lib/actions/reviews.ts` | `requireAuth()` + Attendance | Submits review if attendance criteria met. |
| `adminToggleSponsoredAction` | `lib/actions/admin.ts` | `requireRole([ADMIN])` | Sets marketplace sponsorship start/end dates. |

---

## 4. Background & Cron Workflows

1. **Commission Maturation Settlement** (`/api/cron/commission-settlement`):
   - Daily cron scanning `Commission` records older than 14 days with status `PENDING` where booking is not refunded, transitioning them to `MATURED`.
2. **Event Reminders** (`/api/cron/event-reminders`):
   - Daily cron notifying travelers and hosts of upcoming celebrations 7 days and 24 hours prior to event date.
