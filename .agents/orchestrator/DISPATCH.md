## 2026-08-09T19:46:30Z

You are the Project Orchestrator for the WeddingWithIndia marketplace project.
Your working directory is c:\Projects\WeddingWithIndia\wedding-with-india\.agents\orchestrator.
The original user request and requirements are recorded in c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md.

Requirements:
- R1: Admin Access & Control Center (`founder@weddingwithindia.com` server-authorized, mutations authorized).
- R2: Verification Lifecycle & Storage Security (Basic Info -> Admin Requests Verification -> User Uploads -> Admin Approves; block unrequested uploads at UI, Server Action, UploadThing, DB; private doc access).
- R3: User & Host Lifecycles (Strict state transitions for Travelers, Hosts, Agents; prevent state skipping & client-side state manipulation).
- R4: Financial Integrity (Server-authoritative calculation for price/tax/fee/commission/total; protect against price injection, duplicate webhooks, double refunds/payouts, cancelled booking payments).
- R5: Privacy & Contact Moderation (RBAC data minimization, protect PII, contact moderation filtering phone/email/WhatsApp leakage via homoglyphs, spaces, etc.).
- R6: Visual/UX Quality & Responsive QA (World-class standard, fix broken grids, typography, spacing, contrast, empty/loading states, responsiveness 320px-1920px).
- R7: Documentation (Generate `FINAL_ROUTE_MAP.md`, `ADMIN_OPERATIONS_GUIDE.md`, `USER_FLOWS.md`, and update `FINAL_PRODUCTION_AUDIT.md`).

## 2026-08-10T03:38:55Z

Execute God-level authentication, database availability, and admin access repair for WeddingWithIndia repository:
- R1: Fix Clerk Routing Correctly (catch-all routes app/login/[[...rest]]/page.tsx, app/signup/[[...rest]]/page.tsx while preserving custom UI).
- R2: Audit & remove bad client-trust architecture (app/login/client-trust/page.tsx), replacing it with server-authoritative user sync -> role resolution -> destination authorization -> redirect flow.
- R3: Diagnose & fix Database Availability (SERVICE_UNAVAILABLE in lib/auth.ts:isDatabaseAvailable(), root cause fix without disabling DB checks or synthetic fallbacks).
- R4: Enforce Fail-Closed Database Auth when DB is genuinely unavailable (no synthetic permissions/roles, professional service-unavailable UI).
- R5: Secure Founder Admin Bootstrap (founder@weddingwithindia.com authenticated via Clerk, synced with DB, ADMIN role, reaching /dashboard/admin).
- R6: Admin Routing & Auth Redirects (server-authoritative protection on /dashboard/admin/*, replace /sign-in dead redirects with /login, prevent open redirects).
- R7: Admin Controls & Verification Lifecycle (unrequested KYC uploads blocked at UI, Server Action, UploadThing, and DB).
- R8: Security, Financial, & UX Integrity (Stripe webhook idempotency, server-authoritative pricing, contact moderation, responsive QA 320px-1920px, error boundaries).

## 2026-08-10T16:22:35Z

Make the existing WeddingWithIndia application genuinely work end-to-end as a coherent production marketplace, recovering it autonomously through rigorous testing, root-cause fixes, and comprehensive verifications.

Requirements Overview:
1. R1. Independent & Coherent Execution: Autonomous Goal Mode. Logical workstreams. Single source of truth for findings in progress.md / context.md / plan.md.
2. R2. Strict Tooling: Do not repeatedly run `npm run dev` or leave multiple dev servers running. Rely on `npm run type-check`, `npm run lint`, `npm test`, and `npm run build` for code checks. Use at most ONE dev server for browser/runtime testing.
3. R3. Identity & Auth Hardening: Resolve the `P2002` email error in `syncAndGetDbUser()`. Founder DB row is canonical truth. Reconcile Clerk ID using verified email, create user only if neither exists. Never duplicate founders, downgrade ADMIN/ACTIVE, or trust client identities.
4. R4. Database & Transaction Integrity: Audit `lib/prisma.ts`, `lib/auth.ts`, schema, API routes. Strict Prisma singleton, connection/transaction timeouts, remove `Promise.race` leaks, transaction atomicity without external calls inside transactions.
5. R5. End-to-End Repair: Fix Admin portal routes/controls, Wedding lifecycle ("document type error" blocking listing creation, approval/rejection workflows), Host/Traveler/Agent/Coordinator/Admin dashboards, Booking & Stripe server-authoritative pricing/webhooks, KYC/uploads, messaging with PII moderation.
6. R6. UI & Hydration Consistency: Match homepage brand colors/typography across Admin and all dashboards. Fix SSR hydration errors deterministically (no `suppressHydrationWarning`).
7. R7. Security & Data Integrity: Do NOT reset database. Resolve real data corruption safely. Enforce server-authoritative RBAC, Stripe signature verification, PII moderation.
8. R8. Verification & Behavioral Testing: Code-level verification + single dev server runtime verification.

## 2026-08-11T03:07:03Z

Resume work at c:\Projects\WeddingWithIndia\wedding-with-india\.agents\orchestrator (Gen 2 Project Orchestrator).
Parent conversation ID: a063668d-04ab-4c05-9776-bb07044273bd.
Milestones M1, M2, and M3 are DONE and verified CLEAN.
Immediate mission:
1. Start fresh heartbeat cron via `schedule(CronExpression="*/10 * * * *")`.
2. Execute Milestone M4: Dashboard Repair & UI/Hydration Consistency (Requirements R5 & R6).
   - Eliminate client component locale/date hydration mismatches without `suppressHydrationWarning`.
   - Verify Admin portal (19 sub-routes) and dashboards match homepage brand tokens (`#6b1026` Royal Maroon, `#c9972a` Luxury Gold, `#fdfaf7` Warm Ivory, `#1a1a1a` Dark Charcoal).
   - Gate verification: Reviewers, Challengers, Auditor.
3. Execute Milestone M5: Financial, Security & Quad-Verification Run (Requirements R2 & R8).
   - Server-authoritative Stripe pricing, webhook idempotency, KYC gating, PII moderation.
   - Full Quad-Verification suite (`type-check`, `lint`, `test`, `build`) and single-dev-server behavioral test.
4. Execute Milestone M6: Forensic Audit Verification (`teamwork_preview_auditor` final CLEAN verdict).
5. Send completion message to parent (`a063668d-04ab-4c05-9776-bb07044273bd`) and claim victory in `progress.md`.

## 2026-08-30T03:30:03Z

You are the Project Orchestrator for the independent verification, hostile red-team, real-user, and marketplace forensic audit of the WeddingWithIndia codebase.

Authority and Request:
- The authoritative user request is recorded in: `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md`
- Your dedicated working directory is: `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\orchestrator`
- Project Root: `c:\Projects\WeddingWithIndia\wedding-with-india`

Strict Constraints:
- Zero mutations to project code, configs, dependencies, or databases. The working tree must remain clean (`git status`).
- You may only write metadata files (plans, progress, reports) under `.agents/`.

Core Requirements:
1. Re-verify & reconcile all Audit Pass 1 findings (SEC-01, UX-01, OPS-01, SEC-02, TRU-01, FIN-01, UX-02, UX-03) with exact line-level evidence and verdict tags (VERIFIED, PARTIALLY VERIFIED, FALSE POSITIVE, OUTDATED, UNVERIFIED).
2. Hostile Red-Team & Adversarial Invariant Testing (Horizontal/Vertical authorization matrices, concurrency/race conditions, state machine invariants).
3. Performance Root-Cause Forensics ("Why is it slow?" - bundle sizes, boundaries, waterfalls, queries, missing Suspense, third-party overhead).
4. Real-User Foreign Traveler Experience & Marketplace Inventory (KEEP/REDUCE/COMBINE/MOVE/REMOVE/ADD, inventory realism, mobile ergonomics).
5. Deliver complete Sections A through P, 11-dimension scorecard, Regression Dependency Graph, Do-Not-Touch list, Top 10 Core Changes, and direct answers to Part 31 Top 10 Forensic Questions.

Maintain `BRIEFING.md`, `plan.md`, `progress.md`, and final deliverable reports in your working directory. Send a message to Sentinel upon completion.
