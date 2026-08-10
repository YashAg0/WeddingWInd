# Project: WeddingWithIndia Marketplace
# Scope: Full Production Completion, Security Hardening, UX Polish, Documentation & Release

## Architecture
- **Framework**: Next.js 16 App Router (`app/`), React 19, TypeScript, Tailwind CSS v4.
- **Authentication & Middleware**: Clerk authentication, edge proxy routing middleware (`proxy.ts`), database-backed RBAC (`lib/auth.ts`, `lib/rbac.ts`).
- **Data & Storage**: PostgreSQL via Prisma ORM (`prisma/schema.prisma`), UploadThing storage provider (`lib/storage/index.ts`).
- **Payments & Financials**: Stripe Checkout, Webhooks (`app/api/webhooks/stripe/route.ts`), cancellation policy engine (`lib/services/cancellation-policy.ts`), refund & payout service (`lib/services/refunds.ts`).
- **Safety & Moderation**: Contact moderation service (`lib/services/contact-moderation.ts`), safety case triage & evidence proxy (`app/api/safety/evidence/[evidenceId]/route.ts`).
- **Testing Infrastructure**: Jest unit/integration test suite (`__tests__/lib/`), Playwright E2E test suite (`e2e/`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Admin Bootstrap CLI | Elevate target email (`founder@weddingwithindia.com`) to `role: ADMIN` | M1 | `scripts/bootstrap-admin.js` |
| 2 | Server-Authoritative Admin RBAC | Enforce `requireRole([UserRole.ADMIN])` on all admin actions & APIs | M1 | `lib/auth.ts`, `lib/rbac.ts` |
| 3 | Middleware Proxy Security | Protect `/dashboard/admin/*` and `/api/admin/*` via edge Clerk middleware | M1 | `proxy.ts` |
| 4 | Self-Role Elevation Block | Block users from setting self role to `ADMIN` in onboarding/settings | M1 | `lib/actions/index.ts` |
| 5 | Admin Audit Logging | Server-logged audit entries for admin mutations | M1 | `lib/actions/admin.ts` |
| 6 | Admin Request Verification | Admin initiates verification request for targeted user | M2 | `lib/actions/admin.ts` |
| 7 | User Submit Verification | User uploads documents and submits KYC payload | M2 | `lib/actions/index.ts` |
| 8 | Admin Review Verification | Admin approves/rejects/requests changes on KYC submission | M2 | `lib/actions/admin.ts`, `lib/actions/index.ts` |
| 9 | UploadThing Storage Gate | Middleware checking DB verification status before presigned URL | M2 | `lib/storage/index.ts` |
| 10 | Private Document / Evidence Proxy | RBAC-gated evidence file retrieval route handler | M2 | `app/api/safety/evidence/[evidenceId]/route.ts` |
| 11 | Strict Role Onboarding Flow | Signup -> Role Selection -> Profile -> Active transition | M3 | `lib/actions/index.ts` |
| 12 | Host Listing KYC Gate | Force `PUBLISHED` attempt to `DRAFT` if host is unverified | M3 | `lib/actions/index.ts` |
| 13 | Agent Referral & Commission State | `SIGNED_UP` -> `ONBOARDED` -> `CONVERTED` referral & payout states | M3 | `lib/actions/referrals.ts` |
| 14 | Server-Authoritative Pricing | Calculate pricePerGuest * guestsCount on server; validate `guestsCount >= 1` | M4 | `lib/actions/index.ts` |
| 15 | Stripe Checkout & $0 Coupon Bypass | Server-computed total checkout & zero-amount handling | M4 | `lib/actions/stripe.ts` |
| 16 | Stripe Webhook Idempotency | Signature check & `StripeWebhookEvent` deduping | M4 | `app/api/webhooks/stripe/route.ts` |
| 17 | Cancellation Tier & Refund Engine | 4-tier refund policy using integer cents arithmetic | M4 | `lib/services/cancellation-policy.ts`, `lib/services/refunds.ts` |
| 18 | Cumulative Partial Refund Guard | Prevent cumulative partial refunds from exceeding payment total | M4 | `lib/actions/stripe.ts` |
| 19 | PII Data Minimization & DTOs | Exclude PAN/Aadhaar/Passport/Bank details from public endpoints | M5 | `prisma/schema.prisma`, `app/api/` |
| 20 | Text Normalizer (`normalizeForModeration`) | Strip zero-width chars, NFKD decompose, remove diacritics, collapse spaces | M5 | `lib/services/contact-moderation.ts` |
| 21 | Contact Info Moderation Engine | Multi-regex detection for email/phone/WhatsApp/social handles/spelled digits | M5 | `lib/services/contact-moderation.ts` |
| 22 | Messaging Contact Interceptor | Intercept `sendMessage` & `editMessage` to block contact leaks | M5 | `lib/actions/messages.ts` |
| 23 | Brand Design Tokens & Theme | Tailwind v4 inline luxury theme (Maroon `#6b1026`, Gold `#c9972a`, Ivory) | M6 | `app/globals.css` |
| 24 | Sub-Dashboard Loading States | Add dedicated `loading.tsx` for admin & user sub-dashboards | M6 | `app/dashboard/` |
| 25 | Responsive QA & Grid Alignment | Fix non-responsive 5-col grid in `AboutContent.tsx:148` & test 320px-1920px | M6 | `app/about/AboutContent.tsx` |
| 26 | Eliminate `as any` & Mock Hacks | Replace 45+ `as any` type assertions & purge mock stores/localhost hacks | M6 | Entire codebase |
| 27 | Route Map Documentation | Generate `FINAL_ROUTE_MAP.md` covering all 76+ routes | M7 | `FINAL_ROUTE_MAP.md` |
| 28 | Admin Operations Guide | Generate `ADMIN_OPERATIONS_GUIDE.md` detailing admin workflows & commands | M7 | `ADMIN_OPERATIONS_GUIDE.md` |
| 29 | User Flows Documentation | Generate `USER_FLOWS.md` mapping Traveler/Host/Agent journeys | M7 | `USER_FLOWS.md` |
| 30 | Production Audit Evidence | Update `FINAL_PRODUCTION_AUDIT.md` with truthful verification proof | M7 | `FINAL_PRODUCTION_AUDIT.md` |
| 31 | E2E Testing Suite (Tiers 1-4) | Opaque-box test suite for features, boundaries, pairwise, and real-world flows | E2E Track | `e2e/`, `TEST_READY.md` |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Admin Access & Control Center | R1: `founder@weddingwithindia.com` server auth, admin action/API guards, self-elevation block | None | DONE |
| M2 | Verification Lifecycle & Storage Security | R2: Admin-driven KYC flow, UploadThing middleware storage lock, private document access | M1 | DONE |
| M3 | User & Host Lifecycles | R3: Strict state transitions for Traveler/Host/Agent, server KYC publishing gate | M2 | DONE |
| M4 | Financial Integrity | R4: Authoritative price calc (`guestsCount >= 1`), Stripe checkout/webhooks, partial refund guard | M1 | DONE |
| M5 | Privacy & Contact Moderation | R5: RBAC PII minimization, Unicode contact normalizer, chat moderation interceptors | M1 | DONE |
| M6 | Visual/UX Quality & Responsive QA | R6: Grid responsiveness (320px-1920px), loading states, purge 45+ `as any` & mock hacks | M1-M5 | DONE |
| M7 | Documentation & Release Management | R7: Generate `FINAL_ROUTE_MAP.md`, `ADMIN_OPERATIONS_GUIDE.md`, `USER_FLOWS.md`, `FINAL_PRODUCTION_AUDIT.md` | M1-M6 | DONE |
| E2E | E2E Testing Track | Requirement-driven opaque-box test suite (Tiers 1-4) & publish `TEST_READY.md` | None (Parallel) | DONE |

## Interface Contracts

### Admin Authorization Contract (`lib/auth.ts` ↔ Server Actions / API Routes)
- Function: `requireRole(allowedRoles: UserRole[]): Promise<User>`
- Signature: Accepts array of allowed roles (e.g. `[UserRole.ADMIN]`). Fetches authenticated DB User via Clerk session.
- Errors: Throws `FORBIDDEN` if DB user role is not in `allowedRoles`. Throws `UNAUTHORIZED` if unauthenticated.

### Verification Upload Contract (`lib/storage/index.ts` ↔ UploadThing Client / DB)
- Function: `.middleware(async ({ req }) => ...)`
- Logic: Queries `prisma.verification.findUnique({ where: { userId } })`.
- Errors: Throws `UNAUTHORIZED_NO_VERIFICATION_REQUEST` if no pre-existing verification record exists or status is `NOT_SUBMITTED`. Throws `UNAUTHORIZED_VERIFICATION_LOCKED` if status is `APPROVED` or `UNDER_REVIEW`.

### Financial Calculation & Refund Contract (`lib/actions/index.ts`, `lib/actions/stripe.ts`)
- `createBookingAction(data)`: Validates `data.guestsCount >= 1` and integer before server multiplication `serverPricePerGuest * data.guestsCount`.
- `processPartialRefundAction({ paymentId, partialAmount })`: Queries existing `Refund` records for `paymentId`. Validates `(sum(previousPartialRefunds) + partialAmount) <= payment.amount`.

### Contact Moderation Contract (`lib/services/contact-moderation.ts` ↔ `lib/actions/messages.ts`)
- Function: `detectProhibitedContactInfo(text: string): ContactDetectionResult`
- Logic: Runs `normalizeForModeration(text)` (stripping `\u200B-\u200D\uFEFF`, applying `NFKD`, removing diacritics, collapsing whitespace) then matches regex patterns.
- Output: `{ hasProhibitedContact: boolean, detectedTypes: string[], reason?: string }`.
