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

