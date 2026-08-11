# Master Orchestration Plan — WeddingWithIndia End-to-End Recovery

## Objective
Make the existing WeddingWithIndia application genuinely work end-to-end as a coherent production marketplace, recovering it autonomously through rigorous testing, root-cause fixes, and comprehensive verifications.

## Phase 0: Survey & Technical Investigation
- Spawn 3 parallel Explorers / Spec Miners to investigate current codebase state:
  1. `explorer_auth_db`: Focus on Auth & DB Integrity (`P2002` error in `syncAndGetDbUser()`, Clerk ID vs verified email reconciliation, Prisma singleton, connection/transaction timeouts, `Promise.race` leaks, transaction atomicity).
  2. `explorer_wedding_dashboards`: Focus on Wedding Lifecycle & Dashboards ("document type error" blocking listing creation, approval/rejection workflows, resubmission flow, Host/Traveler/Agent/Coordinator/Admin dashboard state fetching).
  3. `explorer_financial_ux`: Focus on Financial, Security, UI & Hydration Consistency (Stripe pricing/webhooks, KYC/uploads, messaging with PII moderation, homepage brand color/typography matching across dashboards, SSR hydration error elimination without `suppressHydrationWarning`).

## Phase 1: Feature Inventory & Milestone Decomposition
Merge Survey findings into `PROJECT.md § Feature Inventory` and establish concrete Milestones:
- **M1: Identity & Auth Hardening (R3)**: `P2002` email error resolution, founder DB row canonical reconciliation, Clerk ID matching via verified email, fail-closed DB auth.
- **M2: Database & Transaction Integrity (R4)**: Strict Prisma singleton, connection/transaction timeouts, removal of `Promise.race` leaks, transaction atomicity enforcement.
- **M3: Wedding Lifecycle & Admin Controls (R5)**: "Document type error" fix, listing creation flow, Admin approval/rejection/resubmission workflows, Admin portal route/control repairs.
- **M4: Dashboard Repair & UI/Hydration Consistency (R5, R6)**: Host/Traveler/Agent/Coordinator/Admin dashboards backend state integration, homepage brand color/typography alignment, deterministic SSR hydration fix.
- **M5: Financial, Security & Data Integrity (R5, R7)**: Server-authoritative Stripe pricing/checkout/webhooks idempotency, KYC upload gating, messaging PII moderation, data corruption safety.
- **M6: Quad-Verification & Single-Dev-Server Behavioral Testing (R2, R8)**: `npm run type-check`, `npm run lint`, `npm test`, `npm run build`, and single-dev-server runtime browser testing.
- **M7: Forensic Audit Verification**: `teamwork_preview_auditor` verification for clean implementation (0 integrity violations, 0 cheating).

## Dual Track Strategy
- **Implementation Track**: Executes M1 through M6 sequentially or in parallel dependency order, closing with E2E integration and adversarial hardening.
- **E2E Testing Track**: Maintains opaque-box test suite covering Tiers 1-4 based on user requirements.

## Verification & Audit Gates
- Build & Verification: `npm run type-check`, `npm run lint`, `npm test`, `npm run build`.
- Behavioral Verification: Single dev server runtime verification (e.g. login -> Admin -> manage weddings -> public listing).
- Forensic Audit: `teamwork_preview_auditor` verification for clean implementation (NO hardcoded expected values, facade implementations, or cheating).
