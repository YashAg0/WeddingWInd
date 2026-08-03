# WeddingWithIndia — Supabase Architecture & Database Specification

This document details the Supabase PostgreSQL database architecture, connection pooling, Row Level Security (RLS) standards, storage buckets, and real-time triggers powering **WeddingWithIndia**.

---

## 1. Connection Architecture & PgBouncer Pooling

```
 [ Next.js Serverless Lambdas ]
              │
              ▼
   [ Supabase PgBouncer Pooler ] (Port 6543 / 5432, pgbouncer=true)
              │
              ▼
   [ PostgreSQL 16 Primary DB ] (25+ Relational Tables)
```

- **Database URL**: `postgresql://user:password@pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
- **Pooler Mode**: Session pooling via PgBouncer prevents connection exhaustion across serverless execution environments.

---

## 2. Table Schemas & Foreign Key Relationships

- `User` ───1:1─── `TravelerProfile`
- `User` ───1:1─── `CoupleProfile`
- `User` ───1:1─── `AgentProfile`
- `CoupleProfile` ───1:N─── `Wedding`
- `Wedding` ───1:N─── `WeddingGallery`
- `Wedding` ───1:N─── `WeddingEvent`
- `Wedding` ───1:N─── `WeddingTradition`
- `Wedding` ───1:N─── `Booking` ───1:1─── `GuestPass`
- `Booking` ───1:N─── `Payment`
- `Booking` ───1:1─── `Commission`
- `Booking` ───1:1─── `Review`

---

## 3. Row Level Security (RLS) & Security Policies

All Supabase tables enforce strict Row Level Security (RLS):
- **Public Tables (`Wedding`, `WeddingGallery`, `WeddingEvent`, `Review`)**: `SELECT` policy grants public read access to `PUBLISHED` listings.
- **User Private Tables (`Booking`, `GuestPass`, `Payment`)**: `SELECT`/`UPDATE` policy restricts access strictly to the authenticated user ID (`auth.uid() == user_id`) or an Admin.
- **Admin Audit Logs (`AuditLog`, `Verification`, `SafetyCase`)**: Restrict `ALL` operations to users possessing `role = 'ADMIN'`.

---

## 4. Storage Buckets Configuration

- **`avatars` Bucket**: Public read, authenticated upload for user profile photos.
- **`weddings` Bucket**: Public read, host/admin upload for high-resolution wedding photography.
- **`verifications` Bucket**: Private read/write restricted to file owners and Admins for passport/ID uploads.
- **`safety-evidence` Bucket**: Private read/write restricted to case participants and Admins for dispute evidence files.
