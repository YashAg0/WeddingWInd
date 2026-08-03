# WeddingWithIndia — Role-Based Access Control (RBAC) Guide

This document defines the **6-Tier Role-Based Access Control (RBAC)** architecture, permission definitions, route protection rules, and server action enforcement matrices for **WeddingWithIndia**.

---

## 1. Role Matrix

WeddingWithIndia supports 7 distinct roles across travelers, hosts, partners, and internal platform operators.

| Role Code | Role Name | Description / Scope | Default Dashboard Path |
| :--- | :--- | :--- | :--- |
| **GUEST** | Unauthenticated Visitor | Public marketplace browser, currency selector | `/` |
| **TRAVELER** | International Traveler | Registered guest, booking requests, wishlists, reviews | `/dashboard/bookings` |
| **COUPLE** | Wedding Host Couple | Host family listing weddings, schedules, earnings | `/dashboard/listings` |
| **AGENT** | Referral Partner | Freelance agency partner tracking referrals & 7% commissions | `/dashboard/referrals` |
| **COORDINATOR** | On-Site Logistics Lead | City coordinator checking in guests via QR scan | `/dashboard/operations` |
| **ADMIN** | Operations Manager | Platform administrator approving listings & applications | `/dashboard/admin` |
| **SUPER_ADMIN** | System Founder | Platform superuser with full role & audit privileges | `/dashboard/admin` |

---

## 2. Permission Matrix

| Permission Identifier | Description | Allowed Roles |
| :--- | :--- | :--- |
| `VIEW_PUBLIC_LISTINGS` | Browse published wedding experiences | ALL (Guest, Traveler, Couple, Agent, Coordinator, Admin, Super Admin) |
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

---

## 3. Route Matrix

| UI Route | Access Level | Required Role / Guard | Middleware Enforced |
| :--- | :--- | :--- | :--- |
| `/` | Public | None (Guest) | No |
| `/weddings` | Public | None (Guest) | No |
| `/weddings/[slug]` | Public | None (Guest) | No |
| `/how-it-works` | Public | None (Guest) | No |
| `/for-travelers` | Public | None (Guest) | No |
| `/for-couples` | Public | None (Guest) | No |
| `/for-agents` | Public | None (Guest) | No |
| `/about` | Public | None (Guest) | No |
| `/contact` | Public | None (Guest) | No |
| `/privacy`, `/terms` | Public | None (Guest) | No |
| `/login`, `/signup` | Public | None (Guest) | No |
| `/dashboard` | Authenticated | Traveler, Couple, Agent, Admin | Yes |
| `/dashboard/bookings` | Authenticated | Traveler, Super Admin | Yes |
| `/dashboard/wishlist` | Authenticated | Traveler, Super Admin | Yes |
| `/dashboard/profile` | Authenticated | Traveler, Couple, Agent, Admin | Yes |
| `/dashboard/listings` | Authenticated | Couple, Super Admin | Yes |
| `/dashboard/earnings` | Authenticated | Couple, Super Admin | Yes |
| `/dashboard/events` | Authenticated | Couple, Super Admin | Yes |
| `/dashboard/referrals` | Authenticated | Agent, Super Admin | Yes |
| `/dashboard/operations` | Authenticated | Coordinator, Admin, Super Admin | Yes |
| `/dashboard/check-in` | Authenticated | Coordinator, Admin, Super Admin | Yes |
| `/dashboard/admin/*` | Role Restricted | Admin, Super Admin | Yes |

---

## 4. Action Matrix (Server Actions & API Authorization)

| Action / API Endpoint | Handler Module | Required Permission / Guard |
| :--- | :--- | :--- |
| `adminGetDashboardStatsAction()` | `lib/actions/admin.ts` | `requireRole([UserRole.ADMIN])` |
| `adminApproveHostListingAction()` | `lib/actions/admin.ts` | `requireRole([UserRole.ADMIN])` |
| `adminApproveAgentAction()` | `lib/actions/admin.ts` | `requireRole([UserRole.ADMIN])` |
| `adminGetFinancialLedgerAction()` | `lib/actions/admin.ts` | `requireRole([UserRole.ADMIN])` |
| `createWeddingAction()` | `lib/actions/index.ts` | `requireRole([UserRole.COUPLE, UserRole.ADMIN])` |
| `updateWeddingAction()` | `lib/actions/index.ts` | Host Owner or Admin |
| `createBookingAction()` | `lib/actions/index.ts` | `requireAuth()` (Traveler) |
| `submitReviewAction()` | `lib/actions/reviews.ts` | Verified Attended Booking Check |
| `replyToReviewAction()` | `lib/actions/reviews.ts` | Wedding Host Owner Check |
| `checkInGuestQRAction()` | `lib/actions/event-operations.ts` | Coordinator / Admin Guard |
| `requestAgentPayoutAction()` | `lib/actions/referrals.ts` | `requireRole([UserRole.AGENT])` |
| `/api/admin/*` | `app/api/admin/*` | Clerk Session + Admin Role Check |
