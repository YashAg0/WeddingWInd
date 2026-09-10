# MASTER AUDIT REPORT: WeddingWithIndia Marketplace
**A Comprehensive, Adversarial, Multi-Dimensional Architectural, UX, Trust, Security & Operational Audit**

---

- **Target System**: `WeddingWithIndia` (`c:\Projects\WeddingWithIndia\wedding-with-india`)
- **Audit Date**: 2026-08-30
- **Orchestrator**: Project Orchestrator (`.agents/orchestrator_1/`)
- **Integrity Standard**: Strict Non-Destructive Audit (0 source code, database, config, or business logic files modified)
- **Scope**: Sections A through P (Complete Product, UX, Engineering, Trust, Performance, Security, Conversion, and Regression Assessment)

---

## TABLE OF CONTENTS
1. [Section A: Executive Verdict & Dimension Scores](#section-a-executive-verdict)
2. [Section B: Critical Findings (P0 to P4 Table)](#section-b-critical-findings)
3. [Section C: Route-by-Route & API Matrix](#section-c-route-by-route--api-matrix)
4. [Section D: User Flow Matrix (Multi-Role)](#section-d-user-flow-matrix)
5. [Section E: State Machine Transitions (Valid vs Invalid)](#section-e-state-machine-transitions)
6. [Section F: Performance Bottlenecks](#section-f-performance-bottlenecks)
7. [Section G: Trust & Credibility Analysis](#section-g-trust--credibility-analysis)
8. [Section H: Foreign Traveler Comfort & Anxiety Reduction](#section-h-foreign-traveler-comfort--anxiety-reduction)
9. [Section I: 'Too Much Website' Component Breakdown](#section-i-too-much-website-component-breakdown)
10. [Section J: Missing Features Inventory (Essential vs Important vs Strategic)](#section-j-missing-features-inventory)
11. [Section K: Code Hotspots & Duplicated Logic](#section-k-code-hotspots--duplicated-logic)
12. [Section L: Regression Risk Map](#section-l-regression-risk-map)
13. [Section M: E2E Test Scenarios Plan (Tiers 1–4)](#section-m-e2e-test-scenarios-plan)
14. [Section N: Master Prioritized Backlog](#section-n-master-prioritized-backlog)
15. [Section O: Do-Not-Touch List (Mission-Critical Invariants)](#section-o-do-not-touch-list)
16. [Section P: Top 20 Actionable Recommendations](#section-p-top-20-actionable-recommendations)

---

## SECTION A: EXECUTIVE VERDICT

### Overall Marketplace Health Score: **78 / 100** (Grade: B+)

WeddingWithIndia possesses an extraordinarily solid engineering foundation, exhibiting world-class database schema modeling (84 Prisma models, 29 enums), robust defensive concurrency locking (`SELECT FOR UPDATE`), cryptographic QR pass issuance (AES-256-GCM), and deep cultural authenticity mapping across 8 canonical religions and 18 Indian regions.

However, the platform suffers from **one critical P0 backdoor (hardcoded E2E test authentication bypass)**, **severe medical safety gaps in dietary allergen transmission**, **synthetic verification badge decoupling**, **static FX currency limitations**, and **information overload (27+ fragmented legal pages and 'Too Much Website' marketing bloat)** that severely undermine international buyer conversion.

### 11-Dimension Forensic Scorecard

```
                        11-DIMENSION AUDIT SCORECARD
┌───────────────────────────────────────────────────┬────────┬───────────────┐
│ Audit Dimension                                   │ Score  │ Grade / Status│
├───────────────────────────────────────────────────┼────────┼───────────────┤
│ 1. Product Vision & Market Fit                    │ 92/100 │ Exemplary     │
│ 2. Architecture & Code Quality                    │ 76/100 │ Good (Debt)   │
│ 3. User Experience & International Friction       │ 71/100 │ Needs Polish  │
│ 4. Trust, Safety & Authenticity                   │ 74/100 │ Moderate Risk │
│ 5. Defensive Security & RBAC                      │ 62/100 │ Critical (P0) │
│ 6. Performance & Core Web Vitals                  │ 78/100 │ Good          │
│ 7. Database Schema & Data Integrity               │ 94/100 │ Exemplary     │
│ 8. Internationalization & FX Currency Handling    │ 58/100 │ Significant   │
│ 9. Cultural Fidelity & Dietary Safety             │ 70/100 │ Medical Risk  │
│ 10. Operational Observability & Resilience        │ 82/100 │ Strong        │
│ 11. Testability & Regression Defensibility        │ 90/100 │ Exemplary     │
└───────────────────────────────────────────────────┴────────┴───────────────┘
```

#### Dimension Summaries:
1. **Product Vision & Market Fit (92/100)**: Unique, high-barrier-to-entry cultural hospitality marketplace solving the "how to attend an Indian wedding safely" problem for high-net-worth international travelers and diaspora tourists.
2. **Architecture & Code Quality (76/100)**: Modern Next.js 16 App Router architecture, Server Actions, and strict Prisma relations, weighed down by 2 monolithic god-actions (`lib/actions/admin.ts` [2,990 lines], `lib/actions/index.ts` [2,087 lines]) and a `/destinations` permanent redirect route collision.
3. **User Experience & International Friction (71/100)**: Clean, high-converting wedding detail page and booking sidebar, but degraded by 27+ fragmented legal pages, unaddressed solo female traveler anxiety, and lack of multi-guest data collection.
4. **Trust, Safety & Authenticity (74/100)**: Exemplary completed-attendance review gating with Bayesian rating adjustments, but compromised by synthetic green "Verified Host" badges on all published listings regardless of actual KYC approval.
5. **Defensive Security & RBAC (62/100)**: Strict RBAC with 23 granular permissions and zero SQL injections, severely compromised by `isE2ETestAuthEnabled() === true` which permits unauthenticated remote admin takeover in any environment.
6. **Performance & Core Web Vitals (78/100)**: AVIF/WebP image optimization and font loaders, offset by 16 routes missing `loading.tsx` Suspense boundaries and heavy client component bundles.
7. **Database Schema & Data Integrity (94/100)**: Comprehensive 84-model schema, full transactional consistency, atomic status machines, and audit logging. Minor index gaps on 4 foreign keys and 10 soft-delete columns.
8. **Internationalization & FX Currency (58/100)**: High friction for non-US travelers. Only USD, EUR, and INR supported with static hardcoded exchange rates (`USD: 95.50`, `EUR: 108.00`). No GBP, AUD, CAD, SGD, or AED.
9. **Cultural Fidelity & Dietary Safety (70/100)**: Deep religion/region ceremony rules and attire guides, but critical medical failure in capturing dietary restrictions as free-text strings that are omitted from host catering exports.
10. **Operational Observability & Resilience (82/100)**: Structured JSON logging, startup diagnostics, and automated cron jobs, marred by a dangerous `process.exit(0)` on `unhandledRejection` in `instrumentation.ts`.
11. **Testability & Regression Defensibility (90/100)**: Extensive Jest integration suites, concurrency regression harnesses, and clear boundary isolation.

---

## SECTION B: CRITICAL FINDINGS (P0 TO P4 TABLE)

| ID | Priority | Dimension | Vulnerability / Issue Description | Exact File Location & Lines | User Impact & Business Risk | Recommended Remediation |
|---|:---:|---|---|---|---|---|
| **SEC-01** | **P0** | **Security** | **Unconditional E2E Test Auth Bypass**: `isE2ETestAuthEnabled()` is hardcoded to `true` with a static fallback HMAC secret. `GET /api/test/auth?role=ADMIN` issues valid session cookies to unauthenticated attackers worldwide. | `lib/test-auth.ts:5–7`<br>`proxy.ts:57–80`<br>`app/api/test/auth/route.ts:7–39`<br>`lib/auth.ts:28–150` | **Catastrophic**: Complete remote administrative takeover of user accounts, escrow funds, database records, and KYC dossiers. | Gate `isE2ETestAuthEnabled()` strictly to `process.env.NODE_ENV === "test" && process.env.PLAYWRIGHT_TEST === "true"`. Throw 404 in production. |
| **UX-01** | **P0** | **Medical Safety** | **Dietary Restriction Disconnect & Free-Text Input**: Food preferences are captured as unstructured text (`app/onboarding/page.tsx:310`). Host CSV export (`route.ts:46`) reads the static profile string and completely omits `TravelDetail.dietaryRequirements`. | `app/onboarding/page.tsx:307–316`<br>`app/dashboard/profile/page.tsx:179`<br>`app/api/reports/host/[weddingId]/route.ts:46` | **Critical Medical Risk**: Severe peanut, tree nut, or celiac allergen alerts submitted in Event Hub never reach host catering teams, risking anaphylaxis. | Replace free-text with structured allergen chips (Strict Veg, Vegan, Jain, Halal, Celiac, Nut Allergies). Fix host CSV export to serialize `TravelDetail.dietaryRequirements`. |
| **OPS-01** | **P1** | **Resilience** | **Server Crash on Unhandled Promise Rejection**: `instrumentation.ts` attaches `process.on("unhandledRejection")` and invokes `cleanup()` which calls `process.exit(0)`. | `instrumentation.ts:54–57` | **High Denial of Service**: Any transient unhandled promise rejection in an asynchronous callback immediately kills the Node.js process, dropping all active user connections. | Remove `process.exit(0)` from `unhandledRejection`. Log structured error via `logger.error()` and maintain server process liveness. |
| **SEC-02** | **P1** | **Security** | **CSV Formula Injection (Spreadsheet DDE)**: `escapeCsv` in host guest register export wraps values in double quotes without neutralizing formula prefix operators (`=`, `+`, `-`, `@`, `\t`, `\r`). | `app/api/reports/host/[weddingId]/route.ts:38–50` | **High**: Malicious traveler injecting `=cmd\|' /C calc'!A0` into their name executes arbitrary macros on host/coordinator computers upon opening CSV. | Prefix formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) with a single quote (`'`) before CSV serialization. |
| **TRU-01** | **P1** | **Trust** | **Synthetic Verification Badge Decoupling**: In `lib/wedding-dto.ts:228`, `isVerified` evaluates to `true` for all `PUBLISHED` weddings, displaying green `ShieldCheck` verified badges on unverified hosts. | `lib/wedding-dto.ts:228`<br>`WeddingCard.tsx:238–242`<br>`app/weddings/[slug]/page.tsx:188–193` | **High**: Misleading trust signal. Foreign buyers discover unvetted hosts carry verified trust badges, destroying platform credibility. | Bind `isVerified` strictly to `rawWedding.hostCouple?.user?.verification?.status === "APPROVED"` and `UserQualityBadge`. |
| **FIN-01** | **P1** | **Conversion** | **Static Multi-Currency Engine & Missing Tier-1 Currencies**: Currency switcher only supports USD, EUR, INR using static hardcoded conversion rates (`USD: 95.50`, `EUR: 108.00`). No GBP, AUD, CAD, SGD, AED. | `lib/currency.ts:5–9`<br>`components/layout/Navbar.tsx:39–41` | **High**: Major conversion friction for UK, Australian, Canadian, and Gulf tourists; exchange rate drift creates financial margin loss. | Integrate live daily ECB/OpenExchangeRates feed; add native `GBP`, `AUD`, `CAD`, `SGD`, and `AED` to currency selector. |
| **UX-02** | **P1** | **Logistics** | **Multi-Guest Attendee Manifest Blindspot**: Booking sidebar allows selecting 2 to 10 guests (`guestsCount: 4`) but captures zero names, ages, genders, or dietary requirements for accompanying guests #2–#4. | `components/wedding/BookingSidebar.tsx:175–198` | **High**: Host family and gate security receive zero attendee information for accompanying travelers, blocking catering and badge printing. | Prompt for dynamic guest cards (`BookingGuest`) during booking or mandatory Event Hub preparation checklist. |
| **UX-03** | **P1** | **Trust** | **Missing Checkout Cancellation & Escrow Drawer**: Tiered cancellation policy (90%/70%/40%/0%) exists in backend (`cancellation-policy.ts`) but is omitted from the wedding booking sidebar. | `components/wedding/BookingSidebar.tsx:112–272`<br>`lib/services/cancellation-policy.ts:111` | **High**: Foreign travelers hesitate to commit $500–$2,000 without visible cancellation terms and escrow protection guarantees. | Add an expandable "Cancellation & Escrow Protection" drawer directly below the "Reserve Invitation" button. |
| **ROU-01** | **P2** | **Routing** | **`/destinations` Permanent Route Shadowing Collision**: `app/destinations/page.tsx` is a fully developed 266-line regional destination hub, but `next.config.ts:124` permanently redirects `/destinations` -> `/weddings`. | `next.config.ts:124`<br>`app/destinations/page.tsx:1–266` | **Medium**: Destination landing hub is completely unreachable (dead code), harming regional SEO clustering and travel planning. | Remove the redirect in `next.config.ts:124` to allow `app/destinations/page.tsx` to serve its rich regional guide directory. |
| **PRF-01** | **P2** | **Performance** | **16 Subtrees Missing `loading.tsx` Suspense Boundaries**: 16 client/server routes lack loading feedback, causing visual freezing during navigation. | `app/destinations/*`<br>`app/learn/*`<br>`app/dashboard/settings`, `wishlist`, `safety`, `earnings` | **Medium**: Poor Core Web Vitals (INP/CLS), degraded perceived speed on mobile networks. | Add standardized skeleton `loading.tsx` boundaries to all destination, learning, and dashboard routes. |
| **ENG-01** | **P2** | **Maintainability**| **Monolithic God-Actions**: `lib/actions/admin.ts` (2,990 lines) and `lib/actions/index.ts` (2,087 lines) combine 50+ disparate domain mutations into single files. | `lib/actions/admin.ts`<br>`lib/actions/index.ts` | **Medium**: High cyclomatic complexity, code merge conflicts, elevated risk of cross-domain regressions. | Split into modular domain files: `lib/actions/admin/`, `lib/actions/booking/`, `lib/actions/user/`. |
| **DB-01** | **P2** | **Database** | **Missing Foreign Key & Soft-Delete Indexes**: 4 foreign keys lack direct indexes; 10 models lack indexes on `deletedAt` soft-delete columns. | `prisma/schema.prisma:180, 185, 340, 480, 1380` | **Medium**: Query performance degradation and table scans as soft-deleted rows and commission records accumulate. | Add `@@index([commissionRuleId])`, `@@index([payoutRequestId])`, and composite `@@index([deletedAt, ...])` across models. |
| **UX-04** | **P2** | **Trust** | **Empty Testimonials Static Fallback**: Homepage `Testimonials.tsx` is fed an empty array (`lib/data.ts:2232`), permanently displaying "Guest stories coming soon" while PostgreSQL `Testimonial` table is ignored. | `app/page.tsx:15`<br>`lib/data.ts:2232`<br>`components/home/Testimonials.tsx:114` | **Medium**: Lost social proof conversion catalyst on the primary landing page. | Query 5-star verified reviews (`prisma.review.findMany({ where: { rating: 5 } })`) for dynamic homepage testimonial display. |
| **UX-05** | **P2** | **UX Bloat** | **27+ Fragmented Policy Pages**: Policies scattered across 27+ separate URLs (`terms`, `privacy`, `acceptable-use`, `booking-terms`, `cancellation-policy`, `photo-video-consent`, etc.). | `app/terms`, `privacy`, `acceptable-use`, `booking-terms`, etc. | **Medium**: User cognitive overload; essential safety information buried under legalistic fragmentation. | Consolidate into 3 unified tabs under `/trust`: *Guest & Host Terms*, *Privacy & Data*, *Safety & Incidents*. |
| **SEC-03** | **P2** | **Security** | **Unbounded Host & Agent Application Creation**: `/api/host-application` and `/api/agent-application` lack rate limits. | `app/api/host-application/route.ts`<br>`app/api/agent-application/route.ts` | **Medium**: Susceptible to automated spam submission and database bloat. | Apply `lib/rate-limit.ts` (3 submissions per 10 minutes per IP/User). |
| **PRF-02** | **P3** | **Performance** | **Static Mock Data Bloat in Production Bundle**: `lib/data.ts` (88KB, 2,332 lines) is compiled into bundles despite being used only as a fallback. | `lib/data.ts:1–2332` | **Low**: Avoidable JavaScript parse/eval overhead on mobile clients. | Migrate mock data to database seed scripts (`prisma/seed.ts`). |
| **ARC-01** | **P3** | **Architecture** | **Triple Health Endpoint Duplication**: `/api/health`, `/api/readiness`, and `/api/ready` perform identical `SELECT 1` queries. | `app/api/health/route.ts`<br>`app/api/readiness/route.ts`<br>`app/api/ready/route.ts` | **Low**: Redundant maintenance overhead. | Standardize on `/api/health` (liveness) and `/api/ready` (readiness); deprecate `/api/readiness`. |
| **UX-06** | **P3** | **Conversion** | **Marquee Animation CPU Overhead**: 28-second continuous marquee strip in `TrustStrip.tsx` causes continuous CSS repaint cycles. | `components/home/TrustStrip.tsx:5–30` | **Low**: Battery drain on mobile devices and visual distraction. | Replace marquee with a clean static 4-column trust badge grid. |
| **SEC-04** | **P3** | **Security** | **Founder Page Unescaped JSON-LD**: `app/founder/tanishq-gupta/page.tsx:122,126` omits `.replace(/</g, "\\u003c")` on schema scripts. | `app/founder/tanishq-gupta/page.tsx:122,126` | **Low**: Inconsistency with global JSON-LD sanitization standard. | Add `<` escaping to JSON-LD stringification. |
| **OPS-02** | **P4** | **Observability**| **Stale Auth Env Variable Reference**: Event Hub references deprecated `process.env.NEXTAUTH_URL` instead of Clerk origin. | `app/dashboard/events/[bookingId]/page.tsx:55` | **Low**: Fallback resolves to hardcoded domain, but introduces developer confusion. | Replace `NEXTAUTH_URL` with `NEXT_PUBLIC_APP_URL`. |

---

## SECTION C: ROUTE-BY-ROUTE & API MATRIX

Total Next.js App Router Special Files: **162 files** across 65+ unique URL routes and 21 API endpoints.

### 1. Public & Marketing Routes

| URL Route Path | Component Type | Dynamic Params | Auth Required | Role Guard | Data Mode | Purpose & Target Persona |
|:---|:---|:---|:---|:---|:---|:---|
| `/` | Page (`app/page.tsx`) | None | Public | None | Server (SSR) + Islands | Marketplace landing: Hero, curated listings, cultural values, FAQ |
| `/about` | Page (`app/about/page.tsx`) | None | Public | None | SSR + Island | Mission statement, cultural immersion philosophy, founder bio |
| `/coordinators` | Page (`app/coordinators/page.tsx`) | None | Public | None | Client (`"use client"`) | Bilingual coordinator value proposition & career overview |
| `/destinations` | Page (`app/destinations/page.tsx`)| None | Public | None | Server (SSR) | Regional hub (Note: shadowed by `next.config.ts` redirect) |
| `/destinations/delhi-ncr` | Page (`app/destinations/delhi-ncr/page.tsx`) | None | Public | None | Static / SSR | Regional guide: Delhi NCR weddings & luxury farmhouse venues |
| `/destinations/goa` | Page (`app/destinations/goa/page.tsx`) | None | Public | None | Static / SSR | Regional guide: Beach weddings, Christian ceremonies & susegad |
| `/destinations/kerala` | Page (`app/destinations/kerala/page.tsx`) | None | Public | None | Static / SSR | Regional guide: Backwater weddings, temple rituals & sadhya |
| `/destinations/mumbai` | Page (`app/destinations/mumbai/page.tsx`) | None | Public | None | Static / SSR | Regional guide: Bollywood glamour, Parsi lagan & luxury hotels |
| `/destinations/punjab` | Page (`app/destinations/punjab/page.tsx`) | None | Public | None | Static / SSR | Regional guide: Sikh Anand Karaj, Bhangra & Punjabi hospitality |
| `/destinations/rajasthan`| Page (`app/destinations/rajasthan/page.tsx`) | None | Public | None | Static / SSR | Regional guide: Royal palace weddings in Udaipur, Jaipur, Jodhpur |
| `/for-agents` | Page (`app/for-agents/page.tsx`) | None | Public | None | Client (`"use client"`) | B2B Travel agent partnership overview & tier commission tiers |
| `/for-couples` | Page (`app/for-couples/page.tsx`) | None | Public | None | Client (`"use client"`) | Host family value proposition & guaranteed INR earning calculator |
| `/for-travelers` | Page (`app/for-travelers/page.tsx`)| None | Public | None | Static / SSR | International guest primer, cultural respect covenant & safety |
| `/founder/tanishq-gupta`| Page (`app/founder/tanishq-gupta/page.tsx`)| None | Public | None | Static / SSR | Founder identity verification, credentials & direct message |
| `/how-it-works` | Page (`app/how-it-works/page.tsx`)| None | Public | None | Client (`"use client"`) | Step-by-step interactive walkthrough for travelers and hosts |
| `/learn` | Page (`app/learn/page.tsx`) | None | Public | None | Static / SSR | Cultural education library directory & knowledge base |
| `/learn/can-foreigners-attend-indian-weddings` | Page (`app/learn/.../page.tsx`) | None | Public | None | Static / SSR | Legal & cultural guide on international wedding attendance |
| `/learn/how-to-attend-an-indian-wedding` | Page (`app/learn/.../page.tsx`) | None | Public | None | Static / SSR | First-time visitor logistical and etiquette playbook |
| `/learn/indian-wedding-etiquette-for-foreigners` | Page (`app/learn/.../page.tsx`) | None | Public | None | Static / SSR | Shoes, dining with right hand, gifting cash envelopes (shagun) |
| `/learn/indian-wedding-experience-cost` | Page (`app/learn/.../page.tsx`) | None | Public | None | Static / SSR | Transparent USD cost tiers ($149–$1199) and value breakdown |
| `/learn/indian-wedding-food-guide` | Page (`app/learn/.../page.tsx`) | None | Public | None | Static / SSR | Dietary primer: Vegetarian, Jain, Halal, hygiene & spices |
| `/learn/indian-wedding-rituals-explained` | Page (`app/learn/.../page.tsx`) | None | Public | None | Static / SSR | Meaning of Sangeet, Haldi, Baraat, Pheras, Vidaai |
| `/learn/indian-wedding-tourism` | Page (`app/learn/.../page.tsx`) | None | Public | None | Static / SSR | Cultural tourism & economic impact analysis |
| `/learn/what-to-wear-to-an-indian-wedding` | Page (`app/learn/.../page.tsx`) | None | Public | None | Static / SSR | Attire guide: Sarees, Lehengas, Kurtas, avoiding black/white |
| `/login` / `/login/[[...rest]]` | Page (`app/login/[[...rest]]/page.tsx`)| Catch-all | Public | None | Client (`"use client"`) | Clerk auth sign-in with preserved redirect return URL |
| `/offline` | Page (`app/offline/page.tsx`) | None | Public | None | Client (`"use client"`) | PWA service worker offline fallback screen |
| `/signup` / `/signup/[[...rest]]`| Page (`app/signup/[[...rest]]/page.tsx`)| Catch-all | Public | None | Client (`"use client"`) | Clerk registration with automatic affiliate referral binding |
| `/weddings` | Page (`app/weddings/page.tsx`) | Query params | Public | None | SSR + Client Filter | Marketplace search, multi-facet filter, sorting & discovery |
| `/weddings/map` | Page (`app/weddings/map/page.tsx`)| None | Public | None | Client (`"use client"`) | Interactive geolocation map view of wedding listings |
| `/weddings/[slug]` | Page (`app/weddings/[slug]/page.tsx`)| `slug` | Public | None | SSR + Client Modal | Wedding detail: itinerary, dress codes, host bio, reviews |
| `/wishlist/shared` | Page (`app/wishlist/shared/page.tsx`)| None | Public | None | Server (SSR) | Public shared wishlist directory |
| `/wishlist/shared/[token]` | Page (`app/wishlist/shared/[token]/page.tsx`)| `token` | Public | None | Server (SSR) | Tokenized public view of an individual traveler's wishlist |

### 2. Authenticated Dashboard Routes

| URL Route Path | Dynamic Params | Auth Required | Role Guard | Data Fetching Mode | Purpose & Persona |
|:---|:---|:---|:---|:---|:---|
| `/account` | None | Yes | All Logged-in | Client + Actions | Account security, session revocation, profile settings |
| `/coordinators/apply` | None | Yes | All Logged-in | Client + Action | Onboarding application for on-ground coordinators |
| `/coordinators/dashboard` | None | Yes | `COORDINATOR`, `ADMIN` | SSR + Actions | Coordinator event roster, check-in operations, alerts |
| `/dashboard` | None | Yes | All Roles | SSR -> Role Router | Master dashboard router dispatching to role-specific views |
| `/dashboard/bookings` | None | Yes | `TRAVELER` | Client + Actions | Traveler booking manager, tickets, past celebrations |
| `/dashboard/celebrations` | None | Yes | `COUPLE` | Server (SSR) | Host wedding celebrations list & guest rosters |
| `/dashboard/check-in` | None | Yes | `COUPLE`, `COORDINATOR`, `ADMIN` | Client + Actions | Live QR scanner & guest pass validation engine |
| `/dashboard/earnings` | None | Yes | `COUPLE`, `AGENT` | SSR + Actions | Payout ledger, escrow release status, bank accounts |
| `/dashboard/events` | None | Yes | `TRAVELER` | Server (SSR) | Upcoming booked wedding itineraries & timelines |
| `/dashboard/events/[bookingId]` | `bookingId` | Yes | `TRAVELER`, `ADMIN` | SSR + Client Hub | Live Guest Hub: encrypted QR pass, emergency contacts |
| `/dashboard/leads` | None | Yes | `COUPLE`, `ADMIN` | Server (SSR) | Prospective guest inquiries & booking lead pipeline |
| `/dashboard/listings` | None | Yes | `COUPLE`, `ADMIN` | SSR + Actions | Host wedding listing manager, draft editor |
| `/dashboard/messages` | None | Yes | All Logged-in | Client + Actions | In-app messaging between travelers, hosts, admins |
| `/dashboard/notifications` | None | Yes | All Logged-in | Client + Actions | User notification center & system alerts |
| `/dashboard/operations` | None | Yes | `COUPLE`, `COORDINATOR`, `ADMIN` | SSR + Client Center| Wedding day operations, coordinator liaison, contacts |
| `/dashboard/profile` | None | Yes | All Logged-in | Client + Actions | Profile editor, dietary & cultural preferences |
| `/dashboard/referrals` | None | Yes | All Logged-in | SSR + Actions | Referral link generator, click stats, earned credits |
| `/dashboard/safety` | None | Yes | All Logged-in | Server (SSR) | User safety center, active cases, appeal status |
| `/dashboard/safety/report` | None | Yes | All Logged-in | Client + Actions | Formal safety incident reporting form |
| `/dashboard/settings` | None | Yes | All Logged-in | Client + Actions | User preferences: currency, language, notifications |
| `/dashboard/verification` | None | Yes | All Logged-in | SSR + Actions | Identity document upload (Passport, Aadhaar, KYC) |
| `/dashboard/wishlist` | None | Yes | `TRAVELER` | Client + Actions | Saved favorite weddings & custom collections |
| `/for-agents/apply` | None | Yes | All Logged-in | Client + API | Travel agent application submission form |
| `/for-agents/dashboard` | None | Yes | `AGENT`, `ADMIN` | Client + API | Agent portal: referral tracking, commissions ledger |
| `/list-wedding` | None | Auth (or Draft) | All Logged-in | Client + Actions | 4-step interactive host wedding listing wizard |
| `/onboarding` | None | Yes | All Logged-in | Client + Actions | Role selection (Traveler vs Host vs Agent) |

### 3. Administrative Control Routes (`/dashboard/admin/*`)

| URL Route Path | Dynamic Params | Auth Level | Role Guard | Purpose & Subsystem |
|:---|:---|:---|:---|:---|
| `/dashboard/admin` | None | Authenticated | `ADMIN` | Admin command center: KPIs, GMV volume, pending tasks |
| `/dashboard/admin/agents` | None | Authenticated | `ADMIN` | Agent application triage, approval, referral codes |
| `/dashboard/admin/analytics` | None | Authenticated | `ADMIN` | Platform conversion funnels, search CTR, engagement |
| `/dashboard/admin/bookings` | None | Authenticated | `ADMIN` | Master booking ledger, manual status, pass manager |
| `/dashboard/admin/cms` | None | Authenticated | `ADMIN` | Site content editor: Hero, stats, policies, terms |
| `/dashboard/admin/coordinators`| None | Authenticated | `ADMIN` | Coordinator assignments, event roster management |
| `/dashboard/admin/discovery` | None | Authenticated | `ADMIN` | Search ranking algorithm & manual trending boosts |
| `/dashboard/admin/events` | None | Authenticated | `ADMIN` | Live wedding events overview, check-in statistics |
| `/dashboard/admin/finance` | None | Authenticated | `ADMIN` | Balance sheet, escrow hold, commissions, tax ledger |
| `/dashboard/admin/founder` | None | Authenticated | `ADMIN` (`SUPER_ADMIN`) | Emergency kill-switches, maintenance mode, seeds |
| `/dashboard/admin/growth` | None | Authenticated | `ADMIN` | Campaign tracking, UTM attribution, referral loops |
| `/dashboard/admin/hosts` | None | Authenticated | `ADMIN` | Host application triage pipeline & KYC queue |
| `/dashboard/admin/hosts/[id]` | `id` | Authenticated | `ADMIN` | Individual host application dossier deep review |
| `/dashboard/admin/messages` | None | Authenticated | `ADMIN` | Global platform messaging oversight & safety monitor |
| `/dashboard/admin/operations` | None | Authenticated | `ADMIN` | Daily operational health, background crons, logs |
| `/dashboard/admin/payments` | None | Authenticated | `ADMIN` | Manual PayPal/UPI payment verification & Stripe audit |
| `/dashboard/admin/reviews` | None | Authenticated | `ADMIN` | Review moderation, fraud signal triage, appeals |
| `/dashboard/admin/safety` | None | Authenticated | `ADMIN` | Trust & Safety incident ledger, dispute management |
| `/dashboard/admin/safety/[caseId]`| `caseId` | Authenticated | `ADMIN` | Incident investigation, evidence viewer, timeline |
| `/dashboard/admin/settings` | None | Authenticated | `ADMIN` | Global system configuration, fees, policies |
| `/dashboard/admin/support` | None | Authenticated | `ADMIN` | Helpdesk ticket center & contact form submissions |
| `/dashboard/admin/users` | None | Authenticated | `ADMIN` | User account management, roles, ban/unban, restricts |
| `/dashboard/admin/verifications`| None | Authenticated | `ADMIN` | KYC verification document review pipeline |
| `/dashboard/admin/weddings` | None | Authenticated | `ADMIN` | Master wedding catalog, tier overrides, suspend/live |
| `/dashboard/admin/weddings/[id]`| `id` | Authenticated | `ADMIN` | Wedding editor, ceremony builder, tier assignment |
| `/dashboard/admin/weddings/sponsorship`| None | Authenticated | `ADMIN` | Sponsorship CRM, payment verification, promo boost |

### 4. API Endpoints Inventory (All 21 Endpoints)

| Endpoint Path | Methods | Dynamic Params | Auth Required | Role Guard | Request Validation | Status Codes | Rate Limit | Cache Header |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/api/account/bookings` | `GET` | None | Yes | `TRAVELER` | None | `200`, `401`, `404`, `500` | None | Default |
| `/api/admin/agents` | `GET`, `PATCH` | None | Yes | `ADMIN` | JSON body (`agentProfileId`, `action`) | `200`, `400`, `401`, `403`, `404`, `500` | None | Default |
| `/api/admin/bookings` | `GET`, `PATCH` | None | Yes | `ADMIN` | JSON body (`bookingId`, `status`) | `200`, `400`, `401`, `403`, `500` | None | Default |
| `/api/admin/hosts` | `GET`, `PATCH` | None | Yes | `ADMIN` | JSON body (`weddingId`, `action`, `reason?`) | `200`, `400`, `401`, `403`, `500` | None | Default |
| `/api/admin/overview` | `GET` | None | Yes | `ADMIN` | None | `200`, `401`, `403`, `500` | None | Default |
| `/api/agent-application`| `POST` | None | Yes | `AGENT` | JSON body (`fullName`, `email`, `city`, `networkType`) | `200`, `400`, `401`, `409`, `500` | None | Default |
| `/api/agents/dashboard` | `GET` | None | Yes | `AGENT` | None | `200`, `401`, `500` | None | Default |
| `/api/contact` | `POST` | None | Public | None | Sanitized string checks, honeypot (`website`), 60s dup | `200`, `400`, `429`, `500` | 5 / 10m | Default |
| `/api/cron/commission-settlement`| `GET` | None | Secret | Bearer Token (`CRON_SECRET`) | None | `200`, `401`, `500`, `503` | None | `force-dynamic` |
| `/api/cron/event-reminders` | `GET` | None | Secret | Bearer Token (`CRON_SECRET`) | None | `200`, `401`, `500`, `503` | None | `force-dynamic` |
| `/api/health` | `GET` | None | Public | None | None | `200`, `503` | None | `no-store` |
| `/api/host-application` | `GET`, `POST` | None | Yes | `TRAVELER` (promoted), `COUPLE` | Cultural authenticity validation (`validateWeddingAuthenticity`) | `200`, `400`, `401`, `403`, `500`, `503` | None | Default |
| `/api/invoice/[bookingId]`| `GET` | `bookingId` | Yes | `ADMIN` or Booking Owner | None | `200` (HTML), `403`, `404`, `500` | None | `text/html` |
| `/api/newsletter` | `POST` | None | Public | None | Zod schema (`newsletterSchema` email validation) | `200`, `400`, `429`, `500` | 10 / 10m | Default |
| `/api/readiness` | `GET` | None | Public | None | None | `200`, `503` | None | `force-dynamic` |
| `/api/ready` | `GET` | None | Public | None | None | `200`, `503` | None | `no-store` |
| `/api/reports/host/[weddingId]`| `GET` | `weddingId` | Yes | `ADMIN` or Wedding Owner | None | `200` (CSV), `403`, `404`, `500` | None | `text/csv` |
| `/api/safety/evidence/[evidenceId]`| `GET` | `evidenceId` | Yes | `ADMIN`, Uploader, Reporter, Subject | None | `307` (Signed URL), `403`, `404`, `500` | None | `force-dynamic` |
| `/api/test/auth` | `GET`, `POST` | None | Test Only | Restricted by `isE2ETestAuthEnabled()` | Query params / JSON body (`role`, `email`, `redirect`) | `200`, `307`, `404` | None | `force-dynamic` |
| `/api/uploadthing` | `GET`, `POST` | None | Router | FileRouter `.middleware()` session | UploadThing protocol | `200`, `400`, `401`, `500` | UT Managed | UT Managed |
| `/api/webhooks/stripe` | `POST` | None | Webhook | Cryptographic HMAC (`stripe.webhooks.constructEvent`) | Stripe Payload & DB Idempotency (`StripeWebhookEvent`) | `200`, `400`, `500` | None | `force-dynamic` |

---

## SECTION D: USER FLOW MATRIX

Comprehensive mapping across all 4 primary user roles:

```
                                  MULTI-ROLE JOURNEY TOPOLOGY
                                  
  ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
  │ Foreign Traveler│       │   Host Family   │       │ Platform Admin  │       │  Travel Agent   │
  └────────┬────────┘       └────────┬────────┘       └────────┬────────┘       └────────┬────────┘
           │                         │                         │                         │
      1. Discovery              1. Wizard Draft           1. KYC Review             1. Partner Terms
           ▼                         ▼                         ▼                         ▼
      2. Detail & FAQ           2. KYC Upload             2. Curation               2. Referral Code
           ▼                         ▼                         ▼                         ▼
      3. Concurrency Lock       3. Guest Review           3. Escrow Audit           3. 14-Day Hold
           ▼                         ▼                         ▼                         ▼
      4. Escrow Checkout        4. Schedule Setup         4. Dispute Triage         4. Payout Request
           ▼                         ▼                         ▼                         ▼
      5. QR Gate Pass           5. INR Payout             5. Safety Actions         5. Bank Wire
```

| Persona | Stage | Route / Entry Point | Server Action / API Handler | Database State Mutation | Invariants & Security Enforced |
|---|---|---|---|---|---|
| **Foreign Traveler** | 1. Discovery | `/` & `/weddings` | `getWeddings()`, `searchWeddingsAction` | Reads `Wedding` where `status=PUBLISHED, suspended=false, deletedAt=null` | Demo listings visible as showcases; suspended/deleted listings filtered out. |
| | 2. Detail | `/weddings/[slug]` | `getWeddingBySlug(slug)` | Reads `Wedding`, `WeddingEvent`, `WeddingTradition`, `Review` | Schema.org Event JSON-LD rendered. Reviews only visible for completed events. |
| | 3. Host Inquiry | `/dashboard/messages` | `sendMessageAction`, `getOrCreateConversation` | Creates `Conversation`, `ConversationParticipant`, `Message` | Rate limit 30 msgs/min. `assertCanMessage` check. Participant authorization check. |
| | 4. Booking Application | `/weddings/[slug]` (Sidebar) | `createBookingAction` (`lib/actions/index.ts:559`) | Inserts `Booking` (status: `PENDING`), `Notification` (Host) | `SELECT FOR UPDATE` lock on `Wedding`. Capacity aggregate check. Prevents booking own wedding or past date. Server calculates pricing. |
| | 5. Payment Checkout | `/dashboard/bookings` | `adminMarkPaymentPaidAction` or Stripe Webhook (`api/webhooks/stripe`) | `Booking` -> `PAID`, `Payment` -> `PAID`, creates `GuestPass`, `TravelerPreparation` | Idempotent transaction. AES-256-GCM encrypted QR token. Duplicate transaction ID check. |
| | 6. Pre-Trip Preparation | `/dashboard/events/[bookingId]` | `saveEmergencyContactAction`, `updateTravelerPreparationAction` | Creates `EmergencyContact`, `TravelDetail`, updates `TravelerPreparation` | `calculateTravelerReadiness` transitions `Booking` -> `READY_FOR_EVENT` once emergency contact + dress code acknowledged. |
| | 7. Event Day Check-in | `/dashboard/check-in` | `checkInGuestAction` (`lib/actions/event-operations.ts:207`) | `GuestPass` -> `USED`, `Booking` -> `CHECKED_IN`, inserts `GuestCheckIn` | Atomic conditional update (`updateMany` on `status=ACTIVE`). Scanner role check (Host/Coordinator/Admin). |
| | 8. Post-Event Review | `/weddings/[slug]` & `/dashboard/reviews` | `submitReviewAction` (`lib/actions/reviews.ts:97`) | Inserts `Review` (`PUBLISHED` or `UNDER_REVIEW`), `ReviewFraudSignal` | Verified booking eligibility check. Anti-fraud heuristics check. Bayesian rating recalculation. |
| **Host / Family** | 1. Application Draft | `/list-wedding` | `saveHostApplicationDraftAction` | Creates/Updates `HostApplication` (`DRAFT`), `CoupleProfile` | Autosaves to `localStorage` + PostgreSQL. Handles unauthenticated resume flow safely. |
| | 2. Application Submit | `/list-wedding` | `submitHostApplicationAction` | `HostApplication` -> `SUBMITTED`, `User.role` -> `COUPLE`, `Verification` -> `PENDING` | Validates date and duration bounds (1–5 days). Notifies platform admins. |
| | 3. KYC Document Fulfillment | `/list-wedding` / `/dashboard` | `uploadHostRequestedDocumentAction` | Inserts `HostDocument`, updates `HostDocumentRequest` -> `FULFILLED` | Checks ownership. If all required docs fulfilled, transitions `HostApplication` -> `UNDER_REVIEW`. |
| | 4. Schedule & Rules | `/dashboard/operations` | `createItineraryItemAction`, `publishWeddingAnnouncementAction` | Inserts `WeddingItineraryItem`, `WeddingAnnouncement` | Verifies host couple ownership. Dispatches push & email notifications to confirmed attendees. |
| | 5. Guest Lead Review | `/dashboard/leads` | `handleGuestApplicationAction` (`lib/actions/index.ts:861`) | `Booking` -> `AWAITING_PAYMENT` (or `REJECTED`) | `SELECT FOR UPDATE` capacity lock. Dispatches approval email with payment link. |
| | 6. Attendance & Payout | `/dashboard/earnings` & `/dashboard/check-in` | `markAttendanceAction` (`lib/actions/event-operations.ts:445`) | `Booking` -> `ATTENDED` (or `NO_SHOW`), logs reputation event | Verifies host ownership. Fixed INR payout tracked via `pricing-engine.ts`. |
| **Admin** | 1. KYC Verification | `/dashboard/admin/hosts/[id]` | `adminVerifyHostApplicationAction` (`lib/actions/admin.ts:2205`) | `HostApplication` -> `APPROVED_FOR_LISTING`, `Wedding` -> `PUBLISHED`, `Verification` -> `APPROVED` | Normalizes tier & duration. Calculates customer price in USD and creates published listing. |
| | 2. Payment Verification | `/dashboard/admin/payments` | `adminMarkPaymentPaidAction` (`lib/actions/payment-manual.ts:183`) | `Payment` -> `PAID`, `Booking` -> `PAID`, creates `GuestPass`, creates `Transaction` ledger | Verifies PayPal transaction ID. Enforces HTTPS domain allowlist. Generates encrypted QR token. |
| | 3. Dispute Resolution | `/dashboard/admin/safety/[caseId]` | `adminTriageCaseAction`, `adminResolveCaseAction` | `SafetyCase` -> `RESOLVED`, updates timeline, logs reputation event | Enforces role `ADMIN`. Can toggle `financialHold` or restrict user capabilities. |
| | 4. Refunds & Reversals | `/dashboard/admin/payments` | `adminRecordManualRefundAction` (`lib/actions/payment-manual.ts:250`) | `Refund` inserted, `Payment` -> `REFUNDED`, `Booking` -> `REFUNDED`, reverses Commission | Validates refund amount against remaining balance. Reverses agent commission ledger atomically. |
| | 5. User Restrictions | `/dashboard/admin/users` | `adminRestrictUserAction`, `adminToggleWeddingSuspensionAction` | Inserts `UserRestriction`, updates `Wedding.suspended` | Blocks capability (`BOOKING_RESTRICTED`, `HOSTING_RESTRICTED`, etc.). Suspends wedding discovery. |
| **Travel Agent** | 1. Partner Onboarding | `/for-agents/apply` | `api/agent-application/route.ts` & `adminReviewAgentApplicationAction` | Inserts `AgentProfile`, generates `referralCode` (`WWI-AGENT-XXXX`) | Validates uniqueness of referral code. Upgrades role to `AGENT`. |
| | 2. Referral Tracking | `/weddings?ref=CODE` | `trackReferralVisitAction` (`lib/actions/referrals.ts:61`) | Inserts `AgentReferral` (`CLICKED`), sets `wwi_ref` cookie | Validates code regex (`^[a-zA-Z0-9\-]+$`). Verifies agent is not restricted. |
| | 3. Commission Ledger | Internal Trigger | `generateBookingCommissionAction` (`lib/actions/referrals.ts:559`) | Inserts `Commission` (`PENDING`), `AgentReferral` -> `CONVERTED` | Self-referral abuse guard. Fixed INR rate based on tier (`₹511`–`₹2,511`). Sets 14-day hold. |
| | 4. Payout Settlement | `/for-agents/dashboard` | `submitPayoutRequestAction` & `adminReviewPayoutRequestAction` | Inserts `PayoutRequest`, `Commission` -> `LOCKED` -> `PAID` | Checks safety financial hold. Locks only necessary commissions. Admin approves disbursement. |

---

## SECTION E: STATE MACHINE TRANSITIONS

### 1. Authentication Lifecycle State Machine

```
[GUEST] ──────(Clerk Signup)──────> [ONBOARDING (role: TRAVELER, status: ONBOARDING)]
                                              │
                                     (completeOnboarding)
                                              │
                                              ▼
                                      [ACTIVE (role: TRAVELER/COUPLE/AGENT/COORDINATOR)]
                                        ▲            │                     │
                        (Revoke / Expire)│            │(Safety Restriction) │(Admin Ban)
                                        │            ▼                     ▼
                                 [RESTRICTED] <───────              [BANNED] (HTTP 403)
                                                                           │
                                                                 (Admin UnbanAction)
                                                                           │
                                                                           ▼
                                                                        [ACTIVE]
```

- **Valid Transitions**:
  - `GUEST` -> `ONBOARDING`
  - `ONBOARDING` -> `ACTIVE`
  - `ACTIVE (TRAVELER)` -> `ACTIVE (COUPLE)` (Self-upgrade on listing creation)
  - `ACTIVE (TRAVELER)` -> `ACTIVE (AGENT)` (Admin approval required)
  - `ACTIVE` -> `RESTRICTED` (Disciplinary hold on booking, hosting, messaging, or payouts)
  - `RESTRICTED` -> `ACTIVE` (Restriction revoked or expired)
  - `ACTIVE / RESTRICTED` -> `BANNED` (Immediate freeze across all authenticated actions)
  - `BANNED` -> `ACTIVE` (Admin explicit unban)
- **Strictly Invalid Transitions (Guarded in Code)**:
  - `GUEST` -> `ACTIVE`: Blocked by Clerk middleware and `requireAuth()`.
  - `ACTIVE (TRAVELER)` -> `ADMIN / SUPER_ADMIN`: Blocked. Role update action explicitly rejects self-privilege escalation (`lib/actions/index.ts:46–66`).
  - `BANNED` -> `ANY ACTION`: Blocked. `requireAuth()` at `lib/auth.ts:420` throws immediate `BANNED` error.
  - `RESTRICTED` -> `ACTION`: Blocked. `assertCanBook()` / `assertCanHost()` in `lib/actions/safety.ts` prevent restricted operations.

---

### 2. Booking Lifecycle State Machine

```
[Initial] ──(createBookingAction)──> [PENDING] ──(Host Rejects)──> [REJECTED]
                                        │
                                 (Host Approves)
                                        │
                                        ▼
                              [AWAITING_PAYMENT] ──(Traveler Cancels)──> [CANCELLED]
                                        │
                         (Stripe Webhook / Admin Mark Paid)
                                        │
                                        ▼
                                      [PAID] / [CONFIRMED]
                                        │
                                (Event T-24/48h)
                                        │
                                        ▼
                                [READY_FOR_EVENT] ──(No Show)──> [NO_SHOW]
                                        │
                             (Venue QR Scan Check-in)
                                        │
                                        ▼
                                  [CHECKED_IN]
                                        │
                                 (Event Ends)
                                        │
                                        ▼
                                   [ATTENDED] ──────> [COMPLETED]
                                                           │
                                              (Reviews & Host Payouts)
```

- **Valid Transitions**:
  - `PENDING` -> `AWAITING_PAYMENT` (Host approval)
  - `PENDING` -> `REJECTED` (Host decline)
  - `PENDING` -> `CANCELLED` (Traveler withdrawal)
  - `AWAITING_PAYMENT` -> `PAID` / `CONFIRMED` (Authoritative payment confirmation)
  - `AWAITING_PAYMENT` -> `CANCELLED` (Payment expired or booking cancelled)
  - `PAID / CONFIRMED` -> `READY_FOR_EVENT` (Preparation checklist satisfied)
  - `READY_FOR_EVENT` -> `CHECKED_IN` (Valid QR ticket scan)
  - `CHECKED_IN` -> `ATTENDED` (Attendance confirmed)
  - `ATTENDED` -> `COMPLETED` (Post-event settlement)
  - `READY_FOR_EVENT` -> `NO_SHOW` (Absence at event)
  - `PAID / CONFIRMED / READY_FOR_EVENT` -> `CANCELLED` -> `REFUNDED` (Policy-backed refund)
- **Strictly Invalid Transitions (Guarded in Code)**:
  - `PENDING` -> `PAID` (Skipping host approval): Blocked. Payment requests require prior host approval.
  - `AWAITING_PAYMENT` -> `CONFIRMED` (Direct status jump bypassing payment): Blocked. `PATCH /api/admin/bookings` explicitly prohibits direct status patches to `PAID`/`CONFIRMED` (requires `adminMarkPaymentPaidAction`).
  - `CANCELLED / REJECTED` -> `AWAITING_PAYMENT / PAID`: Blocked. `createOrUpdatePaymentRequestAtomic` throws error if booking is `CANCELLED`/`REJECTED`.
  - `COMPLETED / ATTENDED` -> `CANCELLED`: Blocked. Cancellation policy engine checks event date and completion status.
  - `Duplicate Active Booking`: Blocked. `createBookingAction` checks `ACTIVE_RESERVATION_STATUSES`.
  - `Over-Capacity Booking`: Blocked. `createBookingAction` checks capacity across `CAPACITY_HOLDING_BOOKING_STATUSES` with `SELECT FOR UPDATE`.

---

### 3. Payment & Escrow State Machine

```
[Initial] ──(adminRequestPaymentAction / Checkout)──> [PENDING]
                                                         │
                                    ┌────────────────────┴────────────────────┐
                          (Stripe Webhook / Admin Mark Paid)           (Payment Failed)
                                    │                                         │
                                    ▼                                         ▼
                                  [PAID]                                   [FAILED]
                          (hostPayoutTransferred: false)
                                    │
                         ┌──────────┴──────────┐
                (Event Concluded)         (Refund Issued)
                         │                     │
                         ▼                     ▼
                 [PAYOUT RELEASED]         [REFUNDED]
           (hostPayoutTransferred: true)
```

- **Valid Transitions**:
  - `PENDING` -> `PAID` (Stripe charge success or Admin verifies PayPal transaction ID)
  - `PENDING` -> `FAILED` (Provider failure)
  - `PAID` -> `REFUNDED` (Manual or Stripe refund execution)
  - Escrow Release: `PENDING` (held in platform escrow) -> `RELEASED` (transferred to host after attendance)
- **Strictly Invalid Transitions (Guarded in Code)**:
  - `PAID` -> `PENDING` (Reverting a completed payment): Blocked. `adminUpdatePaymentRequestAction` explicitly rejects modifying `PAID` payments.
  - `Duplicate Transaction ID Reuse`: Blocked. `markPaymentPaidAtomic` verifies `transactionId` is not already assigned to another payment.
  - `Duplicate Webhook Replays`: Blocked. Database table `StripeWebhookEvent` guarantees idempotency via unique `stripeEventId`.

---

### 4. Wedding Listing Lifecycle State Machine

```
[Initial] ──(Host /list-wedding / createWedding)──> [DRAFT (status: DRAFT, isDemo: false)]
                                                         │
                                        (Admin KYC & Listing Review)
                                                         │
                                                         ▼
                                       [PUBLISHED (status: PUBLISHED)]
                                         │                       ▲
                            (Admin Suspend)│                       │(Admin Resolve)
                                         ▼                       │
                                   [SUSPENDED (suspended: true)] ┘
                                         │
                                   (Event Concludes)
                                         │
                                         ▼
                                    [COMPLETED]
```

- **Valid Transitions**:
  - `DRAFT` -> `PUBLISHED` (Admin approval)
  - `PUBLISHED` -> `DRAFT` (Admin unpublish)
  - `PUBLISHED` -> `SUSPENDED` (Trust & Safety temporary hold)
  - `SUSPENDED` -> `PUBLISHED` (Safety hold cleared)
  - `PUBLISHED` -> `COMPLETED` (Wedding concluded)
- **Strictly Invalid Transitions (Guarded in Code)**:
  - `Host Self-Publishing without Admin Review`: Blocked. `editWedding` action only updates `DRAFT` fields; only admin actions can transition to `PUBLISHED`.
  - `Booking a DRAFT / SUSPENDED / DEMO Wedding`: Blocked. `createBookingAction` enforces `status === "PUBLISHED"`, `!suspended`, and `!isDemo`.

---

### 5. Host Verification Lifecycle State Machine

```
[NOT_SUBMITTED / DRAFT] ──(Host Submits KYC)──> [SUBMITTED / PENDING]
                                                       │
                                            (Admin Begins Review)
                                                       │
                                                       ▼
                                                [UNDER_REVIEW]
                                                       │
                           ┌───────────────────────────┼───────────────────────────┐
                  (Admin Approves)             (Action Required)            (Admin Rejects)
                           │                           │                           │
                           ▼                           ▼                           ▼
                       [APPROVED]             [ACTION_REQUIRED /               [REJECTED]
                (APPROVED_FOR_LISTING)       NEED_MORE_DOCUMENTS]
                           │                           │
                   (Listing Goes Live)          (Host Uploads)
                                                       │
                                                       ▼
                                                [UNDER_REVIEW]
```

- **Valid Transitions**:
  - `NOT_SUBMITTED / DRAFT` -> `SUBMITTED / PENDING` (Host submits application and KYC docs)
  - `SUBMITTED / PENDING` -> `UNDER_REVIEW` (Admin triages application)
  - `UNDER_REVIEW` -> `ACTION_REQUIRED / NEED_MORE_DOCUMENTS` (Admin requests supplemental evidence)
  - `ACTION_REQUIRED` -> `UNDER_REVIEW` (Host uploads requested documents)
  - `UNDER_REVIEW` -> `APPROVED / APPROVED_FOR_LISTING` (Admin approves KYC and publishes listing)
  - `UNDER_REVIEW` -> `REJECTED` (Admin declines with stated reason)
  - `SUBMITTED / ACTION_REQUIRED` -> `WITHDRAWN` (Host cancels application)

---

## SECTION F: PERFORMANCE BOTTLENECKS

```
                             PERFORMANCE HOTSPOT DISTRIBUTION
┌──────────────────────────────────────────────┬──────────────────┬──────────────────────┐
│ Category                                     │ Severity         │ Primary Driver       │
├──────────────────────────────────────────────┼──────────────────┼──────────────────────┤
│ 1. Missing Suspense Boundaries (16 routes)   │ Medium (P2)      │ Missing loading.tsx  │
│ 2. Heavy Client Component Bundles            │ Medium (P2)      │ Missing next/dynamic │
│ 3. Sequential Database Waterfall Queries     │ Medium (P2)      │ Sequential awaits    │
│ 4. Static Mock Data Bundle Overhead          │ Low (P3)         │ lib/data.ts (88KB)   │
│ 5. Continuous CSS Marquee Repaints           │ Low (P3)         │ TrustStrip.tsx (28s) │
└──────────────────────────────────────────────┴──────────────────┴──────────────────────┘
```

### Detailed Breakdown:
1. **16 Route Subtrees Missing `loading.tsx`**:
   - `app/destinations/`, `app/destinations/[region]` (rajasthan, goa, punjab, kerala, delhi-ncr, mumbai)
   - `app/learn/`, `app/learn/[slug]` (7 article guides)
   - `app/about`, `coordinators`, `for-agents`, `for-agents/dashboard`, `for-couples`
   - `app/dashboard/settings`, `wishlist`, `safety`, `referrals`, `operations`, `earnings`, `check-in`
   - *Impact*: Navigating to these pages produces zero visual feedback until server data resolves.
2. **Heavy Client Component Bundles without `next/dynamic`**:
   - `app/dashboard/operations/ClientOperationsCenter.tsx` (22KB)
   - `app/dashboard/admin/weddings/page.tsx` (30KB)
   - `components/wedding/HostEarningsCalculator.tsx` (24KB)
   - `components/home/Hero.tsx` (24KB)
   - *Recommendation*: Use `const ClientOperationsCenter = dynamic(() => import("./ClientOperationsCenter"), { ssr: false })`.
3. **Sequential Database Queries in `app/dashboard/page.tsx`**:
   - The master role dashboard router executes 3 sequential database calls (`findUnique` user, `findFirst` booking, `findFirst` celebration) instead of batching via `Promise.all()`.
4. **Image Pipeline Efficiency**:
   - Next.js `<Image />` is correctly utilized across 38 files with `next.config.ts` formats configured for AVIF/WebP.
   - Hero image in `Hero.tsx:194–206` correctly sets `fill`, `priority`, `quality={85}`, and `sizes="100vw"`.

---

## SECTION G: TRUST & CREDIBILITY ANALYSIS

| Trust Dimension | Current Implementation | Audit Finding & Gap | Impact & Severity | Recommended Remediation |
|---|---|---|---|---|
| **Host Verification Badges** | `lib/wedding-dto.ts:228` synthesizes `isVerified: true` if `status === "PUBLISHED"`. | Green verified shield badge is displayed on listings whose host has no KYC approval in PostgreSQL. | **HIGH (P1)**: Decoupled trust signal. Foreign travelers misled into believing host is verified. | Bind `isVerified` strictly to `rawWedding.hostCouple?.user?.verification?.status === "APPROVED"`. |
| **Quality Badges** | Rich Bayesian badges (`guest-favorite`, `reliable-host`) modeled in `schema.prisma:1380`. | Quality badges are queried for search boost but completely stripped from public DTOs. | **MEDIUM (P2)**: Missed social proof. Complex backend badge infrastructure is invisible. | Render earned `QualityBadge` icons directly on `WeddingCard.tsx` and host story blocks. |
| **Multi-Currency & FX Engine** | `lib/currency.ts:5–9` defines static multipliers: `USD: 95.50`, `EUR: 108.00`. | Only USD, EUR, INR supported. Zero native support for GBP, AUD, CAD, SGD, AED. | **HIGH (P1)**: Conversion barrier for UK, Australian, Canadian, and Gulf tourists. | Integrate live daily ECB/OpenExchangeRates feed; add `GBP`, `AUD`, `CAD`, `SGD`, `AED` to switcher. |
| **Pricing Surcharges** | Sidebar shows clean USD price ($149–$1199), but dashboard displays `"Processing Surcharge: $..."`. | Surcharge line item conflicts with "Clean price, zero customer surcharge" platform claim. | **MEDIUM (P2)**: Price shock at payment stage undermines checkout confidence. | Enforce clean pricing invariant: absorb processing fees or display full transparent breakdown upfront. |
| **Cancellation Policy Surfacing** | Backend implements 90%/70%/40%/0% tiered refund policy (`cancellation-policy.ts:111`). | Booking sidebar displays zero cancellation terms or refund schedules prior to booking submission. | **HIGH (P1)**: Foreigners hesitate to commit without visible cancellation terms. | Embed an expandable "Cancellation & Escrow Terms" drawer beneath the booking button. |
| **Escrow Safety Assurances** | Host payout is held until post-event completion (`hostPayoutTransferred: false`). | Zero escrow badges or buyer protection guarantees rendered on checkout sidebar. | **MEDIUM (P2)**: Foreign travelers fear host scams without explicit escrow guarantees. | Add trust anchor: *"WeddingWithIndia Escrow Protection: Funds held securely until celebration check-in."* |
| **Review Authenticity** | Review submission strictly gated to verified, attended bookings (`review-eligibility.ts:58`). | Robust anti-fraud heuristics and Bayesian score calculation. | **EXEMPLARY**: Best-in-class review integrity architecture. | Retain and maintain. |
| **Homepage Testimonials** | Homepage `Testimonials.tsx` is fed `export const testimonials = []` from `lib/data.ts:2232`. | Fallback banner "Guest stories coming soon" permanently displayed; DB `Testimonial` table ignored. | **LOW (P3)**: Missing primary landing page social proof. | Query 5-star verified reviews from PostgreSQL (`prisma.review.findMany({ where: { rating: 5 } })`). |

---

## SECTION H: FOREIGN TRAVELER COMFORT & ANXIETY REDUCTION

```
                      FOREIGN TRAVELER ANXIETY AUDIT MATRIX
                      
  ┌───────────────────────┬──────────────────────────────────┬────────────────────────┐
  │ Anxiety Dimension     │ Current Implementation           │ Severity & Gap Status  │
  ├───────────────────────┼──────────────────────────────────┼────────────────────────┤
  │ 1. Cultural Anxiety   │ Religion-specific ceremony rules │ ADEQUATE               │
  │    & Dress Codes      │ in culture.ts; Event Hub check.  │ Minor UI polish needed │
  ├───────────────────────┼──────────────────────────────────┼────────────────────────┤
  │ 2. Dietary Safety &   │ Free-text profile input;         │ CRITICAL (P0)          │
  │    Severe Allergies   │ Disconnected from Host CSV.      │ High medical risk      │
  ├───────────────────────┼──────────────────────────────────┼────────────────────────┤
  │ 3. Multi-Guest Data   │ Only guest count (1-10) booked;  │ HIGH (P1)              │
  │    Capture            │ Zero accompanying guest data.    │ Blind catering data    │
  ├───────────────────────┼──────────────────────────────────┼────────────────────────┤
  │ 4. Female Solo Safety │ General platform safety text;    │ HIGH (P1)              │
  │    & Panic Helpline   │ No SOS or dedicated desk.        │ Solo traveler friction │
  ├───────────────────────┼──────────────────────────────────┼────────────────────────┤
  │ 5. Airport & Local    │ Generic checkbox in Event Hub;   │ MEDIUM (P2)            │
  │    Transportation     │ No flight tracking or chauffeur. │ Arrival anxiety        │
  ├───────────────────────┼──────────────────────────────────┼────────────────────────┤
  │ 6. SIM / Connectivity │ Static mentions in blog posts;   │ LOW (P3)               │
  │    Guidance           │ No dashboard eSIM partnership.   │ First-time visitor gap │
  └───────────────────────┴──────────────────────────────────┴────────────────────────┘
```

### Detailed Findings:
1. **Dietary Safety Breakdown (P0 Medical Risk)**:
   - In `app/onboarding/page.tsx:310`, food preferences are captured via a single unstructured string `<input placeholder="Vegetarian, Halal, Gluten Free..." />`.
   - In `app/api/reports/host/[weddingId]/route.ts:46`, the host guest CSV export extracts `b.traveler.foodPreferences` from the user account profile and **completely omits the per-booking `TravelDetail.dietaryRequirements`** submitted in the Event Hub.
   - *Risk*: A guest with severe peanut anaphylaxis or Celiac disease could receive cross-contaminated wedding food because the host catering team only received an outdated account profile string.
   - *Remediation*: Replace free-text with a structured allergen checklist (Chips for: *Strict Vegetarian, Vegan, Jain [No Root Veg], Halal, Celiac / Gluten-Free, Tree Nut Allergy, Peanut Allergy, Lactose Intolerance, Egg-Free, Shellfish, Mild / Non-Spicy*). Fix the host CSV export to serialize `TravelDetail.dietaryRequirements` and all `BookingGuest` dietary profiles.
2. **Multi-Guest Attendee Manifest Blindspot (P1)**:
   - When a traveler reserves for 4 guests, `BookingSidebar.tsx` records `guestsCount: 4` but never collects names, genders, ages, or dietary needs for Guests #2, #3, and #4.
   - *Remediation*: In `BookingSidebar.tsx` or Event Hub, introduce dynamic guest cards for each seat booked.
3. **Female Solo Traveler Safety & Scam Shielding (P1)**:
   - Women traveling alone to India experience elevated safety anxiety regarding transport, hotel transfers, and unescorted venue navigation. `app/safety/page.tsx` contains generic disclaimers but lacks actionable solo female traveler features.
   - *Remediation*: Introduce a dedicated **"Solo Traveler & Female Guest Assurance"** badge on listings offering verified female host liaisons, vetted airport pickup, and a 24/7 dedicated WhatsApp Concierge Helpline.

---

## SECTION I: 'TOO MUCH WEBSITE' COMPONENT BREAKDOWN

Comprehensive classification of UI elements, pages, modals, and copy blocks:

| Component / Section / Route | Current File Location | Classification | Rationale & Forensic Justification |
|---|---|:---:|---|
| **27+ Fragmented Policy Pages** | `app/terms`, `privacy`, `acceptable-use`, `booking-terms`, `cancellation-policy`, `refund-policy`, `payment-terms`, `traveler-agreement`, `host-agreement`, `agent-agreement`, `coordinator-agreement`, `community-guidelines`, `content-policy`, `copyright`, `trademark`, `dpdp`, `gdpr`, `grievance`, `complaints`, `incident-report`, `guest-safety`, `host-safety`, `photo-video-consent`, `insurance`, `travel-visa` | **COMBINE** | Consolidate into 3 unified tabs under `/trust`: 1) *Guest & Host Terms*, 2) *Privacy & DPDP/GDPR*, 3) *Safety & Incident Desk*. Eliminate 20+ redundant sub-routes. |
| **Marquee Trust Strip** | `components/home/TrustStrip.tsx` | **REDUCE** | 28-second continuous CSS marquee animation is visually distracting. Replace with a clean, static 4-column trust badge grid. |
| **Hero 3D Tilt & Particles** | `components/home/Hero.tsx` (lines 42–47, 145–171) | **REDUCE** | Framer motion mouse-tracking 3D card tilt and 4 floating sparkles add JS execution overhead on low-power mobile devices. Simplify to clean static card with native CSS hover. |
| **Duplicate Journey Diagrams** | `components/diagrams/GuestJourneyDiagram.tsx`, `HostJourneyDiagram.tsx`, etc. | **REMOVE** | Dead weight. These diagrams duplicate the flowchart already rendered in `components/home/HowItWorks.tsx`. |
| **Empty Testimonials Carousel** | `components/home/Testimonials.tsx` | **COMBINE** | Remove empty data fallback banner; combine with real verified review quotes pulled dynamically from `prisma.review`. |
| **Cultural Code Section** | `components/home/CulturalCode.tsx` | **KEEP** | High emotional resonance ("Be a guest, not a disruption"). Sets clear behavioral expectations for international travelers. |
| **6-Step Guest Flowchart** | `components/home/HowItWorks.tsx` | **KEEP** | Essential UX conversion driver. Clear visual breakdown from discovery to post-event memories. |
| **Destination City Cards** | `components/home/Countries.tsx` | **KEEP** | Clean geographic discovery anchor for travelers planning multi-city India itineraries. |
| **Wedding Styles Grid** | `components/home/Categories.tsx` | **KEEP** | Visual categorization (Royal, Beach, Punjabi, South Indian, Traditional) drives quick search filtering. |
| **FAQ Accordion** | `components/home/FAQ.tsx`, `FAQAccordion.tsx` | **KEEP** | Directly addresses international guest concerns (alcohol, gifts, clothing, food spice). |
| **Final CTA Banner** | `components/home/CTASection.tsx` | **KEEP** | Clean conversion endpoint leading to discovery and host listing flows. |
| **Representative Media Disclaimer**| `app/weddings/[slug]/page.tsx:238–242` | **MOVE** | Currently displayed as tiny footnote below gallery. Move into a distinct trust pill directly inside the gallery viewer. |
| **Booking Sidebar Pricing Box** | `components/wedding/BookingSidebar.tsx` | **KEEP** | High conversion component with transparent tier pricing, guest count, and celebration side selector. |
| **Booking Sidebar Cancellation Terms**| `components/wedding/BookingSidebar.tsx` | **ADD** | Missing critical trust link. Add inline expandable summary of the 90%/70%/40% refund schedule before booking submission. |
| **Multi-Currency Switcher (GBP/AUD/CAD)**| `components/layout/Navbar.tsx`, `lib/currency.ts` | **ADD** | Essential international feature. Expand beyond USD/EUR to include GBP, AUD, CAD, SGD, and AED. |
| **Structured Dietary Allergen Selector**| `app/onboarding/page.tsx`, `ClientEventHubForm.tsx` | **ADD** | Critical medical safety feature. Replace free-text with structured allergen and dietary restriction chips. |
| **Host CSV Disconnect Fix** | `app/api/reports/host/[weddingId]/route.ts` | **MOVE** | Update export handler to serialize Event Hub `TravelDetail.dietaryRequirements` instead of static profile strings. |
| **Emergency SOS Helpline Trigger** | `app/dashboard/events/[bookingId]/page.tsx` | **ADD** | Add 24/7 dedicated WhatsApp Concierge & Emergency Coordinator button to the confirmed Event Hub header. |

---

## SECTION J: MISSING FEATURES INVENTORY

### 1. Essential Features (P0 – P1): Critical Blockers for Trust & Conversion

| ID | Priority | Feature Name | Problem Solved | Target User | Architectural Touchpoints |
|---|:---:|---|---|---|---|
| **MF-01** | **P0** | **Structured Dietary & Medical Allergen Selector** | Eliminates severe allergy risks by replacing free-text with structured multi-select chips (Strict Veg, Vegan, Jain, Halal, Celiac, Tree Nut, Peanut, Lactose, Spice level). | Foreign Traveler & Host Caterer | `TravelerProfile`, `BookingGuest`, `TravelDetail`, `app/onboarding`, `ClientEventHubForm.tsx`, `app/api/reports/host` |
| **MF-02** | **P0** | **Multi-Guest Attendee Manifest Capture** | Solves catering and gate pass blindspots when 2–10 seats are booked under a single reservation. | Group Travelers & Gate Security | `BookingGuest` schema, `BookingSidebar.tsx`, `ClientEventHubForm.tsx`, `GuestPass` |
| **MF-03** | **P1** | **Live Multi-Currency Expansion (GBP, AUD, CAD, SGD, AED)** | Removes currency friction for UK, Australian, Canadian, and Gulf travelers; eliminates static FX rate drift. | International Diaspora & Tourists | `lib/currency.ts`, `lib/services/pricing-engine.ts`, `Navbar.tsx`, Currency Context |
| **MF-04** | **P1** | **Inline Checkout Cancellation & Escrow Protection Drawer** | Increases checkout conversion by explicitly assuring travelers of 90%/70%/40% refund rules and platform escrow holding. | Foreign Traveler | `BookingSidebar.tsx`, `StickyBookingCard.tsx`, `cancellation-policy.ts` |
| **MF-05** | **P1** | **Database-Audited Verification Badge Binding** | Restores trust integrity by binding the green "Verified Host" badge strictly to approved database verification records. | Marketplace Buyers | `lib/wedding-dto.ts`, `prisma.verification`, `QualityBadge`, `WeddingCard.tsx` |

### 2. Important Features (P2): High-Value UX & Operational Tooling

| ID | Priority | Feature Name | Problem Solved | Target User | Architectural Touchpoints |
|---|:---:|---|---|---|---|
| **MF-06** | **P2** | **Unified Trust & Safety Portal** | Eliminates 27+ fragmented legal pages by consolidating terms, privacy, and incident reporting into a single 3-tab hub. | All Users | `app/trust/page.tsx`, `app/safety/page.tsx`, `Footer.tsx` |
| **MF-07** | **P2** | **Bilingual Local Coordinator Checkout Add-on** | Allows anxious travelers to explicitly book an English-speaking on-ground liaison during checkout. | Solo / Anxious Travelers | `CoordinatorProfile`, `BookingSidebar.tsx`, `pricing-engine.ts` |
| **MF-08** | **P2** | **Dynamic Homepage Review Carousel** | Replaces empty static testimonial array with top 5-star verified reviews from the PostgreSQL database. | Homepage Visitors | `components/home/Testimonials.tsx`, `prisma.review`, `lib/actions/discovery.ts` |
| **MF-09** | **P2** | **Airport Transfer & Chauffeur Logistics Form** | Upgrades the simple `transportRequired` checkbox into a flight number, airport terminal, and pickup schedule tracker. | International Guests & Hosts | `TravelDetail` model, `ClientEventHubForm.tsx`, `app/dashboard/operations` |
| **MF-10** | **P2** | **Host Dietary Reconciliation Dashboard View** | Displays aggregated dietary requirements (e.g. "3 Jain, 2 Nut-Free, 1 Celiac") directly on the host operations dashboard. | Host Family & Caterers | `app/dashboard/operations/page.tsx`, `app/dashboard/celebrations` |

### 3. Strategic Features (P3 – P4): Long-Term Scale & Partner Integrations

| ID | Priority | Feature Name | Problem Solved | Target User | Architectural Touchpoints |
|---|:---:|---|---|---|---|
| **MF-11** | **P3** | **Integrated eSIM & Travel Connectivity Partner** | Solves first-day connectivity anxiety by offering instant Airalo/Holafly eSIM activation in the Event Hub. | Foreign Traveler | Event Hub, Partner APIs, `TravelDetail` |
| **MF-12** | **P3** | **Solo Female Traveler Verified Host Filter** | Allows solo female travelers to filter specifically for host families with verified female liaisons and private room accommodations. | Female Solo Travelers | Discovery Filters, `WeddingCard.tsx`, `searchWeddingsAction` |
| **MF-13** | **P4** | **Traditional Attire Rental & Tailoring Concierge** | Solves dress code anxiety by connecting confirmed guests with local Kurta/Lehenga rental services in the wedding city. | Confirmed Travelers | Event Hub Preparation Tab, Local Vendor Directory |
| **MF-14** | **P4** | **Automated Flight Delay & Rescheduling Alerts** | Automatically alerts hosts and coordinators when an international traveler's flight is delayed. | Logistics Coordinators | FlightAware/AviationStack Webhooks, `WeddingAnnouncement` |

---

## SECTION K: CODE HOTSPOTS & DUPLICATED LOGIC

### 1. Monolithic God-Components & Cyclomatic Complexity Hotspots

| File Path | Line Count | File Size | Primary Concerns & Complexity Drivers |
|:---|:---:|:---:|:---|
| `lib/actions/admin.ts` | 2,990 lines | 105 KB | **Monolithic God-Action**: Implements 35+ disparate admin mutations (finance, users, safety, weddings, hosts, verifications, sponsorships, discovery). High maintenance liability and risk of cross-domain regressions. |
| `lib/actions/index.ts` | 2,087 lines | 75 KB | **Overloaded Core Actions**: Combines traveler booking, profile management, onboarding, notifications, verification, and sponsorship into a single monolithic file. |
| `lib/data.ts` | 2,332 lines | 88 KB | **Static Data Bloat**: Massive mock data file containing 2,300+ lines of static listings, testimonials, and FAQs. Only used as fallback in `app/page.tsx`, yet adds significant bundle overhead. |
| `lib/services/sponsorship.ts` | 1,400+ lines | 60 KB | **Complex Lifecycle Service**: Contains 10-step progress checklists, payment CRM, configuration, and promotion engine. |
| `lib/actions/host-application.ts`| 957 lines | 33 KB | **Multi-Entity Synchronization Engine**: Simultaneously coordinates `HostApplication`, `HostApplicationDay`, `HostApplicationEvent`, `CoupleProfile`, `Wedding`, `Verification`, and `AuditLog`. |
| `app/weddings/[slug]/page.tsx` | 800+ lines | ~35 KB | **Heavy Presentation & State Container**: Renders wedding details, multi-day itinerary, host profile, cultural guidelines, FAQ, reviews, pricing sidebar, and booking modal in a single file. |
| `app/list-wedding/page.tsx` | 750+ lines | ~32 KB | **Multi-Step Client Wizard**: Manages complex 4-step client state, cultural defaults, image uploads, and post-auth resume logic. |

### 2. Duplicated Logic & Formatting Redundancies

1. **Triple Health/Readiness Endpoint Duplication**:
   - `app/api/health/route.ts`, `app/api/readiness/route.ts`, `app/api/ready/route.ts` all execute `SELECT 1` on PostgreSQL and return similar JSON payloads.
2. **Duplicated Referral Code Generation**:
   - `app/api/agent-application/route.ts:20` (`crypto.randomBytes`), `lib/actions/referrals.ts:35`, `lib/actions/admin.ts:1820`.
3. **Duplicated Price and Currency Formatters**:
   - `lib/currency.ts`, `lib/utils.ts` (`formatPrice`), `lib/services/pricing-engine.ts`, `app/api/invoice/[bookingId]/route.ts:13`.
4. **Duplicated Cultural Defaults**:
   - `lib/culture.ts` (`resolveCulturalProfileDefaults`), `lib/data.ts` (inline religion defaults), `app/api/host-application/route.ts` (inline defaults).

### 3. Route Collision & Dead Code

- **The `/destinations` Route Shadowing Collision**:
  - `app/destinations/page.tsx` is a fully developed 266-line regional destination hub with structured metadata, imagery, and links to regional subpages (`/destinations/rajasthan`, `/destinations/goa`, etc.).
  - However, `next.config.ts:124` defines `{ source: "/destinations", destination: "/weddings", permanent: true }`.
  - *Impact*: Any request to `/destinations` is permanently redirected (HTTP 308) to `/weddings`, making `app/destinations/page.tsx` **completely unreachable (dead code)**.

---

## SECTION L: REGRESSION RISK MAP

```
                          ┌─────────────────────────────────────────┐
                          │         lib/prisma.ts                   │
                          │   (Connection Pool, withDbRetry)        │
                          └────────────────────┬────────────────────┘
                                               │
             ┌─────────────────────────────────┼─────────────────────────────────┐
             ▼                                 ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│     lib/auth.ts         │       │  pricing-engine.ts      │       │   payments.ts &         │
│ (syncAndGetDbUser, RBAC)│       │ (Central Single Truth)  │       │   guest-pass-crypto.ts  │
└────────────┬────────────┘       └────────────┬────────────┘       └────────────┬────────────┘
             │                                 │                                 │
             ▼                                 ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│  context/AuthContext    │       │ createBookingAction     │       │ checkInGuestAction      │
│ (Client Multi-Device)   │       │ & HostEarningsCalc      │       │ & Stripe Webhook        │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
```

| Module / Component | Impacted User Flows | Failure Mode if Regressed | Mitigation & Guardrail |
|---|---|---|---|
| **`lib/services/pricing-engine.ts`** | Booking creation, Host verification, Host calculator, Agent commission, Invoicing. | Discrepancy between UI price, host payout, agent payout, and database ledger. | Keep as pure function single source of truth. Never calculate prices in client components. |
| **`lib/auth.ts` (`syncAndGetDbUser`, `requireAuth`)** | Every authenticated route, layout, and server action. | Null user leaks, synthetic permission escalation, authentication deadlocks. | Fail-closed error handling. Comprehensive test suite in `__tests__/lib/auth-*.test.ts`. |
| **`context/AuthContext.tsx`** | Navbar, BottomNav, Dashboard shells, Profile completion, Device limit modals. | Infinite re-renders, state synchronization failure, stale booking cache. | Memoized `refreshData` callback. Device session heartbeat throttled to visibility changes. |
| **`lib/actions/index.ts` (`createBookingAction`)** | Traveler booking reservation funnel. | Overselling capacity, race condition double-booking, client price injection. | Must retain `SELECT FOR UPDATE` PostgreSQL lock and server-side pricing derivation. |
| **`lib/services/payments.ts` (`markPaymentPaidAtomic`)** | Manual PayPal confirmation, Stripe Webhook execution, Guest Pass generation. | Duplicate ticket creation, double commission crediting, unconfirmed bookings. | Retain database-level uniqueness, idempotency guards, and transactional atomicity. |
| **`lib/security/guest-pass-crypto.ts`** | Digital QR passes, Event Hub check-in, Gate scanning. | QR scanner failure, expired token bypass, unauthorized check-in forgery. | Maintain AES-256-GCM authenticated encryption and SHA-256 token hashing. |
| **`components/wedding/BookingSidebar.tsx`** | Wedding detail conversion, side selection, guest slot selection. | Client runtime crash, desynchronized subtotal calculation, lost guest preferences. | Keep URL query synchronization and `sessionStorage` intent preservation. |
| **`lib/actions/host-application.ts`** | Host listing creation, autosave, Clerk post-login auto-resume. | Host lead loss, half-filled listing abandonment, role desynchronization. | Retain dual `localStorage` + PostgreSQL autosave and retry backoff probe. |

---

## SECTION M: E2E TEST SCENARIOS PLAN (TIERS 1–4)

### Tier 1: Feature Coverage (Core Lifecycle Traversal)
- **T1-01 (Traveler Booking & Pass Issuance)**: Select 2 guests -> submit booking -> host approves -> payment completes -> verify `PAID` status, AES-256-GCM `GuestPass` QR token, and HTML invoice at `/api/invoice/[id]`.
- **T1-02 (Host Listing Creation & KYC)**: Host completes 4-step listing wizard -> draft saved -> submit application -> Admin reviews at `/dashboard/admin/hosts` -> approves KYC -> listing transitions to `PUBLISHED`.
- **T1-03 (Agent Referral & Commission Hold)**: Traveler visits via `/?ref=AGENT-MUMBAI` -> cookie `wwi_ref` set -> traveler registers and pays -> verify `Commission` created in `PENDING` with 14-day maturity hold.
- **T1-04 (Coordinator QR Check-in)**: Coordinator opens `/dashboard/check-in` -> scans guest QR token -> token decrypted and verified -> `GuestPass` marked `USED`, `Booking` marked `CHECKED_IN`, duplicate scan rejected.
- **T1-05 (Admin Safety & Dispute Oversight)**: Admin triages safety incident -> applies financial hold on host payout -> resolves dispute -> verifies audit logging in `prisma.auditLog`.

### Tier 2: Boundary & Corner Cases
- **T2-01 (Capacity Concurrency Race)**: Wedding capacity = 10; two users simultaneously book 6 and 5 guests -> PostgreSQL `SELECT FOR UPDATE` serializes requests -> first succeeds, second rejected with `INSUFFICIENT_CAPACITY`.
- **T2-02 (Client Price Tampering)**: Attacker injects `pricePerGuest: 1` in booking payload -> server calculates authoritative price via `calculateBookingPricing()` and ignores client input.
- **T2-03 (Tiered Refund Window Boundaries)**: Cancellation at 31 days (90% refund), 15 days (70% refund), 8 days (40% refund), and 48 hours (0% refund).
- **T2-04 (Expired / Revoked Pass Scan)**: Pass scanned 49 hours after celebration date or post-refund -> rejected with `PASS_EXPIRED` or `PASS_REVOKED`.
- **T2-05 (Simultaneous Signup Race)**: Concurrent signups with identical email -> `syncAndGetDbUser()` catches Prisma `P2002` duplicate error and safely reconciles record.

### Tier 3: Pairwise Combinations Matrix
| Combo ID | Role | Wedding Tier | Payment Method | Viewport | Currency |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **T3-01** | Traveler | STANDARD (1-day) | Stripe Card | Mobile (390px, iOS) | USD ($149) |
| **T3-02** | Traveler | GRAND (3-day) | Manual PayPal | Desktop (1920px, Chrome) | USD ($449) |
| **T3-03** | Traveler | SIGNATURE_ROYAL (5-day) | Stripe Card | Tablet (768px, iPadOS) | USD ($1199) |
| **T3-04** | Host Couple | ROYAL (4-day) | Bank Payout | Mobile (412px, Android) | INR (₹51,101) |
| **T3-05** | Travel Agent | ENHANCED (2-day) | Commission Payout | Desktop (1440px, Firefox) | INR (₹1,011) |
| **T3-06** | Coordinator | GRAND (3-day) | QR Camera Scan | Mobile (390px, PWA) | N/A |
| **T3-07** | Admin | SIGNATURE_ROYAL | Manual Override | Desktop (1920px, Edge) | USD & INR |

### Tier 4: Real-World Foreign Traveler Journeys
- **T4-01 (US First-Time Couple Immersion)**: Couple from NYC booking 3-Day Grand Rajasthani Wedding in Udaipur. Explores dress code guide -> books 2 passes ($449) -> inputs dietary restriction: "Severe Peanut Allergy & Vegetarian" -> completes Event Hub checklist -> accesses offline pass via PWA.
- **T4-02 (UK Traveler Flight Delay Rescheduling)**: Traveler from London with flight delay -> updates arrival in Event Hub -> initiates coordinator chat in `/dashboard/messages` -> switches attendance side to `GROOM_SIDE` -> updates persist atomically in `TravelDetail`.
- **T4-03 (Host Date Change Dispute & Escrow Hold)**: Host emergency forces date change 10 days before event -> traveler opens Safety Case -> financial hold applied to host payout -> admin mediates and executes full refund outside DB transaction.

---

## SECTION N: MASTER PRIORITIZED BACKLOG

```
                           MASTER BACKLOG SPRINTS
┌─────────────────────────────────────────────────────────────┬───────────┬──────────────┐
│ Work Package                                                │ Effort    │ Target Sprint│
├─────────────────────────────────────────────────────────────┼───────────┼──────────────┤
│ WP-01: Critical Security & Crash Remediation (P0)           │ 1.5 Days  │ Sprint 1     │
│ WP-02: Medical Safety & Dietary Allergen Pipeline (P0)      │ 2.0 Days  │ Sprint 1     │
│ WP-03: Multi-Currency Live FX & Checkout Polish (P1)        │ 2.5 Days  │ Sprint 2     │
│ WP-04: Trust Badge Integrity & Multi-Guest Manifest (P1)    │ 2.0 Days  │ Sprint 2     │
│ WP-05: 'Too Much Website' Consolidation & Cleanup (P2)      │ 3.0 Days  │ Sprint 3     │
│ WP-06: God-Action Decomposition & Performance (P2)          │ 3.5 Days  │ Sprint 3     │
│ WP-07: Strategic Partner Features & eSIM (P3–P4)            │ 5.0 Days  │ Sprint 4     │
└─────────────────────────────────────────────────────────────┴───────────┴──────────────┘
```

| ID | Priority | Work Package Name | Core Tasks & Deliverables | Est. Effort | Dependencies |
|---|:---:|---|---|:---:|---|
| **WP-01** | **P0** | **Critical Security & Crash Fixes** | 1. Gate `isE2ETestAuthEnabled()` to test environment only.<br>2. Remove `process.exit(0)` on `unhandledRejection` in `instrumentation.ts`.<br>3. Neutralize CSV formula prefixes in host report export. | 1.5 Days | None |
| **WP-02** | **P0** | **Dietary Safety & Allergen Pipeline** | 1. Implement structured allergen chips in `app/onboarding` and `ClientEventHubForm`.<br>2. Fix `app/api/reports/host/[weddingId]` to export `TravelDetail.dietaryRequirements`.<br>3. Add host dashboard dietary summary widget. | 2.0 Days | None |
| **WP-03** | **P1** | **Live Multi-Currency & Checkout Polish** | 1. Integrate live ECB/OpenExchangeRates feed in `lib/currency.ts`.<br>2. Add GBP, AUD, CAD, SGD, AED to currency dropdown.<br>3. Embed inline cancellation & escrow drawer in `BookingSidebar.tsx`. | 2.5 Days | None |
| **WP-04** | **P1** | **Trust Badge Integrity & Multi-Guest Manifest** | 1. Bind `isVerified` strictly to approved database verification records.<br>2. Implement dynamic `BookingGuest` cards for multi-seat bookings.<br>3. Render dynamic 5-star verified reviews on homepage `Testimonials.tsx`. | 2.0 Days | None |
| **WP-05** | **P2** | **'Too Much Website' Consolidation** | 1. Consolidate 27+ legal pages into 3-tab `/trust` portal.<br>2. Remove redundant journey diagram components.<br>3. Replace marquee strip in `TrustStrip.tsx` with static 4-column trust grid.<br>4. Remove `/destinations` redirect from `next.config.ts:124`. | 3.0 Days | None |
| **WP-06** | **P2** | **God-Action Refactoring & Suspense** | 1. Split `lib/actions/admin.ts` (2,990 lines) and `index.ts` (2,087 lines) into modular domain files.<br>2. Add `loading.tsx` Suspense boundaries to 16 missing route subtrees.<br>3. Add missing DB indexes on foreign keys and `deletedAt`. | 3.5 Days | WP-01 |
| **WP-07** | **P3–P4**| **Strategic Growth & Partner Tooling** | 1. Add bilingual coordinator checkout add-on.<br>2. Integrate eSIM travel connectivity partnership.<br>3. Add solo female traveler verified host filter. | 5.0 Days | WP-04, WP-05 |

---

## SECTION O: DO-NOT-TOUCH LIST (MISSION-CRITICAL INVARIANTS)

These 8 mission-critical modules, cryptographic algorithms, and database concurrency mechanisms must not be casually altered during refactoring:

1. **`lib/auth.ts` -> `syncAndGetDbUser()`**:
   - *Critical Invariant*: Unlinks stale `clerkUserId` before re-linking by email; wraps user creation in Prisma `P2002` duplicate catch to handle simultaneous signup races; protects founder user record from role downgrade.
   - *Hazard if altered*: Duplicate user record crashes, unauthenticated user deadlocks, or accidental founder privilege drops.
2. **`lib/prisma.ts` -> `withDbRetry()`**:
   - *Critical Invariant*: Single Prisma client instance with exponential backoff retry for transient PgBouncer `Connection terminated` / timeout errors.
   - *Hazard if altered*: 500 errors on cold starts, Supabase pool exhaustion, or transient network blips.
3. **`lib/services/pricing-engine.ts` -> `calculateBookingPricing()`**:
   - *Critical Invariant*: Single source of truth for USD customer prices ($149–$1199), fixed INR host payouts (₹5,101–₹61,101), and agent commissions (₹511–₹2,511). Pure server-side computation.
   - *Hazard if altered*: Price manipulation by client tampering, broken platform unit economics, margin loss.
4. **`lib/security/guest-pass-crypto.ts` -> `encryptPass()`, `decryptPass()`**:
   - *Critical Invariant*: Encrypts pass tokens with AES-256-GCM and 12-byte random IV, generating `iv:authTag:ciphertext` and indexed SHA-256 token hashes.
   - *Hazard if altered*: Invalidation of all existing active passes in the production database; event gate entry failure.
5. **`app/api/webhooks/stripe/route.ts` -> `POST()`**:
   - *Critical Invariant*: Cryptographic HMAC signature verification (`stripe.webhooks.constructEvent`) + persistent `prisma.stripeWebhookEvent` uniqueness check. Network email dispatches are strictly outside `$transaction`.
   - *Hazard if altered*: Database connection pool starvation during payment bursts; double ticket issuance on duplicate webhooks.
6. **`lib/actions/index.ts` -> `createBookingAction()` & `handleGuestApplicationAction()`**:
   - *Critical Invariant*: Pessimistic concurrency locking (`SELECT id FROM "Wedding" WHERE id = $1 FOR UPDATE`) locks the wedding row before validating capacity.
   - *Hazard if altered*: Race condition double-booking oversubscribing venue capacity beyond host limits.
7. **`lib/services/refunds.ts` -> `processApprovedRefund()`**:
   - *Critical Invariant*: Atomically transitions `Booking` and `Payment` states in PostgreSQL before executing asynchronous payment provider refunds.
   - *Hazard if altered*: Database deadlocks if payment provider APIs experience network latency.
8. **`lib/culture.ts` -> `validateWeddingAuthenticity()`**:
   - *Critical Invariant*: Enforces ceremony mapping, religious tradition profiles (Hindu, Sikh, Muslim, South Indian, Christian), and prohibited ceremony terms.
   - *Hazard if altered*: Cultural cross-contradictions and fake listings polluting marketplace inventory.

---

## SECTION P: TOP 20 ACTIONABLE RECOMMENDATIONS

| # | Dimension | Problem & Evidence | Recommended Change | Expected Benefit | Risk / Tradeoff | Dependencies |
|---|---|---|---|---|---|---|
| **1** | **Security** | `lib/test-auth.ts:5–7` hardcodes `isE2ETestAuthEnabled() === true`, allowing remote admin takeover. | Restrict `isE2ETestAuthEnabled()` to `process.env.NODE_ENV === "test" && process.env.PLAYWRIGHT_TEST === "true"`. | Eliminates critical P0 backdoor before production release. | Low; E2E tests must pass env flag. | None |
| **2** | **Resilience** | `instrumentation.ts:54–57` terminates server (`process.exit(0)`) on unhandled promise rejections. | Remove `process.exit(0)`; log structured error via `logger.error()`. | Prevents full server denial of service crashes. | Very Low | None |
| **3** | **Medical Safety** | Unstructured free-text food preferences (`onboarding/page.tsx:310`) omitted from host CSV export (`route.ts:46`). | Introduce structured allergen chips (Strict Veg, Vegan, Jain, Celiac, Nut Allergies) and serialize `TravelDetail.dietaryRequirements` into host CSV. | Eliminates severe allergy risks and catering miscommunication. | Low; UI field update. | `TravelDetail` schema |
| **4** | **Security** | Host guest CSV export (`route.ts:38–50`) wraps values in quotes without neutralizing formula prefixes (`=`, `+`, `-`, `@`). | Prefix formula characters with a single quote (`'`) in `escapeCsv`. | Prevents spreadsheet macro execution on host computers. | Very Low | None |
| **5** | **Trust** | `lib/wedding-dto.ts:228` displays green verified host shield for all published listings regardless of KYC record. | Bind `isVerified` strictly to `rawWedding.hostCouple?.user?.verification?.status === "APPROVED"`. | Restores authenticity and trust in verified host badges. | Low | `Verification` model |
| **6** | **Conversion** | `lib/currency.ts:5–9` supports only USD, EUR, INR with static conversion rates (95.50 / 108.00). | Integrate live ECB/OpenExchangeRates feed; add `GBP`, `AUD`, `CAD`, `SGD`, `AED` to currency selector. | Removes currency friction for UK, Australian, Canadian, and Gulf tourists. | Low; cached FX rates. | Currency Context |
| **7** | **Logistics** | Multi-seat bookings (`guestsCount: 4`) capture zero individual names or diets for accompanying guests in `BookingSidebar.tsx`. | Introduce dynamic `BookingGuest` cards to collect names and dietary alerts for all accompanying seats. | Eliminates catering and gate pass blindspots for group travelers. | Low | `BookingGuest` model |
| **8** | **Conversion** | Booking sidebar displays zero cancellation terms or escrow guarantees prior to booking submission. | Embed an expandable "Cancellation & Escrow Protection" drawer directly below the booking CTA button. | Increases booking conversion by reducing financial commitment anxiety. | Very Low | `cancellation-policy.ts`|
| **9** | **Routing** | `next.config.ts:124` permanently redirects `/destinations` -> `/weddings`, shadowing `app/destinations/page.tsx`. | Remove the permanent redirect in `next.config.ts:124`. | Activates the rich 266-line regional destination directory and boosts SEO. | Very Low | None |
| **10**| **UX Bloat** | 27+ fragmented legal routes clutter navigation and overwhelm users with legalese. | Consolidate into a 3-tab unified `/trust` hub (*Terms*, *Privacy & Data*, *Safety & Incidents*). | Reduces cognitive overload and streamlines compliance. | Low; 301 redirects needed. | `app/trust/page.tsx` |
| **11**| **Social Proof** | Homepage `Testimonials.tsx` displays "Guest stories coming soon" while PostgreSQL `Testimonial` table is ignored. | Query 5-star verified reviews from PostgreSQL (`prisma.review.findMany({ where: { rating: 5 } })`). | Delivers authentic social proof on primary landing page. | Very Low | `prisma.review` |
| **12**| **Performance**| 16 subtrees lack `loading.tsx` Suspense boundaries, freezing UI during navigation. | Add standardized skeleton `loading.tsx` files across all destination, learning, and dashboard routes. | Improves perceived speed and Core Web Vitals (INP/CLS). | Very Low | None |
| **13**| **Maintainability**| Monolithic god-actions (`lib/actions/admin.ts` [2,990 lines], `index.ts` [2,087 lines]) create merge and regression hazards. | Decompose into domain modules: `lib/actions/admin/`, `lib/actions/booking/`, `lib/actions/user/`. | Improves testability, maintainability, and code readability. | Low; re-exporting barrel. | None |
| **14**| **Database** | 4 foreign keys lack direct indexes; 10 models lack indexes on `deletedAt` soft-delete columns. | Add Prisma schema indexes: `@@index([commissionRuleId])`, `@@index([payoutRequestId])`, `@@index([deletedAt, ...])`. | Prevents query degradation and table scans as historical rows grow. | Low; non-blocking migration. | `prisma/schema.prisma` |
| **15**| **Security** | `/api/host-application` and `/api/agent-application` lack rate limits. | Apply `lib/rate-limit.ts` (3 submissions per 10 minutes per IP/User). | Protects against automated spam listings and database bloat. | Very Low | `lib/rate-limit.ts` |
| **16**| **Solo Safety** | High safety friction for female solo travelers visiting India without verified escort assurances. | Add "Solo Female Traveler Assurance" badge to listings offering verified female liaisons and vetted airport pickup. | Unlocks high-converting female solo traveler market segment. | Low | `CoupleProfile` |
| **17**| **Performance**| `lib/data.ts` (88KB, 2,332 lines) static mock data bloats production bundles. | Move static mock listings and testimonials into `prisma/seed.ts` database seed scripts. | Reduces JavaScript bundle parse/eval time on mobile devices. | Very Low | `prisma/seed.ts` |
| **18**| **Performance**| 28-second continuous marquee strip in `TrustStrip.tsx` triggers continuous repaint cycles. | Replace marquee animation with a clean static 4-column trust badge grid. | Improves mobile rendering performance and reduces visual noise. | Very Low | None |
| **19**| **Architecture**| Redundant health routes (`/api/health`, `/api/readiness`, `/api/ready`) duplicate `SELECT 1` checks. | Standardize on `/api/health` (liveness) and `/api/ready` (readiness); remove `/api/readiness`. | Simplifies API surface and operational monitoring contracts. | Very Low | None |
| **20**| **Operations** | Event Hub references deprecated `process.env.NEXTAUTH_URL`. | Replace with `process.env.NEXT_PUBLIC_APP_URL` across all dashboard routes. | Ensures consistent domain resolution across email templates and QR passes. | Very Low | `lib/env.ts` |

---

## CONCLUSION & HANDOFF VERDICT

The WeddingWithIndia marketplace is technically mature, culturally authentic, and architecturally resilient against race conditions, price manipulation, and unverified reviews.

By executing **Sprint 1 (P0 Security Backdoor Remediation & Dietary Allergen Pipeline)** and **Sprint 2 (Live Multi-Currency Expansion & Verification Badge Binding)**, the platform will achieve full production readiness, international traveler trust, and enterprise-grade operational security.

---
*Report synthesized and verified by Project Orchestrator (`.agents/orchestrator_1/`)*
