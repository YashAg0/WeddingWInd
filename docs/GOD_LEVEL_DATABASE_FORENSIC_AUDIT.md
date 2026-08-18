# WEDDINGWITHINDIA — GOD-LEVEL DATABASE FORENSIC AUDIT

**Platform:** WeddingWithIndia  
**Audit Phase:** Phase 2 — Live PostgreSQL Database Forensics  
**Date:** August 18, 2026  
**Auditor:** Principal Database Engineer & Security Reliability Lead  

---

## 1. Table Record Inventory & Schema Verification

| Table Name | Live Record Count | Primary Key | Foreign Key Relations | State / Enum Fields | Integrity Status |
| :--- | :---: | :--- | :--- | :--- | :---: |
| `User` | 52 | `id` (UUID) | None | `role` (`TRAVELER`, `COUPLE`, `AGENT`, `COORDINATOR`, `ADMIN`), `status` (`ACTIVE`, `ONBOARDING`, `BANNED`) | **PASS** |
| `TravelerProfile` | 15 | `id` (UUID) | `userId` $\rightarrow$ `User.id` | None | **PASS** |
| `CoupleProfile` | 33 | `id` (UUID) | `userId` $\rightarrow$ `User.id` | None | **PASS** |
| `AgentProfile` | 1 | `id` (UUID) | `userId` $\rightarrow$ `User.id` | None | **PASS** |
| `CoordinatorProfile` | 3 | `id` (UUID) | `userId` $\rightarrow$ `User.id`, `assignedWeddingId` $\rightarrow$ `Wedding.id` | `status` (`ACTIVE`, `INACTIVE`) | **PASS** |
| `Wedding` | 28 | `id` (UUID) | `hostCoupleId` $\rightarrow$ `CoupleProfile.id` | `status` (`DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED`), `sponsored`, `featured` | **PASS** |
| `Booking` | 4 | `id` (UUID) | `travelerId` $\rightarrow$ `TravelerProfile.id`, `weddingId` $\rightarrow$ `Wedding.id` | `status` (`PENDING`, `AWAITING_PAYMENT`, `APPROVED`, `PAID`, `CONFIRMED`, `CHECKED_IN`, `ATTENDED`, `COMPLETED`, `CANCELLED`, `REFUNDED`) | **PASS** |
| `Payment` | 8 | `id` (UUID) | `bookingId` $\rightarrow$ `Booking.id` | `provider` (`MANUAL_PAYPAL`, `STRIPE`), `status` (`PENDING`, `PAID`, `FAILED`, `REFUNDED`) | **PASS** |
| `Transaction` | 0 | `id` (UUID) | `paymentId` $\rightarrow$ `Payment.id` | `type`, `status` | **PASS** |
| `Refund` | 14 | `id` (UUID) | `paymentId` $\rightarrow$ `Payment.id` | `status` (`PENDING`, `SUCCEEDED`, `COMPLETED`, `FAILED`) | **PASS** |
| `GuestPass` | 3 | `id` (UUID) | `bookingId` $\rightarrow$ `Booking.id` | `status` (`ACTIVE`, `CHECKED_IN`, `CANCELLED`, `EXPIRED`) | **PASS** |
| `Commission` | 1 | `id` (UUID) | `agentId` $\rightarrow$ `AgentProfile.id`, `bookingId` $\rightarrow$ `Booking.id` | `status` (`PENDING`, `MATURED`, `PAID_OUT`, `REVERSED`) | **PASS** |
| `SponsorshipRequest` | 2 | `id` (UUID) | `weddingId` $\rightarrow$ `Wedding.id` | `status` (`PENDING`, `APPROVED`, `REJECTED`) | **PASS** |
| `Verification` | 9 | `id` (UUID) | `userId` $\rightarrow$ `User.id` | `status` (`PENDING`, `APPROVED`, `REJECTED`, `UNDER_REVIEW`, `NEED_MORE_DOCUMENTS`) | **PASS** |
| `Review` | 2 | `id` (UUID) | `bookingId` $\rightarrow$ `Booking.id`, `travelerId` $\rightarrow$ `TravelerProfile.id` | `type` (`TRAVELER_TO_WEDDING`, `HOST_TO_TRAVELER`), `status` (`PUBLISHED`, `APPROVED`, `PENDING_MODERATION`, `REJECTED`) | **PASS** |
| `Notification` | 46 | `id` (UUID) | `userId` $\rightarrow$ `User.id` | `type` (`INFO`, `SUCCESS`, `ALERT`), `read` (Boolean) | **PASS** |
| `AuditLog` | 43 | `id` (UUID) | `userId` (Optional) | `action`, `entity` | **PASS** |
| `SystemConfig` | 1 | `id` ("global") | None | Global operational flags & PayPal fee config | **PASS** |
| `Wishlist` | 1 | `id` (UUID) | `userId` $\rightarrow$ `User.id` | None | **PASS** |

---

## 2. Referential Integrity & Anomaly Checks

1. **Orphan Analysis:**
   - Orphan Users (without matching role profile): **0**
   - Orphan Weddings (without hostCouple): **0**
   - Orphan Bookings (missing traveler or wedding): **0**
   - Orphan Payments (missing booking): **0**
   - Orphan GuestPasses (missing booking): **0**
2. **Financial Integrity:**
   - Over-refunded payments ($\sum \text{Refunds} > \text{Payment.amount}$): **0**
   - Invalid fee calculations ($\text{baseAmount} + \text{feeAmount} \neq \text{totalAmount}$): **0**
   - Historical Stripe mislabels (`provider = MANUAL_PAYPAL` with `stripePaymentIntentId` not null): **0**
3. **Sponsorship Dates:**
   - Invalid date ranges ($\text{sponsorshipEnd} \le \text{sponsorshipStart}$): **0**

---

## 3. Database Remediation Log

- **Pre-Remediation Finding:** Remote PostgreSQL tables (`Payment`, `SystemConfig`, `Refund`) lacked manual PayPal columns.
- **Action Taken:** Executed non-destructive `ALTER TABLE` statements in `scripts/validators/apply-schema-migration.js`.
- **Historical Alignment:** Relabeled 1 historical seed payment with `stripePaymentIntentId` to `provider = 'STRIPE'`.
- **Post-Remediation Verification:** **0 violations remain.**
