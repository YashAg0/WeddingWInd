# WeddingWithIndia — Role-Based Access Control (RBAC) Specification

This document provides the definitive **RBAC Architecture Specification** for **WeddingWithIndia**.

---

## 1. Master Role Definitions

- **GUEST**: Unauthenticated visitor. Public browsing, search, currency selection.
- **TRAVELER**: Authenticated guest. Bookings, wishlist collections, reviews, digital QR pass.
- **COUPLE**: Verified wedding host. Listing creation, event timeline editing, guest request approvals, 72% earnings.
- **AGENT**: Verified referral partner. Referral link tracking (`WWI-AGENT-XXXX`), click metrics, 7% accrued commissions.
- **COORDINATOR**: On-site logistics lead. Venue gate QR code scanning, city attendee rosters, incident reports.
- **ADMIN**: Operations manager. Host verification queue audits, agent approvals, financial ledger reconciliation.
- **SUPER_ADMIN**: Platform founder. Full role promotion/demotion, account suspensions, system bootstrap execution, audit logs.

---

## 2. Permission Matrix (`lib/rbac.ts`)

| Permission Name | Description | Allowed Roles |
| :--- | :--- | :--- |
| `VIEW_PUBLIC_LISTINGS` | Browse published wedding experiences | ALL |
| `BOOK_WEDDING` | Create booking reservations & process payments | Traveler, Super Admin |
| `MANAGE_WISHLIST` | Save/folder favorite weddings | Traveler, Super Admin |
| `SUBMIT_REVIEW` | Write 5-star & category reviews post-event | Traveler, Super Admin |
| `VIEW_GUEST_PASS` | Access digital QR pass for event check-in | Traveler, Super Admin |
| `CREATE_WEDDING` | Submit new Indian wedding listing | Couple, Super Admin |
| `EDIT_OWN_WEDDING` | Edit event timeline, traditions, gallery | Couple, Super Admin |
| `MANAGE_WEDDING_TIMELINE` | Update ceremony times & dress codes | Couple, Super Admin |
| `VIEW_HOST_EARNINGS` | Track host revenue (72% share in INR) | Couple, Super Admin |
| `REPLY_TO_REVIEWS` | Post official host response to guest reviews | Couple, Super Admin |
| `VIEW_AGENT_REFERRALS` | Track clicks, signups, and conversions | Agent, Super Admin |
| `GENERATE_REFERRAL_CODE` | Access custom tracking link (`WWI-AGENT-XXXX`) | Agent, Super Admin |
| `REQUEST_COMMISSION_PAYOUT` | Request payout of accrued 7% commissions | Agent, Super Admin |
| `CHECKIN_GUEST_QR` | Scan guest pass QR codes at venue entry | Coordinator, Admin, Super Admin |
| `VIEW_OPERATIONS_ROSTER` | View city density & coordinator placement | Coordinator, Admin, Super Admin |
| `SUBMIT_INCIDENT_REPORT` | Report safety/conduct issues from venue | Coordinator, Admin, Super Admin |
| `VERIFY_HOST_LISTING` | Review and publish pending wedding listings | Admin, Super Admin |
| `APPROVE_AGENT_APPLICATION` | Review & activate freelance agency partners | Admin, Super Admin |
| `VIEW_ADMIN_FINANCIAL_LEDGER` | Audit 28% platform / 72% host revenue splits | Admin, Super Admin |
| `TRIAGE_SAFETY_CASES` | Manage user dispute reports & warnings | Admin, Super Admin |
| `MANAGE_CMS_CONTENT` | Edit homepage content, FAQs, testimonials | Admin, Super Admin |
| `PROMOTES_ADMIN_ROLES` | Bootstrap or promote users to ADMIN role | Super Admin |
| `OVERRIDE_SAFETY_CASES` | Override safety rulings & ban accounts | Super Admin |
| `EXECUTE_SYSTEM_BOOTSTRAP` | Run CLI bootstrap & master seeder | Super Admin |
| `VIEW_AUDIT_LOGS` | Inspect system audit log entries | Super Admin |
