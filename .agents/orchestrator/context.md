# Technical Context Index — WeddingWithIndia End-to-End Recovery

## Project Overview
WeddingWithIndia is an online marketplace for Indian weddings connecting Travelers, Hosts, Agents, Coordinators, and Admins.

## Working Directory
`c:\Projects\WeddingWithIndia\wedding-with-india`

## Key Locations & Metadata
- Requirements: `.agents/ORIGINAL_REQUEST.md` (Follow-up 2026-08-10T16:22:35Z)
- Orchestrator Directory: `.agents/orchestrator/`
- Master Plan: `.agents/orchestrator/plan.md`
- Active Progress: `.agents/orchestrator/progress.md`
- Project Scope & Inventory: `.agents/PROJECT.md` and `.agents/orchestrator/PROJECT.md`

## Focus Areas & Workstreams
1. **Auth & Identity (R3)**: `lib/auth.ts`, `syncAndGetDbUser()`, `P2002` email handling, founder DB row canonical truth, Clerk ID reconciliation.
2. **Database & Transactions (R4)**: `lib/prisma.ts`, Prisma connection pooling, transaction timeouts, `Promise.race` memory leaks, transaction atomicity.
3. **Wedding Lifecycle & Admin Portal (R5)**: Document type handling, listing creation, approval/rejection workflows, resubmission, Admin routes/controls (`users`, `weddings`, `verifications`, `bookings`, `finance`, etc.).
4. **Dashboards & UI/Hydration (R5, R6)**: Host, Traveler, Agent, Coordinator, Admin dashboards real data fetching, brand color & typography matching homepage, deterministic SSR hydration fixes without `suppressHydrationWarning`.
5. **Financial & Security Integrity (R5, R7)**: Stripe server-authoritative pricing, checkout, webhooks idempotency, KYC upload gating, PII message moderation.
6. **Tooling & Verification (R2, R8)**: `type-check`, `lint`, `test`, `build`, single dev server runtime verification.
