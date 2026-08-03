# WeddingWithIndia — Dashboard Architecture & User Operating Manual

This guide documents the role-tailored dashboard experience across all 5 user tiers on **WeddingWithIndia**: **Traveler (Guest)**, **Couple (Host)**, **Agent (Referral Partner)**, **Coordinator (Logistics Lead)**, and **Admin (Platform Operator)**.

---

## 1. Executive Summary: What Every User Needs Daily

| User Role | Primary Daily Need | Key Dashboard Features | Default Route |
| :--- | :--- | :--- | :--- |
| **Traveler** | Event preparation, digital QR pass, itinerary, messaging | Upcoming Bookings, QR Pass, Cultural Guides, Wishlist, Chat | `/dashboard/bookings` |
| **Couple (Host)** | Listing management, guest approvals, venue gate check-in | Active Weddings, Pending Requests, 72% Revenue, Gate Scanner | `/dashboard/listings` |
| **Agent** | Tracking referral clicks, conversions, commission payouts | Referral Link Generator, Click Metrics, 7% Accrued Commissions | `/dashboard/referrals` |
| **Coordinator** | Venue guest check-in, city attendee roster, safety triage | Gate QR Scanner, City Attendee Roster, Incident Reporting | `/dashboard/operations` |
| **Admin** | Platform governance, verifications, financial ledger | Platform KPIs, Verification Queue, Safety Triage, Financial Ledger | `/dashboard/admin` |

---

## 2. Guest (Traveler) Dashboard (`/dashboard`)

### Daily Operating Purpose
Travelers use their dashboard to manage upcoming wedding trips to India, access digital QR entry passes, review cultural dress codes, message host families, and manage saved wishlists.

### Key Widgets & Components:
- **Upcoming Trips Widget**: Displays confirmed bookings with date countdowns, venue locations, and host contact links (`BookingCard.tsx`).
- **Digital Guest Pass**: Instant access to encrypted QR entry pass for venue entry scanning (`/dashboard/events/[bookingId]`).
- **Cultural Preparation Hub**: Provides attire recommendations (e.g. Sangeet lehengas, Kurta Pajama), dietary notes, and local etiquette tips.
- **Saved Weddings Wishlist**: Displays bookmarked wedding celebrations with price indicators and capacity meters (`/dashboard/wishlist`).
- **Identity Trust Verification**: Allows travelers to upload passport or government ID proof to obtain the **Verified Traveler** badge.

---

## 3. Host (Couple) Dashboard (`/dashboard/listings`, `/dashboard/earnings`)

### Daily Operating Purpose
Indian wedding host families manage their listed wedding experience, approve or decline guest booking requests, update event timelines (Mehndi, Sangeet, Pheras, Reception), track host revenue, and scan guest passes at the venue gate.

### Key Widgets & Components:
- **Active Weddings Overview**: Manages published wedding listings, capacity limits (`guestsAllowed`), and price per guest in INR (`WeddingCard.tsx`).
- **Pending Guest Request Approval Queue**: Allows hosts to inspect traveler profiles, origin countries, and approve/decline booking requests.
- **Host Financial Ledger**: Tracks gross guest booking volume, 72% host payout share in INR, and bank transfer statuses (`/dashboard/earnings`).
- **Gate Scanner**: Integrated QR code scanner allowing venue staff or family members to scan guest passes at entry (`/dashboard/check-in`).
- **Review Manager**: Displays 5-star ratings and category breakdowns (Food, Hospitality, Culture) with host reply actions (`/dashboard/admin/reviews`).

---

## 4. Agent Dashboard (`/dashboard/referrals`, `/dashboard/earnings`)

### Daily Operating Purpose
Freelance referral partners and luxury travel agents monitor click conversions, track referral link usage (`WWI-AGENT-XXXX`), and request payouts for accrued 7% commission fees.

### Key Widgets & Components:
- **Unique Referral Link Generator**: Provides custom tracking links (`https://weddingwithindia.com?ref=WWI-ROYAL-AGENT`) with click-to-copy functionality.
- **Conversion Metrics**: Real-time stats on link clicks, registered traveler signups, and completed wedding bookings.
- **Commission Accounting Ledger**: Calculates accrued 7% referral commissions per booking with instant **Request Payout** triggers.
- **Lead Manager**: Tracks active traveler inquiries, country origins, and target wedding dates (`/dashboard/leads`).

---

## 5. Coordinator Dashboard (`/dashboard/operations`, `/dashboard/check-in`)

### Daily Operating Purpose
On-site city coordinators manage local wedding guest arrival rosters, perform gate check-ins via mobile QR scanning, and submit real-time safety incident reports.

### Key Widgets & Components:
- **City Attendee Roster**: Lists checked-in guests, hotel assignments, dietary needs, and emergency contact details per venue.
- **Mobile QR Gate Scanner**: High-speed camera scanner validating digital guest passes and logging entry timestamps.
- **Safety & Dispute Reporting**: Enables on-site coordinators to file urgent safety incident reports (`/dashboard/safety/report`).

---

## 6. Admin & Super Admin Dashboard (`/dashboard/admin`)

### Daily Operating Purpose
Platform operators oversee global marketplace health, audit host identity verifications, approve agent applications, review platform financial splits (28% platform fee), and triage safety cases.

### Key Widgets & Components:
- **Platform Analytics Hub**: Real-time KPIs for Gross Booking Volume (GBV), Active Weddings, Pending Verifications, and Revenue Splits (`/dashboard/admin/analytics`).
- **Verification Audit Queue**: Inspects host passport/ID uploads, venue confirmation proofs, and issues `APPROVED` or `REJECTED` status (`/dashboard/admin/verifications`).
- **Agent Application Review**: Approves or declines freelance referral partner applications (`/dashboard/admin/agents`).
- **Financial Reconciliation Ledger**: Audits Stripe payment intents, host payouts, agent commissions, and platform revenue (`/dashboard/admin/payments`).
- **Safety Ops Center**: Triages reported user disputes, issues warnings, or executes account bans (`/dashboard/admin/safety`).

---

## 7. Performance & Security Highlights

- **Edge RBAC Guards**: Middleware (`proxy.ts`) validates Clerk JWTs and user roles before rendering dashboard views.
- **Offline Resilient State**: Client context (`AuthContext.tsx`) provides safe fallback states if database connectivity drops.
- **Responsive Layout**: Sidebar (`Sidebar.tsx`) converts to a slide-over mobile drawer on mobile screens.
