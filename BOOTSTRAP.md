# WeddingWithIndia — Master Production Bootstrap & Initialization Manual

This manual documents the automated **Production Bootstrap System** for initializing, validating, seeding, and provisioning **WeddingWithIndia** from scratch without manual database modifications.

---

## 1. Quick Start Bootstrap Execution

Execute the unified system bootstrap command:
```bash
npm run bootstrap
```
Or use the alias:
```bash
npm run setup
```

---

## 2. Automated Bootstrap Sequence

When `npm run bootstrap` is invoked, the system executes 6 sequential verification and seeding stages:

```
 [ STAGE 1 ] ──► [ STAGE 2 ] ──► [ STAGE 3 ] ──► [ STAGE 4 ] ──► [ STAGE 5 ] ──► [ STAGE 6 ]
 Environment      Database        Prisma Client    Database        Master Data     Credentials
 Diagnostics      Ping Check      Generation       Push Sync       RBAC Seeding    Summary
```

### Stage 1: Environment Diagnostics (`scripts/validators/env.js`)
- Inspects required vs optional `.env` keys (`DATABASE_URL`, Clerk keys, Stripe secrets, Resend key, UploadThing credentials, `NEXT_PUBLIC_APP_URL`).
- Displays a diagnostic status table in the terminal.

### Stage 2: Database Connectivity Check (`scripts/validators/db.js`)
- Sends a ping to PostgreSQL / Supabase connection pooler with a 5-second timeout safeguard.
- Handles network offline modes gracefully.

### Stage 3: Prisma ORM Client Generation
- Executes `npx prisma generate` to build type-safe TypeScript query bindings.

### Stage 4: Database Schema Push
- Executes `npx prisma db push --skip-generate` to sync tables, columns, indexes, and relations to PostgreSQL.

### Stage 5: Master RBAC Seeder (`scripts/seed-complete.js`)
- Provisions 6 RBAC user accounts:
  - **Super Admin**: `superadmin@weddingwithindia.com` (Role: `ADMIN`, full audit privileges)
  - **Platform Admin**: `admin@weddingwithindia.com` (Role: `ADMIN`, operations manager)
  - **Host Couple**: `host@weddingwithindia.com` (Role: `COUPLE`, `CoupleProfile` with listings)
  - **Guest Traveler**: `guest@weddingwithindia.com` (Role: `TRAVELER`, `TravelerProfile` with bookings)
  - **Referral Agent**: `agent@weddingwithindia.com` (Role: `AGENT`, `AgentProfile` with code `WWI-ROYAL-AGENT`)
  - **Coordinator**: `coordinator@weddingwithindia.com` (Role: `ADMIN`, city logistics lead)
- Connects 6 featured weddings, galleries, event timelines, traditions, guest bookings, encrypted QR guest passes, verified reviews with host replies, and accrued agent referral commissions.

### Stage 6: Terminal Summary Matrix
- Displays the complete credentials table and operational health check report.

---

## 3. Targeted Administrative Commands

```bash
# Run system diagnostics across all validators
npm run validate:all

# Validate environment variables only
npm run validate:env

# Seed master database only
npm run db:seed

# Promote any registered Clerk user to ADMIN role
node scripts/bootstrap-admin.js <user-email>
```
