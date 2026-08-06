# WeddingWithIndia — Database Architecture & Schema Manual

This document provides a comprehensive technical overview of the **WeddingWithIndia** database architecture, schema relations, indexing strategy, session pooling, and database bootstrap procedures.

---

## 1. Schema Architecture Overview

The database uses **Prisma ORM 6.x** backed by **PostgreSQL**. The schema enforces relational integrity across 25+ models with cascade deletions and targeted indexes.

### Core Entity Relationship Map

```
                  ┌──────────────┐
                  │     User     │
                  └──────┬───────┘
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
  TravelerProfile  CoupleProfile  AgentProfile
          │              │              │
          ▼              ▼              ▼
       Booking ──────► Wedding ◄─── Commission
          │              │              │
          ▼              ▼              ▼
     GuestPass        Event         Payout
```

---

## 2. Model Dictionary

### User & Profiles
- **User**: Core identity model storing `clerkUserId`, `email`, `name`, `avatar`, `role` (`TRAVELER`, `COUPLE`, `AGENT`, `ADMIN`), and `status` (`ACTIVE`, `ONBOARDING`, `BANNED`).
- **TravelerProfile**: Guest profile storing country, preferred language, travel budget, dietary restrictions, and accessibility needs.
- **CoupleProfile**: Host couple profile storing wedding date, location, expected guest count, traditions, and family bio.
- **AgentProfile**: Referral agent profile storing organization, experience years, target audience, and unique `referralCode`.

### Marketplace & Booking Flow
- **Wedding**: Represents a listed wedding experience storing `slug`, `title`, `description`, `pricePerGuest`, `capacity`, `category`, `status` (`DRAFT`, `PUBLISHED`, `COMPLETED`), and featured boost flags.
- **WeddingGallery**: High-resolution gallery images linked to a wedding.
- **WeddingEvent**: Event schedule items (Mehndi, Sangeet, Pheras, Reception) with date, time, and dress code.
- **WeddingTradition**: Key customs explained for international travelers.
- **Booking**: Guest booking reservation storing `guestsCount`, `pricePerGuest`, `totalAmount`, and `status` (`PENDING`, `APPROVED`, `PAID`, `CHECKED_IN`, `ATTENDED`, `COMPLETED`).
- **BookingGuest**: Details of individual attendees under a booking (food preferences, age).
- **GuestPass**: Digital entry pass generated upon payment containing a unique `passCode`, QR code data, and `checkedIn` status.

### Financials & Commissions
- **Payment**: Payment record storing amount, currency, status, and `stripePaymentIntentId`.
- **Commission**: tiered referral commission record linked to an `AgentProfile`, `Booking`, and `Payment`.
- **AgentReferral**: Click and conversion tracking record connecting a visitor ID to a signed-up user.

### Trust, Safety & Reviews
- **Verification**: Trust verification record storing passport/ID URLs, selfie verification, and audit notes.
- **Review**: Detailed post-event guest review storing overall rating (1-5) and category breakdown (Food, Hospitality, Experience, Culture, Safety, Accommodation) with host replies.
- **SafetyCase**: Trust & safety incident report for dispute resolution and admin triage.

---

## 3. Database Bootstrap & Seeding

Run the unified bootstrap command to sync schema and populate connected demo data:
```bash
npm run bootstrap
```
Or run the standalone seeder:
```bash
npm run db:seed
```

This creates connected demo data:
- Super Admin, Admin, Host, Guest, Agent, and Coordinator user accounts.
- 6 Full Our Indian Weddings with galleries, events, traditions, and itineraries.
- Attended & paid guest bookings with generated QR guest passes.
- Verified 5-star reviews with host responses.
- Accrued agent referral commissions and financial audit logs.

---

## 4. Connection Pooling Configuration

When running with cloud PostgreSQL providers (e.g. Supabase, Neon, AWS RDS Proxy), connection pooling avoids exhaustion of database connections:
```env
DATABASE_URL="postgresql://user:password@pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
```
- `pgbouncer=true`: Tells Prisma to disable client-side prepared statements compatible with PgBouncer session pooling.
- `connection_limit=1`: Limits per-lambda pool connection count in serverless environments.
