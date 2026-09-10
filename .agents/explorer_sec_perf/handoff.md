# TECHNICAL AUDIT REPORT: Security, Performance, Accessibility, SEO & Operations (Explorer 4)

**Target System**: WeddingWithIndia Marketplace  
**Auditor**: Explorer 4 (Security, Performance, Accessibility, SEO & Operations)  
**Date**: 2026-08-30  
**Status**: COMPLETE (Hard Handoff)  
**Scope**: Defensive Security, Performance Bottlenecks (Section F), Accessibility (WCAG 2.2 AA), SEO & Structured Data, Operations & Observability, E2E Test Scenarios Plan (Section M), Do-Not-Touch List (Section O).

---

## 1. OBSERVATION

### 1.1 Defensive Security Audit Observations

#### A. Authentication & Session Handling
- **P0 Critical Vulnerability — Hardcoded E2E Test Authentication Bypass**:
  - **Location**: `lib/test-auth.ts:5-7`, `lib/test-auth.ts:3`, `proxy.ts:57-80`, `app/api/test/auth/route.ts:7-78`, `lib/auth.ts:28-150`.
  - **Code Evidence** (`lib/test-auth.ts:5-7`):
    ```ts
    const E2E_SECRET = process.env.E2E_AUTH_SECRET || "e2e-secret-key-wedding-with-india-dev-test-only";

    export function isE2ETestAuthEnabled(): boolean {
      return true; // HARDCODED TRUE IN ALL ENVIRONMENTS
    }
    ```
  - **Code Evidence** (`proxy.ts:57-80`):
    ```ts
    if (isE2ETestAuthEnabled()) {
      let e2eCookie = req.cookies.get("__wwi_e2e_session")?.value;
      ...
      if (e2eCookie) {
        const session = verifyE2ETestSessionToken(e2eCookie);
        if (session) {
          if (isAdminRoute(req) && session.role !== "ADMIN") { ... }
          return NextResponse.next(); // BYPASSES CLERK FOR ALL ROUTES
        }
      }
    }
    ```
  - **Code Evidence** (`app/api/test/auth/route.ts:7-39`):
    ```ts
    export async function GET(req: NextRequest) {
      if (!isE2ETestAuthEnabled()) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const { searchParams } = new URL(req.url);
      const role = searchParams.get("role");
      ...
      const token = createE2ETestSessionToken(user.id, user.role, user.email);
      response.cookies.set("__wwi_e2e_session", token, { httpOnly: true, secure: false, sameSite: "lax", path: "/", maxAge: 86400 });
      return response;
    }
    ```
  - **Reproduction**: Making a single HTTP request `GET /api/test/auth?role=ADMIN` issues an active session cookie `__wwi_e2e_session` that authenticates the user as `ADMIN` across both middleware (`proxy.ts`) and backend Server Actions (`lib/auth.ts:getE2ETestDbUser()`). In production, this endpoint is active and accessible to unauthenticated attackers worldwide.
- **Stale Auth Env Variable Reference**:
  - **Location**: `app/dashboard/events/[bookingId]/page.tsx:55`.
  - **Code**: `const origin = process.env.NEXTAUTH_URL || "https://weddingwithindia.com";`. The application uses Clerk Auth, not NextAuth.
- **Session Cookies**:
  - Affiliate attribution cookie (`wwi_ref` in `proxy.ts:149-156`) is set with `httpOnly: true`, `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"`, `maxAge: 30 days`.

#### B. Authorization & IDOR (Insecure Direct Object Reference)
- **Role Escalation Protection**:
  - `lib/actions/index.ts:46-66` (`updateUserRoleAction`): Explicitly blocks self-assignment of `UserRole.ADMIN` (throws `FORBIDDEN: Cannot self-assign administrative roles`) and rejects changes if `user.status !== "ONBOARDING"`.
- **Resource Ownership Enforcement**:
  - `app/api/account/bookings/route.ts:16`: Scoped to authenticated user's `travelerId: travelerProfile.id`.
  - `app/api/invoice/[bookingId]/route.ts:44-49`: Verified via `user.role !== UserRole.ADMIN && booking.traveler.userId !== user.id`.
  - `app/api/reports/host/[weddingId]/route.ts:31-36`: Verified via `user.role !== UserRole.ADMIN && wedding.hostCouple.userId !== user.id`.
  - `app/api/safety/evidence/[evidenceId]/route.ts:33-55`: Access restricted to Admin, uploader, reporter, subject user, or case participants.
  - `lib/actions/index.ts:313-366` (`editWedding`, `deleteWedding`): Checks `existing.hostCoupleId !== coupleProfile.id`.
  - `lib/actions/index.ts:721-774` (`cancelBookingAction`): Validates `dbBooking.traveler.userId !== user.id`.
  - `lib/actions/index.ts:780-859` (`updateBookingSideAction`): Validates `booking.travelerId !== traveler.id`.
  - `lib/actions/index.ts:861-915` (`handleGuestApplicationAction`): Validates `booking.wedding.hostCouple.userId !== user.id`.
  - `app/api/admin/bookings/route.ts:50-54`: Explicitly rejects direct status patches to `PAID` or `CONFIRMED`, requiring the authoritative financial verification action.

#### C. Injection & Sanitization
- **SQL Injection**:
  - Zero raw string SQL concatenations exist in application source code (`app/`, `lib/`).
  - All raw queries use tagged templates with parameterized inputs:
    - `lib/actions/admin.ts:1092`: `await tx.$queryRaw\`SELECT id FROM "Wedding" WHERE id = ${booking.weddingId} FOR UPDATE\``
    - `lib/actions/index.ts:593`: `await tx.$queryRaw\`SELECT id FROM "Wedding" WHERE id = ${data.weddingId} FOR UPDATE\``
    - `lib/actions/index.ts:896`: `await tx.$queryRaw\`SELECT id FROM "Wedding" WHERE id = ${booking.weddingId} FOR UPDATE\``
    - `lib/prisma.ts:82`, `app/api/health/route.ts:18`, `app/api/ready/route.ts:13`: `await prisma.$queryRaw\`SELECT 1\``
- **Cross-Site Scripting (XSS)**:
  - User-generated content (reviews, wedding descriptions, host bios, chat messages) is rendered via standard React JSX expressions (`{content}`), ensuring automatic HTML escaping.
  - `dangerouslySetInnerHTML` is restricted exclusively to JSON-LD `<script type="application/ld+json">` tags.
  - **P2 Minor Finding**: `app/founder/tanishq-gupta/page.tsx:122,126` omits `.replace(/</g, "\\u003c")` on `personJsonLd` and `breadcrumbJsonLd` (unlike all other pages).
- **CSV Formula Injection (Spreadsheet DDE)**:
  - **Location**: `app/api/reports/host/[weddingId]/route.ts:38-50`.
  - **Code**:
    ```ts
    const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    ```
  - **Vulnerability**: If user-controlled fields (`traveler.fullName` or `traveler.foodPreferences`) start with formula operators (`=`, `+`, `-`, `@`, `\t`, `\r`), spreadsheet applications (Excel, Google Sheets) interpret them as formulas when opened by the host.

#### D. CSRF & CORS Policies
- `next.config.ts:15-71`: Enforces security headers on `/(.*)`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `Content-Security-Policy`: Restricts `frame-ancestors 'none'`, `form-action 'self'`, whitelists Clerk, Stripe, UploadThing, and Google Analytics.
- API endpoints do not set wildcard CORS headers (`Access-Control-Allow-Origin: *`); all API routes default to same-origin.
- Server Actions enforce Next.js built-in Origin/Host CSRF verification.

#### E. Rate Limiting
- **Implementation**: `lib/rate-limit.ts` uses an in-memory `Map` with sliding-window timestamps.
- **Coverage**:
  - `app/api/contact/route.ts:8`: 5 submissions per 10 minutes (`limit: 5, window: 600`).
  - `app/api/newsletter/route.ts:13`: 10 subscriptions per 10 minutes (`limit: 10, window: 600`).
  - `lib/actions/index.ts:574`: Booking creation (5 per 10 min).
  - `lib/actions/messages.ts:50,191`: Conversation creation (5 per 5 min), Message send (10 per 1 min).
  - `lib/actions/reviews.ts:115,299,497,559,606,776`: Review submit, edit, report, vote, reply, appeal.
  - `lib/actions/safety.ts:112`: Incident reporting (3 per hour).
- **P1 Gaps in Rate Limiting**:
  - `app/api/host-application/route.ts`: No rate limit on `POST /api/host-application` (unbounded wedding listing creation).
  - `app/api/agent-application/route.ts`: No rate limit.
  - `app/api/reports/host/[weddingId]/route.ts`: No rate limit on CSV generation.
  - `app/api/safety/evidence/[evidenceId]/route.ts`: No rate limit on evidence access.
  - **Architectural Limit**: In-memory `Map` rate limiting is process-local and resets on serverless cold starts or multi-instance scaling.

#### F. Secret & Credential Leakage
- `.gitignore:40` includes `.env*`.
- Client bundle scan: Zero server secrets (`CLERK_SECRET_KEY`, `RESEND_API_KEY`, `UPLOADTHING_SECRET`, `GUEST_PASS_ENCRYPTION_KEY`, `DATABASE_URL`, `STRIPE_SECRET_KEY`) are accessed in client components or bundled into client JS.
- `lib/security/guest-pass-crypto.ts:48`: Falls back to `Buffer.alloc(32)` (32 zero bytes) if `GUEST_PASS_ENCRYPTION_KEY` is not set in development.
- `lib/env.ts:1-53`: Validates required environment variables with Zod (`DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `RESEND_API_KEY`, `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID`, `GUEST_PASS_ENCRYPTION_KEY`, `NEXT_PUBLIC_APP_URL`).

---

### 1.2 Performance Bottlenecks Observations (Section F)

#### A. Bundle Size & Dependencies
- Next.js 16.2.10, React 19.2.4, Tailwind CSS v4.
- `next.config.ts:159`: Configures `experimental.optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"]`.
- Icon package `lucide-react` is imported with named specifiers (e.g. `import { Search, MapPin } from "lucide-react"`).
- Heavy client components:
  - `app/dashboard/operations/ClientOperationsCenter.tsx` (22KB)
  - `app/dashboard/admin/weddings/page.tsx` (30KB)
  - `components/wedding/HostEarningsCalculator.tsx` (24KB)
  - `components/home/Hero.tsx` (24KB)
  - These components do not utilize `next/dynamic` for deferred client hydration.

#### B. Image & Asset Pipeline
- Next.js `<Image />` component is used across 38 files in `app/` and `components/`.
- `next.config.ts:164-207`:
  - Formats: `["image/avif", "image/webp"]`
  - Cache TTL: `31536000` (1 year)
  - Remote patterns: `images.unsplash.com`, `plus.unsplash.com`, `i.pravatar.cc`, `img.clerk.com`, `utfs.io`, `uploadthing.com`, `api.qrserver.com`.
- `Hero.tsx:194-206`: Uses `fill`, `priority`, `quality={85}`, `sizes="100vw"`.
- Only a single raw `<img>` tag exists in `components/dashboard/GuestQRCodeModal.tsx:71` for dynamic data URI rendering.

#### C. Request Waterfalls & Missing Loading Boundaries
- **Missing `loading.tsx` Boundaries**: Only 8 `loading.tsx` files exist in the entire application (`app/dashboard/loading.tsx`, `dashboard/admin/loading.tsx`, `dashboard/bookings/loading.tsx`, `dashboard/events/loading.tsx`, `dashboard/listings/loading.tsx`, `dashboard/messages/loading.tsx`, `weddings/loading.tsx`, `weddings/[slug]/loading.tsx`).
- **16 Routes Missing `loading.tsx`**:
  - `/destinations`, `/destinations/[region]` (rajasthan, goa, punjab, kerala, delhi-ncr, mumbai)
  - `/learn`, `/learn/[slug]` (7 article guides)
  - `/about`, `/coordinators`, `/for-agents`, `/for-agents/dashboard`, `/for-couples`
  - `/dashboard/settings`, `/dashboard/wishlist`, `/dashboard/safety`, `/dashboard/referrals`, `/dashboard/operations`, `/dashboard/earnings`, `/dashboard/check-in`
- **Dashboard Data Fetching**: `app/dashboard/page.tsx` executes sequential database queries instead of batching via `Promise.all()`.

#### D. Error Boundaries & Process Crash Risk
- App-level error boundary: `app/error.tsx` (branded luxury UI with retry).
- Root-level error boundary: `app/global-error.tsx` (includes `<html>` and `<body>` tags).
- Branded 404 handler: `app/not-found.tsx`.
- **P1 Operational Hazard in `instrumentation.ts:54-57`**:
  ```ts
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Rejection", undefined, reason);
    cleanup("unhandledRejection"); // Calls process.exit(0) immediately!
  });
  ```
  Calling `process.exit(0)` on any transient unhandled promise rejection immediately kills the Node.js server process and terminates all concurrent in-flight requests.

---

### 1.3 Accessibility (WCAG 2.2 AA) & SEO Observations

#### A. Accessibility Compliance (WCAG 2.2 AA)
- **Semantic Structure**: Full semantic hierarchy (`<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`, `<article>`).
- **ARIA Labeling**: Over 100 `aria-label`, `aria-labelledby`, `role="region"`, `role="dialog"`, `aria-modal="true"`, and `sr-only` elements across all core UI components.
- **Focus Indicators**: Explicit focus rings (`focus-visible:ring-2`, `focus:outline-none`, `focus-visible:ring-[var(--color-brand-primary)]`).
- **Color Contrast**:
  - Deep Royal Maroon (`#6b1026`) on Warm Cream (`#fdfaf7`): **11.4:1** (Exceeds WCAG AAA requirement of 7:1).
  - Charcoal Body Text (`#2b2627`) on White (`#ffffff`): **14.2:1** (Exceeds WCAG AAA).
  - Gold Accent (`#d4af37` / `#b38a1a` on dark backgrounds): **4.8:1** (Meets WCAG AA).
- **Reduced Motion**: Prefers-reduced-motion respected in `components/home/Hero.tsx:23,42` via `useReducedMotion()`.

#### B. SEO & Crawlability
- **Dynamic XML Sitemap (`app/sitemap.ts`)**: Generates 50+ canonical routes including destination clusters, educational guides, legal terms, and dynamically queries published weddings from PostgreSQL with authentic `updatedAt` timestamps.
- **Robots Policy (`app/robots.ts`)**: Grants crawl permissions to Googlebot, Bingbot, OpenAI (OAI-SearchBot), Anthropic (ClaudeBot), PerplexityBot while strictly disallowing private routes (`/dashboard/`, `/admin/`, `/account/`, `/onboarding/`, `/api/`).
- **Structured Data (JSON-LD)**:
  - Root: `Organization` schema with sameAs social profiles and contact points (`app/layout.tsx:135`).
  - Search: `WebSite` schema with Google Sitelinks `SearchAction` (`app/layout.tsx:168`).
  - Weddings: `Event` & `TouristAttraction` schema on `app/weddings/[slug]/page.tsx:164`.
  - Destinations: `Place` & `BreadcrumbList` schema on all `/destinations/*` pages.
  - Learn Hub: `Article` & `FAQPage` schema on all `/learn/*` pages.

---

### 1.4 Operations & Observability Observations

- **Structured Logger (`lib/logger.ts`)**: Emits structured JSON entries in production (`level`, `message`, `timestamp`, `context`, `error.name`, `error.message`).
- **Startup Diagnostics (`instrumentation.ts:4-24`)**: Validates database availability (`isDatabaseAvailable()`) upon server bootstrap.
- **Database Audit Trail (`prisma.auditLog`)**: Models all high-value administrative mutations, booking transitions, verification decisions, and host application updates.
- **Cron Jobs**:
  - `/api/cron/commission-settlement/route.ts`: Settles matured agent referral commissions after 14-day hold.
  - `/api/cron/event-reminders/route.ts`: Sends automated email reminders 7 days and 24 hours prior to wedding ceremonies.
  - Both cron endpoints authenticate via `Authorization: Bearer <CRON_SECRET>`.

---

## 2. LOGIC CHAIN

```
[Observation: lib/test-auth.ts has isE2ETestAuthEnabled() { return true; } and hardcoded HMAC fallback]
  │
  ├─► [Observation: proxy.ts checks isE2ETestAuthEnabled() and accepts __wwi_e2e_session cookie]
  │
  ├─► [Observation: app/api/test/auth/route.ts issues __wwi_e2e_session cookie for any role via GET/POST]
  │
  ├─► [Observation: lib/auth.ts:getE2ETestDbUser() provisions a full User with role from token]
  │
  └─► [Logic Deduction: Any remote attacker can request /api/test/auth?role=ADMIN or sign a local token with the public secret to gain immediate, complete administrative takeover in production.] (P0 Vulnerability)

[Observation: app/api/reports/host/[weddingId]/route.ts escapes CSV by wrapping in quotes without sanitizing leading chars =, +, -, @]
  │
  └─► [Logic Deduction: A malicious guest providing a name or dietary note beginning with =cmd|' /C calc'!A0 causes spreadsheet software to execute formula macros when the host downloads the guest register.] (P1 Vulnerability)

[Observation: instrumentation.ts terminates the process on unhandledRejection via process.exit(0)]
  │
  └─► [Logic Deduction: Any unhandled promise rejection in an asynchronous callback or third-party SDK immediately terminates the entire Node.js server, dropping all active user connections.] (P1 Operational Hazard)

[Observation: 16 route subtrees lack loading.tsx files and execute sequential DB queries]
  │
  └─► [Logic Deduction: Navigating to destination and educational routes causes client UI freezing and waterfall render delays without skeleton feedback.] (P2 Performance Bottleneck)
```

---

## 3. CAVEATS

1. **Non-Destructive Audit Mode**: In accordance with audit constraints, no source files were modified, and no live adversarial payloads were executed against production databases.
2. **Third-Party CDN Asset Verification**: UploadThing file storage relies on UploadThing's external presigned URL authorization. While file type restrictions are defined in `lib/storage/index.ts`, the `blob` type in `documents` allows up to 16MB file uploads.
3. **Distributed Rate Limiting**: The in-memory sliding window rate limiter (`lib/rate-limit.ts`) was audited statically. Under multi-instance containerization (Kubernetes / AWS ECS) or serverless (Vercel), state is partitioned per instance and requires an external store (e.g. Upstash Redis) for unified cluster enforcement.

---

## 4. CONCLUSION

WeddingWithIndia exhibits strong architectural foundations:
- Strict role-based authorization guards on all core mutations.
- Zero raw string SQL injection vulnerabilities (100% parameterized queries).
- Rigorous WCAG 2.2 AA accessibility and semantic HTML structure.
- Comprehensive SEO metadata, sitemaps, robots policy, and rich JSON-LD schemas.
- Server-authoritative financial calculation engine and AES-256-GCM encrypted guest pass cryptography.

However, **one critical P0 vulnerability and two P1 issues require immediate remediation prior to production deployment**:
1. **P0**: Disable `isE2ETestAuthEnabled()` in production environments (`process.env.NODE_ENV !== "test" || process.env.PLAYWRIGHT_TEST !== "true"`) and remove the hardcoded HMAC secret fallback.
2. **P1**: Remove `process.exit(0)` on `unhandledRejection` in `instrumentation.ts` to prevent denial-of-service server crashes.
3. **P1**: Sanitize CSV formula prefixes (`=`, `+`, `-`, `@`, `\t`, `\r`) in `app/api/reports/host/[weddingId]/route.ts`.

---

## 5. VERIFICATION METHOD

### Independent Verification Commands
```bash
# 1. Verify TypeScript type-checking
npm run type-check

# 2. Run unit and integration test suite
npm test -- --no-coverage

# 3. Verify security & rate limit unit tests
npx jest __tests__/lib/rate-limit.test.ts __tests__/lib/proxy-auth.test.ts __tests__/lib/pricing-engine.test.ts

# 4. Verify Next.js production build
npm run build
```

---

## 6. FORENSIC DELIVERABLES (SECTIONS M & O)

### SECTION M: E2E TEST SCENARIOS PLAN (TIERS 1 THROUGH 4)

#### Tier 1: Feature Coverage (Core Lifecycle Traversal)
| Test ID | Journey / Feature | Actors | Preconditions | Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **T1-01** | Foreign Traveler Booking & Pass Generation | Traveler | Published wedding with available capacity | 1. Browse `/weddings`<br>2. Select wedding and guest count (2)<br>3. Submit booking request<br>4. Host approves<br>5. Traveler completes payment<br>6. View `/dashboard/events/[id]` | Booking transitions `PENDING → APPROVED → PAID`. AES-256-GCM Guest Pass generated with valid QR hash. Invoice available at `/api/invoice/[id]`. |
| **T1-02** | Host Celebration Listing & Verification | Host Couple | Onboarding complete, KYC submitted | 1. Navigate to `/list-wedding`<br>2. Fill 5-step form (dates, traditions, capacity, photos)<br>3. Submit application<br>4. Admin reviews at `/dashboard/admin/hosts`<br>5. Admin approves KYC | Wedding created in `DRAFT` status. Admin approval transitions verification to `APPROVED` and permits `PUBLISHED` status. |
| **T1-03** | Travel Agent Attribution & Commission Hold | Travel Agent, Traveler | Agent profile with referral code `AGENT-MUMBAI` | 1. Traveler visits `/?ref=AGENT-MUMBAI`<br>2. Cookie `wwi_ref` set<br>3. Traveler registers & completes booking<br>4. Cron triggers `/api/cron/commission-settlement` | Commission created in `PENDING` status with 14-day maturity hold. After hold, cron transitions commission to `APPROVED`. |
| **T1-04** | Coordinator Check-In & QR Verification | Coordinator, Traveler | Active guest pass with valid QR code | 1. Coordinator opens `/dashboard/check-in`<br>2. Scans traveler QR pass token<br>3. Server decrypts token via `decryptPass()` and matches `qrTokenHash`<br>4. Confirm check-in | Guest pass marked `CHECKED_IN`, timestamp recorded in `GuestCheckIn` ledger, duplicate scan rejected with `ALREADY_CHECKED_IN`. |
| **T1-05** | Admin Multi-Role Operations & Lead Center | Admin | Authenticated Admin session | 1. Access `/dashboard/admin`<br>2. Review host applications, booking overrides, refunds<br>3. View audit logs at `/dashboard/admin/audit`<br>4. Update platform settings | Admin actions log to `prisma.auditLog` with actor ID and metadata. Sensitive financial mutations require explicit confirmation. |

#### Tier 2: Boundary & Corner Cases
| Test ID | Scenario | Input / Boundary Condition | Expected System Behavior |
| :--- | :--- | :--- | :--- |
| **T2-01** | Concurrent Booking Over-Capacity Race | Wedding capacity = 10; two users simultaneously book 6 and 5 guests | PostgreSQL row lock (`SELECT id FROM "Wedding" WHERE id = $1 FOR UPDATE`) serializes transactions; first succeeds, second fails with `INSUFFICIENT_CAPACITY`. |
| **T2-02** | Client-Side Price / Tier Parameter Tampering | Attacker submits `POST /api/host-application` or booking with `pricePerGuest: 1` or modified Tier | Server ignores client price; calculates authoritative amount via `calculateBookingPricing()` using server-side matrix. |
| **T2-03** | Tiered Refund Window Boundary Test | Cancellation at 31 days vs 29 days vs 13 days vs 48 hours prior to wedding | >30 days: 100% refund (`AUTO_APPROVED`). 14-30 days: 50% refund (`REQUESTED`). <14 days: 0% refund (`DENIED`). |
| **T2-04** | Expired / Revoked Guest Pass Scan | Pass scanned 49 hours after celebration date or after booking cancellation | Server rejects scan with `PASS_EXPIRED` or `PASS_REVOKED`; check-in record created with `result: "REJECTED"`. |
| **T2-05** | Duplicate Email Signup Race | Two simultaneous signups with identical email address | `syncAndGetDbUser()` catches Prisma `P2002` error, fetches existing row, and safely reconciles Clerk ID. |
| **T2-06** | Multi-Tab Attendance Side Mutation | User alters attendance side in Tab A while checking in on Tab B | Server checks `hasCheckedIn` status; rejects modification if check-in has already occurred. |

#### Tier 3: Pairwise Combinations Matrix
| Combo ID | User Role | Wedding Tier | Payment Method | Viewport / Client | Locale / Currency |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **T3-01** | Traveler | STANDARD (1-day) | Stripe Card | Mobile (390px, iOS Safari) | en-US / USD ($149) |
| **T3-02** | Traveler | GRAND (3-day) | Manual PayPal | Desktop (1920px, Chrome) | en-GB / USD ($449) |
| **T3-03** | Traveler | SIGNATURE_ROYAL (5-day) | Stripe Card | Tablet (768px, iPadOS) | en-IN / USD ($1199) |
| **T3-04** | Host Couple | ROYAL (4-day) | UPI / Bank Transfer | Mobile (412px, Android Chrome) | en-IN / INR (₹51,101) |
| **T3-05** | Travel Agent | ENHANCED (2-day) | Payout Request | Desktop (1440px, Firefox) | en-US / INR (₹1,011) |
| **T3-06** | Coordinator | GRAND (3-day) | N/A (Camera Scan) | Mobile (390px, PWA Standalone) | en-IN / N/A |
| **T3-07** | Admin | SIGNATURE_ROYAL | Manual Override | Desktop (1920px, Edge) | en-US / USD & INR |

#### Tier 4: Real-World Foreign Traveler Journeys
| Scenario ID | Persona & Context | Critical Path / Edge Conditions | Verification Criteria |
| :--- | :--- | :--- | :--- |
| **T4-01** | **US Traveler First-Time Cultural Immersion**: Sarah & David from New York booking a 3-Day Grand Rajasthani Wedding in Udaipur. | 1. Explores `/destinations/rajasthan` and `/learn/what-to-wear-to-an-indian-wedding`<br>2. Books 2 passes ($449/guest)<br>3. Notes dietary need: "Severe Peanut Allergy & Vegetarian"<br>4. Completes Traveler Preparation checklist (dress code acknowledgment, emergency contact)<br>5. Accesses offline Digital Pass on phone at venue | - Cultural guidelines and attire guide loaded without layout shift.<br>- Dietary restrictions propagated to Host Guest Register.<br>- PWA Service Worker caches `/offline` and passes for low-connectivity venue access. |
| **T4-02** | **UK Traveler Multi-City Itinerary with Visa Delay**: James from London experiencing flight rescheduling 5 days before wedding. | 1. Updates arrival flight details in Event Hub (`/dashboard/events/[id]`)<br>2. Initiates coordinator chat in `/dashboard/messages`<br>3. Requests attendance side switch from OPEN to GROOM_SIDE | - Travel update persists atomically in `TravelDetail` model.<br>- Real-time notification dispatched to assigned coordinator.<br>- Attendance side update logs to `AuditLog`. |
| **T4-03** | **Host Family Dispute & Safety Escrow Hold**: Host emergency forces date change 10 days before event. | 1. Host flags date adjustment<br>2. Traveler opens Safety Case at `/dashboard/safety/report`<br>3. Financial hold applied to host payout<br>4. Admin mediates and issues full refund | - `financialHold: true` set on `SafetyCase`, freezing payout release.<br>- Admin triggers `processApprovedRefund()`, executing Stripe refund outside DB transaction.<br>- Ledger records `REFUND` transaction and sends confirmation email. |

---

### SECTION O: DO-NOT-TOUCH LIST (MISSION-CRITICAL MODULES)

| # | File Path / Module | Critical Invariant & Algorithm | Why It Must Not Be Casually Altered | Regression Hazard |
|---|:---|:---|:---|:---|
| **1** | `lib/auth.ts`<br>`syncAndGetDbUser()` | **P2002 Race Protection & ID Reconciliation**: Unlinks stale `clerkUserId` before re-linking by email; wraps user creation in `P2002` duplicate catch. Protects founder record from role downgrade. | Modifying the multi-branch reconciliation logic will cause duplicate user row errors, unauthenticated user deadlocks, or accidental founder privilege drops. | High (Complete Authentication Failure) |
| **2** | `lib/prisma.ts`<br>`withDbRetry()` | **Connection Pool Resilience**: Single Prisma client instance with exponential backoff retry for transient PgBouncer `Connection terminated` / timeout errors. | Removing retry wrappers will cause 500 errors on cold starts, Supabase pool exhaustion, or transient network blips. | High (Database Availability Drop) |
| **3** | `lib/services/pricing-engine.ts`<br>`calculateBookingPricing()` | **Server-Authoritative Multi-Currency Matrix**: Single source of truth for USD customer prices ($149-$1199), fixed INR host payouts (₹5,101-₹61,101), and agent commissions (₹511-₹2,511). | Delegating pricing calculations to client input or altering fixed INR matrices breaks the platform unit economics model and margin guarantees. | Critical (Financial Arbitrage / Revenue Loss) |
| **4** | `lib/security/guest-pass-crypto.ts`<br>`encryptPass()`, `decryptPass()` | **AES-256-GCM Cryptographic Standard**: Encrypts pass tokens with 12-byte random IV, generating `iv:authTag:ciphertext` and indexed SHA-256 hashes. | Altering the IV length, encryption algorithm, or token serialization format will immediately invalidate all existing active passes in the production database. | Critical (Event Gate Entry Failure) |
| **5** | `app/api/webhooks/stripe/route.ts`<br>`POST()` | **Cryptographic Signature & Idempotency Lock**: `stripe.webhooks.constructEvent()` verification + persistent `prisma.stripeWebhookEvent` uniqueness check. Network email dispatches are strictly outside `$transaction`. | Moving network calls back inside transaction blocks will cause database connection timeouts during payment spikes. Bypassing event deduplication causes double pass issuance. | Critical (Double Spend / Connection Starvation) |
| **6** | `lib/actions/index.ts`<br>`handleGuestApplicationAction()` & `createBookingAction()` | **Pessimistic Concurrency Locking**: `SELECT id FROM "Wedding" WHERE id = $1 FOR UPDATE` locks the wedding row before validating capacity. | Removing the row lock introduces race conditions where concurrent bookings oversubscribe venue capacity beyond host limits. | High (Overbooking / Physical Venue Overflow) |
| **7** | `lib/services/refunds.ts`<br>`processApprovedRefund()` | **Decoupled Financial Execution**: Atomically transitions `Booking` and `Payment` states in PostgreSQL before executing asynchronous payment provider refunds. | Coupling external HTTP refunds inside DB transactions leads to deadlocks if payment provider APIs experience latency. | High (Transaction Deadlocks) |
| **8** | `lib/culture.ts`<br>`validateWeddingAuthenticity()` | **Cultural Authenticity Dictionary**: Enforces ceremony mapping, religious tradition profiles (Hindu, Sikh, Muslim, South Indian, Christian), and dietary context defaults. | Relaxing cultural authenticity validation allows low-quality or fake listings to pollute the marketplace inventory. | Medium (Brand & Trust Degradation) |
