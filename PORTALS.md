# WeddingWithIndia — Multi-Portal Architecture Specification

This document details the functional specifications, navigation structures, permissions, and features across all 6 portals of **WeddingWithIndia**.

---

## 1. Multi-Portal Summary Matrix

| Portal Identifier | Persona Target | Primary Route | Role Guard | Core Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Guest Portal** | International Travelers | `/` & `/weddings` | Public / `TRAVELER` | Search, filter, wishlist, book, pay via Stripe, access digital QR Guest Pass, review events. |
| **Host Portal** | Indian Wedding Families | `/dashboard/celebrations` | `COUPLE` / `SUPER_ADMIN` | List weddings, manage ceremony timelines, approve/decline guest requests, track 78% host revenue in INR. |
| **Agent Portal** | Freelance Travel Partners | `/dashboard/referrals` | `AGENT` / `SUPER_ADMIN` | Unique referral tracking links (`WWI-AGENT-XXXX`), click/conversion stats, tiered commission (₹500-₹500) accounting. |
| **Coordinator Portal**| City Logistics Leads | `/dashboard/operations` | `COORDINATOR` / `ADMIN` | Venue gate QR code check-in scanner, city guest arrival rosters, incident reporting. |
| **Admin Portal** | Operations Managers | `/dashboard/admin` | `ADMIN` / `SUPER_ADMIN` | Host verifications, agent approvals, financial ledger, safety case triage, CMS editing. |
| **Super Admin Portal**| Platform Founder | `/dashboard/admin` | `SUPER_ADMIN` | User role promotion/demotion, account suspensions, system bootstrap execution, audit logs. |

---

## 2. Detailed Portal Specifications

### A. Guest Portal (`/weddings`, `/dashboard/bookings`, `/dashboard/wishlist`)
- **Search & Discovery**: Multi-parameter search by destination, wedding style (Royal, Beach, Punjabi, South Indian, Traditional), month, max budget, language, and guest capacity.
- **Wishlist & Save Search**: Save Our Indian Weddings to bookmarked collections and save filter criteria to user dashboard.
- **Booking & Payments**: Stripe Checkout payment processing with instant booking confirmation.
- **Digital Guest Pass**: Encrypted entry pass with QR code and event dress code guidelines.

### B. Host Portal (`/dashboard/celebrations`, `/dashboard/earnings`)
- **Celebration Builder**: Multi-step wizard specifying venue location, capacity, event schedule (Mehndi, Sangeet, Pheras, Reception), traditions, and pricing per guest.
- **Guest Approval Queue**: Host review of incoming guest reservation requests with approve/decline controls.
- **Earnings Accounting**: Real-time host revenue tracking (78% share in INR) and bank payout requests.

### C. Agent Portal (`/dashboard/referrals`, `/dashboard/leads`)
- **Referral Code Engine**: Generation of unique referral links (`https://weddingwithindia.com?ref=WWI-ROYAL-AGENT`).
- **Analytics Dashboard**: First-touch click tracking, traveler account signups, and booked conversion metrics.
- **Commission Ledger**: Accrued tiered referral commission accounting with instant payout request triggers.

### D. Coordinator Portal (`/dashboard/operations`, `/dashboard/check-in`)
- **Mobile QR Gate Scanner**: High-speed camera scanner validating guest passes at venue gates.
- **City Roster**: Real-time guest arrival roster, hotel placement notes, and emergency contacts.

### E. Admin & Super Admin Portals (`/dashboard/admin`)
- **Verification Audit Queue**: Host ID and venue permission auditing.
- **Financial Reconciliation**: Stripe payment intents, host payouts, agent commissions, and 22% platform revenue splits.
- **Safety Ops Center**: Dispute triage, warning issuance, and account suspension tools.
