# Master Orchestration Plan — WeddingWithIndia Marketplace

## Objective
Final end-to-end production completion, security hardening, UX polish, documentation, and release management for WeddingWithIndia.

## Phase 0: Survey & Technical Mapping
- Spawn 3 Explorers / Spec Miners to map codebase architecture, route tree, Server Actions, UploadThing integration, financial calculation paths, database schemas, and existing test suites.
- Consolidate Feature Inventory and Technical Baseline.

## Phase 1: Milestone Decomposition (R1 - R7)
- **M1: Admin Access & Control Center (R1)**: Server-side authorization for `founder@weddingwithindia.com`, secure admin mutations, audit logging.
- **M2: Verification Lifecycle & Storage Security (R2)**: Request-driven KYC flow (Basic Info -> Admin Requests -> User Uploads -> Admin Approves), storage lock (UploadThing & Server Actions), private document delivery.
- **M3: User & Host Lifecycles & State Machine (R3)**: Explicit lifecycle transitions for Travelers, Hosts, Agents; server-side authoritative state management; prevent state bypassing.
- **M4: Financial Integrity & Checkout Protection (R4)**: Server-authoritative calculations (price, tax, commission, fee, total), negative value rejection, webhooks idempotency, refund/payout protection.
- **M5: Privacy & Contact Moderation (R5)**: Data minimization (RBAC), PII protection in APIs/DB, contact info filtering (phone, email, WhatsApp, homoglyphs, zero-width spaces).
- **M6: Visual/UX Quality & Responsive QA (R6)**: Grid alignment, typography, responsive styling (320px - 1920px), empty/loading/error states, remove fake data / Math.random / fallback hacks.
- **M7: Documentation & Final Release Governance (R7)**: Generate `FINAL_ROUTE_MAP.md`, `ADMIN_OPERATIONS_GUIDE.md`, `USER_FLOWS.md`, and update `FINAL_PRODUCTION_AUDIT.md`.

## Dual Track Strategy
- **Implementation Track**: Executes M1 through M7 sequentially or in parallel dependency order, closing with E2E integration and adversarial hardening (Tier 5).
- **E2E Testing Track**: Builds opaque-box test suite covering Tiers 1-4 based on user requirements (Category-Partition, BVA, Pairwise, Real-World Workloads) and publishes `TEST_READY.md`.

## Verification & Audit Gates
- Build verification: `npm run build`, `npm run type-check`, `npm run lint`.
- Test verification: `npm test -- --no-coverage`, `npx playwright test`.
- Forensic Audit: `teamwork_preview_auditor` verification for clean implementation (NO hardcoded expected values, facade implementations, or cheating).
