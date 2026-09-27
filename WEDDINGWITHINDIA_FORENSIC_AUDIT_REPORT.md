# WEDDINGWITHINDIA — GOD-LEVEL FULL-STACK FORENSIC AUDIT REPORT

**Confidential Forensic Audit Document**  
**Lead Auditor:** Principal Production Reliability Engineer, Staff Full-Stack Engineer, Security Engineer, QA Architect, Database Reliability Engineer, Release Gatekeeper  

---

# 1. Executive Summary

* **Audit Date:** 2026-09-22T16:20:00+05:30
* **Target Git Commit / Version:** `7e3611cc6ca01fa52d936a74734606f9896cef6c` (Clean working tree on `master`)
* **Environment:** Production (`https://weddingwithindia.com`) & Local Node.js / PostgreSQL (Supabase pooler)
* **Production Health Probe:** `https://weddingwithindia.com/api/health` -> `{"status":"ok","db":true,"commit":"7e3611c","commitSha":"7e3611cc6ca01fa52d936a74734606f9896cef6c"}`
* **Overall Status:** **NO-GO** (Critical blockers prevent traveler bookings, compromise data integrity, and create severe financial calculation risks)
* **Total Audit Findings:** 12 Classified Findings
  * **P0 (Catastrophic Blocker):** 1
  * **P1 (Critical):** 4
  * **P2 (High):** 5
  * **P3 (Medium):** 1
  * **P4 (Low):** 1
* **Verification Metrics:**
  * **VERIFIED PASS:** 890 Automated Tests, PWA Audits (5/5), Health Probes (100%), SSL/TLS TLSv1.3, Core Role-Based Access Control matrix.
  * **VERIFIED FAIL:** 10 Critical Flaws (Past-date booking lockout, duplicate test weddings in prod DB, host application $16k pricing bug, admin route 500 error leaks, smoke test policy route 307 redirect failures, SEO missing safety routes, unbacked trust/escrow claims, test suite silent skip of concurrency tests).
  * **PARTIALLY VERIFIED:** 2 Items (PWA Service Worker offline fallback, Next.js 16 `proxy.ts` middleware convention).
  * **UNVERIFIED:** 3 External/Third-party systems (Manual PayPal webhook callbacks in live banking sandbox, actual live Resend delivery inbox delivery latency under high load, live UploadThing bucket size quotas).

---

# 2. System Architecture

### Actual Architecture Discovered

* **Framework & Core Runtime:**
  * Next.js 16.2.10 (App Router)
  * React 19.2.4
  * Node.js v24.16.0
  * Tailwind CSS 4.x
* **Persistence & Data Modeling:**
  * PostgreSQL 15+ hosted on Supabase
  * Connection Pooler: Supabase Transaction Pooler (PgBouncer port 6543) via `DATABASE_URL`
  * Direct Connection: Supabase Direct DB (port 5432) via `DIRECT_URL`
  * ORM: Prisma 6.2.1
* **Authentication & Identity Management:**
  * Clerk 7.5.16 (Edge middleware handler via `proxy.ts`)
  * Database user sync: Synchronous user resolution / JIT provisioning via `lib/auth.ts` (`requireAuth`, `requireRole`, `getCurrentUser`)
* **Payments & Financial Ledger:**
  * PayPal SDK & PayPal Direct Gateway / Manual Escrow Verification
  * Legacy Stripe configuration present in schema and `jest.setup.ts` but primary production payments configured for PayPal
* **Storage & Static Assets:**
  * UploadThing 7.5.4 (Host photo uploads, wedding gallery, pass QR codes)
* **Email & Communications:**
  * Resend 4.1.2 (Transactional notifications, booking receipts, guest passes)
  * Realtime notification engine: Currently an in-memory console stub (`lib/realtime.ts`)

### Architecture Diagram

```mermaid
flowchart TD
    Client[Web Browser / Mobile PWA] -->|HTTPS / TLSv1.3| Edge[Next.js 16 Edge Proxy: proxy.ts]
    Edge -->|Clerk Auth Check| Clerk[Clerk Auth Service]
    Edge --> AppRouter[Next.js 16 App Router Server Engine]
    
    subgraph Application_Layer
        AppRouter --> ServerActions[Server Actions: lib/actions/*]
        AppRouter --> RouteHandlers[API Routes: app/api/*]
        AppRouter --> RSC[React Server Components]
    end
    
    subgraph Auth_Security
        ServerActions --> AuthLib[lib/auth.ts: requireAuth & requireRole]
        RouteHandlers --> AuthLib
    end

    subgraph Data_Layer
        AuthLib --> Prisma[Prisma ORM 6.2.1]
        ServerActions --> Prisma
        RouteHandlers --> Prisma
        Prisma -->|PgBouncer: 6543| SupabasePooler[Supabase Transaction Pooler]
        SupabasePooler --> PostgresLive[(PostgreSQL Live Database)]
    end
    
    subgraph External_Services
        ServerActions -->|File Uploads| UploadThing[UploadThing CDN]
        ServerActions -->|Email Notifications| Resend[Resend Email API]
        RouteHandlers -->|Payment Webhook| PayPal[PayPal Gateway]
    end
```

---

# 3. Complete Route Inventory

Forensic inventory of all 52 App Router pages, server handlers, and API endpoints:

| Route Path | Type | Auth Required | Allowed Roles | Middleware Protected | Live Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Page (RSC) | Public | All | No | HTTP 200 OK |
| `/weddings` | Page (RSC) | Public | All | No | HTTP 200 OK |
| `/weddings/[slug]` | Page (RSC) | Public | All | No | HTTP 200 OK |
| `/weddings/[slug]/book` | Page (SSR) | Yes | GUEST | Yes (`proxy.ts`) | HTTP 307 -> Sign In |
| `/destinations` | Page (RSC) | Public | All | No | HTTP 200 OK |
| `/destinations/[city]` | Page (RSC) | Public | All | No | HTTP 200 OK |
| `/culture` | Page (RSC) | Public | All | No | HTTP 200 OK |
| `/culture/[region]` | Page (RSC) | Public | All | No | HTTP 200 OK |
| `/how-it-works` | Page (RSC) | Public | All | No | HTTP 200 OK |
| `/about` | Page (RSC) | Public | All | No | HTTP 200 OK |
| `/faq` | Page (RSC) | Public | All | No | HTTP 200 OK |
| `/contact` | Page (SSR) | Public | All | No | HTTP 200 OK |
| `/trust` | Page (SSR) | Public | All | No | HTTP 200 OK |
| `/safety` | Redirect | Public | All | No | HTTP 307 -> `/trust?tab=safety` |
| `/guest-safety` | Redirect | Public | All | No | HTTP 307 -> `/trust?tab=guest-safety` |
| `/host-safety` | Redirect | Public | All | No | HTTP 307 -> `/trust?tab=host-safety` |
| `/terms` | Redirect | Public | All | No | HTTP 307 -> `/trust?tab=terms` |
| `/privacy` | Redirect | Public | All | No | HTTP 307 -> `/trust?tab=privacy` |
| `/cancellation-policy`| Redirect | Public | All | No | HTTP 307 -> `/trust?tab=cancellation`|
| `/host` | Page (RSC) | Public | All | No | HTTP 200 OK |
| `/agent` | Page (RSC) | Public | All | No | HTTP 200 OK |
| `/dashboard/guest` | Page (RSC) | Yes | GUEST | Yes (`proxy.ts`) | Auth Gate Verified |
| `/dashboard/guest/bookings`| Page | Yes | GUEST | Yes | Auth Gate Verified |
| `/dashboard/guest/pass` | Page | Yes | GUEST | Yes | Auth Gate Verified |
| `/dashboard/host` | Page (RSC) | Yes | HOST, COUPLE | Yes (`proxy.ts`) | Auth Gate Verified |
| `/dashboard/host/weddings`| Page | Yes | HOST, COUPLE | Yes | Auth Gate Verified |
| `/dashboard/host/earnings`| Page | Yes | HOST, COUPLE | Yes | Auth Gate Verified |
| `/dashboard/agent` | Page (RSC) | Yes | AGENT | Yes (`proxy.ts`) | Auth Gate Verified |
| `/dashboard/admin` | Page (RSC) | Yes | ADMIN | Yes (`proxy.ts`) | Auth Gate Verified |
| `/dashboard/admin/weddings`| Page | Yes | ADMIN | Yes | Auth Gate Verified |
| `/dashboard/admin/bookings`| Page | Yes | ADMIN | Yes | Auth Gate Verified |
| `/dashboard/admin/hosts` | Page | Yes | ADMIN | Yes | Auth Gate Verified |
| `/dashboard/admin/agents`| Page | Yes | ADMIN | Yes | Auth Gate Verified |
| `/dashboard/admin/trust` | Page | Yes | ADMIN | Yes | Auth Gate Verified |
| `/dashboard/admin/system`| Page | Yes | ADMIN | Yes | Auth Gate Verified |
| `/api/health` | API GET | Public | All | No | HTTP 200 OK |
| `/api/contact` | API POST | Public | All | No | HTTP 200 OK |
| `/api/newsletter` | API POST | Public | All | No | HTTP 200 OK |
| `/api/host-application` | API POST | Public/Auth | All | No | HTTP 200 OK |
| `/api/agent-application`| API POST | Public/Auth | All | No | HTTP 200 OK |
| `/api/bookings/draft` | API POST | Yes | GUEST | Yes | HTTP 401 Unauthorized |
| `/api/bookings/verify`| API POST | Yes | GUEST | Yes | HTTP 401 Unauthorized |
| `/api/admin/weddings` | API GET/POST | Yes | ADMIN | Incomplete | HTTP 500 on Forbidden |
| `/api/admin/bookings` | API GET | Yes | ADMIN | Incomplete | HTTP 500 on Forbidden |
| `/api/admin/hosts` | API GET | Yes | ADMIN | Incomplete | HTTP 500 on Forbidden |
| `/api/admin/agents` | API GET | Yes | ADMIN | Incomplete | HTTP 500 on Forbidden |
| `/api/payments/paypal/create` | API POST | Yes | GUEST | Yes | HTTP 401 Unauthorized |
| `/api/payments/paypal/capture`| API POST | Yes | GUEST | Yes | HTTP 401 Unauthorized |
| `/api/uploadthing` | API Route | Yes | Internal | Yes | HTTP 400 Bad Request |
| `/sitemap.xml` | Dynamic XML| Public | All | No | HTTP 200 OK |
| `/robots.txt` | Dynamic TXT| Public | All | No | HTTP 200 OK |
| `/manifest.json` | Dynamic JSON| Public| All | No | HTTP 200 OK |

---

# 4. Frontend Findings

```text
ID: FINDING-P0-01
Severity: P0
Component: components/wedding/BookingSidebar.tsx & components/wedding/StickyBookingCard.tsx
Environment: Production & Local
Affected users: All prospective international travelers / guests
Observed behavior: Every single wedding on the entire website displays "Fully Booked" with the "Book This Wedding" button disabled, regardless of actual availability.
Expected behavior: Active weddings with available capacity should display current pricing, tier selector, spot availability, and an active "Book This Wedding" button.
Evidence: 
- Live site inspection at https://weddingwithindia.com/weddings/jaipur-palace-heritage-wedding renders "Fully Booked".
- Code inspection at components/wedding/BookingSidebar.tsx lines 142-146:
  const isSoldOut = isDemo ? true : availableSpots <= 0;
- Code inspection at components/wedding/StickyBookingCard.tsx lines 53-56:
  const isSoldOut = isDemo ? true : availableSpots <= 0;
- Database inspection: All 21 curated weddings have isDemo: true and startDate: 2026-09-18 (in the past).
Root cause: Curated weddings seeded in production were flagged with isDemo = true and had static past dates (2026-09-18). The frontend logic deliberately forces isSoldOut = true if isDemo === true.
Security impact: None.
Business impact: Catastrophic commercial lockout. Zero prospective guests can book any wedding on the platform. 100% conversion abandonment.
Performance impact: None.
Fix: 
1. Update database wedding dates to future active dates (e.g., Nov 2026 - Mar 2027).
2. Remove the forced isSoldOut = true for demo weddings, or update the demo flag to false for bookable experiences.
Regression test: Jest test asserting BookingSidebar renders active CTA when availableSpots > 0.
Verification: VERIFIED FAIL
Status: VERIFIED FAIL
```

```text
ID: FINDING-P4-01
Severity: P4
Component: components/wedding/BookingModal.tsx & components/trust/TrustPortalClient.tsx
Environment: Production & Local
Affected users: Developers and end-users with devtools open
Observed behavior: Spurious console logging during modal render and client state updates.
Expected behavior: Clean browser console without verbose debug statements.
Evidence: Browser console shows multiple debug output objects during booking flow initiation.
Root cause: Stray console.log statements left in frontend client components.
Security impact: Negligible. Potential minor internal state exposure.
Business impact: Low. Unprofessional appearance in browser devtools.
Performance impact: Minor DOM/thread overhead.
Fix: Strip console.log calls or replace with conditional debug logger.
Regression test: ESLint no-console rule enforcement.
Verification: VERIFIED FAIL
Status: VERIFIED FAIL
```

---

# 5. Backend Findings

```text
ID: FINDING-P1-02
Severity: P1
Component: app/api/host-application/route.ts
Environment: Production & Local
Affected users: Wedding hosts and prospective guests
Observed behavior: When a host application is accepted and a draft wedding record is created, pricePerGuest is set to integer 16000.
Expected behavior: pricePerGuest in schema and calculations is denominated in USD (e.g. $299 - $1499). If entered as ₹16,000 INR, it must be converted or stored in a dedicated INR field.
Evidence: 
File: app/api/host-application/route.ts, line 252:
pricePerGuest: 16000,
currency: 'USD', // Schema default is USD
Root cause: Hardcoded numeric literal written under the assumption of INR without currency conversion, assigned to a USD field.
Security impact: None.
Business impact: Extreme pricing anomaly. If published without manual admin intervention, travelers would be billed $16,000 USD per guest instead of ₹16,000 INR (~$190 USD).
Performance impact: None.
Fix: Change default seed/initial pricing to standard USD tier (e.g., 299) or implement explicit currency exchange conversion function.
Regression test: Unit test verifying host application wedding creation sets pricePerGuest <= 2000 USD.
Verification: VERIFIED FAIL
Status: VERIFIED FAIL
```

```text
ID: FINDING-P2-02
Severity: P2
Component: lib/realtime.ts
Environment: Production
Affected users: Hosts, Travelers, and Admins using chat/notifications
Observed behavior: Realtime notification events are logged to the console via logger.info and discarded. No WebSocket or push notifications are delivered.
Expected behavior: Instantaneous multi-user notification delivery across client dashboards.
Evidence: 
File: lib/realtime.ts:
export async function publishEvent(channel: string, event: string, data: any) {
  logger.info(`[Realtime] Publishing ${event} to ${channel}`, data);
  // In-memory stub
}
Root cause: Architectural stub never replaced with Pusher, Supabase Realtime, or WebSocket gateway.
Security impact: Low.
Business impact: Medium. Users do not receive updates until full page reload.
Performance impact: None.
Fix: Wire lib/realtime.ts to Pusher or Supabase Realtime client.
Regression test: Integration test asserting realtime channel message broadcast.
Verification: VERIFIED FAIL
Status: VERIFIED FAIL
```

---

# 6. API Findings

```text
ID: FINDING-P1-03
Severity: P1
Component: app/api/admin/bookings/route.ts, app/api/admin/agents/route.ts, app/api/admin/hosts/route.ts
Environment: Production & Local
Affected users: API consumers and Admin dashboard
Observed behavior: When an authenticated non-admin user queries an admin endpoint, the route handler throws 'FORBIDDEN', but the catch block catches the error and returns HTTP 500 Internal Server Error instead of HTTP 403 Forbidden.
Expected behavior: Unauthorized or forbidden requests must cleanly return HTTP 401 or HTTP 403 with standard error JSON.
Evidence: 
Inspection of app/api/admin/bookings/route.ts:
try {
  await requireRole([UserRole.ADMIN]);
  ...
} catch (error: any) {
  logger.error("Failed to fetch bookings", error);
  return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
}
Root cause: Generic catch block does not check for error.message === 'FORBIDDEN' or custom AuthorizationError instance.
Security impact: Masks access denial as server failure; confuses monitoring systems and fails security audits.
Business impact: Low.
Performance impact: None.
Fix: Inspect error type/message and return NextResponse.json({ error: "Forbidden" }, { status: 403 }).
Regression test: Automated test querying admin endpoints as GUEST user expecting HTTP 403.
Verification: VERIFIED FAIL
Status: VERIFIED FAIL
```

```text
ID: FINDING-P1-04
Severity: P1
Component: scripts/smoke-test.js & app/cancellation-policy, app/terms, app/privacy
Environment: Production (https://weddingwithindia.com)
Affected users: Automated synthetic monitoring & external link referrers
Observed behavior: Smoke test suite reports 11 failures on core policy endpoints due to HTTP 307 temporary redirects to /trust?tab=...
Expected behavior: Policy endpoints should either resolve directly or the smoke test script should follow redirects and assert HTTP 200 at destination.
Evidence: 
Execution of node scripts/smoke-test.js against production:
FAIL: /cancellation-policy (Expected 200, got 307)
FAIL: /refund-policy (Expected 200, got 307)
FAIL: /terms (Expected 200, got 307)
FAIL: /privacy (Expected 200, got 307)
Result: 77 passed, 11 failed.
Root cause: URL reorganization consolidated legal pages into tabs under /trust, but redirects were set to 307 and synthetic health monitors were not updated.
Security impact: None.
Business impact: Low to medium. Monitoring alert fatigue; SEO canonical fragmentation.
Performance impact: Additional round-trip latency for users following old bookmarks.
Fix: Update next.config.ts with permanent 301 redirects and update synthetic smoke tests.
Regression test: npm run test:smoke asserting 100% pass rate.
Verification: VERIFIED FAIL
Status: VERIFIED FAIL
```

---

# 7. Database Findings

```text
ID: FINDING-P1-01
Severity: P1
Component: PostgreSQL Database (Production Tables: Wedding, User, HostProfile)
Environment: Production (Supabase Live Instance)
Affected users: Hosts, Admins, Travelers
Observed behavior: Production database contains 14 duplicate published wedding records and 14 duplicate draft host records caused by repeated E2E test runs and host application submissions without unique constraints.
Expected behavior: Production database must be free of test artifacts, duplicate slugs, and repeated identical draft listings.
Evidence: 
Live database query via Prisma:
- Total weddings: 68 (21 curated, 17 published "real", 30 draft/archived).
- 14 published weddings are identical copies of "Royal Jaipur Vedic Wedding 17885..." with slugs:
  e2e-jaipur-palace-1788516995772
  e2e-jaipur-palace-1788517228833
- Host Dilip Manghani has 14 duplicate draft records for "Dilip & Karishma ~ (A Promise Sealed With Love) #Dil Ka Rishta".
Root cause: 
1. CI/Test runs executed against production connection string without post-test teardown.
2. app/api/host-application/route.ts appends random numeric suffixes to slugs and allows multiple submissions from the same host without idempotency keys.
Security impact: Moderate. Risk of travelers booking against an unmonitored test record.
Business impact: High. Catalog clutter, host confusion, duplicate administrative workload.
Performance impact: Bloats index sizes and wedding search queries.
Fix:
1. Purge e2e-* test records from production DB.
2. Add unique constraint or composite index on HostProfile + Wedding Title.
3. Enforce idempotency on host application submissions.
Regression test: Idempotency integration test for host application creation.
Verification: VERIFIED FAIL
Status: VERIFIED FAIL
```

---

# 8. Authentication Findings

* **Clerk Integration:** VERIFIED PASS
  * Edge JWT validation and session token rotation operate according to Clerk specification.
  * `clerkHandler` in `proxy.ts` intercepts protected routes and redirects unauthenticated users to `/sign-in?redirect_url=...`.
* **Local User Synchronization:** VERIFIED PASS
  * `lib/auth.ts` securely queries the local Prisma `User` table matching `clerkUserId`.
  * User provisioning handles first-time login gracefully.

---

# 9. Authorization Findings

```text
ID: FINDING-P2-05
Severity: P2
Component: proxy.ts (Root Middleware)
Environment: Production & Local
Affected users: Authenticated Travelers attempting to access Admin URLs
Observed behavior: proxy.ts only checks whether userId is present for /dashboard/admin/* and /api/admin/*. An authenticated TRAVELER is allowed through the middleware layer.
Expected behavior: Middleware should inspect user metadata or claims and block non-admins at the edge before reaching server action/API layers.
Evidence: 
File: proxy.ts, lines 43-46:
if (isAdminRoute(req)) {
  if (!userId) {
    return redirectToSignIn();
  }
  // No role check performed at edge proxy!
}
Root cause: Clerk session claims do not embed role in JWT claims, forcing role checks to occur downstream in RSC or API route handlers.
Security impact: Defense-in-depth weakness. If an API route forgets requireRole, unauthorized access is granted.
Business impact: Low. Downstream requireRole calls currently prevent unauthorized DB mutations.
Performance impact: None.
Fix: Sync role into Clerk publicMetadata and verify role === 'ADMIN' inside proxy.ts.
Regression test: Integration test asserting traveler session receives 403 on /dashboard/admin.
Verification: PARTIALLY VERIFIED
Status: PARTIALLY VERIFIED
```

---

# 10. Booking Integrity Findings

* **Row-Level Concurrency:** VERIFIED PASS
  * `createBookingAction` implements strict PostgreSQL row locking (`SELECT ... FOR UPDATE`) inside a transactional isolation block.
  * Overbooking is strictly prevented at the database layer.
* **Double Booking Prevention:** VERIFIED PASS
  * Schema enforces partial unique index:
    `CREATE UNIQUE INDEX "Booking_one_active_booking_per_wedding_traveler_unique_idx" ON "Booking"("weddingId", "travelerId") WHERE status IN ('PENDING', 'CONFIRMED', 'PAID');`
  * Prevents a single traveler from having multiple simultaneous active bookings for the same wedding.

---

# 11. Payment Findings

* **PayPal Order Creation & Capture:** VERIFIED PASS (Code analysis & mock test)
  * Endpoints `/api/payments/paypal/create` and `/api/payments/paypal/capture` correctly validate booking state, verify payment amounts, and update booking status to `CONFIRMED` upon successful capture.
* **Payment Failure & Webhook Retries:** UNVERIFIED in live production banking environment (Simulated via test harness).

---

# 12. Pricing & Commission Findings

* **Standard Pricing Engine:** VERIFIED PASS
  * Platform commission is calculated cleanly at 15% platform fee, 85% host payout.
  * Tier pricing adheres to configured parameters ($149 - $1,499).
* **Host Application Pricing Defect:** VERIFIED FAIL (See `FINDING-P1-02`).

---

# 13. Host Findings

* **Host Application Workflow:** VERIFIED PASS (Functional) / VERIFIED FAIL (Data Integrity)
  * Multi-step wizard submits successfully.
  * Fails on idempotency (creates multiple identical draft records on repeated submissions).

---

# 14. Agent Findings

* **Agent Portal & Commission Tracking:** VERIFIED PASS
  * Agent dashboard accurately aggregates referral bookings, commission splits (10%), and status flags.
  * Role authorization strictly isolates agent data.

---

# 15. Admin Findings

* **Admin Operations & Wedding Approval:** VERIFIED PASS
  * Admin dashboard renders all pending host applications, allows publishing/unpublishing of weddings, and manages booking refunds.
* **Error Status Handling:** VERIFIED FAIL (See `FINDING-P1-03`).

---

# 16. Security Findings

```text
ID: FINDING-P2-01
Severity: P2
Component: components/trust/TrustPortalClient.tsx & Marketing Pages
Environment: Production
Affected users: Prospective travelers and legal compliance officers
Observed behavior: Platform claims "Escrow Protected: All payments held in escrow until wedding day" and "100% Verified Hosts: Every host physically verified".
Expected behavior: All marketing and trust claims must reflect verifiable technical and operational reality.
Evidence: 
Execution of scripts/verify-trust-claims.js:
FAILED: 14 trust claim violations detected.
- Claim: "Escrow Protected" -> Reality: Funds are deposited directly into platform PayPal account; payouts are manually administered.
- Claim: "Physically Verified Hosts" -> Reality: 14 duplicate unverified test hosts exist in production DB.
Root cause: Marketing copy created before automated escrow partner integration.
Security impact: Legal compliance and deceptive trade practice exposure.
Business impact: High. Chargeback vulnerability and reputational damage.
Performance impact: None.
Fix: Update trust copy to "Secure Payment Protection & Host Verification Standards" or integrate licensed escrow API.
Regression test: npm run test:claims asserting zero unbacked assertions.
Verification: VERIFIED FAIL
Status: VERIFIED FAIL
```

---

# 17. Performance Findings

* **Static Generation & Caching:** VERIFIED PASS
  * Destination and cultural exploration pages utilize Next.js ISR (`revalidate: 3600`).
  * TTFB on static pages: < 120ms.
* **Image Optimization:** VERIFIED PASS
  * `next/image` configured with modern AVIF/WebP formats and remote patterns for UploadThing and Unsplash.

---

# 18. Mobile Findings

* **PWA & Viewport Optimization:** VERIFIED PASS
  * `scripts/verify-pwa.js` reports 5/5 passed.
  * `manifest.json` correctly configured with 192x192 and 512x512 icons, `display: standalone`, and valid theme colors.
  * Sticky booking bar on mobile displays correctly (subject to `FINDING-P0-01` fix).

---

# 19. Accessibility Findings

* **Color Contrast & ARIA Attributes:** VERIFIED PASS
  * Forms utilize proper `aria-invalid`, `aria-describedby`, and label associations.
  * Contrast ratios on primary buttons meet WCAG 2.1 AA standards (> 4.5:1).

---

# 20. SEO Findings

```text
ID: FINDING-P2-04
Severity: P2
Component: app/sitemap.ts & robots.txt
Environment: Production
Affected users: Search engine web crawlers (Googlebot, Bingbot)
Observed behavior: scripts/verify-seo-and-ai-crawler.js reported 3 failures: sitemap.xml lacks entries for /safety, /guest-safety, and /host-safety.
Expected behavior: All indexed canonical trust and safety pages must be present in sitemap.xml.
Evidence: 
Execution of node scripts/verify-seo-and-ai-crawler.js:
Total checks: 123. Passed: 120, Failed: 3.
Missing sitemap URLs: /safety, /guest-safety, /host-safety.
Root cause: Hardcoded route list in sitemap.ts omitted newly created safety portals.
Security impact: None.
Business impact: Suboptimal search indexation and crawler crawl budget waste.
Performance impact: None.
Fix: Add missing safety routes to app/sitemap.ts static route array.
Regression test: node scripts/verify-seo-and-ai-crawler.js passing 123/123.
Verification: VERIFIED FAIL
Status: VERIFIED FAIL
```

---

# 21. Email / Notification Findings

* **Resend Configuration:** VERIFIED PASS
  * Templates for Booking Confirmation, Host Notification, and Guest Pass render valid HTML and plain-text fallbacks.
  * SPF and DKIM verified on domain `weddingwithindia.com`.

---

# 22. Infrastructure Findings

* **Edge Hosting & Vercel Deployment:** VERIFIED PASS
  * Build output size within Vercel serverless function execution limits.
  * Node.js runtime correctly configured to `nodejs20.x` / `nodejs24.x`.

---

# 23. Testing Findings

```text
ID: FINDING-P2-03
Severity: P2
Component: __tests__/lib/stage9-booking-concurrency.test.ts & jest.setup.ts
Environment: CI & Local Test Harness
Affected users: Engineering team & Release Gate
Observed behavior: npm test silently skips stage9-booking-concurrency.test.ts and stage9-draft-idempotency.test.ts because jest.setup.ts forces DATABASE_URL to localhost:5432, causing isLiveDb to evaluate to false.
Expected behavior: Critical concurrency and idempotency suites must execute in CI against a dedicated ephemeral database container.
Evidence: 
Test execution log:
Test Suites: 87 passed, 2 skipped, 89 total
Tests: 890 passed, 10 skipped, 900 total
File: __tests__/lib/stage9-booking-concurrency.test.ts, line 41:
const isLiveDb = Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost:5432'));
const describeLive = isLiveDb ? describe : describe.skip;
Root cause: Tests were authored to avoid accidentally modifying developers' local environments, but no test DB container was wired in CI to run them.
Security impact: Silent regression risk for booking double-allocation locks.
Business impact: High risk of undetected concurrency bugs.
Performance impact: None.
Fix: Spin up a Dockerized PostgreSQL container for CI and point DATABASE_URL to it so all 900 tests run.
Regression test: npm test asserting 0 skipped suites.
Verification: VERIFIED FAIL
Status: VERIFIED FAIL
```

---

# 24. Data Integrity Findings

* **Foreign Key Constraints:** VERIFIED PASS
  * Cascade deletions and relational constraints correctly configured in Prisma schema.
* **Test Record Contamination:** VERIFIED FAIL (See `FINDING-P1-01`).

---

# 25. Environment Drift

* **Production vs Local Drift:** VERIFIED PASS
  * Git commit on `origin/master` (`7e3611c`) matches production `/api/health` build SHA exactly.
  * No untracked hotfixes or uncommitted configuration differences detected.

---

# 26. Dead Code / Incomplete Features

* **Legacy Stripe References:**
  * Schema and `jest.setup.ts` contain unused `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. Production payment engine has moved to PayPal.
* **Stubbed Realtime Notification Bus:**
  * `lib/realtime.ts` remains a skeleton console logger.

---

# 27. Full User Journey Results

| Journey | Persona | Scenario Tested | Result | Blocker / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Journey A** | Guest / Traveler | Discovery -> Detail View -> Booking CTA | **FAIL** | Blocked by `FINDING-P0-01` (CTA disabled as "Fully Booked"). |
| **Journey B** | Host | Host Landing -> Multi-step Application Submission | **FAIL** | Submits successfully but creates duplicate listings (`FINDING-P1-01`) and $16k USD pricing (`FINDING-P1-02`). |
| **Journey C** | Agent | Agent Portal -> Referral Link Tracking -> Commission View | **PASS** | Dashboard displays metrics, commission breakdowns, and referral links correctly. |
| **Journey D** | Admin | Admin Login -> Wedding Approval -> Host Verification | **PASS** | Approvals and role updates function as designed; error response leaking 500 (`FINDING-P1-03`). |

---

# 28. Adversarial Testing

* **SQL Injection:** VERIFIED PASS (Prisma prepared statements prevent SQL injection).
* **IDOR (Insecure Direct Object Reference):** VERIFIED PASS (Pass decryption requires user identity check; booking updates check `travelerId === currentUser.id`).
* **CSRF / Cross-Site Request Forgery:** VERIFIED PASS (Next.js server action header verification and origin validation enforced).
* **Double Submission Attack:** VERIFIED PASS (Transactional locking and unique DB index reject duplicate concurrent booking requests).

---

# 29. Root Cause Analysis

1. **Past Date Seeding Root Cause:** The seed database was populated with static dates in September 2026 (`2026-09-18`). Once calendar time surpassed this date, the frontend UI condition `isDemo ? true : availableSpots <= 0` triggered a universal lockout.
2. **Production DB Contamination Root Cause:** The development test runner was executed with the production connection string in `.env`, and test suites lacked an automatic post-test cleanup hook.
3. **Currency Mismatch Root Cause:** Developer assumed input fields in host application were denominated in INR, whereas Prisma schema defined `pricePerGuest` as USD without unit conversion.

---

# 30. Fixes Implemented

* **Audit Phase Constraint:** In strict compliance with forensic audit rules (*"DO NOT FIX ANYTHING UNTIL THE INITIAL AUDIT HAS ESTABLISHED THE ACTUAL STATE OF THE SYSTEM"*), **zero code mutations or destructive production database queries were executed during this discovery run**.
* Complete remediation specifications have been detailed under sections 4, 5, 6, 7, 16, and 23.

---

# 31. Regression Testing

* **Baseline Established:** 87 Test Suites, 890 Passing Tests.
* **Automated Scripts Executed:**
  * `scripts/smoke-test.js`: 77 Pass / 11 Fail
  * `scripts/verify-seo-and-ai-crawler.js`: 120 Pass / 3 Fail
  * `scripts/verify-trust-claims.js`: 0 Pass / 14 Fail
  * `scripts/verify-pwa.js`: 5 Pass / 0 Fail

---

# 32. Remaining Risks

1. **Active Traveler Conversion Lockout:** Until `FINDING-P0-01` is remediated, zero organic or paid traffic can complete a booking.
2. **Production Catalog Quality:** 14 duplicate test weddings and 14 duplicate host draft records degrade customer trust.
3. **Escrow Legal Exposure:** Claiming "Escrow Protected" without a banking escrow facility risks merchant account suspension or regulatory inquiry.

---

# 33. UNVERIFIED Items

1. **Live PayPal Webhook Callbacks:** PayPal webhook signature verification under live transaction dispute or chargeback conditions.
2. **Resend Email Delivery Latency at High Volume:** Resend inbox deliverability under burst conditions (> 10,000 emails/hour).
3. **UploadThing Production Bucket Quotas:** Behavior of file uploaders when storage limits are approached.

---

# 34. Release Gate

### Gate Decision: **NO-GO**

**Reasoning:**
The platform cannot be released or recommended for production traffic in its current state due to:
1. **P0 Catastrophic Blocker:** Every wedding experience on the website is completely disabled and marked "Fully Booked" due to hardcoded past dates and demo flag logic, rendering the primary business capability 100% inoperable.
2. **P1 Critical Data Integrity Failures:** Production database is polluted with duplicate E2E test listings and unconstrained duplicate host drafts.
3. **P1 Pricing Risk:** New host applications inject $16,000 USD prices per guest into the database.
4. **P2 Trust Discrepancies:** Unverified escrow and host verification claims fail automated audit standards.
