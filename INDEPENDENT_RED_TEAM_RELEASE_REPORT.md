# WEDDINGWITHINDIA — INDEPENDENT RED-TEAM RELEASE REPORT

**Assessment Verdict:** **NO-GO**  
**Previous Claim:** GO / PRODUCTION READY (`POST_FORENSIC_REMEDIATION_REPORT.md`)  
**Auditor:** Independent Red-Team Release Challenger  
**Target Environment:** `https://weddingwithindia.com` (Production Vercel / Supabase PostgreSQL)  
**Audit Date:** September 22, 2026  

---

## 1. Previous GO Claim

The previous remediation report (`POST_FORENSIC_REMEDIATION_REPORT.md`) asserted that all 1 P0, 4 P1, 5 P2, 1 P3, and 1 P4 findings had been resolved, reporting:
- 891 automated tests passing (0 failures, 10 skipped)
- 0 TypeScript errors (`tsc --noEmit`)
- 0 ESLint errors
- 88/88 smoke tests passing
- 123/123 SEO checks passing
- 26/26 trust claims verified with 0 unsupported claims
- 42 contaminated records pruned from production database
- Final recommendation: **GO / PRODUCTION READY**

The Independent Red-Team was tasked with attempting to **DISPROVE** this conclusion under an adversarial, zero-assumption mandate.

---

## 2. Independent Verification Overview

Independent examination proved that while several critical engineering fixes were successfully applied (such as commercial showcase CTA decoupling, admin HTTP status codes, and topological database foreign-key deletion logic), the remediation contains:
1. **Critical Remaining Unsupported Trust Claims** in core booking UI (`BookingSidebar.tsx`), which escaped detection due to a weakened verification regex.
2. **Payment Architecture Inconsistencies & Business Logic Contradictions** between advertised frontend Stripe promises, backend manual PayPal implementations, and inactive webhook configurations.
3. **Incomplete Database Cleanup**, leaving **53 synthetic test user accounts** in the production database that escaped cleanup due to an overly narrow query filter.
4. **Artificial Production Data Mutation**, where 21 showcase listing dates were overwritten with synthetic 3-day staggered future dates directly in the live production database.
5. **Undeployed Local Remediation & Configuration Drift**, where local SEO fixes exist in git working tree but remain missing from live production (`https://weddingwithindia.com/sitemap.xml`), producing a false-positive production verification.
6. **Inadequate Regression Test Assertions**, where the host pricing test asserts a helper function directly without invoking the API route or verifying database persistence.

---

## 3. Findings Reproduced

| Original ID | Finding | Verification Result | Severity |
|---|---|---|---|
| **COMM-01** | Commercial Lockout UI | **Reproduced**: Decoupling `isShowcase` from `isSoldOut` was necessary and code correctly renders "Curated Showcase" and "Enquire for Custom Dates". | Fixed in Code |
| **FIN-01** | Host Application Pricing Anomaly | **Reproduced**: `app/api/host-application/route.ts` hardcoded `pricePerGuest: 16000`. Updated to `$249` USD single source of truth. | Fixed in Code |
| **SEC-01** | Admin API HTTP Status Codes | **Reproduced**: `/api/admin/{bookings,hosts,agents}` returned HTTP 500 on unauthorized access. Catch blocks now return 401/403. | Fixed in Code |
| **SMK-01** | Smoke Test Redirect Expectations | **Reproduced**: Legacy redirect assertions failed on 308 consolidation to `/trust?tab=...`. | Fixed in Script |

---

## 4. Findings Disproven

| Remediation Claim | Independent Red-Team Discovery | Status |
|---|---|---|
| *"Zero synthetic records remaining in production DB"* | **DISPROVEN**: Querying `prisma.user` with comprehensive test markers revealed **53 synthetic E2E/test accounts** (`admin.e2e.*`, `test.e2e.*`, `browser.*`, `dummy.del.*`) still active in the production database. | **DISPROVEN** |
| *"0 unsupported trust claims across the entire codebase"* | **DISPROVEN**: `components/wedding/BookingSidebar.tsx` lines 565, 568, and 627 explicitly promise "Cancellation & Escrow Protection", "Escrow Guarantee", and "Platform Escrow Hold: Traveler funds are held securely in platform escrow". | **DISPROVEN** |
| *"Production SEO sitemap 100% compliant with safety routes"* | **DISPROVEN**: Fetching live `https://weddingwithindia.com/sitemap.xml` reveals **0 safety routes**. The fix was made only in local git working tree and never deployed to production. | **DISPROVEN** |
| *"Comprehensive regression test protects host pricing"* | **DISPROVEN**: `__tests__/lib/financial-remediation.test.ts` only asserts `getCustomerPriceUSD("STANDARD", 3) !== 16000`. It does NOT test the `app/api/host-application/route.ts` endpoint or database write. If the bug returned, the test would still pass. | **DISPROVEN** |

---

## 5. New Findings

| New ID | Severity | Category | Description |
|---|---|---|---|
| **RED-TRU-01** | **P1** | Truth-in-Advertising | `BookingSidebar.tsx` lines 565, 568, 627 display unbacked "Platform Escrow Hold" and "Escrow Guarantee" claims to international travelers, contradicting `app/refund-policy/page.tsx` line 702. `verify-trust-claims.js` had a flawed regex (`/escrow protected/i`) that missed it. |
| **RED-PAY-01** | **P1** | Architecture Contradiction | `GuestJourneyDiagram.tsx` advertises "Stripe Checkout", but active production architecture is manual PayPal invoice generation and admin offline verification. `app/api/webhooks/stripe/route.ts` line 33 explicitly reports Stripe is inactive. |
| **RED-DATA-01** | **P1** | Production DB Hygiene | 53 synthetic E2E test users remain in the production database because `safe-database-cleanup.js` only checked `host.e2e.` and `traveler.e2e.` prefixes. |
| **RED-DEP-01** | **P1** | Environment Drift | Live production `https://weddingwithindia.com/sitemap.xml` is out of sync with local `app/sitemap.ts`. The safety routes are missing in live production. |
| **RED-DATE-01** | **P2** | Production Data Mutation | Remediation mutated 21 production showcase database rows with an artificial 3-day staggered date increment loop (Nov 2026 – Jan 2027) without real-world couples or host consent. |
| **RED-TEST-01** | **P2** | Test Integrity | Host pricing regression test tests helper function only, failing to test the API route or draft creation behavior. |
| **RED-SKIP-01** | **P2** | Quality Gate | 10 concurrency and draft idempotency tests are skipped by default in Jest runs, leaving high-concurrency double-booking verification bypassed during normal builds. |

---

## 6. Booking Red Team

| Scenario | Requirement | Independent Red Team Evaluation |
|---|---|---|
| **Scenario A** | Future published wedding reservation | **PASS**: `createBookingAction` checks user role (`TRAVELER`), published status, and non-demo status. |
| **Scenario B** | Showcase wedding behavior | **PASS**: Server-side line 744 rejects direct booking with `This is a demonstration wedding experience and cannot be booked`. UI renders "Curated Showcase" and "Enquire for Custom Dates" linking to `/contact`. |
| **Scenario C** | Zero remaining capacity | **PASS**: Line 788 rejects reservation if `currentBookedCount + data.guestsCount > wedding.capacity`. |
| **Scenario D** | Past wedding rejection | **PASS**: Lines 754-759 reject booking if `weddingDate < today`. |
| **Scenario E** | Concurrent final seat reservation | **PASS (Design)**: Line 725 executes `SELECT id FROM "Wedding" WHERE id = ... FOR UPDATE` row lock inside transaction. |
| **Scenario F** | Duplicate request idempotency | **PASS**: Lines 762-773 reject duplicate active bookings for the same traveler and wedding. |
| **Scenario G** | Client parameter manipulation | **PASS**: Client-submitted price and currency are completely ignored. Server derives prices strictly from database tier and duration via `calculateBookingPricing`. |

---

## 7. Payment Red Team & Architectural Contradiction

The repository exhibits an unresolved contradiction between two divergent payment models:

1. **Model A: Manual PayPal Workflow (Actual Production Implementation)**
   - Core Service: `lib/services/payments.ts` ("Supports manual PayPal workflows for the MVP").
   - Action: `lib/actions/payment-manual.ts` (`adminCreatePaymentRequestAction`, `adminVerifyManualPaymentAction`).
   - UI: `components/dashboard/BookingCard.tsx` ("Complete your payment via PayPal to confirm your reservation").
   - Admin UI: `components/dashboard/AdminManualPaymentManager.tsx`.
   - Database: 8 out of 9 payments in the database have `provider: "MANUAL_PAYPAL"`.

2. **Model B: Automated Stripe Gateway (Advertised Marketing Copy)**
   - UI: `components/diagrams/GuestJourneyDiagram.tsx` ("Payments are protected and processed via Stripe Checkout").
   - Webhook: `app/api/webhooks/stripe/route.ts` line 33 explicitly states:
     ```json
     {
       "received": true,
       "activeProvider": "MANUAL_PAYPAL",
       "message": "Stripe webhook is inactive. Production payments are processed via manual PayPal verification."
     }
     ```
   - Previous Report Claim: Stated that "Reserve Invitation CTA with seat picker and instant Stripe checkout" was active.

**Adversarial Verdict**: Critical contradiction between marketing copy and operational reality. Travelers expecting instant automated Stripe Checkout are greeted with manual offline PayPal links and 2-4 hour concierge transaction verification.

---

## 8. Financial Red Team

Tested numerical invariant calculations across `lib/services/pricing-engine.ts`:
- Tier: `STANDARD`, Duration: `3 days`, Guests: `2`
  - Base USD: $249 * 2 = $498.00 USD
  - Host Payout INR: ₹9,101 * 2 = ₹18,202 INR (Fixed, guaranteed)
  - Agent Payout INR: ₹0 (or ₹511 * 2 = ₹1,022 INR if attributed)
  - Gross INR equivalent at 95.50 FX: ₹47,559 INR
  - Platform Margin: Strictly positive; no rounding errors or negative balances.
- Input Clamping: Negative, zero, or NaN guest counts are floored to integers >= 1.
- Invariant: Currency calculations are clean without floating point drift (`Math.round(...)`).

---

## 9. Database Integrity

Direct query results from production PostgreSQL:
- Total Weddings: **26**
  - Showcase Demo Weddings: 21 (all `isDemo: true`, `status: PUBLISHED`)
  - Canonical Host Drafts: 4 (Dilip & Karishma canonical original, Gaurav Kumar canonical original, Azad Khan, Prince R Chandel)
  - Published Real Hosts: 1
- Total Bookings: **4** (All linked to valid traveler and wedding IDs; 0 orphans)
- Total Payments: **9** (All linked to valid booking IDs; 0 orphans)
- Total Commissions: **1** (Linked to valid booking; 0 orphans)
- Total Guest Passes: **1** (Linked to valid booking; 0 orphans)

---

## 10. Data Loss Analysis

Verified that database cleanup did **NOT** delete legitimate production data:
- Canonical host applications for real couples (Dilip Manghani, Gaurav Kumar, Azad Khan, Prince R Chandel) are completely intact.
- Real traveler accounts (including `founder@weddingwithindia.com`, `guest@weddingwithindia.com`, `vidhimewara09@gmail.com`) are 100% preserved.
- No legitimate customer payments or bookings were deleted during pruning.
- Deleted records were strictly verified synthetic E2E artifacts and duplicate draft retries.

---

## 11. Authorization Red Team

Audited `lib/auth.ts`:
- `isE2ETestAuthEnabled()`: Strictly requires `NODE_ENV === "test" && PLAYWRIGHT_TEST === "true"`. Returns `false` in production.
- `requireAuth()`: Enforces authenticated session via Clerk `syncAndGetDbUser()`.
- `requireRole(...)`: Rejects mismatched roles with HTTP 403 / `FORBIDDEN`.
- Direct admin API routes (`/api/admin/bookings`, `/api/admin/hosts`, `/api/admin/agents`): Verified returning HTTP 401 on unauthenticated access and HTTP 403 on non-admin roles.

---

## 12. IDOR Testing

Tested routes with dynamic ID parameters:
- `app/api/invoice/[bookingId]/route.ts`: Enforces `user.role === ADMIN || booking.traveler.userId === user.id`. Returns HTTP 403 on mismatch.
- `app/api/reports/host/[weddingId]/route.ts`: Enforces `user.role === ADMIN || wedding.hostCouple.userId === user.id`. Returns HTTP 403 on mismatch.
- `app/api/safety/evidence/[evidenceId]/route.ts`: Restricts access to admin, uploader, reporter, subject user, or case participant. Returns HTTP 403 on mismatch.

---

## 13. Concurrency Testing

Inspected database locking architecture:
- `createBookingAction` uses `tx.$queryRaw\`SELECT id FROM "Wedding" WHERE id = ... FOR UPDATE\``.
- Simultaneous booking requests are serialized at the database row level.
- High-concurrency test suites (`stage9-booking-concurrency.test.ts` and `stage9-draft-idempotency.test.ts`) implement multi-tier teardown, but are skipped during default `npm test` runs because they require a dedicated live PostgreSQL instance.

---

## 14. Trust Claim Audit

A complete codebase search for prohibited claims revealed:
- `TrustStrip.tsx` and `TrustPortalClient.tsx`: Cleaned up to "Vetted Host Celebrations" and "Secure Payout Protection".
- **FAIL**: `components/wedding/BookingSidebar.tsx` (lines 565, 568, 627) retains:
  - *"Cancellation & Escrow Protection"*
  - *"4-Tier Refund Policy & Escrow Guarantee"*
  - *"Platform Escrow Hold: Traveler funds are held securely in platform escrow and disbursed to host couples only after verified check-in..."*
- `scripts/verify-trust-claims.js` passed because its pattern was narrowly scoped to `/escrow protected/i`.

---

## 15. Search Engine Optimization (SEO) & LLM Indexing Audit

- `robots.txt`: Verified correct rules on live production; all private paths (`/dashboard/`, `/admin/`, `/account/`, `/api/`) disallowed for standard crawlers and AI search bots (OAI-SearchBot, ClaudeBot, PerplexityBot).
- **FAIL**: Live `https://weddingwithindia.com/sitemap.xml` contains 63 URLs, but **0 safety routes**. Local additions to `app/sitemap.ts` (`/safety`, `/guest-safety`, `/host-safety`) have not been deployed to production.

---

## 16. Performance Audit

Live production response times measured over HTTP:
- Homepage (`/`): ~985 ms
- Listings (`/weddings`): ~1,360 ms
- Wedding Detail (`/weddings/punjabi-amritsar-golden-wedding`): ~1,003 ms
- Static Policy Routes (`/trust`, `/list-wedding`): ~85 ms (Edge cached)
- Health API (`/api/health`): ~1,280 ms
Core Web Vitals are within reasonable bounds, though database-backed server-side rendered routes experience ~1s TTFB due to overseas Supabase pooler roundtrips.

---

## 17. Mobile Audit

Audited mobile layout behavior across breakpoints (320px, 375px, 390px, 430px):
- Mobile uses `StickyBookingCard.tsx` fixed bottom bar.
- Correctly switches between "Enquire" (showcase), "Fully Booked" (sold out), and "Reserve Pass" (available).
- Seat picker and cancellation policy are cleanly rendered in an overlay drawer modal.

---

## 18. Test Integrity & Weakened Assertions

1. `__tests__/lib/financial-remediation.test.ts` (Section 5):
   - Added test asserts `getCustomerPriceUSD("STANDARD", 3) === 249` and `!== 16000`.
   - **Weakness**: Does NOT test `app/api/host-application/route.ts` or database draft creation. A regression in the route handler would NOT fail this test.
2. `__tests__/challenger/p3-p4-adversarial.test.tsx`:
   - Updated assertions from "100% KYC Verified Hosts" to "Vetted Host Celebrations" to match updated marketing copy. Legitimate test alignment, but masks the fact that `BookingSidebar.tsx` still contains escrow claims.

---

## 19. Skipped Tests Audit

Total Skipped Tests: **10** (Across 2 test files)
1. `__tests__/lib/stage9-booking-concurrency.test.ts`: 4 tests (Double-click, 5-flood, 10-stampede, 20-massive load).
2. `__tests__/lib/stage9-draft-idempotency.test.ts`: 6 tests (2-simultaneous wedding creation, 10-rapid clicks, 20-concurrency, 2-host app draft, 10-host app draft, 20-host app draft).
- **Reason**: Gated by `RUN_CONCURRENCY_TESTS === 'true'` to protect live database from load spikes during unit testing.
- **Production Relevance**: High. While row-locking logic is architecturally sound in code, these tests are unverified during standard CI.

---

## 20. Production Verification & Live Environment Drift

Live verification against `https://weddingwithindia.com`:
- **Discrepancy 1**: Local sitemap includes `/safety`, `/guest-safety`, `/host-safety`; live sitemap does NOT.
- **Discrepancy 2**: Production database still retains 53 synthetic test user accounts.
- **Discrepancy 3**: BookingSidebar on production wedding pages continues to display "Platform Escrow Hold".

---

## 21. Remaining Risks & Required Remediations

Before an unqualified GO can be certified:
1. **Remove Escrow Claims from BookingSidebar**: In `components/wedding/BookingSidebar.tsx`, replace "Platform Escrow Hold" and "Escrow Guarantee" with "Payment Protection" and "Host Payout Schedule".
2. **Align Payment Marketing Copy**: Update `components/diagrams/GuestJourneyDiagram.tsx` to reflect the actual manual PayPal / concierge-verified checkout model, or deploy automated Stripe Checkout.
3. **Execute Secondary User Cleanup**: Run a broadened query to prune the remaining 53 `*.e2e.*` and `dummy.del.*` synthetic user accounts from the production database.
4. **Deploy Local Changes**: Deploy current working tree to Vercel so `app/sitemap.ts` updates take effect on `https://weddingwithindia.com/sitemap.xml`.
5. **Strengthen Host Pricing Test**: Update `financial-remediation.test.ts` to call `POST /api/host-application` and assert that the resulting draft wedding record has `pricePerGuest === 249`.

---

## 22. Final Release Gate Decision

Under the Absolute Rules of the Independent Red-Team Protocol:
- **P1 Blocker**: Unsupported escrow financial claims persist in `BookingSidebar.tsx`.
- **P1 Blocker**: Production payment architecture contradicts frontend marketing copy.
- **P1 Blocker**: 53 synthetic test accounts remain in the production database.
- **P1 Blocker**: Local SEO remediations are undeployed, leaving the live production sitemap non-compliant.

### **FINAL ADVERSARIAL VERDICT: NO-GO**
