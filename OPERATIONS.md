# WeddingWithIndia — Operations & Administrative Runbook

Welcome to the **WeddingWithIndia Operations Manual**. This document guides administrators, operations leads, trust & safety managers, and support staff in managing the global wedding tourism marketplace.

---

## 1. Role-Based Access Control (RBAC) Matrix

WeddingWithIndia enforces a 6-tier Role-Based Access Control model to ensure strict data security and operational isolation.

| Role | Target Persona | Access Level / Dashboard Path | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Platform Founders & Lead Engineers | Full Access (`/dashboard/admin`) | System bootstrap, RBAC promotion, audit log inspection, safety appeals review, commission overrides. |
| **Admin** | Internal Operations Managers | Operations Hub (`/dashboard/admin`) | Celebration verification queue, host approvals, agent application review, payment ledger audit. |
| **Host (Couple)** | Indian Wedding Families / Couples | Host Dashboard (`/dashboard/celebrations`) | Celebration creation, event schedule management, guest approvals, check-in monitoring, INR earnings tracking. |
| **Guest (Traveler)** | International Travelers | Guest Dashboard (`/dashboard/bookings`) | Wedding discovery, booking requests, currency selection, guest pass access, cultural preparations, reviews. |
| **Agent** | Freelance Referral Partners | Agent Portal (`/dashboard/referrals`) | Referral link generation (`WWI-AGENT-XXXX`), traveler acquisition tracking, tiered commission (₹500-₹500) accrual, payout requests. |
| **Coordinator** | On-Site City Leads | Operations & Check-in (`/dashboard/operations`) | City density monitoring, guest QR check-in, emergency escalation, on-site host assistance. |

---

## 2. Daily Operations Workflows

### A. Host Verification & Celebration Approval Queue (`/dashboard/admin/hosts`)
1. Navigate to `/dashboard/admin/hosts` or `/dashboard/admin/verifications`.
2. Inspect pending couple celebrations:
   - **Identity Check**: Verify uploaded government ID, couple photo, and venue invitation proof.
   - **Venue Confirmation**: Ensure venue permission letter or booking receipt is attached.
   - **Cultural & Safety Guidelines**: Confirm photography rules, dress code guidelines, and food safety descriptions meet luxury standards.
3. Click **Approve Celebration & Publish**. The wedding status changes from `DRAFT` / `UNDER_REVIEW` to `PUBLISHED` and becomes searchable across the marketplace.

### B. Freelance Agent Review & Referral Code Activation (`/dashboard/admin/agents`)
1. Navigate to `/dashboard/admin/agents`.
2. Review incoming referral partner applications:
   - Inspect organization background, travel agency registration, or LinkedIn profile.
3. Upon approval:
   - System assigns a unique tracking identifier (e.g. `WWI-ROYAL-AGENT`).
   - Agent is granted access to `/dashboard/referrals` to track clicks, signups, conversions, and tiered commission (₹500-₹500) payouts.

### C. Booking & Payment Reconciliation (`/dashboard/admin/bookings`)
1. All booking transactions strictly follow the **Numbers.pdf Financial Model**:
   - **Host Share**: 78% of gross booking revenue.
   - **Platform Fee**: 22% gross revenue (from which tiered referral commission is carved for referring agents).
2. Financial status transitions:
   - `PENDING` ➔ `APPROVED` by Host.
   - `AWAITING_PAYMENT` ➔ `PAID` via Stripe Checkout webhook (`/api/webhooks/stripe`).
   - `PAID` ➔ `CHECKED_IN` via Coordinator QR scan at event.
   - `CHECKED_IN` ➔ `COMPLETED` ➔ Host earnings unlocked.

### D. Trust & Safety Incident Management (`/dashboard/admin/safety`)
1. Any traveler, host, or coordinator can file a Safety Case (`/dashboard/safety/report`).
2. Triage procedures:
   - Low priority (inquiries, minor schedule adjustments): Assigned to On-Site Coordinator.
   - High priority (conduct violations, emergency assistance): Escalated to Admin.
   - Critical priority (fraud, harassment, contract breaches): Immediately triggers account suspension (`status: BANNED`, `suspended: true`) and transfers to Super Admin review.

---

## 3. System Monitoring & Health Diagnostics

- **Health Check Endpoint**: `/api/health`
  - Returns DB connection latency, Redis/memory status, and active server timestamp.
- **Audit Logs**: All admin actions (verifications, role updates, suspensions, refunds) record an immutable `AuditLog` entry in PostgreSQL.
- **CLI Diagnostics**:
  - Run `npm run validate:env` to test environment health.
  - Run `npm run validate:all` to run full subsystem diagnostics.

---

## 4. Emergency Procedures

### Account Emergency Suspension
Run the CLI bootstrap script to update user role or status:
```bash
node scripts/bootstrap-admin.js <email>
```
Or execute SQL via Prisma Studio:
```bash
npx prisma studio
```
