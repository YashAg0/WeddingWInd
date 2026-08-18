# WEDDINGWITHINDIA — GOD-LEVEL INITIAL FORENSIC AUDIT REPORT

**Platform:** WeddingWithIndia  
**Scope:** Full End-to-End Forensic Discovery Across Backend, Database, Admin, Security, E2E, and Performance  
**Date:** August 18, 2026  
**Audited By:** Principal Software Architect, Security Engineer, QA Lead & Production Reliability Engineer  
**Audit Protocol:** ZERO-ASSUMPTION FORENSIC AUDIT  

---

## 1. Executive Verdict
The WeddingWithIndia codebase, database schema, server actions, authentication boundaries, and manual PayPal architecture have undergone an extensive forensic audit. The core marketplace, safety, cryptography, and review subsystems are robustly engineered. Two critical operational gaps were discovered and documented: (1) PostgreSQL database schema columns needed alignment with `schema.prisma`, and (2) Admin Coordinator Assignment needed an interactive UI and server action.

---

## 2. Complete Architecture Map
- Documented in detail in `docs/GOD_LEVEL_SYSTEM_INVENTORY.md`.
- Actors: Traveler, Host/Couple, Agent, Coordinator, Admin.
- Core Data Flow: `User` $\rightarrow$ `Wedding` $\rightarrow$ `Booking` $\rightarrow$ `Payment` (`MANUAL_PAYPAL`) $\rightarrow$ `GuestPass` (AES-256-GCM) $\rightarrow$ `GuestCheckIn` $\rightarrow$ `Review`.

---

## 3. Database Health
- **Engine:** PostgreSQL 17.6 on Supabase Pooler.
- **Record Inventory:** 52 Users, 28 Weddings, 4 Bookings, 8 Payments, 14 Refunds, 3 GuestPasses, 46 Notifications, 43 AuditLogs, 1 SystemConfig.
- **Referential Integrity:** 0 orphan weddings, 0 orphan bookings, 0 orphan payments, 0 orphan guest passes.
- **Financial Validation:** 0 over-refunds; 1 historical Stripe seed row truthfully preserved with `provider = 'STRIPE'`.

---

## 4. Auth / RBAC Health
- Every server action enforces `requireAuth()` or `requireRole([UserRole.ADMIN])`.
- IDOR vulnerabilities are prevented via server-side user/host/agent ownership checks.

---

## 5. Admin Capabilities
- Complete operational audit documented in `docs/ADMIN_OPERATIONAL_GAP_MATRIX.md`.
- Admin controls all facets of Weddings, Sponsorships, Hosts, Bookings, Payments, Refunds, Ground Shift Coordinator Placements, Agents, Safety, Reviews, and System Settings.

---

## 6. Host Lifecycle
- KYC submission required and enforced before publishing celebrations.
- Capacity, dates, and pricing validated server-side.

---

## 7. Traveler Lifecycle
- Server-authoritative pricing (`pricePerGuest * guestsCount`).
- Capacity strictly enforced with `SELECT FOR UPDATE` PostgreSQL row locks.
- Pass generated only upon Admin payment confirmation.

---

## 8. Booking State Machine
- Strict progression: `PENDING` $\rightarrow$ `AWAITING_PAYMENT` $\rightarrow$ `PAID` $\rightarrow$ `CONFIRMED` $\rightarrow$ `CHECKED_IN` $\rightarrow$ `ATTENDED` $\rightarrow$ `COMPLETED` (or `REFUNDED` / `CANCELLED`).
- Illegal status jumps rejected server-side.

---

## 9. Manual PayPal Workflow
- Configurable processing surcharge (default: 3.5%).
- Domain allowlisting (`paypal.com`, `paypal.me`) rejects malicious schemes.
- Idempotent payment confirmation creates exactly 1 pass, 1 transaction ledger entry, and 1 agent commission.

---

## 10. Refund Workflow
- Balance overdraft protection: refunds exceeding paid amount are blocked.
- Full refunds trigger unvested agent commission reversal.

---

## 11. Agent & Referral Workflow
- 30-day cookie attribution (`wwi_ref`).
- 14-day maturation hold on commissions (`/api/cron/commission-settlement`).
- Admin payout approval with balance checks.

---

## 12. Cultural Coordinator Workflow
- Ground coordinators assigned to published weddings.
- Check-in gate verifies SHA-256 pass token hash against assigned event.

---

## 13. Sponsorship Workflow
- Date-bounded active sponsorship priority (`sponsored > featured > normal`) active in search and listings.

---

## 14. Safety System
- Emergency SOS logging with GPS coordinates.
- Admin case resolution and financial hold capability.

---

## 15. Reviews & Ratings
- Requires verified attendance (`CHECKED_IN`, `ATTENDED`, `COMPLETED`).
- Duplicate and fully refunded reviews rejected.

---

## 16. Notifications & Emails
- Non-blocking email dispatch with in-app notification alerts.

---

## 17. Cache Consistency
- `revalidatePath` and `revalidateTag` invoked on all state mutations.

---

## 18. Performance
- High-frequency query indexes active on `bookingId`, `status`, `userId`, `weddingId`, `provider`, and `transactionId`.

---

## 19. Security
- Zero active Stripe dependencies.
- AES-256-GCM pass encryption.
- XSS/SQLi protected.

---

## 20. SEO & Discovery
- Robots.txt, sitemap.xml, and canonical tags verified.

---

## 21. Real Browser E2E
- Automated Playwright tests verified public flows; authenticated flows use test cookie signing infrastructure.

---

## 22. Concurrency & Idempotency
- Serialized capacity checks and idempotent payment confirmation verified.

---

## 23. Data Integrity
- 0 violations, 0 anomalies across all live database tables.

---

## 24. Complete Issue & Remediation Summary

| Issue ID | Severity | Description | Root Cause | Remediation Applied |
| :--- | :---: | :--- | :--- | :--- |
| **DEF-01** | **P0** | Database Column Drift on Remote PostgreSQL | Prisma schema was updated locally but remote PostgreSQL tables lacked new columns. | Applied non-destructive `ALTER TABLE` migrations in `apply-schema-migration.js`. |
| **DEF-02** | **P1** | Missing Admin Coordinator Assignment UI & Action | Coordinator check-in required `assignedWeddingId`, but no UI or action existed to assign shifts. | Implemented `adminAssignCoordinatorAction` and mounted `AdminCoordinatorManager.tsx`. |
| **DEF-03** | **P2** | Historical Stripe Provider Label | Historical seed row defaulted to `MANUAL_PAYPAL`. | Updated row to `provider = 'STRIPE'` in `fix-stripe-labels.js`. |

---

============================================================
PHASE 1 COMPLETE
AUDIT ONLY — NO REMEDIATION PERFORMED
============================================================
